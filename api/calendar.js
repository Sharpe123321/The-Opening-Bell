// Calendar feed: /api/calendar?l=shad,diamond[&for=parent]
// Calendar apps subscribe to this link and re-check it, so when a listing's dates change in
// data/listings.js, the events move in everyone's calendar. The link holds only listing ids:
// no names, no emails, nothing about the person.
"use strict";
const DATA = require("../data/listings.js");
const CORE = require("../lib/core.js");

const KNOWN = new Set(DATA.LISTINGS.map(o => o.id));
// Bumped whenever the data is re-checked, so calendar apps know events may have changed.
const SEQUENCE = Math.max(0, Math.round((Date.parse(DATA.CHECKED) - Date.parse("2026-01-01")) / 86400000));

module.exports = (req, res) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "opening-bell-two.vercel.app";
  const proto = req.headers["x-forwarded-proto"] || (/^localhost|^127\./.test(host) ? "http" : "https");
  const url = new URL(req.url, proto + "://" + host);
  const ids = [...new Set((url.searchParams.get("l") || "").split(",").map(s => s.trim()).filter(id => KNOWN.has(id)))].slice(0, 20);
  if (!ids.length) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("This calendar link doesn't include any Cluedrop listings.");
  }
  const forParent = url.searchParams.get("for") === "parent";
  const all = CORE.prepare(DATA, proto + "://" + host);
  const listings = ids.map(id => all.find(o => o.id === id));
  const body = CORE.ics(listings, { name: forParent ? "Cluedrop · Your teen's season" : "Cluedrop", sequence: SEQUENCE });
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'inline; filename="cluedrop.ics"');
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  res.end(body);
};
