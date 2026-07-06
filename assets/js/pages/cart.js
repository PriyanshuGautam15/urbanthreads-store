/**
 * Urban Threads — Cart Page Controller
 */
(function () {
  "use strict";
  let promoCode = null;
  const PROMO_CODES = { WELCOME10: 0.10, URBAN20: 0.20 };

  async function init() {
    await window.UT_DB.ready();
    render();
    window.addEventListener("ut:cart-change", render);
    document.getElementById("promo-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("promo-input");
      const code = input.value.trim().toUpperCase();
      if (PROMO_CODES[code]) {
        promoCode = code;
        UT_Toast.show({ type: "success", title: "Promo applied", message: `${PROMO_CODES[code] * 100}% off your order` });
      } else {
        UT_Toast.show({ type: "error", title: "Invalid code", message: "That promo code doesn't exist." });
      }
      render();
    });
  }

  function render() {
    const items = window.UT_Cart.detailedItems();
    const wrap = document.getElementById("cart-content");

    if (!items.length) {
      wrap.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;padding-block:var(--space-32)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <h3>Your bag is empty</h3>
          <p>Looks like you haven't added anything yet. Let's fix that.</p>
          <a href="products.html" class="btn btn-primary" style="margin-top:var(--space-6)">Start Shopping</a>
        </div>`;
      document.getElementById("cart-summary-wrap").style.display = "none";
      return;
    }
    document.getElementById("cart-summary-wrap").style.display = "";

    wrap.innerHTML = `
      <div class="cart-table-head">
        <span>Product</span><span>Price</span><span>Quantity</span><span>Total</span><span></span>
      </div>
      ${items.map((i) => `
        <div class="cart-row" data-key="${i.productId}::${i.size}::${i.color}">
          <div class="cart-row-product">
            <img src="${i.product.images[0]}" class="cart-row-img" alt="${i.product.name}">
            <div>
              <p class="cart-row-name">${i.product.name}</p>
              <p class="cart-row-meta">${i.size ? "Size " + i.size : ""} ${i.color ? "· " + i.color : ""}</p>
              <button class="btn-ghost btn-sm cart-row-remove-mobile" data-action="remove" style="padding-left:0">Remove</button>
            </div>
          </div>
          <div class="cart-col-price">${UT_Utils.formatCurrency(i.product.price)}</div>
          <div class="qty-stepper" style="width:fit-content">
            <button class="qty-btn" data-action="dec">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14"/></svg>'}</button>
            <span>${i.qty}</span>
            <button class="qty-btn" data-action="inc">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>'}</button>
          </div>
          <div class="cart-col-total" style="font-weight:600">${UT_Utils.formatCurrency(i.product.price * i.qty)}</div>
          <div class="cart-col-remove">
            <button class="icon-btn" data-action="remove" aria-label="Remove item" style="color:var(--text-tertiary)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>
            </button>
          </div>
        </div>`).join("")}
    `;

    wrap.querySelectorAll(".cart-row").forEach((row) => {
      const [productId, size, color] = row.dataset.key.split("::");
      const s = size === "null" ? null : size, c = color === "null" ? null : color;
      const item = items.find((i) => [i.productId, i.size, i.color].join("::") === row.dataset.key);
      row.querySelectorAll('[data-action="inc"]').forEach((b) => b.addEventListener("click", () => window.UT_Cart.updateQty(productId, s, c, item.qty + 1)));
      row.querySelectorAll('[data-action="dec"]').forEach((b) => b.addEventListener("click", () => window.UT_Cart.updateQty(productId, s, c, item.qty - 1)));
      row.querySelectorAll('[data-action="remove"]').forEach((b) => b.addEventListener("click", () => {
        window.UT_Cart.remove(productId, s, c);
        UT_Toast.show({ type: "info", title: "Item removed" });
      }));
    });

    renderSummary(items);
  }

  function renderSummary(items) {
    const settings = window.UT_DB.getSettings();
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
    const discountRate = promoCode ? PROMO_CODES[promoCode] : 0;
    const discount = subtotal * discountRate;
    const afterDiscount = subtotal - discount;
    const delivery = afterDiscount >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;
    const total = afterDiscount + delivery;

    document.getElementById("cart-summary").innerHTML = `
      ${delivery === 0
        ? `<div class="free-delivery-banner">🎉 You've unlocked free delivery!</div>`
        : `<div class="free-delivery-banner" style="background:var(--info-soft);color:var(--info)">Add ${UT_Utils.formatCurrency(settings.freeDeliveryThreshold - afterDiscount)} more for free delivery</div>`}
      <div class="summary-row"><span>Subtotal</span><span class="value">${UT_Utils.formatCurrency(subtotal)}</span></div>
      ${discount > 0 ? `<div class="summary-row"><span>Discount (${promoCode})</span><span class="value" style="color:var(--success)">-${UT_Utils.formatCurrency(discount)}</span></div>` : ""}
      <div class="summary-row"><span>Delivery</span><span class="value">${delivery === 0 ? "Free" : UT_Utils.formatCurrency(delivery)}</span></div>
      <div class="summary-row total"><span>Grand Total</span><span>${UT_Utils.formatCurrency(total)}</span></div>
      <a href="checkout.html" class="btn btn-accent btn-lg btn-block" style="margin-top:var(--space-6)">Proceed to Checkout</a>
      <a href="products.html" class="btn btn-ghost btn-block" style="margin-top:var(--space-2)">Continue Shopping</a>
    `;

    sessionStorage.setItem("ut_checkout_summary", JSON.stringify({ subtotal, discount, discountCode: promoCode, delivery, total }));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
