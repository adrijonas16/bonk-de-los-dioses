/* ---------- retratos 3D para la interfaz ---------- */
const SHOT = { r: null, cache: {} };
function godShot(id, mode) {
  const key = id + '|' + mode;
  if (SHOT.cache[key]) return SHOT.cache[key];
  if (!AS.ready) return null;
  try {
    if (!SHOT.r) {
      SHOT.r = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
      SHOT.r.setPixelRatio(1);
      SHOT.sc = new THREE.Scene();
      SHOT.sc.add(new THREE.HemisphereLight('#ffffff', '#5a5a70', 0.95));
      const dl = new THREE.DirectionalLight('#fff4e0', 0.75);
      dl.position.set(40, 80, 90);
      SHOT.sc.add(dl);
      SHOT.cam = new THREE.PerspectiveCamera(26, 1, 1, 1000);
    }
    const W = mode === 'face' ? 160 : 256,
      H = mode === 'face' ? 160 : 320;
    SHOT.r.setSize(W, H, false);
    SHOT.cam.aspect = W / H;
    SHOT.cam.updateProjectionMatrix();
    const m = (AS.g.u_man ? buildGodH : buildGodKK)(id);
    m.traverse((o) => {
      if (o.isSprite) o.visible = false;
    });
    SHOT.sc.add(m);
    const u = m.userData;
    u.act.idle.time = 0.4;
    u.mixer.update(0);
    m.rotation.y = mode === 'face' ? 0.32 : 0.42;
    m.updateMatrixWorld(true);
    if (mode === 'face') {
      SHOT.cam.position.set(0, 33, 44);
      SHOT.cam.lookAt(0, 31, 0);
    } else {
      SHOT.cam.position.set(0, 23, 96);
      SHOT.cam.lookAt(0, 21, 0);
    }
    SHOT.r.setClearColor(0x000000, 0);
    SHOT.r.clear();
    SHOT.r.render(SHOT.sc, SHOT.cam);
    const c = mkCanvas(W, H);
    c.getContext('2d').drawImage(SHOT.r.domElement, 0, 0);
    SHOT.sc.remove(m);
    u.disp();
    SHOT.cache[key] = c;
    return c;
  } catch (err) {
    console.warn(err);
    return null;
  }
}
