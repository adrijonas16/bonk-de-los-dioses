/* ---------- salas ---------- */
function randCode() {
  const a = 'abcdefghjkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}
async function joinSala(code, host) {
  if (!NET.room) return 'Sin conexión: inicia sesión para jugar online.';
  const check = checkRoomCode(code);
  if (!check.ok) return check.msg;
  code = check.value;
  await leaveSala();
  try {
    NET.sala = await NET.room.join('sala-' + code);
  } catch (err) {
    return 'No se pudo entrar a la sala (' + ((err && err.code) || 'error') + ').';
  }
  NET.code = code;
  NET.isHost = !!host;
  NET.inRun = false;
  NET.sala.onPeers(
    (ch) => {
      NET.salaPeers = ch.peers;
      resolveNames(ch.peers.map((p) => p.by));
      salaChanged();
    },
    () => {}
  );
  salaPresence({ phase: 'lobby' });
  lobbyPresence();
  uiNet();
  return '';
}
async function leaveSala() {
  if (NET.sala) {
    try {
      await NET.sala.leave();
    } catch (err) {}
  }
  NET.sala = null;
  NET.code = '';
  NET.salaPeers = [];
  NET.isHost = false;
  NET.inRun = false;
  remotes = [];
  lobbyPresence();
  uiNet();
}
function salaPresence(patch) {
  if (!NET.sala) return;
  const p = Object.assign({ god: PROF.god, host: NET.isHost, map: cfg.realm, mode: cfg.mode, diff: cfg.diff }, patch);
  NET.sala.presence(p).catch(() => {});
}
function salaHost() {
  return NET.salaPeers.find((p) => p.presence && p.presence.host && !p.isMe);
}
function salaChanged() {
  const h = salaHost();
  if (!NET.isHost && h && h.presence.phase === 'run' && !NET.inRun && state === 'menu') {
    const map = String(h.presence.realm || h.presence.map);
    if (REALMS[map]) {
      cfg.realm = map;
      cfg.mode = h.presence.mode === 'libre' ? 'libre' : 'ragnarok';
      cfg.diff = DIFF[h.presence.diff] ? h.presence.diff : 'normal';
      startOnline();
    }
  }
  if (!NET.isHost && !h && NET.salaPeers.length && state === 'menu') {
    /* el anfitrión salió */
  }
  uiNet();
}
function hostStart() {
  if (!NET.sala || !NET.isHost) return;
  salaPresence({ phase: 'run', realm: cfg.realm, mode: cfg.mode, diff: cfg.diff, t0: Date.now() });
  startOnline();
}
function startOnline() {
  NET.inRun = true;
  cfg.party = 'online';
  cfg.picks = [{ id: PROF.god, ctrl: 'p1' }];
  newRun();
  lobbyPresence();
  dailyAdd('d_online', 1);
}
