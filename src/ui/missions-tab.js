/* ---- Misiones ---- */
function renderMissions() {
  ensureDaily();
  const box = $('daily');
  box.innerHTML = '';
  for (const id of PROF.daily.ids) {
    const d = DAILY.find((x) => x.id === id);
    if (!d) continue;
    const pr = Math.min(d.n, PROF.daily.prog[id] || 0),
      done = pr >= d.n,
      cl = PROF.daily.claimed[id];
    const el = document.createElement('div');
    el.className = 'misc' + (cl ? ' claimed' : '');
    el.innerHTML = `<div class="mt"><b>${esc(d.txt)}</b><span><i class="cn"></i>${d.rew}</span></div><div class="bar"><i style="width:${(pr / d.n) * 100}%"></i><span>${fmtN(pr)} / ${fmtN(d.n)}</span></div><button class="btn ${done && !cl ? 'green' : ''}" ${!done || cl ? 'disabled' : ''}>${cl ? 'Cobrada' : done ? 'Cobrar' : 'En curso'}</button>`;
    el.querySelector('button').onclick = () => {
      if (done && !cl) {
        PROF.daily.claimed[id] = true;
        PROF.coins += d.rew;
        saveProfile();
        renderMissions();
      }
    };
    box.appendChild(el);
  }
  const st = PROF.stats;
  $('pstats').innerHTML =
    `<div class="tile"><b>${fmtN(PROF.runs)}</b><span>Partidas</span></div><div class="tile"><b>${fmtN(st.kills)}</b><span>Caídos</span></div><div class="tile"><b>${fmtN(st.bosses)}</b><span>Jefes</span></div><div class="tile"><b>${fmtN(st.chests)}</b><span>Cofres</span></div><div class="tile"><b>${fmtN(st.wins)}</b><span>Ragnaröks detenidos</span></div><div class="tile"><b>${fmtN(PROF.best.score)}</b><span>Mejor puntuación</span></div>`;
  $('missionInfo').textContent =
    'Las misiones diarias cambian cada día. Durante la partida, cada reino trae tres misiones propias que dan dracmas al momento.';
}
