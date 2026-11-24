/* Afterbell shared logic: dates, statuses, wording and calendar files.
 * Used by the page (window.OB_CORE) and by the calendar feed (require), so both always agree.
 */
(function (root, factory) {
  var core = factory();
  if (typeof module === "object" && module.exports) module.exports = core;
  else root.OB_CORE = core;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAY = 86400000;

  /* ---------- Dates ("2027-01-06" is a day, "2027-01" is a month) ---------- */
  function isMonth(s) { return String(s).split("-").length === 2; }
  function parts(s) { return String(s).split("-").map(Number); }
  function parse(s) { var p = parts(s); return p.length === 3 ? new Date(p[0], p[1] - 1, p[2]) : new Date(p[0], p[1] - 1, 15); }
  function endOf(s) { var p = parts(s); return p.length === 3 ? new Date(p[0], p[1] - 1, p[2]) : new Date(p[0], p[1], 0); }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function days(a, b) { return Math.round((b - a) / DAY); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  /* "Jan 6" / "~Jan 2027" */
  function fmtShort(s, est) { var d = parse(s); return (est ? "~" : "") + (isMonth(s) ? MON[d.getMonth()] + " " + d.getFullYear() : MON[d.getMonth()] + " " + d.getDate()); }
  /* "Jan 6, 2027" / "~Jan 2027" */
  function fmt(s, est) { var d = parse(s); return (est ? "~" : "") + (isMonth(s) ? MON[d.getMonth()] + " " + d.getFullYear() : MON[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()); }
  /* "January 6" / "April 2027", used inside sentences */
  function fmtLong(s) { var d = parse(s); return isMonth(s) ? MONTH[d.getMonth()] + " " + d.getFullYear() : MONTH[d.getMonth()] + " " + d.getDate(); }

  /* ---------- Team sizes: stored once, worded the same everywhere ---------- */
  function teamSize(t) {
    if (t.assigned) return "about " + t.min + "–" + t.max + " students";
    return t.min === 1 ? "up to " + t.max + " people, including you" : t.min + "–" + t.max + " students, including you";
  }
  function teamEntry(t) {
    if (t.assigned) return "Register yourself online. JA places you on a team of about " + t.min + "–" + t.max + " students.";
    return (t.min === 1 ? "On your own, or a team of up to " + t.max : "Team of " + t.min + "–" + t.max + " students") + (t.extra ? ", " + t.extra : "");
  }

  /* ---------- Fill tokens and add links. Returns copies, never edits the source data. ---------- */
  function prepare(data, siteUrl) {
    var base = String(siteUrl || "").replace(/\/$/, "");
    return data.LISTINGS.map(function (src) {
      var o = JSON.parse(JSON.stringify(src));
      o.link = base + "/l/" + o.id;
      var tokens = {
        team: o.team ? teamSize(o.team) : null,
        deadline: o.window && o.window.to ? fmtLong(o.window.to) : null,
        opens: o.next ? fmtLong(o.next.d) : null,
        link: o.link,
        name: o.name
      };
      function fill(str) {
        return str == null ? str : String(str).replace(/\{(\w+)\}/g, function (m, k) {
          if (!(k in tokens) || tokens[k] == null) throw new Error(o.id + ": token {" + k + "} has no value");
          return tokens[k];
        });
      }
      if (o.team) o.entry = teamEntry(o.team);
      o.can = (o.can || []).map(function (c) { return { k: c.k, t: fill(c.t), s: fill(c.s) }; });
      o.steps = (o.steps || []).map(function (s) { var c = Object.assign({}, s); c.t = fill(s.t); if (s.note) c.note = fill(s.note); return c; });
      o.asks = o.asks || {};
      Object.keys(o.asks).forEach(function (k) {
        var a = o.asks[k];
        o.asks[k] = { id: k, to: a.to, title: fill(a.title), subject: fill(a.subject || o.name), hint: fill(a.hint), msg: fill(a.msg) };
      });
      if (o.about) {
        var line = function (x) { return { t: fill(x.t), q: x.q }; };
        o.about = { is: line(o.about.is), do: (o.about.do || []).map(line), why: (o.about.why || []).map(line) };
      }
      o.parent = (o.parent || []).map(function (p) { return { t: fill(p.t), s: fill(p.s) }; });
      return o;
    });
  }

  /* ---------- Status ---------- */
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function status(o, now) {
    now = now || today();
    var w = o.window, n;
    if (w && w.to) {
      var to = parse(w.to), from = w.from ? parse(w.from) : null;
      if (from && now < from) { n = days(now, from); return { key: "soon", pill: "Opens soon", text: "Opens " + fmtShort(w.from) + " · in " + plural(n, "day"), rank: 1, n: n }; }
      if (now <= to) { n = days(now, to); return { key: "open", pill: "Open", text: n === 0 ? "Closes today" : "Closes " + fmtShort(w.to) + " · " + plural(n, "day"), short: n === 0 ? "Today" : String(n), urgent: n <= 30, rank: 0, n: n }; }
    }
    if (o.next) {
      n = days(now, parse(o.next.d));
      /* closed:false marks a second round in the same school year (for example, a test held in December and May) */
      var wasClosed = "closed" in o.next ? !!o.next.closed : !!(w && w.to && now > parse(w.to));
      return { key: wasClosed ? "closed" : "expected", pill: o.statusLabel || (wasClosed ? "Closed" : "Expected"), text: o.next.label, rank: wasClosed ? 3 : 2, n: n };
    }
    return { key: "closed", pill: "Closed", text: "Check the organizer for next year's dates", rank: 4, n: 99999 };
  }

  /* "Can I do this?" grade answer */
  function gradeRow(o, grade, st) {
    if (!grade) return null;
    if (o.grades.indexOf(grade) < 0) return { k: "no", t: "Not for Grade " + grade, s: o.gradeNote };
    if (st && st.key === "closed") return { k: "ok", t: "Yes, for the next round", s: o.gradeNote };
    if (o.lastGrade === grade) return { k: "ok", t: "Yes, and it's your last year", s: o.gradeNote };
    return { k: "ok", t: "Yes, you're in Grade " + grade, s: o.gradeNote };
  }

  /* Steps that are still ahead, in order */
  function upcoming(o, now, done) {
    now = now || today(); done = done || {};
    return o.steps.filter(function (s) { return endOf(s.by) >= now && !done[o.id + ":" + s.id]; });
  }

  /* ---------- Calendar files (.ics) ---------- */
  function icsEsc(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
  /* Calendar lines may be at most 75 bytes, so wrap by UTF-8 bytes, never splitting a character */
  function fold(line) {
    var out = "", cur = "", bytes = 0;
    for (var ch of line) {
      var cp = ch.codePointAt(0), n = cp > 0xFFFF ? 4 : cp > 0x7FF ? 3 : cp > 0x7F ? 2 : 1;
      if (bytes + n > 73) { out += cur + "\r\n "; cur = ""; bytes = 1; }
      cur += ch; bytes += n;
    }
    return out + cur;
  }
  function icsDay(d) { return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); }
  /* Steps that belong in a student's calendar: their own actions, their asks, and official deadlines */
  function calendarSteps(o) {
    return o.steps.filter(function (s) { return !isMonth(s.by) && (s.who === "you" || s.ask || s.official); });
  }
  function ics(listings, opts) {
    opts = opts || {};
    var stamp = opts.stamp || new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    var seq = opts.sequence || 0;
    var out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Afterbell//Season//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "X-WR-CALNAME:" + icsEsc(opts.name || "Afterbell"),
      "X-WR-CALDESC:" + icsEsc("Your steps and deadlines from Afterbell. Always confirm dates with the organizer."),
      "REFRESH-INTERVAL;VALUE=DURATION:PT12H", "X-PUBLISHED-TTL:PT12H"];
    listings.forEach(function (o) {
      var used = {};
      function event(uid, dateStr, title, desc, est, url) {
        var d = parse(dateStr), n = new Date(d); n.setDate(n.getDate() + 1);
        var e = ["BEGIN:VEVENT", "UID:" + uid + "@opening-bell" /* kept from the old name so subscribed calendars never get duplicates */, "DTSTAMP:" + stamp, "SEQUENCE:" + seq,
          "DTSTART;VALUE=DATE:" + icsDay(d), "DTEND;VALUE=DATE:" + icsDay(n),
          "SUMMARY:" + icsEsc(title + (est ? " (estimated)" : "")),
          "DESCRIPTION:" + icsEsc(desc), "URL:" + url, "TRANSP:TRANSPARENT"];
        if (opts.alarms !== false) e.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsEsc(title), "TRIGGER:-PT15H", "END:VALARM");
        e.push("END:VEVENT");
        out.push.apply(out, e);
      }
      var deadline = o.window && o.window.to ? "\nOfficial deadline: " + fmt(o.window.to) : "";
      calendarSteps(o).forEach(function (s) {
        used[s.by] = 1;
        var url = s.ask ? o.link + "/ask/" + s.ask : o.link;
        event(o.id + "-" + s.id, s.by, o.short + ": " + s.t,
          s.t + "\n" + o.name + deadline + "\n\n" + (s.ask ? "Your message is ready: " : "Details: ") + url + "\n\nFrom Afterbell. Always confirm dates with the organizer.",
          s.est, url);
      });
      (o.dates || []).forEach(function (x, i) {
        if (x.k !== "deadline" || isMonth(x.d) || used[x.d]) return;
        event(o.id + "-date-" + x.d, x.d, o.short + ": " + x.t, x.t + "\n" + o.name + "\n\nDetails: " + o.link + "\n\nFrom Afterbell. Always confirm dates with the organizer.", x.est, o.link);
      });
    });
    out.push("END:VCALENDAR");
    return out.map(fold).join("\r\n") + "\r\n";
  }

  return {
    MON: MON, isMonth: isMonth, parse: parse, endOf: endOf, today: today, days: days, iso: iso,
    fmt: fmt, fmtShort: fmtShort, fmtLong: fmtLong, plural: plural,
    teamSize: teamSize, teamEntry: teamEntry, prepare: prepare, status: status, gradeRow: gradeRow,
    upcoming: upcoming, calendarSteps: calendarSteps, ics: ics
  };
});
