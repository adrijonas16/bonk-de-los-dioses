/* ---------- resultados ---------- */
function uiEnd(win, coins, r) {
  const p = players[0];
  applyTheme(p.g.pan);
  portrait($('enPort'), p.god, 96);
  $('enEyebrow').textContent = win ? 'Victoria' : 'Fin de la partida';
  $('enTitle').textContent = win
    ? '¡EL RAGNARÖK SE DETUVO!'
    : pick([
        'Caronte cobra su óbolo',
        'Anubis pesa tu corazón',
        'Las valquirias te recogen',
        'El Mictlán te recibe',
        'Xibalbá gana esta vez',
      ]);
  $('enTiles').innerHTML = [
    [fmt(G.t), 'Tiempo'],
    ['Nv. ' + G.level, 'Nivel'],
    [fmtN(G.kills), 'Bajas'],
    [fmtN(G.bossKills), 'Jefes'],
    [fmtN(G.dmgTotal), 'Daño'],
    ['x' + G.bestStreak, 'Mejor racha'],
    [fmtN(Math.round(G.goldTotal)), 'Oro reunido'],
  ]
    .map((t) => `<div class="tile"><b>${t[0]}</b><span>${t[1]}</span></div>`)
    .join('');
  $('enCoins').innerHTML = '+ <i class="cn"></i>' + fmtN(coins);
  $('enScore').textContent = fmtN(r.sc);
  $('enRec').textContent = '';
  $('enRoute').textContent =
    'Ruta: ' +
    G.visited.map((k) => REALMS[k].name).join(' → ') +
    ` · Misiones completadas: ${G.missionsDone} · Cofres: ${G.chestsOpened}`;
  $('enAgain').hidden = !!G.online;
  show('end');
}
function uiEndScore(r) {
  if (r && r.changed) $('enRec').textContent = '¡Nuevo récord personal!';
}
$('enAgain').onclick = () => {
  state = 'menu';
  newRun();
};
$('enMenu').onclick = () => toMenu();
