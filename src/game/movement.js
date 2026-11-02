/* ---------- movimiento sobre el terreno ---------- */
function blockedAt(p, x, y) {
  if (Math.hypot(x, y) > ARENA - 30) return true;
  const g = groundAt(x, y);
  if (g - p.z > (p.air ? 2 : 14)) return true;
  for (const c of WORLD.coll) {
    if (p.z < c.top - 6 && (x - c.x) ** 2 + (y - c.y) ** 2 < (c.r + p.r * 0.6) ** 2) return true;
  }
  return false;
}
function tryMove(p, dx, dy, force) {
  if (force) {
    let x = p.x + dx,
      y = p.y + dy;
    const d = Math.hypot(x, y);
    if (d > ARENA - 30) {
      x *= (ARENA - 30) / d;
      y *= (ARENA - 30) / d;
    }
    p.x = x;
    p.y = y;
    p.z = Math.max(p.z, surfaceAt(x, y));
    return true;
  }
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 8));
  let moved = false;
  for (let i = 0; i < steps; i++) {
    const sx = dx / steps,
      sy = dy / steps;
    if (!blockedAt(p, p.x + sx, p.y + sy)) {
      p.x += sx;
      p.y += sy;
      moved = true;
    } else if (!blockedAt(p, p.x + sx, p.y)) {
      p.x += sx;
      moved = true;
    } else if (!blockedAt(p, p.x, p.y + sy)) {
      p.y += sy;
      moved = true;
    } else return moved;
  }
  return moved;
}
function physics(p, dt) {
  const s = surfaceAt(p.x, p.y);
  if (!p.air) {
    if (p.z - s > 16) {
      p.air = true;
      p.vz = 0;
    } else {
      p.z = s;
      p.vz = 0;
      return;
    }
  }
  p.vz -= GRAV * dt;
  if (p.vz < -75 && glideHeld(p)) p.vz = -75;
  p.z += p.vz * dt;
  if (p.z <= s) {
    p.z = s;
    p.vz = 0;
    p.air = false;
    p.jumpsLeft = p.extraJumps;
  }
}
