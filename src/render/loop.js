/* ---------- bucle ---------- */
let last = performance.now(),
  menuRealm = 'cielo',
  menuT = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  T += dt;
  try {
    const live = G && (state === 'play' || ((state === 'pause' || state === 'levelup') && NET.inRun));
    if (live) update(dt);
    netTick(dt);
    if (G && (state === 'play' || state === 'levelup' || state === 'pause' || state === 'end') && WORLD) {
      hudTick();
      updCamera(dt, false);
      renderGame(dt);
    } else if (WORLD) {
      menuT += dt;
      if (menuT > 40 && !PREV_BUSY) {
        menuT = 0;
        const ks = Object.keys(REALMS);
        menuRealm = ks[(ks.indexOf(menuRealm) + 1) % ks.length];
        buildWorld(menuRealm);
        clearObjs();
      }
      updCamera(dt, true);
      updWeather(dt, 0, 0);
      sunFollow(0, 0);
      animWater();
      if (WORLD.hazTex) {
        WORLD.hazTex.offset.x = T * 0.01;
      }
      if (WORLD.aurora)
        WORLD.aurora.forEach((m, i) => {
          m.material.opacity = 0.12 + 0.08 * Math.sin(T * 0.5 + i);
        });
    }
    if (renderer && WORLD && !PREV_BUSY) renderer.render(scene, cam3);
    {
      const fh = $('focusHint'),
        need = state === 'play' && !isTouch && !document.hasFocus();
      if (fh.hidden === need) fh.hidden = !need;
    }
    drawOverlay();
  } catch (err) {
    console.error(err);
  }
  requestAnimationFrame(loop);
}
let PREV_BUSY = false;
function toMenu() {
  state = 'menu';
  if (document.pointerLockElement)
    try {
      document.exitPointerLock();
    } catch (err) {}
  $('hud').hidden = true;
  show('menu');
  clearObjs();
  players = [];
  npcs = [];
  enemies = [];
  proj = [];
  fx = [];
  G = null;
  if (NET.sala) {
    NET.inRun = false;
    salaPresence({ phase: 'lobby' });
  }
  buildWorld(menuRealm);
  clearObjs();
  uiHome();
  lobbyPresence();
}
if (GL_OK) {
  buildWorld(menuRealm);
  clearObjs();
}
requestAnimationFrame(loop);
window.__bonk = {
  get state() {
    return state;
  },
  get G() {
    return G;
  },
  get players() {
    return players;
  },
  get enemies() {
    return enemies;
  },
  get remotes() {
    return remotes;
  },
  cfg,
  newRun,
  usePower,
  spawnBoss,
  startRealm,
  jump,
  PROF: () => PROF,
};
