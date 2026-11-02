/* ---------- pantalla de carga ---------- */
// Se queda delante hasta que los modelos 3D y las miniaturas de los mapas están listos,
// así no se ve la portada a medias ni los mundos generándose uno tras otro.
(function bootScreen() {
  const boot = $('boot'),
    bar = $('bootBar'),
    txt = $('bootTxt'),
    t0 = Date.now();
  if (!boot) return;
  const total = Object.keys(REALMS).length;
  const tick = () => {
    const assets = AS.ready || AS.failed ? 1 : AS.prog || 0;
    const prevs = GL_OK ? (total - prevQueue.length) / total : 1;
    const prevDone = !GL_OK || (!prevQueue.length && !PREV_BUSY);
    const k = assets * 0.6 + (assets >= 1 ? prevs * 0.4 : 0);
    bar.style.width = Math.round(k * 100) + '%';
    txt.textContent =
      assets < 1 ? `Cargando dioses y monstruos… ${Math.round(assets * 100)} %` : 'Preparando los reinos…';
    if ((assets >= 1 && prevDone) || Date.now() - t0 > 45000) {
      bar.style.width = '100%';
      document.body.classList.remove('booting');
      boot.classList.add('out');
      setTimeout(() => boot.remove(), 700);
      if (typeof renderHome === 'function') renderHome();
      return;
    }
    setTimeout(tick, 150);
  };
  tick();
})();
