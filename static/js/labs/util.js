// Tiny DOM helpers shared by the interactive labs.
const SVGNS = 'http://www.w3.org/2000/svg';
export const $ = (s, c = document) => c.querySelector(s);
export const $$ = (s, c = document) => [...c.querySelectorAll(s)];
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('calm');

function apply(e, attrs, kids) {
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.setAttribute('class', v);
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
export const h = (tag, attrs = {}, ...kids) => apply(document.createElement(tag), attrs, kids);
export const sv = (tag, attrs = {}, ...kids) => apply(document.createElementNS(SVGNS, tag), attrs, kids);

// Deterministic random so every visitor sees the same scenario.
export function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }

// Count a number up/down smoothly (instant when motion is reduced).
export function countTo(el, to, { ms = 700, fmt = v => Math.round(v) } = {}) {
  const from = parseFloat(el.dataset.v ?? 0); el.dataset.v = to;
  cancelAnimationFrame(el._raf);
  if (reduced()) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const step = t => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e); if (k < 1) el._raf = requestAnimationFrame(step); };
  el._raf = requestAnimationFrame(step);
}

export function consoleShell(title, ...body) {
  return h('div', { class: 'console' },
    h('div', { class: 'console-bar' },
      h('span', { class: 'dots', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      h('span', { class: 'ttl mono' }, title),
      h('span', { class: 'tag mono' }, 'Illustrative')),
    h('div', { class: 'console-body' }, ...body));
}

// Accessible tab group that builds each panel lazily on first open.
let uid = 0;
export function subTabs(items, { label = 'Lab tools' } = {}) {
  const id = ++uid, list = h('div', { class: 'lab-sub', role: 'tablist', 'aria-label': label }), wrap = h('div', { class: 'lab-panels' });
  const tabs = [], panels = [];
  const select = i => {
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; panels[k].hidden = k !== i; });
    if (!panels[i].dataset.built) { panels[i].dataset.built = '1'; items[i].build(panels[i]); }
  };
  items.forEach((it, i) => {
    const t = h('button', { type: 'button', role: 'tab', id: `st${id}-${i}`, 'aria-controls': `sp${id}-${i}`, onclick: () => select(i) }, it.label);
    const p = h('div', { role: 'tabpanel', id: `sp${id}-${i}`, 'aria-labelledby': `st${id}-${i}`, class: 'lab-panel', hidden: true });
    tabs.push(t); panels.push(p); list.append(t); wrap.append(p);
  });
  list.addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement); if (i < 0 || !['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const n = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length; select(n); tabs[n].focus();
  });
  select(0);
  return { list, wrap, select };
}
