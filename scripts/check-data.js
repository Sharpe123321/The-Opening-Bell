// Checks the listing data for contradictions and missing receipts before anything goes live.
//   node scripts/check-data.js
"use strict";
const fs = require("fs");
const path = require("path");
const DATA = require("../data/listings.js");
const CORE = require("../lib/core.js");
const RECEIPTS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "receipts.json"), "utf8"));

const TYPES = new Set(DATA.TYPES.map(t => t[0]));
// "last" = last year's date, shown with its year when this year's isn't posted. Never projected forward.
const KINDS = new Set(["deadline", "opens", "event", "result", "last"]);
const WHO = new Set(["you", "teacher", "advisor", "parent", "friends", "school", "org"]);
const ASK_TO = new Set(["teacher", "parent", "friends", "counsellor"]);
const CAN_K = new Set(["ok", "warn", "no"]);
const ABOUT = new Set(["who", "how", "when", "cost", "team", "why", "detail"]);

const errors = [];
const err = (o, msg) => errors.push(`${o.id || "?"}: ${msg}`);
const isDate = s => /^\d{4}-\d{2}(-\d{2})?$/.test(s) && !isNaN(new Date(s.length === 7 ? s + "-01" : s));
// "tba" = a step whose date the organizer hasn't posted. It sorts last.
const day = s => (s === "tba" ? new Date(8.64e15) : new Date(s.length === 7 ? s + "-15" : s));
// Same normalizing as verify-sources.js, so a quote matches whatever quote marks or dashes it uses.
const norm = s => String(s).toLowerCase().replace(/[‘’‛′]/g, "'").replace(/[“”″]/g, '"').replace(/[‐-―−]/g, "-").replace(/\s+/g, " ").replace(/ ([:;,.!?])/g, "$1").trim();
const words = s => String(s || "").split(/\s+/).filter(Boolean).length;
// Descriptions stay short so students actually read them.
const ABOUT_LIMIT = { is: 45, line: 22, total: 135 };

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
  for (const f of ["short", "name", "org", "type", "what", "cost", "costShort", "where", "gradeNote"]) {
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
  for (const d of o.dates || []) if (d.k === "last" && !(day(d.d) < day(DATA.CHECKED))) err(o, `"last" date ${d.d} isn't before the checked date`);

  // No estimates: say what the organizer says (tba, soon, round), and show last year's dates as last year's
  for (const x of [o.next, ...(o.steps || []), ...(o.dates || [])]) if (x && x.est) err(o, `estimated date (est) at ${x.d || x.by}. Use what the organizer posted, or tba/soon, and put last year's date in a note or a "last" date`);
  const deadlines = new Set((o.dates || []).filter(d => d.k === "deadline").map(d => d.d));

  // Steps
  const steps = o.steps || [];
  if (!steps.length) err(o, "needs at least one step");
  const stepIds = new Set();
  for (const s of steps) {
    if (!s.id || stepIds.has(s.id)) err(o, `step id missing or duplicate: ${s.id}`);
    stepIds.add(s.id);
    if (!isDate(s.by) && s.by !== "tba") err(o, `bad step date ${s.by}`);
    if (s.by === "tba" && s.official) err(o, `step ${s.id}: an official step needs the organizer's date, not tba`);
    if (!WHO.has(s.who)) err(o, `step ${s.id}: unknown who "${s.who}"`);
    if (s.ask && !(o.asks || {})[s.ask]) err(o, `step ${s.id}: ask "${s.ask}" doesn't exist`);
    if (s.href && !/^https:\/\//.test(s.href)) err(o, `step ${s.id}: link must be https`);
    if (s.official && !deadlines.has(s.by)) err(o, `step ${s.id} is official but ${s.by} isn't a listed deadline`);
    if (/official deadline/i.test(s.t)) err(o, `step ${s.id}: use official:true instead of writing "official deadline"`);
  }
  // Dated steps stay in date order. A tba step can sit where it belongs in the sequence.
  const dated = steps.filter(s => s.by !== "tba");
  for (let i = 1; i < dated.length; i++) {
    if (day(dated[i].by) < day(dated[i - 1].by)) err(o, `steps out of order at ${dated[i].by}`);
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
  if (o.window && o.window.ongoing) {
    // Open now with no closing date posted
    if (o.window.to) err(o, "window.ongoing can't have a closing date (to)");
    if (!o.boardWhat) err(o, "open listings need boardWhat (where or what is open)");
  } else if (o.window) {
    if (!isDate(o.window.to)) err(o, "window.to invalid");
    const events = new Set((o.dates || []).filter(d => d.k === "event").map(d => d.d));
    if (!deadlines.has(o.window.to) && !(o.window.round && events.has(o.window.to))) err(o, "window.to must match a deadline in dates (or, with round:true, the round's event date)");
    if (o.window.from && day(o.window.from) > day(o.window.to)) err(o, "window.from is after window.to");
    if (!o.boardWhat) err(o, "open listings need boardWhat (what the deadline is)");
  }
  if (!o.window && !o.next) err(o, "needs window or next");
  if (o.next) {
    if (o.next.soon ? (o.next.d && !isDate(o.next.d)) : !isDate(o.next.d)) err(o, "next.d invalid");
    if (o.next.round && (o.next.tba || o.next.soon)) err(o, "next.round needs the organizer's date, so it can't be tba or soon");
    if (!o.next.label) err(o, "next needs a label");
  }

  // Can I do this?
  if (!Array.isArray(o.can) || o.can.length < 1 || o.can.length > 4) err(o, "can needs 1–4 rows");
  for (const c of o.can || []) if (!CAN_K.has(c.k) || !c.t) err(o, `can row invalid: ${JSON.stringify(c)}`);
  if (!Array.isArray(o.parent) || !o.parent.length) err(o, "parent needs at least one item");

  // Description: what it is, what you'll do, why it's worth it. Short, and every line rests on the organizer's words.
  const ab = o.about, aboutLines = [];
  if (!ab || !ab.is || !Array.isArray(ab.do) || !Array.isArray(ab.why)) err(o, "needs about: { is, do, why }");
  else {
    if (ab.do.length < 2 || ab.do.length > 3) err(o, "about.do needs 2–3 lines");
    if (ab.why.length < 2 || ab.why.length > 3) err(o, "about.why needs 2–3 lines");
    const all = [ab.is].concat(ab.do, ab.why);
    const rcq = (RECEIPTS[o.id] || []).map(r => norm(r.quote));
    for (const x of all) {
      if (!x || typeof x.t !== "string" || !x.t.trim()) { err(o, "every about line needs text (t)"); continue; }
      aboutLines.push(x.t);
      if (x !== ab.is && words(x.t) > ABOUT_LIMIT.line) err(o, `about line is ${words(x.t)} words, limit ${ABOUT_LIMIT.line}: "${x.t}"`);
      if (!Array.isArray(x.q) || !x.q.length) err(o, `about line has no organizer quote (q): "${x.t}"`);
      for (const q of x.q || []) if (!rcq.some(r => r.includes(norm(q)))) err(o, `about quote isn't in receipts.json: "${q}"`);
    }
    if (words(ab.is.t) > ABOUT_LIMIT.is) err(o, `about.is is ${words(ab.is.t)} words, limit ${ABOUT_LIMIT.is}`);
    const total = aboutLines.reduce((n, t) => n + words(t), 0);
    if (total > ABOUT_LIMIT.total) err(o, `description is ${total} words, limit ${ABOUT_LIMIT.total}`);
  }

  // Hard-coded team numbers anywhere in free text
  const texts = [o.what, o.cost, o.costShort, o.where, o.gradeNote, o.entry || "", o.aid || "", ...aboutLines,
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
