/* Bonk de los Dioses · render 3D, interfaz y bucle */
const cv = $('c'),
  ov = $('ov'),
  octx = ov.getContext('2d');
let W = innerWidth,
  H = innerHeight,
  DPR = Math.min(2, devicePixelRatio || 1),
  PIXK = 2;
let renderer = null,
  scene = null,
  cam3 = null,
  GL_OK = true;
try {
  renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  GL_OK = false;
}
scene = new THREE.Scene();
cam3 = new THREE.PerspectiveCamera(52, W / H, 4, 9500);
function resize() {
  W = innerWidth;
  H = innerHeight;
  DPR = Math.min(2, devicePixelRatio || 1);
  if (renderer) {
    PIXK = 1;
    renderer.setPixelRatio(Math.min(DPR, 1.5));
    renderer.setSize(W, H, false);
  }
  cam3.aspect = W / H;
  cam3.updateProjectionMatrix();
  ov.width = Math.round(W * DPR);
  ov.height = Math.round(H * DPR);
}
addEventListener('resize', resize);
resize();
if (renderer) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
}
function sunFollow(x, y) {
  const s = WORLD && WORLD.sun;
  if (!s) return;
  const gx = Math.round(x / 40) * 40,
    gy = Math.round(y / 40) * 40,
    gz = groundAt(gx, gy);
  s.position.set(gx - 500, gz + 900, gy + 400);
  s.target.position.set(gx, gz, gy);
  s.target.updateMatrixWorld();
}
if (!GL_OK) {
  $('nogl').hidden = false;
}
bindPointer(cv);
cv.addEventListener('click', () => {
  if (state === 'play' && !isTouch && !document.pointerLockElement && !(G && G.mapOpen)) {
    try {
      const r = cv.requestPointerLock();
      if (r && r.catch) r.catch(() => {});
    } catch (err) {}
  }
});
document.addEventListener('mousemove', (ev) => {
  if (document.pointerLockElement === cv && G && state === 'play') {
    G.yaw -= ev.movementX * 0.0026;
    G.pitch = clamp(G.pitch + ev.movementY * 0.002, 0.2, 1.3);
  }
});
document.addEventListener('pointerlockchange', () => {
  const hint = $('lockHint');
  if (hint) hint.hidden = !!document.pointerLockElement || isTouch;
  if (!document.pointerLockElement && state === 'play' && G && !G.coop && LOCK_WAS) pause(true);
  LOCK_WAS = !!document.pointerLockElement;
});
let LOCK_WAS = false;
$('focusHint').addEventListener('pointerdown', (ev) => {
  ev.preventDefault();
  focusGame();
  $('focusHint').hidden = true;
});
cv.addEventListener(
  'wheel',
  (ev) => {
    if (G && state === 'play') {
      G.zoom = clamp(G.zoom * (ev.deltaY > 0 ? 1.1 : 1 / 1.1), 0.5, 3.6);
      ev.preventDefault();
    }
  },
  { passive: false }
);
