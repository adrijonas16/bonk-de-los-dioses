/* ---------- UI general ---------- */
const OVS = ['menu', 'levelup', 'pause', 'end'];
let LOCK_WANT = false;
function show(id) {
  for (const o of OVS) $(o).hidden = o !== id;
  if (id !== 'menu' && $('home') && !$('home').hidden) {
    $('home').hidden = true;
    $('menu').style.visibility = '';
  }
  if (id && document.pointerLockElement) {
    LOCK_WANT = true;
    try {
      document.exitPointerLock();
    } catch (_) {}
  }
  if (!id && LOCK_WANT && !isTouch) {
    LOCK_WANT = false;
    try {
      const r = cv.requestPointerLock();
      if (r && r.catch) r.catch(() => {});
    } catch (_) {}
  }
}
function pause(on) {
  state = on ? 'pause' : 'play';
  show(on ? 'pause' : null);
  joy = null;
  look = null;
  keys.clear();
}
let bannerT = 0;
function banner(t) {
  const bn = $('banner');
  bn.textContent = t;
  bn.classList.add('on');
  bannerT = 2.4;
}
let bigTO = null;
function bigBanner(t, s) {
  $('bigT').textContent = t;
  $('bigS').textContent = s || '';
  $('big').classList.add('on');
  clearTimeout(bigTO);
  bigTO = setTimeout(() => $('big').classList.remove('on'), 3200);
}
function say(p, txt, delay) {
  if (!p) return;
  const go = () => {
    p.say = txt;
    p.sayT = 3.2;
  };
  if (delay) setTimeout(go, delay * 1000);
  else go();
}
function flash(col, t) {
  const f = $('flash');
  f.style.background = col;
  f.style.transition = 'none';
  f.style.opacity = 0.55;
  requestAnimationFrame(() => {
    f.style.transition = `opacity ${t || 0.6}s`;
    f.style.opacity = 0;
  });
}
