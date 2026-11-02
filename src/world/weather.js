/* ---------- clima con partículas ---------- */
const WXC = {
  embers: ['#ff8a3a', 4, 0, 40],
  snow: ['#ffffff', 4, -50, 0],
  sand: ['#f2d498', 3, -8, 0],
  dust: ['#e8c89a', 3, -4, 0],
  fireflies: ['#e8f88a', 5, 0, 0],
  wisps: ['#8ad0ff', 6, 0, 12],
  petals: ['#f2a8c8', 4, -30, 0],
  marigold: ['#f2a22c', 4, -30, 0],
  stars: ['#dfe8ff', 3, 0, 0],
  leaves: ['#8aba4a', 4, -30, 0],
  rain: ['#b8dcf0', 3, -420, 0],
  void: ['#b07aff', 4, 0, 6],
  feathers: ['#ffffff', 5, -22, 0],
};
function makeWeather(type) {
  const c = WXC[type];
  if (!c) return null;
  const n = type === 'rain' ? 1000 : 700,
    g = new THREE.BufferGeometry(),
    p = new Float32Array(n * 3),
    v = [];
  for (let i = 0; i < n; i++) {
    p[i * 3] = rand(-800, 800);
    p[i * 3 + 1] = rand(0, 460);
    p[i * 3 + 2] = rand(-800, 800);
    v.push(Math.random() * 6.28);
  }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(
    g,
    new THREE.PointsMaterial({
      color: c[0],
      size: c[1],
      sizeAttenuation: true,
      transparent: true,
      opacity: type === 'rain' ? 0.6 : 0.95,
      depthWrite: false,
      blending: /fireflies|wisps|embers|void/.test(type) ? THREE.AdditiveBlending : THREE.NormalBlending,
    })
  );
  pts.frustumCulled = false;
  return { type, pts, ph: v, cfg: c };
}
function updWeather(dt, cx, cy) {
  const w = WORLD && WORLD.wx;
  if (!w) return;
  const p = w.pts.geometry.attributes.position.array,
    n = p.length / 3,
    vy = w.cfg[2],
    vup = w.cfg[3];
  for (let i = 0; i < n; i++) {
    let x = p[i * 3],
      y = p[i * 3 + 1],
      z = p[i * 3 + 2];
    const ph = w.ph[i];
    switch (w.type) {
      case 'sand':
        x += 60 * dt;
        break;
      case 'rain':
        x += 30 * dt;
        break;
      case 'fireflies':
        x += Math.cos(T * 0.7 + ph) * 12 * dt;
        z += Math.sin(T * 0.9 + ph) * 12 * dt;
        y += Math.sin(T + ph) * 6 * dt;
        break;
      default:
        x += Math.sin(T + ph) * 14 * dt;
        z += Math.cos(T * 0.8 + ph) * 10 * dt;
    }
    y += (vy + vup) * dt;
    if (w.type === 'stars') y = 4 + Math.abs(Math.sin(ph * 13)) * 30;
    if (y < 0) y += 460;
    if (y > 460) y -= 460;
    const dx = x - cx,
      dz = z - cy;
    if (dx > 800) x -= 1600;
    if (dx < -800) x += 1600;
    if (dz > 800) z -= 1600;
    if (dz < -800) z += 1600;
    p[i * 3] = x;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = z;
  }
  w.pts.geometry.attributes.position.needsUpdate = true;
  w.pts.position.y = groundAt(cx, cy) - 20;
  if (w.type === 'stars' || w.type === 'fireflies') w.pts.material.opacity = 0.6 + 0.4 * Math.sin(T * 3);
}
