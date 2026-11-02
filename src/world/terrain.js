/* Bonk de los Dioses · mundos 3D */
function PA(n) {
  return typeof AS !== 'undefined' && AS.ready ? AS.props[n] : null;
}
const WS = 1.5,
  ARENA = 2600 * WS,
  TSIZE = 5800 * WS,
  TSEG = 340,
  AREAK = 1.69 * 1.15,
  TCELL = TSIZE / TSEG,
  HALF = TSIZE / 2;
const sstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
function plat(x, y, cx, cy, r, h, edge) {
  const d = Math.hypot(x - cx, y - cy);
  if (d <= r) return h;
  if (d >= r + edge) return -1e9;
  return h * (1 - (d - r) / edge);
}
function sqplat(x, y, cx, cy, r, h) {
  return Math.max(Math.abs(x - cx), Math.abs(y - cy)) <= r ? h : -1e9;
}
const q = (v, s) => Math.floor(v / s) * s;
/* pirámide escalonada: base y cima en radio cuadrado */
function stepPyr(x, y, cx, cy, base, top, h, steps) {
  const d = Math.max(Math.abs(x - cx), Math.abs(y - cy));
  if (d > base) return -1e9;
  if (d <= top) return h;
  return (Math.ceil((1 - (d - top) / (base - top)) * steps) / steps) * h;
}
/* rampa o escalera a lo largo de un segmento */
function ramp(x, y, ax, ay, bx, by, w, h0, h1, step) {
  const vx = bx - ax,
    vy = by - ay,
    L2 = vx * vx + vy * vy,
    t = ((x - ax) * vx + (y - ay) * vy) / L2;
  if (t < 0 || t > 1) return -1e9;
  const px = ax + vx * t,
    py = ay + vy * t;
  if (Math.hypot(x - px, y - py) > w / 2) return -1e9;
  const h = h0 + (h1 - h0) * t;
  return step ? Math.round(h / step) * step : h;
}
function riverD(x, y, amp, per, off) {
  return Math.abs(y - Math.sin(x / per) * amp - off);
}
const M = (...v) => Math.max(...v);

const TER = {
  tartaro(x, y) {
    let h = (fbm(x / 360, y / 360, 11) - 0.5) * 110;
    const lv = Math.min(riverD(x, y, 260, 420, -700), riverD(y, x, 300, 500, 800), riverD(x, y, 220, 380, 900));
    if (lv < 90 && Math.hypot(x, y) > 380) h = Math.min(h, -34 + lv * 0.05);
    h = M(h, plat(x, y, 0, 0, 330, 96, 16), ramp(x, y, 0, 330, 0, 640, 110, 96, 0, 12));
    for (const [mx, my, r, mh] of [
      [900, -600, 170, 70],
      [-950, 450, 190, 62],
      [-600, -1000, 160, 80],
      [760, 900, 150, 56],
      [1300, 200, 120, 90],
      [-1300, -200, 130, 84],
    ])
      h = M(h, plat(x, y, mx, my, r, mh, 12));
    return h;
  },
  jotunheim(x, y) {
    let h = (fbm(x / 420, y / 420, 21) - 0.42) * 220;
    if (fbm(x / 320, y / 320, 5) < 0.34) h = Math.min(h, 2 + fbm(x / 40, y / 40, 2) * 3);
    h = M(h, plat(x, y, -700, -600, 190, 52, 70), plat(x, y, 0, 0, 180, 8, 120), plat(x, y, 800, 500, 140, 90, 40));
    return h;
  },
  duat(x, y) {
    let h = Math.sin(x / 110 + Math.sin(y / 240) * 2) * 16 + (fbm(x / 300, y / 300, 31) - 0.5) * 50;
    const rv = riverD(x, y, 220, 380, 700);
    if (rv < 120) h = Math.min(h, -26 * (1 - rv / 120) - 2);
    for (const [cx, cy, b, hh] of [
      [-600, -500, 300, 250],
      [-150, -850, 240, 200],
      [250, -1150, 170, 140],
    ]) {
      const d = Math.max(Math.abs(x - cx), Math.abs(y - cy));
      const ph = hh * (1 - d / b);
      if (ph > 0) h = M(h, q(ph, 14));
    }
    h = M(h, plat(x, y, 0, 0, 160, 4, 80), sqplat(x, y, 700, -200, 120, 30));
    return h;
  },
  kur(x, y) {
    let h = (fbm(x / 340, y / 340, 41) - 0.5) * 40;
    if (Math.abs(((x + 4000) % 520) - 260) < 18 && Math.abs(y) > 520) h = -20;
    const dx = Math.abs(x),
      dy = y + 260,
      pd = Math.max(dx, Math.abs(dy));
    let z = -1e9;
    if (pd < 330) z = 40;
    if (pd < 240) z = 80;
    if (pd < 150) z = 120;
    if (pd < 70) z = 150;
    if (dx < 34 && dy > 60 && dy < 340) z = M(z, q(150 * (1 - (dy - 60) / 280), 10));
    h = M(h, z);
    const wd = Math.max(Math.abs(x), Math.abs(y - 80));
    if (wd > 860 && wd < 900 && !(Math.abs(x) < 70 || Math.abs(y - 80) < 70)) h = M(h, 60);
    return h;
  },
  lanka(x, y) {
    let h = (fbm(x / 320, y / 320, 51) - 0.45) * 120;
    if (fbm(x / 240, y / 240, 8) < 0.33) h = Math.min(h, -20);
    h = M(
      h,
      plat(x, y, 0, 0, 240, 50, 16),
      ramp(x, y, 240, 0, 520, 0, 80, 50, 0, 10),
      plat(x, y, 0, 0, 110, 90, 10),
      ramp(x, y, 110, 0, 240, 0, 40, 90, 50, 10)
    );
    return h;
  },
  yomi(x, y) {
    let h = (fbm(x / 300, y / 300, 61) - 0.5) * 80;
    const px = Math.sin(y / 360) * 160;
    if (Math.abs(x - px) < 54) h = h * 0.2 + 4;
    h = M(h, plat(x, y, 0, -900, 200, 110, 14));
    if (Math.abs(x - px) < 54 && y > -700 && y < -300) h = M(h, q(110 * (1 - (y + 700) / 400), 10));
    return h;
  },
  diyu(x, y) {
    let h = q(fbm(x / 360, y / 360, 71) * 140, 14) - 60;
    h = M(h, plat(x, y, 0, 0, 240, 84, 14), ramp(x, y, 240, 0, 540, 0, 70, 84, 0, 10));
    if (Math.abs(y + 900) < 40 && Math.abs(x) < 1500) h = M(h, 70);
    return h;
  },
  mictlan(x, y) {
    let h = (fbm(x / 340, y / 340, 81) - 0.45) * 80;
    if (Math.abs(x) < 80 && y > -1500 && y < 1100) h = q((fbm(x / 60, y / 600, 4) - 0.5) * 6, 2) + 2;
    h = M(h, stepPyr(x, y, 360, -150, 280, 70, 180, 5), ramp(x, y, 80, -150, 300, -150, 70, 0, 180, 12));
    h = M(h, stepPyr(x, y, 0, -1350, 200, 50, 130, 4), ramp(x, y, 0, -1150, 0, -1320, 60, 0, 130, 12));
    const cd = Math.max(Math.abs(x), Math.abs(y - 850));
    if (cd < 260 && cd > 200) h = M(h, 26);
    h = M(h, stepPyr(x, y, 0, 850, 90, 30, 60, 4));
    return h;
  },
  xibalba(x, y) {
    let h = (fbm(x / 300, y / 300, 91) - 0.45) * 70;
    h = M(
      h,
      stepPyr(x, y, 0, -300, 220, 55, 150, 9),
      ramp(x, y, 0, -80, 0, -290, 46, 0, 150, 10),
      ramp(x, y, 0, -520, 0, -310, 46, 0, 150, 10),
      ramp(x, y, 220, -300, 10, -300, 46, 0, 150, 10),
      ramp(x, y, -220, -300, -10, -300, 46, 0, 150, 10)
    );
    if (x > 500 && x < 760 && Math.abs(y - 300) < 400) {
      if (Math.abs(x - 630) < 60) h = 2;
      else h = M(h, 52);
    }
    for (const [cx, cy] of [
      [-700, -600],
      [750, -900],
      [-500, 800],
      [200, 1000],
    ]) {
      if (Math.hypot(x - cx, y - cy) < 115) h = Math.min(h, -60);
    }
    return h;
  },
  ukupacha(x, y) {
    const rx = x * 0.92 - y * 0.39,
      ry = x * 0.39 + y * 0.92;
    const e = Math.hypot(rx / 700, ry / 330);
    let h;
    if (e < 1) h = 140 + (fbm(x / 120, y / 120, 3) - 0.5) * 4;
    else {
      const out = (e - 1) * 330;
      h = 140 - Math.floor(out / 46) * 22 - (out > 380 ? (out - 380) * 0.9 : 0);
    }
    if (e < 1.05 && Math.abs(ry) < 60 && Math.abs(rx) < 520) h = M(h, 140);
    const hp = Math.hypot(x + 300, y + 1100);
    if (hp < 520) h = M(h, 140 + Math.pow(1 - hp / 520, 1.6) * 520);
    h = M(h, plat(x, y, 250, -80, 70, 170, 30));
    h += (fbm(x / 200, y / 200, 101) - 0.5) * 10;
    return Math.max(h, -260);
  },
  orun(x, y) {
    let h = (fbm(x / 340, y / 340, 111) - 0.45) * 100;
    const rv = riverD(y, x, 200, 300, 700);
    if (rv < 80) h = Math.min(h, -22 * (1 - rv / 80) - 2);
    h = M(h, plat(x, y, 0, 0, 180, 30, 70));
    return h;
  },
  annwn(x, y) {
    let h = (fbm(x / 380, y / 380, 121) - 0.42) * 140;
    if (fbm(x / 280, y / 280, 9) < 0.33) h = Math.min(h, -20);
    h = M(h, plat(x, y, 500, -350, 190, 80, 160), plat(x, y, 0, 0, 140, 6, 80));
    return h;
  },
  cielo(x, y) {
    let h = (fbm(x / 140, y / 140, 131) - 0.5) * 26;
    for (const [cx, cy, r, ph] of [
      [-600, -200, 110, 44],
      [-800, -520, 100, 80],
      [-560, -820, 110, 118],
      [620, -220, 110, 44],
      [820, -540, 100, 82],
      [560, -860, 100, 122],
      [-200, 700, 130, 36],
      [420, 620, 120, 62],
      [-1000, 300, 120, 50],
      [1000, 250, 120, 58],
    ])
      h = M(h, plat(x, y, cx, cy, r, ph, 8));
    h = M(h, plat(x, y, 0, -1250, 230, 170, 10), ramp(x, y, 0, -1020, 0, -500, 90, 170, 0, 12));
    return h;
  },
  vacio(x, y) {
    const n = fbm(x / 300, y / 300, 141);
    let h = n > 0.44 ? (n - 0.44) * 340 : -70;
    h = M(h, plat(x, y, 0, 0, 240, 20, 50));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 6.283;
      h = M(
        h,
        plat(x, y, Math.cos(a) * 1000, Math.sin(a) * 1000, 140, 30 + i * 12, 30),
        ramp(x, y, Math.cos(a) * 240, Math.sin(a) * 240, Math.cos(a) * 860, Math.sin(a) * 860, 60, 20, 30 + i * 12, 0)
      );
    }
    return h;
  },
};
function terrainH(rk, x, y) {
  let h = TER[rk](x / WS, y / WS) * WS;
  const d = Math.hypot(x, y);
  if (d > ARENA - 90) {
    const k = Math.min(700, Math.pow((d - (ARENA - 90)) / 14, 2) * 3);
    h = Math.max(h, rk === 'ukupacha' ? h : 0) + k + (fbm(x / 90, y / 90, 7) - 0.5) * 60 * Math.min(1, k / 80);
  }
  return h;
}

const LOOK3D = {
  tartaro: {
    top: '#1a0806',
    hor: '#7a2a18',
    hemi: ['#c07a5a', '#2a1010', 0.62],
    sun: ['#ffb080', 0.85],
    haz: { lv: -18, col: '#ff6a1a', k: 'lava' },
    night: true,
    rim: '#2a1a1a',
    tex: 'basalt',
    grass: ['ash', 600],
    far: '#3a1810',
    farH: 520,
    volcano: true,
  },
  jotunheim: {
    top: '#0a1a3a',
    hor: '#8ab0d0',
    hemi: ['#e0eeff', '#6a7a8a', 0.62],
    sun: ['#dfefff', 0.55],
    aurora: true,
    stars: true,
    rim: '#e8f0f8',
    tex: 'snow',
    grass: ['snowtuft', 900],
    far: '#c8d8e8',
    farH: 700,
  },
  duat: {
    top: '#060a26',
    hor: '#3a3a70',
    hemi: ['#9a9ad8', '#5a4a3a', 0.72],
    sun: ['#b0c4ff', 0.6],
    haz: { lv: -10, col: '#2f7a90', k: 'water' },
    stars: true,
    moon: true,
    rim: '#8a6a4a',
    tex: 'sand',
    grass: ['dry', 500],
    far: '#4a3a5a',
    farH: 300,
  },
  kur: {
    top: '#6a3a2a',
    hor: '#e8b080',
    hemi: ['#ffe0b8', '#6a4a3a', 0.68],
    sun: ['#ffc890', 0.7],
    haz: { lv: -9, col: '#2f6a8a', k: 'water' },
    disk: '#ffb060',
    rim: '#7a5636',
    tex: 'clay',
    grass: ['dry', 700],
    far: '#a87850',
    farH: 260,
  },
  lanka: {
    top: '#2a6a9a',
    hor: '#c8e8d0',
    hemi: ['#e8f4ff', '#2a4a28', 0.7],
    sun: ['#fff0c0', 0.75],
    haz: { lv: -9, col: '#2f7a8a', k: 'water' },
    disk: '#fff0a0',
    rim: '#2a4a28',
    tex: 'grass',
    grass: ['jungle', 2600],
    far: '#3a6a4a',
    farH: 480,
  },
  yomi: {
    top: '#020406',
    hor: '#16261f',
    hemi: ['#6a8a8a', '#0a0a0a', 0.5],
    sun: ['#8ab0c0', 0.3],
    night: true,
    rim: '#1a2418',
    tex: 'moss',
    grass: ['darkgrass', 2200],
    far: '#101a14',
    farH: 520,
  },
  diyu: {
    top: '#120408',
    hor: '#501818',
    hemi: ['#aa6a6a', '#1a0a0a', 0.55],
    sun: ['#ff7a5a', 0.45],
    night: true,
    rim: '#2a1a1e',
    tex: 'stone',
    grass: ['redgrass', 900],
    far: '#2a1014',
    farH: 600,
  },
  mictlan: {
    top: '#1a0a2a',
    hor: '#7a3a5a',
    hemi: ['#c8a0c8', '#2a1a20', 0.6],
    sun: ['#ffa060', 0.6],
    stars: true,
    rim: '#3a2a30',
    tex: 'clay',
    grass: ['marigold', 1800],
    far: '#3a2440',
    farH: 420,
    dusk: true,
  },
  xibalba: {
    top: '#02080a',
    hor: '#0e2e24',
    hemi: ['#8ac0aa', '#08180f', 0.66],
    sun: ['#a0e0d0', 0.5],
    night: true,
    haz: { lv: -26, col: '#2a9a9a', k: 'water' },
    rim: '#0f2a20',
    tex: 'moss',
    grass: ['jungle', 2400],
    far: '#0a1a14',
    farH: 420,
  },
  ukupacha: {
    top: '#3a78c8',
    hor: '#d8ecf8',
    hemi: ['#ffffff', '#4a6a3a', 0.66],
    sun: ['#fff2d0', 0.75],
    rim: '#4a6a3a',
    tex: 'grass',
    grass: ['andes', 2400],
    far: '#3a5a3a',
    farH: 900,
    mist: true,
    disk: '#fff6d0',
  },
  orun: {
    top: '#3a8ad0',
    hor: '#e0f4c8',
    hemi: ['#fff8e0', '#2a4a1a', 0.7],
    sun: ['#fff0c0', 0.72],
    haz: { lv: -10, col: '#3a7ac0', k: 'water' },
    disk: '#fff0a0',
    rim: '#2a4a1a',
    tex: 'grass',
    grass: ['jungle', 2400],
    far: '#2a5a2a',
    farH: 420,
  },
  annwn: {
    top: '#2a3a4a',
    hor: '#90a8b0',
    hemi: ['#d0e0e8', '#2a3a2a', 0.66],
    sun: ['#e0e8f0', 0.5],
    haz: { lv: -12, col: '#3a5a6a', k: 'water' },
    rim: '#3a4a3a',
    tex: 'grass',
    grass: ['heath', 2000],
    far: '#4a5a5a',
    farH: 460,
  },
  cielo: {
    top: '#5a90f0',
    hor: '#fff6e8',
    hemi: ['#ffffff', '#c8c0f0', 0.62],
    sun: ['#ffe8b0', 0.6],
    disk: '#fff6c0',
    clouds: true,
    rim: '#ffffff',
    tex: 'cloud',
    grass: ['cloudtuft', 900],
    far: '#f4f0ff',
    farH: 200,
  },
  vacio: {
    top: '#000000',
    hor: '#2a1040',
    hemi: ['#9a7ad8', '#0a0010', 0.55],
    sun: ['#b07aff', 0.5],
    night: true,
    stars: true,
    haz: { lv: -38, col: '#7a2ad0', k: 'void' },
    rim: '#1a1028',
    tex: 'stone',
    grass: ['crystal', 500],
    far: '#1a1030',
    farH: 600,
  },
};
