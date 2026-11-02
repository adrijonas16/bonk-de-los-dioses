/* Bonk de los Dioses · encargos dentro de la partida (primera versión: Machu Picchu) */
'use strict';
const Q_REALMS={ukupacha:true};
const QMAX=2;
const Q_IDS=['ladron','llama','sellos','favor'];
const Q_EMBER=20;          // segundos de brasa
const Q_SEAL_TIME=100;     // límite del encuentro del gigante
const QDEF={
  ladron:{icon:'🦊',col:'#ffb040',name:'El ladrón de ambrosía',give:'Un cofre de ambrosía brilla en la terraza. Atoq, un zorro ladrón, lo vigila: si lo abres, lo roba y huye.',
    rew:'1 cofre del jefe (eliges 1 de 3 objetos). Rápido: unos 30 s.',risk:'Atoq corre al 95 % de tu velocidad durante 50 s mientras siguen las hordas. Si te quedas atrás te espera, y tropieza cada pocos segundos.'},
  llama:{icon:'🔥',col:'#ff8a2a',name:'La llama de Inti',give:'Lleva la llama sagrada a los dos braseros apagados, en el orden que quieras.',
    rew:'Fuego de Inti: tus golpes queman toda la partida. Los braseros encendidos sirven de refugio en este reino.',risk:'Ventiscas anunciadas 5 s antes: fuera de un tambo (anillo azul) la llama se debilita; los golpes también. Si se apaga, la brasa dura 20 s.'},
  sellos:{icon:'🗿',col:'#c8a0ff',name:'Los sellos del gigante',give:'Tres sellos cierran la puerta del Apu y protegen al Guardián de piedra. Solo sus propios puños pueden romperlos.',
    rew:'1 cofre del jefe y un altar de don dentro de la puerta.',risk:'El Guardián pega fuerte (círculo morado 1,2 s antes) y mientras queden sellos solo recibe el 35 % del daño y no puede morir. Tienes 100 s.'},
};
/* Favores divinos: el sistema elige el primero compatible con el grupo. Solo «tormenta» está implementado. */
const FAVORS={
  tormenta:{givers:['illapa','shango','zeus'],tag:'trueno',icon:'ϟ',col:'#ffe060',relic:'la Illa',
    title:'Charcos de tormenta',desc:'Los enemigos que matas dejan charcos, y cada 4 s la tormenta moja a los jefes y élites cercanos. Cada 2,5 s un rayo electrocuta a todos los que pisan charcos cercanos. Tus rayos también los electrifican.'},
};
const Q_HUNT={aliado:8,neutral:6,rival:4};
let Q_BURN=false;

/* ---------- utilidades ---------- */
function qHumans(){return players.filter(p=>!p.down&&(p.ctrl==='p1'||p.ctrl==='p2'));}
function qNearest(x,y){let best=null,bd=1e12;for(const p of qHumans()){const d=(p.x-x)**2+(p.y-y)**2;if(d<bd){bd=d;best=p;}}return best?[best,Math.sqrt(bd)]:[null,1e9];}
function qSpeed(p){return p.speed*(G.slowT>0&&!inShelter(p)?.72:1)*(p.rage>0?1.35:1)*(p.qRelic?.9:1);}
function qFlat(x,y){if(hazardAt(x,y))return false;for(let i=0;i<6;i++){const a=i/6*6.283;if(slopeAt(x+Math.cos(a)*34,y+Math.sin(a)*34)>.28)return false;}return slopeAt(x,y)<.25;}
function qFree(x,y,pad){return!WORLD.coll.some(c=>Math.hypot(c.x-x,c.y-y)<c.r+(pad||50));}
function qEnemy(key,x,y,o){const d=ENEMIES[key];const e=Object.assign({key,d,x,y,z:groundAt(x,y),hp:100,spd:d.spd,dmg:d.dmg,r:d.r,xp:d.xp,elite:false,flash:0,soul:0,ph:rand(0,6.28),stun:0,slow:0,mark:0,conf:0,shH:0,quest:true,heavy:true},o||{});e.maxHp=e.hp;enemies.push(e);return e;}
function qMesh(geo,mat,x,y,z,parent){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;(parent||WORLD.group).add(m);return m;}
function qRing(col,r,op){const m=new THREE.Mesh(new THREE.RingGeometry(r-5,r,40),MB(col,{transparent:true,opacity:op||.6,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;return m;}
function qGlow(col,s){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(col),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));sp.scale.set(s,s,1);return sp;}
function qPillar(col){const m=new THREE.Mesh(new THREE.CylinderGeometry(7,12,700,8,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide,fog:false}));m.position.y=350;m.renderOrder=8;return m;}
function qActive(id){return G&&G.q&&G.q.active.find(a=>a.id===id);}
function inShelter(p){const q=G&&G.q;if(!q)return false;for(const s of q.shelters)if((p.x-s.x)**2+(p.y-s.y)**2<s.r*s.r)return true;for(const b of q.braz)if(b.lit&&(p.x-b.x)**2+(p.y-b.y)**2<b.r*b.r)return true;return false;}
function qRecent(A,ok,txt){const inf=qInfo(A.a);G.q.recent.push({icon:inf.icon,name:inf.name,txt,ok,t:6,col:inf.col});}

/* ---------- alcance: rejilla de terreno transitable desde la salida (saltos de hasta 70) ---------- */
function qReach(sx,sy){const C=40,R=1700,N=Math.ceil(R*2/C)+1,ox=sx-R,oy=sy-R,NN=N*N;const gh=new Float32Array(NN),ok=new Uint8Array(NN),dist=new Float32Array(NN).fill(-1);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=ox+i*C,y=oy+j*C,k=j*N+i;if(Math.hypot(x,y)>ARENA-70||hazardAt(x,y))continue;gh[k]=groundAt(x,y);ok[k]=1;}
  for(const c of WORLD.coll){const g0=groundAt(c.x,c.y);if(c.top-g0<45)continue;const r=Math.ceil((c.r+14)/C);const ci=Math.round((c.x-ox)/C),cj=Math.round((c.y-oy)/C);
    for(let j=cj-r;j<=cj+r;j++)for(let i=ci-r;i<=ci+r;i++){if(i<0||j<0||i>=N||j>=N)continue;if(Math.hypot(ox+i*C-c.x,oy+j*C-c.y)<c.r+14)ok[j*N+i]=0;}}
  const at=(x,y)=>{const i=Math.round((x-ox)/C),j=Math.round((y-oy)/C);if(i<0||j<0||i>=N||j>=N)return-1;return j*N+i;};
  const s0=at(sx,sy);const Q=new Int32Array(NN);let h=0,t=0;if(s0>=0){ok[s0]=1;dist[s0]=0;Q[t++]=s0;}
  const NB=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[-1,1,1.414],[1,-1,1.414],[-1,-1,1.414]];
  while(h<t){const k=Q[h++];const i=k%N,j=(k-i)/N;for(const[di,dj,w]of NB){const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=N||nj>=N)continue;const n=nj*N+ni;if(!ok[n]||dist[n]>=0)continue;if(gh[n]-gh[k]>70)continue;dist[n]=dist[k]+w*C;Q[t++]=n;}}
  return{C,N,ox,oy,ok,gh,dist,at,d:(x,y)=>{const k=at(x,y);return k<0?-1:dist[k];}};}
/* distancia caminando desde cada celda alcanzable al refugio más cercano (para validar la brasa) */
function qShelterField(R,shel){const NN=R.N*R.N,f=new Float32Array(NN).fill(-1),Q=new Int32Array(NN);let h=0,t=0;
  for(const s of shel){const k=R.at(s.x,s.y);if(k>=0&&R.dist[k]>=0&&f[k]<0){f[k]=0;Q[t++]=k;}}
  const NB=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[-1,1,1.414],[1,-1,1.414],[-1,-1,1.414]];
  while(h<t){const k=Q[h++];const i=k%R.N,j=(k-i)/R.N;for(const[di,dj,w]of NB){const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=R.N||nj>=R.N)continue;const n=nj*R.N+ni;if(R.dist[n]<0||f[n]>=0)continue;if(R.gh[k]-R.gh[n]>70)continue;f[n]=f[k]+w*R.C;Q[t++]=n;}}
  return f;}
function qSpot(rng,R,cx,cy,minD,maxD,avoid){for(let t=0;t<600;t++){const a=rng()*6.283,r=minD+rng()*(maxD-minD);const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
    if(Math.hypot(x,y)>ARENA-260)continue;if(R.d(x,y)<0)continue;if(!qFlat(x,y)||!qFree(x,y))continue;if((avoid||[]).some(p=>Math.hypot(p[0]-x,p[1]-y)<(p[2]||300)))continue;return[x,y];}return null;}
function qNearSpot(R,rng,x,y,rad){for(let t=0;t<120;t++){const a=rng()*6.283,r=t?rng()*rad:0;const xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r;if(Math.hypot(xx,yy)<ARENA-200&&R.d(xx,yy)>=0&&qFlat(xx,yy)&&qFree(xx,yy,30))return[xx,yy];}return[x,y];}

/* ---------- inicio de reino: elegir y colocar encargos ---------- */
function questsStart(key){
  G.qfx=G.qfx||{fire:false,favor:null,done:0};if(G.qSeed==null)G.qSeed=(Math.random()*1e9)|0;
  if(G.q&&G.q.active.length)setTimeout(()=>banner('Encargos sin terminar abandonados al cambiar de reino'),4200);
  for(const p of players){p.qFlame=false;p.qRelic=false;}
  G.q={key,anch:[],active:[],shelters:[],braz:[],seals:[],puddles:[],recent:[],zapT:2.5,wetT:4,hudK:'',offer:null};G.qPrio=null;
  if(!Q_REALMS[key]||!WORLD)return;
  const q=G.q,rng=srand(G.qSeed+G.ridx*7919+key.length*131),[sx,sy]=spawnPt(key);const R=qReach(sx,sy);q.R=R;
  const avoid=[[sx,sy,380]];for(const o of[...WORLD.chests,...WORLD.altars,...(WORLD.shrines||[]),...(WORLD.merchants||[])])avoid.push([o.x,o.y,130]);
  const mode=cfg.qTest||'azar';let ids=mode==='todos'?Q_IDS.slice():Q_IDS.includes(mode)?[mode]:(()=>{const a=Q_IDS.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,3);})();
  q.ids=ids;
  const put=(id,minD,maxD)=>{const s=qSpot(rng,R,sx,sy,minD,maxD,avoid);if(!s)return null;avoid.push([s[0],s[1],420]);const a={id,x:s[0],y:s[1],state:'offer'};q.anch.push(a);return a;};
  const st=MLT('#b8b0a0','wall'),dark=ML('#5a5048'),gold=MB(C.gold);
  if(ids.includes('ladron'))qPlaceThief(put('ladron',420,950),R,rng,st,gold);
  if(ids.includes('llama'))qPlaceFlame(put('llama',380,850),R,rng,st,dark,avoid);
  if(ids.includes('sellos'))qPlaceSeals(put('sellos',600,1150),R,rng,st,sx,sy);
  if(ids.includes('favor'))qPlaceFavor(put('favor',340,750),R,rng,st,gold,avoid);
  q.R=qReach(sx,sy);qEnsureShelters(q.R);q.mkShelter=null;
}
function qPlaceThief(a,R,rng,st,gold){if(!a)return;const g=new THREE.Group();g.position.set(a.x,groundAt(a.x,a.y),a.y);WORLD.group.add(g);
  qMesh(GEO.cyl(24,28,10,8),st,0,5,0,g);const ch=qMesh(GEO.box(22,14,16),MLT('#7a4a2a','bark'),0,17,0,g);const lid=qMesh(GEO.box(23,5,17),gold,0,26,0,g);
  const gl=qGlow('#ffd060',80);gl.position.y=24;g.add(gl);const rg=qRing(QDEF.ladron.col,52);rg.position.y=2;g.add(rg);a.obj=g;a.chest=[ch,lid,gl];
  // ruta: alterna meseta y terrazas; sentido, amplitud y muros cambian con cada partida; cada punto es alcanzable
  a.route=[];const dir=rng()<.5?1:-1,a0=Math.atan2(a.y,a.x);for(let i=0;i<10;i++){const ang=a0+dir*(i+1)*(.36+rng()*.14),rad=(i%2?1.3+rng()*.2:.75+rng()*.15);
    const rx=Math.cos(ang)*700*rad*WS,ry=Math.sin(ang)*330*rad*WS;let x=rx*.92+ry*.39,y=-rx*.39+ry*.92;const d=Math.hypot(x,y);if(d>ARENA-260){x*=(ARENA-260)/d;y*=(ARENA-260)/d;}
    const p=R.d(x,y)>=0?[x,y]:qNearSpot(R,rng,x,y,160);a.route.push(p);}
  a.walls=[];const segs=[1,2,3,4,5,6,7,8].sort(()=>rng()-.5).slice(0,3);
  for(const i of segs){const[p0,p1]=[a.route[i],a.route[i+1]];const mx=(p0[0]+p1[0])/2,my=(p0[1]+p1[1])/2;if(!qFree(mx,my,40)||R.d(mx,my)<0||slopeAt(mx,my)>.3)continue;const ang=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]);const gy=groundAt(mx,my);
    const w=qMesh(GEO.box(14,30,90),st,mx,gy+15,my);w.rotation.y=-ang;for(const o of[-30,0,30]){const cx=mx-Math.sin(ang)*o,cy=my+Math.cos(ang)*o;WORLD.coll.push({x:cx,y:cy,r:12,top:groundAt(cx,cy)+30});}a.walls.push([mx,my]);}}
function qPlaceFlame(a,R,rng,st,dark,avoid){if(!a)return;const q=G.q;const g=new THREE.Group();g.position.set(a.x,groundAt(a.x,a.y),a.y);WORLD.group.add(g);qMesh(GEO.cyl(18,24,30,8),st,0,15,0,g);
  const fl=new THREE.Mesh(GEO.cone(9,26,6),MB('#ffb040'));fl.position.y=44;g.add(fl);const gl=qGlow('#ff8a2a',110);gl.position.y=44;g.add(gl);const rg=qRing(QDEF.llama.col,52);rg.position.y=2;g.add(rg);a.obj=g;a.fire=[fl,gl];
  const av2=avoid.concat([[a.x,a.y,450]]);
  for(let i=0;i<2;i++){const s=qSpot(rng,R,a.x,a.y,560,880,av2.concat(q.braz.map(b=>[b.x,b.y,650])));if(!s)continue;const b={x:s[0],y:s[1],r:95,lit:false};const bg=new THREE.Group();bg.position.set(b.x,groundAt(b.x,b.y),b.y);WORLD.group.add(bg);
    qMesh(GEO.cyl(9,13,34,8),st,0,17,0,bg);qMesh(GEO.cyl(22,12,12,10),dark,0,38,0,bg);const ff=new THREE.Mesh(GEO.cone(16,34,7),MB('#ff9a2a'));ff.position.y=60;ff.visible=false;bg.add(ff);const fg=qGlow('#ff8a2a',190);fg.position.y=56;fg.visible=false;bg.add(fg);
    const br=qRing('#ff8a2a',b.r,.5);br.position.y=2;br.visible=false;bg.add(br);const mark=qGlow('#ffd8a0',60);mark.position.y=46;bg.add(mark);b.obj=bg;b.fire=[ff,fg,br];b.mark=mark;q.braz.push(b);WORLD.coll.push({x:b.x,y:b.y,r:14,top:groundAt(b.x,b.y)+44});}
  const mk=(x0,y0)=>{const[x,y]=qNearSpot(R,rng,x0,y0,140);const s={x,y,r:78};const sg=new THREE.Group();sg.position.set(x,groundAt(x,y),y);WORLD.group.add(sg);
    for(const[px,pz]of[[-34,-26],[34,-26],[-34,26],[34,26]])qMesh(GEO.cyl(3,3,58,5),MLT('#6a4a2a','bark'),px,29,pz,sg);
    const roof=qMesh(GEO.cone(62,30,4),MLT('#c8a050','thatch').clone(),0,72,0,sg);roof.material.transparent=true;s.roof=roof;roof.rotation.y=.785;const rg2=qRing('#8fd8ff',s.r,.75);rg2.position.y=2;sg.add(rg2);
    const disc=new THREE.Mesh(new THREE.CircleGeometry(s.r,32),MB('#8fd8ff',{transparent:true,opacity:.12,depthWrite:false}));disc.rotation.x=-Math.PI/2;disc.position.y=1.5;sg.add(disc);s.obj=sg;s.ring=rg2;q.shelters.push(s);};
  for(const b of q.braz)for(const t of[.42,.78])mk(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);
  {const s=qSpot(rng,R,a.x,a.y,200,520,[]);if(s)mk(s[0],s[1]);}
  q.mkShelter=mk;q.flameA=a;}
/* garantía de la brasa: desde cualquier punto de la zona, un refugio a menos de 1100 caminando (con todos los obstáculos ya colocados) */
function qEnsureShelters(R){const q=G.q,a=q.flameA,mk=q.mkShelter;if(!a)return;
  for(let it=0;it<4;it++){const f=qShelterField(R,q.shelters);let worst=-1,wk=-1;const pts=[a,...q.braz];
    for(let k=0;k<f.length;k++){if(R.dist[k]<0)continue;const i=k%R.N,j=(k-i)/R.N,x=R.ox+i*R.C,y=R.oy+j*R.C;if(!pts.some(p=>Math.hypot(p.x-x,p.y-y)<700))continue;const v=f[k]<0?1e9:f[k];if(v>worst){worst=v;wk=k;}}
    q.emberWorst=worst;if(worst<=1100||wk<0)break;const i=wk%R.N,j=(wk-i)/R.N;mk(R.ox+i*R.C,R.oy+j*R.C);}}
function qPlaceSeals(a,R,rng,st,sx,sy){if(!a)return;const q=G.q;const g=new THREE.Group();g.position.set(a.x,groundAt(a.x,a.y),a.y);WORLD.group.add(g);a.ang=Math.atan2(sy-a.y,sx-a.x);g.rotation.y=-a.ang+Math.PI/2;
  for(const sx2 of[-40,40]){qMesh(GEO.box(18,90,18),st,sx2,45,0,g);}qMesh(GEO.box(104,18,22),st,0,98,0,g);
  const bar=new THREE.Mesh(new THREE.PlaneGeometry(62,88),new THREE.MeshBasicMaterial({color:'#c8a0ff',transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false}));bar.position.y=44;g.add(bar);a.barrier=bar;
  const lg=qGlow('#c8a0ff',120);lg.position.y=50;g.add(lg);a.obj=g;
  for(const o of[-40,40]){const cx=a.x+Math.cos(a.ang+Math.PI/2)*o,cy=a.y+Math.sin(a.ang+Math.PI/2)*o;WORLD.coll.push({x:cx,y:cy,r:14,top:groundAt(cx,cy)+90});}
  const off=rng()*.5-.25;for(let i=0;i<3;i++){const ang=a.ang+off+(i-1)*(.9+rng()*.3);const[x,y]=qNearSpot(R,rng,a.x+Math.cos(ang)*(150+rng()*50),a.y+Math.sin(ang)*(150+rng()*50),60);const s={x,y,r:26,hp:1};const sg=new THREE.Group();sg.position.set(x,groundAt(x,y),y);WORLD.group.add(sg);
    const disk=qMesh(GEO.cyl(26,30,10,10),st,0,5,0,sg);const glyph=new THREE.Mesh(GEO.oct(10),MB('#c8a0ff'));glyph.position.y=26;sg.add(glyph);const sr=qRing('#c8a0ff',40);sr.position.y=2;sg.add(sr);const gw=qGlow('#c8a0ff',70);gw.position.y=24;sg.add(gw);
    s.obj=sg;s.glyph=glyph;s.parts=[glyph,sr,gw];s.disk=disk;q.seals.push(s);}}
function favorPick(){for(const fid in FAVORS){const F=FAVORS[fid];const giver=F.givers.find(id=>!players.some(p=>p.god===id));if(giver)return{fid,giver};}return null;}
function qPlaceFavor(a,R,rng,st,gold,avoid){if(!a)return;const fp=favorPick();if(!fp){G.q.anch=G.q.anch.filter(x=>x!==a);return;}a.fid=fp.fid;a.giver=fp.giver;
  const g=new THREE.Group();g.position.set(a.x,groundAt(a.x,a.y),a.y);WORLD.group.add(g);
  qMesh(GEO.cyl(30,36,14,8),st,0,7,0,g);qMesh(GEO.cyl(24,28,6,8),gold,0,16,0,g);const rg=qRing('#ffe060',58);rg.position.y=2;g.add(rg);const gl=qGlow('#ffe060',60);gl.material.opacity=.55;gl.position.y=24;g.add(gl);a.obj=g;
  WORLD.coll.push({x:a.x,y:a.y,r:20,top:groundAt(a.x,a.y)+14});
  const s=qSpot(rng,R,a.x,a.y,1050,1500,avoid);a.relic=s?{x:s[0],y:s[1]}:{x:-a.x,y:-a.y};}

/* ---------- ofertas y aceptación ---------- */
function relWord(p,giver){const rl=relOf(p.god,giver);return rl?rl.type:'neutral';}
function favorText(a,p){const F=FAVORS[a.fid],giver=GOD[a.giver];p=p||players[0];const rw=relWord(p,a.giver);const cnt=(G.concCount&&G.concCount[F.tag])||0;
  const rel={aliado:`${giver.name} es aliado de ${p.g.name}: cazadores cada ${Q_HUNT.aliado} s.`,neutral:`${giver.name} no tiene relación con ${p.g.name}: cazadores cada ${Q_HUNT.neutral} s.`,rival:`${giver.name} es rival de ${p.g.name}: cazadores cada ${Q_HUNT.rival} s y el perseguidor es más rápido.`}[rw];
  return{icon:F.icon,col:F.col,name:`Favor de ${giver.name}`,give:`Lo ofrece ${giver.name}; puede aceptarlo cualquier dios. Trae ${F.relic}, una piedra sagrada lejana, hasta su altar.`,
    rew:`${F.title} toda la partida. ${F.desc} Además suma 1 de las 3 fuentes del ${CONCILIOS[F.tag].name} (ahora tienes ${cnt}/3); con el Concilio activo, +50 % de daño.`,
    risk:`La Illa pesa (−10 % de velocidad). Un perseguidor te sigue y embiste (desliza para esquivarlo) y los cazadores salen por delante. ${rel}`,meta:rel};}
function qInfo(a){return a.id==='favor'?favorText(a,G.q&&G.q.offerP):QDEF[a.id];}
function qThiefHp(){let best=0;for(const p of qHumans()){let s=0;for(const k in p.weapons){const W=WEAPONS[k],l=p.weapons[k].lvl,st=kst(W,l,p),cd=(st.cd||1)*p.cdMul;
      switch(W.k){case'chain':s+=st.dmg*st.bolts/cd;break;case'shot':s+=st.dmg*Math.min(st.count,3)/cd;break;case'line':case'bounce':case'nova':case'melee':s+=st.dmg/cd;break;
        case'boomer':s+=st.dmg*Math.min(st.count,2)*1.5/cd;break;case'homing':s+=st.dmg*st.count/cd;break;case'sword':s+=st.dmg*1.5*st.count/cd;break;case'orbit':s+=st.dmg*2;break;case'aura':s+=st.dmg/st.tick;break;case'trail':s+=st.dmg;break;}}
    best=Math.max(best,s*pMul(p));}
  return Math.max(160,best*9);}
function questAccept(a,p){const q=G.q;if(q.active.length>=QMAX){texts.push({x:a.x,y:a.y,z:groundAt(a.x,a.y)+70,v:'Máximo 2 encargos a la vez',t:1.2,c:'#ff6a5a'});return;}
  q.offerP=p;const inf=qInfo(a);a.state='active';const A={id:a.id,a,t:0,by:p};q.active.push(A);banner(`Encargo aceptado: ${inf.name}`);
  switch(a.id){
  case'ladron':{a.chest.forEach(m=>m.visible=false);const hp=qThiefHp();
    A.e=qEnemy('atoq',a.x+20,a.y,{hp,qcap:hp*.25,qbud:hp*.1,spd:170,dmg:4,r:16,xp:6,qq:A,qai:thiefAI,onHit:(e)=>{e.stag=.45;}});A.wp=0;A.left=50;A.stum=0;A.burst=1.8;A.nextSt=rand(4,5);G.qPrio=A.e;
    say(p,'¡Eh, eso es mío!',.2);bigBanner('¡ATOQ ROBA EL COFRE!','Corre casi como tú: pégate a él y salta los muros');break;}
  case'llama':{A.carrier=p;p.qFlame=true;A.f=100;A.lit=0;A.storm=0;A.warn=0;A.next=7;A.weak=null;a.fire.forEach(m=>m.visible=false);bigBanner('LLEVAS LA LLAMA DE INTI','Enciende los dos braseros · refúgiate en los tambos cuando llegue la ventisca');break;}
  case'sellos':{const gx=a.x+Math.cos(a.ang)*60,gy=a.y+Math.sin(a.ang)*60;A.e=spawnGiant(A,gx,gy);A.left=Q_SEAL_TIME;bigBanner('EL GUARDIÁN DESPIERTA','Los sellos lo protegen: ponte junto a uno y esquiva su golpe para que lo rompa');break;}
  case'favor':{A.carrier=null;A.relic={x:a.relic.x,y:a.relic.y};A.hunt=0;A.rel=relWord(p,a.giver);bigBanner(`${GOD[a.giver].name.toUpperCase()} ESPERA ${FAVORS[a.fid].relic.toUpperCase()}`,'Sigue el haz de luz dorada');say(p,'Iré por ella.',.3);break;}
  }}
function questEnd(A,ok,msg,sub,recentTxt){const q=G.q;q.active=q.active.filter(x=>x!==A);A.a.state=ok?'done':'failed';
  if(!ok&&A.e&&!A.e.dead){A.e.dead=true;fx.push({k:'ring',x:A.e.x,y:A.e.y,r:70,t:.5,max:.5,col:'#ffffff'});}
  if(A.stalker&&!A.stalker.dead){A.stalker.dead=true;fx.push({k:'ring',x:A.stalker.x,y:A.stalker.y,r:80,t:.5,max:.5,col:'#ff4d5e'});for(let i=0;i<16;i++)fx.push({k:'p',x:A.stalker.x,y:A.stalker.y,z:A.stalker.z+20,vx:rand(-90,90),vy:rand(-90,90),vz:rand(60,200),t:.6,c:'#3a1a1a'});}
  if(A.carrier){A.carrier.qFlame=false;A.carrier.qRelic=false;}if(G.qPrio&&A.e===G.qPrio)G.qPrio=null;
  if(ok)G.qfx.done++;qRecent(A,ok,recentTxt||(ok?'Completado':'Fallido'));bigBanner(msg,sub||'');}
function questAbandon(A){questEnd(A,false,'ENCARGO ABANDONADO',qInfo(A.a).name,'Abandonado');}

/* ---------- A · ladrón ---------- */
function thiefAI(e,tg,dt){const A=e.qq,a=A.a;const[h,d]=qNearest(e.x,e.y);let k=d>460?.42:d>300?.78:d<130?1.06:.95;
  e.qbud=Math.min(e.maxHp*.25,e.qbud+e.maxHp*.12*dt);   // como mucho ~12 % de su aguante por segundo
  if(A.burst>0){A.burst-=dt;k=1.7;}
  if(A.burst>0){}else if(A.stum>0){A.stum-=dt;k=0;}else{A.nextSt-=dt;if(A.nextSt<=0){A.nextSt=rand(3.6,5);A.stum=.9;texts.push({x:e.x,y:e.y,z:e.z+40,v:'¡Tropieza!',t:.9,c:'#ffd060'});}}
  if(e.stag>0){e.stag-=dt;k*=.55;}
  e.spd=h?qSpeed(h):170;   // se adapta a tu velocidad actual (ventisca, furia, mejoras)
  const w=a.route[A.wp%a.route.length];const dx=w[0]-e.x,dy=w[1]-e.y,dd=Math.hypot(dx,dy)||1;if(dd<34)A.wp++;
  const sp=e.spd*k;if(d<=620){e.x+=dx/dd*sp*dt;e.y+=dy/dd*sp*dt;}e.fx=dx;e.fy=dy;
  const g0=groundAt(e.x,e.y);e.hop=Math.max(0,(e.hop||0)-dt*3);if(Math.abs(g0-(e.lg||g0))>8)e.hop=1;e.lg=g0;e.z=g0+Math.sin(e.hop*Math.PI)*26;}
function thiefUpdate(A,dt){A.left-=dt;if(A.e.dead)return;if(A.left<=0){questEnd(A,false,'ATOQ ESCAPÓ','Se esfumó con el cofre. La partida sigue.','Atoq escapó');}}

/* ---------- B · llama ---------- */
function flameUpdate(A,dt){const q=G.q;const c=A.carrier;
  if(A.storm>0){A.storm-=dt;A.sAcc=(A.sAcc||0)+dt;if(A.sAcc>.5/DF().ev){A.sAcc=0;const t=c||pick(qHumans())||players[0];fx.push({k:'tele',shape:'circle',x:t.x+rand(-240,240),y:t.y+rand(-240,240),r:46,t:1.2,dmg:16*DF().dmg,col:'#9fe0ff',snow:true});}
    if(A.storm<=0){A.next=rand(28,36);banner('La ventisca amaina');}}
  else if(A.warn>0){A.warn-=dt;if(A.warn<=0){A.storm=11;G.slowT=Math.max(G.slowT,11);bigBanner('¡VENTISCA!','Métete en un tambo: fuera de él la llama se debilita');}}
  else{A.next-=dt;if(A.next<=0){A.warn=5;bigBanner('SE ACERCA UNA VENTISCA','Tienes 5 s para llegar a un tambo (anillo azul)');}}
  if(c){if(c.down){dropFlame(A);return;}
    const safe=inShelter(c);
    if(A.weak!=null){A.weak-=dt;if(safe){A.weak=null;A.f=40;banner('¡La llama revive! (40 %)');for(let i=0;i<14;i++)fx.push({k:'p',x:c.x,y:c.y,z:c.z+66,vx:rand(-60,60),vy:rand(-60,60),vz:rand(60,160),t:.5,c:'#ffd060'});}
      else if(A.weak<=0){c.qFlame=false;A.carrier=null;flameFail(A);return;}
      for(const b of q.braz)if(!b.lit&&Math.hypot(c.x-b.x,c.y-b.y)<60&&(!A.msgT||G.t-A.msgT>2)){A.msgT=G.t;texts.push({x:b.x,y:b.y,z:groundAt(b.x,b.y)+80,v:'La brasa no basta: reavívala en un tambo',t:1.4,c:'#ffb040'});}
      return;}
    if(A.storm>0&&!safe)A.f-=8*dt;else if(safe)A.f=Math.min(100,A.f+12*dt);
    for(const b of q.braz){if(b.lit)continue;if(Math.hypot(c.x-b.x,c.y-b.y)<60){b.lit=true;b.fire.forEach(m=>m.visible=true);b.mark.visible=false;A.lit++;A.f=100;
      for(let i=0;i<26;i++)fx.push({k:'p',x:b.x,y:b.y,z:groundAt(b.x,b.y)+50,vx:rand(-120,120),vy:rand(-120,120),vz:rand(80,300),t:rand(.4,.8),c:i%2?'#ffd060':'#ff6a1a'});
      if(A.lit>=q.braz.length){c.qFlame=false;A.carrier=null;G.qfx.fire=true;questEnd(A,true,'¡FUEGO DE INTI!','Tus golpes queman · los braseros son refugios en las ventiscas','Fuego de Inti conseguido');return;}
      banner(`Brasero encendido (${A.lit}/${q.braz.length}) · la llama recupera su fuerza`);}}
    if(A.f<=0){A.f=0;A.weak=Q_EMBER;bigBanner('LA LLAMA SE HA REDUCIDO A UNA BRASA',`Llévala a un tambo o a un brasero encendido antes de ${Q_EMBER} s`);fx.push({k:'ring',x:c.x,y:c.y,r:50,t:.5,max:.5,col:'#ff4a2a'});}}
  else{const em=A.ember;if(!em)return;em.t-=dt;if(em.t<=0){A.ember=null;flameFail(A);return;}
    for(const p of qHumans()){if(Math.hypot(p.x-em.x,p.y-em.y)<36){A.carrier=p;p.qFlame=true;A.weak=em.t;A.ember=null;banner('Recoges la brasa · reavívala en un tambo');break;}}}}
function flameFail(A){const a=A.a;for(let i=0;i<20;i++)fx.push({k:'p',x:a.x+rand(-10,10),y:a.y+rand(-10,10),z:groundAt(a.x,a.y)+40,vx:rand(-20,20),vy:rand(-20,20),vz:rand(30,90),t:1.2,c:'#6a6a72'});
  questEnd(A,false,'LA LLAMA SE APAGÓ DEL TODO',A.lit?'Encargo fallido · los braseros que encendiste siguen dando refugio':'Encargo fallido · la partida sigue','La llama se apagó');}
function dropFlame(A){const c=A.carrier;if(!c)return;c.qFlame=false;A.carrier=null;const t=A.weak!=null?A.weak:Q_EMBER;A.weak=null;A.f=0;A.ember={x:c.x,y:c.y,t};banner(`La brasa cayó al suelo · recógela antes de ${Math.ceil(t)} s`);fx.push({k:'ring',x:c.x,y:c.y,r:50,t:.5,max:.5,col:'#ff4a2a'});}
function qFlameHit(p){const A=qActive('llama');if(A&&A.carrier===p&&A.weak==null)A.f-=5;}

/* ---------- C · sellos y guardián ---------- */
function sealsLeft(){return G.q.seals.filter(s=>s.hp>0).length;}
function spawnGiant(A,x,y){const DD=DF();const hp=2200*(1+G.ridx*.7)*DD.hp*(players.length>1?1.4:1);
  const e=qEnemy('apu',x,y,{hp,spd:46,dmg:22*DD.dmg*(1+G.ridx*.3),r:34,xp:40,qq:A,qai:giantAI,qmul:.35,qfloor:.3,wind:0,cool:1.5,
    onHit:(e2,d,p)=>{if(e2.qmul<1&&p&&(!e2.armT||G.t-e2.armT>6)){e2.armT=G.t;texts.push({x:e2.x,y:e2.y,z:e2.z+110,v:`Coraza de sellos: solo 35 % · quedan ${sealsLeft()}`,t:1.6,c:'#c8a0ff'});}},
    onFloor:(e2)=>{if(!e2.kneelT||G.t-e2.kneelT>10){e2.kneelT=G.t;e2.stun=2.5;e2.wind=0;banner('Los sellos lo mantienen en pie: atrae su golpe hacia un sello');}}});
  fx.push({k:'ring',x,y,r:110,t:.6,max:.6,col:'#c8a0ff'});G.shake=Math.max(G.shake,.5);return e;}
function giantAI(e,tg,dt,sp){if(e.wind>0){e.wind-=dt;return;}if(e.cool>0)e.cool-=dt;if(!tg)return;
  const dx=tg.x-e.x,dy=tg.y-e.y,d=Math.hypot(dx,dy)||1;e.fx=dx;e.fy=dy;
  if(d<200&&e.cool<=0){fx.push({k:'tele',shape:'circle',x:tg.x,y:tg.y,r:92,t:1.2,max:1.2,dmg:26*DF().dmg*(1+G.ridx*.3),col:'#c8a0ff',qslam:e});e.wind=1.25;e.cool=1.9;texts.push({x:e.x,y:e.y,z:e.z+90,v:'¡GOLPE!',t:.8,c:'#c8a0ff'});return;}
  if(d>60){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt;}}
function questSlam(f){const q=G.q;if(!q)return;const A=qActive('sellos');G.shake=Math.max(G.shake,.55);
  for(let i=0;i<18;i++)fx.push({k:'p',x:f.x+rand(-40,40),y:f.y+rand(-40,40),z:groundAt(f.x,f.y)+4,vx:rand(-120,120),vy:rand(-120,120),vz:rand(100,280),t:rand(.4,.8),c:i%2?'#a8a090':'#c8a0ff'});
  near(f.x,f.y,f.r+40,e=>{const ee=e.proxy||e;if(ee===f.qslam||ee.boss)return;if((e.x-f.x)**2+(e.y-f.y)**2<(f.r+e.r)**2)hurt(e,80+G.level*6,null);});
  if(!A)return;let broke=false;
  for(const s of q.seals){if(s.hp<=0)continue;if(Math.hypot(s.x-f.x,s.y-f.y)<f.r+s.r*.6){s.hp=0;broke=true;s.parts.forEach(m=>m.visible=false);s.disk.rotation.z=.25;s.disk.position.y=2;
      for(let i=0;i<24;i++)fx.push({k:'p',x:s.x,y:s.y,z:groundAt(s.x,s.y)+16,vx:rand(-160,160),vy:rand(-160,160),vz:rand(120,320),t:rand(.5,.9),c:'#c8a0ff'});
      const left=sealsLeft();banner(left?`¡Sello roto! Quedan ${left}`:'¡El último sello se rompe!');if(!left){openGate(A,true);return;}}}
  if(!broke&&(!A.hintT||G.t-A.hintT>10)){A.hintT=G.t;const near2=q.seals.filter(s=>s.hp>0).map(s=>Math.hypot(s.x-f.x,s.y-f.y));if(Math.min(...near2)>f.r+60)banner('Ese golpe no tocó ningún sello: colócate junto a uno antes de que pegue');}}
function openGate(A,full){const a=A.a;a.barrier.visible=false;const rng=Math.random;const ix=a.x-Math.cos(a.ang)*40,iy=a.y-Math.sin(a.ang)*40;
  {const[x,y]=qNearSpot(G.q.R,rng,ix,iy,40);WORLD.chests.push({x,y,opened:false,rich:full,free:true});}
  if(full){const[x,y]=qNearSpot(G.q.R,rng,a.x-Math.cos(a.ang)*110,a.y-Math.sin(a.ang)*110,60);const gg=new THREE.Group();gg.position.set(x,groundAt(x,y)+6,y);WORLD.group.add(gg);qMesh(GEO.cyl(20,24,12,8),MLT('#8a8a8a','stone'),0,0,0,gg);const gem=new THREE.Mesh(GEO.oct(9),MB('#c8a0ff'));gem.position.y=32;gg.add(gem);WORLD.altars.push({x,y,charge:0,used:false,obj:gg,gem});}
  const e=A.e;if(e&&!e.dead){if(full){e.qmul=1;e.qfloor=0;e.elite=true;}else{e.qfloor=0;e.hp=0;kill(e,null);}}
  questEnd(A,full,full?'¡LA PUERTA DEL APU SE ABRE!':'EL GUARDIÁN SE DESMORONA',full?'Dentro: un cofre del jefe y un altar · el Guardián pierde su coraza':'Se acabó el tiempo: la puerta cede a medias y deja un cofre normal',full?'Puerta abierta':'Puerta a medias (tiempo)');
  if(full)setTimeout(()=>{if(G&&state==='play')banner('Aprendido: algunos jefes se hieren con sus propios golpes');},3600);}
function sealsUpdate(A,dt){A.left-=dt;if(A.left<=0)openGate(A,false);}

/* ---------- favor divino ---------- */
function favorUpdate(A,dt){const a=A.a,F=FAVORS[a.fid];
  if(A.stalker&&A.stalker.dead&&!A.stalkerDone){A.stalkerDone=true;banner('¡Derrotaste al perseguidor! Ya no volverá');}
  if(!A.carrier){const r=A.relic;for(const p of qHumans()){if(Math.hypot(p.x-r.x,p.y-r.y)<36){A.carrier=p;p.qRelic=true;A.hunt=2;banner(`Tienes ${F.relic} · llévala al altar`);
        if(!A.stalkerDone&&(!A.stalker||A.stalker.dead)){{const[x,y]=spawnPos(Math.atan2(a.y-p.y,a.x-p.x)+rand(-.6,.6));A.stalker=qEnemy('supay',x,y,{hp:900*(1+G.ridx*.7)*DF().hp,spd:150,dmg:14*DF().dmg,r:22,xp:20,qq:A,elite:true,qai:stalkAI,lcd:3});bigBanner('UN PERSEGUIDOR HUELE LA ILLA','Embiste en línea recta: desliza (Shift) para esquivarlo');}}
        if(A.stalker&&!A.stalker.dead)A.stalker.stalk=p;break;}}return;}
  const c=A.carrier;if(c.down){c.qRelic=false;A.relic={x:c.x,y:c.y};A.carrier=null;if(A.stalker)A.stalker.stalk=null;banner('¡Se te cayó la Illa! El perseguidor la vigila');return;}
  A.relic={x:c.x,y:c.y};A.hunt-=dt;if(A.hunt<=0){A.hunt=Q_HUNT[A.rel]||6;const ah=Math.atan2(a.y-c.y,a.x-c.x);for(let i=0;i<2;i++){const[x,y]=spawnPos(ah+rand(-.5,.5));qEnemy('supay',x,y,{hp:ENEMIES.supay.hp*(1+G.ridx*.85+G.rt/60*.34)*DF().hp*2.5,spd:ENEMIES.supay.spd*1.3,dmg:ENEMIES.supay.dmg*DF().dmg*1.3,r:14,xp:4,quest:false,heavy:false,hunter:true});}}
  if(Math.hypot(c.x-a.x,c.y-a.y)<64){c.qRelic=false;A.carrier=null;G.qfx.favor={by:a.giver,fid:a.fid,tag:F.tag};questEnd(A,true,`FAVOR DE ${GOD[a.giver].name.toUpperCase()}`,`${F.title}: ${CONCILIOS[F.tag].name} +1`,F.title+' conseguido');computeConc();
    for(let i=0;i<4;i++)strike(a.x+rand(-60,60),a.y+rand(-60,60),0,null,'#ffe060');}}
function stalkAI(e,tg,dt){const A=e.qq;const t=e.stalk&&!e.stalk.down?e.stalk:null;
  if(e.lunge>0){e.lunge-=dt;e.x+=e.lvx*dt;e.y+=e.lvy*dt;return;}
  if(e.lwind>0){e.lwind-=dt;if(e.lwind<=0){e.lunge=.38;e.lvx=e.ldx*600;e.lvy=e.ldy*600;}return;}
  if(!t){const r=A&&A.relic;if(r){const dx=r.x-e.x,dy=r.y-e.y,d=Math.hypot(dx,dy)||1;if(d>70){e.x+=dx/d*150*dt;e.y+=dy/d*150*dt;}e.fx=dx;e.fy=dy;}return;}
  if(e.recoil>0){e.recoil-=dt;const rx=e.x-t.x,ry=e.y-t.y,rd=Math.hypot(rx,ry)||1;e.x+=rx/rd*120*dt;e.y+=ry/rd*120*dt;return;}
  e.lcd-=dt;const dx=t.x-e.x,dy=t.y-e.y,d=Math.hypot(dx,dy)||1;e.fx=dx;e.fy=dy;if(d<e.r+t.r+8){e.recoil=.8;}
  if(d<300&&e.lcd<=0){e.lcd=A&&A.rel==='rival'?4:5;e.lwind=.65;e.ldx=dx/d;e.ldy=dy/d;fx.push({k:'tele',shape:'line',x:e.x,y:e.y,x2:e.x+e.ldx*240,y2:e.y+e.ldy*240,w:44,t:.65,max:.65,dmg:0,col:'#ff4d5e'});texts.push({x:e.x,y:e.y,z:e.z+60,v:'¡Embiste!',t:.8,c:'#ff4d5e'});return;}
  const sp=qSpeed(t)*(A&&A.rel==='rival'?.9:.82);e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt;}

/* ---------- transformaciones de combate ---------- */
function qOnHurt(e,p){if(Q_BURN||!p||!G.qfx||!G.qfx.fire||e.dead)return;e.burnQ=2.5;e.burnBy=p;}
function addPuddle(x,y,t){const q=G.q;if(!q)return;const o=q.puddles.find(z=>Math.hypot(z.x-x,z.y-y)<35);if(o){o.t=Math.max(o.t,t);return;}if(q.puddles.length>=18){q.puddles.sort((a,b)=>a.t-b.t);q.puddles.shift();}q.puddles.push({x,y,r:40,t});}
function qOnKill(e,p){if(G.qfx&&G.qfx.favor&&p&&!e.boss&&G.q&&Math.random()<.5)addPuddle(e.x,e.y,7);
  if(e===G.qPrio){const A=e.qq;G.qPrio=null;if(A&&A.a.state==='active'){WORLD.chests.push({x:e.x,y:e.y,opened:false,rich:true,free:true});questEnd(A,true,'¡COFRE RECUPERADO!','Ábrelo con E y elige tu objeto','Cofre recuperado');}}}
let Q_ZAP=0;
function puddleZap(pd,p,mult){const q=G.q;const zid=++Q_ZAP;const net=q.puddles.filter(o=>Math.hypot(o.x-pd.x,o.y-pd.y)<260);const dmg=(30+G.level*4)*(G.conc.trueno?1.5:1)*(mult||1);let hit=0;
  for(const o of net){near(o.x,o.y,o.r+60,e=>{const ee=e.proxy||e;if(ee._zapT===zid)return;if((e.x-o.x)**2+(e.y-o.y)**2<(o.r+e.r)**2){ee._zapT=zid;hurt(e,dmg*(ee.boss?.7:1),p);hit++;}});o.flash=.3;}
  if(net.length>1){const pts=net.slice(0,6).map(o=>[o.x,o.y,groundAt(o.x,o.y)+6]);fx.push({k:'bolt',pts,t:.25,col:'#9ad8ff',st:'bolt'});}return hit;}
function qOnStrike(x,y,p){const q=G.q;if(!q||!G.qfx||!G.qfx.favor||q.zapCd>0)return;const pd=q.puddles.find(o=>Math.hypot(o.x-x,o.y-y)<o.r+50);if(pd){q.zapCd=.35;puddleZap(pd,p,.8);}}
function questsTick(dt){const q=G.q;if(!q)return;
  if(G.qfx&&G.qfx.fire){Q_BURN=true;for(const e of enemies){if(!(e.burnQ>0)||e.dead)continue;e.burnQ-=dt;e.burnTick=(e.burnTick||0)-dt;if(e.burnTick<=0){e.burnTick=.5;hurt(e,(5+G.level*1.2)*(e.boss?.6:1),e.burnBy);if(Math.random()<.5)fx.push({k:'p',x:e.x+rand(-6,6),y:e.y+rand(-6,6),z:(e.z||0)+rand(6,24),vx:0,vy:0,vz:rand(40,90),t:.4,c:Math.random()<.5?'#ff8a3a':'#ffd060'});}}Q_BURN=false;}
  q.zapCd=Math.max(0,(q.zapCd||0)-dt);for(const o of q.puddles){o.t-=dt;o.flash=Math.max(0,(o.flash||0)-dt);}q.puddles=q.puddles.filter(o=>o.t>0);
  if(G.qfx&&G.qfx.favor){
    // contra jefes: la tormenta moja a jefes y élites cercanos aunque no mueran enemigos normales
    q.wetT-=dt;if(q.wetT<=0){q.wetT=4;const c=camera();for(const e of enemies){if(e.dead||!(e.boss||e.elite))continue;if(Math.hypot(e.x-c.x,e.y-c.y)<520)addPuddle(e.x,e.y,6);}}
    if(q.puddles.length){q.zapT-=dt;if(q.zapT<=0){q.zapT=2.5;let best=null,bn=0;for(const o of q.puddles){let n=0;near(o.x,o.y,o.r+60,e=>{const ee=e.proxy||e;if((e.x-o.x)**2+(e.y-o.y)**2<(o.r+e.r)**2)n+=ee.boss?4:1;});if(n>bn){bn=n;best=o;}}
      if(best){const p=players.find(z=>!z.down)||players[0];strike(best.x,best.y,0,p,'#9ad8ff');puddleZap(best,p);}}}}}

/* ---------- bucle por fotograma ---------- */
function questsUpdate(dt){const q=G.q;if(!q)return;questsTick(dt);
  for(const r of q.recent)r.t-=dt;q.recent=q.recent.filter(r=>r.t>0);
  for(const A of q.active.slice()){A.t+=dt;if(A.id==='ladron')thiefUpdate(A,dt);else if(A.id==='llama')flameUpdate(A,dt);else if(A.id==='sellos')sealsUpdate(A,dt);else if(A.id==='favor')favorUpdate(A,dt);}
  // ofertas: E solo acepta si esa pulsación no la usó otro objeto y no hay otro interactivo al lado
  const busy=!!G.prompt;q.offer=null;q.offerBlocked=false;
  for(const a of q.anch){if(a.state!=='offer')continue;for(const p of players){if(p.down||p.ctrl==='ai'||p.ctrl==='net'||p.ctrl==='npc')continue;if(Math.hypot(p.x-a.x,p.y-a.y)<72){q.offer=a;q.offerP=p;
      if(busy||p.eUsed){q.offerBlocked=busy;break;}
      if(p.wantE){p.wantE=false;p.eUsed=true;questAccept(a,p);}else G.prompt={x:a.x,y:a.y,t:q.active.length>=QMAX?'Ya llevas 2 encargos':'E · Aceptar encargo',bad:q.active.length>=QMAX};break;}}if(q.offer)break;}
  questsHud();}

/* ---------- interfaz ---------- */
function carrierTag(p){return players.length>1&&p?` (${p.ctrl==='p2'?'J2':'J1'})`:'';}
function qObjective(A){const q=G.q;switch(A.id){
  case'ladron':{const pct=A.e?A.e.hp/A.e.maxHp:0;return{t:`Atrapa a Atoq · ${Math.ceil(Math.max(0,A.left))} s`,pct:1-pct};}
  case'llama':if(A.carrier&&A.weak!=null)return{t:`BRASA${carrierTag(A.carrier)}: llévala a un tambo · ${Math.ceil(A.weak)} s`,pct:A.weak/Q_EMBER,cls:'ember'};
    if(A.carrier)return{t:(A.storm>0?'¡Ventisca! Refúgiate':A.warn>0?`Ventisca en ${Math.ceil(A.warn)} s`:`Braseros ${A.lit}/${q.braz.length}`)+` · llama ${Math.round(A.f)} %`+carrierTag(A.carrier),pct:A.f/100,warn:A.storm>0||A.warn>0};
    return{t:A.ember?`BRASA en el suelo: recógela · ${Math.ceil(A.ember.t)} s`:'',pct:A.ember?A.ember.t/Q_EMBER:0,cls:'ember'};
  case'sellos':{const left=sealsLeft();return{t:`Sellos rotos ${3-left}/3 · coraza ${left?'35 %':'rota'} · ${Math.ceil(A.left)} s`,pct:(3-left)/3};}
  case'favor':return{t:A.carrier?`Lleva la Illa al altar${carrierTag(A.carrier)} · ${Math.round(Math.hypot(A.carrier.x-A.a.x,A.carrier.y-A.a.y)/10)} m`:A.t>1&&A.stalker&&!A.stalker.dead?'¡Recupera la Illa! (vigilada)':'Busca la Illa (haz de luz dorada)',pct:A.carrier?.5:0};}
  return{t:'',pct:0};}
function questsHud(){const q=G.q,box=$('qHud'),of=$('qOffer');if(!box)return;
  const rows=q.active.map(A=>{const inf=qInfo(A.a),o=qObjective(A);return`<div class="qrow${o.warn?' warn':''}${o.cls?' '+o.cls:''}" style="--qc:${inf.col}"><span class="qi">${o.cls==='ember'?'♨':inf.icon}</span><div class="qtx"><b>${esc(inf.name)}</b><small>${esc(o.t)}</small><div class="qbar"><i style="width:${Math.round(clamp(o.pct,0,1)*100)}%"></i></div></div></div>`;}).join('')
    +q.recent.map(r=>`<div class="qrow ${r.ok?'ok':'fail'}" style="--qc:${r.col}"><span class="qi">${r.ok?'✔':'✖'}</span><div class="qtx"><b>${esc(r.name)}</b><small>${esc(r.txt)}</small></div></div>`).join('');
  if(q.hudK!==rows){q.hudK=rows;box.innerHTML=rows;box.hidden=!rows;}
  const a=q.offer,ok=a?a.id+(q.active.length>=QMAX)+q.offerBlocked+(q.offerP&&q.offerP.god):'';if(q.offK!==ok){q.offK=ok;if(!a){of.hidden=true;}else{const inf=qInfo(a);of.style.setProperty('--qc',inf.col);
    const act=q.active.length>=QMAX?'<em>Ya llevas 2 encargos: termina o abandona uno (pausa)</em>':q.offerBlocked?'<em>Hay otro objeto al lado: apártate un poco para aceptar</em>':`<button class="btn green" id="qAcc">${isTouch?'Aceptar':'E · Aceptar'}</button>`;
    of.innerHTML=`<div class="qoh"><span class="qi">${inf.icon}</span><b>${esc(inf.name)}</b><small>Encargo opcional</small></div><p>${esc(inf.give)}</p><div class="qrr"><span class="rw">Recompensa</span>${esc(inf.rew)}</div><div class="qrr"><span class="rk">Riesgo</span>${esc(inf.risk)}</div>
      ${G.online?'<div class="qmeta">Online: este encargo es solo tuyo; tu compañero tiene sus propios encargos y no se comparten.</div>':players.length>1?'<div class="qmeta">Cooperativo local: el encargo y su recompensa son de los dos.</div>':''}
      <div class="qact">${act}<span>Aléjate para ignorarlo</span></div>`;of.hidden=false;
    const b=$('qAcc');if(b)b.onclick=()=>{if(G&&G.q&&G.q.offer&&!G.q.offerBlocked)questAccept(G.q.offer,G.q.offerP||players[0]);focusGame();};}}}
function renderQuestPause(){let box=$('psQuests');const host=$('psItems')&&$('psItems').parentElement;if(!box&&host){host.insertAdjacentHTML('beforeend','<div class="hdr h-theme" style="border-radius:0"><span>Encargos</span><small>máx. 2</small></div><div class="body" id="psQuests"></div>');box=$('psQuests');}
  if(!box)return;const q=G&&G.q;const fxs=[];if(G&&G.qfx){if(G.qfx.fire)fxs.push('🔥 Fuego de Inti: tus golpes queman');if(G.qfx.favor){const F=FAVORS[G.qfx.favor.fid||'tormenta'];fxs.push(`${F.icon} Favor de ${GOD[G.qfx.favor.by].name}: ${F.title.toLowerCase()} · cuenta como 1 de las 3 fuentes del ${CONCILIOS[F.tag].name} (no es un arma)`);}}
  box.innerHTML=(q&&q.active.length?q.active.map((A,i)=>{const inf=qInfo(A.a);return`<div class="irow"><span class="iem">${inf.icon}</span><div><b>${esc(inf.name)}</b><p>${esc(qObjective(A).t)}</p></div><button class="btn red" data-qi="${i}">Abandonar</button></div>`;}).join(''):`<p class="mut">${q&&q.anch.length?'Sin encargos activos. Búscalos en el minimapa (rombos de colores).':'No hay encargos en este reino.'}</p>`)+(fxs.length?`<p style="margin-top:8px;font-weight:800">${fxs.map(esc).join('<br>')}</p>`:'')
    +(G&&G.online?'<p class="mut" style="margin-top:6px">Online: cada jugador tiene sus propios encargos.</p>':'');
  box.querySelectorAll('button[data-qi]').forEach(b=>b.onclick=()=>{const A=G.q.active[+b.dataset.qi];if(A)questAbandon(A);renderQuestPause();});}
{const sel=document.getElementById('qTestSel');if(sel){sel.value=cfg.qTest||'azar';sel.onchange=()=>{cfg.qTest=sel.value;};}}

/* ---------- objetivos actuales (flechas y minimapa) ---------- */
function qTargets(){const q=G&&G.q;const out=[];if(!q)return out;
  for(const A of q.active){const col=qInfo(A.a).col;switch(A.id){
    case'ladron':if(A.e&&!A.e.dead)out.push({x:A.e.x,y:A.e.y,col,t:'Atoq'});break;
    case'llama':if(A.carrier&&(A.weak!=null||A.storm>0||A.warn>0)){const c=A.carrier;let best=null,bd=1e12;for(const z of q.shelters.concat(q.braz.filter(b=>b.lit))){const d=(z.x-c.x)**2+(z.y-c.y)**2;if(d<bd){bd=d;best=z;}}if(best)out.push({x:best.x,y:best.y,col:'#8fd8ff',t:'Tambo'});}
      if(A.carrier&&A.weak==null){for(const b of q.braz)if(!b.lit)out.push({x:b.x,y:b.y,col,t:'Brasero'});}else if(A.ember)out.push({x:A.ember.x,y:A.ember.y,col:'#ff4a2a',t:'Brasa'});break;
    case'sellos':for(const s of q.seals)if(s.hp>0)out.push({x:s.x,y:s.y,col,t:'Sello'});break;
    case'favor':out.push(A.carrier?{x:A.a.x,y:A.a.y,col,t:'Altar'}:{x:A.relic.x,y:A.relic.y,col,t:'Illa'});break;}}
  return out;}
function questsOverlay(g,P2){const q=G&&G.q;if(!q)return;
  g.font='800 12px Nunito,sans-serif';g.textAlign='center';g.textBaseline='middle';
  const c=camera();for(const a of q.anch){if(a.state!=='offer')continue;const inf=qInfo(a);const d=Math.hypot(a.x-c.x,a.y-c.y);if(d>900)continue;const s=toScreen(a.x,a.y,groundAt(a.x,a.y)+(a.id==='sellos'?140:90));if(!s)continue;
    g.fillStyle='rgba(18,22,38,.9)';g.beginPath();g.arc(s[0],s[1],15,0,6.283);g.fill();g.strokeStyle=inf.col;g.lineWidth=3;g.stroke();g.font='15px sans-serif';g.fillStyle='#fff';g.fillText(inf.icon,s[0],s[1]+1);
    if(d<520){g.font='800 12px Nunito,sans-serif';const w=g.measureText(inf.name).width+14;g.fillStyle='rgba(18,22,38,.85)';g.fillRect(s[0]-w/2,s[1]+19,w,18);g.fillStyle=inf.col;g.fillText(inf.name,s[0],s[1]+28);}}
  for(const A of q.active){if(A.id==='llama'){const p=A.carrier;if(p){const s=toScreen(p.x,p.y,p.z+70);if(s){if(A.weak!=null){g.font='900 12px Nunito,sans-serif';g.fillStyle='#000';g.fillText(`BRASA ${Math.ceil(A.weak)} s`,s[0]+1,s[1]+1);g.fillStyle='#ff6a4a';g.fillText(`BRASA ${Math.ceil(A.weak)} s`,s[0],s[1]);}
          else{g.fillStyle='rgba(0,0,0,.6)';g.fillRect(s[0]-22,s[1]-4,44,8);g.fillStyle=A.f>40?'#ffb040':'#ff4d3a';g.fillRect(s[0]-21,s[1]-3,42*clamp(A.f/100,0,1),6);}}}
      else if(A.ember){const s=toScreen(A.ember.x,A.ember.y,groundAt(A.ember.x,A.ember.y)+36);if(s){g.font='900 12px Nunito,sans-serif';g.fillStyle='#000';g.fillText(`Brasa · ${Math.ceil(A.ember.t)} s`,s[0]+1,s[1]+1);g.fillStyle='#ff6a4a';g.fillText(`Brasa · ${Math.ceil(A.ember.t)} s`,s[0],s[1]);}}}}
  const tg=qTargets();const cyw=Math.cos(G.yaw),syw=Math.sin(G.yaw);
  for(const t of tg){const s=toScreen(t.x,t.y,groundAt(t.x,t.y)+30);if(s&&s[0]>30&&s[0]<W-30&&s[1]>30&&s[1]<H-30){g.strokeStyle=t.col;g.lineWidth=3;g.beginPath();g.arc(s[0],s[1],12+Math.sin(T*6)*2,0,6.283);g.stroke();continue;}
    const ddx=t.x-c.x,ddy=t.y-c.y;const a=Math.atan2(ddx*syw+ddy*cyw,ddx*cyw-ddy*syw);const rr=Math.min(W,H)/2-56;const ax=W/2+Math.cos(a)*rr,ay=H/2+Math.sin(a)*rr;
    g.save();g.translate(ax,ay);g.rotate(a);g.fillStyle=t.col;g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(14,0);g.lineTo(-8,-9);g.lineTo(-8,9);g.closePath();g.fill();g.stroke();g.restore();
    g.font='800 11px Nunito,sans-serif';g.fillStyle='#000';g.fillText(t.t,ax+1-Math.cos(a)*22,ay+1-Math.sin(a)*22);g.fillStyle=t.col;g.fillText(t.t,ax-Math.cos(a)*22,ay-Math.sin(a)*22);}
  for(const a of q.anch){if(a.state!=='offer')continue;const[x,y]=P2(a.x,a.y);g.fillStyle=qInfo(a).col;g.beginPath();g.moveTo(x,y-5);g.lineTo(x+5,y);g.lineTo(x,y+5);g.lineTo(x-5,y);g.closePath();g.fill();g.strokeStyle='#000';g.lineWidth=1;g.stroke();}
  for(const t of tg){const[x,y]=P2(t.x,t.y);g.strokeStyle=t.col;g.lineWidth=2;g.beginPath();g.arc(x,y,4,0,6.283);g.stroke();}
  for(const s of q.shelters){const[x,y]=P2(s.x,s.y);g.fillStyle='#8fd8ff';g.fillRect(x-2,y-2,4,4);}
  for(const b of q.braz){if(!b.lit)continue;const[x,y]=P2(b.x,b.y);g.fillStyle='#ff8a2a';g.beginPath();g.arc(x,y,3.5,0,6.283);g.fill();}}

/* ---------- objetos 3D dinámicos ---------- */
function questsDraw(dt){const q=G&&G.q;if(!q)return;
  for(const A of q.active){
    if(A.id==='ladron'&&A.e&&!A.e.dead){const e=A.e;const o=objFor(A,'_ch',()=>{const g=new THREE.Group();const b=new THREE.Mesh(GEO.box(16,10,12),ML('#7a4a2a'));g.add(b);const l=new THREE.Mesh(GEO.box(17,4,13),MB(C.gold));l.position.y=7;g.add(l);const gw=qGlow('#ffd060',34);gw.material.opacity=.6;g.add(gw);return g;});o.position.set(e.x,e.z+40,e.y);o.rotation.y=T*3;}
    if(A.id==='llama'){const c=A.carrier;
      if(c&&A.weak==null){const o=objFor(A,'_fl',()=>{const g=new THREE.Group();const f=new THREE.Mesh(GEO.cone(6,16,6),MB('#ffb040'));g.add(f);g.add(qGlow('#ff8a2a',70));return g;});const k=.55+.45*clamp(A.f/100,0,1);o.scale.setScalar(k);o.position.set(c.x,c.z+66,c.y);
        const r=objFor(A,'_fr',()=>flatMesh(RINGG,'#ffb040',.7));r.scale.set(24,24,1);r.position.set(c.x,groundAt(c.x,c.y)+2,c.y);
        if(Math.random()<.4)fx.push({k:'p',x:c.x+rand(-4,4),y:c.y+rand(-4,4),z:c.z+70,vx:rand(-10,10),vy:rand(-10,10),vz:rand(30,70),t:.4,c:Math.random()<.5?'#ffd060':'#ff6a1a'});}
      const em=c&&A.weak!=null?{x:c.x,y:c.y,z:c.z+62,held:true}:A.ember?{x:A.ember.x,y:A.ember.y,z:groundAt(A.ember.x,A.ember.y)+8}:null;
      if(em){const o=objFor(A,'_em',()=>{const g=new THREE.Group();const coal=new THREE.Mesh(GEO.ico(6),MB('#a02010'));g.add(coal);g.add(qGlow('#ff3a1a',44));return g;});o.position.set(em.x,em.z,em.y);o.children[1].material.opacity=.4+.6*Math.abs(Math.sin(T*5));
        const r=objFor(A,'_er',()=>flatMesh(RINGG,'#ff4a2a',.85));r.scale.set(28,28,1);r.position.set(em.x,groundAt(em.x,em.y)+2,em.y);r.rotation.z=T*2;
        if(Math.random()<.3)fx.push({k:'p',x:em.x+rand(-3,3),y:em.y+rand(-3,3),z:em.z+6,vx:rand(-8,8),vy:rand(-8,8),vz:rand(20,50),t:.8,c:'#5a5a62'});}}
    if(A.id==='sellos'&&A.e&&!A.e.dead){const e=A.e;if(e.qmul<1){const sh=objFor(A,'_sh',()=>flatMesh(RINGW,'#c8a0ff',.85));sh.scale.set(e.r*1.9,e.r*1.9,1);sh.position.set(e.x,groundAt(e.x,e.y)+3,e.y);sh.rotation.z=T*1.5;
        const gl=objFor(A,'_sg',()=>{const s=qGlow('#c8a0ff',150);s.material.opacity=.45;return s;});gl.position.set(e.x,e.z+50,e.y);
        for(const s of q.seals){if(s.hp<=0)continue;const m=objFor(s,'_bm',()=>{const mm=new THREE.Mesh(quadGeo(),addMat('#c8a0ff',.4));mm.renderOrder=5;mm.userData.disp=()=>{mm.geometry.dispose();mm.material.dispose();};return mm;});
          setQuad(m.geometry,s.x,s.y,e.x,e.y,6,groundAt(s.x,s.y)+26,e.z+60);m.material.opacity=.25+.2*Math.sin(T*6+s.x);}}}
    if(A.id==='favor'){const r=A.carrier?{x:A.carrier.x,y:A.carrier.y,z:A.carrier.z+64}:{x:A.relic.x,y:A.relic.y,z:groundAt(A.relic.x,A.relic.y)+18};
      const o=objFor(A,'_rl',()=>{const g=new THREE.Group();const s=new THREE.Mesh(GEO.dod(13),MB('#ffe060'));g.add(s);g.add(qGlow('#ffe060',90));const pil=qPillar('#ffe060');g.add(pil);g.userData.pil=pil;return g;});o.position.set(r.x,r.z,r.y);o.rotation.y=T*2;o.userData.pil.visible=!A.carrier;}
  }
  for(const b of q.braz){if(!b.lit&&qActive('llama')){const o=objFor(b,'_pl',()=>{const g=new THREE.Group();g.add(qPillar('#ff8a2a'));return g;});o.position.set(b.x,groundAt(b.x,b.y),b.y);}
    if(b.lit&&Math.random()<.3)fx.push({k:'p',x:b.x+rand(-8,8),y:b.y+rand(-8,8),z:groundAt(b.x,b.y)+58,vx:rand(-10,10),vy:rand(-10,10),vz:rand(50,110),t:.5,c:Math.random()<.5?'#ffd060':'#ff6a1a'});}
  const fl=qActive('llama');
  for(const s of q.shelters){const ins=qHumans().some(p=>(p.x-s.x)**2+(p.y-s.y)**2<(s.r+30)**2);s.roof.material.opacity+=((ins?.3:1)-s.roof.material.opacity)*Math.min(1,dt*8);s.roof.material.depthWrite=!ins;s.ring.material.opacity=fl&&(fl.storm>0||fl.weak!=null)?.55+.4*Math.sin(T*8):.75;}
  for(const s of q.seals)if(s.hp>0){s.glyph.rotation.y=T*2;s.glyph.position.y=26+Math.sin(T*2+s.x)*3;}
  const fa=q.anch.find(a=>a.id==='favor');if(fa&&fa.state!=='done'&&AS.ready&&AS.g.u_man&&typeof buildGodH==='function'){const o=objFor(fa,'_god',()=>buildGodH(fa.giver));if(o){o.position.set(fa.x,groundAt(fa.x,fa.y)+19,fa.y);o.scale.setScalar(.92);const pp=players[0];const fk={moving:false,air:false,down:false,fx:pp?pp.x-fa.x:0,fy:pp?pp.y-fa.y:1,inv:0,hidden:0,atk:0,powAnim:0};try{animGodKK(o,fk,dt);}catch(_){}}}
  for(const o of q.puddles){const m=objFor(o,'_o',()=>flatMesh(DISC,'#4fa8ff',.4));m.scale.set(o.r,o.r,1);m.position.set(o.x,groundAt(o.x,o.y)+1.6,o.y);m.material.opacity=(o.flash>0?.8:.24)*Math.min(1,o.t);m.material.color.set(o.flash>0?'#dff4ff':'#4fa8ff');}
  for(const e of enemies){if(e.hunter&&!e.dead){const r=objFor(e,'_hq',()=>flatMesh(RINGW,'#ff4d5e',.85));r.scale.set(e.r*1.6,e.r*1.6,1);r.position.set(e.x,groundAt(e.x,e.y)+2,e.y);r.rotation.z=-T*3;}
    if(e.burnQ>0&&!e.dead&&!e.boss){const f=objFor(e,'_bq',()=>qGlow('#ff6a1a',30));f.position.set(e.x,(e.z||0)+e.r*1.6,e.y);}}}
