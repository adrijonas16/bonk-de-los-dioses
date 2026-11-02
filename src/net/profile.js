/* ---------- perfil ---------- */
let saveTO = null;
function saveProfile() {
  PROF.at = Date.now();
  try {
    store && store.setItem('bonk-perfil', JSON.stringify(PROF));
  } catch (err) {}
  clearTimeout(saveTO);
  saveTO = setTimeout(async () => {
    if (!NET.db || !NET.uid) return;
    try {
      await NET.db.doc(`data/users/${NET.uid}/main`).set(JSON.parse(JSON.stringify(PROF)));
    } catch (err) {
      console.warn('perfil', err && err.code);
    }
  }, 800);
  if (typeof uiProfileChanged === 'function') uiProfileChanged();
}
function ensureDaily() {
  const k = todayKey();
  if (PROF.daily.day !== k) {
    const i0 = [...k].reduce((a, c) => a + c.charCodeAt(0), 0);
    const ids = [];
    for (let i = 0; ids.length < 3 && i < 20; i++) {
      const d = DAILY[(i0 + i * 5) % DAILY.length];
      if (!ids.includes(d.id)) ids.push(d.id);
    }
    PROF.daily = { day: k, ids, prog: {}, claimed: {} };
  }
}
function dailyAdd(id, n) {
  ensureDaily();
  if (!PROF.daily.ids.includes(id)) return;
  PROF.daily.prog[id] = (PROF.daily.prog[id] || 0) + n;
}
function owns(id) {
  return PROF.owned.includes(id);
}
function buyGod(id) {
  if (SECRET_GODS[id]) return false;
  const c = GOD_PRICE(id);
  if (owns(id) || PROF.coins < c) return false;
  PROF.coins -= c;
  PROF.owned.push(id);
  saveProfile();
  return true;
}
function upCost(k) {
  const u = UPGRADES[k];
  return u.base * ((PROF.up[k] || 0) + 1);
}
function buyUpgrade(k) {
  const u = UPGRADES[k],
    l = PROF.up[k] || 0;
  if (l >= u.max) return false;
  const c = upCost(k);
  if (PROF.coins < c) return false;
  PROF.coins -= c;
  PROF.up[k] = l + 1;
  saveProfile();
  return true;
}
function applyUpgrades(p) {
  const u = PROF.up;
  p.maxHp *= 1 + 0.08 * (u.hp || 0);
  p.hp = p.maxHp;
  p.dmgMul += 0.05 * (u.dmg || 0);
  p.speed *= 1 + 0.04 * (u.spd || 0);
  p.magnet *= 1 + 0.15 * (u.mag || 0);
  p.goldMul += 0.1 * (u.gold || 0);
  p.lives += u.rev || 0;
  p.range += 0.05 * (u.rng || 0);
  p.luck += 0.05 * (u.luck || 0);
}
