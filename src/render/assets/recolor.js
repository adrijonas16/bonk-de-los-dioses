/* ---------- recoloreado de la paleta KayKit ---------- */
const KK_ROLES = {
  c_knight: {
    '0,0': 'skin',
    '1,0': 'hair',
    '3,0': 'metal',
    '7,0': 'metal',
    '2,1': 'metal',
    '6,0': 'leather',
    '4,0': 'dark',
    '7,1': 'dark',
    '0,1': 'primary',
    '1,1': 'trim',
  },
  c_mage: {
    '0,0': 'skin',
    '7,2': 'skin',
    '1,0': 'hair',
    '0,1': 'primary',
    '1,1': 'primary',
    '7,1': 'primaryD',
    '2,1': 'cape',
    '3,0': 'trim',
    '4,0': 'trim',
    '5,0': 'leather',
    '2,2': 'accent',
    '3,2': 'leather',
  },
  c_barbarian: {
    '0,0': 'skin',
    '1,0': 'hair',
    '6,0': 'leather',
    '2,1': 'trim',
    '0,1': 'primary',
    '1,1': 'primary',
    '7,0': 'cape',
    '3,2': 'leatherD',
    '7,1': 'leatherD',
    '7,2': 'leatherD',
    '3,0': 'metal',
  },
  c_rogue: {
    '0,0': 'skin',
    '1,0': 'hair',
    '0,1': 'primaryD',
    '1,1': 'primary',
    '6,0': 'leather',
    '5,0': 'leather',
    '5,2': 'leather',
    '3,2': 'leather',
    '7,1': 'leatherD',
    '3,0': 'metal',
  },
};
KK_ROLES.c_rogue_hooded = KK_ROLES.c_rogue;
function kkTexture(body, pal) {
  const key = body + JSON.stringify(pal);
  if (AS.recol[key]) return AS.recol[key];
  const g = AS.g[body];
  let src = null;
  g.scene.traverse((o) => {
    if (o.isMesh && !src && o.material.map) src = o.material.map.image;
  });
  const N = 512,
    c = mkCanvas(N, N),
    x = c.getContext('2d');
  x.drawImage(src, 0, 0, N, N);
  const id = x.getImageData(0, 0, N, N),
    d = id.data;
  const roles = KK_ROLES[body] || {};
  const cw = N / 8,
    ch = N / 4;
  for (const k in roles) {
    const col = pal[roles[k]];
    if (!col) continue;
    const [cx, cy] = k.split(',').map(Number);
    const T = hexRGB(col);
    let mr = 0,
      mg = 0,
      mb = 0,
      n = 0;
    for (let y = cy * ch + 4; y < (cy + 1) * ch - 4; y += 2)
      for (let xx = cx * cw + 2; xx < (cx + 1) * cw - 8; xx += 2) {
        const i = (y * N + xx) * 4;
        mr += d[i];
        mg += d[i + 1];
        mb += d[i + 2];
        n++;
      }
    const ml = (mr + mg + mb) / (3 * n) || 1;
    for (let y = cy * ch; y < (cy + 1) * ch; y++)
      for (let xx = cx * cw; xx < (cx + 1) * cw; xx++) {
        const i = (y * N + xx) * 4;
        const l = (d[i] + d[i + 1] + d[i + 2]) / 3 / ml;
        d[i] = clamp(T[0] * l, 0, 255);
        d[i + 1] = clamp(T[1] * l, 0, 255);
        d[i + 2] = clamp(T[2] * l, 0, 255);
      }
  }
  x.putImageData(id, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.flipY = false;
  t.magFilter = THREE.NearestFilter;
  t.encoding = THREE.LinearEncoding;
  AS.recol[key] = t;
  return t;
}

const GRAYC = new WeakMap();
function grayTex(map) {
  if (!map || !map.image) return map;
  if (GRAYC.has(map)) return GRAYC.get(map);
  const im = map.image,
    c = mkCanvas(im.width, im.height),
    x = c.getContext('2d');
  x.drawImage(im, 0, 0);
  const id = x.getImageData(0, 0, c.width, c.height),
    d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const l = Math.min(255, (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) * 1.35);
    d[i] = d[i + 1] = d[i + 2] = l;
  }
  x.putImageData(id, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.flipY = map.flipY;
  t.encoding = THREE.LinearEncoding;
  t.magFilter = THREE.NearestFilter;
  GRAYC.set(map, t);
  return t;
}
