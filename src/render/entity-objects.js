/* ---------- objetos por entidad ---------- */
let FRAME = 0;
const OBJS = new Set();
function objFor(ent, key, make) {
  let o = ent[key];
  if (!o || !o.parent) {
    o = make();
    if (!o) return null;
    o.userData.ent = ent;
    o.userData.key = key;
    scene.add(o);
    ent[key] = o;
    OBJS.add(o);
  }
  o.userData.f = FRAME;
  return o;
}
function sweep() {
  for (const o of OBJS) {
    if (o.userData.f !== FRAME) {
      scene.remove(o);
      OBJS.delete(o);
      if (o.userData.disp) o.userData.disp();
      const e = o.userData.ent;
      if (e && e[o.userData.key] === o) e[o.userData.key] = null;
    }
  }
}
function clearObjs() {
  for (const o of OBJS) {
    scene.remove(o);
    if (o.userData.disp) o.userData.disp();
  }
  OBJS.clear();
  for (const l of PLIGHTS) l.intensity = 0;
  const tint = LOOK3D[(WORLD && WORLD.rk) || 'tartaro'].night ? '#c8c0d0' : '#ffffff';
  for (const m of SMAT.values()) m.color.set(tint);
  SPRITE_TINT = tint;
}
let SPRITE_TINT = '#ffffff';
function ghostMat(v) {
  if (!v.c._ghost)
    v.c._ghost = new THREE.SpriteMaterial({
      map: texOf(v.c),
      transparent: true,
      opacity: 0.6,
      alphaTest: 0.2,
      color: '#c8ffc8',
    });
  return v.c._ghost;
}
const PX = 0.45;
function mkSprite(v, scale) {
  const s = new THREE.Sprite(spriteMat(v, false));
  s.center.set(0.5, 0);
  s.scale.set(v.w * PX * (scale || 1), v.h * PX * (scale || 1), 1);
  return s;
}
function setSprite(s, v, flip, flash, scale) {
  const m = spriteMat(v, flip, flash);
  if (m.color.getHexString() !== SPRITE_TINT.slice(1)) m.color.set(SPRITE_TINT);
  s.material = m;
  const k = PX * (scale || 1);
  s.scale.set(v.w * k, v.h * k, 1);
}
