/**
 * Urban Threads — Storefront Footer
 * Renders into <div id="ut-footer"></div>. Reads store name/social links
 * from Settings so admin edits propagate without touching markup.
 */
(function (global) {
  "use strict";

  function render(basePath) {
    const base = basePath || "";
    const container = document.getElementById("ut-footer");
    if (!container) return;
    const s = global.UT_DB.getSettings();
    const year = new Date().getFullYear();

    container.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-top">
            <div class="footer-brand">
              <a href="${base}index.html" class="brand-logo">URBAN<span>THREADS</span></a>
              <p class="text-secondary" style="max-width:320px;margin-top:var(--space-4)">Designed for everyday icons. Premium essentials, considered details, made to last.</p>
              <div class="footer-social">
                <a href="${s.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon("instagram")}</a>
                <a href="${s.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon("facebook")}</a>
                <a href="${s.social.twitter}" target="_blank" rel="noopener" aria-label="Twitter">${icon("twitter")}</a>
                <a href="${s.social.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${icon("youtube")}</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Shop</h4>
              <a href="${base}products.html">All Products</a>
              <a href="${base}products.html?filter=new">New Arrivals</a>
              <a href="${base}products.html?filter=bestseller">Best Sellers</a>
              <a href="${base}products.html?view=wishlist">Wishlist</a>
            </div>
            <div class="footer-col">
              <h4>Company</h4>
              <a href="${base}about.html">About Us</a>
              <a href="${base}contact.html">Contact</a>
              <a href="${base}contact.html#faq">FAQs</a>
            </div>
            <div class="footer-col">
              <h4>Newsletter</h4>
              <p class="text-secondary" style="margin-bottom:var(--space-3)">Get 10% off your first order.</p>
              <form class="footer-newsletter" id="newsletter-form">
                <input type="email" class="input" placeholder="Email address" required aria-label="Email address">
                <button class="btn btn-primary" type="submit">Join</button>
              </form>
            </div>
          </div>
          <div class="footer-bottom">
            <p>${s.footerText || "© " + year + " Urban Threads. All rights reserved."}</p>
            <div class="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Shipping &amp; Returns</a>
            </div>
          </div>
        </div>
      </footer>`;

    const form = document.getElementById("newsletter-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        UT_Toast.show({ type: "success", title: "You're subscribed!", message: "Look out for your 10% off code by email." });
        form.reset();
      });
    }
  }

  function icon(name) {
    const icons = {
      instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
      facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
      twitter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>',
      youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l6 3-6 3z"/></svg>',
    };
    return icons[name] || "";
  }

  global.UT_Footer = { render };
})(window);
