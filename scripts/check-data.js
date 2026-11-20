// Checks the listing data in index.html for contradictions and mistakes.
// Run before every push:  node scripts/check-data.js
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const m = /var DATA = (\[[\s\S]*?\n  \]);/.exec(html);
if (!m) { console.error("Couldn't find the DATA array in index.html"); process.exit(1); }
const DATA = vm.runInNewContext(m[1]);
const RECEIPTS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "receipts.json"), "utf8"));
const TYPES = new Set(["case", "pitch", "invest", "math", "summer", "deca", "venture"]);
const KINDS = new Set(["deadline", "opens", "event", "result"]);

const errors = [];
const err = (o, msg) => errors.push(`${o.id || "?"}: ${msg}`);
const isDate = s => /^\d{4}-\d{2}(-\d{2})?$/.test(s) && !isNaN(new Date(s.length === 7 ? s + "-01" : s));
const day = s => new Date(s.length === 7 ? s + "-15" : s);

// Team sizes must only come from team:{min,max} via {team}. Hard-coded numbers drift.
const TEAM_NUMBERS = /(?<!grades?\s)(\d+\s*[–-]\s*\d+|up to (\d+|two|three|four|five|six))\s+(teammates|students|members|people|friends|others)\b|team of \d|teams? of (two|three|four|five|six)/i;

const ids = new Set();
for (const o of DATA) {
  if (ids.has(o.id)) err(o, "duplicate id");
  ids.add(o.id);
  for (const f of ["short", "name", "org", "type", "cost", "format", "where", "why", "tip"]) {
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
  const steps = o.steps || [];
  if (!steps.length) err(o, "needs at least one step");
  for (const s of steps) if (!isDate(s.by)) err(o, `bad step date ${s.by}`);
  for (let i = 1; i < steps.length; i++) {
    if (day(steps[i].by) < day(steps[i - 1].by)) err(o, `steps out of order at ${steps[i].by}`);
  }

  // Window and status
  if (o.window) {
    if (!isDate(o.window.to)) err(o, "window.to invalid");
    if (!(o.dates || []).some(d => d.d === o.window.to && d.k === "deadline")) err(o, "window.to must match a deadline in dates");
    if (o.window.from && day(o.window.from) > day(o.window.to)) err(o, "window.from is after window.to");
  }
  if (!o.window && !o.next) err(o, "needs window or next");

  // A step marked as the official deadline must match a listed deadline
  for (const s of steps) {
    if (/official deadline/i.test(s.t) && !(o.dates || []).some(d => d.d === s.by && d.k === "deadline")) {
      err(o, `step "${s.t}" says official deadline but ${s.by} isn't a listed deadline`);
    }
  }

  // Team numbers must not be hard-coded anywhere in free text
  const texts = [o.cost, o.format, o.where, o.why, o.tip, o.gradeNote || "", o.entry || "",
    ...(o.requires || []), ...steps.map(s => s.t), ...(o.dates || []).map(d => d.t)];
  for (const t of texts) {
    if (TEAM_NUMBERS.test(t)) err(o, `hard-coded team size in "${t}". Use team:{min,max} and {team}`);
    if (/\{team\}/.test(t) && !o.team) err(o, `uses {team} but has no team field: "${t}"`);
  }

  if (!o.src || !/^https:\/\//.test(o.src.url)) err(o, "source url must be https");
  if (!["organizer", "partial", "third"].includes(o.src && o.src.kind)) err(o, "src.kind invalid");
  if (o.src && o.src.kind === "partial" && !o.src.note) err(o, "partial source needs a note");

  // Receipts: no fact without the organizer's own sentence behind it (data/receipts.json)
  const rc = RECEIPTS[o.id] || [];
  const need = ["who", "how", "when"];
  if (o.team) need.push("team");
  if (!/not (listed|posted)|no entry fee is listed|fee tba/i.test(o.cost)) need.push("cost");
  for (const a of need) {
    if (!rc.some(r => r.about === a)) err(o, `no receipt for "${a}". Add the organizer's exact sentence to data/receipts.json`);
  }
  for (const r of rc) {
    if (!/^https:\/\//.test(r.url || "") || !(r.quote || "").trim()) err(o, "receipt needs an https url and a quote");
    if (r.manual && !/^\d{4}-\d{2}-\d{2}$/.test(r.checked || "")) err(o, "hand-checked receipt needs a checked date");
  }
}
for (const id of Object.keys(RECEIPTS)) if (id !== "_about" && !ids.has(id)) errors.push(`receipts.json has "${id}" but no listing uses it`);

if (errors.length) {
  console.error(`${errors.length} problem(s) found:\n- ` + errors.join("\n- "));
  process.exit(1);
}
console.log(`OK: ${DATA.length} listings, no contradictions found.`);
