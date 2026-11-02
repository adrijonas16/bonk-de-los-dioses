/* Bonk de los Dioses · mundos 3D */
'use strict';
function PA(n){return typeof AS!=="undefined"&&AS.ready?AS.props[n]:null;}
const WS=1.5,ARENA=2600*WS,TSIZE=5800*WS,TSEG=340,AREAK=1.69*1.15,TCELL=TSIZE/TSEG,HALF=TSIZE/2;
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function plat(x,y,cx,cy,r,h,edge){const d=Math.hypot(x-cx,y-cy);if(d<=r)return h;if(d>=r+edge)return -1e9;return h*(1-(d-r)/edge);}
function sqplat(x,y,cx,cy,r,h){return Math.max(Math.abs(x-cx),Math.abs(y-cy))<=r?h:-1e9;}
const q=(v,s)=>Math.floor(v/s)*s;
/* pirámide escalonada: base y cima en radio cuadrado */
function stepPyr(x,y,cx,cy,base,top,h,steps){const d=Math.max(Math.abs(x-cx),Math.abs(y-cy));if(d>base)return -1e9;if(d<=top)return h;return Math.ceil((1-(d-top)/(base-top))*steps)/steps*h;}
/* rampa o escalera a lo largo de un segmento */
function ramp(x,y,ax,ay,bx,by,w,h0,h1,step){const vx=bx-ax,vy=by-ay,L2=vx*vx+vy*vy,t=((x-ax)*vx+(y-ay)*vy)/L2;if(t<0||t>1)return -1e9;const px=ax+vx*t,py=ay+vy*t;if(Math.hypot(x-px,y-py)>w/2)return -1e9;const h=h0+(h1-h0)*t;return step?Math.round(h/step)*step:h;}
function riverD(x,y,amp,per,off){return Math.abs(y-Math.sin(x/per)*amp-off);}
const M=(...v)=>Math.max(...v);

const TER={
 tartaro(x,y){let h=(fbm(x/360,y/360,11)-.5)*110;
  const lv=Math.min(riverD(x,y,260,420,-700),riverD(y,x,300,500,800),riverD(x,y,220,380,900));if(lv<90&&Math.hypot(x,y)>380)h=Math.min(h,-34+lv*.05);
  h=M(h,plat(x,y,0,0,330,96,16),ramp(x,y,0,330,0,640,110,96,0,12));
  for(const[mx,my,r,mh]of[[900,-600,170,70],[-950,450,190,62],[-600,-1000,160,80],[760,900,150,56],[1300,200,120,90],[-1300,-200,130,84]])h=M(h,plat(x,y,mx,my,r,mh,12));
  return h;},
 jotunheim(x,y){let h=(fbm(x/420,y/420,21)-.42)*220;if(fbm(x/320,y/320,5)<.34)h=Math.min(h,2+fbm(x/40,y/40,2)*3);
  h=M(h,plat(x,y,-700,-600,190,52,70),plat(x,y,0,0,180,8,120),plat(x,y,800,500,140,90,40));return h;},
 duat(x,y){let h=Math.sin(x/110+Math.sin(y/240)*2)*16+(fbm(x/300,y/300,31)-.5)*50;const rv=riverD(x,y,220,380,700);if(rv<120)h=Math.min(h,-26*(1-rv/120)-2);
  for(const[cx,cy,b,hh]of[[-600,-500,300,250],[-150,-850,240,200],[250,-1150,170,140]]){const d=Math.max(Math.abs(x-cx),Math.abs(y-cy));const ph=hh*(1-d/b);if(ph>0)h=M(h,q(ph,14));}
  h=M(h,plat(x,y,0,0,160,4,80),sqplat(x,y,700,-200,120,30));return h;},
 kur(x,y){let h=(fbm(x/340,y/340,41)-.5)*40;if(Math.abs(((x+4000)%520)-260)<18&&Math.abs(y)>520)h=-20;
  const dx=Math.abs(x),dy=y+260,pd=Math.max(dx,Math.abs(dy));let z=-1e9;if(pd<330)z=40;if(pd<240)z=80;if(pd<150)z=120;if(pd<70)z=150;
  if(dx<34&&dy>60&&dy<340)z=M(z,q(150*(1-(dy-60)/280),10));h=M(h,z);
  const wd=Math.max(Math.abs(x),Math.abs(y-80));if(wd>860&&wd<900&&!(Math.abs(x)<70||Math.abs(y-80)<70))h=M(h,60);return h;},
 lanka(x,y){let h=(fbm(x/320,y/320,51)-.45)*120;if(fbm(x/240,y/240,8)<.33)h=Math.min(h,-20);h=M(h,plat(x,y,0,0,240,50,16),ramp(x,y,240,0,520,0,80,50,0,10),plat(x,y,0,0,110,90,10),ramp(x,y,110,0,240,0,40,90,50,10));return h;},
 yomi(x,y){let h=(fbm(x/300,y/300,61)-.5)*80;const px=Math.sin(y/360)*160;if(Math.abs(x-px)<54)h=h*.2+4;h=M(h,plat(x,y,0,-900,200,110,14));if(Math.abs(x-px)<54&&y>-700&&y<-300)h=M(h,q(110*(1-(y+700)/400),10));return h;},
 diyu(x,y){let h=q(fbm(x/360,y/360,71)*140,14)-60;h=M(h,plat(x,y,0,0,240,84,14),ramp(x,y,240,0,540,0,70,84,0,10));
  if(Math.abs(y+900)<40&&Math.abs(x)<1500)h=M(h,70);return h;},
 mictlan(x,y){let h=(fbm(x/340,y/340,81)-.45)*80;
  if(Math.abs(x)<80&&y>-1500&&y<1100)h=q((fbm(x/60,y/600,4)-.5)*6,2)+2;
  h=M(h,stepPyr(x,y,360,-150,280,70,180,5),ramp(x,y,80,-150,300,-150,70,0,180,12));
  h=M(h,stepPyr(x,y,0,-1350,200,50,130,4),ramp(x,y,0,-1150,0,-1320,60,0,130,12));
  const cd=Math.max(Math.abs(x),Math.abs(y-850));if(cd<260&&cd>200)h=M(h,26);h=M(h,stepPyr(x,y,0,850,90,30,60,4));
  return h;},
 xibalba(x,y){let h=(fbm(x/300,y/300,91)-.45)*70;h=M(h,stepPyr(x,y,0,-300,220,55,150,9),ramp(x,y,0,-80,0,-290,46,0,150,10),ramp(x,y,0,-520,0,-310,46,0,150,10),ramp(x,y,220,-300,10,-300,46,0,150,10),ramp(x,y,-220,-300,-10,-300,46,0,150,10));
  if(x>500&&x<760&&Math.abs(y-300)<400){if(Math.abs(x-630)<60)h=2;else h=M(h,52);}
  for(const[cx,cy]of[[-700,-600],[750,-900],[-500,800],[200,1000]]){if(Math.hypot(x-cx,y-cy)<115)h=Math.min(h,-60);}return h;},
 ukupacha(x,y){
  const rx=x*.92-y*.39,ry=x*.39+y*.92;const e=Math.hypot(rx/700,ry/330);
  let h;if(e<1)h=140+(fbm(x/120,y/120,3)-.5)*4;else{const out=(e-1)*330;h=140-Math.floor(out/46)*22-(out>380?(out-380)*.9:0);}
  if(e<1.05&&Math.abs(ry)<60&&Math.abs(rx)<520)h=M(h,140);
  const hp=Math.hypot(x+300,y+1100);if(hp<520)h=M(h,140+Math.pow(1-hp/520,1.6)*520);
  h=M(h,plat(x,y,250,-80,70,170,30));
  h+=(fbm(x/200,y/200,101)-.5)*10;return Math.max(h,-260);},
 orun(x,y){let h=(fbm(x/340,y/340,111)-.45)*100;const rv=riverD(y,x,200,300,700);if(rv<80)h=Math.min(h,-22*(1-rv/80)-2);h=M(h,plat(x,y,0,0,180,30,70));return h;},
 annwn(x,y){let h=(fbm(x/380,y/380,121)-.42)*140;if(fbm(x/280,y/280,9)<.33)h=Math.min(h,-20);h=M(h,plat(x,y,500,-350,190,80,160),plat(x,y,0,0,140,6,80));return h;},
 cielo(x,y){let h=(fbm(x/140,y/140,131)-.5)*26;
  for(const[cx,cy,r,ph]of[[-600,-200,110,44],[-800,-520,100,80],[-560,-820,110,118],[620,-220,110,44],[820,-540,100,82],[560,-860,100,122],[-200,700,130,36],[420,620,120,62],[-1000,300,120,50],[1000,250,120,58]])h=M(h,plat(x,y,cx,cy,r,ph,8));
  h=M(h,plat(x,y,0,-1250,230,170,10),ramp(x,y,0,-1020,0,-500,90,170,0,12));return h;},
 vacio(x,y){const n=fbm(x/300,y/300,141);let h=n>.44?(n-.44)*340:-70;h=M(h,plat(x,y,0,0,240,20,50));
  for(let i=0;i<8;i++){const a=i/8*6.283;h=M(h,plat(x,y,Math.cos(a)*1000,Math.sin(a)*1000,140,30+i*12,30),ramp(x,y,Math.cos(a)*240,Math.sin(a)*240,Math.cos(a)*860,Math.sin(a)*860,60,20,30+i*12,0));}return h;}
};
function terrainH(rk,x,y){let h=TER[rk](x/WS,y/WS)*WS;const d=Math.hypot(x,y);if(d>ARENA-90){const k=Math.min(700,Math.pow((d-(ARENA-90))/14,2)*3);h=Math.max(h,rk==='ukupacha'?h:0)+k+(fbm(x/90,y/90,7)-.5)*60*Math.min(1,k/80);}return h;}

const LOOK3D={
 tartaro:{top:'#1a0806',hor:'#7a2a18',hemi:['#c07a5a','#2a1010',.62],sun:['#ffb080',.85],haz:{lv:-18,col:'#ff6a1a',k:'lava'},night:true,rim:'#2a1a1a',tex:'basalt',grass:['ash',600],far:'#3a1810',farH:520,volcano:true},
 jotunheim:{top:'#0a1a3a',hor:'#8ab0d0',hemi:['#e0eeff','#6a7a8a',.62],sun:['#dfefff',.55],aurora:true,stars:true,rim:'#e8f0f8',tex:'snow',grass:['snowtuft',900],far:'#c8d8e8',farH:700},
 duat:{top:'#060a26',hor:'#3a3a70',hemi:['#9a9ad8','#5a4a3a',.72],sun:['#b0c4ff',.6],haz:{lv:-10,col:'#2f7a90',k:'water'},stars:true,moon:true,rim:'#8a6a4a',tex:'sand',grass:['dry',500],far:'#4a3a5a',farH:300},
 kur:{top:'#6a3a2a',hor:'#e8b080',hemi:['#ffe0b8','#6a4a3a',.68],sun:['#ffc890',.7],haz:{lv:-9,col:'#2f6a8a',k:'water'},disk:'#ffb060',rim:'#7a5636',tex:'clay',grass:['dry',700],far:'#a87850',farH:260},
 lanka:{top:'#2a6a9a',hor:'#c8e8d0',hemi:['#e8f4ff','#2a4a28',.7],sun:['#fff0c0',.75],haz:{lv:-9,col:'#2f7a8a',k:'water'},disk:'#fff0a0',rim:'#2a4a28',tex:'grass',grass:['jungle',2600],far:'#3a6a4a',farH:480},
 yomi:{top:'#020406',hor:'#16261f',hemi:['#6a8a8a','#0a0a0a',.5],sun:['#8ab0c0',.3],night:true,rim:'#1a2418',tex:'moss',grass:['darkgrass',2200],far:'#101a14',farH:520},
 diyu:{top:'#120408',hor:'#501818',hemi:['#aa6a6a','#1a0a0a',.55],sun:['#ff7a5a',.45],night:true,rim:'#2a1a1e',tex:'stone',grass:['redgrass',900],far:'#2a1014',farH:600},
 mictlan:{top:'#1a0a2a',hor:'#7a3a5a',hemi:['#c8a0c8','#2a1a20',.6],sun:['#ffa060',.6],stars:true,rim:'#3a2a30',tex:'clay',grass:['marigold',1800],far:'#3a2440',farH:420,dusk:true},
 xibalba:{top:'#02080a',hor:'#0e2e24',hemi:['#8ac0aa','#08180f',.66],sun:['#a0e0d0',.5],night:true,haz:{lv:-26,col:'#2a9a9a',k:'water'},rim:'#0f2a20',tex:'moss',grass:['jungle',2400],far:'#0a1a14',farH:420},
 ukupacha:{top:'#3a78c8',hor:'#d8ecf8',hemi:['#ffffff','#4a6a3a',.66],sun:['#fff2d0',.75],rim:'#4a6a3a',tex:'grass',grass:['andes',2400],far:'#3a5a3a',farH:900,mist:true,disk:'#fff6d0'},
 orun:{top:'#3a8ad0',hor:'#e0f4c8',hemi:['#fff8e0','#2a4a1a',.7],sun:['#fff0c0',.72],haz:{lv:-10,col:'#3a7ac0',k:'water'},disk:'#fff0a0',rim:'#2a4a1a',tex:'grass',grass:['jungle',2400],far:'#2a5a2a',farH:420},
 annwn:{top:'#2a3a4a',hor:'#90a8b0',hemi:['#d0e0e8','#2a3a2a',.66],sun:['#e0e8f0',.5],haz:{lv:-12,col:'#3a5a6a',k:'water'},rim:'#3a4a3a',tex:'grass',grass:['heath',2000],far:'#4a5a5a',farH:460},
 cielo:{top:'#5a90f0',hor:'#fff6e8',hemi:['#ffffff','#c8c0f0',.62],sun:['#ffe8b0',.6],disk:'#fff6c0',clouds:true,rim:'#ffffff',tex:'cloud',grass:['cloudtuft',900],far:'#f4f0ff',farH:200},
 vacio:{top:'#000000',hor:'#2a1040',hemi:['#9a7ad8','#0a0010',.55],sun:['#b07aff',.5],night:true,stars:true,haz:{lv:-38,col:'#7a2ad0',k:'void'},rim:'#1a1028',tex:'stone',grass:['crystal',500],far:'#1a1030',farH:600}
};

/* ---------- colores del terreno ---------- */
const _c=new THREE.Color();
function terrainColor(rk,x,y,h,sl){
  const r=REALMS[rk],L=LOOK3D[rk],d=Math.hypot(x,y),n=fbm(x/110,y/110,rk.length*3);
  let col=n>.55?r.g1:r.g2;
  if(sl>.85)col=r.det;
  if(d>ARENA-70)col=h>320&&(rk==='jotunheim'||rk==='annwn'||rk==='ukupacha'||rk==='tartaro')?'#f4f8fb':L.rim;
  if(L.haz&&h<L.haz.lv+2)col=L.haz.k==='lava'?'#2a1210':L.haz.k==='void'?'#1a0830':shade(r.g2,-.25);
  switch(rk){
  case'tartaro':if(h>90&&d<340)col=n>.5?'#c9bea6':'#b8ad96';if(L.haz&&h<L.haz.lv+10&&h>=L.haz.lv+2)col='#6a2418';if(d<340&&h>90&&(Math.floor(x/40)+Math.floor(y/40))%2===0)col=shade(col,-.06);break;
  case'jotunheim':if(sl>.85)col='#7a8a96';else if(h<4&&fbm(x/320,y/320,5)<.34)col='#bfe6f8';break;
  case'duat':{for(const[cx,cy,b]of[[-600,-500,300],[-150,-850,240],[250,-1150,170]]){if(Math.max(Math.abs(x-cx),Math.abs(y-cy))<b-4)col=(Math.floor(h/14)%2)?'#e0c488':'#d0b070';}if(Math.max(Math.abs(x-700),Math.abs(y+200))<120)col='#c8a870';break;}
  case'kur':{const pd=Math.max(Math.abs(x),Math.abs(y+260));if(pd<330&&h>36)col=h>145?'#2f4f9e':(Math.floor(h/40)%2?'#a87850':'#c49464');if(h>=58&&h<=62)col='#b0805a';break;}
  case'lanka':if(d<240&&h>48)col=h>88?'#e8b53e':'#c8a04a';break;
  case'yomi':if(Math.abs(x-Math.sin(y/360)*160)<54)col='#6a6a58';if(Math.hypot(x,y+900)<200&&h>100)col='#5a5a4a';break;
  case'diyu':if(d<240&&h>80)col='#7a2420';if(Math.abs(y+900)<40&&h>66)col='#8a7a6a';break;
  case'mictlan':if(Math.abs(x)<80&&y>-1500&&y<1100)col=(Math.floor(y/60)%2)?'#8a7a6a':'#7a6a5a';
    if(Math.max(Math.abs(x-360),Math.abs(y+150))<280&&h>8)col=(Math.floor(h/36)%2)?'#9a8268':'#86705a';if(Math.max(Math.abs(x),Math.abs(y+1350))<200&&h>8)col=(Math.floor(h/32)%2)?'#9a8268':'#86705a';
    if(Math.max(Math.abs(x),Math.abs(y-850))<260&&h>10)col='#8a7460';break;
  case'xibalba':if(Math.max(Math.abs(x),Math.abs(y+300))<222&&h>6)col=(Math.floor(h/16.7)%2)?'#b8b49a':'#a8a488';if(x>500&&x<760&&Math.abs(y-300)<400)col=Math.abs(x-630)<60?'#7a8a6a':'#a8a490';break;
  case'ukupacha':{const rx=x*.92-y*.39,ry=x*.39+y*.92,e=Math.hypot(rx/700,ry/330);if(e<1)col=n>.5?'#6aa04a':'#5a9040';else if(h>-150)col=(Math.floor(h/22)%2)?'#5a8a3a':'#6a6a5a';if(h>300)col=h>520?'#e8eef0':(n>.5?'#4a7a3a':'#3a6a30');break;}
  case'cielo':if(Math.abs(x)<90&&y>-1020&&y<-500)col='#e8b53e';else if(h>30)col=n>.5?'#f4f2ff':'#e4e0fa';else col=n>.5?'#d8e0f6':'#c8d2f0';if(Math.hypot(x,y+1250)<230&&h>160)col='#f4d27a';break;
  case'vacio':if(h>-20)col=n>.5?'#2a2236':'#3a2a5a';break;
  }
  _c.set(col);const j=(hash(Math.round(x),Math.round(y),9)-.5)*.07;_c.offsetHSL(0,0,j);return _c;
}
const GEO={cyl:(a,b,h,s=8)=>new THREE.CylinderGeometry(a,b,h,s),box:(w,h,d)=>new THREE.BoxGeometry(w,h,d),cone:(r,h,s=8)=>new THREE.ConeGeometry(r,h,s),ico:(r,d=0)=>new THREE.IcosahedronGeometry(r,d),dod:r=>new THREE.DodecahedronGeometry(r,0),sph:(r,w=8,h=6)=>new THREE.SphereGeometry(r,w,h),oct:r=>new THREE.OctahedronGeometry(r,0),tor:(r,t,arc)=>new THREE.TorusGeometry(r,t,6,14,arc||Math.PI*2)};
const MATC={};
function ML(c,o){const k='L'+c+JSON.stringify(o||{});return MATC[k]||(MATC[k]=new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{})));}
function MB(c,o){const k='B'+c+JSON.stringify(o||{});return MATC[k]||(MATC[k]=new THREE.MeshBasicMaterial(Object.assign({color:c},o||{})));}
let PK=null;
function propKinds(){if(PK)return PK;const g=GEO;PK={
 column:{c:10,h:66,p:[[g.cyl(6,7,64,8),ML('#d9cfb8'),0,32,0],[g.box(18,5,18),ML('#cfc4ab'),0,66,0],[g.box(16,4,16),ML('#cfc4ab'),0,2,0]]},
 brokencol:{c:9,h:26,p:[[g.cyl(6,7,26,8),ML('#bdb3a0'),0,13,0],[g.cyl(6,6,22,8),ML('#bdb3a0'),18,6,4,0,.3,1.57]]},
 rock:{c:8,h:20,p:[[g.dod(14),ML('#4a3a36'),0,6,0]]},
 rockgrey:{c:8,h:20,p:[[g.dod(14),ML('#7a8a96'),0,6,0],[g.dod(8),ML('#f4f8fb'),3,14,0]]},
 rocksand:{c:8,h:18,p:[[g.dod(13),ML('#b08848'),0,5,0]]},
 rockmoss:{c:8,h:18,p:[[g.dod(13),ML('#5a6a4a'),0,5,0],[g.dod(7),ML('#3f8a3a'),2,12,0]]},
 rockpurple:{c:8,h:18,p:[[g.dod(13),ML('#3a2f46'),0,5,0]]},
 rocksalt:{c:0,h:12,p:[[g.dod(10),ML('#d8d0c0'),0,3,0]]},
 chainpost:{c:0,h:60,p:[[g.box(6,60,6),ML('#3a3030'),0,30,0],[g.tor(5,1.4),ML('#7a7070'),0,58,4],[g.tor(5,1.4),ML('#7a7070'),0,50,4,0,1.57,0],[g.tor(5,1.4),ML('#7a7070'),0,42,4]]},
 pine:{c:4,h:56,p:[[g.cyl(3,4,14,6),ML('#5a3a2a'),0,7,0],[g.cone(17,42,7),ML('#2f5a4a'),0,34,0],[g.cone(10,18,7),ML('#f4f8fb'),0,50,0]]},
 runestone:{c:5,h:28,p:[[g.box(11,28,6),ML('#7a8a96'),0,14,0],[g.box(2,14,1),MB('#7de0ff'),0,15,3.2],[g.box(8,2,1),MB('#7de0ff'),0,18,3.2]]},
 icecrystal:{c:0,h:34,p:[[g.cone(7,34,5),ML('#bfefff',{transparent:true,opacity:.85}),0,17,0],[g.cone(4,20,5),ML('#dff8ff'),6,10,3]]},
 rootarch:{c:0,h:0,p:[[g.tor(70,9,Math.PI),ML('#6a4a32'),0,0,0]]},
 obelisk:{c:6,h:76,p:[[g.cyl(4,7,72,4),ML('#d8b878'),0,36,0],[g.cone(4.5,8,4),MB(C.gold),0,76,0],[g.box(14,4,14),ML('#a87a3c'),0,2,0]]},
 palm:{c:3,h:50,p:[[g.cyl(2,3.2,48,6),ML('#7a5a3a'),0,24,0],[g.box(30,2,6),ML('#3a8a3a'),0,48,0,0,0,.25],[g.box(30,2,6),ML('#3a7a3a'),0,48,0,0,1.57,.25],[g.box(30,2,6),ML('#2f6a2f'),0,48,0,0,.78,-.2],[g.box(30,2,6),ML('#3a8a3a'),0,48,0,0,2.35,-.2]]},
 reeds:{c:0,h:0,p:[[g.box(2,18,2),ML('#8a8a4a'),0,9,0],[g.box(2,22,2),ML('#7a8a3a'),4,11,2],[g.box(2,16,2),ML('#8a8a4a'),-3,8,3]]},
 capstone:{c:0,h:0,p:[[g.cone(22,26,4),MB(C.gold),0,13,0]]},
 zigshrine:{c:24,h:40,p:[[g.box(60,26,60),ML('#2f4f9e'),0,13,0],[g.box(66,4,66),MB(C.gold),0,28,0],[g.box(20,24,4),MB(C.gold),0,12,31]]},
 tablets:{c:0,h:0,p:[[g.box(10,3,7),ML('#d9b88a'),0,1.5,0],[g.box(9,3,6),ML('#c9a87a'),1,4.5,0,0,.4,0]]},
 jtree:{c:4,h:60,p:[[g.cyl(3,4,30,6),ML('#5a4a2a'),0,15,0],[g.ico(20),ML('#2f6a2a'),0,38,0],[g.ico(14),ML('#3f8a3a'),4,50,2]]},
 jtreedark:{c:4,h:60,p:[[g.cyl(3,4,30,6),ML('#3a2a1a'),0,15,0],[g.ico(20),ML('#1f4a2a'),0,38,0],[g.ico(14),ML('#2a5a3a'),4,50,2]]},
 stupa:{c:16,h:44,p:[[g.box(30,10,30),ML('#c8a04a'),0,5,0],[g.sph(14,10,6),MB(C.gold),0,14,0],[g.cone(3,16,6),MB(C.gold),0,32,0]]},
 lotus:{c:0,h:0,p:[[g.cone(6,6,6),ML('#e27aa8'),0,3,0],[g.cyl(9,9,1,8),ML('#3a8a3a'),0,0,0]]},
 torii:{c:5,h:52,p:[[g.cyl(2.6,2.6,48,6),ML('#d83a2a'),-17,24,0],[g.cyl(2.6,2.6,48,6),ML('#d83a2a'),17,24,0],[g.box(50,4,5),ML('#d83a2a'),0,48,0],[g.box(58,3,6),ML('#1c1210'),0,51.5,0],[g.box(38,3,3),ML('#d83a2a'),0,40,0]]},
 toro:{c:4,h:28,p:[[g.box(7,16,7),ML('#8a8a7a'),0,8,0],[g.box(12,7,12),ML('#7a7a6a'),0,19,0],[g.box(6,5,6),MB('#f2c26a'),0,19,0],[g.cone(11,6,4),ML('#6a6a5a'),0,26,0,0,.78,0]]},
 bamboo:{c:0,h:70,p:[[g.cyl(1.6,1.6,70,5),ML('#5a8a3a'),0,35,0],[g.cyl(1.6,1.6,62,5),ML('#6a9a4a'),5,31,3],[g.cyl(1.6,1.6,74,5),ML('#4a7a2a'),-4,37,4],[g.cyl(1.6,1.6,58,5),ML('#5a8a3a'),2,29,-5]]},
 shrine:{c:30,h:40,p:[[g.box(56,30,40),ML('#6a4a3a'),0,15,0],[g.box(70,6,54),ML('#2a2a2a'),0,32,0],[g.box(50,8,36),ML('#2a2a2a'),0,38,0]]},
 redlantern:{c:0,h:42,p:[[g.cyl(1,1,40,4),ML('#1c1210'),0,20,0],[g.cyl(5,5,11,8),MB('#ff4a2a'),0,36,0],[g.box(12,1.5,12),MB(C.gold),0,42,0]]},
 plumtree:{c:3,h:40,p:[[g.cyl(2.5,3.5,24,6),ML('#3a2020'),0,12,0],[g.ico(15),ML('#f2a8c8'),0,30,0],[g.ico(9),ML('#f8c8d8'),6,36,3]]},
 pagoda:{c:40,h:90,p:[[g.box(60,20,60),ML('#6a2020'),0,10,0],[g.box(84,4,84),ML('#2a2a2a'),0,22,0],[g.box(46,18,46),ML('#6a2020'),0,33,0],[g.box(66,4,66),ML('#2a2a2a'),0,44,0],[g.box(32,16,32),ML('#6a2020'),0,54,0],[g.box(50,4,50),ML('#2a2a2a'),0,64,0],[g.cone(4,16,6),MB(C.gold),0,74,0]]},
 marigold:{c:0,h:0,p:[[g.sph(3,6,4),MB('#f2a22c'),0,2,0],[g.sph(3,6,4),MB('#f8c040'),5,2,3],[g.sph(3,6,4),MB('#f2a22c'),-4,2,4],[g.sph(2.5,6,4),MB('#f8c040'),2,2,-4]]},
 skullpile:{c:0,h:0,p:[[g.sph(4,6,5),ML('#e8e0cc'),0,3,0],[g.sph(4,6,5),ML('#e8e0cc'),7,3,0],[g.sph(4,6,5),ML('#e8e0cc'),3.5,9,0]]},
 candle:{c:0,h:0,p:[[g.cyl(1.6,1.6,9,6),ML('#f2e3c6'),0,4.5,0],[g.cone(1.4,4,5),MB('#f8d060'),0,11,0],[g.cyl(1.6,1.6,6,6),ML('#f2e3c6'),5,3,2],[g.cone(1.4,4,5),MB('#f8d060'),5,8,2]]},
 obsidian:{c:0,h:16,p:[[g.cone(4,16,4),ML('#1a1420'),0,8,0],[g.cone(3,10,4),ML('#2a2236'),5,5,2]]},
 stele:{c:5,h:36,p:[[g.box(13,36,6),ML('#7a8a7a'),0,18,0],[g.box(9,7,1),ML('#5a6a5a'),0,26,3.2],[g.box(9,7,1),ML('#5a6a5a'),0,15,3.2]]},
 fern:{c:0,h:0,p:[[g.cone(8,4,5),ML('#2f6a3a'),0,4,0,0,0,.4],[g.cone(8,4,5),ML('#3a7a3a'),4,4,2,0,1.5,.4],[g.cone(8,4,5),ML('#2a5a2a'),-3,4,3,0,3,.4]]},
 ballring:{c:0,h:0,p:[[g.tor(9,2.4),ML('#8a8a7a'),0,0,0,0,1.57,0]]},
 apacheta:{c:6,h:24,p:[[g.dod(10),ML('#8a7a6a'),0,6,0],[g.dod(7),ML('#9a8a7a'),0,15,0],[g.dod(4.5),ML('#aa9a8a'),0,22,0]]},
 ichu:{c:0,h:0,p:[[g.cone(2.5,12,4),ML('#c8a84a'),0,6,0],[g.cone(2.5,10,4),ML('#d8b85a'),3,5,2],[g.cone(2.5,11,4),ML('#b8983a'),-2,5,3]]},
 tree:{c:4,h:60,p:[[g.cyl(4,5,34,6),ML('#5a3a22'),0,17,0],[g.ico(22),ML('#3a6a2a'),0,44,0],[g.ico(15),ML('#4a7a32'),6,56,3]]},
 bigtree:{c:40,h:200,p:[[g.cyl(18,28,130,8),ML('#5a3a22'),0,65,0],[g.ico(85,1),ML('#2a4a1a'),0,160,0],[g.ico(60,1),ML('#3a6a2a'),20,205,10]]},
 pot:{c:0,h:0,p:[[g.cyl(5,7,10,8),ML('#8a4a2a'),0,5,0],[g.sph(1.5,5,4),ML('#f2e3c6'),2,10,2],[g.sph(1.5,5,4),ML('#f2e3c6'),-2,10,1]]},
 flowers:{c:0,h:0,p:[[g.sph(2,5,4),MB('#e8c23a'),0,2,0],[g.sph(2,5,4),MB('#d23a5a'),4,2,2],[g.sph(2,5,4),MB('#e27aa8'),-3,2,3]]},
 menhir:{c:5,h:40,p:[[g.box(11,40,8),ML('#7a8088'),0,20,0,.05,0,.06],[g.box(3,3,1),MB('#9ad0e8'),0,26,4.2]]},
 heather:{c:0,h:0,p:[[g.sph(3,6,4),ML('#8a6a9a'),0,2,0],[g.sph(3,6,4),ML('#9a7aaa'),5,2,2],[g.sph(3,6,4),ML('#7a5a8a'),-4,2,3]]},
 deadtree:{c:3,h:50,p:[[g.cyl(2.5,4,44,5),ML('#4a3a32'),0,22,0],[g.box(22,2,2),ML('#4a3a32'),6,36,0,0,0,.5],[g.box(18,2,2),ML('#4a3a32'),-5,30,0,0,0,-.6]]},
 cloud:{c:0,h:0,p:[[g.ico(16,1),ML('#ffffff'),0,6,0],[g.ico(12,1),ML('#f4f4ff'),14,4,4],[g.ico(11,1),ML('#ffffff'),-12,3,6]]},
 goldpillar:{c:6,h:76,p:[[g.cyl(5,5,72,10),ML('#f4e8c0'),0,36,0],[g.box(16,5,16),MB(C.gold),0,74,0],[g.box(14,4,14),MB(C.gold),0,2,0]]},
 gate:{c:0,h:0,p:[[g.box(14,120,14),MB(C.gold),-70,60,0],[g.box(14,120,14),MB(C.gold),70,60,0],[g.tor(70,7,Math.PI),MB('#f8e080'),0,120,0],[g.box(4,110,2),MB('#f8e8a0'),-30,55,0],[g.box(4,110,2),MB('#f8e8a0'),0,55,0],[g.box(4,110,2),MB('#f8e8a0'),30,55,0]]},
 throne:{c:30,h:60,p:[[g.box(50,20,40),MB(C.gold),0,10,0],[g.box(50,70,10),MB('#f8e080'),0,45,-18],[g.sph(10,8,6),MB('#ffffff'),0,85,-18]]},
 crystal:{c:6,h:30,p:[[g.oct(11),MB('#b07aff'),0,14,0],[g.oct(6),MB('#e27aa8'),9,8,4]]},
 floatrock:{c:0,h:0,p:[[g.dod(22),ML('#3a2a5a'),0,90,0],[g.cone(14,30,5),ML('#2a2236'),0,68,0,Math.PI,0,0]]}
};return PK;}

function MLT(c,tex,o){const k='T'+c+tex+JSON.stringify(o||{});return MATC[k]||(MATC[k]=new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true,map:TEX(tex)},o||{})));}

/* ---------- texturas pixel ---------- */
const TEXS={};
function TEX(name){if(TEXS[name])return TEXS[name];const N=64,c=mkCanvas(N,N),g=c.getContext('2d'),rnd=srand(name.length*131+7);
  const px=(x,y,v)=>{g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(x,y,1,1);};
  g.fillStyle='#e6e6e6';g.fillRect(0,0,N,N);
  switch(name){
  case'grass':case'moss':for(let i=0;i<900;i++){const x=rnd()*N|0,y=rnd()*N|0,v=200+rnd()*55|0;px(x,y,v);if(rnd()<.4)px(x,(y+1)%N,v-30);}
    for(let i=0;i<40;i++){const x=rnd()*N|0,y=rnd()*N|0;px(x,y,255);}break;
  case'snow':for(let i=0;i<500;i++){px(rnd()*N|0,rnd()*N|0,225+rnd()*30|0);}for(let i=0;i<30;i++)px(rnd()*N|0,rnd()*N|0,255);break;
  case'sand':for(let y=0;y<N;y++)for(let x=0;x<N;x++){const v=225+Math.sin((x+y*.4)/3)*14+rnd()*12;px(x,y,v|0);}break;
  case'clay':case'stone':case'basalt':{g.fillStyle=name==='basalt'?'#c8c8c8':'#dcdcdc';g.fillRect(0,0,N,N);const s=name==='clay'?16:name==='stone'?16:12;
    for(let y=0;y<N;y+=s/2){const off=(y/(s/2))%2?s/2:0;for(let x=-s;x<N;x+=s){g.fillStyle=`rgb(${200+rnd()*50|0},${200+rnd()*50|0},${200+rnd()*50|0})`;g.fillRect(x+off+1,y+1,s-2,s/2-2);}}
    for(let i=0;i<300;i++)px(rnd()*N|0,rnd()*N|0,170+rnd()*40|0);break;}
  case'cloud':for(let i=0;i<300;i++){const x=rnd()*N,y=rnd()*N,r=2+rnd()*4;g.fillStyle=`rgba(255,255,255,${.4+rnd()*.5})`;g.beginPath();g.arc(x,y,r,0,7);g.fill();}break;
  case'wall':{g.fillStyle='#9a9a9a';g.fillRect(0,0,N,N);for(let y=0;y<N;y+=10){for(let x=-(y%20?8:0);x<N;x+=16+rnd()*6|0){const w=12+rnd()*8|0;g.fillStyle=`rgb(${190+rnd()*50|0},${190+rnd()*45|0},${180+rnd()*40|0})`;g.fillRect(x+1,y+1,w,8);}}break;}
  case'thatch':for(let y=0;y<N;y++)for(let x=0;x<N;x++){const v=(x*7+((y/3)|0)*13)%9<2?160:205+rnd()*40;px(x,y,v|0);}break;
  case'leaf':for(let i=0;i<500;i++){const x=rnd()*N|0,y=rnd()*N|0,v=150+rnd()*105|0;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(x,y,2,2);}break;
  case'bark':for(let y=0;y<N;y++)for(let x=0;x<N;x++){px(x,y,(x%6<2?170:215)+rnd()*25|0);}break;
  case'gold':for(let i=0;i<400;i++)px(rnd()*N|0,rnd()*N|0,200+rnd()*55|0);break;
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=4;TEXS[name]=t;return t;}

/* ---------- césped y flores instanciados ---------- */
const GRASS={
 ash:[['#5a4a46','#3a2e2c','#ff8a3a'],['#4a3a36','#ff6a1a','#ffb060']],snowtuft:[['#e8f4ff','#b8d0e8','#ffffff'],['#9fd0ff','#ffffff','#e0f0ff']],dry:[['#c8a84a','#a88a3a','#e8d07a'],['#8a7a3a','#d8b85a','#f0e090']],
 jungle:[['#3f8a3a','#2f6a2a','#6aba4a'],['#e27aa8','#f8e060','#ffffff']],darkgrass:[['#2f4a2a','#1f3a1f','#4a6a3a'],['#5ab0ff','#9ad0ff','#2a4a6a']],redgrass:[['#5a2a2a','#3a1a1a','#7a3a3a'],['#e23a2a','#ff6a4a','#ffb0a0']],
 marigold:[['#4a6a3a','#3a5a2a','#6a8a4a'],['#f2a22c','#f8c040','#ffe080']],andes:[['#c8a84a','#a88a3a','#6a9a4a'],['#f8e060','#e27aa8','#ffffff']],heath:[['#4a6a3a','#3a5a2a','#6a7a4a'],['#8a6a9a','#b08ac8','#d0b0e0']],
 cloudtuft:[['#ffffff','#e8ecff','#ffffff'],['#f4d27a','#ffffff','#fff6c0']],crystal:[['#3a2a5a','#2a1a40','#5a3a8a'],['#b07aff','#e27aa8','#ffffff']]};
function grassTex(type,kind){const k='g'+type+kind;if(TEXS[k])return TEXS[k];const c=mkCanvas(32,32),g=c.getContext('2d'),[a,b2,hl]=GRASS[type][kind],rnd=srand(type.length*17+kind*5);
  const P=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1);};
  if(kind===0){for(let i=0;i<14;i++){const bx=3+rnd()*26|0,h=8+rnd()*18|0,lean=(rnd()-.5)*.6;for(let j=0;j<h;j++){const x=Math.round(bx+lean*j);P(x,31-j,j>h-3?hl:j%3?a:b2);if(j<h*.4)P(x+1,31-j,b2);}}}
  else{for(let i=0;i<6;i++){const bx=6+rnd()*20|0,h=8+rnd()*12|0;for(let j=0;j<h;j++)P(bx,31-j,GRASS[type][0][1]);const fy=31-h;g.fillStyle=a;g.fillRect(bx-2,fy-1,5,3);g.fillRect(bx-1,fy-2,3,5);P(bx,fy,b2);P(bx-1,fy-1,hl);}}
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;TEXS[k]=t;return t;}
function crossGeo(w,h){const g=new THREE.BufferGeometry();const p=[],uv=[],idx=[];const add=(ax,az,bx,bz)=>{const o=p.length/3;p.push(ax,0,az,bx,0,bz,ax,h,az,bx,h,bz);uv.push(0,0,1,0,0,1,1,1);idx.push(o,o+1,o+2,o+1,o+3,o+2);};
  add(-w/2,0,w/2,0);add(0,-w/2,0,w/2);g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const n=g.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,0,1,0);return g;}

/* ---------- reparto de decorados ---------- */
const AK={
 tree1:['tree_single_A',80,.12,'tree'],tree2:['tree_single_B',84,.12,'tree'],treesL:['trees_A_large',95,.22,'tree'],treesM:['trees_A_medium',100,.2,'tree'],treesBL:['trees_B_large',105,.22,'tree'],treesBM:['trees_B_medium',98,.2,'tree'],
 rockA:['rock_single_A',14,.4,'rock'],rockB:['rock_single_B',22,.4,'rock'],rockC:['rock_single_C',30,.4,'rock'],rockD:['rock_single_D',26,.4,'rock'],rockE:['rock_single_E',34,.4,'rock'],stones:['resource_stone',26,.35,'rock'],
 deadL:['tree_dead_large',120,.07,'deadtree'],deadM:['tree_dead_medium',100,.07,'deadtree'],deadS:['tree_dead_small',70,.08,'deadtree'],pineO:['tree_pine_orange_large',130,.1,'pine'],pineY:['tree_pine_yellow_large',130,.1,'pine'],pineOM:['tree_pine_orange_medium',105,.1,'pine'],
 grave:['grave_A',20,.4,'rock'],graveB:['grave_B',20,.4,'rock'],gstone:['gravestone',20,.3,'menhir'],gmark:['gravemarker_A',16,0,'menhir'],crypt:['crypt',95,.42,'shrine'],
 lantern:['lantern_standing',20,0,'toro'],postlan:['post_lantern',52,0,'redlantern'],postskull:['post_skull',52,0,'skullpile'],skull:['skull',11,0,'skullpile'],skullc:['skull_candle',14,0,'candle'],bone:['bone_A',7,0,'skullpile'],rib:['ribcage',16,0,'skullpile'],
 arch:['arch',80,0,'torii'],fence:['fence',22,0,'rock'],shrinec:['shrine_candles',30,.3,'candle'],candles:['candle_triple',13,0,'candle'],coffin:['coffin_decorated',14,.3,'rock'],pumpkin:['pumpkin_orange',12,0,'pot'],
 column:['column',48,.35,'column'],pillar:['pillar',100,.32,'column'],pillarD:['pillar_decorated',105,.28,'column'],torch:['torch_lit',34,0,'candle'],bannerR:['banner_patternA_red',62,0,'column'],bannerT:['banner_thin_yellow',62,0,'column'],
 rubble:['rubble_large',55,.38,'rock'],rubbleH:['rubble_half',45,.38,'rock'],barrel:['barrel_large',22,.4,'pot'],crates:['crates_stacked',30,.4,'rock'],coins:['coin_stack_large',12,0,'pot'],swords:['sword_shield_gold',26,0,'rock'],
 cloudB:['cloud_big',80,0,'cloud'],cloudS:['cloud_small',60,0,'cloud'],lily:['waterlily_A',8,0,'lotus'],wplant:['waterplant_A',14,0,'reeds'],wplant2:['waterplant_B',18,0,'reeds'],tent:['tent',60,.4,'shrine']};
const REALM_PROPS={
 tartaro:[['brokencol',40],['A:rockC',60,0,'#8a6a60'],['A:rockE',40,0,'#7a5a50'],['chainpost',26],['A:pillar',16,0,'#e0c8b0'],['A:column',30,0,'#e0c8b0'],['A:rubble',16,0,'#d0b8a0'],['A:rubbleH',14,0,'#d0b8a0'],['A:deadL',22,0,'#5a4040'],['A:deadM',22,0,'#5a4040'],['A:skull',30],['A:rib',14],['A:torch',30],['obsidian',40]],
 jotunheim:[['A:pineO',60,0,'#a8d8c8'],['A:pineOM',50,0,'#98c8b8'],['pine',70],['A:rockC',40,0,'#c8d8e8'],['A:rockE',30,0,'#c8d8e8'],['icecrystal',50],['runestone',20],['A:deadM',20,0,'#8a9aa8']],
 duat:[['palm',70],['A:rockC',30,0,'#f0d0a0'],['A:rockE',25,0,'#f0d0a0'],['A:stones',14,0,'#f0d8a8'],['reeds',60,'wet'],['A:wplant',40,'wet'],['obelisk',16],['A:pillar',10,0,'#f0d8a8']],
 kur:[['reeds',80,'wet'],['palm',50],['A:rockC',25,0,'#d8b090'],['tablets',60],['A:barrel',12],['A:crates',8],['A:bannerT',10],['A:torch',24]],
 lanka:[['A:treesL',40],['A:treesBL',30],['A:tree1',60],['A:tree2',60],['palm',50],['lotus',50,'wet'],['A:lily',60,'wet'],['A:rockD',30],['stupa',10]],
 yomi:[['bamboo',80],['toro',40],['A:lantern',40],['A:gstone',30],['A:gmark',24],['A:deadL',24,0,'#6a7a6a'],['A:treesBM',30,0,'#5a7a60'],['A:rockC',30,0,'#7a8a7a']],
 diyu:[['redlantern',50],['A:postlan',30],['plumtree',70],['A:rockC',40,0,'#a07070'],['A:coffin',10],['A:skullc',30],['A:bannerR',14]],
 mictlan:[['skullpile',30],['A:skull',40],['A:skullc',50],['A:candles',60],['candle',40],['A:grave',20],['A:gstone',20],['A:shrinec',12],['A:pumpkin',24],['obsidian',30],['nopal',60],['agave',60]],
 xibalba:[['A:treesBL',40,0,'#6a9a6a'],['A:treesL',40,0,'#6a9a6a'],['A:tree2',60,0,'#7aa07a'],['jtreedark',60],['fern',120],['stele',36],['A:postskull',16],['A:rockC',40,0,'#8a9a8a']],
 ukupacha:[['incahouse',0],['apacheta',20],['A:rockC',40,0,'#c8c0b0'],['A:rockE',30,0,'#c8c0b0'],['A:stones',20,0,'#d0c8b8'],['qeuña',50],['A:tree1',20],['agave',30]],
 orun:[['A:treesL',50],['A:treesM',40],['A:tree1',70],['A:tree2',70],['A:rockD',40],['A:wplant2',40,'wet'],['A:lily',40,'wet'],['pot',40]],
 annwn:[['menhir',40],['A:pineY',40],['A:pineOM',40],['A:deadM',40],['A:rockC',40,0,'#a8b0b8'],['A:gstone',20],['A:fence',14],['A:tree2',30]],
 cielo:[['A:cloudB',50],['A:cloudS',60],['cloud',60],['A:pillarD',20,0,'#fff8e0'],['A:column',24,0,'#ffffff'],['goldpillar',20]],
 vacio:[['crystal',90],['floatrock',60],['A:pillar',20,0,'#7a5a9a'],['A:rubble',14,0,'#6a5a8a'],['A:deadL',20,0,'#8a6ab0'],['torii',6],['obelisk',8]]
};
function extraKinds(){const g=GEO,K=propKinds();if(K.incahouse)return K;
  Object.assign(K,{
   incahouse:{c:24,h:40,p:[[g.box(44,22,32),MLT('#b8b0a0','wall'),0,11,0],[g.cone(34,26,4),MLT('#c8a050','thatch'),0,35,0,0,.785,0]]},
   incawall:{c:0,h:0,p:[[g.box(60,16,10),MLT('#b0a898','wall'),0,8,0]]},
   suntemple:{c:40,h:50,p:[[g.cyl(40,44,40,12),MLT('#c0b8a8','wall'),0,20,0],[g.cyl(44,46,6,12),MLT('#a8a090','wall'),0,2,0]]},
   intihuatana:{c:10,h:30,p:[[g.box(30,14,30),MLT('#a8a090','wall'),0,7,0],[g.box(12,20,8),MLT('#c0b8a8','wall'),0,24,0,0,.3,0]]},
   'qeuña':{c:4,h:44,p:[[g.cyl(2.5,3.5,26,6),MLT('#7a4a32','bark'),0,13,0],[g.ico(14),MLT('#4a7a3a','leaf'),0,32,0],[g.ico(10),MLT('#5a8a42','leaf'),5,40,3]]},
   agave:{c:0,h:0,p:[[g.cone(3,18,4),ML('#5a8a6a'),0,8,0,0,0,.5],[g.cone(3,18,4),ML('#4a7a5a'),0,8,0,0,1.57,.5],[g.cone(3,18,4),ML('#5a8a6a'),0,8,0,0,3.14,.5],[g.cone(3,18,4),ML('#6a9a7a'),0,8,0,0,4.7,.5]]},
   nopal:{c:0,h:0,p:[[g.box(10,14,3),ML('#4a8a4a'),0,7,0],[g.box(8,10,3),ML('#5a9a5a'),6,16,0,0,0,.4],[g.box(8,10,3),ML('#4a8a4a'),-5,15,0,0,0,-.4]]},
   bigstatue:{c:30,h:120,p:[[g.box(40,10,40),MLT('#8a7a6a','wall'),0,5,0],[g.box(26,50,18),ML('#6a5a50'),0,40,0],[g.box(18,18,16),ML('#6a5a50'),0,74,0],[g.box(8,40,8),ML('#5a4a40'),-18,60,0,0,0,.5],[g.box(8,40,8),ML('#5a4a40'),18,60,0,0,0,-.5]]}
  });
  const tr=(leaf,bark,h,r)=>({c:4,h:h+r,p:[[g.cyl(r*.17,r*.25,h,6),ML(bark),0,h/2,0],[g.box(r*.12,r*.12,r*.9),ML(bark),r*.25,h*.7,0,0,.6,.5],
     [g.ico(r,1),ML(leaf),0,h+r*.5,0],[g.ico(r*.75,1),ML(shade(leaf,.12)),r*.55,h+r*.95,r*.25],[g.ico(r*.7,1),ML(shade(leaf,-.12)),-r*.6,h+r*.35,-r*.2],[g.ico(r*.6,1),ML(shade(leaf,.2)),r*.1,h+r*1.25,-r*.45],[g.ico(r*.5,0),ML(shade(leaf,-.05)),-r*.3,h-r*.05,r*.6]]});
  K.tree=tr('#3a6a2a','#5a3a22',30,20);K.jtree=tr('#2f6a2a','#5a4a2a',26,19);K.jtreedark=tr('#1f4a2a','#3a2a1a',26,19);K.plumtree=tr('#f2a8c8','#3a2020',20,14);
  K.pine={c:4,h:64,p:[[g.cyl(2.6,3.6,18,6),ML('#5a3a2a'),0,9,0],[g.cone(19,26,8),ML('#2f5a4a'),0,24,0],[g.cone(15,22,8),ML('#3a6a54'),0,37,0],[g.cone(10,18,8),ML('#467a60'),0,49,0],[g.cone(6,8,8),ML('#f4f8fb'),0,58,0]]};
  K.rock={c:9,h:20,p:[[g.dod(14),ML('#4a3a36'),0,6,0],[g.dod(8),ML('#5a4a44'),10,3,4],[g.dod(6),ML('#3a2e2a'),-8,2,-6]]};
  K.rockgrey={c:9,h:22,p:[[g.dod(14),ML('#7a8a96'),0,6,0],[g.dod(9),ML('#8a98a2'),10,3,5],[g.dod(8),ML('#f4f8fb'),3,14,0],[g.dod(5),ML('#6a7a86'),-9,2,-4]]};
  K.rockmoss={c:9,h:20,p:[[g.dod(13),ML('#5a6a4a'),0,5,0],[g.dod(7),ML('#3f8a3a'),2,12,0],[g.dod(7),ML('#6a7a5a'),-9,2,5]]};
  for(const k of['pine','jtree','jtreedark','tree','plumtree','bigtree']){const p=K[k].p;for(const part of p){const m=part[1];if(m.color&&part[0].type==='IcosahedronGeometry'){part[1]=MLT('#'+m.color.getHexString(),'leaf');}if(part[0].type==='CylinderGeometry'&&(k!=='bamboo'))part[1]=MLT('#'+m.color.getHexString(),'bark');}}
  for(const k of['column','brokencol']){for(const part of K[k].p)part[1]=MLT('#'+part[1].color.getHexString(),'stone');}
  return K;}

/* ---------- estructuras únicas ---------- */
function structures(rk,grp,coll){
  const g=GEO;const put=(geo,mat,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;m.receiveShadow=true;grp.add(m);return m;};
  const G0=(x,y)=>groundAt(x*WS,y*WS)/WS;
  const prism=(w,h,d)=>{const geo=new THREE.CylinderGeometry(h,h,d,3,1);geo.rotateX(Math.PI/2);geo.rotateZ(Math.PI/2);geo.scale(w/(h*1.732),1,1);return geo;};
  switch(rk){
  case'tartaro':{const y0=96,st=MLT('#cfc4ab','stone'),st2=MLT('#b9ae98','stone');
    put(g.box(300,8,200),st2,0,y0+4,-40);put(g.box(280,8,180),st,0,y0+12,-40);
    for(let i=0;i<8;i++)for(const zz of[-120,40]){if(i===5&&zz===40)continue;put(g.cyl(8,9,90,10),st,-126+i*36,y0+61,zz);}
    for(const xx of[-126,126])for(let i=1;i<4;i++)put(g.cyl(8,9,90,10),st,xx,y0+61,-120+i*40);
    put(g.box(290,12,190),st2,0,y0+112,-40);put(prism(290,30,10),st,0,y0+133,55);put(prism(290,30,10),st,0,y0+133,-135);put(g.box(296,4,200),MLT('#a85a3a','stone'),0,y0+120,-40);
    put(g.box(60,30,12),st2,-150,y0+5,140,0,.3,.2);put(g.cyl(8,9,40,10),st,-60,y0+8,120,1.57,.4,0);
    for(const[x,z]of[[-40,650],[40,650]]){put(g.box(26,140,26),MLT('#8a5a2a','gold'),x,70,z);}put(g.tor(42,7,Math.PI),MLT('#c98a3a','gold'),0,140,650);for(let i=-2;i<=2;i++)put(g.box(3,120,3),ML('#6a4a2a'),i*14,60,650);
    for(const[x,z,r]of[[900,-600,0],[-950,450,2],[-600,-1000,4],[760,900,1]]){const gy=G0(x,z);put(g.box(50,14,40),MLT('#4a3a36','stone'),x,gy+7,z);const s=put(g.box(36,46,24),ML('#6a5a50'),x,gy+38,z);s.rotation.y=r;put(g.box(24,22,20),ML('#6a5a50'),x,gy+72,z);
      for(let k=0;k<14;k++){const m=put(g.tor(9,2.6),ML('#8a8080',{flatShading:true}),x+(k%2?3:-3),gy+90+k*16,z);m.rotation.y=k%2?1.57:0;}coll.push({x,y:z,r:34,top:gy+90});}
    break;}
  case'duat':{const sx=150,sz=-250,gy=G0(sx,sz),sd=MLT('#d8b878','sand');put(g.box(60,30,140),sd,sx,gy+15,sz);put(g.box(46,46,40),sd,sx,gy+50,sz-60);put(g.box(30,10,30),ML('#2f4f9e'),sx,gy+70,sz-60);put(g.box(14,22,60),sd,sx-24,gy+10,sz+80);put(g.box(14,22,60),sd,sx+24,gy+10,sz+80);coll.push({x:sx,y:sz,r:70,top:gy+60});
    for(const[cx,cy,b,hh]of[[-600,-500,300,250],[-150,-850,240,200],[250,-1150,170,140]])put(g.cone(14,24,4),MLT(C.gold,'gold'),cx,hh+10,cy,0,.785,0);
    for(let i=0;i<6;i++){for(const xx of[640,760]){put(g.cyl(10,11,70,10),MLT('#d8c088','stone'),xx,G0(xx,-280+i*32)+35,-280+i*32);}}put(g.box(60,90,30),MLT('#d0b070','stone'),620,G0(620,-90)+45,-90);put(g.box(60,90,30),MLT('#d0b070','stone'),780,G0(780,-90)+45,-90);
    break;}
  case'kur':{put(g.box(70,30,70),ML('#2f4f9e'),0,165,-260);put(g.box(76,5,76),MLT(C.gold,'gold'),0,182,-260);for(const[x,z]of[[0,-820],[0,980],[-880,80],[880,80]]){const gy=G0(x,z);put(g.box(x?40:140,90,x?140:40),MLT('#2f4f9e','wall'),x,gy+45,z);put(g.box(x?44:60,40,x?60:44),MLT('#e8b53e','gold'),x,gy+70,z);}break;}
  case'mictlan':{const tc=MLT('#a8906a','stone'),red=ML('#8a2a20');
    put(g.box(80,30,80),tc,360,195,-150);put(g.box(84,6,84),red,360,213,-150);put(g.box(60,26,60),tc,0,143,-1350);put(g.box(64,5,64),red,0,158,-1350);put(g.box(50,20,50),tc,0,70,850);
    for(let i=0;i<10;i++){const y=-1000+i*200;for(const xx of[-110,110]){const gy=G0(xx,y);put(g.box(46,20,60),tc,xx,gy+10,y);put(g.box(50,4,64),red,xx,gy+22,y);}}
    for(const[x,z]of[[-60,820],[60,820],[-60,880],[60,880]]){put(g.box(14,16,22),MLT('#c8c0a0','stone'),x,G0(x,z)+8,z);}
    break;}
  case'xibalba':{const st=MLT('#b8b49a','stone');put(g.box(80,40,80),st,0,170,-300);put(g.box(86,6,86),ML('#8a3a2a'),0,193,-300);for(const[dx,dz]of[[0,43],[0,-43],[43,0],[-43,0]])put(g.box(dz?20:4,26,dz?4:20),ML('#1a1a14'),dx*.98,163,-300+dz*.98);
    for(let i=0;i<6;i++){put(g.box(12,30,60),MLT('#9a9a88','stone'),630+(i%2?-90:90),G0(630+(i%2?-90:90),100+i*80)+15,100+i*80);}put(g.tor(10,3),ML('#8a8a7a'),572,70,300,0,1.57,0);put(g.tor(10,3),ML('#8a8a7a'),688,70,300,0,1.57,0);break;}
  case'ukupacha':{const wall=MLT('#b8b0a0','wall');const rot=Math.atan2(.39,.92);
    for(let i=0;i<22;i++){const t=i/21,rx=-560+t*1120,ry=(i%2?-1:1)*(120+hash(i,3)*120);const x=rx*.92+ry*.39,y=-rx*.39+ry*.92;const gy=G0(x,y);if(gy<130)continue;const m=put(g.box(44,22,32),wall,x,gy+11,y);m.rotation.y=-rot+(i%3)*1.57;put(g.cone(34,26,4),MLT('#c8a050','thatch'),x,gy+35,y,0,-rot+(i%3)*1.57+.785,0);coll.push({x,y,r:26,top:gy+44});}
    put(g.cyl(40,44,42,14),wall,250,G0(250,-80)+21,-80);coll.push({x:250,y:-80,r:44,top:G0(250,-80)+42});
    put(g.box(30,14,30),wall,-200,G0(-200,140)+7,140);put(g.box(12,22,8),wall,-200,G0(-200,140)+25,140,0,.4,0);
    for(let i=0;i<30;i++){const a=i/30*6.283;const rx=Math.cos(a)*720,ry=Math.sin(a)*345;const x=rx*.92+ry*.39,y=-rx*.39+ry*.92;put(g.box(60,14,10),wall,x,G0(x,y)+7,y,0,-a,0);}
    break;}
  case'cielo':{const gd=MLT(C.gold,'gold'),wt=ML('#ffffff');put(g.box(22,200,22),gd,-110,100,-460);put(g.box(22,200,22),gd,110,100,-460);put(g.tor(110,10,Math.PI),MLT('#f8e080','gold'),0,200,-460);for(let i=-3;i<=3;i++)put(g.box(5,180,3),MLT('#f8e8a0','gold'),i*28,90,-460);
    put(g.box(80,30,60),gd,0,185,-1300);put(g.box(80,110,14),MLT('#f8e080','gold'),0,225,-1328);put(g.sph(16,10,8),wt,0,290,-1328);for(let i=0;i<8;i++){const a=i/8*6.283;put(g.cyl(6,6,90,10),ML('#f4e8c0'),Math.cos(a)*190,215,-1250+Math.sin(a)*190);}
    break;}
  case'lanka':{coll.push({x:0,y:0,r:52,top:170});put(g.sph(50,12,8),MLT(C.gold,'gold'),0,120,0);put(g.cone(8,60,8),MLT(C.gold,'gold'),0,190,0);for(const[x,z]of[[-160,-160],[160,-160],[-160,160],[160,160]]){put(g.sph(26,10,6),MLT('#e8b53e','gold'),x,74,z);put(g.cone(5,30,6),MLT(C.gold,'gold'),x,104,z);}break;}
  case'yomi':{const wd=ML('#5a3a2a'),rf=ML('#2a2a2a');put(g.box(120,50,90),wd,0,135,-920);put(g.box(150,8,116),rf,0,164,-920);put(g.box(110,14,80),rf,0,175,-920);break;}
  case'diyu':{const rd=ML('#7a2020'),rf=ML('#2a2a2a');let y=84;for(let i=0;i<5;i++){const w=110-i*18;put(g.box(w,26,w),rd,0,y+13,0);put(g.box(w+40,6,w+40),rf,0,y+29,0);y+=32;}put(g.cone(6,30,6),MLT(C.gold,'gold'),0,y+15,0);coll.push({x:0,y:0,r:60,top:y});break;}
  case'jotunheim':{for(let i=0;i<3;i++){const x=[300,-300,700][i],z=[300,700,-400][i];const m=put(g.tor(120,14,Math.PI),MLT('#6a4a32','bark'),x,G0(x,z),z);m.rotation.y=i;}break;}
  case'orun':{put(g.cyl(26,40,200,10),MLT('#5a3a22','bark'),0,130,0);put(g.ico(130,1),MLT('#2a4a1a','leaf'),0,300,0);put(g.ico(90,1),MLT('#3a6a2a','leaf'),40,370,20);coll.push({x:0,y:0,r:40,top:300});break;}
  case'annwn':{for(let i=0;i<12;i++){const a=i/12*6.283,x=500+Math.cos(a)*150,z=-350+Math.sin(a)*150;put(g.box(16,60,12),MLT('#7a8088','stone'),x,G0(x,z)+30,z,0,a,0);coll.push({x,y:z,r:12,top:G0(x,z)+60});}put(g.box(70,10,30),MLT('#7a8088','stone'),500,G0(500,-350)+30,-350);break;}
  case'vacio':{for(let i=0;i<16;i++){const a=i/16*6.283,r=600+hash(i,5)*800;const m=put(g.dod(30+hash(i,6)*40),ML('#3a2a5a'),Math.cos(a)*r,200+hash(i,7)*260,Math.sin(a)*r);m.userData.float=i;}break;}
  }
}

/* ---------- mundo ---------- */
let WORLD=null;
function groundAt(x,y){const W_=WORLD;if(!W_)return 0;const fx=(x+HALF)/TCELL,fy=(y+HALF)/TCELL;const ix=clamp(Math.floor(fx),0,TSEG-1),iy=clamp(Math.floor(fy),0,TSEG-1),tx=fx-ix,ty=fy-iy,N=TSEG+1,h=W_.heights;
  const a=h[iy*N+ix],b=h[iy*N+ix+1],c=h[(iy+1)*N+ix],d=h[(iy+1)*N+ix+1];return(a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty;}
function slopeAt(x,y){const e=6;return Math.hypot(groundAt(x+e,y)-groundAt(x-e,y),groundAt(x,y+e)-groundAt(x,y-e))/(2*e);}
function hazardAt(x,y){const L=WORLD&&WORLD.haz;if(!L)return null;return groundAt(x,y)<L.lv?L:null;}
function surfaceAt(x,y){const g=groundAt(x,y),hz=WORLD&&WORLD.haz;return hz&&hz.k==='water'&&g<hz.lv?hz.lv:g;}
function disposeWorld(){if(!WORLD)return;scene.remove(WORLD.group);WORLD.group.traverse(o=>{if(o.geometry&&!o.userData.keepGeo)o.geometry.dispose();});WORLD=null;}
const SHRINE_T={fortuna:{name:'Altar de la Fortuna',col:'#ffc23a'},desafio:{name:'Estatua del Desafío',col:'#ff4d5e'},fuente:{name:'Fuente Sagrada',col:'#4fc3ff'},maldito:{name:'Altar Maldito',col:'#9b5cff'}};
function buildWorld(rk){
  disposeWorld();
  const L=LOOK3D[rk],group=new THREE.Group(),N=TSEG+1,heights=new Float32Array(N*N);
  for(let iy=0;iy<N;iy++)for(let ix=0;ix<N;ix++){const x=-HALF+ix*TCELL,y=-HALF+iy*TCELL;heights[iy*N+ix]=terrainH(rk,x,y);}
  WORLD={rk,group,heights,haz:L.haz||null,coll:[],altars:[],chests:[],shrines:[],merchants:[],lights:[]};
  const pos=[],col=[],uv=[];const H=(ix,iy)=>heights[iy*N+ix];
  for(let iy=0;iy<TSEG;iy++)for(let ix=0;ix<TSEG;ix++){const x0=-HALF+ix*TCELL,y0=-HALF+iy*TCELL,x1=x0+TCELL,y1=y0+TCELL;
    const a=[x0,H(ix,iy),y0],b=[x1,H(ix+1,iy),y0],c=[x0,H(ix,iy+1),y1],d=[x1,H(ix+1,iy+1),y1];
    for(const tri of((ix+iy)%2?[[a,c,b],[b,c,d]]:[[a,c,d],[a,d,b]])){const cx=(tri[0][0]+tri[1][0]+tri[2][0])/3,cz=(tri[0][2]+tri[1][2]+tri[2][2])/3,ch=(tri[0][1]+tri[1][1]+tri[2][1])/3;
      const sl=(Math.max(tri[0][1],tri[1][1],tri[2][1])-Math.min(tri[0][1],tri[1][1],tri[2][1]))/TCELL;const cc=terrainColor(rk,cx/WS,cz/WS,ch/WS,sl);
      for(const v of tri){pos.push(v[0],v[1],v[2]);col.push(cc.r,cc.g,cc.b);uv.push(v[0]/70,v[2]/70+(sl>.85?v[1]/70:0));}}}
  const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));tg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));tg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));tg.computeVertexNormals();
  const terrain=new THREE.Mesh(tg,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,map:TEX(L.tex)}));terrain.receiveShadow=true;group.add(terrain);
  if(L.haz){const hz=L.haz;const tex=hazardTexture(hz);const geo=new THREE.PlaneGeometry(ARENA*2.3,ARENA*2.3,hz.k==='water'?70:1,hz.k==='water'?70:1);
    const m=hz.k==='water'?new THREE.MeshPhongMaterial({color:hz.col,transparent:true,opacity:.8,map:tex,shininess:90,specular:'#ffffff',flatShading:true}):new THREE.MeshBasicMaterial({color:hz.col,map:tex});
    const w=new THREE.Mesh(geo,m);w.rotation.x=-Math.PI/2;w.position.y=hz.lv;w.receiveShadow=hz.k==='water';group.add(w);WORLD.water=w;WORLD.hazTex=tex;}
  // cielo
  const sky=new THREE.SphereGeometry(7600,24,14),sc=[],top=new THREE.Color(L.top),hor=new THREE.Color(L.hor);const sp=sky.attributes.position;
  for(let i=0;i<sp.count;i++){const yy=sp.getY(i)/7600,k=clamp(yy*1.6,0,1);const cc=hor.clone().lerp(top,k);if(yy<0)cc.copy(hor).multiplyScalar(.7);sc.push(cc.r,cc.g,cc.b);}
  sky.setAttribute('color',new THREE.Float32BufferAttribute(sc,3));const skyM=new THREE.Mesh(sky,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));group.add(skyM);WORLD.sky=skyM;
  if(L.stars){const sg=new THREE.BufferGeometry(),pp=[];for(let i=0;i<900;i++){const a=Math.random()*6.283,b=Math.random()*1.35+.12;pp.push(Math.cos(a)*Math.cos(b)*5000,Math.sin(b)*5000,Math.sin(a)*Math.cos(b)*5000);}sg.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));
    const st=new THREE.Points(sg,new THREE.PointsMaterial({color:'#ffffff',size:2.4,sizeAttenuation:false,fog:false}));group.add(st);WORLD.stars=st;}
  if(L.disk||L.moon){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(L.moon?'#e8eeff':L.disk,L.moon),fog:false,depthWrite:false}));s.scale.set(L.moon?420:640,L.moon?420:640,1);s.position.set(-2600,2200,-3400);group.add(s);WORLD.sunSprite=s;}
  if(L.aurora){WORLD.aurora=[];for(let i=0;i<3;i++){const g=new THREE.PlaneGeometry(4400,520,40,1);const m=new THREE.MeshBasicMaterial({color:i===1?'#7de0ff':'#7de0b0',transparent:true,opacity:.18,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
    const mesh=new THREE.Mesh(g,m);mesh.position.set(0,1200+i*200,-2400+i*500);mesh.rotation.x=-.3;group.add(mesh);WORLD.aurora.push(mesh);}}
  const cloudN=L.clouds?70:L.mist?40:(L.night?0:18);for(let i=0;i<cloudN;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTex(),transparent:true,opacity:L.mist?.75:.9,depthWrite:false,fog:!L.clouds}));const a=Math.random()*6.283,r=L.mist?500+Math.random()*1500:2200+Math.random()*1400;
    s.position.set(Math.cos(a)*r,L.mist?-40+Math.random()*120:(L.clouds?-200+Math.random()*400:900+Math.random()*600),Math.sin(a)*r);const k=L.mist?300+Math.random()*300:500+Math.random()*600;s.scale.set(k,k*.5,1);group.add(s);}
  // horizonte lejano
  const m4f=new THREE.Matrix4(),v1f=new THREE.Vector3();
  const farM=new THREE.MeshLambertMaterial({color:L.far,flatShading:true});const rngF=srand(rk.length*97+3);
  const green=/lanka|orun|xibalba|ukupacha|annwn|yomi/.test(rk);const mts=green?['mountain_A_grass_trees','mountain_B_grass_trees','mountain_C_grass']:['mountain_A','mountain_B','mountain_C'];
  if(PA(mts[0])){const lists={};for(let i=0;i<56;i++){const a=i/56*6.283+rngF()*.08,r=ARENA+420+rngF()*1300,h=L.farH*(.6+rngF()*.9)*(rk==='cielo'?.4:1);const nm=mts[Math.floor(rngF()*3)];(lists[nm]=lists[nm]||[]).push({a,r,h,rot:rngF()*6.28});}
    for(const nm in lists){const pa=PA(nm);const im=new THREE.InstancedMesh(pa.geo,pa.mat,lists[nm].length);im.userData.keepGeo=true;const tc=new THREE.Color(green?'#ffffff':L.far).lerp(new THREE.Color('#ffffff'),green?0:.35);
      lists[nm].forEach((it,i)=>{const sc=it.h/pa.h;m4f.makeRotationY(it.rot);m4f.scale(v1f.set(sc*1.3,sc,sc*1.3));m4f.setPosition(Math.cos(it.a)*it.r,-60,Math.sin(it.a)*it.r);im.setMatrixAt(i,m4f);im.setColorAt(i,tc);});group.add(im);}
    if(green&&PA('hills_A_trees')){const hl=['hills_A_trees','hills_B_trees','hills_C_trees'];for(const nm of hl){const pa=PA(nm);const n=14;const im=new THREE.InstancedMesh(pa.geo,pa.mat,n);im.userData.keepGeo=true;
      for(let i=0;i<n;i++){const a=rngF()*6.283,r=ARENA+40+rngF()*260,sc=(140+rngF()*120)/pa.h;m4f.makeRotationY(rngF()*6.28);m4f.scale(v1f.set(sc,sc,sc));m4f.setPosition(Math.cos(a)*r,groundAt(Math.cos(a)*Math.min(r,ARENA-20),Math.sin(a)*Math.min(r,ARENA-20))-30,Math.sin(a)*r);im.setMatrixAt(i,m4f);}group.add(im);}}}
  for(let i=0;i<(PA(mts[0])?0:44);i++){const a=i/44*6.283+rngF()*.1,r=ARENA+500+rngF()*1500,h=L.farH*(.5+rngF()*.9),w=h*(.8+rngF()*.8);const m=new THREE.Mesh(new THREE.ConeGeometry(w,h,5+Math.floor(rngF()*3)),farM);m.position.set(Math.cos(a)*r,h/2-40,Math.sin(a)*r);m.rotation.y=rngF()*3;group.add(m);
    if((rk==='jotunheim'||rk==='ukupacha'||rk==='annwn')&&h>L.farH*.8){const cap=new THREE.Mesh(new THREE.ConeGeometry(w*.32,h*.32,5),ML('#f4f8fb'));cap.position.set(m.position.x,h-40-h*.16,m.position.z);group.add(cap);}}
  if(L.volcano){const v=new THREE.Mesh(new THREE.ConeGeometry(1000,1300,8,1,true),farM);v.position.set(0,600,-5200);group.add(v);const crater=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex('#ff6a1a'),blending:THREE.AdditiveBlending,fog:false,depthWrite:false}));crater.scale.set(1300,800,1);crater.position.set(0,1250,-5200);group.add(crater);}
  // luces
  const hemi=new THREE.HemisphereLight(L.hemi[0],L.hemi[1],L.hemi[2]);group.add(hemi);
  const sun=new THREE.DirectionalLight(L.sun[0],L.sun[1]);sun.position.set(-500,900,400);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc2=sun.shadow.camera;sc2.left=-650;sc2.right=650;sc2.top=650;sc2.bottom=-650;sc2.near=50;sc2.far=2600;sun.shadow.bias=-.0008;
  group.add(sun);group.add(sun.target);WORLD.sun=sun;
  scene.fog=new THREE.Fog(L.hor,L.night?700:1300,L.night?3000:5600);scene.fog.userData={n0:scene.fog.near,f0:scene.fog.far};scene.background=new THREE.Color(L.hor);
  // decorados
  const kinds=extraKinds(),inst={},rng=srand(rk.length*7919+13);
  const instA={};
  const add=(kind,x,y,s,rot,tint)=>{if(kind.startsWith('A:')){const ak=AK[kind.slice(2)],pa=ak&&PA(ak[0]);if(!pa){if(ak)return add(ak[3],x,y,s,rot);return;}
      const sc=ak[1]/pa.h*s;(instA[kind]=instA[kind]||[]).push({x,y,sc,rot,tint});if(ak[2])WORLD.coll.push({x,y,r:pa.w*sc*ak[2],top:surfaceAt(x,y)+pa.h*sc});return;}
    (inst[kind]=inst[kind]||[]).push({x,y,s,rot});const k=kinds[kind];if(k.c)WORLD.coll.push({x,y,r:k.c*s,top:surfaceAt(x,y)+k.h*s});};
  landmarks(rk,add);
  {const sg=new THREE.Group();sg.scale.setScalar(WS);group.add(sg);const c0=WORLD.coll.length;structures(rk,sg,WORLD.coll);for(let i=c0;i<WORLD.coll.length;i++){const c=WORLD.coll[i];c.x*=WS;c.y*=WS;c.r*=WS;c.top*=WS;}}
  for(const[kind,count0,where,tint]of REALM_PROPS[rk]){const count=Math.round(count0*2*AREAK);let n=0,tries=0;while(n<count&&tries<count*30){tries++;const a=rng()*6.283,r=Math.sqrt(rng())*(ARENA-110);const x=Math.cos(a)*r,y=Math.sin(a)*r;
    if(Math.hypot(x,y)<220)continue;const g=groundAt(x,y),sl=slopeAt(x,y);const wet=WORLD.haz&&WORLD.haz.k==='water'&&g<WORLD.haz.lv;
    if(where==='wet'?!(wet||(WORLD.haz&&g<WORLD.haz.lv+6)):(wet||hazardAt(x,y)||sl>.5))continue;if(onPath(rk,x,y))continue;add(kind,x,y,(.85+rng()*.6)*(kind.startsWith('A:')?1:1.45),rng()*6.283,tint);n++;}}
  const m4=new THREE.Matrix4(),mp=new THREE.Matrix4(),q4=new THREE.Quaternion(),eu=new THREE.Euler(),v1=new THREE.Vector3(),v2=new THREE.Vector3();
  for(const kind in instA){const list=instA[kind],pa=PA(AK[kind.slice(2)][0]);const im=new THREE.InstancedMesh(pa.geo,pa.mat,list.length);im.userData.keepGeo=true;im.castShadow=!/lily|wplant|skull|bone|candles|coins/.test(kind);im.receiveShadow=true;
    list.forEach((it,i)=>{const gy=/lily/.test(kind)&&WORLD.haz?Math.max(groundAt(it.x,it.y),WORLD.haz.lv):/cloud/.test(kind)?groundAt(it.x,it.y)-20:groundAt(it.x,it.y)-1;m4.makeRotationY(it.rot);m4.scale(v1.set(it.sc,it.sc,it.sc));m4.setPosition(it.x,gy,it.y);im.setMatrixAt(i,m4);im.setColorAt(i,new THREE.Color(it.tint||'#ffffff'));});
    group.add(im);}
  for(const kind in inst){const list=inst[kind],k=kinds[kind];
    for(const part of k.p){const[geo,mat,px,py,pz,rx,ry,rz]=part;const im=new THREE.InstancedMesh(geo,mat,list.length);im.userData.keepGeo=true;im.castShadow=!/marigold|candle|reeds|lotus|fern|agave|nopal/.test(kind);im.receiveShadow=true;
      list.forEach((it,i)=>{const gy=kind==='lotus'?Math.max(groundAt(it.x,it.y),WORLD.haz?WORLD.haz.lv:0):groundAt(it.x,it.y);
        m4.makeRotationY(it.rot);m4.scale(v1.set(it.s,it.s,it.s));m4.setPosition(it.x,gy,it.y);eu.set(rx||0,ry||0,rz||0);q4.setFromEuler(eu);mp.compose(v2.set(px,py,pz),q4,v1.set(1,1,1));m4.multiply(mp);im.setMatrixAt(i,m4);});
      group.add(im);}}
  // césped y flores
  const [gt,gcount]=L.grass;const gw=[crossGeo(30,27),crossGeo(26,24)];
  for(let kind=0;kind<2;kind++){const n=Math.round(gcount*2*AREAK*(kind?0.3:1)),gm=new THREE.MeshBasicMaterial({map:grassTex(gt,kind),alphaTest:.5,side:THREE.DoubleSide,color:new THREE.Color(L.hemi[0]).lerp(new THREE.Color('#ffffff'),.3).multiplyScalar(L.night?.62:.92)});const im=new THREE.InstancedMesh(gw[kind],gm,n);let c=0;
    for(let t=0;t<n*4&&c<n;t++){const a=rng()*6.283,r=Math.sqrt(rng())*(ARENA-80),x=Math.cos(a)*r,y=Math.sin(a)*r;const gh=groundAt(x,y);if(hazardAt(x,y)||slopeAt(x,y)>.45)continue;if(WORLD.haz&&WORLD.haz.k==='water'&&gh<WORLD.haz.lv+2)continue;if(onPath(rk,x,y))continue;
      const s=.7+rng()*.8;m4.makeRotationY(rng()*3.14);m4.scale(v1.set(s,s*(.8+rng()*.5),s));m4.setPosition(x,gh-1,y);im.setMatrixAt(c++,m4);}
    im.count=c;group.add(im);}
  if(rk==='ukupacha'){const ms=miscSprites();for(let i=0;i<18;i++){const a=rng()*6.283,r=200+rng()*900,x=Math.cos(a)*r,y=Math.sin(a)*r;if(slopeAt(x,y)>.4)continue;const s=new THREE.Sprite(spriteMat(ms.llama,rng()<.5));s.center.set(.5,0);s.scale.set(ms.llama.w*.55,ms.llama.h*.55,1);s.position.set(x,groundAt(x,y),y);if(rk==='ukupacha')group.add(s);}}
  // interactivos
  const spot=(minD,maxD)=>{for(let t=0;t<300;t++){const a=rng()*6.283,r=minD+rng()*((maxD||ARENA-160)-minD),x=Math.cos(a)*r,y=Math.sin(a)*r;if(hazardAt(x,y)||slopeAt(x,y)>.35)continue;if(WORLD.coll.some(c=>Math.hypot(c.x-x,c.y-y)<c.r+40))continue;return[x,y];}return[rng()*200-100,200];};
  const shrineObj=(x,y,col,kind)=>{const g=new THREE.Group();const base=new THREE.Mesh(GEO.cyl(20,24,12,8),MLT('#8a8a8a','stone'));base.castShadow=true;base.receiveShadow=true;g.add(base);
    let gem;if(kind==='desafio'){gem=new THREE.Mesh(GEO.box(14,40,10),ML('#5a4a4a'));gem.position.y=32;const head=new THREE.Mesh(GEO.box(12,12,12),ML('#6a5a5a'));head.position.y=58;g.add(head);}
    else if(kind==='fuente'){gem=new THREE.Mesh(GEO.cyl(16,12,10,10),MB('#4fc3ff',{transparent:true,opacity:.8}));gem.position.y=12;}
    else{gem=new THREE.Mesh(GEO.oct(9),MB(col));gem.position.y=32;}
    g.add(gem);const ring=new THREE.Mesh(new THREE.RingGeometry(40,44,32),MB(col,{transparent:true,opacity:.6,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=1;g.add(ring);
    const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(col),blending:THREE.AdditiveBlending,depthWrite:false}));gl.scale.set(90,90,1);gl.position.y=34;g.add(gl);
    g.position.set(x,groundAt(x,y)+6,y);group.add(g);return{g,gem,ring};};
  for(let i=0;i<8;i++){const[x,y]=spot(300);const o=shrineObj(x,y,REALMS[rk].acc,'don');WORLD.altars.push({x,y,charge:0,used:false,obj:o.g,gem:o.gem});}
  for(const t of['fortuna','fortuna','desafio','fuente','maldito']){const[x,y]=spot(350);const o=shrineObj(x,y,SHRINE_T[t].col,t);WORLD.shrines.push({type:t,x,y,used:false,uses:0,obj:o.g,gem:o.gem});}
  for(let i=0;i<3;i++){const[x,y]=spot(400);WORLD.merchants.push({x,y,offers:null,rerolls:0});WORLD.coll.push({x,y,r:12,top:groundAt(x,y)+40});
    const st=new THREE.Group();const tbl=new THREE.Mesh(GEO.box(50,16,26),MLT('#7a4a2a','bark'));tbl.position.set(0,8,22);st.add(tbl);const aw=new THREE.Mesh(GEO.box(66,4,40),ML(i?'#3a8bff':'#ff4d5e'));aw.position.set(0,52,14);aw.rotation.x=.2;st.add(aw);
    for(const sx of[-30,30]){const pole=new THREE.Mesh(GEO.cyl(1.6,1.6,52,5),ML('#5a3a22'));pole.position.set(sx,26,32);st.add(pole);}st.traverse(o=>{o.castShadow=true;});st.position.set(x,groundAt(x,y),y);group.add(st);}
  for(let i=0;i<28;i++){const[x,y]=spot(200);const g=new THREE.Group();const body=new THREE.Mesh(GEO.box(22,14,16),MLT('#7a4a2a','bark'));body.position.y=7;body.castShadow=true;g.add(body);const lid=new THREE.Mesh(GEO.box(23,5,17),MLT(C.gold,'gold'));lid.position.y=16;g.add(lid);
    g.position.set(x,groundAt(x,y),y);g.rotation.y=rng()*6.283;group.add(g);WORLD.chests.push({x,y,opened:false,obj:g,lid});}
  WORLD.wx=makeWeather(REALMS[rk].weather);if(WORLD.wx)group.add(WORLD.wx.pts);
  scene.add(group);
  return WORLD;
}
function onPath(rk,x,y){x/=WS;y/=WS;switch(rk){case'mictlan':return Math.abs(x)<100&&y>-1500&&y<1100;case'yomi':return Math.abs(x-Math.sin(y/360)*160)<64;case'cielo':return Math.abs(x)<110&&y<-400;case'tartaro':return Math.abs(x)<120&&y>300&&y<700;default:return false;}}
function landmarks(rk,add0){const add=(k,x,y,sc,r)=>add0(k,x*WS,y*WS,sc*1.25*WS,r);
  switch(rk){
  case'jotunheim':for(let i=0;i<11;i++){const a=i/11*6.283;add('runestone',-700+Math.cos(a)*140,-600+Math.sin(a)*140,1.5,a);}break;
  case'duat':for(let i=0;i<6;i++){add('obelisk',-80+i*90,-70,1.05,0);add('obelisk',-80+i*90,70,1.05,0);}break;
    case'yomi':for(let i=0;i<9;i++){const y=500-i*120;add('torii',Math.sin(y/360)*160,y,1.4,-Math.cos(y/360)*.45);}break;
  case'diyu':for(let i=0;i<10;i++){const a=i/10*6.283;add('redlantern',Math.cos(a)*220,Math.sin(a)*220,1.3,0);}break;
  case'mictlan':for(let i=0;i<24;i++){const y=-1400+i*100;add('candle',-90,y,1.6,0);add('candle',90,y,1.6,0);}break;
  case'xibalba':for(let i=0;i<8;i++)add('stele',-280+i*80,-620,1.4,0);break;
  case'ukupacha':add('apacheta',-320,60,2.4,0);break;
  case'cielo':for(let i=0;i<7;i++){add('goldpillar',-110,-540-i*70,1.1,0);add('goldpillar',110,-540-i*70,1.1,0);}break;
  case'vacio':for(let i=0;i<8;i++){const a=i/8*6.283;add('crystal',Math.cos(a)*1000,Math.sin(a)*1000,3.4,a);}break;
  case'tartaro':for(let i=0;i<16;i++){const a=i/16*6.283;add(i%3===1?'brokencol':'column',Math.cos(a)*300,Math.sin(a)*300,1.15,i%3===1?a:0);}break;
  }
}
const TEXC={};
function glowTex(col,moon){const k='g'+col+moon;if(TEXC[k])return TEXC[k];const c=mkCanvas(64,64),g=c.getContext('2d');const gr=g.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,col);gr.addColorStop(moon?.5:.3,col);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  const t=new THREE.CanvasTexture(c);TEXC[k]=t;return t;}
function cloudTex(){if(TEXC.cloud)return TEXC.cloud;const c=mkCanvas(64,40),g=c.getContext('2d');for(let i=0;i<9;i++){const x=10+i*5+Math.random()*4,y=22-Math.sin(i/8*Math.PI)*8,r=8+Math.sin(i/8*Math.PI)*8;g.fillStyle=i%2?'#ffffff':'#f4f2ff';g.beginPath();g.arc(x,y,r,0,7);g.fill();}
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;TEXC.cloud=t;return t;}
function hazardTexture(hz){const c=mkCanvas(64,64),g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,64,64);
  for(let i=0;i<260;i++){const x=Math.floor(Math.random()*64),y=Math.floor(Math.random()*64);g.fillStyle=hz.k==='lava'?(i%3?'#ffd080':'#c03010'):hz.k==='void'?(i%2?'#e0b0ff':'#3a1060'):(i%2?'#d8f0ff':'#a0c8e0');g.fillRect(x,y,i%5?3:5,1);}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(60,60);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;return t;}
function animWater(){const w=WORLD&&WORLD.water;if(!w||!WORLD.haz||WORLD.haz.k!=='water')return;const p=w.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,Math.sin(x*.012+T*1.6)*2.2+Math.cos(y*.015+T*1.2)*2);}p.needsUpdate=true;w.geometry.computeVertexNormals();}

/* ---------- clima con partículas ---------- */
const WXC={embers:['#ff8a3a',4,0,40],snow:['#ffffff',4,-50,0],sand:['#f2d498',3,-8,0],dust:['#e8c89a',3,-4,0],fireflies:['#e8f88a',5,0,0],wisps:['#8ad0ff',6,0,12],petals:['#f2a8c8',4,-30,0],marigold:['#f2a22c',4,-30,0],
  stars:['#dfe8ff',3,0,0],leaves:['#8aba4a',4,-30,0],rain:['#b8dcf0',3,-420,0],void:['#b07aff',4,0,6],feathers:['#ffffff',5,-22,0]};
function makeWeather(type){const c=WXC[type];if(!c)return null;const n=type==='rain'?1000:700,g=new THREE.BufferGeometry(),p=new Float32Array(n*3),v=[];
  for(let i=0;i<n;i++){p[i*3]=rand(-800,800);p[i*3+1]=rand(0,460);p[i*3+2]=rand(-800,800);v.push(Math.random()*6.28);}
  g.setAttribute('position',new THREE.BufferAttribute(p,3));const pts=new THREE.Points(g,new THREE.PointsMaterial({color:c[0],size:c[1],sizeAttenuation:true,transparent:true,opacity:type==='rain'?.6:.95,depthWrite:false,blending:/fireflies|wisps|embers|void/.test(type)?THREE.AdditiveBlending:THREE.NormalBlending}));
  pts.frustumCulled=false;return{type,pts,ph:v,cfg:c};}
function updWeather(dt,cx,cy){const w=WORLD&&WORLD.wx;if(!w)return;const p=w.pts.geometry.attributes.position.array,n=p.length/3,vy=w.cfg[2],vup=w.cfg[3];
  for(let i=0;i<n;i++){let x=p[i*3],y=p[i*3+1],z=p[i*3+2];const ph=w.ph[i];
    switch(w.type){case'sand':x+=60*dt;break;case'rain':x+=30*dt;break;case'fireflies':x+=Math.cos(T*.7+ph)*12*dt;z+=Math.sin(T*.9+ph)*12*dt;y+=Math.sin(T+ph)*6*dt;break;default:x+=Math.sin(T+ph)*14*dt;z+=Math.cos(T*.8+ph)*10*dt;}
    y+=(vy+vup)*dt;if(w.type==='stars')y=4+Math.abs(Math.sin(ph*13))*30;
    if(y<0)y+=460;if(y>460)y-=460;const dx=x-cx,dz=z-cy;if(dx>800)x-=1600;if(dx<-800)x+=1600;if(dz>800)z-=1600;if(dz<-800)z+=1600;p[i*3]=x;p[i*3+1]=y;p[i*3+2]=z;}
  w.pts.geometry.attributes.position.needsUpdate=true;w.pts.position.y=groundAt(cx,cy)-20;if(w.type==='stars'||w.type==='fireflies')w.pts.material.opacity=.6+.4*Math.sin(T*3);}

/* ---------- materiales de sprites ---------- */
const SMAT=new Map();
function texOf(canvas){let t=canvas._tex;if(!t){t=new THREE.CanvasTexture(canvas);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;canvas._tex=t;}return t;}
function spriteMat(v,flip,flash){const canvas=flash?(flip?v.fm:v.f):(flip?v.cm:v.c);let m=SMAT.get(canvas);if(!m){m=new THREE.SpriteMaterial({map:texOf(canvas),transparent:true,alphaTest:.5});SMAT.set(canvas,m);}return m;}

const SPAWN={tartaro:[0,200],duat:[0,220],kur:[0,240],lanka:[0,170],diyu:[0,170],orun:[0,120],mictlan:[0,300],xibalba:[0,200],ukupacha:[-60,40],cielo:[0,200],yomi:[0,200],vacio:[0,60],jotunheim:[0,60],annwn:[0,60]};
for(const k in SPAWN)SPAWN[k]=SPAWN[k].map(v=>v*WS);
function spawnPt(rk){return SPAWN[rk]||[0,60];}
