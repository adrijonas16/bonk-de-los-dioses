// Bot de partidas: juega Supervivencia eligiendo todas las mejoras al azar y mide hasta dónde llega.
// Uso: npm run build && npm run bot -- zeus,thor normal 1800   (dioses, dificultad, segundos de juego máx.)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [gods = 'zeus', diff = 'normal', cap = '1800'] = process.argv.slice(2);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.glb': 'model/gltf-binary',
  '.json': 'application/json',
};
const srv = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(DIST, url === '/' ? 'index.html' : url);
  if (!file.startsWith(DIST) || !fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => srv.listen(0, r));

// lógica del bot (se ejecuta dentro de la página): huye de enemigos, balas, lava y zonas marcadas, recoge botín
const BOT = `(()=>{window.BOTV=[0,0];const om=moveInput;window.moveInput=function(p){return p.bot?BOTV:om(p);};
window.botThink=(p)=>{let rx=0,ry=0,thr=0;for(const e of enemies){if(e.dead)continue;const dx=p.x-e.x,dy=p.y-e.y,d2=dx*dx+dy*dy;const R=e.boss?420:230;if(d2>R*R)continue;const d=Math.sqrt(d2)||1;const w=(e.boss?3:1)*(e.elite?2:1)/Math.max(30,d);rx+=dx/d*w*60;ry+=dy/d*w*60;if(d<e.r+p.r+30)thr++;}
  for(const b of bullets){const dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy);if(d<120){rx+=dx/d*2;ry+=dy/d*2;}}
  // objetivos
  let tg=null,bd=1e9;const cand=[];const lowHp=p.hp<p.maxHp*.5;for(const h of heals)cand.push([h,lowHp?.2:1.5]);for(const d of drops)cand.push([d,d.k==='nectar'&&lowHp?.2:.8]);for(const g of gems)cand.push([g,1]);for(const c of coins)cand.push([c,1.2]);
  if(WORLD&&WORLD.chests)for(const c of WORLD.chests)if(!c.opened&&(c.free||G.gold>=(c.price||20)))cand.push([c,.6]);
  for(const [o,k] of cand){const d=Math.hypot(o.x-p.x,o.y-p.y)*k;if(d<bd){bd=d;tg=o;}}
  let ax=0,ay=0;if(tg){const dx=tg.x-p.x,dy=tg.y-p.y,d=Math.hypot(dx,dy)||1;ax=dx/d;ay=dy/d;}
  // quedarse en arena: atraer al centro si lejos
  const dc=Math.hypot(p.x,p.y);if(dc>ARENA*.8){ax-=p.x/dc*1.5;ay-=p.y/dc*1.5;}
  const rl=Math.hypot(rx,ry);const danger=Math.min(1,rl/1.5);let mx=ax*(1-danger*.7)+(rl?rx/rl:0)*danger,my=ay*(1-danger*.7)+(rl?ry/rl:0)*danger;
  // perpendicular para no quedar atrapado
  if(danger>.8){const t=Math.sin(G.t*.7);mx+=-my*.5*t;my+=mx*.5*t;}
  {const m0=Math.hypot(mx,my)||1;mx/=m0;my/=m0;}
  const bad=(x,y)=>{let s=0;if(hazardAt(x,y))s+=4;for(const f of fx){if(f.k!=='tele'||!f.dmg&&f.shape!=='line')continue;if(f.shape==='circle'){if((x-f.x)**2+(y-f.y)**2<(f.r+18)**2)s+=3;}else if(f.shape==='line'){const vx=f.x2-f.x,vy=f.y2-f.y,L2=vx*vx+vy*vy||1;const t=Math.max(0,Math.min(1,((x-f.x)*vx+(y-f.y)*vy)/L2));const d=Math.hypot(f.x+vx*t-x,f.y+vy*t-y);if(d<f.w/2+20)s+=3;}}if(Math.hypot(x,y)>ARENA-60)s+=2;return s;};
  let best=null,bs=-1e9;for(let i=0;i<16;i++){const a=i/16*6.283,dx=Math.cos(a),dy=Math.sin(a);const sc=dx*mx+dy*my-bad(p.x+dx*35,p.y+dy*35)-bad(p.x+dx*75,p.y+dy*75)*.6;if(sc>bs){bs=sc;best=[dx,dy];}}
  if(bad(p.x,p.y)>=3&&p.safe){const dx=p.safe[0]-p.x,dy=p.safe[1]-p.y,d=Math.hypot(dx,dy);if(d>5&&hazardAt(p.x,p.y))best=[dx/d,dy/d];}
  BOTV=best;
  if(thr>=2||(thr>=1&&p.hp<p.maxHp*.4))slide(p);if(Math.random()<.01)jump(p);
  if(tg&&WORLD.chests.includes(tg)&&Math.hypot(tg.x-p.x,tg.y-p.y)<40)p.wantE=true;
  if(!p.pow&&G.level>=POW_LV)usePower(p);};
window.botRun=(sec)=>{const p=players[0];const N=Math.round(sec*30);for(let i=0;i<N;i++){if(!G||state==='end')return 'end';
  if(state==='levelup'){if(G.shopOpen){closeShop();continue;}const cs=$('cards').children;if(cs.length){const c=cs[Math.floor(Math.random()*cs.length)];c.click();}else{state='play';}continue;}
  if(state==='pause'){pause(false);}if(state!=='play'){continue;}
  if(i%3===0)botThink(p);if(!p.down){const sp=qSpeed(p)*(p.dashT>0?2.6:1)/30;const x0=p.x,y0=p.y;tryMove(p,BOTV[0]*sp,BOTV[1]*sp);p.fx=BOTV[0];p.fy=BOTV[1];if(Math.hypot(p.x-x0,p.y-y0)<sp*.3)jump(p);}update(1/30);}return 'ok';};
})()`;

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 320, height: 180 } });
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: '', contentType: 'text/css' }));
await page.route(/supabase\.co/, (r) => r.abort());
await page.goto(`http://localhost:${srv.address().port}/`);
await page.waitForFunction('typeof AS!=="undefined"&&(AS.ready||AS.failed)', null, { timeout: 180000 });
await page.evaluate(BOT);
for (const god of gods.split(',')) {
  await page.evaluate(
    ([god, diff]) => {
      closeHome();
      cfg.mode = 'libre';
      cfg.diff = diff;
      cfg.party = 'solo';
      cfg.realm = pick(Object.keys(REALMS).filter((k) => k !== 'vacio' && k !== 'cielo' && k !== 'tartaro'));
      cfg.picks = [{ id: god, ctrl: 'p1' }];
      newRun();
      players[0].bot = true;
    },
    [god, diff]
  );
  let info;
  for (;;) {
    const st = await page.evaluate('botRun(60)');
    info = await page.evaluate(() => ({
      t: Math.round(G.t),
      oleada: G.wave,
      nivel: G.level,
      puntos: Math.round(G.score || 0),
      bajas: G.kills,
      vivo: state !== 'end',
    }));
    if (st === 'end' || !info.vivo || info.t >= +cap) break;
  }
  console.log(god, JSON.stringify(info));
  await page.evaluate(() => (state = 'menu'));
}
await browser.close();
srv.close();
