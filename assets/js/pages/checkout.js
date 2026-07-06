/**
 * Urban Threads — Checkout Controller
 * Builds a formatted WhatsApp order message from cart contents + customer
 * details, shows a live preview, then hands off to wa.me on submit.
 */
(function () {
  "use strict";

  async function init() {
    await window.UT_DB.ready();
    const items = window.UT_Cart.detailedItems();
    if (!items.length) { window.location.href = "cart.html"; return; }

    renderOrderItems(items);
    const totals = computeTotals(items);
    renderTotals(totals);
    updatePreview(items, totals);

    const form = document.getElementById("checkout-form");
    form.addEventListener("input", () => updatePreview(items, totals));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const settings = window.UT_DB.getSettings();
      const message = buildMessage(items, totals, formData());
      window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
      if (window.UT_Analytics) UT_Analytics.trackWhatsappRedirect();
      window.UT_Toast && UT_Toast.show({ type: "success", title: "Redirecting to WhatsApp", message: "Confirm your order in the chat that opens." });
      setTimeout(() => { window.UT_Cart.clear(); }, 800);
    });
  }

  function formData() {
    const f = document.getElementById("checkout-form");
    return {
      name: f.name.value.trim(),
      phone: f.phone.value.trim(),
      address: f.address.value.trim(),
      city: f.city.value.trim(),
      state: f.state.value.trim(),
      pin: f.pin.value.trim(),
      notes: f.notes.value.trim(),
    };
  }

  function renderOrderItems(items) {
    document.getElementById("checkout-order-items").innerHTML = items.map((i) => `
      <div class="checkout-order-item">
        <img src="${i.product.images[0]}" alt="${i.product.name}">
        <div>
          <p class="checkout-order-item-name">${i.product.name}</p>
          <p class="checkout-order-item-meta">${i.size ? "Size " + i.size : ""} ${i.color ? "· " + i.color : ""} · Qty ${i.qty}</p>
        </div>
        <span class="checkout-order-item-price">${UT_Utils.formatCurrency(i.product.price * i.qty)}</span>
      </div>`).join("");
  }

  function computeTotals(items) {
    const settings = window.UT_DB.getSettings();
    const stored = JSON.parse(sessionStorage.getItem("ut_checkout_summary") || "null");
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
    const discount = stored && stored.subtotal === subtotal ? stored.discount : 0;
    const discountCode = stored && stored.subtotal === subtotal ? stored.discountCode : null;
    const afterDiscount = subtotal - discount;
    const delivery = afterDiscount >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;
    return { subtotal, discount, discountCode, delivery, total: afterDiscount + delivery };
  }

  function renderTotals(t) {
    document.getElementById("checkout-totals").innerHTML = `
      <div class="summary-row"><span>Subtotal</span><span class="value">${UT_Utils.formatCurrency(t.subtotal)}</span></div>
      ${t.discount > 0 ? `<div class="summary-row"><span>Discount</span><span class="value" style="color:var(--success)">-${UT_Utils.formatCurrency(t.discount)}</span></div>` : ""}
      <div class="summary-row"><span>Delivery</span><span class="value">${t.delivery === 0 ? "Free" : UT_Utils.formatCurrency(t.delivery)}</span></div>
      <div class="summary-row total"><span>Grand Total</span><span>${UT_Utils.formatCurrency(t.total)}</span></div>`;
  }

  function buildMessage(items, t, data) {
    const lines = [
      `*NEW ORDER — URBAN THREADS*`,
      `━━━━━━━━━━━━━━━━━━`,
      `*Customer:* ${data.name}`,
      `*Phone:* ${data.phone}`,
      `*Address:* ${data.address}, ${data.city}, ${data.state} - ${data.pin}`,
      data.notes ? `*Notes:* ${data.notes}` : null,
      ``,
      `*ORDER ITEMS*`,
      ...items.map((i) => `• ${i.product.name} ${i.size ? "(" + i.size + (i.color ? ", " + i.color : "") + ")" : ""} × ${i.qty} — ${UT_Utils.formatCurrency(i.product.price * i.qty)}`),
      ``,
      `*Subtotal:* ${UT_Utils.formatCurrency(t.subtotal)}`,
      t.discount > 0 ? `*Discount (${t.discountCode}):* -${UT_Utils.formatCurrency(t.discount)}` : null,
      `*Delivery:* ${t.delivery === 0 ? "Free" : UT_Utils.formatCurrency(t.delivery)}`,
      `*Grand Total: ${UT_Utils.formatCurrency(t.total)}*`,
      `━━━━━━━━━━━━━━━━━━`,
      `Please confirm this order. Thank you for shopping with Urban Threads!`,
    ].filter(Boolean);
    return lines.join("\n");
  }

  function updatePreview(items, t) {
    const data = formData();
    document.getElementById("wa-preview").textContent = buildMessage(items, t, {
      name: data.name || "—", phone: data.phone || "—",
      address: data.address || "—", city: data.city || "—", state: data.state || "—", pin: data.pin || "—",
      notes: data.notes,
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
