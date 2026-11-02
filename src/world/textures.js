/* ---------- texturas pixel ---------- */
const TEXS = {};
function TEX(name) {
  if (TEXS[name]) return TEXS[name];
  const N = 64,
    c = mkCanvas(N, N),
    g = c.getContext('2d'),
    rnd = srand(name.length * 131 + 7);
  const px = (x, y, v) => {
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(x, y, 1, 1);
  };
  g.fillStyle = '#e6e6e6';
  g.fillRect(0, 0, N, N);
  switch (name) {
    case 'grass':
    case 'moss':
      for (let i = 0; i < 900; i++) {
        const x = (rnd() * N) | 0,
          y = (rnd() * N) | 0,
          v = (200 + rnd() * 55) | 0;
        px(x, y, v);
        if (rnd() < 0.4) px(x, (y + 1) % N, v - 30);
      }
      for (let i = 0; i < 40; i++) {
        const x = (rnd() * N) | 0,
          y = (rnd() * N) | 0;
        px(x, y, 255);
      }
      break;
    case 'snow':
      for (let i = 0; i < 500; i++) {
        px((rnd() * N) | 0, (rnd() * N) | 0, (225 + rnd() * 30) | 0);
      }
      for (let i = 0; i < 30; i++) px((rnd() * N) | 0, (rnd() * N) | 0, 255);
      break;
    case 'sand':
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          const v = 225 + Math.sin((x + y * 0.4) / 3) * 14 + rnd() * 12;
          px(x, y, v | 0);
        }
      break;
    case 'clay':
    case 'stone':
    case 'basalt': {
      g.fillStyle = name === 'basalt' ? '#c8c8c8' : '#dcdcdc';
      g.fillRect(0, 0, N, N);
      const s = name === 'clay' ? 16 : name === 'stone' ? 16 : 12;
      for (let y = 0; y < N; y += s / 2) {
        const off = (y / (s / 2)) % 2 ? s / 2 : 0;
        for (let x = -s; x < N; x += s) {
          g.fillStyle = `rgb(${(200 + rnd() * 50) | 0},${(200 + rnd() * 50) | 0},${(200 + rnd() * 50) | 0})`;
          g.fillRect(x + off + 1, y + 1, s - 2, s / 2 - 2);
        }
      }
      for (let i = 0; i < 300; i++) px((rnd() * N) | 0, (rnd() * N) | 0, (170 + rnd() * 40) | 0);
      break;
    }
    case 'cloud':
      for (let i = 0; i < 300; i++) {
        const x = rnd() * N,
          y = rnd() * N,
          r = 2 + rnd() * 4;
        g.fillStyle = `rgba(255,255,255,${0.4 + rnd() * 0.5})`;
        g.beginPath();
        g.arc(x, y, r, 0, 7);
        g.fill();
      }
      break;
    case 'wall': {
      g.fillStyle = '#9a9a9a';
      g.fillRect(0, 0, N, N);
      for (let y = 0; y < N; y += 10) {
        for (let x = -(y % 20 ? 8 : 0); x < N; x += (16 + rnd() * 6) | 0) {
          const w = (12 + rnd() * 8) | 0;
          g.fillStyle = `rgb(${(190 + rnd() * 50) | 0},${(190 + rnd() * 45) | 0},${(180 + rnd() * 40) | 0})`;
          g.fillRect(x + 1, y + 1, w, 8);
        }
      }
      break;
    }
    case 'thatch':
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          const v = (x * 7 + ((y / 3) | 0) * 13) % 9 < 2 ? 160 : 205 + rnd() * 40;
          px(x, y, v | 0);
        }
      break;
    case 'leaf':
      for (let i = 0; i < 500; i++) {
        const x = (rnd() * N) | 0,
          y = (rnd() * N) | 0,
          v = (150 + rnd() * 105) | 0;
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.fillRect(x, y, 2, 2);
      }
      break;
    case 'bark':
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          px(x, y, ((x % 6 < 2 ? 170 : 215) + rnd() * 25) | 0);
        }
      break;
    case 'gold':
      for (let i = 0; i < 400; i++) px((rnd() * N) | 0, (rnd() * N) | 0, (200 + rnd() * 55) | 0);
      break;
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.anisotropy = 4;
  TEXS[name] = t;
  return t;
}
