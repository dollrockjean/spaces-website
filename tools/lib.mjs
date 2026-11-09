/* Shared by build.mjs (makes the page files) and serve.mjs (local test server). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const config = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/site.config.json'), 'utf8'));
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* A short fingerprint of the code, so visitors always get the newest files (replaces bumping ?v= by hand). */
export function version() {
  const h = crypto.createHash('sha1');
  ['css/site.css', 'css/editor.css', 'js/imgmeta.js', 'js/data.js', 'js/site.js', 'js/editor.js'].forEach(f => h.update(read(f)));
  return h.digest('hex').slice(0, 8);
}

/* The page template with its {{...}} parts filled in. site = full address of the site's home, ending in "/". */
export function page({ base, site, index }) {
  return read('tools/template.html')
    .replaceAll('{{BASE}}', base)
    .replaceAll('{{SITE}}', site)
    .replaceAll('{{V}}', version())
    .replaceAll('{{ROBOTS}}', index ? '' : '<meta name="robots" content="noindex">\n');
}

/* The site's default words and photos from js/data.js, read without a browser. */
export function siteData() {
  const ctx = vm.createContext({});
  return vm.runInContext(read('js/data.js') + '\n;({ IMG, PHOTOS, PROJECTS, CATS, KINDS, DEFAULT_CONTENT })', ctx);
}

/* Every page address the site has, worked out from js/data.js. room: true for the small room-by-room pages. */
export function routes() {
  const d = siteData();
  const list = ['', 'build', 'about-us', 'custom-homes', 'additions', 'remodeling', 'projects', 'studio', 'about', 'team', 'blog', 'faq', 'university', 'contact']
    .map(p => ({ path: p }));
  d.PROJECTS.forEach(h => {
    const photos = d.PHOTOS.filter(p => p.project === h.id);
    if (!photos.length) return;
    list.push({ path: `projects/${h.id}` });
    d.CATS.forEach(([k]) => { if (photos.some(p => p.cat === k)) list.push({ path: `projects/${h.id}/${k}`, room: true }); });
  });
  d.DEFAULT_CONTENT.team.forEach(m => list.push({ path: `team/${m.id}` }));
  d.DEFAULT_CONTENT.posts.forEach(p => list.push({ path: `blog/${p.id}` }));
  return list;
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain' };
export const typeOf = f => TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream';
