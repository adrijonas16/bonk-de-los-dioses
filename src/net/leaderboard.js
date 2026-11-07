/* ---------- clasificación ---------- */
function runScore(win) {
  return Math.round(
    (G.score || 0) + (win ? 100000 * ((typeof SC_DIFF !== 'undefined' && SC_DIFF[G.diffKey]) || 1) : 0)
  );
}
async function submitScore(win) {
  const sc = runScore(win),
    best = PROF.best;
  let changed = false;
  if (G.mode === 'libre') {
    if (sc > (best.endless || 0)) {
      best.endless = sc;
      changed = true;
    }
    const bm = best.byMap[G.visited[0]] || 0;
    if (sc > bm) {
      best.byMap[G.visited[0]] = sc;
      changed = true;
    }
  } else {
    if (sc > best.score) {
      best.score = sc;
      changed = true;
    }
    for (const k of G.visited) {
      const v = (G.mapScore && G.mapScore[k]) || 0;
      if (v > (best.byMap[k] || 0)) {
        best.byMap[k] = v;
        changed = true;
      }
    }
  }
  saveProfile();
  if (NET.db && NET.uid) {
    try {
      await NET.db.doc(`scores/${NET.uid}`).set({
        score: best.score || 0,
        endless: best.endless || 0,
        byMap: best.byMap,
        god: PROF.god,
        clan: PROF.clan || '',
        at: Date.now(),
      });
      NET.boardAt = 0;
    } catch (err) {
      console.warn('score', err && err.code);
    }
  }
  return { sc, changed };
}
async function loadBoard(force) {
  if (!NET.db) return null;
  if (!force && NET.board && Date.now() - NET.boardAt < 20000) return NET.board;
  try {
    const q = await NET.db.collection('scores').limit(500).get();
    NET.board = q.docs.map((d) => Object.assign({ id: d.id }, d.data()));
    NET.boardAt = Date.now();
    resolveNames(NET.board.map((r) => r.id));
    return NET.board;
  } catch (err) {
    console.warn('board', err && err.code);
    return null;
  }
}
async function setClan(name) {
  PROF.clan = cleanText(name, 20);
  saveProfile();
  if (NET.db && NET.uid) {
    try {
      const s = await NET.db.doc(`scores/${NET.uid}`).get();
      const d = s.exists ? s.data() : { score: 0, endless: 0, byMap: {} };
      await NET.db
        .doc(`scores/${NET.uid}`)
        .set(Object.assign({}, d, { clan: PROF.clan, god: PROF.god, at: Date.now() }));
      NET.boardAt = 0;
    } catch (err) {}
  }
}
