/* ---------- retratos ---------- */
// Los retratos de los dioses salen siempre de su modelo 3D. Mientras el modelo no está listo se dibuja
// una silueta neutra (nunca el dibujo pixel art antiguo, que no se parece al modelo). Los retratos ya
// hechos se guardan en el navegador para que la siguiente visita los tenga al instante.
const SHOTQ = [];
let SHOTBUSY = false;
const SHOT_KEY = 'bonk-shots';
const SHOT_VER = (document.querySelector('script[src*="render-human"]') || {}).src || 'dev';
let shotSaveT = null;
(function loadSavedShots() {
  try {
    const saved = store && JSON.parse(store.getItem(SHOT_KEY) || 'null');
    if (!saved || saved.ver !== SHOT_VER) return;
    for (const id in saved.face) {
      const img = new Image();
      img.onload = () => {
        const c = mkCanvas(img.naturalWidth, img.naturalHeight);
        c.getContext('2d').drawImage(img, 0, 0);
        SHOT.cache[id + '|face'] = c;
      };
      img.src = saved.face[id];
    }
  } catch (err) {}
})();
function saveShotsSoon() {
  clearTimeout(shotSaveT);
  shotSaveT = setTimeout(() => {
    try {
      const face = {};
      const small = mkCanvas(96, 96),
        sg = small.getContext('2d');
      sg.imageSmoothingEnabled = true;
      for (const k in SHOT.cache) {
        if (!k.endsWith('|face')) continue;
        sg.clearRect(0, 0, 96, 96);
        sg.drawImage(SHOT.cache[k], 0, 0, 96, 96);
        face[k.slice(0, -5)] = small.toDataURL('image/webp', 0.85);
      }
      store && store.setItem(SHOT_KEY, JSON.stringify({ ver: SHOT_VER, face }));
    } catch (err) {}
  }, 1500);
}
function drawShot(canvas, sh, size) {
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, size, size);
  g.imageSmoothingEnabled = true;
  g.drawImage(sh, 0, 0, size, size);
}
function pumpShots() {
  if (SHOTBUSY) return;
  SHOTBUSY = true;
  const step = () => {
    if (!AS.ready) return setTimeout(step, 300);
    const job = SHOTQ.shift();
    if (!job) {
      SHOTBUSY = false;
      return;
    }
    const had = !!SHOT.cache[job.id + '|face'];
    const sh = godShot(job.id, 'face');
    if (sh && !had) saveShotsSoon();
    if (sh && job.c && job.c.isConnected !== false) drawShot(job.c, sh, job.size);
    setTimeout(step, job.c ? 16 : 60);
  };
  step();
}
// silueta de busto mientras llega el retrato 3D
function drawSilhouette(g, w, h) {
  g.fillStyle = 'rgba(255,255,255,0.10)';
  g.beginPath();
  g.arc(w / 2, h * 0.4, Math.min(w, h) * 0.2, 0, 6.283);
  g.fill();
  g.beginPath();
  g.ellipse(w / 2, h * 0.98, w * 0.36, h * 0.34, 0, Math.PI, 0);
  g.fill();
}
function portrait(canvas, id, size) {
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, size, size);
  const sh = typeof SHOT !== 'undefined' && SHOT.cache[id + '|face'];
  if (sh) return drawShot(canvas, sh, size);
  drawSilhouette(g, size, size);
  SHOTQ.push({ c: canvas, id, size });
  pumpShots();
}
// calienta en segundo plano los retratos que faltan (sin lienzo: solo los deja en caché)
function warmPortraits() {
  for (const gd of GODS) if (!SHOT.cache[gd.id + '|face']) SHOTQ.push({ c: null, id: gd.id, size: 0 });
  pumpShots();
}
function fullSprite(canvas, id, scale) {
  const sh = typeof godShot === 'function' && godShot(id, 'full');
  canvas.width = 256;
  canvas.height = 320;
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, 256, 320);
  if (sh) return g.drawImage(sh, 0, 0);
  drawSilhouette(g, 256, 320);
}
