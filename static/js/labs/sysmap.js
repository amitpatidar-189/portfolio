// Conceptual ShiftEaze system map: layers, services and the data that moves between them.
// Components and flows are simplified for illustration; this is not a deployment diagram.
import { h, sv, $, $$, consoleShell, reduced } from './util.js';

const W = 900, H = 450;
const LAYERS = [['CHANNELS', 14], ['PLATFORM SERVICES', 158], ['DATA & INTELLIGENCE', 302]];
const N = {
  app: ['Operator app', 44, 44, 170, 'Roster, shift confirmation, QR punch-in, leave and helpdesk in one mobile app.'],
  qr: ['QR / kiosk', 260, 44, 170, 'QR gate pass and kiosk punches, accepted only inside the terminal geofence.'],
  mgr: ['Manager portal', 476, 44, 170, 'Where planners build rosters, approve leave and watch live attendance.'],
  ai: ['AI calling', 692, 44, 170, 'Automated calls for shift confirmation, reminders and overtime offers.'],
  roster: ['Rostering', 40, 188, 140, 'Cycle-based auto-rostering plus AI-assisted planning with ranked backfill.'],
  attend: ['Attendance', 210, 188, 140, 'One live record fed from every capture route.'],
  leave: ['Leave', 380, 188, 140, 'Requests, live balances, approvals and follow-up on rejected leave.'],
  help: ['Helpdesk', 550, 188, 140, 'Tickets raised by operators and resolved by managers.'],
  notif: ['Notifications', 720, 188, 140, 'Pushes and call triggers that reach operators at the right time.'],
  store: ['Operational data', 60, 332, 220, 'Attendance, leave and roster history kept together as the single source of truth.'],
  model: ['Absence-risk model', 340, 332, 220, 'Scores operators from attendance history, shift position and calendars.'],
  analytics: ['Analytics', 620, 332, 220, 'Live dashboards and shared filters over the operational data.'],
};
const NH = 60;
const FLOWS = {
  punch: ['Punch-in', [
    [[['app', 'attend'], ['qr', 'attend']], 'The operator punches in from the app or a QR gate pass.'],
    [[], 'Attendance checks the geofence and records the punch.', 'attend'],
    [[['attend', 'store']], 'The record joins roster and history data.'],
    [[['store', 'analytics']], 'Analytics refreshes the live views.'],
    [[['analytics', 'mgr']], 'The manager sees who is on site, right now.']]],
  leave: ['Leave request', [
    [[['app', 'leave']], 'The operator requests leave in the app.'],
    [[['leave', 'mgr']], 'The manager reviews it with the live balance.'],
    [[['mgr', 'leave']], 'The decision is recorded: approved or rejected.'],
    [[['leave', 'store']], 'The outcome is stored, including whether the operator still came to work.'],
    [[['store', 'model']], 'That follow-up feeds the absence-risk model.']]],
  predict: ['Absence prediction', [
    [[['store', 'model']], 'History and calendars feed the model.'],
    [[['model', 'roster']], 'Risk scores reach rostering before the shift.'],
    [[['roster', 'mgr']], 'The planner sees flagged operators and ranked backfill.'],
    [[['mgr', 'roster']], 'The planner approves a backfill.'],
    [[['roster', 'notif']], 'A notification is triggered.'],
    [[['notif', 'ai']], 'AI calling places the call.'],
    [[['ai', 'app']], 'The operator is reached and the answer is recorded.']]],
  confirm: ['Shift confirmation', [
    [[['roster', 'notif']], 'A published roster triggers confirmation requests.'],
    [[['notif', 'app']], 'Operators are notified in the app.'],
    [[['app', 'roster']], 'Each operator confirms or declines.'],
    [[['roster', 'mgr']], 'The planner sees confirmation status live.']]],
  help: ['Helpdesk', [
    [[['app', 'help']], 'An operator raises a ticket from the app.'],
    [[['help', 'mgr']], 'It reaches the manager portal.'],
    [[['mgr', 'help']], 'The manager resolves it.'],
    [[['help', 'store']], 'The ticket history is stored.']]],
};
const key = (a, b) => [a, b].sort().join('|');
const layerOf = id => Math.round((N[id][2] - 44) / 144);

function pathFor(a, b) {
  const A = N[a], B = N[b], ax = A[1] + A[3] / 2, bx = B[1] + B[3] / 2, la = layerOf(a), lb = layerOf(b);
  if (la === lb) { const y = A[2]; return `M${ax} ${y} C${ax} ${y - 34} ${bx} ${y - 34} ${bx} ${y}`; }
  const down = lb > la, ay = down ? A[2] + NH : A[2], by = down ? B[2] : B[2] + NH, m = (ay + by) / 2;
  return `M${ax} ${ay} C${ax} ${m} ${bx} ${m} ${bx} ${by}`;
}

export function mountSysmap(host) {
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'sm', role: 'group', 'aria-label': 'ShiftEaze system map, conceptual' });
  LAYERS.forEach(([name, y]) => svg.append(sv('rect', { x: 14, y, width: W - 28, height: 124, rx: 16, class: 'sm-band' }), sv('text', { x: 28, y: y + 18, class: 'sm-bl' }, name)));
  const baseG = sv('g', {}), flowG = sv('g', {}), nodeG = sv('g', {}), dotG = sv('g', {});
  svg.append(baseG, flowG, nodeG, dotG);

  // base links + ambient packets
  const seen = new Map();
  Object.values(FLOWS).forEach(([, steps]) => steps.forEach(([edges]) => edges.forEach(([a, b]) => { const k = key(a, b); if (!seen.has(k)) seen.set(k, [a, b]); })));
  const links = [...seen.entries()].map(([k, [a, b]], i) => {
    const d = pathFor(a, b), p = sv('path', { d, class: 'sm-link', 'data-k': k }); baseG.append(p);
    const len = p.getTotalLength(), dots = [0, 1].map(j => { const c = sv('circle', { r: 2.6, class: 'sm-dot' }); dotG.append(c); return { c, off: (i * .13 + j * .5) % 1 }; });
    return { k, a, b, p, len, dots, speed: .00007 + (i % 5) * .00002, dir: i % 2 ? 1 : -1 };
  });
  const linkByKey = Object.fromEntries(links.map(l => [l.k, l]));

  // nodes
  const nodes = {};
  Object.entries(N).forEach(([id, [name, x, y, w]]) => {
    const g = sv('g', { class: 'sm-node', tabindex: 0, role: 'button', 'aria-label': name, 'data-id': id },
      sv('rect', { x, y, width: w, height: NH, rx: 12 }), sv('text', { x: x + w / 2, y: y + NH / 2 + 5, 'text-anchor': 'middle' }, name));
    nodeG.append(g); nodes[id] = g;
  });

  // flow packet
  const packet = sv('circle', { r: 6, class: 'sm-packet' }); dotG.append(packet);
  const pk2 = sv('circle', { r: 6, class: 'sm-packet' }); dotG.append(pk2);

  // side panel
  const stepsEl = h('ol', { class: 'sm-steps' }), info = h('div', { class: 'sm-info', 'aria-live': 'polite' }), caption = h('p', { class: 'sm-cap' });
  const state = { flow: 'predict', step: 0, playing: !reduced(), t0: performance.now(), sel: null, overlay: [] };
  const flowBtns = Object.entries(FLOWS).map(([k, [t]]) => h('button', { type: 'button', class: 'lb', 'aria-pressed': String(k === state.flow), onclick: () => setFlow(k) }, t));
  const playBtn = h('button', { type: 'button', class: 'lb', onclick: () => { state.playing = !state.playing; state.t0 = performance.now(); render(); } });
  const nextBtn = h('button', { type: 'button', class: 'lb', onclick: () => { state.sel = null; advance(); } }, 'Next step');

  function setFlow(k) { state.flow = k; state.step = 0; state.sel = null; state.t0 = performance.now(); if (!reduced()) state.playing = true; buildOverlay(); render(); }
  function advance() { const n = FLOWS[state.flow][1].length; state.step = (state.step + 1) % n; state.t0 = performance.now(); buildOverlay(); render(); }
  function buildOverlay() {
    flowG.textContent = ''; state.overlay = [];
    const [, steps] = FLOWS[state.flow]; const [edges] = steps[state.step];
    edges.forEach(([a, b]) => { const d = pathFor(a, b), p = sv('path', { d, class: 'sm-flow' }), len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = reduced() ? 0 : len; flowG.append(p); state.overlay.push({ p, len, a, b }); });
  }
  function render() {
    const [, steps] = FLOWS[state.flow], used = new Set(), cur = new Set();
    steps.forEach(([edges, , n], i) => { edges.forEach(([a, b]) => { used.add(a); used.add(b); if (i === state.step) { cur.add(a); cur.add(b); } }); if (n) { used.add(n); if (i === state.step) cur.add(n); } });
    const sel = state.sel, selLinks = new Set();
    if (sel) links.forEach(l => { if (l.a === sel || l.b === sel) { selLinks.add(l.k); used.add(l.a); used.add(l.b); } });
    svg.classList.toggle('has-sel', !!sel);
    Object.entries(nodes).forEach(([id, g]) => { g.classList.toggle('on', sel ? (id === sel || [...selLinks].some(k => k.split('|').includes(id))) : used.has(id)); g.classList.toggle('cur', !sel && cur.has(id)); g.classList.toggle('dim', sel ? !g.classList.contains('on') : !used.has(id)); });
    links.forEach(l => { l.p.classList.toggle('hot', sel ? selLinks.has(l.k) : false); });
    flowBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(Object.keys(FLOWS)[i] === state.flow && !sel)));
    stepsEl.textContent = ''; steps.forEach(([, t], i) => stepsEl.append(h('li', { class: !sel && i === state.step ? 'now' : (i < state.step && !sel ? 'past' : ''), onclick: () => { state.sel = null; state.step = i; state.t0 = performance.now(); buildOverlay(); render(); } }, t)));
    caption.textContent = sel ? '' : `Step ${state.step + 1} of ${steps.length}`;
    playBtn.textContent = state.playing ? 'Pause' : 'Play'; playBtn.disabled = !!sel;
    info.textContent = ''; if (sel) info.append(h('h4', {}, N[sel][0]), h('p', {}, N[sel][4]), h('p', { class: 'note' }, 'Connected to: ' + [...new Set(links.filter(l => l.a === sel || l.b === sel).map(l => N[l.a === sel ? l.b : l.a][0]))].join(' · ')), h('button', { type: 'button', class: 'lb', onclick: () => { state.sel = null; state.t0 = performance.now(); render(); } }, 'Back to flow'));
  }
  Object.entries(nodes).forEach(([id, g]) => { const pick = () => { state.sel = id; render(); }; g.addEventListener('click', pick); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }); });

  // animation loop (only while on screen)
  let visible = true, raf = 0, last = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  function frame(now) {
    const dt = now - last; last = now;
    if (!reduced()) links.forEach(l => l.dots.forEach(d => { d.off = (d.off + dt * l.speed * l.dir + 1) % 1; const pt = l.p.getPointAtLength(d.off * l.len); d.c.setAttribute('cx', pt.x); d.c.setAttribute('cy', pt.y); }));
    const el = now - state.t0, prog = reduced() ? 1 : Math.min(1, el / 1100);
    state.overlay.forEach(o => { o.p.style.strokeDashoffset = o.len * (1 - ease(prog)); });
    [packet, pk2].forEach((pk, i) => { const o = state.overlay[i]; if (!o || state.sel || reduced()) { pk.style.opacity = 0; return; } const pt = o.p.getPointAtLength(ease(Math.min(1, el / 1100)) * o.len); pk.setAttribute('cx', pt.x); pk.setAttribute('cy', pt.y); pk.style.opacity = el < 1500 ? 1 : 0; });
    if (state.playing && !state.sel && el > 2300) advance();
    raf = visible ? requestAnimationFrame(frame) : 0;
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }).observe(svg);

  host.textContent = '';
  host.append(consoleShell('shifteaze · system map',
    h('p', {}, 'Four channels talk to platform services, which read and write one operational data store that the risk model and analytics sit on. Pick a flow to watch data move through the layers, or select any component to see what it connects to.'),
    h('div', { class: 'row', style: 'margin:1rem 0' }, h('span', { class: 'k' }, 'Flow'), ...flowBtns, playBtn, nextBtn),
    h('div', { class: 'sm-grid' }, h('div', {}, svg), h('div', { class: 'sm-side' }, caption, stepsEl, info)),
    h('p', { class: 'note' }, 'Conceptual architecture drawn for this portfolio. Component names are simplified and the flows are illustrative.')));
  buildOverlay(); render(); raf = requestAnimationFrame(frame);
}
