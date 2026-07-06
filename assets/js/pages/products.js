/**
 * Urban Threads — Products Listing Controller
 * Client-side filter/sort/search/pagination over the local product DB.
 * URL params (category, filter, view) seed initial state so category tiles
 * and footer/nav links can deep-link straight into a filtered view.
 */
(function () {
  "use strict";
  const PAGE_SIZE = 12;

  const state = {
    categories: new Set(),
    sizes: new Set(),
    maxPrice: 9999,
    search: "",
    sort: "featured",
    page: 1,
    wishlistOnly: false,
  };

  let allProducts = [];
  let priceCeiling = 9999;

  async function init() {
    await window.UT_DB.ready();
    allProducts = window.UT_DB.getProducts().filter((p) => p.published);
    priceCeiling = Math.max(...allProducts.map((p) => p.price), 1000);
    state.maxPrice = priceCeiling;

    const catParam = UT_Utils.getParam("category");
    const filterParam = UT_Utils.getParam("filter");
    const viewParam = UT_Utils.getParam("view");
    if (catParam) state.categories.add(catParam);
    if (viewParam === "wishlist") state.wishlistOnly = true;
    if (filterParam === "new") state.sort = "newest";
    if (filterParam === "bestseller") state.sort = "bestseller";

    renderFilterPanel();
    wireToolbar();
    applyAndRender();

    window.addEventListener("ut:wishlist-change", () => { if (state.wishlistOnly) applyAndRender(); });
  }

  function renderFilterPanel() {
    const categories = window.UT_DB.getCategories().slice().sort((a, b) => a.order - b.order);
    const sizesSet = new Set();
    allProducts.forEach((p) => p.sizes.forEach((s) => sizesSet.add(s)));

    document.getElementById("category-filters").innerHTML = categories.map((c) => {
      const count = allProducts.filter((p) => p.category === c.slug).length;
      return `
        <label class="filter-option">
          <input type="checkbox" value="${c.slug}" ${state.categories.has(c.slug) ? "checked" : ""} data-filter="category">
          ${c.name}<span class="count">${count}</span>
        </label>`;
    }).join("");

    document.getElementById("size-filters").innerHTML = Array.from(sizesSet).map((s) => `
      <button type="button" class="size-pill ${state.sizes.has(s) ? "active" : ""}" data-size-filter="${s}">${s}</button>
    `).join("");

    const priceInput = document.getElementById("price-range-input");
    priceInput.max = priceCeiling;
    priceInput.value = state.maxPrice;
    document.getElementById("price-range-max").textContent = UT_Utils.formatCurrency(state.maxPrice);

    UT_Utils.qsa('[data-filter="category"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        cb.checked ? state.categories.add(cb.value) : state.categories.delete(cb.value);
        state.page = 1;
        applyAndRender();
      });
    });
    UT_Utils.qsa("[data-size-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = btn.dataset.sizeFilter;
        if (state.sizes.has(s)) { state.sizes.delete(s); btn.classList.remove("active"); }
        else { state.sizes.add(s); btn.classList.add("active"); }
        state.page = 1;
        applyAndRender();
      });
    });
    priceInput.addEventListener("input", () => {
      state.maxPrice = Number(priceInput.value);
      document.getElementById("price-range-max").textContent = UT_Utils.formatCurrency(state.maxPrice);
      state.page = 1;
      applyAndRender();
    });

    document.getElementById("clear-filters-btn").addEventListener("click", () => {
      state.categories.clear(); state.sizes.clear(); state.maxPrice = priceCeiling; state.wishlistOnly = false; state.search = "";
      document.getElementById("toolbar-search-input").value = "";
      history.replaceState(null, "", window.location.pathname);
      renderFilterPanel();
      applyAndRender();
    });
  }

  function wireToolbar() {
    const searchInput = document.getElementById("toolbar-search-input");
    searchInput.addEventListener("input", UT_Utils.debounce(() => {
      state.search = searchInput.value.trim().toLowerCase();
      state.page = 1;
      applyAndRender();
    }, 200));

    document.getElementById("sort-select").addEventListener("change", (e) => {
      state.sort = e.target.value;
      applyAndRender();
    });
    document.getElementById("sort-select").value = state.sort;

    const filterToggle = document.getElementById("filter-toggle-btn");
    const panel = document.getElementById("filters-panel");
    if (filterToggle) {
      filterToggle.addEventListener("click", () => panel.classList.add("open"));
      document.getElementById("filters-close-btn").addEventListener("click", () => panel.classList.remove("open"));
    }
  }

  function filteredProducts() {
    let list = state.wishlistOnly ? window.UT_Wishlist.products() : allProducts.slice();
    if (state.categories.size) list = list.filter((p) => state.categories.has(p.category));
    if (state.sizes.size) list = list.filter((p) => p.sizes.some((s) => state.sizes.has(s)));
    list = list.filter((p) => p.price <= state.maxPrice);
    if (state.search) list = list.filter((p) => p.name.toLowerCase().includes(state.search) || p.category.includes(state.search));

    switch (state.sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "newest": list = list.filter((p) => p.isNew).concat(list.filter((p) => !p.isNew)); break;
      case "bestseller": list = list.filter((p) => p.bestSeller).concat(list.filter((p) => !p.bestSeller)); break;
      default: list.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));
    }
    return list;
  }

  function applyAndRender() {
    const list = filteredProducts();
    const total = list.length;
    const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
    state.page = UT_Utils.clamp(state.page, 1, totalPages);
    const pageItems = list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

    document.getElementById("results-count").textContent =
      state.wishlistOnly ? `${total} item${total !== 1 ? "s" : ""} in your wishlist` : `${total} product${total !== 1 ? "s" : ""} found`;
    document.getElementById("products-title").textContent = state.wishlistOnly ? "Your Wishlist" : "All Products";

    renderActiveChips();

    const grid = document.getElementById("products-grid");
    grid.innerHTML = UT_ProductCard.renderGrid(pageItems, "");
    UT_ProductCard.wire(grid, "");

    renderPagination(totalPages);
  }

  function renderActiveChips() {
    const wrap = document.getElementById("active-filters");
    const chips = [];
    state.categories.forEach((c) => chips.push({ label: c.replace("-", " "), remove: () => state.categories.delete(c) }));
    state.sizes.forEach((s) => chips.push({ label: "Size " + s, remove: () => state.sizes.delete(s) }));
    if (state.maxPrice < priceCeiling) chips.push({ label: "Under " + UT_Utils.formatCurrency(state.maxPrice), remove: () => { state.maxPrice = priceCeiling; document.getElementById("price-range-input").value = priceCeiling; document.getElementById("price-range-max").textContent = UT_Utils.formatCurrency(priceCeiling); } });
    if (!chips.length) { wrap.innerHTML = ""; wrap.hidden = true; return; }
    wrap.hidden = false;
    wrap.innerHTML = chips.map((c, i) => `
      <span class="active-filter-chip" data-chip="${i}">${c.label}
        <button aria-label="Remove filter">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>'}</button>
      </span>`).join("");
    wrap.querySelectorAll("[data-chip]").forEach((chipEl, i) => {
      chipEl.querySelector("button").addEventListener("click", () => {
        chips[i].remove();
        renderFilterPanel();
        applyAndRender();
      });
    });
  }

  function renderPagination(totalPages) {
    const el = document.getElementById("pagination");
    if (totalPages <= 1) { el.innerHTML = ""; return; }
    let html = `<button class="page-btn" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Previous page">‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === state.page ? "active" : ""}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="page-btn" data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""} aria-label="Next page">›</button>`;
    el.innerHTML = html;
    el.querySelectorAll("[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.page = Number(btn.dataset.page);
        applyAndRender();
        document.getElementById("products-grid").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
