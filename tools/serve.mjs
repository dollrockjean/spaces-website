/* Local test server: node tools/serve.mjs [port]. Every page address shows the newest code,
   no build needed. Open http://localhost:8770/spaces-website/ (or / when base is "/"). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, config, page, typeOf } from './lib.mjs';

const port = +process.argv[2] || 8770;
const { base } = config();

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  let p = decodeURIComponent(url.pathname);
  if (!p.startsWith(base)) { res.writeHead(302, { Location: base }); return res.end(); }
  const rel = p.slice(base.length);
  if (path.extname(rel) && !rel.endsWith('.html')) {
    const file = path.resolve(ROOT, rel);
    if (!file.startsWith(ROOT + path.sep) || rel.split('/').some(s => s.startsWith('.') || s === 'node_modules')) { res.writeHead(403); return res.end(); }
    return fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': typeOf(file), 'Cache-Control': 'no-store' });
      res.end(buf);
    });
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(page({ base, site: `http://localhost:${port}${base}`, index: false }));
}).listen(port, '127.0.0.1', () => console.log(`Spaces site: http://localhost:${port}${base}`));
