/* Tells Bing (which feeds ChatGPT search and Copilot) and other IndexNow engines that pages changed,
   so they re-read them in hours instead of weeks. Only for the live site: run after pushing a change.
     node tools/indexnow.mjs            every page in the sitemap
     node tools/indexnow.mjs faq blog   only those pages
   Needs "indexNowKey" in tools/site.config.json; the build then publishes the matching key file. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, config } from './lib.mjs';

const cfg = config();
const SITE = cfg.origin + cfg.base;
if (!cfg.index || /github\.io/.test(cfg.origin)) { console.log('Preview site: nothing sent. IndexNow is for the live domain only.'); process.exit(0); }
if (!cfg.indexNowKey) { console.log('Add "indexNowKey" to tools/site.config.json (any 32 letters and numbers), rebuild, push, then run this.'); process.exit(1); }

const args = process.argv.slice(2);
const urls = args.length
  ? args.map(p => SITE + p.replace(/^\/|\/$/g, '') + '/')
  : [...fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key: cfg.indexNowKey, keyLocation: `${SITE}${cfg.indexNowKey}.txt`, urlList: urls }),
});
console.log(`${res.status} ${res.statusText}: sent ${urls.length} page${urls.length === 1 ? '' : 's'}`);
process.exit(res.ok ? 0 : 1);
