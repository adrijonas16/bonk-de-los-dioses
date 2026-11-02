/* ---------- HUD ---------- */
function buildHud() {
  setTimeout(() => typeof refreshNectar === 'function' && refreshNectar(), 0);
  const p = players[0];
  portrait($('hudPort'), p.god, 88);
  $('hudName').textContent = p.g.name;
  $('hudPan').textContent = p.g.pan;
  applyTheme(p.g.pan);
  $('ultEm').textContent = WEAPONS[p.g.w].em;
  $('ultName').textContent = p.g.pn;
  const p2 = players[1];
  $('p2card').hidden = !p2;
  if (p2) {
    portrait($('p2Port'), p2.god, 48);
    $('p2Name').textContent = (p2.ctrl === 'ai' ? 'IA · ' : 'J2 · ') + p2.g.name;
  }
  $('tbtns').hidden = !isTouch || G.coop;
  $('lockHint').hidden = isTouch || !!document.pointerLockElement;
  refreshLoadout();
  computeConc();
  HUDC = {};
}
function refreshLoadout() {
  if (!players[0]) return;
  const p = players[0];
  const ws = Object.keys(p.weapons);
  $('wslots').innerHTML = Array.from({ length: 4 }, (_, i) => {
    const k = ws[i];
    return k
      ? `<div class="slot" title="${esc(WEAPONS[k].name)}"><span>${WEAPONS[k].em}</span><b>${p.weapons[k].lvl}</b></div>`
      : '<div class="slot empty"></div>';
  }).join('');
  const its = [
    ...Object.keys(p.items).map((k) => ({
      em: ITEMS[k].em,
      n: p.items[k],
      col: RAR[ITEMS[k].rar].col,
      t: ITEMS[k].name,
    })),
    ...Object.keys(p.passives).map((k) => ({
      em: PASSIVES[k].em,
      n: p.passives[k],
      col: '#3a8bff',
      t: PASSIVES[k].name,
    })),
  ];
  $('islots').innerHTML = its
    .slice(0, 14)
    .map(
      (x) =>
        `<div class="islot" style="--rc:${x.col}" title="${esc(x.t)}"><span>${x.em}</span>${x.n > 1 ? `<b>${x.n}</b>` : ''}</div>`
    )
    .join('');
}
function renderConc() {
  const box = $('conc');
  if (!box || !G) return;
  box.innerHTML = '';
  const cnt = G.concCount || {};
  for (const t in cnt) {
    const on = G.conc[t];
    const s = document.createElement('span');
    s.className = 'cc' + (on ? ' on' : '');
    const fv = G.concFavor === t;
    s.textContent =
      `${CONCILIOS[t].name.replace(/^Concilio (de los |de la |del )/, '')} ${Math.min(3, cnt[t])}/3` +
      (fv ? ' · ϟ1 del favor' : '');
    s.title = CONCILIOS[t].desc + (fv ? ' · Una de las 3 fuentes es tu favor divino (no es un arma ni un don).' : '');
    box.appendChild(s);
  }
}
let HUDC = {};
function setT(id, v) {
  if (HUDC[id] !== v) {
    HUDC[id] = v;
    $(id).textContent = v;
  }
}
function setW(id, v) {
  const s = v.toFixed(1) + '%';
  if (HUDC[id + 'w'] !== s) {
    HUDC[id + 'w'] = s;
    $(id).style.width = s;
  }
}
function hudTick() {
  if (!G || !players[0]) return;
  const p = players[0];
  setW('hpf', (p.hp / p.maxHp) * 100);
  setT('hpt', p.down ? 'CAÍDO' : `${Math.ceil(p.hp)}/${Math.round(p.maxHp)}`);
  setW('xpf', (G.xp / G.need) * 100);
  setT('xpt', `${Math.floor(G.xp)}/${G.need}`);
  setT('hudLv', 'Nv. ' + G.level);
  const cd = p.g.cd * p.cdMul * p.powCdMul;
  const k = p.pow / cd;
  const ultH = (k * 100).toFixed(0) + '%';
  if (HUDC.ult !== ultH) {
    HUDC.ult = ultH;
    $('ultFill').style.height = ultH;
    $('ult').classList.toggle('ready', p.pow <= 0);
    $('power').classList.toggle('ready', p.pow <= 0);
    $('powFill').style.height = ultH;
  }
  {
    const lk = powLocked(p);
    setT('ultCd', lk ? '🔒 Nv ' + POW_LV : p.pow > 0 ? Math.ceil(p.pow) + 's' : 'R');
    $('ult').classList.toggle('locked', lk);
    if (lk) {
      $('ult').classList.remove('ready');
      $('power').classList.remove('ready');
    }
  }
  const dk = clamp(p.dashCd / 1.1, 0, 1);
  setW('dashf', (1 - dk) * 100);
  setT('scoreN', fmtN(Math.round(G.score || 0)));
  {
    const cb = G.combo || 0,
      on = cb >= 5;
    $('comboB').hidden = !on;
    if (on) {
      const m = comboMul();
      const mt = `×${String(+(m * stageMul() * (SC_DIFF[G.diffKey] || 1)).toFixed(1)).replace('.', ',')}`;
      if ($('comboN').textContent !== mt) {
        $('comboN').textContent = mt;
        const sb = $('scoreBox');
        sb.classList.remove('pop');
        void sb.offsetWidth;
        sb.classList.add('pop');
      }
      setT('comboC', `${cb} seguidas`);
      $('comboT').style.width = Math.max(0, (G.comboT / 3) * 100) + '%';
    }
  }
  setT('rName', REALMS[G.realm].name);
  setT('rTime', fmt(G.rt));
  setT(
    'rMode',
    (G.mode === 'libre' ? `Supervivencia · Oleada ${G.wave || 1}` : `Clásico · Reino ${Math.min(G.ridx + 1, 4)} de 4`) +
      (G.diffKey && G.diffKey !== 'normal' ? ' · ' + DIFF[G.diffKey].name : '') +
      (G.online ? ' · Online' : '')
  );
  const nx = G.events[0];
  setT(
    'rNext',
    nx
      ? `${BOSSES[nx.key].tier === 'mini' ? 'Minijefe' : BOSSES[nx.key].tier === 'final' ? 'Final' : 'Jefe'} · ${BOSSES[nx.key].name} en ${fmt(nx.t - G.rt)}`
      : G.portals
        ? 'Portales abiertos: entra en uno'
        : G.bosses.length
          ? '¡Derrota al jefe!'
          : ''
  );
  setT('kills', fmtN(G.kills));
  setT('gold', fmtN(Math.floor(G.gold)));
  const ms = (G.missions || []).map((m) => `${m.id}${m.prog}${m.done}`).join('|');
  if (HUDC.ms !== ms) {
    HUDC.ms = ms;
    $('missions').innerHTML = (G.missions || [])
      .map(
        (m) =>
          `<li class="${m.done ? 'done' : ''}"><span>${esc(m.txt)}</span><div class="mbar"><i style="width:${(m.prog / m.n) * 100}%"></i></div><small>${m.done ? 'Completada' : `${m.prog}/${m.n} · <i class="cn"></i>${m.rew}`}</small></li>`
      )
      .join('');
  }
  const bs = G.bosses[0];
  $('boss').hidden = !bs;
  if (bs) {
    setT('bossName', bs.d.name);
    setW('bossf', (bs.hp / bs.maxHp) * 100);
  }
  const p2 = players[1];
  if (p2) {
    setW('p2hp', (p2.hp / p2.maxHp) * 100);
  }
  if (G.online) {
    const pl = remotes
      .map((r) => `${r.name}|${r.dn}|${Math.round((r.hp / r.maxHp) * 10)}|${r.realm === G.realm}`)
      .join(',');
    if (HUDC.pl !== pl) {
      HUDC.pl = pl;
      $('party').hidden = !remotes.length;
      $('party').innerHTML =
        '<div class="sub">Grupo</div>' +
        remotes
          .map(
            (r) =>
              `<div class="pm${r.dn ? ' dn' : ''}"><b>${esc(r.name)}</b><span>${esc(r.g.name)}${r.realm !== G.realm ? ' · otro reino' : r.dn ? ' · ¡caído, ve a revivirlo!' : ''}</span><div class="mbar"><i style="width:${(r.hp / r.maxHp) * 100}%"></i></div></div>`
          )
          .join('');
    }
  } else if (!$('party').hidden) $('party').hidden = true;
}
