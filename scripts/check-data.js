// Checks the listing data for contradictions and missing receipts before anything goes live.
//   node scripts/check-data.js
"use strict";
const fs = require("fs");
const path = require("path");
const DATA = require("../data/listings.js");
const CORE = require("../lib/core.js");
const RECEIPTS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "receipts.json"), "utf8"));

const TYPES = new Set(DATA.TYPES.map(t => t[0]));
const KINDS = new Set(["deadline", "opens", "event", "result"]);
const WHO = new Set(["you", "teacher", "advisor", "parent", "friends", "school", "org"]);
const ASK_TO = new Set(["teacher", "parent", "friends", "counsellor"]);
const CAN_K = new Set(["ok", "warn", "no"]);
const ABOUT = new Set(["who", "how", "when", "cost", "team", "why", "detail"]);

const errors = [];
const err = (o, msg) => errors.push(`${o.id || "?"}: ${msg}`);
const isDate = s => /^\d{4}-\d{2}(-\d{2})?$/.test(s) && !isNaN(new Date(s.length === 7 ? s + "-01" : s));
const day = s => new Date(s.length === 7 ? s + "-15" : s);

// Team sizes must only come from team:{min,max} via {team}. Hard-coded numbers drift.
const TEAM_NUMBERS = /(?<!grades?\s)(\d+\s*[–-]\s*\d+|up to (\d+|two|three|four|five|six))\s+(teammates|students|members|people|friends|others)\b|team of \d|teams? of (two|three|four|five|six)/i;
// Messages must take dates from {deadline}/{opens}, never typed by hand.
const TYPED_DATE = /\b(Jan(uary)?|Feb(ruary)?|Mar(ch)?|Apr(il)?|May|June?|July?|Aug(ust)?|Sep(t|tember)?|Oct(ober)?|Nov(ember)?|Dec(ember)?)\.?\s+\d{1,2}\b/;

const ids = new Set(), tks = new Set();
for (const o of DATA.LISTINGS) {
  if (ids.has(o.id)) err(o, "duplicate id");
  ids.add(o.id);
  if (!/^[A-Z]{2,5}$/.test(o.tk || "")) err(o, "ticker must be 2–5 capital letters");
  if (tks.has(o.tk)) err(o, "duplicate ticker");
  tks.add(o.tk);
  for (const f of ["short", "name", "org", "type", "cost", "costShort", "format", "where", "why", "gradeNote"]) {
    if (!o[f] || typeof o[f] !== "string") err(o, `missing ${f}`);
  }
  if (!TYPES.has(o.type)) err(o, `unknown type ${o.type}`);
  if (!o.team && !o.entry) err(o, "needs either team or entry");
  if (o.team && o.entry) err(o, "has both team and entry; entry is generated from team");
  if (o.team && !(o.team.min >= 1 && o.team.max >= o.team.min)) err(o, "team min/max invalid");

  // Grades
  const g = o.grades || [];
  if (!g.length || g.some(x => x < 9 || x > 12)) err(o, "grades must be 9–12");
  if (g.some((x, i) => i && x !== g[i - 1] + 1)) err(o, "grades must be a continuous ascending range");
  if (o.lastGrade && o.lastGrade !== g[g.length - 1]) err(o, "lastGrade must equal the highest grade");

  // Free filter must match the cost text
  if (o.free && !/^free/i.test(o.cost)) err(o, "free:true but cost text doesn't start with 'Free'");
  if (!o.free && /^free\b(?! to apply)/i.test(o.cost)) err(o, "cost says Free but free:false");

  // Dates
  for (const d of o.dates || []) {
    if (!isDate(d.d)) err(o, `bad date ${d.d}`);
    if (!KINDS.has(d.k)) err(o, `bad date kind ${d.k}`);
  }
  for (let i = 1; i < (o.dates || []).length; i++) {
    if (day(o.dates[i].d) < day(o.dates[i - 1].d)) err(o, `dates out of order at ${o.dates[i].d}`);
  }
  const deadlines = new Set((o.dates || []).filter(d => d.k === "deadline").map(d => d.d));

  // Steps
  const steps = o.steps || [];
  if (!steps.length) err(o, "needs at least one step");
  const stepIds = new Set();
  for (const s of steps) {
    if (!s.id || stepIds.has(s.id)) err(o, `step id missing or duplicate: ${s.id}`);
    stepIds.add(s.id);
    if (!isDate(s.by)) err(o, `bad step date ${s.by}`);
    if (!WHO.has(s.who)) err(o, `step ${s.id}: unknown who "${s.who}"`);
    if (s.ask && !(o.asks || {})[s.ask]) err(o, `step ${s.id}: ask "${s.ask}" doesn't exist`);
    if (s.href && !/^https:\/\//.test(s.href)) err(o, `step ${s.id}: link must be https`);
    if (s.official && !deadlines.has(s.by)) err(o, `step ${s.id} is official but ${s.by} isn't a listed deadline`);
    if (/official deadline/i.test(s.t)) err(o, `step ${s.id}: use official:true instead of writing "official deadline"`);
  }
  for (let i = 1; i < steps.length; i++) {
    if (day(steps[i].by) < day(steps[i - 1].by)) err(o, `steps out of order at ${steps[i].by}`);
  }

  // Asks
  const used = new Set(steps.filter(s => s.ask).map(s => s.ask));
  for (const [k, a] of Object.entries(o.asks || {})) {
    if (!used.has(k)) err(o, `ask "${k}" isn't used by any step`);
    if (!ASK_TO.has(a.to)) err(o, `ask "${k}": unknown recipient "${a.to}"`);
    if (!/\{link\}/.test(a.msg || "")) err(o, `ask "${k}": message must include {link}`);
    if ((a.to === "teacher" || a.to === "parent") && !a.subject) err(o, `ask "${k}": asks to a ${a.to} need an email subject`);
    for (const t of [a.title, a.subject, a.hint, a.msg]) if (TYPED_DATE.test(t || "")) err(o, `ask "${k}": typed date in "${(t.match(TYPED_DATE) || [])[0]}". Use {deadline} or {opens}`);
  }

  // Window and status
  if (o.window) {
    if (!isDate(o.window.to)) err(o, "window.to invalid");
    if (!deadlines.has(o.window.to)) err(o, "window.to must match a deadline in dates");
    if (o.window.from && day(o.window.from) > day(o.window.to)) err(o, "window.from is after window.to");
    if (!o.boardWhat) err(o, "open listings need boardWhat (what the deadline is)");
  }
  if (!o.window && !o.next) err(o, "needs window or next");
  if (o.next && !isDate(o.next.d)) err(o, "next.d invalid");

  // Can I do this?
  if (!Array.isArray(o.can) || o.can.length < 1 || o.can.length > 4) err(o, "can needs 1–4 rows");
  for (const c of o.can || []) if (!CAN_K.has(c.k) || !c.t) err(o, `can row invalid: ${JSON.stringify(c)}`);
  if (!Array.isArray(o.parent) || !o.parent.length) err(o, "parent needs at least one item");

  // Hard-coded team numbers anywhere in free text
  const texts = [o.cost, o.costShort, o.format, o.where, o.why, o.gradeNote, o.entry || "", o.aid || "",
    ...(o.can || []).flatMap(c => [c.t, c.s]), ...steps.flatMap(s => [s.t, s.note || ""]),
    ...(o.dates || []).map(d => d.t), ...(o.parent || []).flatMap(p => [p.t, p.s]),
    ...Object.values(o.asks || {}).flatMap(a => [a.title, a.hint, a.msg])];
  for (const t of texts) {
    if (TEAM_NUMBERS.test(t || "")) err(o, `hard-coded team size in "${t}". Use team:{min,max} and {team}`);
    if (/\{team\}/.test(t || "") && !o.team) err(o, `uses {team} but has no team field: "${t}"`);
  }

  if (!o.src || !/^https:\/\//.test(o.src.url)) err(o, "source url must be https");
  if (!["organizer", "partial", "third"].includes(o.src && o.src.kind)) err(o, "src.kind invalid");

  // Receipts: no fact without the organizer's own sentence behind it (data/receipts.json)
  const rc = RECEIPTS[o.id] || [];
  const need = ["who", "how", "when"];
  if (o.team) need.push("team");
  if (!/not (listed|posted)|no entry fee is listed|fee tba/i.test(o.cost)) need.push("cost");
  for (const a of need) {
    if (!rc.some(r => r.about === a)) err(o, `no receipt for "${a}". Add the organizer's exact sentence to data/receipts.json`);
  }
  for (const r of rc) {
    if (!ABOUT.has(r.about)) err(o, `receipt has unknown about "${r.about}"`);
    if (!/^https:\/\//.test(r.url || "") || !(r.quote || "").trim()) err(o, "receipt needs an https url and a quote");
    if (r.manual && !/^\d{4}-\d{2}-\d{2}$/.test(r.checked || "")) err(o, "hand-checked receipt needs a checked date");
  }
}
for (const id of Object.keys(RECEIPTS)) if (id !== "_about" && !ids.has(id)) errors.push(`receipts.json has "${id}" but no listing uses it`);

// Every token must resolve
try { CORE.prepare(DATA, "https://example.org"); } catch (e) { errors.push(e.message); }

if (errors.length) {
  console.error(`${errors.length} problem(s) found:\n- ` + errors.join("\n- "));
  process.exit(1);
}
console.log(`OK: ${DATA.LISTINGS.length} listings, no contradictions found, every fact has a receipt.`);
