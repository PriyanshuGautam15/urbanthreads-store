/**
 * Urban Threads — Storefront Header
 * Renders into <div id="ut-header"></div>. Owns: nav, mega menu, mobile
 * drawer, cart drawer, wishlist/cart badges. Call UT_Header.init(activePage).
 */
(function (global) {
  "use strict";

  const ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>',
    cmdk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 8l-2 2 2 2M15 8l2 2-2 2"/></svg>',
  };

  function root(path) { return path || ""; }

  function navLinks(base, active) {
    const items = [
      { href: base + "index.html", label: "Home", key: "home" },
      { href: base + "products.html", label: "Shop", key: "products", mega: true },
      { href: base + "about.html", label: "About", key: "about" },
      { href: base + "contact.html", label: "Contact", key: "contact" },
    ];
    return items.map((it) => `
      <div class="nav-item ${it.mega ? "has-mega" : ""}">
        <a href="${it.href}" class="nav-link ${active === it.key ? "active" : ""}">${it.label}${it.mega ? ICONS.chevron : ""}</a>
        ${it.mega ? megaMenuHtml(base) : ""}
      </div>`).join("");
  }

  function megaMenuHtml(base) {
    const cats = (global.UT_DB.getCategories() || []).slice().sort((a, b) => a.order - b.order);
    return `
      <div class="mega-menu">
        <div class="mega-menu-inner">
          <div class="mega-menu-grid">
            ${cats.map((c) => `
              <a href="${base}products.html?category=${c.slug}" class="mega-cat">
                <span class="mega-cat-img" style="background-image:url('${c.image}')"></span>
                <span class="mega-cat-name">${c.name}</span>
              </a>`).join("")}
          </div>
          <div class="mega-menu-promo">
            <p class="eyebrow">New season</p>
            <h4>Layer up for less.</h4>
            <p class="text-secondary" style="margin:.5rem 0 1rem">Up to 30% off outerwear this week only.</p>
            <a href="${base}products.html" class="btn btn-primary btn-sm">Shop the edit</a>
          </div>
        </div>
      </div>`;
  }

  function render(activePage, basePath) {
    const base = root(basePath);
    const container = document.getElementById("ut-header");
    if (!container) return;

    container.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to content</a>
      <header class="site-header glass" id="site-header">
        <div class="container header-inner">
          <button class="hamburger" id="mobile-menu-btn" aria-label="Open menu" aria-expanded="false">${ICONS.menu}</button>
          <a href="${base}index.html" class="brand-logo">URBAN<span>THREADS</span></a>
          <nav class="main-nav" aria-label="Primary">${navLinks(base, activePage)}</nav>
          <div class="header-actions">
            <button class="icon-btn" id="search-open-btn" aria-label="Search products" data-tooltip="Search (Ctrl K)">${ICONS.search}</button>
            <button class="icon-btn" data-theme-toggle aria-label="Toggle dark mode" data-tooltip="Toggle theme">
              <span class="theme-icon-sun">${ICONS.sun}</span><span class="theme-icon-moon">${ICONS.moon}</span>
            </button>
            <a href="${base}products.html?view=wishlist" class="icon-btn" id="wishlist-btn" aria-label="Wishlist" data-tooltip="Wishlist">
              ${ICONS.heart}<span class="badge-count" id="wishlist-count" hidden>0</span>
            </a>
            <button class="icon-btn" id="cart-open-btn" aria-label="Open cart" data-tooltip="Cart">
              ${ICONS.bag}<span class="badge-count" id="cart-count" hidden>0</span>
            </button>
          </div>
        </div>
      </header>

      <div class="mobile-nav-overlay" id="mobile-nav-overlay">
        <div class="mobile-nav">
          <div class="flex-between" style="margin-bottom:var(--space-8)">
            <span class="brand-logo">URBAN<span>THREADS</span></span>
            <button class="icon-btn" id="mobile-menu-close" aria-label="Close menu">${ICONS.close}</button>
          </div>
          <nav class="mobile-nav-links">
            <a href="${base}index.html">Home</a>
            <a href="${base}products.html">Shop All</a>
            <a href="${base}about.html">About</a>
            <a href="${base}contact.html">Contact</a>
          </nav>
          <div class="mobile-nav-cats">
            <p class="eyebrow" style="margin-bottom:var(--space-3)">Categories</p>
            ${(global.UT_DB.getCategories() || []).map((c) => `<a href="${base}products.html?category=${c.slug}">${c.name}</a>`).join("")}
          </div>
        </div>
      </div>

      <div class="drawer-overlay" id="cart-drawer-overlay">
        <div class="drawer" role="dialog" aria-label="Shopping cart" aria-modal="true">
          <div class="drawer-header">
            <h3>Your Bag <span id="cart-drawer-count" class="text-secondary" style="font-weight:400"></span></h3>
            <button class="icon-btn" id="cart-drawer-close" aria-label="Close cart">${ICONS.close}</button>
          </div>
          <div class="drawer-body" id="cart-drawer-body"></div>
          <div class="drawer-footer" id="cart-drawer-footer"></div>
        </div>
      </div>

      <div class="search-overlay" id="search-overlay">
        <div class="search-panel">
          <div class="search-input-row">
            ${ICONS.search}
            <input type="text" id="search-input" placeholder="Search products, categories..." autocomplete="off" aria-label="Search">
            <kbd>ESC</kbd>
          </div>
          <div class="search-results" id="search-results"></div>
        </div>
      </div>
    `;

    wireInteractions(base);
    refreshBadges();
    UT_Theme.init();
    window.addEventListener("ut:cart-change", refreshBadges);
    window.addEventListener("ut:wishlist-change", refreshBadges);
  }

  function refreshBadges() {
    const cartCount = global.UT_Cart.count();
    const wishCount = global.UT_Wishlist.getIds().length;
    const cEl = document.getElementById("cart-count");
    const wEl = document.getElementById("wishlist-count");
    if (cEl) { cEl.textContent = cartCount; cEl.hidden = cartCount === 0; }
    if (wEl) { wEl.textContent = wishCount; wEl.hidden = wishCount === 0; }
    renderCartDrawer();
  }

  function renderCartDrawer() {
    const body = document.getElementById("cart-drawer-body");
    const footer = document.getElementById("cart-drawer-footer");
    const countLabel = document.getElementById("cart-drawer-count");
    if (!body) return;
    const items = global.UT_Cart.detailedItems();
    countLabel.textContent = items.length ? `(${global.UT_Cart.count()})` : "";

    if (!items.length) {
      body.innerHTML = `
        <div class="empty-state">
          ${ICONS.bag}
          <h3>Your bag is empty</h3>
          <p>Explore the collection and add pieces you love.</p>
        </div>`;
      footer.innerHTML = `<a href="products.html" class="btn btn-primary btn-block">Continue Shopping</a>`;
      return;
    }

    body.innerHTML = items.map((i) => `
      <div class="cart-line" data-key="${i.productId}::${i.size}::${i.color}">
        <img src="${i.product.images[0]}" alt="${i.product.name}" class="cart-line-img">
        <div class="cart-line-info">
          <p class="cart-line-name">${i.product.name}</p>
          <p class="cart-line-meta">${i.size ? "Size " + i.size : ""} ${i.color ? "· " + i.color : ""}</p>
          <div class="qty-stepper">
            <button class="qty-btn" data-action="dec">${ICONS.minus}</button>
            <span>${i.qty}</span>
            <button class="qty-btn" data-action="inc">${ICONS.plus}</button>
          </div>
        </div>
        <div class="cart-line-right">
          <p class="cart-line-price">${UT_Utils.formatCurrency(i.product.price * i.qty)}</p>
          <button class="cart-line-remove" data-action="remove" aria-label="Remove item">${ICONS.trash}</button>
        </div>
      </div>`).join("");

    const subtotal = global.UT_Cart.subtotal();
    footer.innerHTML = `
      <div class="flex-between" style="margin-bottom:var(--space-4)">
        <span class="text-secondary">Subtotal</span>
        <span style="font-weight:700;font-size:var(--fs-lg)">${UT_Utils.formatCurrency(subtotal)}</span>
      </div>
      <button type="button" class="btn btn-whatsapp btn-block btn-lg" id="cart-whatsapp-checkout-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.8 14.3c-.2.7-1.4 1.4-2 1.5-.5.1-1.1.1-1.8-.1a13.8 13.8 0 01-5-3.2 13.8 13.8 0 01-2.9-4.6c-.3-.7-.1-1.4.4-2 .3-.3.6-.5 1-.5h.4c.2 0 .5 0 .7.5l1 2.3c.1.3 0 .6-.1.8l-.5.6c-.2.2-.3.4-.1.7a9 9 0 004 4c.3.2.5.1.7-.1l.6-.6c.2-.2.5-.3.8-.1l2.2 1.1c.3.1.5.4.5.7.1.2.1.6-.1.9z"/></svg>
        Checkout on WhatsApp
      </button>
      <a href="products.html" class="btn btn-ghost btn-block" style="margin-top:var(--space-2)">Continue Shopping</a>`;

    document.getElementById("cart-whatsapp-checkout-btn").addEventListener("click", () => {
      const settings = global.UT_DB.getSettings();
      const delivery = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;
      const lines = [
        `Hi Urban Threads! I'd like to place this order:`,
        ``,
        ...items.map((i) => `• ${i.product.name}${i.size ? " (" + i.size + (i.color ? ", " + i.color : "") + ")" : ""} × ${i.qty} — ${UT_Utils.formatCurrency(i.product.price * i.qty)}`),
        ``,
        `*Subtotal:* ${UT_Utils.formatCurrency(subtotal)}`,
        `*Delivery:* ${delivery === 0 ? "Free" : UT_Utils.formatCurrency(delivery)}`,
        `*Grand Total: ${UT_Utils.formatCurrency(subtotal + delivery)}*`,
        ``,
        `I'll share my delivery details here. Please confirm availability. Thank you!`,
      ];
      window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
      if (global.UT_Analytics) UT_Analytics.trackWhatsappRedirect();
      global.UT_Cart.clear();
      document.getElementById("cart-drawer-overlay").classList.remove("open");
      document.body.style.overflow = "";
      UT_Toast.show({ type: "success", title: "Redirecting to WhatsApp", message: "Confirm your order in the chat that opens." });
    });

    body.querySelectorAll(".cart-line").forEach((line) => {
      const [productId, size, color] = line.dataset.key.split("::");
      line.querySelector('[data-action="inc"]').addEventListener("click", () => {
        const item = global.UT_Cart.getItems().find((i) => [i.productId, i.size, i.color].join("::") === line.dataset.key);
        global.UT_Cart.updateQty(productId, size === "null" ? null : size, color === "null" ? null : color, item.qty + 1);
      });
      line.querySelector('[data-action="dec"]').addEventListener("click", () => {
        const item = global.UT_Cart.getItems().find((i) => [i.productId, i.size, i.color].join("::") === line.dataset.key);
        global.UT_Cart.updateQty(productId, size === "null" ? null : size, color === "null" ? null : color, item.qty - 1);
      });
      line.querySelector('[data-action="remove"]').addEventListener("click", () => {
        global.UT_Cart.remove(productId, size === "null" ? null : size, color === "null" ? null : color);
        UT_Toast.show({ type: "info", title: "Removed from bag" });
      });
    });
  }

  function wireInteractions(base) {
    const mobileBtn = document.getElementById("mobile-menu-btn");
    const mobileOverlay = document.getElementById("mobile-nav-overlay");
    const mobileClose = document.getElementById("mobile-menu-close");
    mobileBtn.addEventListener("click", () => { mobileOverlay.classList.add("open"); document.body.style.overflow = "hidden"; });
    mobileClose.addEventListener("click", () => { mobileOverlay.classList.remove("open"); document.body.style.overflow = ""; });
    mobileOverlay.addEventListener("click", (e) => { if (e.target === mobileOverlay) { mobileOverlay.classList.remove("open"); document.body.style.overflow = ""; } });

    const cartBtn = document.getElementById("cart-open-btn");
    const cartOverlay = document.getElementById("cart-drawer-overlay");
    const cartClose = document.getElementById("cart-drawer-close");
    cartBtn.addEventListener("click", () => { cartOverlay.classList.add("open"); document.body.style.overflow = "hidden"; });
    cartClose.addEventListener("click", () => { cartOverlay.classList.remove("open"); document.body.style.overflow = ""; });
    cartOverlay.addEventListener("click", (e) => { if (e.target === cartOverlay) { cartOverlay.classList.remove("open"); document.body.style.overflow = ""; } });

    const searchBtn = document.getElementById("search-open-btn");
    const searchOverlay = document.getElementById("search-overlay");
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");

    function openSearch() {
      searchOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
      setTimeout(() => searchInput.focus(), 50);
      renderSearchResults("", base);
    }
    function closeSearch() {
      searchOverlay.classList.remove("open");
      document.body.style.overflow = "";
      searchInput.value = "";
    }
    searchBtn.addEventListener("click", openSearch);
    searchOverlay.addEventListener("click", (e) => { if (e.target === searchOverlay) closeSearch(); });
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
      if (e.key === "Escape") closeSearch();
    });
    searchInput.addEventListener("input", UT_Utils.debounce((e) => renderSearchResults(e.target.value, base), 150));

    function renderSearchResults(query, base) {
      const q = query.trim().toLowerCase();
      const products = global.UT_DB.getProducts().filter((p) => p.published);
      const matches = q ? products.filter((p) => p.name.toLowerCase().includes(q) || p.category.includes(q)) : products.slice(0, 6);
      searchResults.innerHTML = matches.length ? matches.map((p) => `
        <a href="${base}product.html?slug=${p.slug}" class="search-result-item">
          <img src="${p.images[0]}" alt="${p.name}">
          <div><p>${p.name}</p><span class="text-secondary">${UT_Utils.formatCurrency(p.price)}</span></div>
        </a>`).join("") : `<p class="text-secondary" style="padding:var(--space-6)">No results for "${UT_Utils.escapeHtml(query)}"</p>`;
    }
  }

  global.UT_Header = { render };
})(window);
