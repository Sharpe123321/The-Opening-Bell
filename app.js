/* Afterbell: what to do after the bell. Business competitions and programs for Ontario high school students.
 * Two tabs: Explore (every activity as a card) and Saved (what to do next for each one you saved).
 * Each activity has its own page at /l/<id>. No framework and no build step. Every listing fact comes
 * from data/listings.js and every date and wording rule from lib/core.js.
 */
(function () {
  "use strict";
  const D = window.OB_DATA, C = window.OB_CORE;
  const REPORT_EMAIL = null; /* set an address to show "Report a mistake" on every listing */

  const NOW = C.today();
  const L = C.prepare(D, location.origin);
  const BY = {};
  L.forEach(o => { BY[o.id] = o; o._s = C.status(o, NOW); });
  L.sort((a, b) => a._s.rank - b._s.rank || a._s.n - b._s.n);

  /* ---------- Small helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem("ob:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("ob:" + k, JSON.stringify(v)); } catch (e) {} }
  };
  const state = {
    grade: store.get("grade", null), filter: "all", query: "", allGrades: false,
    picks: (store.get("picks", []) || []).filter(id => BY[id]),
    done: store.get("done", {}) || {}
  };
  if (![9, 10, 11, 12].includes(state.grade)) state.grade = null;

  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const WDL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const ASK_TO = { teacher: "A teacher", parent: "A parent or other adult", friends: "Your friends", counsellor: "Your counsellor" };
  const WHO = { teacher: "A teacher does this", advisor: "Your advisor does this", parent: "A parent or adult does this", friends: "Your team does this", school: "Your school does this", org: "The organizer does this" };
  const MARK = { ok: "✓", warn: "!", no: "✕" };
  const COMPETITIONS = ["pitch", "deca", "case", "invest", "math"], PROGRAMS = ["summer", "venture"];
  const FILTERS = [["all", "All"], ["comp", "Competitions"], ["prog", "Programs"], ["free", "Free"], ["saved", "Saved"]];

  const I = {
    explore: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    list: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/></svg>',
    listOn: '<svg class="ic fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/></svg>',
    back: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    share: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v11M8 7.5l4-4 4 4"/><path d="M6 11.5H5v9h14v-9h-1"/></svg>',
    down: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    check: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    close: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    sun: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>',
    moon: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
  };

  let toastTimer;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 4200); }
  const eligible = o => !state.grade || o.grades.includes(state.grade);
  const picked = id => state.picks.includes(id);
  const key = (o, s) => o.id + ":" + s.id;
  const mine = s => s.who === "you" || !!s.ask;
  const md = d => C.MON[d.getMonth()] + " " + d.getDate();
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const domain = u => u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
  const urgency = n => (n <= 7 ? "r" : n <= 30 ? "o" : "");
  const officialUrl = o => (o.steps.filter(s => s.href)[0] || {}).href || o.src.url;
  function dayText(s) {
    const d = C.parse(s.by);
    if (C.isMonth(s.by)) return (s.est ? "~" : "") + MONTH[d.getMonth()] + " " + d.getFullYear();
    return (s.est ? "around " : WDL[d.getDay()] + ", ") + MONTH[d.getMonth()] + " " + d.getDate();
  }
  function costTag(o) {
    const c = o.costShort.split(" · ")[0];
    if (c === "Not listed") return "Fee not listed";
    return c.length > 28 ? c.split(", ")[0] : c;
  }
  function teamTag(o) {
    const t = o.team; if (!t) return "";
    if (t.assigned) return "Placed on a team";
    return t.min === 1 ? "Solo or team of up to " + t.max : "Team of " + t.min + "–" + t.max;
  }

  /* ---------- Theme: dark unless the visitor switched to light ---------- */
  function themeButton() {
    const light = document.documentElement.dataset.theme === "light";
    return '<button type="button" class="iconbtn" data-theme-toggle aria-label="' + (light ? "Switch to dark mode" : "Switch to light mode") + '">' + (light ? I.moon : I.sun) + "</button>";
  }
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    store.set("theme", t);
    const m = $('meta[name="theme-color"]'); if (m) m.content = t === "light" ? "#F5F8FC" : "#0A1324";
    const had = document.activeElement && document.activeElement.matches("[data-theme-toggle]");
    $$("[data-theme-toggle]").forEach(b => { b.outerHTML = themeButton(); });
    if (had) { const b = $$("[data-theme-toggle]").filter(x => x.offsetParent !== null)[0]; if (b) b.focus(); }
    drawHero();
  }

  /* ---------- Status words ---------- */
  function deadlineEntry(o) { return o.dates.filter(e => e.k === "deadline" && e.d === o.window.to)[0]; }
  function status(o) {
    const s = o._s;
    if (s.key === "open") return { cls: urgency(s.n) || "g", short: s.n === 0 ? "Closes today" : C.plural(s.n, "day") + " left", line: s.n === 0 ? "Open. Closes today." : "Open. Closes in " + C.plural(s.n, "day") + "." };
    if (s.key === "soon") return { cls: "n", short: "Opens " + C.fmtShort(o.window.from), line: "Not open yet. Opens " + C.fmtLong(o.window.from) + "." };
    if (s.key === "closed") return { cls: "x", short: "Closed this year", line: "Closed for this school year. " + s.text + "." };
    return { cls: "n", short: "Opens " + (o.next.est ? "~" : "") + C.MON[C.parse(o.next.d).getMonth()], line: "Not open yet. " + s.text + "." };
  }
  function tile(o) {
    const s = o._s;
    if (s.key === "open") { const d = C.parse(o.window.to); return '<span class="tile ' + (urgency(s.n) || "g") + '"><small>' + C.MON[d.getMonth()] + "</small><b>" + d.getDate() + "</b></span>"; }
    const d = C.parse(s.key === "soon" ? o.window.from : o.next.d), est = s.key !== "soon" && o.next.est;
    return '<span class="tile ' + (s.key === "closed" ? "x" : "n") + '"><small>' + (s.key === "closed" ? "Back" : "Opens") + "</small><b>" + (est ? "~" : "") + C.MON[d.getMonth()] + "</b></span>";
  }

  /* ---------- Routing: real paths, so every activity and every message has a shareable link ---------- */
  function parseRoute(path) {
    let m;
    if ((m = /^\/l\/([a-z0-9-]+)\/ask\/([a-z0-9-]+)\/?$/.exec(path))) return { name: "ask", id: m[1], ask: m[2] };
    if ((m = /^\/l\/([a-z0-9-]+)(\/.*)?$/.exec(path))) return { name: "listing", id: m[1] };
    if (path === "/season" || path === "/calendar" || path === "/trail") return { name: "saved" };
    if (path === "/parent") return { name: "parent" };
    return { name: "explore" };
  }
  let page = null, depth = 0, sheetOpen = false, lastFocus = null;
  const scrollMem = {};
  if (location.pathname === "/calendar" || location.pathname === "/trail") history.replaceState({ d: 0 }, "", "/season");
  else history.replaceState({ d: 0 }, "", location.pathname + location.search);
  function go(path, replace) {
    scrollMem[location.pathname + location.search] = window.scrollY;
    if (replace) history.replaceState({ d: depth }, "", path); else { depth++; history.pushState({ d: depth }, "", path); }
    render(false);
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-nav]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    e.preventDefault();
    if (/\/ask\//.test(a.getAttribute("href"))) lastFocus = a;
    go(a.getAttribute("href"));
  });
  window.addEventListener("popstate", e => { depth = (e.state && e.state.d) || 0; render(true); });

  function render(restore) {
    let r = parseRoute(location.pathname);
    if ((r.name === "listing" || r.name === "ask") && !BY[r.id]) { history.replaceState({ d: depth }, "", "/"); r = { name: "explore" }; }
    if (r.name === "ask") {
      const o = BY[r.id], a = o.asks[r.ask], st = o.steps.filter(s => s.ask === r.ask)[0];
      if (!a || !st) { history.replaceState({ d: depth }, "", "/l/" + r.id); r = { name: "listing", id: r.id }; }
    }
    const pk = (r.name === "ask" || r.name === "listing") ? "l:" + r.id : r.name === "parent" ? "parent" + location.search : r.name;
    if (pk !== page) {
      page = pk;
      paint(r);
      window.scrollTo(0, restore ? (scrollMem[location.pathname + location.search] || 0) : 0);
    }
    if (r.name === "ask") { const o = BY[r.id]; openSheet(askSheet(o, o.asks[r.ask]), true); }
    else closeSheetNow();
    document.title = titleFor(r);
  }
  function titleFor(r) {
    if (r.name === "listing") return BY[r.id].name + " · Afterbell";
    if (r.name === "ask") return BY[r.id].asks[r.ask].title + " · Afterbell";
    return { saved: "Saved · Afterbell", parent: "Your teen's season · Afterbell" }[r.name] || "Afterbell · What to do after the bell";
  }
  function paint(r) {
    const app = $("#app");
    if (r.name === "parent") { app.innerHTML = header(null, false) + '<main id="main" class="main">' + parentHtml() + "</main>"; return; }
    if (r.name === "listing" || r.name === "ask") { app.innerHTML = frame(listingHtml(BY[r.id]), null); loadReceipts(r.id); return; }
    if (r.name === "saved") { app.innerHTML = frame(savedHtml(), "saved"); return; }
    app.innerHTML = frame(exploreHtml(), "explore", "explore");
    drawHero();
  }
  /* The skyline behind the first screen: daytime in light mode, evening in dark mode */
  function drawHero() {
    const cv = $("canvas.hero-sky"); if (!cv || !window.drawSkyline) return;
    const wide = window.matchMedia("(min-width: 900px)").matches, h = cv.clientHeight;
    window.drawSkyline(cv, { night: document.documentElement.dataset.theme !== "light", band: wide ? Math.min(h * 0.74, 600) : Math.min(300, h * 0.42), focus: wide ? 0.8 : 0.76 });
  }
  let heroW = 0, heroTimer;
  window.addEventListener("resize", () => {
    clearTimeout(heroTimer);
    heroTimer = setTimeout(() => { const cv = $("canvas.hero-sky"); if (cv && cv.clientWidth !== heroW) { heroW = cv.clientWidth; drawHero(); } }, 150);
  });
  /* A save, a tick or a filter changed: repaint, keep the scroll position and focus */
  function refresh() {
    const y = window.scrollY, f = document.activeElement;
    let sel = null;
    if (f && f.dataset && !(f.closest && f.closest("#panel"))) {
      for (const k of ["pick", "done", "f", "g", "all", "themeToggle"]) {
        if (f.dataset[k] != null) { sel = "[data-" + k.replace(/[A-Z]/g, c => "-" + c.toLowerCase()) + (f.dataset[k] ? '="' + f.dataset[k] + '"' : "") + "]"; break; }
      }
    }
    paint(parseRoute(location.pathname));
    window.scrollTo(0, y);
    const el = sel && $$(sel, $("#app")).filter(x => x.offsetParent !== null)[0];
    if (el) el.focus({ preventScroll: true });
    const b = $("#panel [data-done]");
    if (b) {
      const done = !!state.done[b.dataset.done];
      b.setAttribute("aria-pressed", done);
      $(".box", b).innerHTML = done ? I.check : "";
      $("b", b).textContent = done ? "Done" : "Mark as done";
    }
  }

  /* ---------- Saves and ticks (kept only in this browser) ---------- */
  function togglePick(id) {
    const o = BY[id], i = state.picks.indexOf(id);
    if (i >= 0) { state.picks.splice(i, 1); toast("Removed " + o.short + " from Saved."); }
    else { state.picks.push(id); toast("Saved " + o.short + ". Its steps are in Saved."); }
    store.set("picks", state.picks);
    refresh();
  }
  function toggleDone(k) {
    if (state.done[k]) delete state.done[k]; else state.done[k] = true;
    store.set("done", state.done);
    refresh();
  }
  function setGrade(g) {
    state.grade = g || null; state.allGrades = false;
    store.set("grade", state.grade);
    closeSheetNow();
    refresh();
  }

  /* ---------- Frame: header, then the page, then two tabs on a phone ---------- */
  function header(nav, withGrade, over) {
    const n = state.picks.length;
    const link = (k, href, label) => '<a href="' + href + '" data-nav' + (nav === k ? ' aria-current="page"' : "") + ">" + label + "</a>";
    return '<header class="hd' + (over ? " over" : "") + '"><a class="word" href="/" data-nav>Afterbell</a>' +
      (withGrade === false ? "" : '<nav class="dlinks" aria-label="Main">' + link("explore", "/", "Explore") + link("saved", "/season", "Saved" + (n ? ' <span class="count">' + n + "</span>" : "")) + "</nav>") +
      '<div class="hd-r">' + (withGrade === false ? '<a class="chip" href="/" data-nav>See all activities</a>'
        : '<button type="button" class="chip" data-grade-open aria-haspopup="dialog">' + (state.grade ? "Grade " + state.grade : "Your grade") + I.down + "</button>") +
      themeButton() + "</div></header>";
  }
  function tabbar(nav) {
    const n = state.picks.length;
    const t = (k, href, icon, label) => '<a href="' + href + '" data-nav' + (nav === k ? ' aria-current="page"' : "") + ">" + icon + label + "</a>";
    return '<nav class="tabbar" aria-label="Main">' + t("explore", "/", I.explore, "Explore") +
      t("saved", "/season", (nav === "saved" ? I.listOn : I.list) + (n ? '<span class="badge">' + n + "</span>" : ""), "Saved") + "</nav>";
  }
  function frame(main, nav, cls) { return header(nav, true, cls === "explore") + '<main id="main" class="main' + (cls ? " " + cls : "") + '">' + main + "</main>" + tabbar(nav); }

  /* ---------- Activity cards ---------- */
  function cardHtml(o, extra) {
    const st = status(o), team = teamTag(o), ok = eligible(o), saved = picked(o.id);
    return '<li><a class="card' + (o._s.key === "closed" ? " dim" : "") + (ok ? "" : " inel") + '" href="/l/' + o.id + '" data-nav>' + tile(o) +
      '<span class="c-b"><span class="c-t">' + esc(o.name) + (saved ? '<span class="saved" aria-label="Saved">' + I.listOn + "</span>" : "") + "</span>" +
      '<span class="c-w">' + esc(extra || o.what) + "</span>" +
      '<span class="tags"><span class="tag s ' + st.cls + '">' + esc(st.short) + '</span><span class="tag">' + esc(costTag(o)) + "</span>" + (team ? '<span class="tag">' + esc(team) + "</span>" : "") +
      (ok ? "" : '<span class="tag">Not for Grade ' + state.grade + "</span>") + "</span></span></a></li>";
  }
  // Search looks at the name, organizer, type and description, so "scholarship" or "investing" finds the right ones.
  const searchCache = {};
  function searchText(o) {
    if (!searchCache[o.id]) {
      const a = o.about ? [o.about.is].concat(o.about.do, o.about.why).map(x => x.t) : [];
      searchCache[o.id] = [o.name, o.org, o.what, o.short, D.TYPE_LABEL[o.type]].concat(a).join(" ").toLowerCase();
    }
    return searchCache[o.id];
  }
  function matches(o) {
    const f = state.filter;
    if (f === "comp" && !COMPETITIONS.includes(o.type)) return false;
    if (f === "prog" && !PROGRAMS.includes(o.type)) return false;
    if (f === "free" && !o.free) return false;
    if (f === "saved" && !picked(o.id)) return false;
    const q = state.query.trim().toLowerCase();
    if (q && !searchText(o).includes(q)) return false;
    return state.allGrades || eligible(o);
  }
  function listHtml() {
    const list = L.filter(matches);
    let html = "";
    [["Open now", o => o._s.key === "open"], ["Opening later", o => o._s.key === "soon" || o._s.key === "expected"], ["Closed for this school year", o => o._s.key === "closed"]].forEach(g => {
      const rows = list.filter(g[1]);
      if (rows.length) html += '<h3 class="h3 grp">' + g[0] + '</h3><ul class="cards">' + rows.map(o => cardHtml(o)).join("") + "</ul>";
    });
    if (!list.length) html += '<p class="empty">Nothing matches' + (state.query ? " “" + esc(state.query) + "”" : " this filter") + ".</p>";
    const forGrade = L.filter(eligible).length;
    html += '<p class="scope">' + (state.grade
      ? (state.allGrades ? "Showing every grade. " : "Showing " + forGrade + " of " + L.length + " for Grade " + state.grade + ". ") +
        '<button type="button" class="linkbtn" data-all>' + (state.allGrades ? "Only Grade " + state.grade : "Show every grade") + "</button>"
      : "Showing all " + L.length + '. <button type="button" class="linkbtn" data-grade-open>Pick your grade</button> to see only what you can enter.') + "</p>";
    return html;
  }
  function gradeButtons() {
    return '<div class="gbtns" role="group" aria-label="Your grade">' + [9, 10, 11, 12].map(g =>
      '<button type="button" data-g="' + g + '" aria-pressed="' + (state.grade === g) + '">' + g + "</button>").join("") + "</div>";
  }
  function exploreHtml() {
    const n = L.length, open = L.filter(o => o._s.key === "open").length, forGrade = L.filter(eligible).length;
    const sh = BY.shad, dm = BY.diamond, ref = sh.steps.filter(s => s.ask === "reference")[0];
    const hero = '<section class="hero" aria-labelledby="heroH"><canvas class="hero-sky" aria-hidden="true"></canvas><div class="hero-in">' +
      '<h1 id="heroH">What to do <span>after the bell.</span></h1>' +
      '<p class="hero-sub">Discover business competitions and programs for Ontario high school students. Every deadline is checked against the organizer, and every listing shows exactly how to get in.</p>' +
      '<form class="hero-search" role="search" data-search><label class="sr" for="q">Search activities</label>' + I.explore +
        '<input id="q" type="search" placeholder="Search activities, like “pitch”" autocomplete="off" value="' + esc(state.query) + '"><button type="submit" class="btn">Search</button></form>' +
      '<div class="hero-grade" role="group" aria-label="Your grade"><span>I’m in grade</span>' + [9, 10, 11, 12].map(g => '<button type="button" data-g="' + g + '" aria-pressed="' + (state.grade === g) + '">' + g + "</button>").join("") + "</div>" +
      '<p class="hero-note"><button type="button" class="linkbtn" data-scroll="discover">Browse ' + n + " verified opportunities</button>, " + open + " open right now. Free, with no account.</p></div></section>";
    const how = '<section class="how wrap" aria-labelledby="howH"><h2 class="h2" id="howH">How Afterbell works</h2><ol class="how-steps">' +
      '<li><span class="hn">1</span><h3>Find what fits you</h3><p>Pick your grade, then narrow it down to competitions, programs or free ones. Every listing says what it is in plain words.</p>' +
        '<div class="mini" aria-hidden="true"><div class="card">' + tile(dm) + '<span class="c-b"><span class="c-t">' + esc(dm.name) + '</span><span class="tags"><span class="tag s ' + status(dm).cls + '">' + esc(status(dm).short) + '</span><span class="tag">' + esc(teamTag(dm)) + "</span></span></span></div></div></li>" +
      '<li><span class="hn">2</span><h3>Know exactly how to get in</h3><p>Each listing has the steps in order, who to ask and what to say. For most, we’ll even write the message for you to send.</p>' +
        '<div class="mini" aria-hidden="true"><div class="mini-step"><span class="ck"></span><span><b>' + esc(ref.t) + '</b><span class="btn sm">Write the message for me</span></span></div></div></li>' +
      '<li><span class="hn">3</span><h3>Never miss a deadline</h3><p>Save what you’re doing and add every date to your phone’s calendar. It updates itself if a date changes.</p>' +
        '<div class="mini" aria-hidden="true"><div class="mini-cal"><small>' + esc(dayText(ref)) + '</small><b>' + esc(sh.short + ": " + ref.t) + "</b><small>All day, with a reminder the day before</small></div></div></li></ol></section>";
    const discover = '<section class="discover wrap" id="discover" aria-labelledby="discH"><div class="disc-head"><h2 class="h2" id="discH">Discover opportunities</h2>' +
      '<p class="disc-sub">' + (state.grade && !state.allGrades ? forGrade + " verified opportunities for Grade " + state.grade + ", closing soonest first." : n + " verified opportunities, closing soonest first.") + "</p></div>" +
      '<div class="fchips" role="group" aria-label="Show">' + FILTERS.map(f => '<button type="button" class="fchip" data-f="' + f[0] + '" aria-pressed="' + (state.filter === f[0]) + '">' + f[1] + (f[0] === "saved" && state.picks.length ? " (" + state.picks.length + ")" : "") + "</button>").join("") + "</div>" +
      '<div id="results">' + listHtml() + "</div></section>";
    return hero + how + discover + '<div class="wrap">' + aboutHtml() + "</div>";
  }
  function aboutHtml() {
    return '<div class="about">' +
      '<section aria-labelledby="checkH"><h2 class="h2" id="checkH">How we check facts</h2><p>Every fact here is quoted from the organizer’s own page. Each activity’s page ends with the exact sentences and where they came from.</p><p>A script re-reads those pages to catch changes. Dates marked ~ are our estimates from past years, and “by” dates on steps are our advice.</p></section>' +
      '<section aria-labelledby="privH"><h2 class="h2" id="privH">Your privacy</h2><p>No accounts, no email, no tracking cookies. Your grade, your saves and your ticks are kept only in your own browser.</p><p>Messages and calendar files are made on your device. Nothing about you is sent to us.</p></section>' +
      '<p class="fine">Grades mean your grade in the ' + esc(D.SEASON) + " school year. For next year’s rounds, we list the grades that will still be eligible when they open. Always confirm details with the organizer before you apply. Afterbell is independent and isn’t affiliated with any organizer listed. Last checked " + esc(C.fmt(D.CHECKED)) + ".</p></div>";
  }

  /* ---------- An activity's own page ---------- */
  function stepsHtml(o) {
    return '<ol class="steps">' + o.steps.map((st, i) => {
      const k = key(o, st), done = !!state.done[k], m = mine(st), late = !done && m && C.endOf(st.by) < NOW;
      const box = m ? '<button type="button" class="ck" data-done="' + k + '" aria-pressed="' + done + '" aria-label="' + (done ? "Mark not done: " : "Mark done: ") + esc(st.t) + '">' + (done ? I.check : '<span aria-hidden="true">' + (i + 1) + "</span>") + "</button>"
        : '<span class="ckn" aria-hidden="true">' + (i + 1) + "</span>";
      const who = !m && WHO[st.who] ? WHO[st.who] + ". " : "";
      const when = st.official ? "Closing date: " + dayText(st) : "By " + dayText(st);
      const go = done ? "" : (st.ask && o.asks[st.ask] ? '<a class="btn sm" href="/l/' + o.id + "/ask/" + st.ask + '" data-nav>' + (o.asks[st.ask].to === "friends" ? "Invite your team" : "Write the message for me") + "</a>" : "") +
        (st.href ? '<a class="btn sm sec" href="' + esc(st.href) + '" target="_blank" rel="noopener">Open ' + esc(domain(st.href)) + "</a>" : "");
      return '<li class="' + (done ? "done" : "") + '">' + box + "<div><b>" + esc(st.t) + '</b><span class="by' + (st.official ? " off" : "") + (late ? " late" : "") + '">' + esc(who + when) + (late ? ". Overdue" : "") + "</span>" +
        (st.note ? '<span class="note">' + esc(st.note) + "</span>" : "") + (go ? '<span class="go">' + go + "</span>" : "") + "</div></li>";
    }).join("") + "</ol>";
  }
  function factsHtml(o) {
    const s = o._s;
    let when;
    if (s.key === "open") { const d = C.parse(o.window.to), x = deadlineEntry(o); when = { k: "Deadline", v: WD[d.getDay()] + ", " + C.fmtShort(o.window.to) + ", " + d.getFullYear(), sub: (x ? x.t : o.boardWhat) }; }
    else if (s.key === "soon") when = { k: "Opens", v: C.fmt(o.window.from), sub: "Closes " + C.fmt(o.window.to) };
    else when = { k: s.key === "closed" ? "Next round" : "Opens", v: (o.next.est ? "~" : "") + C.fmtLong(o.next.d), sub: o.next.est ? "Our estimate from past years" : "" };
    const cost = o.costShort.split(" · ");
    const box = (k, v, sub, wide) => '<div' + (wide ? ' class="wide"' : "") + "><dt>" + k + "</dt><dd><b>" + esc(v) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</dd></div>";
    return '<dl class="facts">' + box(when.k, when.v, when.sub) + box("Cost", cost[0], cost.slice(1).join(". ")) + box("Who", o.gradeNote) + box("Where", o.where) + box("How you enter", o.entry, "", true) + "</dl>";
  }
  // Every description line is a sentence, so each ends with a full stop.
  const sentence = t => t + (/[.!?]$/.test(t) ? "" : ".");
  function descHtml(o) {
    const a = o.about; if (!a) return "";
    const pts = xs => '<ul class="pts">' + xs.map(x => "<li>" + esc(sentence(x.t)) + "</li>").join("") + "</ul>";
    return '<div class="desc"><section><h2 class="h2">What you’ll do</h2>' + pts(a.do) + "</section>" +
      '<section><h2 class="h2">Why it’s worth it</h2>' + pts(a.why) + "</section></div>";
  }
  function listingHtml(o) {
    const st = status(o), pk = picked(o.id), gr = C.gradeRow(o, state.grade, o._s), url = officialUrl(o);
    const can = (gr ? [gr] : []).concat(o.can);
    const kd = o.dates.map(x => '<li class="' + (C.endOf(x.d) < NOW ? "past" : "") + '"><time>' + esc(x.show || C.fmtShort(x.d, x.est)) + "</time><span>" + esc(x.t) + (x.est ? '<span class="est">estimate</span>' : "") + "</span></li>").join("");
    return '<div class="lpage"><div class="lhead"><div class="lbar"><button type="button" data-back aria-label="Back">' + I.back + '<span>Back</span></button><button type="button" data-share="' + o.id + '" aria-label="Share ' + esc(o.name) + '">' + I.share + "</button></div>" +
      '<h1 class="ln">' + esc(o.name) + '</h1><p class="lorg">' + esc(D.TYPE_LABEL[o.type]) + " by " + esc(o.org) + "</p>" +
      '<p class="stat ' + st.cls + '">' + esc(st.line) + "</p>" +
      (o.lastGrade && o.lastGrade === state.grade ? '<p class="lastyr">Grade ' + state.grade + " is the last year you can enter.</p>" : "") +
      '<p class="intro">' + esc(o.about ? o.about.is.t : sentence(o.what)) + "</p></div>" +
      '<aside class="lside" aria-label="Key facts">' + factsHtml(o) +
      '<div class="acts"><a class="btn green" href="' + esc(url) + '" target="_blank" rel="noopener">Go to ' + esc(domain(url)) + "</a>" +
      '<button type="button" class="btn sec" data-pick="' + o.id + '" aria-pressed="' + pk + '">' + (pk ? I.listOn + "Saved" : I.list + "Save") + "</button></div></aside>" +
      '<div class="lbody">' + descHtml(o) + '<h2 class="h2">How to apply</h2>' + stepsHtml(o) +
      '<h2 class="h2">Who can apply</h2><ul class="can">' + can.map(c => '<li><span class="m ' + c.k + '" aria-hidden="true">' + MARK[c.k] + "</span><div><b>" + esc(c.t) + "</b>" + (c.s ? "<small>" + esc(c.s) + "</small>" : "") + "</div></li>").join("") + "</ul>" +
      '<h2 class="h2">What it costs</h2><p class="why">' + esc(o.cost) + "</p>" + (o.aid ? '<p class="why sub">' + esc(o.aid) + "</p>" : "") +
      '<h2 class="h2">Important dates</h2><ol class="kd">' + kd + '</ol><p class="more"><button type="button" class="linkbtn" data-cal="' + o.id + '">Download these dates for your calendar</button></p>' +
      '<h2 class="h2">Where these facts come from</h2><p class="why sub">Each fact on this page comes from the organizer’s own website.</p>' +
      '<details class="rcd"><summary><span class="sh">Show</span><span class="hi">Hide</span> their exact words<span class="rcn"></span></summary>' +
      '<div id="rc-' + o.id + '" class="rc"><p class="fine">Loading the organizer’s own words…</p></div></details>' +
      '<p class="fine">Checked ' + esc(C.fmt(D.CHECKED)) + ". Always confirm with the organizer before you apply." +
      (REPORT_EMAIL ? ' <a class="u" href="mailto:' + esc(REPORT_EMAIL) + "?subject=" + encodeURIComponent("Mistake on " + o.name) + '">Report a mistake</a>' : "") + "</p></div></div>";
  }

  /* ---------- Receipts: the organizer's exact words behind each fact ---------- */
  let receiptsCache = null;
  function loadReceipts(id) {
    function paintR(all) {
      const box = $("#rc-" + id); if (!box) return;
      const list = (all && all[id]) || [];
      const n = $(".rcd .rcn"); if (n) n.textContent = list.length ? " (" + list.length + ")" : "";
      box.innerHTML = list.length ? '<ul class="src">' + list.map(r => "<li>“" + esc(r.quote) + '”<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' +
        esc(r.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")) + (r.manual ? ", checked by hand" : "") + "</a></li>").join("") + "</ul>" : '<p class="fine">No sources found.</p>';
    }
    if (receiptsCache) return paintR(receiptsCache);
    fetch("/data/receipts.json").then(r => r.json()).then(j => { receiptsCache = j; paintR(j); })
      .catch(() => { const box = $("#rc-" + id); if (box) box.innerHTML = '<p class="fine">Couldn’t load the sources. Check your connection and try again.</p>'; });
  }

  /* ---------- Saved ---------- */
  function nextStep(o) {
    return o.steps.filter(s => mine(s) && !state.done[key(o, s)] && !(C.endOf(s.by) < NOW && o._s.key === "closed")).sort((a, b) => C.parse(a.by) - C.parse(b.by))[0];
  }
  function todoHtml(o, s) {
    const k = key(o, s), done = !!state.done[k], late = !done && C.endOf(s.by) < NOW;
    return '<li class="' + (done ? "done" : "") + '"><button type="button" class="ck" data-done="' + k + '" aria-pressed="' + done + '" aria-label="' + (done ? "Mark not done: " : "Mark done: ") + esc(s.t) + '">' + (done ? I.check : "") + "</button>" +
      "<div><b>" + esc(s.t) + '</b><span class="by' + (late ? " late" : "") + '"><a href="/l/' + o.id + '" data-nav>' + esc(o.short) + "</a>. " + (s.official ? "Closing date: " : "By ") + esc(dayText(s)) + (late ? ". Overdue" : "") + "</span>" +
      (done ? "" : '<span class="go">' + (s.ask && o.asks[s.ask] ? '<a class="btn sm" href="/l/' + o.id + "/ask/" + s.ask + '" data-nav>' + (o.asks[s.ask].to === "friends" ? "Invite your team" : "Write the message for me") + "</a>" : "") +
        (s.href ? '<a class="btn sm sec" href="' + esc(s.href) + '" target="_blank" rel="noopener">Open ' + esc(domain(s.href)) + "</a>" : "") + "</span>") + "</div></li>";
  }
  function savedHtml() {
    const picks = state.picks.map(id => BY[id]);
    if (!picks.length) {
      const sugg = L.filter(o => eligible(o) && o._s.key === "open").slice(0, 4);
      return '<h1 class="lg">Saved</h1><p class="lede">Tap Save on any activity. You’ll see the next thing to do for each one, with the date to do it by.</p>' +
        (sugg.length ? '<h2 class="h2">Open now' + (state.grade ? " for Grade " + state.grade : "") + '</h2><ul class="cards">' + sugg.map(o => cardHtml(o)).join("") + "</ul>" : "") +
        '<p class="more"><a href="/" data-nav>Explore every activity</a></p>';
    }
    const cards = picks.map(o => { const s = nextStep(o); return cardHtml(o, s ? "Next: " + s.t.charAt(0).toLowerCase() + s.t.slice(1) + ", " + (s.official ? "closing date " : "by ") + dayText(s) : "Every step is done."); }).join("");
    const all = [];
    picks.forEach(o => o.steps.forEach(s => { if (mine(s)) all.push({ o, s, d: C.parse(s.by) }); }));
    all.sort((a, b) => a.d - b.d);
    const doneN = all.filter(x => state.done[key(x.o, x.s)]).length;
    const weekEnd = addDays(NOW, 7);
    const open = all.filter(x => !state.done[key(x.o, x.s)] && !(C.endOf(x.s.by) < NOW && x.o._s.key === "closed"));
    const thisWeek = open.filter(x => C.endOf(x.s.by) <= weekEnd && !C.isMonth(x.s.by));
    const later = open.filter(x => thisWeek.indexOf(x) < 0);
    const doneList = all.filter(x => state.done[key(x.o, x.s)]);
    const pct = all.length ? Math.round(doneN / all.length * 100) : 0;
    return '<h1 class="lg">Saved (' + picks.length + ")</h1>" +
      '<ul class="cards">' + cards + "</ul>" +
      '<h2 class="h2">Your steps</h2><p class="sum"><b>' + doneN + " of " + all.length + "</b> done</p>" +
      '<div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Steps done"><i style="width:' + pct + '%"></i></div>' +
      '<h3 class="h3">' + (thisWeek.length ? "This week" : "Nothing due this week") + "</h3>" +
      (thisWeek.length ? '<ol class="steps">' + thisWeek.map(x => todoHtml(x.o, x.s)).join("") + "</ol>" : "") +
      (later.length ? '<h3 class="h3">Later</h3><ol class="steps">' + later.map(x => todoHtml(x.o, x.s)).join("") + "</ol>" : "") +
      (doneList.length ? '<details class="donelist"><summary>Done (' + doneList.length + ')</summary><ol class="steps">' + doneList.map(x => todoHtml(x.o, x.s)).join("") + "</ol></details>" : "") +
      '<div class="sea-acts"><button type="button" class="btn green" data-subscribe>Add all my dates to my phone’s calendar</button>' +
      "<p>Every step and closing date, in the calendar you already use. It updates itself if a date changes. No account needed.</p>" +
      '<button type="button" class="btn sec" data-sendparent>Send my list to a parent</button>' +
      '<p>They get a page with what’s coming up, what it costs and where they can help. <a class="u" href="' + esc(parentPath()) + '" data-nav>Preview it</a></p></div>';
  }

  /* ---------- Parent view: /parent?l=shad,diamond&g=11 ---------- */
  function parentPicks() {
    const q = new URLSearchParams(location.search);
    return { ids: (q.get("l") || "").split(",").filter(id => BY[id]).slice(0, 20), grade: Number(q.get("g")) || null };
  }
  function parentPath() { return "/parent?l=" + state.picks.join(",") + (state.grade ? "&g=" + state.grade : ""); }
  function parentHtml() {
    const p = parentPicks(), picks = p.ids.map(id => BY[id]);
    const head = '<h1 class="lg">Your teen’s season</h1><p class="lede">' + (p.grade ? "Grade " + p.grade + ". " : "") + C.plural(picks.length, "activity").replace("activitys", "activities") + ", shared from Afterbell.</p>";
    if (!picks.length) return head + '<p class="empty">This link doesn’t include any activities. Ask your teen to send it again from Saved.</p>';
    const items = [];
    picks.forEach(o => o.steps.forEach(s => { if ((mine(s) || s.official) && C.endOf(s.by) >= NOW) items.push({ o, s, d: C.parse(s.by) }); }));
    items.sort((a, b) => a.d - b.d);
    const coming = items.slice(0, 7).map(x => '<li><a href="/l/' + x.o.id + '" data-nav><span class="dd">' + (C.isMonth(x.s.by) ? (x.s.est ? "~" : "") + C.MON[x.d.getMonth()] : x.d.getDate()) + "<small>" +
      (C.isMonth(x.s.by) ? x.d.getFullYear() : WD[x.d.getDay()] + " " + C.MON[x.d.getMonth()]) + '</small></span><span class="tx">' + esc(x.s.t) + "<small>" + esc(x.o.name) + (x.s.official ? ", closing date" : "") + "</small></span></a></li>").join("");
    const help = [];
    picks.forEach(o => o.parent.forEach(h => help.push('<li><b>' + esc(h.t) + "</b><small>" + esc(h.s) + ' <a class="u" href="/l/' + o.id + '" data-nav>' + esc(o.short) + ", from " + esc(o.src.name) + "</a></small></li>")));
    const costs = picks.map(o => '<div class="wide"><dt>' + esc(o.name) + "</dt><dd><b>" + esc(o.costShort.split(" · ").join(". ")) + "</b>" + (o.aid ? "<small>" + esc(o.aid) + "</small>" : "") + "</dd></div>").join("");
    return head +
      '<h2 class="h2">Coming up</h2><ul class="up">' + (coming || '<li><span class="tx">Nothing coming up right now.</span></li>') + "</ul>" +
      '<h2 class="h2">Where you can help</h2><ul class="can help">' + help.join("") + "</ul>" +
      '<h2 class="h2">Costs at a glance</h2><dl class="facts">' + costs + "</dl>" +
      '<div class="sea-acts"><button type="button" class="btn green" data-subscribe-parent>Add these dates to my calendar</button><p>It updates itself if a date changes. No account needed.</p></div>' +
      '<h2 class="h2">What each one is</h2><ul class="cards">' + picks.map(o => cardHtml(o)).join("") + "</ul>" +
      '<p class="fine">No account. Nothing is tracked. Your teen chose what to share. Every fact on Afterbell is quoted from the organizer, and each activity’s page shows its sources.</p>';
  }

  /* ---------- Sheets: the message writer, calendar options and the grade picker ---------- */
  function askSheet(o, a) {
    const st = o.steps.filter(s => s.ask === a.id)[0], done = !!state.done[key(o, st)];
    const third = a.to === "friends" ? '<a class="btn sec" data-asksms href="#">Text</a>' : '<a class="btn sec" data-askmail href="#">Email</a>';
    return '<div class="grab" aria-hidden="true"></div><div class="sh-head"><div class="sh-top"><p class="sh-k">' + esc(o.name) + '</p><button type="button" class="xb" data-close aria-label="Close">' + I.close + "</button></div>" +
      '<h2 id="shTitle" tabindex="-1">' + esc(a.title) + '</h2><p class="sh-sub">To: ' + esc(ASK_TO[a.to] || a.to) + ". " + (st.official ? "Closing date: " : "By ") + esc(dayText(st)) + ".</p></div>" +
      '<div class="sh-body"><label class="lab" for="askMsg">Your message. Fill in the parts in [square brackets], and change anything you like.</label>' +
      '<textarea id="askMsg" class="msg" rows="12" spellcheck="true">' + esc(a.msg) + "</textarea>" +
      '<p class="hint">' + esc(a.hint) + "</p>" +
      '<button type="button" class="donebox" data-done="' + key(o, st) + '" aria-pressed="' + done + '"><span class="box" aria-hidden="true">' + (done ? I.check : "") + "</span><span><b>" + (done ? "Done" : "Mark as done") + "</b><small>" +
        (a.to === "friends" ? "Tick it once your team is set." : "Tick it once they say yes.") + "</small></span></button></div>" +
      '<div class="sh-bar"><button type="button" class="btn sec" data-askcopy>Copy</button>' + third + '<button type="button" class="btn green" data-askshare>Share</button></div>';
  }
  function feedUrl(ids, forParent) { return location.origin + "/api/calendar?l=" + ids.join(",") + (forParent ? "&for=parent" : ""); }
  function subscribeSheet(ids, forParent) {
    const https = feedUrl(ids, forParent), webcal = https.replace(/^https?:/, "webcal:");
    const names = ids.map(id => BY[id].short).join(", ");
    return '<div class="grab" aria-hidden="true"></div><div class="sh-head"><div class="sh-top"><p class="sh-k">' + (forParent ? "Your calendar" : "Your phone’s calendar") + '</p><button type="button" class="xb" data-close aria-label="Close">' + I.close + "</button></div>" +
      '<h2 id="shTitle" tabindex="-1">' + (forParent ? "Add these dates to your calendar" : "Add your dates to your calendar") + '</h2><p class="sh-sub">Every step and closing date for ' + esc(names) + ". When a date changes, it changes in your calendar too.</p></div>" +
      '<div class="sh-body"><div class="opts">' +
        '<a class="opt" href="' + esc(webcal) + '"><b>iPhone, iPad or Mac</b><small>Apple Calendar asks you to subscribe.</small></a>' +
        '<a class="opt" href="https://calendar.google.com/calendar/render?cid=' + encodeURIComponent(webcal) + '" target="_blank" rel="noopener"><b>Google Calendar</b><small>Opens Google Calendar. On a phone, you may need to finish on a computer.</small></a>' +
        '<a class="opt" href="https://outlook.live.com/calendar/0/addfromweb?url=' + encodeURIComponent(https) + "&amp;name=" + encodeURIComponent("Afterbell") + '" target="_blank" rel="noopener"><b>Outlook</b><small>Opens Outlook on the web.</small></a>' +
        '<button type="button" class="opt" data-copyfeed="' + esc(https) + '"><b>Copy the calendar link</b><small>For any other app: add a calendar “from URL” and paste it.</small></button></div>' +
        '<p class="hint">Calendar apps check for changes on their own schedule, usually within a day. Each step has a reminder the day before, but some apps ignore reminders in subscribed calendars. If you don’t get alerts, check this calendar’s notification settings in your app.</p>' +
        (forParent ? "" : '<p class="fine">Ticks you make on Afterbell stay on this device, so the calendar shows every step. <button type="button" class="linkbtn" data-calseason>Download a one-time file instead</button> (it won’t update).</p>') +
      '</div><div class="sh-bar"><button type="button" class="btn sec" data-close>Done</button></div>';
  }
  function gradeSheet() {
    return '<div class="grab" aria-hidden="true"></div><div class="sh-head"><div class="sh-top"><p class="sh-k">Your grade</p><button type="button" class="xb" data-close aria-label="Close">' + I.close + "</button></div>" +
      '<h2 id="shTitle" tabindex="-1">What grade are you in?</h2><p class="sh-sub">Your grade in the ' + esc(D.SEASON) + " school year. You’ll see only what you can enter.</p></div>" +
      '<div class="sh-body">' + gradeButtons() + (state.grade ? '<p class="more"><button type="button" class="linkbtn" data-g="0">Show every grade</button></p>' : "") + "</div>";
  }
  function openSheet(html, routed) {
    const panel = $("#panel"), wasOpen = !panel.hidden;
    if (!wasOpen && !routed) lastFocus = document.activeElement;
    panel.innerHTML = html;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-labelledby", "shTitle");
    panel.hidden = false; $("#scrim").hidden = false;
    document.documentElement.classList.add("lock");
    sheetOpen = routed ? "routed" : "plain";
    if (!wasOpen) { panel.classList.add("enter"); requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.remove("enter"))); }
    const t = $("#shTitle"); if (t) t.focus({ preventScroll: true });
  }
  function closeSheetNow() {
    const panel = $("#panel"); if (panel.hidden) return;
    panel.hidden = true; $("#scrim").hidden = true; panel.innerHTML = "";
    document.documentElement.classList.remove("lock");
    sheetOpen = false;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  function closeSheet() {
    if (sheetOpen !== "routed") { closeSheetNow(); return; }
    const r = parseRoute(location.pathname);
    if (depth > 0 && history.state && history.state.d > 0) history.back(); else go("/l/" + r.id, true);
  }
  function askContext() {
    const r = parseRoute(location.pathname); if (r.name !== "ask") return null;
    const o = BY[r.id]; return { o, a: o.asks[r.ask], text: ($("#askMsg") || {}).value || o.asks[r.ask].msg };
  }

  /* ---------- Actions ---------- */
  document.addEventListener("input", e => {
    if (e.target.id !== "q") return;
    state.query = e.target.value;
    const box = $("#results"); if (box) box.innerHTML = listHtml();
  });
  document.addEventListener("submit", e => {
    if (!e.target.matches("[data-search]")) return;
    e.preventDefault();
    const d = $("#discover"); if (d) d.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  document.addEventListener("click", e => {
    let t, ctx;
    if (e.target.closest("[data-close]") || e.target.id === "scrim") { closeSheet(); return; }
    if (e.target.closest("[data-back]")) { if (depth > 0) history.back(); else go("/", true); return; }
    if (e.target.closest("[data-theme-toggle]")) { setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"); return; }
    if (e.target.closest("[data-grade-open]")) { openSheet(gradeSheet(), false); return; }
    if ((t = e.target.closest("[data-scroll]"))) { const d = $("#" + t.dataset.scroll); if (d) d.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); return; }
    if ((t = e.target.closest("[data-g]"))) { setGrade(Number(t.dataset.g)); return; }
    if ((t = e.target.closest("[data-f]"))) { state.filter = t.dataset.f; refresh(); return; }
    if (e.target.closest("[data-all]")) { state.allGrades = !state.allGrades; refresh(); return; }
    if ((t = e.target.closest("[data-pick]"))) { e.preventDefault(); togglePick(t.dataset.pick); return; }
    if ((t = e.target.closest("[data-done]"))) { toggleDone(t.dataset.done); return; }
    if ((t = e.target.closest("[data-share]"))) { share(BY[t.dataset.share]); return; }
    if ((t = e.target.closest("[data-cal]"))) { downloadIcs([BY[t.dataset.cal]], BY[t.dataset.cal].short, "afterbell-" + t.dataset.cal); return; }
    if (e.target.closest("[data-subscribe]")) { if (state.picks.length) openSheet(subscribeSheet(state.picks, false), false); return; }
    if (e.target.closest("[data-subscribe-parent]")) { const pp = parentPicks(); if (pp.ids.length) openSheet(subscribeSheet(pp.ids, true), false); return; }
    if ((t = e.target.closest("[data-copyfeed]"))) { copy(t.dataset.copyfeed, "Calendar link copied. In your calendar app, add a calendar from URL and paste it."); return; }
    if (e.target.closest("[data-sendparent]")) { sendToParent(); return; }
    if (e.target.closest("[data-calseason]")) { downloadIcs(state.picks.map(id => BY[id]), "your saved activities", "afterbell-saved"); return; }
    if (e.target.closest("[data-askcopy]") && (ctx = askContext())) { copy(ctx.text, "Message copied. Paste it into an email or text."); return; }
    if (e.target.closest("[data-askshare]") && (ctx = askContext())) {
      if (navigator.share) navigator.share({ text: ctx.text }).catch(() => {});
      else copy(ctx.text, "Message copied. Paste it into an email or text.");
      return;
    }
    if (e.target.closest("[data-askmail]") && (ctx = askContext())) { e.preventDefault(); location.href = "mailto:?subject=" + encodeURIComponent(ctx.a.subject) + "&body=" + encodeURIComponent(ctx.text); return; }
    if (e.target.closest("[data-asksms]") && (ctx = askContext())) { e.preventDefault(); location.href = "sms:?&body=" + encodeURIComponent(ctx.text); return; }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#panel").hidden) closeSheet(); });

  function sendToParent() {
    const url = location.origin + parentPath();
    const data = { title: "My Afterbell list", text: "Here’s what I’m doing on Afterbell: what’s coming up, what it costs and where you can help.", url };
    if (navigator.share) { navigator.share(data).catch(() => {}); return; }
    copy(url, "Link copied. Send it to a parent by text or email.");
  }
  function share(o) {
    const data = { title: o.name + " · Afterbell", text: o.name + ": " + status(o).line, url: o.link };
    if (navigator.share) { navigator.share(data).catch(() => {}); return; }
    copy(o.link, "Link copied. Paste it anywhere to share " + o.short + ".");
  }
  function copy(text, msg) {
    function fallback() {
      const ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (err) {}
      ta.remove(); toast(ok ? msg : "Couldn’t copy. Select the text and copy it yourself.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast(msg), fallback);
    else fallback();
  }
  function downloadIcs(list, label, file) {
    if (!list.length) return;
    try {
      const blob = new Blob([C.ics(list, { name: "Afterbell" + (list.length === 1 ? ": " + list[0].short : "") })], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = file + ".ics";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast("Calendar file downloaded. Open it to add " + label + ": steps and closing dates.");
    } catch (err) { toast("Couldn’t create the calendar file in this browser."); }
  }

  render(false);
})();
