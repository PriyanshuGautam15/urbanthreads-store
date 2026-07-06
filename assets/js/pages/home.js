/**
 * Urban Threads — Home Page Controller
 */
(function () {
  "use strict";

  const ICONS = {
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0114.5-4.3L23 9M1 15l4.9 4.3A9 9 0 0020.5 15"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M8.2 13.5L7 22l5-3 5 3-1.2-8.5"/></svg>',
    insta: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  };

  async function init() {
    await window.UT_DB.ready();
    const base = "";
    const products = window.UT_DB.getProducts().filter((p) => p.published);
    const categories = window.UT_DB.getCategories().slice().sort((a, b) => a.order - b.order);
    const reviews = window.UT_DB.getReviews();

    renderHero();
    renderPromoBanner();
    renderCategories(categories, base);
    renderRail("trending-grid", products.filter((p) => p.featured).slice(0, 4), base);
    renderRail("new-arrivals-grid", products.filter((p) => p.isNew).slice(0, 4), base);
    renderRail("bestsellers-grid", products.filter((p) => p.bestSeller).slice(0, 4), base);
    renderWhyUs();
    renderReviews(reviews);
    renderInstagram(products);
    wireNewsletter();
  }

  function renderHero() {
    const hp = window.UT_DB.getHomepage();
    const hero = hp && hp.hero;
    const bg = document.getElementById("hero-bg");
    if (bg) bg.style.backgroundImage = `url('${(hero && hero.image) || "https://picsum.photos/seed/ut-hero/1800/1200"}')`;
    if (!hero) return;
    const content = document.querySelector(".hero-content");
    if (!content) return;
    if (hero.eyebrow) content.querySelector(".eyebrow").textContent = hero.eyebrow;
    if (hero.heading) content.querySelector("h1").innerHTML = hero.heading.replace(/\n/g, "<br>");
    if (hero.subheading) content.querySelector("p:not(.eyebrow)").textContent = hero.subheading;
  }

  function renderPromoBanner() {
    const hp = window.UT_DB.getHomepage();
    const banner = hp && hp.promoBanner;
    if (!banner || banner.active === false) return;
    const section = document.querySelector(".promo-banner");
    if (!section) return;
    section.querySelector(".promo-banner-bg").style.backgroundImage = `url('${banner.image}')`;
    const content = section.querySelector(".promo-banner-content");
    if (banner.eyebrow) content.querySelector(".eyebrow").textContent = banner.eyebrow;
    if (banner.title) content.querySelector("h2").textContent = banner.title;
    if (banner.subtitle) content.querySelector("p:not(.eyebrow)").textContent = banner.subtitle;
    const cta = content.querySelector("a.btn");
    if (banner.buttonText) cta.textContent = banner.buttonText;
    if (banner.buttonLink) cta.setAttribute("href", banner.buttonLink);
  }

  function renderCategories(categories, base) {
    const grid = document.getElementById("category-grid");
    if (!grid) return;
    grid.innerHTML = categories.map((c) => `
      <a href="${base}products.html?category=${c.slug}" class="cat-card">
        <img src="${c.image}" alt="${c.name}" loading="lazy">
        <span class="cat-card-label">${c.name}</span>
      </a>`).join("");
  }

  function renderRail(id, products, base) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = UT_ProductCard.renderGrid(products, base);
    UT_ProductCard.wire(el, base);
  }

  function renderWhyUs() {
    const grid = document.getElementById("why-us-grid");
    if (!grid) return;
    const items = [
      { icon: "truck", title: "Free Express Shipping", desc: "On all orders over ₹2,999, delivered in 2-4 business days." },
      { icon: "shield", title: "Secure Checkout", desc: "Your data is protected with industry-standard encryption." },
      { icon: "refresh", title: "Easy 30-Day Returns", desc: "Not the right fit? Return or exchange, no questions asked." },
      { icon: "award", title: "Premium Craftsmanship", desc: "Every piece is quality-checked before it reaches your door." },
    ];
    grid.innerHTML = items.map((i) => `
      <div class="why-card card card-hover">
        <div class="why-icon">${ICONS[i.icon]}</div>
        <h3>${i.title}</h3>
        <p>${i.desc}</p>
      </div>`).join("");
  }

  function renderReviews(reviews) {
    const rail = document.getElementById("reviews-rail");
    if (!rail) return;
    const top = reviews.filter((r) => r.rating >= 4).slice(0, 6);
    rail.innerHTML = top.slice(0, 3).map((r) => `
      <div class="review-card card card-hover">
        ${UT_Utils.starsSvg(r.rating, 15)}
        <p class="review-body">"${UT_Utils.escapeHtml(r.comment)}"</p>
        <div class="review-author">
          <div class="review-avatar">${r.author.charAt(0)}</div>
          <div>
            <p class="review-author-name">${r.author}</p>
            <p class="review-author-meta">${r.verified ? "Verified Buyer" : "Customer"} · ${UT_Utils.formatDate(r.date)}</p>
          </div>
        </div>
      </div>`).join("");
  }

  function renderInstagram(products) {
    const grid = document.getElementById("insta-grid");
    if (!grid) return;
    const shots = products.slice(0, 12);
    grid.innerHTML = shots.map((p) => `
      <a href="#" class="insta-item" aria-label="View on Instagram" onclick="return false">
        <img src="${p.images[0]}" alt="" loading="lazy">
        ${ICONS.insta}
      </a>`).join("");
  }

  function wireNewsletter() {
    const form = document.getElementById("home-newsletter-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      UT_Toast.show({ type: "success", title: "Welcome to Urban Threads", message: "Check your inbox for your 10% off code." });
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
