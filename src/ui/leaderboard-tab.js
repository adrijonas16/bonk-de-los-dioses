/* ---- Clasificación ---- */
document.querySelectorAll('#lbTabs button').forEach(
  (b) =>
    (b.onclick = () => {
      UI.lbTab = b.dataset.v;
      renderRanking();
    })
);
async function renderRanking() {
  document
    .querySelectorAll('#lbTabs button')
    .forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === UI.lbTab ? 'true' : 'false'));
  const mapSel = $('lbMap');
  if (!mapSel.options.length)
    mapSel.innerHTML = Object.keys(REALMS)
      .map((k) => `<option value="${k}">${esc(REALMS[k].name)}</option>`)
      .join('');
  mapSel.value = UI.lbMap;
  mapSel.onchange = () => {
    UI.lbMap = mapSel.value;
    renderRanking();
  };
  mapSel.hidden = UI.lbTab !== 'mapa';
  const body = $('lbBody');
  if (!NET.db) {
    body.innerHTML = `<tr><td colspan="5" class="mut">Inicia sesión para entrar en la clasificación. Tu mejor puntuación local: ${fmtN(PROF.best.score)}.</td></tr>`;
    return;
  }
  if (!NET.board) body.innerHTML = '<tr><td colspan="5" class="mut">Cargando…</td></tr>';
  const rows = await loadBoard();
  if (!rows) {
    body.innerHTML = '<tr><td colspan="5" class="mut">No se pudo cargar la clasificación.</td></tr>';
    return;
  }
  let list;
  if (UI.lbTab === 'clanes') {
    const m = {};
    for (const r of rows) {
      if (!r.clan) continue;
      const c = String(r.clan).slice(0, 20);
      m[c] = m[c] || { name: c, score: 0, n: 0 };
      m[c].score += +r.score || 0;
      m[c].n++;
    }
    list = Object.values(m)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
    body.innerHTML =
      list
        .map(
          (c, i) =>
            `<tr class="${c.name === PROF.clan ? 'me' : ''}"><td>${i + 1}</td><td><b>${esc(c.name)}</b></td><td>${c.n} miembros</td><td></td><td>${fmtN(c.score)}</td></tr>`
        )
        .join('') || '<tr><td colspan="5" class="mut">Todavía no hay clanes. Crea uno en la pestaña Clan.</td></tr>';
    return;
  }
  const val = (r) =>
    UI.lbTab === 'global'
      ? +r.score || 0
      : UI.lbTab === 'super'
        ? +r.endless || 0
        : +(r.byMap && r.byMap[UI.lbMap]) || 0;
  list = rows
    .filter((r) => val(r) > 0)
    .sort((a, b) => val(b) - val(a))
    .slice(0, 100);
  body.innerHTML =
    list
      .map(
        (r, i) =>
          `<tr class="${r.id === NET.uid ? 'me' : ''}"><td>${i + 1}</td><td><b>${esc(r.id === NET.uid ? 'Tú' : nameOf(r.id, 'Jugador'))}</b></td><td>${GOD[r.god] ? esc(GOD[r.god].name) : ''}</td><td>${esc(r.clan || '')}</td><td>${fmtN(val(r))}</td></tr>`
      )
      .join('') || '<tr><td colspan="5" class="mut">Nadie tiene puntuación aquí todavía. ¡Sé el primero!</td></tr>';
}
