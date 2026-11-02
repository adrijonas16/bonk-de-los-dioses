/* ---------- menú principal ---------- */
const UI = {
  tab: 'jugar',
  pan: 'Todos',
  sel: PROF.god || 'zeus',
  ally: '',
  p2: '',
  lbTab: 'global',
  lbMap: 'tartaro',
  msg: '',
};
document.querySelectorAll('.nav button').forEach((bt) => (bt.onclick = () => openTab(bt.dataset.tab)));
function openTab(t) {
  UI.tab = t;
  document
    .querySelectorAll('.nav button')
    .forEach((b) => b.setAttribute('aria-current', b.dataset.tab === t ? 'page' : 'false'));
  document.querySelectorAll('.tab').forEach((s) => (s.hidden = s.id !== 'tab-' + t));
  ({
    jugar: renderPlay,
    dioses: renderGods,
    tienda: renderShop,
    misiones: renderMissions,
    ranking: renderRanking,
    clan: renderClan,
  })[t]();
}
function uiHome() {
  applyTheme(GOD[PROF.god].pan);
  uiProfileChanged();
  openTab(UI.tab);
}
function uiProfileChanged() {
  ensureDaily();
  $('coins').textContent = fmtN(PROF.coins);
  $('pname').textContent = NET.myName || 'Jugador';
  if (typeof renderHome === 'function') renderHome();
  portrait($('pava'), PROF.god, 40);
  const ready = Object.values(PROF.daily.ids || []).filter((id) => {
    const d = DAILY.find((x) => x.id === id);
    return d && (PROF.daily.prog[id] || 0) >= d.n && !PROF.daily.claimed[id];
  }).length;
  $('misBadge').hidden = !ready;
  $('misBadge').textContent = ready;
  if (state === 'menu' && UI.tab === 'tienda') renderShop();
  if (state === 'menu' && UI.tab === 'dioses') renderGods();
}
function uiNet() {
  if (typeof renderHome === 'function' && $('home') && !$('home').hidden) {
    HRANK_AT = 0;
    renderHome();
  }
  $('onl').textContent = NET.room ? `${NET.online || 1} en línea` : 'Sin conexión';
  $('onl').classList.toggle('off', !NET.room);
  if (state === 'menu' && UI.tab === 'jugar') renderOnline();
  if (state === 'menu' && UI.tab === 'ranking' && NET.db) renderRanking();
}
