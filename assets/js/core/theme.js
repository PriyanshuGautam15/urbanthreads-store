/**
 * Urban Threads — Theme Controller
 * Persists light/dark choice across store + admin (shared localStorage key).
 */
(function (global) {
  "use strict";
  const KEY = "ut_theme";

  function apply(theme) {
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    UT_Utils.qsa("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(current() === "dark"));
    });
  }

  function current() {
    const stored = localStorage.getItem(KEY);
    if (stored) return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function set(theme) {
    localStorage.setItem(KEY, theme);
    apply(theme);
  }

  function toggle() {
    set(current() === "dark" ? "light" : "dark");
  }

  function init() {
    apply(localStorage.getItem(KEY));
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-theme-toggle]");
      if (btn) toggle();
    });
  }

  global.UT_Theme = { init, toggle, set, current };
  // Apply immediately (before DOMContentLoaded) to avoid a flash of wrong theme.
  apply(localStorage.getItem(KEY));
})(window);
