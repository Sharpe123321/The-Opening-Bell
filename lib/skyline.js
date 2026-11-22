/* Afterbell's Toronto skyline, drawn in code so it stays sharp and light: the CN Tower, Rogers Centre,
 * the downtown towers and Lake Ontario. Day for light mode, evening (after the bell) for dark mode.
 * drawSkyline(canvas, { night, pixel, band }) fills the canvas: `pixel` > 1 gives a light pixel-art look,
 * `band` is how tall the skyline should be on screen (the sky fills the rest).
 */
(function () {
  "use strict";
  const W = 1600, H = 720, WATER = 600, TOP = 70; /* world units; the CN Tower's tip sits at TOP */
  const TOWER_X = 1290;

  function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }

  /* The skyline itself: generated once from fixed seeds so it never changes between visits */
  function scene() {
    const r = rng(20261122), far = [], mid = [], front = [];
    for (let x = -20; x < W + 20;) { const w = 24 + r() * 46, h = (x < 900 ? 30 + r() * 70 : 40 + r() * 110); far.push({ x, w, h }); x += w * (0.7 + r() * 0.5); }
    /* Waterfront condos west of downtown stay low so the headline has open sky */
    for (let x = 10; x < 1020;) {
      const w = 22 + r() * 34, h = 34 + r() * 70 + (x > 760 ? (x - 760) * 0.3 : 0);
      mid.push({ x, w, h, tone: r(), top: r() < 0.25 ? "slant" : r() < 0.2 ? "step" : "flat" }); x += w + 6 + r() * 26;
    }
    /* CityPlace towers behind Rogers Centre */
    [[1032, 30, 196], [1068, 26, 228], [1100, 30, 170], [1124, 24, 150]].forEach(b => mid.push({ x: b[0], w: b[1], h: b[2], tone: r(), top: "flat" }));
    /* Downtown core east of the tower, roughly in skyline order */
    [[1322, 34, 236, "sail"], [1360, 40, 262, "flat"], [1404, 48, 332, "fcp"], [1456, 42, 300, "scotia"], [1502, 38, 284, "dark"],
      [1544, 36, 270, "step"], [1584, 34, 222, "flat"], [1618, 40, 190, "flat"]].forEach(b => mid.push({ x: b[0], w: b[1], h: b[2], tone: r(), top: b[3], core: true }));
    /* Low buildings along the water, in front */
    for (let x = -10; x < W + 10;) { const w = 30 + r() * 60, h = 18 + r() * 34; if (x + w < 1124 || x > 1272) front.push({ x, w, h, tone: r() }); x += w + 2 + r() * 10; }
    front.push({ x: 1372, w: 62, h: 92, tone: 0.5, royal: true }); /* Fairmont Royal York, with its peaked roof */
    const clouds = [[880, 200, 0.85], [1110, 96, 0.7], [1470, 160, 1.0]];
    const stars = []; for (let i = 0; i < 90; i++) stars.push([r() * W, r() * 380, r()]);
    const ripples = []; for (let i = 0; i < 70; i++) ripples.push([r() * W, WATER + 8 + r() * (H - WATER - 10), 10 + r() * 60, r()]);
    return { far, mid, front, clouds, stars, ripples, seedWin: 77 };
  }
  const S = scene();

  const DAY = {
    sky: ["#6FBDEB", "#A9DAF4", "#DDF1FB", "#F4FAFD"], cloud: "#FFFFFF", cloudShade: "#D7ECF8",
    far: "#BBD7EA", mid: ["#5E8FBA", "#4C7DAA", "#7AA7CB", "#3F6F99", "#6D9CC2"], glass: "#5DA7C9", winDay: "rgba(255,255,255,.28)",
    front: ["#3E6F98", "#4A7CA4", "#36628A"], tree: "#2F8F7F", treeDark: "#25786A",
    tower: "#E3EAF1", towerShade: "#B9C8D6", pod: "#A9BCCD", podBand: "#7F98AF", dome: "#EEF3F7", domeLine: "#C3D2E0",
    fcp: "#EEF2F5", scotia: "#C0675A", dark: "#2C3E52", water: ["#4CA3D2", "#3488BE", "#2A73A8"], ripple: "rgba(255,255,255,.55)", refl: 0.22, sail: "#FFFFFF", hull: "#2C3E52"
  };
  const NIGHT = {
    sky: ["#081127", "#13244A", "#2B4274", "#E59A74"], cloud: "#22355E", cloudShade: "#1A2A4C",
    far: "#1A2B4D", mid: ["#18264A", "#1E2E56", "#22345F", "#152242", "#1B2B50"], glass: "#203A66", win: ["#FFD27A", "#FFE6A6", "#FFC46B"],
    front: ["#111D3A", "#142244", "#0F1A34"], tree: "#10263A", treeDark: "#0C1E2F",
    tower: "#33476F", towerShade: "#24365A", pod: "#3C5585", podBand: "#FFD27A", dome: "#2C406A", domeLine: "#3E5687",
    fcp: "#27395F", scotia: "#3A2F4F", dark: "#101A33", water: ["#0F1E40", "#0B1834", "#08122A"], ripple: "rgba(255,214,140,.35)", refl: 0.28, sail: "#C9D4E6", hull: "#0B1430"
  };

  function cloud(ctx, x, y, k, c) {
    ctx.fillStyle = c.cloudShade;
    [[0, 10, 34], [40, 4, 40], [86, 12, 30]].forEach(p => { ctx.beginPath(); ctx.arc(x + p[0] * k, y + (p[1] + 8) * k, p[2] * k, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = c.cloud;
    [[0, 6, 32], [40, -2, 40], [84, 8, 28], [22, 18, 30], [62, 18, 30]].forEach(p => { ctx.beginPath(); ctx.arc(x + p[0] * k, y + p[1] * k, p[2] * k, 0, Math.PI * 2); ctx.fill(); });
  }
  function windows(ctx, b, top, c, night, r) {
    const cols = Math.max(2, Math.floor(b.w / 7)), rows = Math.floor((WATER - top - 10) / 9);
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const lit = r();
      if (night) { if (lit > 0.5) continue; ctx.fillStyle = c.win[Math.floor(lit * 6) % 3]; }
      else { if (lit > 0.35) continue; ctx.fillStyle = c.winDay; }
      ctx.fillRect(b.x + 3 + j * (b.w - 6) / cols, top + 8 + i * 9, Math.max(1.6, (b.w - 6) / cols - 2.2), 4);
    }
  }
  function building(ctx, b, c, night, r) {
    const top = WATER - b.h;
    let fill = c.mid[Math.floor(b.tone * c.mid.length) % c.mid.length];
    if (b.top === "fcp") fill = c.fcp; else if (b.top === "scotia") fill = c.scotia; else if (b.top === "dark") fill = c.dark; else if (b.top === "sail") fill = c.glass;
    ctx.fillStyle = fill;
    ctx.beginPath();
    if (b.top === "slant") { ctx.moveTo(b.x, top + 12); ctx.lineTo(b.x + b.w, top); ctx.lineTo(b.x + b.w, WATER); ctx.lineTo(b.x, WATER); }
    else if (b.top === "step") { ctx.moveTo(b.x, top + 16); ctx.lineTo(b.x + b.w * 0.2, top + 16); ctx.lineTo(b.x + b.w * 0.2, top + 6); ctx.lineTo(b.x + b.w * 0.8, top + 6); ctx.lineTo(b.x + b.w * 0.8, top + 16); ctx.lineTo(b.x + b.w, top + 16); ctx.lineTo(b.x + b.w, WATER); ctx.lineTo(b.x, WATER); ctx.rect(b.x + b.w * 0.38, top - 4, b.w * 0.24, 12); }
    else if (b.top === "scotia") { ctx.moveTo(b.x, top + 14); ctx.lineTo(b.x + b.w * 0.25, top + 4); ctx.lineTo(b.x + b.w * 0.5, top + 14); ctx.lineTo(b.x + b.w * 0.75, top); ctx.lineTo(b.x + b.w, top + 10); ctx.lineTo(b.x + b.w, WATER); ctx.lineTo(b.x, WATER); }
    else if (b.top === "sail") { ctx.moveTo(b.x, top + 40); ctx.quadraticCurveTo(b.x + b.w * 0.2, top + 4, b.x + b.w, top); ctx.lineTo(b.x + b.w, WATER); ctx.lineTo(b.x, WATER); }
    else ctx.rect(b.x, top, b.w, b.h);
    ctx.closePath(); ctx.fill();
    if (b.top === "fcp") { ctx.fillStyle = night ? "rgba(255,210,122,.35)" : "rgba(160,180,200,.35)"; for (let i = 1; i < 6; i++) ctx.fillRect(b.x + i * b.w / 6, top + 4, 1.2, b.h - 8); }
    windows(ctx, b, top + (b.top === "slant" ? 12 : b.top === "step" || b.top === "scotia" ? 16 : b.top === "sail" ? 40 : 0), c, night, r);
  }
  function tower(ctx, c, night) {
    const x = TOWER_X, g = WATER;
    ctx.fillStyle = c.tower; /* legs and shaft up to the main pod */
    ctx.beginPath(); ctx.moveTo(x - 19, g); ctx.lineTo(x - 7, 286); ctx.lineTo(x + 7, 286); ctx.lineTo(x + 19, g); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.towerShade; ctx.beginPath(); ctx.moveTo(x + 2, g); ctx.lineTo(x + 2, 286); ctx.lineTo(x + 7, 286); ctx.lineTo(x + 19, g); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.tower; ctx.fillRect(x - 5, 168, 10, 100); /* shaft above the pod */
    ctx.fillStyle = c.towerShade; ctx.fillRect(x + 1, 168, 4, 100);
    ctx.fillStyle = c.pod; /* main pod */
    ctx.beginPath(); ctx.ellipse(x, 290, 36, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 30, 262, 60, 26);
    ctx.beginPath(); ctx.ellipse(x, 262, 33, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.podBand; ctx.fillRect(x - 30, 272, 60, 5);
    ctx.fillStyle = c.pod; ctx.fillRect(x - 11, 158, 22, 13); /* SkyPod */
    ctx.fillStyle = c.towerShade; ctx.beginPath(); ctx.moveTo(x - 3, 158); ctx.lineTo(x - 1, TOP); ctx.lineTo(x + 1, TOP); ctx.lineTo(x + 3, 158); ctx.closePath(); ctx.fill(); /* antenna */
    ctx.fillStyle = "#FF4D4D"; ctx.beginPath(); ctx.arc(x, TOP + 1, night ? 3 : 2, 0, Math.PI * 2); ctx.fill();
    if (night) { ctx.fillStyle = "rgba(255,77,77,.25)"; ctx.beginPath(); ctx.arc(x, TOP + 1, 9, 0, Math.PI * 2); ctx.fill(); }
  }
  function dome(ctx, c) {
    const cx = 1196, rx = 64, top = 550;
    ctx.fillStyle = c.dome; ctx.beginPath(); ctx.ellipse(cx, WATER - 8, rx, WATER - 8 - top, 0, Math.PI, 0); ctx.fill();
    ctx.fillRect(cx - rx - 4, WATER - 10, rx * 2 + 8, 10);
    ctx.strokeStyle = c.domeLine; ctx.lineWidth = 1.4;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.ellipse(cx, WATER - 8, rx * i / 4, WATER - 8 - top, 0, Math.PI, 0); ctx.stroke(); }
  }
  function frontRow(ctx, c, r) {
    S.front.forEach(b => {
      const top = WATER - b.h;
      ctx.fillStyle = c.front[Math.floor(b.tone * 3) % 3];
      if (b.royal) { ctx.beginPath(); ctx.moveTo(b.x, WATER); ctx.lineTo(b.x, top + 22); ctx.lineTo(b.x + b.w * 0.3, top + 10); ctx.lineTo(b.x + b.w * 0.5, top); ctx.lineTo(b.x + b.w * 0.7, top + 10); ctx.lineTo(b.x + b.w, top + 22); ctx.lineTo(b.x + b.w, WATER); ctx.closePath(); ctx.fill(); }
      else ctx.fillRect(b.x, top, b.w, b.h);
    });
    /* trees along the shore */
    for (let x = -10; x < W + 20; x += 13) {
      if (x > 1120 && x < 1300) continue;
      const h = 8 + (Math.sin(x * 0.37) + 1) * 5;
      ctx.fillStyle = (Math.floor(x / 13) % 3) ? c.tree : c.treeDark;
      ctx.beginPath(); ctx.ellipse(x, WATER - h * 0.5, 9, h * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  function boat(ctx, x, y, k, c) {
    ctx.fillStyle = c.hull; ctx.beginPath(); ctx.moveTo(x - 16 * k, y); ctx.lineTo(x + 16 * k, y); ctx.lineTo(x + 11 * k, y + 6 * k); ctx.lineTo(x - 11 * k, y + 6 * k); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.sail; ctx.beginPath(); ctx.moveTo(x, y - 34 * k); ctx.lineTo(x, y - 2 * k); ctx.lineTo(x + 15 * k, y - 2 * k); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 2 * k, y - 28 * k); ctx.lineTo(x - 2 * k, y - 2 * k); ctx.lineTo(x - 13 * k, y - 2 * k); ctx.closePath(); ctx.fill();
  }

  window.drawSkyline = function (canvas, opts) {
    const o = opts || {}, night = !!o.night, c = night ? NIGHT : DAY;
    const cssW = canvas.clientWidth || canvas.parentNode.clientWidth, cssH = canvas.clientHeight || canvas.parentNode.clientHeight;
    const pixel = Math.max(1, o.pixel || 1), dpr = pixel > 1 ? 1 / pixel : Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(cssW * dpr)); canvas.height = Math.max(1, Math.round(cssH * dpr));
    canvas.style.imageRendering = pixel > 1 ? "pixelated" : "auto";
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = pixel === 1;
    /* Scale so the skyline is `band` px tall, but always wide enough to fill the screen */
    const band = o.band || cssH * 0.6, s = Math.max(band / (H - TOP), cssW / W);
    const ox = Math.min(0, Math.max(cssW - W * s, cssW * (o.focus != null ? o.focus : 0.5) - TOWER_X * s)), oy = cssH - H * s;
    /* sky across the whole canvas, so tall screens never show a gap */
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const skyBottom = (oy + WATER * s) * dpr, grad = ctx.createLinearGradient(0, 0, 0, skyBottom);
    grad.addColorStop(0, c.sky[0]); grad.addColorStop(0.45, c.sky[1]); grad.addColorStop(night ? 0.86 : 0.8, c.sky[2]); grad.addColorStop(1, c.sky[3]);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (night) { /* stars over the whole sky, including the tall part above the skyline on phones */
      const sr = rng(4242);
      for (let i = 0; i < 120; i++) { const x = sr() * canvas.width, y = sr() * skyBottom * 0.7, a = 0.25 + sr() * 0.6; ctx.fillStyle = "rgba(255,255,255," + a + ")"; ctx.fillRect(x, y, 1.6 * dpr, 1.6 * dpr); }
    }
    ctx.setTransform(s * dpr, 0, 0, s * dpr, ox * dpr, oy * dpr);
    const r = rng(S.seedWin);
    if (night) {
      ctx.fillStyle = "#F4E9C9"; ctx.beginPath(); ctx.arc(1470, 120, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.sky[1]; ctx.beginPath(); ctx.arc(1480, 113, 18, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "rgba(255,246,214,.55)"; ctx.beginPath(); ctx.arc(1480, 128, 64, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFF6DA"; ctx.beginPath(); ctx.arc(1480, 128, 34, 0, Math.PI * 2); ctx.fill();
    }
    S.clouds.forEach(cl => cloud(ctx, cl[0], cl[1], cl[2], c));
    if (!night) { ctx.strokeStyle = "#3D5A78"; ctx.lineWidth = 2; [[980, 300, 1], [1010, 286, 0.8], [1060, 318, 0.7]].forEach(g => { ctx.beginPath(); ctx.moveTo(g[0] - 8 * g[2], g[1]); ctx.quadraticCurveTo(g[0] - 3 * g[2], g[1] - 6 * g[2], g[0], g[1]); ctx.quadraticCurveTo(g[0] + 3 * g[2], g[1] - 6 * g[2], g[0] + 8 * g[2], g[1]); ctx.stroke(); }); }
    ctx.fillStyle = c.far; S.far.forEach(b => ctx.fillRect(b.x, WATER - b.h, b.w, b.h));
    S.mid.filter(b => !b.core).forEach(b => building(ctx, b, c, night, r));
    tower(ctx, c, night);
    S.mid.filter(b => b.core).forEach(b => building(ctx, b, c, night, r));
    dome(ctx, c);
    frontRow(ctx, c, r);
    /* Lake Ontario, with a faint reflection of the city */
    const wg = ctx.createLinearGradient(0, WATER, 0, H);
    wg.addColorStop(0, c.water[0]); wg.addColorStop(0.5, c.water[1]); wg.addColorStop(1, c.water[2]);
    ctx.fillStyle = wg; ctx.fillRect(-W, WATER, W * 3, H - WATER + 400);
    ctx.save(); ctx.globalAlpha = c.refl; ctx.beginPath(); ctx.rect(-W, WATER, W * 3, H); ctx.clip();
    ctx.translate(0, WATER * 2 + 2); ctx.scale(1, -1);
    ctx.fillStyle = c.towerShade; ctx.fillRect(TOWER_X - 6, 286, 12, WATER - 286);
    S.mid.forEach(b => { ctx.fillStyle = c.mid[0]; ctx.fillRect(b.x, WATER - b.h * 0.7, b.w, b.h * 0.7); });
    ctx.restore();
    S.ripples.forEach(rp => { ctx.fillStyle = c.ripple; ctx.globalAlpha = 0.3 + rp[3] * 0.5; ctx.fillRect(rp[0], rp[1], rp[2], 1.4); });
    ctx.globalAlpha = 1;
    boat(ctx, 430, 664, 1, c); boat(ctx, 760, 642, 0.7, c);
  };
})();
