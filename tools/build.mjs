/* Makes one ready-to-read file per page (team/index.html, blog/.../index.html and so on), plus 404.html,
   sitemap.xml and robots.txt. Run after every change to words, photos or code: node tools/build.mjs
   Each file already holds that page's words, title and description, so Google and answer engines can read
   it without running code. The page then redraws itself from js/ as usual. Settings: tools/site.config.json. */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { ROOT, config, page, routes } from './lib.mjs';

const cfg = config();
const SITE = cfg.origin + cfg.base;
const scripts = ['js/imgmeta.js', 'js/data.js', 'js/site.js'].map(f => fs.readFileSync(path.join(ROOT, f), 'utf8'));
const problems = [];

/* Draw one page the way a browser would, and return its finished HTML. */
function render(route, { noindex = false } = {}) {
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { if (!/Not implemented/.test(e.message)) problems.push(`${route || 'home'}: ${e.message}`); });
  const html = page({ base: cfg.base, site: SITE, index: cfg.index && !noindex });
  const dom = new JSDOM(html, { url: `${SITE}${route ? route + '/' : ''}?team=off`, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  // Things a real browser has that this one does not.
  w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  w.HTMLMediaElement.prototype.pause = () => {};
  w.HTMLMediaElement.prototype.load = () => {};
  w.scrollTo = () => {};
  w.Element.prototype.scrollIntoView = () => {};
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  // One run, like separate <script> tags sharing the page.
  try { w.eval(scripts.join('\n;\n')); } catch (e) { problems.push(`${route || 'home'}: ${e.message}`); }
  const doc = w.document;
  doc.documentElement.classList.remove('site-ready');
  if (!doc.documentElement.className) doc.documentElement.removeAttribute('class');
  return dom.serialize();   // the page's own timers are left to run out; the build exits when done
}

/* Remove the page files the last build made, so a deleted page does not linger. */
const manifestFile = path.join(ROOT, 'tools/generated.json');
const old = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : [];
old.forEach(f => {
  const abs = path.join(ROOT, f);
  if (abs.startsWith(ROOT + path.sep) && fs.existsSync(abs)) fs.rmSync(abs);
  for (let d = path.dirname(abs); d !== ROOT && d.startsWith(ROOT); d = path.dirname(d)) {
    try { fs.rmdirSync(d); } catch { break; }   // only removes folders that are now empty
  }
});

const written = [];
const write = (rel, text) => {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, text);
  written.push(rel);
};

const list = routes();
list.forEach(r => write(r.path ? `${r.path}/index.html` : 'index.html', render(r.path)));
// Shown by GitHub Pages for any address that has no file. It still draws the right page if the address is real.
write('404.html', render('page-not-found', { noindex: true }).replace(/<link rel="canonical"[^>]*>\n?/, ''));

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${list.filter(r => !r.room).map(r => `  <url><loc>${SITE}${r.path ? r.path + '/' : ''}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
write('robots.txt', cfg.index ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
write('.nojekyll', '');
fs.writeFileSync(manifestFile, JSON.stringify(written, null, 1) + '\n');

console.log(`Built ${list.length} pages + 404, sitemap, robots for ${SITE}${cfg.index ? '' : ' (preview: hidden from search)'}`);
if (problems.length) console.log(`\n${problems.length} problem(s):\n` + [...new Set(problems)].slice(0, 20).join('\n'));
process.exit(problems.length ? 1 : 0);
