/* Page labels for search and answer engines (schema.org JSON-LD), one set per page.
   They only restate what the page already says, from js/data.js. Never add a fact here that is not on the site.
   The business itself is described once in tools/template.html; everything here points to it by its @id. */

const SUFFIX = ' | Spaces Designer Homes';
const clean = t => (t || '').replace(SUFFIX, '').trim();

/* d = siteData(), SITE = full home address ending in "/", pages = { path: { title, desc } } from the build. */
export function schemaFor(path, d, SITE, pages) {
  const C = d.DEFAULT_CONTENT;
  const biz = { '@id': `${SITE}#business` };
  const url = p => SITE + (p ? p + '/' : '');
  const img = id => { const p = d.PHOTOS.find(x => x.id === id); return p ? SITE + d.IMG + p.src : undefined; };
  const here = pages[path] || {};
  const out = [];

  // Every page but home: where it sits in the site.
  if (path) {
    const parts = path.split('/');
    const items = [{ name: 'Home', path: '' }];
    parts.forEach((_, i) => {
      const p = parts.slice(0, i + 1).join('/');
      if (pages[p]) items.push({ name: clean(pages[p].title), path: p });
    });
    out.push({
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: url(it.path) })),
    });
  }

  const [top, id, room] = path.split('/');
  if (!path) {
    out.push({ '@type': 'WebSite', '@id': `${SITE}#website`, name: C.biz.name, url: SITE, publisher: biz });
  } else if (top === 'faq') {
    out.push({
      '@type': 'FAQPage', url: url(path),
      mainEntity: C.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  } else if (top === 'team' && id) {
    const m = C.team.find(x => x.id === id);
    if (m) out.push({ '@type': 'Person', '@id': `${url(path)}#person`, name: m.name, jobTitle: m.role, description: m.bio, url: url(path), worksFor: biz });
  } else if (top === 'team') {
    out.push({
      '@type': 'ItemList', name: clean(here.title),
      itemListElement: C.team.map((m, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Person', '@id': `${url('team/' + m.id)}#person`, name: m.name, jobTitle: m.role, url: url('team/' + m.id) } })),
    });
  } else if (top === 'blog' && id) {
    const p = C.posts.find(x => x.id === id);
    if (p) out.push({
      '@type': 'BlogPosting', headline: p.title, description: p.excerpt, datePublished: p.date,
      articleSection: p.topic, image: img(p.photo), url: url(path), mainEntityOfPage: url(path),
      author: biz, publisher: biz,
    });
  } else if (top === 'blog') {
    out.push({
      '@type': 'Blog', name: clean(here.title), url: url(path), publisher: biz,
      blogPost: C.posts.map(p => ({ '@type': 'BlogPosting', headline: p.title, datePublished: p.date, url: url('blog/' + p.id) })),
    });
  } else if (top === 'projects' && id) {
    const h = d.PROJECTS.find(x => x.id === id);
    if (h) {
      const photos = d.PHOTOS.filter(p => p.project === id && (!room || p.cat === room));
      out.push({
        '@type': 'ImageGallery', name: clean(here.title), description: here.desc, url: url(path),
        about: d.KINDS[h.kind], creator: biz,
        contentLocation: { '@type': 'Place', name: h.town === 'West Michigan' ? 'West Michigan' : `${h.town}, Michigan` },
        image: photos.slice(0, 12).map(p => SITE + d.IMG + p.src),
      });
    }
  } else if (['custom-homes', 'additions', 'remodeling'].includes(top)) {
    const pg = C.pages[{ 'custom-homes': 'custom', additions: 'additions', remodeling: 'remodel' }[top]];
    out.push({
      '@type': 'Service', name: pg.title, serviceType: pg.title, description: pg.body,
      url: url(path), image: img(pg.photo), provider: biz,
    });
  } else if (top === 'about' || top === 'about-us') {
    out.push({ '@type': 'AboutPage', name: clean(here.title), url: url(path), about: biz });
  } else if (top === 'contact') {
    out.push({ '@type': 'ContactPage', name: clean(here.title), url: url(path), about: biz });
  }

  return out.map(o => `<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', ...o }, null, 1).replace(/</g, '\\u003c')}\n</script>`).join('\n');
}
