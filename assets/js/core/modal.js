/**
 * Urban Threads — Modal Controller
 * Handles [data-modal-open]/[data-modal-close] wiring for static modals in the
 * page markup, plus UT_Modal.confirm() for a programmatic confirmation dialog.
 */
(function (global) {
  "use strict";

  function open(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    const focusable = overlay.querySelector("input, button, select, textarea, [tabindex]");
    if (focusable) focusable.focus();
  }

  function close(overlay) {
    if (typeof overlay === "string") overlay = document.getElementById(overlay);
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  function bindGlobalHandlers() {
    document.addEventListener("click", (e) => {
      const openTrigger = e.target.closest("[data-modal-open]");
      if (openTrigger) { open(openTrigger.getAttribute("data-modal-open")); return; }
      const closeTrigger = e.target.closest("[data-modal-close]");
      if (closeTrigger) { close(closeTrigger.closest(".modal-overlay")); return; }
      if (e.target.classList && e.target.classList.contains("modal-overlay")) { close(e.target); }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        UT_Utils.qsa(".modal-overlay.open").forEach((el) => close(el));
      }
    });
  }

  let confirmResolver = null;
  function ensureConfirmModal() {
    let el = document.getElementById("ut-confirm-modal");
    if (el) return el;
    el = document.createElement("div");
    el.id = "ut-confirm-modal";
    el.className = "modal-overlay";
    el.innerHTML = `
      <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="ut-confirm-title">
        <div class="modal-body">
          <div class="modal-icon-wrap badge-danger" style="background:var(--danger-soft);color:var(--danger)">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
          </div>
          <h3 id="ut-confirm-title" class="text-h5" style="margin-bottom:.5rem">Are you sure?</h3>
          <p class="text-secondary" id="ut-confirm-msg">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="ut-confirm-cancel">Cancel</button>
          <button class="btn btn-danger" id="ut-confirm-ok">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    el.querySelector("#ut-confirm-cancel").addEventListener("click", () => { close(el); confirmResolver && confirmResolver(false); });
    el.querySelector("#ut-confirm-ok").addEventListener("click", () => { close(el); confirmResolver && confirmResolver(true); });
    return el;
  }

  function confirm({ title = "Are you sure?", message = "This action cannot be undone.", confirmLabel = "Delete" } = {}) {
    const el = ensureConfirmModal();
    el.querySelector("#ut-confirm-title").textContent = title;
    el.querySelector("#ut-confirm-msg").textContent = message;
    el.querySelector("#ut-confirm-ok").textContent = confirmLabel;
    open("ut-confirm-modal");
    return new Promise((resolve) => { confirmResolver = resolve; });
  }

  document.addEventListener("DOMContentLoaded", bindGlobalHandlers);
  global.UT_Modal = { open, close, confirm };
})(window);
