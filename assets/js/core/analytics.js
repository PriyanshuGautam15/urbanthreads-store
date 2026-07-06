/**
 * Urban Threads — Lightweight Local Analytics
 * Tracks real events (page views, WhatsApp redirects) as timestamps in
 * localStorage — no mock/random numbers. A fresh browser starts at zero for
 * everything here; admin dashboard reads the same store via UT_Analytics.
 */
(function (global) {
  "use strict";
  const KEY = "ut_analytics";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { pageViews: [], redirects: [] }; }
    catch (e) { return { pageViews: [], redirects: [] }; }
  }
  function write(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

  function trackPageView() {
    const d = read();
    d.pageViews = d.pageViews || [];
    d.pageViews.push(Date.now());
    write(d);
  }

  function trackWhatsappRedirect() {
    const d = read();
    d.redirects = d.redirects || [];
    d.redirects.push(Date.now());
    write(d);
  }

  function bucketByDay(timestamps) {
    const labels = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = timestamps.filter((t) => t >= dayStart.getTime() && t < dayEnd.getTime()).length;
      labels.push(dayStart.toLocaleDateString("en-US", { weekday: "short" }));
      counts.push(count);
    }
    return { labels, counts };
  }

  function getStats() {
    const d = read();
    const pageViews = d.pageViews || [];
    const redirects = d.redirects || [];
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    return {
      totalPageViews: pageViews.length,
      totalRedirects: redirects.length,
      pageViews7d: pageViews.filter((t) => t >= sevenDaysAgo).length,
      redirects7d: redirects.filter((t) => t >= sevenDaysAgo).length,
      pageViewsByDay: bucketByDay(pageViews),
      redirectsByDay: bucketByDay(redirects),
    };
  }

  global.UT_Analytics = { trackPageView, trackWhatsappRedirect, getStats };
})(window);
