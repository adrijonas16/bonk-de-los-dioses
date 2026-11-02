/* Bonk de los Dioses · modelos 3D externos (KayKit, Quaternius, Khronos Fox — CC0 / CC-BY) */
'use strict';
const AS={ready:false,failed:false,g:{},prog:0,props:{},bakes:{},recol:{},boxes:{}};
const AS_FILES=['u_man','c_knight','c_barbarian','c_mage','c_rogue','c_rogue_hooded','s_warrior','s_minion','s_mage','s_rogue','q_demon','q_bluedemon','q_dino','q_cactoro','q_mushroomking','q_mushnub','q_ghost','q_hywirl','fox','p_hex','p_hw','p_dg'];
function asLoad(){
  if(!THREE.GLTFLoader){AS.failed=true;return Promise.resolve();}
  const L=new THREE.GLTFLoader();let done=0;
  return Promise.all(AS_FILES.map(k=>new Promise(res=>{L.load('assets/'+k+'.json',g=>{asFix(g.scene);AS.g[k]=g;done++;AS.prog=done/AS_FILES.length;res();},undefined,err=>{console.warn('asset',k,err);done++;AS.prog=done/AS_FILES.length;res();});})))
    .then(()=>{try{asPrepProps();AS.ready=!!(AS.g.c_knight&&AS.g.c_mage);if(!AS.ready)AS.failed=true;}catch(err){console.error(err);AS.failed=true;}if(typeof onAssetsReady==='function')onAssetsReady();});}
function asFix(root){root.traverse(o=>{if(!o.isMesh)return;if(!o.geometry.attributes.normal)o.geometry.computeVertexNormals();o.castShadow=true;const ms=Array.isArray(o.material)?o.material:[o.material];
  const nm=ms.map(m=>{if(m.map){m.map.encoding=THREE.LinearEncoding;m.map.magFilter=THREE.NearestFilter;m.map.needsUpdate=true;}
    const l=new THREE.MeshLambertMaterial({map:m.map||null,color:m.color?m.color.clone():new THREE.Color('#ffffff'),skinning:!!o.isSkinnedMesh,vertexColors:!!(o.geometry&&o.geometry.attributes.color&&!m.map)});l.name=m.name;return l;});
  o.material=Array.isArray(o.material)?nm:nm[0];});}

/* ---------- recoloreado de la paleta KayKit ---------- */
const KK_ROLES={
 c_knight:{'0,0':'skin','1,0':'hair','3,0':'metal','7,0':'metal','2,1':'metal','6,0':'leather','4,0':'dark','7,1':'dark','0,1':'primary','1,1':'trim'},
 c_mage:{'0,0':'skin','7,2':'skin','1,0':'hair','0,1':'primary','1,1':'primary','7,1':'primaryD','2,1':'cape','3,0':'trim','4,0':'trim','5,0':'leather','2,2':'accent','3,2':'leather'},
 c_barbarian:{'0,0':'skin','1,0':'hair','6,0':'leather','2,1':'trim','0,1':'primary','1,1':'primary','7,0':'cape','3,2':'leatherD','7,1':'leatherD','7,2':'leatherD','3,0':'metal'},
 c_rogue:{'0,0':'skin','1,0':'hair','0,1':'primaryD','1,1':'primary','6,0':'leather','5,0':'leather','5,2':'leather','3,2':'leather','7,1':'leatherD','3,0':'metal'},
};
KK_ROLES.c_rogue_hooded=KK_ROLES.c_rogue;
function kkTexture(body,pal){const key=body+JSON.stringify(pal);if(AS.recol[key])return AS.recol[key];
  const g=AS.g[body];let src=null;g.scene.traverse(o=>{if(o.isMesh&&!src&&o.material.map)src=o.material.map.image;});
  const N=512,c=mkCanvas(N,N),x=c.getContext('2d');x.drawImage(src,0,0,N,N);const id=x.getImageData(0,0,N,N),d=id.data;const roles=KK_ROLES[body]||{};
  const cw=N/8,ch=N/4;
  for(const k in roles){const col=pal[roles[k]];if(!col)continue;const[cx,cy]=k.split(',').map(Number);const T=hexRGB(col);
    let mr=0,mg=0,mb=0,n=0;for(let y=cy*ch+4;y<(cy+1)*ch-4;y+=2)for(let xx=cx*cw+2;xx<(cx+1)*cw-8;xx+=2){const i=(y*N+xx)*4;mr+=d[i];mg+=d[i+1];mb+=d[i+2];n++;}
    const ml=(mr+mg+mb)/(3*n)||1;
    for(let y=cy*ch;y<(cy+1)*ch;y++)for(let xx=cx*cw;xx<(cx+1)*cw;xx++){const i=(y*N+xx)*4;const l=(d[i]+d[i+1]+d[i+2])/3/ml;d[i]=clamp(T[0]*l,0,255);d[i+1]=clamp(T[1]*l,0,255);d[i+2]=clamp(T[2]*l,0,255);}}
  x.putImageData(id,0,0);const t=new THREE.CanvasTexture(c);t.flipY=false;t.magFilter=THREE.NearestFilter;t.encoding=THREE.LinearEncoding;AS.recol[key]=t;return t;}

const GRAYC=new WeakMap();function grayTex(map){if(!map||!map.image)return map;if(GRAYC.has(map))return GRAYC.get(map);const im=map.image,c=mkCanvas(im.width,im.height),x=c.getContext('2d');x.drawImage(im,0,0);const id=x.getImageData(0,0,c.width,c.height),d=id.data;
  for(let i=0;i<d.length;i+=4){const l=Math.min(255,(d[i]*.3+d[i+1]*.59+d[i+2]*.11)*1.35);d[i]=d[i+1]=d[i+2]=l;}x.putImageData(id,0,0);const t=new THREE.CanvasTexture(c);t.flipY=map.flipY;t.encoding=THREE.LinearEncoding;t.magFilter=THREE.NearestFilter;GRAYC.set(map,t);return t;}
/* ---------- qué cuerpo usa cada dios ---------- */
const GOD_BODY={
 zeus:'c_barbarian',poseidon:'c_barbarian',hades:'c_mage',artemisa:'c_rogue',apolo:'c_mage',atenea:'c_knight',thor:'c_barbarian',odin:'c_barbarian',freya:'c_rogue',loki:'c_mage',
 ra:'c_knight',anubis:'c_knight',sekhmet:'c_rogue',marduk:'c_barbarian',inanna:'c_rogue',enki:'c_barbarian',vishnu:'c_mage',shiva:'c_mage',durga:'c_rogue',hanuman:'c_barbarian',
 susanoo:'c_knight',amaterasu:'c_rogue',raijin:'c_barbarian',wukong:'c_rogue_hooded',nezha:'c_mage',erlang:'c_knight',quetzalcoatl:'c_mage',huitzilopochtli:'c_knight',tezcatlipoca:'c_rogue_hooded',tlaloc:'c_mage',
 chaac:'c_barbarian',gemelos:'c_rogue',ixchel:'c_rogue',inti:'c_knight',illapa:'c_knight',mamaquilla:'c_rogue',pachamama:'c_rogue',viracocha:'c_barbarian',shango:'c_barbarian',ogun:'c_barbarian',
 oya:'c_rogue',yemaya:'c_rogue',lugh:'c_knight',dagda:'c_barbarian',morrigan:'c_rogue_hooded',dios:'c_mage',jesus:'c_barbarian',mercader:'c_rogue_hooded'};
const KK_HIDE=/Shield|Sword|Axe|Mug|Knife|Crossbow|Throwable|Spellbook|Wand|Staff|_Hat|Helmet|Cape/;
function kkScale(body){return{h:2.3};}
function findBone(root,name){let r=null;root.traverse(o=>{if(!r&&o.name===name)r=o;});return r;}
function kkClip(name){const a=AS.g.c_knight.animations;return a.find(c=>c.name===name)||a.find(c=>c.name==='Idle');}
function buildGodKK(id){
  const L0=LOOKS[id]||{},light=L0.head==='light';const body=GOD_BODY[id]||'c_mage';
  const L=Object.assign({},L0,{s:light?'#fff6e0':L0.s||C.skin,h:L0.h||INK});
  const pal={skin:L.s,hair:L.b==='full'||L.b==='short'?(L.bc||L.h):L.h,primary:light?'#fff6e0':L.r,primaryD:shade(light?'#fff6e0':L.r,-.25),trim:light?'#f4d27a':L.t,cape:L.cc||shade(L.r||'#888',-.2),
    leather:light?'#e8d8a0':'#7a5234',leatherD:light?'#d8c890':'#5a3a24',metal:['knight'].some(k=>body.includes(k))?(L.hc&&lum(L.hc)>.3?L.hc:C.gold):'#9aa4ae',dark:'#3a3438',accent:L.t};
  if(body==='c_knight'){pal.metal=L.r;pal.primary=L.t;pal.trim=C.gold;}
  const tex=kkTexture(body,pal);
  const root=THREE.SkeletonUtils.clone(AS.g[body].scene);const mats=[];
  const keepCape=L.ex==='cape';
  root.traverse(o=>{if(!o.isMesh)return;if(KK_HIDE.test(o.name)&&!(keepCape&&/Cape/.test(o.name))){o.visible=false;return;}
    if(L.head&&L.head!=='monkey'&&/_Head/.test(o.name)){o.visible=false;return;}
    const m=o.material.clone();m.map=tex;m.emissive=new THREE.Color('#000000');mats.push(m);o.material=m;o.castShadow=true;o.frustumCulled=false;});
  const H=kkScale(body).h;const k=40/H;
  const wrap=new THREE.Group();wrap.add(root);root.scale.setScalar(k);
  // tocados y armas en los huesos
  const headB=findBone(root,'head'),handR=findBone(root,'handslotr');
  const ctx=mkCtx(mats);
  if(headB){const hg=new THREE.Group();headB.add(hg);hg.userData.bald=body==='c_barbarian';hg.scale.setScalar(1/k*1.5);hg.position.set(0,.42,0);addHeadGear(L,hg,ctx,id);}
  if(handR&&!(L.held==='none'||light)){const hw=new THREE.Group();handR.add(hw);hw.scale.setScalar(1/k*1.05);wrap.userData.pendingHand=hw;buildHeld(L.held,L.hc||C.gold,id,hw,ctx);}
  if(L.ex==='shield'){const hl=findBone(root,'handslotl');if(hl){const sg=new THREE.Group();hl.add(sg);sg.scale.setScalar(1/k);ctx.cy(6,6,1,16,ctx.M(shade(L.t,-.1)),0,0,0,sg,0,0,Math.PI/2);ctx.cy(4,4,1.3,14,ctx.M(L.t),-.3,0,0,sg,0,0,Math.PI/2);}}
  if(L.ex==='multiarm'){const ch=findBone(root,'chest');if(ch){const ag=new THREE.Group();ch.add(ag);ag.scale.setScalar(1/k);for(const[sx,a]of[[-1,.9],[1,.9],[-1,1.5],[1,1.5]]){const p=new THREE.Group();p.position.set(sx*5,6,-1);p.rotation.z=sx*a;ag.add(p);ctx.cy(1.6,1.3,12,8,ctx.M(L.s),0,-6,0,p);ctx.sp(1.9,ctx.M(L.s),0,-12.5,0,p);ctx.add(new THREE.TorusGeometry(2.4,.6,4,12),ctx.MB2(C.gold),0,-15,0,p);}}}
  if(L.ex==='drums'){const ch=findBone(root,'chest');if(ch){const dg=new THREE.Group();ch.add(dg);dg.scale.setScalar(1/k);dg.position.z=-.25;for(let i=0;i<8;i++){const a=Math.PI*(.95+i/7*1.1);ctx.cy(2.6,2.6,2.2,12,ctx.M('#8a3a2a'),Math.cos(a)*15,Math.sin(a)*13+4,-4,dg,Math.PI/2);ctx.cy(1.7,1.7,2.4,12,ctx.M('#e8c86a'),Math.cos(a)*15,Math.sin(a)*13+4,-3.8,dg,Math.PI/2);}}}
  if(light){const g=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex('#fff2c0'),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.7}));g.scale.set(90,90,1);g.position.y=30;wrap.add(g);}
  const mixer=new THREE.AnimationMixer(root);const act={};
  for(const[n,c]of[['idle','Idle'],['run','Running_A'],['jump','Jump_Idle'],['atk',body==='c_mage'?'Spellcast_Shoot':'1H_Melee_Attack_Chop'],['pow','Spellcast_Raise'],['die','Death_A'],['dead','Death_A_Pose'],['hit','Hit_A'],['dash','Dodge_Forward'],['cheer','Cheer']]){const cl=kkClip(c);if(cl)act[n]=mixer.clipAction(cl);}
  for(const n of['atk','pow','die','hit','dash','cheer']){if(act[n]){act[n].setLoop(THREE.LoopOnce,1);act[n].clampWhenFinished=true;}}
  act.idle.play();mixer.update(0);wrap.updateMatrixWorld(true);if(wrap.userData.pendingHand){const hw=wrap.userData.pendingHand,qh=new THREE.Quaternion();hw.parent.getWorldQuaternion(qh);hw.quaternion.copy(qh.invert());delete wrap.userData.pendingHand;}
  wrap.userData={kk:true,god:id,mixer,act,cur:'idle',mats,yaw:0,disp:()=>{mats.forEach(m=>m.dispose());ctx.dispose();mixer.stopAllAction();}};
  return wrap;}
function mkCtx(mats){const geos=[];
  const M=(c,o)=>{const m=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));m.emissive.set(c).multiplyScalar(.14);m.userData.em0=m.emissive.clone();mats.push(m);return m;};
  const MB2=(c,o)=>{const m=new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));m.userData.basic=true;mats.push(m);return m;};
  const add=(geo,mat,x,y,z,par,rx,ry,rz)=>{geos.push(geo);const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;par.add(m);return m;};
  const bx=(w,h,d,mat,x,y,z,par,rx,ry,rz)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,par,rx,ry,rz);
  const cy=(a,b,h,s,mat,x,y,z,par,rx,ry,rz)=>add(new THREE.CylinderGeometry(a,b,h,s),mat,x,y,z,par,rx,ry,rz);
  const sp=(r,mat,x,y,z,par,sx,sy,sz)=>{const m=add(new THREE.SphereGeometry(r,12,9),mat,x,y,z,par);if(sx)m.scale.set(sx,sy,sz);return m;};
  const piv=(par,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);par.add(g);return g;};
  return{M,MB2,add,bx,cy,sp,piv,dispose:()=>geos.forEach(g=>g.dispose())};}
/* tocados sobre la cabeza KayKit (centro de la cabeza en 0,0,0; radio ~6) */
function addHeadGear(L,head,ctx,id){const{M,MB2,add,bx,cy,sp,piv}=ctx;const R=6.2,gy=R*.78,gc=L.gc||C.gold,mG=M(gc);
  const ring=(r,t,mat,y)=>add(new THREE.TorusGeometry(r,t,5,22),mat,0,y,0,head,Math.PI/2);
  const hd=L.head;
  const eyes=(x,y,z,col,r)=>{for(const sx of[-1,1]){sp(r||1.05,MB2(col||C.gold),sx*x,y,z,head,1,.8,.6);sp((r||1.05)*.45,M(INK),sx*x,y,z+.45,head,.6,1,.6);}};
  const EGY=/^(anubis|set|ra|horus|thot|sekhmet|isis|osiris)$/.test(id||'');const nemes=(c1,c2)=>{if(!EGY)return;for(const sx of[-1,1])for(let i=0;i<4;i++)bx(1.9,2.6,6,M(i%2?c2:c1),sx*R*.93,-1.4-i*2.6,-.6,head);bx(R*2,1.6,R*1.6,M(c2),0,R*.55,-.8,head);};
  if(hd==='jackal'){const k=M(L.h),kd=M(shade(L.h,-.25));sp(R*.92,k,0,0,-.4,head,1,1.02,1.08);
    add(new THREE.ConeGeometry(2.7,10,8),k,0,-1.8,R*.75+4.6,head,Math.PI/2);add(new THREE.CylinderGeometry(1.7,2.3,6,8),kd,0,-3.2,R*.7+2.8,head,Math.PI/2);
    sp(1.05,M(INK),0,-1.5,R*.75+9.4,head);
    for(const sx of[-1,1]){const e=add(new THREE.ConeGeometry(2.1,10,4),k,sx*3,R+3.8,-1.2,head,0,0,sx*-.16);add(new THREE.ConeGeometry(1.1,6.5,4),M(C.gold),sx*3,R+3,-.4,head,0,0,sx*-.16);}
    eyes(2.5,1.3,R*.8,C.gold,1.1);nemes(L.r||'#e8e0cc',L.t||'#2f4f9e');}
  if(hd==='falcon'){const k=M(L.h),w=M('#f2ead8');sp(R*.92,k,0,0,0,head,1,1.04,1.06);sp(R*.62,w,0,-1.6,R*.42,head,1,.9,.8);
    add(new THREE.ConeGeometry(2,5.5,6),M('#f2c23a'),0,-.4,R*.95+1.6,head,Math.PI/2);add(new THREE.ConeGeometry(1.5,4.2,6),M('#2a2420'),0,-1.9,R*.95+3.6,head,Math.PI/2+1.1);
    for(const sx of[-1,1])bx(.9,3.4,.6,M(INK),sx*2.6,-1.6,R*.82,head,0,0,sx*.25);
    eyes(2.5,.9,R*.8,'#f2c23a',1.15);nemes(L.t||'#2f4f9e',C.gold);}
  if(hd==='ibis'){const k=M(L.h),bk=M('#1c1a22');sp(R*.9,k,0,0,0,head,1,1.04,1.08);
    let par=piv(head,0,-.6,R*.85);for(let i=0;i<6;i++){const sg=piv(par,0,0,i?2.4:0);add(new THREE.CylinderGeometry(.55-i*.06,.75-i*.06,2.6,6),bk,0,0,1.2,sg,Math.PI/2);sg.rotation.x=i?.2:.05;par=sg;}
    eyes(2.4,1.1,R*.78,'#e8c86a',1);nemes(L.t||'#3d8a94',C.gold);}
  if(hd==='lion'){const mane=M(L.h),k=M(L.s);sp(R*1.42,mane,0,-.6,-1.6,head,1,1.05,.75);
    for(let i=0;i<14;i++){const a=i/14*6.283;add(new THREE.ConeGeometry(1.8,5,5),mane,Math.cos(a)*R*1.35,-.6+Math.sin(a)*R*1.35,-2,head,0,0,a-Math.PI/2);}
    sp(R*.88,k,0,0,.8,head);sp(R*.5,M(shade(L.s,.12)),0,-2.2,R*.72,head,1.1,.75,.8);bx(2.6,1.6,1.4,M('#5a2a22'),0,-.8,R*1.08,head);
    for(const sx of[-1,1])sp(1.6,k,sx*R*.7,R*.75,-.4,head,1,1,.5);eyes(2.4,1.1,R*.8,'#f2c23a',1.05);}
  if(hd==='elephant'){const k=M(L.s),kd=M(shade(L.s,-.15));sp(R*.98,k,0,.4,0,head,1,1.05,1);
    for(const sx of[-1,1]){const ear=sp(R*1.15,kd,sx*R*1.15,-.6,-1.2,head,.22,1,1);ear.rotation.y=sx*.35;sp(R*.85,M('#e8a0a8'),sx*R*1.12,-.6,-.9,head,.18,.85,.85).rotation.y=sx*.35;
      add(new THREE.ConeGeometry(.75,6,6),MB2('#f8f2e0'),sx*2.4,-3.8,R*.72+2.4,head,Math.PI/2+.9);}
    let par=piv(head,0,-1.6,R*.85);for(let i=0;i<7;i++){const sg=piv(par,0,i?-2.5:0,0);add(new THREE.CylinderGeometry(1.7-i*.17,1.9-i*.17,2.7,8),k,0,-1.25,0,sg);sg.rotation.x=i?(i<5?-.08:-.5):-.35;par=sg;}
    eyes(2.8,1.4,R*.84,'#1c1210',.8);}
  if(hd==='serpent'){const sc=M(L.gc||'#3aa07a'),bel=M('#e8d07a');sp(R*.9,sc,0,0,0,head,1,.92,1.15);
    sp(R*.62,sc,0,-1.4,R*.62+2.8,head,1,.55,1.25);sp(R*.5,bel,0,-2.6,R*.6+2.2,head,1,.35,1.2);
    const tg=piv(head,0,-2.8,R*.6+8.4);bx(.35,.25,3,M('#e23a3a'),0,0,1.4,tg);for(const sx of[-1,1])bx(.3,.22,1.4,M('#e23a3a'),sx*.4,0,3.3,tg,0,sx*.5,0);
    for(const sx of[-1,1]){sp(1.1,MB2('#ffd34d'),sx*2.4,1,R*.78,head,1,.8,.6);bx(.25,1.5,.4,M(INK),sx*2.4,1,R*.78+.6,head);}
    const fc=['#3aa07a','#e23a3a','#2f6fd6','#ffc23a','#3aa07a'];for(let i=0;i<11;i++){const a=Math.PI*(-.1+i/10*1.2);const f=add(new THREE.ConeGeometry(1.4,9,4),M(fc[i%5]),Math.cos(a)*R*1.2,Math.sin(a)*R*1.2+.5,-2.4,head,0,0,a-Math.PI/2);f.scale.z=.35;}}
  if(hd==='dragon'){const k=M(L.s),kd=M(shade(L.s,-.25)),hn=M(L.gc||'#e8e0cc');sp(R*.92,k,0,0,0,head,1,.95,1.1);
    bx(R*1.05,R*.55,R*1.3,k,0,-1.2,R*.75+2,head);bx(R*.95,R*.28,R*1.2,kd,0,-3.6,R*.7+1.6,head);for(const sx of[-1,1]){sp(.6,M(INK),sx*1.6,-.4,R*.75+6,head);
      const h1=add(new THREE.ConeGeometry(1.3,9,6),hn,sx*3.2,R*.85,-2.4,head,-.9,0,sx*-.35);}
    for(let i=0;i<5;i++)add(new THREE.ConeGeometry(1,3.2,4),hn,0,R*.85-i*1.4,-R*.6-i*1.2,head,-.6-i*.2);
    eyes(2.8,.9,R*.82,'#ff6a2a',1);}
  if(hd==='light'){add(new THREE.IcosahedronGeometry(R*.95,1),MB2('#fff6e0'),0,0,0,head);add(new THREE.IcosahedronGeometry(R*.65,1),MB2('#ffffff'),0,0,2.4,head);
    const rays=piv(head,0,0,-3.6);for(let i=0;i<12;i++){const a=i/12*6.283;bx(1.2,i%2?8:5.5,.5,MB2(i%2?'#f4d27a':'#fff6e0'),Math.cos(a)*10,Math.sin(a)*10,0,rays,0,0,a-Math.PI/2);}head.userData.rays=rays;}
  if(!hd){const hs=L.hs,mH=M(L.h);
    if(head.userData.bald&&hs!=='bald'){const cap=add(new THREE.SphereGeometry(R*1.05,16,10,0,Math.PI*2,0,Math.PI*.36),mH,0,-.2,-.6,head);cap.scale.set(1.04,1.05,1.1);
      if(hs==='long'){const g2=new THREE.CylinderGeometry(R*1.02,R*1.12,R*1.4,14,1,true,Math.PI*.5,Math.PI);add(g2,M(L.h,{side:THREE.DoubleSide}),0,-R*.75,-.4,head);}}
    if(hs==='bun')sp(3,mH,0,R*.9,-2.8,head);
    if(hs==='buns'){sp(2.6,mH,-R*.75,R*.7,-.4,head);sp(2.6,mH,R*.75,R*.7,-.4,head);}
    if(hs==='spiky')for(let i=0;i<6;i++)add(new THREE.ConeGeometry(1.7,6,5),mH,-5+i*2,R+1.6-Math.abs(i-2.5)*.5,-1+(i%2),head,0,0,(i-2.5)*-.28);
    if(hs==='flame'){const fl=piv(head,0,R*.7,0);for(let i=0;i<9;i++)add(new THREE.ConeGeometry(2,7+((i*7)%4),6),MB2(i%2?'#7ad0ff':'#c8f0ff',{transparent:true,opacity:.9}),-5.5+i*1.4,2.6,-1.5+(i%3),fl,0,0,(i-4)*-.16);head.userData.flame=fl;}
    if(L.ex==='thirdeye')sp(.9,MB2('#e23a2a'),0,1.6,R*.97,head);
    if(L.ex==='eyepatch'){bx(3.4,2.6,.6,M(INK),-2.2,0,R*.95,head);ring(R*1.0,.25,M(INK),.6);}
    if(L.ex==='mask'){for(const sx of[-2.3,2.3])add(new THREE.TorusGeometry(1.6,.45,4,10),M('#2f4f9e'),sx,.2,R*.95,head);}
    if(L.ex==='stripes'){for(const y of[-1.2,1.2])bx(R*1.8,.7,.4,M(y>0?'#e8b53e':INK),0,y-.6,R*.92,head);}}
  switch(L.gear){
  case'laurel':{const lc=gc===C.gold||gc==='#e8b53e'?'#6f9a4c':gc;const ml=M(lc),ml2=M(shade(lc,.2));for(let i=0;i<18;i++){const a=i/18*Math.PI*1.7+Math.PI*1.15;add(new THREE.SphereGeometry(1,6,4),i%2?ml:ml2,Math.cos(a)*R*.97,R*.42,Math.sin(a)*R*.97,head).scale.set(1.7,.7,1);}break;}
  case'crown':{const cyy=R*.6,cr=R*.84;add(new THREE.CylinderGeometry(cr,cr*.97,2.4,16,1,true),M(gc,{side:THREE.DoubleSide}),0,cyy,0,head);for(let i=0;i<8;i++){const a=i/8*6.283;add(new THREE.ConeGeometry(.9,2.8,4),mG,Math.cos(a)*cr,cyy+2.4,Math.sin(a)*cr,head);}sp(.9,MB2(C.blood),0,cyy,cr+.3,head);break;}
  case'helmet':{const h=add(new THREE.SphereGeometry(R*1.08,16,9,0,Math.PI*2,0,Math.PI*.55),mG,0,.4,-.2,head);bx(1.2,3,R*1.5,M(C.blood),0,R+.8,-.8,head);bx(1.3,.9,R*1.55,M(shade(C.blood,.25)),0,R+2.3,-.8,head);break;}
  case'horns':for(const sx of[-1,1]){add(new THREE.ConeGeometry(1.4,7,6),mG,sx*R*.85,gy+1.6,0,head,0,0,sx*-.8);add(new THREE.ConeGeometry(.9,3.8,6),mG,sx*R*1.2,gy+4.4,0,head,0,0,sx*-.2);}break;
  case'feathers':{ring(R*.95,1,M(C.gold),R*.45);for(let i=-3;i<=3;i++){const f=piv(head,i*1.4,gy,-R*.6);const l=10+(3-Math.abs(i))*1.6;sp(1.1,M(i%2?gc:shade(gc,.25)),0,l/2,0,f,1,l/2.2,.35);sp(.9,M(i%2?C.gold:C.blood),0,l,0,f);f.rotation.z=-i*.24;f.rotation.x=-.2;}break;}
  case'sun':if(hd!=='falcon'){cy(7,7,.8,18,MB2(C.gold),0,gy+3,-R*.9,head,Math.PI/2);cy(4.4,4.4,1,14,MB2('#f2622c'),0,gy+3,-R*.85,head,Math.PI/2);}ring(R*.95,.6,mG,R*.42);break;
  case'moon':add(new THREE.TorusGeometry(3.4,1.1,6,12,Math.PI*1.25),MB2('#e8eef8'),0,gy+3.8,0,head,0,0,-Math.PI*.12);ring(R*.95,.5,M('#c8ccd8'),R*.42);break;
  case'halo':{const h=ring(R*1.1,.7,MB2('#f8e080'),gy+4);head.userData.halo=h;break;}
  case'band':ring(R*.97,.9,mG,R*.4);break;
  case'hat':cy(R*1.8,R*1.8,1.1,18,mG,0,gy+.4,0,head);cy(R*.9,R*1.05,6,14,mG,0,gy+3.6,0,head);ring(R*1.0,.5,M(shade(gc,.3)),gy+1.2);break;
  case'diadem':ring(R*.96,.45,mG,R*.42);sp(1,MB2('#7de0ff'),0,R*.42,R*.97,head);break;
  }}
function animGodKK(m,p,dt){const u=m.userData;
  p.atk=Math.max(0,(p.atk||0)-dt);p.powAnim=Math.max(0,(p.powAnim||0)-dt);
  let want=p.down?'dead':p.air?'jump':p.moving?'run':'idle';
  if(p.powAnim>.5&&!u.powLock){u.powLock=true;}if(p.powAnim<=0)u.powLock=false;
  const one=u.one&&u.act[u.one]&&u.act[u.one].isRunning()?u.one:null;
  if(!p.down){if(p.powAnim>.6&&u.one!=='pow'){playOne(u,'pow');}else if(p.dashT>.15&&u.one!=='dash'){playOne(u,'dash');}else if(p.atk>.2&&!p.moving&&!p.air&&!one){playOne(u,'atk');}}
  if(u.one&&!(u.act[u.one]&&u.act[u.one].isRunning())){u.act[u.one].fadeOut(.15);u.one=null;}
  if(want!==u.cur){const a=u.act[u.cur],b=u.act[want];if(b){b.reset();b.setEffectiveWeight(1);b.play();if(a)a.crossFadeTo(b,.18,false);}u.cur=want;}
  u.mixer.update(dt*(p.moving&&want==='run'?Math.min(1.5,.85+(p.speed||150)/400):1));if(u.cape)u.cape.rotation.x=.15+(p.moving?.5:0)+(p.air?.4:0)+Math.sin(T*6)*.05;if(u.tail)u.tail.rotation.y=Math.sin(T*3)*.5;
  const ty=Math.atan2(p.fx||0,p.fy||1);u.yaw=angLerp(u.yaw,ty,Math.min(1,dt*12));m.rotation.y=u.yaw;
  const R=m.children[0];const head=findBoneCached(m,'head');if(head){for(const c of head.children){if(c.userData.rays)c.userData.rays.rotation.z=T*.6;if(c.userData.flame)c.userData.flame.scale.y=1+Math.sin(T*14)*.12;}}
  const fl=p.inv>0&&p.inv<.45&&Math.floor(p.inv*20)%2===0&&!p.down,hid=p.hidden>0,ghost=p.ctrl==='net'&&p.dn;
  if(u.fl!==fl||u.hid!==hid||u.gh!==ghost){u.fl=fl;u.hid=hid;u.gh=ghost;for(const mm of u.mats){if(mm.emissive&&!mm.userData.basic){if(fl)mm.emissive.set('#ffffff');else if(mm.userData.em0)mm.emissive.copy(mm.userData.em0);else mm.emissive.set('#000000');}mm.transparent=hid||ghost;mm.opacity=hid?.35:ghost?.5:1;}}}
function playOne(u,n){const a=u.act[n];if(!a)return;if(u.one&&u.act[u.one])u.act[u.one].fadeOut(.1);a.reset();a.setEffectiveWeight(1);a.fadeIn(.08);a.play();u.one=n;}
function findBoneCached(m,n){const u=m.userData;u.bones=u.bones||{};if(!(n in u.bones))u.bones[n]=findBone(m,n);return u.bones[n];}

/* ---------- utilidades de geometría ---------- */
function deint(attr){if(!attr||!attr.isInterleavedBufferAttribute)return attr;const n=attr.count,k=attr.itemSize,a=new Float32Array(n*k);for(let i=0;i<n;i++){a[i*k]=attr.getX(i);if(k>1)a[i*k+1]=attr.getY(i);if(k>2)a[i*k+2]=attr.getZ(i);if(k>3)a[i*k+3]=attr.getW(i);}return new THREE.BufferAttribute(a,k,attr.normalized);}
function cleanGeo(g){for(const k of Object.keys(g.attributes))g.setAttribute(k,deint(g.attributes[k]));const keep=['position','normal','uv','color'];for(const k of Object.keys(g.attributes))if(!keep.includes(k))g.deleteAttribute(k);if(!g.attributes.uv){const n=g.attributes.position.count;g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(n*2),2));}
  if(!g.attributes.normal)g.computeVertexNormals();if(g.index)g=g.toNonIndexed();return g;}
function mergeGeos(list){const BGU=THREE.BufferGeometryUtils;return BGU.mergeBufferGeometries(list.map(cleanGeo),false);}
function normGeo(g){g.computeBoundingBox();const b=g.boundingBox;g.translate(-(b.min.x+b.max.x)/2,-b.min.y,-(b.min.z+b.max.z)/2);g.computeBoundingBox();const s=g.boundingBox.getSize(new THREE.Vector3());return{h:s.y,w:Math.max(s.x,s.z)};}

/* ---------- decorados estáticos (por paquete) ---------- */
function asPrepProps(){for(const pk of['p_hex','p_hw','p_dg']){const g=AS.g[pk];if(!g)continue;g.scene.updateMatrixWorld(true);
  for(const node of g.scene.children){const inv=new THREE.Matrix4().copy(node.matrixWorld).invert();const list=[];let mat=null;
    node.traverse(o=>{if(o.isMesh){const gg=o.geometry.clone();gg.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));list.push(gg);mat=mat||o.material;}});
    if(!list.length)continue;const geo=mergeGeos(list);const sz=normGeo(geo);
    const m=mat.clone();m.vertexColors=false;m.emissive=new THREE.Color('#000000');
    AS.props[node.name]={geo,mat:m,h:sz.h,w:sz.w};}}}
function propAsset(name){return AS.ready?AS.props[name]:null;}

/* ---------- enemigos "horneados": animación esquelética → fotogramas instanciados ---------- */
function bakeAnim(file,clipName,frames,opts){const key=(file||'root')+'|'+clipName+'|'+(opts&&opts.tag||'');if(AS.bakes[key])return AS.bakes[key];
  const g=file?AS.g[file]:null;opts=opts||{};if(!g&&!opts.root)return null;
  const root=opts.root||THREE.SkeletonUtils.clone(g.scene);root.updateMatrixWorld(true);
  const clips=opts.clips||(g.animations.length?g.animations:AS.g.c_knight.animations);let clip=clips.find(c=>c.name===clipName)||clips.find(c=>/Run|Walk|Fly/.test(c.name))||clips[0];
  const mixer=new THREE.AnimationMixer(root);if(clip)mixer.clipAction(clip).play();
  const meshes=[];root.traverse(o=>{if(o.isMesh&&o.visible&&!(opts.hide&&opts.hide.test(o.name)))meshes.push(o);});
  const out=[];let mat=null,norm=null;const v=new THREE.Vector3();
  const F=clip?frames:1;
  for(let f=0;f<F;f++){if(clip){mixer.setTime(clip.duration*f/F);}root.updateMatrixWorld(true);const parts=[];
    for(const m of meshes){const src=m.geometry;const pos=deint(src.attributes.position),n=pos.count;const arr=new Float32Array(n*3);
      if(m.isSkinnedMesh){m.skeleton.update();for(let i=0;i<n;i++){v.fromBufferAttribute(pos,i);m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld);arr[i*3]=v.x;arr[i*3+1]=v.y;arr[i*3+2]=v.z;}}
      else{for(let i=0;i<n;i++){v.fromBufferAttribute(pos,i).applyMatrix4(m.matrixWorld);arr[i*3]=v.x;arr[i*3+1]=v.y;arr[i*3+2]=v.z;}}
      const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(arr,3));if(src.attributes.uv)gg.setAttribute('uv',deint(src.attributes.uv).clone());
      if(src.index){let idx=src.index;if(opts.dropFingers&&m.isSkinnedMesh){if(!m.userData.fidx){const ji=src.attributes.skinIndex,w=src.attributes.skinWeight,bones=m.skeleton.bones,bad=new Uint8Array(n);
          for(let i=0;i<n;i++){let bj=0,bw=-1;const ws4=[w.getX(i),w.getY(i),w.getZ(i),w.getW(i)],js4=[ji.getX(i),ji.getY(i),ji.getZ(i),ji.getW(i)];for(let c=0;c<4;c++){if(ws4[c]>bw){bw=ws4[c];bj=js4[c];}}bad[i]=/f_|thumb/.test(bones[bj].name)?1:0;}
          const src2=idx.array,keep=[];for(let t=0;t<src2.length;t+=3){if(bad[src2[t]]&&bad[src2[t+1]]&&bad[src2[t+2]])continue;keep.push(src2[t],src2[t+1],src2[t+2]);}m.userData.fidx=new THREE.BufferAttribute(new Uint32Array(keep),1);}idx=m.userData.fidx;}
        gg.setIndex(idx.clone());}
      if(opts.vc){let ca=src.attributes.color?deint(src.attributes.color).clone():null;if(!ca){const mc=(Array.isArray(m.material)?m.material[0]:m.material).color||new THREE.Color('#ffffff');const a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=mc.r;a[i*3+1]=mc.g;a[i*3+2]=mc.b;}ca=new THREE.BufferAttribute(a,3);}gg.setAttribute('color',ca);}
      parts.push(gg);mat=mat||(Array.isArray(m.material)?m.material[0]:m.material);}
    const geo=mergeGeos(parts);geo.computeVertexNormals();
    if(!norm){geo.computeBoundingBox();const b=geo.boundingBox;norm={cx:(b.min.x+b.max.x)/2,cz:(b.min.z+b.max.z)/2,y0:b.min.y,h:b.max.y-b.min.y};}
    geo.translate(-norm.cx,-norm.y0,-norm.cz);const s=1/norm.h;geo.scale(s,s,s);if(opts.rotY)geo.rotateY(opts.rotY);out.push(geo);}
  const m=opts.vc?new THREE.MeshLambertMaterial({vertexColors:true,emissive:'#141414'}):new THREE.MeshLambertMaterial({map:mat&&mat.map?(opts.gray?grayTex(mat.map):mat.map):null,color:mat&&mat.map?'#ffffff':(mat?mat.color:'#ffffff'),emissive:'#1e1e1e'});
  if(opts.extra)opts.extra(out);
  return AS.bakes[key]={frames:out,mat:m};}

/* qué modelo usa cada enemigo */
const EMODEL={
 spartoi:['s_warrior','Running_A',1.1,'#e8dcc0'],draugr:['s_warrior','Running_A',1.15,'#a8c0d0'],esqueleto:['s_minion','Running_A',1,'#ffffff'],guerrero:['s_warrior','Running_A',1.05,'#e0f0e0'],
 tzitzimitl:['s_mage','Running_A',1.05,'#fff0d0'],jiangshi:['s_rogue','Running_A',1,'#c8d8e8'],supay:['q_demon','Run',1.1,'#ffffff'],oni:['q_demon','Run',1.2,'#ff9a8a'],rakshasa:['q_bluedemon','Run',1.15,'#e8a0ff'],
 ajogun:['s_warrior','Running_A',1.05,'#8a7a8a'],demonio:['q_demon','Run',1.1,'#ffffff'],girtablilu:['q_cactoro','Run',1.1,'#e8c090'],
 harpia:['q_hywirl','Fast_Flying',1,'#e8b0a0'],tengu:['q_hywirl','Fast_Flying',1,'#ff8a6a'],murcielago:['q_ghost','Fast_Flying',1,'#c08080'],buho:['q_hywirl','Fast_Flying',1,'#d8c0a0'],
 almapena:['q_ghost','Fast_Flying',1,'#e0f0ff'],sluagh:['q_ghost','Fast_Flying',1,'#a0b0c0'],caido:['q_ghost','Fast_Flying',1,'#ffffff'],langosta:['q_hywirl','Fast_Flying',.9,'#c0e080'],
 empusa:['q_ghost','Fast_Flying',1,'#ff8a8a'],sincorazon:['q_ghost','Fast_Flying',1,'#e0d0a0'],galla:['q_mushnub','Walk',1,'#d0a070'],kappa:['q_mushnub','Walk',1,'#80d080'],
 onryo:['q_ghost','Fast_Flying',1,'#ffffff'],condenado:['q_ghost','Fast_Flying',1,'#c0d0ff'],ajogunsombra:['q_ghost','Fast_Flying',1,'#707070'],banshee:['q_ghost','Fast_Flying',1,'#e0f0ff'],
 ciclope:['q_bluedemon','Run',1.35,'#ffd0a0'],gigante:['q_bluedemon','Run',1.4,'#c0e0ff'],asura:['q_bluedemon','Run',1.3,'#ffa0a0'],fomoriano:['q_mushroomking','Run',1.35,'#a0b0c0'],
 huargo:['fox','Run',0.61,'#8a9098'],chacal:['fox','Run',0.55,'#e8c890'],mushhushshu:['q_dino','Run',1.15,'#a0c0ff'],yaoguai:['q_dino','Run',1.1,'#c0a0e0'],hulijing:['fox','Run',0.55,'#ffffff'],
 ahuizotl:['fox','Run',0.55,'#6080a0'],ajogunbestia:['q_dino','Run',1.1,'#d0a080'],escorpion:['q_cactoro','Run',1,'#e8a070'],naga:['q_dino','Run',1.1,'#80c0a0'],atoq:['fox','Run',0.8,'#e09a50'],apu:['q_bluedemon','Run',1.0,'#b8b0a0']};
const ENI2={};
function eni2For(key){if(key in ENI2)return ENI2[key];try{return eni2ForX(key);}catch(err){console.warn('eni2',key,err);return ENI2[key]=null;}}
function eni2ForX(key){let em=EMODEL[key];let bk=null;if(AS.ready&&EHUMAN[key]&&humanSrc()){bk=bakeHuman(key);if(bk)em=['u_man','Jog',1.15,'#ffffff'];}
  if(!bk){if(!em||!AS.ready||!AS.g[em[0]]){return ENI2[key]=null;}const fox=em[0]==='fox';bk=bakeAnim(em[0],em[1],10,{rotY:fox?-Math.PI/2:0,gray:fox});}if(!bk)return ENI2[key]=null;
  const cap=320,list=bk.frames.map(geo=>{const im=new THREE.InstancedMesh(geo,bk.mat,cap);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;im.castShadow=false;for(let i=0;i<cap;i++)im.setColorAt(i,tmpC.set('#ffffff'));im.count=0;scene.add(im);return{im,n:0};});
  return ENI2[key]={list,tint:new THREE.Color(em[3]),hk:em[2],flyer:/Fly/.test(em[1])};}
function eni2Begin(){for(const k in ENI2){const E=ENI2[k];if(E)E.list.forEach(L=>L.n=0);}}
function eni2End(){for(const k in ENI2){const E=ENI2[k];if(!E)continue;for(const L of E.list){L.im.count=L.n;L.im.instanceMatrix.needsUpdate=true;if(L.im.instanceColor)L.im.instanceColor.needsUpdate=true;}}}
const _p5=new THREE.Vector3(),_q5=new THREE.Quaternion(),_s5=new THREE.Vector3(),_m5=new THREE.Matrix4(),_up5=new THREE.Vector3(0,1,0),_c5=new THREE.Color();
function eni2Draw(e,dt){const E=eni2For(e.key);if(!E)return false;const yaw=enemyYaw(e,dt);const F=E.list.length;const f=Math.floor((T*(E.flyer?1.2:1.6)+e.ph)*F)%F;const L=E.list[(f+F)%F];if(L.n>=320)return true;
  const h=e.r*2.6*E.hk;let by=e.z;if(E.flyer)by+=8+Math.sin(T*3+e.ph)*4;
  _q5.setFromAxisAngle(_up5,yaw);_m5.compose(_p5.set(e.x,by,e.y),_q5,_s5.set(h,h,h));L.im.setMatrixAt(L.n,_m5);
  L.im.setColorAt(L.n,e.flash>0?_c5.set('#ffffff').multiplyScalar(2.2):e.elite?_c5.copy(E.tint).lerp(EL_GOLD,.35):E.tint);L.n++;return true;}

function skinH(root){root.updateMatrixWorld(true);let lo=1e9,hi=-1e9;const v=new THREE.Vector3();root.traverse(m=>{if(!m.isMesh||!m.visible)return;const pos=m.geometry.attributes.position;const st=Math.max(1,Math.floor(pos.count/300));
  for(let i=0;i<pos.count;i+=st){v.fromBufferAttribute(pos,i);if(m.isSkinnedMesh){m.skeleton.update();m.boneTransform(i,v);}v.applyMatrix4(m.matrixWorld);lo=Math.min(lo,v.y);hi=Math.max(hi,v.y);}});return hi-lo||1;}
/* ---------- jefes con esqueleto real ---------- */
const BMODEL={
 lilith:['c_mage',{primary:'#3a1838',cape:'#c82a6a',skin:'#e0c0d0',hair:'#1a0a1a'},2.7,{keep:/Cape|2H_Staff/,horns:'#2a0a1a'}],
 ares:['c_knight',{primary:'#c9a15a',metal:'#8a2a1f',trim:C.gold},2.6,{keep:/Helmet|Cape|^1H_Sword$/}],minotauro:['c_barbarian',{skin:'#6a4a32',hair:'#3a2a1a',primary:'#5a3a22'},2.8,{keep:/^2H_Axe$/,horns:'#e8e0cc'}],
 cronos:['c_mage',{primary:'#4a4a5a',skin:'#c8b8a8',hair:'#e8e8e8',cape:'#2a2a3a'},2.9,{keep:/Cape|2H_Staff/,crown:C.gold}],hrungnir:['c_barbarian',{skin:'#8a96a8',primary:'#5a6a7a',hair:'#c8d8e8'},3,{keep:/^2H_Axe$/,horns:'#9fe0ff'}],
 kumbhakarna:['c_barbarian',{skin:'#7a5a3a',primary:'#c9a15a',hair:'#1c1210'},3.1,{keep:/^2H_Axe$/,crown:C.gold}],zipacna:['c_barbarian',{skin:'#8a6a4a',primary:'#3aa07a'},3,{}],
 yanluo:['c_mage',{primary:'#2a2a3a',cape:C.blood,skin:'#c8a888',hair:'#1c1210'},2.7,{keep:/Cape/,crown:C.gold}],arawn:['c_knight',{metal:'#2a3a4a',primary:'#9ad0e8',trim:'#c8ccd8'},2.7,{keep:/Helmet|Cape|^2H_Sword$/}],
 raktabija:['c_barbarian',{skin:'#7a1a1a',primary:'#3a0a0a',hair:'#1c1210'},2.8,{horns:'#e8e0cc'}],kingu:['c_knight',{metal:'#2f4f6a',primary:C.gold},2.8,{keep:/Helmet|Cape|^1H_Sword$/}],
 coyolxauhqui:['c_rogue',{skin:'#d8dce8',primary:'#c8ccd8',hair:'#1c1210'},2.5,{crown:'#e27aa8'}],pishtaco:['c_rogue_hooded',{primary:'#2a2a30',skin:'#e8d8c8'},2.6,{keep:/^Knife$/}],
 dullahan:['c_knight',{metal:'#2a2a2a',primary:'#4a3a5a'},2.6,{keep:/Cape|^2H_Sword$/,headless:true}],humbaba:['q_demon',{tint:'#8ab060'},2.6],toro:['q_demon',{tint:'#606060'},2.7,{horns:'#e8e0cc'}],
 abadon:['q_demon',{tint:'#c04020'},3.1],surtr:['q_demon',{tint:'#ff8a3a'},3.3],shuten:['q_demon',{tint:'#ff6a5a'},3],set:['q_bluedemon',{tint:'#c06050'},3],supayrey:['q_demon',{tint:'#c0a060'},3],
 mahishasura:['q_bluedemon',{tint:'#505060'},2.8,{horns:'#e8e0cc'}],balor:['q_bluedemon',{tint:'#6a8a6a'},3.2],arun:['q_mushroomking',{tint:'#b0d080'},2.6],hecatonquiros:['q_bluedemon',{tint:'#c09070'},3.4,{arms:true}],
 gashadokuro:['s_warrior',{tint:'#ffffff'},3.4],mictlantecuhtli:['s_mage',{tint:'#fff0c0'},2.8],senores:['s_rogue',{tint:'#e0f0f0'},3],iku:['s_mage',{tint:'#606070'},3.1],baigujing:['s_rogue',{tint:'#ffd0e8'},2.6],ahpuch:['s_warrior',{tint:'#d0f0e0'},3.1],
 medusa:['c_rogue',{skin:'#8ab07a',primary:'#3a6a3a',hair:'#3a8a3a'},2.4,{snakes:true}],
 cerbero:['fox',{tint:'#3a3438'},1.10,{heads:3}],quimera:['fox',{tint:'#ffb060'},1.05,{heads:3}],garm:['fox',{tint:'#8a4040'},1.00],fenrir:['fox',{tint:'#9aa4b0'},1.30],cathpalug:['fox',{tint:'#404048'},1.00],
 ccoa:['fox',{tint:'#d0d8e0'},1.00],nian:['fox',{tint:'#ff7060'},1.05],aroni:['fox',{tint:'#a08050'},0.95],esfinge:['fox',{tint:'#e8c070'},1.05],twrch:['q_dino',{tint:'#8a7a70'},2.4],ushioni:['q_dino',{tint:'#505058'},2.5],
 ammit:['q_dino',{tint:'#a0c070'},2.3],cipactli:['q_dino',{tint:'#80a070'},2.4],tlaltecuhtli:['q_dino',{tint:'#a06050'},2.9],sobek:['q_dino',{tint:'#70a060'},2.4],behemot:['q_dino',{tint:'#a080c0'},3],
 nidhogg:['q_hywirl',{tint:'#80a060'},2.4],lamashtu:['q_ghost',{tint:'#c08090'},2.2],nue:['q_hywirl',{tint:'#c0a060'},2.2],itzpapalotl:['q_ghost',{tint:'#806090'},2.6],camazotz:['q_ghost',{tint:'#a05050'},2.3],
 vucub:['q_hywirl',{tint:'#ff7050'},2.3],ofo:['q_ghost',{tint:'#9090c0'},2.2],pazuzu:['q_ghost',{tint:'#c0b060'},2.3],aje:['q_hywirl',{tint:'#604060'},2.7],ziz:['q_hywirl',{tint:'#ffffff'},2.4]};
function buildBossKK(e){const hb=typeof buildBossHuman==='function'&&buildBossHuman(e);if(hb)return hb;const bm=BMODEL[e.key];if(!bm||!AS.ready||!AS.g[bm[0]])return null;const[file,col,hk,o]=bm;const opt=o||{};const g=AS.g[file];
  const mats=[];const make=()=>{const r=THREE.SkeletonUtils.clone(g.scene);r.traverse(x=>{if(!x.isMesh)return;
      if(file.startsWith('c_')){if(KK_HIDE.test(x.name)&&!(opt.keep&&opt.keep.test(x.name))){x.visible=false;return;}if(opt.headless&&/_Head/.test(x.name)){x.visible=false;return;}
        const pal=Object.assign({skin:C.skin,hair:INK,primary:'#888',primaryD:'#666',trim:C.gold,cape:'#444',leather:'#7a5234',leatherD:'#5a3a24',metal:'#9aa4ae',dark:'#3a3438',accent:C.gold},col);if(!col.primaryD)pal.primaryD=shade(pal.primary,-.25);
        const m=x.material.clone();m.map=kkTexture(file,pal);mats.push(m);x.material=m;}
      else{const m=(Array.isArray(x.material)?x.material[0]:x.material).clone();if(file==='fox'&&m.map)m.map=grayTex(m.map);if(col.tint)m.color.set(col.tint);if(e.corrupt)m.color.multiplyScalar(.6);mats.push(m);x.material=m;}
      x.castShadow=true;x.frustumCulled=false;});return r;};
  const root=make();const wrap=new THREE.Group();wrap.add(root);const H=skinH(root);
  const base=e.r*2.4*hk;const k=base/H;root.scale.setScalar(k);const fox=file==='fox';if(fox)root.rotation.y=-Math.PI/2;
  const clips=g.animations.length?g.animations:AS.g.c_knight.animations;const mixer=new THREE.AnimationMixer(root);
  const pick2=(...ns)=>{for(const n of ns){const c=clips.find(c=>c.name===n);if(c)return c;}return clips[0];};
  const act={run:mixer.clipAction(pick2('Running_A','Run','Fast_Flying','Walk')),idle:mixer.clipAction(pick2('Idle','Survey','Flying_Idle')),atk:mixer.clipAction(pick2('2H_Melee_Attack_Chop','1H_Melee_Attack_Chop','Punch','Headbutt','Bite_Front','Weapon','Run'))};
  act.atk.setLoop(THREE.LoopOnce,1);act.atk.clampWhenFinished=true;act.run.play();
  const extra=[];
  if(opt.heads>1){for(const sx of[-1,1]){const h2=make();root.parent.add(h2);h2.scale.setScalar(k*.92);h2.position.set(sx*base*.16,0,-base*.05);h2.rotation.y=sx*.42+(fox?-Math.PI/2:0);extra.push(h2);const m2=new THREE.AnimationMixer(h2);m2.clipAction(act.run.getClip()).play();h2.userData.mixer=m2;h2.userData.side=sx;}
    const pl=[];for(const m of mats){m.clippingPlanes=null;}}
  const ctx=mkCtx(mats);const headB=findBone(root,'head')||findBone(root,'Head');
  if(headB&&(opt.horns||opt.crown||opt.snakes)){const hg=new THREE.Group();headB.add(hg);hg.scale.setScalar(1/k*1.3*(base/90));hg.position.set(0,file.startsWith('c_')?.36:.3,0);
    if(opt.horns)for(const sx of[-1,1]){ctx.add(new THREE.ConeGeometry(1.6,9,6),ctx.M(opt.horns),sx*6,6,0,hg,0,0,sx*-.9);}
    if(opt.crown){ctx.add(new THREE.CylinderGeometry(6.2,6,2.6,16,1,true),ctx.M(opt.crown,{side:THREE.DoubleSide}),0,5,0,hg);for(let i=0;i<8;i++){const a=i/8*6.283;ctx.add(new THREE.ConeGeometry(1,3.4,4),ctx.M(opt.crown),Math.cos(a)*6,7.6,Math.sin(a)*6,hg);}}
    if(opt.snakes){const sn=new THREE.Group();hg.add(sn);for(let i=0;i<12;i++){const a=i/12*6.283;const p=new THREE.Group();p.position.set(Math.cos(a)*5,3,Math.sin(a)*5);p.rotation.set(Math.sin(a)*1,0,-Math.cos(a)*1);sn.add(p);ctx.cy(.8,.5,8,6,ctx.M('#3a8a3a'),0,4,0,p);ctx.sp(1.1,ctx.M('#4aa04a'),0,8.4,.4,p);}hg.userData.snakes=sn;}}
  if(opt.arms){const ch=findBone(root,'Torso')||findBone(root,'Body')||root;const ag=new THREE.Group();ch.add(ag);ag.scale.setScalar(1/k*(base/40));
    for(let i=0;i<12;i++){const a=i/12*6.283;const p=new THREE.Group();p.position.set(Math.cos(a)*8,10+Math.sin(i*2.1)*3,Math.sin(a)*4);p.rotation.z=Math.cos(a)*1.3;p.rotation.x=Math.sin(a)*.6;ag.add(p);ctx.cy(1.8,1.4,14,7,ctx.M('#a07a60'),0,7,0,p);ctx.sp(2.2,ctx.M('#b08a70'),0,14.6,0,p);p.userData.i=i;}wrap.userData.arms=ag;}
  wrap.userData={kkBoss:true,mixer,act,cur:'run',mats,extra,yaw:0,arms:wrap.userData.arms,base,disp:()=>{mats.forEach(m=>m.dispose());ctx.dispose();}};
  return wrap;}
function animBossKK(m,e,dt){const u=m.userData;const yaw=enemyYaw(e,dt);m.rotation.y=yaw;let by=e.z;const bm=BMODEL[e.key];if(bm&&/hywirl|ghost/.test(bm[0]))by+=10+Math.sin(T*2)*5;m.position.set(e.x,by,e.y);
  const mv=e._mv>.2;const want=mv?'run':'idle';if(want!==u.cur&&!u.atkOn){u.act[want].reset().play();u.act[u.cur].crossFadeTo(u.act[want],.25,false);u.cur=want;}
  if((e.charge>0||e.pc<.3)&&!u.atkOn){u.atkOn=true;u.act.atk.reset().play();u.act.atk.setEffectiveWeight(1);}
  if(u.atkOn&&!u.act.atk.isRunning()){u.atkOn=false;u.act.atk.stop();}
  u.mixer.update(dt);for(const x of u.extra){x.userData.mixer.update(dt);}
  if(u.arms)u.arms.children.forEach((p,i)=>{p.rotation.x=Math.sin(T*3+i*1.3)*.6;});
  const fl=e.flash>0;if(u.fl!==fl){u.fl=fl;for(const mm of u.mats)if(mm.emissive&&!mm.userData.basic)mm.emissive.set(fl?'#ffffff':'#000000');}}
/* las cabezas laterales de Cerbero: recortamos el cuerpo con planos de corte */
const _cp=new THREE.Vector3(),_cn=new THREE.Vector3();
function updBossClip(m){const u=m.userData;if(!u.extra||!u.extra.length)return;for(const x of u.extra){if(!x.userData.plane){x.userData.plane=new THREE.Plane();x.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.clippingPlanes=[x.userData.plane];o.material.clipShadows=true;u.mats.push(o.material);}});}
  x.updateMatrixWorld(true);_cn.set(0,0,1).transformDirection(x.matrixWorld);_cp.set(0,0,u.base*.12).applyMatrix4(m.matrixWorld);x.userData.plane.setFromNormalAndCoplanarPoint(_cn,_cp);}}

/* ---------- retratos 3D para la interfaz ---------- */
const SHOT={r:null,cache:{}};
function godShot(id,mode){const key=id+'|'+mode;if(SHOT.cache[key])return SHOT.cache[key];if(!AS.ready)return null;
  try{if(!SHOT.r){SHOT.r=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});SHOT.r.setPixelRatio(1);SHOT.sc=new THREE.Scene();
      SHOT.sc.add(new THREE.HemisphereLight('#ffffff','#5a5a70',.95));const dl=new THREE.DirectionalLight('#fff4e0',.75);dl.position.set(40,80,90);SHOT.sc.add(dl);SHOT.cam=new THREE.PerspectiveCamera(26,1,1,1000);}
    const W=mode==='face'?160:256,H=mode==='face'?160:320;SHOT.r.setSize(W,H,false);SHOT.cam.aspect=W/H;SHOT.cam.updateProjectionMatrix();
    const m=(AS.g.u_man?buildGodH:buildGodKK)(id);m.traverse(o=>{if(o.isSprite)o.visible=false;});SHOT.sc.add(m);const u=m.userData;u.act.idle.time=.4;u.mixer.update(0);m.rotation.y=mode==='face'?.32:.42;m.updateMatrixWorld(true);
    if(mode==='face'){SHOT.cam.position.set(0,33,44);SHOT.cam.lookAt(0,31,0);}else{SHOT.cam.position.set(0,23,96);SHOT.cam.lookAt(0,21,0);}
    SHOT.r.setClearColor(0x000000,0);SHOT.r.clear();SHOT.r.render(SHOT.sc,SHOT.cam);const c=mkCanvas(W,H);c.getContext('2d').drawImage(SHOT.r.domElement,0,0);
    SHOT.sc.remove(m);u.disp();SHOT.cache[key]=c;return c;}catch(err){console.warn(err);return null;}}
