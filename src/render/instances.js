/* ---------- instancias: sombras, gemas, balas, partículas ---------- */
const dummy = new THREE.Object3D(),
  tmpC = new THREE.Color();
function mkInst(geo, mat, n) {
  const im = new THREE.InstancedMesh(geo, mat, n);
  im.count = 0;
  im.frustumCulled = false;
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(im);
  return im;
}
const SHADOWS = mkInst(
  new THREE.CircleGeometry(1, 12).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.32, depthWrite: false }),
  800
);
const GEMS = mkInst(new THREE.OctahedronGeometry(4.5, 0), new THREE.MeshBasicMaterial({ color: '#ffffff' }), 460);
const BULLETS = mkInst(new THREE.SphereGeometry(6, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }), 520);
const PARTS = mkInst(new THREE.BoxGeometry(3.2, 3.2, 3.2), new THREE.MeshBasicMaterial({ color: '#ffffff' }), 900);
const GLOWS = mkInst(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    map: glowTex('#ffffff'),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
  400
);
function instSet(im, i, x, y, z, s, col, ry) {
  dummy.position.set(x, y, z);
  dummy.rotation.set(0, ry || 0, 0);
  dummy.scale.setScalar(s);
  dummy.updateMatrix();
  im.setMatrixAt(i, dummy.matrix);
  if (col) {
    im.setColorAt(i, tmpC.set(col));
  }
}
function instDone(im, n) {
  im.count = n;
  im.instanceMatrix.needsUpdate = true;
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
}
const COINS = mkInst(
  new THREE.CylinderGeometry(5, 5, 1.6, 14).rotateX(Math.PI / 2),
  new THREE.MeshLambertMaterial({ color: '#ffc23a', emissive: '#8a5a00' }),
  500
);
const COINR = mkInst(new THREE.TorusGeometry(5, 0.8, 4, 14), new THREE.MeshBasicMaterial({ color: '#fff0a0' }), 500);
const SCORCHM = new THREE.MeshBasicMaterial({
  color: '#120a06',
  transparent: true,
  opacity: 0.6,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -2,
});
function boltPath(ax, ay, az, bx, by, bz, n, jit) {
  const pts = [];
  let ox = 0,
    oz = 0;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    if (i > 0 && i < n) {
      ox += rand(-jit, jit);
      oz += rand(-jit, jit);
      ox *= 0.8;
      oz *= 0.8;
    } else {
      ox = 0;
      oz = 0;
    }
    pts.push([ax + (bx - ax) * t + ox, ay + (by - ay) * t, az + (bz - az) * t + oz]);
  }
  return pts;
}
function ribMesh(n, col, op) {
  const mm = new THREE.Mesh(ribbon(n), addMat(col, op));
  mm.renderOrder = 6;
  mm.userData.disp = () => {
    mm.geometry.dispose();
    mm.material.dispose();
  };
  return mm;
}
const PLIGHTS = [0, 1, 2].map(() => {
  const l = new THREE.PointLight('#ffd8a0', 0, 420, 1.6);
  scene.add(l);
  return l;
});
const FLASHL = new THREE.PointLight('#ffffff', 0, 600, 1.4);
scene.add(FLASHL);
