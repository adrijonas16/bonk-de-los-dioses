/* ---------- enemigos instanciados ---------- */
const ENI = {};
function eniFor(key) {
  if (ENI[key]) return ENI[key];
  const d = ENEMIES[key];
  const parts = enemyParts(d, false);
  const cap = 420;
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#2a2a2a' });
  const list = parts.map((pt) => {
    const g = partGeo(pt);
    const im = new THREE.InstancedMesh(g, mat, cap);
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.frustumCulled = false;
    for (let i = 0; i < cap; i++) im.setColorAt(i, tmpC.set(pt.color));
    im.count = 0;
    scene.add(im);
    return { pt, im, col: new THREE.Color(pt.color) };
  });
  return (ENI[key] = { key, list, n: 0, flyer: d.arch === 'flyer' });
}
function eniBegin() {
  for (const k in ENI) ENI[k].n = 0;
}
function eniEnd() {
  for (const k in ENI) {
    const E = ENI[k];
    for (const L of E.list) {
      L.im.count = E.n;
      L.im.instanceMatrix.needsUpdate = true;
      if (L.im.instanceColor) L.im.instanceColor.needsUpdate = true;
    }
  }
}
function enemyYaw(e, dt) {
  const dx = e.x - (e._lx ?? e.x),
    dy = e.y - (e._ly ?? e.y);
  e._lx = e.x;
  e._ly = e.y;
  let ty = e._yaw ?? 0;
  const sp = Math.hypot(dx, dy);
  if (sp > 0.05) ty = Math.atan2(dx, dy);
  else {
    const p = players[0];
    if (p) ty = Math.atan2(p.x - e.x, p.y - e.y);
  }
  e._yaw = angLerp(e._yaw ?? ty, ty, Math.min(1, dt * 10));
  e._mv = clamp(sp / (dt * 40 + 1e-3), 0, 1);
  return e._yaw;
}
function eniDraw(e, dt) {
  const E = eniFor(e.key);
  if (E.n >= 420) return;
  const i = E.n++;
  const yaw = enemyYaw(e, dt);
  const s = e.r / 14.5;
  const ph = T * 9 + e.ph;
  let by = e.z;
  if (E.flyer) by += Math.sin(T * 3 + e.ph) * 3;
  if (e.d.feat === 'hop') by += Math.abs(Math.sin(T * 6 + e.ph)) * 8;
  _q3.setFromAxisAngle(_p3.set(0, 1, 0), yaw);
  _b4.compose(_p3.set(e.x, by, e.y), _q3, _s3.set(s, s, s));
  const fl = e.flash > 0;
  for (const L of E.list) {
    partAnim(L.pt, ph, 1, T, null);
    _q3.setFromEuler(_e3);
    _m4.compose(_p3.set(L.pt.pv[0], L.pt.pv[1], L.pt.pv[2]), _q3, _s3);
    _m4.premultiply(_b4);
    L.im.setMatrixAt(i, _m4);
    L.im.setColorAt(i, fl ? tmpC.set('#ffffff') : e.elite ? tmpC.copy(L.col).lerp(EL_GOLD, 0.18) : L.col);
  }
}
const EL_GOLD = new THREE.Color('#ffd040');
