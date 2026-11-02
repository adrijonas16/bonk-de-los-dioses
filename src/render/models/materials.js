/* Bonk de los Dioses · modelos 3D pixel-art (dioses, enemigos y jefes) con animaciones */
const GOD_SCALE = 0.74;
function pxTex(cv) {
  const t = new THREE.CanvasTexture(cv);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return t;
}
function pcv(w, h, fn) {
  const c = mkCanvas(w, h),
    g = c.getContext('2d');
  const P = (x, y, col) => {
    if (!col) return;
    g.fillStyle = col;
    g.fillRect(x, y, 1, 1);
  };
  const Rr = (x, y, ww, hh, col) => {
    g.fillStyle = col;
    g.fillRect(x, y, ww, hh);
  };
  fn(P, Rr, g);
  return c;
}
function flipCv(c) {
  const o = mkCanvas(c.width, c.height),
    g = o.getContext('2d');
  g.translate(c.width, 0);
  g.scale(-1, 1);
  g.drawImage(c, 0, 0);
  return o;
}
