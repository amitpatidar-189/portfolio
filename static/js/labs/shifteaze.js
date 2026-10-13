import { h, sv, $, $$, clamp, countTo, consoleShell, subTabs, rng, reduced } from './util.js';

const SHIFTS = { D: ['Day', 'sh-d'], N: ['Night', 'sh-n'], GEN: ['General', 'sh-g'], WO: ['Week off', 'sh-o'] };
const short = c => (c === 'WO' ? 'O' : c);

/* 1. DDNNOO cycle builder: build a rotation once, the calendar fills itself */
function cycleBuilder(host) {
  let pattern = ['D', 'D', 'N', 'N', 'WO', 'WO'], auto = false;
  const strip = h('div', { class: 'pattern', 'aria-label': 'Cycle pattern' });
  const cal = h('div', { class: 'cal', role: 'img', 'aria-label': 'Generated shift calendar' });
  const counts = h('div', { class: 'stat-row' });
  const modeBtns = [['Generate once', false], ['Auto-repeat', true]].map(([t, v]) => h('button', { type: 'button', class: 'lb', 'aria-pressed': String(v === auto), onclick: () => { auto = v; modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(!!i === auto))); render(); } }, t));
  const render = () => {
    strip.textContent = '';
    if (!pattern.length) strip.append(h('span', { class: 'k' }, 'Add shifts to build a cycle'));
    pattern.forEach((c, i) => strip.append(h('button', { type: 'button', class: `shift-chip ${SHIFTS[c][1]}`, title: 'Remove', 'aria-label': `Remove ${SHIFTS[c][0]} at position ${i + 1}`, onclick: () => { pattern.splice(i, 1); render(); } }, short(c))));
    cal.textContent = '';
    const total = pattern.length ? (auto ? 40 : 30) : 0, today = new Date(), tally = { D: 0, N: 0, GEN: 0, WO: 0 };
    for (let i = 0; i < total; i++) {
      const c = pattern[i % pattern.length], d = new Date(today.getTime() + i * 864e5), ghost = i >= 30;
      if (!ghost) tally[c]++;
      cal.append(h('div', { class: `cell ${SHIFTS[c][1]}${ghost ? ' ghost' : ''}`, style: `--i:${i}`, title: `${d.toDateString()}: ${SHIFTS[c][0]}${ghost ? ' (next window, auto-generated)' : ''}` }, h('span', {}, short(c), h('small', {}, d.getDate()))));
    }
    counts.textContent = '';
    [['Day shifts', tally.D], ['Night shifts', tally.N], ['General', tally.GEN], ['Weeks off', tally.WO]].forEach(([k, v]) => counts.append(h('div', { class: 'tile' }, h('span', { class: 'k' }, k), h('b', {}, v))));
  };
  host.append(
    h('p', {}, 'Build a rotation once from the shift types, then apply it. Generate once creates a fixed 30-day window; Auto-repeat keeps producing the next window until stopped.'),
    h('div', { class: 'row', style: 'margin:1rem 0' },
      ...Object.entries(SHIFTS).map(([c, [n, cls]]) => h('button', { type: 'button', class: `shift-chip ${cls}`, 'aria-label': `Add ${n}`, onclick: () => { if (pattern.length < 12) { pattern.push(c); render(); } } }, `+ ${c}`)),
      h('button', { type: 'button', class: 'lb', onclick: () => { pattern = ['D', 'D', 'N', 'N', 'WO', 'WO']; render(); } }, 'Load DDNNOO'),
      h('button', { type: 'button', class: 'lb', onclick: () => { pattern = []; render(); } }, 'Clear')),
    strip, h('div', { class: 'row', style: 'margin:1rem 0 0' }, h('span', { class: 'k' }, 'Cycle mode'), ...modeBtns),
    cal, h('div', { style: 'margin-top:1rem' }, counts),
    h('p', { class: 'note' }, 'Click a chip in the pattern strip to remove it. Dates start from today.'));
  render();
}

/* 2. Absence risk and backfill. Scoring is a toy model, not the production XGBoost model. */
function riskLab(host) {
  const ops = [
    { id: 'OP-01', role: 'RTG operator', abs: 0, post: false, leave: 'none' },
    { id: 'OP-02', role: 'QC operator', abs: 3, post: true, leave: 'none' },
    { id: 'OP-03', role: 'Gate operator', abs: 1, post: false, leave: 'rejected' },
    { id: 'OP-04', role: 'RTG operator', abs: 5, post: true, leave: 'none' },
    { id: 'OP-05', role: 'RST operator', abs: 2, post: false, leave: 'approved' },
    { id: 'OP-06', role: 'QC operator', abs: 0, post: true, leave: 'none' },
  ];
  const pool = [{ n: 'Standby A', av: .92, ot: .2 }, { n: 'Standby B', av: .81, ot: .45 }, { n: 'Standby C', av: .74, ot: .1 }, { n: 'Standby D', av: .6, ot: .3 }];
  let festival = false;
  const risk = o => o.leave === 'approved' ? null : 1 / (1 + Math.exp(-(-2.2 + .5 * o.abs + .9 * (o.leave === 'rejected') + .7 * festival + .45 * o.post)));
  const list = h('div', { class: 'ops' }), panel = h('div', { 'aria-live': 'polite' });
  const festBtn = h('button', { type: 'button', class: 'lb', 'aria-pressed': 'false', onclick: () => { festival = !festival; festBtn.setAttribute('aria-pressed', festival); render(); } }, 'Festival day');
  const render = () => {
    list.textContent = '';
    ops.forEach(o => {
      const r = risk(o), flag = r !== null && r >= .5 && !o.filled;
      const bar = h('i'), val = h('div', { class: 'risk-v' }, r === null ? 'Leave approved' : o.filled ? 'Backfilled' : Math.round(r * 100) + '% risk');
      const row = h('div', { class: `op${flag ? ' flag' : ''}${r === null || o.filled ? ' ok' : ''}` },
        h('div', { class: 'who' }, h('b', {}, o.id), h('span', {}, o.role)),
        h('div', { class: 'fx' },
          h('span', {}, 'Absences (30d)'), h('button', { type: 'button', class: 'step-btn', 'aria-label': `Decrease absences for ${o.id}`, onclick: () => { o.abs = clamp(o.abs - 1, 0, 8); o.filled = null; render(); } }, '−'), h('b', { style: 'color:#fff' }, o.abs),
          h('button', { type: 'button', class: 'step-btn', 'aria-label': `Increase absences for ${o.id}`, onclick: () => { o.abs = clamp(o.abs + 1, 0, 8); o.filled = null; render(); } }, '+'),
          h('label', {}, h('input', { type: 'checkbox', checked: o.post, onchange: e => { o.post = e.target.checked; o.filled = null; render(); } }), ' after week off'),
          h('select', { 'aria-label': `Leave status for ${o.id}`, onchange: e => { o.leave = e.target.value; o.filled = null; render(); } },
            ...[['none', 'No leave'], ['rejected', 'Leave rejected'], ['approved', 'Leave approved']].map(([v, t]) => h('option', { value: v, selected: o.leave === v }, t)))),
        h('div', {}, h('div', { class: 'risk' }, bar), val),
        h('div', {}, flag ? h('button', { type: 'button', class: 'lb lb--go', onclick: () => arrange(o) }, 'Arrange') : o.filled ? h('span', { class: 'k' }, o.filled) : null));
      list.append(row);
      requestAnimationFrame(() => { bar.style.width = (r === null || o.filled ? 0 : r * 100) + '%'; bar.style.backgroundPosition = `${(r || 0) * 100}% 0`; });
    });
  };
  const arrange = o => {
    panel.textContent = '';
    const ranked = pool.map(c => ({ ...c, s: c.av * .6 + (1 - c.ot) * .4 })).sort((a, b) => b.s - a.s);
    panel.append(h('div', { class: 'arrange' }, h('h5', {}, `Ranked backfill for ${o.id}`), h('p', { class: 'note', style: 'margin:.2rem 0 .6rem' }, 'Ranked by availability and overtime load. The planner approves; the model never decides alone.'),
      ...ranked.map((c, i) => h('div', { class: 'cand' }, h('b', { style: 'color:#fff' }, i + 1), h('span', {}, c.n, h('span', { class: 'k', style: 'margin-left:.6rem' }, `avail ${Math.round(c.av * 100)}% · OT ${Math.round(c.ot * 100)}%`)),
        h('div', { class: 'bar' }, h('i', { style: `width:${c.s * 100}%` })), h('button', { type: 'button', class: 'lb', onclick: () => { o.filled = c.n; panel.textContent = ''; render(); } }, 'Approve')))));
    panel.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
  };
  host.append(
    h('p', {}, 'Each operator gets an absence-risk score from recent absences, shift-pattern position, rejected leave and festival calendars. An approved leave always overrides the score. Flagged rows offer ranked backfill.'),
    h('div', { class: 'row', style: 'margin:1rem 0' }, festBtn, h('span', { class: 'k' }, 'Toggle factors to watch scores move')),
    list, panel, h('p', { class: 'note' }, 'Toy scoring for illustration only. It is not the production XGBoost model and uses no real data.'));
  render();
}

/* 3. Geofenced punch: drag the operator; a QR punch is only accepted inside the fence */
function geofence(host) {
  const W = 600, H = 340, C = { x: 300, y: 170 };
  let r = 105, pos = { x: 80, y: 280 }, present = 0;
  const circle = sv('circle', { class: 'fence', cx: C.x, cy: C.y }), dot = sv('g', { class: 'op-dot', tabindex: 0, role: 'application', 'aria-label': 'Operator position. Drag, or use arrow keys to move.' },
    sv('circle', { r: 20, fill: 'rgba(127,214,255,.2)' }), sv('circle', { r: 9, fill: '#7fd6ff', stroke: '#fff', 'stroke-width': 2 }));
  const svg = sv('svg', { class: 'map', viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': 'Terminal map with geofence' },
    sv('rect', { x: 215, y: 100, width: 170, height: 140, rx: 10, fill: 'rgba(255,255,255,.06)', stroke: 'rgba(255,255,255,.25)' }),
    sv('text', { class: 'txt', x: 300, y: 92, 'text-anchor': 'middle' }, 'TERMINAL'), circle,
    sv('rect', { x: 288, y: 158, width: 24, height: 24, rx: 4, fill: '#0b1220', stroke: '#7fd6ff' }), sv('text', { class: 'txt', x: 300, y: 205, 'text-anchor': 'middle' }, 'GATE QR'), dot);
  const status = h('div', { class: 'status', 'aria-live': 'polite' }), log = h('div', { class: 'log', 'aria-live': 'polite' });
  const presentEl = h('b', {}, '0'), plannedEl = h('b', {}, '48');
  const routes = ['Mobile check-in', 'QR gate scan', 'Kiosk / back-office', 'Confirmation approval', 'Regularisation approval', 'Auto-detect no-shows'].map(t => h('li', {}, t));
  const dist = () => Math.hypot(pos.x - C.x, pos.y - C.y), inside = () => dist() <= r;
  const draw = () => {
    circle.setAttribute('r', r); dot.setAttribute('transform', `translate(${pos.x} ${pos.y})`);
    const i = inside(); status.className = 'status ' + (i ? 'in' : 'out');
    status.textContent = i ? `Inside geofence (${Math.round(dist())} of ${r} units from gate). Punch accepted.` : `Outside geofence (${Math.round(dist())} units, limit ${r}). Punch rejected.`;
  };
  const say = (t, cls = '') => { log.prepend(h('div', { class: cls }, h('span', { class: 'tm' }, new Date().toLocaleTimeString([], { hour12: false }) + ' '), t)); };
  const punch = () => {
    if (inside()) { present++; countTo(presentEl, present); routes[1].classList.add('on'); say('QR gate scan accepted. Dashboard updated live.', 'ok'); }
    else { svg.classList.remove('shake'); void svg.getBoundingClientRect(); svg.classList.add('shake'); say('Punch rejected: outside the terminal geofence.', 'no'); }
  };
  const move = e => { const b = svg.getBoundingClientRect(); pos = { x: clamp((e.clientX - b.left) / b.width * W, 14, W - 14), y: clamp((e.clientY - b.top) / b.height * H, 14, H - 14) }; draw(); };
  dot.addEventListener('pointerdown', e => { dot.setPointerCapture(e.pointerId); dot.addEventListener('pointermove', move); });
  dot.addEventListener('pointerup', () => dot.removeEventListener('pointermove', move));
  dot.addEventListener('keydown', e => { const d = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key]; if (d) { e.preventDefault(); pos = { x: clamp(pos.x + d[0], 14, W - 14), y: clamp(pos.y + d[1], 14, H - 14) }; draw(); } });
  host.append(h('p', {}, 'Every punch is tied to a place. Drag the operator toward the terminal gate and try to punch in from outside and inside the fence.'),
    h('div', { class: 'grid2', style: 'margin-top:1rem' },
      h('div', {}, svg, h('label', { class: 'k', style: 'display:block;margin-top:.8rem' }, 'Geofence radius', h('input', { type: 'range', min: 50, max: 150, value: r, oninput: e => { r = +e.target.value; draw(); } }))),
      h('div', { style: 'display:grid;gap:.8rem;align-content:start' }, status,
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'lb lb--go', onclick: punch }, 'Scan QR & punch in'), h('button', { type: 'button', class: 'lb', onclick: () => { pos = { x: 80, y: 280 }; draw(); } }, 'Reset position')),
        h('div', { class: 'stat-row', style: 'grid-template-columns:1fr 1fr' }, h('div', { class: 'tile' }, h('span', { class: 'k' }, 'Planned'), plannedEl), h('div', { class: 'tile good' }, h('span', { class: 'k' }, 'Present'), presentEl)),
        h('div', {}, h('span', { class: 'k' }, 'Six ways attendance reaches the record'), h('ul', { class: 'routes', style: 'padding:0;margin-top:.5rem' }, ...routes)), log)),
    h('p', { class: 'note' }, 'Conceptual map and made-up counts.'));
  draw();
}

/* 4. Gap simulator: absences become gaps unless a standby pool backfills them */
function gapSim(host) {
  const N = 48, grid = h('div', { class: 'gsim-grid', 'aria-hidden': 'true' });
  const cells = Array.from({ length: N }, () => grid.appendChild(h('i')));
  const rnd = rng(7), order = [...Array(N).keys()].sort(() => rnd() - .5);
  const stats = { absent: h('b', {}, '0'), fill: h('b', {}, '0'), gap: h('b', {}, '0'), pct: h('b', {}, '100%') };
  const rate = h('input', { type: 'range', min: 0, max: 30, value: 10 }), pool = h('input', { type: 'range', min: 0, max: 12, value: 6 });
  const rv = h('span', { class: 'k' }), pv = h('span', { class: 'k' });
  const run = () => {
    const a = Math.round(N * rate.value / 100), f = Math.min(a, +pool.value), g = a - f;
    rv.textContent = rate.value + '%'; pv.textContent = pool.value;
    cells.forEach(c => { c.className = ''; }); order.slice(0, a).forEach((ix, i) => { cells[ix].className = i < f ? 'b' : 'g'; });
    countTo(stats.absent, a); countTo(stats.fill, f); countTo(stats.gap, g); countTo(stats.pct, (N - g) / N * 100, { fmt: v => Math.round(v) + '%' });
  };
  rate.addEventListener('input', run); pool.addEventListener('input', run);
  host.append(h('p', {}, 'One 48-operator shift. Raise the absence rate and see where gaps open; a bigger standby pool closes them.'),
    h('div', { class: 'grid2', style: 'margin-top:1rem' },
      h('div', { style: 'display:grid;gap:1rem;align-content:start' }, h('label', { class: 'k' }, 'Absence rate ', rv, rate), h('label', { class: 'k' }, 'Standby pool ', pv, pool),
        h('div', { class: 'stat-row', style: 'grid-template-columns:1fr 1fr' }, h('div', { class: 'tile' }, h('span', { class: 'k' }, 'Absent'), stats.absent), h('div', { class: 'tile' }, h('span', { class: 'k' }, 'Backfilled'), stats.fill),
          h('div', { class: 'tile bad' }, h('span', { class: 'k' }, 'Open gaps'), stats.gap), h('div', { class: 'tile good' }, h('span', { class: 'k' }, 'Shift manned'), stats.pct)),
        h('div', { class: 'legend' }, h('span', {}, h('i', { style: 'background:rgba(91,140,255,.7)' }), 'Present'), h('span', {}, h('i', { style: 'background:#7fd6ff' }), 'Backfilled'), h('span', {}, h('i', { style: 'border:1.5px dashed #ff7b7b' }), 'Open gap'))),
      grid),
    h('p', { class: 'note' }, 'Made-up numbers; not ShiftEaze production data.'));
  run();
}

/* 5. Autonomous AI calling: trigger, call, verified webhook, record */
function aiCalling(host) {
  const SC = [
    ['Shift Confirmation Reminder', 'Shift confirmation', { ans: 'Confirmed', dec: 'Declined', none: 'No response' }],
    ['Punch-In Reminder', 'Reminder', { ans: 'Delivered', dec: 'Delivered', none: 'Not delivered' }],
    ['Absence Prediction Priority Call', 'Absence-risk call', { ans: 'Acknowledged', dec: 'Declined to attend', none: 'No answer, escalate' }],
    ['Overtime Request', 'OT offer', { ans: 'Accepted', dec: 'Declined', none: 'No response' }],
    ['Punch-Out Reminder', 'Reminder', { ans: 'Delivered', dec: 'Delivered', none: 'Not delivered' }],
  ];
  let sc = 0, lang = 'EN', outcome = 'ans', busy = false;
  const nodes = [['Scheduled trigger', 'ir.cron per scenario'], ['AI voice call', 'EN / HI / GU'], ['Webhook', 'HMAC-verified'], ['Record updated', 'attendance + shift']].map(([a, b]) => h('div', { class: 'node' }, h('b', {}, a), h('span', {}, b)));
  const wave = h('div', { class: 'wave', 'aria-hidden': 'true' }, ...Array.from({ length: 24 }, (_, n) => h('i', { style: `--n:${n}` })));
  const log = h('div', { class: 'log', 'aria-live': 'polite' }), rec = h('dl', { class: 'rec' });
  const flow = h('div', { class: 'flow' }, ...nodes);
  const group = (items, cur, set) => items.map(([k, t]) => h('button', { type: 'button', class: 'lb', 'aria-pressed': String(k === cur()), onclick: e => { if (busy) return; set(k); $$('button', e.target.parentElement).forEach(b => b.setAttribute('aria-pressed', String(b === e.target))); showRec(null); } }, t));
  const showRec = val => { rec.textContent = ''; [['Operator', 'OP-02'], ['Scenario', SC[sc][0]], ['Language', lang], [SC[sc][1], val || 'Pending']].forEach(([k, v]) => rec.append(h('dt', {}, k), h('dd', {}, v))); };
  const say = (t, cls = '') => log.prepend(h('div', { class: cls }, h('span', { class: 'tm' }, new Date().toLocaleTimeString([], { hour12: false }) + ' '), t));
  const wait = ms => new Promise(r => setTimeout(r, reduced() ? 0 : ms));
  const run = async () => {
    if (busy) return; busy = true; go.disabled = true; nodes.forEach(n => n.className = 'node'); log.textContent = '';
    nodes[0].classList.add('on'); say(`Cron fires: ${SC[sc][0]}`); await wait(800);
    nodes[0].className = 'node done'; nodes[1].classList.add('on'); flow.classList.add('calling'); say(`Voice call placed in ${lang}`); await wait(1500);
    flow.classList.remove('calling'); nodes[1].className = 'node done'; nodes[2].classList.add('on');
    say(outcome === 'none' ? 'Call ended: no answer' : `Call ended: operator ${outcome === 'ans' ? 'answered' : 'declined'}`); await wait(800);
    say('Outcome received; signature verified', 'ok'); nodes[2].className = 'node done'; nodes[3].classList.add('on'); await wait(700);
    nodes[3].className = 'node done'; const v = SC[sc][2][outcome]; showRec(v); say(`Record updated: ${SC[sc][1]} = ${v}`, 'ok'); busy = false; go.disabled = false;
  };
  const go = h('button', { type: 'button', class: 'lb lb--go', onclick: run }, 'Run scenario');
  host.append(h('p', {}, 'The call a supervisor would have placed, triggered by the platform and written back to the record automatically. Pick a scenario, a language and an outcome, then run it.'),
    h('div', { style: 'display:grid;gap:.8rem;margin:1rem 0' },
      h('div', { class: 'row' }, h('span', { class: 'k' }, 'Scenario'), ...group(SC.map((s, i) => [i, s[0]]), () => sc, k => { sc = k; })),
      h('div', { class: 'row' }, h('span', { class: 'k' }, 'Language'), ...group([['EN', 'English'], ['HI', 'Hindi'], ['GU', 'Gujarati']], () => lang, k => { lang = k; }),
        h('span', { class: 'k', style: 'margin-left:1rem' }, 'Outcome'), ...group([['ans', 'Answered'], ['dec', 'Declined'], ['none', 'No answer']], () => outcome, k => { outcome = k; })), h('div', { class: 'row' }, go)),
    flow, wave, h('div', { class: 'grid2', style: 'margin-top:1rem' }, h('div', { class: 'tile' }, h('span', { class: 'k' }, 'Operator record'), rec), h('div', { class: 'tile' }, h('span', { class: 'k' }, 'Event log'), log)),
    h('p', { class: 'note' }, 'Flow follows the product description. No call audio or scripts are simulated.'));
  showRec(null);
}

export function mountShiftEaze(host) {
  const tabs = subTabs([
    { label: 'Cycle builder', build: cycleBuilder }, { label: 'Absence risk & backfill', build: riskLab }, { label: 'Geofenced punch', build: geofence },
    { label: 'Gap simulator', build: gapSim }, { label: 'AI calling', build: aiCalling },
  ], { label: 'ShiftEaze lab tools' });
  host.textContent = '';
  host.append(consoleShell('shifteaze · operations lab', tabs.list, tabs.wrap));
}
