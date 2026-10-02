(() => {
  function render(data) {
    const news = (data.news || []).slice().sort((a, b) => {
      const order = Number(a.sort_order || 999) - Number(b.sort_order || 999);
      if (order) return order;
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
    const fab = document.getElementById("newsFab");
    const count = document.getElementById("newsCount");
    const drawer = document.getElementById("newsDrawer");
    const shade = document.getElementById("newsShade");
    const close = document.getElementById("newsClose");
    const stream = document.getElementById("newsStream");

    count.textContent = String(news.length).padStart(2, "0");
    stream.innerHTML = "";

    if (!news.length) {
      const empty = document.createElement("div");
      empty.className = "news-empty";
      empty.textContent = data.settings?.news_empty_message || "Nothing for now. Stay tuned.";
      stream.appendChild(empty);
    } else {
      news.forEach(item => {
        const article = document.createElement("article");
        article.className = "news-item";
        article.innerHTML = `
          <time>${item.date || "DATE // PENDING"}</time>
          <h3>${item.title || "UNTITLED"}</h3>
          <p>${item.body || ""}</p>`;
        if (item.link_url) {
          const link = document.createElement("a");
          link.href = item.link_url;
          link.target = "_blank";
          link.rel = "noreferrer";
          link.textContent = item.link_text || "OPEN SOURCE ↗";
          article.appendChild(link);
        }
        stream.appendChild(article);
      });
    }

    const setOpen = open => {
      drawer.classList.toggle("open", open);
      shade.classList.toggle("open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      fab.setAttribute("aria-expanded", String(open));
    };
    fab.addEventListener("click", () => setOpen(true));
    close.addEventListener("click", () => setOpen(false));
    shade.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  window.The2iONews = { render };
})();
