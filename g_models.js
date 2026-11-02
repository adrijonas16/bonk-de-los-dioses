/* Bonk de los Dioses · modelos 3D pixel-art (dioses, enemigos y jefes) con animaciones */
'use strict';
const GOD_SCALE=.74;
function pxTex(cv){const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;}
function pcv(w,h,fn){const c=mkCanvas(w,h),g=c.getContext('2d');const P=(x,y,col)=>{if(!col)return;g.fillStyle=col;g.fillRect(x,y,1,1);};const Rr=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh);};fn(P,Rr,g);return c;}
function flipCv(c){const o=mkCanvas(c.width,c.height),g=o.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);return o;}

/* ---------- texturas de la cara y el cuerpo ---------- */
function faceCv(L,id){
  const skin=L.s,hair=L.h||INK,hs=L.hs||'short',eye=L.eye||'#2a1a10';
  return pcv(16,16,(P,R)=>{
    R(0,0,16,16,skin);
    // sombreado suave de mejillas y barbilla
    R(0,14,16,2,shade(skin,-.1));R(0,12,1,4,shade(skin,-.08));R(15,12,1,4,shade(skin,-.08));
    if(hs!=='bald'){const hc=hs==='flame'?'#5ab0ff':hair;R(0,0,16,3,hc);for(let x=0;x<16;x++){if(x%3!==1)P(x,3,hc);}R(0,0,2,8,hc);R(14,0,2,8,hc);
      if(hs==='long'){R(0,0,1,12,hc);R(15,0,1,12,hc);}
      for(let x=1;x<16;x+=3)P(x,1,shade(hc,.25));for(let x=2;x<16;x+=4)P(x,2,shade(hc,-.2));}
    else{R(2,0,12,2,shade(skin,.1));}
    const br=hs==='bald'?shade(skin,-.4):shade(hair,-.15);R(3,5,3,1,br);R(10,5,3,1,br);
    // ojos 3×2 con brillo
    for(const[x0,dir]of[[3,1],[10,-1]]){R(x0,6,3,2,'#ffffff');const ix=dir>0?x0+1:x0;R(ix,6,2,2,eye);P(ix,7,INK);P(ix+(dir>0?1:0),7,INK);P(ix,6,'#ffffff');}
    P(7,9,shade(skin,-.18));P(8,9,shade(skin,-.18));P(7,8,shade(skin,.1));
    R(6,11,4,1,shade(skin,-.45));P(5,11,shade(skin,-.2));P(10,11,shade(skin,-.2));
    P(2,9,'#f09a8a');P(3,9,'#f0a898');P(12,9,'#f0a898');P(13,9,'#f09a8a');
    if(L.b==='full'){const bc=L.bc;R(1,9,14,7,bc);R(4,10,8,1,shade(bc,.15));R(6,11,4,1,shade(bc,-.5));for(let x=2;x<15;x+=2)R(x,12+(x%4?1:0),1,3,shade(bc,-.2));for(let x=3;x<14;x+=4)P(x,13,shade(bc,.25));R(0,8,1,6,bc);R(15,8,1,6,bc);}
    if(L.b==='short'){const bc=L.bc;R(4,10,8,1,bc);R(4,12,8,4,bc);R(6,11,4,1,shade(skin,-.45));for(let x=5;x<12;x+=2)P(x,14,shade(bc,-.2));}
    if(L.ex==='eyepatch'){R(2,5,5,4,INK);for(let x=0;x<16;x++)P(x,Math.round(4-x*.15),INK);}
    if(L.ex==='thirdeye'){R(7,3,2,2,'#e23a2a');P(7,3,'#f8e060');}
    if(L.ex==='stripes'){R(0,6,16,1,'#1c1210');R(0,8,16,1,'#e8b53e');R(0,10,16,1,'#1c1210');}
    if(L.ex==='mask'){for(const x0 of[2,9]){R(x0,5,5,1,'#2f4f9e');R(x0,8,5,1,'#2f4f9e');R(x0,5,1,4,'#2f4f9e');R(x0+4,5,1,4,'#2f4f9e');}R(5,12,6,2,'#e8e0cc');P(6,14,'#e8e0cc');P(9,14,'#e8e0cc');}
  });}
function sideCv(L){const skin=L.s,hair=L.h||INK,hs=L.hs||'short';
  return pcv(16,16,(P,R)=>{R(0,0,16,16,skin);R(0,14,16,2,shade(skin,-.1));
    if(hs!=='bald'){const hc=hs==='flame'?'#5ab0ff':hair;const deep=hs==='long'?16:10;R(0,0,16,4,hc);R(9,0,7,deep,hc);for(let y=4;y<deep;y+=2)P(9,y,shade(hc,-.2));P(3,1,shade(hc,.25));P(7,2,shade(hc,.25));}
    R(6,7,3,4,shade(skin,-.12));P(7,8,shade(skin,-.3));
    if(L.b==='full'){R(0,9,6,7,L.bc);}});}
function backCv(L){const skin=L.s,hair=L.h||INK,hs=L.hs||'short';return pcv(16,16,(P,R)=>{R(0,0,16,16,skin);if(hs!=='bald'){const hc=hs==='flame'?'#5ab0ff':hair;R(0,0,16,hs==='long'?16:11,hc);for(let x=1;x<16;x+=3)R(x,2,1,hs==='long'?13:8,shade(hc,-.18));for(let x=2;x<16;x+=5)P(x,1,shade(hc,.25));}});}
function topCv(L){const hair=L.hs==='bald'?shade(L.s,.06):(L.hs==='flame'?'#5ab0ff':L.h||INK);return pcv(8,8,(P,R)=>{R(0,0,8,8,hair);for(let i=0;i<8;i++)P((i*3)%8,i,shade(hair,.2));});}
function chestCv(robe,trim,light,sash){return pcv(16,16,(P,R)=>{R(0,0,16,16,robe);for(let y=0;y<16;y++){P(3,y,shade(robe,-.1));P(12,y,shade(robe,-.1));}R(5,0,6,1,shade(robe,-.2));for(let i=0;i<4;i++){P(6+i,1+i>3?3:1+i,trim);}
  for(let i=0;i<16;i++){P(i,Math.min(15,Math.floor(i*.85)),trim);P(i,Math.min(15,Math.floor(i*.85)+1),shade(trim,-.2));}
  if(sash)for(let i=0;i<16;i++){P(15-i,Math.floor(i*.9),sash);P(15-i,Math.floor(i*.9)+1,sash);}
  if(light)for(let x=2;x<16;x+=3)R(x,0,1,16,'#fff2c8');});}
function skirtCv(robe,trim){return pcv(16,12,(P,R)=>{R(0,0,16,12,robe);for(let x=1;x<16;x+=3){R(x,1,1,8,shade(robe,-.14));P(x+1,2,shade(robe,.1));}R(0,9,16,3,trim);for(let x=0;x<16;x+=2)P(x,10,shade(trim,-.35));R(0,9,16,1,shade(trim,.2));});}

/* ---------- constructor de dioses (low-poly redondeado, proporciones realistas) ---------- */
function headCv(L,hd){const W=48,H=24,cx=24;const skin=L.s,hair=L.h||INK,hs=L.hs||'short',eye=L.eye||'#2a1a10';const hc=hs==='flame'?'#5ab0ff':hair;
  return pcv(W,H,(P,R)=>{R(0,0,W,H,skin);
    for(let x=0;x<W;x++){const d=Math.min(Math.abs(x-cx),W-Math.abs(x-cx));if(d>14)P(x,H-1,shade(skin,-.1));}
    if(hd==='jackal'||hd==='falcon'){R(0,0,W,H,hair);R(cx-7,10,4,2,C.gold);R(cx+3,10,4,2,C.gold);P(cx-5,10,INK);P(cx+5,10,INK);if(hd==='falcon'){R(cx-9,12,2,7,'#2f4f9e');R(cx+7,12,2,7,'#2f4f9e');R(cx-4,14,8,8,'#e8e0cc');}return;}
    if(hs!=='bald'){const back=hs==='long'?H:16;R(0,0,W,6,hc);
      for(let x=0;x<W;x++){const d=Math.abs(x-cx);if(d>9)R(x,0,1,d>16?back:9,hc);else if(x%3!==0)P(x,6,hc);}
      for(let x=0;x<W;x+=2)R(x,1+(x%4?0:1),1,4,shade(hc,-.16));for(let x=1;x<W;x+=5)P(x,1,shade(hc,.3));}
    else R(cx-10,0,20,3,shade(skin,.08));
    if(hd==='monkey'){R(cx-6,13,12,8,shade(skin,.25));}
    if(hd==='lion'){R(cx-6,14,12,7,shade(skin,.15));}
    const br=hs==='bald'?shade(skin,-.4):shade(hair,-.15);R(cx-7,9,4,1,br);R(cx+3,9,4,1,br);
    for(const[x0,dir]of[[cx-7,1],[cx+3,-1]]){R(x0,10,4,2,'#ffffff');const ix=dir>0?x0+1:x0+1;R(ix,10,2,2,eye);P(ix+(dir>0?1:0),11,INK);P(ix,10,'#ffffff');P(x0,9,shade(skin,-.35));}
    R(cx-2,15,4,1,shade(skin,-.45));P(cx-3,15,shade(skin,-.2));P(cx+2,15,shade(skin,-.2));R(cx-1,16,2,1,shade(skin,-.12));
    P(cx-8,13,'#f09a8a');P(cx-7,13,'#f0a898');P(cx+6,13,'#f0a898');P(cx+7,13,'#f09a8a');
    if(L.b==='full'){const bc=L.bc;for(let y=13;y<H;y++){const w=Math.round(10-Math.max(0,y-19)*1.4);R(cx-w,y,w*2,1,bc);}R(cx-4,14,8,1,shade(bc,.15));R(cx-2,15,4,1,shade(bc,-.5));for(let x=cx-9;x<cx+9;x+=2)R(x,17+(x%4?1:0),1,5,shade(bc,-.2));}
    if(L.b==='short'){const bc=L.bc;R(cx-4,14,8,1,bc);R(cx-5,16,10,4,bc);R(cx-2,15,4,1,shade(skin,-.45));}
    if(L.ex==='eyepatch'){R(cx-8,8,6,5,INK);for(let x=0;x<W;x++)P(x,Math.round(8-Math.sin((x-cx)/8)*1),INK);}
    if(L.ex==='thirdeye'){R(cx-1,6,2,3,'#e23a2a');P(cx,6,'#f8e060');}
    if(L.ex==='stripes'){R(cx-12,10,24,1,'#1c1210');R(cx-12,12,24,1,'#e8b53e');R(cx-12,14,24,1,'#1c1210');}
    if(L.ex==='mask'){for(const x0 of[cx-8,cx+2]){R(x0,9,6,1,'#2f4f9e');R(x0,12,6,1,'#2f4f9e');R(x0,9,1,4,'#2f4f9e');R(x0+5,9,1,4,'#2f4f9e');}R(cx-3,16,6,2,'#e8e0cc');}
  });}
function wrapCv(W,H,fn){return pcv(W,H,fn);}
function buildGod(id){
  const L0=LOOKS[id]||{},light=L0.head==='light';
  const L=Object.assign({},L0,{s:light?'#fff6e0':L0.s||C.skin,h:L0.h||INK});
  const skin=L.s,robe=light?'#fff6e0':L.r||'#e8e0cc',trim=light?'#f4d27a':L.t||C.gold,hair=L.h,hc=L.hc||C.gold,gc=L.gc||C.gold;
  const mats=[],geos=[],texs=[];
  const M=(c,o)=>{const m=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));m.emissive.set(c).multiplyScalar(.16);if(m.map){m.emissiveMap=m.map;m.emissive.set('#2c2c2c');}m.userData.em0=m.emissive.clone();mats.push(m);return m;};
  const MB2=(c,o)=>{const m=new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));m.userData.basic=true;mats.push(m);return m;};
  const MT=(cv,o)=>{const t=pxTex(cv);texs.push(t);return M('#ffffff',Object.assign({map:t},o||{}));};
  const root=new THREE.Group();
  const add=(geo,mat,x,y,z,par,rx,ry,rz)=>{geos.push(geo);const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;par.add(m);return m;};
  const bx=(w,h,d,mat,x,y,z,par,rx,ry,rz)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,par,rx,ry,rz);
  const cy=(a,b,h,s,mat,x,y,z,par,rx,ry,rz)=>add(new THREE.CylinderGeometry(a,b,h,s),mat,x,y,z,par,rx,ry,rz);
  const sp=(r,mat,x,y,z,par,sx,sy,sz)=>{const m=add(new THREE.SphereGeometry(r,12,9),mat,x,y,z,par);if(sx)m.scale.set(sx,sy,sz);return m;};
  const piv=(par,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);par.add(g);return g;};
  const body=piv(root,0,0,0);
  const mSkin=M(skin),mSkinD=M(shade(skin,-.08)),mSand=M('#6a4a2a'),mStrap=M('#3a2416'),mRobe=M(robe),mTrim=M(trim);
  // piernas con rodilla
  const legs=[];for(const sx of[-2.4,2.4]){const hip=piv(body,sx,20.5,0);add(new THREE.CylinderGeometry(1.9,1.6,10,10),mSkin,0,-5,0,hip);const knee=piv(hip,0,-10,0);
    add(new THREE.CylinderGeometry(1.6,1.2,9.4,10),mSkin,0,-4.7,0,knee);const ft=sp(1.6,mSand,0,-9.6,1,knee,1.1,.6,2);sp(1.25,mStrap,0,-7.6,0,knee,1.15,.4,1.15);
    for(let i=0;i<3;i++)add(new THREE.TorusGeometry(1.35,.25,4,10),mStrap,0,-6-i*1.4,0,knee,Math.PI/2);legs.push({hip,knee});}
  const torso=piv(body,0,20.5,0);
  // falda con textura envolvente (frente en el centro)
  const skirtT=MT(wrapCv(48,16,(P,R)=>{R(0,0,48,16,robe);for(let x=1;x<48;x+=3){R(x,0,1,12,shade(robe,-.13));P(x+1,2,shade(robe,.1));}R(0,12,48,4,trim);for(let x=0;x<48;x+=2)P(x,13,shade(trim,-.35));R(0,12,48,1,shade(trim,.25));}),{side:THREE.DoubleSide});
  {const g=new THREE.CylinderGeometry(4.9,7,11.5,14,1,true,Math.PI,Math.PI*2);const m=add(g,skirtT,0,-4.4,0,torso);m.scale.z=.8;}
  {const m=add(new THREE.CylinderGeometry(5.1,5.1,1.8,14),mTrim,0,1.4,0,torso);m.scale.z=.8;bx(1.8,1.6,.5,M('#ffffff'),0,1.4,4.2,torso);}
  const chestT=MT(wrapCv(48,16,(P,R)=>{R(0,0,48,16,robe);for(let x=0;x<48;x+=4)R(x,2,1,14,shade(robe,-.08));
    for(let i=0;i<14;i++){P(17+i,15-i,trim);P(18+i,15-i,trim);P(17+i,16-i,shade(trim,-.25));}R(20,0,8,1,shade(robe,-.25));for(let i=0;i<4;i++){P(21+i,1+i,shade(robe,-.2));P(27-i,1+i,shade(robe,-.2));}
    if(L.ex==='sash')for(let i=0;i<14;i++){P(30-i,15-i,'#e27aa8');P(31-i,15-i,'#e27aa8');}
    if(light)for(let x=1;x<48;x+=3)R(x,0,1,16,'#fff2c8');}));
  {const m=add(new THREE.CylinderGeometry(5.7,4.7,10.5,14,1,false,Math.PI,Math.PI*2),[chestT,mRobe,mRobe],0,7.4,0,torso);m.scale.z=.72;}
  sp(2.4,M(shade(robe,.08)),-5.6,11.8,0,torso,1,.85,1);sp(2.4,M(shade(robe,.08)),5.6,11.8,0,torso,1,.85,1);
  add(new THREE.CylinderGeometry(1.5,1.8,3.2,10),mSkinD,0,13.6,0,torso);
  // brazos con codo
  const arms=[];for(const sx of[-1,1]){const sh=piv(torso,sx*6.1,11.6,0);add(new THREE.CylinderGeometry(1.55,1.35,8,10),mSkin,0,-4,0,sh);add(new THREE.CylinderGeometry(1.9,1.75,3,10),mRobe,0,-1,0,sh);
    const el=piv(sh,0,-8,0);add(new THREE.CylinderGeometry(1.35,1.1,7.2,10),mSkin,0,-3.6,0,el);add(new THREE.TorusGeometry(1.35,.4,4,10),mTrim,0,-5,0,el,Math.PI/2);sp(1.5,mSkinD,0,-7.9,.2,el,1,1.2,.9);
    const hand=piv(el,0,-8.2,.4);arms.push({sh,el,hand});}
  const armL=arms[0],armR=arms[1];
  // cabeza redondeada
  const head=piv(torso,0,14.8,0);const hd=L.head;const HY=5.2,HR=5.3;
  if(hd==='light'){add(new THREE.IcosahedronGeometry(5.6,1),MB2('#fff6e0'),0,HY,0,head);add(new THREE.IcosahedronGeometry(3.8,1),MB2('#ffffff'),0,HY,2.2,head);
    const rays=piv(head,0,HY,-3);for(let i=0;i<12;i++){const a=i/12*6.283;bx(1.1,i%2?7:5,.5,MB2(i%2?'#f4d27a':'#fff6e0'),Math.cos(a)*8.6,Math.sin(a)*8.6,0,rays,0,0,a-Math.PI/2);}head.userData.rays=rays;}
  else{const ht=MT(headCv(L,hd));const g=new THREE.SphereGeometry(HR,16,12,-Math.PI/2);const hm=add(g,ht,0,HY,0,head);hm.scale.set(1,1.07,1.02);
    if(!hd||hd==='monkey'||hd==='lion'){bx(1,1.5,1.4,M(shade(skin,-.04)),0,HY-.4,HR*.98,head);sp(1,M(shade(skin,-.08)),-HR,HY,0,head,.6,1.2,.8);sp(1,M(shade(skin,-.08)),HR,HY,0,head,.6,1.2,.8);}
    const mH=M(hair);
    if(!hd&&L.hs!=='bald'){const cap=add(new THREE.SphereGeometry(HR+.35,16,8,0,Math.PI*2,0,Math.PI*.42),L.hs==='flame'?MB2('#5ab0ff'):mH,0,HY+.2,-.15,head);cap.scale.set(1,1.08,1.03);
      if(L.hs==='long'){const g2=new THREE.CylinderGeometry(HR+.2,HR+.9,10,14,1,true,Math.PI*.5,Math.PI);const lh=add(g2,M(hair,{side:THREE.DoubleSide}),0,HY-3.4,0,head);lh.scale.z=.95;}
      if(L.hs==='bun')sp(2.6,mH,0,HY+5.4,-2.6,head);
      if(L.hs==='buns'){sp(2.4,mH,-4.2,HY+4.4,-.5,head);sp(2.4,mH,4.2,HY+4.4,-.5,head);}
      if(L.hs==='spiky')for(let i=0;i<6;i++)add(new THREE.ConeGeometry(1.5,5,5),mH,-4.5+i*1.8,HY+5.8-Math.abs(i-2.5)*.4,-1+(i%2),head,0,0,(i-2.5)*-.28);
      if(L.hs==='flame'){const fl=piv(head,0,HY+4,0);for(let i=0;i<8;i++)add(new THREE.ConeGeometry(1.8,6+((i*7)%4),6),MB2(i%2?'#7ad0ff':'#c8f0ff',{transparent:true,opacity:.9}),-4.6+i*1.3,2.4,-1+(i%3)*.8,fl,0,0,(i-3.5)*-.16);head.userData.flame=fl;}}
    if(hd==='jackal'){add(new THREE.CylinderGeometry(1.6,2.6,7,8),M(hair),0,HY-1,6,head,Math.PI/2);sp(.8,M(INK),0,HY-.4,9.6,head);for(const sx of[-2.8,2.8]){add(new THREE.ConeGeometry(1.6,7,5),M(hair),sx,HY+7.6,-.5,head);}
      const col=add(new THREE.CylinderGeometry(5.8,6.4,2.2,14),M(C.gold),0,-.8,0,head);col.scale.z=.8;}
    if(hd==='falcon'){add(new THREE.ConeGeometry(1.6,4.6,6),M(C.gold),0,HY-.4,6.6,head,Math.PI/2+.5);cy(5,5,.8,16,MB2(C.gold),0,HY+8,-2,head,Math.PI/2);cy(3.2,3.2,1,14,MB2('#f2622c'),0,HY+8,-1.6,head,Math.PI/2);
      for(const sx of[-5.2,5.2])bx(1.6,10,5,M('#2f4f9e'),sx,HY-2.6,-.6,head);}
    if(hd==='lion'){const mn=sp(8,M(L.h),0,HY-.4,-2.4,head,1,1,.7);sp(1.4,M(L.h),-4,HY+4.6,1,head);sp(1.4,M(L.h),4,HY+4.6,1,head);}
    if(hd==='monkey'){sp(1.8,M(L.h),-5.8,HY+.6,0,head,.5,1,1);sp(1.8,M(L.h),5.8,HY+.6,0,head,.5,1,1);}
    if(L.b==='full'){const mB=M(L.bc);sp(4.3,mB,0,HY-3.6,2.4,head,1,1,.62);add(new THREE.ConeGeometry(3,5,10),mB,0,HY-7.4,2.6,head,Math.PI,0,0);}
    if(L.b==='short')sp(3,M(L.bc),0,HY-3.6,3,head,1,.6,.5);}
  // tocados
  const gy=HY+4.4,mG=M(gc);
  const ring=(r,t,mat,y,par,tube)=>add(new THREE.TorusGeometry(r,t,5,22),mat,0,y,0,par||head,Math.PI/2);
  switch(L.gear){
  case'laurel':{const lc=gc===C.gold||gc==='#e8b53e'?'#6f9a4c':gc;const ml=M(lc),ml2=M(shade(lc,.2));for(let i=0;i<16;i++){const a=i/16*Math.PI*1.7+Math.PI*1.15;add(new THREE.SphereGeometry(.9,6,4),i%2?ml:ml2,Math.cos(a)*5.5,gy-1.4,Math.sin(a)*5.6,head).scale.set(1.6,.7,1);}break;}
  case'crown':{const cr=add(new THREE.CylinderGeometry(5.7,5.5,2,16,1,true),M(gc,{side:THREE.DoubleSide}),0,gy,0,head);for(let i=0;i<8;i++){const a=i/8*6.283;add(new THREE.ConeGeometry(.9,2.6,4),mG,Math.cos(a)*5.6,gy+2.2,Math.sin(a)*5.6,head);}sp(.9,MB2(C.blood),0,gy,5.7,head);break;}
  case'helmet':{const h=add(new THREE.SphereGeometry(HR+.7,16,9,0,Math.PI*2,0,Math.PI*.55),mG,0,HY+.3,-.2,head);h.scale.set(1,1.08,1.05);bx(1.6,4,12.6,M(C.blood),0,gy+2,-.8,head);bx(1.7,1.2,12.8,M(shade(C.blood,.25)),0,gy+4,-.8,head);
    for(const sx of[-4.3,4.3])bx(1.4,4.6,2.6,mG,sx,HY-2.6,3.4,head);break;}
  case'horns':for(const sx of[-1,1]){add(new THREE.ConeGeometry(1.2,6,6),mG,sx*5,gy+1.4,0,head,0,0,sx*-.8);add(new THREE.ConeGeometry(.8,3.4,6),mG,sx*7.2,gy+4,0,head,0,0,sx*-.2);}break;
  case'feathers':{ring(5.7,.9,M(C.gold),gy-1);for(let i=-3;i<=3;i++){const f=piv(head,i*1.2,gy,-3.4);const l=9+(3-Math.abs(i))*1.4;sp(1,M(i%2?gc:shade(gc,.25)),0,l/2,0,f,1,l/2,.35);sp(.8,M(i%2?C.gold:C.blood),0,l,0,f);f.rotation.z=-i*.24;f.rotation.x=-.2;}break;}
  case'sun':cy(6.2,6.2,.8,18,MB2(C.gold),0,gy+2.6,-5.2,head,Math.PI/2);cy(3.8,3.8,1,14,MB2('#f2622c'),0,gy+2.6,-4.8,head,Math.PI/2);ring(5.6,.6,mG,gy-1.2);break;
  case'moon':add(new THREE.TorusGeometry(3,1,6,12,Math.PI*1.25),MB2('#e8eef8'),0,gy+3.4,0,head,0,0,-Math.PI*.12);ring(5.6,.5,M('#c8ccd8'),gy-1.2);break;
  case'halo':{const h=ring(6,.6,MB2('#f8e080'),gy+3.6);head.userData.halo=h;break;}
  case'band':ring(5.6,.9,mG,gy-1.6);break;
  case'hat':cy(9.6,9.6,1,18,mG,0,gy+.4,0,head);cy(4.8,5.6,5.6,14,mG,0,gy+3.4,0,head);ring(5.4,.5,M(shade(gc,.3)),gy+1.2);break;
  case'diadem':ring(5.6,.45,mG,gy-1.2);sp(.9,MB2('#7de0ff'),0,gy-1.2,5.7,head);break;
  }
  // extras
  let cape=null,drums=null,tail=null;const xarms=[];
  if(L.ex==='cape'){cape=piv(torso,0,12.4,-3.2);const g=new THREE.CylinderGeometry(6,8.5,22,12,1,true,Math.PI*.6,Math.PI*.8);const m=add(g,M(L.cc||C.blood,{side:THREE.DoubleSide}),0,-11,1.6,cape);m.scale.z=.6;}
  if(L.ex==='shield'){const sh=piv(armL.el,-1.8,-4,0);cy(5.4,5.4,.9,16,M(shade(trim,-.1)),0,0,0,sh,0,0,Math.PI/2);cy(3.8,3.8,1.1,14,M(trim),-.2,0,0,sh,0,0,Math.PI/2);sp(1.4,M(C.gold),-.7,0,0,sh);}
  if(L.ex==='multiarm'){for(const[sx,a,b]of[[-1,.7,-.5],[1,.7,-.5],[-1,1.2,.4],[1,1.2,.4]]){const p=piv(torso,sx*5.8,10,b*2);p.rotation.z=sx*a;p.rotation.x=b;add(new THREE.CylinderGeometry(1.3,1.05,13,8),mSkin,0,-6.5,0,p);sp(1.4,mSkin,0,-13.6,0,p);
      if(b>0)add(new THREE.TorusGeometry(2.2,.6,4,12),MB2(C.gold),0,-16,0,p);else sp(1.8,MB2(sx>0?'#e27aa8':'#ffffff'),0,-15.6,0,p);xarms.push(p);}}
  if(L.ex==='drums'){drums=piv(torso,0,12,-6);for(let i=0;i<8;i++){const a=Math.PI*(.95+i/7*1.1);cy(2.4,2.4,2.2,12,M('#8a3a2a'),Math.cos(a)*14,Math.sin(a)*12,0,drums,Math.PI/2);cy(1.6,1.6,2.4,12,M('#e8c86a'),Math.cos(a)*14,Math.sin(a)*12,.2,drums,Math.PI/2);}
    add(new THREE.TorusGeometry(13,.5,4,24,Math.PI*1.1),M('#5a3a2a'),0,0,0,drums,0,0,Math.PI*.95-.05);}
  if(L.ex==='tail'||id==='wukong'||id==='hanuman'){tail=piv(body,0,18,-4.4);let par=tail;for(let i=0;i<7;i++){const s=piv(par,0,0,i?-2.6:0);add(new THREE.CylinderGeometry(.9-i*.05,.9-i*.05,3,6),M(shade(L.h||skin,-.1)),0,0,-1.3,s,Math.PI/2);s.rotation.x=-.28;par=s;}}
  if(!(L.held==='none'||light))buildHeld(L.held,hc,id,armR.hand,{bx,cy,add,M,MB2,piv});
  root.userData.parts={body,legs,torso,armL,armR,head,cape,drums,tail,xarms,handR:armR.hand};
  root.userData.mats=mats;root.userData.ph=0;root.userData.yaw=0;root.userData.god=id;
  root.userData.disp=()=>{geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());texs.forEach(t=>t.dispose());};
  root.scale.setScalar(GOD_SCALE);
  return root;}

function buildHeld(kind,hc,id,hand,H){const{bx,cy,add,M,MB2,piv}=H;const w=piv(hand,0,0,1.2);w.rotation.x=.25;const mh=M(hc),wood=M('#7a5a3a');
  switch(kind){
  case'bolt':{const mb=MB2('#fff6a0');bx(2,7,2,mb,0,2,0,w,0,0,.55);bx(2,7.5,2,mb,1.8,7.6,0,w,0,0,-.55);bx(2.2,8,2.2,mb,0,13.4,0,w,0,0,.55);bx(1,6,1,MB2('#ffffff'),.6,8,1.2,w,0,0,-.55);w.userData.glow=hc;break;}
  case'trident':case'bident':{cy(.8,.8,48,6,mh,0,8,0,w);bx(kind==='trident'?9:6,1.4,1.4,mh,0,29,0,w);const xs=kind==='trident'?[-4,0,4]:[-2.6,2.6];for(const x of xs){bx(1.3,7,1.3,mh,x,33,0,w);cy(.1,1,2.2,4,mh,x,37.6,0,w);}break;}
  case'spear':cy(.8,.8,46,6,wood,0,8,0,w);cy(.1,2,7.5,4,mh,0,34.5,0,w);bx(3,1,1,M(C.blood),0,30,0,w);break;
  case'bow':add(new THREE.TorusGeometry(11,.9,4,12,Math.PI),M(hc),0,4,2,w,0,Math.PI/2,-Math.PI/2);bx(.3,22,.3,M('#f2e3c6'),0,4,2,w);break;
  case'hammer':cy(.9,.9,12,6,M('#6a4a2a'),0,2,0,w);bx(10,6.5,6.5,mh,0,9.5,0,w);bx(10.4,1.2,6.8,M(shade(hc,.3)),0,11.8,0,w);break;
  case'orb':{const o=add(new THREE.IcosahedronGeometry(3.6,1),MB2(hc),0,5,2,w);add(new THREE.IcosahedronGeometry(1.6,0),MB2('#ffffff'),-1,6,4,w);w.userData.orb=o;w.userData.glow=hc;break;}
  case'staff':cy(.8,.9,50,6,M(shade(hc,-.25)),0,9,0,w);{const top=add(new THREE.IcosahedronGeometry(2.8,0),MB2(id==='wukong'?C.gold:hc),0,35,0,w);if(id==='ra'){bx(6,1.2,1.2,mh,0,33,0,w);}if(id==='quetzalcoatl')for(let i=0;i<5;i++)bx(1,5,.4,M(i%2?'#3aa07a':C.gold),-2+i,38,0,w,0,0,(i-2)*.3);w.userData.glow=hc;}break;
  case'sword':bx(1.2,4.5,1.2,M('#5a3a22'),0,0,0,w);bx(6,1.2,1.8,M(C.gold),0,2.8,0,w);bx(2,17,.9,mh,0,12,0,w);bx(.6,15,1,M('#ffffff'),.5,12,0,w);cy(.1,1.4,2,4,mh,0,21.4,0,w);break;
  case'katana':bx(1.2,6,1.2,M('#2a2030'),0,0,0,w);cy(2.2,2.2,.6,10,M(C.gold),0,3.4,0,w);{const b=bx(1.3,21,.6,mh,0,14.4,0,w);b.rotation.x=.06;}break;
  case'axe':cy(.8,.8,26,6,wood,0,6,0,w);bx(1.2,8,6.5,mh,0,15,3.2,w);break;
  case'doubleaxe':cy(.8,.8,26,6,wood,0,6,0,w);bx(1.2,8,6,mh,0,15,3.4,w);bx(1.2,8,6,mh,0,15,-3.4,w);break;
  case'club':cy(1.2,2.8,19,7,mh,0,8,0,w);for(let i=0;i<4;i++)cy(.1,.8,2,4,M(shade(hc,.3)),Math.cos(i*1.57)*2.2,13,Math.sin(i*1.57)*2.2,w,0,0,0);break;
  case'machete':bx(1.2,4.5,1.2,M('#3a2416'),0,0,0,w);bx(1.3,13,3.6,mh,0,9.5,.8,w);break;
  case'disc':{const d=add(new THREE.TorusGeometry(5,1.1,5,16),MB2(hc),0,8,0,w,Math.PI/2);for(let i=0;i<4;i++)bx(.6,8,.6,MB2(hc),0,8,0,w,0,0,i*.785);w.userData.spin=d;w.userData.glow=hc;break;}
  case'mirror':cy(5,5,1,14,M(C.gold),0,8,0,w,Math.PI/2);cy(4,4,1.3,14,MB2(hc),0,8,.2,w,Math.PI/2);bx(1.2,5,1,M('#6a4a2a'),0,2.5,0,w);break;
  case'net':{const n=bx(11,11,.3,MB2(hc,{wireframe:true}),0,6,2,w);break;}
  case'sling':bx(.5,8,.5,M('#c8a878'),0,3,0,w);add(new THREE.SphereGeometry(1.6,6,5),MB2(hc),0,-1,1,w);break;
  case'ball':add(new THREE.SphereGeometry(3.4,8,6),M('#3a2a1a'),0,0,2,w);break;
  }
  return w;}

/* ---------- animación de dioses ---------- */
const _qa=new THREE.Quaternion();
function angLerp(a,b,k){let d=b-a;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;return a+d*k;}
function animGod(m,p,dt){const u=m.userData,P=u.parts;const mv=p.moving&&!p.down?1:0,air=p.air&&!p.down;
  u.ph+=dt*(mv?10.5:0);const s=Math.sin(u.ph),c=Math.cos(u.ph);
  p.atk=Math.max(0,(p.atk||0)-dt);p.powAnim=Math.max(0,(p.powAnim||0)-dt);const atk=p.atk/.22;const glide=air&&p.vz<-60;
  const [lL,lR]=P.legs;
  if(air){lL.hip.rotation.x=-.9;lL.knee.rotation.x=1.2;lR.hip.rotation.x=.3;lR.knee.rotation.x=.6;}
  else{lL.hip.rotation.x=s*.75*mv;lR.hip.rotation.x=-s*.75*mv;lL.knee.rotation.x=Math.max(0,-c)*1.1*mv+.05;lR.knee.rotation.x=Math.max(0,c)*1.1*mv+.05;}
  const aL=P.armL,aR=P.armR;
  aL.sh.rotation.x=air?-.7:-s*.7*mv;aL.sh.rotation.z=glide?-1.45:air?-.6:-.1-Math.sin(T*2)*.03;aL.el.rotation.x=-.25-(mv?.5:.1);
  aR.sh.rotation.x=(air?-.5:s*.4*mv)-atk*1.7;aR.sh.rotation.z=glide?1.45:air?.6:.1;aR.el.rotation.x=-.5-atk*.6;
  if(p.powAnim>0){aL.sh.rotation.x=aR.sh.rotation.x=-2.9;aL.sh.rotation.z=-.3;aR.sh.rotation.z=.3;aL.el.rotation.x=aR.el.rotation.x=-.2;}
  P.body.position.y=Math.abs(c)*1.3*mv+(mv?-.4:Math.sin(T*2.4)*.2);
  P.torso.rotation.x=mv*.14+(p.dashT>0?.8:0);P.torso.rotation.y=atk*.35+s*.08*mv;
  P.head.rotation.x=-P.torso.rotation.x*.6;P.head.rotation.y=-P.torso.rotation.y*.7+Math.sin(T*.7)*.1*(1-mv);
  if(P.cape)P.cape.rotation.x=.1+mv*.5+(air?.5:0)+Math.sin(T*6)*.05;
  if(P.drums)P.drums.rotation.z=Math.sin(T*1.5)*.1;
  if(P.tail)P.tail.rotation.y=Math.sin(T*3)*.5;
  P.xarms.forEach((a,i)=>{a.rotation.x=(i<2?-.5:.4)+Math.sin(T*3+i)*.2;});
  if(P.head.userData.rays)P.head.userData.rays.rotation.z=T*.6;
  if(P.head.userData.flame)P.head.userData.flame.scale.y=1+Math.sin(T*14)*.12;
  const hw=P.handR.children[0];if(hw&&hw.userData.spin)hw.userData.spin.rotation.z=T*8;if(hw&&hw.userData.orb)hw.userData.orb.position.y=5+Math.sin(T*3)*1.2;
  const ty=Math.atan2(p.fx||0,p.fy||1);u.yaw=angLerp(u.yaw,ty,Math.min(1,dt*12));m.rotation.y=u.yaw;
  m.rotation.x=p.down?-1.45:0;if(p.down)P.body.position.y=2;
  const fl=p.inv>0&&p.inv<.45&&Math.floor(p.inv*20)%2===0&&!p.down,hid=p.hidden>0,ghost=p.ctrl==='net'&&p.dn;
  if(u.fl!==fl||u.hid!==hid||u.gh!==ghost){u.fl=fl;u.hid=hid;u.gh=ghost;for(const mm of u.mats){if(!mm.userData.basic&&mm.emissive){if(fl)mm.emissive.set('#ffffff');else mm.emissive.copy(mm.userData.em0);}mm.transparent=hid||ghost;mm.opacity=hid?.35:ghost?.5:1;}}}

/* ---------- enemigos: plantillas por arquetipo ---------- */
function enemyParts(d,boss){
  const c=d.col,dk=shade(c,-.28),hi=shade(c,.2),a=d.acc,bone='#e8e0cc',eye=lum(a)>.5?a:'#fff0a0';const f=d.feat||'';
  const out=[];const P=(w,h,dd,col,pv,of,an,i,geo)=>out.push({w,h,d:dd,col,pv,of,an:an||'',i:i||0,geo});
  const col=k=>({c,d:dk,h:hi,a,b:bone,e:eye,k:INK,w:'#7a5a3a',s:'#c8ccd8'})[k]||k;
  switch(d.arch){
  case'humanoid':case'lord':{const sk=f==='skull';const hc=sk?'b':'c';
    P(3.6,9,3.6,'d',[-2.3,9,0],[0,-4.5,0],'legA');P(3.6,9,3.6,'d',[2.3,9,0],[0,-4.5,0],'legB');
    P(9.5,10.5,6.2,'c',[0,9,0],[0,5,0],'torso');P(10,2,6.6,'a',[0,9,0],[0,1.2,0],'torso');
    P(2.8,9.5,2.8,hc,[-6,18,0],[0,-4.5,0],'armA');P(2.8,9.5,2.8,hc,[6,18,0],[0,-4.5,0],'armB');
    if(f!=='headless'){const heads=boss&&d.heads>1?Math.min(d.heads,10):1;
      for(let h=0;h<heads;h++){const hx=(h-(heads-1)/2)*(heads>3?5.2:8.5),hy=heads>3?-Math.abs(h-(heads-1)/2)*.8:0,hs=heads>3?.75:1;
        P(8.2*hs,8*hs,7.6*hs,hc,[hx,19+hy,0],[0,4*hs,0],'head',h);
        if(f==='oneeye'){P(3.6,3.6,.6,'e',[hx,19+hy,0],[0,4.4*hs,3.9*hs],'head',h);P(1.6,1.6,.7,'k',[hx,19+hy,0],[0,4.4*hs,4.1*hs],'head',h);}
        else{P(1.7,1.7,.6,sk?'k':'e',[hx,19+hy,0],[-1.9*hs,4.6*hs,3.9*hs],'head',h);P(1.7,1.7,.6,sk?'k':'e',[hx,19+hy,0],[1.9*hs,4.6*hs,3.9*hs],'head',h);}
        if(sk){P(4,1.2,.6,'k',[hx,19+hy,0],[0,1.6*hs,3.9*hs],'head',h);}
        if(f==='horns'){P(1.5,4.5,1.5,'b',[hx,19+hy,0],[-3.2*hs,9.6*hs,0],'head',h);P(1.5,4.5,1.5,'b',[hx,19+hy,0],[3.2*hs,9.6*hs,0],'head',h);}
        if(f==='helmet'){P(9,3.6,8.6,'a',[hx,19+hy,0],[0,7.4*hs,0],'head',h);P(1.6,4,8.8,'#b3301f',[hx,19+hy,0],[0,10.4*hs,0],'head',h);}
        if(f==='crown'){P(8.8,2,8.4,C.gold,[hx,19+hy,0],[0,8.6*hs,0],'head',h);for(const x of[-3,0,3])P(1.4,2.2,1.4,C.gold,[hx,19+hy,0],[x*hs,10.4*hs,3.6*hs],'head',h);}
      }}
    else P(4,4,4,'#9ad0e8',[0,19,0],[0,3,0],'flame');
    if(f==='spear'||f==='scythe'){P(1,24,1,'w',[6,18,0],[0,-3,3],'armB');if(f==='scythe')P(1,2.4,9,'s',[6,18,0],[0,9,6.5],'armB');else P(1.6,4,1.6,'s',[6,18,0],[0,10.5,3],'armB');}
    if(f==='hop'){P(10,2,1,'#f2d23a',[0,19,0],[0,6.5,3.9],'head');}
    if(f==='stinger'){P(2,2,7,'a',[0,9,-3],[0,2,-3],'tail');}
    if(boss&&d.arch==='lord'){P(12,3,7,'a',[0,9,0],[0,10.4,0],'torso');P(4,4,5,'a',[-6,18,0],[0,0,0],'armA');P(4,4,5,'a',[6,18,0],[0,0,0],'armB');}
    break;}
  case'flyer':{const by=22;const wc=f==='butterfly'?'a':f==='dragon'?'d':'c';
    P(7.5,6.5,10,'c',[0,by,0],[0,0,0],'bob');P(6.4,6,6.4,'c',[0,by,0],[0,1.4,6.6],'bob');P(1.6,1.6,.6,'e',[0,by,0],[-1.6,2.2,9.9],'bob');P(1.6,1.6,.6,'e',[0,by,0],[1.6,2.2,9.9],'bob');
    P(15,1.1,9,wc,[-3.6,by+2,0],[-7.5,0,0],'wingL');P(15,1.1,9,wc,[3.6,by+2,0],[7.5,0,0],'wingR');
    if(f==='butterfly'){P(11,1.2,7,'h',[-3.6,by+2,0],[-6,0,-6],'wingL');P(11,1.2,7,'h',[3.6,by+2,0],[6,0,-6],'wingR');}
    P(4.5,1.2,6,'d',[0,by,-5],[0,0,-3],'tail');
    if(f==='beak'||f==='bird')P(2.4,2.2,3.4,'a',[0,by,0],[0,.8,10.8],'bob');
    if(f==='ears'||f==='bat'){P(1.6,3.4,1.2,'d',[0,by,0],[-2,5.4,6],'bob');P(1.6,3.4,1.2,'d',[0,by,0],[2,5.4,6],'bob');}
    if(f==='dragon'){P(2.4,2.4,6,'c',[0,by,0],[0,1.4,11],'bob');P(1.2,3.4,1.2,'b',[0,by,0],[-2,5.6,6],'bob');P(1.2,3.4,1.2,'b',[0,by,0],[2,5.6,6],'bob');}
    P(1.4,4,1.4,'d',[-2,by-3,0],[0,-2,0],'legA');P(1.4,4,1.4,'d',[2,by-3,0],[0,-2,0],'legB');
    break;}
  case'blob':{P(12,11,11,'c',[0,3,0],[0,5.5,0],'squash');P(9,4,9,'h',[0,3,0],[0,12,0],'squash');P(2.2,2.6,.6,'e',[0,3,0],[-2.6,8,5.6],'squash');P(2.2,2.6,.6,'e',[0,3,0],[2.6,8,5.6],'squash');P(3,1.2,.6,'k',[0,3,0],[0,4.6,5.6],'squash');
    for(let i=0;i<4;i++){const a=i/4*6.283+.6;P(2.4,6,2.4,'d',[Math.cos(a)*3.6,3.4,Math.sin(a)*3.6],[0,-3,0],'tent',i);}
    if(f==='hair')P(12.4,10,4,'k',[0,3,0],[0,8,-4.2],'squash');
    break;}
  case'giant':{P(5,8,5,'d',[-3.4,8,0],[0,-4,0],'legA');P(5,8,5,'d',[3.4,8,0],[0,-4,0],'legB');P(15,14,10.5,'c',[0,8,0],[0,7,0],'torso');P(12,3,9,'h',[0,8,0],[0,13.4,0],'torso');
    P(4,14,4,'c',[-9.4,19,0],[0,-6.5,0],'armA');P(4,14,4,'c',[9.4,19,0],[0,-6.5,0],'armB');P(4.8,4.6,4.8,'d',[-9.4,19,0],[0,-14,0],'armA');P(4.8,4.6,4.8,'d',[9.4,19,0],[0,-14,0],'armB');
    if(f==='oneeye'){P(5,5,.8,'b',[0,8,0],[0,10,5.4],'torso');P(2.4,2.4,1,'a',[0,8,0],[0,10,5.8],'torso');}else{P(2,2,.6,'e',[0,8,0],[-2.6,10.4,5.4],'torso');P(2,2,.6,'e',[0,8,0],[2.6,10.4,5.4],'torso');}
    P(6,1.4,.6,'k',[0,8,0],[0,5.6,5.4],'torso');
    if(f==='horns'){P(1.8,5,1.8,'b',[0,8,0],[-5,16.4,0],'torso');P(1.8,5,1.8,'b',[0,8,0],[5,16.4,0],'torso');}
    break;}
  case'beast':{const heads=boss?(d.heads||1):1;
    P(8.5,7.5,15,'c',[0,9.5,0],[0,0,0],'bodyB');P(8.8,2,13,'h',[0,9.5,0],[0,4,0],'bodyB');
    for(let h=0;h<heads;h++){const hx=(h-(heads-1)/2)*7.4;
      P(7.2,6.8,7.2,'c',[hx,11,8],[0,1.6,3],'headB',h);P(4.4,3.6,4.4,'h',[hx,11,8],[0,0,7.6],'headB',h);P(1.6,1.2,.6,'k',[hx,11,8],[0,.8,9.9],'headB',h);
      P(1.6,1.6,.6,'e',[hx,11,8],[-1.9,3.2,6.7],'headB',h);P(1.6,1.6,.6,'e',[hx,11,8],[1.9,3.2,6.7],'headB',h);
      P(1.8,3.4,1.2,'d',[hx,11,8],[-2.4,6.2,2],'headB',h);P(1.8,3.4,1.2,'d',[hx,11,8],[2.4,6.2,2],'headB',h);
      if(f==='horns'){P(1.4,5,1.4,'b',[hx,11,8],[-3,7,3],'headB',h);P(1.4,5,1.4,'b',[hx,11,8],[3,7,3],'headB',h);}
      if(f==='mane')P(10,10,4,'a',[hx,11,8],[0,1.6,0],'headB',h);}
    for(const[x,z,an]of[[-2.9,5,'legA'],[2.9,5,'legB'],[-2.9,-5,'legB'],[2.9,-5,'legA']])P(2.9,8,2.9,'d',[x,8,z],[0,-4,0],an);
    const tails=f==='tails'?3:1;for(let t=0;t<tails;t++)P(1.8,1.8,9,tails>1?'h':'d',[0,11,-7.5],[(t-(tails-1)/2)*3,1.4,-4.5],'tail',t);
    break;}
  default:{// crawler
    P(9.5,4.4,12,'c',[0,4.5,0],[0,0,0],'bodyB');P(8,2,9,'h',[0,4.5,0],[0,2.6,0],'bodyB');P(1.6,1.6,.6,'e',[0,4.5,0],[-1.8,2,6.1],'bodyB');P(1.6,1.6,.6,'e',[0,4.5,0],[1.8,2,6.1],'bodyB');
    for(let i=0;i<3;i++){P(7,1.2,1.4,'d',[-4,4,-3+i*3.2],[-3,-1,0],i%2?'crawlA':'crawlB',i);P(7,1.2,1.4,'d',[4,4,-3+i*3.2],[3,-1,0],i%2?'crawlB':'crawlA',i);}
    P(3.2,2.8,5,'a',[-4.4,4.5,6],[0,0,3],'armA');P(3.2,2.8,5,'a',[4.4,4.5,6],[0,0,3],'armB');
    P(2.6,2.6,6,'c',[0,6,-6],[0,3,-2],'tail');P(2,2,6,'c',[0,6,-6],[0,8.5,-.5],'tail');P(1.6,4,1.6,'a',[0,6,-6],[0,12,1.5],'tail');
  }}
  return out.map(p=>Object.assign(p,{color:col(p.col)}));}
const _e3=new THREE.Euler(),_s3=new THREE.Vector3(1,1,1),_p3=new THREE.Vector3(),_m4=new THREE.Matrix4(),_b4=new THREE.Matrix4(),_q3=new THREE.Quaternion();
function partAnim(p,ph,mv,t,e){_e3.set(0,0,0);_s3.set(1,1,1);const s=Math.sin(ph);
  switch(p.an){
  case'legA':_e3.x=s*.75*mv;break;case'legB':_e3.x=-s*.75*mv;break;
  case'armA':_e3.x=-s*.6*mv-(e&&e.atk?e.atk:0);break;case'armB':_e3.x=s*.6*mv-(e&&e.atk?e.atk:0);break;
  case'wingL':_e3.z=Math.sin(t*14+ph)*.75;break;case'wingR':_e3.z=-Math.sin(t*14+ph)*.75;break;
  case'head':_e3.y=Math.sin(t*1.3+p.i)*.12;_e3.x=Math.sin(t*2+p.i)*.05;break;
  case'headB':_e3.x=Math.sin(ph*2+p.i)*.08;_e3.y=Math.sin(t*1.1+p.i*1.7)*.15;break;
  case'tail':_e3.y=Math.sin(t*5+ph+p.i)*.45;_e3.x=-.15;break;
  case'squash':{const k=Math.sin(t*5+ph)*.08;_s3.set(1-k*.6,1+k,1-k*.6);break;}
  case'tent':_e3.x=Math.sin(t*6+ph+p.i)*.4;_e3.z=Math.cos(t*5+ph+p.i)*.3;break;
  case'crawlA':_e3.y=s*.35*mv;break;case'crawlB':_e3.y=-s*.35*mv;break;
  case'torso':_e3.y=Math.sin(ph*.5)*.06*mv;break;
  case'flame':_s3.set(1,1+Math.sin(t*14)*.3,1);break;
  }}

function partGeo(pt){const{w,h,d}=pt;const mx=Math.max(w,h,d),mn=Math.min(w,h,d);let g;
  if(mx<2.6||mn<1.3){g=new THREE.BoxGeometry(w,h,d);}
  else if(/^(legA|legB|armA|armB|tent|crawlA|crawlB)$/.test(pt.an)&&h>=Math.max(w,d)){g=new THREE.CylinderGeometry(Math.min(w,d)/2,Math.min(w,d)/2*.78,h,9);}
  else if(pt.an==='tail'&&d>=Math.max(w,h)){g=new THREE.CylinderGeometry(Math.min(w,h)/2*.7,Math.min(w,h)/2,d,8);g.rotateX(Math.PI/2);}
  else if(/^(wingL|wingR)$/.test(pt.an)){g=new THREE.BoxGeometry(w,h,d);}
  else{g=new THREE.SphereGeometry(.5,12,9);g.scale(w*1.1,h*1.1,d*1.1);}
  g.translate(pt.of[0],pt.of[1],pt.of[2]);return g;}
/* ---------- enemigos instanciados ---------- */
const ENI={};
function eniFor(key){if(ENI[key])return ENI[key];const d=ENEMIES[key];const parts=enemyParts(d,false);const cap=420;
  const mat=new THREE.MeshLambertMaterial({color:'#ffffff',emissive:'#2a2a2a'});
  const list=parts.map(pt=>{const g=partGeo(pt);const im=new THREE.InstancedMesh(g,mat,cap);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;
    for(let i=0;i<cap;i++)im.setColorAt(i,tmpC.set(pt.color));im.count=0;scene.add(im);return{pt,im,col:new THREE.Color(pt.color)};});
  return ENI[key]={key,list,n:0,flyer:d.arch==='flyer'};}
function eniBegin(){for(const k in ENI)ENI[k].n=0;}
function eniEnd(){for(const k in ENI){const E=ENI[k];for(const L of E.list){L.im.count=E.n;L.im.instanceMatrix.needsUpdate=true;if(L.im.instanceColor)L.im.instanceColor.needsUpdate=true;}}}
function enemyYaw(e,dt){const dx=e.x-(e._lx??e.x),dy=e.y-(e._ly??e.y);e._lx=e.x;e._ly=e.y;let ty=e._yaw??0;const sp=Math.hypot(dx,dy);
  if(sp>.05)ty=Math.atan2(dx,dy);else{const p=players[0];if(p)ty=Math.atan2(p.x-e.x,p.y-e.y);}e._yaw=angLerp(e._yaw??ty,ty,Math.min(1,dt*10));e._mv=clamp(sp/(dt*40+1e-3),0,1);return e._yaw;}
function eniDraw(e,dt){const E=eniFor(e.key);if(E.n>=420)return;const i=E.n++;const yaw=enemyYaw(e,dt);const s=e.r/14.5;const ph=T*9+e.ph;
  let by=e.z;if(E.flyer)by+=Math.sin(T*3+e.ph)*3;if(e.d.feat==='hop')by+=Math.abs(Math.sin(T*6+e.ph))*8;
  _q3.setFromAxisAngle(_p3.set(0,1,0),yaw);_b4.compose(_p3.set(e.x,by,e.y),_q3,_s3.set(s,s,s));
  const fl=e.flash>0;for(const L of E.list){partAnim(L.pt,ph,1,T,null);_q3.setFromEuler(_e3);_m4.compose(_p3.set(L.pt.pv[0],L.pt.pv[1],L.pt.pv[2]),_q3,_s3);_m4.premultiply(_b4);L.im.setMatrixAt(i,_m4);
    L.im.setColorAt(i,fl?tmpC.set('#ffffff'):e.elite?tmpC.copy(L.col).lerp(EL_GOLD,.18):L.col);}}
const EL_GOLD=new THREE.Color('#ffd040');

/* ---------- jefes 3D ---------- */
function buildBoss(e){const d=e.d,root=new THREE.Group(),mats=[],geos=[];const corrupt=e.corrupt;
  const M=c=>{const cc=corrupt?shade(c,-.25):c;const m=new THREE.MeshLambertMaterial({color:cc});m.emissive.set(cc).multiplyScalar(.2);m.userData.em0=m.emissive.clone();mats.push(m);return m;};
  const parts=[];const mk=(pt,par)=>{let piv=par.userData.pv&&par.userData.pv[pt.pv.join()];if(!piv){piv=new THREE.Group();piv.position.set(...pt.pv);par.add(piv);(par.userData.pv=par.userData.pv||{})[pt.pv.join()]=piv;piv.userData.an=pt.an;piv.userData.i=pt.i;parts.push(piv);}
    const g=partGeo(Object.assign({},pt,{of:[0,0,0]}));geos.push(g);const m=new THREE.Mesh(g,M(pt.color));m.position.set(...pt.of);m.castShadow=true;piv.add(m);};
  const body=new THREE.Group();root.add(body);
  let arch=d.arch;const base={col:d.col,acc:d.acc,feat:d.feat,heads:d.heads};
  if(arch==='hundred'){enemyParts(Object.assign({},base,{arch:'lord',heads:5,feat:''}),true).forEach(pt=>mk(pt,body));
    for(let i=0;i<12;i++){const a=i/12*6.283;const pv=new THREE.Group();pv.position.set(Math.cos(a)*7,15+Math.sin(i*2.1)*3,Math.sin(a)*4);pv.rotation.z=Math.cos(a)*1.2;pv.userData.an='wave';pv.userData.i=i;body.add(pv);parts.push(pv);
      const g=new THREE.BoxGeometry(2.6,13,2.6);g.translate(0,6.5,0);geos.push(g);const m=new THREE.Mesh(g,M(shade(d.col,-.15)));m.castShadow=true;pv.add(m);const g2=new THREE.BoxGeometry(3.6,3.6,3.6);g2.translate(0,13.5,0);geos.push(g2);pv.add(new THREE.Mesh(g2,M(d.col)));}}
  else if(arch==='hydra'){const n=Math.min(d.heads||5,9);const gb=new THREE.BoxGeometry(18,12,16);gb.translate(0,9,0);geos.push(gb);const bm=new THREE.Mesh(gb,M(d.col));bm.castShadow=true;body.add(bm);
    for(const[x,z]of[[-6,6],[6,6],[-6,-6],[6,-6]]){const g=new THREE.BoxGeometry(4,6,4);g.translate(x,3,z);geos.push(g);body.add(new THREE.Mesh(g,M(shade(d.col,-.25))));}
    for(let i=0;i<n;i++){const a=(i/(n-1||1)-.5)*2.2;const pv=new THREE.Group();pv.position.set(Math.sin(a)*6,14,Math.cos(a)*5);pv.rotation.set(-.35,a,0);pv.userData.an='neck';pv.userData.i=i;body.add(pv);parts.push(pv);
      const g=new THREE.BoxGeometry(3.4,18,3.4);g.translate(0,9,0);geos.push(g);pv.add(new THREE.Mesh(g,M(shade(d.col,.08))));
      const gh=new THREE.BoxGeometry(5.6,5,8);gh.translate(0,19,2);geos.push(gh);const hm=new THREE.Mesh(gh,M(d.col));hm.castShadow=true;pv.add(hm);
      for(const sx of[-1.5,1.5]){const ge=new THREE.BoxGeometry(1.2,1.2,.6);ge.translate(sx,20.6,6.1);geos.push(ge);pv.add(new THREE.Mesh(ge,new THREE.MeshBasicMaterial({color:d.acc})));}
      const gj=new THREE.BoxGeometry(4.6,1.2,6);gj.translate(0,16.6,3);geos.push(gj);pv.add(new THREE.Mesh(gj,M(d.acc)));}
    const gt=new THREE.BoxGeometry(4,4,14);gt.translate(0,6,-14);geos.push(gt);body.add(new THREE.Mesh(gt,M(shade(d.col,-.2))));}
  else if(arch==='gorgon'){for(let i=0;i<5;i++){const g=new THREE.BoxGeometry(9-i,5,9-i);g.translate(Math.sin(i*1.3)*5,2.5,-i*6);geos.push(g);const m=new THREE.Mesh(g,M(i%2?d.col:shade(d.col,-.2)));m.castShadow=true;body.add(m);}
    enemyParts(Object.assign({},base,{arch:'lord',feat:'',heads:1}),true).filter(pt=>pt.an!=='legA'&&pt.an!=='legB').forEach(pt=>{pt.pv=[pt.pv[0],pt.pv[1]-3,pt.pv[2]];mk(pt,body);});
    for(let i=0;i<10;i++){const a=i/10*6.283;const pv=new THREE.Group();pv.position.set(Math.cos(a)*3.4,24,Math.sin(a)*3);pv.rotation.set(Math.sin(a)*.8,0,-Math.cos(a)*.8);pv.userData.an='wave';pv.userData.i=i;body.add(pv);parts.push(pv);
      const g=new THREE.BoxGeometry(1.2,6,1.2);g.translate(0,3,0);geos.push(g);pv.add(new THREE.Mesh(g,M('#3a8a3a')));}}
  else if(arch==='titan'){const gb=new THREE.BoxGeometry(20,26,14);gb.translate(0,16,0);geos.push(gb);body.add(new THREE.Mesh(gb,M(d.col)));const gh=new THREE.BoxGeometry(12,11,11);gh.translate(0,34,0);geos.push(gh);body.add(new THREE.Mesh(gh,M(shade(d.col,.1))));
    for(const sx of[-3,3]){const ge=new THREE.BoxGeometry(2.4,1.4,.6);ge.translate(sx,35,5.6);geos.push(ge);body.add(new THREE.Mesh(ge,new THREE.MeshBasicMaterial({color:d.acc})));}
    for(let i=0;i<9;i++){const pv=new THREE.Group();pv.userData.an='orbit';pv.userData.i=i;body.add(pv);parts.push(pv);const g=new THREE.OctahedronGeometry(3+i%3,0);geos.push(g);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:i%2?d.acc:'#e27aa8'}));m.position.set(22,18+i*2,0);pv.add(m);}
    for(const sx of[-1,1]){const pv=new THREE.Group();pv.position.set(sx*12,28,0);pv.userData.an=sx<0?'armA':'armB';parts.push(pv);body.add(pv);const g=new THREE.BoxGeometry(5,20,5);g.translate(0,-9,0);geos.push(g);pv.add(new THREE.Mesh(g,M(shade(d.col,.05))));}}
  else if(arch==='serpent'){const g=new THREE.BoxGeometry(10,8,14);g.translate(0,6,2);geos.push(g);body.add(new THREE.Mesh(g,M(d.col)));const gj=new THREE.BoxGeometry(9,2,10);gj.translate(0,1.6,5);geos.push(gj);const jaw=new THREE.Mesh(gj,M(shade(d.col,-.25)));body.add(jaw);
    for(const sx of[-2.6,2.6]){const ge=new THREE.BoxGeometry(1.8,1.8,.6);ge.translate(sx,8.4,9.1);geos.push(ge);body.add(new THREE.Mesh(ge,new THREE.MeshBasicMaterial({color:d.acc})));}
    if(d.feat==='double'||e.key==='amaru'){const gw=new THREE.BoxGeometry(20,1,6);gw.translate(0,9,-2);geos.push(gw);body.add(new THREE.Mesh(gw,M(d.acc)));}
    const gc=new THREE.BoxGeometry(10,2,2);gc.translate(0,10.6,0);geos.push(gc);body.add(new THREE.Mesh(gc,M(d.acc)));}
  else enemyParts(Object.assign({},base,{arch}),true).forEach(pt=>mk(pt,body));
  if(corrupt){const g=new THREE.TorusGeometry(14,1,5,24);geos.push(g);const t=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:'#b07aff',transparent:true,opacity:.7}));t.rotation.x=Math.PI/2;t.position.y=4;body.add(t);}
  root.userData.parts=parts;root.userData.mats=mats;root.userData.body=body;root.userData.disp=()=>{geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());};
  return root;}
function animBoss(m,e,dt){const u=m.userData;const yaw=enemyYaw(e,dt);m.rotation.y=yaw;const s=e.r/(e.d.arch==='serpent'?6:e.d.arch==='titan'?9:6.5);m.scale.setScalar(s);
  const ph=T*7+e.ph;let by=e.z;if(e.d.arch==='flyer')by+=8+Math.sin(T*2)*4;if(e.d.arch==='titan')by+=Math.sin(T*1.5)*3;m.position.set(e.x,by,e.y);
  for(const pv of u.parts){const an=pv.userData.an,i=pv.userData.i||0;
    if(an==='wave'){pv.rotation.x=Math.sin(T*3+i*1.3)*.5;continue;}if(an==='neck'){pv.rotation.x=-.35+Math.sin(T*2+i*1.1)*.25;pv.rotation.z=Math.sin(T*1.6+i)*.18;continue;}
    if(an==='orbit'){pv.rotation.y=T*.8+i*.7;continue;}
    partAnim({an,i},ph,1,T,null);pv.rotation.copy(_e3);pv.scale.copy(_s3);}
  const fl=e.flash>0;if(u.fl!==fl){u.fl=fl;for(const mm of u.mats)if(mm.emissive){if(fl)mm.emissive.set('#ffffff');else mm.emissive.copy(mm.userData.em0||mm.emissive.set(0,0,0));}}}
function segMesh(e){const g=new THREE.BoxGeometry(1,1,1);const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:e.d.col}));m.castShadow=true;const g2=new THREE.BoxGeometry(.6,.25,1.04);g2.translate(0,.55,0);const c=new THREE.Mesh(g2,new THREE.MeshLambertMaterial({color:e.d.acc}));m.add(c);
  m.userData.disp=()=>{g.dispose();g2.dispose();m.material.dispose();c.material.dispose();};return m;}
