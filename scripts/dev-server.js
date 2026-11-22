// Local preview that behaves like Vercel: static files, the same rewrites, and /api functions.
//   node scripts/dev-server.js [port]
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const PORT = Number(process.argv[2]) || 4173;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ics": "text/calendar; charset=utf-8" };
const REWRITES = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8")).rewrites.map(r => ({
  re: new RegExp("^" + r.source.replace(/:path\*/, ".*") + "$"), dest: r.destination
}));
http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  let p = decodeURIComponent(url.pathname);
  const api = /^\/api\/([a-z-]+)$/.exec(p);
  if (api && fs.existsSync(path.join(ROOT, "api", api[1] + ".js"))) {
    delete require.cache[require.resolve(path.join(ROOT, "api", api[1] + ".js"))];
    return require(path.join(ROOT, "api", api[1] + ".js"))(req, res);
  }
  let file = path.join(ROOT, p.endsWith("/") ? p + "index.html" : p);
  if (!file.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const rw = REWRITES.find(r => r.re.test(p));
    if (!rw) { res.statusCode = 404; return res.end("Not found"); }
    file = path.join(ROOT, rw.dest);
  }
  res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log("Afterbell preview on http://localhost:" + PORT));
