/**
 * Urban Threads — Toast Notifications
 * Call UT_Toast.show({type, title, message}) from anywhere after core/toast.js loads.
 */
(function (global) {
  "use strict";

  const ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 16v-4M12 8h.01"/><circle cx="12" cy="12" r="9"/></svg>',
  };

  function region() {
    let el = document.getElementById("toast-region");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast-region";
      el.className = "toast-region";
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-atomic", "true");
      document.body.appendChild(el);
    }
    return el;
  }

  function show({ type = "info", title, message, duration = 4200 } = {}) {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.setAttribute("role", "status");
    el.innerHTML = `
      <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
      <div>
        ${title ? `<div class="toast-title">${UT_Utils.escapeHtml(title)}</div>` : ""}
        ${message ? `<div class="toast-msg">${UT_Utils.escapeHtml(message)}</div>` : ""}
      </div>
      <button class="toast-close" aria-label="Dismiss notification">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>`;
    region().appendChild(el);

    const remove = () => {
      el.classList.add("hide");
      setTimeout(() => el.remove(), 180);
    };
    el.querySelector(".toast-close").addEventListener("click", remove);
    const timer = setTimeout(remove, duration);
    el.addEventListener("mouseenter", () => clearTimeout(timer));
    return el;
  }

  global.UT_Toast = { show };
})(window);
