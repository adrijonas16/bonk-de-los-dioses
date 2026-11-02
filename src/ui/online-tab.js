/* ---- Online ---- */
function renderOnline() {
  if (cfg.party !== 'online' || state !== 'menu') return;
  const box = $('onlineBox');
  if (!NET.room) {
    box.innerHTML = `<div class="note">Inicia sesión (botón de la portada) para jugar online con tus amigos.</div>`;
    updPlayBtn();
    return;
  }
  if (NET.sala) {
    const rows = NET.salaPeers
      .filter((p) => p.kind === 'viewer')
      .map((p) => {
        const pr = p.presence || {};
        const gd = GOD[pr.god] ? GOD[pr.god] : null;
        return `<li><span class="dot" style="background:${pr.host ? '#ffb020' : '#3ccf6e'}"></span><b>${esc(p.isMe ? 'Tú' : nameOf(p.by, 'Jugador'))}</b><span>${gd ? esc(gd.name) : '—'}</span>${pr.host ? '<span class="pill">Anfitrión</span>' : ''}${p.guest ? '<span class="pill g">Invitado</span>' : ''}</li>`;
      })
      .join('');
    const h = salaHost();
    const mapTxt = NET.isHost
      ? REALMS[cfg.realm].name
      : h
        ? REALMS[h.presence.map]
          ? REALMS[h.presence.map].name
          : ''
        : '';
    box.innerHTML = `<div class="sala"><div class="salah"><span>Sala</span><b class="code">${esc(NET.code.toUpperCase())}</b><button class="btn sm" id="copyCode">Copiar código</button><button class="btn sm red" id="leaveSala">Salir</button></div>
      <p class="mut">${NET.isHost ? 'Tú eliges mapa y modo. Pulsa EMPEZAR cuando estéis todos.' : `Mapa: ${esc(mapTxt)} · El anfitrión empezará la partida.`}</p><ul class="plist">${rows}</ul></div>`;
    $('leaveSala').onclick = () => leaveSala();
    $('copyCode').onclick = () => {
      navigator.clipboard
        .writeText(NET.code.toUpperCase())
        .then(() => {
          $('copyCode').textContent = 'Copiado';
        })
        .catch(() => {
          $('copyCode').textContent = NET.code.toUpperCase();
        });
    };
  } else {
    const open =
      NET.salas
        .map(
          (s) =>
            `<li><span class="dot"></span><b>${esc(nameOf(s.by, 'Jugador'))}</b><span>${esc(REALMS[s.map].name)} · ${s.mode === 'libre' ? 'Supervivencia' : 'Clásico'} · ${s.n} jug.</span><button class="btn sm green" data-join="${esc(s.code)}">Unirme</button></li>`
        )
        .join('') || '<li class="mut">No hay salas abiertas ahora mismo.</li>';
    box.innerHTML = `<div class="sala"><div class="row"><button class="btn green" id="mkSala">Crear sala</button><input id="codeIn" maxlength="8" placeholder="Código" autocomplete="off"><button class="btn" id="joinSala">Unirme</button></div>${UI.msg ? `<p class="err">${esc(UI.msg)}</p>` : ''}<div class="sub">Salas abiertas</div><ul class="plist">${open}</ul></div>`;
    $('mkSala').onclick = async () => {
      UI.msg = await joinSala(randCode(), true);
      renderOnline();
      updPlayBtn();
    };
    $('joinSala').onclick = async () => {
      UI.msg = await joinSala($('codeIn').value, false);
      renderOnline();
      updPlayBtn();
    };
    box.querySelectorAll('[data-join]').forEach(
      (b) =>
        (b.onclick = async () => {
          UI.msg = await joinSala(b.dataset.join, false);
          renderOnline();
          updPlayBtn();
        })
    );
  }
  updPlayBtn();
}
