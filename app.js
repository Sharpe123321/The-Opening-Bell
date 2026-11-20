/* Opening Bell: the Board, the details sheet, the Ask, My Season, and (as each stage ships)
 * the parent view and the Trail. No framework and no build step. All listing facts come from
 * data/listings.js; all date and wording logic comes from lib/core.js.
 */
(function () {
  "use strict";
  var D = window.OB_DATA, C = window.OB_CORE;

  /* Stages ship in order. A feature stays hidden until its stage is built and tested. */
  var FEATURES = { ask: true, season: true, subscribe: true, trail: false };
  var REPORT_EMAIL = null; /* set an address to show "Report a mistake" on every listing */

  var NOW = C.today();
  var L = C.prepare(D, location.origin);
  var BY = {};
  L.forEach(function (o) { BY[o.id] = o; o._s = C.status(o, NOW); });
  L.sort(function (a, b) { return a._s.rank - b._s.rank || a._s.n - b._s.n; });

  /* ---------- Small helpers ---------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("ob:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("ob:" + k, JSON.stringify(v)); } catch (e) {} }
  };
  var state = {
    grade: store.get("grade", null), filter: "all", allGrades: false,
    picks: (store.get("picks", []) || []).filter(function (id) { return BY[id]; }),
    done: store.get("done", {}) || {}
  };
  if ([9, 10, 11, 12].indexOf(state.grade) < 0) state.grade = null;
  var ICON = { ok: "✓", warn: "!", no: "✕" };
  var WHO = { you: "You", teacher: "Teacher", advisor: "Advisor", parent: "Parent", friends: "Friends", school: "Your school" };
  var ASK_CHIP = { teacher: "Ask a teacher", parent: "Ask an adult", friends: "Invite friends", counsellor: "Ask a counsellor" };
  var ASK_TO = { teacher: "A teacher", parent: "A parent or other adult", friends: "Friends", counsellor: "Your counsellor" };
  var toastTimer;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 4200); }
  function isPhone() { return !window.matchMedia("(min-width: 1100px)").matches; }
  function eligible(o) { return !state.grade || o.grades.indexOf(state.grade) >= 0; }
  function picked(id) { return state.picks.indexOf(id) >= 0; }
  function key(o, s) { return o.id + ":" + s.id; }
  function mine(s) { return s.who === "you" || !!s.ask; }
  function askChipClass(a) { return a.to === "friends" ? "friends" : (a.to === "parent" ? "parent" : "teacher"); }
  function whoChip(o, s) {
    if (s.ask && o.asks[s.ask]) return '<span class="act ' + askChipClass(o.asks[s.ask]) + '">' + esc(ASK_CHIP[o.asks[s.ask].to]) + "</span>";
    return '<span class="act ' + esc(s.who) + '">' + esc(s.who === "org" ? o.short : WHO[s.who]) + "</span>";
  }
  function dueLabel(o, s) {
    var d = C.fmtShort(s.by, s.est).toUpperCase();
    if (s.official) return '<span class="dt off">' + d + " · Official deadline</span>";
    return '<span class="dt">' + (mine(s) ? "Do by " : "By ") + d + "</span>";
  }
  function askButton(o, s, small) {
    if (!FEATURES.ask || !s.ask || !o.asks[s.ask]) return "";
    return '<a class="btn ' + (small ? "sm " : "") + 'gold" href="/l/' + o.id + "/ask/" + s.ask + '" data-nav>' + (o.asks[s.ask].to === "friends" ? "Invite" : "✉ Message") + "</a>";
  }
  function openButton(s) { return s.href ? '<a class="btn sm" href="' + esc(s.href) + '" target="_blank" rel="noopener">Open ↗</a>' : ""; }

  /* ---------- Routing: real paths, so every listing and every ask has a shareable link ---------- */
  function parseRoute(path) {
    var m;
    if ((m = /^\/l\/([a-z0-9-]+)\/ask\/([a-z0-9-]+)\/?$/.exec(path)) && FEATURES.ask) return { name: "ask", id: m[1], ask: m[2] };
    if ((m = /^\/l\/([a-z0-9-]+)(\/.*)?$/.exec(path))) return { name: "listing", id: m[1] };
    if (path === "/season" && FEATURES.season) return { name: "season" };
    if (path === "/parent" && FEATURES.subscribe) return { name: "parent" };
    if (path === "/trail" && FEATURES.trail) return { name: "trail" };
    return { name: "home" };
  }
  var page = null, basePath = "/", depth = 0, baseDepth = 0, lastFocus = null;
  history.replaceState({ d: 0 }, "", location.pathname + location.search);
  function go(path, replace) {
    if (replace) history.replaceState({ d: depth }, "", path); else { depth++; history.pushState({ d: depth }, "", path); }
    render();
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-nav]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    e.preventDefault();
    if (/^\/l\//.test(a.getAttribute("href")) && $("#panel").hidden) lastFocus = a;
    go(a.getAttribute("href"));
  });
  window.addEventListener("popstate", function (e) { depth = (e.state && e.state.d) || 0; render(); });

  function isOverlay(r) { return r.name === "listing" || r.name === "ask"; }
  function render() {
    var r = parseRoute(location.pathname);
    if (isOverlay(r) && !BY[r.id]) { history.replaceState({ d: depth }, "", "/"); r = { name: "home" }; }
    if (r.name === "ask") {
      var o = BY[r.id], a = o.asks[r.ask], step = o.steps.filter(function (s) { return s.ask === r.ask; })[0];
      if (!a || !step) { history.replaceState({ d: depth }, "", "/l/" + r.id); r = { name: "listing", id: r.id }; }
    }
    var base = isOverlay(r) ? (page || "home") : (r.name === "parent" ? "parent" + location.search : r.name);
    if (!isOverlay(r)) { basePath = location.pathname + location.search; baseDepth = depth; }
    if (base !== page) { page = base; renderPage(); window.scrollTo(0, 0); }
    if (r.name === "listing") { openPanel(sheetHtml(BY[r.id]), BY[r.id]); document.title = BY[r.id].name + " · Opening Bell"; }
    else if (r.name === "ask") { var ob = BY[r.id]; openPanel(askHtml(ob, ob.asks[r.ask]), ob); document.title = ob.asks[r.ask].title + " · " + ob.short + " · Opening Bell"; }
    else { closePanelNow(); document.title = page === "season" ? "Your season · Opening Bell" : /^parent/.test(page) ? "Your teen's season · Opening Bell" : "Opening Bell · Business competitions for Ontario high school students"; }
  }
  function renderPage() {
    var app = $("#app");
    if (page === "season") { app.innerHTML = seasonPageHtml(); drawArt(); renderSeason(); return; }
    if (/^parent/.test(page)) { app.innerHTML = parentPageHtml(); drawArt(); return; }
    app.innerHTML = homeHtml();
    drawArt();
    bindHome();
  }
  /* Something changed (a pick or a tick): repaint what shows it, keep the reader's place */
  function refresh() {
    updateNav();
    if (page === "home") { renderMoves(); renderBoard(); }
    if (page === "season") renderSeason();
    var r = parseRoute(location.pathname), panel = $("#panel");
    if (panel.hidden) return;
    if (r.name === "listing") repaintPanel(sheetHtml(BY[r.id]));
    if (r.name === "ask") {
      var o = BY[r.id], st = o.steps.filter(function (s) { return s.ask === r.ask; })[0], b = $("[data-done]", panel);
      if (b && st) { var done = !!state.done[key(o, st)]; b.setAttribute("aria-pressed", done); $(".box", b).textContent = done ? "✓" : ""; $("b", b).textContent = done ? "Done" : "Mark as done"; }
    }
  }
  function repaintPanel(html) {
    var panel = $("#panel"), body = $(".sh-body", panel), top = body ? body.scrollTop : 0;
    var f = document.activeElement, fsel = f && f.dataset && (f.dataset.pick ? '[data-pick="' + f.dataset.pick + '"]' : f.dataset.done ? '[data-done="' + f.dataset.done + '"]' : null);
    panel.innerHTML = html;
    body = $(".sh-body", panel); if (body) body.scrollTop = top;
    if (fsel && $(fsel, panel)) $(fsel, panel).focus({ preventScroll: true });
  }

  /* ---------- Picks and ticks (saved only in this browser) ---------- */
  function togglePick(id) {
    var o = BY[id], i = state.picks.indexOf(id);
    if (i >= 0) { state.picks.splice(i, 1); toast("Removed " + o.short + " from your season."); }
    else { state.picks.push(id); toast("Added " + o.short + " to your season. Your steps are in My Season."); }
    store.set("picks", state.picks);
    refresh();
  }
  function toggleDone(k) {
    if (state.done[k]) delete state.done[k]; else state.done[k] = true;
    store.set("done", state.done);
    refresh();
  }

  /* ---------- Pixel art ---------- */
  var SUNRISE = { sky: ["#3B3F8F", "#5B4FA0", "#8E5BA6", "#D9677A", "#F59563", "#FFC46B"], sun: "#FFF1B8", sunEdge: "#FFD86B", cloud: "#FFE3D0", cloudShade: "#E9A99A", far: "#7A5A9C", near: "#1E2150", window: "#FFC23D", water: "#2A3070", waterHi: "#5B6CC8", reflect: "#FFC46B", litChance: 0.6 };
  var artWidth = 0;
  function drawArt() {
    document.querySelectorAll("canvas.bell").forEach(function (c) { if (!c.dataset.drawn) { drawSprite(c, BELL, { X: "#16193A", Y: "#FFC23D", H: "#FFF1B8", C: "#16193A" }); c.dataset.drawn = 1; } });
    var cv = $("canvas.sky"); if (!cv) return;
    var host = cv.parentNode, wide = window.innerWidth >= 900, small = host.classList.contains("sm"), px = wide ? 3 : 2.44;
    artWidth = host.clientWidth;
    cv.width = Math.max(1, Math.round(host.clientWidth / px)); cv.height = Math.max(1, Math.round(host.clientHeight / px));
    drawSkyline(cv, { seed: 11, sunX: 0.78, sunY: 0.62, sunR: wide ? 14 : 9, towerX: wide ? 0.66 : (small ? 0.86 : 0.3), heightScale: small ? 0.5 : (wide ? 0.72 : 1),
      clouds: [[0.06, 0.18, 26], [0.55, 0.12, 30], [0.82, 0.3, 20]], palette: SUNRISE });
  }
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { var cv = $("canvas.sky"); if (cv && cv.parentNode.clientWidth !== artWidth) drawArt(); }, 150);
  });

  /* ---------- Header ---------- */
  function navHtml(back) {
    return '<nav class="nav" aria-label="Main"><a class="logo" href="/" data-nav><canvas class="bell" width="14" height="12" aria-hidden="true"></canvas>Opening Bell</a>' +
      '<div class="nav-r">' + (back ? '<a class="navchip" href="/" data-nav>← The Board</a>' : '<span class="navchip wide-only">Ontario · Business</span>') +
      (FEATURES.season && !back ? '<a class="navchip" id="seasonChip" href="/season" data-nav>My season<b>' + state.picks.length + "</b></a>" : "") + "</div></nav>";
  }
  function updateNav() { var c = $("#seasonChip b"); if (c) c.textContent = state.picks.length; }
  function heroHtml() {
    return '<header class="hero"><canvas class="sky" aria-hidden="true"></canvas><div class="hero-in wrap">' + navHtml(false) +
      '<p class="tag">' + esc(D.SEASON) + " season</p><h1>Know what to do this week.</h1></div></header>";
  }

  /* ---------- Home ---------- */
  function gradeHtml() {
    return '<section class="grade" aria-labelledby="gradeQ"><p id="gradeQ">What grade are you in?</p><div class="gbtns" role="group" aria-labelledby="gradeQ">' +
      [9, 10, 11, 12].map(function (g) { return '<button type="button" data-g="' + g + '" aria-pressed="' + (state.grade === g) + '">' + g + "</button>"; }).join("") + "</div></section>";
  }
  function homeHtml() {
    return heroHtml() +
      '<main id="main"><div class="wrap">' + gradeHtml() + '<section aria-labelledby="movesH"><div class="sec"><h2 id="movesH">Your next moves</h2><span class="lab" id="movesSub"></span></div><div id="movesBox"></div></section></div>' +
      '<nav class="strip" id="strip" aria-label="Closing soon"></nav>' +
      '<div class="wrap"><section aria-labelledby="boardH"><div class="sec"><h2 id="boardH">The Board</h2><span class="lab">Checked ' + esc(C.fmt(D.CHECKED)) + '</span></div><div class="filters" id="filters" role="group" aria-label="Filter listings"></div><p class="scope" id="scope"></p><div class="board" id="board"></div></section>' +
      aboutHtml() + "</div></main>";
  }
  function bindHome() {
    $(".gbtns").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-g]"); if (!b) return;
      state.grade = Number(b.dataset.g); store.set("grade", state.grade); state.allGrades = false;
      document.querySelectorAll(".gbtns button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      renderMoves(); renderBoard();
    });
    $("#filters").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-f]"); if (!b) return;
      state.filter = b.dataset.f; renderBoard();
    });
    $("#scope").addEventListener("click", function (e) {
      if (e.target.closest("[data-all]")) { state.allGrades = !state.allGrades; renderBoard(); }
    });
    renderMoves(); renderStrip(); renderBoard();
  }

  /* Your next moves: from your season if you have picks, otherwise for your grade */
  function nextMoves(limit) {
    var src = state.picks.length ? state.picks.map(function (id) { return BY[id]; }) : L.filter(eligible);
    var all = [];
    src.forEach(function (o) {
      var up = C.upcoming(o, NOW, state.done).filter(mine);
      if (up.length) all.push({ o: o, s: up[0], d: C.parse(up[0].by) });
    });
    all.sort(function (a, b) { return a.d - b.d; });
    return all.slice(0, limit);
  }
  function whenBox(s) {
    var n = C.days(NOW, C.parse(s.by)), d = C.parse(s.by), month = C.isMonth(s.by), late = C.endOf(s.by) < NOW;
    return '<div class="when' + ((n <= 7 && !s.est) || late ? " urgent" : "") + '"><small>' + (late ? "Overdue" : "Do by") + "</small><b>" + (month ? "~" : d.getDate()) + "</b><small>" + C.MON[d.getMonth()] + "</small></div>";
  }
  function moveHtml(m) {
    var o = m.o, s = m.s;
    var acts = (o.lastGrade && o.lastGrade === state.grade ? '<span class="last">Last year you can</span>' : "") +
      askButton(o, s, true) + openButton(s) + '<a class="btn sm" href="/l/' + o.id + '" data-nav>Details</a>';
    return '<li class="move">' + whenBox(s) + '<div><h3>' + esc(s.t) + "</h3><p>" + esc(o.name) + " · " + esc(o._s.key === "open" ? o._s.text : o._s.pill) + "</p>" +
      '<div class="mv-acts">' + acts + "</div></div></li>";
  }
  function renderMoves() {
    var box = $("#movesBox"), sub = $("#movesSub"), today = C.fmtShort(C.iso(NOW));
    if (!state.grade && !state.picks.length) {
      sub.textContent = "";
      box.innerHTML = '<p class="empty">Pick your grade above. You\'ll see the next thing to do for each competition and program, with the date to do it by.</p>';
      return;
    }
    sub.textContent = (state.picks.length ? "From your season" : "Grade " + state.grade) + " · " + today;
    var ms = nextMoves(3);
    box.innerHTML = (ms.length ? '<ol class="moves">' + ms.map(moveHtml).join("") + "</ol>" : '<p class="empty">Nothing due right now. Check the Board for what opens next.</p>') +
      (FEATURES.season ? '<p class="after">' + (state.picks.length
        ? '<a href="/season" data-nav>See your whole season →</a>'
        : "Tap <b>+</b> on any listing to add it to your season and get a week-by-week plan.") + "</p>" : "");
  }
  function renderStrip() {
    var open = L.filter(function (o) { return o._s.key === "open"; }).sort(function (a, b) { return a._s.n - b._s.n; });
    $("#strip").innerHTML = open.map(function (o) {
      return '<a href="/l/' + o.id + '" data-nav><small>' + esc(o.tk) + '</small><b>' + o._s.n + '</b> <small>Days · ' + esc(o.boardWhat) + "</small></a>";
    }).join("");
  }

  /* ---------- The Board ---------- */
  function seg(o) {
    var n = 12, out = "";
    if (o._s.key !== "open") { for (var i = 0; i < n; i++) out += "<i></i>"; return out; }
    var from = C.parse(o.window.from || "2026-09-01"), to = C.parse(o.window.to);
    var f = Math.max(0, Math.min(n - 1, Math.floor((NOW - from) / (to - from) * n)));
    for (var j = 0; j < n; j++) out += j < f ? '<i class="f"></i>' : (j === f ? '<i class="' + (o._s.urgent ? "u" : "n") + '"></i>' : "<i></i>");
    return out;
  }
  function addButton(o) {
    if (!FEATURES.season) return "";
    var on = picked(o.id);
    return '<button type="button" class="add' + (on ? " on" : "") + '" data-pick="' + o.id + '" aria-pressed="' + on + '" aria-label="' + (on ? "Remove " : "Add ") + esc(o.name) + (on ? " from" : " to") + ' my season">' + (on ? "✓" : "+") + "</button>";
  }
  function rowHtml(o, selected) {
    var s = o._s, up = C.upcoming(o, NOW, state.done).filter(mine)[0];
    var dy;
    if (s.key === "open") dy = '<span class="dy' + (s.urgent ? " u" : "") + '"><b>' + s.n + "</b><small>Days left</small></span>";
    else { var d = C.parse(o.next.d); dy = '<span class="dy s"><b>' + (o.next.est ? "~" : "") + C.MON[d.getMonth()] + "</b><small>" + (s.key === "closed" ? "Next round" : "Opens") + "</small></span>"; }
    var wl = s.key === "open" ? esc(o.boardWhat) + " " + C.fmtShort(o.window.to) : (s.key === "closed" ? "Closed this season" : "Not open yet");
    var last = o.lastGrade && o.lastGrade === state.grade ? '<span class="last">Last year</span>' : "";
    var nx = up ? '<span class="nx"><em>Next · by ' + esc(C.fmtShort(up.by, up.est)) + "</em> " + esc(up.t) + "</span>" : '<span class="nx"><em>Next</em> Check the organizer\'s page</span>';
    var note = !eligible(o) ? " · Not for Grade " + state.grade : "";
    return '<div class="rw' + (selected ? " sel" : "") + (FEATURES.season ? " has-add" : "") + '" data-id="' + o.id + '"' + (!eligible(o) ? ' style="opacity:.6"' : "") + ">" +
      '<span class="tk ' + s.key + '">' + esc(o.tk) + "</span>" +
      '<span class="nm"><a href="/l/' + o.id + '" data-nav>' + esc(o.name) + "</a>" + last + "<small>" + esc(o.org.split(",")[0]) + " · " + esc(o.costShort.split(" · ")[0]) + esc(note) + "</small></span>" +
      nx + '<span class="win" aria-hidden="true"><span class="seg">' + seg(o) + '</span><span class="wl">' + wl + "</span></span>" + dy + addButton(o) + "</div>";
  }
  function renderBoard() {
    var types = D.TYPES.filter(function (t) { return L.some(function (o) { return o.type === t[0]; }); });
    $("#filters").innerHTML = [["all", "All"]].concat(types).concat([["free", "Free"]]).map(function (t) {
      return '<button type="button" class="chip" data-f="' + t[0] + '" aria-pressed="' + (state.filter === t[0]) + '">' + esc(t[1]) + "</button>";
    }).join("");
    var list = L.filter(function (o) {
      if (state.filter === "free" ? !o.free : (state.filter !== "all" && o.type !== state.filter)) return false;
      return state.allGrades || eligible(o);
    });
    var forGrade = L.filter(eligible).length;
    $("#scope").innerHTML = state.grade
      ? (state.allGrades ? "Showing all " + L.length + " listings. " : "Showing " + forGrade + " of " + L.length + " for Grade " + state.grade + ". ") +
        '<button type="button" class="linkbtn" data-all>' + (state.allGrades ? "Only Grade " + state.grade : "Show all grades") + "</button>"
      : "Showing all " + L.length + ". Pick your grade above to see only what you can enter.";
    var cur = parseRoute(location.pathname);
    var groups = [
      ["open", "▲ Open now", "closing first at the top"],
      ["soonexp", "◆ Opening soon", "get ready now"],
      ["closed", "● Next round", "closed this season, here's when it comes back"]
    ];
    var html = groups.map(function (g) {
      var rows = list.filter(function (o) { return g[0] === "soonexp" ? (o._s.key === "soon" || o._s.key === "expected") : o._s.key === g[0]; });
      if (!rows.length) return "";
      return '<div class="grp">' + g[1] + " <i>· " + g[2] + "</i></div>" + rows.map(function (o) { return rowHtml(o, cur.id === o.id); }).join("");
    }).join("");
    $("#board").innerHTML = html || '<p class="empty" style="margin:0;border:0">Nothing matches this filter.</p>';
  }

  function aboutHtml() {
    return '<div class="about">' +
      '<section aria-labelledby="whyH"><h2 id="whyH">Why this exists</h2><p>When I applied to business school, grades were nearly all that mattered. That has changed. Programs like Ivey, Rotman, Queen\'s and Waterloo now look closely at what you\'ve done outside class.</p><p>The opportunities exist, but the dates are scattered and the important steps are buried. This site puts them in one place, for the students who are where I was.</p></section>' +
      '<section aria-labelledby="checkH"><h2 id="checkH">How we check facts</h2><p>Every fact here is quoted from the organizer\'s own page. Open any listing and tap "See the receipts" to read the exact sentences and where they came from.</p><p>A script re-reads those pages to catch changes. Dates marked ~ are our estimates from past years, and "do by" dates are our advice.</p></section>' +
      '<section aria-labelledby="privH"><h2 id="privH">Your privacy</h2><p>No accounts, no email, no tracking cookies. Your grade, your season and your ticks are saved only in your own browser.</p><p>Messages and calendar files are made on your device; nothing about you is sent to us.</p></section>' +
      '</div><footer class="foot"><p>Grades mean your grade in the ' + esc(D.SEASON) + ' school year. For next year\'s rounds, we list the grades that will still be eligible when they open.</p><p>Always confirm details with the organizer before you apply. Opening Bell is independent and isn\'t affiliated with any organizer listed.</p></footer>';
  }

  /* ---------- Details sheet ---------- */
  function sheetHtml(o) {
    var s = o._s, gr = C.gradeRow(o, state.grade, s), on = picked(o.id);
    var rows = (gr ? [gr] : []).concat(o.can);
    var can = rows.map(function (c) { return '<div class="c"><span class="ck ' + c.k + '" aria-hidden="true">' + ICON[c.k] + '</span><div><b>' + esc(c.t) + "</b>" + (c.s ? "<small>" + esc(c.s) + "</small>" : "") + "</div></div>"; }).join("");
    var steps = o.steps.map(function (st, i) {
      var past = C.endOf(st.by) < NOW, done = !!state.done[key(o, st)];
      return '<li class="' + (past || done ? "past" : "") + '"><span class="n">' + (done ? "✓" : i + 1) + "</span><div><b>" + esc(st.t) + "</b>" +
        '<div class="meta">' + whoChip(o, st) + dueLabel(o, st) + "</div>" + (st.note ? '<span class="note">' + esc(st.note) + "</span>" : "") +
        '</div><div class="go">' + askButton(o, st, true) + openButton(st) + "</div></li>";
    }).join("");
    var kd = o.dates.map(function (x) {
      var past = C.endOf(x.d) < NOW;
      return '<li class="' + (past ? "past" : "") + '"><time>' + esc(x.show || C.fmt(x.d, x.est)) + "</time><span>" + esc(x.t) + (x.est ? '<span class="est">est.</span>' : "") + "</span></li>";
    }).join("");
    var status = '<span class="pill ' + s.key + '">' + esc(s.pill) + '</span><span class="lab' + (s.urgent ? " u" : "") + '">' + esc(s.text) + "</span>" +
      (o.lastGrade && o.lastGrade === state.grade ? '<span class="last">Last year you can</span>' : "");
    return '<div class="grab" aria-hidden="true"></div>' +
      '<div class="sh-head"><div class="sh-top"><span class="tk ' + s.key + '">' + esc(o.tk) + '</span><button type="button" class="x" data-close aria-label="Close">✕</button></div>' +
      '<h2 id="shTitle" tabindex="-1">' + esc(o.name) + '</h2><p class="org">' + esc(o.org) + " · " + esc(D.TYPE_LABEL[o.type]) + '</p><div class="status">' + status + "</div></div>" +
      '<div class="sh-body">' +
        '<div class="sec-h"><span>Can I do this?</span><span>' + (state.grade ? "For Grade " + state.grade : "Pick your grade on the home page") + "</span></div><div class=\"can\">" + can + "</div>" +
        '<div class="sec-h"><span>How you get in</span><span>' + o.steps.length + " steps</span></div><ol class=\"steps\">" + steps + "</ol>" +
        '<div class="sec-h"><span>Worth it because</span></div><p class="why">' + esc(o.why) + "</p>" +
        '<details class="more"><summary>Cost, format and key dates</summary><dl class="facts">' +
          "<dt>Cost</dt><dd>" + esc(o.cost) + (o.aid ? '<span class="aid">' + esc(o.aid) + "</span>" : "") + "</dd>" +
          "<dt>Format</dt><dd>" + esc(o.format) + "</dd><dt>Where</dt><dd>" + esc(o.where) + "</dd><dt>To enter</dt><dd>" + esc(o.entry) + "</dd></dl>" +
          '<ol class="kd">' + kd + '</ol><p class="calrow"><button type="button" class="linkbtn" data-cal="' + o.id + '">Download these dates to your calendar</button></p></details>' +
        '<div class="rcpt"><b>✓ Every fact here is quoted from the organizer</b> · checked ' + esc(C.fmt(D.CHECKED)) +
          '<details data-receipts="' + o.id + '"><summary>See the receipts</summary><div class="rc-list">Loading…</div></details>' +
          (REPORT_EMAIL ? '<p style="margin:8px 0 0"><a href="mailto:' + esc(REPORT_EMAIL) + "?subject=" + encodeURIComponent("Mistake on " + o.name) + '">Report a mistake</a></p>' : "") + "</div>" +
      "</div>" +
      '<div class="sh-bar">' +
        (FEATURES.season
          ? '<button type="button" class="btn grow ' + (on ? "mint" : "gold") + '" data-pick="' + o.id + '" aria-pressed="' + on + '">' + (on ? "✓ In my season" : "+ Add to my season") + "</button>"
          : '<button type="button" class="btn gold grow" data-cal="' + o.id + '">+ Add to my calendar</button>') +
        '<button type="button" class="btn" data-share="' + o.id + '">Share</button></div>';
  }

  /* ---------- The Ask ---------- */
  function askHtml(o, a) {
    var st = o.steps.filter(function (s) { return s.ask === a.id; })[0], done = !!state.done[key(o, st)];
    var third = a.to === "friends"
      ? '<a class="btn" data-asksms href="#">Text</a>'
      : '<a class="btn" data-askmail href="#">Email</a>';
    return '<div class="grab" aria-hidden="true"></div>' +
      '<div class="sh-head"><div class="sh-top"><a class="back" href="/l/' + o.id + '" data-nav>← ' + esc(o.short) + '</a><button type="button" class="x" data-close aria-label="Close">✕</button></div>' +
      '<p class="kicker">The Ask · ' + esc(o.name) + '</p><h2 id="shTitle" tabindex="-1">' + esc(a.title) + "</h2>" +
      '<div class="status"><span class="act ' + askChipClass(a) + '">To: ' + esc(ASK_TO[a.to]) + "</span>" + dueLabel(o, st) + "</div></div>" +
      '<div class="sh-body">' +
        '<div class="sec-h"><label for="askMsg">Your message</label><span>Edit anything</span></div>' +
        '<p class="fillnote">Fill in the parts in [square brackets] before you send it.</p>' +
        '<textarea id="askMsg" class="msg" rows="13" spellcheck="true">' + esc(a.msg) + "</textarea>" +
        '<div class="hint"><span class="ck warn" aria-hidden="true">!</span><span>' + esc(a.hint) + "</span></div>" +
        '<button type="button" class="donebox" data-done="' + key(o, st) + '" aria-pressed="' + done + '"><span class="box" aria-hidden="true">' + (done ? "✓" : "") + "</span><span><b>" + (done ? "Done" : "Mark as done") + "</b><small>" +
          (a.to === "friends" ? "Tick it once your team is set." : "Tick it once they say yes.") + "</small></span></button>" +
      "</div>" +
      '<div class="sh-bar"><button type="button" class="btn" data-askcopy>Copy</button><button type="button" class="btn gold grow" data-askshare>Share</button>' + third + "</div>";
  }
  function askContext() {
    var r = parseRoute(location.pathname); if (r.name !== "ask") return null;
    var o = BY[r.id]; return { o: o, a: o.asks[r.ask], text: ($("#askMsg") || {}).value || o.asks[r.ask].msg };
  }

  /* ---------- My Season ---------- */
  function seasonPageHtml() {
    return '<header class="hero sm"><canvas class="sky" aria-hidden="true"></canvas><div class="hero-in wrap">' + navHtml(true) +
      '<h1>Your season</h1><p class="sea-sub" id="seaSub"></p></div></header><main id="main" class="wrap season"><div id="seasonBox"></div></main>';
  }
  function todoHtml(o, s) {
    var k = key(o, s), done = !!state.done[k], late = !done && C.endOf(s.by) < NOW;
    return '<li class="todo' + (done ? " is-done" : "") + (late ? " late" : "") + '"><button type="button" class="box" data-done="' + k + '" aria-pressed="' + done + '" aria-label="' + (done ? "Mark not done: " : "Mark done: ") + esc(s.t) + '">' + (done ? "✓" : "") + "</button>" +
      "<div><b>" + esc(s.t) + '</b><div class="meta"><a class="lab tklink" href="/l/' + o.id + '" data-nav>' + esc(o.tk) + "</a>" + dueLabel(o, s) + (late ? '<span class="lab latel">Overdue</span>' : "") + "</div></div>" +
      '<div class="go">' + (done ? "" : askButton(o, s, true) + openButton(s)) + "</div></li>";
  }
  function renderSeason() {
    var box = $("#seasonBox"), sub = $("#seaSub");
    var picks = state.picks.map(function (id) { return BY[id]; });
    if (!picks.length) {
      sub.textContent = state.grade ? "Grade " + state.grade : "";
      var sugg = L.filter(function (o) { return eligible(o) && o._s.key === "open"; }).slice(0, 4);
      box.innerHTML = '<section class="sea-empty"><h2>Pick what you want to do</h2><p>Add competitions and programs to your season. You\'ll get one week-by-week plan with every step, who to ask and what to say.</p>' +
        (sugg.length ? '<ul class="sugg">' + sugg.map(function (o) {
          return '<li><span class="tk ' + o._s.key + '">' + esc(o.tk) + '</span><div><a href="/l/' + o.id + '" data-nav>' + esc(o.name) + "</a><small>" + esc(o._s.text) + "</small></div>" + addButton(o) + "</li>";
        }).join("") + "</ul>" : "") + '<p><a class="btn" href="/" data-nav>Browse the Board</a></p></section>';
      return;
    }
    var all = [];
    picks.forEach(function (o) { o.steps.forEach(function (s) { all.push({ o: o, s: s, d: C.parse(s.by) }); }); });
    all.sort(function (a, b) { return a.d - b.d; });
    var mineAll = all.filter(function (x) { return mine(x.s); });
    var doneN = mineAll.filter(function (x) { return state.done[key(x.o, x.s)]; }).length;
    sub.textContent = (state.grade ? "Grade " + state.grade + " · " : "") + picks.length + (picks.length === 1 ? " pick" : " picks") + " · " + doneN + " of " + mineAll.length + " moves done";
    var weekEnd = new Date(NOW); weekEnd.setDate(weekEnd.getDate() + 7);
    var open = mineAll.filter(function (x) { return !state.done[key(x.o, x.s)]; });
    var thisWeek = open.filter(function (x) { return C.endOf(x.s.by) <= weekEnd && !C.isMonth(x.s.by); });
    var head = thisWeek.length ? "This week · " + C.fmtShort(C.iso(NOW)) + "–" + C.fmtShort(C.iso(weekEnd)) : "Nothing due this week · next up";
    var weekList = thisWeek.length ? thisWeek : open.slice(0, 2);
    var later = all.filter(function (x) { return weekList.indexOf(x) < 0 && C.endOf(x.s.by) >= NOW && !state.done[key(x.o, x.s)]; });
    var trail = "", lastMon = "";
    later.forEach(function (x) {
      var d = x.d, mon = C.MON[d.getMonth()] + (d.getMonth() === 0 ? " " + d.getFullYear() : "");
      if (mon !== lastMon) { trail += '<div class="mon">' + esc(mon) + "</div>"; lastMon = mon; }
      trail += '<a class="stop' + (x.s.est ? " est" : "") + (mine(x.s) ? "" : " info") + '" href="/l/' + x.o.id + '" data-nav><span class="d">' + esc(C.fmtShort(x.s.by, x.s.est)) + " · " + esc(x.o.tk) +
        (x.s.official ? " · official" : "") + "</span>" + esc(x.s.t) + (mine(x.s) ? "" : " <i>(" + esc(x.s.who === "school" ? "your school" : x.s.who) + ")</i>") + "</a>";
    });
    var doneList = all.filter(function (x) { return state.done[key(x.o, x.s)]; });
    var prog = mineAll.map(function (x) { return '<i class="' + (state.done[key(x.o, x.s)] ? "f" : "") + '"></i>'; }).join("");
    box.innerHTML =
      '<div class="sea-sum"><div class="prog" aria-hidden="true">' + prog + '</div><div class="picks">' + picks.map(function (o) {
        return '<a class="tk ' + o._s.key + '" href="/l/' + o.id + '" data-nav title="' + esc(o.name) + '">' + esc(o.tk) + "</a>";
      }).join("") + '<a class="tk addmore" href="/" data-nav aria-label="Add more listings">+</a></div></div>' +
      '<section class="wk" aria-labelledby="wkH"><div class="wk-h"><span id="wkH">' + esc(head) + "</span><span>" + weekList.length + (weekList.length === 1 ? " move" : " moves") + '</span></div><ul class="todos">' +
        (weekList.length ? weekList.map(function (x) { return todoHtml(x.o, x.s); }).join("") : '<li class="todo"><span></span><div><b>Every step is done. Nice work.</b></div><span></span></li>') + "</ul></section>" +
      (trail ? '<section aria-labelledby="upH"><div class="sec"><h2 id="upH">Coming up</h2><span class="lab">Tap any stop for details</span></div><div class="trail-mini">' + trail + "</div></section>" : "") +
      (doneList.length ? '<details class="more donelist"><summary>Done (' + doneList.length + ')</summary><ul class="todos">' + doneList.map(function (x) { return todoHtml(x.o, x.s); }).join("") + "</ul></details>" : "") +
      '<section class="sea-acts"><button type="button" class="btn gold" data-subscribe>+ Add to my phone\'s calendar</button>' +
        '<p class="small">Every step and deadline, in the calendar you already use. It updates itself if a date changes. No account needed.</p>' +
        '<button type="button" class="btn" data-sendparent>Send to a parent</button>' +
        '<p class="small">They get a page with what\'s coming up, what it costs and where they can help. <a href="' + esc(parentPath()) + '" data-nav>Preview it</a></p></section>';
  }

  /* ---------- Calendar subscription ---------- */
  function feedUrl(ids, forParent) { return location.origin + "/api/calendar?l=" + ids.join(",") + (forParent ? "&for=parent" : ""); }
  function subscribeHtml(ids, forParent) {
    var https = feedUrl(ids, forParent), webcal = https.replace(/^https?:/, "webcal:");
    var tks = ids.map(function (id) { return BY[id].tk; }).join(", ");
    return '<div class="grab" aria-hidden="true"></div>' +
      '<div class="sh-head"><div class="sh-top"><p class="kicker" style="margin:0">' + (forParent ? "Your calendar" : "Your phone's calendar") + '</p><button type="button" class="x" data-close aria-label="Close">✕</button></div>' +
      '<h2 id="shTitle" tabindex="-1">' + (forParent ? "Add these dates to your calendar" : "Add your season to your calendar") + "</h2>" +
      '<p class="org">Every step and deadline for ' + esc(tks) + ". When a date changes, it changes in your calendar too.</p></div>" +
      '<div class="sh-body"><div class="sec-h"><span>Pick your calendar</span></div><div class="opts">' +
        '<a class="opt" href="' + esc(webcal) + '"><b>iPhone, iPad or Mac</b><small>Apple Calendar asks you to subscribe.</small></a>' +
        '<a class="opt" href="https://calendar.google.com/calendar/render?cid=' + encodeURIComponent(webcal) + '" target="_blank" rel="noopener"><b>Google Calendar</b><small>Opens Google Calendar. On a phone, you may need to finish on a computer.</small></a>' +
        '<a class="opt" href="https://outlook.live.com/calendar/0/addfromweb?url=' + encodeURIComponent(https) + '&amp;name=' + encodeURIComponent("Opening Bell") + '" target="_blank" rel="noopener"><b>Outlook</b><small>Opens Outlook on the web.</small></a>' +
        '<button type="button" class="opt" data-copyfeed="' + esc(https) + '"><b>Copy the calendar link</b><small>For any other app: add a calendar "from URL" and paste it.</small></button></div>' +
        '<div class="hint"><span class="ck warn" aria-hidden="true">!</span><span>Calendar apps check for changes on their own schedule, usually within a day. Each step has a reminder the day before, but some apps ignore reminders in subscribed calendars. If you don\'t get alerts, check this calendar\'s notification settings in your app.</span></div>' +
        (forParent ? "" : '<p class="small" style="margin-top:12px">Ticks you make on Opening Bell stay on this device, so the calendar shows every step. <button type="button" class="linkbtn" data-calseason>Download a one-time file instead</button> (it won\'t update).</p>') +
      '</div><div class="sh-bar"><button type="button" class="btn grow" data-close>Done</button></div>';
  }

  /* ---------- Parent view: /parent?l=shad,diamond&g=11 ---------- */
  function parentPicks() {
    var q = new URLSearchParams(location.search);
    return { ids: (q.get("l") || "").split(",").filter(function (id) { return BY[id]; }).slice(0, 20), grade: Number(q.get("g")) || null };
  }
  function parentPath() { return "/parent?l=" + state.picks.join(",") + (state.grade ? "&g=" + state.grade : ""); }
  function parentPageHtml() {
    var p = parentPicks(), picks = p.ids.map(function (id) { return BY[id]; });
    var head = '<header class="hero sm"><canvas class="sky" aria-hidden="true"></canvas><div class="hero-in wrap">' +
      '<nav class="nav" aria-label="Main"><a class="logo" href="/" data-nav><canvas class="bell" width="14" height="12" aria-hidden="true"></canvas>Opening Bell</a><div class="nav-r"><a class="navchip" href="/" data-nav>See the Board</a></div></nav>' +
      '<h1>Your teen\'s season</h1><p class="sea-sub">' + (p.grade ? "Grade " + p.grade + " · " : "") + picks.length + (picks.length === 1 ? " pick" : " picks") + " · shared from Opening Bell</p></div></header>";
    if (!picks.length) return head + '<main id="main" class="wrap season"><section class="sea-empty"><h2>Nothing to show yet</h2><p>This link doesn\'t include any listings. Ask your teen to send it again from My Season.</p></section></main>';
    var items = [];
    picks.forEach(function (o) { o.steps.forEach(function (s) { if ((mine(s) || s.official) && C.endOf(s.by) >= NOW) items.push({ o: o, s: s, d: C.parse(s.by) }); }); });
    items.sort(function (a, b) { return a.d - b.d; });
    var coming = items.slice(0, 7).map(function (x) {
      return '<li><time>' + esc(C.fmtShort(x.s.by, x.s.est)) + '</time><span><a class="lab tklink" href="/l/' + x.o.id + '" data-nav>' + esc(x.o.tk) + "</a> " + esc(x.s.t) +
        (x.s.official ? ' <span class="lab offl">Official deadline</span>' : "") + "</span></li>";
    }).join("");
    var help = [];
    picks.forEach(function (o) { o.parent.forEach(function (h) { help.push('<div class="help"><b>' + esc(h.t) + '</b><span>' + esc(h.s) + '</span><a class="src" href="/l/' + o.id + '" data-nav>✓ ' + esc(o.short) + " · quoted from " + esc(o.src.name) + "</a></div>"); }); });
    var costs = picks.map(function (o) { return "<dt>" + esc(o.tk) + "</dt><dd>" + esc(o.costShort) + (o.aid ? '<span class="aid">' + esc(o.aid) + "</span>" : "") + "</dd>"; }).join("");
    var what = picks.map(function (o) { return '<li><a href="/l/' + o.id + '" data-nav><b>' + esc(o.name) + "</b></a><span>" + esc(o.why) + "</span></li>"; }).join("");
    return head + '<main id="main" class="wrap season parent">' +
      '<section aria-labelledby="pcH"><div class="sec"><h2 id="pcH">Coming up</h2><span class="lab">As of ' + esc(C.fmtShort(C.iso(NOW))) + '</span></div><ol class="plist">' + (coming || "<li><span>Nothing coming up right now.</span></li>") + "</ol></section>" +
      '<section aria-labelledby="phH"><div class="sec"><h2 id="phH">Where you can help</h2></div>' + help.join("") + "</section>" +
      '<section aria-labelledby="pcoH"><div class="sec"><h2 id="pcoH">Costs at a glance</h2></div><dl class="costs">' + costs + "</dl></section>" +
      '<section class="sea-acts"><button type="button" class="btn gold" data-subscribe-parent>+ Add these dates to my calendar</button><p class="small">It updates itself if a date changes. No account needed.</p></section>' +
      '<section aria-labelledby="pwH"><div class="sec"><h2 id="pwH">What each one is</h2></div><ul class="whatlist">' + what + "</ul></section>" +
      '<p class="small" style="margin-top:22px">No account. Nothing is tracked. Your teen chose what to share. Every fact on Opening Bell is quoted from the organizer, and each listing shows its sources.</p></main>';
  }

  /* ---------- Receipts ---------- */
  var receiptsCache = null;
  function loadReceipts(id, box) {
    function paint(all) {
      var list = (all && all[id]) || [];
      box.innerHTML = list.length ? list.map(function (r) {
        return '<p class="q">"' + esc(r.quote) + '"<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.url.replace(/^https:\/\/(www\.)?/, "")) + (r.manual ? " · checked by hand" : "") + "</a></p>";
      }).join("") : "<p>No receipts found.</p>";
    }
    if (receiptsCache) return paint(receiptsCache);
    fetch("/data/receipts.json").then(function (r) { return r.json(); }).then(function (j) { receiptsCache = j; paint(j); })
      .catch(function () { box.textContent = "Couldn't load the receipts. Check your connection and try again."; });
  }

  /* ---------- Panel ---------- */
  function openPanel(html, o) {
    var panel = $("#panel"), scrim = $("#scrim"), wasOpen = !panel.hidden;
    panel.innerHTML = html;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", isPhone() ? "true" : "false");
    panel.setAttribute("aria-labelledby", "shTitle");
    panel.hidden = false; scrim.hidden = false;
    document.body.classList.add("panel-open");
    if (isPhone()) document.documentElement.classList.add("lock");
    if (!wasOpen) {
      panel.classList.add("enter");
      requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.remove("enter"); }); });
    }
    document.querySelectorAll(".rw.sel").forEach(function (r) { r.classList.remove("sel"); });
    if (o) { var row = document.querySelector('.rw[data-id="' + o.id + '"]'); if (row) row.classList.add("sel"); }
    var t = $("#shTitle"); if (t) t.focus({ preventScroll: true });
  }
  function closePanelNow() {
    var panel = $("#panel"); if (panel.hidden) return;
    panel.hidden = true; $("#scrim").hidden = true; panel.innerHTML = "";
    document.body.classList.remove("panel-open");
    document.documentElement.classList.remove("lock");
    document.querySelectorAll(".rw.sel").forEach(function (r) { r.classList.remove("sel"); });
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  /* Closing goes back to the page underneath: back through history if we came from it, otherwise replace */
  function closePanel() { if (depth > baseDepth) history.go(baseDepth - depth); else go(basePath, true); }

  /* ---------- Actions ---------- */
  document.addEventListener("click", function (e) {
    var t, ctx;
    if (e.target.closest("[data-close]") || e.target.id === "scrim") { closePanel(); return; }
    if ((t = e.target.closest("[data-pick]"))) { e.preventDefault(); togglePick(t.dataset.pick); return; }
    if ((t = e.target.closest("[data-done]"))) { toggleDone(t.dataset.done); return; }
    if ((t = e.target.closest("[data-share]"))) { share(BY[t.dataset.share]); return; }
    if ((t = e.target.closest("[data-cal]"))) { downloadIcs([BY[t.dataset.cal]], BY[t.dataset.cal].short, "opening-bell-" + t.dataset.cal); return; }
    if (e.target.closest("[data-subscribe]")) { if (state.picks.length) openPanel(subscribeHtml(state.picks, false), null); return; }
    if (e.target.closest("[data-subscribe-parent]")) { var pp = parentPicks(); if (pp.ids.length) openPanel(subscribeHtml(pp.ids, true), null); return; }
    if ((t = e.target.closest("[data-copyfeed]"))) { copy(t.dataset.copyfeed, "Calendar link copied. In your calendar app, add a calendar from URL and paste it."); return; }
    if (e.target.closest("[data-sendparent]")) { sendToParent(); return; }
    if (e.target.closest("[data-calseason]")) { downloadIcs(state.picks.map(function (id) { return BY[id]; }), "your season", "opening-bell-season"); return; }
    if (e.target.closest("[data-askcopy]") && (ctx = askContext())) { copy(ctx.text, "Message copied. Paste it into an email or text."); return; }
    if (e.target.closest("[data-askshare]") && (ctx = askContext())) {
      if (navigator.share) navigator.share({ text: ctx.text }).catch(function () {});
      else copy(ctx.text, "Message copied. Paste it into an email or text.");
      return;
    }
    if (e.target.closest("[data-askmail]") && (ctx = askContext())) { e.preventDefault(); location.href = "mailto:?subject=" + encodeURIComponent(ctx.a.subject) + "&body=" + encodeURIComponent(ctx.text); return; }
    if (e.target.closest("[data-asksms]") && (ctx = askContext())) { e.preventDefault(); location.href = "sms:?&body=" + encodeURIComponent(ctx.text); return; }
  });
  document.addEventListener("toggle", function (e) {
    var d = e.target;
    if (d.matches && d.matches("details[data-receipts]") && d.open) loadReceipts(d.dataset.receipts, $(".rc-list", d));
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("#panel").hidden) closePanel(); });

  function sendToParent() {
    var url = location.origin + parentPath();
    var data = { title: "My Opening Bell season", text: "Here's my season on Opening Bell: what's coming up, what it costs and where you can help.", url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    copy(url, "Link copied. Send it to a parent by text or email.");
  }
  function share(o) {
    var data = { title: o.name + " · Opening Bell", text: o.name + ": " + o._s.text, url: o.link };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    copy(o.link, "Link copied. Paste it anywhere to share " + o.short + ".");
  }
  function copy(text, msg) {
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (err) {}
      ta.remove(); toast(ok ? msg : "Couldn't copy. Select the text and copy it yourself.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast(msg); }, fallback);
    else fallback();
  }
  function downloadIcs(list, label, file) {
    if (!list.length) return;
    try {
      var blob = new Blob([C.ics(list, { name: "Opening Bell" + (list.length === 1 ? ": " + list[0].short : "") })], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = file + ".ics";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast("Calendar file downloaded. Open it to add " + label + "'s steps and deadlines.");
    } catch (err) { toast("Couldn't create the calendar file in this browser."); }
  }

  render();
})();
