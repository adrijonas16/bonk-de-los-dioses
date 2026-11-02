/* ---------- procesado de sprites ---------- */
function alphaAt(d, w, h, x, y) {
  return x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
}
function epx(src) {
  const w = src.width,
    h = src.height,
    sd = src.getContext('2d').getImageData(0, 0, w, h).data;
  const o = mkCanvas(w * 2, h * 2),
    og = o.getContext('2d'),
    od = og.createImageData(w * 2, h * 2),
    d = od.data;
  const P = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return -1;
    const i = (y * w + x) * 4;
    return sd[i + 3] ? (sd[i] << 16) | (sd[i + 1] << 8) | sd[i + 2] : -1;
  };
  const put = (x, y, c) => {
    if (c < 0) return;
    const i = (y * w * 2 + x) * 4;
    d[i] = c >> 16;
    d[i + 1] = (c >> 8) & 255;
    d[i + 2] = c & 255;
    d[i + 3] = 255;
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const p = P(x, y),
        A = P(x, y - 1),
        B = P(x + 1, y),
        Cc = P(x - 1, y),
        Dd = P(x, y + 1);
      let p1 = p,
        p2 = p,
        p3 = p,
        p4 = p;
      if (Cc === A && Cc !== Dd && A !== B) p1 = A;
      if (A === B && A !== Cc && B !== Dd) p2 = B;
      if (Dd === Cc && Dd !== B && Cc !== A) p3 = Cc;
      if (B === Dd && B !== A && Dd !== Cc) p4 = Dd;
      if (p < 0) {
        p1 = p1 === A && A >= 0 && Cc === A ? A : -1;
        p2 = p2 === B && B >= 0 && A === B ? B : -1;
        p3 = p3 === Cc && Cc >= 0 && Dd === Cc ? Cc : -1;
        p4 = p4 === Dd && Dd >= 0 && B === Dd ? Dd : -1;
      }
      put(x * 2, y * 2, p1);
      put(x * 2 + 1, y * 2, p2);
      put(x * 2, y * 2 + 1, p3);
      put(x * 2 + 1, y * 2 + 1, p4);
    }
  og.putImageData(od, 0, 0);
  return o;
}
function shadeOutline(src, ol, noShade) {
  const w = src.width,
    h = src.height,
    g = src.getContext('2d'),
    id = g.getImageData(0, 0, w, h),
    d = id.data,
    orig = new Uint8ClampedArray(d);
  if (!noShade)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (!orig[i + 3]) continue;
        const up = !alphaAt(orig, w, h, x, y - 1) || !alphaAt(orig, w, h, x - 1, y),
          dn = !alphaAt(orig, w, h, x, y + 1) || !alphaAt(orig, w, h, x + 1, y);
        const f = up && !dn ? 1.18 : dn && !up ? 0.78 : 1;
        if (f !== 1) {
          d[i] = clamp(d[i] * f + (f > 1 ? 12 : 0), 0, 255);
          d[i + 1] = clamp(d[i + 1] * f + (f > 1 ? 12 : 0), 0, 255);
          d[i + 2] = clamp(d[i + 2] * f + (f > 1 ? 12 : 0), 0, 255);
        }
      }
  g.putImageData(id, 0, 0);
  const o = mkCanvas(w + 2, h + 2),
    og = o.getContext('2d');
  if (ol) {
    og.fillStyle = ol;
    for (let y = -1; y <= h; y++)
      for (let x = -1; x <= w; x++) {
        if (alphaAt(orig, w, h, x, y)) continue;
        if (
          alphaAt(orig, w, h, x - 1, y) ||
          alphaAt(orig, w, h, x + 1, y) ||
          alphaAt(orig, w, h, x, y - 1) ||
          alphaAt(orig, w, h, x, y + 1)
        )
          og.fillRect(x + 1, y + 1, 1, 1);
      }
  }
  og.drawImage(src, 1, 1);
  return o;
}
function hiPaint(src, ol) {
  const w = src.width,
    h = src.height,
    g = src.getContext('2d'),
    id = g.getImageData(0, 0, w, h),
    d = id.data,
    o0 = new Uint8ClampedArray(d);
  const A = (x, y) => x >= 0 && y >= 0 && x < w && y < h && o0[(y * w + x) * 4 + 3] > 0;
  const col = (x, y) => {
    const i = (y * w + x) * 4;
    return (o0[i] << 16) | (o0[i + 1] << 8) | o0[i + 2];
  };
  const tH = new Float32Array(w * h),
    tV = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      if (!A(x, y)) {
        x++;
        continue;
      }
      let x1 = x;
      while (x1 + 1 < w && A(x1 + 1, y)) x1++;
      let a = x;
      while (a <= x1) {
        const c = col(a, y);
        let b = a;
        while (b + 1 <= x1 && col(b + 1, y) === c) b++;
        const useC = b - a >= 8;
        for (let k = a; k <= b; k++) tH[y * w + k] = useC ? (k - a) / (b - a) : (k - x) / Math.max(1, x1 - x);
        a = b + 1;
      }
      x = x1 + 1;
    }
  }
  for (let x = 0; x < w; x++) {
    let y = 0;
    while (y < h) {
      if (!A(x, y)) {
        y++;
        continue;
      }
      let y1 = y;
      while (y1 + 1 < h && A(x, y1 + 1)) y1++;
      let a = y;
      while (a <= y1) {
        const c = col(x, a);
        let b = a;
        while (b + 1 <= y1 && col(x, b + 1) === c) b++;
        for (let k = a; k <= b; k++) tV[k * w + x] = b - a >= 3 ? (k - a) / (b - a) : 0.5;
        a = b + 1;
      }
      y = y1 + 1;
    }
  }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!o0[i + 3]) continue;
      const L = (0.5 - tH[y * w + x]) * 0.6 + (0.5 - tV[y * w + x]) * 0.35;
      let r = o0[i],
        gg = o0[i + 1],
        b = o0[i + 2];
      if (L > 0.2) {
        r += (255 - r) * 0.16;
        gg += (255 - gg) * 0.16;
        b += (255 - b) * 0.12;
      } else if (L < -0.2) {
        r *= 0.76;
        gg *= 0.78;
        b *= 0.88;
      } else if (L < -0.13 && (x + y) % 2 === 0) {
        r *= 0.86;
        gg *= 0.87;
        b *= 0.92;
      }
      const dn = A(x, y + 1) && col(x, y + 1) !== col(x, y),
        up = A(x, y - 1) && col(x, y - 1) !== col(x, y);
      if (dn) {
        const i2 = ((y + 1) * w + x) * 4;
        const l1 = o0[i] + o0[i + 1] + o0[i + 2],
          l2 = o0[i2] + o0[i2 + 1] + o0[i2 + 2];
        if (l1 > l2 + 60) {
          r *= 0.86;
          gg *= 0.86;
          b *= 0.9;
        }
      }
      if (up && !A(x, y - 2)) {
        r += (255 - r) * 0.1;
        gg += (255 - gg) * 0.1;
        b += (255 - b) * 0.1;
      }
      d[i] = r;
      d[i + 1] = gg;
      d[i + 2] = b;
    }
  g.putImageData(id, 0, 0);
  const o = mkCanvas(w + 2, h + 2),
    og = o.getContext('2d'),
    od = og.createImageData(w + 2, h + 2),
    q = od.data;
  const ok = ol ? hexRGB(ol) : [20, 14, 12];
  for (let y = -1; y <= h; y++)
    for (let x = -1; x <= w; x++) {
      if (A(x, y)) continue;
      let n = null;
      for (const [dx, dy] of [
        [0, 1],
        [1, 0],
        [-1, 0],
        [0, -1],
      ])
        if (A(x + dx, y + dy)) {
          n = [x + dx, y + dy];
          break;
        }
      if (!n) continue;
      const j = (n[1] * w + n[0]) * 4,
        k = ((y + 1) * (w + 2) + x + 1) * 4;
      q[k] = o0[j] * 0.28 + ok[0] * 0.55;
      q[k + 1] = o0[j + 1] * 0.28 + ok[1] * 0.55;
      q[k + 2] = o0[j + 2] * 0.32 + ok[2] * 0.55;
      q[k + 3] = 255;
    }
  og.putImageData(od, 0, 0);
  og.drawImage(src, 1, 1);
  return o;
}
function variants(c) {
  const f = mkCanvas(c.width, c.height),
    fg = f.getContext('2d');
  fg.drawImage(c, 0, 0);
  fg.globalCompositeOperation = 'source-in';
  fg.fillStyle = '#fff6e0';
  fg.fillRect(0, 0, f.width, f.height);
  const flip = (x) => {
    const o = mkCanvas(x.width, x.height),
      og = o.getContext('2d');
    og.translate(x.width, 0);
    og.scale(-1, 1);
    og.drawImage(x, 0, 0);
    return o;
  };
  return { c, f, cm: flip(c), fm: flip(f), w: c.width, h: c.height };
}
function fromFn(w, h, fn) {
  const c = mkCanvas(w, h),
    g = c.getContext('2d');
  const put = (x, y, col) => {
    g.fillStyle = col;
    g.fillRect(Math.round(x), Math.round(y), 1, 1);
  };
  const rect = (x, y, ww, hh, col) => {
    g.fillStyle = col;
    g.fillRect(Math.round(x), Math.round(y), ww, hh);
  };
  const ell = (cx, cy, rx, ry, col) => {
    g.fillStyle = col;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        if (((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1) g.fillRect(x, y, 1, 1);
      }
  };
  const clear = (x, y, ww, hh) => g.clearRect(x, y, ww, hh);
  const ln = (x0, y0, x1, y1, col) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
    for (let i = 0; i <= n; i++) {
      put(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, col);
    }
  };
  fn({ put, rect, ell, clear, ln, g });
  return c;
}
