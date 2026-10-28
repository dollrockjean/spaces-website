/* Spaces Designer Homes — site engine.
   The whole site renders from App.state, so the customize panel can change anything and re-render. */

const STORE_KEY = 'spaces-site-v1';

/* The cog editor is for the Spaces team. It turns on for the preview link (github.io), on Rocco's computer,
   or on any browser that has opened the team link once (?team=CODE). ?team=off hides it in that browser, to see the site as visitors do.
   Everyone else gets the plain website: no cog, no editor code, and no saved changes from this browser.
   The code is not a password: the editor only ever changes what this one browser shows. */
const TEAM_CODE = 'sdh-preview';
const EDITOR_ON = (() => {
  const q = new URLSearchParams(location.search).get('team');
  let saved = null;
  try {
    if (q === TEAM_CODE) localStorage.setItem('spaces-team', '1');
    if (q === 'off') localStorage.setItem('spaces-team', '0');   // "see it the way visitors do", even on the preview link
    saved = localStorage.getItem('spaces-team');
  } catch (e) { /* storage blocked */ }
  if (saved === '0') return false;
  if (saved === '1') return true;
  return /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.hostname.endsWith('github.io');
})();
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => { const ks = p.split('.'); let a = o; ks.slice(0, -1).forEach(k => (a = a[k])); a[ks[ks.length - 1]] = v; };
/* Path -> new value for every spot that differs. A list that grew or shrank is stored whole. */
function diffContent(a, b, path = '', out = {}) {
  if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length) { out[path] = b; return out; }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => diffContent(a[k], b[k], path ? `${path}.${k}` : k, out));
    return out;
  }
  if (JSON.stringify(a) !== JSON.stringify(b)) out[path] = b;
  return out;
}

const App = {
  state: null,
  history: [],
  future: [],
  listeners: [],
  route: { name: '', param: '' },

  init() {
    this.state = this.load();
    applySettings();
    window.addEventListener('hashchange', () => this.go());
    this.go();
    // Show the page once, gently, after the fonts and the first photo are ready,
    // instead of letting each piece pop in on its own.
    const first = $('#site .slide.on img, #site .hero img');
    const waits = [document.fonts ? document.fonts.ready : null, first && first.decode ? first.decode().catch(() => {}) : null].filter(Boolean);
    const show = () => { if (this.ready) return; this.ready = true; document.documentElement.classList.add('site-ready'); };
    Promise.all(waits).then(show);
    setTimeout(show, 1800);
  },
  fresh() {
    return { settings: deepCopy(DEFAULT_SETTINGS), content: deepCopy(DEFAULT_CONTENT), notes: [], author: '' };
  },
  /* Saved data is merged over the defaults, so new content added later still shows up. */
  normalize(s) {
    const f = this.fresh();
    return {
      settings: { ...f.settings, ...(s.settings || {}) },
      content: { ...f.content, ...(s.content || {}) },
      notes: Array.isArray(s.notes) ? s.notes : [],
      author: s.author || '',
    };
  },
  /* Only the differences from the defaults are stored, so when Rocco updates the site
     (new photos, new words), visitors still get them unless they changed that spot. */
  load() {
    if (!EDITOR_ON) return this.fresh();
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && s.format === 2) {
        const st = this.fresh();
        Object.assign(st.settings, s.settings);
        Object.entries(s.changes || {}).forEach(([p, v]) => { try { setPath(st.content, p, v); } catch (e) { /* spot no longer exists */ } });
        st.notes = s.notes || [];
        st.author = s.author || '';
        return st;
      }
      if (s && s.settings) return this.normalize(s);
    } catch (e) { /* private mode or bad data: start fresh */ }
    return this.fresh();
  },
  compact() {
    const settings = {};
    Object.keys(this.state.settings).forEach(k => {
      if (JSON.stringify(this.state.settings[k]) !== JSON.stringify(DEFAULT_SETTINGS[k])) settings[k] = this.state.settings[k];
    });
    return { format: 2, settings, changes: diffContent(DEFAULT_CONTENT, this.state.content), notes: this.state.notes, author: this.state.author };
  },
  save() {
    if (!EDITOR_ON) return true;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.compact())); return true; }
    catch (e) { toast('This browser is out of room to save. Try a smaller photo, or download your version.'); return false; }
  },
  get(path) { return getPath(this.state, path); },

  /* Every change goes through here so Undo works. */
  change(fn, { render = true } = {}) {
    this.history.push(JSON.stringify(this.state));
    if (this.history.length > 80) this.history.shift();
    this.future = [];
    fn(this.state);
    this.save();
    applySettings();
    if (render) this.render();
    this.emit('change');
  },
  replace(newState) {
    this.change(s => Object.assign(s, this.normalize(newState)));
  },
  undo() { this.step(this.history, this.future); },
  redo() { this.step(this.future, this.history); },
  step(from, to) {
    if (!from.length) return;
    to.push(JSON.stringify(this.state));
    this.state = JSON.parse(from.pop());
    this.save();
    applySettings();
    this.render();
    this.emit('change');
  },
  on(fn) { this.listeners.push(fn); },
  emit(type) { this.listeners.forEach(fn => fn(type)); },

  go() {
    const h = location.hash.replace(/^#\/?/, '');
    const [name = '', param = '', sub = ''] = h.split('/').map(decodeURIComponent);
    const changing = this.route.name !== (PAGES[name] ? name : '') || this.route.param !== param || this.route.sub !== sub;
    this.route = { name: PAGES[name] ? name : '', param, sub };
    this.render();
    scrollSiteTop();
    // A soft fade when moving to another page, so it doesn't jump.
    if (changing && this.ready) {
      const site = $('#site');
      site.classList.remove('page-in'); void site.offsetWidth; site.classList.add('page-in');
    }
  },
  render() {
    const site = $('#site');
    const page = PAGES[this.route.name];
    stopHero();
    site.innerHTML = header() + `<main id="main" tabindex="-1">${page.render(this.route.param, this.route.sub)}</main>` + footer() + stickyBar() + lightboxShell();
    document.title = page.title(this.route.param, this.route.sub) + (this.route.name ? ' | Spaces Designer Homes' : '');
    afterRender();
    this.emit('render');
  },
};

/* ---------- small render helpers ---------- */
const T = p => getPath(App.state.content, p);
const E = (p, tag = 'span', cls = '') => `<${tag}${cls ? ` class="${cls}"` : ''} data-edit="content.${p}">${esc(T(p))}</${tag}>`;
const srcOf = v => (!v ? '' : v.startsWith('data:') || v.includes('/') ? v : photoSrc(v));
const altOf = v => { const p = photo(v); return p ? `${ROOMS[p.cat] || 'Photo'} in ${projName(p)}, ${p.town}, built by Spaces Designer Homes` : 'Photo of a Spaces Designer Homes project'; };
/* Library photos load at the right size for the screen, over a tiny blurred preview,
   so nothing ever flashes white while a photo loads. Uploaded photos are used as is. */
const SIZES = {
  full: '100vw',
  half: '(min-width: 900px) 50vw, 100vw',
  third: '(min-width: 900px) 33vw, 50vw',
  card: '(min-width: 760px) 40vw, 85vw',
};
function imgAttrs(v, sizes = SIZES.full) {
  const p = photo(v);
  if (!p) return `src="${esc(srcOf(v))}"`;
  const f = p.src;
  const m = IMGMETA[f];
  if (!m) return `src="${IMG + f}"`;
  const long = Math.max(m[0], m[1]);
  const at = n => Math.round(m[0] * Math.min(1, n / long));
  const set = [`${IMG}sm/${f} ${at(640)}w`, `${IMG}md/${f} ${at(1280)}w`];
  if (long > 1280) set.push(`${IMG}${f} ${m[0]}w`);
  return `src="${IMG}md/${f}" srcset="${set.join(', ')}" sizes="${sizes}" data-full="${IMG + f}" style="background-image:url(data:image/png;base64,${m[2]})"`;
}
const I = (full, cls = '', eager = false, sizes = SIZES.full) => {
  const v = App.get(full);
  return `<img${cls ? ` class="${cls}"` : ''} data-img="${full}" ${imgAttrs(v, sizes)} alt="${esc(altOf(v))}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
};
const voice = () => (VOICES[App.state.settings.voice] ? App.state.settings.voice : 'you');
const EV = (k, tag = 'span', cls = '') => E(`voice.${voice()}.${k}`, tag, cls);
// Only plain web links are allowed in places people can edit (no javascript: and the like).
const safeUrl = u => (/^(https?:|mailto:|tel:|#|\/|assets\/)/i.test(String(u || '').trim()) ? String(u).trim() : '#');
const link = (route, label, cls = '') => `<a href="#/${route}"${cls ? ` class="${cls}"` : ''}>${label}</a>`;

/* Line drawings for the process steps, built on the roof-and-chimney shape of the Spaces icon. */
const DRAW = {
  vision: '<path d="M32 7a19 19 0 0 0-11 34.5c2.2 1.7 3.4 4 3.4 6.6V51h15.2v-2.9c0-2.6 1.2-4.9 3.4-6.6A19 19 0 0 0 32 7Z"/><path d="M26 56h12M28.5 60.5h7"/><path class="g" d="M22.5 31.5 32 23l9.5 8.5"/><path class="g" d="M25.5 28.8V23.5h3v2.6"/><path d="M29 38.5v-4.5h6v4.5"/>',
  plan: '<path d="M14 7h28l10 10v40H14Z"/><path d="M42 7v10h10"/><path class="g" d="M20 27.5 29 19.5l9 8"/><path class="g" d="M23 24.8V19.8h3.2v2.3"/><path d="M22.5 26.2V34h13v-7.8"/><path d="M20 42h24M20 48h16"/>',
  swatch: '<rect x="11" y="15" width="15" height="36" rx="1.5" transform="rotate(-14 18.5 51)"/><rect x="24.5" y="11" width="15" height="40" rx="1.5"/><rect class="g" x="38" y="15" width="15" height="36" rx="1.5" transform="rotate(14 45.5 51)"/><path d="M24.5 42h15"/><circle cx="32" cy="46.5" r="1.6"/>',
  build: '<path d="M8 31 32 11l24 20"/><path class="g" d="M16.5 24V14h6v5"/><path d="M14 27v26h36V27"/><path d="M23 27v26M32 27v26M41 27v26"/><path class="g" d="M14 40h36"/><path d="M8 53h48"/>',
  key: '<circle cx="19" cy="32" r="15.5"/><path class="g" d="M10.5 35 19 27.2l8.5 7.8"/><path class="g" d="M13.3 30.6V26h3.3v2"/><path d="M13 33.6V41h12v-7.4"/><path d="M34.5 32H60"/><path d="M39 27.5v9"/><path d="M51 32v9.5M57 32v7"/>',
  home: '<path class="g" d="M5 41 16 31.5 27 41"/><path d="M8 38.5V53h16V38.5"/><path d="M29 35.5 44 22.5l15 13"/><path d="M33 32v21h22V32"/><path d="M48.5 27.3V20h4.5v4"/><path class="g" d="M14 26c2-10 13-15 23-11"/><path class="g" d="m33.5 12.5 3.6 2.6-2.4 3.8"/><path d="M4 53h56"/>',
  sign: '<path d="M15 7h25l11 11v39H15Z"/><path d="M40 7v11h11"/><path d="M22 22h12M22 29h20"/><path class="g" d="m23 42 6 6 13-14"/>',
};
const drawing = k => `<svg class="draw" viewBox="0 0 64 64" aria-hidden="true">${DRAW[k]}</svg>`;
const chevron = dir => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;
const paras = s => esc(s).split(/\n\s*\n/).map(x => `<p>${x}</p>`).join('');
const initials = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const fmtDate = d => new Date(d + 'T12:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

function logo(where) {
  const L = LOGOS[App.state.settings.logo] || LOGOS.horizontal;
  if (L.file === 'badge') return `<img class="logo logo-badge" src="assets/logo/badge.svg?v=2" alt="Spaces Designer Homes">`;
  const file = where === 'footer' && L.file !== 'logo-icon' ? 'logo-stacked' : L.file;
  return `<img class="logo logo-${L.file} logo-light" src="assets/logo/${file}-light.svg?v=2" alt="Spaces Designer Homes"><img class="logo logo-${L.file} logo-dark" src="assets/logo/${file}-navy.svg?v=2" alt="" aria-hidden="true">`;
}

/* ---------- header, footer, floating bar ---------- */
const NAV = [
  { label: 'Home', route: '' },
  { label: 'Build', hub: 'build', kids: [['custom-homes', 'Custom Homes'], ['additions', 'Additions'], ['remodeling', 'Remodeling']] },
  { label: 'Our Projects', route: 'projects' },
  { label: 'Design Studio', route: 'studio' },
  { label: 'About', hub: 'about-us', kids: [['about', 'Our Story'], ['team', 'Our Team'], ['faq', 'Questions']] },
  { label: 'Blog', route: 'blog' },
  { label: 'University', route: 'university', soon: true },
];

function header() {
  const r = App.route.name;
  const active = item => (item.route === r || item.hub === r || (item.kids || []).some(k => k[0] === r) ? ' aria-current="page"' : '');
  // Menu headings with a dropdown are links too: to an overview page, or straight to the first page (cog setting).
  const target = n => (App.state.settings.navClick === 'first' ? n.kids[0][0] : n.hub);
  const items = NAV.map(n => n.kids
    ? `<li class="has-kids"><a class="nav-top" href="#/${target(n)}"${active(n)}>${n.label}</a><button type="button" class="nav-caret" aria-expanded="false" aria-label="Show ${n.label} pages"><svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg></button>
        <ul class="sub">${n.kids.map(k => `<li><a href="#/${k[0]}">${k[1]}</a></li>`).join('')}${n.label === 'About' ? T('team').map(m => `<li class="sub-person"><a href="#/team/${m.id}">${esc(m.name)}</a></li>`).join('') : ''}</ul></li>`
    : `<li><a class="nav-top" href="#/${n.route}"${active(n)}>${n.label}${n.soon ? ' <small>soon</small>' : ''}</a></li>`).join('');
  const mobile = NAV.map(n => n.kids
    ? `<li><a class="m-group" href="#/${target(n)}">${n.label}</a><ul>${n.kids.map(k => `<li><a href="#/${k[0]}">${k[1]}</a></li>`).join('')}</ul></li>`
    : `<li><a href="#/${n.route}">${n.label}${n.soon ? ' <small>soon</small>' : ''}</a></li>`).join('');
  return `<header class="hdr on-photo" data-sec="header" data-label="Top menu">
    <a class="brand" href="#/" aria-label="Spaces Designer Homes, home">${logo('header')}</a>
    <nav class="nav" aria-label="Main"><ul>${items}</ul></nav>
    <a class="btn btn-hdr" href="#/contact">Contact us</a>
    <a class="call-btn" href="#/contact" aria-label="Contact us"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v11H4z"/><path d="m4.5 7 7.5 6 7.5-6"/></svg></a>
    <button type="button" class="menu-btn" aria-expanded="false" aria-controls="mmenu"><span class="bars" aria-hidden="true"></span><span class="sr">Menu</span></button>
    <div class="mmenu" id="mmenu" hidden>
      <ul>${mobile}<li><a href="#/contact" class="m-contact">Contact us</a></li></ul>
      <p class="m-reach"><a href="tel:${T('biz.phone').replace(/\D/g, '')}">${esc(T('biz.phone'))}</a><a href="mailto:${esc(T('biz.email'))}">${esc(T('biz.email'))}</a></p>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="ftr" data-sec="footer" data-label="Bottom of page">
    <div class="ftr-top">
      <div class="ftr-brand">${logo('footer')}<p>${E('footer.blurb')}</p></div>
      <div class="ftr-cols">
        <div><h3>Build</h3><ul><li>${link('custom-homes', 'Custom Homes')}</li><li>${link('additions', 'Additions')}</li><li>${link('remodeling', 'Remodeling')}</li><li>${link('studio', 'Design Studio')}</li></ul></div>
        <div><h3>Explore</h3><ul><li>${link('projects', 'Our Projects')}</li><li>${link('blog', 'Blog')}</li><li>${link('university', 'Spaces University')}</li><li>${link('faq', 'Questions')}</li></ul></div>
        <div><h3>About</h3><ul><li>${link('about', 'Our Story')}</li><li>${link('team', 'Our Team')}</li>${T('team').map(m => `<li>${link('team/' + m.id, esc(m.name))}</li>`).join('')}</ul></div>
        <div><h3>Reach us</h3><ul class="reach">
          <li><a href="tel:${T('biz.phone').replace(/\D/g, '')}">${E('biz.phone')}</a></li>
          <li><a href="mailto:${esc(T('biz.email'))}">${E('biz.email')}</a></li>
          <li><a href="https://maps.google.com/?q=${encodeURIComponent(T('biz.street') + ' ' + T('biz.city'))}" target="_blank" rel="noopener">${E('biz.street')}<br>${E('biz.city')}</a></li>
          <li class="social"><a href="${esc(safeUrl(T('biz.facebook')))}" target="_blank" rel="noopener noreferrer">Facebook</a><a href="${esc(safeUrl(T('biz.instagram')))}" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        </ul></div>
      </div>
    </div>
    <div class="ftr-bottom">
      <p class="ftr-tag">${E('footer.tagline')}</p>
      <p>© ${new Date().getFullYear()} Spaces Designer Homes LLC. BBB Accredited Business. Serving Grand Rapids, Holland, Saugatuck, Lowell, Spring Lake, Muskegon and the lakeshore.</p>
    </div>
  </footer>`;
}

/* Photos live inside the site (assets/img). The site never connects to Google Drive. */
const fullSrc = p => IMG + p.src;
const thumbSrc = p => `${IMG}sm/${p.src}`;

/* Small contact bar on phones: home page only, after the top video, gone again near the contact form. */
const stickyBar = () => (App.route.name === '' && App.state.settings.stickyContact !== 'off'
  ? `<div class="sticky-cta"><span>Ready to talk about your home?</span><a class="btn btn-solid" href="#/contact">Contact us</a></div>` : '');

const lightboxShell = () => `<div class="lb" hidden role="dialog" aria-modal="true" aria-label="Photo viewer">
  <div class="lb-top"><span class="lb-count"></span><button type="button" class="lb-x"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>Close</button></div>
  <figure><img alt=""><figcaption></figcaption></figure>
  <div class="lb-nav"><button type="button" class="lb-prev" aria-label="Previous photo">${chevron(-1)}</button><button type="button" class="lb-next" aria-label="Next photo">${chevron(1)}</button></div></div>`;

/* ---------- home page sections ---------- */
function heroHome() {
  const s = App.state.settings;
  const ids = s.heroPhotos.length ? s.heroPhotos : DEFAULT_SETTINGS.heroPhotos;
  const [a, b] = T('hero.title').split(/(?<=\.)\s+/);
  let media;
  if (s.heroMode === 'video') {
    media = heroVideo(s.heroVideo, ids[0]);
  } else {
    media = `<div class="slides">${ids.map((id, i) => `<figure class="slide${i === 0 ? ' on' : ''}">${I('settings.heroPhotos.' + i, '', i === 0)}</figure>`).join('')}</div>`;
    // Only the first photo loads up front; the rest load once the page is showing.
  }
  const cap = id => { const p = photo(id); return p ? `<b>${esc(projName(p))}</b> ${esc(p.town)}${p.town === 'West Michigan' ? '' : ', Michigan'}` : ''; };
  return `<section class="hero hero-home" data-sec="hero" data-label="Top photo & headline">
    ${media}
    <div class="hero-shade"></div>
    <div class="hero-inner">
      <h1 class="hero-title" data-edit="content.hero.title">${esc(a)}${b ? ` <em>${esc(b)}</em>` : ''}</h1>
      <p class="hero-sub">${EV('sub')}</p>
      <div class="hero-btns"><a class="btn btn-light" href="#/contact">${EV('button')}</a><a class="link-light" href="#/projects">${E('hero.button2')}</a></div>
    </div>
    ${s.heroMode === 'video' && !s.heroVideo ? (() => { const c = VIDEOS[firstClip()]; return `<div class="hero-meta"><p class="hero-cap"><b>${esc(c.place[0])}</b> ${esc(c.place[1])}</p></div>`; })() : ''}
    ${s.heroMode !== 'video' ? `<div class="hero-meta"><p class="hero-cap" aria-live="polite">${cap(ids[0])}</p>
      <div class="hero-dots">${ids.map((_, i) => `<button type="button" aria-label="Show photo ${i + 1}"${i === 0 ? ' aria-current="true"' : ''}></button>`).join('')}</div></div>` : ''}
  </section>`;
}

function heroVideo(url, fallbackId) {
  const yt = (url || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  const vm = (url || '').match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (yt) return `<div class="hero-video"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0&playsinline=1" title="Spaces Designer Homes video" allow="autoplay; encrypted-media" tabindex="-1"></iframe></div>`;
  if (vm) return `<div class="hero-video"><iframe src="https://player.vimeo.com/video/${vm[1]}?background=1&autoplay=1&loop=1&muted=1" title="Spaces Designer Homes video" allow="autoplay" tabindex="-1"></iframe></div>`;
  if (url && /^https:\/\//i.test(url) && /\.(mp4|webm|mov)(\?|$)/i.test(url)) return `<div class="hero-video"><video src="${esc(url)}" autoplay muted loop playsinline></video></div>`;
  return droneVideo();
}

/* The built-in drone B-roll (a Spaces home in Holland). Phones get a lighter file,
   big screens a sharper one. The still frame shows until the video is playing. */
const clipId = () => { const c = App.state.settings.heroClip; return c === 'mix' || c === 'random' || VIDEOS[c] ? c : 'mix'; };
// One random pick per visit: a new video each time the site is opened, but it stays put while you click around.
const VISIT_PICK = Math.random();
const firstClipIndex = () => {
  const pick = clipId(), n = Object.keys(VIDEOS).length;
  if (pick === 'random' || (pick === 'mix' && App.state.settings.clipStart !== 'first')) return Math.floor(VISIT_PICK * n);
  return pick === 'mix' ? 0 : Object.keys(VIDEOS).indexOf(pick);
};
const firstClip = () => Object.keys(VIDEOS)[firstClipIndex()];
const clipSize = () => { const w = $('#site').clientWidth || innerWidth; return w < 760 ? 540 : w * (devicePixelRatio || 1) <= 1600 ? 720 : 1080; };
const clipSrc = id => `assets/video/${id}-${clipSize()}.mp4`;
function droneVideo() {
  const pick = clipId();
  const id = firstClip();
  const still = (navigator.connection && navigator.connection.saveData) || $('#site').dataset.motion === 'none';
  const poster = `assets/video/${id}-poster.jpg`;
  const v = (cls, src, loop) => `<video class="${cls}" src="${src}" muted ${loop ? 'loop ' : ''}playsinline preload="auto" aria-hidden="true" tabindex="-1"></video>`;
  // "Play them all" keeps a second video ready underneath and crossfades to it when one ends.
  return `<div class="hero-video drone${pick === 'mix' ? ' mix' : ''}"><img class="poster" src="${poster}" alt="Drone view of a Spaces Designer Homes home in ${esc(VIDEOS[id].place[1])}">${still ? ''
    : pick === 'mix' ? v('a', clipSrc(id), false) + v('b', '', false) : v('a', clipSrc(id), true)}</div>`;
}

const SECTION_RENDER = {
  trust() {
    return `<section class="sec trust" data-sec="trust" data-label="Why families choose us">
      <ul class="trust-list">${T('trust.items').map((t, i) => `<li>${drawing(DRAW[t.icon] ? t.icon : 'home')}<div><h3 data-edit="content.trust.items.${i}.title">${esc(t.title)}</h3><p data-edit="content.trust.items.${i}.text">${esc(t.text)}</p></div></li>`).join('')}</ul>
    </section>`;
  },
  intro() {
    return `<section class="sec intro" data-sec="intro" data-label="Who we are">
      <figure class="intro-photo">${I('content.intro.photo', '', false, SIZES.half)}<figcaption>${E('intro.caption')}</figcaption></figure>
      <div class="intro-text">
        ${EV('introTitle', 'h2', 'h-lg')}
        ${EV('introBody', 'p', 'lede')}
        <p class="intro-links">${link('about', 'Read our story')}${link('team', 'Meet the team')}</p>
      </div>
    </section>`;
  },
  paths() {
    return `<section class="sec paths" data-sec="paths" data-label="Big photo buttons">
      ${EV('pathsTitle', 'h2', 'h-md sec-title')}
      <div class="path-grid">${T('paths.items').map((it, i) => `<a class="path" href="#/${it.route}">
        ${I(`content.paths.items.${i}.photo`, '', false, i < 2 ? SIZES.half : SIZES.third)}
        <span class="path-txt"><span class="path-label" data-edit="content.paths.items.${i}.label">${esc(it.label)}</span><span class="path-sub" data-edit="content.paths.items.${i}.text">${esc(it.text)}</span></span></a>`).join('')}</div>
    </section>`;
  },
  featured() {
    return `<section class="sec featured" data-sec="featured" data-label="Featured homes">
      <div class="sec-head">${E('featured.title', 'h2', 'h-md')}${E('featured.body', 'p')}</div>
      <div class="rail" tabindex="0" aria-label="Featured homes, scroll sideways">${T('featured.items').map((id, i) => {
        const p = photo(App.get(`content.featured.items.${i}`)) || {};
        return `<a class="card" href="#/projects/${p.project || ''}">${I(`content.featured.items.${i}`, '', false, SIZES.card)}<span class="card-name">${esc(projName(p) || 'Spaces home')}</span><span class="card-town">${esc(p.town || '')}</span></a>`;
      }).join('')}</div>
      <p class="sec-more">${link('projects', 'Search all our photos', 'btn btn-line')}</p>
    </section>`;
  },
  process() {
    return `<section class="sec process" data-sec="process" data-label="Our 5-step process">
      <div class="sec-head">${EV('processTitle', 'h2', 'h-md')}${EV('processBody', 'p')}</div>
      <ol class="steps">${T('process.steps').map((st, i) => `<li>${drawing(['vision', 'plan', 'swatch', 'build', 'key'][i] || 'plan')}<span class="step-n">Step ${i + 1}</span>
        <h3 data-edit="content.process.steps.${i}.title">${esc(st.title)}</h3><p data-edit="content.process.steps.${i}.text">${esc(st.text)}</p></li>`).join('')}</ol>
    </section>`;
  },
  video() {
    const url = App.state.settings.clientVideo;
    return `<section class="sec video" data-sec="video" data-label="Client video & reviews">
      ${E('video.title', 'h2', 'h-md sec-title')}
      <div class="video-grid">
        <div class="video-box">${I('content.video.poster', '', false, SIZES.half)}<button type="button" class="play" data-video="${esc(url)}" aria-label="Play client video"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>
          <p class="video-cap">${url ? E('video.caption') : 'Client story video coming soon'}</p></div>
        <div class="reviews" aria-roledescription="carousel">
          ${T('reviews').map((r, i) => `<blockquote class="review${i === 0 ? ' on' : ''}"><p data-edit="content.reviews.${i}.text">${esc(r.text)}</p><footer data-edit="content.reviews.${i}.name">${esc(r.name)}</footer></blockquote>`).join('')}
          <div class="rev-nav"><button type="button" class="rev-prev" aria-label="Previous review">${chevron(-1)}</button><span class="rev-count">1 of ${T('reviews').length}</span><button type="button" class="rev-next" aria-label="Next review">${chevron(1)}</button></div>
        </div>
      </div>
    </section>`;
  },
  convictions() {
    return `<section class="sec convictions" data-sec="convictions" data-label="What we believe">
      <figure class="conv-photo">${I('content.convictions.photo', '', false, SIZES.half)}</figure>
      <div class="conv-text">${E('convictions.title', 'h2', 'h-md')}
      <dl class="conv-list">${T('convictions.items').map((c, i) => `<div class="conv"><dt data-edit="content.convictions.items.${i}.title">${esc(c.title)}</dt><dd data-edit="content.convictions.items.${i}.text">${esc(c.text)}</dd></div>`).join('')}</dl></div>
    </section>`;
  },
  studio() {
    return `<section class="sec studio-teaser" data-sec="studio" data-label="Design Studio">
      <figure class="st-photo">${I('content.studio.photo', '', false, SIZES.half)}</figure>
      <div class="st-panel">${E('studio.title', 'h2', 'h-md')}${E('studio.body', 'p')}<a class="btn btn-solid" href="#/studio">${E('studio.button')}</a></div>
    </section>`;
  },
  blog() {
    return `<section class="sec blog-teaser" data-sec="blog" data-label="From the blog">
      <div class="sec-head">${E('blogTeaser.title', 'h2', 'h-md')}${E('blogTeaser.body', 'p')}</div>
      <div class="post-grid">${T('posts').slice(0, 3).map((p, i) => postCard(p, i)).join('')}</div>
    </section>`;
  },
  contact() { return contactBlock(); },
};

const postCard = (p, i) => `<a class="post-card" href="#/blog/${p.id}">${I(`content.posts.${i}.photo`, '', false, SIZES.third)}<span class="post-date">${fmtDate(p.date)}</span><span class="post-title">${esc(p.title)}</span><span class="post-ex">${esc(p.excerpt)}</span></a>`;

function contactBlock() {
  const tel = T('biz.phone').replace(/\D/g, '');
  return `<section class="sec contact" id="contact" data-sec="contact" data-label="Contact us">
    <div class="contact-text">${EV('contactTitle', 'h2', 'h-lg')}${EV('contactBody', 'p', 'lede')}
      <ul class="contact-ways">
        <li><span>Call us</span><a href="tel:${tel}">${esc(T('biz.phone'))}</a></li>
        <li><span>Email</span><a href="mailto:${esc(T('biz.email'))}">${esc(T('biz.email'))}</a></li>
        <li><span>Visit the studio</span><a href="https://maps.google.com/?q=${encodeURIComponent(T('biz.street') + ' ' + T('biz.city'))}" target="_blank" rel="noopener">${esc(T('biz.street'))}, Grand Rapids</a></li>
      </ul></div>
    <form class="contact-form" novalidate data-t="${Date.now()}">
      <label>Your name<input name="name" autocomplete="name" required maxlength="100"></label>
      <label>Email<input name="email" type="email" autocomplete="email" required maxlength="150"></label>
      <label><span>Phone <span class="opt">(optional)</span></span><input name="phone" type="tel" autocomplete="tel" maxlength="30"></label>
      <label class="hp" aria-hidden="true">Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label>
      <label>What are you planning?<select name="kind"><option>A custom home</option><option>An addition</option><option>A remodel</option><option>Not sure yet</option></select></label>
      <label class="full">Tell us a little about it<textarea name="msg" rows="4" maxlength="2000"></textarea></label>
      <button class="btn btn-solid full" type="submit">${E('contact.button')}</button>
      <p class="form-note full">No pressure and no sales pitch. Prefer to talk? Call <a href="tel:${tel}">${esc(T('biz.phone'))}</a>.</p>
      <p class="form-msg full" role="status"></p>
    </form>
  </section>`;
}

/* ---------- inner pages ---------- */
function pageHero(key, title, lead) {
  return `<section class="hero hero-page" data-sec="page-hero" data-label="Page top photo">
    <div class="slides"><figure class="slide on">${I(`content.pages.${key}.photo`, '', true)}</figure></div>
    <div class="hero-shade"></div>
    <div class="hero-inner">${E(`pages.${key}.title`, 'h1', 'hero-title')}${E(`pages.${key}.lead`, 'p', 'hero-sub')}</div>
  </section>`;
}

function servicePage(key) {
  const pg = T(`pages.${key}`);
  return pageHero(key) + `
  <section class="sec svc" data-sec="svc-intro" data-label="Page intro">
    <div class="svc-body">${E(`pages.${key}.body`, 'p', 'lede')}<a class="btn btn-solid" href="#/contact">Talk to our team</a></div>
    <ul class="checks">${pg.points.map((p, i) => `<li data-edit="content.pages.${key}.points.${i}">${esc(p)}</li>`).join('')}</ul>
  </section>
  <section class="sec gallery-sec" data-sec="svc-gallery" data-label="Page photos">
    <div class="mosaic">${pg.gallery.map((id, i) => `<button type="button" class="mo" data-lb="${i}">${I(`content.pages.${key}.gallery.${i}`, '', false, i ? SIZES.third : SIZES.half)}</button>`).join('')}</div>
    <p class="sec-more">${link('projects', 'See every project', 'btn btn-line')}</p>
  </section>` + SECTION_RENDER.process() + contactBlock();
}

/* Our Projects: houses first, then a house's rooms, then a room's photos.
   Routes: #/projects, #/projects/<house>, #/projects/<house>/<room> */
const houses = () => PROJECTS.filter(p => photosOf(p.id).length);
const roomsOf = id => CATS.map(([k, label]) => ({ k, label, photos: photosOf(id).filter(p => p.cat === k) })).filter(r => r.photos.length);
const houseHay = h => `${h.name} ${h.town} ${KINDS[h.kind] || ''} ${photosOf(h.id).map(p => `${ROOMS[p.cat]} ${p.tags}`).join(' ')}`.toLowerCase();
const tileGrid = (list, labels = true) => `<div class="masonry" data-photos="${list.map(p => p.id).join(',')}">${list.map((p, i) => `<button type="button" class="tile" data-lb="${i}"><span class="tile-img" style="aspect-ratio:${(IMGMETA[p.src] || [4, 3])[0]}/${(IMGMETA[p.src] || [4, 3])[1]}"><img ${imgAttrs(p.id, SIZES.third)} alt="${esc(altOf(p.id))}" loading="lazy"></span>${labels ? `<span>${esc(ROOMS[p.cat])}</span>` : ''}</button>`).join('')}</div>`;

function projectsPage(id, room) {
  const h = project(id);
  if (h && photosOf(h.id).length) return room && ROOMS[room] ? roomPage(h, room) : housePage(h);
  return `<section class="sec proj-head" data-sec="projects-search" data-label="Projects search">
    <h1 class="h-lg">Our Projects</h1>
    <p class="lede">Every home here is a real Spaces home. Open one to walk through it room by room.</p>
    <label class="search"><span class="sr">Search homes</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
      <input type="search" id="psearch" placeholder="Try kitchen, lake or Holland" autocomplete="off"></label>
    <div class="chips" role="group" aria-label="Kind of project">${Object.entries(KINDS).map(([k, v]) => `<button type="button" class="chip" data-kind="${k}" aria-pressed="false">${v}</button>`).join('')}</div>
  </section>
  <section class="sec proj-results" data-sec="projects-grid" data-label="Project list">
    <p class="result-count" role="status"></p>
    <div class="house-grid" id="hgrid"></div>
  </section>`;
}

function houseCard(h, words) {
  // When searching for a room or feature, the card shows a matching photo and says how many match.
  const all = photosOf(h.id);
  const match = words.length ? all.filter(p => words.every(w => `${ROOMS[p.cat]} ${p.tags}`.toLowerCase().includes(w))) : [];
  const nameHit = words.every(w => `${h.name} ${h.town}`.toLowerCase().includes(w));
  const cover = match.length && !nameHit ? match[0].id : h.cover;
  const note = match.length && !nameHit ? `${match.length} matching photo${match.length > 1 ? 's' : ''}` : `${all.length} photos`;
  return `<a class="house-card" href="#/projects/${h.id}"><span class="hc-img"><img ${imgAttrs(cover, SIZES.third)} alt="${esc(h.name)}, a Spaces Designer Homes project in ${esc(h.town)}" loading="lazy"></span>
    <span class="hc-name">${esc(h.name)}</span><span class="hc-meta">${esc(h.town)}<i aria-hidden="true"></i>${note}</span></a>`;
}

/* House and room pages are built for people who don't use websites much:
   a big back button that stays on screen, plain titles, one hint, and no hidden steps. */
const backIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
const backBar = (href, label) => `<div class="backbar"><a class="back-btn" href="${href}">${backIcon}<span>${label}</span></a></div>`;
const townLine = h => `${esc(h.town)}${h.town === 'West Michigan' ? '' : ', Michigan'}`;

function moreHomes(h) {
  const others = houses().filter(x => x.id !== h.id);
  const at = Math.max(0, houses().findIndex(x => x.id === h.id));
  const pick = [0, 1, 2].map(i => others[(at + i) % others.length]).filter(Boolean);
  return `<section class="sec more-homes" data-sec="more-homes" data-label="More homes">
    <h2 class="h-md">More homes</h2>
    <div class="house-grid">${pick.map(x => houseCard(x, [])).join('')}</div>
    <p class="big-actions"><a class="btn btn-solid" href="#/projects">See all homes</a></p>
  </section>`;
}

function housePage(h) {
  const rooms = roomsOf(h.id);
  const all = photosOf(h.id);
  const folders = App.state.settings.projectView !== 'tags' && rooms.length > 1;
  const video = h.video && VIDEOS[h.video]
    ? `<div class="house-video"><video controls preload="none" playsinline poster="assets/video/${h.video}-poster.jpg" src="assets/video/${h.video}-720.mp4"></video><p>Drone video. Press play to watch.</p></div>` : '';
  const body = folders
    ? `<p class="hint">Tap a room to see its photos.</p>
       <div class="room-grid">${rooms.map(r => `<a class="room-tile" href="#/projects/${h.id}/${r.k}"><img ${imgAttrs(r.photos[0].id, SIZES.third)} alt="" loading="lazy"><span><b>${esc(r.label)}</b>${r.photos.length} photo${r.photos.length > 1 ? 's' : ''}</span></a>`).join('')}</div>`
    : `<p class="hint">Tap a photo to see it bigger. Use the buttons to show one room.</p>
       <div class="chips room-chips" role="group" aria-label="Show a room"><button type="button" class="chip" data-room="" aria-pressed="true">All rooms</button>${rooms.map(r => `<button type="button" class="chip" data-room="${r.k}" aria-pressed="false">${esc(r.label)} <small>${r.photos.length}</small></button>`).join('')}</div>
       <div id="house-photos">${tileGrid(all)}</div>`;
  return backBar('#/projects', 'All homes') + `<section class="sec house-head" data-sec="house-top" data-label="Home title">
    <h1 class="h-lg">${esc(h.name)}</h1><p class="house-meta">${townLine(h)}<i aria-hidden="true"></i>${all.length} photos</p>
    <figure class="house-cover"><img ${imgAttrs(h.cover, SIZES.full)} alt="${esc(h.name)}, built by Spaces Designer Homes" fetchpriority="high"></figure>
  </section>
  <section class="sec house-body" data-sec="house-rooms" data-label="Rooms">${video}${body}</section>` + moreHomes(h);
}

function roomPage(h, room) {
  const list = photosOf(h.id).filter(p => p.cat === room);
  const others = roomsOf(h.id).filter(r => r.k !== room);
  return backBar(`#/projects/${h.id}`, `Back to ${esc(h.name)}`) + `<section class="sec house-head" data-sec="room-top" data-label="Room title">
    <h1 class="h-lg">${esc(ROOMS[room])}</h1><p class="house-meta">${esc(h.name)}<i aria-hidden="true"></i>${list.length} photo${list.length > 1 ? 's' : ''}</p>
  </section>
  <section class="sec house-body room-body" data-sec="room-photos" data-label="Room photos">
    <p class="hint">Tap a photo to see it bigger.</p>
    ${tileGrid(list, false)}
    ${others.length ? `<h2 class="h-sm other-rooms-title">Other rooms in ${esc(h.name)}</h2>
    <div class="other-rooms">${others.map(r => `<a class="other-room" href="#/projects/${h.id}/${r.k}"><img ${imgAttrs(r.photos[0].id, SIZES.third)} alt="" loading="lazy"><span>${esc(r.label)}</span></a>`).join('')}</div>` : ''}
    <p class="big-actions"><a class="btn btn-solid" href="#/projects/${h.id}">${backIcon.replace('<svg', '<svg class="btn-ico"')} Back to ${esc(h.name)}</a><a class="btn btn-line" href="#/projects">See all homes</a></p>
  </section>`;
}

/* Search and filters on the projects list. Listeners live on the section, so they go away with it. */
function initProjects() {
  const site = $('#site');
  const grid = $('#hgrid', site);
  if (grid) {
    const input = $('#psearch', site), count = $('.result-count', site);
    let kind = null;
    const run = () => {
      const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
      const hits = houses().filter(h => (!kind || h.kind === kind) && words.every(w => houseHay(h).includes(w)));
      grid.innerHTML = hits.map(h => houseCard(h, words)).join('');
      count.innerHTML = hits.length ? `${hits.length} home${hits.length > 1 ? 's' : ''}`
        : `Nothing matches that yet. Try “kitchen”, “lake” or “Holland”. <button type="button" class="linkish clear-search">Show all homes</button>`;
    };
    input.addEventListener('input', run);
    $('.proj-head', site).addEventListener('click', e => {
      const c = e.target.closest('.chip');
      if (!c) return;
      kind = kind === c.dataset.kind ? null : c.dataset.kind;
      $$('.chip[data-kind]', site).forEach(x => x.setAttribute('aria-pressed', String(x.dataset.kind === kind)));
      run();
    });
    $('.proj-results', site).addEventListener('click', e => { if (e.target.closest('.clear-search')) { input.value = ''; kind = null; $$('.chip[data-kind]', site).forEach(x => x.setAttribute('aria-pressed', 'false')); run(); } });
    run();
  }
  // Room tags on a house page (when rooms are shown all at once).
  const chips = $('.room-chips', site);
  if (chips) chips.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    $$('.chip', chips).forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    const id = App.route.param;
    $('#house-photos', site).innerHTML = tileGrid(photosOf(id).filter(p => !c.dataset.room || p.cat === c.dataset.room));
  });
}

function teamPage(id) {
  const team = T('team');
  const tabs = `<nav class="tabs" aria-label="Team members"><a href="#/team"${!id ? ' aria-current="page"' : ''}>Everyone</a>${team.map(m => `<a href="#/team/${m.id}"${m.id === id ? ' aria-current="page"' : ''}>${esc(m.name)}</a>`).join('')}</nav>`;
  const head = m => m.photo ? `<img data-img="content.team.${team.indexOf(m)}.photo" src="${esc(srcOf(m.photo))}" alt="${esc(m.name)}, ${esc(m.role)} at Spaces Designer Homes">`
    : `<span class="mono" data-img="content.team.${team.indexOf(m)}.photo" role="img" aria-label="Headshot coming soon"><img src="assets/logo/logo-icon-light.svg?v=2" alt=""><b>${initials(m.name)}</b></span>`;
  if (id) {
    const i = team.findIndex(m => m.id === id);
    if (i < 0) return teamPage('');
    const m = team[i];
    return `<section class="sec person" data-sec="person" data-label="Team member page">${tabs}
      <div class="person-grid"><figure class="headshot big">${head(m)}</figure>
      <div>${E(`team.${i}.name`, 'h1', 'h-lg')}${E(`team.${i}.role`, 'p', 'role')}${E(`team.${i}.bio`, 'p', 'lede')}
      <p><a class="btn btn-solid" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Hello ' + m.name)}">Email ${esc(m.name.split(' ')[0])}</a></p>
      <p class="edit-only"><button type="button" class="btn btn-line" data-remove-member="${i}">Remove this person</button></p></div></div>
    </section>` + contactBlock();
  }
  return `<section class="sec team" data-sec="team" data-label="Team page">
    <h1 class="h-lg">Our Team</h1><p class="lede">One team stays with you from the first conversation to the keys, and long after. No rotating cast, no phone tree.</p>
    ${tabs}
    <div class="team-grid">${team.map((m, i) => `<a class="member" href="#/team/${m.id}"><figure class="headshot">${head(m)}</figure>
      <span class="m-name" data-edit="content.team.${i}.name">${esc(m.name)}</span><span class="m-role" data-edit="content.team.${i}.role">${esc(m.role)}</span></a>`).join('')}
      <button type="button" class="member add-member edit-only"><span>+</span>Add a team member</button></div>
  </section>` + contactBlock();
}

function blogPage(id) {
  const posts = T('posts');
  if (id) {
    const i = posts.findIndex(p => p.id === id);
    if (i >= 0) {
      const p = posts[i];
      return `<article class="sec post" data-sec="post" data-label="Blog post">
        <p class="crumb">${link('blog', 'All posts')}</p>
        <p class="post-date">${fmtDate(p.date)}</p>${E(`posts.${i}.title`, 'h1', 'h-lg')}
        <figure class="post-photo">${I(`content.posts.${i}.photo`, '', true, '(min-width: 860px) 820px, 100vw')}</figure>
        <div class="post-body" data-edit="content.posts.${i}.body">${esc(p.body)}</div>
      </article>` + contactBlock();
    }
  }
  return `<section class="sec blog-list" data-sec="blog-list" data-label="Blog list">
    <h1 class="h-lg">The Spaces Blog</h1><p class="lede">Plain answers about building, remodeling and living well in West Michigan. Video posts are on the way.</p>
    <div class="post-grid">${posts.map((p, i) => postCard(p, i)).join('')}</div>
  </section>`;
}

function studioPage() {
  const pg = T('pages.studio');
  return pageHero('studio') + `
  <section class="sec svc" data-sec="studio-intro" data-label="Studio intro">
    <div class="svc-body">${E('pages.studio.body', 'p', 'lede')}<a class="btn btn-solid" href="#/contact">Book a studio visit</a></div>
    <div class="materials"><h2 class="h-sm">What you will choose here</h2><ul>${pg.materials.map((m, i) => `<li data-edit="content.pages.studio.materials.${i}">${esc(m)}</li>`).join('')}</ul></div>
  </section>
  <section class="sec process" data-sec="studio-steps" data-label="Studio steps">
    <div class="sec-head"><h2 class="h-md">A visit, step by step</h2></div>
    <ol class="steps four">${pg.steps.map((st, i) => `<li>${drawing(['vision', 'plan', 'swatch', 'sign'][i] || 'plan')}<span class="step-n">Step ${i + 1}</span><h3 data-edit="content.pages.studio.steps.${i}.title">${esc(st.title)}</h3><p data-edit="content.pages.studio.steps.${i}.text">${esc(st.text)}</p></li>`).join('')}</ol>
  </section>
  <section class="sec gallery-sec" data-sec="studio-gallery" data-label="Studio photos">
    <div class="mosaic">${pg.gallery.map((id, i) => `<button type="button" class="mo" data-lb="${i}">${I(`content.pages.studio.gallery.${i}`, '', false, i ? SIZES.third : SIZES.half)}</button>`).join('')}</div>
  </section>` + contactBlock();
}

function aboutPage() {
  return pageHero('about') + `
  <section class="sec story" data-sec="story" data-label="Our story">
    <h2 class="h-md">Our story</h2>${E('pages.about.body', 'p', 'lede')}
    <h2 class="h-md">Our mission</h2>${E('pages.about.mission', 'p', 'lede')}
    <p class="intro-links">${link('team', 'Meet the team')}${link('faq', 'Common questions')}</p>
  </section>` + SECTION_RENDER.convictions() + SECTION_RENDER.video() + contactBlock();
}

function faqPage() {
  return `<section class="sec faq" data-sec="faq" data-label="Questions">
    <h1 class="h-lg">Common questions</h1><p class="lede">Straight answers. If yours is not here, just ask.</p>
    <div class="faq-list">${T('faq').map((f, i) => `<details${i === 0 ? ' open' : ''}><summary data-edit="content.faq.${i}.q">${esc(f.q)}</summary><p data-edit="content.faq.${i}.a">${esc(f.a)}</p></details>`).join('')}</div>
  </section>` + contactBlock();
}

function universityPage() {
  return `<section class="sec uni" data-sec="university" data-label="Spaces University">
    <img class="uni-badge" src="assets/logo/badge-university.svg?v=2" alt="Spaces University badge">
    ${E('pages.university.title', 'h1', 'h-lg')}<p class="soon-tag">${E('pages.university.lead')}</p>${E('pages.university.body', 'p', 'lede')}
    <form class="notify" novalidate data-t="${Date.now()}"><label><span class="sr">Your email</span><input name="email" type="email" placeholder="Your email" required maxlength="150"></label><label class="hp" aria-hidden="true">Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label><button class="btn btn-solid" type="submit">Tell me when it opens</button><p class="form-msg" role="status"></p></form>
  </section>`;
}

/* Overview pages for the Build and About menu headings. */
const HUB_ART = {
  'custom-homes': ['farm-front', 'Built from your ideas, start to finish'], additions: ['pool-house', 'More room, without moving'], remodeling: ['remodel-kitchen', 'Kitchens, baths and whole homes'],
  about: ['wooded-drive', 'How Spaces started and what we stand for'], team: ['farm-entry', 'The people who will build with you'], faq: ['fennville-living', 'Straight answers about cost and timing'],
};
function hubPage(key) {
  const n = NAV.find(x => x.hub === key);
  return `<section class="sec hub" data-sec="hub" data-label="${n.label} overview">
    <h1 class="h-lg">${key === 'build' ? 'What we build' : 'About Spaces'}</h1>
    <div class="path-grid hub-grid">${n.kids.map(([r, l]) => { const [ph, txt] = HUB_ART[r]; return `<a class="path" href="#/${r}"><img ${imgAttrs(ph, SIZES.third)} alt="" loading="lazy"><span class="path-txt"><span class="path-label">${l}</span><span class="path-sub">${txt}</span></span></a>`; }).join('')}</div>
  </section>` + contactBlock();
}

const PAGES = {
  build: { title: () => 'What we build', render: () => hubPage('build') },
  'about-us': { title: () => 'About Spaces', render: () => hubPage('about-us') },
  '': { title: () => 'Custom Home Builder in Grand Rapids, MI | Spaces Designer Homes', render: () => {
    const s = App.state.settings;
    return heroHome() + s.homeOrder.filter(k => !s.homeHidden.includes(k) && SECTION_RENDER[k]).map(k => SECTION_RENDER[k]()).join('');
  } },
  'custom-homes': { title: () => 'Custom Homes', render: () => servicePage('custom') },
  additions: { title: () => 'Home Additions', render: () => servicePage('additions') },
  remodeling: { title: () => 'Remodeling', render: () => servicePage('remodel') },
  projects: { title: (id, room) => { const h = project(id); return h ? (room && ROOMS[room] ? `${ROOMS[room]}, ${h.name}` : h.name) : 'Our Projects'; }, render: projectsPage },
  studio: { title: () => 'Design Studio', render: studioPage },
  about: { title: () => 'Our Story', render: aboutPage },
  team: { title: id => { const m = T('team').find(x => x.id === id); return m ? `${m.name}, ${m.role}` : 'Our Team'; }, render: teamPage },
  blog: { title: id => (T('posts').find(p => p.id === id) || {}).title || 'Blog', render: blogPage },
  faq: { title: () => 'Questions', render: faqPage },
  university: { title: () => 'Spaces University', render: universityPage },
  contact: { title: () => 'Contact Us', render: () => `<div class="contact-page">${contactBlock()}</div>` },
};

/* ---------- behaviour after each render ---------- */
let heroTimer = null;
function stopHero() { clearInterval(heroTimer); heroTimer = null; }

function afterRender() {
  const site = $('#site');
  const motion = site.dataset.motion;
  // Hero slideshow
  const slides = $$('.hero-home .slide', site);
  if (slides.length > 1) {
    let cur = 0;
    const ids = App.state.settings.heroPhotos;
    const show = n => {
      slides[cur].classList.remove('on');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('on');
      $$('.hero-dots button', site).forEach((b, i) => b.toggleAttribute('aria-current', i === cur));
      const p = photo(App.get('settings.heroPhotos.' + cur) || ids[cur]);
      const cap = $('.hero-cap', site);
      if (cap && p) cap.innerHTML = `<b>${esc(projName(p))}</b> ${esc(p.town)}${p.town === 'West Michigan' ? '' : ', Michigan'}`;
    };
    $$('.hero-dots button', site).forEach((b, i) => b.addEventListener('click', () => { show(i); restart(); }));
    // Move on only to a photo that has finished loading, so a slide never appears half-drawn.
    const next = () => {
      for (let k = 1; k < slides.length; k++) {
        const n = (cur + k) % slides.length;
        const im = $('img', slides[n]);
        if (im && im.complete && im.naturalWidth) return show(n);
      }
    };
    const restart = () => { stopHero(); if (motion !== 'none') heroTimer = setInterval(next, 6500); };
    setTimeout(() => $$('img', site).forEach(im => { if (im.closest('.slide')) im.loading = 'eager'; }), 1200);
    restart();
  }
  // Drone video: fade in over the still frame once it is really playing.
  const vid = $('.hero-video video.a', site);
  if (vid) {
    vid.addEventListener('playing', () => vid.classList.add('playing'), { once: true });
    vid.play().catch(() => {});
    if ($('.hero-video.mix', site)) playInTurn(vid, $('.hero-video video.b', site));
  }
  // Reviews
  const revs = $$('.review', site);
  let rv = 0;
  const showRev = n => { revs[rv].classList.remove('on'); rv = (n + revs.length) % revs.length; revs[rv].classList.add('on'); $('.rev-count', site).textContent = `${rv + 1} / ${revs.length}`; };
  if (revs.length) { $('.rev-prev', site).onclick = () => showRev(rv - 1); $('.rev-next', site).onclick = () => showRev(rv + 1); }
  if (App.route.name === 'projects') initProjects();
  styleHeadings(site);
  updateHeader();
}

/* "Play them all": when one clip ends, the other video (already loaded) fades in with the next one. */
function playInTurn(a, b) {
  const ids = Object.keys(VIDEOS);
  let i = firstClipIndex(), cur = a, nxt = b;
  const cap = $('#site .hero-cap');
  const label = id => `<b>${esc(VIDEOS[id].place[0])}</b> ${esc(VIDEOS[id].place[1])}`;
  const queue = () => { nxt.src = clipSrc(ids[(i + 1) % ids.length]); nxt.load(); };
  queue();
  const advance = () => {
    i = (i + 1) % ids.length;
    nxt.currentTime = 0;
    nxt.play().catch(() => {});
    nxt.classList.add('playing');
    cur.classList.remove('playing');
    if (cap) cap.innerHTML = label(ids[i]);
    [cur, nxt] = [nxt, cur];
    setTimeout(queue, 1200);
  };
  a.addEventListener('ended', advance);
  b.addEventListener('ended', advance);
}

/* Headline style (cog): "accent" sets the end of each section headline in gold italic,
   the way the brand guide sets "Our Masterpiece." The words themselves stay editable. */
function styleHeadings(site) {
  if ((App.state.settings.headings || 'accent') === 'plain') return;
  $$('main .h-lg, main .h-md', site).forEach(h => {
    if (h.closest('.hero') || h.children.length) return;
    const words = h.textContent.trim().split(/\s+/);
    if (words.length < 3) return;
    // Split at a comma if there is one, otherwise accent roughly the last 40% of the words.
    const comma = words.findIndex((w, i) => i > 0 && i < words.length - 1 && /,$/.test(w));
    const k = comma > 0 ? words.length - comma - 1 : Math.max(2, Math.round(words.length * 0.4));
    h.innerHTML = `${esc(words.slice(0, -k).join(' '))} <em class="hl">${esc(words.slice(-k).join(' '))}</em>`;
  });
}

/* Lightbox for any grid of photos */
let lbList = [], lbAt = 0;
function openLightbox(list, at) {
  const lb = $('#site .lb');
  lbList = list; lbAt = at;
  lb.hidden = false;
  showLb();
  $('.lb-x', lb).focus();
}
function showLb() {
  const lb = $('#site .lb');
  const p = lbList[(lbAt + lbList.length) % lbList.length];
  lbAt = (lbAt + lbList.length) % lbList.length;
  $('img', lb).src = p.src; $('img', lb).alt = p.alt;
  $('figcaption', lb).textContent = p.caption;
  $('.lb-count', lb).textContent = lbList.length > 1 ? `Photo ${lbAt + 1} of ${lbList.length}` : '';
  $('.lb-nav', lb).hidden = lbList.length < 2;
}
// Swipe left or right on a phone to move between photos.
let lbTouch = null;
document.addEventListener('touchstart', e => { if (e.target.closest('.lb')) lbTouch = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  if (lbTouch === null || !e.target.closest('.lb')) return;
  const dx = e.changedTouches[0].clientX - lbTouch; lbTouch = null;
  if (Math.abs(dx) > 50) { lbAt += dx < 0 ? 1 : -1; showLb(); }
}, { passive: true });

/* ---------- contact form safety ----------
   Spam traps: a hidden field people never see (bots fill it in), a minimum time on the page,
   and one message per minute from the same browser. Whatever people type is cleaned and cut
   to a sensible length before it goes anywhere. The Google Sheet side checks all of this again. */
const FORM_ENDPOINT = '';   // the add-only Google Sheet script address, once it exists (see contact-form/SETUP.md)
const clean = (v, max) => String(v || '').normalize('NFC').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[<>]/g, '').replace(/[ \t]+/g, ' ').trim().slice(0, max);
async function sendForm(form, msg) {
  const f = new FormData(form);
  const quiet = () => { msg.textContent = 'Thanks! We got your message.'; form.reset(); };
  if (f.get('website')) return quiet();                                     // a bot filled the hidden trap
  if (form.dataset.t && Date.now() - +form.dataset.t < 3000) return quiet(); // sent faster than a person can type
  let last = 0; try { last = +localStorage.getItem('spaces-form-sent') || 0; } catch (e) { /* storage blocked */ }
  if (Date.now() - last < 60000) { msg.textContent = 'Thanks, we already have your message. Please wait a minute before sending another.'; return; }
  const data = {
    name: clean(f.get('name'), 100), email: clean(f.get('email'), 150).toLowerCase(), phone: clean(f.get('phone'), 30).replace(/[^0-9+()\-. ]/g, ''),
    kind: clean(f.get('kind'), 40), message: clean(f.get('msg'), 2000), form: form.classList.contains('notify') ? 'university' : 'contact',
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) { msg.textContent = 'Please check your email address.'; return; }
  if (!FORM_ENDPOINT) { msg.textContent = 'Thanks! This is a preview, so nothing was sent yet. On the live site this goes straight to the Spaces team.'; form.reset(); return; }
  msg.textContent = 'Sending…';
  try {
    const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) });
    const out = await r.json();
    if (!out.ok) throw new Error(out.error || 'not saved');
    try { localStorage.setItem('spaces-form-sent', String(Date.now())); } catch (e) { /* fine */ }
    quiet();
  } catch (err) {
    // Never pretend it was sent. Keep what they typed and give them another way to reach Spaces.
    msg.innerHTML = `That did not go through. Please call <a href="tel:${T('biz.phone').replace(/\D/g, '')}">${esc(T('biz.phone'))}</a> or email <a href="mailto:${esc(T('biz.email'))}">${esc(T('biz.email'))}</a>.`;
  }
}

/* Delegated events on the site (survive re-renders) */
function bindSite() {
  const site = $('#site');
  site.addEventListener('click', e => {
    if (document.body.classList.contains('editing-words') && e.target.closest('[data-edit]')) return;
    const t = e.target;
    // Mobile menu
    const mb = t.closest('.menu-btn');
    if (mb) {
      const m = $('#mmenu', site); const open = m.hidden;
      m.hidden = !open; mb.setAttribute('aria-expanded', String(open)); site.classList.toggle('menu-open', open);
      return;
    }
    if (t.closest('.mmenu a')) site.classList.remove('menu-open');
    // Dropdowns
    const top = t.closest('.nav-caret');
    if (top) { const ex = top.getAttribute('aria-expanded') === 'true'; $$('.nav-caret', site).forEach(b => b.setAttribute('aria-expanded', 'false')); top.setAttribute('aria-expanded', String(!ex)); return; }
    if (!t.closest('.has-kids')) $$('.nav-caret', site).forEach(b => b.setAttribute('aria-expanded', 'false'));
    // Lightbox from grids
    const tile = t.closest('[data-lb]');
    if (tile && !document.body.classList.contains('swapping')) {
      const holder = tile.parentElement;
      const list = holder.dataset.photos
        ? holder.dataset.photos.split(',').map(photo).map(p => ({ src: fullSrc(p), alt: altOf(p.id), caption: `${ROOMS[p.cat]}, ${projName(p)}` }))
        : $$('img', holder).map(im => ({ src: im.dataset.full || im.currentSrc || im.src, alt: im.alt, caption: im.alt.replace(/, built by Spaces Designer Homes$/, '') }));
      openLightbox(list, +tile.dataset.lb);
      return;
    }
    if (t.closest('.lb-x') || t.classList.contains('lb') || t.tagName === 'FIGURE') { $('.lb', site).hidden = true; return; }
    if (t.closest('.lb-prev')) { lbAt--; showLb(); return; }
    if (t.closest('.lb-next')) { lbAt++; showLb(); return; }
    // Client video
    const play = t.closest('.play');
    if (play) {
      const box = play.closest('.video-box');
      const url = play.dataset.video;
      if (!url) { $('.video-cap', box).textContent = 'The client video will play here once it is added.'; return; }
      box.innerHTML = heroVideo(url, '').replace('mute=1', 'mute=0').replace('controls=0', 'controls=1').replace('background=1', 'background=0').replace('muted', '') ;
      box.classList.add('playing');
      return;
    }
    // Team editing
    if (t.closest('.add-member')) { App.change(s => s.content.team.push({ id: 'person-' + Date.now().toString(36), name: 'New team member', role: 'Role', photo: '', bio: 'A short, friendly bio goes here.', email: s.content.biz.email })); toast('Added. Click the new name to edit it.'); return; }
    const rm = t.closest('[data-remove-member]');
    if (rm) { const i = +rm.dataset.removeMember; App.change(s => s.content.team.splice(i, 1)); location.hash = '#/team'; toast('Removed. Use Undo if that was a mistake.'); return; }
    // Skip link inside site not needed; anchors are routes.
  });
  site.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const msg = $('.form-msg', form);
    if (!form.checkValidity()) { msg.textContent = 'Please add your name and a valid email so we can reply.'; form.reportValidity(); return; }
    sendForm(form, msg);
  });
  document.addEventListener('keydown', e => {
    const lb = $('#site .lb');
    if (!lb || lb.hidden) return;
    if (e.key === 'Escape') lb.hidden = true;
    if (e.key === 'ArrowLeft') { lbAt--; showLb(); }
    if (e.key === 'ArrowRight') { lbAt++; showLb(); }
  });
  const onScroll = () => updateHeader();
  window.addEventListener('scroll', onScroll, { passive: true });
  site.addEventListener('scroll', onScroll, { passive: true });
  $('.skip').addEventListener('click', e => { e.preventDefault(); $('#main').focus(); });
}

const inFrame = () => document.body.classList.contains('device-phone') || document.body.classList.contains('device-tablet');
const scrollPos = () => (inFrame() ? $('#site').scrollTop : window.scrollY);
function scrollSiteTop() { $('#site').scrollTop = 0; if (!inFrame()) window.scrollTo(0, 0); }
function updateHeader() {
  const h = $('#site .hdr');
  if (!h) return;
  const hero = $('#site .hero');
  const y = scrollPos();
  const solid = y > 40 || !hero;
  h.classList.toggle('solid', solid);
  h.classList.toggle('on-photo', !solid);
  const bar = $('#site .sticky-cta');
  if (bar) {
    const vh = inFrame() ? $('#site').clientHeight : innerHeight;
    const form = $('#site #contact');
    const nearForm = form && y + vh > form.offsetTop + 120;
    bar.classList.toggle('show', !!hero && y > hero.offsetHeight * 0.8 && !nearForm);
  }
}

/* ---------- settings to CSS ---------- */
function applySettings() {
  const s = App.state.settings;
  const site = $('#site');
  const th = THEMES[s.theme] || THEMES.heritage;
  const fp = FONTS[s.fonts] || FONTS.brand;
  const vars = { bg: th.bg, alt: th.alt, ink: th.ink, soft: th.soft, accent: th.accent, 'accent-ink': th.accentInk, deep: th.deep, 'on-deep': th.onDeep, line: th.line, 'f-head': fp.head, 'f-body': fp.body, 'f-accent': fp.accent };
  Object.entries(vars).forEach(([k, v]) => site.style.setProperty('--' + k, v));
  site.classList.toggle('dark', !!th.dark);
  site.dataset.corners = s.corners;
  site.dataset.size = s.textSize;
  site.dataset.logo = s.logo;
  site.dataset.headings = s.headings || 'accent';
  site.dataset.links = s.linkStyle || 'buttons';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  site.dataset.motion = s.motion === 'full' && reduce ? 'min' : s.motion;
  const href = `https://fonts.googleapis.com/css2?family=${fp.load}&display=swap`;
  const fl = $('#font-link');
  if (fl.getAttribute('href') !== href) fl.setAttribute('href', href);
  document.querySelector('meta[name=theme-color]').setAttribute('content', th.deep);
}

let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3800);
}

bindSite();
App.init();
if (EDITOR_ON) startEditor();

/* Adds the cog and loads the editor, only for the team (see EDITOR_ON). */
function startEditor() {
  document.body.insertAdjacentHTML('beforeend', `<button id="cog" type="button" aria-label="Customize this website" aria-expanded="false" aria-controls="editor">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.4 2.6h4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/></svg>
    <span class="cog-tip">Customize</span></button><aside id="editor" aria-label="Customize panel" hidden></aside>`);
  document.body.classList.add('has-editor');
  const v = (document.querySelector('script[src*="site.js"]').src.split('?')[1] || '');
  const sc = document.createElement('script');
  sc.src = 'js/editor.js' + (v ? '?' + v : '');
  document.body.appendChild(sc);
}
