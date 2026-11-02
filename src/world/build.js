/* ---------- mundo ---------- */
let WORLD = null;
function groundAt(x, y) {
  const W_ = WORLD;
  if (!W_) return 0;
  const fx = (x + HALF) / TCELL,
    fy = (y + HALF) / TCELL;
  const ix = clamp(Math.floor(fx), 0, TSEG - 1),
    iy = clamp(Math.floor(fy), 0, TSEG - 1),
    tx = fx - ix,
    ty = fy - iy,
    N = TSEG + 1,
    h = W_.heights;
  const a = h[iy * N + ix],
    b = h[iy * N + ix + 1],
    c = h[(iy + 1) * N + ix],
    d = h[(iy + 1) * N + ix + 1];
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}
function slopeAt(x, y) {
  const e = 6;
  return Math.hypot(groundAt(x + e, y) - groundAt(x - e, y), groundAt(x, y + e) - groundAt(x, y - e)) / (2 * e);
}
function hazardAt(x, y) {
  const L = WORLD && WORLD.haz;
  if (!L) return null;
  return groundAt(x, y) < L.lv ? L : null;
}
function surfaceAt(x, y) {
  const g = groundAt(x, y),
    hz = WORLD && WORLD.haz;
  return hz && hz.k === 'water' && g < hz.lv ? hz.lv : g;
}
function disposeWorld() {
  if (!WORLD) return;
  scene.remove(WORLD.group);
  WORLD.group.traverse((o) => {
    if (o.geometry && !o.userData.keepGeo) o.geometry.dispose();
  });
  WORLD = null;
}
const SHRINE_T = {
  fortuna: { name: 'Altar de la Fortuna', col: '#ffc23a' },
  desafio: { name: 'Estatua del Desafío', col: '#ff4d5e' },
  fuente: { name: 'Fuente Sagrada', col: '#4fc3ff' },
  maldito: { name: 'Altar Maldito', col: '#9b5cff' },
};
function buildWorld(rk) {
  disposeWorld();
  const L = LOOK3D[rk],
    group = new THREE.Group(),
    N = TSEG + 1,
    heights = new Float32Array(N * N);
  for (let iy = 0; iy < N; iy++)
    for (let ix = 0; ix < N; ix++) {
      const x = -HALF + ix * TCELL,
        y = -HALF + iy * TCELL;
      heights[iy * N + ix] = terrainH(rk, x, y);
    }
  WORLD = {
    rk,
    group,
    heights,
    haz: L.haz || null,
    coll: [],
    altars: [],
    chests: [],
    shrines: [],
    merchants: [],
    lights: [],
  };
  const pos = [],
    col = [],
    uv = [];
  const H = (ix, iy) => heights[iy * N + ix];
  for (let iy = 0; iy < TSEG; iy++)
    for (let ix = 0; ix < TSEG; ix++) {
      const x0 = -HALF + ix * TCELL,
        y0 = -HALF + iy * TCELL,
        x1 = x0 + TCELL,
        y1 = y0 + TCELL;
      const a = [x0, H(ix, iy), y0],
        b = [x1, H(ix + 1, iy), y0],
        c = [x0, H(ix, iy + 1), y1],
        d = [x1, H(ix + 1, iy + 1), y1];
      for (const tri of (ix + iy) % 2
        ? [
            [a, c, b],
            [b, c, d],
          ]
        : [
            [a, c, d],
            [a, d, b],
          ]) {
        const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3,
          cz = (tri[0][2] + tri[1][2] + tri[2][2]) / 3,
          ch = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
        const sl = (Math.max(tri[0][1], tri[1][1], tri[2][1]) - Math.min(tri[0][1], tri[1][1], tri[2][1])) / TCELL;
        const cc = terrainColor(rk, cx / WS, cz / WS, ch / WS, sl);
        for (const v of tri) {
          pos.push(v[0], v[1], v[2]);
          col.push(cc.r, cc.g, cc.b);
          uv.push(v[0] / 70, v[2] / 70 + (sl > 0.85 ? v[1] / 70 : 0));
        }
      }
    }
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  tg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  tg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  tg.computeVertexNormals();
  const terrain = new THREE.Mesh(
    tg,
    new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, map: TEX(L.tex) })
  );
  terrain.receiveShadow = true;
  group.add(terrain);
  if (L.haz) {
    const hz = L.haz;
    const tex = hazardTexture(hz);
    const geo = new THREE.PlaneGeometry(ARENA * 2.3, ARENA * 2.3, hz.k === 'water' ? 70 : 1, hz.k === 'water' ? 70 : 1);
    const m =
      hz.k === 'water'
        ? new THREE.MeshPhongMaterial({
            color: hz.col,
            transparent: true,
            opacity: 0.8,
            map: tex,
            shininess: 90,
            specular: '#ffffff',
            flatShading: true,
          })
        : new THREE.MeshBasicMaterial({ color: hz.col, map: tex });
    const w = new THREE.Mesh(geo, m);
    w.rotation.x = -Math.PI / 2;
    w.position.y = hz.lv;
    w.receiveShadow = hz.k === 'water';
    group.add(w);
    WORLD.water = w;
    WORLD.hazTex = tex;
  }
  // cielo
  const sky = new THREE.SphereGeometry(7600, 24, 14),
    sc = [],
    top = new THREE.Color(L.top),
    hor = new THREE.Color(L.hor);
  const sp = sky.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const yy = sp.getY(i) / 7600,
      k = clamp(yy * 1.6, 0, 1);
    const cc = hor.clone().lerp(top, k);
    if (yy < 0) cc.copy(hor).multiplyScalar(0.7);
    sc.push(cc.r, cc.g, cc.b);
  }
  sky.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3));
  const skyM = new THREE.Mesh(
    sky,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })
  );
  group.add(skyM);
  WORLD.sky = skyM;
  if (L.stars) {
    const sg = new THREE.BufferGeometry(),
      pp = [];
    for (let i = 0; i < 900; i++) {
      const a = Math.random() * 6.283,
        b = Math.random() * 1.35 + 0.12;
      pp.push(Math.cos(a) * Math.cos(b) * 5000, Math.sin(b) * 5000, Math.sin(a) * Math.cos(b) * 5000);
    }
    sg.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3));
    const st = new THREE.Points(
      sg,
      new THREE.PointsMaterial({ color: '#ffffff', size: 2.4, sizeAttenuation: false, fog: false })
    );
    group.add(st);
    WORLD.stars = st;
  }
  if (L.disk || L.moon) {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex(L.moon ? '#e8eeff' : L.disk, L.moon), fog: false, depthWrite: false })
    );
    s.scale.set(L.moon ? 420 : 640, L.moon ? 420 : 640, 1);
    s.position.set(-2600, 2200, -3400);
    group.add(s);
    WORLD.sunSprite = s;
  }
  if (L.aurora) {
    WORLD.aurora = [];
    for (let i = 0; i < 3; i++) {
      const g = new THREE.PlaneGeometry(4400, 520, 40, 1);
      const m = new THREE.MeshBasicMaterial({
        color: i === 1 ? '#7de0ff' : '#7de0b0',
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(0, 1200 + i * 200, -2400 + i * 500);
      mesh.rotation.x = -0.3;
      group.add(mesh);
      WORLD.aurora.push(mesh);
    }
  }
  const cloudN = L.clouds ? 70 : L.mist ? 40 : L.night ? 0 : 18;
  for (let i = 0; i < cloudN; i++) {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: cloudTex(),
        transparent: true,
        opacity: L.mist ? 0.75 : 0.9,
        depthWrite: false,
        fog: !L.clouds,
      })
    );
    const a = Math.random() * 6.283,
      r = L.mist ? 500 + Math.random() * 1500 : 2200 + Math.random() * 1400;
    s.position.set(
      Math.cos(a) * r,
      L.mist ? -40 + Math.random() * 120 : L.clouds ? -200 + Math.random() * 400 : 900 + Math.random() * 600,
      Math.sin(a) * r
    );
    const k = L.mist ? 300 + Math.random() * 300 : 500 + Math.random() * 600;
    s.scale.set(k, k * 0.5, 1);
    group.add(s);
  }
  // horizonte lejano
  const m4f = new THREE.Matrix4(),
    v1f = new THREE.Vector3();
  const farM = new THREE.MeshLambertMaterial({ color: L.far, flatShading: true });
  const rngF = srand(rk.length * 97 + 3);
  const green = /lanka|orun|xibalba|ukupacha|annwn|yomi/.test(rk);
  const mts = green
    ? ['mountain_A_grass_trees', 'mountain_B_grass_trees', 'mountain_C_grass']
    : ['mountain_A', 'mountain_B', 'mountain_C'];
  if (PA(mts[0])) {
    const lists = {};
    for (let i = 0; i < 56; i++) {
      const a = (i / 56) * 6.283 + rngF() * 0.08,
        r = ARENA + 420 + rngF() * 1300,
        h = L.farH * (0.6 + rngF() * 0.9) * (rk === 'cielo' ? 0.4 : 1);
      const nm = mts[Math.floor(rngF() * 3)];
      (lists[nm] = lists[nm] || []).push({ a, r, h, rot: rngF() * 6.28 });
    }
    for (const nm in lists) {
      const pa = PA(nm);
      const im = new THREE.InstancedMesh(pa.geo, pa.mat, lists[nm].length);
      im.userData.keepGeo = true;
      const tc = new THREE.Color(green ? '#ffffff' : L.far).lerp(new THREE.Color('#ffffff'), green ? 0 : 0.35);
      lists[nm].forEach((it, i) => {
        const sc = it.h / pa.h;
        m4f.makeRotationY(it.rot);
        m4f.scale(v1f.set(sc * 1.3, sc, sc * 1.3));
        m4f.setPosition(Math.cos(it.a) * it.r, -60, Math.sin(it.a) * it.r);
        im.setMatrixAt(i, m4f);
        im.setColorAt(i, tc);
      });
      group.add(im);
    }
    if (green && PA('hills_A_trees')) {
      const hl = ['hills_A_trees', 'hills_B_trees', 'hills_C_trees'];
      for (const nm of hl) {
        const pa = PA(nm);
        const n = 14;
        const im = new THREE.InstancedMesh(pa.geo, pa.mat, n);
        im.userData.keepGeo = true;
        for (let i = 0; i < n; i++) {
          const a = rngF() * 6.283,
            r = ARENA + 40 + rngF() * 260,
            sc = (140 + rngF() * 120) / pa.h;
          m4f.makeRotationY(rngF() * 6.28);
          m4f.scale(v1f.set(sc, sc, sc));
          m4f.setPosition(
            Math.cos(a) * r,
            groundAt(Math.cos(a) * Math.min(r, ARENA - 20), Math.sin(a) * Math.min(r, ARENA - 20)) - 30,
            Math.sin(a) * r
          );
          im.setMatrixAt(i, m4f);
        }
        group.add(im);
      }
    }
  }
  for (let i = 0; i < (PA(mts[0]) ? 0 : 44); i++) {
    const a = (i / 44) * 6.283 + rngF() * 0.1,
      r = ARENA + 500 + rngF() * 1500,
      h = L.farH * (0.5 + rngF() * 0.9),
      w = h * (0.8 + rngF() * 0.8);
    const m = new THREE.Mesh(new THREE.ConeGeometry(w, h, 5 + Math.floor(rngF() * 3)), farM);
    m.position.set(Math.cos(a) * r, h / 2 - 40, Math.sin(a) * r);
    m.rotation.y = rngF() * 3;
    group.add(m);
    if ((rk === 'jotunheim' || rk === 'ukupacha' || rk === 'annwn') && h > L.farH * 0.8) {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(w * 0.32, h * 0.32, 5), ML('#f4f8fb'));
      cap.position.set(m.position.x, h - 40 - h * 0.16, m.position.z);
      group.add(cap);
    }
  }
  if (L.volcano) {
    const v = new THREE.Mesh(new THREE.ConeGeometry(1000, 1300, 8, 1, true), farM);
    v.position.set(0, 600, -5200);
    group.add(v);
    const crater = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex('#ff6a1a'),
        blending: THREE.AdditiveBlending,
        fog: false,
        depthWrite: false,
      })
    );
    crater.scale.set(1300, 800, 1);
    crater.position.set(0, 1250, -5200);
    group.add(crater);
  }
  // luces
  const hemi = new THREE.HemisphereLight(L.hemi[0], L.hemi[1], L.hemi[2]);
  group.add(hemi);
  const sun = new THREE.DirectionalLight(L.sun[0], L.sun[1]);
  sun.position.set(-500, 900, 400);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc2 = sun.shadow.camera;
  sc2.left = -650;
  sc2.right = 650;
  sc2.top = 650;
  sc2.bottom = -650;
  sc2.near = 50;
  sc2.far = 2600;
  sun.shadow.bias = -0.0008;
  group.add(sun);
  group.add(sun.target);
  WORLD.sun = sun;
  scene.fog = new THREE.Fog(L.hor, L.night ? 700 : 1300, L.night ? 3000 : 5600);
  scene.fog.userData = { n0: scene.fog.near, f0: scene.fog.far };
  scene.background = new THREE.Color(L.hor);
  // decorados
  const kinds = extraKinds(),
    inst = {},
    rng = srand(rk.length * 7919 + 13);
  const instA = {};
  const add = (kind, x, y, s, rot, tint) => {
    if (kind.startsWith('A:')) {
      const ak = AK[kind.slice(2)],
        pa = ak && PA(ak[0]);
      if (!pa) {
        if (ak) return add(ak[3], x, y, s, rot);
        return;
      }
      const sc = (ak[1] / pa.h) * s;
      (instA[kind] = instA[kind] || []).push({ x, y, sc, rot, tint });
      if (ak[2]) WORLD.coll.push({ x, y, r: pa.w * sc * ak[2], top: surfaceAt(x, y) + pa.h * sc });
      return;
    }
    (inst[kind] = inst[kind] || []).push({ x, y, s, rot });
    const k = kinds[kind];
    if (k.c) WORLD.coll.push({ x, y, r: k.c * s, top: surfaceAt(x, y) + k.h * s });
  };
  landmarks(rk, add);
  {
    const sg = new THREE.Group();
    sg.scale.setScalar(WS);
    group.add(sg);
    const c0 = WORLD.coll.length;
    structures(rk, sg, WORLD.coll);
    for (let i = c0; i < WORLD.coll.length; i++) {
      const c = WORLD.coll[i];
      c.x *= WS;
      c.y *= WS;
      c.r *= WS;
      c.top *= WS;
    }
  }
  for (const [kind, count0, where, tint] of REALM_PROPS[rk]) {
    const count = Math.round(count0 * 2 * AREAK);
    let n = 0,
      tries = 0;
    while (n < count && tries < count * 30) {
      tries++;
      const a = rng() * 6.283,
        r = Math.sqrt(rng()) * (ARENA - 110);
      const x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      if (Math.hypot(x, y) < 220) continue;
      const g = groundAt(x, y),
        sl = slopeAt(x, y);
      const wet = WORLD.haz && WORLD.haz.k === 'water' && g < WORLD.haz.lv;
      if (where === 'wet' ? !(wet || (WORLD.haz && g < WORLD.haz.lv + 6)) : wet || hazardAt(x, y) || sl > 0.5) continue;
      if (onPath(rk, x, y)) continue;
      add(kind, x, y, (0.85 + rng() * 0.6) * (kind.startsWith('A:') ? 1 : 1.45), rng() * 6.283, tint);
      n++;
    }
  }
  const m4 = new THREE.Matrix4(),
    mp = new THREE.Matrix4(),
    q4 = new THREE.Quaternion(),
    eu = new THREE.Euler(),
    v1 = new THREE.Vector3(),
    v2 = new THREE.Vector3();
  for (const kind in instA) {
    const list = instA[kind],
      pa = PA(AK[kind.slice(2)][0]);
    const im = new THREE.InstancedMesh(pa.geo, pa.mat, list.length);
    im.userData.keepGeo = true;
    im.castShadow = !/lily|wplant|skull|bone|candles|coins/.test(kind);
    im.receiveShadow = true;
    list.forEach((it, i) => {
      const gy =
        /lily/.test(kind) && WORLD.haz
          ? Math.max(groundAt(it.x, it.y), WORLD.haz.lv)
          : /cloud/.test(kind)
            ? groundAt(it.x, it.y) - 20
            : groundAt(it.x, it.y) - 1;
      m4.makeRotationY(it.rot);
      m4.scale(v1.set(it.sc, it.sc, it.sc));
      m4.setPosition(it.x, gy, it.y);
      im.setMatrixAt(i, m4);
      im.setColorAt(i, new THREE.Color(it.tint || '#ffffff'));
    });
    group.add(im);
  }
  for (const kind in inst) {
    const list = inst[kind],
      k = kinds[kind];
    for (const part of k.p) {
      const [geo, mat, px, py, pz, rx, ry, rz] = part;
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      im.userData.keepGeo = true;
      im.castShadow = !/marigold|candle|reeds|lotus|fern|agave|nopal/.test(kind);
      im.receiveShadow = true;
      list.forEach((it, i) => {
        const gy =
          kind === 'lotus' ? Math.max(groundAt(it.x, it.y), WORLD.haz ? WORLD.haz.lv : 0) : groundAt(it.x, it.y);
        m4.makeRotationY(it.rot);
        m4.scale(v1.set(it.s, it.s, it.s));
        m4.setPosition(it.x, gy, it.y);
        eu.set(rx || 0, ry || 0, rz || 0);
        q4.setFromEuler(eu);
        mp.compose(v2.set(px, py, pz), q4, v1.set(1, 1, 1));
        m4.multiply(mp);
        im.setMatrixAt(i, m4);
      });
      group.add(im);
    }
  }
  // césped y flores
  const [gt, gcount] = L.grass;
  const gw = [crossGeo(30, 27), crossGeo(26, 24)];
  for (let kind = 0; kind < 2; kind++) {
    const n = Math.round(gcount * 2 * AREAK * (kind ? 0.3 : 1)),
      gm = new THREE.MeshBasicMaterial({
        map: grassTex(gt, kind),
        alphaTest: 0.5,
        side: THREE.DoubleSide,
        color: new THREE.Color(L.hemi[0]).lerp(new THREE.Color('#ffffff'), 0.3).multiplyScalar(L.night ? 0.62 : 0.92),
      });
    const im = new THREE.InstancedMesh(gw[kind], gm, n);
    let c = 0;
    for (let t = 0; t < n * 4 && c < n; t++) {
      const a = rng() * 6.283,
        r = Math.sqrt(rng()) * (ARENA - 80),
        x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      const gh = groundAt(x, y);
      if (hazardAt(x, y) || slopeAt(x, y) > 0.45) continue;
      if (WORLD.haz && WORLD.haz.k === 'water' && gh < WORLD.haz.lv + 2) continue;
      if (onPath(rk, x, y)) continue;
      const s = 0.7 + rng() * 0.8;
      m4.makeRotationY(rng() * 3.14);
      m4.scale(v1.set(s, s * (0.8 + rng() * 0.5), s));
      m4.setPosition(x, gh - 1, y);
      im.setMatrixAt(c++, m4);
    }
    im.count = c;
    group.add(im);
  }
  if (rk === 'ukupacha') {
    const ms = miscSprites();
    for (let i = 0; i < 18; i++) {
      const a = rng() * 6.283,
        r = 200 + rng() * 900,
        x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      if (slopeAt(x, y) > 0.4) continue;
      const s = new THREE.Sprite(spriteMat(ms.llama, rng() < 0.5));
      s.center.set(0.5, 0);
      s.scale.set(ms.llama.w * 0.55, ms.llama.h * 0.55, 1);
      s.position.set(x, groundAt(x, y), y);
      if (rk === 'ukupacha') group.add(s);
    }
  }
  // interactivos
  const spot = (minD, maxD) => {
    for (let t = 0; t < 300; t++) {
      const a = rng() * 6.283,
        r = minD + rng() * ((maxD || ARENA - 160) - minD),
        x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      if (hazardAt(x, y) || slopeAt(x, y) > 0.35) continue;
      if (WORLD.coll.some((c) => Math.hypot(c.x - x, c.y - y) < c.r + 40)) continue;
      return [x, y];
    }
    return [rng() * 200 - 100, 200];
  };
  const shrineObj = (x, y, col, kind) => {
    const g = new THREE.Group();
    const base = new THREE.Mesh(GEO.cyl(20, 24, 12, 8), MLT('#8a8a8a', 'stone'));
    base.castShadow = true;
    base.receiveShadow = true;
    g.add(base);
    let gem;
    if (kind === 'desafio') {
      gem = new THREE.Mesh(GEO.box(14, 40, 10), ML('#5a4a4a'));
      gem.position.y = 32;
      const head = new THREE.Mesh(GEO.box(12, 12, 12), ML('#6a5a5a'));
      head.position.y = 58;
      g.add(head);
    } else if (kind === 'fuente') {
      gem = new THREE.Mesh(GEO.cyl(16, 12, 10, 10), MB('#4fc3ff', { transparent: true, opacity: 0.8 }));
      gem.position.y = 12;
    } else {
      gem = new THREE.Mesh(GEO.oct(9), MB(col));
      gem.position.y = 32;
    }
    g.add(gem);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(40, 44, 32),
      MB(col, { transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 1;
    g.add(ring);
    const gl = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex(col), blending: THREE.AdditiveBlending, depthWrite: false })
    );
    gl.scale.set(90, 90, 1);
    gl.position.y = 34;
    g.add(gl);
    g.position.set(x, groundAt(x, y) + 6, y);
    group.add(g);
    return { g, gem, ring };
  };
  for (let i = 0; i < 8; i++) {
    const [x, y] = spot(300);
    const o = shrineObj(x, y, REALMS[rk].acc, 'don');
    WORLD.altars.push({ x, y, charge: 0, used: false, obj: o.g, gem: o.gem });
  }
  for (const t of ['fortuna', 'fortuna', 'desafio', 'fuente', 'maldito']) {
    const [x, y] = spot(350);
    const o = shrineObj(x, y, SHRINE_T[t].col, t);
    WORLD.shrines.push({ type: t, x, y, used: false, uses: 0, obj: o.g, gem: o.gem });
  }
  for (let i = 0; i < 3; i++) {
    const [x, y] = spot(400);
    WORLD.merchants.push({ x, y, offers: null, rerolls: 0 });
    WORLD.coll.push({ x, y, r: 12, top: groundAt(x, y) + 40 });
    const st = new THREE.Group();
    const tbl = new THREE.Mesh(GEO.box(50, 16, 26), MLT('#7a4a2a', 'bark'));
    tbl.position.set(0, 8, 22);
    st.add(tbl);
    const aw = new THREE.Mesh(GEO.box(66, 4, 40), ML(i ? '#3a8bff' : '#ff4d5e'));
    aw.position.set(0, 52, 14);
    aw.rotation.x = 0.2;
    st.add(aw);
    for (const sx of [-30, 30]) {
      const pole = new THREE.Mesh(GEO.cyl(1.6, 1.6, 52, 5), ML('#5a3a22'));
      pole.position.set(sx, 26, 32);
      st.add(pole);
    }
    st.traverse((o) => {
      o.castShadow = true;
    });
    st.position.set(x, groundAt(x, y), y);
    group.add(st);
  }
  for (let i = 0; i < 28; i++) {
    const [x, y] = spot(200);
    const g = new THREE.Group();
    const body = new THREE.Mesh(GEO.box(22, 14, 16), MLT('#7a4a2a', 'bark'));
    body.position.y = 7;
    body.castShadow = true;
    g.add(body);
    const lid = new THREE.Mesh(GEO.box(23, 5, 17), MLT(C.gold, 'gold'));
    lid.position.y = 16;
    g.add(lid);
    g.position.set(x, groundAt(x, y), y);
    g.rotation.y = rng() * 6.283;
    group.add(g);
    WORLD.chests.push({ x, y, opened: false, obj: g, lid });
  }
  WORLD.wx = makeWeather(REALMS[rk].weather);
  if (WORLD.wx) group.add(WORLD.wx.pts);
  scene.add(group);
  return WORLD;
}
function onPath(rk, x, y) {
  x /= WS;
  y /= WS;
  switch (rk) {
    case 'mictlan':
      return Math.abs(x) < 100 && y > -1500 && y < 1100;
    case 'yomi':
      return Math.abs(x - Math.sin(y / 360) * 160) < 64;
    case 'cielo':
      return Math.abs(x) < 110 && y < -400;
    case 'tartaro':
      return Math.abs(x) < 120 && y > 300 && y < 700;
    default:
      return false;
  }
}
function landmarks(rk, add0) {
  const add = (k, x, y, sc, r) => add0(k, x * WS, y * WS, sc * 1.25 * WS, r);
  switch (rk) {
    case 'jotunheim':
      for (let i = 0; i < 11; i++) {
        const a = (i / 11) * 6.283;
        add('runestone', -700 + Math.cos(a) * 140, -600 + Math.sin(a) * 140, 1.5, a);
      }
      break;
    case 'duat':
      for (let i = 0; i < 6; i++) {
        add('obelisk', -80 + i * 90, -70, 1.05, 0);
        add('obelisk', -80 + i * 90, 70, 1.05, 0);
      }
      break;
    case 'yomi':
      for (let i = 0; i < 9; i++) {
        const y = 500 - i * 120;
        add('torii', Math.sin(y / 360) * 160, y, 1.4, -Math.cos(y / 360) * 0.45);
      }
      break;
    case 'diyu':
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * 6.283;
        add('redlantern', Math.cos(a) * 220, Math.sin(a) * 220, 1.3, 0);
      }
      break;
    case 'mictlan':
      for (let i = 0; i < 24; i++) {
        const y = -1400 + i * 100;
        add('candle', -90, y, 1.6, 0);
        add('candle', 90, y, 1.6, 0);
      }
      break;
    case 'xibalba':
      for (let i = 0; i < 8; i++) add('stele', -280 + i * 80, -620, 1.4, 0);
      break;
    case 'ukupacha':
      add('apacheta', -320, 60, 2.4, 0);
      break;
    case 'cielo':
      for (let i = 0; i < 7; i++) {
        add('goldpillar', -110, -540 - i * 70, 1.1, 0);
        add('goldpillar', 110, -540 - i * 70, 1.1, 0);
      }
      break;
    case 'vacio':
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 6.283;
        add('crystal', Math.cos(a) * 1000, Math.sin(a) * 1000, 3.4, a);
      }
      break;
    case 'tartaro':
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * 6.283;
        add(i % 3 === 1 ? 'brokencol' : 'column', Math.cos(a) * 300, Math.sin(a) * 300, 1.15, i % 3 === 1 ? a : 0);
      }
      break;
  }
}
const TEXC = {};
function glowTex(col, moon) {
  const k = 'g' + col + moon;
  if (TEXC[k]) return TEXC[k];
  const c = mkCanvas(64, 64),
    g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  gr.addColorStop(0, col);
  gr.addColorStop(moon ? 0.5 : 0.3, col);
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  TEXC[k] = t;
  return t;
}
function cloudTex() {
  if (TEXC.cloud) return TEXC.cloud;
  const c = mkCanvas(64, 40),
    g = c.getContext('2d');
  for (let i = 0; i < 9; i++) {
    const x = 10 + i * 5 + Math.random() * 4,
      y = 22 - Math.sin((i / 8) * Math.PI) * 8,
      r = 8 + Math.sin((i / 8) * Math.PI) * 8;
    g.fillStyle = i % 2 ? '#ffffff' : '#f4f2ff';
    g.beginPath();
    g.arc(x, y, r, 0, 7);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  TEXC.cloud = t;
  return t;
}
function hazardTexture(hz) {
  const c = mkCanvas(64, 64),
    g = c.getContext('2d');
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 260; i++) {
    const x = Math.floor(Math.random() * 64),
      y = Math.floor(Math.random() * 64);
    g.fillStyle =
      hz.k === 'lava'
        ? i % 3
          ? '#ffd080'
          : '#c03010'
        : hz.k === 'void'
          ? i % 2
            ? '#e0b0ff'
            : '#3a1060'
          : i % 2
            ? '#d8f0ff'
            : '#a0c8e0';
    g.fillRect(x, y, i % 5 ? 3 : 5, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(60, 60);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  return t;
}
function animWater() {
  const w = WORLD && WORLD.water;
  if (!w || !WORLD.haz || WORLD.haz.k !== 'water') return;
  const p = w.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i);
    p.setZ(i, Math.sin(x * 0.012 + T * 1.6) * 2.2 + Math.cos(y * 0.015 + T * 1.2) * 2);
  }
  p.needsUpdate = true;
  w.geometry.computeVertexNormals();
}
