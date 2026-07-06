/**
 * Urban Threads — Minimal Sanity GROQ Client
 * Zero dependencies: hits Sanity's public query REST endpoint directly with
 * fetch(). The dataset is public-read, so no API token is needed here — only
 * the one-off migration script (run via the Studio CLI) needs write access.
 */
(function (global) {
  "use strict";

  const PROJECT_ID = "zrwwcmks";
  const DATASET = "production";
  const API_VERSION = "2024-01-01";

  function buildQueryUrl(query) {
    return `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  }

  async function fetchQuery(query) {
    const res = await fetch(buildQueryUrl(query));
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Sanity query failed (${res.status}): ${body}`);
    }
    const json = await res.json();
    return json.result;
  }

  global.UT_Sanity = { fetchQuery, buildQueryUrl, PROJECT_ID, DATASET, API_VERSION };
})(window);
