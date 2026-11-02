/* ---------- orbitales ---------- */
function doveMesh() {
  const g = new THREE.Group(),
    W = ML('#ffffff', { emissive: '#6a6458' }),
    Gr = ML('#c8ccd8', { emissive: '#3a3c48' });
  const body = new THREE.Mesh(GEO.sph(5, 8, 6), W);
  body.scale.set(1.7, 1, 1.05);
  g.add(body);
  const head = new THREE.Mesh(GEO.sph(3.2, 8, 6), W);
  head.position.set(8, 2.6, 0);
  g.add(head);
  const bk = new THREE.Mesh(GEO.box(3, 1.4, 1.4), MB('#ff9a3a'));
  bk.position.set(11.4, 2.2, 0);
  g.add(bk);
  for (const z of [-1.6, 1.6]) {
    const e = new THREE.Mesh(GEO.box(0.9, 0.9, 0.6), MB('#1a1a24'));
    e.position.set(9.6, 3.4, z);
    g.add(e);
  }
  const tail = new THREE.Mesh(GEO.box(7, 1, 6), Gr);
  tail.position.set(-9, 0.6, 0);
  tail.rotation.z = 0.25;
  g.add(tail);
  const mk = (sg) => {
    const pv = new THREE.Group();
    pv.position.set(0, 2, sg * 2.5);
    const w = new THREE.Mesh(GEO.box(8, 1, 12), W);
    w.position.set(-1, 0, sg * 6);
    pv.add(w);
    const tip = new THREE.Mesh(GEO.box(6, 1, 5), Gr);
    tip.position.set(-3, 0, sg * 13.5);
    pv.add(tip);
    g.add(pv);
    return pv;
  };
  g.userData.wl = mk(-1);
  g.userData.wr = mk(1);
  g.scale.setScalar(0.85);
  return g;
}

const ORBV = {};
function orbV(st, col) {
  const k = st + col;
  if (ORBV[k]) return ORBV[k];
  const ms = miscSprites();
  let v;
  if (st === 'skull') v = ms.skull;
  else if (st === 'dove') v = ms.dove;
  else {
    const base = fromFn(9, 9, ({ put, rect, ell }) => {
      if (st === 'star') {
        rect(0, 4, 9, 1, col);
        rect(4, 0, 1, 9, col);
        rect(2, 2, 1, 1, col);
        rect(6, 6, 1, 1, col);
        rect(6, 2, 1, 1, col);
        rect(2, 6, 1, 1, col);
        rect(4, 4, 1, 1, '#ffffff');
      } else if (st === 'mirror') {
        ell(4.5, 4.5, 4, 4, C.gold);
        ell(4.5, 4.5, 3, 3, '#e8eef8');
        put(3, 3, '#ffffff');
      } else {
        ell(4.5, 4.5, 4, 4, C.gold);
        ell(4.5, 4.5, 2.6, 2.6, '#f8e060');
        put(3, 3, '#ffffff');
      }
    });
    v = hiSprite(base, INK);
  }
  ORBV[k] = v;
  return v;
}
