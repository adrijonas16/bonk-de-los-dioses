/* ---------- materiales de sprites ---------- */
const SMAT = new Map();
function texOf(canvas) {
  let t = canvas._tex;
  if (!t) {
    t = new THREE.CanvasTexture(canvas);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    canvas._tex = t;
  }
  return t;
}
function spriteMat(v, flip, flash) {
  const canvas = flash ? (flip ? v.fm : v.f) : flip ? v.cm : v.c;
  let m = SMAT.get(canvas);
  if (!m) {
    m = new THREE.SpriteMaterial({ map: texOf(canvas), transparent: true, alphaTest: 0.5 });
    SMAT.set(canvas, m);
  }
  return m;
}

const SPAWN = {
  tartaro: [0, 200],
  duat: [0, 220],
  kur: [0, 240],
  lanka: [0, 170],
  diyu: [0, 170],
  orun: [0, 120],
  mictlan: [0, 300],
  xibalba: [0, 200],
  ukupacha: [-60, 40],
  cielo: [0, 200],
  yomi: [0, 200],
  vacio: [0, 60],
  jotunheim: [0, 60],
  annwn: [0, 60],
};
for (const k in SPAWN) SPAWN[k] = SPAWN[k].map((v) => v * WS);
function spawnPt(rk) {
  return SPAWN[rk] || [0, 60];
}
