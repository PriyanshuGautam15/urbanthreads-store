/**
 * Urban Threads — Storefront Bootstrap
 * Every store page sets <body data-page="..." data-base="..."> and includes
 * this last. Renders the shared header/footer so nav markup lives in one place.
 */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", async () => {
    const page = document.body.dataset.page || "";
    const base = document.body.dataset.base || "";
    await window.UT_DB.ready();
    const settings = window.UT_DB.getSettings();
    if (settings.primaryColor) document.documentElement.style.setProperty("--brand-black", settings.primaryColor);
    if (settings.secondaryColor) document.documentElement.style.setProperty("--brand-accent-500", settings.secondaryColor);
    UT_Header.render(page, base);
    UT_Footer.render(base);
    if (window.UT_Analytics) UT_Analytics.trackPageView();
    document.querySelectorAll(".product-grid").forEach((grid) => UT_ProductCard.wire(grid, base));
    document.querySelectorAll(".stat-counter").forEach((el) => UT_Utils.animateCount(el, Number(el.dataset.target)));
    document.body.classList.add("page-enter");
  });
})();
