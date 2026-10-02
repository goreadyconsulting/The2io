/**
 * The2iO website backend
 * Spreadsheet source: The2iO CMS Data
 *
 * Deployment:
 *   1. Create a standalone Apps Script project.
 *   2. Paste this file into Code.gs.
 *   3. Deploy as Web app, execute as the owner, allow access as required.
 *   4. Paste the /exec URL into js/config.js in the GitHub repository.
 */
const The2iO = Object.freeze({
  SPREADSHEET_ID: '1IGfjS90RdpkbR-8gngbfPMXmtxQqlh7KxFB1labBD5U',
  CACHE_SECONDS: 60,
  SHEETS: Object.freeze({
    SETTINGS: 'Site Settings',
    RELEASES: 'Releases',
    TRACKS: 'Tracks',
    UNRELEASED: 'Unreleased',
    GALLERY: 'Gallery',
    NEWS: 'News',
    TRANSLATIONS: 'Translations',
    CONTACTS: 'Contact Messages'
  })
});

function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = String(params.action || 'siteData');

  if (action === 'health') {
    return respond_({ ok: true, service: 'The2iO', version: 1 }, params.callback);
  }

  if (action !== 'siteData') {
    return respond_({ ok: false, error: 'unsupported_action' }, params.callback);
  }

  try {
    return respond_({
      ok: true,
      data: getPublicSiteData_(),
      generatedAt: new Date().toISOString()
    }, params.callback);
  } catch (error) {
    return respond_({
      ok: false,
      error: 'site_data_failed',
      message: safeMessage_(error)
    }, params.callback);
  }
}

function doPost(e) {
  try {
    const payload = parsePost_(e);
    const action = String(payload.action || '');

    if (action !== 'contact') {
      return respond_({ ok: false, error: 'unsupported_action' });
    }

    const result = saveContact_(payload);
    return respond_({ ok: true, messageId: result.messageId });
  } catch (error) {
    return respond_({
      ok: false,
      error: 'request_failed',
      message: safeMessage_(error)
    });
  }
}

function getPublicSiteData_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('siteData:v1');
  if (cached) return JSON.parse(cached);

  const settings = settingsObject_(readTable_(The2iO.SHEETS.SETTINGS));
  const releases = publicRows_(readTable_(The2iO.SHEETS.RELEASES));
  const tracks = publicRows_(readTable_(The2iO.SHEETS.TRACKS));
  const unreleased = publicRows_(readTable_(The2iO.SHEETS.UNRELEASED))
    .filter(row => String(row.status || '').toUpperCase() === 'PUBLIC');
  const gallery = publicRows_(readTable_(The2iO.SHEETS.GALLERY));
  const news = publicRows_(readTable_(The2iO.SHEETS.NEWS));
  const translations = readTable_(The2iO.SHEETS.TRANSLATIONS)
    .filter(row => truthy_(row.enabled))
    .sort(sortRows_);

  const data = {
    settings: settings,
    releases: releases.sort(sortRows_),
    tracks: tracks.sort(sortRows_),
    unreleased: unreleased.sort(sortRows_),
    gallery: gallery.sort(sortRows_),
    news: news.sort(sortRows_),
    translations: translations
  };

  cache.put('siteData:v1', JSON.stringify(data), The2iO.CACHE_SECONDS);
  return data;
}

function saveContact_(payload) {
  const name = clean_(payload.name, 120);
  const email = clean_(payload.email, 240);
  const message = clean_(payload.message, 5000);

  if (!name || !email || !message) {
    throw new Error('name_email_message_required');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('invalid_email');
  }

  const sheet = spreadsheet_().getSheetByName(The2iO.SHEETS.CONTACTS);
  if (!sheet) throw new Error('contact_sheet_missing');

  const messageId = Utilities.getUuid();
  const now = new Date();

  sheet.appendRow([
    now,
    messageId,
    name,
    email,
    message,
    'NEW',
    'Website'
  ]);

  const settings = settingsObject_(readTable_(The2iO.SHEETS.SETTINGS));
  const destination = String(settings.contact_email || '').trim();

  if (destination) {
    MailApp.sendEmail({
      to: destination,
      replyTo: email,
      subject: 'The2iO website contact: ' + name,
      body:
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n\n' +
        message + '\n\n' +
        'Message ID: ' + messageId
    });
  }

  return { messageId: messageId };
}

function readTable_(sheetName) {
  const sheet = spreadsheet_().getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(value => String(value).trim());

  return values.slice(1)
    .filter(row => row.some(value => value !== '' && value !== null))
    .map(row => {
      const object = {};
      headers.forEach((header, index) => {
        if (header) object[header] = normalizeValue_(row[index]);
      });
      return object;
    });
}

function settingsObject_(rows) {
  return rows.reduce((result, row) => {
    const key = String(row.key || '').trim();
    if (key) result[key] = row.value;
    return result;
  }, {});
}

function publicRows_(rows) {
  return rows.filter(row => {
    if (!Object.prototype.hasOwnProperty.call(row, 'published')) return true;
    return truthy_(row.published);
  });
}

function sortRows_(a, b) {
  const aOrder = Number(a.sort_order || 999999);
  const bOrder = Number(b.sort_order || 999999);
  if (aOrder !== bOrder) return aOrder - bOrder;

  const aDate = new Date(a.date || 0).getTime() || 0;
  const bDate = new Date(b.date || 0).getTime() || 0;
  return bDate - aDate;
}

function parsePost_(e) {
  if (!e) return {};
  const params = e.parameter || {};
  const body = e.postData && e.postData.contents ? e.postData.contents : '';

  if (body) {
    const type = String((e.postData && e.postData.type) || '').toLowerCase();
    if (type.indexOf('application/json') !== -1 || body.trim().charAt(0) === '{') {
      try {
        return Object.assign({}, params, JSON.parse(body));
      } catch (ignore) {}
    }
  }

  return params;
}

function normalizeValue_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return value;
}

function truthy_(value) {
  if (value === true) return true;
  const normalized = String(value || '').trim().toLowerCase();
  return ['true', '1', 'yes', 'y', 'published', 'active'].indexOf(normalized) !== -1;
}

function clean_(value, maxLength) {
  return String(value || '')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, maxLength);
}

function spreadsheet_() {
  return SpreadsheetApp.openById(The2iO.SPREADSHEET_ID);
}

function respond_(payload, callback) {
  const json = JSON.stringify(payload);
  const cb = String(callback || '').trim();

  if (cb && /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(cb)) {
    return ContentService
      .createTextOutput(cb + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function safeMessage_(error) {
  return String(error && error.message ? error.message : error).slice(0, 300);
}

/**
 * Run manually after editing the spreadsheet if you want changes to appear
 * immediately instead of waiting for the short cache to expire.
 */
function clearSiteCache() {
  CacheService.getScriptCache().remove('siteData:v1');
}
