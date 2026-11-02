/* ---- portada ---- */
const HOME = { shown: true, lb: 'score', god: '' };
let HRANK_AT = 0;
function renderHome() {
  if (!$('home') || $('home').hidden) return;
  const acc = $('hAcc');
  const ready = NET.ready || NET.offline;
  if (NET.uid) {
    const nm = NET.myName || 'Tu cuenta';
    acc.innerHTML = `<span class="hcoin"><i class="cn"></i>${fmtN(PROF.coins)}</span><span class="hav">${esc(nm.slice(0, 1).toUpperCase())}</span><span>${esc(nm)}</span>`;
    $('hGoogle').hidden = true;
  } else {
    acc.innerHTML = `<span class="hcoin"><i class="cn"></i>${fmtN(PROF.coins)}</span>`;
    $('hGoogle').hidden = !ready;
  }
  const g = GOD[PROF.god];
  if (HOME.god !== PROF.god || !$('tPlayCv').width) {
    HOME.god = PROF.god;
    fullSprite($('tPlayCv'), PROF.god, 2);
    const o = GODS.filter((x) => owns(x.id) && x.id !== PROF.god);
    portrait($('tLocalA'), PROF.god, 44);
    portrait($('tLocalB'), (o.find((x) => relOf(PROF.god, x.id)) || o[0] || g).id, 44);
  }
  $('tPlaySub').textContent = `Modo historia · ${g.name}`;
  $('tSurvSub').textContent = `Récord ${fmtN(PROF.best.endless || 0)}`;
  const set = (t, v) => {
    const e = $('ts-' + t);
    if (e) e.textContent = v;
  };
  set('dioses', `${PROF.owned.length}/${GODS.length}`);
  set('tienda', 'Mejoras');
  set('misiones', `${PROF.runs || 0} partidas`);
  set('ranking', `Récord ${fmtN(PROF.best.score || 0)}`);
  set('clan', PROF.clan ? PROF.clan : 'Sin clan');
  homeEvent();
  homeDaily();
  homeRank();
}
function homeEvent() {
  const ev = weekEvent(),
    r = REALMS[ev.realm],
    ms = ev.ends - Date.now(),
    d = Math.floor(ms / 864e5),
    h = Math.floor((ms % 864e5) / 36e5),
    m = Math.floor((ms % 36e5) / 6e4);
  const el = $('hEvent');
  el.innerHTML = `<canvas width="400" height="100"></canvas><div class="evb"><div class="evt">¡EVENTO! Termina en ${d ? d + ' d ' : ''}${h} h ${m} min</div><b>${esc(r.name)}: dracmas ×1,5</b><small>Toda partida que pase por este reino paga un 50 % más</small></div>`;
  const c = el.querySelector('canvas'),
    gx = c.getContext('2d');
  const gr = gx.createLinearGradient(0, 0, 0, 100);
  gr.addColorStop(0, LOOK3D[ev.realm].top);
  gr.addColorStop(1, LOOK3D[ev.realm].hor);
  gx.fillStyle = gr;
  gx.fillRect(0, 0, 400, 100);
  if (PREV[ev.realm]) gx.drawImage(PREV[ev.realm], 0, -60, 400, 225);
  el.onclick = () => {
    cfg.realm = ev.realm;
    closeHome();
  };
}
function homeDaily() {
  ensureDaily();
  const ids = PROF.daily.ids || [];
  let ready = 0;
  const dots = ids
    .map((id) => {
      const d = DAILY.find((x) => x.id === id);
      const ok = d && (PROF.daily.prog[id] || 0) >= d.n;
      if (ok && !PROF.daily.claimed[id]) ready++;
      return `<i class="${ok ? 'on' : ''}"></i>`;
    })
    .join('');
  const nx = new Date();
  nx.setHours(24, 0, 0, 0);
  const ms = nx - Date.now();
  const el = $('hDaily');
  el.innerHTML = `<b>Misiones</b><span class="dots">${dots}</span><small>${ready ? `¡${ready} por cobrar!` : `Nuevas en ${Math.floor(ms / 36e5)} h ${Math.floor((ms % 36e5) / 6e4)} min`}</small>`;
  el.onclick = () => {
    closeHome();
    openTab('misiones');
  };
}
async function homeRank() {
  const pod = $('hPod'),
    ol = $('hRank');
  const key = HOME.lb;
  document
    .querySelectorAll('#hLbTabs button')
    .forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === key ? 'true' : 'false'));
  let rows = null;
  if (NET.db) {
    if (!(Date.now() - HRANK_AT < 15000 && NET.board)) {
      HRANK_AT = Date.now();
    }
    rows = await loadBoard();
  }
  const mine = { id: NET.uid || 'me', score: PROF.best.score || 0, endless: PROF.best.endless || 0, god: PROF.god };
  let list = (rows || []).filter((r) => (+r[key] || 0) > 0);
  if (!list.some((r) => r.id === mine.id) && mine[key] > 0) list.push(mine);
  list.sort((a, b) => (+b[key] || 0) - (+a[key] || 0));
  const nm = (r) => (r.id === mine.id ? 'Tú' : nameOf(r.id, 'Jugador'));
  const gn = (r) => (GOD[r.god] ? GOD[r.god].name : '');
  pod.innerHTML = '';
  ol.innerHTML = '';
  if (!list.length) {
    pod.innerHTML = `<div class="lbempty">${NET.db ? 'Nadie ha puntuado todavía. ¡El primer puesto es tuyo!' : ready2() ? 'Entra con tu cuenta para competir con todos.' : 'Cargando…'}</div>`;
    return;
  }
  list.slice(0, 3).forEach((r, i) => {
    const d = document.createElement('div');
    d.className = `pod p${i + 1}${r.id === mine.id ? ' me' : ''}`;
    const c = document.createElement('canvas');
    d.appendChild(c);
    portrait(c, GOD[r.god] ? r.god : 'zeus', 52);
    d.insertAdjacentHTML(
      'beforeend',
      `<div><b>${esc(nm(r))}</b><small>${esc(gn(r))}</small></div><div class="sc">${fmtN(+r[key] || 0)}<small>puntos</small></div>`
    );
    pod.appendChild(d);
  });
  const rest = list.slice(3, 8);
  const mi = list.findIndex((r) => r.id === mine.id);
  if (mi >= 8) rest.push(list[mi]);
  for (const r of rest) {
    const i = list.indexOf(r);
    const li = document.createElement('li');
    li.className = r.id === mine.id ? 'me' : '';
    li.innerHTML = `<i>${i + 1}</i>`;
    const c = document.createElement('canvas');
    portrait(c, GOD[r.god] ? r.god : 'zeus', 28);
    li.appendChild(c);
    li.insertAdjacentHTML('beforeend', `<b>${esc(nm(r))}</b><em>${fmtN(+r[key] || 0)}</em>`);
    ol.appendChild(li);
  }
}
function ready2() {
  return NET.ready || NET.offline;
}
function closeHome() {
  $('home').hidden = true;
  $('menu').style.visibility = '';
  HOME.shown = false;
  openTab('jugar');
}
function openHome() {
  if (state !== 'menu') return;
  $('home').hidden = false;
  $('menu').style.visibility = 'hidden';
  HOME.shown = true;
  renderHome();
}
$('hEnter').onclick = () => {
  cfg.mode = 'ragnarok';
  closeHome();
};
$('logoHome').onclick = openHome;
$('hRankAll').onclick = () => {
  closeHome();
  openTab('ranking');
};
document.querySelectorAll('#hLbTabs button').forEach(
  (b) =>
    (b.onclick = () => {
      HOME.lb = b.dataset.v;
      homeRank();
    })
);
document.querySelectorAll('#home [data-mode],#home [data-party]').forEach(
  (b) =>
    (b.onclick = () => {
      if (b.dataset.mode) cfg.mode = b.dataset.mode;
      if (b.dataset.party) cfg.party = b.dataset.party;
      closeHome();
    })
);
document.querySelectorAll('#home .ts').forEach(
  (b) =>
    (b.onclick = () => {
      closeHome();
      openTab(b.dataset.tab);
    })
);
$('hGoogle').onclick = () => {
  if (window.SB_LOGIN) SB_LOGIN();
  else
    try {
      window.open('https://claude.ai/login', '_blank', 'noopener');
    } catch (err) {}
};
$('menu').style.visibility = 'hidden';
renderHome();
setTimeout(renderHome, 1500);
uiHome();
netInit();
function onAssetsReady() {
  try {
    uiHome();
    uiProfileChanged();
  } catch (err) {
    console.warn(err);
  }
  for (const k in ENI2) if (!ENI2[k]) delete ENI2[k];
  if (state === 'menu' && WORLD) {
    buildWorld(WORLD.rk);
    clearObjs();
  }
  updPlayBtn();
  if (UI && UI.tab === 'dioses' && typeof renderGods === 'function') renderGods();
}
{
  const iv = setInterval(() => {
    if (AS.ready || AS.failed) {
      clearInterval(iv);
    }
    updPlayBtn();
  }, 400);
}
asLoad();
