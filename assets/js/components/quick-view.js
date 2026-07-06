/**
 * Urban Threads — Quick View Modal
 * Lightweight product preview triggered from product cards without a full
 * page navigation. Shares add-to-cart logic with the PDP.
 */
(function (global) {
  "use strict";

  function ensureModal() {
    let el = document.getElementById("quickview-modal");
    if (el) return el;
    el = document.createElement("div");
    el.id = "quickview-modal";
    el.className = "modal-overlay";
    el.innerHTML = `<div class="modal modal-lg" role="dialog" aria-modal="true" aria-label="Quick view"><div id="quickview-content"></div></div>`;
    document.body.appendChild(el);
    el.addEventListener("click", (e) => { if (e.target === el) close(); });
    return el;
  }

  function close() {
    const el = document.getElementById("quickview-modal");
    if (el) { el.classList.remove("open"); document.body.style.overflow = ""; }
  }

  function open(productId, basePath) {
    const base = basePath || "";
    const product = global.UT_DB.getProduct(productId);
    if (!product) return;
    const modal = ensureModal();
    let selectedSize = product.sizes[0];

    function content() {
      return `
        <div class="qv-grid">
          <div class="qv-image"><img src="${product.images[0]}" alt="${product.name}"></div>
          <div class="qv-info">
            <button class="modal-close qv-close" data-modal-close aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <p class="pc-category">${product.category.replace("-", " ")}</p>
            <h3 class="text-h4">${product.name}</h3>
            <div class="pc-rating" style="margin:var(--space-2) 0">${UT_Utils.starsSvg(product.rating, 15)}<span class="text-tertiary">(${product.reviewCount} reviews)</span></div>
            <div class="pc-price-row" style="font-size:var(--fs-lg);margin:var(--space-4) 0">
              <span class="pc-price">${UT_Utils.formatCurrency(product.price)}</span>
              ${product.mrp > product.price ? `<span class="pc-mrp">${UT_Utils.formatCurrency(product.mrp)}</span>` : ""}
            </div>
            <p class="text-secondary" style="margin-bottom:var(--space-5)">${product.shortDescription}</p>
            <div class="qv-sizes">
              <p class="label" style="margin-bottom:var(--space-2)">Size</p>
              <div class="size-pills" id="qv-size-pills">
                ${product.sizes.map((s) => `<button type="button" class="size-pill ${s === selectedSize ? "active" : ""}" data-size="${s}">${s}</button>`).join("")}
              </div>
            </div>
            <div class="qv-actions">
              <button class="btn btn-accent btn-lg btn-block" id="qv-add-cart" ${product.stock === 0 ? "disabled" : ""}>${product.stock === 0 ? "Sold Out" : "Add to Bag"}</button>
              <a href="${base}product.html?slug=${product.slug}" class="btn btn-outline btn-lg btn-block">View Full Details</a>
            </div>
          </div>
        </div>`;
    }

    document.getElementById("quickview-content").innerHTML = content();
    UT_Modal.open("quickview-modal");

    const container = modal.querySelector("#quickview-content");
    container.querySelectorAll(".size-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedSize = btn.dataset.size;
        container.querySelectorAll(".size-pill").forEach((b) => b.classList.toggle("active", b === btn));
      });
    });
    container.querySelector("#qv-add-cart").addEventListener("click", () => {
      global.UT_Cart.add(product.id, { size: selectedSize, color: product.colors[0] && product.colors[0].name, qty: 1 });
      UT_Toast.show({ type: "success", title: "Added to bag", message: product.name });
      close();
    });
  }

  global.UT_QuickView = { open, close };
})(window);
