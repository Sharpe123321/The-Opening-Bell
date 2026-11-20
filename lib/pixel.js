// Draws Opening Bell's original pixel-art scenes onto low-res canvases (scaled up with image-rendering: pixelated).
function rng(seed){ return function(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

function drawSkyline(canvas, opts){
  var W = canvas.width, H = canvas.height, c = canvas.getContext("2d");
  var p = opts.palette, r = rng(opts.seed || 7), hs = opts.heightScale || 1;
  function px(x,y,w,h,col){ c.fillStyle = col; c.fillRect(x|0,y|0,w|0,h|0); }
  // Banded sky with dithered transitions
  var bands = p.sky, bh = Math.ceil((H * 0.78) / bands.length);
  for (var i = 0; i < bands.length; i++){
    px(0, i*bh, W, bh, bands[i]);
    if (i + 1 < bands.length) for (var x = 0; x < W; x += 2) { px(x + ((i%2)), i*bh + bh - 1, 1, 1, bands[i+1]); px(x+1, i*bh + bh - 2, 1, 1, bands[i+1]); }
  }
  // Stars
  if (p.stars) for (var s = 0; s < W/3; s++) px(Math.floor(r()*W), Math.floor(r()*H*0.45), 1, 1, r() > .7 ? p.stars : p.starsDim);
  // Sun / moon
  var sx = Math.floor(W*opts.sunX), sy = Math.floor(H*opts.sunY), sr = opts.sunR;
  for (var yy = -sr; yy <= sr; yy++) for (var xx = -sr; xx <= sr; xx++) {
    var d = xx*xx + yy*yy;
    if (d <= sr*sr) px(sx+xx, sy+yy, 1, 1, d > (sr-1.5)*(sr-1.5) ? p.sunEdge : p.sun);
  }
  // Clouds
  (opts.clouds || []).forEach(function(cl){
    var cx = Math.floor(W*cl[0]), cy = Math.floor(H*cl[1]), cw = cl[2];
    px(cx, cy, cw, 3, p.cloud); px(cx+3, cy-2, cw-8, 2, p.cloud); px(cx+6, cy-4, Math.max(4,cw-16), 2, p.cloud);
    px(cx+1, cy+3, cw-2, 1, p.cloudShade);
  });
  var ground = Math.floor(H*0.80);
  // Far skyline
  var x = 0;
  while (x < W){ var w = 4 + Math.floor(r()*7), h = Math.round((8 + Math.floor(r()*14))*hs); px(x, ground-h, w, h, p.far); x += w; }
  // CN Tower
  var tx = Math.floor(W*opts.towerX);
  px(tx, ground-54, 1, 10, p.near);                  // antenna
  px(tx-1, ground-44, 3, 44, p.near);                 // shaft
  px(tx-2, ground-30, 5, 30, p.near);
  px(tx-4, ground-40, 9, 4, p.near);                  // pod
  px(tx-3, ground-41, 7, 1, p.near);
  px(tx-3, ground-36, 7, 1, p.near);
  px(tx-3, ground-39, 7, 1, p.window);                // pod lights
  px(tx-2, ground-47, 3, 2, p.near);                  // sky pod
  // Near towers with lit windows
  x = 0;
  while (x < W){
    var bw = 7 + Math.floor(r()*10), bh2 = Math.round((12 + Math.floor(r()*26))*hs);
    if (Math.abs(x + bw/2 - tx) < 8) { x += 10; continue; }
    px(x, ground-bh2, bw, bh2, p.near);
    if (r() > .6) px(x + Math.floor(bw/2), ground-bh2-3, 1, 3, p.near);
    for (var wy = ground-bh2+2; wy < ground-2; wy += 3) for (var wx = x+1; wx < x+bw-1; wx += 2) if (r() > (p.litChance || .62)) px(wx, wy, 1, 1, p.window);
    x += bw + (r() > .7 ? 1 : 0);
  }
  // Lake Ontario
  px(0, ground, W, H-ground, p.water);
  for (var ly = ground+1; ly < H; ly += 2) for (var lx = 0; lx < W; lx += 1) if (r() > .86) px(lx, ly, 2 + Math.floor(r()*3), 1, p.waterHi);
  // Sun reflection
  for (var ry = ground+1; ry < H; ry += 2) px(sx - 3 + Math.floor(r()*3), ry, 4 + Math.floor(r()*4), 1, p.reflect);
}

// 14x12 pixel bell sprite. X = outline, Y = body, H = highlight, C = clapper
var BELL = [
  "......XX......",
  ".....XHYX.....",
  "....XHYYYX....",
  "...XHYYYYYX...",
  "...XHYYYYYX...",
  "..XHYYYYYYYX..",
  "..XHYYYYYYYX..",
  ".XHYYYYYYYYYX.",
  "XXXXXXXXXXXXXX",
  ".XYYYYYYYYYYX.",
  "..XXXXXXXXXX..",
  "......CC......"
];
function drawSprite(canvas, sprite, colors){
  var c = canvas.getContext("2d");
  sprite.forEach(function(row, y){ row.split("").forEach(function(ch, x){ if (colors[ch]) { c.fillStyle = colors[ch]; c.fillRect(x, y, 1, 1); } }); });
}

// 10x12 pixel student for "You are here". X = outline, H = hair, F = face, B = shirt, P = pants
var STUDENT = [
  "...XXXX...",
  "..XHHHHX..",
  "..XHFFHX..",
  "..XFFFFX..",
  "...XFFX...",
  ".XXBBBBXX.",
  "X.XBBBBX.X",
  "..XBBBBX..",
  "..XPPPPX..",
  "..XP..PX..",
  "..XP..PX..",
  ".XX....XX."
];
