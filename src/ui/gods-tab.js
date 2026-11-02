/* ---- Dioses ---- */
const PANS = ['Todos', ...new Set(GODS.map((g) => g.pan))];
function renderGods() {
  const pf = $('gpans');
  pf.innerHTML = '';
  for (const pn of PANS) {
    const b = document.createElement('button');
    b.className = 'chipb';
    b.textContent = pn;
    b.setAttribute('aria-pressed', pn === UI.pan ? 'true' : 'false');
    b.onclick = () => {
      UI.pan = pn;
      renderGods();
    };
    pf.appendChild(b);
  }
  const gr = $('ggrid');
  const keep = gr.scrollTop;
  gr.innerHTML = '';
  for (const g of GODS) {
    if (UI.pan !== 'Todos' && g.pan !== UI.pan) continue;
    const own = owns(g.id);
    const b = document.createElement('button');
    b.className = 'gcard' + (g.id === UI.sel ? ' sel' : '') + (own ? '' : ' locked') + (g.id === PROF.god ? ' eq' : '');
    b.id = 'g-' + g.id;
    const c = document.createElement('canvas');
    portrait(c, g.id, 72);
    b.appendChild(c);
    b.insertAdjacentHTML(
      'beforeend',
      `<span class="gn">${esc(g.name)}</span><span class="gp">${esc(g.pan)}</span>${own ? (g.id === PROF.god ? '<span class="tagb eq">Equipado</span>' : '') : SECRET_GODS[g.id] ? '<span class="tagb secret">Secreto</span>' : `<span class="tagb price"><i class="cn"></i>${GOD_PRICE(g.id)}</span>`}`
    );
    b.onclick = () => {
      UI.sel = g.id;
      renderGods();
    };
    if (own)
      b.ondblclick = () => {
        UI.sel = g.id;
        PROF.god = g.id;
        saveProfile();
        lobbyPresence();
        uiProfileChanged();
        openTab('jugar');
      };
    gr.appendChild(b);
  }
  gr.scrollTop = keep;
  const g = GOD[UI.sel],
    w = WEAPONS[g.w],
    own = owns(g.id),
    price = GOD_PRICE(g.id);
  applyTheme(g.pan);
  fullSprite($('gdetCv'), g.id, 2);
  $('gdetName').textContent = g.name;
  $('gdetPan').textContent = g.pan;
  $('gdetTitle').textContent = g.title;
  const rels = REL.filter((r) => r[0] === g.id || r[1] === g.id)
    .map((r) => {
      const o = GOD[r[0] === g.id ? r[1] : r[0]];
      return `<span class="pill ${r[2]}">${r[2] === 'rival' ? 'Rival' : 'Aliado'}: ${esc(o.name)}</span>`;
    })
    .join(' ');
  $('gdetInfo').innerHTML =
    `<div><b>Arma</b>${esc(w.name)}: ${esc(w.desc)}</div><div><b>Poder</b>${esc(g.pn)}: ${esc(g.pd)}</div><div><b>Don</b>${esc(g.bd)}</div><div><b>Vida</b>${g.hp} · <b>Velocidad</b>${g.spd}${g.tag ? ` · <b>Concilio</b>${esc(CONCILIOS[g.tag].name)}` : ''}</div>${rels ? `<div class="rels">${rels}</div>` : ''}`;
  const bt = $('gdetBtn');
  if (own) {
    bt.textContent = g.id === PROF.god ? 'Ir a jugar ▶' : 'Elegir y jugar ▶';
    bt.disabled = false;
    bt.className = 'btn green big';
    bt.onclick = () => {
      if (PROF.god !== g.id) {
        PROF.god = g.id;
        saveProfile();
        lobbyPresence();
        uiProfileChanged();
      }
      openTab('jugar');
      window.scrollTo && window.scrollTo(0, 0);
    };
  } else if (SECRET_GODS[g.id]) {
    bt.textContent = 'Dios secreto';
    bt.disabled = true;
    bt.className = 'btn big';
    $('gdetNote').textContent = 'Cómo desbloquearlo: ' + SECRET_GODS[g.id].req + '.';
    return;
  } else {
    bt.innerHTML = `Comprar por <i class="cn"></i>${price}`;
    bt.disabled = PROF.coins < price;
    bt.className = 'btn gold big';
    bt.onclick = () => {
      if (buyGod(g.id)) {
        PROF.god = g.id;
        saveProfile();
        lobbyPresence();
        uiProfileChanged();
        openTab('jugar');
      }
    };
  }
  $('gdetNote').textContent = own
    ? ''
    : PROF.coins < price
      ? `Te faltan ${price - PROF.coins} dracmas. Ganas dracmas en cada partida y con las misiones.`
      : '';
}
