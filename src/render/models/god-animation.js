/* ---------- animación de dioses ---------- */
const _qa = new THREE.Quaternion();
function angLerp(a, b, k) {
  let d = b - a;
  while (d > Math.PI) d -= 6.2832;
  while (d < -Math.PI) d += 6.2832;
  return a + d * k;
}
function animGod(m, p, dt) {
  const u = m.userData,
    P = u.parts;
  const mv = p.moving && !p.down ? 1 : 0,
    air = p.air && !p.down;
  u.ph += dt * (mv ? 10.5 : 0);
  const s = Math.sin(u.ph),
    c = Math.cos(u.ph);
  p.atk = Math.max(0, (p.atk || 0) - dt);
  p.powAnim = Math.max(0, (p.powAnim || 0) - dt);
  const atk = p.atk / 0.22;
  const glide = air && p.vz < -60;
  const [lL, lR] = P.legs;
  if (air) {
    lL.hip.rotation.x = -0.9;
    lL.knee.rotation.x = 1.2;
    lR.hip.rotation.x = 0.3;
    lR.knee.rotation.x = 0.6;
  } else {
    lL.hip.rotation.x = s * 0.75 * mv;
    lR.hip.rotation.x = -s * 0.75 * mv;
    lL.knee.rotation.x = Math.max(0, -c) * 1.1 * mv + 0.05;
    lR.knee.rotation.x = Math.max(0, c) * 1.1 * mv + 0.05;
  }
  const aL = P.armL,
    aR = P.armR;
  aL.sh.rotation.x = air ? -0.7 : -s * 0.7 * mv;
  aL.sh.rotation.z = glide ? -1.45 : air ? -0.6 : -0.1 - Math.sin(T * 2) * 0.03;
  aL.el.rotation.x = -0.25 - (mv ? 0.5 : 0.1);
  aR.sh.rotation.x = (air ? -0.5 : s * 0.4 * mv) - atk * 1.7;
  aR.sh.rotation.z = glide ? 1.45 : air ? 0.6 : 0.1;
  aR.el.rotation.x = -0.5 - atk * 0.6;
  if (p.powAnim > 0) {
    aL.sh.rotation.x = aR.sh.rotation.x = -2.9;
    aL.sh.rotation.z = -0.3;
    aR.sh.rotation.z = 0.3;
    aL.el.rotation.x = aR.el.rotation.x = -0.2;
  }
  P.body.position.y = Math.abs(c) * 1.3 * mv + (mv ? -0.4 : Math.sin(T * 2.4) * 0.2);
  P.torso.rotation.x = mv * 0.14 + (p.dashT > 0 ? 0.8 : 0);
  P.torso.rotation.y = atk * 0.35 + s * 0.08 * mv;
  P.head.rotation.x = -P.torso.rotation.x * 0.6;
  P.head.rotation.y = -P.torso.rotation.y * 0.7 + Math.sin(T * 0.7) * 0.1 * (1 - mv);
  if (P.cape) P.cape.rotation.x = 0.1 + mv * 0.5 + (air ? 0.5 : 0) + Math.sin(T * 6) * 0.05;
  if (P.drums) P.drums.rotation.z = Math.sin(T * 1.5) * 0.1;
  if (P.tail) P.tail.rotation.y = Math.sin(T * 3) * 0.5;
  P.xarms.forEach((a, i) => {
    a.rotation.x = (i < 2 ? -0.5 : 0.4) + Math.sin(T * 3 + i) * 0.2;
  });
  if (P.head.userData.rays) P.head.userData.rays.rotation.z = T * 0.6;
  if (P.head.userData.flame) P.head.userData.flame.scale.y = 1 + Math.sin(T * 14) * 0.12;
  const hw = P.handR.children[0];
  if (hw && hw.userData.spin) hw.userData.spin.rotation.z = T * 8;
  if (hw && hw.userData.orb) hw.userData.orb.position.y = 5 + Math.sin(T * 3) * 1.2;
  const ty = Math.atan2(p.fx || 0, p.fy || 1);
  u.yaw = angLerp(u.yaw, ty, Math.min(1, dt * 12));
  m.rotation.y = u.yaw;
  m.rotation.x = p.down ? -1.45 : 0;
  if (p.down) P.body.position.y = 2;
  const fl = p.inv > 0 && p.inv < 0.45 && Math.floor(p.inv * 20) % 2 === 0 && !p.down,
    hid = p.hidden > 0,
    ghost = p.ctrl === 'net' && p.dn;
  if (u.fl !== fl || u.hid !== hid || u.gh !== ghost) {
    u.fl = fl;
    u.hid = hid;
    u.gh = ghost;
    for (const mm of u.mats) {
      if (!mm.userData.basic && mm.emissive) {
        if (fl) mm.emissive.set('#ffffff');
        else mm.emissive.copy(mm.userData.em0);
      }
      mm.transparent = hid || ghost;
      mm.opacity = hid ? 0.35 : ghost ? 0.5 : 1;
    }
  }
}
