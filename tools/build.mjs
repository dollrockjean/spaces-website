/* Makes one ready-to-read file per page (team/index.html, blog/.../index.html and so on), plus 404.html,
   sitemap.xml, robots.txt and llms.txt. Run after every change to words, photos or code: node tools/build.mjs
   Each file already holds that page's words, title and description, so Google and answer engines can read
   it without running code. The page then redraws itself from js/ as usual. Settings: tools/site.config.json. */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { ROOT, config, page, routes, siteData } from './lib.mjs';
import { schemaFor } from './schema.mjs';

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
const data = siteData();
const unesc = t => t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const pages = {};
const html = {};
list.forEach(r => {
  html[r.path] = render(r.path);
  pages[r.path] = {
    title: unesc((html[r.path].match(/<title>([^<]*)<\/title>/) || [])[1] || ''),
    desc: unesc((html[r.path].match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''),
  };
});
// Page labels for answer engines go in last, once every page's title is known (breadcrumbs need the parents').
list.forEach(r => {
  const ld = schemaFor(r.path, data, SITE, pages);
  write(r.path ? `${r.path}/index.html` : 'index.html', ld ? html[r.path].replace('</head>', ld + '\n</head>') : html[r.path]);
});
// Shown by GitHub Pages for any address that has no file. It still draws the right page if the address is real.
write('404.html', render('page-not-found', { noindex: true }).replace(/<link rel="canonical"[^>]*>\n?/, ''));

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${list.filter(r => !r.room).map(r => `  <url><loc>${SITE}${r.path ? r.path + '/' : ''}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
// Answer-engine crawlers are named on purpose, so a later "block bots" setting at the host cannot silently catch them.
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot'];
write('robots.txt', cfg.index
  ? `User-agent: *\nAllow: /\n\n${AI_BOTS.map(b => `User-agent: ${b}`).join('\n')}\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n');

/* A plain-text map of the site for AI tools (llmstxt.org). Built only from the site's own words. */
const C = data.DEFAULT_CONTENT;
const line = r => `- [${pages[r].title.replace(' | Spaces Designer Homes', '')}](${SITE}${r ? r + '/' : ''})${pages[r].desc ? ': ' + pages[r].desc : ''}`;
const group = pre => list.filter(r => !r.room && r.path.startsWith(pre + '/')).map(r => line(r.path)).join('\n');
write('llms.txt', `# ${C.biz.name}

> ${C.footer.blurb}

${C.voice.facts.introBody.replace(/\s*Every photo on this page[^.]*\./, '')}

- Phone: ${C.biz.phone}
- Email: ${C.biz.email}
- Studio: ${C.biz.street}, ${C.biz.city}

## Main pages

${['custom-homes', 'additions', 'remodeling', 'studio', 'projects', 'about', 'team', 'faq', 'blog', 'contact'].map(line).join('\n')}

## Common questions

${C.faq.map(f => `### ${f.q}\n\n${f.a}`).join('\n\n')}

## Blog

${group('blog')}

## Projects

${group('projects')}

## Team

${group('team')}
`);
write('.nojekyll', '');
if (cfg.index && cfg.indexNowKey) write(`${cfg.indexNowKey}.txt`, cfg.indexNowKey);   // proves to IndexNow the site is ours
fs.writeFileSync(manifestFile, JSON.stringify(written, null, 1) + '\n');

console.log(`Built ${list.length} pages + 404, sitemap, robots, llms.txt for ${SITE}${cfg.index ? '' : ' (preview: hidden from search)'}`);
if (problems.length) console.log(`\n${problems.length} problem(s):\n` + [...new Set(problems)].slice(0, 20).join('\n'));
process.exit(problems.length ? 1 : 0);
