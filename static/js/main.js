import { startField } from './field.js';

const root = document.documentElement;
// Animation stays on by default; only an OS-level 'reduce motion' setting turns it down.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
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


/* ---------- Sliding nav pill ---------- */
const pillHost = $('#nav-links');
if (pillHost && matchMedia('(min-width: 901px)').matches) {
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
  const set = () => cmp.style.setProperty('--pos', range.value + '%');
  range.value = 50;
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
  // Mobile browsers resize the viewport as the address bar hides and shows; do not re-layout the pins for that.
  ScrollTrigger.config({ ignoreMobileResize: true });
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

  // The journey scene. Pinned and scrubbed with a real mouse on a large screen; everywhere else
  // (phones, touch tablets, short windows) it stacks and plays once when it scrolls into view.
  const J = $('.journey'), steps = $$('.step'), cap = $('.cap-step');
  const STEP_NAMES = ['01 · Operational data', '02 · Absence prediction', '03 · Intelligent rostering', '04 · Measured outcomes'];
  const setStep = i => { steps.forEach((s, k) => s.classList.toggle('is-active', k === i)); if (cap) cap.textContent = STEP_NAMES[i]; };
  function sceneTimeline(vars) {
    gsap.set('.s-out', { opacity: 0 }); gsap.set('.s-data', { opacity: 1 });
    gsap.set(dots, { opacity: 0, scale: 0, transformOrigin: 'center' });
    gsap.set('.bar', { scaleY: 0, transformOrigin: '50% 100%' });
    return gsap.timeline({ ...vars, defaults: { ease: 'none' } })
      .to(dots, { opacity: 1, scale: 1, stagger: { each: .008, from: 'random' }, duration: .5 }, 0)
      .to(dots.slice(0, inputPts.length), { x: (i, t) => inputPts[i].x - t.cx.baseVal.value, y: (i, t) => inputPts[i].y - t.cy.baseVal.value, duration: .7 }, 1)
      .to(dots.slice(inputPts.length), { x: (i, t) => 120 - t.cx.baseVal.value, opacity: 0, duration: .7, stagger: .004 }, 1)
      .fromTo('.s-model', { opacity: 0 }, { opacity: 1, duration: .6 }, 1.2)
      .to(['.s-model', dots.slice(0, inputPts.length)], { opacity: 0, duration: .3 }, 1.85)
      .fromTo('.s-roster', { opacity: 0 }, { opacity: 1, duration: .2 }, 2.1)
      .fromTo(cells, { opacity: 0, scale: .4, transformOrigin: 'center' }, { opacity: 1, scale: 1, stagger: { each: .012, from: 'start' }, duration: .5 }, 2.15)
      .to('.s-roster', { opacity: .06, duration: .5 }, 3.05)
      .to('.s-out', { opacity: 1, duration: .3 }, 3)
      .to('.bar', { scaleY: 1, duration: .7, stagger: .12 }, 3.1);
  }
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px) and (min-height: 560px) and (hover: hover) and (pointer: fine)', () => {
    J.classList.add('pinned');
    // Pin when the content sits centred in the space below the fixed nav (not when the section top hits the
    // viewport top), so the section keeps normal spacing above it instead of a viewport-high band.
    const stage = $('.journey-stage', J), grid = $('.journey-grid', J);
    const pinAt = () => {
      const navH = ($('.nav-wrap')?.getBoundingClientRect().bottom || 80) + 8, room = innerHeight - navH;
      const gridTop = grid.getBoundingClientRect().top - stage.getBoundingClientRect().top;
      return stage.getBoundingClientRect().top + scrollY + gridTop - navH - Math.max(0, (room - grid.offsetHeight) / 2);
    };
    const tl = sceneTimeline({ scrollTrigger: { trigger: J, start: pinAt, end: () => pinAt() + innerHeight * 2.4, pin: '.journey-stage', scrub: .6, anticipatePin: 1,
      onUpdate: self => setStep(Math.min(3, Math.floor(self.progress * 4 + .0001))) } });
    return () => { J.classList.remove('pinned'); tl.scrollTrigger?.kill(); tl.kill(); };
  });
  mm.add('(max-width: 900px), (max-height: 559px), (hover: none), (pointer: coarse)', () => {
    const tl = sceneTimeline({ paused: true, onUpdate: () => setStep(Math.min(3, Math.floor(tl.progress() * 4 + .0001))) });
    tl.timeScale(.55);
    const st = ScrollTrigger.create({ trigger: '.scene', start: 'top 80%', once: true, onEnter: () => tl.play() });
    return () => { st.kill(); tl.kill(); };
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


/* ---------- Skill sample diagrams (loaded on demand) ---------- */
const skillHost = $('.skill-view');
if (skillHost) {
  let started = false;
  const start = () => { if (started) return; started = true; import('./labs/skills.js').then(m => m.mountSkills(skillHost)).catch(err => { started = false; console.error('Skills failed to load', err); }); };
  new IntersectionObserver((es, ob) => { if (es.some(e => e.isIntersecting)) { start(); ob.disconnect(); } }, { rootMargin: '300px' }).observe($('#capabilities'));
}

/* ---------- Live experience counter (IST start, calendar-accurate) ---------- */
const expEl = $('.exp[data-since]');
if (expEl) {
  const start = new Date(expEl.dataset.since), IST = 5.5 * 36e5;
  const parts = d => { const x = new Date(d.getTime() + IST); return [x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate(), x.getUTCHours(), x.getUTCMinutes(), x.getUTCSeconds()]; };
  const S = parts(start), cells = Object.fromEntries($$('[data-u]', expEl).map(b => [b.dataset.u, b]));
  const two = n => String(n).padStart(2, '0');
  const update = () => {
    const N = parts(new Date());
    let [y, mo, d, h, mi, s] = N.map((v, i) => v - S[i]);
    if (s < 0) { s += 60; mi--; } if (mi < 0) { mi += 60; h--; } if (h < 0) { h += 24; d--; }
    if (d < 0) { d += new Date(Date.UTC(N[0], N[1], 0)).getUTCDate(); mo--; }
    if (mo < 0) { mo += 12; y--; }
    cells.years.textContent = two(y); cells.months.textContent = two(mo); cells.days.textContent = two(d);
    cells.hours.textContent = two(h); cells.minutes.textContent = two(mi); cells.seconds.textContent = two(s);
  };
  update(); setInterval(update, 1000);
}

/* ---------- System map (loaded on demand) ---------- */
const sysHost = $('[data-sysmap]');
if (sysHost) {
  let sysStarted = false;
  new IntersectionObserver((es, ob) => { if (es.some(e => e.isIntersecting) && !sysStarted) { sysStarted = true; ob.disconnect(); import('./labs/sysmap.js').then(m => m.mountSysmap(sysHost)).catch(err => { sysStarted = false; console.error('System map failed to load', err); }); } }, { rootMargin: '300px' }).observe(sysHost);
}

/* ---------- In-page links: smooth scroll in JS, then re-aim if late-loading blocks grow the page mid-scroll ---------- */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href') === '#') return;
  const target = document.getElementById(a.getAttribute('href').slice(1)); if (!target) return;
  e.preventDefault();
  history.pushState(null, '', a.getAttribute('href'));
  scrollTo({ top: target.id === 'top' ? 0 : scrollY + target.getBoundingClientRect().top - 96, behavior: reduce ? 'auto' : 'smooth' });
  if (a.classList.contains('skip')) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  [900, 1800, 3000].forEach(ms => setTimeout(() => {
    const off = target.getBoundingClientRect().top - 96;
    if (Math.abs(off) > 40) scrollTo({ top: scrollY + off, behavior: ms === 900 ? 'smooth' : 'auto' });
  }, ms));
});

/* ---------- Keep scroll triggers accurate when late content changes the page height ---------- */
if (hasGsap && window.ScrollTrigger && 'ResizeObserver' in window) {
  let rt, lastH = document.documentElement.scrollHeight;
  new ResizeObserver(() => {
    const hgt = document.documentElement.scrollHeight; if (Math.abs(hgt - lastH) < 4) return; lastH = hgt;
    clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 250);
  }).observe(document.body);
  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
}
