/* ---------- constructor de dioses (low-poly redondeado, proporciones realistas) ---------- */
function headCv(L, hd) {
  const W = 48,
    H = 24,
    cx = 24;
  const skin = L.s,
    hair = L.h || INK,
    hs = L.hs || 'short',
    eye = L.eye || '#2a1a10';
  const hc = hs === 'flame' ? '#5ab0ff' : hair;
  return pcv(W, H, (P, R) => {
    R(0, 0, W, H, skin);
    for (let x = 0; x < W; x++) {
      const d = Math.min(Math.abs(x - cx), W - Math.abs(x - cx));
      if (d > 14) P(x, H - 1, shade(skin, -0.1));
    }
    if (hd === 'jackal' || hd === 'falcon') {
      R(0, 0, W, H, hair);
      R(cx - 7, 10, 4, 2, C.gold);
      R(cx + 3, 10, 4, 2, C.gold);
      P(cx - 5, 10, INK);
      P(cx + 5, 10, INK);
      if (hd === 'falcon') {
        R(cx - 9, 12, 2, 7, '#2f4f9e');
        R(cx + 7, 12, 2, 7, '#2f4f9e');
        R(cx - 4, 14, 8, 8, '#e8e0cc');
      }
      return;
    }
    if (hs !== 'bald') {
      const back = hs === 'long' ? H : 16;
      R(0, 0, W, 6, hc);
      for (let x = 0; x < W; x++) {
        const d = Math.abs(x - cx);
        if (d > 9) R(x, 0, 1, d > 16 ? back : 9, hc);
        else if (x % 3 !== 0) P(x, 6, hc);
      }
      for (let x = 0; x < W; x += 2) R(x, 1 + (x % 4 ? 0 : 1), 1, 4, shade(hc, -0.16));
      for (let x = 1; x < W; x += 5) P(x, 1, shade(hc, 0.3));
    } else R(cx - 10, 0, 20, 3, shade(skin, 0.08));
    if (hd === 'monkey') {
      R(cx - 6, 13, 12, 8, shade(skin, 0.25));
    }
    if (hd === 'lion') {
      R(cx - 6, 14, 12, 7, shade(skin, 0.15));
    }
    const br = hs === 'bald' ? shade(skin, -0.4) : shade(hair, -0.15);
    R(cx - 7, 9, 4, 1, br);
    R(cx + 3, 9, 4, 1, br);
    for (const [x0, dir] of [
      [cx - 7, 1],
      [cx + 3, -1],
    ]) {
      R(x0, 10, 4, 2, '#ffffff');
      const ix = dir > 0 ? x0 + 1 : x0 + 1;
      R(ix, 10, 2, 2, eye);
      P(ix + (dir > 0 ? 1 : 0), 11, INK);
      P(ix, 10, '#ffffff');
      P(x0, 9, shade(skin, -0.35));
    }
    R(cx - 2, 15, 4, 1, shade(skin, -0.45));
    P(cx - 3, 15, shade(skin, -0.2));
    P(cx + 2, 15, shade(skin, -0.2));
    R(cx - 1, 16, 2, 1, shade(skin, -0.12));
    P(cx - 8, 13, '#f09a8a');
    P(cx - 7, 13, '#f0a898');
    P(cx + 6, 13, '#f0a898');
    P(cx + 7, 13, '#f09a8a');
    if (L.b === 'full') {
      const bc = L.bc;
      for (let y = 13; y < H; y++) {
        const w = Math.round(10 - Math.max(0, y - 19) * 1.4);
        R(cx - w, y, w * 2, 1, bc);
      }
      R(cx - 4, 14, 8, 1, shade(bc, 0.15));
      R(cx - 2, 15, 4, 1, shade(bc, -0.5));
      for (let x = cx - 9; x < cx + 9; x += 2) R(x, 17 + (x % 4 ? 1 : 0), 1, 5, shade(bc, -0.2));
    }
    if (L.b === 'short') {
      const bc = L.bc;
      R(cx - 4, 14, 8, 1, bc);
      R(cx - 5, 16, 10, 4, bc);
      R(cx - 2, 15, 4, 1, shade(skin, -0.45));
    }
    if (L.ex === 'eyepatch') {
      R(cx - 8, 8, 6, 5, INK);
      for (let x = 0; x < W; x++) P(x, Math.round(8 - Math.sin((x - cx) / 8) * 1), INK);
    }
    if (L.ex === 'thirdeye') {
      R(cx - 1, 6, 2, 3, '#e23a2a');
      P(cx, 6, '#f8e060');
    }
    if (L.ex === 'stripes') {
      R(cx - 12, 10, 24, 1, '#1c1210');
      R(cx - 12, 12, 24, 1, '#e8b53e');
      R(cx - 12, 14, 24, 1, '#1c1210');
    }
    if (L.ex === 'mask') {
      for (const x0 of [cx - 8, cx + 2]) {
        R(x0, 9, 6, 1, '#2f4f9e');
        R(x0, 12, 6, 1, '#2f4f9e');
        R(x0, 9, 1, 4, '#2f4f9e');
        R(x0 + 5, 9, 1, 4, '#2f4f9e');
      }
      R(cx - 3, 16, 6, 2, '#e8e0cc');
    }
  });
}
function wrapCv(W, H, fn) {
  return pcv(W, H, fn);
}
function buildGod(id) {
  const L0 = LOOKS[id] || {},
    light = L0.head === 'light';
  const L = Object.assign({}, L0, { s: light ? '#fff6e0' : L0.s || C.skin, h: L0.h || INK });
  const skin = L.s,
    robe = light ? '#fff6e0' : L.r || '#e8e0cc',
    trim = light ? '#f4d27a' : L.t || C.gold,
    hair = L.h,
    hc = L.hc || C.gold,
    gc = L.gc || C.gold;
  const mats = [],
    geos = [],
    texs = [];
  const M = (c, o) => {
    const m = new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
    m.emissive.set(c).multiplyScalar(0.16);
    if (m.map) {
      m.emissiveMap = m.map;
      m.emissive.set('#2c2c2c');
    }
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
  const MT = (cv, o) => {
    const t = pxTex(cv);
    texs.push(t);
    return M('#ffffff', Object.assign({ map: t }, o || {}));
  };
  const root = new THREE.Group();
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
  const body = piv(root, 0, 0, 0);
  const mSkin = M(skin),
    mSkinD = M(shade(skin, -0.08)),
    mSand = M('#6a4a2a'),
    mStrap = M('#3a2416'),
    mRobe = M(robe),
    mTrim = M(trim);
  // piernas con rodilla
  const legs = [];
  for (const sx of [-2.4, 2.4]) {
    const hip = piv(body, sx, 20.5, 0);
    add(new THREE.CylinderGeometry(1.9, 1.6, 10, 10), mSkin, 0, -5, 0, hip);
    const knee = piv(hip, 0, -10, 0);
    add(new THREE.CylinderGeometry(1.6, 1.2, 9.4, 10), mSkin, 0, -4.7, 0, knee);
    const ft = sp(1.6, mSand, 0, -9.6, 1, knee, 1.1, 0.6, 2);
    sp(1.25, mStrap, 0, -7.6, 0, knee, 1.15, 0.4, 1.15);
    for (let i = 0; i < 3; i++)
      add(new THREE.TorusGeometry(1.35, 0.25, 4, 10), mStrap, 0, -6 - i * 1.4, 0, knee, Math.PI / 2);
    legs.push({ hip, knee });
  }
  const torso = piv(body, 0, 20.5, 0);
  // falda con textura envolvente (frente en el centro)
  const skirtT = MT(
    wrapCv(48, 16, (P, R) => {
      R(0, 0, 48, 16, robe);
      for (let x = 1; x < 48; x += 3) {
        R(x, 0, 1, 12, shade(robe, -0.13));
        P(x + 1, 2, shade(robe, 0.1));
      }
      R(0, 12, 48, 4, trim);
      for (let x = 0; x < 48; x += 2) P(x, 13, shade(trim, -0.35));
      R(0, 12, 48, 1, shade(trim, 0.25));
    }),
    { side: THREE.DoubleSide }
  );
  {
    const g = new THREE.CylinderGeometry(4.9, 7, 11.5, 14, 1, true, Math.PI, Math.PI * 2);
    const m = add(g, skirtT, 0, -4.4, 0, torso);
    m.scale.z = 0.8;
  }
  {
    const m = add(new THREE.CylinderGeometry(5.1, 5.1, 1.8, 14), mTrim, 0, 1.4, 0, torso);
    m.scale.z = 0.8;
    bx(1.8, 1.6, 0.5, M('#ffffff'), 0, 1.4, 4.2, torso);
  }
  const chestT = MT(
    wrapCv(48, 16, (P, R) => {
      R(0, 0, 48, 16, robe);
      for (let x = 0; x < 48; x += 4) R(x, 2, 1, 14, shade(robe, -0.08));
      for (let i = 0; i < 14; i++) {
        P(17 + i, 15 - i, trim);
        P(18 + i, 15 - i, trim);
        P(17 + i, 16 - i, shade(trim, -0.25));
      }
      R(20, 0, 8, 1, shade(robe, -0.25));
      for (let i = 0; i < 4; i++) {
        P(21 + i, 1 + i, shade(robe, -0.2));
        P(27 - i, 1 + i, shade(robe, -0.2));
      }
      if (L.ex === 'sash')
        for (let i = 0; i < 14; i++) {
          P(30 - i, 15 - i, '#e27aa8');
          P(31 - i, 15 - i, '#e27aa8');
        }
      if (light) for (let x = 1; x < 48; x += 3) R(x, 0, 1, 16, '#fff2c8');
    })
  );
  {
    const m = add(
      new THREE.CylinderGeometry(5.7, 4.7, 10.5, 14, 1, false, Math.PI, Math.PI * 2),
      [chestT, mRobe, mRobe],
      0,
      7.4,
      0,
      torso
    );
    m.scale.z = 0.72;
  }
  sp(2.4, M(shade(robe, 0.08)), -5.6, 11.8, 0, torso, 1, 0.85, 1);
  sp(2.4, M(shade(robe, 0.08)), 5.6, 11.8, 0, torso, 1, 0.85, 1);
  add(new THREE.CylinderGeometry(1.5, 1.8, 3.2, 10), mSkinD, 0, 13.6, 0, torso);
  // brazos con codo
  const arms = [];
  for (const sx of [-1, 1]) {
    const sh = piv(torso, sx * 6.1, 11.6, 0);
    add(new THREE.CylinderGeometry(1.55, 1.35, 8, 10), mSkin, 0, -4, 0, sh);
    add(new THREE.CylinderGeometry(1.9, 1.75, 3, 10), mRobe, 0, -1, 0, sh);
    const el = piv(sh, 0, -8, 0);
    add(new THREE.CylinderGeometry(1.35, 1.1, 7.2, 10), mSkin, 0, -3.6, 0, el);
    add(new THREE.TorusGeometry(1.35, 0.4, 4, 10), mTrim, 0, -5, 0, el, Math.PI / 2);
    sp(1.5, mSkinD, 0, -7.9, 0.2, el, 1, 1.2, 0.9);
    const hand = piv(el, 0, -8.2, 0.4);
    arms.push({ sh, el, hand });
  }
  const armL = arms[0],
    armR = arms[1];
  // cabeza redondeada
  const head = piv(torso, 0, 14.8, 0);
  const hd = L.head;
  const HY = 5.2,
    HR = 5.3;
  if (hd === 'light') {
    add(new THREE.IcosahedronGeometry(5.6, 1), MB2('#fff6e0'), 0, HY, 0, head);
    add(new THREE.IcosahedronGeometry(3.8, 1), MB2('#ffffff'), 0, HY, 2.2, head);
    const rays = piv(head, 0, HY, -3);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * 6.283;
      bx(
        1.1,
        i % 2 ? 7 : 5,
        0.5,
        MB2(i % 2 ? '#f4d27a' : '#fff6e0'),
        Math.cos(a) * 8.6,
        Math.sin(a) * 8.6,
        0,
        rays,
        0,
        0,
        a - Math.PI / 2
      );
    }
    head.userData.rays = rays;
  } else {
    const ht = MT(headCv(L, hd));
    const g = new THREE.SphereGeometry(HR, 16, 12, -Math.PI / 2);
    const hm = add(g, ht, 0, HY, 0, head);
    hm.scale.set(1, 1.07, 1.02);
    if (!hd || hd === 'monkey' || hd === 'lion') {
      bx(1, 1.5, 1.4, M(shade(skin, -0.04)), 0, HY - 0.4, HR * 0.98, head);
      sp(1, M(shade(skin, -0.08)), -HR, HY, 0, head, 0.6, 1.2, 0.8);
      sp(1, M(shade(skin, -0.08)), HR, HY, 0, head, 0.6, 1.2, 0.8);
    }
    const mH = M(hair);
    if (!hd && L.hs !== 'bald') {
      const cap = add(
        new THREE.SphereGeometry(HR + 0.35, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.42),
        L.hs === 'flame' ? MB2('#5ab0ff') : mH,
        0,
        HY + 0.2,
        -0.15,
        head
      );
      cap.scale.set(1, 1.08, 1.03);
      if (L.hs === 'long') {
        const g2 = new THREE.CylinderGeometry(HR + 0.2, HR + 0.9, 10, 14, 1, true, Math.PI * 0.5, Math.PI);
        const lh = add(g2, M(hair, { side: THREE.DoubleSide }), 0, HY - 3.4, 0, head);
        lh.scale.z = 0.95;
      }
      if (L.hs === 'bun') sp(2.6, mH, 0, HY + 5.4, -2.6, head);
      if (L.hs === 'buns') {
        sp(2.4, mH, -4.2, HY + 4.4, -0.5, head);
        sp(2.4, mH, 4.2, HY + 4.4, -0.5, head);
      }
      if (L.hs === 'spiky')
        for (let i = 0; i < 6; i++)
          add(
            new THREE.ConeGeometry(1.5, 5, 5),
            mH,
            -4.5 + i * 1.8,
            HY + 5.8 - Math.abs(i - 2.5) * 0.4,
            -1 + (i % 2),
            head,
            0,
            0,
            (i - 2.5) * -0.28
          );
      if (L.hs === 'flame') {
        const fl = piv(head, 0, HY + 4, 0);
        for (let i = 0; i < 8; i++)
          add(
            new THREE.ConeGeometry(1.8, 6 + ((i * 7) % 4), 6),
            MB2(i % 2 ? '#7ad0ff' : '#c8f0ff', { transparent: true, opacity: 0.9 }),
            -4.6 + i * 1.3,
            2.4,
            -1 + (i % 3) * 0.8,
            fl,
            0,
            0,
            (i - 3.5) * -0.16
          );
        head.userData.flame = fl;
      }
    }
    if (hd === 'jackal') {
      add(new THREE.CylinderGeometry(1.6, 2.6, 7, 8), M(hair), 0, HY - 1, 6, head, Math.PI / 2);
      sp(0.8, M(INK), 0, HY - 0.4, 9.6, head);
      for (const sx of [-2.8, 2.8]) {
        add(new THREE.ConeGeometry(1.6, 7, 5), M(hair), sx, HY + 7.6, -0.5, head);
      }
      const col = add(new THREE.CylinderGeometry(5.8, 6.4, 2.2, 14), M(C.gold), 0, -0.8, 0, head);
      col.scale.z = 0.8;
    }
    if (hd === 'falcon') {
      add(new THREE.ConeGeometry(1.6, 4.6, 6), M(C.gold), 0, HY - 0.4, 6.6, head, Math.PI / 2 + 0.5);
      cy(5, 5, 0.8, 16, MB2(C.gold), 0, HY + 8, -2, head, Math.PI / 2);
      cy(3.2, 3.2, 1, 14, MB2('#f2622c'), 0, HY + 8, -1.6, head, Math.PI / 2);
      for (const sx of [-5.2, 5.2]) bx(1.6, 10, 5, M('#2f4f9e'), sx, HY - 2.6, -0.6, head);
    }
    if (hd === 'lion') {
      const mn = sp(8, M(L.h), 0, HY - 0.4, -2.4, head, 1, 1, 0.7);
      sp(1.4, M(L.h), -4, HY + 4.6, 1, head);
      sp(1.4, M(L.h), 4, HY + 4.6, 1, head);
    }
    if (hd === 'monkey') {
      sp(1.8, M(L.h), -5.8, HY + 0.6, 0, head, 0.5, 1, 1);
      sp(1.8, M(L.h), 5.8, HY + 0.6, 0, head, 0.5, 1, 1);
    }
    if (L.b === 'full') {
      const mB = M(L.bc);
      sp(4.3, mB, 0, HY - 3.6, 2.4, head, 1, 1, 0.62);
      add(new THREE.ConeGeometry(3, 5, 10), mB, 0, HY - 7.4, 2.6, head, Math.PI, 0, 0);
    }
    if (L.b === 'short') sp(3, M(L.bc), 0, HY - 3.6, 3, head, 1, 0.6, 0.5);
  }
  // tocados
  const gy = HY + 4.4,
    mG = M(gc);
  const ring = (r, t, mat, y, par, tube) =>
    add(new THREE.TorusGeometry(r, t, 5, 22), mat, 0, y, 0, par || head, Math.PI / 2);
  switch (L.gear) {
    case 'laurel': {
      const lc = gc === C.gold || gc === '#e8b53e' ? '#6f9a4c' : gc;
      const ml = M(lc),
        ml2 = M(shade(lc, 0.2));
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 1.7 + Math.PI * 1.15;
        add(
          new THREE.SphereGeometry(0.9, 6, 4),
          i % 2 ? ml : ml2,
          Math.cos(a) * 5.5,
          gy - 1.4,
          Math.sin(a) * 5.6,
          head
        ).scale.set(1.6, 0.7, 1);
      }
      break;
    }
    case 'crown': {
      const cr = add(
        new THREE.CylinderGeometry(5.7, 5.5, 2, 16, 1, true),
        M(gc, { side: THREE.DoubleSide }),
        0,
        gy,
        0,
        head
      );
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 6.283;
        add(new THREE.ConeGeometry(0.9, 2.6, 4), mG, Math.cos(a) * 5.6, gy + 2.2, Math.sin(a) * 5.6, head);
      }
      sp(0.9, MB2(C.blood), 0, gy, 5.7, head);
      break;
    }
    case 'helmet': {
      const h = add(
        new THREE.SphereGeometry(HR + 0.7, 16, 9, 0, Math.PI * 2, 0, Math.PI * 0.55),
        mG,
        0,
        HY + 0.3,
        -0.2,
        head
      );
      h.scale.set(1, 1.08, 1.05);
      bx(1.6, 4, 12.6, M(C.blood), 0, gy + 2, -0.8, head);
      bx(1.7, 1.2, 12.8, M(shade(C.blood, 0.25)), 0, gy + 4, -0.8, head);
      for (const sx of [-4.3, 4.3]) bx(1.4, 4.6, 2.6, mG, sx, HY - 2.6, 3.4, head);
      break;
    }
    case 'horns':
      for (const sx of [-1, 1]) {
        add(new THREE.ConeGeometry(1.2, 6, 6), mG, sx * 5, gy + 1.4, 0, head, 0, 0, sx * -0.8);
        add(new THREE.ConeGeometry(0.8, 3.4, 6), mG, sx * 7.2, gy + 4, 0, head, 0, 0, sx * -0.2);
      }
      break;
    case 'feathers': {
      ring(5.7, 0.9, M(C.gold), gy - 1);
      for (let i = -3; i <= 3; i++) {
        const f = piv(head, i * 1.2, gy, -3.4);
        const l = 9 + (3 - Math.abs(i)) * 1.4;
        sp(1, M(i % 2 ? gc : shade(gc, 0.25)), 0, l / 2, 0, f, 1, l / 2, 0.35);
        sp(0.8, M(i % 2 ? C.gold : C.blood), 0, l, 0, f);
        f.rotation.z = -i * 0.24;
        f.rotation.x = -0.2;
      }
      break;
    }
    case 'sun':
      cy(6.2, 6.2, 0.8, 18, MB2(C.gold), 0, gy + 2.6, -5.2, head, Math.PI / 2);
      cy(3.8, 3.8, 1, 14, MB2('#f2622c'), 0, gy + 2.6, -4.8, head, Math.PI / 2);
      ring(5.6, 0.6, mG, gy - 1.2);
      break;
    case 'moon':
      add(
        new THREE.TorusGeometry(3, 1, 6, 12, Math.PI * 1.25),
        MB2('#e8eef8'),
        0,
        gy + 3.4,
        0,
        head,
        0,
        0,
        -Math.PI * 0.12
      );
      ring(5.6, 0.5, M('#c8ccd8'), gy - 1.2);
      break;
    case 'halo': {
      const h = ring(6, 0.6, MB2('#f8e080'), gy + 3.6);
      head.userData.halo = h;
      break;
    }
    case 'band':
      ring(5.6, 0.9, mG, gy - 1.6);
      break;
    case 'hat':
      cy(9.6, 9.6, 1, 18, mG, 0, gy + 0.4, 0, head);
      cy(4.8, 5.6, 5.6, 14, mG, 0, gy + 3.4, 0, head);
      ring(5.4, 0.5, M(shade(gc, 0.3)), gy + 1.2);
      break;
    case 'diadem':
      ring(5.6, 0.45, mG, gy - 1.2);
      sp(0.9, MB2('#7de0ff'), 0, gy - 1.2, 5.7, head);
      break;
  }
  // extras
  let cape = null,
    drums = null,
    tail = null;
  const xarms = [];
  if (L.ex === 'cape') {
    cape = piv(torso, 0, 12.4, -3.2);
    const g = new THREE.CylinderGeometry(6, 8.5, 22, 12, 1, true, Math.PI * 0.6, Math.PI * 0.8);
    const m = add(g, M(L.cc || C.blood, { side: THREE.DoubleSide }), 0, -11, 1.6, cape);
    m.scale.z = 0.6;
  }
  if (L.ex === 'shield') {
    const sh = piv(armL.el, -1.8, -4, 0);
    cy(5.4, 5.4, 0.9, 16, M(shade(trim, -0.1)), 0, 0, 0, sh, 0, 0, Math.PI / 2);
    cy(3.8, 3.8, 1.1, 14, M(trim), -0.2, 0, 0, sh, 0, 0, Math.PI / 2);
    sp(1.4, M(C.gold), -0.7, 0, 0, sh);
  }
  if (L.ex === 'multiarm') {
    for (const [sx, a, b] of [
      [-1, 0.7, -0.5],
      [1, 0.7, -0.5],
      [-1, 1.2, 0.4],
      [1, 1.2, 0.4],
    ]) {
      const p = piv(torso, sx * 5.8, 10, b * 2);
      p.rotation.z = sx * a;
      p.rotation.x = b;
      add(new THREE.CylinderGeometry(1.3, 1.05, 13, 8), mSkin, 0, -6.5, 0, p);
      sp(1.4, mSkin, 0, -13.6, 0, p);
      if (b > 0) add(new THREE.TorusGeometry(2.2, 0.6, 4, 12), MB2(C.gold), 0, -16, 0, p);
      else sp(1.8, MB2(sx > 0 ? '#e27aa8' : '#ffffff'), 0, -15.6, 0, p);
      xarms.push(p);
    }
  }
  if (L.ex === 'drums') {
    drums = piv(torso, 0, 12, -6);
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * (0.95 + (i / 7) * 1.1);
      cy(2.4, 2.4, 2.2, 12, M('#8a3a2a'), Math.cos(a) * 14, Math.sin(a) * 12, 0, drums, Math.PI / 2);
      cy(1.6, 1.6, 2.4, 12, M('#e8c86a'), Math.cos(a) * 14, Math.sin(a) * 12, 0.2, drums, Math.PI / 2);
    }
    add(
      new THREE.TorusGeometry(13, 0.5, 4, 24, Math.PI * 1.1),
      M('#5a3a2a'),
      0,
      0,
      0,
      drums,
      0,
      0,
      Math.PI * 0.95 - 0.05
    );
  }
  if (L.ex === 'tail' || id === 'wukong' || id === 'hanuman') {
    tail = piv(body, 0, 18, -4.4);
    let par = tail;
    for (let i = 0; i < 7; i++) {
      const s = piv(par, 0, 0, i ? -2.6 : 0);
      add(
        new THREE.CylinderGeometry(0.9 - i * 0.05, 0.9 - i * 0.05, 3, 6),
        M(shade(L.h || skin, -0.1)),
        0,
        0,
        -1.3,
        s,
        Math.PI / 2
      );
      s.rotation.x = -0.28;
      par = s;
    }
  }
  if (!(L.held === 'none' || light)) buildHeld(L.held, hc, id, armR.hand, { bx, cy, add, M, MB2, piv });
  root.userData.parts = { body, legs, torso, armL, armR, head, cape, drums, tail, xarms, handR: armR.hand };
  root.userData.mats = mats;
  root.userData.ph = 0;
  root.userData.yaw = 0;
  root.userData.god = id;
  root.userData.disp = () => {
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    texs.forEach((t) => t.dispose());
  };
  root.scale.setScalar(GOD_SCALE);
  return root;
}

function buildHeld(kind, hc, id, hand, H) {
  const { bx, cy, add, M, MB2, piv } = H;
  const w = piv(hand, 0, 0, 1.2);
  w.rotation.x = 0.25;
  const mh = M(hc),
    wood = M('#7a5a3a');
  switch (kind) {
    case 'bolt': {
      const mb = MB2('#fff6a0');
      bx(2, 7, 2, mb, 0, 2, 0, w, 0, 0, 0.55);
      bx(2, 7.5, 2, mb, 1.8, 7.6, 0, w, 0, 0, -0.55);
      bx(2.2, 8, 2.2, mb, 0, 13.4, 0, w, 0, 0, 0.55);
      bx(1, 6, 1, MB2('#ffffff'), 0.6, 8, 1.2, w, 0, 0, -0.55);
      w.userData.glow = hc;
      break;
    }
    case 'trident':
    case 'bident': {
      cy(0.8, 0.8, 48, 6, mh, 0, 8, 0, w);
      bx(kind === 'trident' ? 9 : 6, 1.4, 1.4, mh, 0, 29, 0, w);
      const xs = kind === 'trident' ? [-4, 0, 4] : [-2.6, 2.6];
      for (const x of xs) {
        bx(1.3, 7, 1.3, mh, x, 33, 0, w);
        cy(0.1, 1, 2.2, 4, mh, x, 37.6, 0, w);
      }
      break;
    }
    case 'spear':
      cy(0.8, 0.8, 46, 6, wood, 0, 8, 0, w);
      cy(0.1, 2, 7.5, 4, mh, 0, 34.5, 0, w);
      bx(3, 1, 1, M(C.blood), 0, 30, 0, w);
      break;
    case 'bow':
      add(new THREE.TorusGeometry(11, 0.9, 4, 12, Math.PI), M(hc), 0, 4, 2, w, 0, Math.PI / 2, -Math.PI / 2);
      bx(0.3, 22, 0.3, M('#f2e3c6'), 0, 4, 2, w);
      break;
    case 'hammer':
      cy(0.9, 0.9, 12, 6, M('#6a4a2a'), 0, 2, 0, w);
      bx(10, 6.5, 6.5, mh, 0, 9.5, 0, w);
      bx(10.4, 1.2, 6.8, M(shade(hc, 0.3)), 0, 11.8, 0, w);
      break;
    case 'orb': {
      const o = add(new THREE.IcosahedronGeometry(3.6, 1), MB2(hc), 0, 5, 2, w);
      add(new THREE.IcosahedronGeometry(1.6, 0), MB2('#ffffff'), -1, 6, 4, w);
      w.userData.orb = o;
      w.userData.glow = hc;
      break;
    }
    case 'staff':
      cy(0.8, 0.9, 50, 6, M(shade(hc, -0.25)), 0, 9, 0, w);
      {
        const top = add(new THREE.IcosahedronGeometry(2.8, 0), MB2(id === 'wukong' ? C.gold : hc), 0, 35, 0, w);
        if (id === 'ra') {
          bx(6, 1.2, 1.2, mh, 0, 33, 0, w);
        }
        if (id === 'quetzalcoatl')
          for (let i = 0; i < 5; i++)
            bx(1, 5, 0.4, M(i % 2 ? '#3aa07a' : C.gold), -2 + i, 38, 0, w, 0, 0, (i - 2) * 0.3);
        w.userData.glow = hc;
      }
      break;
    case 'sword':
      bx(1.2, 4.5, 1.2, M('#5a3a22'), 0, 0, 0, w);
      bx(6, 1.2, 1.8, M(C.gold), 0, 2.8, 0, w);
      bx(2, 17, 0.9, mh, 0, 12, 0, w);
      bx(0.6, 15, 1, M('#ffffff'), 0.5, 12, 0, w);
      cy(0.1, 1.4, 2, 4, mh, 0, 21.4, 0, w);
      break;
    case 'katana':
      bx(1.2, 6, 1.2, M('#2a2030'), 0, 0, 0, w);
      cy(2.2, 2.2, 0.6, 10, M(C.gold), 0, 3.4, 0, w);
      {
        const b = bx(1.3, 21, 0.6, mh, 0, 14.4, 0, w);
        b.rotation.x = 0.06;
      }
      break;
    case 'axe':
      cy(0.8, 0.8, 26, 6, wood, 0, 6, 0, w);
      bx(1.2, 8, 6.5, mh, 0, 15, 3.2, w);
      break;
    case 'doubleaxe':
      cy(0.8, 0.8, 26, 6, wood, 0, 6, 0, w);
      bx(1.2, 8, 6, mh, 0, 15, 3.4, w);
      bx(1.2, 8, 6, mh, 0, 15, -3.4, w);
      break;
    case 'club':
      cy(1.2, 2.8, 19, 7, mh, 0, 8, 0, w);
      for (let i = 0; i < 4; i++)
        cy(0.1, 0.8, 2, 4, M(shade(hc, 0.3)), Math.cos(i * 1.57) * 2.2, 13, Math.sin(i * 1.57) * 2.2, w, 0, 0, 0);
      break;
    case 'machete':
      bx(1.2, 4.5, 1.2, M('#3a2416'), 0, 0, 0, w);
      bx(1.3, 13, 3.6, mh, 0, 9.5, 0.8, w);
      break;
    case 'disc': {
      const d = add(new THREE.TorusGeometry(5, 1.1, 5, 16), MB2(hc), 0, 8, 0, w, Math.PI / 2);
      for (let i = 0; i < 4; i++) bx(0.6, 8, 0.6, MB2(hc), 0, 8, 0, w, 0, 0, i * 0.785);
      w.userData.spin = d;
      w.userData.glow = hc;
      break;
    }
    case 'mirror':
      cy(5, 5, 1, 14, M(C.gold), 0, 8, 0, w, Math.PI / 2);
      cy(4, 4, 1.3, 14, MB2(hc), 0, 8, 0.2, w, Math.PI / 2);
      bx(1.2, 5, 1, M('#6a4a2a'), 0, 2.5, 0, w);
      break;
    case 'net': {
      const n = bx(11, 11, 0.3, MB2(hc, { wireframe: true }), 0, 6, 2, w);
      break;
    }
    case 'sling':
      bx(0.5, 8, 0.5, M('#c8a878'), 0, 3, 0, w);
      add(new THREE.SphereGeometry(1.6, 6, 5), MB2(hc), 0, -1, 1, w);
      break;
    case 'ball':
      add(new THREE.SphereGeometry(3.4, 8, 6), M('#3a2a1a'), 0, 0, 2, w);
      break;
  }
  return w;
}
