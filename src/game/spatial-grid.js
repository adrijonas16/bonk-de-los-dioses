/* ---------- rejilla ---------- */
const CELL = 50,
  grid = new Map(),
  gk = (cx, cy) => (cx + 32768) * 65536 + (cy + 32768);
function buildGrid() {
  grid.clear();
  const add = (e) => {
    const k = gk(Math.floor(e.x / CELL), Math.floor(e.y / CELL));
    let a = grid.get(k);
    if (!a) {
      a = [];
      grid.set(k, a);
    }
    a.push(e);
  };
  for (const e of enemies) {
    if (e.dead) continue;
    add(e);
    if (e.segs) for (const s of e.segs) add(s);
  }
}
function near(x, y, r, fn) {
  const x0 = Math.floor((x - r) / CELL),
    x1 = Math.floor((x + r) / CELL),
    y0 = Math.floor((y - r) / CELL),
    y1 = Math.floor((y + r) / CELL);
  for (let cx = x0; cx <= x1; cx++)
    for (let cy = y0; cy <= y1; cy++) {
      const a = grid.get(gk(cx, cy));
      if (a)
        for (const e of a) {
          if (e.proxy ? e.proxy.dead : e.dead) continue;
          fn(e);
        }
    }
}
function push(e, fx_, fy_, amt) {
  if (e.boss || e.heavy) amt *= 0.15;
  const d = Math.hypot(e.x - fx_, e.y - fy_) || 1;
  e.x += ((e.x - fx_) / d) * amt;
  e.y += ((e.y - fy_) / d) * amt;
}
