/* ---------- qué cuerpo usa cada dios ---------- */
const GOD_BODY = {
  zeus: 'c_barbarian',
  poseidon: 'c_barbarian',
  hades: 'c_mage',
  artemisa: 'c_rogue',
  apolo: 'c_mage',
  atenea: 'c_knight',
  thor: 'c_barbarian',
  odin: 'c_barbarian',
  freya: 'c_rogue',
  loki: 'c_mage',
  ra: 'c_knight',
  anubis: 'c_knight',
  sekhmet: 'c_rogue',
  marduk: 'c_barbarian',
  inanna: 'c_rogue',
  enki: 'c_barbarian',
  vishnu: 'c_mage',
  shiva: 'c_mage',
  durga: 'c_rogue',
  hanuman: 'c_barbarian',
  susanoo: 'c_knight',
  amaterasu: 'c_rogue',
  raijin: 'c_barbarian',
  wukong: 'c_rogue_hooded',
  nezha: 'c_mage',
  erlang: 'c_knight',
  quetzalcoatl: 'c_mage',
  huitzilopochtli: 'c_knight',
  tezcatlipoca: 'c_rogue_hooded',
  tlaloc: 'c_mage',
  chaac: 'c_barbarian',
  gemelos: 'c_rogue',
  ixchel: 'c_rogue',
  inti: 'c_knight',
  illapa: 'c_knight',
  mamaquilla: 'c_rogue',
  pachamama: 'c_rogue',
  viracocha: 'c_barbarian',
  shango: 'c_barbarian',
  ogun: 'c_barbarian',
  oya: 'c_rogue',
  yemaya: 'c_rogue',
  lugh: 'c_knight',
  dagda: 'c_barbarian',
  morrigan: 'c_rogue_hooded',
  dios: 'c_mage',
  jesus: 'c_barbarian',
  mercader: 'c_rogue_hooded',
};
const KK_HIDE = /Shield|Sword|Axe|Mug|Knife|Crossbow|Throwable|Spellbook|Wand|Staff|_Hat|Helmet|Cape/;
function kkScale(body) {
  return { h: 2.3 };
}
function findBone(root, name) {
  let r = null;
  root.traverse((o) => {
    if (!r && o.name === name) r = o;
  });
  return r;
}
function kkClip(name) {
  const a = AS.g.c_knight.animations;
  return a.find((c) => c.name === name) || a.find((c) => c.name === 'Idle');
}
function buildGodKK(id) {
  const L0 = LOOKS[id] || {},
    light = L0.head === 'light';
  const body = GOD_BODY[id] || 'c_mage';
  const L = Object.assign({}, L0, { s: light ? '#fff6e0' : L0.s || C.skin, h: L0.h || INK });
  const pal = {
    skin: L.s,
    hair: L.b === 'full' || L.b === 'short' ? L.bc || L.h : L.h,
    primary: light ? '#fff6e0' : L.r,
    primaryD: shade(light ? '#fff6e0' : L.r, -0.25),
    trim: light ? '#f4d27a' : L.t,
    cape: L.cc || shade(L.r || '#888', -0.2),
    leather: light ? '#e8d8a0' : '#7a5234',
    leatherD: light ? '#d8c890' : '#5a3a24',
    metal: ['knight'].some((k) => body.includes(k)) ? (L.hc && lum(L.hc) > 0.3 ? L.hc : C.gold) : '#9aa4ae',
    dark: '#3a3438',
    accent: L.t,
  };
  if (body === 'c_knight') {
    pal.metal = L.r;
    pal.primary = L.t;
    pal.trim = C.gold;
  }
  const tex = kkTexture(body, pal);
  const root = THREE.SkeletonUtils.clone(AS.g[body].scene);
  const mats = [];
  const keepCape = L.ex === 'cape';
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (KK_HIDE.test(o.name) && !(keepCape && /Cape/.test(o.name))) {
      o.visible = false;
      return;
    }
    if (L.head && L.head !== 'monkey' && /_Head/.test(o.name)) {
      o.visible = false;
      return;
    }
    const m = o.material.clone();
    m.map = tex;
    m.emissive = new THREE.Color('#000000');
    mats.push(m);
    o.material = m;
    o.castShadow = true;
    o.frustumCulled = false;
  });
  const H = kkScale(body).h;
  const k = 40 / H;
  const wrap = new THREE.Group();
  wrap.add(root);
  root.scale.setScalar(k);
  // tocados y armas en los huesos
  const headB = findBone(root, 'head'),
    handR = findBone(root, 'handslotr');
  const ctx = mkCtx(mats);
  if (headB) {
    const hg = new THREE.Group();
    headB.add(hg);
    hg.userData.bald = body === 'c_barbarian';
    hg.scale.setScalar((1 / k) * 1.5);
    hg.position.set(0, 0.42, 0);
    addHeadGear(L, hg, ctx, id);
  }
  if (handR && !(L.held === 'none' || light)) {
    const hw = new THREE.Group();
    handR.add(hw);
    hw.scale.setScalar((1 / k) * 1.05);
    wrap.userData.pendingHand = hw;
    buildHeld(L.held, L.hc || C.gold, id, hw, ctx);
  }
  if (L.ex === 'shield') {
    const hl = findBone(root, 'handslotl');
    if (hl) {
      const sg = new THREE.Group();
      hl.add(sg);
      sg.scale.setScalar(1 / k);
      ctx.cy(6, 6, 1, 16, ctx.M(shade(L.t, -0.1)), 0, 0, 0, sg, 0, 0, Math.PI / 2);
      ctx.cy(4, 4, 1.3, 14, ctx.M(L.t), -0.3, 0, 0, sg, 0, 0, Math.PI / 2);
    }
  }
  if (L.ex === 'multiarm') {
    const ch = findBone(root, 'chest');
    if (ch) {
      const ag = new THREE.Group();
      ch.add(ag);
      ag.scale.setScalar(1 / k);
      for (const [sx, a] of [
        [-1, 0.9],
        [1, 0.9],
        [-1, 1.5],
        [1, 1.5],
      ]) {
        const p = new THREE.Group();
        p.position.set(sx * 5, 6, -1);
        p.rotation.z = sx * a;
        ag.add(p);
        ctx.cy(1.6, 1.3, 12, 8, ctx.M(L.s), 0, -6, 0, p);
        ctx.sp(1.9, ctx.M(L.s), 0, -12.5, 0, p);
        ctx.add(new THREE.TorusGeometry(2.4, 0.6, 4, 12), ctx.MB2(C.gold), 0, -15, 0, p);
      }
    }
  }
  if (L.ex === 'drums') {
    const ch = findBone(root, 'chest');
    if (ch) {
      const dg = new THREE.Group();
      ch.add(dg);
      dg.scale.setScalar(1 / k);
      dg.position.z = -0.25;
      for (let i = 0; i < 8; i++) {
        const a = Math.PI * (0.95 + (i / 7) * 1.1);
        ctx.cy(2.6, 2.6, 2.2, 12, ctx.M('#8a3a2a'), Math.cos(a) * 15, Math.sin(a) * 13 + 4, -4, dg, Math.PI / 2);
        ctx.cy(1.7, 1.7, 2.4, 12, ctx.M('#e8c86a'), Math.cos(a) * 15, Math.sin(a) * 13 + 4, -3.8, dg, Math.PI / 2);
      }
    }
  }
  if (light) {
    const g = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex('#fff2c0'),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.7,
      })
    );
    g.scale.set(90, 90, 1);
    g.position.y = 30;
    wrap.add(g);
  }
  const mixer = new THREE.AnimationMixer(root);
  const act = {};
  for (const [n, c] of [
    ['idle', 'Idle'],
    ['run', 'Running_A'],
    ['jump', 'Jump_Idle'],
    ['atk', body === 'c_mage' ? 'Spellcast_Shoot' : '1H_Melee_Attack_Chop'],
    ['pow', 'Spellcast_Raise'],
    ['die', 'Death_A'],
    ['dead', 'Death_A_Pose'],
    ['hit', 'Hit_A'],
    ['dash', 'Dodge_Forward'],
    ['cheer', 'Cheer'],
  ]) {
    const cl = kkClip(c);
    if (cl) act[n] = mixer.clipAction(cl);
  }
  for (const n of ['atk', 'pow', 'die', 'hit', 'dash', 'cheer']) {
    if (act[n]) {
      act[n].setLoop(THREE.LoopOnce, 1);
      act[n].clampWhenFinished = true;
    }
  }
  act.idle.play();
  mixer.update(0);
  wrap.updateMatrixWorld(true);
  if (wrap.userData.pendingHand) {
    const hw = wrap.userData.pendingHand,
      qh = new THREE.Quaternion();
    hw.parent.getWorldQuaternion(qh);
    hw.quaternion.copy(qh.invert());
    delete wrap.userData.pendingHand;
  }
  wrap.userData = {
    kk: true,
    god: id,
    mixer,
    act,
    cur: 'idle',
    mats,
    yaw: 0,
    disp: () => {
      mats.forEach((m) => m.dispose());
      ctx.dispose();
      mixer.stopAllAction();
    },
  };
  return wrap;
}
function mkCtx(mats) {
  const geos = [];
  const M = (c, o) => {
    const m = new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
    m.emissive.set(c).multiplyScalar(0.14);
    m.userData.em0 = m.emissive.clone();
    mats.push(m);
    return m;
  };
  const MB2 = (c, o) => {
    const m = new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
    m.userData.basic = true;
    mats.push(m);
    return m;
  };
  const add = (geo, mat, x, y, z, par, rx, ry, rz) => {
    geos.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = true;
    par.add(m);
    return m;
  };
  const bx = (w, h, d, mat, x, y, z, par, rx, ry, rz) =>
    add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, par, rx, ry, rz);
  const cy = (a, b, h, s, mat, x, y, z, par, rx, ry, rz) =>
    add(new THREE.CylinderGeometry(a, b, h, s), mat, x, y, z, par, rx, ry, rz);
  const sp = (r, mat, x, y, z, par, sx, sy, sz) => {
    const m = add(new THREE.SphereGeometry(r, 12, 9), mat, x, y, z, par);
    if (sx) m.scale.set(sx, sy, sz);
    return m;
  };
  const piv = (par, x, y, z) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    par.add(g);
    return g;
  };
  return { M, MB2, add, bx, cy, sp, piv, dispose: () => geos.forEach((g) => g.dispose()) };
}
/* tocados sobre la cabeza KayKit (centro de la cabeza en 0,0,0; radio ~6) */
function addHeadGear(L, head, ctx, id) {
  const { M, MB2, add, bx, cy, sp, piv } = ctx;
  const R = 6.2,
    gy = R * 0.78,
    gc = L.gc || C.gold,
    mG = M(gc);
  const ring = (r, t, mat, y) => add(new THREE.TorusGeometry(r, t, 5, 22), mat, 0, y, 0, head, Math.PI / 2);
  const hd = L.head;
  const eyes = (x, y, z, col, r) => {
    for (const sx of [-1, 1]) {
      sp(r || 1.05, MB2(col || C.gold), sx * x, y, z, head, 1, 0.8, 0.6);
      sp((r || 1.05) * 0.45, M(INK), sx * x, y, z + 0.45, head, 0.6, 1, 0.6);
    }
  };
  const EGY = /^(anubis|set|ra|horus|thot|sekhmet|isis|osiris)$/.test(id || '');
  const nemes = (c1, c2) => {
    if (!EGY) return;
    for (const sx of [-1, 1])
      for (let i = 0; i < 4; i++) bx(1.9, 2.6, 6, M(i % 2 ? c2 : c1), sx * R * 0.93, -1.4 - i * 2.6, -0.6, head);
    bx(R * 2, 1.6, R * 1.6, M(c2), 0, R * 0.55, -0.8, head);
  };
  if (hd === 'jackal') {
    const k = M(L.h),
      kd = M(shade(L.h, -0.25));
    sp(R * 0.92, k, 0, 0, -0.4, head, 1, 1.02, 1.08);
    add(new THREE.ConeGeometry(2.7, 10, 8), k, 0, -1.8, R * 0.75 + 4.6, head, Math.PI / 2);
    add(new THREE.CylinderGeometry(1.7, 2.3, 6, 8), kd, 0, -3.2, R * 0.7 + 2.8, head, Math.PI / 2);
    sp(1.05, M(INK), 0, -1.5, R * 0.75 + 9.4, head);
    for (const sx of [-1, 1]) {
      const e = add(new THREE.ConeGeometry(2.1, 10, 4), k, sx * 3, R + 3.8, -1.2, head, 0, 0, sx * -0.16);
      add(new THREE.ConeGeometry(1.1, 6.5, 4), M(C.gold), sx * 3, R + 3, -0.4, head, 0, 0, sx * -0.16);
    }
    eyes(2.5, 1.3, R * 0.8, C.gold, 1.1);
    nemes(L.r || '#e8e0cc', L.t || '#2f4f9e');
  }
  if (hd === 'falcon') {
    const k = M(L.h),
      w = M('#f2ead8');
    sp(R * 0.92, k, 0, 0, 0, head, 1, 1.04, 1.06);
    sp(R * 0.62, w, 0, -1.6, R * 0.42, head, 1, 0.9, 0.8);
    add(new THREE.ConeGeometry(2, 5.5, 6), M('#f2c23a'), 0, -0.4, R * 0.95 + 1.6, head, Math.PI / 2);
    add(new THREE.ConeGeometry(1.5, 4.2, 6), M('#2a2420'), 0, -1.9, R * 0.95 + 3.6, head, Math.PI / 2 + 1.1);
    for (const sx of [-1, 1]) bx(0.9, 3.4, 0.6, M(INK), sx * 2.6, -1.6, R * 0.82, head, 0, 0, sx * 0.25);
    eyes(2.5, 0.9, R * 0.8, '#f2c23a', 1.15);
    nemes(L.t || '#2f4f9e', C.gold);
  }
  if (hd === 'ibis') {
    const k = M(L.h),
      bk = M('#1c1a22');
    sp(R * 0.9, k, 0, 0, 0, head, 1, 1.04, 1.08);
    let par = piv(head, 0, -0.6, R * 0.85);
    for (let i = 0; i < 6; i++) {
      const sg = piv(par, 0, 0, i ? 2.4 : 0);
      add(new THREE.CylinderGeometry(0.55 - i * 0.06, 0.75 - i * 0.06, 2.6, 6), bk, 0, 0, 1.2, sg, Math.PI / 2);
      sg.rotation.x = i ? 0.2 : 0.05;
      par = sg;
    }
    eyes(2.4, 1.1, R * 0.78, '#e8c86a', 1);
    nemes(L.t || '#3d8a94', C.gold);
  }
  if (hd === 'lion') {
    const mane = M(L.h),
      k = M(L.s);
    sp(R * 1.42, mane, 0, -0.6, -1.6, head, 1, 1.05, 0.75);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * 6.283;
      add(
        new THREE.ConeGeometry(1.8, 5, 5),
        mane,
        Math.cos(a) * R * 1.35,
        -0.6 + Math.sin(a) * R * 1.35,
        -2,
        head,
        0,
        0,
        a - Math.PI / 2
      );
    }
    sp(R * 0.88, k, 0, 0, 0.8, head);
    sp(R * 0.5, M(shade(L.s, 0.12)), 0, -2.2, R * 0.72, head, 1.1, 0.75, 0.8);
    bx(2.6, 1.6, 1.4, M('#5a2a22'), 0, -0.8, R * 1.08, head);
    for (const sx of [-1, 1]) sp(1.6, k, sx * R * 0.7, R * 0.75, -0.4, head, 1, 1, 0.5);
    eyes(2.4, 1.1, R * 0.8, '#f2c23a', 1.05);
  }
  if (hd === 'elephant') {
    const k = M(L.s),
      kd = M(shade(L.s, -0.15));
    sp(R * 0.98, k, 0, 0.4, 0, head, 1, 1.05, 1);
    for (const sx of [-1, 1]) {
      const ear = sp(R * 1.15, kd, sx * R * 1.15, -0.6, -1.2, head, 0.22, 1, 1);
      ear.rotation.y = sx * 0.35;
      sp(R * 0.85, M('#e8a0a8'), sx * R * 1.12, -0.6, -0.9, head, 0.18, 0.85, 0.85).rotation.y = sx * 0.35;
      add(new THREE.ConeGeometry(0.75, 6, 6), MB2('#f8f2e0'), sx * 2.4, -3.8, R * 0.72 + 2.4, head, Math.PI / 2 + 0.9);
    }
    let par = piv(head, 0, -1.6, R * 0.85);
    for (let i = 0; i < 7; i++) {
      const sg = piv(par, 0, i ? -2.5 : 0, 0);
      add(new THREE.CylinderGeometry(1.7 - i * 0.17, 1.9 - i * 0.17, 2.7, 8), k, 0, -1.25, 0, sg);
      sg.rotation.x = i ? (i < 5 ? -0.08 : -0.5) : -0.35;
      par = sg;
    }
    eyes(2.8, 1.4, R * 0.84, '#1c1210', 0.8);
  }
  if (hd === 'serpent') {
    const sc = M(L.gc || '#3aa07a'),
      bel = M('#e8d07a');
    sp(R * 0.9, sc, 0, 0, 0, head, 1, 0.92, 1.15);
    sp(R * 0.62, sc, 0, -1.4, R * 0.62 + 2.8, head, 1, 0.55, 1.25);
    sp(R * 0.5, bel, 0, -2.6, R * 0.6 + 2.2, head, 1, 0.35, 1.2);
    const tg = piv(head, 0, -2.8, R * 0.6 + 8.4);
    bx(0.35, 0.25, 3, M('#e23a3a'), 0, 0, 1.4, tg);
    for (const sx of [-1, 1]) bx(0.3, 0.22, 1.4, M('#e23a3a'), sx * 0.4, 0, 3.3, tg, 0, sx * 0.5, 0);
    for (const sx of [-1, 1]) {
      sp(1.1, MB2('#ffd34d'), sx * 2.4, 1, R * 0.78, head, 1, 0.8, 0.6);
      bx(0.25, 1.5, 0.4, M(INK), sx * 2.4, 1, R * 0.78 + 0.6, head);
    }
    const fc = ['#3aa07a', '#e23a3a', '#2f6fd6', '#ffc23a', '#3aa07a'];
    for (let i = 0; i < 11; i++) {
      const a = Math.PI * (-0.1 + (i / 10) * 1.2);
      const f = add(
        new THREE.ConeGeometry(1.4, 9, 4),
        M(fc[i % 5]),
        Math.cos(a) * R * 1.2,
        Math.sin(a) * R * 1.2 + 0.5,
        -2.4,
        head,
        0,
        0,
        a - Math.PI / 2
      );
      f.scale.z = 0.35;
    }
  }
  if (hd === 'dragon') {
    const k = M(L.s),
      kd = M(shade(L.s, -0.25)),
      hn = M(L.gc || '#e8e0cc');
    sp(R * 0.92, k, 0, 0, 0, head, 1, 0.95, 1.1);
    bx(R * 1.05, R * 0.55, R * 1.3, k, 0, -1.2, R * 0.75 + 2, head);
    bx(R * 0.95, R * 0.28, R * 1.2, kd, 0, -3.6, R * 0.7 + 1.6, head);
    for (const sx of [-1, 1]) {
      sp(0.6, M(INK), sx * 1.6, -0.4, R * 0.75 + 6, head);
      const h1 = add(new THREE.ConeGeometry(1.3, 9, 6), hn, sx * 3.2, R * 0.85, -2.4, head, -0.9, 0, sx * -0.35);
    }
    for (let i = 0; i < 5; i++)
      add(new THREE.ConeGeometry(1, 3.2, 4), hn, 0, R * 0.85 - i * 1.4, -R * 0.6 - i * 1.2, head, -0.6 - i * 0.2);
    eyes(2.8, 0.9, R * 0.82, '#ff6a2a', 1);
  }
  if (hd === 'light') {
    add(new THREE.IcosahedronGeometry(R * 0.95, 1), MB2('#fff6e0'), 0, 0, 0, head);
    add(new THREE.IcosahedronGeometry(R * 0.65, 1), MB2('#ffffff'), 0, 0, 2.4, head);
    const rays = piv(head, 0, 0, -3.6);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * 6.283;
      bx(
        1.2,
        i % 2 ? 8 : 5.5,
        0.5,
        MB2(i % 2 ? '#f4d27a' : '#fff6e0'),
        Math.cos(a) * 10,
        Math.sin(a) * 10,
        0,
        rays,
        0,
        0,
        a - Math.PI / 2
      );
    }
    head.userData.rays = rays;
  }
  if (!hd) {
    const hs = L.hs,
      mH = M(L.h);
    if (head.userData.bald && hs !== 'bald') {
      const cap = add(
        new THREE.SphereGeometry(R * 1.05, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.36),
        mH,
        0,
        -0.2,
        -0.6,
        head
      );
      cap.scale.set(1.04, 1.05, 1.1);
      if (hs === 'long') {
        const g2 = new THREE.CylinderGeometry(R * 1.02, R * 1.12, R * 1.4, 14, 1, true, Math.PI * 0.5, Math.PI);
        add(g2, M(L.h, { side: THREE.DoubleSide }), 0, -R * 0.75, -0.4, head);
      }
    }
    if (hs === 'bun') sp(3, mH, 0, R * 0.9, -2.8, head);
    if (hs === 'buns') {
      sp(2.6, mH, -R * 0.75, R * 0.7, -0.4, head);
      sp(2.6, mH, R * 0.75, R * 0.7, -0.4, head);
    }
    if (hs === 'spiky')
      for (let i = 0; i < 6; i++)
        add(
          new THREE.ConeGeometry(1.7, 6, 5),
          mH,
          -5 + i * 2,
          R + 1.6 - Math.abs(i - 2.5) * 0.5,
          -1 + (i % 2),
          head,
          0,
          0,
          (i - 2.5) * -0.28
        );
    if (hs === 'flame') {
      const fl = piv(head, 0, R * 0.7, 0);
      for (let i = 0; i < 9; i++)
        add(
          new THREE.ConeGeometry(2, 7 + ((i * 7) % 4), 6),
          MB2(i % 2 ? '#7ad0ff' : '#c8f0ff', { transparent: true, opacity: 0.9 }),
          -5.5 + i * 1.4,
          2.6,
          -1.5 + (i % 3),
          fl,
          0,
          0,
          (i - 4) * -0.16
        );
      head.userData.flame = fl;
    }
    if (L.ex === 'thirdeye') sp(0.9, MB2('#e23a2a'), 0, 1.6, R * 0.97, head);
    if (L.ex === 'eyepatch') {
      bx(3.4, 2.6, 0.6, M(INK), -2.2, 0, R * 0.95, head);
      ring(R * 1.0, 0.25, M(INK), 0.6);
    }
    if (L.ex === 'mask') {
      for (const sx of [-2.3, 2.3])
        add(new THREE.TorusGeometry(1.6, 0.45, 4, 10), M('#2f4f9e'), sx, 0.2, R * 0.95, head);
    }
    if (L.ex === 'stripes') {
      for (const y of [-1.2, 1.2]) bx(R * 1.8, 0.7, 0.4, M(y > 0 ? '#e8b53e' : INK), 0, y - 0.6, R * 0.92, head);
    }
  }
  switch (L.gear) {
    case 'laurel': {
      const lc = gc === C.gold || gc === '#e8b53e' ? '#6f9a4c' : gc;
      const ml = M(lc),
        ml2 = M(shade(lc, 0.2));
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 1.7 + Math.PI * 1.15;
        add(
          new THREE.SphereGeometry(1, 6, 4),
          i % 2 ? ml : ml2,
          Math.cos(a) * R * 0.97,
          R * 0.42,
          Math.sin(a) * R * 0.97,
          head
        ).scale.set(1.7, 0.7, 1);
      }
      break;
    }
    case 'crown': {
      const cyy = R * 0.6,
        cr = R * 0.84;
      add(
        new THREE.CylinderGeometry(cr, cr * 0.97, 2.4, 16, 1, true),
        M(gc, { side: THREE.DoubleSide }),
        0,
        cyy,
        0,
        head
      );
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 6.283;
        add(new THREE.ConeGeometry(0.9, 2.8, 4), mG, Math.cos(a) * cr, cyy + 2.4, Math.sin(a) * cr, head);
      }
      sp(0.9, MB2(C.blood), 0, cyy, cr + 0.3, head);
      break;
    }
    case 'helmet': {
      const h = add(
        new THREE.SphereGeometry(R * 1.08, 16, 9, 0, Math.PI * 2, 0, Math.PI * 0.55),
        mG,
        0,
        0.4,
        -0.2,
        head
      );
      bx(1.2, 3, R * 1.5, M(C.blood), 0, R + 0.8, -0.8, head);
      bx(1.3, 0.9, R * 1.55, M(shade(C.blood, 0.25)), 0, R + 2.3, -0.8, head);
      break;
    }
    case 'horns':
      for (const sx of [-1, 1]) {
        add(new THREE.ConeGeometry(1.4, 7, 6), mG, sx * R * 0.85, gy + 1.6, 0, head, 0, 0, sx * -0.8);
        add(new THREE.ConeGeometry(0.9, 3.8, 6), mG, sx * R * 1.2, gy + 4.4, 0, head, 0, 0, sx * -0.2);
      }
      break;
    case 'feathers': {
      ring(R * 0.95, 1, M(C.gold), R * 0.45);
      for (let i = -3; i <= 3; i++) {
        const f = piv(head, i * 1.4, gy, -R * 0.6);
        const l = 10 + (3 - Math.abs(i)) * 1.6;
        sp(1.1, M(i % 2 ? gc : shade(gc, 0.25)), 0, l / 2, 0, f, 1, l / 2.2, 0.35);
        sp(0.9, M(i % 2 ? C.gold : C.blood), 0, l, 0, f);
        f.rotation.z = -i * 0.24;
        f.rotation.x = -0.2;
      }
      break;
    }
    case 'sun':
      if (hd !== 'falcon') {
        cy(7, 7, 0.8, 18, MB2(C.gold), 0, gy + 3, -R * 0.9, head, Math.PI / 2);
        cy(4.4, 4.4, 1, 14, MB2('#f2622c'), 0, gy + 3, -R * 0.85, head, Math.PI / 2);
      }
      ring(R * 0.95, 0.6, mG, R * 0.42);
      break;
    case 'moon':
      add(
        new THREE.TorusGeometry(3.4, 1.1, 6, 12, Math.PI * 1.25),
        MB2('#e8eef8'),
        0,
        gy + 3.8,
        0,
        head,
        0,
        0,
        -Math.PI * 0.12
      );
      ring(R * 0.95, 0.5, M('#c8ccd8'), R * 0.42);
      break;
    case 'halo': {
      const h = ring(R * 1.1, 0.7, MB2('#f8e080'), gy + 4);
      head.userData.halo = h;
      break;
    }
    case 'band':
      ring(R * 0.97, 0.9, mG, R * 0.4);
      break;
    case 'hat':
      cy(R * 1.8, R * 1.8, 1.1, 18, mG, 0, gy + 0.4, 0, head);
      cy(R * 0.9, R * 1.05, 6, 14, mG, 0, gy + 3.6, 0, head);
      ring(R * 1.0, 0.5, M(shade(gc, 0.3)), gy + 1.2);
      break;
    case 'diadem':
      ring(R * 0.96, 0.45, mG, R * 0.42);
      sp(1, MB2('#7de0ff'), 0, R * 0.42, R * 0.97, head);
      break;
  }
}
function animGodKK(m, p, dt) {
  const u = m.userData;
  p.atk = Math.max(0, (p.atk || 0) - dt);
  p.powAnim = Math.max(0, (p.powAnim || 0) - dt);
  let want = p.down ? 'dead' : p.air ? 'jump' : p.moving ? 'run' : 'idle';
  if (p.powAnim > 0.5 && !u.powLock) {
    u.powLock = true;
  }
  if (p.powAnim <= 0) u.powLock = false;
  const one = u.one && u.act[u.one] && u.act[u.one].isRunning() ? u.one : null;
  if (!p.down) {
    if (p.powAnim > 0.6 && u.one !== 'pow') {
      playOne(u, 'pow');
    } else if (p.dashT > 0.15 && u.one !== 'dash') {
      playOne(u, 'dash');
    } else if (p.atk > 0.2 && !p.moving && !p.air && !one) {
      playOne(u, 'atk');
    }
  }
  if (u.one && !(u.act[u.one] && u.act[u.one].isRunning())) {
    u.act[u.one].fadeOut(0.15);
    u.one = null;
  }
  if (want !== u.cur) {
    const a = u.act[u.cur],
      b = u.act[want];
    if (b) {
      b.reset();
      b.setEffectiveWeight(1);
      b.play();
      if (a) a.crossFadeTo(b, 0.18, false);
    }
    u.cur = want;
  }
  u.mixer.update(dt * (p.moving && want === 'run' ? Math.min(1.5, 0.85 + (p.speed || 150) / 400) : 1));
  if (u.cape) u.cape.rotation.x = 0.15 + (p.moving ? 0.5 : 0) + (p.air ? 0.4 : 0) + Math.sin(T * 6) * 0.05;
  if (u.tail) u.tail.rotation.y = Math.sin(T * 3) * 0.5;
  const ty = Math.atan2(p.fx || 0, p.fy || 1);
  u.yaw = angLerp(u.yaw, ty, Math.min(1, dt * 12));
  m.rotation.y = u.yaw;
  const R = m.children[0];
  const head = findBoneCached(m, 'head');
  if (head) {
    for (const c of head.children) {
      if (c.userData.rays) c.userData.rays.rotation.z = T * 0.6;
      if (c.userData.flame) c.userData.flame.scale.y = 1 + Math.sin(T * 14) * 0.12;
    }
  }
  const fl = p.inv > 0 && p.inv < 0.45 && Math.floor(p.inv * 20) % 2 === 0 && !p.down,
    hid = p.hidden > 0,
    ghost = p.ctrl === 'net' && p.dn;
  if (u.fl !== fl || u.hid !== hid || u.gh !== ghost) {
    u.fl = fl;
    u.hid = hid;
    u.gh = ghost;
    for (const mm of u.mats) {
      if (mm.emissive && !mm.userData.basic) {
        if (fl) mm.emissive.set('#ffffff');
        else if (mm.userData.em0) mm.emissive.copy(mm.userData.em0);
        else mm.emissive.set('#000000');
      }
      mm.transparent = hid || ghost;
      mm.opacity = hid ? 0.35 : ghost ? 0.5 : 1;
    }
  }
}
function playOne(u, n) {
  const a = u.act[n];
  if (!a) return;
  if (u.one && u.act[u.one]) u.act[u.one].fadeOut(0.1);
  a.reset();
  a.setEffectiveWeight(1);
  a.fadeIn(0.08);
  a.play();
  u.one = n;
}
function findBoneCached(m, n) {
  const u = m.userData;
  u.bones = u.bones || {};
  if (!(n in u.bones)) u.bones[n] = findBone(m, n);
  return u.bones[n];
}
