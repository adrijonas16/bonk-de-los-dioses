/* ---------- cámara ---------- */
const camPos = new THREE.Vector3(0, 300, 300),
  camLook = new THREE.Vector3();
const MENU_FOCUS = {
  tartaro: [0, -40, 620],
  duat: [-250, -600, 900],
  kur: [0, -260, 700],
  mictlan: [200, -500, 950],
  xibalba: [0, -300, 620],
  ukupacha: [-100, -200, 900],
  cielo: [0, -800, 900],
  lanka: [0, 0, 600],
  diyu: [0, 0, 560],
  yomi: [0, -700, 700],
  orun: [0, 0, 600],
};
for (const k in MENU_FOCUS) MENU_FOCUS[k] = MENU_FOCUS[k].map((v) => v * 1.5);
function updCamera(dt, menu) {
  if (menu) {
    const rk = WORLD && WORLD.rk,
      f = MENU_FOCUS[rk] || [0, 0, 700];
    const a = T * 0.06;
    const x = f[0] + Math.sin(a) * f[2],
      z = f[1] + Math.cos(a) * f[2];
    const gy = groundAt(f[0], f[1]);
    cam3.position.set(x, Math.max(gy + 260, groundAt(x, z) + 140), z);
    cam3.lookAt(f[0], gy + 40, f[1]);
    return;
  }
  const c = camera();
  let spread = 0;
  const hs = players.filter((p) => p.ctrl !== 'ai');
  if (hs.length > 1) spread = Math.hypot(hs[0].x - hs[1].x, hs[0].y - hs[1].y);
  const tz = hs.length ? hs.reduce((s2, p) => s2 + p.z, 0) / hs.length : 0;
  if (scene.fog && scene.fog.userData && scene.fog.userData.n0) {
    const zk = Math.max(1, G.zoom / 1.3);
    scene.fog.near = scene.fog.userData.n0 * zk;
    scene.fog.far = scene.fog.userData.f0 * zk;
  }
  const dist = (275 + spread * 0.5) * G.zoom,
    pc = Math.cos(G.pitch),
    ps = Math.sin(G.pitch);
  const tx = c.x + Math.sin(G.yaw) * pc * dist,
    ty = tz + 18 + ps * dist,
    tzz = c.y + Math.cos(G.yaw) * pc * dist;
  const k = Math.min(1, dt * 10);
  camPos.x += (tx - camPos.x) * k;
  camPos.y += (ty - camPos.y) * k;
  camPos.z += (tzz - camPos.z) * k;
  const gmin = groundAt(camPos.x, camPos.z) + 25;
  if (camPos.y < gmin) camPos.y = gmin;
  cam3.position.copy(camPos);
  const sk = (G.shake || 0) * 14;
  if (sk > 0) cam3.position.add(new THREE.Vector3(rand(-sk, sk), rand(-sk, sk), rand(-sk, sk)));
  camLook.set(c.x, tz + 18, c.y);
  cam3.lookAt(camLook);
}
const pv = new THREE.Vector3();
function toScreen(x, y, z) {
  pv.set(x, z, y).project(cam3);
  if (pv.z > 1 || pv.z < -1) return null;
  return [((pv.x + 1) / 2) * W, ((1 - pv.y) / 2) * H];
}
