/* Bonk de los Dioses · núcleo: utilidades y sprites pixel art */
'use strict';
const {SECRET_GODS,C,WEAPONS,GODS,PASSIVES,CONCILIOS,ENEMIES,BOSSES,REALMS,REL,LINES,LOOKS,THEMES,RAR,ITEMS,RUN_MISSIONS,DAILY,FREE_GODS,GOD_PRICE,UPGRADES}=window.DATA;
const GOD=Object.fromEntries(GODS.map(g=>[g.id,g]));
const $=id=>document.getElementById(id);

const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const fmt=t=>{t=Math.max(0,Math.floor(t));return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function hash(x,y,s=0){let h=(x*374761393+y*668265263+s*982451653)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295;}
function hexRGB(h){if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];const n=parseInt(h.slice(1,7),16);return[n>>16,(n>>8)&255,n&255];}
function shade(h,a){const[r,g,b]=hexRGB(h);const f=v=>clamp(Math.round(a<0?v*(1+a):v+(255-v)*a),0,255);return'#'+((1<<24)|(f(r)<<16)|(f(g)<<8)|f(b)).toString(16).slice(1);}
function lum(h){const[r,g,b]=hexRGB(h);return(.299*r+.587*g+.114*b)/255;}
function rgba(h,a){const[r,g,b]=hexRGB(h);return`rgba(${r},${g},${b},${a})`;}
function vn(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,sm=t=>t*t*(3-2*t);const a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s),u=sm(xf),v=sm(yf);return(a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;}
function fbm(x,y,s){let t=0,a=1,f=1,n=0;for(let i=0;i<4;i++){t+=vn(x*f,y*f,s+i*7)*a;n+=a;a*=.5;f*=2;}return t/n;}
function srand(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return((s>>>0)%100000)/100000;};}
const isTouch=matchMedia('(pointer:coarse)').matches;
let store=null;try{store=window.localStorage;store.getItem('x');}catch(err){store=null;}
function loadRec(){try{return JSON.parse(store&&store.getItem('bonk-dioses')||'{}')||{};}catch(err){return{};}}
function saveRec(r){try{store&&store.setItem('bonk-dioses',JSON.stringify(r));}catch(err){}}
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}

/* ---------- dibujo de píxeles sobre D ---------- */
let D=null,S=3,OX=0,OY=0,T=0;
function R(x,y,w,h,c){D.fillStyle=c;D.fillRect(Math.round(x),Math.round(y),w,h);}
function line(x0,y0,x1,y1,c,w=1){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);D.fillStyle=c;const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx-dy,n=0;const o=w>>1;
  while(n++<900){D.fillRect(x0-o,y0-o,w,w);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>-dy){e-=dy;x0+=sx;}if(e2<dx){e+=dx;y0+=sy;}}}
function ellD(cx,cy,rx,ry,c){if(rx<=0||ry<=0)return;D.fillStyle=c;cx=Math.round(cx);cy=Math.round(cy);for(let y=-Math.ceil(ry);y<=ry;y++){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));if(w>=0)D.fillRect(cx-w,cy+y,w*2+1,1);}}
function ringD(cx,cy,r,c,w=1){D.fillStyle=c;const n=Math.max(16,Math.ceil(r*6.3));for(let i=0;i<n;i++){const a=i/n*6.2832;D.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),w,w);}}
function dither(cx,cy,r,c,step){D.fillStyle=c;cx=Math.round(cx);cy=Math.round(cy);r=Math.round(r);const r2=r*r;for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(i*i+j*j>r2)continue;if((((cx+i)+(cy+j)*2)%step+step)%step===0)D.fillRect(cx+i,cy+j,1,1);}}
function triD(x1,y1,x2,y2,x3,y3,c){const minY=Math.floor(Math.min(y1,y2,y3)),maxY=Math.ceil(Math.max(y1,y2,y3));D.fillStyle=c;
  for(let y=minY;y<=maxY;y++){const xs=[];for(const[a,b,c2,d]of[[x1,y1,x2,y2],[x2,y2,x3,y3],[x3,y3,x1,y1]]){if((y>=b&&y<d)||(y>=d&&y<b))xs.push(a+(y-b)*(c2-a)/(d-b));}
    if(xs.length>=2){xs.sort((a,b)=>a-b);D.fillRect(Math.round(xs[0]),y,Math.max(1,Math.round(xs[xs.length-1]-xs[0])),1);}}}
function addLight(){}

/* ---------- procesado de sprites ---------- */
function alphaAt(d,w,h,x,y){return x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>0;}
function epx(src){const w=src.width,h=src.height,sd=src.getContext('2d').getImageData(0,0,w,h).data;const o=mkCanvas(w*2,h*2),og=o.getContext('2d'),od=og.createImageData(w*2,h*2),d=od.data;
  const P=(x,y)=>{if(x<0||y<0||x>=w||y>=h)return -1;const i=(y*w+x)*4;return sd[i+3]?((sd[i]<<16)|(sd[i+1]<<8)|sd[i+2]):-1;};
  const put=(x,y,c)=>{if(c<0)return;const i=(y*w*2+x)*4;d[i]=c>>16;d[i+1]=(c>>8)&255;d[i+2]=c&255;d[i+3]=255;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=P(x,y),A=P(x,y-1),B=P(x+1,y),Cc=P(x-1,y),Dd=P(x,y+1);let p1=p,p2=p,p3=p,p4=p;
    if(Cc===A&&Cc!==Dd&&A!==B)p1=A;if(A===B&&A!==Cc&&B!==Dd)p2=B;if(Dd===Cc&&Dd!==B&&Cc!==A)p3=Cc;if(B===Dd&&B!==A&&Dd!==Cc)p4=Dd;
    if(p<0){p1=p1===A&&A>=0&&Cc===A?A:-1;p2=p2===B&&B>=0&&A===B?B:-1;p3=p3===Cc&&Cc>=0&&Dd===Cc?Cc:-1;p4=p4===Dd&&Dd>=0&&B===Dd?Dd:-1;}
    put(x*2,y*2,p1);put(x*2+1,y*2,p2);put(x*2,y*2+1,p3);put(x*2+1,y*2+1,p4);}
  og.putImageData(od,0,0);return o;}
function shadeOutline(src,ol,noShade){const w=src.width,h=src.height,g=src.getContext('2d'),id=g.getImageData(0,0,w,h),d=id.data,orig=new Uint8ClampedArray(d);
  if(!noShade)for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!orig[i+3])continue;const up=!alphaAt(orig,w,h,x,y-1)||!alphaAt(orig,w,h,x-1,y),dn=!alphaAt(orig,w,h,x,y+1)||!alphaAt(orig,w,h,x+1,y);
    const f=up&&!dn?1.18:dn&&!up?.78:1;if(f!==1){d[i]=clamp(d[i]*f+(f>1?12:0),0,255);d[i+1]=clamp(d[i+1]*f+(f>1?12:0),0,255);d[i+2]=clamp(d[i+2]*f+(f>1?12:0),0,255);}}
  g.putImageData(id,0,0);
  const o=mkCanvas(w+2,h+2),og=o.getContext('2d');if(ol){og.fillStyle=ol;for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){if(alphaAt(orig,w,h,x,y))continue;if(alphaAt(orig,w,h,x-1,y)||alphaAt(orig,w,h,x+1,y)||alphaAt(orig,w,h,x,y-1)||alphaAt(orig,w,h,x,y+1))og.fillRect(x+1,y+1,1,1);}}
  og.drawImage(src,1,1);return o;}
function hiPaint(src,ol){const w=src.width,h=src.height,g=src.getContext('2d'),id=g.getImageData(0,0,w,h),d=id.data,o0=new Uint8ClampedArray(d);
  const A=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&o0[(y*w+x)*4+3]>0;const col=(x,y)=>{const i=(y*w+x)*4;return(o0[i]<<16)|(o0[i+1]<<8)|o0[i+2];};
  const tH=new Float32Array(w*h),tV=new Float32Array(w*h);
  for(let y=0;y<h;y++){let x=0;while(x<w){if(!A(x,y)){x++;continue;}let x1=x;while(x1+1<w&&A(x1+1,y))x1++;
      let a=x;while(a<=x1){const c=col(a,y);let b=a;while(b+1<=x1&&col(b+1,y)===c)b++;const useC=b-a>=8;for(let k=a;k<=b;k++)tH[y*w+k]=useC?(k-a)/(b-a):(k-x)/Math.max(1,x1-x);a=b+1;}x=x1+1;}}
  for(let x=0;x<w;x++){let y=0;while(y<h){if(!A(x,y)){y++;continue;}let y1=y;while(y1+1<h&&A(x,y1+1))y1++;
      let a=y;while(a<=y1){const c=col(x,a);let b=a;while(b+1<=y1&&col(x,b+1)===c)b++;for(let k=a;k<=b;k++)tV[k*w+x]=b-a>=3?(k-a)/(b-a):.5;a=b+1;}y=y1+1;}}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!o0[i+3])continue;const L=(.5-tH[y*w+x])*.6+(.5-tV[y*w+x])*.35;let r=o0[i],gg=o0[i+1],b=o0[i+2];
    if(L>.2){r+=(255-r)*.16;gg+=(255-gg)*.16;b+=(255-b)*.12;}
    else if(L<-.2){r*=.76;gg*=.78;b*=.88;}else if(L<-.13&&(x+y)%2===0){r*=.86;gg*=.87;b*=.92;}
    const dn=A(x,y+1)&&col(x,y+1)!==col(x,y),up=A(x,y-1)&&col(x,y-1)!==col(x,y);
    if(dn){const i2=((y+1)*w+x)*4;const l1=o0[i]+o0[i+1]+o0[i+2],l2=o0[i2]+o0[i2+1]+o0[i2+2];if(l1>l2+60){r*=.86;gg*=.86;b*=.9;}}
    if(up&&!A(x,y-2)){r+=(255-r)*.1;gg+=(255-gg)*.1;b+=(255-b)*.1;}
    d[i]=r;d[i+1]=gg;d[i+2]=b;}
  g.putImageData(id,0,0);
  const o=mkCanvas(w+2,h+2),og=o.getContext('2d'),od=og.createImageData(w+2,h+2),q=od.data;const ok=ol?hexRGB(ol):[20,14,12];
  for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){if(A(x,y))continue;let n=null;for(const[dx,dy]of[[0,1],[1,0],[-1,0],[0,-1]])if(A(x+dx,y+dy)){n=[x+dx,y+dy];break;}if(!n)continue;
    const j=(n[1]*w+n[0])*4,k=((y+1)*(w+2)+x+1)*4;q[k]=o0[j]*.28+ok[0]*.55;q[k+1]=o0[j+1]*.28+ok[1]*.55;q[k+2]=o0[j+2]*.32+ok[2]*.55;q[k+3]=255;}
  og.putImageData(od,0,0);og.drawImage(src,1,1);return o;}
function variants(c){const f=mkCanvas(c.width,c.height),fg=f.getContext('2d');fg.drawImage(c,0,0);fg.globalCompositeOperation='source-in';fg.fillStyle='#fff6e0';fg.fillRect(0,0,f.width,f.height);
  const flip=x=>{const o=mkCanvas(x.width,x.height),og=o.getContext('2d');og.translate(x.width,0);og.scale(-1,1);og.drawImage(x,0,0);return o;};
  return{c,f,cm:flip(c),fm:flip(f),w:c.width,h:c.height};}
function fromFn(w,h,fn){const c=mkCanvas(w,h),g=c.getContext('2d');
  const put=(x,y,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),1,1);};
  const rect=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),ww,hh);};
  const ell=(cx,cy,rx,ry,col)=>{g.fillStyle=col;for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){if(((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1)g.fillRect(x,y,1,1);}};
  const clear=(x,y,ww,hh)=>g.clearRect(x,y,ww,hh);
  const ln=(x0,y0,x1,y1,col)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2+1;for(let i=0;i<=n;i++){put(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,col);}};
  fn({put,rect,ell,clear,ln,g});return c;}

/* ---------- dioses en alta resolución (32×44) con su arma ---------- */
const INK=C.ink;
function drawGod(id,fr){
  const L=LOOKS[id]||{};const light=L.head==='light';
  const c=fromFn(68,92,({put,rect,ell,clear,ln})=>{
    const O=1;// margen; todo se dibuja a 2× nativo
    const X=x=>x+O,Y=y=>y+O,Z=v=>Math.round(2*(v+O));
    const skin=light?'#fff6e0':L.s,robe=light?'#fff6e0':L.r,trim=light?'#f4d27a':L.t,hair=L.h||INK,hc=L.hc||C.gold;
    const P=(x,y,c2)=>rect(Z(x),Z(y),2,2,c2),RR=(x,y,w,h,c2)=>rect(Z(x),Z(y),Math.round(w*2),Math.round(h*2),c2),EL=(x,y,rx,ry,c2)=>ell(2*X(x),2*Y(y),rx*2,ry*2,c2),
      LN=(a,b,c1,d,c2)=>{const n=Math.ceil(Math.max(Math.abs(c1-a),Math.abs(d-b))*2)+1;for(let i=0;i<=n;i++){const t=i/n;rect(Z(a+(c1-a)*t),Z(b+(d-b)*t),2,2,c2);}},
      Q=(x,y,c2)=>rect(Z(x),Z(y),1,1,c2),HL=(x,y,w,c2)=>rect(Z(x),Z(y),Math.round(w*2),1,c2),VL=(x,y,h,c2)=>rect(Z(x),Z(y),1,Math.round(h*2),c2),CLR=(x,y,w,h)=>clear(Z(x),Z(y),w*2,h*2);
    // detrás del cuerpo
    if(L.ex==='drums'){for(let i=0;i<7;i++){const a=Math.PI*(.95+i/6*1.1);const dx=16+Math.cos(a)*15,dy=20+Math.sin(a)*13;EL(dx,dy,2.6,2.6,'#8a3a2a');EL(dx,dy,1.4,1.4,'#e8c86a');}LN(3,20,29,20,'#5a3a2a');}
    if(L.ex==='cape')for(let y=19;y<39;y++)RR(9-Math.floor((y-19)/6),y,14+Math.floor((y-19)/3),1,y%5?L.cc:shade(L.cc,-.15));
    if(L.hs==='long'&&!L.head)RR(10,9,12,15,hair);
    if(L.ex==='tail'){for(let i=0;i<10;i++)P(10-i*.6,34-i*.9-(i>6?(i-6)*.6:0),shade(L.h,-.1));}
    if(L.ex==='multiarm'){for(const[ax,ay,bx,by]of[[11,22,3,14],[21,22,29,14],[11,24,2,22],[21,24,30,22]]){LN(ax,ay,bx,by,skin);LN(ax,ay+1,bx,by+1,shade(skin,-.15));RR(bx-1,by-1,2,2,skin);}
      RR(1,10,1,5,'#c8ccd8');RR(30,10,1,5,'#c8ccd8');EL(2,22,1.5,1.5,C.gold);EL(30,22,1.5,1.5,'#e27aa8');}
    // piernas
    const lo=fr?2:0;
    RR(12-lo,33,3,8,skin);RR(18+lo,33,3,8,skin);RR(11-lo,41,5,2,'#6a4a2a');RR(17+lo,41,5,2,'#6a4a2a');RR(12-lo,38,3,1,'#6a4a2a');RR(18+lo,38,3,1,'#6a4a2a');
    // túnica
    for(let y=20;y<=36;y++){const half=Math.round(6+(y-20)*.3);RR(16-half,y,half*2,1,robe);}
    for(let y=21;y<=34;y+=1){RR(16+Math.round(2+(y-20)*.25),y,1,1,shade(robe,-.12));}
    RR(16-11,35,22,2,trim);RR(10,27,12,2,trim);LN(11,20,19,27,trim);
    // detalle 2×: pliegues, ribete y sandalias
    {const fold=shade(robe,-.16),hi=shade(robe,.12);for(const fx of[12.5,15,17.5,20])VL(fx,27.5+((fx*2)%3)*.5,7,fold);for(const fx of[13.5,18.5])VL(fx,29,5,hi);
     for(let x=6;x<27;x+=1.5)Q(x,35.5,shade(trim,-.3));HL(5,36.5,22,shade(trim,.2));HL(10,27,12,shade(trim,.25));Q(16,27.5,'#ffffff');Q(15.5,27.5,shade(trim,.35));
     const st='#3a2416';for(const lx of[12-lo,18+lo]){HL(lx,39.5,3,st);HL(lx,40.5,3,st);VL(lx+1.5,38.5,2,st);}}
    if(L.ex==='sash'){LN(10,22,24,30,'#e27aa8');LN(10,23,24,31,'#e27aa8');}
    if(light){for(let i=0;i<5;i++)RR(11+i*2,22+i%2,1,12,'#fff2c8');}
    // brazos
    const none=L.held==='none'||light;
    RR(7,21,3,9,skin);RR(7,30,3,2,skin);
    if(none){RR(22,21,3,9,skin);RR(22,30,3,2,skin);if(light||id==='jesus'){RR(5,29,2,2,skin);RR(25,29,2,2,skin);}}
    else{RR(22,21,3,5,skin);RR(23,18,3,4,skin);RR(23,17,3,2,shade(skin,-.08));}
    RR(9,20,4,2,shade(robe,.1));RR(19,20,4,2,shade(robe,.1));
    VL(7,21,9,shade(skin,.15));VL(9.5,21,9,shade(skin,-.18));HL(7,29.5,3,shade(skin,-.1));
    // cuello
    RR(14,18,4,3,shade(skin,-.08));
    // cabeza
    const hd=L.head;
    if(hd==='jackal'){const k=L.h;EL(16,12,5,5,k);RR(19,11,7,3,k);RR(24,13,2,1,INK);LN(12,8,11,0,k);LN(13,8,13,0,k);LN(18,8,19,0,k);LN(17,8,17,0,k);P(12,3,C.gold);P(18,3,C.gold);P(18,10,C.gold);P(19,10,INK);RR(11,17,10,2,C.gold);RR(11,18,10,1,C.sea);}
    else if(hd==='falcon'){const k=L.h;EL(16,11,6,6,k);EL(17,12,4,4,'#e8e0cc');RR(20,10,4,2,C.gold);P(23,12,C.gold);P(22,12,shade(C.gold,-.3));RR(17,10,2,2,INK);LN(17,12,15,16,INK);RR(9,11,2,9,'#2f4f9e');RR(21,13,2,6,'#2f4f9e');RR(9,14,2,1,C.gold);}
    else if(hd==='lion'){EL(16,12,8,8,L.h);EL(16,13,5,5,L.s);RR(13,11,2,1,C.gold);RR(18,11,2,1,C.gold);P(14,11,INK);P(19,11,INK);RR(15,14,3,2,'#6a3a2a');RR(15,17,3,1,'#8a2a1f');}
    else if(hd==='monkey'){EL(16,12,6,6,L.h);EL(9,12,2,2.5,L.h);EL(23,12,2,2.5,L.h);EL(16,13,4.5,4,L.s);RR(13,11,2,2,'#ffffff');RR(18,11,2,2,'#ffffff');P(14,12,INK);P(19,12,INK);RR(15,15,3,1,'#6a3a2a');}
    else if(light){for(let i=0;i<12;i++){const a=i/12*6.283;LN(16+Math.cos(a)*6,11+Math.sin(a)*6,16+Math.cos(a)*(i%2?11:9),11+Math.sin(a)*(i%2?11:9),i%2?'#f4d27a':'#fff6e0');}EL(16,11,6,6.5,'#fff6e0');EL(16,11,4,4.5,'#ffffff');}
    else{
      EL(16,12,6,6.5,skin);RR(9,11,1,3,skin);RR(22,11,1,3,skin);
      RR(12,11,2,2,'#ffffff');RR(18,11,2,2,'#ffffff');P(13,12,INK);P(19,12,INK);
      RR(12,10,2,1,shade(hair,-.1));RR(18,10,2,1,shade(hair,-.1));P(16,14,shade(skin,-.18));Q(16,13.5,shade(skin,.12));RR(15,16,3,.5,shade(skin,-.4));Q(15,16.5,shade(skin,-.15));Q(17.5,16.5,shade(skin,-.15));
      for(const ex of[12,18]){Q(ex+1,12,'#ffffff');Q(ex+1.5,12,L.eye||'#3a2a1a');Q(ex+1.5,12.5,INK);Q(ex+1,12.5,L.eye||'#3a2a1a');HL(ex-.5,10.5,2.5,shade(skin,-.45));Q(ex,11,'#e8e8f0');}
      HL(11,14,1.5,'#f0a090');HL(19.5,14,1.5,'#f0a090');VL(9.5,11.5,2,shade(skin,-.2));VL(22,11.5,2,shade(skin,-.2));
      // pelo
      const hs=L.hs;
      if(hs==='flame'){EL(16,7,6.5,4,hair);for(let i=0;i<6;i++)RR(10+i*2,1+(i%2)*2,2,5-(i%2)*2,i%2?'#7ad0ff':hair);}
      else if(hs!=='bald'){EL(16,7,6.8,4,hair);RR(9,7,2,5,hair);RR(21,7,2,5,hair);RR(12,7,8,1,shade(hair,.15));}
      if(hs!=='bald'&&hs!=='flame'){const hd2=shade(hair,-.22),hl2=shade(hair,.28);for(let i=0;i<6;i++){LN(11+i*2.2,4.5,10.5+i*2.2,7.5,hd2);}for(let i=0;i<5;i++)Q(12+i*2,4,hl2);HL(12.5,4.5,6,hl2);
        if(hs==='long'){for(const sx of[9,21.5])for(let y=8;y<12;y+=1)Q(sx+(y%2)*.5,y,hd2);}}
      if(hs==='bun')EL(16,2,3,2.5,hair);
      if(hs==='buns'){EL(10,4,2.5,2.5,hair);EL(22,4,2.5,2.5,hair);}
      if(hs==='spiky')for(let i=0;i<5;i++)LN(10+i*3,6,9+i*3,1,hair);
      if(hs==='bald')RR(12,6,8,1,shade(skin,.12));
      // barba
      if(L.b==='full'){EL(16,17,6,4.5,L.bc);RR(10,13,2,4,L.bc);RR(20,13,2,4,L.bc);const bd=shade(L.bc,-.2),bh=shade(L.bc,.22);for(let x=11;x<22;x+=1.5)VL(x,16.5+((x*2)%2)*.5,3,bd);for(let x=12;x<21;x+=3)VL(x+.5,17,2,bh);RR(15,16,3,.5,shade(L.bc,-.45));HL(14,19.5,4,bh);}
      if(L.b==='short'){EL(16,17.5,4,2.5,L.bc);RR(15,16,3,1,shade(skin,-.35));}
      // extras de cara
      if(L.ex==='eyepatch'){RR(12,10,3,3,INK);LN(9,9,22,8,INK);}
      if(L.ex==='thirdeye'){RR(16,8,1,2,C.blood);P(16,8,'#f8e060');}
      if(L.ex==='stripes'){RR(10,11,12,1,INK);RR(10,13,12,1,'#e8b53e');RR(10,15,12,1,INK);}
      if(L.ex==='mask'){for(const ex of[12,18]){RR(ex-1,10,4,1,'#2f4f9e');RR(ex-1,13,4,1,'#2f4f9e');RR(ex-1,10,1,4,'#2f4f9e');RR(ex+2,10,1,4,'#2f4f9e');}RR(14,17,5,2,'#e8e0cc');}
    }
    // tocado
    const gc=L.gc||C.gold;
    switch(L.gear){
    case'laurel':for(let i=0;i<7;i++){const x=10+i*2,y=6+(i===0||i===6?1:0);P(x,y,gc==='#e8b53e'?'#6f9a4c':gc);P(x+1,y-1,shade(gc==='#e8b53e'?'#6f9a4c':gc,.2));}break;
    case'crown':RR(10,4,12,2,gc);for(const x of[10,13,16,19,21])RR(x,1+(x===16?0:1),1,3,gc);P(16,4,C.blood);P(12,4,'#7de0ff');P(20,4,'#7de0ff');break;
    case'helmet':EL(16,7,7,5,gc);RR(9,7,14,1,shade(gc,-.2));RR(15,9,2,5,gc);RR(11,0,11,3,C.blood);RR(11,0,11,1,shade(C.blood,.2));CLR(12,10,2,2);CLR(18,10,2,2);RR(12,11,2,1,'#ffffff');RR(18,11,2,1,'#ffffff');break;
    case'horns':LN(11,6,8,1,gc);LN(12,6,9,1,gc);LN(21,6,24,1,gc);LN(20,6,23,1,gc);break;
    case'feathers':for(let i=-3;i<=3;i++){const tx=16+i*3,ty=Math.abs(i)<2?-0:1;LN(16,6,tx,ty,i%2?gc:shade(gc,.25));P(tx,ty,i%2?C.gold:C.blood);}RR(10,5,12,2,C.gold);P(13,5,C.sea);P(19,5,C.sea);break;
    case'sun':EL(16,3,3.5,3,C.gold);EL(16,3,2.2,1.8,'#f2622c');RR(11,6,10,1,C.gold);break;
    case'moon':EL(16,3,3.5,3,'#e8eef8');CLR(15,0,5,4);RR(14,0,1,1,'#e8eef8');RR(11,6,10,1,'#c8ccd8');break;
    case'halo':for(let i=0;i<16;i++){const a=i/16*6.283;P(16+Math.cos(a)*6,2+Math.sin(a)*1.6,'#f4d27a');}break;
    case'band':RR(10,6,12,2,gc);P(9,8,gc);P(22,8,gc);break;
    case'hat':RR(7,5,18,2,gc);EL(16,3,5,3,gc);RR(11,4,10,1,shade(gc,.2));break;
    case'diadem':RR(11,5,10,1,gc);P(16,4,gc);P(16,3,'#7de0ff');break;
    }
    // escudo en el brazo izquierdo
    if(L.ex==='shield'){EL(8,27,5,5.5,shade(trim,-.1));EL(8,27,3.6,4,trim);EL(8,27,1.5,1.5,C.gold);}
    // arma en la mano derecha (mano en 24,18)
    const wd=shade(hc,-.25),wl=shade(hc,.35),wood='#6a4a2a';
    switch(L.held){
    case'trident':RR(25,2,1,40,wd);RR(24,2,1,38,hc);RR(21,6,8,1,hc);RR(21,2,1,5,hc);RR(28,2,1,5,hc);P(21,1,wl);P(28,1,wl);P(24,0,wl);P(24,1,hc);break;
    case'bident':RR(24,3,1,39,hc);RR(25,3,1,39,wd);RR(21,6,7,1,hc);RR(21,1,1,6,hc);RR(27,1,1,6,hc);P(21,0,wl);P(27,0,wl);break;
    case'bolt':for(const[a,b2,c2,d]of[[27,1,22,10],[22,10,26,10],[26,10,21,21]]){LN(a,b2,c2,d,hc);LN(a+1,b2,c2+1,d,hc);}LN(27,2,23,10,'#ffffff');LN(25,11,22,19,'#ffffff');break;
    case'bow':for(let i=0;i<=24;i++){const t=i/24;P(25+Math.round(4*Math.sin(Math.PI*t)),6+i,i%3?hc:wd);}LN(25,6,25,30,'#e8e0cc');break;
    case'spear':RR(24,3,1,40,wood);RR(25,3,1,40,shade(wood,-.2));RR(23,0,3,4,hc);P(24,-0,wl);RR(23,4,3,1,C.gold);break;
    case'hammer':RR(24,14,2,14,wood);RR(20,8,10,7,hc);RR(20,8,10,1,wl);RR(20,14,10,1,wd);RR(22,10,1,3,'#c9a15a');RR(27,10,1,3,'#c9a15a');break;
    case'axe':RR(24,6,2,26,wood);EL(28,10,3,4.5,hc);RR(26,6,1,8,wd);P(29,7,wl);break;
    case'doubleaxe':RR(24,4,2,28,wood);EL(20.5,9,3,4,hc);EL(29.5,9,3,4,hc);P(19,6,wl);P(31,6,wl);RR(23,8,4,2,C.gold);break;
    case'club':RR(24,14,2,14,wood);EL(25,10,3.5,4.5,hc);P(24,7,wl);break;
    case'mace':RR(24,14,2,14,shade(hc,-.4));EL(25,10,3.5,3.5,hc);for(const[a,b2]of[[25,5],[21,10],[29,10],[25,14]])P(a,b2,wl);break;
    case'sword':RR(24,1,2,16,hc);P(24,0,wl);RR(25,1,1,16,wd);RR(21,17,8,1,C.gold);RR(24,18,2,3,wood);break;
    case'katana':for(let i=0;i<18;i++){P(24+Math.round(i*.22),17-i,hc);P(25+Math.round(i*.22),17-i,wl);}RR(22,18,6,1,C.gold);RR(24,19,2,4,'#3a2a5a');break;
    case'khopesh':RR(24,16,2,6,wood);for(let i=0;i<10;i++)RR(25+Math.round(Math.sin(i/9*2.4)*4),15-i,2,1,hc);RR(24,5,3,1,hc);break;
    case'machete':for(let i=0;i<12;i++)RR(24+Math.round(i*.15),4+i,3,1,i<2?wl:hc);RR(24,16,2,5,wood);break;
    case'staff':RR(24,0,2,42,hc);RR(25,0,1,42,wd);EL(25,1,2.5,2.5,id==='wukong'?C.gold:wl);if(id==='quetzalcoatl'){for(let i=0;i<5;i++)P(22+i,2+i%2,C.gold);}if(id==='ra'){RR(24,1,4,1,hc);P(27,2,hc);}break;
    case'orb':for(let i=0;i<10;i++){const a=i/10*6.283;P(25+Math.cos(a)*5,13+Math.sin(a)*5,shade(hc,.2));}EL(25,13,3.5,3.5,hc);EL(24,12,1.5,1.5,wl);P(24,11,'#ffffff');break;
    case'disc':for(let i=0;i<20;i++){const a=i/20*6.283;P(25+Math.cos(a)*4.5,12+Math.sin(a)*4.5,hc);P(25+Math.cos(a)*3.5,12+Math.sin(a)*3.5,wd);}for(let i=0;i<4;i++){const a=i/4*6.283;LN(25,12,25+Math.cos(a)*3,12+Math.sin(a)*3,wl);}RR(24,16,2,3,skin);break;
    case'mirror':EL(26,14,4.5,4.5,C.gold);EL(26,14,3.5,3.5,hc);P(25,12,'#ffffff');P(24,13,'#ffffff');RR(25,18,2,4,wood);break;
    case'net':for(let i=0;i<=8;i+=2){LN(20,8+i,30,8+i,hc);LN(20+i+1,8,20+i+1,16,hc);}break;
    case'sling':LN(24,18,28,8,'#c8a878');LN(26,18,29,9,'#c8a878');EL(28.5,7,2,2,hc);P(28,6,'#ffffff');break;
    case'ball':EL(26,15,3.5,3.5,'#3a2a1a');P(25,13,'#7a5a3a');P(26,13,'#7a5a3a');break;
    }
  });
  return variants(hiPaint(c,light?'#b8862f':INK));
}
const GSPR={};
function godSprites(id){if(!GSPR[id])GSPR[id]=[drawGod(id,0),drawGod(id,1)];return GSPR[id];}

/* ---------- enemigos: arte base + escalado EPX ---------- */
function enemyBase(d,fr){
  const c=d.col,a=d.acc,hi=shade(c,.25),lw=shade(c,-.3),bone='#e8e0cc';
  switch(d.arch){
  case'blob':return fromFn(12,13,({put,rect,ell})=>{ell(6,5,5,5,c);rect(1,5,10,5,c);for(let i=0;i<5;i++)rect(1+i*2,10,1,2+((i+fr)%2),c);rect(3,1,5,1,hi);
    if(d.feat==='hair'){rect(1,0,10,3,'#14100e');rect(1,3,2,8,'#14100e');rect(9,3,2,8,'#14100e');}
    if(d.feat==='flame'){rect(4,0,1,2,a);rect(6,0,1,1,a);rect(7,0,1,2,a);}
    rect(4,5,1,2,a);rect(7,5,1,2,a);});
  case'flyer':return fromFn(16,11,({put,rect,ell})=>{for(let i=0;i<6;i++){const o=fr?Math.round(i*.5):-Math.round(i*.6);rect(1+i,4+o,1,2,c);rect(14-i,4+o,1,2,c);}
    ell(8,5,3,3,c);rect(7,8,1,2,lw);rect(9,8,1,2,lw);put(7,4,a);put(9,4,a);rect(7,3,3,1,hi);
    if(d.feat==='beak')rect(10,5,3,1,a);if(d.feat==='ears'){put(6,1,c);put(10,1,c);}});
  case'beast':return fromFn(16,11,({put,rect,ell})=>{ell(7,5,6,3,c);rect(2,3,10,1,hi);ell(13,3,3,3,c);rect(14,4,2,2,c);put(13,2,a);
    const l=fr?1:0;rect(3+l,8,1,3,lw);rect(5-l,8,1,3,lw);rect(9+l,8,1,3,lw);rect(11-l,8,1,3,lw);rect(0,3,2,1,c);
    if(d.feat==='horns'){put(11,0,bone);put(12,0,bone);put(15,0,bone);put(15,1,bone);}
    if(d.feat==='tails'){rect(0,1,2,1,a);rect(0,5,2,1,a);put(1,0,a);}
    if(d.feat==='ears'){put(12,0,c);put(14,0,c);}});
  case'humanoid':return fromFn(11,15,({put,rect,ell})=>{const sk=d.feat==='skull';ell(5,3,3,3,sk?bone:c);rect(3,6,5,5,c);rect(3,6,5,1,hi);const l=fr?1:0;
    if(d.feat==='hop'){rect(0,7,3,1,c);rect(8,7,3,1,c);rect(3,11,2,3,lw);rect(6,11,2,3,lw);rect(4,1,3,2,a);}else{rect(2,7,1,3,c);rect(8,7,1,3,c);rect(3+l,11,2,3,lw);rect(6-l,11,2,3,lw);}
    put(4,3,sk?INK:a);put(6,3,sk?INK:a);
    if(d.feat==='helmet'){rect(2,0,7,2,a);rect(5,0,1,1,shade(a,.3));}
    if(d.feat==='horns'){put(2,0,bone);put(8,0,bone);put(2,1,bone);put(8,1,bone);}
    if(sk){rect(3,7,5,1,bone);rect(3,9,5,1,bone);}
    if(d.feat==='stinger'){put(9,5,a);put(10,4,a);put(10,3,a);}
    if(d.feat==='spear'){rect(9,1,1,12,'#8a6a3a');put(9,0,'#c8c8c8');}});
  case'giant':return fromFn(18,20,({put,rect,ell})=>{ell(9,9,8,7,c);rect(4,4,10,1,hi);const l=fr?1:0;rect(4+l,15,4,4,lw);rect(10-l,15,4,4,lw);rect(0,7,2,6,c);rect(16,7,2,6,c);
    if(d.feat==='oneeye'){ell(9,6,3,2,C.bone);put(9,6,a);put(9,7,a);}else{put(7,6,a);put(11,6,a);}
    if(d.feat==='horns'){put(5,1,bone);put(4,0,bone);put(13,1,bone);put(14,0,bone);}rect(7,10,5,1,lw);});
  default:return fromFn(16,9,({put,rect,ell})=>{ell(8,4,6,2,c);rect(3,3,10,1,hi);const l=fr?1:0;for(let i=0;i<4;i++){put(4+i*2,7+((i+l)%2),lw);put(4+i*2,1-((i+l)%2),lw);}
    if(d.feat==='tail'){put(1,4,c);put(0,3,c);put(0,2,c);put(1,1,a);}else{rect(13,3,3,2,c);put(15,3,a);}put(12,3,a);});
  }
}
function hiSprite(base,ol){return variants(hiPaint(epx(epx(base)),ol));}
const ESPR={};
function enemySprites(key){if(ESPR[key])return ESPR[key];const d=ENEMIES[key];const ol=lum(d.col)<.2?shade(d.col,.55):INK;ESPR[key]=[0,1].map(fr=>hiSprite(enemyBase(d,fr),ol));return ESPR[key];}
const MISC={};
function miscSprites(){
  if(MISC.done)return MISC;
  const rows=(rs,pal)=>fromFn(Math.max(...rs.map(r=>r.length)),rs.length,({put})=>{rs.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch!=='.')put(i,j,pal[ch]);}});});
  const P={k:INK,b:C.bone,g:C.gold,r:C.blood,s:C.sea,p:C.purple,w:'#ffffff',y:'#f4d27a',t:'#6a4a2a',n:'#2a2a33'};
  MISC.skull=hiSprite(rows([".bbbbb.","bbbbbbb","bkbbbkb","bkbbbkb","bbbbbbb",".bbkbb.",".b.b.b."],P),C.purple);
  MISC.dove=hiSprite(rows(["w.....w","ww...ww",".wwwww.","..wwwg.","...ww.."],P),'#b8b0a0');
  MISC.crow=hiSprite(rows(["n.....n","nn...nn",".nnnnn.","..nnng.","...nn.."],P),'#5a5a6a');
  MISC.pom=hiSprite(rows(["..kk..",".rrrr.","rrbrrr","rrrrrr","rrrrrr",".rrrr."],P),INK);
  MISC.llama=hiSprite(rows(["........ww","........wwk",".......www","wwwwwwwww.","wwwrwswww.","wwwwwwwww.",".w.w..w.w.",".w.w..w.w."],P),'#8a8070');
  MISC.lion=[0,1].map(fr=>hiSprite(enemyBase({arch:'beast',col:'#d8a02a',acc:INK,feat:''},fr),INK));
  MISC.dog=[0,1].map(fr=>hiSprite(enemyBase({arch:'beast',col:'#e8e0cc',acc:INK,feat:'ears'},fr),INK));
  MISC.done=true;return MISC;}

/* ---------- jefes (dibujo por cuadro) ---------- */
let BOSSDRAW=false;
function drawBoss(e,x,y){
  const d=e.d,fl=e.flash>0,c=fl?'#fff6e0':(e.corrupt?shade(d.col,-.25):d.col),a=d.acc,s=Math.round(e.r/S),cd=shade(c,-.22),ch=shade(c,.2);
  const f=e.face||1;
  if(e.corrupt)dither(x,y,s+6,'#b07aff',3);
  switch(d.arch){
  case'hundred':{for(let i=0;i<14;i++){const ang=i/14*6.283+Math.sin(T*2+i)*.3,L=s+7+Math.sin(T*4+i*1.7)*3,ex=x+Math.cos(ang)*L,ey=y+Math.sin(ang)*L;line(x+Math.cos(ang)*s*.6,y+Math.sin(ang)*s*.6,ex,ey,cd,2);ellD(ex,ey,1.5,1.5,c);}
    ellD(x,y,s,s*.85,c);ellD(x,y-2,s*.7,s*.5,ch);for(let i=0;i<5;i++){const hx=x-8+i*4,hy=y-s+1-(i%2);ellD(hx,hy,2.2,2.2,c);R(hx,hy,1,1,a);}break;}
  case'gorgon':{ellD(x,y+5,s,s*.5,cd);ellD(x,y+3,s*.7,s*.35,c);ellD(x,y-3,s*.45,s*.55,c);const hy=y-s*.75;
    for(let i=0;i<9;i++){const ang=-Math.PI+i/8*Math.PI;let px=x,py=hy;for(let j=1;j<=6;j++){const w=Math.sin(T*6+i+j)*1.2;px=x+Math.cos(ang)*(3+j)+Math.cos(ang+1.57)*w;py=hy+Math.sin(ang)*(3+j)+Math.sin(ang+1.57)*w;R(px,py,1,1,'#3a8a3a');}R(px,py,1,1,'#b3301f');}
    ellD(x,hy,3.5,3.5,'#a8c08a');R(x-2,hy,1,1,a);R(x+1,hy,1,1,a);break;}
  case'beast':{const n=d.heads||1,l=Math.sin(T*8)>0?1:0;R(x-s*.7+l,y+s*.35,3,s*.5,cd);R(x-s*.3-l,y+s*.35,3,s*.5,cd);R(x+s*.2+l,y+s*.35,3,s*.5,cd);R(x+s*.55-l,y+s*.35,3,s*.5,cd);
    ellD(x,y,s,s*.6,c);R(x-s*.8,y-s*.5,s*1.4,1,ch);
    for(let i=0;i<n;i++){const hx=x+f*s*.85,hy=y-s*.35+(i-(n-1)/2)*6;ellD(hx,hy,4.5,3.8,c);R(hx+(f>0?3:-6),hy,3,2,c);R(hx+f*1,hy-1,1,1,a);R(hx+f*3,hy-1,1,1,a);
      if(d.feat==='horns'){R(hx-2,hy-6,1,3,'#e8e0cc');R(hx+2,hy-6,1,3,'#e8e0cc');}
      if(d.feat==='mane')ringD(hx,hy,5,a);}
    break;}
  case'serpent':{if(d.feat==='double'){triD(x-s,y,x-s*2.2,y-s*1.2+Math.sin(T*6)*3,x-s*.3,y-s*.4,shade(a,-.1));triD(x+s,y,x+s*2.2,y-s*1.2+Math.sin(T*6)*3,x+s*.3,y-s*.4,shade(a,-.1));}
    ellD(x,y,s,s,c);ellD(x,y,s*.6,s*.5,ch);R(x-3,y-2,2,2,a);R(x+2,y-2,2,2,a);R(x-2,y+s-2,1,2,'#f2e3c6');R(x+2,y+s-2,1,2,'#f2e3c6');break;}
  case'hydra':{const n=d.heads||3;ellD(x,y+4,s,s*.7,c);ellD(x,y+2,s*.7,s*.4,ch);
    for(let i=0;i<n;i++){const ang=-Math.PI/2+(i-(n-1)/2)*(2.6/n),L=s+8+Math.sin(T*3+i)*3,ex=x+Math.cos(ang)*L+Math.sin(T*2+i*2)*2,ey=y+Math.sin(ang)*L;line(x+Math.cos(ang)*s*.4,y+Math.sin(ang)*s*.3,ex,ey,cd,3);ellD(ex,ey,3,2.5,c);R(ex-1,ey-1,1,1,a);R(ex+1,ey-1,1,1,a);}
    break;}
  case'lord':{const n=d.heads||1;ellD(x,y+4,s*.75,s*.75,c);R(x-s*.75,y+2,s*1.5,1,ch);const sw=Math.sin(T*3)*3;line(x-s*.6,y,x-s*1.1,y+4+sw,cd,3);line(x+s*.6,y,x+s*1.1,y+4-sw,cd,3);
    const hy=y-s*.6;const skull=d.feat==='skull',hc=skull?'#e8e0cc':shade(c,.1);
    if(d.feat==='headless'){R(x-2,hy+2,4,2,cd);dither(x+s*.9,y-2,3,'#9ad0e8',1);}
    else if(n>2){for(let i=0;i<n;i++){const hx=x+(i-(n-1)/2)*4,hh=hy-2+Math.abs(i-(n-1)/2)*.5;ellD(hx,hh,2.2,2.4,hc);R(hx,hh,1,1,a);}}
    else for(let i=0;i<n;i++){const hx=x+(n>1?(i?6:-6):0);ellD(hx,hy,4.5,4.5,hc);
      if(d.feat==='oneeye'){const open=e.pi%2===1?1:.3;ellD(hx,hy,3,2.4*open,'#f2e3c6');R(hx,hy,1,1,a);}
      else{R(hx-2,hy-1,skull?2:1,skull?2:1,skull?INK:a);R(hx+1,hy-1,skull?2:1,skull?2:1,skull?INK:a);if(skull)R(hx-1,hy+2,3,1,INK);}
      if(d.feat==='horns'){line(hx-3,hy-3,hx-6,hy-7,'#e8e0cc');line(hx+3,hy-3,hx+6,hy-7,'#e8e0cc');}}
    break;}
  case'flyer':{const fl2=Math.sin(T*8)*s*.4,span=s*1.8;const wc=d.feat==='butterfly'?shade(c,.1):cd;
    triD(x,y,x-span,y-s*.6+fl2,x-s*.4,y+s*.6,wc);triD(x,y,x+span,y-s*.6+fl2,x+s*.4,y+s*.6,wc);
    if(d.feat==='butterfly'){triD(x,y+2,x-span*.8,y+s*.9-fl2*.5,x-2,y+s,shade(c,.2));triD(x,y+2,x+span*.8,y+s*.9-fl2*.5,x+2,y+s,shade(c,.2));for(let i=0;i<6;i++){R(x-span+i*3,y-s*.6+fl2+i,1,1,a);R(x+span-i*3,y-s*.6+fl2+i,1,1,a);}}
    ellD(x,y,s*.45,s*.6,c);R(x-2,y-s*.3,1,1,a);R(x+1,y-s*.3,1,1,a);
    if(d.feat==='bat'){R(x-3,y-s*.8,1,3,c);R(x+2,y-s*.8,1,3,c);}if(d.feat==='bird'||d.feat==='dragon')R(x+(f>0?3:-7),y-s*.2,4,2,a);break;}
  case'titan':{const pal=['#b07aff','#5a3a9a','#e27aa8','#7de0ff','#3a2a5a'];for(let i=0;i<60;i++){const ang=T*.8+i*.41,rr=s*(.35+(i%12)/12*.95);R(x+Math.cos(ang)*rr,y+Math.sin(ang)*rr*.85,2,2,pal[i%pal.length]);}
    ellD(x,y,s*.62,s*.62,'#050308');ringD(x,y,s*.62,'#b07aff');for(let i=0;i<7;i++){const ang=T*.3+i*.9,ex=x+Math.cos(ang)*s*.4,ey=y+Math.sin(ang)*s*.35;ellD(ex,ey,2.2,1.6,'#f2e3c6');R(ex,ey,1,1,'#b07aff');}break;}
  }
  if(e.charge>0||e.chargeDelay>0)R(x-1,y-s-4,3,3,C.blood);
}
function segSprite(col,acc){const base=fromFn(14,14,({ell,rect})=>{ell(7,7,6.5,6.5,col);ell(7,6,4,3,shade(col,.18));rect(6,1,2,2,acc);});return hiSprite(base,INK);}

/* ---------- números pixel ---------- */
const DIG={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001001001001','8':'111101111101111','9':'111101111001111','+':'000010111010000'};
function pixNum(g,str,x,y,col,k){let ox=Math.round(x-(str.length*4-1)*k/2);y=Math.round(y);
  for(const ch of str){const m=DIG[ch];if(m){g.fillStyle=INK;for(let i=0;i<15;i++)if(m[i]==='1')g.fillRect(ox+(i%3)*k+k,y+((i/3)|0)*k+k,k,k);g.fillStyle=col;for(let i=0;i<15;i++)if(m[i]==='1')g.fillRect(ox+(i%3)*k,y+((i/3)|0)*k,k,k);}ox+=4*k;}}
