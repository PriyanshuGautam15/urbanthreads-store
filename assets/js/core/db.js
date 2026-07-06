/**
 * Urban Threads — Sanity-backed "Database" Facade
 * Every page still talks to window.UT_DB exactly as before — same method
 * names, same shapes. Internally, content now comes from Sanity via one
 * combined GROQ query fetched once and cached in memory (see UT_Sanity in
 * sanity-client.js), instead of localStorage. Call UT_DB.ready() before
 * reading anything; db.js kicks the fetch off immediately at script-load
 * time so it overlaps with the rest of the page loading.
 */
(function (global) {
  "use strict";

  const DEFAULT_SETTINGS = {
    storeName: "Urban Threads",
    whatsappNumber: "918815024714",
    primaryColor: "#0a0a0c",
    secondaryColor: "#4c86f0",
    footerText: "© " + new Date().getFullYear() + " Urban Threads. All rights reserved.",
    social: {
      instagram: "https://instagram.com/urbanthreads",
      facebook: "https://facebook.com/urbanthreads",
      twitter: "https://twitter.com/urbanthreads",
      youtube: "https://youtube.com/@urbanthreads",
    },
    freeDeliveryThreshold: 2999,
    deliveryFee: 149,
  };

  const QUERY = `{
    "products": *[_type == "product"]{
      "id": _id,
      "slug": slug.current,
      "name": title,
      "category": category->slug.current,
      price,
      "mrp": originalPrice,
      sku,
      stock,
      rating,
      "reviewCount": totalReviews,
      sizes,
      "colors": colors[]{name, hex},
      "images": images[].image.asset->url,
      shortDescription,
      "description": pt::text(fullDescription),
      featured,
      published,
      isNew,
      bestSeller,
      "seoTitle": seo.title,
      "seoDescription": seo.description,
      "reviews": reviews[]{author, rating, title, comment, date, verified}
    },
    "categories": *[_type == "category"] | order(order asc) {
      "id": _id,
      "slug": slug.current,
      "name": title,
      description,
      "image": image.image.asset->url,
      order
    },
    "homepage": *[_id == "homepage"][0]{
      "hero": {
        "eyebrow": hero.eyebrow,
        "heading": hero.heading,
        "subheading": hero.subheading,
        "image": hero.image.image.asset->url,
        "ctaText": hero.ctaText,
        "ctaLink": hero.ctaLink
      },
      "promoBanner": promotionalBanner->{
        eyebrow, title, subtitle, buttonText, buttonLink, active,
        "image": image.image.asset->url
      }
    },
    "storeSettings": *[_id == "storeSettings"][0]{
      storeName,
      whatsappNumber,
      primaryColor,
      secondaryColor,
      footerText,
      "social": { instagram, facebook, twitter, youtube },
      freeDeliveryThreshold,
      deliveryFee
    },
    "testimonials": *[_type == "testimonial"]{
      "author": customerName,
      "image": image.image.asset->url,
      "comment": review,
      rating,
      "date": _createdAt
    }
  }`;

  const cache = {
    products: [],
    categories: [],
    settings: DEFAULT_SETTINGS,
    homepage: null,
    testimonials: [],
  };

  async function bootstrap() {
    const data = await global.UT_Sanity.fetchQuery(QUERY);
    cache.products = data.products || [];
    cache.categories = data.categories || [];
    cache.settings = data.storeSettings
      ? { ...data.storeSettings, whatsappNumber: (data.storeSettings.whatsappNumber || "").replace(/^\+/, "") }
      : DEFAULT_SETTINGS;
    cache.homepage = data.homepage || null;
    cache.testimonials = data.testimonials || [];
  }

  // Kick the fetch off now, at script-evaluation time, so it overlaps with
  // the rest of the page's scripts loading rather than waiting for DOMContentLoaded.
  const readyPromise = bootstrap().catch((err) => {
    console.error("UT_DB bootstrap failed — falling back to empty content", err);
  });

  const DB = {
    ready() { return readyPromise; },

    // ---------- Products ----------
    getProducts() { return cache.products; },
    getProduct(idOrSlug) {
      return cache.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
    },

    // ---------- Categories ----------
    getCategories() { return cache.categories; },
    getCategory(idOrSlug) {
      return cache.categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
    },

    // ---------- Reviews / Testimonials ----------
    getReviews(productId) {
      if (productId) {
        const p = this.getProduct(productId);
        return p ? (p.reviews || []) : [];
      }
      // No-arg call (home.js's "Customer Reviews" rail): sourced from the
      // dedicated testimonial documents, not per-product reviews.
      return cache.testimonials.map((t) => ({ ...t, verified: true }));
    },
    addReview(review) {
      // No write path from the browser to Sanity (by design — content is
      // managed in Studio). This is an optimistic, in-memory-only update so
      // the "write a review" form still behaves the same within the session.
      const p = this.getProduct(review.productId);
      if (!p) return null;
      const entry = { ...review, date: new Date().toISOString().slice(0, 10) };
      p.reviews = p.reviews || [];
      p.reviews.unshift(entry);
      p.reviewCount = (p.reviewCount || 0) + 1;
      return entry;
    },

    // ---------- Settings ----------
    getSettings() { return cache.settings; },

    // ---------- Homepage content (hero / promo banner) ----------
    getHomepage() { return cache.homepage; },
  };

  global.UT_DB = DB;
})(window);
