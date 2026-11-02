/* ---------- dibujo de píxeles sobre D ---------- */
let D = null,
  S = 3,
  OX = 0,
  OY = 0,
  T = 0;
function R(x, y, w, h, c) {
  D.fillStyle = c;
  D.fillRect(Math.round(x), Math.round(y), w, h);
}
function line(x0, y0, x1, y1, c, w = 1) {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  D.fillStyle = c;
  const dx = Math.abs(x1 - x0),
    dy = Math.abs(y1 - y0),
    sx = x0 < x1 ? 1 : -1,
    sy = y0 < y1 ? 1 : -1;
  let e = dx - dy,
    n = 0;
  const o = w >> 1;
  while (n++ < 900) {
    D.fillRect(x0 - o, y0 - o, w, w);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 > -dy) {
      e -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      e += dx;
      y0 += sy;
    }
  }
}
function ellD(cx, cy, rx, ry, c) {
  if (rx <= 0 || ry <= 0) return;
  D.fillStyle = c;
  cx = Math.round(cx);
  cy = Math.round(cy);
  for (let y = -Math.ceil(ry); y <= ry; y++) {
    const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
    if (w >= 0) D.fillRect(cx - w, cy + y, w * 2 + 1, 1);
  }
}
function ringD(cx, cy, r, c, w = 1) {
  D.fillStyle = c;
  const n = Math.max(16, Math.ceil(r * 6.3));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.2832;
    D.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), w, w);
  }
}
function dither(cx, cy, r, c, step) {
  D.fillStyle = c;
  cx = Math.round(cx);
  cy = Math.round(cy);
  r = Math.round(r);
  const r2 = r * r;
  for (let j = -r; j <= r; j++)
    for (let i = -r; i <= r; i++) {
      if (i * i + j * j > r2) continue;
      if ((((cx + i + (cy + j) * 2) % step) + step) % step === 0) D.fillRect(cx + i, cy + j, 1, 1);
    }
}
function triD(x1, y1, x2, y2, x3, y3, c) {
  const minY = Math.floor(Math.min(y1, y2, y3)),
    maxY = Math.ceil(Math.max(y1, y2, y3));
  D.fillStyle = c;
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    for (const [a, b, c2, d] of [
      [x1, y1, x2, y2],
      [x2, y2, x3, y3],
      [x3, y3, x1, y1],
    ]) {
      if ((y >= b && y < d) || (y >= d && y < b)) xs.push(a + ((y - b) * (c2 - a)) / (d - b));
    }
    if (xs.length >= 2) {
      xs.sort((a, b) => a - b);
      D.fillRect(Math.round(xs[0]), y, Math.max(1, Math.round(xs[xs.length - 1] - xs[0])), 1);
    }
  }
}
function addLight() {}
