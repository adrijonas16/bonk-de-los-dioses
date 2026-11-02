/* ---------- jefes como textura dinámica ---------- */
function bossObj(e) {
  const base = mkCanvas(96, 96),
    tc = mkCanvas(194, 194);
  const tex = new THREE.CanvasTexture(tc);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.5 });
  const s = new THREE.Sprite(mat);
  s.center.set(0.5, 0.2);
  const k = (e.tier === 'final' ? 3.9 : e.tier === 'boss' ? 3.3 : 2.8) * 0.62;
  s.scale.set(96 * k, 96 * k, 1);
  s.userData.base = base;
  s.userData.tc = tc;
  s.userData.tex = tex;
  s.userData.disp = () => {
    tex.dispose();
    mat.dispose();
  };
  return s;
}
function drawBossTex(e, s) {
  const b = s.userData.base,
    g = b.getContext('2d');
  g.clearRect(0, 0, 96, 96);
  D = g;
  S = 3;
  drawBoss(e, 48, 58);
  const up = shadeOutline(epx(b), C.ink, true);
  const tg = s.userData.tc.getContext('2d');
  tg.clearRect(0, 0, 194, 194);
  tg.drawImage(up, 0, 0);
  s.userData.tex.needsUpdate = true;
  s.material.color.set(e.flash > 0 ? '#ffffff' : SPRITE_TINT);
}
const SEGS = {};
function segV(e) {
  const k = e.key;
  return SEGS[k] || (SEGS[k] = segSprite(e.d.col, e.d.acc));
}

const DROPTEX = {};
function dropSprite(k) {
  if (!DROPTEX[k]) {
    const c = document.createElement('canvas');
    c.width = c.height = 48;
    const g = c.getContext('2d');
    g.lineJoin = 'round';
    g.lineWidth = 3;
    g.strokeStyle = '#14101e';
    if (k === 'nectar') {
      g.fillStyle = '#7de0ff';
      g.beginPath();
      g.moveTo(18, 8);
      g.lineTo(30, 8);
      g.lineTo(30, 16);
      g.quadraticCurveTo(40, 22, 38, 32);
      g.quadraticCurveTo(36, 42, 24, 42);
      g.quadraticCurveTo(12, 42, 10, 32);
      g.quadraticCurveTo(8, 22, 18, 16);
      g.closePath();
      g.fill();
      g.stroke();
      g.fillStyle = '#c8a060';
      g.fillRect(17, 4, 14, 6);
      g.strokeRect(17, 4, 14, 6);
      g.fillStyle = '#ffffffaa';
      g.fillRect(15, 22, 4, 10);
    } else if (k === 'iman') {
      g.lineWidth = 9;
      g.strokeStyle = '#14101e';
      g.beginPath();
      g.arc(24, 22, 13, Math.PI, 0);
      g.lineTo(37, 38);
      g.moveTo(11, 22);
      g.lineTo(11, 38);
      g.stroke();
      g.lineWidth = 5;
      g.strokeStyle = '#e83a3a';
      g.beginPath();
      g.arc(24, 22, 13, Math.PI, 0);
      g.lineTo(37, 34);
      g.moveTo(11, 22);
      g.lineTo(11, 34);
      g.stroke();
      g.fillStyle = '#e8eef8';
      g.fillRect(7, 34, 8, 7);
      g.fillRect(33, 34, 8, 7);
    } else {
      g.fillStyle = '#9a6a3a';
      g.beginPath();
      g.moveTo(16, 14);
      g.quadraticCurveTo(4, 28, 10, 38);
      g.quadraticCurveTo(24, 46, 38, 38);
      g.quadraticCurveTo(44, 28, 32, 14);
      g.closePath();
      g.fill();
      g.stroke();
      g.fillStyle = '#6a4422';
      g.fillRect(15, 10, 18, 6);
      g.strokeRect(15, 10, 18, 6);
      g.fillStyle = '#ffd34d';
      g.beginPath();
      g.arc(24, 29, 7, 0, 6.3);
      g.fill();
      g.stroke();
      g.fillStyle = '#a86a00';
      g.font = 'bold 10px sans-serif';
      g.textAlign = 'center';
      g.fillText('Δ', 24, 33);
    }
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.LinearFilter;
    DROPTEX[k] = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false });
  }
  const sp = new THREE.Sprite(DROPTEX[k]);
  sp.scale.set(24, 24, 1);
  return sp;
}
