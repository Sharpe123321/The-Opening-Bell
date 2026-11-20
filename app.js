/* Opening Bell: the Board, the details sheet, and (as each stage ships) the Ask, My Season,
 * the parent view and the Trail. No framework and no build step. All listing facts come from
 * data/listings.js; all date and wording logic comes from lib/core.js.
 */
(function () {
  "use strict";
  var D = window.OB_DATA, C = window.OB_CORE;

  /* Stages ship in order. A feature stays hidden until its stage is built and tested. */
  var FEATURES = { ask: false, season: false, subscribe: false, trail: false };
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
  var state = { grade: store.get("grade", null), filter: "all", allGrades: false, done: store.get("done", {}) };
  if ([9, 10, 11, 12].indexOf(state.grade) < 0) state.grade = null;
  var ICON = { ok: "✓", warn: "!", no: "✕" };
  var WHO = { you: "You", teacher: "Teacher", advisor: "Advisor", parent: "Parent", friends: "Friends", school: "Your school" };
  var ASK_CHIP = { teacher: "Ask a teacher", parent: "Ask an adult", friends: "Invite friends", counsellor: "Ask a counsellor" };
  var toastTimer;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 4200); }
  function isPhone() { return !window.matchMedia("(min-width: 1100px)").matches; }
  function eligible(o) { return !state.grade || o.grades.indexOf(state.grade) >= 0; }
  function whoChip(o, s) {
    if (s.ask && o.asks[s.ask]) return '<span class="act ' + esc(o.asks[s.ask].to === "parent" ? "parent" : o.asks[s.ask].to) + '">' + esc(ASK_CHIP[o.asks[s.ask].to]) + "</span>";
    return '<span class="act ' + esc(s.who) + '">' + esc(s.who === "org" ? o.short : WHO[s.who]) + "</span>";
  }
  function dueLabel(o, s) {
    var d = C.fmtShort(s.by, s.est).toUpperCase();
    if (s.official) return '<span class="dt off">' + d + " · Official deadline</span>";
    return '<span class="dt">' + (s.who === "you" || s.ask ? "Do by " : "By ") + d + "</span>";
  }

  /* ---------- Routing: real paths, so every listing has a shareable link ---------- */
  function parseRoute(path) {
    var m;
    if ((m = /^\/l\/([a-z0-9-]+)\/ask\/([a-z0-9-]+)\/?$/.exec(path))) return { name: "ask", id: m[1], ask: m[2] };
    if ((m = /^\/l\/([a-z0-9-]+)\/?$/.exec(path))) return { name: "listing", id: m[1] };
    if (path === "/season" && FEATURES.season) return { name: "season" };
    if (path === "/parent" && FEATURES.subscribe) return { name: "parent" };
    if (path === "/trail" && FEATURES.trail) return { name: "trail" };
    return { name: "home" };
  }
  var page = null, basePath = "/", inAppNav = false, lastFocus = null;
  function go(path, replace) {
    if (replace) history.replaceState({}, "", path); else { history.pushState({ app: true }, "", path); inAppNav = true; }
    render();
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-nav]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    e.preventDefault();
    if (/^\/l\//.test(a.getAttribute("href"))) lastFocus = a;
    go(a.getAttribute("href"));
  });
  window.addEventListener("popstate", function () { render(); });

  function render() {
    var r = parseRoute(location.pathname);
    if ((r.name === "listing" || r.name === "ask") && !BY[r.id]) { history.replaceState({}, "", "/"); r = { name: "home" }; }
    var base = (r.name === "listing" || r.name === "ask") ? (page || "home") : r.name;
    if (r.name !== "listing" && r.name !== "ask") basePath = location.pathname + location.search;
    if (base !== page) { page = base; renderPage(); window.scrollTo(0, 0); }
    if (r.name === "listing") { openPanel(sheetHtml(BY[r.id]), BY[r.id]); document.title = BY[r.id].name + " · Opening Bell"; }
    else { closePanelNow(); document.title = "Opening Bell · Business competitions for Ontario high school students"; }
  }
  function renderPage() {
    var app = $("#app");
    app.innerHTML = homeHtml();
    drawArt();
    bindHome();
  }

  /* ---------- Pixel art ---------- */
  var SUNRISE = { sky: ["#3B3F8F", "#5B4FA0", "#8E5BA6", "#D9677A", "#F59563", "#FFC46B"], sun: "#FFF1B8", sunEdge: "#FFD86B", cloud: "#FFE3D0", cloudShade: "#E9A99A", far: "#7A5A9C", near: "#1E2150", window: "#FFC23D", water: "#2A3070", waterHi: "#5B6CC8", reflect: "#FFC46B", litChance: 0.6 };
  var artWidth = 0;
  function drawArt() {
    document.querySelectorAll("canvas.bell").forEach(function (c) { if (!c.dataset.drawn) { drawSprite(c, BELL, { X: "#16193A", Y: "#FFC23D", H: "#FFF1B8", C: "#16193A" }); c.dataset.drawn = 1; } });
    var cv = $("canvas.sky"); if (!cv) return;
    var host = cv.parentNode, wide = window.innerWidth >= 900, px = wide ? 3 : 2.44;
    artWidth = host.clientWidth;
    cv.width = Math.max(1, Math.round(host.clientWidth / px)); cv.height = Math.max(1, Math.round(host.clientHeight / px));
    drawSkyline(cv, { seed: 11, sunX: 0.78, sunY: 0.62, sunR: wide ? 14 : 9, towerX: wide ? 0.66 : 0.3, heightScale: wide ? 0.72 : 1,
      clouds: [[0.06, 0.18, 26], [0.55, 0.12, 30], [0.82, 0.3, 20]], palette: SUNRISE });
  }
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { var cv = $("canvas.sky"); if (cv && cv.parentNode.clientWidth !== artWidth) drawArt(); }, 150);
  });

  /* ---------- Home ---------- */
  function heroHtml() {
    return '<header class="hero"><canvas class="sky" aria-hidden="true"></canvas><div class="hero-in wrap">' +
      '<nav class="nav" aria-label="Main"><a class="logo" href="/" data-nav><canvas class="bell" width="14" height="12" aria-hidden="true"></canvas>Opening Bell</a>' +
      '<div class="nav-r"><span class="navchip">Ontario · Business</span></div></nav>' +
      '<p class="tag">' + esc(D.SEASON) + " season</p><h1>Know what to do this week.</h1></div></header>";
  }
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

  /* Your next moves: the next step of each listing for your grade, soonest first */
  function nextMoves(limit) {
    var all = [];
    L.forEach(function (o) {
      if (!eligible(o)) return;
      var up = C.upcoming(o, NOW, state.done);
      if (up.length) all.push({ o: o, s: up[0], d: C.parse(up[0].by) });
    });
    all.sort(function (a, b) { return a.d - b.d; });
    return all.slice(0, limit);
  }
  function moveHtml(m) {
    var o = m.o, s = m.s, n = C.days(NOW, C.parse(s.by)), d = C.parse(s.by), month = C.isMonth(s.by);
    var urgent = n <= 7 && !s.est;
    var when = '<div class="when' + (urgent ? " urgent" : "") + '"><small>Do by</small><b>' + (month ? "~" : d.getDate()) + "</b><small>" + C.MON[d.getMonth()] + "</small></div>";
    var acts = (o.lastGrade && o.lastGrade === state.grade ? '<span class="last">Last year you can</span>' : "") +
      (FEATURES.ask && s.ask ? '<a class="btn sm gold" href="/l/' + o.id + "/ask/" + s.ask + '" data-nav>' + (o.asks[s.ask].to === "friends" ? "Invite" : "✉ Message") + "</a>" : "") +
      (s.href ? '<a class="btn sm" href="' + esc(s.href) + '" target="_blank" rel="noopener">Open ↗</a>' : "") +
      '<a class="btn sm" href="/l/' + o.id + '" data-nav>Details</a>';
    return '<li class="move">' + when + '<div><h3>' + esc(s.t) + "</h3><p>" + esc(o.name) + " · " + esc(o._s.key === "open" ? o._s.text : o._s.pill) + "</p>" +
      '<div class="mv-acts">' + acts + "</div></div></li>";
  }
  function renderMoves() {
    var box = $("#movesBox"), sub = $("#movesSub");
    if (!state.grade) {
      sub.textContent = "";
      box.innerHTML = '<p class="empty">Pick your grade above. You\'ll see the next thing to do for each competition and program, with the date to do it by.</p>';
      return;
    }
    sub.textContent = "Grade " + state.grade + " · " + C.fmtShort(C.iso(NOW));
    var ms = nextMoves(3);
    box.innerHTML = ms.length ? '<ol class="moves">' + ms.map(moveHtml).join("") + "</ol>" : '<p class="empty">Nothing due right now. Check the Board for what opens next.</p>';
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
  function rowHtml(o, selected) {
    var s = o._s, up = C.upcoming(o, NOW, state.done)[0];
    var dy;
    if (s.key === "open") dy = '<span class="dy' + (s.urgent ? " u" : "") + '"><b>' + s.n + "</b><small>Days left</small></span>";
    else { var d = C.parse(o.next.d); dy = '<span class="dy s"><b>' + (o.next.est ? "~" : "") + C.MON[d.getMonth()] + "</b><small>" + (s.key === "closed" ? "Next round" : "Opens") + "</small></span>"; }
    var wl = s.key === "open" ? esc(o.boardWhat) + " " + C.fmtShort(o.window.to) : (s.key === "closed" ? "Closed this season" : "Not open yet");
    var last = o.lastGrade && o.lastGrade === state.grade ? '<span class="last">Last year</span>' : "";
    var nx = up ? '<span class="nx"><em>Next · by ' + esc(C.fmtShort(up.by, up.est)) + "</em> " + esc(up.t) + "</span>" : '<span class="nx"><em>Next</em> Check the organizer\'s page</span>';
    var note = !eligible(o) ? " · Not for Grade " + state.grade : "";
    return '<div class="rw' + (selected ? " sel" : "") + '" data-id="' + o.id + '"' + (!eligible(o) ? ' style="opacity:.6"' : "") + ">" +
      '<span class="tk ' + s.key + '">' + esc(o.tk) + "</span>" +
      '<span class="nm"><a href="/l/' + o.id + '" data-nav>' + esc(o.name) + "</a>" + last + "<small>" + esc(o.org.split(",")[0]) + " · " + esc(o.costShort.split(" · ")[0]) + esc(note) + "</small></span>" +
      nx + '<span class="win" aria-hidden="true"><span class="seg">' + seg(o) + '</span><span class="wl">' + wl + "</span></span>" + dy + "</div>";
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
      '<section aria-labelledby="privH"><h2 id="privH">Your privacy</h2><p>No accounts, no email, no tracking cookies. Your grade is saved only in your own browser.</p><p>A calendar file is made on your device; nothing about you is sent to us.</p></section>' +
      '</div><footer class="foot"><p>Grades mean your grade in the ' + esc(D.SEASON) + ' school year. For next year\'s rounds, we list the grades that will still be eligible when they open.</p><p>Always confirm details with the organizer before you apply. Opening Bell is independent and isn\'t affiliated with any organizer listed.</p></footer>';
  }

  /* ---------- Details sheet ---------- */
  function sheetHtml(o) {
    var s = o._s, gr = C.gradeRow(o, state.grade, s);
    var rows = (gr ? [gr] : []).concat(o.can);
    var can = rows.map(function (c) { return '<div class="c"><span class="ck ' + c.k + '" aria-hidden="true">' + ICON[c.k] + '</span><div><b>' + esc(c.t) + "</b>" + (c.s ? "<small>" + esc(c.s) + "</small>" : "") + "</div></div>"; }).join("");
    var steps = o.steps.map(function (st, i) {
      var past = C.endOf(st.by) < NOW;
      var go = "";
      if (FEATURES.ask && st.ask) go += '<a class="btn sm gold" href="/l/' + o.id + "/ask/" + st.ask + '" data-nav>' + (o.asks[st.ask].to === "friends" ? "Invite" : "✉ Message") + "</a>";
      if (st.href) go += '<a class="btn sm" href="' + esc(st.href) + '" target="_blank" rel="noopener">Open ↗</a>';
      return '<li class="' + (past ? "past" : "") + '"><span class="n">' + (i + 1) + "</span><div><b>" + esc(st.t) + "</b>" +
        '<div class="meta">' + whoChip(o, st) + dueLabel(o, st) + "</div>" + (st.note ? '<span class="note">' + esc(st.note) + "</span>" : "") +
        '</div><div class="go">' + go + "</div></li>";
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
          '<ol class="kd">' + kd + "</ol></details>" +
        '<div class="rcpt"><b>✓ Every fact here is quoted from the organizer</b> · checked ' + esc(C.fmt(D.CHECKED)) +
          '<details data-receipts="' + o.id + '"><summary>See the receipts</summary><div class="rc-list">Loading…</div></details>' +
          (REPORT_EMAIL ? '<p style="margin:8px 0 0"><a href="mailto:' + esc(REPORT_EMAIL) + "?subject=" + encodeURIComponent("Mistake on " + o.name) + '">Report a mistake</a></p>' : "") + "</div>" +
      "</div>" +
      '<div class="sh-bar">' +
        '<button type="button" class="btn gold grow" data-cal="' + o.id + '">+ Add to my calendar</button>' +
        '<button type="button" class="btn" data-share="' + o.id + '">Share</button></div>';
  }

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
  function closePanel() {
    if (inAppNav && history.state && history.state.app) history.back();
    else go(basePath, true);
  }

  /* Panel actions */
  document.addEventListener("click", function (e) {
    var t;
    if (e.target.closest("[data-close]") || e.target.id === "scrim") { closePanel(); return; }
    if ((t = e.target.closest("[data-share]"))) { share(BY[t.dataset.share]); return; }
    if ((t = e.target.closest("[data-cal]"))) { downloadIcs(BY[t.dataset.cal]); return; }
  });
  document.addEventListener("toggle", function (e) {
    var d = e.target;
    if (d.matches && d.matches("details[data-receipts]") && d.open) loadReceipts(d.dataset.receipts, $(".rc-list", d));
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("#panel").hidden) closePanel(); });

  function share(o) {
    var data = { title: o.name + " · Opening Bell", text: o.name + ": " + o._s.text, url: o.link };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    copy(o.link, "Link copied. Paste it anywhere to share " + o.short + ".");
  }
  function copy(text, msg) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast(msg); }, function () { toast("Couldn't copy. Select the text and copy it yourself."); });
    else toast("Couldn't copy. Select the text and copy it yourself.");
  }
  function downloadIcs(o) {
    try {
      var blob = new Blob([C.ics([o], { name: "Opening Bell: " + o.short })], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = "opening-bell-" + o.id + ".ics";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast("Calendar file downloaded. Open it to add " + o.short + "'s steps and deadlines.");
    } catch (err) { toast("Couldn't create the calendar file in this browser."); }
  }

  render();
})();
