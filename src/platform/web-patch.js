/* Versión web: inicio de sesión con Google, perfil, amigos y enlaces de invitación */

(function () {
  const $id = (i) => document.getElementById(i);
  const params = new URLSearchParams(location.search);
  const linkCode = (params.get('amigo') || '').toUpperCase();
  const linkSala = (params.get('sala') || '').toLowerCase();
  const clearParams = () => history.replaceState(null, '', location.pathname);

  const g = $id('hGoogle');
  if (g) g.onclick = () => window.SB_LOGIN && SB_LOGIN();
  for (const el of [$id('hAcc'), $id('pname'), $id('pava')]) {
    if (!el) continue;
    el.style.cursor = 'pointer';
    el.title = 'Tu perfil';
    el.addEventListener('click', () => (NET.uid ? openProfile() : SB_LOGIN()));
  }

  const ov = $id('profileOv');
  const msg = (id, text, kind) => {
    const e = $id(id);
    e.textContent = text || '';
    e.className = 'pmsg' + (kind ? ' ' + kind : '');
  };
  const copy = (text, btn) =>
    navigator.clipboard.writeText(text).then(
      () => {
        const t = btn.textContent;
        btn.textContent = '¡Copiado!';
        setTimeout(() => (btn.textContent = t), 1400);
      },
      () => prompt('Copia esto:', text)
    );
  let me = null;

  async function openProfile(prefillCode) {
    if (!window.SBX || !NET.uid) return;
    ov.hidden = false;
    me = await SBX.myProfile();
    const name = (me && me.name) || NET.myName || 'Jugador';
    $id('pfName').textContent = name;
    $id('pfNameIn').value = name;
    $id('pfAv').textContent = name.slice(0, 1).toUpperCase();
    if (me && me.avatar) {
      $id('pfAv').style.backgroundImage = `url("${me.avatar}")`;
      $id('pfAv').textContent = '';
    }
    $id('pfSub').textContent = `${PROF.owned.length} dioses · récord ${fmtN(PROF.best.score || 0)}`;
    $id('pfCode').textContent = (me && me.code) || '······';
    if (prefillCode) $id('pfAddIn').value = prefillCode;
    msg('pfNameMsg');
    msg('pfAddMsg');
    renderFriends();
  }
  window.openProfile = openProfile;

  async function renderFriends() {
    const ul = $id('pfList'),
      req = $id('pfReq');
    ul.innerHTML = '<li><small>Cargando…</small></li>';
    let f;
    try {
      f = await SBX.friends();
    } catch (e) {
      ul.innerHTML = '<li><small>No se pudo cargar la lista.</small></li>';
      return;
    }
    const online = new Map();
    for (const p of NET.lobby || []) if (p.by) online.set(p.by, p.presence || {});
    const row = (p, mine) => {
      const pr = online.get(p.id);
      const sala = pr && pr.host && pr.host.open ? pr.host.code : '';
      const li = document.createElement('li');
      li.innerHTML = `<span class="dot${pr ? ' on' : ''}"></span><b></b><small>${pr ? (pr.st === 'run' ? 'jugando' : 'en línea') : 'desconectado'}</small>`;
      li.querySelector('b').textContent = p.name || 'Jugador';
      if (sala) {
        const b = document.createElement('button');
        b.className = 'btn sm green';
        b.textContent = 'Unirme';
        b.onclick = () => joinFriendRoom(sala);
        li.appendChild(b);
      }
      const b2 = document.createElement('button');
      b2.className = 'btn sm' + (mine ? '' : ' blue');
      b2.textContent = mine ? 'Quitar' : 'Añadir';
      b2.onclick = async () => {
        try {
          if (mine) await SBX.removeFriend(p.id);
          else await SBX.addFriend(p.id);
        } catch (e) {}
        renderFriends();
      };
      li.appendChild(b2);
      return li;
    };
    ul.innerHTML = '';
    if (!f.mine.length) ul.innerHTML = '<li><small>Todavía no tienes amigos. Comparte tu código.</small></li>';
    for (const p of f.mine) ul.appendChild(row(p, true));
    $id('pfReqBox').hidden = !f.requests.length;
    req.innerHTML = '';
    for (const p of f.requests) req.appendChild(row(p, false));
  }

  function joinFriendRoom(code) {
    ov.hidden = true;
    if (typeof closeHome === 'function' && !$id('home').hidden) closeHome();
    cfg.party = 'online';
    openTab('jugar');
    joinSala(code, false).then((m) => {
      UI.msg = m;
      renderOnline();
      updPlayBtn();
    });
  }

  $id('pfClose').onclick = () => (ov.hidden = true);
  ov.addEventListener('click', (e) => {
    if (e.target === ov) ov.hidden = true;
  });
  $id('pfSave').onclick = async () => {
    try {
      const n = await SBX.setName($id('pfNameIn').value);
      NET.myName = n;
      NET.names[NET.uid] = n;
      $id('pfName').textContent = n;
      msg('pfNameMsg', 'Nombre guardado.', 'ok');
      uiProfileChanged();
      if (typeof renderHome === 'function') renderHome();
    } catch (e) {
      msg('pfNameMsg', e.message || 'No se pudo guardar.', 'err');
    }
  };
  $id('pfCopyCode').onclick = (e) => me && me.code && copy(me.code, e.target);
  $id('pfCopyLink').onclick = (e) => me && me.code && copy(`${location.origin}/?amigo=${me.code}`, e.target);
  $id('pfAdd').onclick = async () => {
    const check = checkFriendCode($id('pfAddIn').value);
    if (!check.ok) return msg('pfAddMsg', check.msg, 'err');
    const code = check.value;
    if (me && code === me.code) return msg('pfAddMsg', 'Ese es tu propio código.', 'err');
    try {
      const p = await SBX.findByCode(code);
      if (!p) return msg('pfAddMsg', 'No existe ningún jugador con ese código.', 'err');
      await SBX.addFriend(p.id);
      $id('pfAddIn').value = '';
      msg('pfAddMsg', `${p.name || 'Jugador'} añadido a tus amigos.`, 'ok');
      renderFriends();
    } catch (e) {
      msg('pfAddMsg', e.message || 'No se pudo añadir.', 'err');
    }
  };
  $id('pfInvite').onclick = async (e) => {
    let code = NET.sala ? NET.code : '';
    if (!code) {
      code = randCode();
      const m = await joinSala(code, true);
      if (m) return alert(m);
      cfg.party = 'online';
    }
    copy(`${location.origin}/?sala=${code}`, e.target);
  };
  $id('pfLogout').onclick = () => SB_LOGOUT();
  // dos pulsaciones para borrar: evita borrados por accidente sin usar diálogos del navegador
  let deleteArmed = 0;
  $id('pfDelete').onclick = async () => {
    if (Date.now() - deleteArmed > 6000) {
      deleteArmed = Date.now();
      $id('pfDelete').textContent = 'Pulsa otra vez para borrar todo (no se puede deshacer)';
      return;
    }
    $id('pfDelete').disabled = true;
    msg('pfDelMsg', 'Borrando…');
    try {
      await SBX.deleteAccount();
      msg('pfDelMsg', 'Cuenta borrada.', 'ok');
      setTimeout(() => location.replace('/'), 800);
    } catch (e) {
      $id('pfDelete').disabled = false;
      msg('pfDelMsg', (e && e.message) || 'No se pudo borrar la cuenta.', 'err');
    }
  };

  // enlaces ?amigo=CODIGO y ?sala=CODIGO: se usan cuando el jugador ya inició sesión
  if (linkCode || linkSala) {
    const t0 = Date.now();
    const wait = () => {
      if (NET.ready && document.body.classList.contains('booting') === false) {
        if (!NET.uid) {
          if (confirm('Para usar esta invitación tienes que entrar con Google. ¿Entrar ahora?')) SB_LOGIN();
          else clearParams();
          return;
        }
        clearParams();
        if (linkCode) openProfile(linkCode);
        else if (linkSala) joinFriendRoom(linkSala);
        return;
      }
      if (Date.now() - t0 < 60000) setTimeout(wait, 300);
    };
    wait();
  }
})();
