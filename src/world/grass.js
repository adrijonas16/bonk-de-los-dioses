/* ---------- césped y flores instanciados ---------- */
const GRASS = {
  ash: [
    ['#5a4a46', '#3a2e2c', '#ff8a3a'],
    ['#4a3a36', '#ff6a1a', '#ffb060'],
  ],
  snowtuft: [
    ['#e8f4ff', '#b8d0e8', '#ffffff'],
    ['#9fd0ff', '#ffffff', '#e0f0ff'],
  ],
  dry: [
    ['#c8a84a', '#a88a3a', '#e8d07a'],
    ['#8a7a3a', '#d8b85a', '#f0e090'],
  ],
  jungle: [
    ['#3f8a3a', '#2f6a2a', '#6aba4a'],
    ['#e27aa8', '#f8e060', '#ffffff'],
  ],
  darkgrass: [
    ['#2f4a2a', '#1f3a1f', '#4a6a3a'],
    ['#5ab0ff', '#9ad0ff', '#2a4a6a'],
  ],
  redgrass: [
    ['#5a2a2a', '#3a1a1a', '#7a3a3a'],
    ['#e23a2a', '#ff6a4a', '#ffb0a0'],
  ],
  marigold: [
    ['#4a6a3a', '#3a5a2a', '#6a8a4a'],
    ['#f2a22c', '#f8c040', '#ffe080'],
  ],
  andes: [
    ['#c8a84a', '#a88a3a', '#6a9a4a'],
    ['#f8e060', '#e27aa8', '#ffffff'],
  ],
  heath: [
    ['#4a6a3a', '#3a5a2a', '#6a7a4a'],
    ['#8a6a9a', '#b08ac8', '#d0b0e0'],
  ],
  cloudtuft: [
    ['#ffffff', '#e8ecff', '#ffffff'],
    ['#f4d27a', '#ffffff', '#fff6c0'],
  ],
  crystal: [
    ['#3a2a5a', '#2a1a40', '#5a3a8a'],
    ['#b07aff', '#e27aa8', '#ffffff'],
  ],
};
function grassTex(type, kind) {
  const k = 'g' + type + kind;
  if (TEXS[k]) return TEXS[k];
  const c = mkCanvas(32, 32),
    g = c.getContext('2d'),
    [a, b2, hl] = GRASS[type][kind],
    rnd = srand(type.length * 17 + kind * 5);
  const P = (x, y, col) => {
    g.fillStyle = col;
    g.fillRect(x, y, 1, 1);
  };
  if (kind === 0) {
    for (let i = 0; i < 14; i++) {
      const bx = (3 + rnd() * 26) | 0,
        h = (8 + rnd() * 18) | 0,
        lean = (rnd() - 0.5) * 0.6;
      for (let j = 0; j < h; j++) {
        const x = Math.round(bx + lean * j);
        P(x, 31 - j, j > h - 3 ? hl : j % 3 ? a : b2);
        if (j < h * 0.4) P(x + 1, 31 - j, b2);
      }
    }
  } else {
    for (let i = 0; i < 6; i++) {
      const bx = (6 + rnd() * 20) | 0,
        h = (8 + rnd() * 12) | 0;
      for (let j = 0; j < h; j++) P(bx, 31 - j, GRASS[type][0][1]);
      const fy = 31 - h;
      g.fillStyle = a;
      g.fillRect(bx - 2, fy - 1, 5, 3);
      g.fillRect(bx - 1, fy - 2, 3, 5);
      P(bx, fy, b2);
      P(bx - 1, fy - 1, hl);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  TEXS[k] = t;
  return t;
}
function crossGeo(w, h) {
  const g = new THREE.BufferGeometry();
  const p = [],
    uv = [],
    idx = [];
  const add = (ax, az, bx, bz) => {
    const o = p.length / 3;
    p.push(ax, 0, az, bx, 0, bz, ax, h, az, bx, h, bz);
    uv.push(0, 0, 1, 0, 0, 1, 1, 1);
    idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
  };
  add(-w / 2, 0, w / 2, 0);
  add(0, -w / 2, 0, w / 2);
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const n = g.attributes.normal;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
  return g;
}
