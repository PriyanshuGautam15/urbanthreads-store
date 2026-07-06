/**
 * Urban Threads — Cart & Wishlist
 * Line items keyed by productId + size + color so the same product in two
 * sizes is tracked separately. Persisted to localStorage; dispatches
 * "ut:cart-change" / "ut:wishlist-change" on window so nav badges stay in sync.
 */
(function (global) {
  "use strict";
  const CART_KEY = "ut_cart";
  const WISHLIST_KEY = "ut_wishlist";

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch (e) { return []; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function lineKey(item) { return [item.productId, item.size, item.color].join("::"); }

  const Cart = {
    getItems() { return read(CART_KEY); },

    add(productId, { size, color, qty = 1 } = {}) {
      const items = this.getItems();
      const key = lineKey({ productId, size, color });
      const existing = items.find((i) => lineKey(i) === key);
      if (existing) existing.qty += qty;
      else items.push({ productId, size: size || null, color: color || null, qty });
      write(CART_KEY, items);
      window.dispatchEvent(new CustomEvent("ut:cart-change"));
    },

    updateQty(productId, size, color, qty) {
      let items = this.getItems();
      const key = [productId, size, color].join("::");
      if (qty <= 0) {
        items = items.filter((i) => lineKey(i) !== key);
      } else {
        const item = items.find((i) => lineKey(i) === key);
        if (item) item.qty = qty;
      }
      write(CART_KEY, items);
      window.dispatchEvent(new CustomEvent("ut:cart-change"));
    },

    remove(productId, size, color) {
      this.updateQty(productId, size, color, 0);
    },

    clear() { write(CART_KEY, []); window.dispatchEvent(new CustomEvent("ut:cart-change")); },

    count() { return this.getItems().reduce((sum, i) => sum + i.qty, 0); },

    detailedItems() {
      return this.getItems().map((item) => {
        const product = global.UT_DB.getProduct(item.productId);
        return product ? { ...item, product } : null;
      }).filter(Boolean);
    },

    subtotal() {
      return this.detailedItems().reduce((sum, i) => sum + i.product.price * i.qty, 0);
    },
  };

  const Wishlist = {
    getIds() { return read(WISHLIST_KEY); },
    has(productId) { return this.getIds().includes(productId); },
    toggle(productId) {
      let ids = this.getIds();
      if (ids.includes(productId)) ids = ids.filter((id) => id !== productId);
      else ids.push(productId);
      write(WISHLIST_KEY, ids);
      window.dispatchEvent(new CustomEvent("ut:wishlist-change"));
      return ids.includes(productId);
    },
    products() { return this.getIds().map((id) => global.UT_DB.getProduct(id)).filter(Boolean); },
  };

  global.UT_Cart = Cart;
  global.UT_Wishlist = Wishlist;
})(window);
