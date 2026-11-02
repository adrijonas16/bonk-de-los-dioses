/* ---------- pausa estilo ficha ---------- */
const _pause = pause;
pause = function (on) {
  _pause(on);
  if (on) renderPause();
};
function renderPause() {
  if (!G) return;
  try {
    renderQuestPause();
  } catch (err) {
    console.warn(err);
  }
  const p = players[0];
  applyTheme(p.g.pan);
  portrait($('psPort'), p.god, 96);
  $('psCtx').textContent =
    `${REALMS[G.realm].name} · ${G.mode === 'libre' ? 'Supervivencia' : 'Clásico'} · Reino ${G.ridx + 1}`;
  $('psName').textContent = p.g.name;
  $('psPan').textContent = p.g.pan;
  $('psLv').textContent = 'Nv. ' + G.level;
  $('psHp').style.width = (p.hp / p.maxHp) * 100 + '%';
  $('psHpT').textContent = `${Math.ceil(p.hp)}/${Math.round(p.maxHp)}`;
  $('psXp').style.width = (G.xp / G.need) * 100 + '%';
  $('psXpT').textContent = `${Math.floor(G.xp)}/${G.need}`;
  const dps = G.dmgWin.reduce((s, w) => s + w[1], 0) / 4;
  $('psTiles').innerHTML = [
    [fmt(G.t), 'Tiempo'],
    [fmtN(G.kills), 'Bajas'],
    [fmtN(G.dmgTotal), 'Daño'],
    [fmtN(dps), 'Daño/s'],
    ['<i class="cn"></i>' + fmtN(Math.floor(G.gold)), 'Oro'],
    ['<i class="cn"></i>' + fmtN(Math.round(G.money + G.goldTotal * 0.2)), 'Dracmas'],
    ['x' + G.bestStreak, 'Mejor racha'],
  ]
    .map((t) => `<div class="tile"><b>${t[0]}</b><span>${t[1]}</span></div>`)
    .join('');
  const ws = Object.keys(p.weapons);
  $('psWcount').textContent = `${ws.length} de 4`;
  $('psWeapons').innerHTML =
    `<div class="abil"><small>DON DEL DIOS</small><b>${esc(p.g.pn)}</b><p>${esc(p.g.pd)} ${esc(p.g.bd)}.</p></div>` +
    ws
      .map((k) => {
        const Wd = WEAPONS[k],
          w = p.weapons[k],
          s = kst(Wd, w.lvl, p);
        const tags = [];
        if (s.dmg) tags.push(`DAÑO ${Math.round(s.dmg * pMul(p))}`);
        if (s.cd) tags.push(`RECARGA ${(s.cd * p.cdMul).toFixed(1)} s`);
        if (s.count) tags.push(`x${s.count}`);
        if (s.radius) tags.push(`RADIO ${Math.round(s.radius * p.area)}`);
        {
          const rc = Math.round(weaponReach(Wd, s, p));
          if (rc && !s.radius) tags.push(`ALCANCE ${rc}`);
        }
        return `<div class="wrow"><span class="wem">${Wd.em}</span><div><b>${esc(Wd.name)}</b><small>${esc(Wd.pan)} · Nv. ${w.lvl}</small><div class="tags">${tags.map((t) => `<span>${t}</span>`).join('')}</div><p>${esc(Wd.desc)}</p></div></div>`;
      })
      .join('');
  const its = Object.keys(p.items);
  $('psIcount').textContent = `${its.length} objetos · ${Object.keys(p.passives).length} dones`;
  $('psItems').innerHTML =
    (its
      .map((k) => {
        const d = ITEMS[k],
          r = RAR[d.rar];
        return `<div class="irow"><span class="iem" style="--rc:${r.col}">${d.em}</span><div><b>${esc(d.name)}</b> <span class="pill" style="background:${r.col}">${r.name}</span> <small>x${p.items[k]} de ${d.max}</small><p>${esc(d.desc)}</p></div></div>`;
      })
      .join('') ||
      '<p class="mut">Abre cofres (E) para conseguir objetos. Los élites y los jefes dejan los mejores.</p>') +
    Object.keys(p.passives)
      .map((k) => {
        const d = PASSIVES[k];
        return `<div class="irow"><span class="iem" style="--rc:#3a8bff">${d.em}</span><div><b>${esc(d.name)}</b> <small>Nv. ${p.passives[k]}</small><p>${esc(d.desc)}</p></div></div>`;
      })
      .join('');
  const st = [
    ['Daño', `${Math.round(pMul(p) * 100)}%`, pMul(p) > 1],
    ['Recarga', `${Math.round(100 / p.cdMul)}%`, p.cdMul < 1],
    ['Área', `${Math.round(p.area * 100)}%`, p.area > 1],
    ['Alcance', `${Math.round((p.range || 1) * 100)}%`, (p.range || 1) > 1],
    ['Suerte', `+${Math.round((p.luck || 0) * 100)}%`, (p.luck || 0) > 0],
    ['Proyectiles extra', p.countBonus, p.countBonus > 0],
    ['Prob. crítico', `${Math.round(p.crit * 100)}%`, p.crit > 0],
    ['Daño crítico', `${Math.round((1 + p.critDmg) * 100)}%`, p.critDmg > 1],
    ['Daño a jefes', `${Math.round((1 + p.bossDmg) * 100)}%`, p.bossDmg > 0],
  ];
  const df = [
    ['PS máx.', Math.round(p.maxHp), p.maxHp > p.g.hp],
    ['Regeneración/s', p.regen.toFixed(1), p.regen > 0],
    ['Armadura', p.armor, p.armor > 0],
    ['Evasión', `${Math.round(p.evasion * 100)}%`, p.evasion > 0],
    ['Espinas', `${Math.round(p.thorns * 100)}%`, p.thorns > 0],
    ['Robo de vida', p.steal.toFixed(1), p.steal > 0],
    ['Vidas extra', p.lives, p.lives > 0],
  ];
  const ut = [
    ['Velocidad', `${Math.round((p.speed / p.g.spd / 1.15) * 100)}%`, p.speed > p.g.spd * 1.15],
    ['Rango recogida', Math.round(p.magnet), p.magnet > 80],
    ['Experiencia', `${Math.round(p.xpMul * 100)}%`, p.xpMul > 1],
    ['Dracmas', `${Math.round(p.goldMul * 100)}%`, p.goldMul > 1],
    ['Saltos extra', p.extraJumps, p.extraJumps > 0],
    ['Curación', `${Math.round(p.healMul * 100)}%`, p.healMul > 1],
  ];
  const tb = (rows) =>
    rows.map((r) => `<tr><td>${r[0]}</td><td class="${r[2] ? 'up' : ''}">${r[1]}</td></tr>`).join('');
  $('psStats').innerHTML =
    `<div><div class="sub">Ataque</div><table>${tb(st)}</table></div><div><div class="sub">Defensa</div><table>${tb(df)}</table><div class="sub">Utilidad</div><table>${tb(ut)}</table></div>`;
  $('psOnline').textContent = G.online ? 'En online la partida sigue mientras estás en pausa.' : '';
}
$('psContinue').onclick = () => pause(false);
$('psQuit').onclick = () => {
  if (G && !G.online && state !== 'end') {
    endGame(false);
  } else toMenu();
};
$('psRestart').onclick = () => {
  if (G && !G.online) {
    state = 'menu';
    newRun();
  }
};
$('pauseBtn').onclick = () => {
  if (state === 'play') pause(true);
};
$('mapBtn').onclick = (ev) => {
  ev.stopPropagation();
  toggleWorldMap();
};
// tocar el minimapa abre el mapa grande; con el mapa abierto, tocar pone o quita una marca
$('c').addEventListener('pointerdown', (ev) => {
  if (!G || (state !== 'play' && !G.mapOpen)) return;
  const r = $('c').getBoundingClientRect(),
    x = ev.clientX - r.left,
    y = ev.clientY - r.top,
    mmR = Math.min(78, r.width * 0.09);
  if (G.mapOpen) {
    ev.stopImmediatePropagation();
    mapClick(x, y);
  } else if (Math.hypot(x - (r.width - mmR - 18), y - (mmR + 18)) < mmR + 6) {
    ev.stopImmediatePropagation();
    toggleWorldMap(true);
  }
});
$('c').addEventListener('pointermove', (ev) => {
  if (!G || !G.mapOpen) return;
  const r = $('c').getBoundingClientRect();
  MAPUI.mx = ev.clientX - r.left;
  MAPUI.my = ev.clientY - r.top;
});
