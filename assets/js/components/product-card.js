/**
 * Urban Threads — Product Card
 * Single reusable card markup used by Home, Products grid, and search/related
 * rails. Keeps quick-view + wishlist + add-to-cart wiring in one place.
 */
(function (global) {
  "use strict";

  function badge(product) {
    if (product.stock === 0) return '<span class="pc-badge pc-badge-danger">Sold Out</span>';
    if (product.isNew) return '<span class="pc-badge pc-badge-accent">New</span>';
    if (product.bestSeller) return '<span class="pc-badge pc-badge-dark">Bestseller</span>';
    if (product.mrp > product.price) return `<span class="pc-badge pc-badge-sale">-${Math.round((1 - product.price / product.mrp) * 100)}%</span>`;
    return "";
  }

  function render(product, basePath) {
    const base = basePath || "";
    const inWishlist = global.UT_Wishlist ? global.UT_Wishlist.has(product.id) : false;
    return `
      <article class="product-card" data-id="${product.id}">
        <a href="${base}product.html?slug=${product.slug}" class="pc-media" aria-label="${product.name}">
          ${badge(product)}
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy" class="pc-img-primary">
          ${product.images[1] ? `<img src="${product.images[1]}" alt="" loading="lazy" class="pc-img-secondary">` : ""}
        </a>
        <button class="pc-wishlist ${inWishlist ? "active" : ""}" data-action="wishlist" aria-label="Toggle wishlist" aria-pressed="${inWishlist}">
          <svg viewBox="0 0 24 24" fill="${inWishlist ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>
        </button>
        <button class="pc-quickview" data-action="quickview">Quick View</button>
        <div class="pc-info">
          <p class="pc-category">${UT_Utils.escapeHtml(product.category.replace("-", " "))}</p>
          <a href="${base}product.html?slug=${product.slug}" class="pc-name">${product.name}</a>
          <div class="pc-rating">${UT_Utils.starsSvg(product.rating, 13)}<span class="text-tertiary">(${product.reviewCount})</span></div>
          <div class="pc-price-row">
            <span class="pc-price">${UT_Utils.formatCurrency(product.price)}</span>
            ${product.mrp > product.price ? `<span class="pc-mrp">${UT_Utils.formatCurrency(product.mrp)}</span>` : ""}
          </div>
        </div>
      </article>`;
  }

  function renderGrid(products, basePath) {
    if (!products.length) {
      return `<div class="empty-state" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <h3>No products found</h3><p>Try adjusting your filters or search terms.</p>
      </div>`;
    }
    return products.map((p) => render(p, basePath)).join("");
  }

  function wire(container, basePath) {
    container.addEventListener("click", (e) => {
      const wishBtn = e.target.closest('[data-action="wishlist"]');
      const qvBtn = e.target.closest('[data-action="quickview"]');
      if (wishBtn) {
        e.preventDefault();
        const card = wishBtn.closest(".product-card");
        const active = global.UT_Wishlist.toggle(card.dataset.id);
        wishBtn.classList.toggle("active", active);
        wishBtn.setAttribute("aria-pressed", String(active));
        wishBtn.querySelector("svg").setAttribute("fill", active ? "currentColor" : "none");
        UT_Toast.show({ type: active ? "success" : "info", title: active ? "Added to wishlist" : "Removed from wishlist" });
      }
      if (qvBtn) {
        e.preventDefault();
        const card = qvBtn.closest(".product-card");
        global.UT_QuickView && global.UT_QuickView.open(card.dataset.id, basePath);
      }
    });
  }

  global.UT_ProductCard = { render, renderGrid, wire };
})(window);
