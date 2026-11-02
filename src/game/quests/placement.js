/* ---------- inicio de reino: elegir y colocar encargos ---------- */
function questsStart(key) {
  G.qfx = G.qfx || { fire: false, favor: null, done: 0 };
  if (G.qSeed == null) G.qSeed = (Math.random() * 1e9) | 0;
  if (G.q && G.q.active.length) setTimeout(() => banner('Encargos sin terminar abandonados al cambiar de reino'), 4200);
  for (const p of players) {
    p.qFlame = false;
    p.qRelic = false;
  }
  G.q = {
    key,
    anch: [],
    active: [],
    shelters: [],
    braz: [],
    seals: [],
    puddles: [],
    recent: [],
    zapT: 2.5,
    wetT: 4,
    hudK: '',
    offer: null,
  };
  G.qPrio = null;
  if (!Q_REALMS[key] || !WORLD) return;
  const q = G.q,
    rng = srand(G.qSeed + G.ridx * 7919 + key.length * 131),
    [sx, sy] = spawnPt(key);
  const R = qReach(sx, sy);
  q.R = R;
  const avoid = [[sx, sy, 380]];
  for (const o of [...WORLD.chests, ...WORLD.altars, ...(WORLD.shrines || []), ...(WORLD.merchants || [])])
    avoid.push([o.x, o.y, 130]);
  const mode = cfg.qTest || 'azar';
  let ids =
    mode === 'todos'
      ? Q_IDS.slice()
      : Q_IDS.includes(mode)
        ? [mode]
        : (() => {
            const a = Q_IDS.slice();
            for (let i = a.length - 1; i > 0; i--) {
              const j = Math.floor(rng() * (i + 1));
              [a[i], a[j]] = [a[j], a[i]];
            }
            return a.slice(0, 3);
          })();
  q.ids = ids;
  const put = (id, minD, maxD) => {
    const s = qSpot(rng, R, sx, sy, minD, maxD, avoid);
    if (!s) return null;
    avoid.push([s[0], s[1], 420]);
    const a = { id, x: s[0], y: s[1], state: 'offer' };
    q.anch.push(a);
    return a;
  };
  const st = MLT('#b8b0a0', 'wall'),
    dark = ML('#5a5048'),
    gold = MB(C.gold);
  if (ids.includes('ladron')) qPlaceThief(put('ladron', 420, 950), R, rng, st, gold);
  if (ids.includes('llama')) qPlaceFlame(put('llama', 380, 850), R, rng, st, dark, avoid);
  if (ids.includes('sellos')) qPlaceSeals(put('sellos', 600, 1150), R, rng, st, sx, sy);
  if (ids.includes('favor')) qPlaceFavor(put('favor', 340, 750), R, rng, st, gold, avoid);
  q.R = qReach(sx, sy);
  qEnsureShelters(q.R);
  q.mkShelter = null;
}
function qPlaceThief(a, R, rng, st, gold) {
  if (!a) return;
  const g = new THREE.Group();
  g.position.set(a.x, groundAt(a.x, a.y), a.y);
  WORLD.group.add(g);
  qMesh(GEO.cyl(24, 28, 10, 8), st, 0, 5, 0, g);
  const ch = qMesh(GEO.box(22, 14, 16), MLT('#7a4a2a', 'bark'), 0, 17, 0, g);
  const lid = qMesh(GEO.box(23, 5, 17), gold, 0, 26, 0, g);
  const gl = qGlow('#ffd060', 80);
  gl.position.y = 24;
  g.add(gl);
  const rg = qRing(QDEF.ladron.col, 52);
  rg.position.y = 2;
  g.add(rg);
  a.obj = g;
  a.chest = [ch, lid, gl];
  // ruta: alterna meseta y terrazas; sentido, amplitud y muros cambian con cada partida; cada punto es alcanzable
  a.route = [];
  const dir = rng() < 0.5 ? 1 : -1,
    a0 = Math.atan2(a.y, a.x);
  for (let i = 0; i < 10; i++) {
    const ang = a0 + dir * (i + 1) * (0.36 + rng() * 0.14),
      rad = i % 2 ? 1.3 + rng() * 0.2 : 0.75 + rng() * 0.15;
    const rx = Math.cos(ang) * 700 * rad * WS,
      ry = Math.sin(ang) * 330 * rad * WS;
    let x = rx * 0.92 + ry * 0.39,
      y = -rx * 0.39 + ry * 0.92;
    const d = Math.hypot(x, y);
    if (d > ARENA - 260) {
      x *= (ARENA - 260) / d;
      y *= (ARENA - 260) / d;
    }
    const p = R.d(x, y) >= 0 ? [x, y] : qNearSpot(R, rng, x, y, 160);
    a.route.push(p);
  }
  a.walls = [];
  const segs = [1, 2, 3, 4, 5, 6, 7, 8].sort(() => rng() - 0.5).slice(0, 3);
  for (const i of segs) {
    const [p0, p1] = [a.route[i], a.route[i + 1]];
    const mx = (p0[0] + p1[0]) / 2,
      my = (p0[1] + p1[1]) / 2;
    if (!qFree(mx, my, 40) || R.d(mx, my) < 0 || slopeAt(mx, my) > 0.3) continue;
    const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
    const gy = groundAt(mx, my);
    const w = qMesh(GEO.box(14, 30, 90), st, mx, gy + 15, my);
    w.rotation.y = -ang;
    for (const o of [-30, 0, 30]) {
      const cx = mx - Math.sin(ang) * o,
        cy = my + Math.cos(ang) * o;
      WORLD.coll.push({ x: cx, y: cy, r: 12, top: groundAt(cx, cy) + 30 });
    }
    a.walls.push([mx, my]);
  }
}
function qPlaceFlame(a, R, rng, st, dark, avoid) {
  if (!a) return;
  const q = G.q;
  const g = new THREE.Group();
  g.position.set(a.x, groundAt(a.x, a.y), a.y);
  WORLD.group.add(g);
  qMesh(GEO.cyl(18, 24, 30, 8), st, 0, 15, 0, g);
  const fl = new THREE.Mesh(GEO.cone(9, 26, 6), MB('#ffb040'));
  fl.position.y = 44;
  g.add(fl);
  const gl = qGlow('#ff8a2a', 110);
  gl.position.y = 44;
  g.add(gl);
  const rg = qRing(QDEF.llama.col, 52);
  rg.position.y = 2;
  g.add(rg);
  a.obj = g;
  a.fire = [fl, gl];
  const av2 = avoid.concat([[a.x, a.y, 450]]);
  for (let i = 0; i < 2; i++) {
    const s = qSpot(rng, R, a.x, a.y, 560, 880, av2.concat(q.braz.map((b) => [b.x, b.y, 650])));
    if (!s) continue;
    const b = { x: s[0], y: s[1], r: 95, lit: false };
    const bg = new THREE.Group();
    bg.position.set(b.x, groundAt(b.x, b.y), b.y);
    WORLD.group.add(bg);
    qMesh(GEO.cyl(9, 13, 34, 8), st, 0, 17, 0, bg);
    qMesh(GEO.cyl(22, 12, 12, 10), dark, 0, 38, 0, bg);
    const ff = new THREE.Mesh(GEO.cone(16, 34, 7), MB('#ff9a2a'));
    ff.position.y = 60;
    ff.visible = false;
    bg.add(ff);
    const fg = qGlow('#ff8a2a', 190);
    fg.position.y = 56;
    fg.visible = false;
    bg.add(fg);
    const br = qRing('#ff8a2a', b.r, 0.5);
    br.position.y = 2;
    br.visible = false;
    bg.add(br);
    const mark = qGlow('#ffd8a0', 60);
    mark.position.y = 46;
    bg.add(mark);
    b.obj = bg;
    b.fire = [ff, fg, br];
    b.mark = mark;
    q.braz.push(b);
    WORLD.coll.push({ x: b.x, y: b.y, r: 14, top: groundAt(b.x, b.y) + 44 });
  }
  const mk = (x0, y0) => {
    const [x, y] = qNearSpot(R, rng, x0, y0, 140);
    const s = { x, y, r: 78 };
    const sg = new THREE.Group();
    sg.position.set(x, groundAt(x, y), y);
    WORLD.group.add(sg);
    for (const [px, pz] of [
      [-34, -26],
      [34, -26],
      [-34, 26],
      [34, 26],
    ])
      qMesh(GEO.cyl(3, 3, 58, 5), MLT('#6a4a2a', 'bark'), px, 29, pz, sg);
    const roof = qMesh(GEO.cone(62, 30, 4), MLT('#c8a050', 'thatch').clone(), 0, 72, 0, sg);
    roof.material.transparent = true;
    s.roof = roof;
    roof.rotation.y = 0.785;
    const rg2 = qRing('#8fd8ff', s.r, 0.75);
    rg2.position.y = 2;
    sg.add(rg2);
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(s.r, 32),
      MB('#8fd8ff', { transparent: true, opacity: 0.12, depthWrite: false })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 1.5;
    sg.add(disc);
    s.obj = sg;
    s.ring = rg2;
    q.shelters.push(s);
  };
  for (const b of q.braz) for (const t of [0.42, 0.78]) mk(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  {
    const s = qSpot(rng, R, a.x, a.y, 200, 520, []);
    if (s) mk(s[0], s[1]);
  }
  q.mkShelter = mk;
  q.flameA = a;
}
/* garantía de la brasa: desde cualquier punto de la zona, un refugio a menos de 1100 caminando (con todos los obstáculos ya colocados) */
function qEnsureShelters(R) {
  const q = G.q,
    a = q.flameA,
    mk = q.mkShelter;
  if (!a) return;
  for (let it = 0; it < 4; it++) {
    const f = qShelterField(R, q.shelters);
    let worst = -1,
      wk = -1;
    const pts = [a, ...q.braz];
    for (let k = 0; k < f.length; k++) {
      if (R.dist[k] < 0) continue;
      const i = k % R.N,
        j = (k - i) / R.N,
        x = R.ox + i * R.C,
        y = R.oy + j * R.C;
      if (!pts.some((p) => Math.hypot(p.x - x, p.y - y) < 700)) continue;
      const v = f[k] < 0 ? 1e9 : f[k];
      if (v > worst) {
        worst = v;
        wk = k;
      }
    }
    q.emberWorst = worst;
    if (worst <= 1100 || wk < 0) break;
    const i = wk % R.N,
      j = (wk - i) / R.N;
    mk(R.ox + i * R.C, R.oy + j * R.C);
  }
}
function qPlaceSeals(a, R, rng, st, sx, sy) {
  if (!a) return;
  const q = G.q;
  const g = new THREE.Group();
  g.position.set(a.x, groundAt(a.x, a.y), a.y);
  WORLD.group.add(g);
  a.ang = Math.atan2(sy - a.y, sx - a.x);
  g.rotation.y = -a.ang + Math.PI / 2;
  for (const sx2 of [-40, 40]) {
    qMesh(GEO.box(18, 90, 18), st, sx2, 45, 0, g);
  }
  qMesh(GEO.box(104, 18, 22), st, 0, 98, 0, g);
  const bar = new THREE.Mesh(
    new THREE.PlaneGeometry(62, 88),
    new THREE.MeshBasicMaterial({
      color: '#c8a0ff',
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  bar.position.y = 44;
  g.add(bar);
  a.barrier = bar;
  const lg = qGlow('#c8a0ff', 120);
  lg.position.y = 50;
  g.add(lg);
  a.obj = g;
  for (const o of [-40, 40]) {
    const cx = a.x + Math.cos(a.ang + Math.PI / 2) * o,
      cy = a.y + Math.sin(a.ang + Math.PI / 2) * o;
    WORLD.coll.push({ x: cx, y: cy, r: 14, top: groundAt(cx, cy) + 90 });
  }
  const off = rng() * 0.5 - 0.25;
  for (let i = 0; i < 3; i++) {
    const ang = a.ang + off + (i - 1) * (0.9 + rng() * 0.3);
    const [x, y] = qNearSpot(
      R,
      rng,
      a.x + Math.cos(ang) * (150 + rng() * 50),
      a.y + Math.sin(ang) * (150 + rng() * 50),
      60
    );
    const s = { x, y, r: 26, hp: 1 };
    const sg = new THREE.Group();
    sg.position.set(x, groundAt(x, y), y);
    WORLD.group.add(sg);
    const disk = qMesh(GEO.cyl(26, 30, 10, 10), st, 0, 5, 0, sg);
    const glyph = new THREE.Mesh(GEO.oct(10), MB('#c8a0ff'));
    glyph.position.y = 26;
    sg.add(glyph);
    const sr = qRing('#c8a0ff', 40);
    sr.position.y = 2;
    sg.add(sr);
    const gw = qGlow('#c8a0ff', 70);
    gw.position.y = 24;
    sg.add(gw);
    s.obj = sg;
    s.glyph = glyph;
    s.parts = [glyph, sr, gw];
    s.disk = disk;
    q.seals.push(s);
  }
}
function favorPick() {
  for (const fid in FAVORS) {
    const F = FAVORS[fid];
    const giver = F.givers.find((id) => !players.some((p) => p.god === id));
    if (giver) return { fid, giver };
  }
  return null;
}
function qPlaceFavor(a, R, rng, st, gold, avoid) {
  if (!a) return;
  const fp = favorPick();
  if (!fp) {
    G.q.anch = G.q.anch.filter((x) => x !== a);
    return;
  }
  a.fid = fp.fid;
  a.giver = fp.giver;
  const g = new THREE.Group();
  g.position.set(a.x, groundAt(a.x, a.y), a.y);
  WORLD.group.add(g);
  qMesh(GEO.cyl(30, 36, 14, 8), st, 0, 7, 0, g);
  qMesh(GEO.cyl(24, 28, 6, 8), gold, 0, 16, 0, g);
  const rg = qRing('#ffe060', 58);
  rg.position.y = 2;
  g.add(rg);
  const gl = qGlow('#ffe060', 60);
  gl.material.opacity = 0.55;
  gl.position.y = 24;
  g.add(gl);
  a.obj = g;
  WORLD.coll.push({ x: a.x, y: a.y, r: 20, top: groundAt(a.x, a.y) + 14 });
  const s = qSpot(rng, R, a.x, a.y, 1050, 1500, avoid);
  a.relic = s ? { x: s[0], y: s[1] } : { x: -a.x, y: -a.y };
}
