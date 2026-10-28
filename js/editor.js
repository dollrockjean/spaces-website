/* Spaces Designer Homes — the customize panel (the cog, top right).
   Written for people who are not "computer people": big buttons, plain words, Undo always in reach. */

// Who "Send to Rocco" emails. Leave blank to let the sender type the address.
const ROCCO_EMAIL = '';
const VERSIONS_KEY = 'spaces-site-versions';
const UI_KEY = 'spaces-site-ui';

const Ed = {
  tab: 'look',
  open: false,
  device: 'desktop',
  editing: false,
  swapping: false,
  picking: false,
  showPins: true,
  pendingTarget: null,
  welcomed: false,
};

const ICONS = {
  look: '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6h1.9A4.8 4.8 0 0 0 21 10.8C21 6.5 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>',
  photos: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="9" r="1.5"/>',
  words: '<path d="M4 6h16M4 10h16M4 14h10M4 18h7"/><path d="m15 19 1-3 5-5 2 2-5 5-3 1Z"/>',
  layout: '<rect x="4" y="4" width="16" height="4" rx="1"/><rect x="4" y="10" width="16" height="4" rx="1"/><rect x="4" y="16" width="16" height="4" rx="1"/>',
  motion: '<path d="M4 12h3l3-7 4 14 3-7h3"/>',
  notes: '<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4M8 9h8M8 13h5"/>',
  send: '<path d="m3 11 18-8-8 18-2-8-8-2Z"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
  tablet: '<rect x="4.5" y="2.5" width="15" height="19" rx="2"/><path d="M11 18.5h2"/>',
  desktop: '<rect x="2.5" y="4" width="19" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
};
const icon = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
const TABS = [['look', 'Look'], ['photos', 'Photos'], ['words', 'Words'], ['layout', 'Order'], ['motion', 'Motion'], ['notes', 'Notes'], ['send', 'Save & Send']];

/* ---------- open, close, remember ---------- */
function loadUI() {
  try { Object.assign(Ed, JSON.parse(localStorage.getItem(UI_KEY)) || {}); } catch (e) { /* ignore */ }
  Ed.editing = Ed.swapping = Ed.picking = false;
}
function saveUI() {
  try { localStorage.setItem(UI_KEY, JSON.stringify({ tab: Ed.tab, open: Ed.open, device: Ed.device, showPins: Ed.showPins, welcomed: Ed.welcomed })); } catch (e) { /* ignore */ }
}
function setOpen(open) {
  Ed.open = open;
  const ed = $('#editor');
  ed.hidden = !open;
  document.body.classList.toggle('ed-open', open);
  $('#cog').setAttribute('aria-expanded', String(open));
  if (open) { drawPanel(); $('.ed-close', ed).focus(); loadAllFonts(); }
  else { setEditing(false); setSwapping(false); stopPicking(); }
  drawPins();
  saveUI();
}
function setDevice(d) {
  Ed.device = d;
  document.body.classList.remove('device-phone', 'device-tablet', 'device-desktop');
  document.body.classList.add('device-' + d);
  saveUI();
  updateHeader();
  if (Ed.open) drawBar();
  setTimeout(drawPins, 60);
}

/* ---------- panel skeleton ---------- */
function drawPanel() {
  const ed = $('#editor');
  ed.innerHTML = `
    <div class="ed-top">
      <div class="ed-name"><img src="assets/logo/logo-icon-navy.svg?v=2" alt=""><div><b>Customize</b><span>Changes save by themselves</span></div></div>
      <div class="ed-row"><button type="button" class="ed-reset" data-act="reset" title="Put the whole site back to how it started">Reset all</button>
      <button type="button" class="ed-close" aria-label="Close the customize panel">×</button></div>
    </div>
    <div class="ed-bar"></div>
    <nav class="ed-tabs" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${Ed.tab === k}">${icon(k)}<span>${l}</span></button>`).join('')}</nav>
    <div class="ed-body" role="tabpanel"></div>`;
  drawBar();
  drawBody();
}
function drawBar() {
  const bar = $('#editor .ed-bar');
  if (!bar) return;
  const dev = (k, l) => `<button type="button" data-device="${k}" aria-pressed="${Ed.device === k}">${icon(k)}<span>${l}</span></button>`;
  bar.innerHTML = `<div class="ed-devices" role="group" aria-label="See the site on">${dev('desktop', 'Computer')}${dev('tablet', 'Tablet')}${dev('phone', 'Phone')}</div>
    <div class="ed-undo"><button type="button" data-act="undo" ${App.history.length ? '' : 'disabled'}>${icon('undo')}<span>Undo</span></button><button type="button" data-act="redo" ${App.future.length ? '' : 'disabled'}>${icon('redo')}<span>Redo</span></button></div>`;
}
function drawBody() {
  const body = $('#editor .ed-body');
  if (!body) return;
  const top = body.scrollTop;
  // Keep half-typed text when the panel redraws.
  const drafts = ['#ed-note', '#ed-vname'].map(id => [id, $(id) ? $(id).value : null]);
  body.innerHTML = (!Ed.welcomed ? welcomeCard() : '') + PANELS[Ed.tab]();
  drafts.forEach(([id, v]) => { if (v && $(id)) $(id).value = v; });
  body.scrollTop = top;
  $$('#editor .ed-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === Ed.tab)));
  if (Ed.tab === 'layout') bindDrag();
}

const welcomeCard = () => `<div class="ed-welcome"><h2>Welcome!</h2>
  <ol><li>Pick a tab below the buttons and try things. Nothing can break.</li>
  <li><b>Undo</b> at the top takes back your last change.</li>
  <li>When you like it, open <b>Save &amp; Send</b> to send your version and notes to Rocco.</li></ol>
  <button type="button" class="ed-btn primary" data-act="welcomed">Got it</button></div>`;

/* ---------- the tabs ---------- */
const s = () => App.state.settings;
const seg = (key, opts) => `<div class="ed-seg" role="radiogroup">${opts.map(([v, l]) => `<button type="button" role="radio" data-set="${key}" data-val="${v}" aria-checked="${s()[key] === v}">${l}</button>`).join('')}</div>`;

const PANELS = {
  look() {
    return `<section><h3>Color theme</h3><div class="ed-cards">${Object.entries(THEMES).map(([k, t]) => `
      <button type="button" class="ed-card" data-set="theme" data-val="${k}" aria-pressed="${s().theme === k}">
        <span class="swatch">${[t.bg, t.alt, t.ink, t.accent, t.deep].map(c => `<i style="background:${c}"></i>`).join('')}</span>
        <b>${t.name}</b><small>${t.note}</small></button>`).join('')}</div></section>
    <section><h3>Fonts</h3><div class="ed-cards">${Object.entries(FONTS).map(([k, f]) => `
      <button type="button" class="ed-card font" data-set="fonts" data-val="${k}" aria-pressed="${s().fonts === k}">
        <span class="font-sample" style="font-family:${f.head}">Your Vision</span><span class="font-body" style="font-family:${f.body}">Our Masterpiece. Easy to read.</span>
        <b>${f.name}</b><small>${f.note}</small></button>`).join('')}</div></section>
    <section><h3>Logo at the top</h3><div class="ed-logos">${Object.entries(LOGOS).map(([k, l]) => `
      <button type="button" data-set="logo" data-val="${k}" aria-pressed="${s().logo === k}"><img src="assets/logo/${l.file === 'badge' ? 'badge' : l.file + '-navy'}.svg?v=2" alt=""><span>${l.name}</span></button>`).join('')}</div></section>
    <section><h3>Text size</h3><p class="ed-help">Bigger text is easier to read for everyone.</p>${seg('textSize', [['normal', 'Normal'], ['large', 'Large'], ['xl', 'Extra large']])}</section>
    <section><h3>Corners</h3>${seg('corners', [['square', 'Sharp'], ['soft', 'Soft rounded']])}</section>
    <section><h3>Headline style</h3><p class="ed-help">Gives section headlines some character. Gold accent sets the end of each headline in gold italic, like the tagline. On photos puts the intro and beliefs over their pictures.</p>
      ${seg('headings', [['accent', 'Gold accent'], ['photo', 'On photos'], ['plain', 'Plain']])}</section>
    <section><h3>Small links</h3><p class="ed-help">Links like “Read our story” as real buttons, or as plain underlined text.</p>
      ${seg('linkStyle', [['buttons', 'Real buttons'], ['text', 'Text links']])}</section>`;
  },

  photos() {
    const mode = s().heroMode;
    return `<section><h3>Lead with</h3><p class="ed-help">What the top of the home page shows first. Picking one swaps in a matching video and set of photos.</p>
      <div class="ed-chips">${Object.entries(SPOTLIGHTS).map(([k, o]) => `<button type="button" data-spot="${k}" aria-pressed="${s().spotlight === k}">${o.name}</button>`).join('')}</div></section>
    <section><h3>Top of the home page</h3>
      ${seg('heroMode', [['video', 'Drone video'], ['slideshow', 'Photo slideshow']])}
      ${mode === 'video'
        ? `<p class="ed-help">Pick the video that plays behind the headline. Each is a short, silent loop of a real Spaces home.</p>
           <div class="ed-clips">${Object.entries(VIDEOS).map(([k, c]) => `<button type="button" data-clip="${k}" aria-pressed="${!s().heroVideo && clipId() === k}"><img src="assets/video/${k}-poster.jpg" alt="" loading="lazy"><b>${c.name}</b><small>${c.note}</small></button>`).join('')}
             <button type="button" class="mix" data-clip="mix" aria-pressed="${!s().heroVideo && clipId() === 'mix'}"><span class="mix-art">${Object.keys(VIDEOS).slice(0, 4).map(k => `<img src="assets/video/${k}-poster.jpg" alt="">`).join('')}</span><b>Play them all</b><small>One after another, with a soft fade</small></button>
             <button type="button" class="mix" data-clip="random" aria-pressed="${!s().heroVideo && clipId() === 'random'}"><b>One random video</b><small>A different one each time someone opens the site, played on a loop</small></button></div>
           ${clipId() === 'mix' && !s().heroVideo ? `<p class="ed-help">When playing them all, start with:</p>${seg('clipStart', [['random', 'A random video'], ['first', 'The first video']])}` : ''}
           <label class="ed-field">Or use your own video link<input type="url" data-input="settings.heroVideo" value="${esc(s().heroVideo)}" placeholder="YouTube, Vimeo or .mp4 link"></label>
           <p class="ed-help">A pasted link plays instead of the videos above. Clear it to go back.</p>`
        : `<p class="ed-help">Tap photos to add or remove them from the slideshow. The numbers show the order they play in.</p>
           <div class="ed-photo-grid">${PHOTOS.filter(p => p.type !== 'studio' || p.id === 'studio-samples').map(p => {
             const n = s().heroPhotos.indexOf(p.id);
             return `<button type="button" data-hero="${p.id}" aria-pressed="${n >= 0}" title="${esc(projName(p))}"><img src="${thumbSrc(p)}" alt="${esc(projName(p))}" loading="lazy">${n >= 0 ? `<b>${n + 1}</b>` : ''}</button>`;
           }).join('')}</div>`}
    </section>
    <section><h3>Our Projects pages</h3><p class="ed-help">How a home's photos are shown after someone opens it.</p>
      ${seg('projectView', [['folders', 'Room folders'], ['tags', 'All photos, room tags']])}</section>
    <section><h3>Change any photo</h3><p class="ed-help">Turn this on, then click any photo on the website to swap it for another one, or for a photo from your computer.</p>
      <button type="button" class="ed-switch" data-act="swap" aria-pressed="${Ed.swapping}"><span class="knob"></span>${Ed.swapping ? 'On: click a photo on the site' : 'Off'}</button></section>
    <section><h3>Client story video</h3>
      <label class="ed-field">Video link<input type="url" data-input="settings.clientVideo" value="${esc(s().clientVideo)}" placeholder="Paste a YouTube or Vimeo link"></label>
      <p class="ed-help">This plays in the “Hear it from our homeowners” part of the home page.</p></section>`;
  },

  words() {
    const v = voice();
    return `<section><h3>Change words on the page</h3><p class="ed-help">Turn this on, then click any words on the website and type, like a normal document. Click somewhere else when you are done. It saves by itself.</p>
      <button type="button" class="ed-switch" data-act="edit" aria-pressed="${Ed.editing}"><span class="knob"></span>${Ed.editing ? 'On: click any words on the site' : 'Off'}</button></section>
    <section><h3>Voice</h3><p class="ed-help">How the home page talks. Every voice can still be edited on the page.</p>
      <div class="ed-cards one">${Object.entries(VOICES).map(([k, o]) => `<button type="button" class="ed-card wide" data-set="voice" data-val="${k}" aria-pressed="${v === k}"><b>${o.name}</b><small>${o.note}</small><span class="ed-quote">“${esc(T(`voice.${k}.introTitle`))}”</span></button>`).join('')}</div></section>
    <section><h3>Quick changes</h3>
      <label class="ed-field">Big headline<input data-input="content.hero.title" value="${esc(T('hero.title'))}"></label>
      <label class="ed-field">Line under the headline<input data-input="content.voice.${v}.sub" value="${esc(T(`voice.${v}.sub`))}"></label>
      <label class="ed-field">Phone<input data-input="content.biz.phone" value="${esc(T('biz.phone'))}"></label>
      <label class="ed-field">Email<input data-input="content.biz.email" value="${esc(T('biz.email'))}"></label>
    </section>`;
  },

  layout() {
    const order = s().homeOrder;
    const hidden = s().homeHidden;
    return `<section><h3>Home page order</h3><p class="ed-help">Drag the rows, or use the arrows, to change the order of the home page. Use the eye to hide a part.</p>
      <div class="ed-fixed">Top photo & headline (always first)</div>
      <ol class="ed-order">${order.map((k, i) => `<li draggable="true" data-key="${k}" class="${hidden.includes(k) ? 'is-hidden' : ''}">
        <span class="grip" aria-hidden="true">⋮⋮</span><span class="o-name">${SECTIONS[k]}</span>
        <button type="button" data-move="${i}" data-dir="-1" aria-label="Move ${SECTIONS[k]} up" ${i === 0 ? 'disabled' : ''}>▲</button>
        <button type="button" data-move="${i}" data-dir="1" aria-label="Move ${SECTIONS[k]} down" ${i === order.length - 1 ? 'disabled' : ''}>▼</button>
        <button type="button" data-hide="${k}" aria-pressed="${!hidden.includes(k)}" aria-label="${hidden.includes(k) ? 'Show' : 'Hide'} ${SECTIONS[k]}">${hidden.includes(k) ? 'Hidden' : 'Shown'}</button></li>`).join('')}</ol>
      <div class="ed-fixed">Links & contact info (always last)</div>
      <button type="button" class="ed-btn" data-act="reset-order">Put back the original order</button></section>
    <section><h3>Menu headings</h3><p class="ed-help">What happens when someone clicks “Build” or “About” in the top menu.</p>
      ${seg('navClick', [['hub', 'Open an overview page'], ['first', 'Open the first page']])}</section>
    <section><h3>Contact bar on phones</h3><p class="ed-help">A small “Contact us” bar at the bottom of the home page on phones. It shows after the top video and hides near the contact form.</p>
      ${seg('stickyContact', [['on', 'Show'], ['off', 'Hide']])}</section>`;
  },

  motion() {
    const opt = (v, t, d) => `<button type="button" class="ed-card wide" data-set="motion" data-val="${v}" aria-pressed="${s().motion === v}"><b>${t}</b><small>${d}</small></button>`;
    return `<section><h3>Animations</h3><div class="ed-cards one">
      ${opt('full', 'Full', 'Photos drift slowly and the headline fades in. Photo buttons lift a little when pointed at.')}
      ${opt('min', 'Minimum', 'Soft fades between the top photos only. Calm and simple.')}
      ${opt('none', 'None', 'Nothing moves. Best for anyone who finds motion distracting.')}
    </div><p class="ed-help">Tip: if a visitor’s phone or computer is set to reduce motion, Full is automatically softened to Minimum for them.</p></section>`;
  },

  notes() {
    const notes = App.state.notes;
    const t = Ed.pendingTarget;
    return `<section><h3>Notes for Rocco</h3><p class="ed-help">Write anything you want changed or liked. You can point at a spot on the page so Rocco knows exactly what you mean.</p>
      <label class="ed-field">Your name<input data-author value="${esc(App.state.author)}" placeholder="So Rocco knows who wrote it"></label>
      <label class="ed-field">Your note<textarea id="ed-note" rows="4" placeholder="For example: make this photo bigger, or I love this color"></textarea></label>
      <div class="ed-target">${t ? `<span>Pointing at: <b>${esc(t.label)}</b></span><button type="button" class="linkish" data-act="clear-target">Remove</button>` : ''}</div>
      <div class="ed-row"><button type="button" class="ed-btn" data-act="pick">${Ed.picking ? 'Click something on the page…' : 'Point at something (optional)'}</button>
      <button type="button" class="ed-btn primary" data-act="add-note">Add note</button></div></section>
    <section><div class="ed-row between"><h3>Your notes (${notes.length})</h3>
      <button type="button" class="ed-switch small" data-act="pins" aria-pressed="${Ed.showPins}"><span class="knob"></span>Pins on page</button></div>
      ${notes.length ? `<ol class="ed-notes">${notes.map((n, i) => `<li><span class="pin-n">${i + 1}</span><div><p>${esc(n.text)}</p>
        <small>${esc(n.pageName)}${n.target ? ` · ${esc(n.target.label)}` : ''}${n.author ? ` · ${esc(n.author)}` : ''}</small>
        <div class="ed-row"><button type="button" class="linkish" data-show-note="${i}">Show me</button><button type="button" class="linkish" data-del-note="${i}">Delete</button></div></div></li>`).join('')}</ol>`
        : '<p class="ed-empty">No notes yet. Your first note will show up here.</p>'}</section>`;
  },

  send() {
    const versions = getVersions();
    const changes = changeList();
    return `<section><h3>Send your version to Rocco</h3><p class="ed-help">This saves everything you changed, plus your notes, as one small file. Rocco opens it and builds the next version from it.</p>
      <label class="ed-field">Name this version<input id="ed-vname" placeholder="For example: Tracy’s favorite" value=""></label>
      <p class="ed-help">What should the file include?</p>
      <div class="ed-seg" role="radiogroup">${[['all', 'Notes and design changes'], ['notes', 'Only my notes']].map(([v, l]) => `<button type="button" role="radio" data-send="${v}" aria-checked="${(Ed.sendWhat || 'all') === v}">${l}</button>`).join('')}</div>
      <div class="ed-row"><button type="button" class="ed-btn primary" data-act="email">Email it to Rocco</button><button type="button" class="ed-btn" data-act="download">Just download the file</button></div>
      <p class="ed-help">“Email it” downloads the file and opens a new email with your notes already written. Just attach the downloaded file and press send.</p></section>
    <section><h3>Save in this browser</h3><p class="ed-help">Keep a few versions here to compare. Open one any time.</p>
      <div class="ed-row"><button type="button" class="ed-btn" data-act="save-version">Save current version</button></div>
      ${versions.length ? `<ul class="ed-versions">${versions.map((v, i) => `<li><div><b>${esc(v.name)}</b><small>${new Date(v.date).toLocaleString()}</small></div>
        <button type="button" class="linkish" data-open-version="${i}">Open</button><button type="button" class="linkish" data-del-version="${i}">Delete</button></li>`).join('')}</ul>` : ''}</section>
    <section><h3>What you have changed (${changes.length})</h3>${changes.length ? `<ul class="ed-changes">${changes.slice(0, 40).map(c => `<li>${esc(c)}</li>`).join('')}${changes.length > 40 ? `<li>…and ${changes.length - 40} more</li>` : ''}</ul>` : '<p class="ed-empty">Nothing yet. This is the original design.</p>'}</section>
    <section><h3>Open a version file</h3><p class="ed-help">For opening a file someone sent you.</p>
      <label class="ed-btn file">Choose a file<input type="file" accept=".json,application/json" data-act="import" hidden></label></section>
    <section><h3>Start over</h3><button type="button" class="ed-btn danger" data-act="reset">Go back to the original design</button><p class="ed-help">Your notes are kept. You can Undo this too.</p></section>`;
  },
};

/* ---------- panel events ---------- */
function bindPanel() {
  const ed = $('#editor');
  ed.addEventListener('click', e => {
    const t = e.target.closest('button, [data-act]');
    if (!t || !ed.contains(t)) return;
    if (t.classList.contains('ed-close')) return setOpen(false);
    if (t.dataset.tab) { Ed.tab = t.dataset.tab; saveUI(); drawBody(); return; }
    if (t.dataset.device) return setDevice(t.dataset.device);
    if (t.dataset.set) {
      const { set: key, val } = t.dataset;
      if (s()[key] === val) return;
      App.change(st => { st.settings[key] = val; });
      return;
    }
    if (t.dataset.send) { Ed.sendWhat = t.dataset.send; drawBody(); return; }
    if (t.dataset.spot) {
      const k = t.dataset.spot;
      App.change(st => { st.settings.spotlight = k; st.settings.heroPhotos = [...SPOTLIGHTS[k].photos]; st.settings.heroClip = SPOTLIGHTS[k].clip; });
      return;
    }
    if (t.dataset.clip) {
      const k = t.dataset.clip;
      App.change(st => { st.settings.heroClip = k; st.settings.heroVideo = ''; st.settings.heroMode = 'video'; });
      return;
    }
    if (t.dataset.hero) {
      const id = t.dataset.hero;
      const list = [...s().heroPhotos];
      const at = list.indexOf(id);
      if (at >= 0) { if (list.length === 1) return toast('Keep at least one photo in the slideshow.'); list.splice(at, 1); } else list.push(id);
      App.change(st => { st.settings.heroPhotos = list; });
      return;
    }
    if (t.dataset.move) {
      const i = +t.dataset.move, j = i + +t.dataset.dir;
      App.change(st => { const o = st.settings.homeOrder; [o[i], o[j]] = [o[j], o[i]]; });
      return;
    }
    if (t.dataset.hide) {
      const k = t.dataset.hide;
      App.change(st => { const h = st.settings.homeHidden; st.settings.homeHidden = h.includes(k) ? h.filter(x => x !== k) : [...h, k]; });
      return;
    }
    if (t.dataset.showNote) return showNote(+t.dataset.showNote);
    if (t.dataset.delNote) { const i = +t.dataset.delNote; App.change(st => st.notes.splice(i, 1), { render: false }); return; }
    if (t.dataset.openVersion) { const v = getVersions()[+t.dataset.openVersion]; App.replace(v.state); toast(`Opened “${v.name}”. Undo goes back.`); return; }
    if (t.dataset.delVersion) { const vs = getVersions(); vs.splice(+t.dataset.delVersion, 1); putVersions(vs); drawBody(); return; }
    const act = t.dataset.act;
    if (act && ACTIONS[act]) ACTIONS[act](t);
  });
  ed.addEventListener('change', e => {
    if (e.target.dataset.act === 'import') importFile(e.target.files[0]);
    if (e.target.matches('[data-input]')) {
      const path = e.target.dataset.input, val = e.target.value.trim();
      if (App.get(path) !== val) App.change(st => setPath(st, path, val));
    }
    if (e.target.matches('[data-author]')) App.change(st => { st.author = e.target.value.trim(); }, { render: false });
  });
}

const ACTIONS = {
  welcomed() { Ed.welcomed = true; saveUI(); drawBody(); },
  undo() { App.undo(); },
  redo() { App.redo(); },
  edit() { setEditing(!Ed.editing); },
  swap() { setSwapping(!Ed.swapping); },
  pins() { Ed.showPins = !Ed.showPins; saveUI(); drawBody(); drawPins(); },
  pick() { Ed.picking ? stopPicking() : startPicking(); },
  'clear-target'() { Ed.pendingTarget = null; drawBody(); },
  'add-note'() {
    const box = $('#ed-note');
    const text = box.value.trim();
    if (!text) { box.focus(); return toast('Type your note first.'); }
    const note = { id: Date.now().toString(36), text, route: location.hash || '#/', pageName: pageName(), target: Ed.pendingTarget, author: App.state.author, device: Ed.device, date: new Date().toISOString() };
    Ed.pendingTarget = null;
    App.change(st => st.notes.push(note), { render: false });
    toast('Note added.');
  },
  'reset-order'() { App.change(st => { st.settings.homeOrder = [...DEFAULT_SETTINGS.homeOrder]; st.settings.homeHidden = []; }); },
  'save-version'() {
    const name = ($('#ed-vname').value.trim()) || `Version ${getVersions().length + 1}`;
    const vs = getVersions();
    vs.unshift({ name, date: new Date().toISOString(), state: App.state });
    if (putVersions(vs.slice(0, 12))) { toast(`Saved “${name}”.`); drawBody(); }
  },
  download() { downloadVersion(); },
  email() {
    const { file, data } = downloadVersion();
    const lines = [`Hi Rocco,`, ``, `Here is my version of the Spaces website${data.versionName ? `: ${data.versionName}` : ''}.`, `The file “${file}” just downloaded to my computer. I attached it to this email.`, ``];
    if (data.notes.length) { lines.push('My notes:'); data.notes.forEach((n, i) => lines.push(`${i + 1}. [${n.pageName}${n.target ? ' / ' + n.target.label : ''}] ${n.text}`)); lines.push(''); }
    if (data.kind === 'notes') lines.push('(This file has my notes only, no design changes.)', '');
    if (data.changes.length) { lines.push('What I changed:'); data.changes.slice(0, 25).forEach(c => lines.push('- ' + c)); lines.push(''); }
    lines.push('Thanks!', App.state.author || '');
    let body = lines.join('\n');
    if (body.length > 1800) body = body.slice(0, 1780) + '\n…(the rest is in the attached file)';
    const subject = `Spaces website: ${data.versionName || 'my version'}`;
    setTimeout(() => { location.href = `mailto:${ROCCO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; }, 400);
    toast('File downloaded. Attach it to the email that opens.');
  },
  reset() {
    if (!confirm('Reset the whole site to how it started? Your notes are kept, and Undo can bring your changes back.')) return;
    App.change(st => { const notes = st.notes, author = st.author; Object.assign(st, App.fresh(), { notes, author }); });
    toast('Back to the original design.');
  },
};

/* ---------- editing words in place ---------- */
function setEditing(on) {
  Ed.editing = on;
  document.body.classList.toggle('editing-words', on);
  if (on) { setSwapping(false); stopPicking(); }
  applyEditable();
  if (Ed.open && Ed.tab === 'words') drawBody();
  if (on) toast('Click any words on the site to change them.');
}
function applyEditable() {
  $$('#site [data-edit]').forEach(el => {
    if (Ed.editing) { el.setAttribute('contenteditable', 'plaintext-only'); el.spellcheck = true; }
    else el.removeAttribute('contenteditable');
  });
}
function bindInlineEditing() {
  const site = $('#site');
  site.addEventListener('click', e => {
    if (Ed.editing && e.target.closest('[data-edit]')) e.preventDefault();
  }, true);
  site.addEventListener('keydown', e => {
    const el = e.target.closest('[data-edit]');
    if (!Ed.editing || !el) return;
    const multi = el.matches('p, .post-body, blockquote p');
    if (e.key === 'Enter' && !multi) { e.preventDefault(); el.blur(); }
    if (e.key === 'Escape') { el.textContent = String(App.get(el.dataset.edit) ?? ''); el.blur(); }
  });
  site.addEventListener('paste', e => {
    if (!Ed.editing || !e.target.closest('[data-edit]')) return;
    e.preventDefault();
    document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
  });
  site.addEventListener('focusout', e => {
    const el = e.target.closest && e.target.closest('[data-edit]');
    if (!Ed.editing || !el) return;
    const path = el.dataset.edit;
    const multi = el.matches('p, .post-body, blockquote p');
    let val = el.innerText.replace(/ /g, ' ');
    val = multi ? val.replace(/\n{3,}/g, '\n\n').trim() : val.replace(/\s+/g, ' ').trim();
    if (!val) { el.textContent = String(App.get(path) ?? ''); return toast('That spot needs some words. Put the old text back.'); }
    if (val !== App.get(path)) App.change(st => setPath(st, path, val), { render: path.includes('hero.title') || path.includes('team.') });
  });
}

/* ---------- swapping photos ---------- */
function setSwapping(on) {
  Ed.swapping = on;
  document.body.classList.toggle('swapping', on);
  if (on) { setEditing(false); stopPicking(); stopHero(); toast('Click any photo on the site to change it.'); }
  else if (App.route.name === '') App.render();
  if (Ed.open && Ed.tab === 'photos') drawBody();
}
function bindSwap() {
  $('#site').addEventListener('click', e => {
    if (!Ed.swapping) return;
    let el = e.target.closest('[data-img]');
    if (!el && e.target.closest('.hero')) el = $('.hero .slide.on [data-img]', e.target.closest('.hero'));
    if (!el) return;
    e.preventDefault(); e.stopPropagation();
    openPicker(el.dataset.img);
  }, true);
}
function openPicker(path) {
  closePicker();
  const wrap = document.createElement('div');
  wrap.className = 'ed-picker';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-label', 'Choose a photo');
  wrap.innerHTML = `<div class="ed-pick-box">
    <div class="ed-row between"><h2>Choose a photo</h2><button type="button" class="ed-close" aria-label="Close">×</button></div>
    <div class="ed-row"><label class="ed-btn primary file">Upload from my computer<input type="file" accept="image/*" hidden></label>
      ${path.includes('team.') ? '<button type="button" class="ed-btn" data-clear>Use no photo</button>' : ''}</div>
    <input type="search" class="ed-pick-search" placeholder="Search, like kitchen or Holland">
    <div class="ed-photo-grid big">${PHOTOS.map(p => `<button type="button" data-id="${p.id}" data-hay="${esc((projName(p) + ' ' + p.town + ' ' + ROOMS[p.cat] + ' ' + p.tags).toLowerCase())}"><img src="${thumbSrc(p)}" alt="${esc(projName(p))}" loading="lazy"><span>${esc(projName(p))}, ${esc(ROOMS[p.cat] || '')}</span></button>`).join('')}</div></div>`;
  document.body.appendChild(wrap);
  const done = val => { closePicker(); App.change(st => setPath(st, path, val)); toast('Photo changed. Undo is at the top if you change your mind.'); };
  wrap.addEventListener('click', e => {
    if (e.target === wrap || e.target.closest('.ed-close')) return closePicker();
    const b = e.target.closest('[data-id]');
    if (b) return done(b.dataset.id);
    if (e.target.closest('[data-clear]')) return done('');
  });
  $('.ed-pick-search', wrap).addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    $$('[data-hay]', wrap).forEach(b => { b.hidden = q && !q.split(/\s+/).every(w => b.dataset.hay.includes(w)); });
  });
  $('input[type=file]', wrap).addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    shrinkImage(f).then(done).catch(() => toast('That file did not open as a photo. Try a JPG or PNG.'));
  });
  $('.ed-pick-search', wrap).focus();
}
function closePicker() { const p = $('.ed-picker'); if (p) p.remove(); }
/* Uploaded photos are shrunk so they fit in the browser's storage. */
function shrinkImage(file) {
  return new Promise((ok, bad) => {
    const r = new FileReader();
    r.onerror = bad;
    r.onload = () => {
      const img = new Image();
      img.onerror = bad;
      img.onload = () => {
        const k = Math.min(1, 1600 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        ok(c.toDataURL('image/jpeg', 0.78));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

/* ---------- pointing at something for a note ---------- */
function startPicking() {
  Ed.picking = true;
  setEditing(false); setSwapping(false);
  document.body.classList.add('picking');
  if (!$('#pick-box')) { const b = document.createElement('div'); b.id = 'pick-box'; document.body.appendChild(b); }
  toast('Click the part of the page your note is about. Press Esc to cancel.');
  if (Ed.tab === 'notes') drawBody();
}
function stopPicking() {
  Ed.picking = false;
  document.body.classList.remove('picking');
  const b = $('#pick-box'); if (b) b.style.display = 'none';
  if (Ed.open && Ed.tab === 'notes') drawBody();
}
function describe(el) {
  const sec = el.closest('[data-sec]');
  const secLabel = sec ? sec.dataset.label : 'Page';
  const ed = el.closest('[data-edit]');
  if (ed) return { sel: `[data-edit="${ed.dataset.edit}"]`, label: `${secLabel}: “${ed.innerText.trim().slice(0, 40)}${ed.innerText.trim().length > 40 ? '…' : ''}”` };
  const im = el.closest('[data-img]');
  if (im) return { sel: `[data-img="${im.dataset.img}"]`, label: `${secLabel}: a photo` };
  return { sel: sec ? `[data-sec="${sec.dataset.sec}"]` : 'main', label: secLabel };
}
function bindPicking() {
  const site = $('#site');
  site.addEventListener('mousemove', e => {
    if (!Ed.picking) return;
    const el = e.target.closest('[data-edit], [data-img], [data-sec]');
    const box = $('#pick-box');
    if (!el || !box) return;
    const r = el.getBoundingClientRect();
    Object.assign(box.style, { display: 'block', top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px' });
  });
  site.addEventListener('click', e => {
    if (!Ed.picking) return;
    e.preventDefault(); e.stopPropagation();
    Ed.pendingTarget = describe(e.target);
    stopPicking();
    if (!Ed.open) setOpen(true);
    Ed.tab = 'notes'; drawBody();
    const n = $('#ed-note'); if (n) n.focus();
  }, true);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if ($('.ed-picker')) return closePicker();
    if (Ed.picking) return stopPicking();
  });
}

/* ---------- note pins on the page ---------- */
function pageName() {
  const r = App.route;
  return r.name ? PAGES[r.name].title(r.param) : 'Home page';
}
function drawPins() {
  const site = $('#site');
  let layer = $('.note-pins', site);
  if (!layer) { layer = document.createElement('div'); layer.className = 'note-pins'; site.appendChild(layer); }
  layer.innerHTML = '';
  if (!Ed.open || !Ed.showPins) return;
  const here = location.hash || '#/';
  const sr = site.getBoundingClientRect();
  App.state.notes.forEach((n, i) => {
    if ((n.route || '#/') !== here || !n.target) return;
    const el = $(n.target.sel, site);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'note-pin';
    pin.textContent = i + 1;
    pin.title = n.text;
    pin.style.top = (r.top - sr.top + site.scrollTop - 10) + 'px';
    pin.style.left = (r.left - sr.left + Math.min(r.width - 14, 8)) + 'px';
    pin.addEventListener('click', e => { e.stopPropagation(); Ed.tab = 'notes'; drawBody(); toast(`Note ${i + 1}: ${n.text}`); });
    layer.appendChild(pin);
  });
}
function showNote(i) {
  const n = App.state.notes[i];
  const go = () => {
    const el = n.target && $(n.target.sel, $('#site'));
    if (!el) return toast(n.target ? 'That spot is no longer on the page.' : 'This note is about the whole page.');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 2200);
    setTimeout(drawPins, 500);
  };
  if ((location.hash || '#/') !== (n.route || '#/')) { location.hash = n.route; setTimeout(go, 150); } else go();
}

/* ---------- versions, export, import ---------- */
function getVersions() { try { return JSON.parse(localStorage.getItem(VERSIONS_KEY)) || []; } catch (e) { return []; } }
function putVersions(v) {
  try { localStorage.setItem(VERSIONS_KEY, JSON.stringify(v)); return true; }
  catch (e) { toast('No room left to save here. Download the file instead, or delete an old version.'); return false; }
}
// "Only my notes" sends just the notes; "Notes and design changes" sends the whole version.
function downloadVersion() {
  const name = ($('#ed-vname') && $('#ed-vname').value.trim()) || '';
  const stamp = new Date().toISOString().slice(0, 10);
  const notesOnly = Ed.sendWhat === 'notes';
  const data = {
    app: 'spaces-designer-homes-site',
    format: 1,
    kind: notesOnly ? 'notes' : 'version',
    versionName: name,
    exportedAt: new Date().toISOString(),
    by: App.state.author,
    changes: notesOnly ? [] : changeList(),
    notes: App.state.notes,
  };
  if (!notesOnly) data.state = App.state;
  const file = `Spaces-website-${notesOnly ? 'notes' : 'version'}-${(name || App.state.author || 'mine').replace(/[^\w-]+/g, '-')}-${stamp}.json`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = file;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return { file, data };
}
function importFile(f) {
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      // A notes-only file adds its notes to what is open now and changes nothing else.
      if (!d.state && Array.isArray(d.notes)) {
        const have = new Set(App.state.notes.map(n => n.id));
        const add = d.notes.filter(n => n && n.text && !have.has(n.id)).map(n => ({ ...n, text: String(n.text).slice(0, 2000) }));
        App.change(st => { st.notes.push(...add); }, { render: false });
        toast(`Added ${add.length} note${add.length === 1 ? '' : 's'}${d.by ? ` from ${d.by}` : ''}.`);
        return;
      }
      const st = d.state || d;
      if (!st.settings || !st.content) throw new Error('not a version file');
      App.replace(st);
      toast(`Opened ${d.versionName ? `“${d.versionName}”` : 'the version file'}${d.by ? ` from ${d.by}` : ''}.`);
    } catch (e) { toast('That file is not a Spaces website version.'); }
  };
  r.readAsText(f);
}

/* Plain-English list of everything that differs from the original. */
function changeList() {
  const st = App.state, d = DEFAULT_SETTINGS, out = [];
  const cur = st.settings;
  if (cur.theme !== d.theme) out.push(`Color theme: ${THEMES[cur.theme].name}`);
  if (cur.fonts !== d.fonts) out.push(`Fonts: ${FONTS[cur.fonts].name}`);
  if (cur.logo !== d.logo) out.push(`Logo: ${LOGOS[cur.logo].name}`);
  if (cur.textSize !== d.textSize) out.push(`Text size: ${{ normal: 'Normal', large: 'Large', xl: 'Extra large' }[cur.textSize]}`);
  if (cur.corners !== d.corners) out.push('Corners: soft rounded');
  if (cur.motion !== d.motion) out.push(`Animations: ${{ full: 'Full', min: 'Minimum', none: 'None' }[cur.motion]}`);
  if (cur.heroMode !== d.heroMode) out.push(`Top of home page: ${cur.heroMode === 'video' ? 'drone video' : 'photo slideshow'}`);
  if (cur.heroVideo) out.push(`Top video link: ${cur.heroVideo}`);
  if (cur.heroClip !== d.heroClip) out.push(`Top video: ${cur.heroClip === 'mix' ? 'play them all' : cur.heroClip === 'random' ? 'one random video' : (VIDEOS[cur.heroClip] || {}).name}`);
  if (cur.clipStart !== d.clipStart) out.push('Play them all: starts with the first video');
  if (cur.clientVideo) out.push(`Client video link: ${cur.clientVideo}`);
  const named = { headings: ['Headline style', { accent: 'gold accent', photo: 'on photos', plain: 'plain' }], linkStyle: ['Small links', { buttons: 'buttons', text: 'text links' }], navClick: ['Menu headings', { hub: 'overview page', first: 'first page' }], stickyContact: ['Phone contact bar', { on: 'shown', off: 'hidden' }], projectView: ['Our Projects pages', { folders: 'room folders', tags: 'all photos with tags' }] };
  Object.entries(named).forEach(([k, [label, vals]]) => { if (cur[k] !== d[k]) out.push(`${label}: ${vals[cur[k]] || cur[k]}`); });
  if (cur.voice !== d.voice) out.push(`Voice: ${(VOICES[cur.voice] || {}).name}`);
  if (cur.spotlight !== d.spotlight) out.push(`Lead with: ${(SPOTLIGHTS[cur.spotlight] || {}).name}`);
  if (JSON.stringify(cur.heroPhotos) !== JSON.stringify(d.heroPhotos)) out.push(`Slideshow photos: ${cur.heroPhotos.map(id => projName(photo(id) || {}) || id).join(', ')}`);
  if (JSON.stringify(cur.homeOrder) !== JSON.stringify(d.homeOrder)) out.push(`Home page order: ${cur.homeOrder.map(k => SECTIONS[k]).join(' > ')}`);
  if (cur.homeHidden.length) out.push(`Hidden on home page: ${cur.homeHidden.map(k => SECTIONS[k]).join(', ')}`);
  const walk = (a, b, path) => {
    if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length) { out.push(`${pretty(path)}: ${b.length > a.length ? 'added' : 'removed'} ${Math.abs(b.length - a.length)}`); }
    if (a && typeof a === 'object') { Object.keys({ ...a, ...b }).forEach(k => walk(a[k], b && b[k], path ? `${path}.${k}` : k)); return; }
    if (a === b || b === undefined) return;
    const isPhoto = typeof b === 'string' && (b.startsWith('data:') || !!photo(b) || !!photo(a));
    out.push(isPhoto ? `Photo changed: ${pretty(path)}${b.startsWith('data:') ? ' (uploaded photo)' : ` → ${projName(photo(b) || {}) || b}`}` : `Words changed: ${pretty(path)} → “${String(b).slice(0, 80)}”`);
  };
  walk(DEFAULT_CONTENT, st.content, '');
  return out;
}
const pretty = p => p.replace(/\.(\d+)/g, (m, n) => ` #${+n + 1}`).replace(/\./g, ' > ').replace(/([a-z])([A-Z])/g, '$1 $2');

/* ---------- drag to reorder ---------- */
function bindDrag() {
  let from = null;
  $$('#editor .ed-order li').forEach(li => {
    li.addEventListener('dragstart', e => { from = li.dataset.key; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    li.addEventListener('dragend', () => li.classList.remove('dragging'));
    li.addEventListener('dragover', e => { e.preventDefault(); li.classList.add('over'); });
    li.addEventListener('dragleave', () => li.classList.remove('over'));
    li.addEventListener('drop', e => {
      e.preventDefault(); li.classList.remove('over');
      const to = li.dataset.key;
      if (!from || from === to) return;
      App.change(st => {
        const o = st.settings.homeOrder.filter(k => k !== from);
        o.splice(o.indexOf(to) + (st.settings.homeOrder.indexOf(from) < st.settings.homeOrder.indexOf(to) ? 1 : 0), 0, from);
        st.settings.homeOrder = o;
      });
    });
  });
}

/* Load every font family once so the font cards preview correctly. */
let fontsLoaded = false;
function loadAllFonts() {
  if (fontsLoaded) return;
  fontsLoaded = true;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?' + Object.values(FONTS).map(f => 'family=' + f.load.split('&family=').join('&family=')).join('&') + '&display=swap';
  document.head.appendChild(l);
}

/* ---------- start ---------- */
loadUI();
bindPanel();
bindInlineEditing();
bindSwap();
bindPicking();
$('#cog').addEventListener('click', () => setOpen(!Ed.open));
App.on(type => {
  if (type === 'render') { applyEditable(); setTimeout(drawPins, 50); if (Ed.swapping) stopHero(); }
  if (Ed.open) { drawBar(); drawBody(); }
});
window.addEventListener('resize', () => drawPins());
window.addEventListener('load', () => drawPins());
setDevice(Ed.device);
if (Ed.open) setOpen(true);
