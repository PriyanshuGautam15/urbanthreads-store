/**
 * Urban Threads — Product Detail Controller
 */
(function () {
  "use strict";

  let product, selectedSize, selectedColor, qty = 1;

  async function init() {
    await window.UT_DB.ready();
    const slug = UT_Utils.getParam("slug");
    product = window.UT_DB.getProduct(slug);
    if (!product) { window.location.href = "404.html"; return; }

    selectedSize = product.sizes[0];
    selectedColor = product.colors[0] ? product.colors[0].name : null;

    document.title = product.seoTitle || `${product.name} | Urban Threads`;
    setMeta("description", product.seoDescription);

    renderBreadcrumb();
    renderGallery();
    renderInfo();
    renderAccordion();
    renderReviews();
    renderRelated();
    wireQuickAdd();
  }

  function setMeta(name, content) {
    if (!content) return;
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) { tag = document.createElement("meta"); tag.setAttribute("name", name); document.head.appendChild(tag); }
    tag.setAttribute("content", content);
  }

  function renderBreadcrumb() {
    const cat = window.UT_DB.getCategory(product.category);
    document.getElementById("pdp-breadcrumb").innerHTML = `
      <a href="index.html">Home</a>${chev()}
      <a href="products.html">Shop</a>${chev()}
      <a href="products.html?category=${product.category}">${cat ? cat.name : product.category}</a>${chev()}
      <span>${product.name}</span>`;
  }
  function chev() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>'; }

  function renderGallery() {
    document.getElementById("pdp-thumbs").innerHTML = product.images.map((img, i) => `
      <button class="pdp-thumb ${i === 0 ? "active" : ""}" data-index="${i}" aria-label="View image ${i + 1}">
        <img src="${img}" alt="${product.name} view ${i + 1}">
      </button>`).join("");

    const mainWrap = document.getElementById("pdp-main-image");
    mainWrap.innerHTML = `<img src="${product.images[0]}" alt="${product.name}" id="pdp-main-img">`;

    document.getElementById("pdp-thumbs").addEventListener("click", (e) => {
      const btn = e.target.closest(".pdp-thumb");
      if (!btn) return;
      UT_Utils.qsa(".pdp-thumb").forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("pdp-main-img").src = product.images[btn.dataset.index];
    });

    mainWrap.addEventListener("mousemove", (e) => {
      const rect = mainWrap.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      document.getElementById("pdp-main-img").style.transformOrigin = `${x}% ${y}%`;
      mainWrap.classList.add("zoomed");
    });
    mainWrap.addEventListener("mouseleave", () => mainWrap.classList.remove("zoomed"));
  }

  function renderInfo() {
    const el = document.getElementById("pdp-info");
    const inWishlist = window.UT_Wishlist.has(product.id);
    el.innerHTML = `
      <p class="pdp-category">${product.category.replace("-", " ")}</p>
      <h1 class="pdp-title">${product.name}</h1>
      <div class="pdp-rating-row">
        ${UT_Utils.starsSvg(product.rating, 16)}
        <a href="#reviews">${product.reviewCount} reviews</a>
      </div>
      <div class="pdp-price-row">
        <span class="pdp-price">${UT_Utils.formatCurrency(product.price)}</span>
        ${product.mrp > product.price ? `<span class="pdp-mrp">${UT_Utils.formatCurrency(product.mrp)}</span><span class="pdp-discount">${Math.round((1 - product.price / product.mrp) * 100)}% off</span>` : ""}
      </div>
      <p class="pdp-short-desc">${product.shortDescription}</p>

      ${product.colors.length ? `
      <div class="pdp-option-group">
        <p class="pdp-option-label">Color <span class="selected-value" id="selected-color-label">${selectedColor}</span></p>
        <div class="color-swatches" id="color-swatches">
          ${product.colors.map((c) => `<button type="button" class="color-swatch ${c.name === selectedColor ? "active" : ""}" style="background:${c.hex}" data-color="${c.name}" aria-label="${c.name}"></button>`).join("")}
        </div>
      </div>` : ""}

      <div class="pdp-option-group">
        <p class="pdp-option-label">Size <span class="selected-value" id="selected-size-label">${selectedSize}</span></p>
        <div class="pdp-size-grid" id="size-swatches">
          ${product.sizes.map((s) => `<button type="button" class="size-pill ${s === selectedSize ? "active" : ""}" data-size="${s}">${s}</button>`).join("")}
        </div>
      </div>

      <div class="stock-status">
        <span class="stock-dot" style="background:${product.stock > 5 ? "var(--success)" : product.stock > 0 ? "var(--warning)" : "var(--danger)"}"></span>
        ${product.stock > 5 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left in stock` : "Out of Stock"}
      </div>

      <div class="pdp-actions">
        <div class="pdp-qty-stepper">
          <button type="button" id="qty-dec" aria-label="Decrease quantity">${'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14"/></svg>'}</button>
          <span id="qty-value">${qty}</span>
          <button type="button" id="qty-inc" aria-label="Increase quantity">${'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>'}</button>
        </div>
        <button class="btn btn-accent btn-lg" style="flex:1" id="add-to-cart-btn" ${product.stock === 0 ? "disabled" : ""}>Add to Bag</button>
        <button class="icon-btn" style="border:1.5px solid var(--border-default)" id="pdp-wishlist-btn" aria-label="Toggle wishlist" aria-pressed="${inWishlist}">
          <svg viewBox="0 0 24 24" fill="${inWishlist ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" style="color:${inWishlist ? "var(--danger)" : "inherit"}"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>
        </button>
      </div>
      <button class="btn btn-whatsapp btn-lg btn-block" id="whatsapp-buy-btn" ${product.stock === 0 ? "disabled" : ""}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.8 14.3c-.2.7-1.4 1.4-2 1.5-.5.1-1.1.1-1.8-.1a13.8 13.8 0 01-5-3.2 13.8 13.8 0 01-2.9-4.6c-.3-.7-.1-1.4.4-2 .3-.3.6-.5 1-.5h.4c.2 0 .5 0 .7.5l1 2.3c.1.3 0 .6-.1.8l-.5.6c-.2.2-.3.4-.1.7a9 9 0 004 4c.3.2.5.1.7-.1l.6-.6c.2-.2.5-.3.8-.1l2.2 1.1c.3.1.5.4.5.7.1.2.1.6-.1.9z"/></svg>
        Buy via WhatsApp
      </button>
    `;

    document.getElementById("qty-inc").addEventListener("click", () => { qty++; document.getElementById("qty-value").textContent = qty; });
    document.getElementById("qty-dec").addEventListener("click", () => { qty = Math.max(1, qty - 1); document.getElementById("qty-value").textContent = qty; });

    const colorWrap = document.getElementById("color-swatches");
    if (colorWrap) colorWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".color-swatch");
      if (!btn) return;
      selectedColor = btn.dataset.color;
      UT_Utils.qsa(".color-swatch").forEach((b) => b.classList.toggle("active", b === btn));
      document.getElementById("selected-color-label").textContent = selectedColor;
    });

    document.getElementById("size-swatches").addEventListener("click", (e) => {
      const btn = e.target.closest(".size-pill");
      if (!btn) return;
      selectedSize = btn.dataset.size;
      UT_Utils.qsa("#size-swatches .size-pill").forEach((b) => b.classList.toggle("active", b === btn));
      document.getElementById("selected-size-label").textContent = selectedSize;
    });

    document.getElementById("add-to-cart-btn").addEventListener("click", () => {
      window.UT_Cart.add(product.id, { size: selectedSize, color: selectedColor, qty });
      UT_Toast.show({ type: "success", title: "Added to bag", message: `${product.name} · ${qty} × ${selectedSize}` });
    });

    document.getElementById("pdp-wishlist-btn").addEventListener("click", () => {
      const active = window.UT_Wishlist.toggle(product.id);
      const btn = document.getElementById("pdp-wishlist-btn");
      btn.setAttribute("aria-pressed", String(active));
      const svg = btn.querySelector("svg");
      svg.setAttribute("fill", active ? "currentColor" : "none");
      svg.style.color = active ? "var(--danger)" : "inherit";
      UT_Toast.show({ type: active ? "success" : "info", title: active ? "Added to wishlist" : "Removed from wishlist" });
    });

    document.getElementById("whatsapp-buy-btn").addEventListener("click", () => {
      const settings = window.UT_DB.getSettings();
      const lines = [
        `Hi Urban Threads! I'd like to order:`,
        ``,
        `*Product:* ${product.name}`,
        `*Size:* ${selectedSize}`,
        selectedColor ? `*Color:* ${selectedColor}` : null,
        `*Qty:* ${qty}`,
        `*Price:* ${UT_Utils.formatCurrency(product.price * qty)}`,
        ``,
        `Please confirm availability. Thank you!`,
      ].filter(Boolean).join("\n");
      window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(lines)}`, "_blank");
      if (window.UT_Analytics) UT_Analytics.trackWhatsappRedirect();
    });
  }

  function renderAccordion() {
    document.getElementById("pdp-accordion").innerHTML = `
      <div class="accordion-item open">
        <button class="accordion-trigger">Description ${chevDown()}</button>
        <div class="accordion-content"><div class="accordion-content-inner">${product.description}</div></div>
      </div>
      <div class="accordion-item">
        <button class="accordion-trigger">Size &amp; Fit ${chevDown()}</button>
        <div class="accordion-content"><div class="accordion-content-inner">This piece fits true to size. If you're between sizes, we recommend sizing up for a relaxed fit or sizing down for a fitted look. Available sizes: ${product.sizes.join(", ")}.</div></div>
      </div>
      <div class="accordion-item">
        <button class="accordion-trigger">Shipping &amp; Returns ${chevDown()}</button>
        <div class="accordion-content"><div class="accordion-content-inner">Free express shipping on orders over ₹2,999. Delivered in 2-4 business days. Easy 30-day returns and exchanges on unworn items with tags attached.</div></div>
      </div>`;
    document.getElementById("pdp-accordion").querySelectorAll(".accordion-item").forEach((item) => {
      item.querySelector(".accordion-trigger").addEventListener("click", () => item.classList.toggle("open"));
    });
  }
  function chevDown() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'; }

  function renderReviews() {
    const reviews = window.UT_DB.getReviews(product.id);
    const counts = [5, 4, 3, 2, 1].map((star) => reviews.filter((r) => r.rating === star).length);
    const total = reviews.length || 1;

    document.getElementById("reviews-summary").innerHTML = `
      <div class="reviews-summary-score card">
        <div class="score">${product.rating}</div>
        ${UT_Utils.starsSvg(product.rating, 18)}
        <p class="text-secondary" style="margin-top:var(--space-2)">Based on ${product.reviewCount} reviews</p>
      </div>
      <div>
        ${[5, 4, 3, 2, 1].map((star, i) => `
          <div class="rating-bar-row">
            <span>${star} star</span>
            <div class="rating-bar-track"><div class="rating-bar-fill" style="width:${(counts[i] / total) * 100}%"></div></div>
            <span class="text-tertiary">${counts[i]}</span>
          </div>`).join("")}
      </div>`;

    const list = document.getElementById("reviews-list");
    list.innerHTML = reviews.length ? reviews.slice(0, 8).map((r) => `
      <div class="review-item">
        <div class="review-item-header">
          <div>
            <strong>${r.author}</strong> ${r.verified ? '<span class="badge badge-success" style="margin-left:6px">Verified</span>' : ""}
          </div>
          <span class="text-tertiary" style="font-size:var(--fs-xs)">${UT_Utils.formatDate(r.date)}</span>
        </div>
        ${UT_Utils.starsSvg(r.rating, 13)}
        <p class="review-item-title">${r.title}</p>
        <p class="review-item-body">${r.comment}</p>
      </div>`).join("") : `<p class="text-secondary">No reviews yet. Be the first to review this product.</p>`;

    document.getElementById("review-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const rating = Number(form.querySelector('input[name="rating"]:checked')?.value || 5);
      window.UT_DB.addReview({
        productId: product.id,
        author: form.author.value || "Anonymous",
        rating,
        title: form.title.value,
        comment: form.comment.value,
        verified: false,
      });
      UT_Toast.show({ type: "success", title: "Review submitted", message: "Thanks for sharing your feedback!" });
      form.reset();
      renderReviews();
    });
  }

  function renderRelated() {
    const related = window.UT_DB.getProducts()
      .filter((p) => p.published && p.category === product.category && p.id !== product.id)
      .slice(0, 4);
    const grid = document.getElementById("related-grid");
    grid.innerHTML = UT_ProductCard.renderGrid(related, "");
    UT_ProductCard.wire(grid, "");
  }

  function wireQuickAdd() { /* reserved for future cross-sell widgets */ }

  document.addEventListener("DOMContentLoaded", init);
})();
