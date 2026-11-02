/* ---------- conexión con la plataforma ---------- */
async function netInit() {
  for (let i = 0; i < 40 && !(window.claude && window.claude.use); i++) await new Promise((r) => setTimeout(r, 250));
  if (!(window.claude && window.claude.use)) {
    NET.offline = true;
    uiNet();
    return;
  }
  try {
    NET.user = await window.claude.use('user');
  } catch (err) {}
  if (NET.user) {
    try {
      NET.uid = await NET.user.id();
      const me = await NET.user.me();
      NET.myName = (me && me.name) || '';
    } catch (err) {}
  }
  try {
    NET.db = await window.claude.use('db');
  } catch (err) {}
  if (NET.db && NET.uid) {
    try {
      const s = await NET.db.doc(`data/users/${NET.uid}/main`).get();
      if (s.exists) {
        const d = s.data();
        if ((d.at || 0) > (PROF.at || 0)) PROF = Object.assign(freshProfile(), JSON.parse(JSON.stringify(d)));
        else saveProfile();
      } else saveProfile();
    } catch (err) {
      console.warn('perfil remoto', err && err.code);
    }
  }
  try {
    NET.room = await window.claude.use('room');
  } catch (err) {}
  if (NET.room) {
    NET.room.onPeers(
      (ch) => {
        NET.lobby = ch.peers;
        lobbyChanged();
      },
      () => {}
    );
    lobbyPresence();
  }
  NET.ready = true;
  uiProfileChanged();
  uiNet();
}
function lobbyPresence(extra) {
  if (!NET.room) return;
  const p = { st: state === 'play' || state === 'pause' || state === 'levelup' ? 'run' : 'menu', god: PROF.god, v: 1 };
  if (NET.sala && NET.isHost)
    p.host = { code: NET.code, map: cfg.realm, mode: cfg.mode, n: NET.salaPeers.length || 1, open: !NET.inRun };
  else p.host = null;
  Object.assign(p, extra || {});
  NET.room.presence(p).catch(() => {});
}
function lobbyChanged() {
  NET.online = NET.lobby.filter((p) => p.kind === 'viewer').length;
  NET.salas = NET.lobby
    .filter((p) => !p.isMe && p.presence && p.presence.host && p.presence.host.open)
    .map((p) => ({
      code: String(p.presence.host.code || ''),
      map: String(p.presence.host.map || ''),
      mode: String(p.presence.host.mode || ''),
      n: +p.presence.host.n || 1,
      by: p.by,
      god: String(p.presence.god || ''),
    }))
    .filter((s) => /^[a-z0-9]{4,8}$/.test(s.code) && REALMS[s.map]);
  resolveNames(NET.lobby.map((p) => p.by));
  uiNet();
}
async function resolveNames(ids) {
  ids = [...new Set(ids.filter(Boolean))].filter((id) => !(id in NET.names));
  if (!ids.length || !NET.user) return;
  try {
    const ps = await NET.user.profiles(ids);
    for (const id of ids) NET.names[id] = (ps[id] && ps[id].name) || '';
    uiNet();
  } catch (err) {}
}
function nameOf(by, fallback) {
  return (by && NET.names[by]) || fallback || 'Jugador';
}
