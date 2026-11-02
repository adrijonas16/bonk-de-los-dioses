/* ---------- jefes 3D ---------- */
function buildBoss(e) {
  const d = e.d,
    root = new THREE.Group(),
    mats = [],
    geos = [];
  const corrupt = e.corrupt;
  const M = (c) => {
    const cc = corrupt ? shade(c, -0.25) : c;
    const m = new THREE.MeshLambertMaterial({ color: cc });
    m.emissive.set(cc).multiplyScalar(0.2);
    m.userData.em0 = m.emissive.clone();
    mats.push(m);
    return m;
  };
  const parts = [];
  const mk = (pt, par) => {
    let piv = par.userData.pv && par.userData.pv[pt.pv.join()];
    if (!piv) {
      piv = new THREE.Group();
      piv.position.set(...pt.pv);
      par.add(piv);
      (par.userData.pv = par.userData.pv || {})[pt.pv.join()] = piv;
      piv.userData.an = pt.an;
      piv.userData.i = pt.i;
      parts.push(piv);
    }
    const g = partGeo(Object.assign({}, pt, { of: [0, 0, 0] }));
    geos.push(g);
    const m = new THREE.Mesh(g, M(pt.color));
    m.position.set(...pt.of);
    m.castShadow = true;
    piv.add(m);
  };
  const body = new THREE.Group();
  root.add(body);
  let arch = d.arch;
  const base = { col: d.col, acc: d.acc, feat: d.feat, heads: d.heads };
  if (arch === 'hundred') {
    enemyParts(Object.assign({}, base, { arch: 'lord', heads: 5, feat: '' }), true).forEach((pt) => mk(pt, body));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * 6.283;
      const pv = new THREE.Group();
      pv.position.set(Math.cos(a) * 7, 15 + Math.sin(i * 2.1) * 3, Math.sin(a) * 4);
      pv.rotation.z = Math.cos(a) * 1.2;
      pv.userData.an = 'wave';
      pv.userData.i = i;
      body.add(pv);
      parts.push(pv);
      const g = new THREE.BoxGeometry(2.6, 13, 2.6);
      g.translate(0, 6.5, 0);
      geos.push(g);
      const m = new THREE.Mesh(g, M(shade(d.col, -0.15)));
      m.castShadow = true;
      pv.add(m);
      const g2 = new THREE.BoxGeometry(3.6, 3.6, 3.6);
      g2.translate(0, 13.5, 0);
      geos.push(g2);
      pv.add(new THREE.Mesh(g2, M(d.col)));
    }
  } else if (arch === 'hydra') {
    const n = Math.min(d.heads || 5, 9);
    const gb = new THREE.BoxGeometry(18, 12, 16);
    gb.translate(0, 9, 0);
    geos.push(gb);
    const bm = new THREE.Mesh(gb, M(d.col));
    bm.castShadow = true;
    body.add(bm);
    for (const [x, z] of [
      [-6, 6],
      [6, 6],
      [-6, -6],
      [6, -6],
    ]) {
      const g = new THREE.BoxGeometry(4, 6, 4);
      g.translate(x, 3, z);
      geos.push(g);
      body.add(new THREE.Mesh(g, M(shade(d.col, -0.25))));
    }
    for (let i = 0; i < n; i++) {
      const a = (i / (n - 1 || 1) - 0.5) * 2.2;
      const pv = new THREE.Group();
      pv.position.set(Math.sin(a) * 6, 14, Math.cos(a) * 5);
      pv.rotation.set(-0.35, a, 0);
      pv.userData.an = 'neck';
      pv.userData.i = i;
      body.add(pv);
      parts.push(pv);
      const g = new THREE.BoxGeometry(3.4, 18, 3.4);
      g.translate(0, 9, 0);
      geos.push(g);
      pv.add(new THREE.Mesh(g, M(shade(d.col, 0.08))));
      const gh = new THREE.BoxGeometry(5.6, 5, 8);
      gh.translate(0, 19, 2);
      geos.push(gh);
      const hm = new THREE.Mesh(gh, M(d.col));
      hm.castShadow = true;
      pv.add(hm);
      for (const sx of [-1.5, 1.5]) {
        const ge = new THREE.BoxGeometry(1.2, 1.2, 0.6);
        ge.translate(sx, 20.6, 6.1);
        geos.push(ge);
        pv.add(new THREE.Mesh(ge, new THREE.MeshBasicMaterial({ color: d.acc })));
      }
      const gj = new THREE.BoxGeometry(4.6, 1.2, 6);
      gj.translate(0, 16.6, 3);
      geos.push(gj);
      pv.add(new THREE.Mesh(gj, M(d.acc)));
    }
    const gt = new THREE.BoxGeometry(4, 4, 14);
    gt.translate(0, 6, -14);
    geos.push(gt);
    body.add(new THREE.Mesh(gt, M(shade(d.col, -0.2))));
  } else if (arch === 'gorgon') {
    for (let i = 0; i < 5; i++) {
      const g = new THREE.BoxGeometry(9 - i, 5, 9 - i);
      g.translate(Math.sin(i * 1.3) * 5, 2.5, -i * 6);
      geos.push(g);
      const m = new THREE.Mesh(g, M(i % 2 ? d.col : shade(d.col, -0.2)));
      m.castShadow = true;
      body.add(m);
    }
    enemyParts(Object.assign({}, base, { arch: 'lord', feat: '', heads: 1 }), true)
      .filter((pt) => pt.an !== 'legA' && pt.an !== 'legB')
      .forEach((pt) => {
        pt.pv = [pt.pv[0], pt.pv[1] - 3, pt.pv[2]];
        mk(pt, body);
      });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * 6.283;
      const pv = new THREE.Group();
      pv.position.set(Math.cos(a) * 3.4, 24, Math.sin(a) * 3);
      pv.rotation.set(Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8);
      pv.userData.an = 'wave';
      pv.userData.i = i;
      body.add(pv);
      parts.push(pv);
      const g = new THREE.BoxGeometry(1.2, 6, 1.2);
      g.translate(0, 3, 0);
      geos.push(g);
      pv.add(new THREE.Mesh(g, M('#3a8a3a')));
    }
  } else if (arch === 'titan') {
    const gb = new THREE.BoxGeometry(20, 26, 14);
    gb.translate(0, 16, 0);
    geos.push(gb);
    body.add(new THREE.Mesh(gb, M(d.col)));
    const gh = new THREE.BoxGeometry(12, 11, 11);
    gh.translate(0, 34, 0);
    geos.push(gh);
    body.add(new THREE.Mesh(gh, M(shade(d.col, 0.1))));
    for (const sx of [-3, 3]) {
      const ge = new THREE.BoxGeometry(2.4, 1.4, 0.6);
      ge.translate(sx, 35, 5.6);
      geos.push(ge);
      body.add(new THREE.Mesh(ge, new THREE.MeshBasicMaterial({ color: d.acc })));
    }
    for (let i = 0; i < 9; i++) {
      const pv = new THREE.Group();
      pv.userData.an = 'orbit';
      pv.userData.i = i;
      body.add(pv);
      parts.push(pv);
      const g = new THREE.OctahedronGeometry(3 + (i % 3), 0);
      geos.push(g);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: i % 2 ? d.acc : '#e27aa8' }));
      m.position.set(22, 18 + i * 2, 0);
      pv.add(m);
    }
    for (const sx of [-1, 1]) {
      const pv = new THREE.Group();
      pv.position.set(sx * 12, 28, 0);
      pv.userData.an = sx < 0 ? 'armA' : 'armB';
      parts.push(pv);
      body.add(pv);
      const g = new THREE.BoxGeometry(5, 20, 5);
      g.translate(0, -9, 0);
      geos.push(g);
      pv.add(new THREE.Mesh(g, M(shade(d.col, 0.05))));
    }
  } else if (arch === 'serpent') {
    const g = new THREE.BoxGeometry(10, 8, 14);
    g.translate(0, 6, 2);
    geos.push(g);
    body.add(new THREE.Mesh(g, M(d.col)));
    const gj = new THREE.BoxGeometry(9, 2, 10);
    gj.translate(0, 1.6, 5);
    geos.push(gj);
    const jaw = new THREE.Mesh(gj, M(shade(d.col, -0.25)));
    body.add(jaw);
    for (const sx of [-2.6, 2.6]) {
      const ge = new THREE.BoxGeometry(1.8, 1.8, 0.6);
      ge.translate(sx, 8.4, 9.1);
      geos.push(ge);
      body.add(new THREE.Mesh(ge, new THREE.MeshBasicMaterial({ color: d.acc })));
    }
    if (d.feat === 'double' || e.key === 'amaru') {
      const gw = new THREE.BoxGeometry(20, 1, 6);
      gw.translate(0, 9, -2);
      geos.push(gw);
      body.add(new THREE.Mesh(gw, M(d.acc)));
    }
    const gc = new THREE.BoxGeometry(10, 2, 2);
    gc.translate(0, 10.6, 0);
    geos.push(gc);
    body.add(new THREE.Mesh(gc, M(d.acc)));
  } else enemyParts(Object.assign({}, base, { arch }), true).forEach((pt) => mk(pt, body));
  if (corrupt) {
    const g = new THREE.TorusGeometry(14, 1, 5, 24);
    geos.push(g);
    const t = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#b07aff', transparent: true, opacity: 0.7 }));
    t.rotation.x = Math.PI / 2;
    t.position.y = 4;
    body.add(t);
  }
  root.userData.parts = parts;
  root.userData.mats = mats;
  root.userData.body = body;
  root.userData.disp = () => {
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
  };
  return root;
}
function animBoss(m, e, dt) {
  const u = m.userData;
  const yaw = enemyYaw(e, dt);
  m.rotation.y = yaw;
  const s = e.r / (e.d.arch === 'serpent' ? 6 : e.d.arch === 'titan' ? 9 : 6.5);
  m.scale.setScalar(s);
  const ph = T * 7 + e.ph;
  let by = e.z;
  if (e.d.arch === 'flyer') by += 8 + Math.sin(T * 2) * 4;
  if (e.d.arch === 'titan') by += Math.sin(T * 1.5) * 3;
  m.position.set(e.x, by, e.y);
  for (const pv of u.parts) {
    const an = pv.userData.an,
      i = pv.userData.i || 0;
    if (an === 'wave') {
      pv.rotation.x = Math.sin(T * 3 + i * 1.3) * 0.5;
      continue;
    }
    if (an === 'neck') {
      pv.rotation.x = -0.35 + Math.sin(T * 2 + i * 1.1) * 0.25;
      pv.rotation.z = Math.sin(T * 1.6 + i) * 0.18;
      continue;
    }
    if (an === 'orbit') {
      pv.rotation.y = T * 0.8 + i * 0.7;
      continue;
    }
    partAnim({ an, i }, ph, 1, T, null);
    pv.rotation.copy(_e3);
    pv.scale.copy(_s3);
  }
  const fl = e.flash > 0;
  if (u.fl !== fl) {
    u.fl = fl;
    for (const mm of u.mats)
      if (mm.emissive) {
        if (fl) mm.emissive.set('#ffffff');
        else mm.emissive.copy(mm.userData.em0 || mm.emissive.set(0, 0, 0));
      }
  }
}
function segMesh(e) {
  const g = new THREE.BoxGeometry(1, 1, 1);
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: e.d.col }));
  m.castShadow = true;
  const g2 = new THREE.BoxGeometry(0.6, 0.25, 1.04);
  g2.translate(0, 0.55, 0);
  const c = new THREE.Mesh(g2, new THREE.MeshLambertMaterial({ color: e.d.acc }));
  m.add(c);
  m.userData.disp = () => {
    g.dispose();
    g2.dispose();
    m.material.dispose();
    c.material.dispose();
  };
  return m;
}
