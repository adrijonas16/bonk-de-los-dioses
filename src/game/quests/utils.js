/* ---------- utilidades ---------- */
function qHumans() {
  return players.filter((p) => !p.down && (p.ctrl === 'p1' || p.ctrl === 'p2'));
}
function qNearest(x, y) {
  let best = null,
    bd = 1e12;
  for (const p of qHumans()) {
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  return best ? [best, Math.sqrt(bd)] : [null, 1e9];
}
function qSpeed(p) {
  return p.speed * (G.slowT > 0 && !inShelter(p) ? 0.72 : 1) * (p.rage > 0 ? 1.35 : 1) * (p.qRelic ? 0.9 : 1);
}
function qFlat(x, y) {
  if (hazardAt(x, y)) return false;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 6.283;
    if (slopeAt(x + Math.cos(a) * 34, y + Math.sin(a) * 34) > 0.28) return false;
  }
  return slopeAt(x, y) < 0.25;
}
function qFree(x, y, pad) {
  return !WORLD.coll.some((c) => Math.hypot(c.x - x, c.y - y) < c.r + (pad || 50));
}
function qEnemy(key, x, y, o) {
  const d = ENEMIES[key];
  const e = Object.assign(
    {
      key,
      d,
      x,
      y,
      z: groundAt(x, y),
      hp: 100,
      spd: d.spd,
      dmg: d.dmg,
      r: d.r,
      xp: d.xp,
      elite: false,
      flash: 0,
      soul: 0,
      ph: rand(0, 6.28),
      stun: 0,
      slow: 0,
      mark: 0,
      conf: 0,
      shH: 0,
      quest: true,
      heavy: true,
    },
    o || {}
  );
  e.maxHp = e.hp;
  enemies.push(e);
  return e;
}
function qMesh(geo, mat, x, y, z, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  (parent || WORLD.group).add(m);
  return m;
}
function qRing(col, r, op) {
  const m = new THREE.Mesh(
    new THREE.RingGeometry(r - 5, r, 40),
    MB(col, { transparent: true, opacity: op || 0.6, side: THREE.DoubleSide })
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}
function qGlow(col, s) {
  const sp = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex(col),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    })
  );
  sp.scale.set(s, s, 1);
  return sp;
}
function qPillar(col) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(7, 12, 700, 8, 1, true),
    new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      fog: false,
    })
  );
  m.position.y = 350;
  m.renderOrder = 8;
  return m;
}
function qActive(id) {
  return G && G.q && G.q.active.find((a) => a.id === id);
}
function inShelter(p) {
  const q = G && G.q;
  if (!q) return false;
  for (const s of q.shelters) if ((p.x - s.x) ** 2 + (p.y - s.y) ** 2 < s.r * s.r) return true;
  for (const b of q.braz) if (b.lit && (p.x - b.x) ** 2 + (p.y - b.y) ** 2 < b.r * b.r) return true;
  return false;
}
function qRecent(A, ok, txt) {
  const inf = qInfo(A.a);
  G.q.recent.push({ icon: inf.icon, name: inf.name, txt, ok, t: 6, col: inf.col });
}
