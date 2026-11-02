/* ---------- interfaz ---------- */
function carrierTag(p) {
  return players.length > 1 && p ? ` (${p.ctrl === 'p2' ? 'J2' : 'J1'})` : '';
}
function qObjective(A) {
  const q = G.q;
  switch (A.id) {
    case 'ladron': {
      const pct = A.e ? A.e.hp / A.e.maxHp : 0;
      return { t: `Atrapa a Atoq · ${Math.ceil(Math.max(0, A.left))} s`, pct: 1 - pct };
    }
    case 'llama':
      if (A.carrier && A.weak != null)
        return {
          t: `BRASA${carrierTag(A.carrier)}: llévala a un tambo · ${Math.ceil(A.weak)} s`,
          pct: A.weak / Q_EMBER,
          cls: 'ember',
        };
      if (A.carrier)
        return {
          t:
            (A.storm > 0
              ? '¡Ventisca! Refúgiate'
              : A.warn > 0
                ? `Ventisca en ${Math.ceil(A.warn)} s`
                : `Braseros ${A.lit}/${q.braz.length}`) +
            ` · llama ${Math.round(A.f)} %` +
            carrierTag(A.carrier),
          pct: A.f / 100,
          warn: A.storm > 0 || A.warn > 0,
        };
      return {
        t: A.ember ? `BRASA en el suelo: recógela · ${Math.ceil(A.ember.t)} s` : '',
        pct: A.ember ? A.ember.t / Q_EMBER : 0,
        cls: 'ember',
      };
    case 'sellos': {
      const left = sealsLeft();
      return {
        t: `Sellos rotos ${3 - left}/3 · coraza ${left ? '35 %' : 'rota'} · ${Math.ceil(A.left)} s`,
        pct: (3 - left) / 3,
      };
    }
    case 'favor':
      return {
        t: A.carrier
          ? `Lleva la Illa al altar${carrierTag(A.carrier)} · ${Math.round(Math.hypot(A.carrier.x - A.a.x, A.carrier.y - A.a.y) / 10)} m`
          : A.t > 1 && A.stalker && !A.stalker.dead
            ? '¡Recupera la Illa! (vigilada)'
            : 'Busca la Illa (haz de luz dorada)',
        pct: A.carrier ? 0.5 : 0,
      };
  }
  return { t: '', pct: 0 };
}
function questsHud() {
  const q = G.q,
    box = $('qHud'),
    of = $('qOffer');
  if (!box) return;
  const rows =
    q.active
      .map((A) => {
        const inf = qInfo(A.a),
          o = qObjective(A);
        return `<div class="qrow${o.warn ? ' warn' : ''}${o.cls ? ' ' + o.cls : ''}" style="--qc:${inf.col}"><span class="qi">${o.cls === 'ember' ? '♨' : inf.icon}</span><div class="qtx"><b>${esc(inf.name)}</b><small>${esc(o.t)}</small><div class="qbar"><i style="width:${Math.round(clamp(o.pct, 0, 1) * 100)}%"></i></div></div></div>`;
      })
      .join('') +
    q.recent
      .map(
        (r) =>
          `<div class="qrow ${r.ok ? 'ok' : 'fail'}" style="--qc:${r.col}"><span class="qi">${r.ok ? '✔' : '✖'}</span><div class="qtx"><b>${esc(r.name)}</b><small>${esc(r.txt)}</small></div></div>`
      )
      .join('');
  if (q.hudK !== rows) {
    q.hudK = rows;
    box.innerHTML = rows;
    box.hidden = !rows;
  }
  const a = q.offer,
    ok = a ? a.id + (q.active.length >= QMAX) + q.offerBlocked + (q.offerP && q.offerP.god) : '';
  if (q.offK !== ok) {
    q.offK = ok;
    if (!a) {
      of.hidden = true;
    } else {
      const inf = qInfo(a);
      of.style.setProperty('--qc', inf.col);
      const act =
        q.active.length >= QMAX
          ? '<em>Ya llevas 2 encargos: termina o abandona uno (pausa)</em>'
          : q.offerBlocked
            ? '<em>Hay otro objeto al lado: apártate un poco para aceptar</em>'
            : `<button class="btn green" id="qAcc">${isTouch ? 'Aceptar' : 'E · Aceptar'}</button>`;
      of.innerHTML = `<div class="qoh"><span class="qi">${inf.icon}</span><b>${esc(inf.name)}</b><small>Encargo opcional</small></div><p>${esc(inf.give)}</p><div class="qrr"><span class="rw">Recompensa</span>${esc(inf.rew)}</div><div class="qrr"><span class="rk">Riesgo</span>${esc(inf.risk)}</div>
      ${G.online ? '<div class="qmeta">Online: este encargo es solo tuyo; tu compañero tiene sus propios encargos y no se comparten.</div>' : players.length > 1 ? '<div class="qmeta">Cooperativo local: el encargo y su recompensa son de los dos.</div>' : ''}
      <div class="qact">${act}<span>Aléjate para ignorarlo</span></div>`;
      of.hidden = false;
      const b = $('qAcc');
      if (b)
        b.onclick = () => {
          if (G && G.q && G.q.offer && !G.q.offerBlocked) questAccept(G.q.offer, G.q.offerP || players[0]);
          focusGame();
        };
    }
  }
}
function renderQuestPause() {
  let box = $('psQuests');
  const host = $('psItems') && $('psItems').parentElement;
  if (!box && host) {
    host.insertAdjacentHTML(
      'beforeend',
      '<div class="hdr h-theme" style="border-radius:0"><span>Encargos</span><small>máx. 2</small></div><div class="body" id="psQuests"></div>'
    );
    box = $('psQuests');
  }
  if (!box) return;
  const q = G && G.q;
  const fxs = [];
  if (G && G.qfx) {
    if (G.qfx.fire) fxs.push('🔥 Fuego de Inti: tus golpes queman');
    if (G.qfx.favor) {
      const F = FAVORS[G.qfx.favor.fid || 'tormenta'];
      fxs.push(
        `${F.icon} Favor de ${GOD[G.qfx.favor.by].name}: ${F.title.toLowerCase()} · cuenta como 1 de las 3 fuentes del ${CONCILIOS[F.tag].name} (no es un arma)`
      );
    }
  }
  box.innerHTML =
    (q && q.active.length
      ? q.active
          .map((A, i) => {
            const inf = qInfo(A.a);
            return `<div class="irow"><span class="iem">${inf.icon}</span><div><b>${esc(inf.name)}</b><p>${esc(qObjective(A).t)}</p></div><button class="btn red" data-qi="${i}">Abandonar</button></div>`;
          })
          .join('')
      : `<p class="mut">${q && q.anch.length ? 'Sin encargos activos. Búscalos en el minimapa (rombos de colores).' : 'No hay encargos en este reino.'}</p>`) +
    (fxs.length ? `<p style="margin-top:8px;font-weight:800">${fxs.map(esc).join('<br>')}</p>` : '') +
    (G && G.online ? '<p class="mut" style="margin-top:6px">Online: cada jugador tiene sus propios encargos.</p>' : '');
  box.querySelectorAll('button[data-qi]').forEach(
    (b) =>
      (b.onclick = () => {
        const A = G.q.active[+b.dataset.qi];
        if (A) questAbandon(A);
        renderQuestPause();
      })
  );
}
{
  const sel = document.getElementById('qTestSel');
  if (sel) {
    sel.value = cfg.qTest || 'azar';
    sel.onchange = () => {
      cfg.qTest = sel.value;
    };
  }
}
