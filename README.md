# The2iO

Official artist website for **The2iO / Ilya Ochnev**.

The site is a static GitHub Pages frontend with a lightweight CMS/backend built with **Google Sheets + Google Apps Script**. The repository can be exported or forked without a build system, package manager, database server, or paid hosting.

> Important branding rule: the artist name is **The2iO**. Preserve this exact capitalisation.

## Current architecture

```text
Visitor browser
   |
   |-- index.html + css/* + js/*
   |
   |-- GET site data (JSONP)
   v
Google Apps Script Web App
   |
   v
Google Sheet: "The2iO CMS Data"

Contact form
   |
   |-- POST to Apps Script
   |-- saves to "Contact Messages"
   |-- sends email with MailApp
   |
   '-- falls back to FormSubmit if the Apps Script URL is removed
```

The frontend is intentionally framework-free. Everything runs in plain HTML, CSS and JavaScript.

## Repository structure

```text
/
├── .nojekyll
├── README.md
├── index.html
├── assets/
│   ├── README.md
│   └── ilya-about.png
├── backend/
│   └── Code.gs
├── css/
│   ├── base.css
│   ├── brand.css
│   ├── effects.css
│   └── sections.css
└── js/
    ├── api.js
    ├── archive.js
    ├── config.js
    ├── contact.js
    ├── fallback-data.js
    ├── main.js
    ├── music.js
    ├── news.js
    ├── translations.js
    └── unreleased.js
```

### What each file does

| File | Purpose |
| --- | --- |
| `index.html` | Main page structure and all section markup. |
| `css/base.css` | Global layout, hero, navigation, Released module and responsive breakpoints. |
| `css/sections.css` | Archive, The Vault / Unreleased Audio, About, Contact and News layouts. |
| `css/effects.css` | Grain, scanlines, photocopy/glitch effects and the aggressive Unreleased data-mosh treatment. |
| `css/brand.css` | Small branding overrides plus the dark reload/loading screen. |
| `js/config.js` | Apps Script endpoint, FormSubmit fallback, timeout and reload screen logic. |
| `js/api.js` | Loads the CMS payload from Apps Script using JSONP and falls back to local data if the backend fails. |
| `js/music.js` | Released tracks, Spotify embeds, waveform animation and 2-second signal/text cycle. |
| `js/archive.js` | Gallery/contact-sheet rendering, hero image selection and About portrait loading. |
| `js/unreleased.js` | Public unreleased audio queue/player. |
| `js/translations.js` | About text language switching. |
| `js/news.js` | News drawer and CMS-driven news links. |
| `js/contact.js` | Contact form and public social links. |
| `js/main.js` | Main application start-up, clocks, Subject File social icons and backend-driven hero subtitle. |
| `js/fallback-data.js` | Local backup content used if Apps Script is unavailable. |
| `assets/ilya-about.png` | About portrait. |
| `backend/Code.gs` | Last working Apps Script backend source used for this project. |

## Current deployment values

These values belong to the current The2iO project. A fork/export can keep them only if it is meant to continue using the same backend.

| Item | Current value |
| --- | --- |
| Repository | `goreadyconsulting/The2io` |
| Google Sheet | `The2iO CMS Data` |
| Spreadsheet ID | `1IGfjS90RdpkbR-8gngbfPMXmtxQqlh7KxFB1labBD5U` |
| Apps Script endpoint | `https://script.google.com/macros/s/AKfycbwysCJk_b7Yj88MooUKso5CRdxUnDhqjRdI1riga6sRMpm3TJSANQAf5NP2_NqQbwzaAQ/exec` |
| Fallback contact endpoint | `https://formsubmit.co/the2ioprod@gmail.com` |
| Standard GitHub Pages URL after enabling Pages | `https://goreadyconsulting.github.io/The2io/` |

The Apps Script source stored in `backend/Code.gs` is a **source snapshot**. Editing that file on GitHub does not automatically redeploy Google Apps Script.

## Quick start: use the existing project

For ordinary content updates, you normally do **not** need to edit code.

1. Update the relevant tab in the Google Sheet.
2. Make sure the row is published/enabled where required.
3. Wait up to about 60 seconds for the Apps Script cache to expire.
4. Refresh the website.
5. If you need an immediate refresh and have access to the Apps Script editor, manually run `clearSiteCache()`.

The current backend caches the public CMS payload for **60 seconds**.

## Quick start: export or clone the whole project

### 1. Copy the repository

Clone, fork or export the repository.

```bash
git clone https://github.com/goreadyconsulting/The2io.git
cd The2io
```

There is no `npm install` and no build step.

### 2. Create a Google Sheet

Create a Google Sheet and add the exact tabs and headers documented in the **CMS sheet schema** section below.

The tab names are case-sensitive because `backend/Code.gs` opens them by exact name.

### 3. Configure the Apps Script backend

1. Create a standalone Google Apps Script project.
2. Copy the complete contents of `backend/Code.gs` into the Apps Script project's `Code.gs`.
3. Change this line near the top:

```js
SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID'
```

4. Save the script.
5. Deploy it as a **Web app**.
6. Set it to execute as the script owner.
7. For a public website, the deployment must allow public visitors to reach the web app. The exact Google Workspace wording can vary by account, but anonymous/public access must be available for the public site to read CMS data.
8. Authorise Spreadsheet and Mail permissions when Google requests them.
9. Copy the deployed URL ending in `/exec`.

### 4. Point the frontend to the new backend

Edit `js/config.js`:

```js
window.The2iO_CONFIG = Object.freeze({
  API_URL: "YOUR_APPS_SCRIPT_EXEC_URL",
  FALLBACK_CONTACT_URL: "YOUR_OPTIONAL_FORMSUBMIT_URL",
  JSONP_TIMEOUT_MS: 8000
});
```

If `API_URL` is blank, the site will use `js/fallback-data.js` for site content and the contact form can use `FALLBACK_CONTACT_URL`.

### 5. Test the backend

Open:

```text
YOUR_EXEC_URL?action=health
```

A working backend returns a small JSON response with `ok: true`.

Then test:

```text
YOUR_EXEC_URL?action=siteData
```

That should return the public CMS payload.

### 6. Enable GitHub Pages

In GitHub:

```text
Settings
→ Pages
→ Build and deployment
→ Deploy from a branch
→ main
→ / (root)
```

The repository contains `.nojekyll`, so GitHub Pages serves the static files directly.

For a normal user/org Pages project, the URL format is:

```text
https://USERNAME.github.io/REPOSITORY/
```

## Running locally

Use a small local web server instead of opening `index.html` directly from `file://`.

Python example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## CMS sheet schema

The backend reads the first row of each tab as field names. Do not casually rename headers because the frontend expects these keys.

The backend's `publicRows_()` helper treats the following values as true:

```text
TRUE
true
1
yes
y
published
active
```

Google Sheets checkboxes are recommended for `published` and `enabled`.

### 1. Site Settings

Tab name:

```text
Site Settings
```

Headers:

```text
key | value | type | notes
```

Current supported/currently used keys:

| key | Purpose |
| --- | --- |
| `artist_name` | Public artist name. |
| `artist_display` | Primary display wordmark. The current frontend still contains some hardcoded The2iO branding, so a complete rebrand requires frontend edits too. |
| `artist_subtitle` | Text shown below the large hero wordmark. Blank means no subtitle. |
| `contact_email` | Destination for contact-form emails sent by Apps Script. |
| `instagram_url` | Instagram profile. |
| `tiktok_url` | TikTok profile. Can be blank. |
| `spotify_artist_url` | Spotify artist profile. |
| `soundcloud_url` | SoundCloud profile. |
| `default_language` | Default About language, currently `en`. |
| `news_empty_message` | Message shown when there are no published news items. |
| `api_version` | Frontend/backend data contract marker. Currently `1`. |

Current project values include:

```text
artist_name        The2iO
artist_display     The2iO
artist_subtitle    [blank]
contact_email      the2ioprod@gmail.com
instagram_url      https://www.instagram.com/the2io/
spotify_artist_url https://open.spotify.com/artist/3tImcBvyvtx11LEkH8CDke
soundcloud_url     https://soundcloud.com/the2iorebeat
default_language   en
api_version        1
```

### 2. Releases

Tab name:

```text
Releases
```

Headers:

```text
id | title | release_type | spotify_album_uri | spotify_url | artwork_url | status | sort_order | published
```

Notes:

- `id` must be unique.
- Tracks connect to a release through `release_id`.
- Lower `sort_order` values appear first.
- `published` must be true for the release to be returned publicly.
- The current Released module uses the first published release.

### 3. Tracks

Tab name:

```text
Tracks
```

Headers:

```text
id | release_id | title | spotify_track_uri | spotify_url | sort_order | published
```

Example Spotify URI:

```text
spotify:track:42XyubrIZsGS28JGkIZrib
```

The frontend accepts either a Spotify track URI or the standard Spotify track URL.

The current project tracks are Goosebumps, Too Far and I miss U under the Faded Horizons release.

### 4. Unreleased

Tab name:

```text
Unreleased
```

Headers:

```text
id | title | version | audio_url | artwork_url | public_note | status | sort_order | published
```

A track is exposed by the backend only when:

```text
published = TRUE
status = PUBLIC
```

and the frontend only places it in the player when `audio_url` is present.

Field behaviour:

| Field | Purpose |
| --- | --- |
| `id` | Unique track ID. |
| `title` | Public track title. |
| `version` | Version/mix label shown in the player. |
| `audio_url` | Audio file URL. Google Drive file links are converted to a direct-download form by the frontend. |
| `artwork_url` | Optional per-track image. |
| `public_note` | Public status/note shown with the track. |
| `status` | Must be exactly `PUBLIC` to pass the backend filter. |
| `sort_order` | Lower values first. |
| `published` | Must be true. |

**Do not put private demos in this table unless you are comfortable making them publicly retrievable.** A browser audio player cannot protect the underlying public media URL.

### 5. Gallery

Tab name:

```text
Gallery
```

Headers:

```text
id | title | image_url | source_url | alt_text | published | sort_order
```

Behaviour:

- Up to the first eight published items are rendered in the Archive contact sheet.
- `source_url` makes an Archive card clickable.
- The current hero uses Gallery item 6 when available, otherwise item 1.
- The Vault/Unreleased fallback artwork uses Gallery item 2 when available, otherwise item 1.
- The About portrait does **not** come from this tab.

### 6. News

Tab name:

```text
News
```

Headers:

```text
id | date | title | body | link_url | image_url | published | sort_order | link_text
```

Behaviour:

- `published` must be true.
- Lower `sort_order` values appear first. Date is used as a secondary sort.
- `link_url` adds an external link.
- `link_text` controls the public link label. If blank, the frontend falls back to `OPEN SOURCE ↗`.
- `image_url` is reserved in the CMS but is not currently rendered by the News drawer.

Example:

```text
id:         orbiiit-vote-2026
title:      VOTE FOR THE2IO
link_text:  VOTE HERE ↗
published:  TRUE
sort_order: 1
```

### 7. Translations

Tab name:

```text
Translations
```

Headers:

```text
language_code | language_name | about_text | enabled | sort_order
```

Current languages are English (`en`), Russian (`ru`) and Lithuanian (`lt`).

The About renderer turns the literal phrase `contact (unknown)` into an internal link to the Contact section, so keep that exact phrase in any translation where that behaviour is required.

### 8. Contact Messages

Tab name:

```text
Contact Messages
```

Headers:

```text
timestamp | message_id | name | email | message | status | source
```

Do not manually use this as a public content table. The backend appends a row whenever the website contact form is submitted.

A new message is stored with:

```text
status = NEW
source = Website
```

The backend also emails the message to `contact_email` from Site Settings.

## Updating common site content

### Change the hero subtitle

Edit:

```text
Site Settings → artist_subtitle
```

The old hardcoded "Music by Ilya." caption was removed. The backend value is now the only hero subtitle.

### Change the Subject File social icons

The Subject File keeps its header but uses only Instagram, Spotify and SoundCloud icons. Their destinations come from:

```text
instagram_url
spotify_artist_url
soundcloud_url
```

in Site Settings.

### Add or change released music

1. Add/update a row in `Releases`.
2. Add tracks in `Tracks`.
3. Make sure each track's `release_id` matches the release `id`.
4. Set `published` to true.
5. Use valid Spotify track URIs/URLs.

The Spotify player is an iframe. The neon waveform above it is a designed/simulated visual and is **not** reading Spotify audio data.

### Change the About portrait

Replace:

```text
assets/ilya-about.png
```

Keep the same path and filename and no code change is required.

The current About card displays the larger portrait with the name:

```text
Ilya Ochnev
```

underneath it.

### Add Archive images

Add rows to `Gallery` and publish them. `sort_order` controls the order.

### Publish an unreleased track

Add a row to `Unreleased` and set:

```text
status    PUBLIC
published TRUE
```

Provide `audio_url`. Add `artwork_url` if the track should override the default Vault artwork.

The public section is labelled **THE VAULT** with **UNRELEASED AUDIO** inside the glitch panel.

### Add a news item

Create a News row with a unique `id`, date, title and body.

If it needs a button/link, set both:

```text
link_url
link_text
```

Set `published` to true.

### Update About languages

Edit the `Translations` tab. Set `enabled` to true for any language that should appear in the language switcher.

### Read contact submissions

Open the `Contact Messages` tab. It is the message log written by Apps Script.

## Frontend behaviour worth preserving

The current design direction is intentionally specific:

- Code brutalism + surveillance/CCTV interface.
- Photocopied/low-ink archive treatment.
- Heavy analog grain and scanline texture.
- Mostly black, dirty white and grey with a single acid-lime accent.
- Cyan/magenta severe data-mosh is intentionally isolated to The Vault/Unreleased section.
- The reload screen remains dark and shows only **The2iO**, with the **2** in acid green, until the site has finished rendering.
- The site has responsive layouts for desktop, tablet and mobile.
- Current main breakpoints are approximately:
  - desktop: 1280px and above
  - tablet/smaller laptop: 700px to 1279px
  - mobile: below 700px

## Backend API contract

### Health check

```text
GET ?action=health
```

### Public site data

```text
GET ?action=siteData
```

The frontend normally calls this through JSONP:

```text
?action=siteData&callback=...
```

### Contact form

```text
POST
action=contact
name=...
email=...
message=...
```

The Apps Script backend validates the three required fields, writes the submission to the sheet and emails it to the configured contact address.

## Fallback behaviour

If the Apps Script request fails or times out:

1. `js/api.js` switches to `js/fallback-data.js`.
2. The page still renders.
3. The browser sets `data-source="fallback"` on the document element.

This is useful for resilience, but remember that fallback content can become stale. If major CMS content changes, update `js/fallback-data.js` as well if you want the offline/failure state to mirror the current site.

## Cache behaviour

`backend/Code.gs` uses:

```js
CACHE_SECONDS: 60
```

and stores the CMS payload under:

```text
siteData:v1
```

After a Sheet edit, either wait for the cache to expire or run:

```js
clearSiteCache()
```

from the Apps Script editor.

## Important deployment/security notes

- The Google Sheet itself does **not** need to be publicly editable. Apps Script reads it as the script owner.
- The Apps Script web app does need to be reachable by public site visitors if it is being used as the live public CMS endpoint.
- Do not store passwords, API secrets or private tokens in this repository.
- Only publish media URLs that are safe for public visitors to access.
- An unpublished Sheet row is a publishing control, not DRM.
- Contact submissions contain personal data. Keep the Sheet and Google account permissions appropriately restricted.
- If you change `backend/Code.gs` in GitHub, you must manually copy/deploy the change in Apps Script unless you introduce a separate deployment workflow.

## Rebranding this export for another artist

This repository is artist-specific rather than a generic template. The backend settings control some content, but **The2iO** and **Ilya Ochnev** are also intentionally hardcoded in several frontend locations.

For a full rebrand:

1. Search the repository for `The2iO`.
2. Search for `Ilya Ochnev`.
3. Replace the About portrait.
4. Replace social/Spotify URLs.
5. Update `fallback-data.js`.
6. Update the Sheet settings/content.
7. Change the Apps Script spreadsheet ID and redeploy.
8. Replace the contact fallback URL.
9. Review `index.html` metadata/title.
10. Recheck all mobile/desktop layouts after changing name lengths.

## Export checklist

Before handing this project to somebody else or moving it to another GitHub account, verify:

- [ ] `README.md` is included.
- [ ] `backend/Code.gs` is included.
- [ ] All eight Sheet tabs exist with the exact headers above.
- [ ] The Apps Script `SPREADSHEET_ID` points to the correct Sheet.
- [ ] Apps Script is deployed as a Web app.
- [ ] `js/config.js → API_URL` points to the correct `/exec` deployment.
- [ ] `FALLBACK_CONTACT_URL` is correct or intentionally blank.
- [ ] Site Settings contain the correct social URLs and contact email.
- [ ] `assets/ilya-about.png` exists.
- [ ] All published media URLs are intentionally public.
- [ ] GitHub Pages is enabled from `main` / root.
- [ ] The site has been checked at desktop, tablet and mobile widths.
- [ ] Contact form has been test-submitted once.
- [ ] News links have been tested.
- [ ] Released Spotify embeds have been tested.
- [ ] Any public Unreleased/Vault audio has been tested in an incognito browser.

## Current backend source

The exact Apps Script source snapshot used as the basis for the current backend is committed at:

```text
backend/Code.gs
```

That file is the handover copy to use when recreating the backend in a new Google Apps Script project.

---

The goal of this repository is that a future handover should require only three things: **the GitHub repository, a correctly structured Google Sheet, and one deployed Apps Script web app**.
