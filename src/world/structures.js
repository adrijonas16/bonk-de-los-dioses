/* ---------- estructuras únicas ---------- */
function structures(rk, grp, coll) {
  const g = GEO;
  const put = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = true;
    m.receiveShadow = true;
    grp.add(m);
    return m;
  };
  const G0 = (x, y) => groundAt(x * WS, y * WS) / WS;
  const prism = (w, h, d) => {
    const geo = new THREE.CylinderGeometry(h, h, d, 3, 1);
    geo.rotateX(Math.PI / 2);
    geo.rotateZ(Math.PI / 2);
    geo.scale(w / (h * 1.732), 1, 1);
    return geo;
  };
  switch (rk) {
    case 'tartaro': {
      const y0 = 96,
        st = MLT('#cfc4ab', 'stone'),
        st2 = MLT('#b9ae98', 'stone');
      put(g.box(300, 8, 200), st2, 0, y0 + 4, -40);
      put(g.box(280, 8, 180), st, 0, y0 + 12, -40);
      for (let i = 0; i < 8; i++)
        for (const zz of [-120, 40]) {
          if (i === 5 && zz === 40) continue;
          put(g.cyl(8, 9, 90, 10), st, -126 + i * 36, y0 + 61, zz);
        }
      for (const xx of [-126, 126])
        for (let i = 1; i < 4; i++) put(g.cyl(8, 9, 90, 10), st, xx, y0 + 61, -120 + i * 40);
      put(g.box(290, 12, 190), st2, 0, y0 + 112, -40);
      put(prism(290, 30, 10), st, 0, y0 + 133, 55);
      put(prism(290, 30, 10), st, 0, y0 + 133, -135);
      put(g.box(296, 4, 200), MLT('#a85a3a', 'stone'), 0, y0 + 120, -40);
      put(g.box(60, 30, 12), st2, -150, y0 + 5, 140, 0, 0.3, 0.2);
      put(g.cyl(8, 9, 40, 10), st, -60, y0 + 8, 120, 1.57, 0.4, 0);
      for (const [x, z] of [
        [-40, 650],
        [40, 650],
      ]) {
        put(g.box(26, 140, 26), MLT('#8a5a2a', 'gold'), x, 70, z);
      }
      put(g.tor(42, 7, Math.PI), MLT('#c98a3a', 'gold'), 0, 140, 650);
      for (let i = -2; i <= 2; i++) put(g.box(3, 120, 3), ML('#6a4a2a'), i * 14, 60, 650);
      for (const [x, z, r] of [
        [900, -600, 0],
        [-950, 450, 2],
        [-600, -1000, 4],
        [760, 900, 1],
      ]) {
        const gy = G0(x, z);
        put(g.box(50, 14, 40), MLT('#4a3a36', 'stone'), x, gy + 7, z);
        const s = put(g.box(36, 46, 24), ML('#6a5a50'), x, gy + 38, z);
        s.rotation.y = r;
        put(g.box(24, 22, 20), ML('#6a5a50'), x, gy + 72, z);
        for (let k = 0; k < 14; k++) {
          const m = put(g.tor(9, 2.6), ML('#8a8080', { flatShading: true }), x + (k % 2 ? 3 : -3), gy + 90 + k * 16, z);
          m.rotation.y = k % 2 ? 1.57 : 0;
        }
        coll.push({ x, y: z, r: 34, top: gy + 90 });
      }
      break;
    }
    case 'duat': {
      const sx = 150,
        sz = -250,
        gy = G0(sx, sz),
        sd = MLT('#d8b878', 'sand');
      put(g.box(60, 30, 140), sd, sx, gy + 15, sz);
      put(g.box(46, 46, 40), sd, sx, gy + 50, sz - 60);
      put(g.box(30, 10, 30), ML('#2f4f9e'), sx, gy + 70, sz - 60);
      put(g.box(14, 22, 60), sd, sx - 24, gy + 10, sz + 80);
      put(g.box(14, 22, 60), sd, sx + 24, gy + 10, sz + 80);
      coll.push({ x: sx, y: sz, r: 70, top: gy + 60 });
      for (const [cx, cy, b, hh] of [
        [-600, -500, 300, 250],
        [-150, -850, 240, 200],
        [250, -1150, 170, 140],
      ])
        put(g.cone(14, 24, 4), MLT(C.gold, 'gold'), cx, hh + 10, cy, 0, 0.785, 0);
      for (let i = 0; i < 6; i++) {
        for (const xx of [640, 760]) {
          put(g.cyl(10, 11, 70, 10), MLT('#d8c088', 'stone'), xx, G0(xx, -280 + i * 32) + 35, -280 + i * 32);
        }
      }
      put(g.box(60, 90, 30), MLT('#d0b070', 'stone'), 620, G0(620, -90) + 45, -90);
      put(g.box(60, 90, 30), MLT('#d0b070', 'stone'), 780, G0(780, -90) + 45, -90);
      break;
    }
    case 'kur': {
      put(g.box(70, 30, 70), ML('#2f4f9e'), 0, 165, -260);
      put(g.box(76, 5, 76), MLT(C.gold, 'gold'), 0, 182, -260);
      for (const [x, z] of [
        [0, -820],
        [0, 980],
        [-880, 80],
        [880, 80],
      ]) {
        const gy = G0(x, z);
        put(g.box(x ? 40 : 140, 90, x ? 140 : 40), MLT('#2f4f9e', 'wall'), x, gy + 45, z);
        put(g.box(x ? 44 : 60, 40, x ? 60 : 44), MLT('#e8b53e', 'gold'), x, gy + 70, z);
      }
      break;
    }
    case 'mictlan': {
      const tc = MLT('#a8906a', 'stone'),
        red = ML('#8a2a20');
      put(g.box(80, 30, 80), tc, 360, 195, -150);
      put(g.box(84, 6, 84), red, 360, 213, -150);
      put(g.box(60, 26, 60), tc, 0, 143, -1350);
      put(g.box(64, 5, 64), red, 0, 158, -1350);
      put(g.box(50, 20, 50), tc, 0, 70, 850);
      for (let i = 0; i < 10; i++) {
        const y = -1000 + i * 200;
        for (const xx of [-110, 110]) {
          const gy = G0(xx, y);
          put(g.box(46, 20, 60), tc, xx, gy + 10, y);
          put(g.box(50, 4, 64), red, xx, gy + 22, y);
        }
      }
      for (const [x, z] of [
        [-60, 820],
        [60, 820],
        [-60, 880],
        [60, 880],
      ]) {
        put(g.box(14, 16, 22), MLT('#c8c0a0', 'stone'), x, G0(x, z) + 8, z);
      }
      break;
    }
    case 'xibalba': {
      const st = MLT('#b8b49a', 'stone');
      put(g.box(80, 40, 80), st, 0, 170, -300);
      put(g.box(86, 6, 86), ML('#8a3a2a'), 0, 193, -300);
      for (const [dx, dz] of [
        [0, 43],
        [0, -43],
        [43, 0],
        [-43, 0],
      ])
        put(g.box(dz ? 20 : 4, 26, dz ? 4 : 20), ML('#1a1a14'), dx * 0.98, 163, -300 + dz * 0.98);
      for (let i = 0; i < 6; i++) {
        put(
          g.box(12, 30, 60),
          MLT('#9a9a88', 'stone'),
          630 + (i % 2 ? -90 : 90),
          G0(630 + (i % 2 ? -90 : 90), 100 + i * 80) + 15,
          100 + i * 80
        );
      }
      put(g.tor(10, 3), ML('#8a8a7a'), 572, 70, 300, 0, 1.57, 0);
      put(g.tor(10, 3), ML('#8a8a7a'), 688, 70, 300, 0, 1.57, 0);
      break;
    }
    case 'ukupacha': {
      const wall = MLT('#b8b0a0', 'wall');
      const rot = Math.atan2(0.39, 0.92);
      for (let i = 0; i < 22; i++) {
        const t = i / 21,
          rx = -560 + t * 1120,
          ry = (i % 2 ? -1 : 1) * (120 + hash(i, 3) * 120);
        const x = rx * 0.92 + ry * 0.39,
          y = -rx * 0.39 + ry * 0.92;
        const gy = G0(x, y);
        if (gy < 130) continue;
        const m = put(g.box(44, 22, 32), wall, x, gy + 11, y);
        m.rotation.y = -rot + (i % 3) * 1.57;
        put(g.cone(34, 26, 4), MLT('#c8a050', 'thatch'), x, gy + 35, y, 0, -rot + (i % 3) * 1.57 + 0.785, 0);
        coll.push({ x, y, r: 26, top: gy + 44 });
      }
      put(g.cyl(40, 44, 42, 14), wall, 250, G0(250, -80) + 21, -80);
      coll.push({ x: 250, y: -80, r: 44, top: G0(250, -80) + 42 });
      put(g.box(30, 14, 30), wall, -200, G0(-200, 140) + 7, 140);
      put(g.box(12, 22, 8), wall, -200, G0(-200, 140) + 25, 140, 0, 0.4, 0);
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * 6.283;
        const rx = Math.cos(a) * 720,
          ry = Math.sin(a) * 345;
        const x = rx * 0.92 + ry * 0.39,
          y = -rx * 0.39 + ry * 0.92;
        put(g.box(60, 14, 10), wall, x, G0(x, y) + 7, y, 0, -a, 0);
      }
      break;
    }
    case 'cielo': {
      const gd = MLT(C.gold, 'gold'),
        wt = ML('#ffffff');
      put(g.box(22, 200, 22), gd, -110, 100, -460);
      put(g.box(22, 200, 22), gd, 110, 100, -460);
      put(g.tor(110, 10, Math.PI), MLT('#f8e080', 'gold'), 0, 200, -460);
      for (let i = -3; i <= 3; i++) put(g.box(5, 180, 3), MLT('#f8e8a0', 'gold'), i * 28, 90, -460);
      put(g.box(80, 30, 60), gd, 0, 185, -1300);
      put(g.box(80, 110, 14), MLT('#f8e080', 'gold'), 0, 225, -1328);
      put(g.sph(16, 10, 8), wt, 0, 290, -1328);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 6.283;
        put(g.cyl(6, 6, 90, 10), ML('#f4e8c0'), Math.cos(a) * 190, 215, -1250 + Math.sin(a) * 190);
      }
      break;
    }
    case 'lanka': {
      coll.push({ x: 0, y: 0, r: 52, top: 170 });
      put(g.sph(50, 12, 8), MLT(C.gold, 'gold'), 0, 120, 0);
      put(g.cone(8, 60, 8), MLT(C.gold, 'gold'), 0, 190, 0);
      for (const [x, z] of [
        [-160, -160],
        [160, -160],
        [-160, 160],
        [160, 160],
      ]) {
        put(g.sph(26, 10, 6), MLT('#e8b53e', 'gold'), x, 74, z);
        put(g.cone(5, 30, 6), MLT(C.gold, 'gold'), x, 104, z);
      }
      break;
    }
    case 'yomi': {
      const wd = ML('#5a3a2a'),
        rf = ML('#2a2a2a');
      put(g.box(120, 50, 90), wd, 0, 135, -920);
      put(g.box(150, 8, 116), rf, 0, 164, -920);
      put(g.box(110, 14, 80), rf, 0, 175, -920);
      break;
    }
    case 'diyu': {
      const rd = ML('#7a2020'),
        rf = ML('#2a2a2a');
      let y = 84;
      for (let i = 0; i < 5; i++) {
        const w = 110 - i * 18;
        put(g.box(w, 26, w), rd, 0, y + 13, 0);
        put(g.box(w + 40, 6, w + 40), rf, 0, y + 29, 0);
        y += 32;
      }
      put(g.cone(6, 30, 6), MLT(C.gold, 'gold'), 0, y + 15, 0);
      coll.push({ x: 0, y: 0, r: 60, top: y });
      break;
    }
    case 'jotunheim': {
      for (let i = 0; i < 3; i++) {
        const x = [300, -300, 700][i],
          z = [300, 700, -400][i];
        const m = put(g.tor(120, 14, Math.PI), MLT('#6a4a32', 'bark'), x, G0(x, z), z);
        m.rotation.y = i;
      }
      break;
    }
    case 'orun': {
      put(g.cyl(26, 40, 200, 10), MLT('#5a3a22', 'bark'), 0, 130, 0);
      put(g.ico(130, 1), MLT('#2a4a1a', 'leaf'), 0, 300, 0);
      put(g.ico(90, 1), MLT('#3a6a2a', 'leaf'), 40, 370, 20);
      coll.push({ x: 0, y: 0, r: 40, top: 300 });
      break;
    }
    case 'annwn': {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * 6.283,
          x = 500 + Math.cos(a) * 150,
          z = -350 + Math.sin(a) * 150;
        put(g.box(16, 60, 12), MLT('#7a8088', 'stone'), x, G0(x, z) + 30, z, 0, a, 0);
        coll.push({ x, y: z, r: 12, top: G0(x, z) + 60 });
      }
      put(g.box(70, 10, 30), MLT('#7a8088', 'stone'), 500, G0(500, -350) + 30, -350);
      break;
    }
    case 'vacio': {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * 6.283,
          r = 600 + hash(i, 5) * 800;
        const m = put(
          g.dod(30 + hash(i, 6) * 40),
          ML('#3a2a5a'),
          Math.cos(a) * r,
          200 + hash(i, 7) * 260,
          Math.sin(a) * r
        );
        m.userData.float = i;
      }
      break;
    }
  }
}
