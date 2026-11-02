/* ---------- bucle por fotograma ---------- */
function questsUpdate(dt) {
  const q = G.q;
  if (!q) return;
  questsTick(dt);
  for (const r of q.recent) r.t -= dt;
  q.recent = q.recent.filter((r) => r.t > 0);
  for (const A of q.active.slice()) {
    A.t += dt;
    if (A.id === 'ladron') thiefUpdate(A, dt);
    else if (A.id === 'llama') flameUpdate(A, dt);
    else if (A.id === 'sellos') sealsUpdate(A, dt);
    else if (A.id === 'favor') favorUpdate(A, dt);
  }
  // ofertas: E solo acepta si esa pulsación no la usó otro objeto y no hay otro interactivo al lado
  const busy = !!G.prompt;
  q.offer = null;
  q.offerBlocked = false;
  for (const a of q.anch) {
    if (a.state !== 'offer') continue;
    for (const p of players) {
      if (p.down || p.ctrl === 'ai' || p.ctrl === 'net' || p.ctrl === 'npc') continue;
      if (Math.hypot(p.x - a.x, p.y - a.y) < 72) {
        q.offer = a;
        q.offerP = p;
        if (busy || p.eUsed) {
          q.offerBlocked = busy;
          break;
        }
        if (p.wantE) {
          p.wantE = false;
          p.eUsed = true;
          questAccept(a, p);
        } else
          G.prompt = {
            x: a.x,
            y: a.y,
            t: q.active.length >= QMAX ? 'Ya llevas 2 encargos' : 'E · Aceptar encargo',
            bad: q.active.length >= QMAX,
          };
        break;
      }
    }
    if (q.offer) break;
  }
  questsHud();
}
