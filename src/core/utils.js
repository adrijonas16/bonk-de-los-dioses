/* Bonk de los Dioses · núcleo: utilidades y sprites pixel art */
const {
  SECRET_GODS,
  C,
  WEAPONS,
  GODS,
  PASSIVES,
  CONCILIOS,
  ENEMIES,
  BOSSES,
  REALMS,
  REL,
  LINES,
  LOOKS,
  THEMES,
  RAR,
  ITEMS,
  RUN_MISSIONS,
  DAILY,
  FREE_GODS,
  GOD_PRICE,
  UPGRADES,
} = window.DATA;
const GOD = Object.fromEntries(GODS.map((g) => [g.id, g]));
const $ = (id) => document.getElementById(id);

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const fmt = (t) => {
  t = Math.max(0, Math.floor(t));
  return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
};
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = ((h ^ (h >>> 13)) * 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function hexRGB(h) {
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  const n = parseInt(h.slice(1, 7), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
function shade(h, a) {
  const [r, g, b] = hexRGB(h);
  const f = (v) => clamp(Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a), 0, 255);
  return '#' + ((1 << 24) | (f(r) << 16) | (f(g) << 8) | f(b)).toString(16).slice(1);
}
function lum(h) {
  const [r, g, b] = hexRGB(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function rgba(h, a) {
  const [r, g, b] = hexRGB(h);
  return `rgba(${r},${g},${b},${a})`;
}
function vn(x, y, s) {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    xf = x - xi,
    yf = y - yi,
    sm = (t) => t * t * (3 - 2 * t);
  const a = hash(xi, yi, s),
    b = hash(xi + 1, yi, s),
    c = hash(xi, yi + 1, s),
    d = hash(xi + 1, yi + 1, s),
    u = sm(xf),
    v = sm(yf);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}
function fbm(x, y, s) {
  let t = 0,
    a = 1,
    f = 1,
    n = 0;
  for (let i = 0; i < 4; i++) {
    t += vn(x * f, y * f, s + i * 7) * a;
    n += a;
    a *= 0.5;
    f *= 2;
  }
  return t / n;
}
function srand(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}
const isTouch = matchMedia('(pointer:coarse)').matches;
let store = null;
try {
  store = window.localStorage;
  store.getItem('x');
} catch (err) {
  store = null;
}
function loadRec() {
  try {
    return JSON.parse((store && store.getItem('bonk-dioses')) || '{}') || {};
  } catch (err) {
    return {};
  }
}
function saveRec(r) {
  try {
    store && store.setItem('bonk-dioses', JSON.stringify(r));
  } catch (err) {}
}
function mkCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
