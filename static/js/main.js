import { startField } from './field.js';

const root = document.documentElement;
let calm = false;
try { calm = localStorage.getItem('calm') === '1'; } catch (e) { /* storage unavailable */ }
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || calm;
if (calm) { root.classList.remove('js'); root.classList.add('calm'); }
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const hasGsap = !!(window.gsap && window.ScrollTrigger);

/* ---------- Mobile nav ---------- */
const toggle = $('.nav-toggle'), links = $('#nav-links');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', open);
  links.classList.toggle('open', open);
});
links?.addEventListener('click', e => {
  if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); links.classList.remove('open'); }
});

/* ---------- Active chapter (nav + rail) ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$('[data-t]').forEach(a => { if (a.matches('a')) a.classList.toggle('active', a.dataset.t === e.target.dataset.t); });
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section[data-t]').forEach(s => io.observe(s));

/* ---------- Scroll progress ---------- */
const bar = $('.progress i');
let tick = false;
const topBtn = $('.to-top');
if (topBtn) { topBtn.hidden = false; topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })); }
function progress() {
  const max = root.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, scrollY / max) : 0;
  bar.style.transform = `scaleX(${p})`;
  if (topBtn) { topBtn.classList.toggle('show', scrollY > innerHeight * .8); topBtn.style.setProperty('--sp', p); }
  tick = false;
}
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(progress); } }, { passive: true });
progress();

/* ---------- Capability tabs ---------- */
const tabs = $$('.cap-tab');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(o => { const on = o === t; o.setAttribute('aria-selected', on); $('#' + o.getAttribute('aria-controls')).hidden = !on; });
}));
$('.caps')?.addEventListener('keydown', e => {
  const i = tabs.findIndex(t => t === document.activeElement);
  if (i < 0 || !['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
  const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
  n.focus(); n.click();
});


/* ---------- Calm mode (persisted, reloads to apply) ---------- */
const calmBtn = $('.calm-toggle');
if (calmBtn) {
  calmBtn.setAttribute('aria-pressed', calm);
  calmBtn.textContent = `Calm mode: ${calm ? 'on' : 'off'}`;
  calmBtn.addEventListener('click', () => {
    try { localStorage.setItem('calm', calm ? '0' : '1'); } catch (e) { /* ignore */ }
    location.reload();
  });
}

/* ---------- Sliding nav pill ---------- */
const pillHost = $('#nav-links');
if (pillHost && matchMedia('(min-width: 721px)').matches) {
  const pill = document.createElement('i'); pill.className = 'nav-pill'; pill.setAttribute('aria-hidden', 'true');
  pillHost.prepend(pill); pillHost.classList.add('has-pill');
  const items = $$('a:not(.nav-cta)', pillHost);
  const moveTo = a => {
    if (!a) { pill.style.opacity = 0; return; }
    const r = a.getBoundingClientRect(), h = pillHost.getBoundingClientRect();
    pill.style.width = r.width + 'px'; pill.style.transform = `translateX(${r.left - h.left}px)`; pill.style.opacity = 1;
  };
  const rest = () => moveTo(items.find(a => a.classList.contains('active')));
  items.forEach(a => { a.addEventListener('pointerenter', () => moveTo(a)); a.addEventListener('focus', () => moveTo(a)); a.addEventListener('blur', rest); });
  pillHost.addEventListener('pointerleave', rest);
  new MutationObserver(rest).observe(pillHost, { attributes: true, subtree: true, attributeFilter: ['class'] });
  addEventListener('resize', rest);
}

/* ---------- Cursor-reactive grid ---------- */
if (fine && !reduce) {
  let pr = false, px = 0, py = 0;
  addEventListener('pointermove', e => {
    px = e.clientX; py = e.clientY;
    if (!pr) { pr = true; requestAnimationFrame(() => { root.style.setProperty('--px', px + 'px'); root.style.setProperty('--py', py + 'px'); pr = false; }); }
  }, { passive: true });
}

/* ---------- Module explorer ---------- */
const modRoot = $('[data-modules]');
if (modRoot) {
  const btns = $$('.mod', modRoot), det = $('.mod-detail', modRoot);
  const select = b => {
    const linked = new Set(b.dataset.links ? b.dataset.links.split('|') : []);
    btns.forEach(o => {
      const on = o === b;
      o.setAttribute('aria-pressed', on);
      if (!on && (linked.has(o.dataset.name) || (o.dataset.links || '').split('|').includes(b.dataset.name))) linked.add(o.dataset.name);
      o.classList.toggle('is-linked', !on && linked.has(o.dataset.name));
    });
    $('h4', det).textContent = b.dataset.name;
    $('.mod-desc', det).textContent = b.dataset.desc;
    const rel = [...linked];
    $('.mod-rel', det).textContent = rel.length ? 'Connects to: ' + rel.join(' · ') : 'Reads from the live attendance record.';
  };
  btns.forEach(b => { b.addEventListener('click', () => select(b)); b.addEventListener('pointerenter', () => { if (fine) select(b); }); });
  select(btns[0]);
}

/* ---------- Before / after compare ---------- */
const cmp = $('[data-compare]');
if (cmp) {
  const range = $('.cmp-range', cmp);
  const set = () => { cmp.style.setProperty('--pos', range.value + '%'); cmp.style.setProperty('--p', range.value > 90 ? 1 : 0); };
  range.value = 100;
  range.addEventListener('input', set); set();
}

/* ---------- Pointer sheen on glass cards ---------- */
if (fine) $$('.glass--card').forEach(c => c.addEventListener('pointermove', e => {
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', e.clientX - r.left + 'px');
  c.style.setProperty('--my', e.clientY - r.top + 'px');
}));

/* ---------- Journey scene (SVG built here so the page works without it) ---------- */
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent?.appendChild(n); return n; };
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

const scene = $('.scene svg');
let dots = [], inputPts = [], cells = [];
if (scene) {
  const rnd = rng(42);
  const gD = $('.s-data', scene), gM = $('.s-model', scene), gR = $('.s-roster', scene);
  const cols = [[120, 7], [320, 5], [520, 2]];
  const pts = cols.map(([x, n]) => Array.from({ length: n }, (_, i) => ({ x, y: 230 + (i - (n - 1) / 2) * (n > 5 ? 52 : 62) })));
  inputPts = pts[0];
  for (let c = 0; c < 2; c++) pts[c].forEach(a => pts[c + 1].forEach(b => el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: 'rgba(47,107,255,.25)', 'stroke-width': 1.2 }, gM)));
  pts.flat().forEach((p, i) => el('circle', { cx: p.x, cy: p.y, r: i >= 12 ? 13 : 9, fill: i >= 12 ? '#2f6bff' : '#fff', stroke: '#2f6bff', 'stroke-width': 2 }, gM));
  el('text', { x: 320, y: 48, 'text-anchor': 'middle', class: 'sc-s' }, gM).textContent = 'Absence risk model · XGBoost';
  for (let i = 0; i < 64; i++) dots.push(el('circle', { cx: 30 + rnd() * 580, cy: 70 + rnd() * 340, r: 2 + rnd() * 2.4, fill: i % 5 ? '#7fb2ff' : '#2f6bff' }, gD));
  const cw = 62, ch = 44, gx = 44, gy = 96;
  el('text', { x: 320, y: 48, 'text-anchor': 'middle', class: 'sc-s' }, gR).textContent = 'Roster · conceptual';
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) {
    const on = rnd() > .32;
    cells.push(el('rect', { x: gx + c * (cw + 8), y: gy + r * (ch + 8), width: cw, height: ch, rx: 10, fill: on ? 'rgba(47,107,255,.78)' : 'rgba(255,255,255,.7)', stroke: on ? 'rgba(255,255,255,.8)' : 'rgba(47,107,255,.3)' }, gR));
  }
}

/* ---------- Animation ---------- */
function splitWords(n) {
  const words = n.textContent.trim().split(/\s+/);
  n.setAttribute('aria-label', n.textContent.trim());
  n.innerHTML = words.map(w => `<span class="sw" aria-hidden="true"><span>${w}</span></span>`).join(' ');
  return $$('.sw > span', n);
}
const canvas = $('.field');
const finish = () => $('.intro')?.remove();

if (!hasGsap || reduce) {
  finish();
  $('.hero-title')?.classList.add('ready');
  if (!hasGsap) root.classList.remove('js');
  if (canvas) startField(canvas, { reduce: true });
} else {
  gsap.registerPlugin(ScrollTrigger);
  $$('.hero-title .w').forEach((w, i) => w.style.setProperty('--i', i));

  // Cinematic intro -> hero. Skippable by click, key, wheel or touch.
  const hero = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
    .add(() => $('.hero-title').classList.add('ready'), 0)
    .to('.hero-copy .reveal', { opacity: 1, y: 0, duration: .8, stagger: .12 }, .25)
    .fromTo('.layer--back', { opacity: 0, y: 40 }, { opacity: .7, y: 0, duration: 1 }, .1)
    .fromTo('.layer--mid', { opacity: 0, y: 60, rotateX: 12 }, { opacity: 1, y: 0, rotateX: 0, duration: 1.1 }, .25)
    .to('.layer--front', { opacity: 1, duration: .8 }, .8)
    .fromTo('.draw', { strokeDashoffset: 600 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, .8)
    .fromTo('.nav', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, .4);
  gsap.set('.nav', { opacity: 0 });
  if (canvas) startField(canvas);

  let done = false;
  const intro = gsap.timeline({ onComplete: end })
    .from('.intro-card', { opacity: 0, y: 30, scale: .96, duration: .8, ease: 'power3.out' })
    .from('.intro-name span', { yPercent: 110, opacity: 0, duration: .9, stagger: .12, ease: 'power4.out' }, .2)
    .from('.intro-sub', { opacity: 0, y: 10, duration: .6 }, .7)
    .to('.intro-bar i', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, .5)
    .to('.intro', { opacity: 0, duration: .6, ease: 'power2.inOut' }, '+=.15');
  function end() {
    if (done) return; done = true; intro.progress(1); finish();
    removeEventListener('wheel', skip); removeEventListener('keydown', skip); removeEventListener('touchstart', skip); removeEventListener('click', skip);
    hero.play(0);
  }
  function skip() { intro.timeScale(6); }
  ['wheel', 'keydown', 'touchstart', 'click'].forEach(t => addEventListener(t, skip, { passive: true }));

  // Section headings: masked word reveal
  $$('.h2').forEach(h => {
    if (h.children.length) return;
    const ws = splitWords(h);
    gsap.from(ws, { yPercent: 115, duration: .9, stagger: .05, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });

  // Scroll reveals
  $$('main section:not(.hero) .reveal').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));

  // Ambient parallax (transform only)
  [['.o1', -140], ['.o2', 180], ['.o3', -90]].forEach(([s, y]) =>
    gsap.to(s, { y, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true } }));

  // Timeline line draws with scroll
  const tl = $('.timeline');
  if (tl) gsap.fromTo(tl, { '--tl': 0 }, { '--tl': 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 70%', end: 'bottom 70%', scrub: true } });

  // Pinned, scrubbed journey (desktop only; elsewhere the steps simply stack)
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px) and (min-height: 560px)', () => {
    const J = $('.journey'), steps = $$('.step'), cap = $('.cap-step');
    const names = ['01 · Operational data', '02 · Absence prediction', '03 · Intelligent rostering', '04 · Measured outcomes'];
    J.classList.add('pinned');
    const tlJ = gsap.timeline({
      scrollTrigger: {
        trigger: J, start: 'top top', end: '+=320%', pin: '.journey-stage', scrub: .6, anticipatePin: 1,
        onUpdate: self => {
          const i = Math.min(3, Math.floor(self.progress * 4 + .0001));
          steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
          cap.textContent = names[i];
        },
      },
      defaults: { ease: 'none' },
    });
    gsap.set('.s-out', { opacity: 0 });
    gsap.set('.s-data', { opacity: 1 });
    gsap.set(dots, { opacity: 0, scale: 0, transformOrigin: 'center' });
    gsap.set('.bar', { scaleY: 0, transformOrigin: '50% 100%' });
    tlJ
      .to(dots, { opacity: 1, scale: 1, stagger: { each: .008, from: 'random' }, duration: .5 }, 0)
      // 02: data condenses into model inputs, network appears
      .to(dots.slice(0, inputPts.length), { x: (i, t) => inputPts[i].x - t.cx.baseVal.value, y: (i, t) => inputPts[i].y - t.cy.baseVal.value, duration: .7 }, 1)
      .to(dots.slice(inputPts.length), { x: (i, t) => 120 - t.cx.baseVal.value, opacity: 0, duration: .7, stagger: .004 }, 1)
      .fromTo('.s-model', { opacity: 0 }, { opacity: 1, duration: .6 }, 1.2)
      // 03: model resolves into a roster grid
      .to(['.s-model', dots.slice(0, inputPts.length)], { opacity: 0, duration: .3 }, 1.85)
      .fromTo('.s-roster', { opacity: 0 }, { opacity: 1, duration: .2 }, 2.1)
      .fromTo(cells, { opacity: 0, scale: .4, transformOrigin: 'center' }, { opacity: 1, scale: 1, stagger: { each: .012, from: 'start' }, duration: .5 }, 2.15)
      // 04: outcomes
      .to('.s-roster', { opacity: .06, duration: .5 }, 3.05)
      .to('.s-out', { opacity: 1, duration: .3 }, 3)
      .to('.bar', { scaleY: 1, duration: .7, stagger: .12 }, 3.1);
    return () => J.classList.remove('pinned');
  });
}

/* ---------- Pointer effects (fine pointers only) ---------- */
if (fine && !reduce) {
  const tilt = $('.tilt'), vis = $('.hero-visual');
  vis?.addEventListener('pointermove', e => {
    const r = vis.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    tilt.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
  vis?.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------- Collapsible case studies ---------- */
$$('[data-collapsible]').forEach(card => {
  const btn = $('.cs-toggle', card);
  btn?.addEventListener('click', () => {
    const open = card.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? 'Show less' : 'Read the full case study';
    if (hasGsap && window.ScrollTrigger) ScrollTrigger.refresh();
  });
});

/* ---------- Interactive labs (loaded on demand) ---------- */
const labNav = $('.lab-nav');
if (labNav) {
  const loaders = {
    shifteaze: () => import('./labs/shifteaze.js').then(m => m.mountShiftEaze),
    cat: () => import('./labs/cat.js').then(m => m.mountCat),
    krishi: () => import('./labs/krishi.js').then(m => m.mountKrishi),
  };
  const mounted = {};
  const mountLab = async key => {
    if (mounted[key]) return; mounted[key] = true;
    try { (await loaders[key]())($(`[data-lab=${key}]`)); } catch (err) { mounted[key] = false; console.error('Lab failed to load', key, err); }
  };
  const labTabs = $$('[role=tab]', labNav);
  const current = () => labTabs.find(t => t.getAttribute('aria-selected') === 'true')?.id.replace('labtab-', '');
  labTabs.forEach(t => t.addEventListener('click', () => {
    labTabs.forEach(o => { const on = o === t; o.setAttribute('aria-selected', on); $('#' + o.getAttribute('aria-controls')).hidden = !on; });
    mountLab(current());
    if (hasGsap && window.ScrollTrigger) ScrollTrigger.refresh();
  }));
  labNav.addEventListener('keydown', e => {
    const i = labTabs.indexOf(document.activeElement); if (i < 0 || !['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const n = labTabs[(i + (e.key === 'ArrowRight' ? 1 : labTabs.length - 1)) % labTabs.length]; n.focus(); n.click();
  });
  new IntersectionObserver((es, ob) => { if (es.some(e => e.isIntersecting)) { mountLab(current()); ob.disconnect(); } }, { rootMargin: '300px' }).observe($('#labs'));
}
