/* ---------- geometrías compartidas ---------- */
const RINGG = new THREE.RingGeometry(0.9, 1, 56),
  RINGW = new THREE.RingGeometry(0.78, 1, 64),
  DISC = new THREE.CircleGeometry(1, 32);
function addMat(col, op) {
  return new THREE.MeshBasicMaterial({
    color: col,
    transparent: true,
    opacity: op == null ? 1 : op,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
  });
}
function flatMesh(geo, col, op) {
  const m = new THREE.Mesh(geo, addMat(col, op));
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 5;
  m.userData.disp = () => m.material.dispose();
  return m;
}
function ribbon(n) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3));
  const idx = [];
  for (let i = 0; i < n - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  g.setIndex(idx);
  return g;
}
function setRibbon(g, pts, ox, oy, oz) {
  const a = g.attributes.position.array;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    a[i * 6] = p[0] + ox;
    a[i * 6 + 1] = p[1] + oy;
    a[i * 6 + 2] = p[2] + oz;
    a[i * 6 + 3] = p[0] - ox;
    a[i * 6 + 4] = p[1] - oy;
    a[i * 6 + 5] = p[2] - oz;
  }
  g.attributes.position.needsUpdate = true;
  g.computeBoundingSphere();
}
function quadGeo() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
  g.setIndex([0, 1, 2, 1, 3, 2]);
  return g;
}
function setQuad(g, x1, y1, x2, y2, w, h1, h2) {
  const dx = x2 - x1,
    dy = y2 - y1,
    L = Math.hypot(dx, dy) || 1,
    nx = ((-dy / L) * w) / 2,
    ny = ((dx / L) * w) / 2,
    a = g.attributes.position.array;
  a.set([x1 + nx, h1, y1 + ny, x1 - nx, h1, y1 - ny, x2 + nx, h2, y2 + ny, x2 - nx, h2, y2 - ny]);
  g.attributes.position.needsUpdate = true;
  g.computeBoundingSphere();
}
