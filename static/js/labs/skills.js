// Sample diagrams for the Capabilities section. Everything here is generic and made up:
// no real project names, data or screens appear in any diagram.
import { h, sv, $, $$, consoleShell } from './util.js';

let seq = 0;
const an = el => { el.classList.add('an'); el.style.setProperty('--d', `${seq++ * 55}ms`); return el; };
const T = (x, y, s, c = 't', a = 'start') => sv('text', { x, y, class: c, 'text-anchor': a }, s);
const R = (x, y, w, hh, c = 'bx', rx = 10) => sv('rect', { x, y, width: w, height: hh, rx, class: c });
const L = (x1, y1, x2, y2, arrow = true, c = 'ln') => sv('line', { x1, y1, x2, y2, class: c, 'marker-end': arrow ? 'url(#sk-ar)' : null });
const G = (...k) => sv('g', {}, ...k);
const box = (x, y, w, hh, title, sub, c = 'bx') => an(G(R(x, y, w, hh, c), T(x + w / 2, y + hh / 2 + (sub ? -2 : 4), title, 't', 'middle'), sub ? T(x + w / 2, y + hh / 2 + 12, sub, 's', 'middle') : null));
const dia = (cx, cy, w, hh, title) => an(G(sv('polygon', { points: `${cx},${cy - hh / 2} ${cx + w / 2},${cy} ${cx},${cy + hh / 2} ${cx - w / 2},${cy}`, class: 'bx hl' }), T(cx, cy + 4, title, 't', 'middle')));
const lab = (x, y, s) => an(T(x, y, s, 's', 'middle'));
const chip = (x, y, w, s, c) => an(G(R(x, y, w, 20, 'chip-' + c, 10), T(x + w / 2, y + 14, s, 'cs', 'middle')));
const head = (x, y, s) => an(T(x, y, s, 'k'));

// ---------- Product ----------
function discovery(add) {
  const cols = [['Interviews', ['Operators', 'Planners', 'Terminal heads']], ['Pain points', ['Rosters rebuilt by hand', 'No live attendance view', 'Leave tracked on calls']], ['Opportunities', ['Reusable roster cycles', 'One live attendance record', 'Digital leave with balances']]];
  cols.forEach(([t, items], c) => { const x = 20 + c * 215; add(head(x, 30, t.toUpperCase())); items.forEach((s, i) => { add(box(x, 50 + i * 70, 190, 46, s, null, c === 2 ? 'bx hl' : 'bx')); if (c < 2) add(an(L(x + 190, 73 + i * 70, x + 215, 73 + i * 70))); }); });
  add(an(T(320, 300, 'Each pain point maps to one product bet', 's', 'middle')));
}
function actor(add, x, y, name) { add(an(G(sv('circle', { cx: x, cy: y - 18, r: 8, class: 'bx' }), L(x, y - 10, x, y + 10, false), L(x - 12, y - 4, x + 12, y - 4, false), L(x, y + 10, x - 9, y + 26, false), L(x, y + 10, x + 9, y + 26, false), T(x, y + 44, name, 't', 'middle')))); }
function usecase(add) {
  add(R(115, 14, 410, 312, 'bx dim', 14)); add(T(320, 34, 'Rostering system', 'k', 'middle'));
  actor(add, 50, 150, 'Operator'); actor(add, 590, 120, 'Planner'); actor(add, 590, 262, 'Admin');
  const oval = (cx, cy, s) => an(G(sv('ellipse', { cx, cy, rx: 82, ry: 22, class: 'bx hl' }), T(cx, cy + 4, s, 't', 'middle')));
  [['View roster', 80], ['Punch in (geofence)', 150], ['Request leave', 220]].forEach(([s, y]) => { add(oval(215, y, s)); add(an(L(66, 150, 133, y, false))); });
  [['Plan roster', 70], ['Approve leave', 130], ['Review absence risk', 190]].forEach(([s, y]) => { add(oval(425, y, s)); add(an(L(574, 120, 507, y, false))); });
  add(oval(425, 262, 'Configure shifts')); add(an(L(574, 262, 507, 262, false)));
}
function userstory(add) {
  add(R(50, 18, 540, 304, 'bx', 14));
  add(an(T(74, 50, 'US-142 · Absence risk before the shift', 't')));
  add(an(T(74, 84, 'As a planner,', 's')));
  add(an(T(74, 104, "I want to see each operator's absence risk before the shift,", 't')));
  add(an(T(74, 124, 'so that I can arrange backfill early.', 't')));
  add(head(74, 162, 'ACCEPTANCE CRITERIA'));
  ['Risk is shown per operator on the roster calendar', 'An approved leave always overrides the risk', 'Flagged rows offer ranked backfill candidates', 'The planner approves; nothing is auto-assigned'].forEach((s, i) => add(an(G(T(74, 190 + i * 24, '✓', 'ok'), T(94, 190 + i * 24, s, 't')))));
  add(chip(74, 288, 96, 'Priority: High', 'bad')); add(chip(180, 288, 70, 'Points: 5', 'blue')); add(chip(260, 288, 110, 'Epic: Rostering', 'blue'));
}
function brd(add) {
  add(an(R(24, 16, 220, 308, 'bx', 8)));
  ['1  Objective', '2  Scope', '3  Stakeholders', '4  Functional requirements', '5  Non-functional', '6  Acceptance & sign-off'].forEach((s, i) => { add(an(G(T(40, 50 + i * 46, s, 't'), R(40, 58 + i * 46, 170 - (i % 3) * 30, 6, 'bar', 3), R(40, 70 + i * 46, 120 + (i % 2) * 40, 6, 'bar', 3)))); });
  add(head(280, 34, 'FUNCTIONAL REQUIREMENTS'));
  add(an(G(R(280, 44, 340, 26, 'bx hl', 6), T(292, 61, 'ID', 's'), T(344, 61, 'Requirement', 's'), T(570, 61, 'Priority', 's'))));
  [['FR-01', 'Build a shift cycle once, reuse it', 'High'], ['FR-02', 'Accept punches only inside the geofence', 'High'], ['FR-03', 'Leave approval with live balance', 'Medium'], ['FR-04', 'Shared filters across dashboards', 'Medium'], ['FR-05', 'Audit trail on every roster change', 'Low']].forEach(([id, r, p], i) => add(an(G(R(280, 76 + i * 44, 340, 38, 'bx', 6), T(292, 99 + i * 44, id, 'k'), T(344, 99 + i * 44, r, 't'), T(570, 99 + i * 44, p, 's')))));
}
function mockup(add) {
  add(an(R(250, 12, 140, 316, 'bx', 24)));
  add(an(T(266, 44, 'Today', 't')));
  add(an(G(R(262, 54, 116, 72, 'bx hl', 10), T(272, 76, 'Day shift', 't'), T(272, 94, '06:00 – 14:00', 's')))); add(chip(272, 100, 70, 'Confirmed', 'ok'));
  add(chip(262, 136, 116, '● Inside geofence', 'ok'));
  add(an(G(R(262, 168, 116, 40, 'btn', 20), T(320, 193, 'Punch in (QR)', 't', 'middle'))));
  [0, 1].forEach(i => add(an(G(R(262, 220 + i * 32, 116, 26, 'bx', 8), R(270, 229 + i * 32, 60, 6, 'bar', 3)))));
  ['Roster', 'Leave', 'Help'].forEach((s, i) => add(an(T(282 + i * 38, 312, s, 's', 'middle'))));
  add(an(G(T(40, 90, 'Shift card shows its', 's'), T(40, 104, 'confirmation state', 's')))); add(an(L(160, 94, 258, 86)));
  add(an(G(T(40, 220, 'Tabs for roster,', 's'), T(40, 234, 'leave and helpdesk', 's')))); add(an(L(150, 238, 246, 308)));
  add(an(G(T(440, 186, 'Punch is accepted only', 's'), T(440, 200, 'inside the fence', 's')))); add(an(L(436, 192, 384, 190)));
}
function prio(add) {
  add(R(80, 24, 480, 264, 'bx dim', 6));
  add(an(L(320, 24, 320, 288, false, 'ln dash'))); add(an(L(80, 156, 560, 156, false, 'ln dash')));
  [['Quick wins', 90, 46], ['Big bets', 330, 46], ['Fill-ins', 90, 278], ['Reconsider', 330, 278]].forEach(([s, x, y]) => add(an(T(x, y, s.toUpperCase(), 'k'))));
  add(an(T(80, 312, 'Effort  →', 's'))); add(an(T(20, 22, 'Impact ↑', 's')));
  [[1, 'Shift reminders', 150, 100], [2, 'Auto-rostering', 420, 90], [3, 'Dark theme', 160, 226], [4, 'Custom report builder', 400, 232]].forEach(([n, s, x, y]) => add(an(G(sv('circle', { cx: x, cy: y, r: 13, class: 'bx hl' }), T(x, y + 4, String(n), 't', 'middle'), T(x + 22, y + 4, s, 't')))));
}
function roadmap(add) {
  ['Q1', 'Q2', 'Q3', 'Q4'].forEach((q, i) => { add(an(L(140 + i * 120, 40, 140 + i * 120, 290, false, 'ln dash'))); add(an(T(200 + i * 120, 32, q, 'k', 'middle'))); });
  [['Phase 1 · Pilot', 140, 150, 66, 'Rostering + attendance'], ['Phase 2 · Scale', 260, 200, 126, 'Leave + dashboards'], ['Phase 3 · Intelligence', 380, 240, 186, 'Prediction + AI calling']].forEach(([n, x, w, y, s]) => { add(an(T(20, y + 26, n, 't'))); add(an(G(R(x, y, w, 40, 'bx hl', 10), T(x + w / 2, y + 25, s, 't', 'middle')))); });
  [['UAT', 280], ['Go-live', 420], ['Review', 560]].forEach(([s, x]) => add(an(G(sv('polygon', { points: `${x},262 ${x + 9},271 ${x},280 ${x - 9},271`, class: 'dia' }), T(x, 300, s, 's', 'middle')))));
}
function uat(add) {
  add(head(30, 30, 'TEST CASE')); add(head(470, 30, 'STATUS'));
  [['TC-01', 'Punch accepted inside the geofence', 'Pass', 'ok'], ['TC-02', 'Punch rejected outside the geofence', 'Pass', 'ok'], ['TC-03', 'Overlapping leave is blocked', 'Retest', 'warn'], ['TC-04', 'Roster export to spreadsheet', 'Pass', 'ok']].forEach(([id, s, st, c], i) => add(an(G(R(24, 44 + i * 52, 592, 42, 'bx', 8), T(40, 70 + i * 52, id, 'k'), T(100, 70 + i * 52, s, 't'), chip(470, 54 + i * 52, 70, st, c)))));
  add(an(G(R(24, 262, 592, 8, 'bar', 4), R(24, 262, 444, 8, 'bar fill', 4))));
  add(an(T(24, 296, '3 of 4 passed · 1 fixed and being retested', 't'))); add(an(T(616, 296, 'Sign-off pending', 's', 'end')));
}
// ---------- Data & AI ----------
function python(add) {
  add(head(40, 14, 'ROC CURVE (SAMPLE)'));
  add(R(40, 40, 250, 250, 'bx dim', 4)); add(an(L(40, 290, 290, 40, false, 'ln dash')));
  add(an(sv('path', { d: 'M40 290 L40 290 C 52 170, 96 94, 290 40 L290 290 Z', class: 'area' })));
  add(sv('path', { d: 'M40 290 C 52 170, 96 94, 290 40', class: 'ln draw', pathLength: 1 }));
  add(an(T(165, 312, 'False positive rate →', 's', 'middle'))); add(an(T(40, 33, 'True positive ↑', 's')));
  add(head(340, 28, 'FEATURE IMPORTANCE (SAMPLE)'));
  [['Recent absences', .92], ['Rejected leave', .72], ['Day after week off', .58], ['Festival calendar', .42], ['Tenure', .24]].forEach(([s, v], i) => add(an(G(T(340, 74 + i * 48, s, 't'), R(340, 84 + i * 48, 270, 10, 'bar', 5), R(340, 84 + i * 48, 270 * v, 10, 'bar fill', 5)))));
}
const KW = /\b(SELECT|FROM|WHERE|AND|GROUP BY|ORDER BY|DESC|LIMIT|COUNT|AS)\b/g;
function sql(add) {
  add(R(20, 20, 360, 300, 'bx', 12));
  const code = ['SELECT operator_id,', '       COUNT(*) AS absences', 'FROM   attendance', "WHERE  status = 'ABSENT'", '  AND  work_date >= CURRENT_DATE - 30', 'GROUP BY operator_id', 'ORDER BY absences DESC', 'LIMIT  5;'];
  code.forEach((ln, i) => { const t = sv('text', { x: 36, y: 56 + i * 30, class: 'code' }); let last = 0; for (const m of ln.matchAll(KW)) { t.append(document.createTextNode(ln.slice(last, m.index))); t.append(sv('tspan', { class: 'kw' }, m[0])); last = m.index + m[0].length; } t.append(document.createTextNode(ln.slice(last))); add(an(t)); });
  add(head(410, 34, 'RESULT (SAMPLE ROWS)'));
  add(an(G(R(400, 44, 220, 28, 'bx hl', 6), T(414, 63, 'operator_id', 's'), T(600, 63, 'absences', 's', 'end'))));
  [['OP-104', 5], ['OP-221', 4], ['OP-087', 4], ['OP-310', 3], ['OP-142', 2]].forEach(([a, b], i) => add(an(G(R(400, 78 + i * 38, 220, 32, 'bx', 6), T(414, 99 + i * 38, a, 'code2'), T(600, 99 + i * 38, String(b), 'code2', 'end')))));
}
function bi(add) {
  [['Manned', '92%'], ['Absent', '6%'], ['Leave pending', '14']].forEach(([k, v], i) => add(an(G(R(24 + i * 204, 20, 192, 70, 'bx hl', 12), T(40 + i * 204, 44, k, 's'), T(40 + i * 204, 76, v, 'big')))));
  add(head(24, 120, 'MANNING BY DAY')); [78, 86, 92, 88, 95, 90, 84].forEach((v, i) => add(an(R(34 + i * 38, 290 - v * 1.5, 24, v * 1.5, 'bar fill', 4))));
  add(head(340, 120, 'ABSENCE TREND')); add(R(340, 130, 280, 160, 'bx dim', 6));
  add(sv('polyline', { points: '350,250 400,226 450,240 500,196 550,214 610,160', class: 'ln draw', fill: 'none', pathLength: 1 }));
  [[350, 250], [400, 226], [450, 240], [500, 196], [550, 214], [610, 160]].forEach(([x, y]) => add(an(sv('circle', { cx: x, cy: y, r: 4, class: 'dot' }))));
}
function heat(add) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], rows = ['Site A', 'Site B', 'Site C', 'Site D', 'Site E'];
  days.forEach((d, i) => add(an(T(130 + i * 70, 40, d, 's', 'middle')))); const v = (r, c) => ((r * 5 + c * 3 + (r * c) % 4) % 10) / 10;
  rows.forEach((s, r) => { add(an(T(24, 78 + r * 46, s, 't'))); days.forEach((d, c) => { const k = v(r, c); add(an(sv('rect', { x: 96 + c * 70, y: 52 + r * 46, width: 62, height: 38, rx: 7, fill: `rgba(${Math.round(91 + k * 164)},${Math.round(140 - k * 20)},${Math.round(255 - k * 150)},${.25 + k * .65})` }))); }); });
  add(an(T(24, 300, 'Absence rate by site and weekday (sample)', 's'))); add(an(G(R(430, 288, 190, 8, 'legend', 4), T(430, 316, 'low', 's'), T(620, 316, 'high', 's', 'end'))));
}
function sheet(add) {
  add(an(G(R(20, 16, 600, 28, 'bx hl', 6), T(32, 35, 'fx', 'k'), T(64, 35, '=COUNTIFS(C:C,"Absent",B:B,B2)', 'code2'))));
  const cols = ['A', 'B', 'C', 'D']; cols.forEach((c, i) => add(an(G(R(60 + i * 140, 54, 138, 22, 'bx hl', 0), T(129 + i * 140, 70, c, 's', 'middle')))));
  const data = [['OP-104', 'Day', 'Absent', '3'], ['OP-221', 'Night', 'Present', '1'], ['OP-087', 'Day', 'Absent', '2'], ['OP-310', 'Night', 'Present', '0'], ['OP-142', 'Day', 'Absent', '4'], ['OP-055', 'Day', 'Present', '1']];
  data.forEach((r, i) => { add(an(G(R(20, 78 + i * 28, 40, 26, 'bx hl', 0), T(40, 96 + i * 28, String(i + 2), 's', 'middle')))); r.forEach((c, j) => add(an(G(R(60 + j * 140, 78 + i * 28, 138, 26, j === 3 && i === 2 ? 'bx sel' : 'bx', 0), T(72 + j * 140, 96 + i * 28, c, 't'))))); });
  add(an(T(20, 280, 'Pivot summary: absences by shift  →  Day 9 · Night 1', 's')));
}
function rec(add) {
  ['Signals', 'Score', 'Rank', 'Recommend'].forEach((s, i) => { add(box(20 + i * 156, 30, 130, 50, s, ['attendance, leave', 'risk 0–1', 'availability + load', 'planner approves'][i], i === 3 ? 'bx hl' : 'bx')); if (i < 3) add(an(L(150 + i * 156, 55, 176 + i * 156, 55))); });
  add(head(24, 130, 'RANKED BACKFILL CANDIDATES (SAMPLE)'));
  [['Standby A', .92], ['Standby C', .78], ['Standby B', .64], ['Standby D', .5]].forEach(([s, v], i) => add(an(G(T(24, 166 + i * 46, `${i + 1}  ${s}`, 't'), R(180, 154 + i * 46, 340, 14, 'bar', 7), R(180, 154 + i * 46, 340 * v, 14, 'bar fill', 7), T(616, 166 + i * 46, v.toFixed(2), 'code2', 'end')))));
}
function algo(add) {
  add(box(10, 150, 110, 44, 'Operator on roster', null)); add(an(L(120, 172, 165, 172)));
  add(dia(225, 172, 120, 84, 'Leave approved?')); add(an(L(225, 130, 225, 74))); add(lab(212, 108, 'Yes')); add(box(165, 36, 120, 38, 'Excluded', 'from risk list'));
  add(an(L(285, 172, 355, 172))); add(lab(320, 164, 'No'));
  add(dia(415, 172, 120, 84, 'Risk ≥ limit?')); add(an(L(415, 130, 415, 74))); add(lab(402, 108, 'Yes')); add(box(355, 36, 120, 38, 'Flag + suggest', 'ranked backfill', 'bx hl'));
  add(an(L(475, 172, 520, 172))); add(lab(498, 164, 'No')); add(box(520, 150, 100, 44, 'No action', null));
  add(an(T(320, 300, 'Rules first, model second: a hard rule always beats a score', 's', 'middle')));
}
// ---------- Domains ----------
function saas(add) {
  ['Site A', 'Site B', 'Site C'].forEach((s, i) => { add(box(40 + i * 200, 20, 160, 40, s, 'tenant')); add(an(L(120 + i * 200, 60, 120 + i * 200, 94))); });
  add(an(R(40, 96, 560, 76, 'bx', 12))); add(an(T(56, 116, 'APPLICATION', 'k')));
  ['Roster', 'Attendance', 'Leave', 'Analytics'].forEach((s, i) => add(box(56 + i * 136, 126, 124, 34, s, null, 'bx hl')));
  add(box(40, 192, 560, 50, 'Shared platform', 'auth · configuration · notifications · audit log')); add(an(L(320, 172, 320, 192, false)));
  add(box(40, 264, 560, 50, 'Database', 'every row carries a tenant_id', 'bx hl')); add(an(L(320, 242, 320, 264, false)));
}
function workforce(add) {
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((d, i) => add(an(T(120 + i * 72, 34, d, 's', 'middle'))));
  const pat = ['D', 'D', 'N', 'N', 'O', 'O']; for (let r = 0; r < 6; r++) { add(an(T(24, 76 + r * 40, `OP-0${r + 1}`, 't'))); for (let c = 0; c < 7; c++) { const s = pat[(c + r * 2) % 6]; add(an(G(R(88 + c * 72, 52 + r * 40, 64, 32, 'cell-' + s, 8), T(120 + c * 72, 73 + r * 40, s, 't', 'middle')))); } }
  [['D', 'Day'], ['N', 'Night'], ['O', 'Off']].forEach(([k, s], i) => add(an(G(R(24 + i * 96, 300, 20, 14, 'cell-' + k, 4), T(50 + i * 96, 311, s, 's')))));
}
function supply(add) {
  add(an(T(320, 40, 'Every step in the chain needs a person on shift', 's', 'middle')));
  [['Vessel', ''], ['Quay crane', 'QC operator'], ['Prime mover', 'Driver'], ['Yard stack', 'RTG operator'], ['Gate', 'Gate operator']].forEach(([s, p], i) => { add(box(14 + i * 126, 110, 110, 64, s, null, i === 0 ? 'bx dim' : 'bx hl')); if (i < 4) add(an(L(124 + i * 126, 142, 140 + i * 126, 142))); if (p) add(chip(24 + i * 126, 192, 90, p, 'blue')); });
  add(an(T(320, 270, 'A gap at any step stalls everything after it', 't', 'middle')));
}
function fintech(add) {
  ['Investor A', 'Investor B', 'Investor C'].forEach((s, i) => { add(box(20, 40 + i * 70, 120, 46, s, null)); add(an(L(140, 63 + i * 70, 220, 140))); });
  add(box(220, 106, 140, 68, 'LLP', 'holds the asset', 'bx hl')); add(an(L(360, 140, 440, 140))); add(box(440, 106, 170, 68, 'Property asset', 'asset-holding tranche'));
  add(head(20, 262, 'PROPORTIONAL OWNERSHIP (SAMPLE)'));
  [['A 40%', 0, 192, 'fill'], ['B 35%', 192, 168, 'fill2'], ['C 25%', 360, 120, 'fill3']].forEach(([s, x, w, c]) => add(an(G(R(20 + x, 274, w - 4, 24, 'bar ' + c, 6), T(26 + x, 291, s, 't')))));
}
function dt(add) {
  [['Paper & Excel', 'manual, per site'], ['Digitised', 'one system of record'], ['Connected', 'live data, shared views'], ['Predictive', 'models guide decisions']].forEach(([s, sub], i) => add(an(G(R(24 + i * 150, 290 - (70 + i * 60), 140, 70 + i * 60, i === 3 ? 'bx hl' : 'bx', 10), T(34 + i * 150, 290 - (70 + i * 60) + 28, s, 't'), T(34 + i * 150, 290 - (70 + i * 60) + 46, sub, 's')))));
  add(an(L(40, 312, 600, 312))); add(an(T(320, 330, 'Maturity →', 's', 'middle')));
}
// ---------- Leadership ----------
function stakeholder(add) {
  add(R(80, 24, 480, 264, 'bx dim', 6)); add(an(L(320, 24, 320, 288, false, 'ln dash'))); add(an(L(80, 156, 560, 156, false, 'ln dash')));
  [['KEEP SATISFIED', 90, 46], ['MANAGE CLOSELY', 330, 46], ['MONITOR', 90, 278], ['KEEP INFORMED', 330, 278]].forEach(([s, x, y]) => add(an(T(x, y, s, 'k'))));
  add(an(T(80, 312, 'Interest  →', 's'))); add(an(T(20, 22, 'Power ↑', 's')));
  [['CXO', 500, 80, 'hl'], ['Terminal heads', 420, 120, 'hl'], ['IT team', 190, 110, ''], ['Planners', 440, 226, ''], ['Operators', 380, 258, ''], ['Vendors', 170, 240, '']].forEach(([s, x, y, c]) => add(an(G(sv('circle', { cx: x, cy: y, r: 9, class: 'bx ' + c }), T(x, y - 16, s, 't', 'middle')))));
}
function change(add) {
  const ph = [['Pilot', 40], ['Training', 190], ['Rollout', 330], ['Habit', 470]]; ph.forEach(([s, x], i) => { add(an(R(x, 40, 130, 244, i % 2 ? 'bx dim' : 'bx', 6))); add(an(T(x + 65, 60, s.toUpperCase(), 'k', 'middle'))); });
  add(sv('path', { d: 'M40 270 C 200 270, 260 250, 330 170 S 520 70, 600 62', class: 'ln draw', fill: 'none', pathLength: 1 }));
  [[100, 268], [255, 238], [395, 130], [535, 74]].forEach(([x, y]) => add(an(sv('circle', { cx: x, cy: y, r: 6, class: 'dot' }))));
  add(an(T(20, 310, 'Adoption ↑ over time →', 's')));
}
function cxo(add) {
  [['PROBLEM', 'Rosters break at shift start', 20, 20, 290], ['ASK', 'Approve a pilot at one site', 330, 20, 290], ['IMPACT', 'Fewer gaps, live visibility', 20, 116, 290], ['RISK', 'Operator adoption', 330, 116, 290], ['TIMELINE', 'Pilot  →  UAT  →  phased rollout', 20, 212, 600]].forEach(([k, s, x, y, w], i) => add(an(G(R(x, y, w, 82, i === 1 ? 'bx hl' : 'bx', 12), T(x + 16, y + 30, k, 'k'), T(x + 16, y + 58, s, 'big2')))));
}
function jira(add) {
  [['To do', [['RS-31', 'Export roster']]], ['In progress', [['RS-27', 'Geofence rule'], ['RS-29', 'Leave balance']]], ['UAT', [['RS-24', 'Shift confirmation']]], ['Done', [['RS-12', 'Auto-rostering'], ['RS-15', 'Dashboards']]]].forEach(([n, cards], c) => {
    add(an(G(R(14 + c * 156, 14, 144, 312, 'bx dim', 10), T(24 + c * 156, 38, n.toUpperCase(), 'k')))); cards.forEach(([id, s], i) => add(an(G(R(24 + c * 156, 54 + i * 62, 124, 52, c === 3 ? 'bx hl' : 'bx', 8), T(34 + c * 156, 74 + i * 62, id, 'k'), T(34 + c * 156, 94 + i * 62, s, 't')))));
  });
}

const D = {
  discovery: ['Discovery map', 'Interviews become pain points, and pain points become product bets.', discovery],
  usecase: ['Use-case diagram', 'Who can do what in the system.', usecase],
  userstory: ['User story with acceptance criteria', 'A story is only done when its criteria are testable.', userstory],
  brd: ['BRD structure and requirements table', 'Requirements are numbered, prioritised and traceable.', brd],
  er: ['Entity-relationship diagram', 'Entities, keys and how they relate.', null],
  workflow: ['Workflow diagram', 'A leave request from submission to roster update.', null],
  mockup: ['UI mockup with annotations', 'A mobile wireframe with design decisions called out.', mockup],
  prio: ['Impact vs effort matrix', 'How features are ranked before they enter a release.', prio],
  roadmap: ['Phased release plan', 'Phases, milestones and the order of delivery.', roadmap],
  uat: ['UAT test board', 'Test cases, results and sign-off status.', uat],
  python: ['Model evaluation (sample)', 'A classifier judged by its ROC curve and the features it relies on.', python],
  sql: ['SQL query and result', 'A question about the data, asked in SQL.', sql],
  bi: ['BI dashboard', 'KPIs, a daily bar view and a trend line.', bi],
  heat: ['Heatmap view', 'Patterns across sites and weekdays at a glance.', heat],
  sheet: ['Spreadsheet analysis', 'Formulas and a pivot over raw records.', sheet],
  rec: ['Recommendation pipeline', 'Signals become a score, a ranking and a suggestion a human approves.', rec],
  algo: ['Decision logic', 'Hard rules and a model threshold working together.', algo],
  saas: ['Multi-tenant SaaS architecture', 'Many sites, one application, one platform.', saas],
  workforce: ['Shift roster grid', 'Day, night and off cycles across operators and days.', workforce],
  supply: ['Port operations chain', 'From vessel to gate, each step is staffed.', supply],
  fintech: ['LLP ownership structure', 'Investments map to proportional ownership in an asset.', fintech],
  dt: ['Digital maturity staircase', 'From paper to predictive, one step at a time.', dt],
  stakeholder: ['Stakeholder map', 'Who needs close management and who needs updates.', stakeholder],
  change: ['Adoption curve', 'Change lands in phases: pilot, training, rollout, habit.', change],
  cxo: ['One-page executive summary', 'Problem, ask, impact, risk and timeline on a single page.', cxo],
  jira: ['Kanban board', 'Delivery tracked from backlog to done.', jira],
};

// ER and workflow need helper layout code of their own
D.er[2] = function er(add) {
  const entity = (x, y, w, name, fields) => { const hh = 28 + fields.length * 17 + 8; return an(G(R(x, y, w, hh, 'bx', 10), sv('rect', { x, y, width: w, height: 24, rx: 10, class: 'hd' }), T(x + 10, y + 17, name, 't'), ...fields.map(([f, k], i) => G(T(x + 10, y + 44 + i * 17, f, 's'), k ? T(x + w - 10, y + 44 + i * 17, k, 'k', 'end') : null)))); };
  add(entity(20, 20, 150, 'Operator', [['id', 'PK'], ['name'], ['role'], ['terminal_id', 'FK']]));
  add(entity(245, 20, 150, 'Roster', [['id', 'PK'], ['operator_id', 'FK'], ['shift_id', 'FK'], ['work_date']]));
  add(entity(470, 20, 150, 'Shift', [['id', 'PK'], ['code'], ['start_time'], ['end_time']]));
  add(entity(245, 190, 150, 'Attendance', [['id', 'PK'], ['roster_id', 'FK'], ['punch_in'], ['punch_out'], ['source']]));
  add(entity(20, 190, 150, 'LeaveRequest', [['id', 'PK'], ['operator_id', 'FK'], ['from_date'], ['to_date'], ['status']]));
  add(an(L(170, 72, 245, 72, false))); add(lab(207, 64, '1 : N')); add(an(L(470, 72, 395, 72, false))); add(lab(432, 64, '1 : N'));
  add(an(L(320, 126, 320, 190, false))); add(lab(346, 164, '1 : 1')); add(an(L(95, 126, 95, 190, false))); add(lab(121, 164, '1 : N'));
};
D.workflow[2] = function workflow(add) {
  add(box(14, 135, 110, 50, 'Leave request', 'in the app')); add(an(L(124, 160, 155, 160)));
  add(dia(215, 160, 120, 84, 'Balance OK?')); add(an(L(275, 160, 306, 160))); add(lab(290, 152, 'Yes'));
  add(box(306, 135, 110, 50, 'Manager review', null)); add(an(L(416, 160, 427, 160)));
  add(dia(487, 160, 120, 84, 'Approved?')); add(an(L(487, 118, 487, 72))); add(lab(474, 100, 'Yes')); add(box(432, 24, 110, 48, 'Roster updated', null, 'bx hl'));
  add(an(L(487, 202, 487, 256))); add(lab(474, 232, 'No')); add(box(432, 256, 110, 48, 'Follow-up check', null));
  add(an(L(215, 202, 215, 256))); add(lab(202, 232, 'No')); add(box(160, 256, 110, 48, 'Auto-reject', null));
  add(an(T(14, 270, 'The outcome feeds', 's'))); add(an(T(14, 284, 'the risk model', 's')));
};

export function mountSkills(host) {
  const chips = $$('.skill'); if (!host || !chips.length) return;
  const MAP = {
    'Product discovery': ['discovery'], 'Use cases & user stories': ['usecase', 'userstory'], 'BRD & functional requirements': ['brd'], 'Workflow design & ER diagrams': ['er', 'workflow'], 'UI mockups': ['mockup'], 'Feature prioritisation': ['prio'], 'Phased release planning': ['roadmap'], 'UAT & rollout': ['uat'],
    'Python & XGBoost (classification)': ['python'], 'SQL': ['sql'], 'Power BI': ['bi'], 'Tableau': ['heat'], 'Advanced Excel': ['sheet'], 'ML-based recommendation features': ['rec'], 'Algorithmic product logic': ['algo'],
    'B2B SaaS': ['saas'], 'Workforce management': ['workforce'], 'Supply chain & port operations': ['supply'], 'Fintech / investment platforms': ['fintech'], 'Digital transformation': ['dt'],
    'Stakeholder management': ['stakeholder'], 'Change management': ['change'], 'CXO communication': ['cxo'], 'Jira-tracked delivery': ['jira'],
  };
  let currentSkill = null, which = 0;
  const draw = (skill, i) => {
    const ids = MAP[skill] || []; const [title, cap, fn] = D[ids[i]]; seq = 0;
    const root = sv('svg', { viewBox: '0 0 640 340', class: 'sk', role: 'img', 'aria-label': `${title}: ${cap}` },
      sv('defs', {}, sv('linearGradient', { id: 'sk-lg' }, sv('stop', { offset: 0, 'stop-color': '#5b8cff', 'stop-opacity': .3 }), sv('stop', { offset: 1, 'stop-color': '#ff7b7b' })), sv('marker', { id: 'sk-ar', markerWidth: 8, markerHeight: 8, refX: 6, refY: 4, orient: 'auto' }, sv('path', { d: 'M0 0 8 4 0 8z', class: 'arrow' }))));
    const add = (...n) => n.forEach(x => x && root.append(x)); fn(add);
    const tabs = ids.length > 1 ? h('div', { class: 'lab-sub', role: 'group', 'aria-label': 'Diagrams for this skill' }, ...ids.map((id, k) => h('button', { type: 'button', 'aria-pressed': String(k === i), onclick: () => draw(skill, k) }, D[id][0]))) : null;
    host.textContent = '';
    host.append(consoleShell(`sample · ${skill.toLowerCase()}`, h('div', { class: 'sk-head' }, h('h3', {}, title), h('p', {}, cap)), tabs, root,
      h('p', { class: 'note' }, 'A generic sample created for this portfolio. It is not taken from any real project, system or data.')));
  };
  const select = chip => { currentSkill = chip.dataset.skill; chips.forEach(c => c.setAttribute('aria-pressed', String(c === chip))); draw(currentSkill, 0); };
  chips.forEach(c => c.addEventListener('click', () => select(c)));
  $$('.cap-tab').forEach(t => t.addEventListener('click', () => setTimeout(() => { const first = $('.cap-panel:not([hidden]) .skill'); if (first) select(first); }, 0)));
  select(chips[0]);
}
