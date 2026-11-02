/* Bonk de los Dioses · render 3D, interfaz y bucle */
'use strict';
const cv=$('c'),ov=$('ov'),octx=ov.getContext('2d');
let W=innerWidth,H=innerHeight,DPR=Math.min(2,devicePixelRatio||1),PIXK=2;
let renderer=null,scene=null,cam3=null,GL_OK=true;
try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});}catch(err){GL_OK=false;}
scene=new THREE.Scene();cam3=new THREE.PerspectiveCamera(52,W/H,4,9500);
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(2,devicePixelRatio||1);if(renderer){PIXK=1;renderer.setPixelRatio(Math.min(DPR,1.5));renderer.setSize(W,H,false);}cam3.aspect=W/H;cam3.updateProjectionMatrix();ov.width=Math.round(W*DPR);ov.height=Math.round(H*DPR);}
addEventListener('resize',resize);resize();
if(renderer){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.localClippingEnabled=true;}
function sunFollow(x,y){const s=WORLD&&WORLD.sun;if(!s)return;const gx=Math.round(x/40)*40,gy=Math.round(y/40)*40,gz=groundAt(gx,gy);s.position.set(gx-500,gz+900,gy+400);s.target.position.set(gx,gz,gy);s.target.updateMatrixWorld();}
if(!GL_OK){$('nogl').hidden=false;}
bindPointer(cv);
cv.addEventListener('click',()=>{if(state==='play'&&!isTouch&&!document.pointerLockElement){try{const r=cv.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(err){}}});
document.addEventListener('mousemove',ev=>{if(document.pointerLockElement===cv&&G&&state==='play'){G.yaw-=ev.movementX*.0026;G.pitch=clamp(G.pitch+ev.movementY*.002,.2,1.3);}});
document.addEventListener('pointerlockchange',()=>{const hint=$('lockHint');if(hint)hint.hidden=!!document.pointerLockElement||isTouch;if(!document.pointerLockElement&&state==='play'&&G&&!G.coop&&LOCK_WAS)pause(true);LOCK_WAS=!!document.pointerLockElement;});
let LOCK_WAS=false;
$('focusHint').addEventListener('pointerdown',ev=>{ev.preventDefault();focusGame();$('focusHint').hidden=true;});
cv.addEventListener('wheel',ev=>{if(G&&state==='play'){G.zoom=clamp(G.zoom*(ev.deltaY>0?1.1:1/1.1),.5,3.6);ev.preventDefault();}},{passive:false});

/* ---------- objetos por entidad ---------- */
let FRAME=0;const OBJS=new Set();
function objFor(ent,key,make){let o=ent[key];if(!o||!o.parent){o=make();if(!o)return null;o.userData.ent=ent;o.userData.key=key;scene.add(o);ent[key]=o;OBJS.add(o);}o.userData.f=FRAME;return o;}
function sweep(){for(const o of OBJS){if(o.userData.f!==FRAME){scene.remove(o);OBJS.delete(o);if(o.userData.disp)o.userData.disp();const e=o.userData.ent;if(e&&e[o.userData.key]===o)e[o.userData.key]=null;}}}
function clearObjs(){for(const o of OBJS){scene.remove(o);if(o.userData.disp)o.userData.disp();}OBJS.clear();for(const l of PLIGHTS)l.intensity=0;
  const tint=LOOK3D[(WORLD&&WORLD.rk)||'tartaro'].night?'#c8c0d0':'#ffffff';for(const m of SMAT.values())m.color.set(tint);SPRITE_TINT=tint;}
let SPRITE_TINT='#ffffff';
function ghostMat(v){if(!v.c._ghost)v.c._ghost=new THREE.SpriteMaterial({map:texOf(v.c),transparent:true,opacity:.6,alphaTest:.2,color:'#c8ffc8'});return v.c._ghost;}
const PX=.45;
function mkSprite(v,scale){const s=new THREE.Sprite(spriteMat(v,false));s.center.set(.5,0);s.scale.set(v.w*PX*(scale||1),v.h*PX*(scale||1),1);return s;}
function setSprite(s,v,flip,flash,scale){const m=spriteMat(v,flip,flash);if(m.color.getHexString()!==SPRITE_TINT.slice(1))m.color.set(SPRITE_TINT);s.material=m;const k=PX*(scale||1);s.scale.set(v.w*k,v.h*k,1);}

/* ---------- instancias: sombras, gemas, balas, partículas ---------- */
const dummy=new THREE.Object3D(),tmpC=new THREE.Color();
function mkInst(geo,mat,n){const im=new THREE.InstancedMesh(geo,mat,n);im.count=0;im.frustumCulled=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(im);return im;}
const SHADOWS=mkInst(new THREE.CircleGeometry(1,12).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#000000',transparent:true,opacity:.32,depthWrite:false}),800);
const GEMS=mkInst(new THREE.OctahedronGeometry(4.5,0),new THREE.MeshBasicMaterial({color:'#ffffff'}),460);
const BULLETS=mkInst(new THREE.SphereGeometry(6,8,6),new THREE.MeshBasicMaterial({color:'#ffffff'}),520);
const PARTS=mkInst(new THREE.BoxGeometry(3.2,3.2,3.2),new THREE.MeshBasicMaterial({color:'#ffffff'}),900);
const GLOWS=mkInst(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:glowTex('#ffffff'),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}),400);
function instSet(im,i,x,y,z,s,col,ry){dummy.position.set(x,y,z);dummy.rotation.set(0,ry||0,0);dummy.scale.setScalar(s);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);if(col){im.setColorAt(i,tmpC.set(col));}}
function instDone(im,n){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;}
const COINS=mkInst(new THREE.CylinderGeometry(5,5,1.6,14).rotateX(Math.PI/2),new THREE.MeshLambertMaterial({color:'#ffc23a',emissive:'#8a5a00'}),500);
const COINR=mkInst(new THREE.TorusGeometry(5,.8,4,14),new THREE.MeshBasicMaterial({color:'#fff0a0'}),500);
const SCORCHM=new THREE.MeshBasicMaterial({color:'#120a06',transparent:true,opacity:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
function boltPath(ax,ay,az,bx,by,bz,n,jit){const pts=[];let ox=0,oz=0;for(let i=0;i<=n;i++){const t=i/n;if(i>0&&i<n){ox+=rand(-jit,jit);oz+=rand(-jit,jit);ox*=.8;oz*=.8;}else{ox=0;oz=0;}pts.push([ax+(bx-ax)*t+ox,ay+(by-ay)*t,az+(bz-az)*t+oz]);}return pts;}
function ribMesh(n,col,op){const mm=new THREE.Mesh(ribbon(n),addMat(col,op));mm.renderOrder=6;mm.userData.disp=()=>{mm.geometry.dispose();mm.material.dispose();};return mm;}
const PLIGHTS=[0,1,2].map(()=>{const l=new THREE.PointLight('#ffd8a0',0,420,1.6);scene.add(l);return l;});
const FLASHL=new THREE.PointLight('#ffffff',0,600,1.4);scene.add(FLASHL);

/* ---------- geometrías compartidas ---------- */
const RINGG=new THREE.RingGeometry(.9,1,56),RINGW=new THREE.RingGeometry(.78,1,64),DISC=new THREE.CircleGeometry(1,32);
function addMat(col,op){return new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op==null?1:op,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide});}
function flatMesh(geo,col,op){const m=new THREE.Mesh(geo,addMat(col,op));m.rotation.x=-Math.PI/2;m.renderOrder=5;m.userData.disp=()=>m.material.dispose();return m;}
function ribbon(n){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*2*3),3));const idx=[];for(let i=0;i<n-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}g.setIndex(idx);return g;}
function setRibbon(g,pts,ox,oy,oz){const a=g.attributes.position.array;for(let i=0;i<pts.length;i++){const p=pts[i];a[i*6]=p[0]+ox;a[i*6+1]=p[1]+oy;a[i*6+2]=p[2]+oz;a[i*6+3]=p[0]-ox;a[i*6+4]=p[1]-oy;a[i*6+5]=p[2]-oz;}g.attributes.position.needsUpdate=true;g.computeBoundingSphere();}
function quadGeo(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(12),3));g.setIndex([0,1,2,1,3,2]);return g;}
function setQuad(g,x1,y1,x2,y2,w,h1,h2){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,nx=-dy/L*w/2,ny=dx/L*w/2,a=g.attributes.position.array;
  a.set([x1+nx,h1,y1+ny,x1-nx,h1,y1-ny,x2+nx,h2,y2+ny,x2-nx,h2,y2-ny]);g.attributes.position.needsUpdate=true;g.computeBoundingSphere();}

/* ---------- proyectiles ---------- */
function projObj(q){
  const g=new THREE.Group(),c=q.col,big=q.big,len=big?70:Math.max(18,q.r*2.2);
  const box=(w,h,d,col,x,y,z)=>{const m=new THREE.Mesh(GEO.box(w,h,d),MB(col));m.position.set(x||0,y||0,z||0);g.add(m);return m;};
  switch(q.st){
  case'arrow':box(16,1.6,1.6,'#e8e0cc');box(4,3,3,'#8a8a8a',9);box(3,3,.8,C.blood,-8);break;
  case'trident':if(q.k==='line'){box(len,3,3,c);box(3,3,14,c,len/2-2);box(8,2,2,c,len/2+3,0,5);box(8,2,2,c,len/2+3,0,-5);box(10,2,2,c,len/2+4);}else{box(20,2,2,c);box(2,2,10,C.gold,8);box(6,2,2,C.gold,11,0,4);box(6,2,2,C.gold,11,0,-4);box(7,2,2,C.gold,12);}break;
  case'spear':case'firespear':case'blade':box(len,big?5:3,big?5:3,q.st==='blade'?c:'#6a4a2a');box(big?16:7,big?7:4,big?7:4,q.st==='spear'?C.gold:c,len/2+2);if(q.st!=='spear'||big)g.add(glowSprite(c,big?90:30));break;
  case'holysword':{const s=new THREE.Group();const bl=new THREE.Mesh(GEO.box(34,1.6,5),ML('#fff4d0',{emissive:'#ffb347'}));bl.position.x=12;s.add(bl);const tip=new THREE.Mesh(GEO.cone(2.6,7,4),ML('#fff4d0',{emissive:'#ffb347'}));tip.rotation.z=-Math.PI/2;tip.position.x=32;s.add(tip);
    const cg=new THREE.Mesh(GEO.box(2.6,3,15),ML(C.gold,{emissive:'#8a5a00'}));cg.position.x=-5;s.add(cg);const hl=new THREE.Mesh(GEO.box(9,2.4,2.4),ML('#6a3a1a'));hl.position.x=-10.5;s.add(hl);const pm=new THREE.Mesh(GEO.sph(2.2,6,5),ML(C.gold,{emissive:'#8a5a00'}));pm.position.x=-15.5;s.add(pm);
    const fl=glowSprite('#ff8a3a',26);fl.position.x=14;s.add(fl);s.rotation.x=Math.PI/2;g.add(s);g.userData.sword=s;g.scale.setScalar(1.35);break;}
  case'beam':box(len,4,4,c);box(len,1.6,1.6,'#ffffff');g.add(glowSprite(c,50));break;
  case'serpent':for(let i=0;i<8;i++){const m=box(10,8,8,i%2?c:C.gold,-i*9);m.userData.i=i;}box(10,10,10,C.blood,10);g.add(glowSprite(c,80));break;
  case'fire':{const m=new THREE.Mesh(GEO.sph(4.5,6,5),MB(c));g.add(m);g.add(glowSprite(c,26));break;}
  case'net':{const m=new THREE.Mesh(GEO.box(16,1,16),MB(c,{wireframe:true}));g.add(m);break;}
  case'stone':{g.add(new THREE.Mesh(GEO.sph(3,6,5),MB('#d8dce8')));g.add(glowSprite(c,18));break;}
  case'tear':{g.add(new THREE.Mesh(GEO.sph(3,6,5),MB(c)));break;}
  case'hammer':case'axe':case'staff':{const s=new THREE.Group();const h=new THREE.Mesh(GEO.box(q.st==='staff'?30:16,2,2),MB(q.st==='staff'?c:'#6a4a2a'));s.add(h);if(q.st!=='staff'){const hd=new THREE.Mesh(GEO.box(8,7,9),MB(c));hd.position.x=8;s.add(hd);if(q.st==='axe'){const h2=hd.clone();h2.position.x=-8;s.add(h2);}}g.add(s);g.userData.spin=s;if(c==='#7de0ff'||c==='#e23a2a')g.add(glowSprite(c,30));break;}
  case'disc':case'ring':{const t=new THREE.Mesh(GEO.tor(6,1.6),MB(c));t.rotation.x=Math.PI/2;g.add(t);g.userData.spin=t;g.add(glowSprite(c,22));break;}
  case'ball':g.add(new THREE.Mesh(GEO.sph(5,8,6),MB('#3a2a1a')));break;
  case'crow':{const s=mkSprite(miscSprites().crow,1);s.center.set(.5,.5);g.add(s);break;}
  case'wind':{const t=new THREE.Mesh(GEO.tor(5,1.2),MB(c));g.add(t);g.userData.spin=t;break;}
  case'thread':box(14,1,1,c);break;
  default:g.add(new THREE.Mesh(GEO.sph(4,6,5),MB(c)));
  }
  return g;
}
function glowSprite(col,size){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(col),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));s.scale.set(size,size,1);s.userData.glow=true;return s;}

/* ---------- jefes como textura dinámica ---------- */
function bossObj(e){const base=mkCanvas(96,96),tc=mkCanvas(194,194);const tex=new THREE.CanvasTexture(tc);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;
  const mat=new THREE.SpriteMaterial({map:tex,transparent:true,alphaTest:.5});const s=new THREE.Sprite(mat);s.center.set(.5,.2);const k=(e.tier==='final'?3.9:e.tier==='boss'?3.3:2.8)*.62;s.scale.set(96*k,96*k,1);
  s.userData.base=base;s.userData.tc=tc;s.userData.tex=tex;s.userData.disp=()=>{tex.dispose();mat.dispose();};return s;}
function drawBossTex(e,s){const b=s.userData.base,g=b.getContext('2d');g.clearRect(0,0,96,96);D=g;S=3;drawBoss(e,48,58);const up=shadeOutline(epx(b),C.ink,true);const tg=s.userData.tc.getContext('2d');tg.clearRect(0,0,194,194);tg.drawImage(up,0,0);s.userData.tex.needsUpdate=true;
  s.material.color.set(e.flash>0?'#ffffff':SPRITE_TINT);}
const SEGS={};function segV(e){const k=e.key;return SEGS[k]||(SEGS[k]=segSprite(e.d.col,e.d.acc));}

const DROPTEX={};
function dropSprite(k){if(!DROPTEX[k]){const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');g.lineJoin='round';g.lineWidth=3;g.strokeStyle='#14101e';
  if(k==='nectar'){g.fillStyle='#7de0ff';g.beginPath();g.moveTo(18,8);g.lineTo(30,8);g.lineTo(30,16);g.quadraticCurveTo(40,22,38,32);g.quadraticCurveTo(36,42,24,42);g.quadraticCurveTo(12,42,10,32);g.quadraticCurveTo(8,22,18,16);g.closePath();g.fill();g.stroke();g.fillStyle='#c8a060';g.fillRect(17,4,14,6);g.strokeRect(17,4,14,6);g.fillStyle='#ffffffaa';g.fillRect(15,22,4,10);}
  else if(k==='iman'){g.lineWidth=9;g.strokeStyle='#14101e';g.beginPath();g.arc(24,22,13,Math.PI,0);g.lineTo(37,38);g.moveTo(11,22);g.lineTo(11,38);g.stroke();g.lineWidth=5;g.strokeStyle='#e83a3a';g.beginPath();g.arc(24,22,13,Math.PI,0);g.lineTo(37,34);g.moveTo(11,22);g.lineTo(11,34);g.stroke();g.fillStyle='#e8eef8';g.fillRect(7,34,8,7);g.fillRect(33,34,8,7);}
  else{g.fillStyle='#9a6a3a';g.beginPath();g.moveTo(16,14);g.quadraticCurveTo(4,28,10,38);g.quadraticCurveTo(24,46,38,38);g.quadraticCurveTo(44,28,32,14);g.closePath();g.fill();g.stroke();g.fillStyle='#6a4422';g.fillRect(15,10,18,6);g.strokeRect(15,10,18,6);g.fillStyle='#ffd34d';g.beginPath();g.arc(24,29,7,0,6.3);g.fill();g.stroke();g.fillStyle='#a86a00';g.font='bold 10px sans-serif';g.textAlign='center';g.fillText('Δ',24,33);}
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.LinearFilter;DROPTEX[k]=new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false});}
  const sp=new THREE.Sprite(DROPTEX[k]);sp.scale.set(24,24,1);return sp;}
/* ---------- orbitales ---------- */
function doveMesh(){const g=new THREE.Group(),W=ML('#ffffff',{emissive:'#6a6458'}),Gr=ML('#c8ccd8',{emissive:'#3a3c48'});
  const body=new THREE.Mesh(GEO.sph(5,8,6),W);body.scale.set(1.7,1,1.05);g.add(body);
  const head=new THREE.Mesh(GEO.sph(3.2,8,6),W);head.position.set(8,2.6,0);g.add(head);
  const bk=new THREE.Mesh(GEO.box(3,1.4,1.4),MB('#ff9a3a'));bk.position.set(11.4,2.2,0);g.add(bk);
  for(const z of[-1.6,1.6]){const e=new THREE.Mesh(GEO.box(.9,.9,.6),MB('#1a1a24'));e.position.set(9.6,3.4,z);g.add(e);}
  const tail=new THREE.Mesh(GEO.box(7,1,6),Gr);tail.position.set(-9,.6,0);tail.rotation.z=.25;g.add(tail);
  const mk=sg=>{const pv=new THREE.Group();pv.position.set(0,2,sg*2.5);const w=new THREE.Mesh(GEO.box(8,1,12),W);w.position.set(-1,0,sg*6);pv.add(w);const tip=new THREE.Mesh(GEO.box(6,1,5),Gr);tip.position.set(-3,0,sg*13.5);pv.add(tip);g.add(pv);return pv;};
  g.userData.wl=mk(-1);g.userData.wr=mk(1);g.scale.setScalar(.85);return g;}

const ORBV={};
function orbV(st,col){const k=st+col;if(ORBV[k])return ORBV[k];const ms=miscSprites();let v;
  if(st==='skull')v=ms.skull;else if(st==='dove')v=ms.dove;else{
    const base=fromFn(9,9,({put,rect,ell})=>{if(st==='star'){rect(0,4,9,1,col);rect(4,0,1,9,col);rect(2,2,1,1,col);rect(6,6,1,1,col);rect(6,2,1,1,col);rect(2,6,1,1,col);rect(4,4,1,1,'#ffffff');}
      else if(st==='mirror'){ell(4.5,4.5,4,4,C.gold);ell(4.5,4.5,3,3,'#e8eef8');put(3,3,'#ffffff');}else{ell(4.5,4.5,4,4,C.gold);ell(4.5,4.5,2.6,2.6,'#f8e060');put(3,3,'#ffffff');}});v=hiSprite(base,INK);}
  ORBV[k]=v;return v;}

/* ---------- cámara ---------- */
const camPos=new THREE.Vector3(0,300,300),camLook=new THREE.Vector3();
const MENU_FOCUS={tartaro:[0,-40,620],duat:[-250,-600,900],kur:[0,-260,700],mictlan:[200,-500,950],xibalba:[0,-300,620],ukupacha:[-100,-200,900],cielo:[0,-800,900],lanka:[0,0,600],diyu:[0,0,560],yomi:[0,-700,700],orun:[0,0,600]};
for(const k in MENU_FOCUS)MENU_FOCUS[k]=MENU_FOCUS[k].map(v=>v*1.5);
function updCamera(dt,menu){
  if(menu){const rk=WORLD&&WORLD.rk,f=MENU_FOCUS[rk]||[0,0,700];const a=T*.06;const x=f[0]+Math.sin(a)*f[2],z=f[1]+Math.cos(a)*f[2];const gy=groundAt(f[0],f[1]);cam3.position.set(x,Math.max(gy+260,groundAt(x,z)+140),z);cam3.lookAt(f[0],gy+40,f[1]);return;}
  const c=camera();let spread=0;const hs=players.filter(p=>p.ctrl!=='ai');if(hs.length>1)spread=Math.hypot(hs[0].x-hs[1].x,hs[0].y-hs[1].y);
  const tz=(hs.length?hs.reduce((s2,p)=>s2+p.z,0)/hs.length:0);
  if(scene.fog&&scene.fog.userData&&scene.fog.userData.n0){const zk=Math.max(1,G.zoom/1.3);scene.fog.near=scene.fog.userData.n0*zk;scene.fog.far=scene.fog.userData.f0*zk;}
  const dist=(275+spread*.5)*G.zoom,pc=Math.cos(G.pitch),ps=Math.sin(G.pitch);
  const tx=c.x+Math.sin(G.yaw)*pc*dist,ty=tz+18+ps*dist,tzz=c.y+Math.cos(G.yaw)*pc*dist;
  const k=Math.min(1,dt*10);camPos.x+=(tx-camPos.x)*k;camPos.y+=(ty-camPos.y)*k;camPos.z+=(tzz-camPos.z)*k;
  const gmin=groundAt(camPos.x,camPos.z)+25;if(camPos.y<gmin)camPos.y=gmin;
  cam3.position.copy(camPos);const sk=(G.shake||0)*14;if(sk>0)cam3.position.add(new THREE.Vector3(rand(-sk,sk),rand(-sk,sk),rand(-sk,sk)));camLook.set(c.x,tz+18,c.y);cam3.lookAt(camLook);
}
const pv=new THREE.Vector3();
function toScreen(x,y,z){pv.set(x,z,y).project(cam3);if(pv.z>1||pv.z<-1)return null;return[(pv.x+1)/2*W,(1-pv.y)/2*H];}

/* ---------- render del juego ---------- */
function renderGame(dt){
  FRAME++;
  const night=LOOK3D[G.realm].night;
  let ns=0;
  const shadow=(x,y,r,airK)=>{if(ns<800){instSet(SHADOWS,ns++,x,groundAt(x,y)+.6,y,r*(airK||1));}};
  // jugadores y ayudantes
  const all=[...players,...npcs,...remotesHere()];
  all.forEach((p,i)=>{
    const k=p.giant>0?2:1;const mkG=()=>AS.ready?(AS.g.u_man?buildGodH(p.god):buildGodKK(p.god)):buildGod(p.god);let mdl=objFor(p,'_m',mkG);if(mdl.userData.god!==p.god||(AS.ready&&!mdl.userData.kk)){scene.remove(mdl);OBJS.delete(mdl);mdl.userData.disp();p._m=null;mdl=objFor(p,'_m',mkG);}
    mdl.position.set(p.x,p.z,p.y);{const u=mdl.userData;if(!u.hmats){u.hmats=[];mdl.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m.emissive&&!u.hmats.includes(m)){if(!m.userData.em0)m.userData.em0=m.emissive.clone();u.hmats.push(m);}});}
      const on=(p.hurtT||0)>0;if(on!==u.hon){u.hon=on;for(const m of u.hmats){if(on)m.emissive.setRGB(.9,.05,.05);else m.emissive.copy(m.userData.em0);}}}if(mdl.userData.kk){mdl.scale.setScalar(.92*k);animGodKK(mdl,p,dt);}else{mdl.scale.setScalar(GOD_SCALE*k);animGod(mdl,p,dt);}
    shadow(p.x,p.y,p.r*1.2,clamp(1-(p.z-groundAt(p.x,p.y))/200,.4,1));
    if(p.god==='dios'||p.ctrl==='npc'){const gl=objFor(p,'_gl',()=>glowSprite('#fff2c0',120));gl.position.set(p.x,p.z+40,p.y);gl.material.opacity=.6+.2*Math.sin(T*3);}
    const L=p.ctrl==='net'?null:PLIGHTS[i];if(L){L.intensity=night?1.25:0;L.position.set(p.x,p.z+60,p.y);L.color.set(p.god==='dios'?'#fff6e0':'#ffd8a0');}
    // aura
    const auraK=p.weapons.sol?'sol':p.weapons.creacion?'creacion':null;
    if((auraK||p.radiant>0)&&!p.down){const Rr=auraK?kst(WEAPONS[auraK],p.weapons[auraK].lvl,p).radius*p.area*(p.radiant>0?1.8:1):140*p.area;const col=auraK?WEAPONS[auraK].col:C.gold;
      const d=objFor(p,'_ad',()=>flatMesh(DISC,col,.14));d.scale.set(Rr,Rr,1);d.position.set(p.x,groundAt(p.x,p.y)+2,p.y);
      const r=objFor(p,'_ar',()=>flatMesh(RINGG,col,.7));r.scale.set(Rr,Rr,1);r.position.set(p.x,groundAt(p.x,p.y)+2.5,p.y);r.rotation.z=T;}
    if((p.ctrl==='p1'||p.ctrl==='p2')&&!p.down){const Wd=WEAPONS[p.g.w],w=p.weapons[p.g.w];if(w&&Wd.k!=='aura'&&Wd.k!=='trail'){const R=Math.min(650,weaponReach(Wd,kst(Wd,w.lvl,p),p));if(R>20){
      const rr=objFor(p,'_rng',()=>flatMesh(RINGG,Wd.col,.16));if(rr.userData.R&&R>rr.userData.R+1)rr.userData.pulse=1;rr.userData.R=R;rr.userData.pulse=Math.max(0,(rr.userData.pulse||0)-dt*1.5);
      const k=R*(1+(rr.userData.pulse||0)*.15);rr.scale.set(k,k,1);rr.position.set(p.x,groundAt(p.x,p.y)+1.8,p.y);rr.material.opacity=.32+.5*(rr.userData.pulse||0);}}}
    if(p.shield>0){const r=objFor(p,'_sh',()=>flatMesh(RINGW,C.gold,.8));r.scale.set(34,34,1);r.position.set(p.x,p.z+20,p.y);r.rotation.z=T*2;}
    if(p.crown>0){const cr=objFor(p,'_cr',()=>{const m=new THREE.Mesh(GEO.cyl(9,8,6,8,1),MB(C.gold));return m;});cr.position.set(p.x,p.z+80*k,p.y);cr.rotation.y=T*2;}
    if(p.rage>0){const r=objFor(p,'_rg',()=>glowSprite(C.blood,90));r.position.set(p.x,p.z+30,p.y);}
    if(p.down){const r=objFor(p,'_rv',()=>flatMesh(RINGG,C.gold,.8));r.scale.set(30,30,1);r.position.set(p.x,groundAt(p.x,p.y)+3,p.y);}
    // orbitales
    for(const key in p.weapons){const w=p.weapons[key];if(!w.pos||p.down)continue;const Wd=WEAPONS[key];w._o=w._o||[];
      w.pos.forEach((ps,j)=>{const holder=w._o[j]=w._o[j]||{};if(Wd.st==='dove'){const d=objFor(holder,'_d',doveMesh);d.position.set(ps[0],p.z+30+Math.sin(T*5+j)*4,ps[1]);d.rotation.y=-(ps[2]+Math.PI/2);const f=Math.sin(T*20+j*1.7);d.userData.wl.rotation.x=-.25-f*.95;d.userData.wr.rotation.x=.25+f*.95;const gl=objFor(holder,'_g',()=>glowSprite('#fff6c8',14));gl.position.copy(d.position);return;}const s2=objFor(holder,'_s',()=>{const sp=mkSprite(orbV(Wd.st,Wd.col));sp.center.set(.5,.5);return sp;});s2.position.set(ps[0],p.z+26+Math.sin(T*4+j)*3,ps[1]);
        const gl=objFor(holder,'_g',()=>glowSprite(Wd.col,26));gl.position.copy(s2.position);});}
    if(p.sunPos){const holder=p._sun=p._sun||{};const s2=objFor(holder,'_s',()=>{const sp=mkSprite(orbV('sun',C.gold));sp.center.set(.5,.5);return sp;});s2.position.set(p.sunPos[0],p.z+30,p.sunPos[1]);const gl=objFor(holder,'_g',()=>glowSprite(C.gold,40));gl.position.copy(s2.position);}
  });
  for(let i=all.length;i<PLIGHTS.length;i++)PLIGHTS[i].intensity=0;
  if(players.length>1&&players[0].bond){const a=players[0],b=players[1];const rb=objFor(G,'_bond',()=>{const m=new THREE.Mesh(quadGeo(),addMat(C.gold,.35));m.userData.disp=()=>{m.geometry.dispose();m.material.dispose();};return m;});setQuad(rb.geometry,a.x,a.y,b.x,b.y,4,a.z+20,b.z+20);}
  // enemigos
  eniBegin();eni2Begin();
  for(const e of enemies){
    if(e.boss){const s=objFor(e,'_m',()=>buildBossKK(e)||buildBoss(e));if(s.userData.kkBoss){animBossKK(s,e,dt);updBossClip(s);}else animBoss(s,e,dt);shadow(e.x,e.y,e.r*1.3);
      if(e.segs)e.segs.forEach((sg,i)=>{const ss=objFor(sg,'_m',()=>segMesh(e));const k=sg.r*1.5;ss.scale.set(k,k*.8,k);const nx=e.segs[i-1]||e;ss.rotation.y=Math.atan2(nx.x-sg.x,nx.y-sg.y);ss.position.set(sg.x,groundAt(sg.x,sg.y)+k*.4+Math.sin(T*6+i*.8)*2,sg.y);ss.material.emissive.set(e.flash>0?'#ffffff':'#000000');shadow(sg.x,sg.y,sg.r);});
      continue;}
    if(!eni2Draw(e,dt))eniDraw(e,dt);
    if(e.elite){const r=objFor(e,'_el',()=>flatMesh(RINGW,C.gold,.85));r.scale.set(e.r*1.6,e.r*1.6,1);r.position.set(e.x,groundAt(e.x,e.y)+2,e.y);r.rotation.z=T*3;const cr=objFor(e,'_ec',()=>glowSprite(C.gold,40));cr.position.set(e.x,e.z+e.r*2.3+6,e.y);}
    shadow(e.x,e.y,e.r);
  }
  eniEnd();eni2End();
  // aliados
  const ms=miscSprites();
  for(const a of allies){let v=null,sc=1;switch(a.type){case'einherjar':v=enemySprites('draugr')[Math.floor(T*4)%2];break;case'leon':v=ms.lion[Math.floor(T*6)%2];break;case'dog':v=ms.dog[Math.floor(T*6)%2];break;case'shade':v=enemySprites('sincorazon')[Math.floor(T*4)%2];break;case'clone':v=godSprites(a.o.god)[0];break;}
    if(a.type==='tornado'){const t=objFor(a,'_s',()=>{const g=new THREE.Group();for(let i=0;i<5;i++){const m=new THREE.Mesh(GEO.tor(6+i*4,1.5),new THREE.MeshBasicMaterial({color:'#d8e8f0',transparent:true,opacity:.6}));m.rotation.x=Math.PI/2;m.position.y=i*12;g.add(m);}return g;});t.position.set(a.x,groundAt(a.x,a.y),a.y);t.rotation.y=T*8;continue;}
    const s=objFor(a,'_s',()=>mkSprite(v));const flip=a.fx!==undefined?((a.fx*Math.cos(G.yaw)-(a.fy||0)*Math.sin(G.yaw))<0):false;setSprite(s,v,flip,false,sc);if(a.type==='clone')s.material=ghostMat(v);s.position.set(a.x,groundAt(a.x,a.y),a.y);shadow(a.x,a.y,a.r);}
  // curaciones
  for(const d of drops){const s=objFor(d,'_s',()=>dropSprite(d.k));const bob=Math.sin(T*3+d.x)*3;s.position.set(d.x,groundAt(d.x,d.y)+14+bob,d.y);if(d.t>34)s.visible=Math.sin(T*20)>0;const gl=objFor(d,'_g',()=>glowSprite(d.k==='nectar'?'#7de0ff':d.k==='iman'?'#ff6a6a':'#ffd34d',20));gl.position.copy(s.position);shadow(d.x,d.y,7);}
  for(const h of heals){const s=objFor(h,'_s',()=>mkSprite(ms.pom));s.position.set(h.x,groundAt(h.x,h.y)+4+Math.sin(T*3)*2,h.y);const hg=objFor(h,'_g',()=>glowSprite('#ff5a5a',18));hg.position.copy(s.position);shadow(h.x,h.y,6);}
  // proyectiles
  for(const q2 of proj){const o=objFor(q2,'_o',()=>projObj(q2));o.position.set(q2.x,q2.z,q2.y);o.rotation.y=-Math.atan2(q2.vy,q2.vx);if(o.userData.spin){o.userData.spin.rotation.z=q2.rot;if(q2.st==='hammer'||q2.st==='axe'||q2.st==='staff'){o.userData.spin.rotation.z=0;o.rotation.y=q2.rot;}}
    if(q2.st==='holysword'){const sw=o.userData.sword;if(q2.ret&&q2.hold<=0){o.rotation.y=q2.rot*1.6;}else if(q2.ret){sw.rotation.z=-.9;}else{sw.rotation.z=Math.sin(T*30)*.08;}}
    if(q2.st==='serpent')o.children.forEach(m=>{if(m.userData.i!==undefined)m.position.z=Math.sin(T*10+m.userData.i*.8)*6;});}
  for(const pa of patches){const m=objFor(pa,'_o',()=>flatMesh(DISC,pa.col,.5));const k=pa.r*(.6+.4*pa.t/pa.life);m.scale.set(k,k,1);m.position.set(pa.x,groundAt(pa.x,pa.y)+1.5,pa.y);m.material.opacity=.25+.25*Math.sin(T*10+pa.x);}
  // efectos
  let ng=0;FLASHL.intensity=Math.max(0,FLASHL.intensity-dt*8);
  for(const f of fx){
    switch(f.k){
    case'ring':{const m=objFor(f,'_o',()=>flatMesh(RINGW,f.col,.9));const k=1-f.t/f.max,rr=f.r*(.3+.7*k);m.scale.set(rr,rr,1);m.position.set(f.x,groundAt(f.x,f.y)+4,f.y);m.material.opacity=.9*(1-k);break;}
    case'wave':{const m=objFor(f,'_o',()=>flatMesh(RINGW,f.col,.85));m.scale.set(f.r,f.r,1);m.position.set(f.x,groundAt(f.x,f.y)+6,f.y);const m2=objFor(f,'_o2',()=>flatMesh(RINGG,'#ffffff',.6));m2.scale.set(f.r*.97,f.r*.97,1);m2.position.copy(m.position);break;}
    case'bolt':{const pts=[];for(let i=0;i<f.pts.length-1;i++){const[ax,ay,az]=f.pts[i],[bx,by,bz]=f.pts[i+1];for(let s2=0;s2<4;s2++){const t=s2/4,j=s2?rand(-7,7):0;pts.push([ax+(bx-ax)*t+j,az+(bz-az)*t+rand(-4,4),ay+(by-ay)*t+j]);}}const L2=f.pts[f.pts.length-1];pts.push([L2[0],L2[2],L2[1]]);
      const m=objFor(f,'_o',()=>{const mm=new THREE.Mesh(ribbon(pts.length),addMat(f.st==='smoke'?'#8a7ab0':f.col,1));mm.userData.disp=()=>{mm.geometry.dispose();mm.material.dispose();};return mm;});if(m.geometry.attributes.position.count===pts.length*2)setRibbon(m.geometry,pts,0,3,0);
      const m2=objFor(f,'_o2',()=>{const mm=new THREE.Mesh(ribbon(pts.length),addMat('#ffffff',1));mm.userData.disp=()=>{mm.geometry.dispose();mm.material.dispose();};return mm;});if(m2.geometry.attributes.position.count===pts.length*2)setRibbon(m2.geometry,pts,0,1,0);
      for(const p of f.pts){if(ng<400){instSet(GLOWS,ng++,p[0],p[2]+4,p[1],40);}}FLASHL.color.set(f.col);FLASHL.intensity=1.4;FLASHL.position.set(L2[0],L2[2]+30,L2[1]);break;}
    case'sky':{const g0=groundAt(f.x,f.y);if(!f.main||FRAME%3===0){f.main=boltPath(f.x+rand(-30,30),g0+640,f.y+rand(-30,30),f.x,g0,f.y,22,30);
        f.br=[0,1,2].map(()=>{const s0=f.main[4+Math.floor(Math.random()*12)],a=rand(0,6.28),L=rand(60,150);return boltPath(s0[0],s0[1],s0[2],s0[0]+Math.cos(a)*L,s0[1]-rand(70,170),s0[2]+Math.sin(a)*L,8,16);});}
      const k=clamp(f.t/(f.t0||.45),0,1),rx=Math.cos(G.yaw),rz=-Math.sin(G.yaw);const fl=(Math.floor(T*30)%2)?1:.7;
      const m=objFor(f,'_o',()=>ribMesh(23,f.col,.55));setRibbon(m.geometry,f.main,rx*16,0,rz*16);m.material.opacity=.5*k*fl;
      const m2=objFor(f,'_o2',()=>ribMesh(23,'#ffffff',1));setRibbon(m2.geometry,f.main,rx*3.5,0,rz*3.5);m2.material.opacity=Math.min(1,k*1.6);
      f.br.forEach((b,bi)=>{const mb=objFor(f,'_b'+bi,()=>ribMesh(9,f.col,.9));setRibbon(mb.geometry,b,rx*2.5,0,rz*2.5);mb.material.opacity=.9*k*fl;});
      const m3=objFor(f,'_r',()=>flatMesh(RINGW,f.col,.9));const kk=1-k;m3.scale.set(20+kk*90,20+kk*90,1);m3.position.set(f.x,g0+3,f.y);m3.material.opacity=.9*k;
      if(ng<396){instSet(GLOWS,ng++,f.x,g0+18,f.y,230*k+40);instSet(GLOWS,ng++,f.main[8][0],f.main[8][1],f.main[8][2],120*k);instSet(GLOWS,ng++,f.main[16][0],f.main[16][1],f.main[16][2],90*k);}
      FLASHL.color.set(f.col);FLASHL.intensity=Math.max(FLASHL.intensity,3*k);FLASHL.distance=900;FLASHL.position.set(f.x,g0+90,f.y);break;}
    case'scorch':{const m=objFor(f,'_o',()=>{const mm=new THREE.Mesh(DISC,SCORCHM.clone());mm.rotation.x=-Math.PI/2;mm.rotation.z=rand(0,6.28);mm.userData.disp=()=>mm.material.dispose();return mm;});m.scale.set(f.r,f.r*rand(.98,1.02),1);m.position.set(f.x,groundAt(f.x,f.y)+.8,f.y);m.material.opacity=.6*Math.min(1,f.t/1.2);
      const e2=objFor(f,'_e',()=>flatMesh(DISC,'#ff8a3a',.5));e2.scale.set(f.r*.5,f.r*.5,1);e2.position.set(f.x,groundAt(f.x,f.y)+1.2,f.y);e2.material.opacity=.5*Math.max(0,(f.t-2)/1);break;}
    case'slash':{const m=objFor(f,'_o',()=>{const mm=new THREE.Mesh(new THREE.RingGeometry(f.r*.55,f.r,14,1,-(f.a+f.arc/2),f.arc),addMat(f.col,.85));mm.rotation.x=-Math.PI/2;mm.renderOrder=5;mm.userData.disp=()=>{mm.geometry.dispose();mm.material.dispose();};return mm;});m.position.set(f.x,(f.z||0)+18,f.y);m.material.opacity=f.t/.16;break;}
    case'tele':{if(f.shape==='circle'){const m=objFor(f,'_o',()=>flatMesh(DISC,C.blood,.3));m.scale.set(f.r,f.r,1);m.position.set(f.x,groundAt(f.x,f.y)+3,f.y);m.material.opacity=.2+.25*(Math.floor(T*12)%2);const m2=objFor(f,'_o2',()=>flatMesh(RINGG,C.blood,.9));m2.scale.set(f.r,f.r,1);m2.position.copy(m.position);}
      else{const m=objFor(f,'_o',()=>{const mm=new THREE.Mesh(quadGeo(),addMat(f.beam?f.col:C.blood,.35));mm.renderOrder=5;mm.userData.disp=()=>{mm.geometry.dispose();mm.material.dispose();};return mm;});setQuad(m.geometry,f.x,f.y,f.x2,f.y2,f.w,groundAt(f.x,f.y)+4,groundAt(f.x2,f.y2)+4);m.material.opacity=.2+.3*(Math.floor(T*12)%2);}break;}
    case'beam':{const m=objFor(f,'_o',()=>{const mm=new THREE.Mesh(quadGeo(),addMat(f.col,.9));mm.renderOrder=5;mm.userData.disp=()=>{mm.geometry.dispose();mm.material.dispose();};return mm;});const h=groundAt(f.x,f.y)+24;setQuad(m.geometry,f.x,f.y,f.x2,f.y2,f.w*1.4,h,h);m.material.opacity=f.t/f.max;break;}
    }
  }
  // portales
  if(G.portals)for(const pt of G.portals){const o=objFor(pt,'_o',()=>{const g=new THREE.Group();const acc=REALMS[pt.key].acc;const t=new THREE.Mesh(GEO.tor(30,5),MB(acc));t.position.y=36;g.add(t);const d=new THREE.Mesh(new THREE.CircleGeometry(27,24),addMat(acc,.5));d.material.depthTest=true;d.position.y=36;g.add(d);g.userData.d=d;const gl=glowSprite(acc,160);gl.position.y=36;g.add(gl);return g;});
    o.position.set(pt.x,groundAt(pt.x,pt.y),pt.y);o.rotation.y=G.yaw;o.userData.d.material.opacity=.35+.25*Math.sin(T*4);}
  // altares y cofres
  for(const al of WORLD.altars){al.gem.visible=!al.used;al.gem.rotation.y=T*2;al.gem.position.y=30+Math.sin(T*2+al.x)*4;}
  for(const sh of WORLD.shrines||[]){sh.obj.visible=true;sh.gem.rotation.y=T*1.5;if(sh.type!=='fuente'&&sh.type!=='desafio')sh.gem.position.y=32+Math.sin(T*2+sh.x)*4;sh.obj.children.forEach(c=>{if(c.isSprite)c.visible=!sh.used;if(c.geometry&&c.geometry.type==='RingGeometry')c.visible=!sh.used;});}
  for(const m of WORLD.merchants||[]){if(AS.ready){const o=objFor(m,'_m',()=>(AS.g.u_man?buildGodH:buildGodKK)('mercader'));o.position.set(m.x,surfaceAt(m.x,m.y),m.y);o.scale.setScalar(.92);const pp=players[0];const fk={moving:false,air:false,down:false,fx:pp?pp.x-m.x:0,fy:pp?pp.y-m.y:1,inv:0,hidden:0,atk:0,powAnim:0};animGodKK(o,fk,dt);}
    else{const o=objFor(m,'_s',()=>mkSprite(godSprites('mercader')[(Math.floor(T*2)%2)]));setSprite(o,godSprites('mercader')[Math.floor(T*1.5)%2],Math.sin(T*.3+m.x)>0);o.position.set(m.x,surfaceAt(m.x,m.y),m.y);}shadow(m.x,m.y,14);}
  {let nc=0;for(const c of coins){if(nc>=500)break;const ry=T*5+c.ph;instSet(COINS,nc,c.x,c.z+9+(c.vz===0?Math.sin(T*4+c.ph)*2:0),c.y,1,null,ry);instSet(COINR,nc,c.x,c.z+9+(c.vz===0?Math.sin(T*4+c.ph)*2:0),c.y,1,null,ry);nc++;if(ns<800)shadow(c.x,c.y,4);}instDone(COINS,nc);instDone(COINR,nc);}
  for(const ch of WORLD.chests){
    if(AS.ready&&propAsset('chest_gold')){if(ch.obj)ch.obj.visible=false;const o=objFor(ch,'_a',()=>{const g=new THREE.Group();const pa=propAsset(ch.rich?'chest_gold':'chest');const m=new THREE.Mesh(pa.geo,pa.mat.clone());const k=(ch.rich?30:24)/pa.w;m.scale.setScalar(k);m.castShadow=true;g.add(m);g.add(glowSprite(ch.rich?'#c8a0ff':C.gold,ch.rich?90:50));g.rotation.y=hash(Math.round(ch.x),Math.round(ch.y))*6.28;return g;});
      o.position.set(ch.x,groundAt(ch.x,ch.y),ch.y);if(ch.opened){ch.ot=(ch.ot||0)+dt;const k2=Math.max(0,1-ch.ot*2);o.scale.set(1+ch.ot,k2,1+ch.ot);if(k2<=0)o.visible=false;}else o.position.y+=Math.abs(Math.sin(T*2+ch.x))*1.2;continue;}
    if(!ch.obj){const o=objFor(ch,'_o',()=>{const g=new THREE.Group();const body=new THREE.Mesh(GEO.box(22,14,16),ML(ch.rich?'#4b2f6e':'#7a4a2a'));body.position.y=7;g.add(body);const lid=new THREE.Mesh(GEO.box(23,5,17),MB(ch.rich?'#c8a0ff':C.gold));lid.position.y=16;g.add(lid);g.userData.lid=lid;g.add(glowSprite(ch.rich?'#c8a0ff':C.gold,ch.rich?90:50));return g;});o.position.set(ch.x,groundAt(ch.x,ch.y),ch.y);ch._lid=o.userData.lid;if(ch.opened){ch._lid.rotation.x=-1.1;ch._lid.position.set(0,20,-6);}}
    else if(ch.opened){ch.lid.rotation.x=-1.1;ch.lid.position.set(0,20,-6);}}
  questsDraw(dt);
  // instancias
  let n=0;for(const gm of gems){if(n>=460)break;const col=gm.t==='p'?'#c8a0ff':gm.t==='b'?'#3fb3c0':C.gold;instSet(GEMS,n++,gm.x,groundAt(gm.x,gm.y)+8+Math.sin(T*4+gm.x)*2,gm.y,gm.t==='g'?1:1.5,col,T*2+gm.x);}instDone(GEMS,n);
  n=0;for(const bl of bullets){if(n>=520)break;instSet(BULLETS,n++,bl.x,bl.z,bl.y,bl.r/6,bl.col);}instDone(BULLETS,n);
  n=0;for(const f of fx){if(f.k!=='p'||n>=900)continue;instSet(PARTS,n++,f.x,f.z||0,f.y,clamp(f.t*2,.3,1),f.c,f.x);}instDone(PARTS,n);
  for(let i=0;i<ng;i++){GLOWS.getMatrixAt(i,dummy.matrix);dummy.matrix.decompose(dummy.position,dummy.quaternion,dummy.scale);dummy.quaternion.copy(cam3.quaternion);dummy.updateMatrix();GLOWS.setMatrixAt(i,dummy.matrix);}instDone(GLOWS,ng);
  instDone(SHADOWS,ns);
  sweep();
  // agua y cielo
  if(WORLD.hazTex){WORLD.hazTex.offset.x=T*.01;WORLD.hazTex.offset.y=T*.007;}
  if(WORLD.aurora)WORLD.aurora.forEach((m,i)=>{m.material.opacity=.12+.08*Math.sin(T*.5+i);m.position.x=Math.sin(T*.05+i)*200;});
  const c=camera();updWeather(dt,c.x,c.y);sunFollow(c.x,c.y);animWater();
  if(WORLD.sky)WORLD.sky.position.set(cam3.position.x,0,cam3.position.z);
  if(WORLD.stars)WORLD.stars.position.set(cam3.position.x,0,cam3.position.z);
}

/* ---------- capa 2D: números, globos, minimapa ---------- */
function drawOverlay(){
  const g=octx;g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);g.imageSmoothingEnabled=false;
  if(state==='menu'||state==='select'||state==='realms'||!G)return;
  if(G.darkT>0){const k=Math.min(1,G.darkT,12-G.darkT+.01);const gr=g.createRadialGradient(W/2,H/2,H*.18,W/2,H/2,H*.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,`rgba(4,0,10,${.85*Math.min(1,k)})`);g.fillStyle=gr;g.fillRect(0,0,W,H);}
  if(G.sandT>0){const k=Math.min(1,G.sandT,11-G.sandT+.01);g.fillStyle=`rgba(214,170,100,${.42*Math.min(1,k)})`;g.fillRect(0,0,W,H);}
  if(G.slowT>0){const k=Math.min(1,G.slowT,12-G.slowT+.01);g.fillStyle=`rgba(200,230,255,${.18*Math.min(1,k)})`;g.fillRect(0,0,W,H);}
  if(G.stormT>0){g.fillStyle=`rgba(10,14,40,${Math.min(.35,G.stormT*.3)})`;g.fillRect(0,0,W,H);}
  {const hp=players.filter(p=>p.ctrl==='p1'||p.ctrl==='p2');const low=hp.length&&hp.some(p=>!p.down&&p.hp/p.maxHp<.3);const k=Math.min(1,(G.hitT||0)*1.6)+(low?.42+.22*Math.sin(T*6):0);
    if(k>0.01){const gr=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.28,W/2,H/2,Math.max(W,H)*.72);gr.addColorStop(0,'rgba(255,0,0,0)');gr.addColorStop(1,`rgba(220,0,0,${Math.min(.75,k*.75)})`);g.fillStyle=gr;g.fillRect(0,0,W,H);}}
  if(G.flashT>0){g.fillStyle=`rgba(255,255,240,${G.flashT*3.2})`;g.fillRect(0,0,W,H);}
  for(const t of texts){const p=toScreen(t.x,t.y,t.z);if(!p)continue;g.globalAlpha=Math.min(1,t.t*3);if(/^[0-9+]+$/.test(t.v))pixNum(g,t.v,p[0],p[1],t.c,2);else{g.font=t.big?'900 22px Nunito,sans-serif':'900 15px Nunito,sans-serif';g.textAlign='center';g.fillStyle='#000';g.fillText(t.v,p[0]+1,p[1]+1);g.fillStyle=t.c;g.fillText(t.v,p[0],p[1]);}}g.globalAlpha=1;
  if(G.prompt){const p=toScreen(G.prompt.x,G.prompt.y,groundAt(G.prompt.x,G.prompt.y)+50);if(p){g.font='800 14px Nunito,sans-serif';g.textAlign='center';g.textBaseline='middle';const w=g.measureText(G.prompt.t).width+24;g.fillStyle='rgba(20,24,40,.92)';roundRect(g,p[0]-w/2,p[1]-15,w,30,10);g.fill();g.strokeStyle=THEME_ACC;g.lineWidth=2;g.stroke();g.fillStyle=G.prompt.bad?'#ff8a7a':'#fff';g.fillText(G.prompt.t,p[0],p[1]+1);}}
  g.font='800 14px Nunito,sans-serif';g.textAlign='center';g.textBaseline='middle';
  if(G.portals)for(const pt of G.portals){const p=toScreen(pt.x,pt.y,groundAt(pt.x,pt.y)+90);if(!p)continue;const t=REALMS[pt.key].name;const w=g.measureText(t).width+16;g.fillStyle='#1c1210';g.fillRect(p[0]-w/2,p[1]-12,w,24);g.fillStyle=REALMS[pt.key].acc;g.fillText(t,p[0],p[1]+1);}
  for(const al of WORLD.altars){if(al.used||al.charge<=0)continue;const p=toScreen(al.x,al.y,groundAt(al.x,al.y)+60);if(!p)continue;g.strokeStyle='#1c1210';g.lineWidth=6;g.beginPath();g.arc(p[0],p[1],14,0,6.283);g.stroke();g.strokeStyle=C.gold;g.lineWidth=4;g.beginPath();g.arc(p[0],p[1],14,-1.57,-1.57+al.charge/2.5*6.283);g.stroke();}
  for(const p of[...players,...npcs,...remotesHere()]){const k=p.giant>0?2:1,s=toScreen(p.x,p.y,p.z+44*k);if(!s)continue;
    if(players.length>1||p.ctrl==='npc'||p.ctrl==='net'){g.font='800 12px Nunito,sans-serif';g.fillStyle=p.col;g.fillText(p.ctrl==='ai'?'IA':p.ctrl==='npc'?p.g.name:p.ctrl==='net'?(p.name||p.g.name)+(p.dn?' · caído':''):'J'+(p.idx+1),s[0],s[1]);}
    if(p.sayT>0&&p.say){g.font='700 14px Nunito,sans-serif';const w=Math.min(280,g.measureText(p.say).width+20),bx=clamp(s[0],w/2+8,W-w/2-8),by=s[1]-30;
      g.fillStyle='#1c1210';g.fillRect(bx-w/2-3,by-17,w+6,34);g.fillStyle='#f2e3c6';g.fillRect(bx-w/2,by-14,w,28);g.fillRect(s[0]-4,by+14,8,6);g.fillStyle='#1c1210';g.fillText(p.say,bx,by+1,w-10);}}
  // flechas a jefes fuera de vista
  for(const e of G.bosses){const s=toScreen(e.x,e.y,e.z+40);if(s&&s[0]>0&&s[0]<W&&s[1]>0&&s[1]<H)continue;const c=camera(),ddx=e.x-c.x,ddy=e.y-c.y,cyw=Math.cos(G.yaw),syw=Math.sin(G.yaw);const a=Math.atan2(ddx*syw+ddy*cyw,ddx*cyw-ddy*syw);const rr=Math.min(W,H)/2-40;const ax=W/2+Math.cos(a)*rr,ay=H/2+Math.sin(a)*rr;
    g.save();g.translate(ax,ay);g.rotate(a);g.fillStyle=C.blood;g.beginPath();g.moveTo(16,0);g.lineTo(-10,-11);g.lineTo(-10,11);g.closePath();g.fill();g.restore();}
  // minimapa
  const mmR=Math.min(78,W*.09),mx=W-mmR-18,my=mmR+18;
  g.fillStyle='rgba(10,8,8,.6)';g.beginPath();g.arc(mx,my,mmR+4,0,6.283);g.fill();g.strokeStyle=THEME_ACC;g.lineWidth=3;g.beginPath();g.arc(mx,my,mmR+4,0,6.283);g.stroke();
  const sc=mmR/ARENA,cy=Math.cos(G.yaw),sy=Math.sin(G.yaw);const P2=(x,y)=>{const rx=x*cy-y*sy,ry=x*sy+y*cy;return[mx+rx*sc,my+ry*sc];};
  g.fillStyle='rgba(255,120,120,.75)';for(let i=0;i<enemies.length;i+=2){const e=enemies[i];if(e.boss)continue;const[a,b2]=P2(e.x,e.y);g.fillRect(a-1,b2-1,2,2);}
  for(const al of WORLD.altars){if(al.used)continue;const[a,b2]=P2(al.x,al.y);g.fillStyle=C.gold;g.fillRect(a-3,b2-3,6,6);}
  for(const ch of WORLD.chests){if(ch.opened)continue;const[a,b2]=P2(ch.x,ch.y);g.fillStyle='#c98a3a';g.fillRect(a-2,b2-2,4,4);}
  if(G.portals)for(const pt of G.portals){const[a,b2]=P2(pt.x,pt.y);g.fillStyle=REALMS[pt.key].acc;g.beginPath();g.arc(a,b2,5,0,6.283);g.fill();}
  for(const e of G.bosses){const[a,b2]=P2(e.x,e.y);g.fillStyle=C.blood;g.beginPath();g.arc(a,b2,5,0,6.283);g.fill();}
  for(const r of remotesHere()){const[a,b2]=P2(r.x,r.y);g.fillStyle='#7dffb0';g.beginPath();g.arc(a,b2,4,0,6.283);g.fill();}
  questsOverlay(g,P2);
  for(const p of players){const[a,b2]=P2(p.x,p.y);g.fillStyle=p.col;g.beginPath();g.arc(a,b2,4,0,6.283);g.fill();g.strokeStyle='#000';g.lineWidth=1;g.stroke();}
  if(joy){g.strokeStyle='rgba(242,227,198,.6)';g.lineWidth=3;g.beginPath();g.arc(joy.ox,joy.oy,50,0,6.283);g.stroke();const dx=joy.x-joy.ox,dy=joy.y-joy.oy,d=Math.hypot(dx,dy),m=Math.min(d,50)/(d||1);g.fillStyle='rgba(242,227,198,.5)';g.beginPath();g.arc(joy.ox+dx*m,joy.oy+dy*m,20,0,6.283);g.fill();}
}

function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}

/* ---------- bucle ---------- */
let last=performance.now(),menuRealm='cielo',menuT=0;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  try{
    const live=G&&(state==='play'||((state==='pause'||state==='levelup')&&NET.inRun));
    if(live)update(dt);
    netTick(dt);
    if(G&&(state==='play'||state==='levelup'||state==='pause'||state==='end')&&WORLD){hudTick();updCamera(dt,false);renderGame(dt);}
    else if(WORLD){menuT+=dt;if(menuT>14&&!PREV_BUSY){menuT=0;const ks=Object.keys(REALMS);menuRealm=ks[(ks.indexOf(menuRealm)+1)%ks.length];buildWorld(menuRealm);clearObjs();}
      updCamera(dt,true);updWeather(dt,0,0);sunFollow(0,0);animWater();if(WORLD.hazTex){WORLD.hazTex.offset.x=T*.01;}if(WORLD.aurora)WORLD.aurora.forEach((m,i)=>{m.material.opacity=.12+.08*Math.sin(T*.5+i);});}
    if(renderer&&WORLD&&!PREV_BUSY)renderer.render(scene,cam3);
    {const fh=$('focusHint'),need=state==='play'&&!isTouch&&!document.hasFocus();if(fh.hidden===need)fh.hidden=!need;}
    drawOverlay();
  }catch(err){console.error(err);}
  requestAnimationFrame(loop);}
let PREV_BUSY=false;
function toMenu(){state='menu';if(document.pointerLockElement)try{document.exitPointerLock();}catch(err){}$('hud').hidden=true;show('menu');clearObjs();players=[];npcs=[];enemies=[];proj=[];fx=[];G=null;if(NET.sala){NET.inRun=false;salaPresence({phase:'lobby'});}buildWorld(menuRealm);clearObjs();uiHome();lobbyPresence();}
if(GL_OK){buildWorld(menuRealm);clearObjs();}
requestAnimationFrame(loop);
window.__bonk={get state(){return state;},get G(){return G;},get players(){return players;},get enemies(){return enemies;},get remotes(){return remotes;},cfg,newRun,usePower,spawnBoss,startRealm,jump,PROF:()=>PROF};
