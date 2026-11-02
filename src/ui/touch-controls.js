/* ---------- botones táctiles ---------- */
$('tJump').addEventListener('pointerdown', (ev) => {
  ev.preventDefault();
  ev.stopPropagation();
  TOUCH_JUMP_HELD = true;
  const p = players.find((q) => q.ctrl === 'p1');
  if (p && state === 'play') jump(p);
});
$('tJump').addEventListener('pointerup', () => {
  TOUCH_JUMP_HELD = false;
});
$('tJump').addEventListener('pointercancel', () => {
  TOUCH_JUMP_HELD = false;
});
$('power').addEventListener('pointerdown', (ev) => {
  ev.preventDefault();
  ev.stopPropagation();
  const p = players.find((q) => q.ctrl === 'p1');
  if (p && state === 'play') usePower(p);
});
$('tDash').addEventListener('pointerdown', (ev) => {
  ev.preventDefault();
  ev.stopPropagation();
  const p = players.find((q) => q.ctrl === 'p1');
  if (p && state === 'play') slide(p);
});
