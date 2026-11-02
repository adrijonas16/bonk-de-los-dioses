/* ---------- retratos ---------- */
const SHOTQ = [];
let SHOTBUSY = false;
function pumpShots() {
  if (SHOTBUSY) return;
  SHOTBUSY = true;
  const step = () => {
    const job = SHOTQ.shift();
    if (!job) {
      SHOTBUSY = false;
      return;
    }
    const sh = godShot(job.id, 'face');
    if (sh && job.c.isConnected !== false) {
      const g = job.c.getContext('2d');
      g.clearRect(0, 0, job.size, job.size);
      g.imageSmoothingEnabled = true;
      g.drawImage(sh, 0, 0, job.size, job.size);
    }
    setTimeout(step, 16);
  };
  step();
}
function portrait(canvas, id, size) {
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, size, size);
  if (typeof SHOT !== 'undefined' && AS.ready) {
    const sh = SHOT.cache[id + '|face'];
    if (sh) {
      g.imageSmoothingEnabled = true;
      g.drawImage(sh, 0, 0, size, size);
      return;
    }
    SHOTQ.push({ c: canvas, id, size });
    pumpShots();
  }
  const v = godSprites(id)[0];
  g.imageSmoothingEnabled = false;
  const k = size / (v.w * 0.72);
  g.drawImage(v.c, (size - v.w * k) / 2, size * 0.06, v.w * k, v.h * k);
}
function fullSprite(canvas, id, scale) {
  const sh = typeof godShot === 'function' && godShot(id, 'full');
  if (sh) {
    canvas.width = 256;
    canvas.height = 320;
    const g = canvas.getContext('2d');
    g.clearRect(0, 0, 256, 320);
    g.drawImage(sh, 0, 0);
    return;
  }
  const v = godSprites(id)[0];
  canvas.width = v.w * scale;
  canvas.height = v.h * scale;
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(v.c, 0, 0, v.w * scale, v.h * scale);
}
