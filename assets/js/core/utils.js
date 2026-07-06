/**
 * Urban Threads — Shared Utilities
 * Pure helper functions used across store + admin. No DOM page-specific logic here.
 */
(function (global) {
  "use strict";

  const Utils = {
    qs(sel, ctx) { return (ctx || document).querySelector(sel); },
    qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); },

    formatCurrency(amount) {
      return "₹" + Math.round(amount).toLocaleString("en-IN");
    },

    formatDate(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    },

    slugify(str) {
      return String(str).toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    },

    escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = String(str ?? "");
      return div.innerHTML;
    },

    debounce(fn, wait) {
      let t;
      return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait || 250);
      };
    },

    clamp(n, min, max) { return Math.min(Math.max(n, min), max); },

    starsSvg(rating, size) {
      size = size || 15;
      const full = Math.floor(rating);
      const half = rating - full >= 0.5;
      let html = "";
      for (let i = 0; i < 5; i++) {
        const state = i < full ? "full" : (i === full && half ? "half" : "empty");
        html += Utils.starSvg(state, size);
      }
      return `<span class="stars" role="img" aria-label="${rating} out of 5 stars">${html}</span>`;
    },

    starSvg(state, size) {
      const fillId = "sg" + Math.random().toString(36).slice(2, 8);
      if (state === "full") {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg>`;
      }
      if (state === "half") {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><defs><linearGradient id="${fillId}"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#${fillId})" stroke="currentColor" stroke-width="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg>`;
      }
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg>`;
    },

    getParam(name) {
      return new URLSearchParams(window.location.search).get(name);
    },

    animateCount(el, target, duration) {
      duration = duration || 1200;
      const start = 0;
      const startTime = performance.now();
      const isCurrency = el.dataset.format === "currency";
      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(start + (target - start) * eased);
        el.textContent = isCurrency ? Utils.formatCurrency(value) : value.toLocaleString("en-IN");
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    },
  };

  global.UT_Utils = Utils;
})(window);
