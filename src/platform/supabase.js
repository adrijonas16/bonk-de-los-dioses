/* Bonk de los Dioses · adaptador para jugar fuera de claude.ai (Supabase: Google, base de datos y salas) */

(function () {
  const CFG = window.SB_CONFIG || {};
  const sb =
    window.supabase && CFG.url && CFG.anonKey
      ? window.supabase.createClient(CFG.url, CFG.anonKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        })
      : null;
  window.SB = sb;
  let sessP = null;
  const session = () =>
    sessP ||
    (sessP = sb
      ? sb.auth
          .getSession()
          .then((r) => r.data.session)
          .catch(() => null)
      : Promise.resolve(null));
  const nameOfUser = (u) =>
    (u && u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) ||
    (u && u.email ? u.email.split('@')[0] : 'Jugador');
  window.SB_LOGIN = () => {
    if (!sb) {
      alert('Falta configurar Supabase (config.js).');
      return;
    }
    sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
  };
  window.SB_LOGOUT = async () => {
    if (!sb) return;
    await sb.auth.signOut();
    location.reload();
  };
  if (sb)
    sb.auth.onAuthStateChange((ev) => {
      if (ev === 'SIGNED_IN' && !window.__sbIn) {
        window.__sbIn = true;
      }
    });

  /* ---- user ---- */
  async function mkUser() {
    const s = await session();
    if (!s) return null;
    const u = s.user;
    try {
      await sb
        .from('profiles')
        .upsert({ id: u.id, name: nameOfUser(u), avatar: (u.user_metadata && u.user_metadata.avatar_url) || null });
    } catch (e) {}
    const cache = {};
    return Object.freeze({
      id: async () => u.id,
      me: async () => ({ id: u.id, name: nameOfUser(u), guest: false }),
      isOwner: () => false,
      canEdit: () => false,
      can: () => true,
      profiles: async (ids) => {
        const need = ids.filter((i) => !(i in cache));
        if (need.length) {
          const { data } = await sb.from('profiles').select('id,name').in('id', need);
          for (const r of data || []) cache[r.id] = { name: r.name || '' };
          for (const i of need) if (!cache[i]) cache[i] = { name: '' };
        }
        const out = {};
        for (const i of ids) out[i] = cache[i];
        return out;
      },
    });
  }

  /* ---- db (documentos tipo "coleccion/id") ---- */
  async function mkDb() {
    const s = await session();
    if (!s) return null;
    const parent = (p) => p.split('/').slice(0, -1).join('/');
    const doc = (path) => ({
      id: path.split('/').pop(),
      get: async () => {
        const { data, error } = await sb.from('docs').select('data').eq('path', path).maybeSingle();
        if (error) throw { code: error.code || 'db_error', message: error.message };
        return { exists: !!data, id: path.split('/').pop(), data: () => (data ? data.data : undefined) };
      },
      set: async (obj) => {
        const { error } = await sb
          .from('docs')
          .upsert({ path, coll: parent(path), owner: s.user.id, data: obj, updated_at: new Date().toISOString() });
        if (error) throw { code: error.code || 'db_error', message: error.message };
      },
    });
    const collection = (coll) => {
      let lim = 500;
      const q = {
        limit: (n) => {
          lim = n;
          return q;
        },
        get: async () => {
          const { data, error } = await sb.from('docs').select('path,data').eq('coll', coll).limit(lim);
          if (error) throw { code: error.code || 'db_error', message: error.message };
          return { docs: (data || []).map((r) => ({ id: r.path.split('/').pop(), data: () => r.data })) };
        },
        doc: (id) => doc(coll + '/' + id),
      };
      return q;
    };
    return Object.freeze({ doc, collection });
  }

  /* ---- room (presencia lenta + difusión rápida de posiciones) ---- */
  async function mkRoomNS() {
    const s = await session();
    if (!s) return null;
    const uid = s.user.id;
    const myPeer = uid.slice(0, 8) + '-' + Math.random().toString(36).slice(2, 8);
    const SLOW = ['god', 'host', 'phase', 'map', 'mode', 'diff', 'realm', 'st', 'v', 'code', 't0'];
    function room(name) {
      const ch = sb.channel('bonk:' + name, { config: { presence: { key: myPeer }, broadcast: { self: false } } });
      const cbs = [];
      const fast = {};
      let ready = null;
      let lastSlow = '';
      let lastFastT = 0,
        pend = null,
        timer = null;
      const emit = () => {
        const st = ch.presenceState();
        const peers = Object.entries(st).map(([k, arr]) => {
          const m = arr[arr.length - 1] || {};
          return {
            peer: k,
            by: m.by,
            isMe: k === myPeer,
            kind: 'viewer',
            guest: false,
            presence: Object.assign({}, m.p || {}, fast[k] || {}),
          };
        });
        for (const f of cbs)
          try {
            f({ peers });
          } catch (e) {
            console.warn(e);
          }
      };
      ch.on('presence', { event: 'sync' }, emit);
      ch.on('broadcast', { event: 'p' }, ({ payload }) => {
        if (!payload || !payload.k) return;
        fast[payload.k] = payload.p;
        emit();
      });
      ready = new Promise((res) =>
        ch.subscribe((st) => {
          if (st === 'SUBSCRIBED') res();
        })
      );
      const sendFast = () => {
        timer = null;
        if (!pend) return;
        lastFastT = Date.now();
        ch.send({ type: 'broadcast', event: 'p', payload: { k: myPeer, p: pend } });
        pend = null;
      };
      return Object.freeze({
        presence: async (p) => {
          await ready;
          const slow = {};
          for (const k of SLOW) if (k in p) slow[k] = p[k];
          const ss = JSON.stringify(slow);
          if (ss !== lastSlow) {
            lastSlow = ss;
            await ch.track({ by: uid, p: slow });
          }
          if (p.phase === 'run' || p.x !== undefined) {
            pend = p;
            const wait = Math.max(0, 120 - (Date.now() - lastFastT));
            if (!timer) timer = setTimeout(sendFast, wait);
          }
        },
        onPeers: (fn) => {
          cbs.push(fn);
          emit();
          return () => {
            const i = cbs.indexOf(fn);
            if (i >= 0) cbs.splice(i, 1);
          };
        },
        join: async (n) => {
          const r = room(name + '/' + n);
          await r._ready;
          return r;
        },
        leave: async () => {
          try {
            await ch.untrack();
          } catch (e) {}
          await sb.removeChannel(ch);
        },
        _ready: ready,
      });
    }
    const lobby = room('lobby');
    await lobby._ready;
    return lobby;
  }

  const made = {};
  window.claude = Object.freeze({
    use: (name) => {
      if (!sb) return Promise.resolve(null);
      if (!made[name])
        made[name] = (
          name === 'user' ? mkUser() : name === 'db' ? mkDb() : name === 'room' ? mkRoomNS() : Promise.resolve(null)
        ).catch((e) => {
          console.warn('sb', name, e);
          return null;
        });
      return made[name];
    },
  });
})();
