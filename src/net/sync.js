/* ---------- sincronización durante la partida ---------- */
function netTick(dt) {
  if (!NET.sala || !NET.inRun || !G) return;
  const p = players[0];
  if (!p) return;
  const now = performance.now();
  if (now - NET.lastSend > 66) {
    NET.lastSend = now;
    const w = {};
    for (const k in p.weapons) w[k] = p.weapons[k].lvl;
    salaPresence({
      phase: 'run',
      realm: G.realm,
      ridx: G.ridx,
      mode: G.mode,
      x: Math.round(p.x),
      y: Math.round(p.y),
      z: Math.round(p.z),
      fx: +p.fx.toFixed(2),
      fy: +p.fy.toFixed(2),
      hp: Math.round(p.hp),
      mhp: Math.round(p.maxHp),
      dn: p.down,
      lv: G.level,
      w,
      pw: p.powSeq || 0,
      mv: p.moving,
      hd: p.hidden > 0,
      gi: p.giant > 0,
      em: p.emote || '',
      emT: p.emoteT || 0,
    });
  }
  // reflejar a los demás
  const seen = new Set();
  for (const peer of NET.salaPeers) {
    if (peer.isMe || peer.kind !== 'viewer') continue;
    const ps = peer.presence || {};
    if (ps.phase !== 'run' || !GOD[ps.god]) continue;
    seen.add(peer.peer);
    let r = remotes.find((q) => q.peer === peer.peer);
    if (!r) {
      r = makePlayer(String(ps.god), 'net', 2 + remotes.length);
      r.peer = peer.peer;
      r.by = peer.by;
      r.x = +ps.x || 0;
      r.y = +ps.y || 0;
      r.z = +ps.z || 0;
      r.powSeq = +ps.pw || 0;
      r.col = '#7dffb0';
      remotes.push(r);
    }
    r.realm = String(ps.realm || '');
    r.ridx = +ps.ridx || 0;
    r.tx = +ps.x || 0;
    r.ty = +ps.y || 0;
    r.tz = +ps.z || 0;
    r.fx = +ps.fx || 0;
    r.fy = +ps.fy || -1;
    r.hp = +ps.hp || 0;
    r.maxHp = +ps.mhp || 100;
    r.dn = !!ps.dn;
    r.down = r.dn;
    r.moving = !!ps.mv;
    r.hidden = ps.hd ? 1 : 0;
    r.giant = ps.gi ? 1 : 0;
    r.lvl = +ps.lv || 1;
    r.name = nameOf(peer.by, GOD[ps.god].name);
    const w = ps.w && typeof ps.w === 'object' ? ps.w : {};
    for (const k in w) {
      if (!WEAPONS[k]) continue;
      const l = clamp(+w[k] || 1, 1, 7);
      if (!r.weapons[k]) r.weapons[k] = { lvl: l, t: 0.5, ang: 0, tick: 0, acc: 0 };
      else r.weapons[k].lvl = l;
    }
    r.dmgMul = 1 + (r.lvl - 1) * 0.04;
    const seq = +ps.pw || 0;
    if (seq > r.powSeq) {
      r.powSeq = seq;
      if (r.realm === G.realm && !r.dn) {
        r.pow = 0;
        const st = state;
        usePower(r);
      }
    }
    if (ps.em && ps.emT !== r.emT) {
      r.emT = ps.emT;
      say(r, String(ps.em).slice(0, 40));
    }
  }
  remotes = remotes.filter((r) => seen.has(r.peer));
  // seguir al grupo a otro reino
  const ahead = remotes.find((r) => r.ridx > G.ridx && REALMS[r.realm] && !r.dn);
  if (ahead && state === 'play') {
    G.ridx = ahead.ridx;
    startRealm(ahead.realm);
    bigBanner('TU GRUPO CRUZÓ EL PORTAL', `Te reúnes con ${ahead.name} en ${REALMS[ahead.realm].name}`);
  }
}
function updRemotes(dt) {
  for (const r of remotes) {
    const k = Math.min(1, dt * 12);
    r.x += (r.tx - r.x) * k;
    r.y += (r.ty - r.y) * k;
    r.z += (r.tz - r.z) * k;
    r.step += r.moving ? dt * 8 : 0;
    r.sayT -= dt;
    r.inv = 0;
    if (r.realm === G.realm && !r.dn) fireWeapons(r, dt);
  }
}
function remotesHere() {
  return G ? remotes.filter((r) => r.realm === G.realm) : [];
}
