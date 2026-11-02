// Prueba de humo: abre dist/ en Chromium, arranca una partida y simula 30 s de juego.
// Uso: npm run build && npm test
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.glb': 'model/gltf-binary',
};

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(DIST, url === '/' ? 'index.html' : url);
      if (!file.startsWith(DIST) || !fs.existsSync(file)) {
        res.writeHead(404);
        return res.end();
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, () => resolve(srv));
  });
}

const fail = (msg) => {
  console.error('✖', msg);
  process.exitCode = 1;
};

const srv = await serve();
const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: '', contentType: 'text/css' }));
await page.route(/supabase\.co/, (r) => r.abort());
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
try {
  await page.goto(`http://localhost:${port}/`);
  await page.waitForFunction('typeof AS!=="undefined"&&(AS.ready||AS.failed)', null, { timeout: 180000 });
  const ok = await page.evaluate(() => AS.ready && !AS.failed);
  if (!ok) fail('los modelos 3D no cargaron');
  const r = await page.evaluate(() => {
    closeHome();
    cfg.mode = 'libre';
    cfg.party = 'solo';
    cfg.realm = 'jotunheim';
    cfg.picks = [{ id: 'zeus', ctrl: 'p1' }];
    newRun();
    const p = players[0];
    p.inv = 1e9;
    for (let i = 0; i < 900; i++) {
      if (state === 'levelup') {
        const c = document.getElementById('cards').children[0];
        if (c) c.click();
        else state = 'play';
        continue;
      }
      update(1 / 30);
    }
    return { state, kills: G.kills, level: G.level, score: Math.round(G.score), enemies: enemies.length };
  });
  console.log('partida simulada 30 s:', r);
  if (r.kills <= 0) fail('no murió ningún enemigo en 30 s');
  if (r.level < 2) fail('no se subió de nivel');
} catch (e) {
  fail(e.message);
}
if (errors.length) fail('errores en la página: ' + errors.slice(0, 3).join(' | '));
await browser.close();
srv.close();
if (!process.exitCode) console.log('✔ prueba de humo superada');
