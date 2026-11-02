/* ---- Jugar ---- */
function renderPlay() {
  const g = GOD[PROF.god],
    w = WEAPONS[g.w];
  applyTheme(g.pan);
  fullSprite($('heroCv'), g.id, 2);
  $('heroName').textContent = g.name;
  $('heroPan').textContent = g.pan;
  $('heroTitle').textContent = g.title;
  $('heroInfo').innerHTML =
    `<div><b>Arma</b>${esc(w.name)} · ${esc(w.desc)}</div><div><b>Poder · R</b>${esc(g.pn)} · ${esc(g.pd)}</div><div><b>Don</b>${esc(g.bd)}</div>`;
  $('heroStats').innerHTML =
    `<span>PS ${g.hp}</span><span>Vel ${g.spd}</span>${g.tag ? `<span>${esc(CONCILIOS[g.tag].name)}</span>` : ''}`;
  segSet('segMode', cfg.mode);
  segSet('segParty', cfg.party);
  segSet('segDiff', cfg.diff);
  {
    const pw = ((PROF.stats.winsByDiff || {}).dificil || 0) + ((PROF.stats.winsByDiff || {}).pesadilla || 0) > 0;
    const pb = $('segDiff').querySelector('[data-v=pesadilla]');
    pb.disabled = !pw;
    if (!pw && cfg.diff === 'pesadilla') {
      cfg.diff = 'normal';
      segSet('segDiff', 'normal');
    }
  }
  const opts = GODS.filter((x) => owns(x.id) && x.id !== PROF.god);
  for (const id of ['allySel', 'p2Sel']) {
    const sel = $(id);
    const cur = id === 'allySel' ? UI.ally : UI.p2;
    sel.innerHTML = opts
      .map((x) => `<option value="${x.id}">${esc(x.name)} · ${esc(x.pan)}${relTag(PROF.god, x.id)}</option>`)
      .join('');
    sel.value = opts.some((x) => x.id === cur)
      ? cur
      : (opts.find((x) => relOf(PROF.god, x.id)) || opts[0] || {}).id || '';
  }
  $('allyRow').hidden = cfg.party !== 'ia';
  $('p2Row').hidden = cfg.party !== 'coop';
  $('onlineBox').hidden = cfg.party !== 'online';
  $('partyHint').textContent = {
    solo: 'Tú solo contra los monstruos de todos los panteones.',
    ia: 'Un dios controlado por la IA pelea contigo y te revive si caes.',
    coop: 'En el mismo teclado. Jugador 2: flechas, Shift derecho salta, Ctrl derecho desliza, Enter poder. También vale un mando.',
    online: 'Crea una sala y pasa el código, o únete a una abierta. Cada uno juega con su dios.',
  }[cfg.party];
  updRelNote();
  renderMaps();
  renderOnline();
  updPlayBtn();
}
function relTag(a, b) {
  const r = relOf(a, b);
  return r ? (r.type === 'rival' ? ' · Rival' : ' · Aliado') : '';
}
function updRelNote() {
  const other = cfg.party === 'ia' ? $('allySel').value : cfg.party === 'coop' ? $('p2Sel').value : '';
  const el = $('relNote');
  const r = other ? relOf(PROF.god, other) : null;
  if (!r) {
    el.hidden = true;
    return;
  }
  const o = GOD[other],
    lf = r.a === PROF.god ? r.la : r.lb,
    lg = r.a === PROF.god ? r.lb : r.la;
  el.hidden = false;
  el.className = 'relnote ' + r.type;
  el.innerHTML = `<b>${r.type === 'rival' ? 'Rivales' : 'Aliados'}</b> «${esc(lf)}» · ${esc(o.name)}: «${esc(lg)}»<br><small>${r.type === 'rival' ? 'Compiten cada minuto por la corona; poderes a la vez = choque divino.' : `Juntos pegan más; poderes a la vez = combo ${esc(r.combo)}.`}</small>`;
}
$('allySel').onchange = () => {
  UI.ally = $('allySel').value;
  updRelNote();
};
$('p2Sel').onchange = () => {
  UI.p2 = $('p2Sel').value;
  updRelNote();
};
function segSet(id, v) {
  $(id)
    .querySelectorAll('button')
    .forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'));
}
$('segDiff')
  .querySelectorAll('button')
  .forEach(
    (b) =>
      (b.onclick = () => {
        if (b.disabled) return;
        cfg.diff = b.dataset.v;
        renderPlay();
      })
  );
$('segMode')
  .querySelectorAll('button')
  .forEach(
    (b) =>
      (b.onclick = () => {
        cfg.mode = b.dataset.v;
        renderPlay();
        if (NET.isHost) salaPresence({ phase: 'lobby' }), lobbyPresence();
      })
  );
$('segParty')
  .querySelectorAll('button')
  .forEach(
    (b) =>
      (b.onclick = () => {
        cfg.party = b.dataset.v;
        if (cfg.party !== 'online' && NET.sala) leaveSala();
        renderPlay();
      })
  );
const PREV = {};
let prevQueue = [];
function renderMaps() {
  const box = $('maps');
  box.innerHTML = '';
  for (const k in REALMS) {
    if (k === 'vacio' && cfg.mode === 'ragnarok') continue;
    const r = REALMS[k];
    const bt = document.createElement('button');
    bt.className = 'mapc' + (cfg.realm === k ? ' sel' : '');
    bt.id = 'map-' + k;
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 135;
    c.id = 'mc-' + k;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 135);
    gr.addColorStop(0, LOOK3D[k].top);
    gr.addColorStop(1, LOOK3D[k].hor);
    g.fillStyle = gr;
    g.fillRect(0, 0, 240, 135);
    g.fillStyle = r.g1;
    g.fillRect(0, 90, 240, 45);
    if (PREV[k]) g.drawImage(PREV[k], 0, 0, 240, 135);
    bt.appendChild(c);
    const best = PROF.best.byMap[k] || 0;
    bt.insertAdjacentHTML(
      'beforeend',
      `<span class="mn">${esc(r.name)}</span><span class="ms">${r.pan ? esc(r.pan) + ' · ' : ''}${r.bosspool ? `${(r.minipool || []).length + r.bosspool.length} jefes al azar` : 'Jefe: ' + esc(BOSSES[r.boss].name)}</span>${best ? `<span class="mb">Récord ${fmtN(best)}</span>` : ''}`
    );
    bt.onclick = () => {
      if (NET.sala && !NET.isHost) return;
      cfg.realm = k;
      box.querySelectorAll('.mapc').forEach((x) => x.classList.toggle('sel', x === bt));
      if (NET.isHost) {
        salaPresence({ phase: 'lobby' });
        lobbyPresence();
      }
    };
    box.appendChild(bt);
  }
  if (GL_OK) {
    prevQueue = Object.keys(REALMS).filter((k) => !PREV[k]);
    if (prevQueue.length && !PREV_BUSY) {
      PREV_BUSY = true;
      setTimeout(nextPreview, 80);
    }
  }
}
function nextPreview() {
  if (!prevQueue.length || state !== 'menu') {
    PREV_BUSY = false;
    if (typeof homeEvent === 'function' && !$('home').hidden) homeEvent();
    if (state === 'menu') {
      buildWorld(menuRealm);
      clearObjs();
    }
    return;
  }
  const k = prevQueue.shift();
  try {
    buildWorld(k);
    {
      const f = MENU_FOCUS[k] || [0, 0, 700],
        x = f[0] - f[2] * 0.35,
        z = f[1] + f[2] * 0.85,
        gy = groundAt(f[0], f[1]);
      cam3.position.set(x, Math.max(gy + 230, groundAt(x, z) + 140), z);
      cam3.lookAt(f[0], gy + 30, f[1]);
      sunFollow(f[0], f[1]);
    }
    for (const m of SMAT.values()) m.color.set('#ffffff');
    updWeather(0, 0, 0);
    renderer.render(scene, cam3);
    const c = mkCanvas(240, 135);
    c.getContext('2d').drawImage(renderer.domElement, 0, 0, 240, 135);
    PREV[k] = c;
    const card = $('mc-' + k);
    if (card) card.getContext('2d').drawImage(c, 0, 0);
  } catch (err) {
    console.error(err);
  }
  setTimeout(nextPreview, 30);
}
function updPlayBtn() {
  const b = $('playBtn');
  if (!AS.ready && !AS.failed) {
    b.disabled = true;
    b.textContent = `CARGANDO MODELOS ${Math.round(AS.prog * 100)}%`;
    return;
  }
  if (cfg.party === 'online') {
    if (!NET.sala) {
      b.disabled = true;
      b.textContent = 'Crea o únete a una sala';
    } else if (NET.isHost) {
      b.disabled = false;
      b.textContent = `EMPEZAR CON ${NET.salaPeers.length || 1}`;
    } else {
      b.disabled = true;
      b.textContent = 'Esperando al anfitrión…';
    }
  } else {
    b.disabled = false;
    b.textContent = 'JUGAR';
  }
}
$('playBtn').onclick = () => {
  if (cfg.party === 'online') {
    hostStart();
    return;
  }
  cfg.picks = [{ id: PROF.god, ctrl: 'p1' }];
  if (cfg.party === 'ia' && $('allySel').value) cfg.picks.push({ id: $('allySel').value, ctrl: 'ai' });
  if (cfg.party === 'coop' && $('p2Sel').value) cfg.picks.push({ id: $('p2Sel').value, ctrl: 'p2' });
  newRun();
  lobbyPresence();
};
$('heroChange').onclick = () => openTab('dioses');
