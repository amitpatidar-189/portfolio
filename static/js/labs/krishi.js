import { h, sv, $, clamp, rng, countTo, consoleShell } from './util.js';

const CROPS = {
  Wheat: { peak: .82, center: 8.5, width: 3.4, water: 1, pot: 5.2, price: 2400, cost: 48000, susc: .1 },
  Cotton: { peak: .78, center: 9.5, width: 3.6, water: 1.25, pot: 2.6, price: 7000, cost: 78000, susc: .35 },
  Groundnut: { peak: .74, center: 8, width: 3.2, water: .9, pot: 2.4, price: 6200, cost: 62000, susc: .3 },
};
const PLOTS = [
  { id: 'A', crop: 'Wheat', soil: .55, pts: '36,56 244,44 258,172 48,186', c: [140, 115] },
  { id: 'B', crop: 'Cotton', soil: .5, pts: '270,44 520,64 506,176 282,172', c: [395, 115] },
  { id: 'C', crop: 'Groundnut', soil: .6, pts: '48,204 258,190 272,330 62,346', c: [160, 268] },
  { id: 'D', crop: 'Wheat', soil: .4, pts: '284,188 506,194 494,338 298,334', c: [395, 265] },
];
const WX = { dry: ['Dry spell', .02, .2], normal: ['Normal', .10, .45], wet: ['Heavy rain', .30, .9] };
const STAGES = [[0, 'Sowing'], [3, 'Vegetative'], [8, 'Flowering'], [12, 'Grain / boll fill'], [15, 'Harvest']];
const LAYERS = {
  ndvi: ['NDVI', [[0, '#8a6a45'], [.3, '#c9b458'], [.55, '#7ccf6b'], [.85, '#1f9d55']], v => v.ndvi, v => v, [0, 1]],
  moist: ['Soil moisture', [[0, '#c97b3b'], [.35, '#e3c27a'], [.6, '#5bb7ff'], [1, '#2f6bff']], v => v.m, v => v, [0, 1]],
  dis: ['Disease risk', [[0, '#3ddc97'], [.5, '#ffc857'], [1, '#ff6b6b']], v => v.dis, v => v, [0, 1]],
};
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
function scale(stops, v) {
  v = clamp(v, stops[0][0], stops.at(-1)[0]);
  for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i], k = (v - a) / (b - a), A = hex(ca), B = hex(cb); return `rgb(${A.map((x, j) => Math.round(x + (B[j] - x) * k)).join(',')})`; }
}

// One plot, one season. Toy water-balance + canopy model for illustration only.
function sim(plot, wx, irr) {
  const c = CROPS[plot.crop], rain = WX[wx][1], hum = WX[wx][2], rows = []; let m = plot.soil, irrig = 0;
  for (let t = 0; t <= 16; t++) {
    const canopy = Math.exp(-Math.pow((t - c.center) / c.width, 2)), et = (.05 + .09 * canopy) * c.water;
    m = clamp(m + rain - et, 0, 1); let irrNow = 0;
    if (irr && m < .35 && t > 0 && t < 15) { m = clamp(m + .25, 0, 1); irrNow = 1; irrig++; }
    rows.push({ t, m, canopy, irrNow, stress: Math.max(0, .3 - m) / .3 });
  }
  rows.forEach((o, i) => {
    const lag = (rows[i - 1]?.stress || 0) * .5 + (rows[i - 2]?.stress || 0) * .3 + o.stress * .2;
    o.ndvi = .12 + (c.peak - .12) * o.canopy * (1 - .75 * lag); o.ideal = .12 + (c.peak - .12) * o.canopy;
    o.dis = clamp(hum * .7 + c.susc * o.canopy * .9 - .1, 0, 1);
  });
  const win = rows.slice(4, 14), factor = clamp(win.reduce((s, o) => s + o.ndvi, 0) / win.reduce((s, o) => s + o.ideal, 0), 0, 1);
  const alert = Math.max(...win.map(o => o.dis)) >= .7, yld = c.pot * factor * (alert ? .88 : 1);
  return { rows, irrig, yld, alert };
}

function priceSeries(crop) {
  const r = rng(crop.length * 97), base = CROPS[crop].price, hist = []; let p = base * .96;
  for (let i = 0; i < 13; i++) { p *= 1 + (r() - .46) * .035; hist.push(p); }
  const sig = .03, fc = Array.from({ length: 9 }, (_, k) => ({ p: hist.at(-1) * (1 + .006 * k), k, lo: 0, hi: 0 }));
  fc.forEach(f => { const w = 1.28 * sig * Math.sqrt(Math.max(f.k, .0001)); f.lo = f.p * (1 - w); f.hi = f.p * (1 + w); });
  return { hist, fc };
}

export function mountKrishi(host) {
  let layer = 'ndvi', wx = 'normal', irr = true, week = 8, sel = 'B';
  const used = new Set(['GIS-based plot mapping']);
  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');

  // --- map ---
  const polys = PLOTS.map(p => {
    const poly = sv('polygon', { points: p.pts, class: 'plot', tabindex: 0, role: 'button', 'aria-label': `Plot ${p.id}, ${p.crop}`, style: 'transition:fill .5s' });
    const pick = () => { sel = p.id; used.add('GIS-based plot mapping'); draw(); };
    poly.addEventListener('click', pick); poly.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    const label = sv('text', { x: p.c[0], y: p.c[1] - 8, 'text-anchor': 'middle', class: 'plot-t' }, `${p.id} · ${p.crop}`);
    const val = sv('text', { x: p.c[0], y: p.c[1] + 14, 'text-anchor': 'middle', class: 'plot-v' });
    const sensor = sv('g', { transform: `translate(${p.c[0] + 62} ${p.c[1] - 34})` }, sv('circle', { r: 9, class: 'ping' }), sv('circle', { r: 4, fill: '#fff' }));
    const alertEl = sv('g', { transform: `translate(${p.c[0] - 62} ${p.c[1] - 34})`, opacity: 0, style: 'transition:opacity .4s' }, sv('circle', { r: 11, class: 'ping red' }), sv('text', { y: 4, 'text-anchor': 'middle', style: 'font:700 12px var(--mono);fill:#fff' }, '!'));
    return { p, poly, val, label, alertEl, g: [poly, label, val, sensor, alertEl] };
  });
  const map = sv('svg', { viewBox: '0 0 560 370', class: 'farm', role: 'group', 'aria-label': 'Farm map with four plots' },
    sv('rect', { x: 8, y: 8, width: 544, height: 354, rx: 16, fill: 'none', stroke: 'rgba(255,255,255,.16)', 'stroke-dasharray': '4 6' }),
    sv('path', { d: 'M8 181 C180 196 360 164 552 178', fill: 'none', stroke: '#5bb7ff', 'stroke-width': 5, opacity: .55, 'stroke-linecap': 'round' }),
    sv('text', { x: 18, y: 176, class: 'plot-t', style: 'fill:#5bb7ff' }, 'Canal'),
    ...polys.flatMap(x => x.g));
  const legend = h('div', { class: 'lgd' }, h('span', { class: 'k' }, 'low'), h('i', { class: 'lgd-bar' }), h('span', { class: 'k' }, 'high'));

  // --- right panel nodes ---
  const tile = (k, unit) => { const b = h('b', {}, '–'); return { el: h('div', { class: 'tile' }, h('span', { class: 'k' }, k), b), b, unit }; };
  const tNdvi = tile('NDVI'), tMoist = tile('Soil moisture'), tDis = tile('Disease risk');
  const advice = h('p', { class: 'advice', 'aria-live': 'polite' }), cropTitle = h('h4', {});
  const chart = sv('svg', { viewBox: '0 0 360 150', class: 'pchart', role: 'img', 'aria-label': 'Mandi price history and forecast with uncertainty band' });
  const yieldEl = h('b', {}, '–'), raEl = h('b', {}, '–'), rb = ['P10', 'P50', 'P90'].map(k => ({ k, bar: h('i'), v: h('span', { class: 'k' }) }));
  const stageEl = h('span', { class: 'k' }), weekV = h('b', { style: 'color:#fff' }), irrNote = h('span', { class: 'k' });
  const chips = ['Crop lifecycle tracking', 'GIS-based plot mapping', 'Soil analytics', 'Irrigation optimisation', 'Weather intelligence', 'Pest and disease detection', 'Livestock operations'].map(n => h('li', { class: 'mod-chip' }, n));

  const seg = (items, cur, set, label) => h('div', { class: 'row', role: 'group', 'aria-label': label }, ...items.map(([k, t]) => h('button', { type: 'button', class: 'lb', 'aria-pressed': String(k === cur()), onclick: e => { set(k); $$btn(e.target).forEach(b => b.setAttribute('aria-pressed', String(b === e.target))); draw(); } }, t)));
  const $$btn = b => [...b.parentElement.querySelectorAll('button')];
  const slider = h('input', { type: 'range', min: 0, max: 16, value: week, 'aria-label': 'Week of the season', oninput: e => { week = +e.target.value; used.add('Crop lifecycle tracking'); draw(); } });

  function drawChart(crop, hh) {
    const { hist, fc } = priceSeries(crop), all = [...hist, ...fc.flatMap(f => [f.lo, f.hi])], lo = Math.min(...all) * .99, hi = Math.max(...all) * 1.01;
    const X = i => 20 + i * (320 / 21), Y = v => 130 - (v - lo) / (hi - lo) * 110;
    chart.textContent = '';
    chart.append(sv('polygon', { points: [...fc.map((f, k) => `${X(12 + k)},${Y(f.hi)}`), ...fc.map((f, k) => `${X(12 + (8 - k))},${Y(fc[8 - k].lo)}`)].join(' '), fill: 'rgba(127,214,255,.2)' }),
      sv('polyline', { points: hist.map((v, i) => `${X(i)},${Y(v)}`).join(' '), fill: 'none', stroke: '#e9efff', 'stroke-width': 2 }),
      sv('polyline', { points: fc.map((f, k) => `${X(12 + k)},${Y(f.p)}`).join(' '), fill: 'none', stroke: '#7fd6ff', 'stroke-width': 2, 'stroke-dasharray': '5 4' }),
      sv('line', { x1: X(12 + hh), x2: X(12 + hh), y1: 14, y2: 134, stroke: '#ffc857', 'stroke-dasharray': '3 3' }),
      sv('text', { x: X(12 + hh), y: 11, 'text-anchor': 'middle', style: 'font:500 9px var(--mono);fill:#ffc857' }, 'harvest'),
      sv('text', { x: 20, y: 146, style: 'font:500 9px var(--mono);fill:#a3b3d4' }, '← 12 wks history'), sv('text', { x: 340, y: 146, 'text-anchor': 'end', style: 'font:500 9px var(--mono);fill:#a3b3d4' }, 'forecast 8 wks →'));
    return fc[hh];
  }

  function draw() {
    const [, stops] = LAYERS[layer], res = Object.fromEntries(PLOTS.map(p => [p.id, sim(p, wx, irr)]));
    polys.forEach(({ p, poly, val, alertEl }) => {
      const row = res[p.id].rows[week]; poly.setAttribute('fill', scale(stops, LAYERS[layer][2](row))); poly.classList.toggle('sel', p.id === sel);
      val.textContent = layer === 'ndvi' ? `NDVI ${row.ndvi.toFixed(2)}` : layer === 'moist' ? `${Math.round(row.m * 100)}% moisture` : `risk ${Math.round(row.dis * 100)}%`;
      alertEl.setAttribute('opacity', row.dis >= .7 ? 1 : 0);
    });
    $('.lgd-bar', legend).style.background = `linear-gradient(90deg, ${stops.map(([v, c]) => c).join(',')})`;
    const plot = PLOTS.find(p => p.id === sel), r = res[sel], row = r.rows[week], c = CROPS[plot.crop];
    cropTitle.textContent = `Plot ${plot.id} · ${plot.crop}`;
    countTo(tNdvi.b, row.ndvi * 100, { fmt: v => (v / 100).toFixed(2) }); countTo(tMoist.b, row.m * 100, { fmt: v => Math.round(v) + '%' }); countTo(tDis.b, row.dis * 100, { fmt: v => Math.round(v) + '%' });
    tDis.el.classList.toggle('bad', row.dis >= .7);
    const stage = [...STAGES].reverse().find(([w]) => week >= w)[1]; stageEl.textContent = stage; weekV.textContent = `Week ${week}`;
    advice.textContent = row.irrNow ? 'Optimiser irrigated this week (+25 mm).' : wx === 'wet' ? 'Hold irrigation: heavy rain in the forecast.' : row.m < .35 ? 'Moisture is low. Irrigate about 25 mm (turn the optimiser on to automate).' : 'Soil moisture adequate. No irrigation needed.';
    advice.className = 'advice' + (row.m < .35 && !row.irrNow && wx !== 'wet' ? ' warn' : '');
    if (row.dis >= .7) advice.textContent += ' Disease alert: high humidity on a dense canopy. Inspect this plot.';
    irrNote.textContent = irr ? `${r.irrig} irrigation${r.irrig === 1 ? '' : 's'} this season` : 'Optimiser off: no irrigation';
    // economics at current horizon
    const hh = clamp(16 - week, 1, 8), f = drawChart(plot.crop, hh), cost = c.cost + r.irrig * 2500;
    const prof = (y, p) => y * 10 * p - cost, p10 = prof(r.yld * .9, f.lo), p50 = prof(r.yld, f.p), p90 = prof(r.yld * 1.05, f.hi), ra = p50 - .5 * (p50 - p10);
    countTo(yieldEl, r.yld * 100, { fmt: v => (v / 100).toFixed(1) + ' t/ha' }); countTo(raEl, ra, { fmt: fmt });
    const mx = Math.max(p90, 1); [p10, p50, p90].forEach((v, i) => { rb[i].bar.style.width = clamp(v / mx, 0, 1) * 100 + '%'; rb[i].v.textContent = fmt(v); });
    chips.forEach(ch => ch.classList.toggle('on', used.has(ch.textContent)));
  }

  host.textContent = '';
  host.append(consoleShell('krishisaarthi · farm intelligence',
    h('p', {}, 'A decision-support view of one season: field status from satellite NDVI and soil sensors, weather and irrigation, disease alerts, then price forecast and risk-adjusted profit. Change the weather, scrub through the season, and tap a plot.'),
    h('div', { class: 'kctl' },
      h('div', {}, h('span', { class: 'k' }, 'Map layer'), seg(Object.entries(LAYERS).map(([k, v]) => [k, v[0]]), () => layer, k => { layer = k; used.add(k === 'moist' ? 'Soil analytics' : k === 'dis' ? 'Pest and disease detection' : 'GIS-based plot mapping'); }, 'Map layer')),
      h('div', {}, h('span', { class: 'k' }, 'Weather'), seg(Object.entries(WX).map(([k, v]) => [k, v[0]]), () => wx, k => { wx = k; used.add('Weather intelligence'); }, 'Weather')),
      h('div', {}, h('span', { class: 'k' }, 'Irrigation optimiser'), seg([[true, 'On'], [false, 'Off']], () => irr, k => { irr = k; used.add('Irrigation optimisation'); }, 'Irrigation optimiser')),
      h('div', { class: 'wk' }, h('span', { class: 'k' }, 'Season '), weekV, ' · ', stageEl, slider)),
    h('div', { class: 'kgrid' },
      h('div', {}, map, legend),
      h('div', { class: 'kside' },
        cropTitle, h('div', { class: 'stat-row', style: 'grid-template-columns:repeat(3,1fr)' }, tNdvi.el, tMoist.el, tDis.el),
        advice, irrNote,
        h('div', { class: 'tile' }, h('span', { class: 'k' }, 'Mandi price forecast (₹/quintal)'), chart),
        h('div', { class: 'tile' }, h('span', { class: 'k' }, 'Yield estimate · season projection'), h('div', {}, yieldEl),
          h('div', { style: 'margin-top:.8rem' }, h('span', { class: 'k' }, 'Profit per ha at harvest price: P10 / P50 / P90'),
            ...rb.map(b => h('div', { class: 'pbar' }, h('span', { class: 'k' }, b.k), h('div', { class: 'ptrack' }, b.bar), b.v)),
            h('div', { class: 'ra' }, h('span', { class: 'k' }, 'Risk-adjusted profit'), raEl))))),
    h('div', { style: 'margin-top:1rem' }, h('span', { class: 'k' }, 'Platform modules you have exercised'), h('ul', { class: 'chips2' }, ...chips)),
    h('p', { class: 'note' }, 'Toy agronomy, weather and price models with made-up numbers, for illustration. Livestock operations are part of the platform but not simulated here. Satellite and sensor feeds are represented, not connected.')));
  draw();
}
