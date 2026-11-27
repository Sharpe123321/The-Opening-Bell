// Re-reads every organizer page in data/receipts.json and checks that each quoted
// sentence is still there. If a sentence changed or disappeared, the listing needs
// a human re-check before anyone relies on it.
//
//   node scripts/verify-sources.js
//
// Exit code 1 means something changed (or a page couldn't be read), so a scheduled
// run fails loudly instead of silently showing stale facts.
"use strict";
const fs = require("fs");
const path = require("path");

const receipts = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "receipts.json"), "utf8"));

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"',
  ndash: "-", mdash: "-", hellip: "...", eacute: "é", egrave: "è", ccedil: "ç", rarr: "→" };
function decode(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in NAMED ? NAMED[n.toLowerCase()] : m));
}
function pageText(html) {
  return decode(html.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " "));
}
function norm(s) {
  return s.toLowerCase()
    .replace(/[‘’‛′]/g, "'").replace(/[“”″]/g, '"')
    .replace(/[‐-―−]/g, "-").replace(/ /g, " ")
    .replace(/\s+/g, " ").replace(/ ([:;,.!?])/g, "$1").trim();
}

// Some sites answer automated readers with a bot check instead of the page. SiteGround,
// for one, sends HTTP 202 and a tiny captcha redirect. Anything but a 200 is reported as
// unreadable, never as changed quotes, so nobody rewrites a quote that's still on the page.
async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en-CA,en;q=0.9" }, redirect: "follow" });
  if (res.status !== 200) throw new Error(res.headers.get("sg-captcha") ? `bot check instead of the page, HTTP ${res.status}` : `HTTP ${res.status}`);
  return norm(pageText(await res.text()));
}

(async () => {
  const urls = new Set();
  for (const [id, list] of Object.entries(receipts)) if (id !== "_about") for (const r of list) if (!r.manual) urls.add(r.url);

  const pages = {};
  await Promise.all([...urls].map(async (u) => {
    try { pages[u] = await fetchText(u); } catch (e) { pages[u] = { error: e.message }; }
  }));

  let changed = 0, unreadable = 0, ok = 0, manual = 0;
  const lines = [];
  // A page can come back partial, so a missing quote gets its page fetched again: twice per
  // page at most, not per quote, so a page with many changed quotes doesn't set off a burst
  // of requests that trips the site's bot check.
  const refetches = {};
  for (const [id, list] of Object.entries(receipts)) {
    if (id === "_about") continue;
    for (const r of list) {
      if (r.manual) { manual++; continue; }
      const page = pages[r.url];
      if (page && page.error) { unreadable++; lines.push(`  ? ${id}: couldn't read ${r.url} (${page.error})`); continue; }
      if (page.includes(norm(r.quote))) { ok++; continue; }
      let retried = "";
      while ((refetches[r.url] || 0) < 2 && !retried.includes(norm(r.quote))) {
        refetches[r.url] = (refetches[r.url] || 0) + 1;
        await new Promise((res) => setTimeout(res, 3000));
        try { retried = await fetchText(r.url); } catch (e) { retried = ""; }
      }
      if (retried.includes(norm(r.quote))) { pages[r.url] = retried; ok++; continue; }
      changed++;
      lines.push(`  ✗ ${id} [${r.about}]: "${r.quote}"\n      no longer found on ${r.url}`);
    }
  }
  console.log(`Source check: ${ok} still match, ${changed} changed, ${unreadable} unreadable, ${manual} checked by hand.`);
  if (lines.length) console.log(lines.join("\n"));
  if (changed || unreadable) {
    console.log("\nRe-check the listings above against the organizer's site before trusting them.");
    process.exit(1);
  }
})();
