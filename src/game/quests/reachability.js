/* ---------- alcance: rejilla de terreno transitable desde la salida (saltos de hasta 70) ---------- */
function qReach(sx, sy) {
  const C = 40,
    R = 1700,
    N = Math.ceil((R * 2) / C) + 1,
    ox = sx - R,
    oy = sy - R,
    NN = N * N;
  const gh = new Float32Array(NN),
    ok = new Uint8Array(NN),
    dist = new Float32Array(NN).fill(-1);
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const x = ox + i * C,
        y = oy + j * C,
        k = j * N + i;
      if (Math.hypot(x, y) > ARENA - 70 || hazardAt(x, y)) continue;
      gh[k] = groundAt(x, y);
      ok[k] = 1;
    }
  for (const c of WORLD.coll) {
    const g0 = groundAt(c.x, c.y);
    if (c.top - g0 < 45) continue;
    const r = Math.ceil((c.r + 14) / C);
    const ci = Math.round((c.x - ox) / C),
      cj = Math.round((c.y - oy) / C);
    for (let j = cj - r; j <= cj + r; j++)
      for (let i = ci - r; i <= ci + r; i++) {
        if (i < 0 || j < 0 || i >= N || j >= N) continue;
        if (Math.hypot(ox + i * C - c.x, oy + j * C - c.y) < c.r + 14) ok[j * N + i] = 0;
      }
  }
  const at = (x, y) => {
    const i = Math.round((x - ox) / C),
      j = Math.round((y - oy) / C);
    if (i < 0 || j < 0 || i >= N || j >= N) return -1;
    return j * N + i;
  };
  const s0 = at(sx, sy);
  const Q = new Int32Array(NN);
  let h = 0,
    t = 0;
  if (s0 >= 0) {
    ok[s0] = 1;
    dist[s0] = 0;
    Q[t++] = s0;
  }
  const NB = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, 1.414],
    [-1, 1, 1.414],
    [1, -1, 1.414],
    [-1, -1, 1.414],
  ];
  while (h < t) {
    const k = Q[h++];
    const i = k % N,
      j = (k - i) / N;
    for (const [di, dj, w] of NB) {
      const ni = i + di,
        nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= N || nj >= N) continue;
      const n = nj * N + ni;
      if (!ok[n] || dist[n] >= 0) continue;
      if (gh[n] - gh[k] > 70) continue;
      dist[n] = dist[k] + w * C;
      Q[t++] = n;
    }
  }
  return {
    C,
    N,
    ox,
    oy,
    ok,
    gh,
    dist,
    at,
    d: (x, y) => {
      const k = at(x, y);
      return k < 0 ? -1 : dist[k];
    },
  };
}
/* distancia caminando desde cada celda alcanzable al refugio más cercano (para validar la brasa) */
function qShelterField(R, shel) {
  const NN = R.N * R.N,
    f = new Float32Array(NN).fill(-1),
    Q = new Int32Array(NN);
  let h = 0,
    t = 0;
  for (const s of shel) {
    const k = R.at(s.x, s.y);
    if (k >= 0 && R.dist[k] >= 0 && f[k] < 0) {
      f[k] = 0;
      Q[t++] = k;
    }
  }
  const NB = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, 1.414],
    [-1, 1, 1.414],
    [1, -1, 1.414],
    [-1, -1, 1.414],
  ];
  while (h < t) {
    const k = Q[h++];
    const i = k % R.N,
      j = (k - i) / R.N;
    for (const [di, dj, w] of NB) {
      const ni = i + di,
        nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= R.N || nj >= R.N) continue;
      const n = nj * R.N + ni;
      if (R.dist[n] < 0 || f[n] >= 0) continue;
      if (R.gh[k] - R.gh[n] > 70) continue;
      f[n] = f[k] + w * R.C;
      Q[t++] = n;
    }
  }
  return f;
}
function qSpot(rng, R, cx, cy, minD, maxD, avoid) {
  for (let t = 0; t < 600; t++) {
    const a = rng() * 6.283,
      r = minD + rng() * (maxD - minD);
    const x = cx + Math.cos(a) * r,
      y = cy + Math.sin(a) * r;
    if (Math.hypot(x, y) > ARENA - 260) continue;
    if (R.d(x, y) < 0) continue;
    if (!qFlat(x, y) || !qFree(x, y)) continue;
    if ((avoid || []).some((p) => Math.hypot(p[0] - x, p[1] - y) < (p[2] || 300))) continue;
    return [x, y];
  }
  return null;
}
function qNearSpot(R, rng, x, y, rad) {
  for (let t = 0; t < 120; t++) {
    const a = rng() * 6.283,
      r = t ? rng() * rad : 0;
    const xx = x + Math.cos(a) * r,
      yy = y + Math.sin(a) * r;
    if (Math.hypot(xx, yy) < ARENA - 200 && R.d(xx, yy) >= 0 && qFlat(xx, yy) && qFree(xx, yy, 30)) return [xx, yy];
  }
  return [x, y];
}
