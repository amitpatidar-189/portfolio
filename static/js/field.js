// Restrained "data points" field behind the hero: drifting nodes, faint links, soft pointer pull.
export function startField(canvas, { reduce = false } = {}) {
  const ctx = canvas.getContext('2d');
  let w, h, dpr, nodes = [], raf = 0, visible = true;
  const pointer = { x: -999, y: -999 };

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, Math.max(26, w / 22)));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: 1.2 + Math.random() * 1.6,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const link = Math.min(140, w / 8);
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (!reduce) {
        const dx = a.x - pointer.x, dy = a.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < 22000) { const f = (1 - d2 / 22000) * .6; a.x += dx / Math.sqrt(d2 + 1) * f; a.y += dy / Math.sqrt(d2 + 1) * f; }
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
      }
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < link) { ctx.strokeStyle = `rgba(47,107,255,${(1 - d / link) * .22})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      ctx.fillStyle = 'rgba(47,107,255,.55)'; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
    }
  }

  function loop() { draw(); raf = visible ? requestAnimationFrame(loop) : 0; }

  size();
  if (reduce) { draw(); addEventListener('resize', () => { size(); draw(); }); return; }
  addEventListener('resize', size);
  canvas.parentElement.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; });
  canvas.parentElement.addEventListener('pointerleave', () => { pointer.x = pointer.y = -999; });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) loop(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible && !raf) loop(); });
  loop();
}
