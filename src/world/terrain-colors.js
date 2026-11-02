/* ---------- colores del terreno ---------- */
const _c = new THREE.Color();
function terrainColor(rk, x, y, h, sl) {
  const r = REALMS[rk],
    L = LOOK3D[rk],
    d = Math.hypot(x, y),
    n = fbm(x / 110, y / 110, rk.length * 3);
  let col = n > 0.55 ? r.g1 : r.g2;
  if (sl > 0.85) col = r.det;
  if (d > ARENA - 70)
    col =
      h > 320 && (rk === 'jotunheim' || rk === 'annwn' || rk === 'ukupacha' || rk === 'tartaro') ? '#f4f8fb' : L.rim;
  if (L.haz && h < L.haz.lv + 2)
    col = L.haz.k === 'lava' ? '#2a1210' : L.haz.k === 'void' ? '#1a0830' : shade(r.g2, -0.25);
  switch (rk) {
    case 'tartaro':
      if (h > 90 && d < 340) col = n > 0.5 ? '#c9bea6' : '#b8ad96';
      if (L.haz && h < L.haz.lv + 10 && h >= L.haz.lv + 2) col = '#6a2418';
      if (d < 340 && h > 90 && (Math.floor(x / 40) + Math.floor(y / 40)) % 2 === 0) col = shade(col, -0.06);
      break;
    case 'jotunheim':
      if (sl > 0.85) col = '#7a8a96';
      else if (h < 4 && fbm(x / 320, y / 320, 5) < 0.34) col = '#bfe6f8';
      break;
    case 'duat': {
      for (const [cx, cy, b] of [
        [-600, -500, 300],
        [-150, -850, 240],
        [250, -1150, 170],
      ]) {
        if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) < b - 4) col = Math.floor(h / 14) % 2 ? '#e0c488' : '#d0b070';
      }
      if (Math.max(Math.abs(x - 700), Math.abs(y + 200)) < 120) col = '#c8a870';
      break;
    }
    case 'kur': {
      const pd = Math.max(Math.abs(x), Math.abs(y + 260));
      if (pd < 330 && h > 36) col = h > 145 ? '#2f4f9e' : Math.floor(h / 40) % 2 ? '#a87850' : '#c49464';
      if (h >= 58 && h <= 62) col = '#b0805a';
      break;
    }
    case 'lanka':
      if (d < 240 && h > 48) col = h > 88 ? '#e8b53e' : '#c8a04a';
      break;
    case 'yomi':
      if (Math.abs(x - Math.sin(y / 360) * 160) < 54) col = '#6a6a58';
      if (Math.hypot(x, y + 900) < 200 && h > 100) col = '#5a5a4a';
      break;
    case 'diyu':
      if (d < 240 && h > 80) col = '#7a2420';
      if (Math.abs(y + 900) < 40 && h > 66) col = '#8a7a6a';
      break;
    case 'mictlan':
      if (Math.abs(x) < 80 && y > -1500 && y < 1100) col = Math.floor(y / 60) % 2 ? '#8a7a6a' : '#7a6a5a';
      if (Math.max(Math.abs(x - 360), Math.abs(y + 150)) < 280 && h > 8)
        col = Math.floor(h / 36) % 2 ? '#9a8268' : '#86705a';
      if (Math.max(Math.abs(x), Math.abs(y + 1350)) < 200 && h > 8)
        col = Math.floor(h / 32) % 2 ? '#9a8268' : '#86705a';
      if (Math.max(Math.abs(x), Math.abs(y - 850)) < 260 && h > 10) col = '#8a7460';
      break;
    case 'xibalba':
      if (Math.max(Math.abs(x), Math.abs(y + 300)) < 222 && h > 6)
        col = Math.floor(h / 16.7) % 2 ? '#b8b49a' : '#a8a488';
      if (x > 500 && x < 760 && Math.abs(y - 300) < 400) col = Math.abs(x - 630) < 60 ? '#7a8a6a' : '#a8a490';
      break;
    case 'ukupacha': {
      const rx = x * 0.92 - y * 0.39,
        ry = x * 0.39 + y * 0.92,
        e = Math.hypot(rx / 700, ry / 330);
      if (e < 1) col = n > 0.5 ? '#6aa04a' : '#5a9040';
      else if (h > -150) col = Math.floor(h / 22) % 2 ? '#5a8a3a' : '#6a6a5a';
      if (h > 300) col = h > 520 ? '#e8eef0' : n > 0.5 ? '#4a7a3a' : '#3a6a30';
      break;
    }
    case 'cielo':
      if (Math.abs(x) < 90 && y > -1020 && y < -500) col = '#e8b53e';
      else if (h > 30) col = n > 0.5 ? '#f4f2ff' : '#e4e0fa';
      else col = n > 0.5 ? '#d8e0f6' : '#c8d2f0';
      if (Math.hypot(x, y + 1250) < 230 && h > 160) col = '#f4d27a';
      break;
    case 'vacio':
      if (h > -20) col = n > 0.5 ? '#2a2236' : '#3a2a5a';
      break;
  }
  _c.set(col);
  const j = (hash(Math.round(x), Math.round(y), 9) - 0.5) * 0.07;
  _c.offsetHSL(0, 0, j);
  return _c;
}
const GEO = {
  cyl: (a, b, h, s = 8) => new THREE.CylinderGeometry(a, b, h, s),
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  cone: (r, h, s = 8) => new THREE.ConeGeometry(r, h, s),
  ico: (r, d = 0) => new THREE.IcosahedronGeometry(r, d),
  dod: (r) => new THREE.DodecahedronGeometry(r, 0),
  sph: (r, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h),
  oct: (r) => new THREE.OctahedronGeometry(r, 0),
  tor: (r, t, arc) => new THREE.TorusGeometry(r, t, 6, 14, arc || Math.PI * 2),
};
const MATC = {};
function ML(c, o) {
  const k = 'L' + c + JSON.stringify(o || {});
  return MATC[k] || (MATC[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o || {})));
}
function MB(c, o) {
  const k = 'B' + c + JSON.stringify(o || {});
  return MATC[k] || (MATC[k] = new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {})));
}
let PK = null;
function propKinds() {
  if (PK) return PK;
  const g = GEO;
  PK = {
    column: {
      c: 10,
      h: 66,
      p: [
        [g.cyl(6, 7, 64, 8), ML('#d9cfb8'), 0, 32, 0],
        [g.box(18, 5, 18), ML('#cfc4ab'), 0, 66, 0],
        [g.box(16, 4, 16), ML('#cfc4ab'), 0, 2, 0],
      ],
    },
    brokencol: {
      c: 9,
      h: 26,
      p: [
        [g.cyl(6, 7, 26, 8), ML('#bdb3a0'), 0, 13, 0],
        [g.cyl(6, 6, 22, 8), ML('#bdb3a0'), 18, 6, 4, 0, 0.3, 1.57],
      ],
    },
    rock: { c: 8, h: 20, p: [[g.dod(14), ML('#4a3a36'), 0, 6, 0]] },
    rockgrey: {
      c: 8,
      h: 20,
      p: [
        [g.dod(14), ML('#7a8a96'), 0, 6, 0],
        [g.dod(8), ML('#f4f8fb'), 3, 14, 0],
      ],
    },
    rocksand: { c: 8, h: 18, p: [[g.dod(13), ML('#b08848'), 0, 5, 0]] },
    rockmoss: {
      c: 8,
      h: 18,
      p: [
        [g.dod(13), ML('#5a6a4a'), 0, 5, 0],
        [g.dod(7), ML('#3f8a3a'), 2, 12, 0],
      ],
    },
    rockpurple: { c: 8, h: 18, p: [[g.dod(13), ML('#3a2f46'), 0, 5, 0]] },
    rocksalt: { c: 0, h: 12, p: [[g.dod(10), ML('#d8d0c0'), 0, 3, 0]] },
    chainpost: {
      c: 0,
      h: 60,
      p: [
        [g.box(6, 60, 6), ML('#3a3030'), 0, 30, 0],
        [g.tor(5, 1.4), ML('#7a7070'), 0, 58, 4],
        [g.tor(5, 1.4), ML('#7a7070'), 0, 50, 4, 0, 1.57, 0],
        [g.tor(5, 1.4), ML('#7a7070'), 0, 42, 4],
      ],
    },
    pine: {
      c: 4,
      h: 56,
      p: [
        [g.cyl(3, 4, 14, 6), ML('#5a3a2a'), 0, 7, 0],
        [g.cone(17, 42, 7), ML('#2f5a4a'), 0, 34, 0],
        [g.cone(10, 18, 7), ML('#f4f8fb'), 0, 50, 0],
      ],
    },
    runestone: {
      c: 5,
      h: 28,
      p: [
        [g.box(11, 28, 6), ML('#7a8a96'), 0, 14, 0],
        [g.box(2, 14, 1), MB('#7de0ff'), 0, 15, 3.2],
        [g.box(8, 2, 1), MB('#7de0ff'), 0, 18, 3.2],
      ],
    },
    icecrystal: {
      c: 0,
      h: 34,
      p: [
        [g.cone(7, 34, 5), ML('#bfefff', { transparent: true, opacity: 0.85 }), 0, 17, 0],
        [g.cone(4, 20, 5), ML('#dff8ff'), 6, 10, 3],
      ],
    },
    rootarch: { c: 0, h: 0, p: [[g.tor(70, 9, Math.PI), ML('#6a4a32'), 0, 0, 0]] },
    obelisk: {
      c: 6,
      h: 76,
      p: [
        [g.cyl(4, 7, 72, 4), ML('#d8b878'), 0, 36, 0],
        [g.cone(4.5, 8, 4), MB(C.gold), 0, 76, 0],
        [g.box(14, 4, 14), ML('#a87a3c'), 0, 2, 0],
      ],
    },
    palm: {
      c: 3,
      h: 50,
      p: [
        [g.cyl(2, 3.2, 48, 6), ML('#7a5a3a'), 0, 24, 0],
        [g.box(30, 2, 6), ML('#3a8a3a'), 0, 48, 0, 0, 0, 0.25],
        [g.box(30, 2, 6), ML('#3a7a3a'), 0, 48, 0, 0, 1.57, 0.25],
        [g.box(30, 2, 6), ML('#2f6a2f'), 0, 48, 0, 0, 0.78, -0.2],
        [g.box(30, 2, 6), ML('#3a8a3a'), 0, 48, 0, 0, 2.35, -0.2],
      ],
    },
    reeds: {
      c: 0,
      h: 0,
      p: [
        [g.box(2, 18, 2), ML('#8a8a4a'), 0, 9, 0],
        [g.box(2, 22, 2), ML('#7a8a3a'), 4, 11, 2],
        [g.box(2, 16, 2), ML('#8a8a4a'), -3, 8, 3],
      ],
    },
    capstone: { c: 0, h: 0, p: [[g.cone(22, 26, 4), MB(C.gold), 0, 13, 0]] },
    zigshrine: {
      c: 24,
      h: 40,
      p: [
        [g.box(60, 26, 60), ML('#2f4f9e'), 0, 13, 0],
        [g.box(66, 4, 66), MB(C.gold), 0, 28, 0],
        [g.box(20, 24, 4), MB(C.gold), 0, 12, 31],
      ],
    },
    tablets: {
      c: 0,
      h: 0,
      p: [
        [g.box(10, 3, 7), ML('#d9b88a'), 0, 1.5, 0],
        [g.box(9, 3, 6), ML('#c9a87a'), 1, 4.5, 0, 0, 0.4, 0],
      ],
    },
    jtree: {
      c: 4,
      h: 60,
      p: [
        [g.cyl(3, 4, 30, 6), ML('#5a4a2a'), 0, 15, 0],
        [g.ico(20), ML('#2f6a2a'), 0, 38, 0],
        [g.ico(14), ML('#3f8a3a'), 4, 50, 2],
      ],
    },
    jtreedark: {
      c: 4,
      h: 60,
      p: [
        [g.cyl(3, 4, 30, 6), ML('#3a2a1a'), 0, 15, 0],
        [g.ico(20), ML('#1f4a2a'), 0, 38, 0],
        [g.ico(14), ML('#2a5a3a'), 4, 50, 2],
      ],
    },
    stupa: {
      c: 16,
      h: 44,
      p: [
        [g.box(30, 10, 30), ML('#c8a04a'), 0, 5, 0],
        [g.sph(14, 10, 6), MB(C.gold), 0, 14, 0],
        [g.cone(3, 16, 6), MB(C.gold), 0, 32, 0],
      ],
    },
    lotus: {
      c: 0,
      h: 0,
      p: [
        [g.cone(6, 6, 6), ML('#e27aa8'), 0, 3, 0],
        [g.cyl(9, 9, 1, 8), ML('#3a8a3a'), 0, 0, 0],
      ],
    },
    torii: {
      c: 5,
      h: 52,
      p: [
        [g.cyl(2.6, 2.6, 48, 6), ML('#d83a2a'), -17, 24, 0],
        [g.cyl(2.6, 2.6, 48, 6), ML('#d83a2a'), 17, 24, 0],
        [g.box(50, 4, 5), ML('#d83a2a'), 0, 48, 0],
        [g.box(58, 3, 6), ML('#1c1210'), 0, 51.5, 0],
        [g.box(38, 3, 3), ML('#d83a2a'), 0, 40, 0],
      ],
    },
    toro: {
      c: 4,
      h: 28,
      p: [
        [g.box(7, 16, 7), ML('#8a8a7a'), 0, 8, 0],
        [g.box(12, 7, 12), ML('#7a7a6a'), 0, 19, 0],
        [g.box(6, 5, 6), MB('#f2c26a'), 0, 19, 0],
        [g.cone(11, 6, 4), ML('#6a6a5a'), 0, 26, 0, 0, 0.78, 0],
      ],
    },
    bamboo: {
      c: 0,
      h: 70,
      p: [
        [g.cyl(1.6, 1.6, 70, 5), ML('#5a8a3a'), 0, 35, 0],
        [g.cyl(1.6, 1.6, 62, 5), ML('#6a9a4a'), 5, 31, 3],
        [g.cyl(1.6, 1.6, 74, 5), ML('#4a7a2a'), -4, 37, 4],
        [g.cyl(1.6, 1.6, 58, 5), ML('#5a8a3a'), 2, 29, -5],
      ],
    },
    shrine: {
      c: 30,
      h: 40,
      p: [
        [g.box(56, 30, 40), ML('#6a4a3a'), 0, 15, 0],
        [g.box(70, 6, 54), ML('#2a2a2a'), 0, 32, 0],
        [g.box(50, 8, 36), ML('#2a2a2a'), 0, 38, 0],
      ],
    },
    redlantern: {
      c: 0,
      h: 42,
      p: [
        [g.cyl(1, 1, 40, 4), ML('#1c1210'), 0, 20, 0],
        [g.cyl(5, 5, 11, 8), MB('#ff4a2a'), 0, 36, 0],
        [g.box(12, 1.5, 12), MB(C.gold), 0, 42, 0],
      ],
    },
    plumtree: {
      c: 3,
      h: 40,
      p: [
        [g.cyl(2.5, 3.5, 24, 6), ML('#3a2020'), 0, 12, 0],
        [g.ico(15), ML('#f2a8c8'), 0, 30, 0],
        [g.ico(9), ML('#f8c8d8'), 6, 36, 3],
      ],
    },
    pagoda: {
      c: 40,
      h: 90,
      p: [
        [g.box(60, 20, 60), ML('#6a2020'), 0, 10, 0],
        [g.box(84, 4, 84), ML('#2a2a2a'), 0, 22, 0],
        [g.box(46, 18, 46), ML('#6a2020'), 0, 33, 0],
        [g.box(66, 4, 66), ML('#2a2a2a'), 0, 44, 0],
        [g.box(32, 16, 32), ML('#6a2020'), 0, 54, 0],
        [g.box(50, 4, 50), ML('#2a2a2a'), 0, 64, 0],
        [g.cone(4, 16, 6), MB(C.gold), 0, 74, 0],
      ],
    },
    marigold: {
      c: 0,
      h: 0,
      p: [
        [g.sph(3, 6, 4), MB('#f2a22c'), 0, 2, 0],
        [g.sph(3, 6, 4), MB('#f8c040'), 5, 2, 3],
        [g.sph(3, 6, 4), MB('#f2a22c'), -4, 2, 4],
        [g.sph(2.5, 6, 4), MB('#f8c040'), 2, 2, -4],
      ],
    },
    skullpile: {
      c: 0,
      h: 0,
      p: [
        [g.sph(4, 6, 5), ML('#e8e0cc'), 0, 3, 0],
        [g.sph(4, 6, 5), ML('#e8e0cc'), 7, 3, 0],
        [g.sph(4, 6, 5), ML('#e8e0cc'), 3.5, 9, 0],
      ],
    },
    candle: {
      c: 0,
      h: 0,
      p: [
        [g.cyl(1.6, 1.6, 9, 6), ML('#f2e3c6'), 0, 4.5, 0],
        [g.cone(1.4, 4, 5), MB('#f8d060'), 0, 11, 0],
        [g.cyl(1.6, 1.6, 6, 6), ML('#f2e3c6'), 5, 3, 2],
        [g.cone(1.4, 4, 5), MB('#f8d060'), 5, 8, 2],
      ],
    },
    obsidian: {
      c: 0,
      h: 16,
      p: [
        [g.cone(4, 16, 4), ML('#1a1420'), 0, 8, 0],
        [g.cone(3, 10, 4), ML('#2a2236'), 5, 5, 2],
      ],
    },
    stele: {
      c: 5,
      h: 36,
      p: [
        [g.box(13, 36, 6), ML('#7a8a7a'), 0, 18, 0],
        [g.box(9, 7, 1), ML('#5a6a5a'), 0, 26, 3.2],
        [g.box(9, 7, 1), ML('#5a6a5a'), 0, 15, 3.2],
      ],
    },
    fern: {
      c: 0,
      h: 0,
      p: [
        [g.cone(8, 4, 5), ML('#2f6a3a'), 0, 4, 0, 0, 0, 0.4],
        [g.cone(8, 4, 5), ML('#3a7a3a'), 4, 4, 2, 0, 1.5, 0.4],
        [g.cone(8, 4, 5), ML('#2a5a2a'), -3, 4, 3, 0, 3, 0.4],
      ],
    },
    ballring: { c: 0, h: 0, p: [[g.tor(9, 2.4), ML('#8a8a7a'), 0, 0, 0, 0, 1.57, 0]] },
    apacheta: {
      c: 6,
      h: 24,
      p: [
        [g.dod(10), ML('#8a7a6a'), 0, 6, 0],
        [g.dod(7), ML('#9a8a7a'), 0, 15, 0],
        [g.dod(4.5), ML('#aa9a8a'), 0, 22, 0],
      ],
    },
    ichu: {
      c: 0,
      h: 0,
      p: [
        [g.cone(2.5, 12, 4), ML('#c8a84a'), 0, 6, 0],
        [g.cone(2.5, 10, 4), ML('#d8b85a'), 3, 5, 2],
        [g.cone(2.5, 11, 4), ML('#b8983a'), -2, 5, 3],
      ],
    },
    tree: {
      c: 4,
      h: 60,
      p: [
        [g.cyl(4, 5, 34, 6), ML('#5a3a22'), 0, 17, 0],
        [g.ico(22), ML('#3a6a2a'), 0, 44, 0],
        [g.ico(15), ML('#4a7a32'), 6, 56, 3],
      ],
    },
    bigtree: {
      c: 40,
      h: 200,
      p: [
        [g.cyl(18, 28, 130, 8), ML('#5a3a22'), 0, 65, 0],
        [g.ico(85, 1), ML('#2a4a1a'), 0, 160, 0],
        [g.ico(60, 1), ML('#3a6a2a'), 20, 205, 10],
      ],
    },
    pot: {
      c: 0,
      h: 0,
      p: [
        [g.cyl(5, 7, 10, 8), ML('#8a4a2a'), 0, 5, 0],
        [g.sph(1.5, 5, 4), ML('#f2e3c6'), 2, 10, 2],
        [g.sph(1.5, 5, 4), ML('#f2e3c6'), -2, 10, 1],
      ],
    },
    flowers: {
      c: 0,
      h: 0,
      p: [
        [g.sph(2, 5, 4), MB('#e8c23a'), 0, 2, 0],
        [g.sph(2, 5, 4), MB('#d23a5a'), 4, 2, 2],
        [g.sph(2, 5, 4), MB('#e27aa8'), -3, 2, 3],
      ],
    },
    menhir: {
      c: 5,
      h: 40,
      p: [
        [g.box(11, 40, 8), ML('#7a8088'), 0, 20, 0, 0.05, 0, 0.06],
        [g.box(3, 3, 1), MB('#9ad0e8'), 0, 26, 4.2],
      ],
    },
    heather: {
      c: 0,
      h: 0,
      p: [
        [g.sph(3, 6, 4), ML('#8a6a9a'), 0, 2, 0],
        [g.sph(3, 6, 4), ML('#9a7aaa'), 5, 2, 2],
        [g.sph(3, 6, 4), ML('#7a5a8a'), -4, 2, 3],
      ],
    },
    deadtree: {
      c: 3,
      h: 50,
      p: [
        [g.cyl(2.5, 4, 44, 5), ML('#4a3a32'), 0, 22, 0],
        [g.box(22, 2, 2), ML('#4a3a32'), 6, 36, 0, 0, 0, 0.5],
        [g.box(18, 2, 2), ML('#4a3a32'), -5, 30, 0, 0, 0, -0.6],
      ],
    },
    cloud: {
      c: 0,
      h: 0,
      p: [
        [g.ico(16, 1), ML('#ffffff'), 0, 6, 0],
        [g.ico(12, 1), ML('#f4f4ff'), 14, 4, 4],
        [g.ico(11, 1), ML('#ffffff'), -12, 3, 6],
      ],
    },
    goldpillar: {
      c: 6,
      h: 76,
      p: [
        [g.cyl(5, 5, 72, 10), ML('#f4e8c0'), 0, 36, 0],
        [g.box(16, 5, 16), MB(C.gold), 0, 74, 0],
        [g.box(14, 4, 14), MB(C.gold), 0, 2, 0],
      ],
    },
    gate: {
      c: 0,
      h: 0,
      p: [
        [g.box(14, 120, 14), MB(C.gold), -70, 60, 0],
        [g.box(14, 120, 14), MB(C.gold), 70, 60, 0],
        [g.tor(70, 7, Math.PI), MB('#f8e080'), 0, 120, 0],
        [g.box(4, 110, 2), MB('#f8e8a0'), -30, 55, 0],
        [g.box(4, 110, 2), MB('#f8e8a0'), 0, 55, 0],
        [g.box(4, 110, 2), MB('#f8e8a0'), 30, 55, 0],
      ],
    },
    throne: {
      c: 30,
      h: 60,
      p: [
        [g.box(50, 20, 40), MB(C.gold), 0, 10, 0],
        [g.box(50, 70, 10), MB('#f8e080'), 0, 45, -18],
        [g.sph(10, 8, 6), MB('#ffffff'), 0, 85, -18],
      ],
    },
    crystal: {
      c: 6,
      h: 30,
      p: [
        [g.oct(11), MB('#b07aff'), 0, 14, 0],
        [g.oct(6), MB('#e27aa8'), 9, 8, 4],
      ],
    },
    floatrock: {
      c: 0,
      h: 0,
      p: [
        [g.dod(22), ML('#3a2a5a'), 0, 90, 0],
        [g.cone(14, 30, 5), ML('#2a2236'), 0, 68, 0, Math.PI, 0, 0],
      ],
    },
  };
  return PK;
}

function MLT(c, tex, o) {
  const k = 'T' + c + tex + JSON.stringify(o || {});
  return (
    MATC[k] ||
    (MATC[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true, map: TEX(tex) }, o || {})))
  );
}
