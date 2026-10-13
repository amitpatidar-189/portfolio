import { h, sv, clamp, rng, reduced, consoleShell } from './util.js';

const TOPICS = [['Arithmetic', 'Quant'], ['Algebra', 'Quant'], ['Geometry', 'Quant'], ['Number Systems', 'Quant'], ['Data Interpretation', 'DILR'], ['Logical Reasoning', 'DILR']];
const ERR = ['Conceptual gap', 'Calculation mistake', 'Misinterpretation', 'Inefficient approach', 'Time management', 'Close attempt'];
const DIMS = ['Accuracy', 'Speed', 'Consistency', 'Difficulty', 'Calibration'];
// p = chance of a correct answer, tm = time vs target, oc = overconfidence, e = weights over ERR
const PROFILES = {
  concept: { name: 'Concept gaps in Algebra', t: { Arithmetic: { p: .78, tm: 1, oc: 0, e: [1, 2, 1, 1, 1, 2] }, Algebra: { p: .32, tm: 1.2, oc: 1, e: [8, 1, 2, 2, 1, 0] }, Geometry: { p: .55, tm: 1.1, oc: 0, e: [3, 2, 2, 2, 1, 1] }, 'Number Systems': { p: .7, tm: 1, oc: 0, e: [1, 2, 1, 1, 1, 3] }, 'Data Interpretation': { p: .74, tm: 1.05, oc: 0, e: [1, 2, 3, 1, 1, 2] }, 'Logical Reasoning': { p: .68, tm: 1.1, oc: 0, e: [1, 1, 3, 2, 2, 1] } } },
  careless: { name: 'Careless with calculation', t: { Arithmetic: { p: .6, tm: .75, oc: 1, e: [1, 8, 1, 1, 0, 3] }, Algebra: { p: .72, tm: .85, oc: 1, e: [1, 5, 1, 1, 0, 3] }, Geometry: { p: .66, tm: .9, oc: 1, e: [2, 4, 2, 1, 0, 3] }, 'Number Systems': { p: .58, tm: .8, oc: 1, e: [1, 7, 1, 1, 0, 3] }, 'Data Interpretation': { p: .62, tm: .9, oc: 1, e: [1, 6, 2, 1, 1, 2] }, 'Logical Reasoning': { p: .7, tm: .95, oc: 0, e: [1, 2, 2, 1, 1, 3] } } },
  slow: { name: 'Slow on DILR sets', t: { Arithmetic: { p: .8, tm: .95, oc: 0, e: [1, 2, 1, 1, 1, 2] }, Algebra: { p: .75, tm: 1, oc: 0, e: [2, 2, 1, 1, 1, 2] }, Geometry: { p: .72, tm: 1, oc: 0, e: [2, 2, 1, 1, 1, 2] }, 'Number Systems': { p: .78, tm: .95, oc: 0, e: [1, 2, 1, 1, 1, 2] }, 'Data Interpretation': { p: .74, tm: 1.7, oc: 0, e: [1, 1, 1, 3, 8, 2] }, 'Logical Reasoning': { p: .7, tm: 1.8, oc: 0, e: [1, 1, 2, 3, 8, 1] } } },
  balanced: { name: 'Balanced learner', t: Object.fromEntries(TOPICS.map(([n]) => [n, { p: .74, tm: 1, oc: 0, e: [1, 1, 1, 1, 1, 2] }])) },
};

function metrics(list) {
  const n = list.length, ok = a => (a.ok ? 1 : 0);
  if (!n) return { n, evidence: 0, mastery: 0, dims: [0, 0, 0, 0, 0] };
  let w = 0, aw = 0; list.forEach((a, i) => { const x = 1 + i / n; w += x; aw += x * ok(a); });
  const acc = aw / w, speed = clamp(1 / (list.reduce((s, a) => s + a.tm, 0) / n), 0, 1);
  const half = Math.ceil(n / 2), f = list.slice(0, half), s2 = list.slice(half);
  const m = l => (l.length ? l.reduce((s, a) => s + ok(a), 0) / l.length : 0);
  const cons = n < 4 ? .5 : 1 - Math.min(1, Math.abs(m(f) - m(s2)) * 1.5);
  const hard = list.filter(a => a.d === 2), diff = hard.length ? m(hard) : acc * .8;
  const cal = list.filter(a => (a.c >= 2) === a.ok).length / n;
  const mastery = .4 * acc + .2 * speed + .15 * cons + .15 * diff + .1 * cal;
  return { n, evidence: clamp(n / 10, 0, 1), mastery, dims: [acc, speed, cons, diff, cal] };
}

export function mountCat(host) {
  let prof = 'concept', rand = rng(11), data, sel = 'Algebra', busy = false;
  const reset = () => { rand = rng(11 + Object.keys(PROFILES).indexOf(prof)); data = Object.fromEntries(TOPICS.map(([n]) => [n, []])); feed.length = 0; };
  const feed = [];
  const pick = ws => { let r = rand() * ws.reduce((a, b) => a + b, 0); for (let i = 0; i < ws.length; i++) { r -= ws[i]; if (r <= 0) return i; } return 0; };
  const attempt = () => {
    const [topic] = TOPICS[Math.floor(rand() * TOPICS.length)], cfg = PROFILES[prof].t[topic], d = Math.floor(rand() * 3);
    const ok = rand() < clamp(cfg.p + [.12, 0, -.18][d], .05, .97), tm = clamp(cfg.tm * (.8 + rand() * .4) * [.85, 1, 1.25][d], .4, 2.4);
    const c = clamp(Math.round(1 + rand() * 2 + cfg.oc * (rand() < .6 ? 1 : 0) - (ok ? 0 : 0)), 1, 3);
    const a = { topic, ok, tm, d, c, err: ok ? null : ERR[pick(cfg.e)] }; data[topic].push(a); feed.unshift(a); feed.length = Math.min(feed.length, 6); return a;
  };

  // --- DOM ---
  const ringC = 2 * Math.PI * 22;
  const cards = TOPICS.map(([n, g]) => {
    const arc = sv('circle', { cx: 28, cy: 28, r: 22, fill: 'none', stroke: '#5b8cff', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': ringC, 'stroke-dashoffset': ringC, transform: 'rotate(-90 28 28)', style: 'transition:stroke-dashoffset .6s, stroke .4s' });
    const pct = h('b', { style: 'color:#fff;font-weight:500' }), meta = h('span', { class: 'k' }), dots = h('span', { class: 'dots5', 'aria-hidden': 'true' }, ...Array.from({ length: 5 }, () => h('i')));
    const el = h('button', { type: 'button', class: 'topic', 'aria-pressed': String(n === sel), onclick: () => { sel = n; draw(); } },
      sv('svg', { viewBox: '0 0 56 56', width: 56, height: 56, 'aria-hidden': 'true' }, sv('circle', { cx: 28, cy: 28, r: 22, fill: 'none', stroke: 'rgba(255,255,255,.12)', 'stroke-width': 6 }), arc),
      h('span', { class: 'ti' }, h('span', {}, n, ' ', h('span', { class: 'k', style: 'margin-left:.3rem' }, g)), meta, dots), pct);
    return { n, el, arc, pct, meta, dots };
  });
  const radar = sv('svg', { viewBox: '-45 0 390 300', class: 'radar', role: 'img', 'aria-label': 'Radar chart of the selected topic across five dimensions' });
  const cx = 150, cy = 150, R = 105, ang = i => (-90 + i * 72) * Math.PI / 180, pt = (i, v) => [cx + Math.cos(ang(i)) * R * v, cy + Math.sin(ang(i)) * R * v];
  [.25, .5, .75, 1].forEach(k => radar.append(sv('polygon', { points: DIMS.map((_, i) => pt(i, k).join(',')).join(' '), fill: 'none', stroke: 'rgba(255,255,255,.14)' })));
  DIMS.forEach((d, i) => { const [x, y] = pt(i, 1.2); radar.append(sv('line', { x1: cx, y1: cy, x2: pt(i, 1)[0], y2: pt(i, 1)[1], stroke: 'rgba(255,255,255,.14)' }), sv('text', { x, y: y + 4, 'text-anchor': 'middle', style: 'font:500 11px var(--mono);fill:#a3b3d4' }, d)); });
  const poly = sv('polygon', { fill: 'rgba(91,140,255,.35)', stroke: '#7fd6ff', 'stroke-width': 2, 'stroke-linejoin': 'round' }); radar.append(poly);
  const verts = DIMS.map(() => sv('circle', { r: 4, fill: '#7fd6ff' })); radar.append(...verts);
  let shown = [0, 0, 0, 0, 0], raf;
  const tween = to => { cancelAnimationFrame(raf); const from = [...shown], t0 = performance.now(), dur = reduced() ? 1 : 600;
    const st = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); shown = from.map((v, i) => v + (to[i] - v) * e);
      poly.setAttribute('points', shown.map((v, i) => pt(i, Math.max(v, .02)).join(',')).join(' ')); verts.forEach((c, i) => { const [x, y] = pt(i, Math.max(shown[i], .02)); c.setAttribute('cx', x); c.setAttribute('cy', y); }); if (k < 1) raf = requestAnimationFrame(st); };
    raf = requestAnimationFrame(st); };
  const errBars = ERR.map(e => { const bar = h('i'), n = h('span', { class: 'k' }, '0'); return { e, bar, n, el: h('div', { class: 'ebar' }, h('span', {}, e), h('div', { class: 'etrack' }, bar), n) }; });
  const feedEl = h('ul', { class: 'feed', 'aria-live': 'polite' }), nextEl = h('ol', { class: 'next' }), evNote = h('p', { class: 'note' }), selTitle = h('h4', {});

  const draw = () => {
    const all = TOPICS.map(([n]) => [n, metrics(data[n])]);
    cards.forEach(c => { const m = Object.fromEntries(all)[c.n]; c.el.setAttribute('aria-pressed', String(c.n === sel));
      c.arc.setAttribute('stroke-dashoffset', ringC * (1 - m.mastery)); c.arc.setAttribute('stroke', m.n === 0 ? '#5b8cff' : m.mastery < .5 ? '#ff7b7b' : m.mastery < .7 ? '#ffc857' : '#3ddc97');
      c.pct.textContent = m.n ? Math.round(m.mastery * 100) + '%' : '–'; c.meta.textContent = `${m.n} attempts`; [...c.dots.children].forEach((d, i) => d.classList.toggle('on', i < Math.round(m.evidence * 5))); });
    const m = Object.fromEntries(all)[sel]; selTitle.textContent = `${sel}: mastery ${m.n ? Math.round(m.mastery * 100) + '%' : 'not enough data'}`; tween(m.dims);
    evNote.textContent = m.n < 4 ? `Low evidence (${m.n} attempts). The engine will not draw conclusions from so few questions.` : m.evidence < 1 ? `Evidence building (${m.n} of 10 attempts for full confidence).` : 'Strong evidence: this score is based on repeated attempts.';
    const errs = data[sel].filter(a => !a.ok), max = Math.max(1, ...ERR.map(e => errs.filter(a => a.err === e).length));
    errBars.forEach(b => { const c = errs.filter(a => a.err === b.e).length; b.bar.style.width = c / max * 100 + '%'; b.n.textContent = c; });
    feedEl.textContent = ''; feed.forEach(a => feedEl.append(h('li', { class: a.ok ? 'ok' : 'no' }, h('b', {}, a.ok ? '✓' : '✗'), ` ${a.topic} · ${['easy', 'medium', 'hard'][a.d]} · ${a.tm.toFixed(1)}× target time`, a.err ? h('span', { class: 'k', style: 'margin-left:.5rem' }, a.err) : null)));
    if (!feed.length) feedEl.append(h('li', {}, 'No attempts yet. Press "+5 attempts".'));
    const ranked = all.map(([n, mm]) => ({ n, mm, pr: (1 - mm.mastery) * (.4 + .6 * mm.evidence) + .35 * (1 - mm.evidence) })).sort((a, b) => b.pr - a.pr).slice(0, 3);
    nextEl.textContent = '';
    ranked.forEach(r => { const top = ERR.map(e => [e, data[r.n].filter(a => a.err === e).length]).sort((a, b) => b[1] - a[1])[0];
      const act = r.mm.evidence < .4 ? `Gather evidence: 5 mixed-difficulty ${r.n} questions` : r.mm.mastery < .55 ? `Targeted practice, focus on "${top[0].toLowerCase()}"` : `Spaced retest in ${r.mm.mastery < .75 ? 3 : 7} days`;
      nextEl.append(h('li', {}, h('b', { style: 'color:#fff' }, r.n), h('span', { class: 'k', style: 'display:block' }, `priority ${Math.round(r.pr * 100)}`), act)); });
  };
  const run = async count => { if (busy) return; busy = true; for (let i = 0; i < count; i++) { attempt(); draw(); if (!reduced()) await new Promise(r => setTimeout(r, 110)); } busy = false; };
  const profBtns = Object.entries(PROFILES).map(([k, p]) => h('button', { type: 'button', class: 'lb', 'aria-pressed': String(k === prof), onclick: () => { if (busy) return; prof = k; profBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(Object.keys(PROFILES)[i] === k))); reset(); for (let i = 0; i < 36; i++) attempt(); sel = { concept: 'Algebra', careless: 'Arithmetic', slow: 'Data Interpretation', balanced: 'Geometry' }[k]; draw(); } }, p.name));

  reset(); for (let i = 0; i < 36; i++) attempt();
  host.textContent = '';
  host.append(consoleShell('cat · diagnostic engine',
    h('p', {}, 'The engine diagnoses topic mastery from repeated attempts, not single questions. It weighs accuracy, speed, consistency, difficulty handling and confidence, classifies each mistake, and ranks what to practise next by weakness and strength of evidence.'),
    h('div', { class: 'row', style: 'margin:1rem 0 .6rem' }, h('span', { class: 'k' }, 'Learner'), ...profBtns),
    h('div', { class: 'row', style: 'margin-bottom:1rem' }, h('button', { type: 'button', class: 'lb lb--go', onclick: () => run(5) }, '+5 attempts'), h('button', { type: 'button', class: 'lb', onclick: () => run(20) }, '+20 attempts'),
      h('button', { type: 'button', class: 'lb', onclick: () => { reset(); draw(); } }, 'Clear')),
    h('div', { class: 'cat-grid' },
      h('div', { class: 'topics', role: 'group', 'aria-label': 'Topics' }, ...cards.map(c => c.el)),
      h('div', { class: 'tile' }, selTitle, radar, evNote),
      h('div', { style: 'display:grid;gap:1rem;align-content:start' },
        h('div', { class: 'tile' }, h('span', { class: 'k' }, 'Error classification'), ...errBars.map(b => b.el)),
        h('div', { class: 'tile' }, h('span', { class: 'k' }, 'Next practice'), nextEl))),
    h('div', { class: 'tile', style: 'margin-top:1rem' }, h('span', { class: 'k' }, 'Live attempt feed'), feedEl),
    h('p', { class: 'note' }, 'Simulated learners and a simplified scoring model for illustration. The 200-question bank and real taxonomy are not used here.')));
  draw();
}
