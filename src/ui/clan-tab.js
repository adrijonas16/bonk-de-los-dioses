/* ---- Clan ---- */
async function renderClan() {
  $('clanName').textContent = PROF.clan || 'Sin clan';
  $('clanIn').value = '';
  $('clanLeave').hidden = !PROF.clan;
  const box = $('clanMembers');
  if (!PROF.clan) {
    box.innerHTML =
      '<li class="mut">Únete a un clan escribiendo su nombre, o crea uno nuevo. La puntuación del clan suma la mejor partida de cada miembro.</li>';
    return;
  }
  if (!NET.db) {
    box.innerHTML = '<li class="mut">Inicia sesión para ver a los miembros del clan.</li>';
    return;
  }
  const rows = await loadBoard();
  const mem = (rows || []).filter((r) => r.clan === PROF.clan).sort((a, b) => (b.score || 0) - (a.score || 0));
  box.innerHTML =
    mem
      .map(
        (r) =>
          `<li><b>${esc(r.id === NET.uid ? 'Tú' : nameOf(r.id, 'Jugador'))}</b><span>${GOD[r.god] ? esc(GOD[r.god].name) : ''}</span><span>${fmtN(r.score || 0)}</span></li>`
      )
      .join('') || '<li class="mut">Juega una partida para aparecer en tu clan.</li>';
}
$('clanJoin').onclick = async () => {
  const v = $('clanIn').value.trim();
  if (!v) return;
  await setClan(v);
  renderClan();
};
$('clanLeave').onclick = async () => {
  await setClan('');
  renderClan();
};
