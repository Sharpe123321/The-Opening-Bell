/* Opening Bell: a watchlist of business competitions and programs for Ontario high school students.
 * Each listing has a ticker and a "days left" tag, and its page reads like a stock page, with a chart
 * of your plan. No framework and no build step. Every listing fact comes from data/listings.js and
 * every date and wording rule from lib/core.js.
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
    grade: store.get("grade", null), filter: "all", allGrades: false, calMine: null, calOffset: 0,
    picks: (store.get("picks", []) || []).filter(id => BY[id]),
    done: store.get("done", {}) || {}
  };
  if (![9, 10, 11, 12].includes(state.grade)) state.grade = null;

  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const WDL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const ASK_ACT = { teacher: "Ask your teacher", parent: "Ask an adult", friends: "Invite your team", counsellor: "Ask your counsellor" };
  const ASK_TO = { teacher: "A teacher", parent: "A parent or other adult", friends: "Your friends", counsellor: "Your counsellor" };
  const WHO = { teacher: "A teacher does this", advisor: "Your advisor does this", parent: "A parent or adult does this", friends: "Your team does this", school: "Your school does this", org: "The organizer does this" };
  const MARK = { ok: "✓", warn: "!", no: "✕" };

  const I = {
    home: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5 12 4l8.5 6.5"/><path d="M5.5 9.5V20h4.5v-5.5h4V20h4.5V9.5"/></svg>',
    cal: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    list: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/></svg>',
    listOn: '<svg class="ic fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/></svg>',
    back: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    share: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v11M8 7.5l4-4 4 4"/><path d="M6 11.5H5v9h14v-9h-1"/></svg>',
    down: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    left: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    check: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    close: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    sun: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>',
    moon: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
  };

  let toastTimer;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 4200); }
  const isDesk = () => window.matchMedia("(min-width: 960px)").matches;
  const eligible = o => !state.grade || o.grades.includes(state.grade);
  const picked = id => state.picks.includes(id);
  const key = (o, s) => o.id + ":" + s.id;
  const mine = s => s.who === "you" || !!s.ask;
  const md = d => C.MON[d.getMonth()] + " " + d.getDate();
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const domain = u => u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
  const urgency = n => (n <= 7 ? "r" : n <= 30 ? "o" : "");
  function dayText(s) {
    const d = C.parse(s.by);
    if (C.isMonth(s.by)) return (s.est ? "~" : "") + MONTH[d.getMonth()] + " " + d.getFullYear();
    return (s.est ? "around " : WDL[d.getDay()] + ", ") + MONTH[d.getMonth()] + " " + d.getDate();
  }

  /* ---------- Theme: dark unless the visitor switched to light ---------- */
  function themeButton() {
    const light = document.documentElement.dataset.theme === "light";
    return '<button type="button" class="iconbtn" data-theme-toggle aria-label="' + (light ? "Switch to dark mode" : "Switch to light mode") + '">' + (light ? I.moon : I.sun) + "</button>";
  }
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    store.set("theme", t);
    const m = $('meta[name="theme-color"]'); if (m) m.content = t === "light" ? "#ffffff" : "#000000";
    const had = document.activeElement && document.activeElement.matches("[data-theme-toggle]");
    $$("[data-theme-toggle]").forEach(b => { b.outerHTML = themeButton(); });
    if (had) { const b = $$("[data-theme-toggle]").filter(x => x.offsetParent !== null)[0]; if (b) b.focus(); }
  }

  /* ---------- Status words ---------- */
  function pill(o) {
    const s = o._s;
    if (s.key === "open") return '<span class="pill ' + urgency(s.n) + '">' + (s.n === 0 ? "Today" : C.plural(s.n, "day")) + "</span>";
    if (s.key === "soon") return '<span class="pill g">Opens ' + esc(C.fmtShort(o.window.from)) + "</span>";
    if (s.key === "closed") return '<span class="pill x">Closed</span>';
    const d = C.parse(o.next.d);
    return '<span class="pill g">Opens ' + (o.next.est ? "~" : "") + C.MON[d.getMonth()] + "</span>";
  }
  function deadlineLine(o) {
    const d = C.parse(o.window.to), x = o.dates.filter(e => e.k === "deadline" && e.d === o.window.to)[0];
    return WDL[d.getDay()] + ", " + C.fmtLong(o.window.to) + ": " + (x ? x.t : o.boardWhat);
  }
  function bigStatus(o) {
    const s = o._s;
    if (s.key === "open") return { big: s.n === 0 ? "Closes today" : C.plural(s.n, "day") + " left", cls: urgency(s.n), line: deadlineLine(o) };
    if (s.key === "soon") return { big: "Opens " + C.fmtShort(o.window.from), cls: "g", line: "Closes " + C.fmtLong(o.window.to) };
    if (s.key === "closed") return { big: "Closed this season", cls: "g", line: s.text };
    return { big: "Opens " + (o.next.est ? "~" : "") + C.fmtLong(o.next.d), cls: "g", line: s.text };
  }

  /* ---------- Routing: real paths, so every listing and every message has a shareable link ---------- */
  function parseRoute(path) {
    let m;
    if ((m = /^\/l\/([a-z0-9-]+)\/ask\/([a-z0-9-]+)\/?$/.exec(path))) return { name: "ask", id: m[1], ask: m[2] };
    if ((m = /^\/l\/([a-z0-9-]+)(\/.*)?$/.exec(path))) return { name: "listing", id: m[1] };
    if (path === "/season") return { name: "season" };
    if (path === "/parent") return { name: "parent" };
    if (path === "/calendar" || path === "/trail") return { name: "calendar" };
    return { name: "home" };
  }
  let page = null, depth = 0, sheetOpen = false, lastFocus = null;
  const scrollMem = {};
  history.replaceState({ d: 0 }, "", location.pathname + location.search);
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
    if ((r.name === "listing" || r.name === "ask") && !BY[r.id]) { history.replaceState({ d: depth }, "", "/"); r = { name: "home" }; }
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
    if (r.name === "listing") return BY[r.id].name + " · Opening Bell";
    if (r.name === "ask") return BY[r.id].asks[r.ask].title + " · Opening Bell";
    return { season: "My list · Opening Bell", parent: "Your teen's season · Opening Bell", calendar: "Calendar · Opening Bell" }[r.name] ||
      "Opening Bell · Business competitions for Ontario high school students";
  }
  function paint(r) {
    const app = $("#app");
    if (r.name === "parent") { app.innerHTML = header(null, false) + '<main id="main" class="main solo">' + parentHtml() + "</main>"; return; }
    if (r.name === "listing" || r.name === "ask") { app.innerHTML = shell(listingHtml(BY[r.id]), "home", r.id); loadReceipts(r.id); return; }
    if (r.name === "season") { app.innerHTML = shell(seasonHtml(), "list"); return; }
    if (r.name === "calendar") { app.innerHTML = shell(calendarHtml(), "cal"); return; }
    app.innerHTML = shell(homeHtml(), "home");
  }
  /* A pick or a tick changed: repaint the page underneath, keep the scroll position and focus */
  function refresh() {
    const y = window.scrollY, f = document.activeElement;
    let sel = null;
    if (f && f.dataset && !(f.closest && f.closest("#panel"))) {
      for (const k of ["pick", "done", "f", "g", "all", "calmine", "calmonth", "themeToggle"]) {
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

  /* ---------- Picks and ticks (saved only in this browser) ---------- */
  function togglePick(id) {
    const o = BY[id], i = state.picks.indexOf(id);
    if (i >= 0) { state.picks.splice(i, 1); toast("Removed " + o.short + " from your list."); }
    else { state.picks.push(id); toast("Added " + o.short + " to your list. Its steps are in My list."); }
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

  /* ---------- Frame: header, two columns on a computer, tab bar on a phone ---------- */
  function header(nav, withGrade) {
    const n = state.picks.length;
    const link = (k, href, label) => '<a href="' + href + '" data-nav' + (nav === k ? ' aria-current="page"' : "") + ">" + label + "</a>";
    return '<header class="hd"><a class="word" href="/" data-nav>Opening Bell</a>' +
      (nav ? '<nav class="dlinks" aria-label="Main">' + link("home", "/", "Home") + link("cal", "/calendar", "Calendar") + link("list", "/season", "My list" + (n ? ' <span class="count">' + n + "</span>" : "")) + "</nav>" : "") +
      '<div class="hd-r">' + (withGrade === false ? '<a class="chip" href="/" data-nav>See all listings</a>'
        : '<button type="button" class="chip" data-grade-open aria-haspopup="dialog">' + (state.grade ? "Grade " + state.grade : "Your grade") + I.down + "</button>") +
      themeButton() + "</div></header>";
  }
  function tabbar(nav) {
    const n = state.picks.length;
    const t = (k, href, icon, label) => '<a href="' + href + '" data-nav' + (nav === k ? ' aria-current="page"' : "") + ">" + icon + label + "</a>";
    return '<nav class="tabbar" aria-label="Main">' + t("home", "/", I.home, "Home") + t("cal", "/calendar", I.cal, "Calendar") +
      t("list", "/season", (nav === "list" ? I.listOn : I.list) + (n ? '<span class="badge">' + n + "</span>" : ""), "My list") + "</nav>";
  }
  function shell(main, nav, currentId) {
    return header(nav, true) + '<div class="cols"><main id="main" class="main">' + main + '</main><aside class="side" aria-label="All listings">' + watchHtml(currentId) + "</aside></div>" + tabbar(nav);
  }

  /* ---------- The watchlist ---------- */
  function rowHtml(o, currentId) {
    const ok = eligible(o);
    return '<li><a class="r' + (o._s.key === "closed" ? " dim" : "") + (ok ? "" : " inel") + '" href="/l/' + o.id + '" data-nav' + (currentId === o.id ? ' aria-current="page"' : "") + ">" +
      '<span class="r-l"><span class="tk">' + esc(o.tk) + '</span><span class="nm">' + esc(o.name) + (ok ? "" : " (not for Grade " + state.grade + ")") + "</span></span>" + pill(o) + "</a></li>";
  }
  function watchHtml(currentId) {
    const types = D.TYPES.filter(t => L.some(o => o.type === t[0]));
    const chips = [["all", "All"]].concat(types).concat([["free", "Free"]]).map(t =>
      '<button type="button" class="fchip" data-f="' + t[0] + '" aria-pressed="' + (state.filter === t[0]) + '">' + esc(t[1]) + "</button>").join("");
    const list = L.filter(o => (state.filter === "free" ? o.free : (state.filter === "all" || o.type === state.filter)) && (state.allGrades || eligible(o)));
    const showMine = state.filter === "all" && state.picks.length > 0;
    const rest = list.filter(o => !(showMine && picked(o.id)));
    let html = '<div class="fchips" role="group" aria-label="Show">' + chips + "</div>";
    if (showMine) html += '<h2 class="wh">My list<a href="/season" data-nav>See plan</a></h2><ul class="list">' + state.picks.map(id => rowHtml(BY[id], currentId)).join("") + "</ul>";
    [["Open now", o => o._s.key === "open"], ["Opening later", o => o._s.key === "soon" || o._s.key === "expected"], ["Closed this season", o => o._s.key === "closed"]].forEach(g => {
      const rows = rest.filter(g[1]);
      if (rows.length) html += '<h2 class="wh">' + g[0] + '</h2><ul class="list">' + rows.map(o => rowHtml(o, currentId)).join("") + "</ul>";
    });
    if (!list.length) html += '<p class="empty">Nothing matches this filter.</p>';
    const forGrade = L.filter(eligible).length;
    html += '<p class="scope">' + (state.grade
      ? (state.allGrades ? "Showing all " + L.length + " listings. " : "Showing " + forGrade + " of " + L.length + " for Grade " + state.grade + ". ") +
        '<button type="button" class="linkbtn" data-all>' + (state.allGrades ? "Only Grade " + state.grade : "Show all grades") + "</button>"
      : "Showing all " + L.length + '. <button type="button" class="linkbtn" data-grade-open>Pick your grade</button> to see only what you can enter.') + "</p>";
    return html;
  }

  /* ---------- Home ---------- */
  function gradeButtons() {
    return '<div class="gbtns" role="group" aria-label="Your grade">' + [9, 10, 11, 12].map(g =>
      '<button type="button" data-g="' + g + '" aria-pressed="' + (state.grade === g) + '">' + g + "</button>").join("") + "</div>";
  }
  /* Steps to do, soonest first. With a list, its steps (overdue ones too); without one, suggestions for your grade. */
  function moves() {
    const all = [];
    if (state.picks.length) {
      state.picks.forEach(id => {
        const o = BY[id];
        o.steps.forEach(s => {
          if (!mine(s) || state.done[key(o, s)]) return;
          const late = C.endOf(s.by) < NOW;
          if (late && (o._s.key === "closed" || (o.window && o.window.to && C.endOf(o.window.to) < NOW))) return;
          all.push({ o, s, d: C.parse(s.by), late });
        });
      });
    } else {
      L.filter(o => eligible(o) && o._s.key !== "closed").forEach(o => C.upcoming(o, NOW, state.done).filter(mine).forEach(s => all.push({ o, s, d: C.parse(s.by), late: false })));
    }
    return all.sort((a, b) => a.d - b.d);
  }
  function actionButton(o, s, cls) {
    if (s.ask && o.asks[s.ask]) return '<a class="btn ' + (cls || "") + '" href="/l/' + o.id + "/ask/" + s.ask + '" data-nav>' + (o.asks[s.ask].to === "friends" ? "Invite your team" : "Write the message") + "</a>";
    if (s.href) return '<a class="btn ' + (cls || "") + '" href="' + esc(s.href) + '" target="_blank" rel="noopener">Open ' + esc(domain(s.href)) + "</a>";
    return '<a class="btn sec ' + (cls || "") + '" href="/l/' + o.id + '" data-nav>See details</a>';
  }
  function nextUpHtml() {
    if (!state.grade && !state.picks.length) {
      return '<section class="gprompt" aria-labelledby="gpH"><h2 id="gpH">What grade are you in?</h2><p>You’ll see what you can enter this school year, with every deadline and the first thing to do.</p>' + gradeButtons() + "</section>";
    }
    const all = moves(), mineMode = state.picks.length > 0;
    const head = '<h2 class="h2" id="nxH">' + (mineMode ? "Next up" : "A good first step") + "</h2>";
    if (!all.length) return '<section aria-labelledby="nxH">' + head + '<div class="card"><p class="nx-t">Nothing due right now.</p><p class="nx-s">' + (mineMode ? "Every step on your list is done." : "Check what opens next below.") + "</p></div></section>";
    const x = all[0], o = x.o, s = x.s, d = x.d, n = C.days(NOW, d);
    const due = x.late ? "Overdue since " + dayText(s) : C.isMonth(s.by) ? "Due " + dayText(s) : "Due " + dayText(s) + ", " + (n === 0 ? "today" : n === 1 ? "tomorrow" : "in " + n + " days");
    const cls = x.late || (n <= 2 && !C.isMonth(s.by)) ? "r" : n <= 7 && !C.isMonth(s.by) ? "o" : "";
    const soon = all.slice(1).filter(y => !C.isMonth(y.s.by) && C.days(NOW, y.d) <= 7).length;
    return '<section aria-labelledby="nxH">' + head + '<div class="card"><p class="due ' + cls + '">' + esc(due) + '</p><p class="nx-t">' + esc(s.t) + '</p><p class="nx-s"><a href="/l/' + o.id + '" data-nav>' + esc(o.name) + "</a></p>" +
      '<div class="nx-a">' + actionButton(o, s, "") + (mineMode ? '<button type="button" class="tbtn" data-done="' + key(o, s) + '">Mark done</button>' : '<button type="button" class="tbtn" data-pick="' + o.id + '">Add ' + esc(o.short) + " to my list</button>") + "</div></div>" +
      '<p class="more">' + (mineMode ? '<a href="/season" data-nav>' + (soon ? soon + (soon === 1 ? " more step" : " more steps") + " due in the next 7 days" : "See your whole plan") + "</a>" : "Add listings to your list to get a plan with every step.") + "</p></section>";
  }
  function homeHtml() {
    return nextUpHtml() + '<div class="home-watch">' + watchHtml(null) + "</div>" +
      '<section class="desk-only" aria-labelledby="cuH"><h2 class="h2" id="cuH">Coming up<a href="/calendar" data-nav>Calendar</a></h2>' + comingList(comingItems(state.picks.length > 0).slice(0, 8)) + "</section>" + aboutHtml();
  }
  function aboutHtml() {
    return '<div class="about">' +
      '<section aria-labelledby="whyH"><h2 class="h2" id="whyH">Why this exists</h2><p>When I applied to business school, grades were nearly all that mattered. That has changed. Programs like Ivey, Rotman, Queen’s and Waterloo now look closely at what you’ve done outside class.</p><p>The opportunities exist, but the dates are scattered and the important steps are buried. This site puts them in one place, for the students who are where I was.</p></section>' +
      '<section aria-labelledby="checkH"><h2 class="h2" id="checkH">How we check facts</h2><p>Every fact here is quoted from the organizer’s own page. Each listing ends with the exact sentences and where they came from.</p><p>A script re-reads those pages to catch changes. Dates marked ~ are our estimates from past years, and “by” dates on steps are our advice.</p></section>' +
      '<section aria-labelledby="privH"><h2 class="h2" id="privH">Your privacy</h2><p>No accounts, no email, no tracking cookies. Your grade, your list and your ticks are saved only in your own browser.</p><p>Messages and calendar files are made on your device. Nothing about you is sent to us.</p></section>' +
      '<p class="fine">Grades mean your grade in the ' + esc(D.SEASON) + " school year. For next year’s rounds, we list the grades that will still be eligible when they open. Always confirm details with the organizer before you apply. Opening Bell is independent and isn’t affiliated with any organizer listed. Last checked " + esc(C.fmt(D.CHECKED)) + ".</p></div>";
  }

  /* ---------- Coming up: steps from your list, otherwise deadlines and openings for your grade ---------- */
  function comingItems(mineOnly) {
    const items = [];
    const src = mineOnly ? state.picks.map(id => BY[id]) : L.filter(o => eligible(o) && o._s.key !== "closed");
    src.forEach(o => {
      if (picked(o.id)) {
        o.steps.forEach(s => {
          if ((mine(s) || s.official) && C.endOf(s.by) >= NOW) items.push({ o, d: C.parse(s.by), t: s.t, step: true, month: C.isMonth(s.by), est: !!s.est, done: !!state.done[key(o, s)] });
        });
      } else if (o._s.key === "open") items.push({ o, d: C.parse(o.window.to), t: o.dates.filter(e => e.k === "deadline" && e.d === o.window.to).map(e => e.t)[0] || o.boardWhat, step: false, month: false });
      else if (o._s.key === "soon") items.push({ o, d: C.parse(o.window.from), t: "Applications open", step: false, month: false });
      else if (o.next) items.push({ o, d: C.parse(o.next.d), t: o._s.text, step: false, month: C.isMonth(o.next.d), est: !!o.next.est });
    });
    return items.sort((a, b) => a.d - b.d);
  }
  function comingList(items) {
    if (!items.length) return '<p class="empty">Nothing coming up.</p>';
    return '<ul class="up">' + items.map(x => {
      const dd = x.month ? '<span class="dd">' + (x.est ? "~" : "") + C.MON[x.d.getMonth()] + "<small>" + x.d.getFullYear() + "</small></span>"
        : '<span class="dd">' + x.d.getDate() + "<small>" + WD[x.d.getDay()] + (x.d.getMonth() !== NOW.getMonth() ? " " + C.MON[x.d.getMonth()] : "") + "</small></span>";
      return '<li><a href="/l/' + x.o.id + '" data-nav' + (x.done ? ' class="done"' : "") + ">" + dd + '<span class="tx">' + (x.step ? '<span class="dot" aria-hidden="true"></span>' : "") + esc(x.t) +
        "<small>" + esc(x.o.name) + (x.step ? (x.done ? ", done" : ", on your list") : "") + "</small></span></a></li>";
    }).join("") + "</ul>";
  }

  /* ---------- Calendar ---------- */
  function calendarHtml() {
    const has = state.picks.length > 0, mineOnly = state.calMine == null ? has : (state.calMine && has);
    const items = comingItems(mineOnly);
    const base = new Date(NOW.getFullYear(), NOW.getMonth() + state.calOffset, 1), y = base.getFullYear(), m = base.getMonth();
    const first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
    let g = ["S", "M", "T", "W", "T", "F", "S"].map(x => '<span class="wd" aria-hidden="true">' + x + "</span>").join("");
    for (let i = 0; i < first.getDay(); i++) g += "<span></span>";
    for (let dn = 1; dn <= days; dn++) {
      const d = new Date(y, m, dn), k = C.iso(d), its = items.filter(x => !x.month && C.iso(x.d) === k);
      const cls = ["c"]; if (d < NOW) cls.push("past"); if (k === C.iso(NOW)) cls.push("today");
      g += '<span class="' + cls.join(" ") + '"><span>' + dn + "</span>" + (its.length ? '<i class="' + (its.some(x => x.step) ? "" : "k") + '"></i>' : "") + "</span>";
    }
    const inMonth = items.filter(x => x.d.getFullYear() === y && x.d.getMonth() === m);
    const seg = has ? '<div class="seg" role="group" aria-label="Show"><button type="button" data-calmine="1" aria-pressed="' + mineOnly + '">My list</button><button type="button" data-calmine="0" aria-pressed="' + !mineOnly + '">' +
      (state.grade ? "Everything for Grade " + state.grade : "Everything") + "</button></div>" : "";
    return '<h1 class="lg">Calendar</h1>' + seg +
      '<div class="mh"><span>' + MONTH[m] + " " + y + '</span><span class="nav"><button type="button" data-calmonth="-1" aria-label="Previous month"' + (state.calOffset <= 0 ? " disabled" : "") + ">" + I.left +
      '</button><button type="button" data-calmonth="1" aria-label="Next month"' + (state.calOffset >= 11 ? " disabled" : "") + ">" + I.right + "</button></span></div>" +
      '<div class="cg">' + g + "</div>" + '<p class="fine">' + (mineOnly ? "Green dots are steps on your list, including closing dates." : "Dots mark closing dates. Add listings to your list to see every step.") + "</p>" +
      '<h2 class="h2">In ' + MONTH[m] + "</h2>" + comingList(inMonth) +
      (state.calOffset === 0 && items.some(x => x.d.getMonth() !== m || x.d.getFullYear() !== y) ? '<h2 class="h2">After that</h2>' + comingList(items.filter(x => !(x.d.getFullYear() === y && x.d.getMonth() === m)).slice(0, 6)) : "") +
      (state.picks.length ? '<p class="more"><button type="button" class="linkbtn" data-subscribe>Add my list to my phone’s calendar</button></p>' : "");
  }

  /* ---------- Listing: reads like a stock page ---------- */
  function roundPath(p, r) {
    let d = "M" + p[0][0] + "," + p[0][1];
    for (let i = 1; i < p.length - 1; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1], l1 = Math.hypot(x1 - x0, y1 - y0), l2 = Math.hypot(x2 - x1, y2 - y1);
      if (l1 < 0.01 || l2 < 0.01) { d += " L" + x1 + "," + y1; continue; }
      const rr = Math.min(r, l1 / 2, l2 / 2);
      d += " L" + (x1 - (x1 - x0) / l1 * rr) + "," + (y1 - (y1 - y0) / l1 * rr) + " Q" + x1 + "," + y1 + " " + (x1 + (x2 - x1) / l2 * rr) + "," + (y1 + (y2 - y1) / l2 * rr);
    }
    const l = p[p.length - 1];
    return d + " L" + l[0] + "," + l[1];
  }
  /* Your plan as a chart: it climbs one level for each step, from today to the last one */
  function planChart(o) {
    const steps = o.steps.filter(s => C.endOf(s.by) >= NOW).sort((a, b) => C.parse(a.by) - C.parse(b.by));
    if (!steps.length) return "";
    const W = isDesk() ? 640 : Math.min(600, Math.max(280, document.documentElement.clientWidth - 32)), H = W > 500 ? 220 : 184;
    const padL = 6, padR = 18, top = 32, bottom = H - 30, N = steps.length;
    const start = addDays(NOW, -4), lastD = C.parse(steps[N - 1].by), end = addDays(lastD, Math.max(3, Math.round(C.days(start, lastD) * 0.05)));
    const x = d => +(padL + (W - padL - padR) * ((d - start) / (end - start))).toFixed(1), y = k => +(bottom - (bottom - top) * (k / N)).toFixed(1);
    const pts = [[x(NOW), y(0)]];
    steps.forEach((s, i) => { const sx = x(C.parse(s.by)); pts.push([sx, y(i)], [sx, y(i + 1)]); });
    const label = steps.map(s => s.t + ", " + dayText(s)).join("; ");
    let svg = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Plan: ' + esc(label) + '">';
    for (let mm = new Date(start.getFullYear(), start.getMonth() + 1, 1); mm <= end; mm = new Date(mm.getFullYear(), mm.getMonth() + 1, 1)) {
      const cx = x(mm); if (cx - x(NOW) < 34 && cx - x(NOW) > -4) continue;
      svg += '<line class="grid" x1="' + cx + '" y1="' + (top - 18) + '" x2="' + cx + '" y2="' + bottom + '"/><text x="' + (cx + 4) + '" y="' + (H - 8) + '">' + C.MON[mm.getMonth()] + "</text>";
    }
    svg += '<line class="grid" x1="' + padL + '" y1="' + bottom + '" x2="' + (W - padR) + '" y2="' + bottom + '"/>';
    svg += '<line class="past" x1="' + x(start) + '" y1="' + y(0) + '" x2="' + x(NOW) + '" y2="' + y(0) + '"/>';
    svg += '<line class="today" x1="' + x(NOW) + '" y1="' + (top - 18) + '" x2="' + x(NOW) + '" y2="' + bottom + '"/><text class="k" x="' + (x(NOW) + 5) + '" y="' + (H - 8) + '">Today</text>';
    svg += '<path class="plan" d="' + roundPath(pts, 7) + '"/>';
    steps.forEach((s, i) => {
      const cx = x(C.parse(s.by)), cy = y(i + 1), done = !!state.done[key(o, s)], f = done || i === N - 1;
      svg += '<circle class="dot' + (f ? " f" : "") + '" cx="' + cx + '" cy="' + cy + '" r="10"/><text class="num' + (f ? " f" : "") + '" x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle">' + (done ? "✓" : o.steps.indexOf(s) + 1) + "</text>";
    });
    const ls = steps[N - 1];
    svg += '<text class="k" x="' + (x(C.parse(ls.by)) - 16) + '" y="' + (y(N) + 4) + '" text-anchor="end">' + (ls.official ? "Closes " : "") + esc(C.fmtShort(ls.by, ls.est)) + "</text>";
    return svg + "</svg>";
  }
  function stepsHtml(o) {
    return '<ol class="steps">' + o.steps.map((st, i) => {
      const k = key(o, st), done = !!state.done[k], m = mine(st), late = !done && m && C.endOf(st.by) < NOW;
      const box = m ? '<button type="button" class="ck" data-done="' + k + '" aria-pressed="' + done + '" aria-label="' + (done ? "Mark not done: " : "Mark done: ") + esc(st.t) + '">' + (done ? I.check : '<span aria-hidden="true">' + (i + 1) + "</span>") + "</button>"
        : '<span class="ckn" aria-hidden="true">' + (i + 1) + "</span>";
      const who = !m && WHO[st.who] ? WHO[st.who] + ". " : "";
      const when = st.official ? "Closing date: " + dayText(st) : "By " + dayText(st);
      const go = done ? "" : (st.ask && o.asks[st.ask] ? '<a class="btn sm" href="/l/' + o.id + "/ask/" + st.ask + '" data-nav>' + (o.asks[st.ask].to === "friends" ? "Invite your team" : "Write the message") + "</a>" : "") +
        (st.href ? '<a class="btn sm sec" href="' + esc(st.href) + '" target="_blank" rel="noopener">Open ' + esc(domain(st.href)) + "</a>" : "");
      return '<li class="' + (done ? "done" : "") + '">' + box + "<div><b>" + esc(st.t) + '</b><span class="by' + (st.official ? " off" : "") + (late ? " late" : "") + '">' + esc(who + when) + (late ? ". Overdue" : "") + "</span>" +
        (st.note ? '<span class="note">' + esc(st.note) + "</span>" : "") + (go ? '<span class="go">' + go + "</span>" : "") + "</div></li>";
    }).join("") + "</ol>";
  }
  function listingHtml(o) {
    const s = o._s, b = bigStatus(o), pk = picked(o.id), gr = C.gradeRow(o, state.grade, s);
    const nextS = C.upcoming(o, NOW, state.done).filter(mine)[0];
    let primary = "";
    if (pk && nextS && nextS.ask && o.asks[nextS.ask]) primary = '<a class="btn green" href="/l/' + o.id + "/ask/" + nextS.ask + '" data-nav>' + ASK_ACT[o.asks[nextS.ask].to] + "</a>";
    else if (pk && nextS && nextS.href) primary = '<a class="btn green" href="' + esc(nextS.href) + '" target="_blank" rel="noopener">Open ' + esc(domain(nextS.href)) + "</a>";
    const listBtn = '<button type="button" class="btn ' + (pk ? "sec" : "green") + '" data-pick="' + o.id + '" aria-pressed="' + pk + '">' + (pk ? I.listOn + "On my list" : I.list + "Add to my list") + "</button>";
    const overdue = pk ? o.steps.filter(st => mine(st) && !state.done[key(o, st)] && C.endOf(st.by) < NOW).length : 0;
    const chart = planChart(o);
    const can = (gr ? [gr] : []).concat(o.can);
    const kd = o.dates.map(x => '<li class="' + (C.endOf(x.d) < NOW ? "past" : "") + '"><time>' + esc(x.show || C.fmtShort(x.d, x.est)) + "</time><span>" + esc(x.t) + (x.est ? '<span class="est">estimate</span>' : "") + "</span></li>").join("");
    return '<div class="lbar"><button type="button" data-back aria-label="Back">' + I.back + '</button><button type="button" data-share="' + o.id + '" aria-label="Share ' + esc(o.name) + '">' + I.share + "</button></div>" +
      '<p class="lt">' + esc(o.tk) + '</p><h1 class="ln">' + esc(o.name) + '</h1><p class="lorg">' + esc(D.TYPE_LABEL[o.type]) + " by " + esc(o.org) + "</p>" +
      '<p class="big">' + esc(b.big) + '</p><p class="chg ' + b.cls + '">' + esc(b.line) + "</p>" +
      (o.lastGrade && o.lastGrade === state.grade ? '<p class="lastyr">Grade ' + state.grade + " is the last year you can enter.</p>" : "") +
      (chart ? '<div class="chead"><b>' + (pk ? "Your plan" : "The plan") + "</b>" + (pk ? (overdue ? '<span class="r">' + C.plural(overdue, "step") + " overdue</span>" : "<span>On track</span>") : "") + "</div>" + chart : "") +
      '<div class="acts">' + primary + listBtn + "</div>" +
      '<h2 class="h2">Before you start</h2><ul class="can">' + can.map(c => '<li><span class="m ' + c.k + '" aria-hidden="true">' + MARK[c.k] + "</span><div><b>" + esc(c.t) + "</b>" + (c.s ? "<small>" + esc(c.s) + "</small>" : "") + "</div></li>").join("") + "</ul>" +
      '<h2 class="h2">How to get in</h2>' + stepsHtml(o) +
      '<h2 class="h2">Key facts</h2><dl class="facts"><div><dt>Cost</dt><dd>' + esc(o.cost) + (o.aid ? '<span class="aid">' + esc(o.aid) + "</span>" : "") + "</dd></div>" +
        "<div><dt>To enter</dt><dd>" + esc(o.entry) + "</dd></div><div><dt>Format</dt><dd>" + esc(o.format) + "</dd></div><div><dt>Where</dt><dd>" + esc(o.where) + "</dd></div><div><dt>Grades</dt><dd>" + esc(o.gradeNote) + "</dd></div></dl>" +
      '<h2 class="h2">Key dates</h2><ol class="kd">' + kd + '</ol><p class="more"><button type="button" class="linkbtn" data-cal="' + o.id + '">Download these dates for your calendar</button></p>' +
      '<h2 class="h2">Why it’s worth it</h2><p class="why">' + esc(o.why) + "</p>" +
      '<h2 class="h2">Where these facts come from</h2><div id="rc-' + o.id + '" class="rc"><p class="fine">Loading the organizer’s own words…</p></div>' +
      '<p class="fine">Checked ' + esc(C.fmt(D.CHECKED)) + ". Always confirm with the organizer before you apply." +
      (REPORT_EMAIL ? ' <a class="u" href="mailto:' + esc(REPORT_EMAIL) + "?subject=" + encodeURIComponent("Mistake on " + o.name) + '">Report a mistake</a>' : "") + "</p>";
  }

  /* ---------- Receipts: the organizer's exact words behind each fact ---------- */
  let receiptsCache = null;
  function loadReceipts(id) {
    function paint(all) {
      const box = $("#rc-" + id); if (!box) return;
      const list = (all && all[id]) || [];
      box.innerHTML = list.length ? '<ul class="src">' + list.map(r => "<li>“" + esc(r.quote) + '”<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' +
        esc(r.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")) + (r.manual ? ", checked by hand" : "") + "</a></li>").join("") + "</ul>" : '<p class="fine">No sources found.</p>';
    }
    if (receiptsCache) return paint(receiptsCache);
    fetch("/data/receipts.json").then(r => r.json()).then(j => { receiptsCache = j; paint(j); })
      .catch(() => { const box = $("#rc-" + id); if (box) box.innerHTML = '<p class="fine">Couldn’t load the sources. Check your connection and try again.</p>'; });
  }

  /* ---------- My list ---------- */
  function todoHtml(o, s) {
    const k = key(o, s), done = !!state.done[k], late = !done && C.endOf(s.by) < NOW;
    return '<li class="' + (done ? "done" : "") + '"><button type="button" class="ck" data-done="' + k + '" aria-pressed="' + done + '" aria-label="' + (done ? "Mark not done: " : "Mark done: ") + esc(s.t) + '">' + (done ? I.check : "") + "</button>" +
      "<div><b>" + esc(s.t) + '</b><span class="by' + (late ? " late" : "") + '"><a href="/l/' + o.id + '" data-nav>' + esc(o.tk) + "</a>. " + (s.official ? "Closing date: " : "By ") + esc(dayText(s)) + (late ? ". Overdue" : "") + "</span>" +
      (done ? "" : '<span class="go">' + (s.ask && o.asks[s.ask] ? '<a class="btn sm" href="/l/' + o.id + "/ask/" + s.ask + '" data-nav>' + (o.asks[s.ask].to === "friends" ? "Invite your team" : "Write the message") + "</a>" : "") +
        (s.href ? '<a class="btn sm sec" href="' + esc(s.href) + '" target="_blank" rel="noopener">Open ' + esc(domain(s.href)) + "</a>" : "") + "</span>") + "</div></li>";
  }
  function seasonHtml() {
    const picks = state.picks.map(id => BY[id]);
    if (!picks.length) {
      const sugg = L.filter(o => eligible(o) && o._s.key === "open").slice(0, 4);
      return '<h1 class="lg">My list</h1><p class="lede">Add competitions and programs to your list. You’ll get one plan with every step, who to ask and what to say.</p>' +
        (sugg.length ? '<h2 class="h2">Open now' + (state.grade ? " for Grade " + state.grade : "") + '</h2><ul class="list">' + sugg.map(o => rowHtml(o, null)).join("") + "</ul>" : "") +
        '<p class="more"><a href="/" data-nav>See every listing</a></p>';
    }
    const all = [];
    picks.forEach(o => o.steps.forEach(s => all.push({ o, s, d: C.parse(s.by) })));
    all.sort((a, b) => a.d - b.d);
    const mineAll = all.filter(x => mine(x.s)), doneN = mineAll.filter(x => state.done[key(x.o, x.s)]).length;
    const weekEnd = addDays(NOW, 7);
    const open = mineAll.filter(x => !state.done[key(x.o, x.s)] && !(C.endOf(x.s.by) < NOW && x.o._s.key === "closed"));
    const thisWeek = open.filter(x => C.endOf(x.s.by) <= weekEnd && !C.isMonth(x.s.by));
    const later = open.filter(x => thisWeek.indexOf(x) < 0);
    const doneList = mineAll.filter(x => state.done[key(x.o, x.s)]);
    const pct = mineAll.length ? Math.round(doneN / mineAll.length * 100) : 0;
    return '<h1 class="lg">My list</h1>' +
      '<p class="sum"><b>' + doneN + " of " + mineAll.length + "</b> steps done" + (state.grade ? ", Grade " + state.grade : "") + "</p>" +
      '<div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Steps done"><i style="width:' + pct + '%"></i></div>' +
      '<ul class="list">' + picks.map(o => rowHtml(o, null)).join("") + "</ul>" +
      '<h2 class="h2">' + (thisWeek.length ? "This week" : "Nothing due this week") + "</h2>" +
      (thisWeek.length ? '<ol class="steps">' + thisWeek.map(x => todoHtml(x.o, x.s)).join("") + "</ol>" : '<p class="empty">Your next step is below.</p>') +
      (later.length ? '<h2 class="h2">Later</h2><ol class="steps">' + later.map(x => todoHtml(x.o, x.s)).join("") + "</ol>" : "") +
      (doneList.length ? '<details class="donelist"><summary>Done (' + doneList.length + ')</summary><ol class="steps">' + doneList.map(x => todoHtml(x.o, x.s)).join("") + "</ol></details>" : "") +
      '<div class="sea-acts"><button type="button" class="btn green" data-subscribe>Add my list to my phone’s calendar</button>' +
      "<p>Every step and closing date, in the calendar you already use. It updates itself if a date changes. No account needed.</p>" +
      '<button type="button" class="btn sec" data-sendparent>Send to a parent</button>' +
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
    const head = '<h1 class="lg">Your teen’s season</h1><p class="lede">' + (p.grade ? "Grade " + p.grade + ". " : "") + C.plural(picks.length, "pick") + ", shared from Opening Bell.</p>";
    if (!picks.length) return head + '<p class="empty">This link doesn’t include any listings. Ask your teen to send it again from My list.</p>';
    const items = [];
    picks.forEach(o => o.steps.forEach(s => { if ((mine(s) || s.official) && C.endOf(s.by) >= NOW) items.push({ o, s, d: C.parse(s.by) }); }));
    items.sort((a, b) => a.d - b.d);
    const coming = items.slice(0, 7).map(x => '<li><a href="/l/' + x.o.id + '" data-nav><span class="dd">' + (C.isMonth(x.s.by) ? (x.s.est ? "~" : "") + C.MON[x.d.getMonth()] : x.d.getDate()) + "<small>" +
      (C.isMonth(x.s.by) ? x.d.getFullYear() : WD[x.d.getDay()] + " " + C.MON[x.d.getMonth()]) + '</small></span><span class="tx">' + esc(x.s.t) + "<small>" + esc(x.o.name) + (x.s.official ? ", closing date" : "") + "</small></span></a></li>").join("");
    const help = [];
    picks.forEach(o => o.parent.forEach(h => help.push('<li><b>' + esc(h.t) + "</b><small>" + esc(h.s) + ' <a class="u" href="/l/' + o.id + '" data-nav>' + esc(o.short) + ", from " + esc(o.src.name) + "</a></small></li>")));
    const costs = picks.map(o => "<div><dt>" + esc(o.name) + "</dt><dd>" + esc(o.costShort) + (o.aid ? '<span class="aid">' + esc(o.aid) + "</span>" : "") + "</dd></div>").join("");
    const what = picks.map(o => '<li><a class="r" href="/l/' + o.id + '" data-nav><span class="r-l"><span class="tk">' + esc(o.name) + '</span><span class="nm wrap">' + esc(o.why) + "</span></span>" + pill(o) + "</a></li>").join("");
    return head +
      '<h2 class="h2">Coming up</h2><ul class="up">' + (coming || '<li><span class="tx">Nothing coming up right now.</span></li>') + "</ul>" +
      '<h2 class="h2">Where you can help</h2><ul class="can help">' + help.join("") + "</ul>" +
      '<h2 class="h2">Costs at a glance</h2><dl class="facts">' + costs + "</dl>" +
      '<div class="sea-acts"><button type="button" class="btn green" data-subscribe-parent>Add these dates to my calendar</button><p>It updates itself if a date changes. No account needed.</p></div>' +
      '<h2 class="h2">What each one is</h2><ul class="list">' + what + "</ul>" +
      '<p class="fine">No account. Nothing is tracked. Your teen chose what to share. Every fact on Opening Bell is quoted from the organizer, and each listing shows its sources.</p>';
  }

  /* ---------- Sheets: the message writer, calendar options and the grade picker ---------- */
  function askSheet(o, a) {
    const st = o.steps.filter(s => s.ask === a.id)[0], done = !!state.done[key(o, st)];
    const third = a.to === "friends" ? '<a class="btn sec" data-asksms href="#">Text</a>' : '<a class="btn sec" data-askmail href="#">Email</a>';
    return '<div class="grab" aria-hidden="true"></div><div class="sh-head"><div class="sh-top"><p class="sh-k">' + esc(o.name) + '</p><button type="button" class="x" data-close aria-label="Close">' + I.close + "</button></div>" +
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
    return '<div class="grab" aria-hidden="true"></div><div class="sh-head"><div class="sh-top"><p class="sh-k">' + (forParent ? "Your calendar" : "Your phone’s calendar") + '</p><button type="button" class="x" data-close aria-label="Close">' + I.close + "</button></div>" +
      '<h2 id="shTitle" tabindex="-1">' + (forParent ? "Add these dates to your calendar" : "Add your list to your calendar") + '</h2><p class="sh-sub">Every step and closing date for ' + esc(names) + ". When a date changes, it changes in your calendar too.</p></div>" +
      '<div class="sh-body"><div class="opts">' +
        '<a class="opt" href="' + esc(webcal) + '"><b>iPhone, iPad or Mac</b><small>Apple Calendar asks you to subscribe.</small></a>' +
        '<a class="opt" href="https://calendar.google.com/calendar/render?cid=' + encodeURIComponent(webcal) + '" target="_blank" rel="noopener"><b>Google Calendar</b><small>Opens Google Calendar. On a phone, you may need to finish on a computer.</small></a>' +
        '<a class="opt" href="https://outlook.live.com/calendar/0/addfromweb?url=' + encodeURIComponent(https) + "&amp;name=" + encodeURIComponent("Opening Bell") + '" target="_blank" rel="noopener"><b>Outlook</b><small>Opens Outlook on the web.</small></a>' +
        '<button type="button" class="opt" data-copyfeed="' + esc(https) + '"><b>Copy the calendar link</b><small>For any other app: add a calendar “from URL” and paste it.</small></button></div>' +
        '<p class="hint">Calendar apps check for changes on their own schedule, usually within a day. Each step has a reminder the day before, but some apps ignore reminders in subscribed calendars. If you don’t get alerts, check this calendar’s notification settings in your app.</p>' +
        (forParent ? "" : '<p class="fine">Ticks you make on Opening Bell stay on this device, so the calendar shows every step. <button type="button" class="linkbtn" data-calseason>Download a one-time file instead</button> (it won’t update).</p>') +
      '</div><div class="sh-bar"><button type="button" class="btn sec" data-close>Done</button></div>';
  }
  function gradeSheet() {
    return '<div class="grab" aria-hidden="true"></div><div class="sh-head"><div class="sh-top"><p class="sh-k">Your grade</p><button type="button" class="x" data-close aria-label="Close">' + I.close + "</button></div>" +
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
  document.addEventListener("click", e => {
    let t, ctx;
    if (e.target.closest("[data-close]") || e.target.id === "scrim") { closeSheet(); return; }
    if (e.target.closest("[data-back]")) { if (depth > 0) history.back(); else go("/", true); return; }
    if (e.target.closest("[data-theme-toggle]")) { setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"); return; }
    if (e.target.closest("[data-grade-open]")) { openSheet(gradeSheet(), false); return; }
    if ((t = e.target.closest("[data-g]"))) { setGrade(Number(t.dataset.g)); return; }
    if ((t = e.target.closest("[data-f]"))) { state.filter = t.dataset.f; refresh(); return; }
    if (e.target.closest("[data-all]")) { state.allGrades = !state.allGrades; refresh(); return; }
    if ((t = e.target.closest("[data-calmine]"))) { state.calMine = t.dataset.calmine === "1"; refresh(); return; }
    if ((t = e.target.closest("[data-calmonth]"))) { state.calOffset = Math.max(0, Math.min(11, state.calOffset + Number(t.dataset.calmonth))); refresh(); return; }
    if ((t = e.target.closest("[data-pick]"))) { e.preventDefault(); togglePick(t.dataset.pick); return; }
    if ((t = e.target.closest("[data-done]"))) { toggleDone(t.dataset.done); return; }
    if ((t = e.target.closest("[data-share]"))) { share(BY[t.dataset.share]); return; }
    if ((t = e.target.closest("[data-cal]"))) { downloadIcs([BY[t.dataset.cal]], BY[t.dataset.cal].short, "opening-bell-" + t.dataset.cal); return; }
    if (e.target.closest("[data-subscribe]")) { if (state.picks.length) openSheet(subscribeSheet(state.picks, false), false); return; }
    if (e.target.closest("[data-subscribe-parent]")) { const pp = parentPicks(); if (pp.ids.length) openSheet(subscribeSheet(pp.ids, true), false); return; }
    if ((t = e.target.closest("[data-copyfeed]"))) { copy(t.dataset.copyfeed, "Calendar link copied. In your calendar app, add a calendar from URL and paste it."); return; }
    if (e.target.closest("[data-sendparent]")) { sendToParent(); return; }
    if (e.target.closest("[data-calseason]")) { downloadIcs(state.picks.map(id => BY[id]), "your list", "opening-bell-list"); return; }
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
  /* Charts are drawn for the screen width, so redraw a listing when it changes a lot */
  let lastW = document.documentElement.clientWidth, resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = document.documentElement.clientWidth;
      if (Math.abs(w - lastW) > 40 && /^l:/.test(page || "")) { lastW = w; refresh(); }
    }, 200);
  });

  function sendToParent() {
    const url = location.origin + parentPath();
    const data = { title: "My Opening Bell list", text: "Here’s my list on Opening Bell: what’s coming up, what it costs and where you can help.", url };
    if (navigator.share) { navigator.share(data).catch(() => {}); return; }
    copy(url, "Link copied. Send it to a parent by text or email.");
  }
  function share(o) {
    const data = { title: o.name + " · Opening Bell", text: o.name + ": " + bigStatus(o).big, url: o.link };
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
      const blob = new Blob([C.ics(list, { name: "Opening Bell" + (list.length === 1 ? ": " + list[0].short : "") })], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = file + ".ics";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast("Calendar file downloaded. Open it to add " + label + "’s steps and closing dates.");
    } catch (err) { toast("Couldn’t create the calendar file in this browser."); }
  }

  render(false);
})();
