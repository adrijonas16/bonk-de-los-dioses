/* ---------- entrada ---------- */
const keys = new Set();
let joy = null,
  look = null;
const KEYALT = {
  w: 'KeyW',
  a: 'KeyA',
  s: 'KeyS',
  d: 'KeyD',
  q: 'KeyQ',
  e: 'KeyE',
  r: 'KeyR',
  f: 'KeyF',
  t: 'KeyT',
  p: 'KeyP',
  ' ': 'Space',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  escape: 'Escape',
  enter: 'Enter',
  shift: 'ShiftLeft',
};
function kcode(ev) {
  let c = ev.code;
  if (!c || c === 'Unidentified') {
    c = KEYALT[(ev.key || '').toLowerCase()] || '';
  }
  return c;
}
function typingIn(ev) {
  const t = ev.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}
const KEYSEEN = new WeakSet();
function onKeyDown(ev) {
  if (KEYSEEN.has(ev)) return;
  KEYSEEN.add(ev);
  if (typingIn(ev) && state !== 'play') return;
  const code = kcode(ev);
  keys.add(code);
  if (ev.key && ev.key.length === 1) {
    const alt = KEYALT[ev.key.toLowerCase()];
    if (alt) keys.add(alt);
  }
  if (state === 'levelup' && /^Digit[1-3]$|^Numpad[1-3]$/.test(code)) {
    const n = +code.slice(-1);
    const bt = $('cards').children[n - 1];
    if (bt) bt.click();
  }
  if (state === 'levelup' && G && G.shopOpen && code === 'Escape') {
    closeShop();
    return;
  }
  if (code === 'KeyM' && G && (state === 'play' || G.mapOpen)) {
    toggleWorldMap();
    return;
  }
  if (code === 'Escape' && G && G.mapOpen) {
    toggleWorldMap(false);
    return;
  }
  if (code === 'Escape' || code === 'KeyP') {
    if (state === 'play') pause(true);
    else if (state === 'pause') pause(false);
  }
  if (state === 'play' && !ev.repeat) {
    const p1 = players.find((p) => p.ctrl === 'p1'),
      p2 = players.find((p) => p.ctrl === 'p2');
    if (code === 'Space' && p1) jump(p1);
    if ((code === 'KeyR' || code === 'KeyF') && p1) usePower(p1);
    if (code === 'ShiftLeft' && p1) slide(p1);
    if (code === 'KeyE' && p1) p1.wantE = true;
    if (code === 'Minus' || code === 'NumpadSubtract') G.zoom = clamp(G.zoom * 1.15, 0.5, 3.6);
    if (code === 'Equal' || code === 'NumpadAdd') G.zoom = clamp(G.zoom / 1.15, 0.5, 3.6);

    if (code === 'KeyT' && p1 && G && G.online) {
      p1.emote = pick(['¡Vamos!', '¡Ayuda!', '¡Bien!', 'GG', '¡Por aquí!']);
      p1.emoteT = Date.now();
      say(p1, p1.emote);
    }
    if ((code === 'ShiftRight' || code === 'Numpad0' || code === 'Period') && p2) jump(p2);
    if ((code === 'Enter' || code === 'NumpadEnter') && p2) usePower(p2);
    if (code === 'ControlRight' && p2) slide(p2);
    if (!G.coop && code === 'Enter' && p1) usePower(p1);
  }
  if ((code.startsWith('Arrow') || code === 'Space') && state === 'play') ev.preventDefault();
}
function onKeyUp(ev) {
  const code = kcode(ev);
  keys.delete(code);
  if (ev.key && ev.key.length === 1) {
    const alt = KEYALT[ev.key.toLowerCase()];
    if (alt) keys.delete(alt);
  }
  if (code === 'ShiftLeft' || code === 'ShiftRight') {
    keys.delete('ShiftLeft');
    keys.delete('ShiftRight');
  }
}
for (const t of [window, document]) {
  t.addEventListener('keydown', onKeyDown, true);
  t.addEventListener('keyup', onKeyUp, true);
}
function focusGame() {
  try {
    cv.focus({ preventScroll: true });
  } catch (_) {}
  try {
    window.focus();
  } catch (_) {}
}

addEventListener('blur', () => {
  keys.clear();
});
addEventListener('contextmenu', (ev) => {
  if (state === 'play') ev.preventDefault();
});
function bindPointer(el) {
  el.addEventListener('pointerdown', (ev) => {
    focusGame();
    if (state !== 'play') return;
    const left = ev.clientX < innerWidth * 0.5;
    if (ev.pointerType === 'touch' && left && !joy) {
      joy = { id: ev.pointerId, ox: ev.clientX, oy: ev.clientY, x: ev.clientX, y: ev.clientY };
    } else if (!look) {
      look = { id: ev.pointerId, x: ev.clientX };
    }
    try {
      el.setPointerCapture(ev.pointerId);
    } catch (_) {}
  });
  el.addEventListener('pointermove', (ev) => {
    if (joy && ev.pointerId === joy.id) {
      joy.x = ev.clientX;
      joy.y = ev.clientY;
    }
    if (look && ev.pointerId === look.id && G) {
      G.yaw -= (ev.clientX - look.x) * 0.006;
      look.x = ev.clientX;
    }
  });
  const up = (ev) => {
    if (joy && ev.pointerId === joy.id) joy = null;
    if (look && ev.pointerId === look.id) look = null;
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
}
let padPrev = [{}, {}];
function pads() {
  let list = [];
  try {
    list = [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(Boolean);
  } catch (err) {}
  return list;
}
function moveInput(p) {
  let mx = 0,
    my = 0;
  const coop = G.coop;
  if (p.ctrl === 'p1') {
    if (keys.has('KeyW')) my--;
    if (keys.has('KeyS')) my++;
    if (keys.has('KeyA')) mx--;
    if (keys.has('KeyD')) mx++;
    if (!coop) {
      if (keys.has('ArrowUp')) my--;
      if (keys.has('ArrowDown')) my++;
      if (keys.has('ArrowLeft')) mx--;
      if (keys.has('ArrowRight')) mx++;
    }
    if (keys.has('KeyQ')) G.yaw += 1.8 / 60;
    if (keys.has('KeyC')) G.yaw -= 1.8 / 60;
    if (joy) {
      const dx = joy.x - joy.ox,
        dy = joy.y - joy.oy,
        d = Math.hypot(dx, dy);
      if (d > 8) {
        const m = Math.min(1, d / 50);
        mx = (dx / d) * m;
        my = (dy / d) * m;
      }
    }
  }
  if (p.ctrl === 'p2') {
    if (keys.has('ArrowUp')) my--;
    if (keys.has('ArrowDown')) my++;
    if (keys.has('ArrowLeft')) mx--;
    if (keys.has('ArrowRight')) mx++;
  }
  const ps = pads();
  let pi = -1;
  if (p.ctrl === 'p1') pi = coop && ps.length === 1 ? -1 : 0;
  if (p.ctrl === 'p2') pi = ps.length === 1 ? 0 : 1;
  const pad = pi >= 0 ? ps[pi] : null;
  if (pad) {
    const ax = pad.axes[0] || 0,
      ay = pad.axes[1] || 0;
    if (Math.hypot(ax, ay) > 0.2) {
      mx = ax;
      my = ay;
    }
    const rx = pad.axes[2] || 0;
    if (Math.abs(rx) > 0.25 && p.ctrl === 'p1') G.yaw -= rx * 0.04;
    const pv = padPrev[p.idx] || {},
      b0 = !!(pad.buttons[0] && pad.buttons[0].pressed),
      b2 = !!((pad.buttons[2] && pad.buttons[2].pressed) || (pad.buttons[1] && pad.buttons[1].pressed));
    if (b0 && !pv.b0) jump(p);
    if (b2 && !pv.b2) usePower(p);
    padPrev[p.idx] = { b0, b2 };
  }
  // relativo a la cámara
  const sy = Math.sin(G.yaw),
    cy = Math.cos(G.yaw);
  const wx = mx * cy + my * sy,
    wy = -mx * sy + my * cy;
  return [wx, wy];
}
function jump(p) {
  if (!p || p.down) return;
  if (!p.air) {
    p.vz = JUMP * (p.giant > 0 ? 1.15 : 1);
    p.air = true;
    p.jumpsLeft = p.extraJumps;
  } else if (p.jumpsLeft > 0) {
    p.jumpsLeft--;
    p.vz = JUMP * 0.85;
    for (let i = 0; i < 6; i++)
      fx.push({
        k: 'p',
        x: p.x,
        y: p.y,
        z: p.z,
        vx: rand(-50, 50),
        vy: rand(-50, 50),
        vz: rand(-40, 10),
        t: 0.4,
        c: '#ffffff',
      });
  }
}
function slide(p) {
  if (!p || p.down || p.dashCd > 0) return;
  p.dashT = 0.22;
  p.dashCd = 1.1;
  p.inv = Math.max(p.inv, 0.25);
  for (let i = 0; i < 5; i++)
    fx.push({
      k: 'p',
      x: p.x,
      y: p.y,
      z: p.z + 4,
      vx: rand(-30, 30),
      vy: rand(-30, 30),
      vz: rand(10, 60),
      t: 0.35,
      c: '#e8e0cc',
    });
}
function glideHeld(p) {
  if (p.ctrl === 'p1') return keys.has('Space') || TOUCH_JUMP_HELD;
  if (p.ctrl === 'p2') return keys.has('Numpad0') || keys.has('ShiftRight');
  return false;
}
let TOUCH_JUMP_HELD = false;
