/* Bonk de los Dioses · lógica de juego en 3D */
'use strict';
let state='menu',G=null,players=[],npcs=[],enemies=[],proj=[],bullets=[],gems=[],heals=[],drops=[],fx=[],texts=[],allies=[],patches=[],coins=[];
const cfg={mode:'ragnarok',party:'solo',picks:[],realm:'tartaro',diff:'normal',qTest:'azar'};
const DIFF={normal:{name:'Normal',hp:1.1,dmg:1.1,sp:1.05,el:1,rew:1,ev:1},dificil:{name:'Difícil',hp:1.7,dmg:1.5,sp:1.3,el:2,rew:1.6,ev:1.35},pesadilla:{name:'Pesadilla',hp:2.6,dmg:2,sp:1.6,el:3,rew:2.5,ev:1.7}};
function DF(){return DIFF[(G&&G.diffKey)||'normal']||DIFF.normal;}
const VIEW=560,GRAV=1150,JUMP=440;

function makePlayer(id,ctrl,i){
  const g=GOD[id];
  const p={god:id,g,ctrl,idx:i,x:i*40-20,y:60,z:0,vz:0,air:false,r:14,hp:g.hp,maxHp:g.hp,speed:g.spd*1.15,armor:0,regen:0,steal:0,dmgMul:1,cdMul:1,area:1,magnet:80,xpMul:1,countBonus:0,chainBonus:0,crit:0,bossDmg:0,execute:0,stunChance:0,confuse:0,slowAura:0,healMul:1,dropMul:1,powCdMul:1,lives:0,reviveMul:1,markMul:1,range:1,luck:0,nectar:1,nectarCd:0,
    fx:0,fy:-1,step:0,moving:false,inv:0,pow:4,hidden:0,radiant:0,shield:0,rage:0,giant:0,crown:0,charging:0,cvx:0,cvy:0,chHit:null,bond:false,frenzy:0,frenzyT:0,
    down:false,revive:0,weapons:{},passives:{},items:{},kills:0,mk:0,say:'',sayT:0,col:['#e8b53e','#7de0ff','#c8a0ff'][i]||C.bone,aiT:0,aiTx:0,aiTy:0,jumpQ:false,
    goldMul:1,evasion:0,thorns:0,extraJumps:0,jumpsLeft:0,critDmg:1,invBonus:0,pocketBolt:0,pbT:8,levelHeal:false,dashT:0,dashCd:0,powSeq:0,wantE:false};
  g.set(p);if(ctrl==='p1'||ctrl==='p2')applyUpgrades(p);p.hp=p.maxHp;
  p.weapons[g.w]={lvl:1,t:.3,ang:0,tick:0,acc:0};
  return p;
}
function relOf(a,b){for(const r of REL){if((r[0]===a&&r[1]===b)||(r[0]===b&&r[1]===a))return{type:r[2],a:r[0],la:r[3],lb:r[4],combo:r[5]||''};}return null;}
function needFor(l){return Math.floor(5+l*4+l*l*.65);}

function weekEvent(){const wk=Math.floor((Date.now()/864e5+3)/7);const ks=Object.keys(REALMS).filter(k=>k!=='vacio'&&k!=='cielo');const realm=ks[(wk*7+3)%ks.length];const ends=(wk+1)*7*864e5-3*864e5;return{realm,ends,wk};}
function newRun(){setTimeout(focusGame,0);
  allies=[];npcs=[];
  players=cfg.picks.map((pk,i)=>makePlayer(pk.id,pk.ctrl,i));if(cfg.party!=='online'){remotes=[];}
  G={mode:cfg.mode,score:0,combo:0,comboT:0,bestCombo:0,wave:1,waveT:0,lowTip:0,t:0,kills:0,level:1,xp:0,need:needFor(1),pending:0,queue:[],ridx:0,visited:[],realm:null,rt:0,events:[],bosses:[],portals:null,cycle:0,
    lastPow:[-99,-99],duelT:60,conc:{},trueT:4,warKills:0,rel:players.length>1?relOf(players[0].god,players[1].god):null,coop:players.filter(p=>p.ctrl!=='ai').length>1,yaw:0,pitch:.82,zoom:1,online:cfg.party==='online',itemQueue:[],money:0,diffKey:cfg.diff||'normal',evT:40,slowT:0,darkT:0,sandT:0,bossKeys:[],khaosHard:false,gold:0,goldTotal:0,chestsBought:0,boltQ:[],shake:0,flashT:0,stormT:0,curse:0,challenge:null,dmgTotal:0,dmgWin:[],streak:0,streakT:0,bestStreak:0,bossKills:0,mapScore:{},realmScore:0,noHitT:0,chestsOpened:0,elites:0,missionsDone:0};
  applyTheme(players[0].g.pan);
  startRealm(cfg.realm);
  show(null);buildHud();$('hud').hidden=false;state='play';
}
function startRealm(key){
  if(G.realm)G.mapScore[G.realm]=Math.max(G.mapScore[G.realm]||0,G.realmScore);G.realmScore=0;
  G.realm=key;G.rt=0;G.visited.push(key);G.portals=null;G.bosses=[];
  enemies=[];bullets=[];proj=[];patches=[];fx=[];texts=[];npcs=[];
  for(const gm of gems)G.xp+=gm.v;gems=[];heals=[];drops=[];for(const c of coins)addGold(c.v,players[0]);coins=[];G.boltQ=[];G.challenge=null;allies=allies.filter(a=>a.type==='dog');
  buildWorld(key);clearObjs();
  const[sx,sy]=spawnPt(key);questsStart(key);
  players.forEach((p,i)=>{p.x=sx+i*40-20;p.y=sy;p.z=surfaceAt(p.x,p.y);p.vz=0;if(p.down){p.down=false;p.hp=p.maxHp*.4;}p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.3);p.inv=2;});
  for(const p of players)if(p.dog&&!allies.some(a=>a.type==='dog'&&a.o===p))allies.push(mkAlly('dog',p,p.x,p.y,Infinity));
  G.diff=1+G.ridx*.7;
  const r=REALMS[key];
  if(key==='vacio'){const prev=G.visited.filter(v=>v!=='vacio');{const rr=REALMS[pick(prev.length?prev:['tartaro'])];G.events=[{t:80,key:pick(rr.bosspool||[rr.boss]),corrupt:true},{t:180,key:'khaos'}];}}
  else{const[m1,m2]=shuffle((r.minipool||r.minis).slice());G.events=[{t:120,key:m1},{t:240,key:m2||m1},{t:360,key:pick(r.bosspool||[r.boss])}];if(G.mode==='libre'&&(G.wave||1)>1)G.events.forEach(ev=>ev.t*=.7);scheduleNemesis();}
  G.missions=shuffle(RUN_MISSIONS.slice()).slice(0,3).map(m=>({id:m.id,n:pick(m.n),prog:0,done:false,rew:m.rew,txt:''}));G.missions.forEach(m=>{m.txt=RUN_MISSIONS.find(x=>x.id===m.id).txt(m.n);});G.noHitT=0;
  bigBanner(r.name,r.sub);
  if(REALM_STORY[key]&&key!=='cielo')setTimeout(()=>{if(state==='play'&&G.realm===key)banner(REALM_STORY[key]);},3600);
  if(key==='cielo')setTimeout(()=>cieloVoice(),3400);
  if(G.ridx===0&&players.length>1)introLines();
}
function cieloVoice(){if(state!=='play'||G.realm!=='cielo')return;const ps=players.map(p=>p.god);
  if(ps.includes('dios'))bigBanner('«BIENVENIDOS A CASA»','Los cielos reconocen a su Creador');
  else if(ps.includes('zeus'))bigBanner('«ZEUS, AQUÍ EL TRONO YA TIENE DUEÑO»','Una voz retumba entre las nubes');
  else bigBanner(`«BIENVENIDO A MIS CIELOS, ${players[0].g.name.toUpperCase()}»`,'Una voz retumba entre las nubes');}
function introLines(){const[a,b]=players;const rl=G.rel;
  if(rl){const la=rl.a===a.god?rl.la:rl.lb,lb=rl.a===a.god?rl.lb:rl.la;say(a,la,.2);say(b,lb,2.4);}
  else{const l=pick(LINES.neutral);say(a,l[0],.2);say(b,l[1],2.4);}}

/* ---------- entrada ---------- */
const keys=new Set();let joy=null,look=null;
const KEYALT={w:'KeyW',a:'KeyA',s:'KeyS',d:'KeyD',q:'KeyQ',e:'KeyE',r:'KeyR',f:'KeyF',t:'KeyT',p:'KeyP',' ':'Space',arrowup:'ArrowUp',arrowdown:'ArrowDown',arrowleft:'ArrowLeft',arrowright:'ArrowRight',escape:'Escape',enter:'Enter',shift:'ShiftLeft'};
function kcode(ev){let c=ev.code;if(!c||c==='Unidentified'){c=KEYALT[(ev.key||'').toLowerCase()]||'';}return c;}
function typingIn(ev){const t=ev.target;return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);}
const KEYSEEN=new WeakSet();
function onKeyDown(ev){if(KEYSEEN.has(ev))return;KEYSEEN.add(ev);if(typingIn(ev)&&state!=='play')return;const code=kcode(ev);
  keys.add(code);if(ev.key&&ev.key.length===1){const alt=KEYALT[ev.key.toLowerCase()];if(alt)keys.add(alt);}
  if(state==='levelup'&&/^Digit[1-3]$|^Numpad[1-3]$/.test(code)){const n=+code.slice(-1);const bt=$('cards').children[n-1];if(bt)bt.click();}
  if(state==='levelup'&&G&&G.shopOpen&&code==='Escape'){closeShop();return;}
  if(code==='Escape'||code==='KeyP'){if(state==='play')pause(true);else if(state==='pause')pause(false);}
  if(state==='play'&&!ev.repeat){const p1=players.find(p=>p.ctrl==='p1'),p2=players.find(p=>p.ctrl==='p2');
    if(code==='Space'&&p1)jump(p1);
    if((code==='KeyR'||code==='KeyF')&&p1)usePower(p1);
    if(code==='ShiftLeft'&&p1)slide(p1);
    if(code==='KeyE'&&p1)p1.wantE=true;
    if((code==='Minus'||code==='NumpadSubtract'))G.zoom=clamp(G.zoom*1.15,.5,3.6);if((code==='Equal'||code==='NumpadAdd'))G.zoom=clamp(G.zoom/1.15,.5,3.6);

    if(code==='KeyT'&&p1&&G&&G.online){p1.emote=pick(['¡Vamos!','¡Ayuda!','¡Bien!','GG','¡Por aquí!']);p1.emoteT=Date.now();say(p1,p1.emote);}
    if((code==='ShiftRight'||code==='Numpad0'||code==='Period')&&p2)jump(p2);
    if((code==='Enter'||code==='NumpadEnter')&&p2)usePower(p2);
    if(code==='ControlRight'&&p2)slide(p2);
    if(!G.coop&&(code==='Enter')&&p1)usePower(p1);}
  if((code.startsWith('Arrow')||code==='Space')&&state==='play')ev.preventDefault();
}
function onKeyUp(ev){const code=kcode(ev);keys.delete(code);if(ev.key&&ev.key.length===1){const alt=KEYALT[ev.key.toLowerCase()];if(alt)keys.delete(alt);}if(code==='ShiftLeft'||code==='ShiftRight'){keys.delete('ShiftLeft');keys.delete('ShiftRight');}}
for(const t of[window,document]){t.addEventListener('keydown',onKeyDown,true);t.addEventListener('keyup',onKeyUp,true);}
function focusGame(){try{cv.focus({preventScroll:true});}catch(_){}try{window.focus();}catch(_){}}

addEventListener('blur',()=>{keys.clear();});
addEventListener('contextmenu',ev=>{if(state==='play')ev.preventDefault();});
function bindPointer(el){
  el.addEventListener('pointerdown',ev=>{focusGame();if(state!=='play')return;const left=ev.clientX<innerWidth*.5;
    if(ev.pointerType==='touch'&&left&&!joy){joy={id:ev.pointerId,ox:ev.clientX,oy:ev.clientY,x:ev.clientX,y:ev.clientY};}
    else if(!look){look={id:ev.pointerId,x:ev.clientX};}
    try{el.setPointerCapture(ev.pointerId);}catch(_){}});
  el.addEventListener('pointermove',ev=>{if(joy&&ev.pointerId===joy.id){joy.x=ev.clientX;joy.y=ev.clientY;}if(look&&ev.pointerId===look.id&&G){G.yaw-=(ev.clientX-look.x)*.006;look.x=ev.clientX;}});
  const up=ev=>{if(joy&&ev.pointerId===joy.id)joy=null;if(look&&ev.pointerId===look.id)look=null;};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);}
let padPrev=[{},{}];
function pads(){let list=[];try{list=[...(navigator.getGamepads?navigator.getGamepads():[])].filter(Boolean);}catch(err){}return list;}
function moveInput(p){
  let mx=0,my=0;const coop=G.coop;
  if(p.ctrl==='p1'){if(keys.has('KeyW'))my--;if(keys.has('KeyS'))my++;if(keys.has('KeyA'))mx--;if(keys.has('KeyD'))mx++;
    if(!coop){if(keys.has('ArrowUp'))my--;if(keys.has('ArrowDown'))my++;if(keys.has('ArrowLeft'))mx--;if(keys.has('ArrowRight'))mx++;}
    if(keys.has('KeyQ'))G.yaw+=1.8/60;if(keys.has('KeyC'))G.yaw-=1.8/60;
    if(joy){const dx=joy.x-joy.ox,dy=joy.y-joy.oy,d=Math.hypot(dx,dy);if(d>8){const m=Math.min(1,d/50);mx=dx/d*m;my=dy/d*m;}}}
  if(p.ctrl==='p2'){if(keys.has('ArrowUp'))my--;if(keys.has('ArrowDown'))my++;if(keys.has('ArrowLeft'))mx--;if(keys.has('ArrowRight'))mx++;}
  const ps=pads();let pi=-1;if(p.ctrl==='p1')pi=coop&&ps.length===1?-1:0;if(p.ctrl==='p2')pi=ps.length===1?0:1;
  const pad=pi>=0?ps[pi]:null;
  if(pad){const ax=pad.axes[0]||0,ay=pad.axes[1]||0;if(Math.hypot(ax,ay)>.2){mx=ax;my=ay;}const rx=pad.axes[2]||0;if(Math.abs(rx)>.25&&p.ctrl==='p1')G.yaw-=rx*.04;
    const pv=padPrev[p.idx]||{},b0=!!(pad.buttons[0]&&pad.buttons[0].pressed),b2=!!((pad.buttons[2]&&pad.buttons[2].pressed)||(pad.buttons[1]&&pad.buttons[1].pressed));
    if(b0&&!pv.b0)jump(p);if(b2&&!pv.b2)usePower(p);padPrev[p.idx]={b0,b2};}
  // relativo a la cámara
  const sy=Math.sin(G.yaw),cy=Math.cos(G.yaw);const wx=mx*cy+my*sy,wy=-mx*sy+my*cy;
  return[wx,wy];
}
function jump(p){if(!p||p.down)return;if(!p.air){p.vz=JUMP*(p.giant>0?1.15:1);p.air=true;p.jumpsLeft=p.extraJumps;}else if(p.jumpsLeft>0){p.jumpsLeft--;p.vz=JUMP*.85;for(let i=0;i<6;i++)fx.push({k:'p',x:p.x,y:p.y,z:p.z,vx:rand(-50,50),vy:rand(-50,50),vz:rand(-40,10),t:.4,c:'#ffffff'});}}
function slide(p){if(!p||p.down||p.dashCd>0)return;p.dashT=.22;p.dashCd=1.1;p.inv=Math.max(p.inv,.25);for(let i=0;i<5;i++)fx.push({k:'p',x:p.x,y:p.y,z:p.z+4,vx:rand(-30,30),vy:rand(-30,30),vz:rand(10,60),t:.35,c:'#e8e0cc'});}
function glideHeld(p){if(p.ctrl==='p1')return keys.has('Space')||TOUCH_JUMP_HELD;if(p.ctrl==='p2')return keys.has('Numpad0')||keys.has('ShiftRight');return false;}
let TOUCH_JUMP_HELD=false;

/* ---------- UI general ---------- */
const OVS=['menu','levelup','pause','end'];
let LOCK_WANT=false;
function show(id){for(const o of OVS)$(o).hidden=o!==id;if(id!=='menu'&&$('home')&&!$('home').hidden){$('home').hidden=true;$('menu').style.visibility='';}
  if(id&&document.pointerLockElement){LOCK_WANT=true;try{document.exitPointerLock();}catch(_){}}
  if(!id&&LOCK_WANT&&!isTouch){LOCK_WANT=false;try{const r=cv.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(_){}}}
function pause(on){state=on?'pause':'play';show(on?'pause':null);joy=null;look=null;keys.clear();}
let bannerT=0;
function banner(t){const bn=$('banner');bn.textContent=t;bn.classList.add('on');bannerT=2.4;}
let bigTO=null;
function bigBanner(t,s){$('bigT').textContent=t;$('bigS').textContent=s||'';$('big').classList.add('on');clearTimeout(bigTO);bigTO=setTimeout(()=>$('big').classList.remove('on'),3200);}
function say(p,txt,delay){if(!p)return;const go=()=>{p.say=txt;p.sayT=3.2;};if(delay)setTimeout(go,delay*1000);else go();}
function flash(col,t){const f=$('flash');f.style.background=col;f.style.transition='none';f.style.opacity=.55;requestAnimationFrame(()=>{f.style.transition=`opacity ${t||.6}s`;f.style.opacity=0;});}

/* ---------- concilios ---------- */
function computeConc(){const count={};
  for(const p of players){if(p.g.tag)count[p.g.tag]=(count[p.g.tag]||0)+1;for(const k in p.passives){const t=PASSIVES[k].tag;if(t)count[t]=(count[t]||0)+1;}}
  G.concFavor=null;if(G.qfx&&G.qfx.favor){const t=G.qfx.favor.tag||'trueno';count[t]=(count[t]||0)+1;G.concFavor=t;}
  const before=G.conc;G.conc={};for(const t in count)if(count[t]>=3)G.conc[t]=true;
  for(const t in G.conc)if(!before[t])banner(CONCILIOS[t].name.toUpperCase()+' ACTIVO');
  G.concCount=count;renderConc();}

/* ---------- armas ---------- */
const RM_K={chain:1,shot:1,line:1,boomer:1,bounce:1,homing:1,sword:1};
function lvR(l){return .62+.08*(l-1);}
function kst(Wd,l,p){const s=kst0(Wd,l,p);if(s)s.rm=RM_K[Wd.k]?lvR(l):1;return s;}
function kst0(Wd,l,p){
  const k=Wd.k,cb=p.countBonus+(G.conc.embaucador?1:0);
  switch(k){
  case'chain':return{cd:Math.max(.45,1.45-.12*l),dmg:20+9*l,chains:1+l+p.chainBonus+(G.conc.trueno?2:0),bolts:l>=4?2:1,range:330};
  case'shot':{const qq=Wd.p;return{cd:Math.max(.3,qq.cd-.07*l),dmg:qq.dmg+qq.dmgL*l,count:qq.count+Math.floor(l*qq.countL)+cb,pierce:qq.pierce+Math.floor(l/3),speed:qq.speed,spread:qq.spread,life:qq.life,r:qq.r};}
  case'orbit':return{count:2+Math.floor(l*.85)+Math.min(cb,1),dmg:11+6*l,radius:50+5*l,rot:3+.25*l};
  case'aura':return{radius:66+13*l,dmg:7+5*l,tick:.45};
  case'line':return{cd:Math.max(.9,2.1-.16*l),dmg:40+18*l,r:9+2*l,count:1+(l>=4?1:0)+Math.min(cb,1),speed:390};
  case'boomer':return{cd:Math.max(.8,1.8-.12*l),dmg:30+12*l,count:1+(l>=3)+(l>=6)+cb,range:220+15*l,speed:380,r:10+l};
  case'bounce':return{cd:Math.max(.6,1.4-.1*l),dmg:22+9*l,bounces:3+l,count:1+(l>=5?1:0)+cb,speed:430};
  case'homing':return{cd:Math.max(.5,1.3-.1*l),dmg:14+6*l,count:1+Math.ceil(l/2)+cb,speed:260,life:2.5};
  case'nova':return{cd:Math.max(.9,2.4-.18*l),dmg:25+10*l,radius:90+15*l};
  case'trail':return{life:1.4+.15*l,dmg:8+4*l,r:14+2*l};
  case'sword':return{cd:Math.max(.55,1.3-.09*l),dmg:34+13*l,count:1+(l>=4?1:0)+(l>=7?1:0)+Math.min(cb,1),range:260,sr:44+5*l,speed:760};
  case'melee':return{cd:Math.max(.4,1-.08*l),dmg:28+11*l,range:48+5*l,arc:1.6+.1*l,both:l>=5};
  }
}
function weaponReach(Wd,s,p){const r=(p.range||1)*(s.rm||1);switch(Wd.k){case'chain':return s.range*p.area*r;case'shot':return s.speed*s.life*r;case'line':return 390*1.6*r;case'boomer':return s.range*p.area*r;
  case'bounce':return 430*2.2*r;case'homing':return 400*r;case'nova':case'aura':return s.radius*p.area*(1+(r-1)*.5);case'orbit':return s.radius*p.area;case'sword':return s.range*p.area*r;case'melee':return s.range*p.area*r;default:return 0;}}
function swordSlash(q2){const R=q2.sr,a=Math.atan2(q2.vy,q2.vx);let hit=0;
  fx.push({k:'slash',x:q2.x-Math.cos(a)*R*.4,y:q2.y-Math.sin(a)*R*.4,z:q2.z-16,a:a+rand(-.4,.4),r:R*1.25,arc:2.6,t:.22,col:'#ffd27a',st:'blade'});
  fx.push({k:'ring',x:q2.x,y:q2.y,r:R,t:.25,max:.25,col:'#ff8a3a'});
  near(q2.x,q2.y,R+40,e=>{if((e.x-q2.x)**2+(e.y-q2.y)**2<(R+e.r)**2){hurt(e,q2.sdmg,q2.o);hit++;const ee=e.proxy||e;if(!ee.boss)push(ee,q2.x-q2.vx,q2.y-q2.vy,26);
    for(let i=0;i<6;i++)fx.push({k:'p',x:e.x,y:e.y,z:(e.z||0)+14,vx:rand(-160,160),vy:rand(-160,160),vz:rand(80,240),t:rand(.25,.5),c:i%2?'#ff5a2a':(e.d&&e.d.col)||'#fff'});}});
  if(hit&&q2.o&&(q2.o.ctrl==='p1'||q2.o.ctrl==='p2'))G.shake=Math.min(1,G.shake+.12+hit*.03);}
const SC_DIFF={normal:1,dificil:1.5,pesadilla:2.5};
function comboMul(){return 1+Math.min(9,Math.floor((G.combo||0)/20)*.5);}
function stageMul(){return G.mode==='libre'?1+.5*((G.wave||1)-1):1+.5*G.ridx;}
function scoreMul(){return comboMul()*stageMul()*(SC_DIFF[G.diffKey]||1);}
function addScore(base){if(!G)return;G.score=(G.score||0)+base*scoreMul();}
function teamLuck(){let m=0;for(const q of players)if(q.ctrl!=='net')m=Math.max(m,q.luck||0);return m;}
function drinkNectar(p){if(!G||state!=='play'||p.down)return;if(p.nectar<=0){if(p.ctrl==='p1'||p.ctrl==='p2')texts.push({x:p.x,y:p.y,z:p.z+50,v:'Sin néctar',t:.9,c:'#9aa3c7',big:false});return;}
  if(p.hp>=p.maxHp){texts.push({x:p.x,y:p.y,z:p.z+50,v:'Vida llena',t:.8,c:'#9aa3c7'});return;}if(p.nectarCd>0)return;
  p.nectar--;p.nectarCd=1.2;const amt=Math.round(p.maxHp*.45);heal(p,amt);p.healGlow=.8;
  for(let i=0;i<18;i++)fx.push({k:'p',x:p.x+rand(-14,14),y:p.y+rand(-14,14),z:p.z+rand(0,30),vx:rand(-30,30),vy:rand(-30,30),vz:rand(60,160),t:rand(.4,.8),c:i%2?'#7dffa8':'#ffe680'});
  fx.push({k:'ring',x:p.x,y:p.y,r:60,t:.35,max:.35,c:'#7dffa8'});refreshNectar();}
function refreshNectar(){const p=players.find(q=>q.ctrl==='p1');const el=$('nectarN');if(el&&p){el.textContent='×'+p.nectar;$('nectarBox').classList.toggle('empty',p.nectar<=0);}const tb=$('tNectar');if(tb&&p)tb.textContent='NÉCTAR ×'+p.nectar;}
function updDrops(dt){for(const d of drops){d.t+=dt;if(d.t>40){d.done=true;continue;}for(const p of players){if(p.down||d.done||p.ctrl==='net')continue;const dd=Math.hypot(p.x-d.x,p.y-d.y);if(dd<p.magnet*.5&&dd>1){d.x+=(p.x-d.x)/dd*260*dt;d.y+=(p.y-d.y)/dd*260*dt;}
  if(dd<p.r+16){d.done=true;
    if(d.k==='nectar'){heal(p,Math.round(p.maxHp*.45*p.healMul));for(let i=0;i<14;i++)fx.push({k:'p',x:p.x+rand(-14,14),y:p.y+rand(-14,14),z:p.z+rand(0,30),vx:rand(-30,30),vy:rand(-30,30),vz:rand(60,160),t:rand(.4,.8),c:i%2?'#7dffa8':'#7de0ff'});fx.push({k:'ring',x:p.x,y:p.y,r:60,t:.35,max:.35,col:'#7dffa8'});}
    else if(d.k==='iman'){for(const c of coins)c.pull=true;for(const gm of gems){gm.x=p.x+rand(-8,8);gm.y=p.y+rand(-8,8);}texts.push({x:p.x,y:p.y,z:p.z+50,v:'¡IMÁN!',t:1.2,c:'#ff6a6a',big:true});fx.push({k:'ring',x:p.x,y:p.y,r:300,t:.5,max:.5,c:'#ff6a6a'});}
    else if(d.k==='bolsa'){dropCoins(d.x,d.y,surfaceAt(d.x,d.y)+12,8,1+(G.ridx+(G.wave||1)-1)*.5);texts.push({x:p.x,y:p.y,z:p.z+50,v:'¡Bolsa de oro!',t:1.2,c:'#ffd34d',big:true});}}}}
  drops=drops.filter(d=>!d.done);}
function nextWave(){if(!G||G.mode!=='libre')return;G.wave=(G.wave||1)+1;const ks=Object.keys(REALMS).filter(k=>k!=='vacio'&&k!=='cielo'&&k!==G.realm);startRealm(pick(ks));setTimeout(()=>{if(G&&state==='play')bigBanner(`OLEADA ${G.wave}`,'Todo empieza de nuevo, más rápido y más fuerte');},2600);}
function facing(p){return Math.atan2(p.fy,p.fx);}
function nearestE(x,y,max,skip){const qp=G&&G.qPrio;let best=null,bd=max*max,bn=1e12;for(const e of enemies){if(e.dead||(skip&&skip.has(e)))continue;const d=(e.x-x)**2+(e.y-y)**2;if(e!==qp&&d<bn)bn=d;if(d<bd){bd=d;best=e;}}
  // Atoq tiene prioridad solo si no hay una amenaza pegada (120) más cerca que él
  if(qp&&!qp.dead&&!(skip&&skip.has(qp))){const dq=(qp.x-x)**2+(qp.y-y)**2;if(dq<Math.min(max,300)**2&&(bn>120*120||dq<bn))return qp;}return best;}
function aimAt(p,max){const t=nearestE(p.x,p.y,(max||600)*(p.range||1));return t?Math.atan2(t.y-p.y,t.x-p.x):facing(p);}
function mkProj(o,k,st,col,x,y,z,a,sp,extra){return Object.assign({k,o,st,col,x,y,z,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,hit:new Set(),rot:0},extra);}
function fireWeapons(p,dt){
  const pz=p.z+22;
  const pr0=p.range||1;
  for(const key in p.weapons){const w=p.weapons[key],Wd=WEAPONS[key],s=kst(Wd,w.lvl,p);p.range=pr0*s.rm;
    if(Wd.k==='orbit'){w.ang+=s.rot*dt;w.br=(w.br||0)+dt*2.6;const Rr=s.radius*p.area*(.62+.38*(.5+.5*Math.sin(w.br)));w.pos=[];
      for(let i=0;i<s.count;i++){const a=w.ang+i*6.2832/s.count,x=p.x+Math.cos(a)*Rr,y=p.y+Math.sin(a)*Rr;w.pos.push([x,y,a]);
        near(x,y,60,e=>{const ee=e.proxy||e;if(G.t>ee.soul&&(e.x-x)**2+(e.y-y)**2<(e.r+17)**2){ee.soul=G.t+.4;hurt(e,s.dmg,p);if(!ee.boss)push(ee,p.x,p.y,key==='palomas'?18:8);}});}
      continue;}
    if(Wd.k==='aura'){w.tick-=dt;if(w.tick<=0){w.tick=s.tick;const big=p.radiant>0,Rr=s.radius*p.area*(1+(p.range-1)*.5)*(big?1.8:1);near(p.x,p.y,Rr+40,e=>{if((e.x-p.x)**2+(e.y-p.y)**2<(Rr+e.r)**2)hurt(e,s.dmg*(big?2:1),p);});}continue;}
    if(Wd.k==='trail'){w.acc+=dt;if(w.acc>=.13){w.acc=0;patches.push({o:p,x:p.x+rand(-4,4),y:p.y+rand(-4,4),r:s.r*p.area,t:s.life,life:s.life,dmg:s.dmg,tick:0,col:Wd.col});}continue;}
    w.t-=dt;if(w.t>0)continue;p.atk=.22;
    const cd=s.cd*p.cdMul;
    switch(Wd.k){
    case'chain':{let fired=false;const rg=s.range*p.area*p.range;
      for(let bI=0;bI<s.bolts;bI++){const hit=new Set();let cur=nearestE(p.x,p.y,rg);
        if(bI&&cur){const alt=enemies.filter(e=>!e.dead&&(e.x-p.x)**2+(e.y-p.y)**2<rg*rg);cur=pick(alt)||cur;}
        if(!cur)break;fired=true;const sky=w.lvl>=3;if(sky)strike(cur.x,cur.y,0,p,Wd.col,cur);const pts=sky?[]:[[p.x+p.fx*8,p.y+p.fy*8,pz+6]];
        for(let c=0;c<=s.chains&&cur;c++){hit.add(cur);pts.push([cur.x,cur.y,(cur.z||0)+14]);hurt(cur,s.dmg*(c?.8:1),p);if(c&&w.lvl>=5&&c<=2)strike(cur.x,cur.y,0,p,Wd.col,cur);cur=nearestE(cur.x,cur.y,160*p.area,hit);}
        fx.push({k:'bolt',pts,t:.2,col:Wd.col,st:Wd.st});}
      w.t=fired?cd:.2;break;}
    case'shot':{const a=aimAt(p,600),n=s.count;
      for(let i=0;i<n;i++){const aa=a+(i-(n-1)/2)*s.spread;proj.push(mkProj(p,'shot',Wd.st,Wd.col,p.x,p.y,pz,aa,s.speed,{dmg:s.dmg,pierce:s.pierce,r:s.r*p.area,t:s.life*p.range,slow:Wd.p.slow}));}
      w.t=cd;break;}
    case'line':{const a=facing(p);for(let i=0;i<s.count;i++)proj.push(mkProj(p,'line',Wd.st,Wd.col,p.x,p.y,pz,a+i*Math.PI,s.speed,{dmg:s.dmg,pierce:9999,r:s.r*p.area,t:1.6*p.range}));w.t=cd;break;}
    case'boomer':{const base=aimAt(p,s.range+100);for(let i=0;i<s.count;i++)proj.push(mkProj(p,'boomer',Wd.st,Wd.col,p.x,p.y,pz,base+(i-(s.count-1)/2)*.5,s.speed,{dmg:s.dmg,pierce:9999,r:s.r*p.area,t:4*p.range,range:s.range*p.area*p.range,trav:0,ret:false}));w.t=cd;break;}
    case'bounce':{for(let i=0;i<s.count;i++)proj.push(mkProj(p,'bounce',Wd.st,Wd.col,p.x,p.y,pz,aimAt(p,500)+i*.6,s.speed,{dmg:s.dmg,pierce:1,bn:s.bounces,r:8*p.area,t:2.2*p.range}));w.t=cd;break;}
    case'homing':{for(let i=0;i<s.count;i++)proj.push(mkProj(p,'homing',Wd.st,Wd.col,p.x,p.y,pz,rand(0,6.28),s.speed,{sp:s.speed,dmg:s.dmg,pierce:1,r:7*p.area,t:s.life*p.range,tg:null,rt:0}));w.t=cd;break;}
    case'nova':{const Rr=s.radius*p.area*(1+(p.range-1)*.5);fx.push({k:'ring',x:p.x,y:p.y,r:Rr,t:.35,max:.35,col:Wd.col});near(p.x,p.y,Rr+40,e=>{if((e.x-p.x)**2+(e.y-p.y)**2<(Rr+e.r)**2){hurt(e,s.dmg,p);const ee=e.proxy||e;if(Wd.stun&&!ee.boss)ee.stun=Wd.stun;else if(!ee.boss)push(ee,p.x,p.y,10);}});w.t=cd;break;}
    case'sword':{const rg=s.range*p.area*p.range,used=new Set();let any=false;
      for(let i=0;i<s.count;i++){const t=nearestE(p.x,p.y,rg,used);if(!t)break;used.add(t);any=true;const a=Math.atan2(t.y-p.y,t.x-p.x);
        proj.push(mkProj(p,'sword',Wd.st,Wd.col,p.x,p.y,pz+6,a,s.speed,{dmg:Math.round(s.dmg*.5),sdmg:s.dmg,sr:s.sr*p.area,pierce:9999,r:12,t:3,tg:t,tx:t.x,ty:t.y,ret:false,ky:key}));}
      w.t=any?cd:.2;break;}
    case'melee':{const rg=s.range*p.area*p.range;const t=nearestE(p.x,p.y,rg*1.8);const a=t?Math.atan2(t.y-p.y,t.x-p.x):facing(p);
      const dirs=s.both?[a,a+Math.PI]:[a];for(const d of dirs){fx.push({k:'slash',x:p.x,y:p.y,z:p.z,a:d,r:rg,arc:s.arc,t:.16,col:Wd.col,st:Wd.st});
        near(p.x,p.y,rg+40,e=>{const dx=e.x-p.x,dy=e.y-p.y;if(dx*dx+dy*dy>(rg+e.r)**2)return;let da=Math.atan2(dy,dx)-d;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)<=s.arc/2){hurt(e,s.dmg,p);const ee=e.proxy||e;if(!ee.boss)push(ee,p.x,p.y,Wd.st==='mace'?22:10);}});}
      w.t=cd;break;}
    }
  }
  p.range=pr0;
  if(G.conc.sol){p.sunA=(p.sunA||0)+dt*2;const x=p.x+Math.cos(p.sunA)*55,y=p.y+Math.sin(p.sunA)*55;p.sunPos=[x,y];near(x,y,50,e=>{const ee=e.proxy||e;if(T>(ee.sunH||0)&&(e.x-x)**2+(e.y-y)**2<(e.r+12)**2){ee.sunH=T+.4;hurt(e,20+G.level*2,p);}});}else p.sunPos=null;
  if(p.radiant>0&&!p.weapons.sol){p.radT=(p.radT||0)-dt;if(p.radT<=0){p.radT=.4;const Rr=140*p.area;near(p.x,p.y,Rr+40,e=>{if((e.x-p.x)**2+(e.y-p.y)**2<(Rr+e.r)**2)hurt(e,22+G.level*2,p);});}}
}

/* ---------- poderes ---------- */
function onScreen(e){const c=camera();return(e.x-c.x)**2+(e.y-c.y)**2<VIEW*VIEW;}
function strike(x,y,dmg,p,col,tgt){if(tgt&&!tgt.dead){x=tgt.x;y=tgt.y;}const g=groundAt(x,y);fx.push({k:'sky',x,y,t:.45,t0:.45,col:col||C.gold});fx.push({k:'scorch',x,y,t:3,r:rand(22,32)});
  for(let i=0;i<10;i++)fx.push({k:'p',x,y,z:g+6,vx:rand(-180,180),vy:rand(-180,180),vz:rand(150,380),t:rand(.3,.6),c:i%2?'#ffffff':(col||C.gold)});
  if(dmg>0)near(x,y,90,e=>{if((e.x-x)**2+(e.y-y)**2<(48+e.r)**2){hurt(e,dmg,p);e.stun=Math.max(e.stun||0,.25);}});
  if(dmg>0&&typeof qOnStrike==='function')qOnStrike(x,y,p);
  if(!dmg)return;const c=camera();const dd=Math.hypot(c.x-x,c.y-y);G.shake=Math.min(1,G.shake+Math.max(0,.35-dd/2400));G.flashT=Math.max(G.flashT,.07);}
function skybolts(p,n,dmg,stagger){const vis=shuffle(enemies.filter(e=>!e.dead&&onScreen(e)));const col=p?WEAPONS[p.g.w].col:C.gold;
  const m=Math.min(n,vis.length);for(let i=0;i<n;i++){const t=vis[i%Math.max(1,m)];let x,y;if(t){x=t.x;y=t.y;}else if(p){x=p.x+rand(-220,220);y=p.y+rand(-220,220);}else continue;
    if(stagger)G.boltQ.push({t:i*stagger+rand(0,.05),x:x+(i>=m?rand(-60,60):0),y:y+(i>=m?rand(-60,60):0),dmg,p,col,tgt:i<m?t:null});else strike(x,y,dmg,p,col,t);}
  if(stagger)G.stormT=Math.max(G.stormT,n*stagger+.8);}
const POW_LV=5;
function powLocked(p){return p.ctrl!=='net'&&p.ctrl!=='npc'&&G&&G.level<POW_LV;}
function usePower(p){
  if(!p||p.down||p.pow>0||(state!=='play'&&p.ctrl!=='net'))return;
  if(powLocked(p)){if(p.ctrl!=='ai'&&(!G.lockMsgT||G.t-G.lockMsgT>2)){G.lockMsgT=G.t;banner(`Poder divino bloqueado · se despierta en el nivel ${POW_LV}`);}return;}
  p.powAnim=.7;
  const g=p.g,[kind,arg]=g.pw.split(':'),m=1+G.level*.07,col=WEAPONS[g.w].col,pz=p.z+22;
  switch(kind){
  case'storm':skybolts(p,12+Math.floor(G.level/2),55*m,.09);break;
  case'wave':fx.push({k:'wave',o:p,x:p.x,y:p.y,r:10,max:300*p.area,hit:new Set(),dmg:50*m,t:9,col:C.sea});break;
  case'tide':fx.push({k:'wave',o:p,x:p.x,y:p.y,r:10,max:280*p.area,hit:new Set(),dmg:40*m,t:9,col:'#6fb3bb'});for(const q2 of players)if(!q2.down)heal(q2,q2.maxHp*.3);break;
  case'dashvolley':for(let i=0;i<8;i++)fx.push({k:'p',x:p.x,y:p.y,z:p.z+10,vx:rand(-40,40),vy:rand(-40,40),vz:rand(40,120),t:.5,c:C.bone});tryMove(p,p.fx*150,p.fy*150,true);p.vz=300;p.air=true;p.inv=Math.max(p.inv,.7);
    for(let i=0;i<24;i++)proj.push(mkProj(p,'shot','arrow',C.bone,p.x,p.y,pz,i/24*6.2832,560,{dmg:16+3*G.level,pierce:3,r:6*p.area,t:1}));break;
  case'stealth':p.hidden=4;break;
  case'radiant':p.radiant=6;heal(p,25);break;
  case'shield':p.shield=5;for(let i=0;i<8;i++)proj.push(mkProj(p,'line','spear',C.gold,p.x,p.y,pz,i/8*6.2832,390,{dmg:45+10*G.level,pierce:9999,r:12*p.area,t:1.4}));break;
  case'quake':{const Rr=200*p.area;fx.push({k:'ring',x:p.x,y:p.y,r:Rr,t:.5,max:.5,col});fx.push({k:'ring',x:p.x,y:p.y,r:Rr*.6,t:.35,max:.35,col:C.bone});near(p.x,p.y,Rr+40,e=>{if((e.x-p.x)**2+(e.y-p.y)**2<(Rr+e.r)**2){hurt(e,60*m,p);const ee=e.proxy||e;if(!ee.boss){ee.stun=1.5;push(ee,p.x,p.y,30);}}});break;}
  case'lance':proj.push(mkProj(p,'line',arg||'spear',arg==='serpent'?'#3aa07a':arg==='firespear'?'#f2a23c':arg==='blade'?'#7ad04a':C.gold,p.x,p.y,pz,facing(p),720,{dmg:120*m,pierce:9999,r:26*p.area,t:1.6,big:true}));break;
  case'summon':{const n=arg==='tornado'?(g.id==='marduk'?7:5):arg==='leon'?2:4;for(let i=0;i<n;i++){const a=i/n*6.28;allies.push(mkAlly(arg,p,p.x+Math.cos(a)*40,p.y+Math.sin(a)*40,arg==='tornado'?7:10));}break;}
  case'clones':for(let i=0;i<3;i++){const a=i/3*6.28;allies.push(mkAlly('clone',p,p.x+Math.cos(a)*70,p.y+Math.sin(a)*70,6));}break;
  case'nuke':flash(g.id==='viracocha'?'#6fb3bb':g.id==='shiva'?'#c8a0ff':'#fff6e0');for(const e of enemies)if(!e.dead&&onScreen(e))hurt(e,90*m,p);fx.push({k:'ring',x:p.x,y:p.y,r:VIEW,t:.7,max:.7,col:'#fff6e0'});break;
  case'execute':flash(C.gold,.5);for(const e of enemies){if(e.dead||!onScreen(e))continue;if(!e.boss&&e.hp<e.maxHp*.5){e.hp=0;kill(e,p);}else hurt(e,e.boss?150*m:40*m,p);}break;
  case'rage':p.rage=6;break;
  case'charge':p.charging=.7;p.cvx=p.fx;p.cvy=p.fy;p.chHit=new Set();p.inv=Math.max(p.inv,.8);break;
  case'giant':p.giant=8;break;
  case'freeze':flash(g.id==='mamaquilla'?'#c8ccd8':'#fff6e0',.5);for(const e of enemies){if(e.dead||!onScreen(e))continue;e.stun=e.boss?1.2:3;hurt(e,30*m,p);}break;
  case'mark':for(const e of enemies){if(e.dead||!onScreen(e))continue;e.mark=8;hurt(e,20*m,p);}flash(C.blood,.35);break;
  case'revive':for(const q2 of players){if(q2.down){q2.down=false;q2.hp=q2.maxHp*.5;q2.inv=2;say(q2,pick(LINES.thanks));}else heal(q2,q2.maxHp*.5);q2.inv=Math.max(q2.inv,1.5);}flash('#fff6e0',.5);break;
  }
  p.pow=g.cd*p.cdMul*p.powCdMul;
  if(p.ctrl==='net'){say(p,g.pn+'!');return;}
  p.powSeq++;missionAdd('power',1);
  banner(g.pn.toUpperCase());
  syncPower(p);
}
function syncPower(p){
  if(p.idx>1)return;G.lastPow[p.idx]=G.t;if(players.length<2)return;const o=players[1-p.idx];if(!o||o.down)return;
  if(G.t-G.lastPow[o.idx]<4){const rl=G.rel,mx=(p.x+o.x)/2,my=(p.y+o.y)/2,m=1+G.level*.07;G.lastPow=[-99,-99];
    if(rl&&rl.type==='aliado'){fx.push({k:'ring',x:mx,y:my,r:280,t:.7,max:.7,col:C.gold});flash(C.gold,.4);near(mx,my,320,e=>{if((e.x-mx)**2+(e.y-my)**2<280*280)hurt(e,200*m,p);});for(const q2 of players)heal(q2,q2.maxHp*.3);bigBanner('COMBO: '+rl.combo.toUpperCase(),'Dos panteones, un solo golpe');}
    else if(rl&&rl.type==='rival'){fx.push({k:'ring',x:mx,y:my,r:330,t:.7,max:.7,col:C.blood});flash('#ff8a5a',.5);near(mx,my,370,e=>{if((e.x-mx)**2+(e.y-my)**2<330*330)hurt(e,260*m,p);});
      for(const q2 of players){const d=Math.hypot(q2.x-mx,q2.y-my)||1;tryMove(q2,(q2.x-mx)/d*70,(q2.y-my)/d*70,true);q2.vz=320;q2.air=true;}bigBanner('¡CHOQUE DIVINO!','Sus poderes no se soportan');say(p,'¡Eso era mío!');say(o,'¡Llegué primero!',.8);}
    else{fx.push({k:'ring',x:mx,y:my,r:200,t:.5,max:.5,col:C.bone});near(mx,my,240,e=>{if((e.x-mx)**2+(e.y-my)**2<200*200)hurt(e,120*m,p);});banner('SINCRONÍA DIVINA');}
  }else if(G.rel){const rl=G.rel;if(rl.type==='rival'&&Math.random()<.5)say(o,pick(LINES.rivalTaunt),.4);else if(rl.type==='aliado'&&Math.random()<.4)say(o,pick(LINES.allyCheer),.4);}
}
function heal(p,v){if(p.down)return;const amt=Math.min(p.maxHp-p.hp,v);if(amt<=0)return;p.hp+=amt;if(amt>=1.5&&texts.length<100)texts.push({x:p.x,y:p.y,z:p.z+60,v:'+'+Math.round(amt),t:.9,c:'#7de0b0'});}

/* ---------- aliados ---------- */
function mkAlly(type,o,x,y,t){const base={type,o,x,y,t,cd:0,ph:rand(0,6.28)};
  switch(type){case'einherjar':return{...base,spd:150,dmg:22,r:10};case'leon':return{...base,spd:170,dmg:30,r:12};case'tornado':return{...base,spd:120,dmg:10,r:22,vx:rand(-1,1),vy:rand(-1,1)};
    case'shade':return{...base,spd:140,dmg:14,r:9};case'clone':return{...base,spd:0,dmg:0,r:12,taunt:true};case'dog':return{...base,spd:200,dmg:16,r:9};}}
function updAllies(dt){
  for(const a of allies){a.t-=dt;a.cd-=dt;const o=a.o;
    if(a.type==='clone'){a.x+=Math.cos(T*2+a.ph)*10*dt;if(a.t<=0){fx.push({k:'ring',x:a.x,y:a.y,r:90,t:.4,max:.4,col:'#7ad04a'});near(a.x,a.y,130,e=>{if((e.x-a.x)**2+(e.y-a.y)**2<(90+e.r)**2)hurt(e,60+G.level*5,o);});}continue;}
    if(a.type==='tornado'){const t=nearestE(a.x,a.y,260);let dx=a.vx,dy=a.vy;if(t){dx=t.x-a.x;dy=t.y-a.y;}const d=Math.hypot(dx,dy)||1;a.x+=dx/d*a.spd*dt+Math.cos(T*5+a.ph)*30*dt;a.y+=dy/d*a.spd*dt+Math.sin(T*5+a.ph)*30*dt;
      if(a.cd<=0){a.cd=.25;near(a.x,a.y,a.r+40,e=>{if((e.x-a.x)**2+(e.y-a.y)**2<(a.r+e.r)**2){hurt(e,a.dmg+G.level*1.5,o);const ee=e.proxy||e;if(!ee.boss)push(ee,a.x,a.y,-6);}});}continue;}
    let tg=nearestE(a.x,a.y,a.type==='dog'?220:400);
    if(a.type==='dog'&&(!tg||Math.hypot(o.x-a.x,o.y-a.y)>260))tg=null;
    const tx=tg?tg.x:o.x+Math.cos(T+a.ph)*40,ty=tg?tg.y:o.y+Math.sin(T+a.ph)*40;const dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy)||1;
    if(d>4){a.x+=dx/d*a.spd*dt;a.y+=dy/d*a.spd*dt;}a.fx=dx;a.fy=dy;
    if(tg&&a.cd<=0&&d<tg.r+a.r+4){a.cd=.4;hurt(tg,a.dmg+G.level*(a.type==='dog'?2:1.5),o);}
  }
  allies=allies.filter(a=>a.t>0);
}

/* ---------- rejilla ---------- */
const CELL=50,grid=new Map(),gk=(cx,cy)=>(cx+32768)*65536+(cy+32768);
function buildGrid(){grid.clear();const add=e=>{const k=gk(Math.floor(e.x/CELL),Math.floor(e.y/CELL));let a=grid.get(k);if(!a){a=[];grid.set(k,a);}a.push(e);};
  for(const e of enemies){if(e.dead)continue;add(e);if(e.segs)for(const s of e.segs)add(s);}}
function near(x,y,r,fn){const x0=Math.floor((x-r)/CELL),x1=Math.floor((x+r)/CELL),y0=Math.floor((y-r)/CELL),y1=Math.floor((y+r)/CELL);
  for(let cx=x0;cx<=x1;cx++)for(let cy=y0;cy<=y1;cy++){const a=grid.get(gk(cx,cy));if(a)for(const e of a){if((e.proxy?e.proxy.dead:e.dead))continue;fn(e);}}}
function push(e,fx_,fy_,amt){if(e.boss||e.heavy)amt*=.15;const d=Math.hypot(e.x-fx_,e.y-fy_)||1;e.x+=(e.x-fx_)/d*amt;e.y+=(e.y-fy_)/d*amt;}

/* ---------- movimiento sobre el terreno ---------- */
function blockedAt(p,x,y){
  if(Math.hypot(x,y)>ARENA-30)return true;
  const g=groundAt(x,y);if(g-p.z>(p.air?2:14))return true;
  for(const c of WORLD.coll){if(p.z<c.top-6&&(x-c.x)**2+(y-c.y)**2<(c.r+p.r*.6)**2)return true;}
  return false;}
function tryMove(p,dx,dy,force){
  if(force){let x=p.x+dx,y=p.y+dy;const d=Math.hypot(x,y);if(d>ARENA-30){x*=(ARENA-30)/d;y*=(ARENA-30)/d;}p.x=x;p.y=y;p.z=Math.max(p.z,surfaceAt(x,y));return true;}
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));let moved=false;
  for(let i=0;i<steps;i++){const sx=dx/steps,sy=dy/steps;
    if(!blockedAt(p,p.x+sx,p.y+sy)){p.x+=sx;p.y+=sy;moved=true;}
    else if(!blockedAt(p,p.x+sx,p.y)){p.x+=sx;moved=true;}
    else if(!blockedAt(p,p.x,p.y+sy)){p.y+=sy;moved=true;}
    else return moved;
  }
  return moved;}
function physics(p,dt){
  const s=surfaceAt(p.x,p.y);
  if(!p.air){if(p.z-s>16){p.air=true;p.vz=0;}else{p.z=s;p.vz=0;return;}}
  p.vz-=GRAV*dt;if(p.vz<-75&&glideHeld(p))p.vz=-75;p.z+=p.vz*dt;if(p.z<=s){p.z=s;p.vz=0;p.air=false;p.jumpsLeft=p.extraJumps;}
}

/* ---------- enemigos ---------- */
function camera(){const hs=players.filter(p=>p.ctrl!=='ai');const L=hs.length?hs:players;let x=0,y=0;for(const p of L){x+=p.x;y+=p.y;}return{x:x/L.length,y:y/L.length};}
function realmEnemyList(){if(G.realm==='vacio'){const v=G.visited.filter(k=>k!=='vacio');return REALMS[pick(v.length?v:['tartaro'])].en;}return REALMS[G.realm].en;}
function pickEnemy(){const en=realmEnemyList(),r=Math.random(),rt=G.rt+(G.realm==='vacio'?240:0);
  if(rt>200&&r<.1)return en[3]||en[0];if(rt>110&&r<.3)return en[2]||en[0];if(rt>40&&r<.56)return en[1]||en[0];return en[0];}
function spawnPos(ang){const c=camera();for(let t=0;t<10;t++){const a=(ang??rand(0,6.2832))+t*.7,r=rand(560,700);let x=c.x+Math.cos(a)*r,y=c.y+Math.sin(a)*r;if(Math.hypot(x,y)<ARENA-60)return[x,y];}
  const a=rand(0,6.28);return[Math.cos(a)*(ARENA-80),Math.sin(a)*(ARENA-80)];}
function waveK(){return G.mode==='libre'?Math.max(0,(G.wave||1)-1):0;}
function spawn(key,ang){
  const d=ENEMIES[key];const[x,y]=spawnPos(ang);const coop=players.length>1?1.35:1;
  const hm=(1+G.ridx*.85+G.rt/60*.34+G.cycle*.6)*coop*(1+.3*remotesHere().length);
  const W=waveK(),wh=Math.pow(1.55,W),wd=Math.pow(1.3,W);const el=G.rt>50&&Math.random()<.035*DF().el*(1+.25*W);const DD=DF();
  enemies.push({key,d,x,y,z:groundAt(x,y),hp:d.hp*hm*wh*DD.hp*(el?7:1),maxHp:d.hp*hm*wh*DD.hp*(el?7:1),spd:d.spd*rand(.9,1.1)*(el?.9:1)*(DD.hp>1.5?1.08:1)*Math.min(2.2,1+.12*((G.wave||1)-1)),dmg:d.dmg*DD.dmg*(1+G.ridx*.35+G.rt/600*.5)*wd*(el?1.5:1),r:d.r*(el?1.4:1),xp:d.xp*(el?6:1),elite:el,flash:0,soul:0,ph:rand(0,6.28),stun:0,slow:0,mark:0,conf:0,shH:0});
}
const TIER_HP={mini:900,boss:2400,final:7000};
function nemesisFor(god){const ks=Object.keys(BOSSES).filter(k=>BOSSES[k].tier!=='final'&&!k.startsWith('sombra_')&&(BOSSES[k].weak||[]).includes(god));if(ks.length)return ks;const sk=shadowNemesis(god);return sk?[sk]:[];}
function shadowNemesis(god){const rel=REL.find(r=>r[2]==='rival'&&(r[0]===god||r[1]===god));let rid=rel?(rel[0]===god?rel[1]:rel[0]):null;
  if(!rid||!GOD[rid]){const others=GODS.filter(g=>g.pan!==(GOD[god]&&GOD[god].pan)&&g.id!=='khaos');let h=0;for(const ch of god)h=(h*31+ch.charCodeAt(0))>>>0;rid=others[h%others.length].id;}
  const key='sombra_'+rid;if(!BOSSES[key]){const L=LOOKS[rid]||{};BOSSES[key]={name:'Sombra de '+GOD[rid].name,arch:'lord',col:shade(L.r||'#5a4a6a',-.45),acc:'#b06cff',tier:'mini',pats:['aimed','spiral','summon','charge'],heads:1,weak:[],friend:[],shadowOf:rid};
    if(typeof BHUMAN!=='undefined')BHUMAN[key]={look:Object.assign({},L,{r:shade(L.r||'#5a4a6a',-.45),t:'#b06cff',cc:'#1a0a2a'}),style:(typeof HSTYLE!=='undefined'&&HSTYLE[rid])||'tunic',k:2.4};}
  if(!BOSSES[key].weak.includes(god))BOSSES[key].weak.push(god);return key;}
function scheduleNemesis(){G.nemMet=G.nemMet||[];const humans=players.filter(p=>p.ctrl==='p1'||p.ctrl==='p2');if(!humans.length)return;
  const p=pick(humans);const c=nemesisFor(p.god).filter(k=>!G.nemMet.includes(k));if(!c.length)return;
  const chance=G.nemMet.length?.35:.75;if(Math.random()>chance)return;const key=pick(c);G.nemMet.push(key);
  const t=rand(160,215);G.events.push({t,key,nem:p.god,corrupt:key.startsWith('sombra_')});G.events.sort((a,b)=>a.t-b.t);}
function spawnBoss(key,corrupt,nem){
  const d=BOSSES[key];const[x,y]=spawnPos();const coop=players.length>1?1.5:1;
  const hp=TIER_HP[d.tier]*G.diff*(1+G.cycle*.9)*Math.pow(1.55,waveK())*coop*(corrupt?1.3:1)*DF().hp;
  const r=d.tier==='final'?58:d.tier==='boss'?42:32;
  const e={key,d,boss:true,tier:d.tier,x,y,z:groundAt(x,y),hp,maxHp:hp,spd:d.tier==='final'?55:70,dmg:(d.tier==='mini'?22:30)*(1+G.ridx*.3)*Math.pow(1.3,waveK())*DF().dmg,r,xp:d.tier==='mini'?40:90,flash:0,soul:0,ph:rand(0,6.28),stun:0,slow:0,mark:0,conf:0,
    pc:2.5,pi:0,charge:0,cvx:0,cvy:0,spiral:0,sa:0,corrupt:!!corrupt,hist:[],face:1};
  if(d.arch==='serpent'){e.segs=[];const n=d.tier==='boss'?14:9;for(let i=0;i<n;i++)e.segs.push({proxy:e,x,y,r:r*(1-i/n*.5)*.8});for(let i=0;i<n*8;i++)e.hist.push([x,y]);}
  if(nem){e.nem=nem;e.tier='mini';e.hp*=d.tier==='mini'?1.4:.8;e.maxHp=e.hp;e.spd*=1.15;}
  enemies.push(e);G.bosses.push(e);
  if(nem){bigBanner('¡TU NÉMESIS: '+d.name.toUpperCase()+'!',`Viene a por ${GOD[nem].name}. Si la vences: cofre rico y +25 000 puntos`);const pp=players.find(q=>q.god===nem);if(pp)say(pp,d.shadowOf?`¿${GOD[d.shadowOf].name}? No... solo su sombra.`:pick(['Sabía que vendrías.','Otra vez tú...','Esta vez acabo contigo.']),1.4);}
  else bigBanner(d.name.toUpperCase(),d.tier==='final'?'La nada que se traga a los dioses':d.tier==='boss'?'El guardián del reino despierta':'Un monstruo se interpone');
  const wk=players.find(p=>d.weak.includes(p.god));if(wk)say(wk,'Ya te vencí una vez.',1.2);
  const fr=players.find(p=>d.friend.includes(p.god));if(fr)say(fr,'Tranquilo, chico. Muérdelos a ellos.',1.2);
  if(d.tier==='final')setTimeout(summonHelper,2600);
  return e;
}
function summonHelper(){if(state!=='play'&&state!=='levelup')return;const ps=players.map(p=>p.god);const id=['dios','jesus','zeus'].find(k=>!ps.includes(k));if(!id)return;
  const c=camera(),n=makePlayer(id,'npc',2);n.x=c.x;n.y=c.y-60;n.z=surfaceAt(n.x,n.y)+260;n.air=true;n.col='#fff6e0';n.pow=3;n.dmgMul=1+G.level*.08;
  const w=n.weapons[n.g.w];w.lvl=6;npcs.push(n);
  bigBanner(id==='dios'?'DIOS DESCIENDE A AYUDAR':`${n.g.name.toUpperCase()} DESCIENDE A AYUDAR`,id==='dios'?'«Hágase la luz.»':'Hasta los dioses necesitan aliados');say(n,id==='dios'?'Khaos, aquí termina tu noche.':'¡Aguantad, ya estoy aquí!',1.5);flash('#fff6e0',1);}
function updNpcs(dt){for(const n of npcs){const c=camera();const tx=c.x+Math.cos(T*.4)*90,ty=c.y+Math.sin(T*.4)*90-40;const dx=tx-n.x,dy=ty-n.y,d=Math.hypot(dx,dy);if(d>6){n.x+=dx/d*Math.min(d,200*dt);n.y+=dy/d*Math.min(d,200*dt);n.fx=dx/d;n.fy=dy/d;n.moving=true;n.step+=dt*6;}else n.moving=false;
  n.z=Math.max(surfaceAt(n.x,n.y)+30+Math.sin(T*2)*6,n.z-120*dt);n.sayT-=dt;fireWeapons(n,dt);n.pow-=dt;
  if(n.pow<=0){n.pow=14;const m=1+G.level*.07;flash('#fff6e0',.7);for(const e of enemies)if(!e.dead&&onScreen(e))hurt(e,(e.boss?160:90)*m,n);fx.push({k:'ring',x:n.x,y:n.y,r:VIEW,t:.8,max:.8,col:'#fff6e0'});banner(n.g.pn.toUpperCase());}}}
function targetFor(e){let best=null,bd=1e12;
  for(const p of players){if(p.down||p.hidden>0)continue;if(e.boss&&e.d.friend.includes(p.god))continue;const d=(p.x-e.x)**2+(p.y-e.y)**2;if(d<bd){bd=d;best=p;}}
  for(const a of allies){if(!a.taunt)continue;const d=((a.x-e.x)**2+(a.y-e.y)**2)*.5;if(d<bd){bd=d;best=a;}}
  for(const r of remotes){if(r.dn||r.hidden>0||r.realm!==G.realm)continue;const d=(r.x-e.x)**2+(r.y-e.y)**2;if(d<bd){bd=d;best=r;}}
  return best;}
function bullet(x,y,z,a,sp,dmg,col,r){if(bullets.length<500)bullets.push({x,y,z,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dmg,col,r:r||7,t:5});}
function bossPattern(e,tg){
  const d=e.d,pat=d.pats[e.pi%d.pats.length];e.pi++;const dmg=12*(1+G.ridx*.35)*(d.tier==='final'?1.4:1),col=d.acc,bz=e.z+22;
  const ta=tg?Math.atan2(tg.y-e.y,tg.x-e.x):0;
  switch(pat){
  case'charge':if(tg){e.charge=.85;e.cvx=Math.cos(ta);e.cvy=Math.sin(ta);fx.push({k:'tele',shape:'line',x:e.x,y:e.y,x2:e.x+Math.cos(ta)*500,y2:e.y+Math.sin(ta)*500,w:e.r*2,t:.45,max:.45,dmg:0});e.chargeDelay=.45;}break;
  case'ring':{const n=d.tier==='mini'?14:20;const off=rand(0,1);for(let i=0;i<n;i++)bullet(e.x,e.y,bz,(i+off)/n*6.2832,150,dmg,col);break;}
  case'spiral':e.spiral=2.2;break;
  case'aimed':for(let i=-2;i<=2;i++)bullet(e.x,e.y,bz,ta+i*.18,230,dmg,col);break;
  case'summon':{const en=realmEnemyList();for(let i=0;i<7;i++){const a=i/7*6.28;const k=en[i%2];const dd=ENEMIES[k];const hm=1+G.ridx*.85+G.rt/60*.34;const x=e.x+Math.cos(a)*(e.r+30),y=e.y+Math.sin(a)*(e.r+30);
    enemies.push({key:k,d:dd,x,y,z:groundAt(x,y),hp:dd.hp*hm,maxHp:dd.hp*hm,spd:dd.spd,dmg:dd.dmg*(1+G.ridx*.35),r:dd.r,xp:dd.xp,flash:0,soul:0,ph:rand(0,6),stun:0,slow:0,mark:0,conf:0});}break;}
  case'slam':for(const p of players){if(p.down)continue;fx.push({k:'tele',shape:'circle',x:p.x,y:p.y,r:60,t:1,max:1,dmg:dmg*2.2});}break;
  case'gaze':if(tg)fx.push({k:'tele',shape:'line',x:e.x,y:e.y,x2:e.x+Math.cos(ta)*800,y2:e.y+Math.sin(ta)*800,w:22,t:.9,max:.9,dmg:dmg*2.5,beam:true,col});break;
  }
}
function updBoss(e,tg,dt,sp){
  e.pc-=dt;if(e.pc<=0){bossPattern(e,tg);e.pc=e.tier==='final'?1.6:e.tier==='boss'?2.1:2.6;}
  if(e.spiral>0){e.spiral-=dt;e.sa+=dt*4;e.st_=(e.st_||0)-dt;if(e.st_<=0){e.st_=.09;const dmg=10*(1+G.ridx*.35),bz=e.z+22;bullet(e.x,e.y,bz,e.sa,140,dmg,e.d.acc);bullet(e.x,e.y,bz,e.sa+Math.PI,140,dmg,e.d.acc);if(e.tier!=='mini')bullet(e.x,e.y,bz,e.sa+Math.PI/2,140,dmg,e.d.acc);}}
  if(e.chargeDelay>0){e.chargeDelay-=dt;return;}
  if(e.charge>0){e.charge-=dt;e.x+=e.cvx*sp*3.6*dt;e.y+=e.cvy*sp*3.6*dt;}
  else if(tg){const dx=tg.x-e.x,dy=tg.y-e.y,d=Math.hypot(dx,dy)||1;let ux=dx/d,uy=dy/d;if(e.d.arch==='serpent'){const w=Math.sin(T*2.5+e.ph)*.8;const nx=ux-uy*w,ny=uy+ux*w;ux=nx;uy=ny;}
    if(d>e.r*1.2||e.d.arch==='serpent'){e.x+=ux*sp*dt;e.y+=uy*sp*dt;}}
  if(e.segs){e.hist.unshift([e.x,e.y]);if(e.hist.length>e.segs.length*8+8)e.hist.pop();for(let i=0;i<e.segs.length;i++){const h=e.hist[Math.min(e.hist.length-1,(i+1)*7)];e.segs[i].x=h[0];e.segs[i].y=h[1];}
    for(const s of e.segs)for(const p of players){if(p.down||p.hidden>0)continue;if(p.z-groundAt(s.x,s.y)>34)continue;if((p.x-s.x)**2+(p.y-s.y)**2<(s.r+p.r)**2)damagePlayer(p,e.dmg*.6);}}
}
function hurt(e,base,p){
  if(e.proxy)e=e.proxy;if(e.dead)return;
  let d=base;if(p)d*=pMul(p);let crit=false,weak=false;
  if(p){if(p.crit&&Math.random()<p.crit){d*=1+p.critDmg;crit=true;}if(e.boss||e.elite)d*=1+p.bossDmg;if(e.boss&&e.d.weak.includes(p.god)){d*=2;weak=true;}if(e.mark>0)d*=2*p.markMul;}
  if(e.qmul)d*=e.qmul;d=Math.max(1,Math.round(d));if(e.qcap)d=Math.min(d,e.qcap);if(e.qbud!=null){d=Math.min(d,Math.floor(e.qbud));e.qbud-=d;}e.hp-=d;e.flash=.08;if(e.qfloor&&e.hp<e.maxHp*e.qfloor){e.hp=e.maxHp*e.qfloor;if(e.onFloor)e.onFloor(e);}if(e.onHit)e.onHit(e,d,p);if(p&&G&&G.qfx)qOnHurt(e,p);
  if(p&&p.ctrl!=='net'&&G){G.dmgTotal+=d;G.dmgWin.push([G.t,d]);}
  if(p&&!e.boss){if(p.stunChance&&Math.random()<p.stunChance)e.stun=.6;if(p.confuse&&Math.random()<p.confuse)e.conf=3;if(p.execute&&e.hp>0&&e.hp<e.maxHp*p.execute)e.hp=0;}
  if(texts.length<110)texts.push({x:e.x+rand(-6,6),y:e.y,z:(e.z||0)+(e.boss?e.r*2.2:e.r*2.4),v:String(d),t:.6,c:crit?C.gold:weak?'#7de0ff':C.bone});
  if(e.hp<=0)kill(e,p);
}
function pMul(p){return p.dmgMul*(p.rage>0?1.9:1)*(p.crown>0?1.3:1)*(p.bond?1.12:1)*(p.hidden>0?2:1)*(p.giant>0?1.6:1)*(1+p.frenzy*.04)*(p.growDmg?1+G.t/60*.03:1);}
function kill(e,p){
  if(e.dead)return;e.dead=true;G.kills++;G.warKills++;
  if(p){p.kills++;p.mk++;if(p.steal){const g=Math.min(p.steal,p.stB||0);if(g>0){p.stB-=g;heal(p,g);}}if(p.frenzyOn){p.frenzy=Math.min(10,p.frenzy+1);p.frenzyT=2;}}
  if(e.boss){for(let i=0;i<8;i++)gems.push({x:e.x+rand(-30,30),y:e.y+rand(-30,30),v:e.xp/8,t:'p'});}
  else if(gems.length<420)gems.push({x:e.x,y:e.y,v:e.xp,t:e.xp>=5?'b':'g'});else pick(gems).v+=e.xp;
  const dm=Math.max(...players.map(q2=>q2.dropMul)),lk=teamLuck();const hW=1/(1+.6*waveK());if(Math.random()<.03*dm*(1+lk)*hW||e.boss)heals.push({x:e.x+rand(-10,10),y:e.y+rand(-10,10)});
  if(!p||p.ctrl!=='net'){if(e.boss||Math.random()<(e.elite?.35:.006)*(1+lk)*hW)drops.push({k:'nectar',x:e.x+rand(-14,14),y:e.y+rand(-14,14),t:0});else if(Math.random()<(e.elite?.12:.003)*(1+lk))drops.push({k:'iman',x:e.x,y:e.y,t:0});else if(Math.random()<(e.elite?.25:.008)*(1+lk))drops.push({k:'bolsa',x:e.x,y:e.y,t:0});}
  const n=e.boss?36:5;for(let i=0;i<n;i++)fx.push({k:'p',x:e.x,y:e.y,z:(e.z||0)+12,vx:rand(-130,130),vy:rand(-130,130),vz:rand(60,220),t:rand(.35,.7),c:e.boss?e.d.acc:shade(e.d.col,-.1)});
  if(G.conc.inframundo&&!e.boss&&Math.random()<.12&&allies.length<30&&p)allies.push(mkAlly('shade',p,e.x,e.y,10));
  if(G.conc.guerra&&G.warKills>=100){G.warKills=0;for(const q2 of players){if(q2.down)continue;fx.push({k:'ring',x:q2.x,y:q2.y,r:230,t:.5,max:.5,col:C.blood});near(q2.x,q2.y,270,ee=>{if((ee.x-q2.x)**2+(ee.y-q2.y)**2<230*230)hurt(ee,150,q2);});}banner('¡FURIA DE GUERRA!');}
  if(!p||p.ctrl!=='net'){const gm=(players[0]&&players[0].goldMul)||1;G.money+=(e.boss?60:e.elite?10:.35)*gm;G.realmScore+=e.boss?150:e.elite?10:1;
    G.combo=(G.combo||0)+1;G.comboT=3;G.bestCombo=Math.max(G.bestCombo||0,G.combo);addScore(e.boss?(e.tier==='final'?50000:e.tier==='mini'?2500:10000):e.elite?100:10);
    G.streak=G.streakT>0?G.streak+1:1;G.streakT=1.6;G.bestStreak=Math.max(G.bestStreak,G.streak);
    missionAdd('kills',1);if(e.elite){missionAdd('elites',1);G.elites++;}if(p&&p.air)missionAdd('air',1);if(e.boss&&e.tier==='mini')missionAdd('mini',1);if(e.boss)G.bossKills++;}
  if(!p||p.ctrl!=='net'){const nc=e.boss?(e.tier==='mini'?14:30):e.elite?8:(Math.random()<Math.min(.95,.7+.25*teamLuck())?1:0);dropCoins(e.x,e.y,(e.z||groundAt(e.x,e.y))+10,nc,1+(G.ridx+(G.wave||1)-1)*.5);}
  if(e.elite&&Math.random()<.4)WORLD.chests.push({x:e.x,y:e.y,opened:false,rich:false,free:true});
  if(e.boss)WORLD.chests.push({x:e.x+20,y:e.y,opened:false,rich:true,free:true});
  if(G.challenge&&e.chal){G.challenge.left--;if(G.challenge.left<=0){const c=G.challenge;WORLD.chests.push({x:c.x+30,y:c.y,opened:false,rich:true,free:true});bigBanner('¡DESAFÍO SUPERADO!','Un cofre del jefe aparece junto a la estatua');G.challenge=null;}}
  if(e.boss&&e.tier==='boss'&&G.diffKey!=='normal'){const st=PROF.stats;st.realmHard=st.realmHard||{};if(!st.realmHard[G.realm]){st.realmHard[G.realm]=1;checkSecrets(true);}}
  if(G&&G.q)qOnKill(e,p);
  if(e.boss){G.bossKeys.push(e.key);if(e.key==='khaos'&&G.diffKey!=='normal')G.khaosHard=true;bossDefeated(e);}
}
function dropCoins(x,y,z,n,v){for(let i=0;i<n&&coins.length<500;i++){const a=rand(0,6.283),sp=n>1?rand(40,170):rand(10,40);coins.push({x,y,z,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,vz:rand(160,300),v,t:0,ph:rand(0,6.28)});}}
function addGold(v,p){const m=(p&&p.goldMul)||1;const g=v*m;G.gold+=g;G.goldTotal+=g;}
function chestPrice(){return Math.round((12+G.chestsBought*8)*(1+G.ridx*.4));}
const SHOP_PRICE={comun:22,raro:45,epico:85,legendario:150};
function shrinePrice(sh){return Math.round((30+sh.uses*25)*(1+G.ridx*.4));}
function noGold(x,y,need){texts.push({x,y,z:surfaceAt(x,y)+60,v:`Faltan ${Math.ceil(need)} de oro`,t:1.1,c:'#ff6a5a'});}
function useShrine(sh,p){
  switch(sh.type){
  case'fortuna':{const pr=shrinePrice(sh);if(G.gold<pr){noGold(sh.x,sh.y,pr-G.gold);return;}G.gold-=pr;sh.uses++;if(sh.uses>=3)sh.used=true;G.itemQueue.push({p,rich:Math.random()<.3});bigBanner('LA FORTUNA SONRÍE','Un objeto a cambio de tu oro');break;}
  case'desafio':{sh.used=true;const list=realmEnemyList();const n=5+G.ridx*2;G.challenge={x:sh.x,y:sh.y,left:n};
    for(let i=0;i<n;i++){const a=i/n*6.283;const x=sh.x+Math.cos(a)*170,y=sh.y+Math.sin(a)*170;const ek=pick(list),d=ENEMIES[ek];const hm=(1+G.ridx*.85+G.rt/60*.34)*(players.length>1?1.35:1);
      enemies.push({key:ek,d,x,y,z:groundAt(x,y),hp:d.hp*hm*7,maxHp:d.hp*hm*7,spd:d.spd*.9,dmg:d.dmg*(1+G.ridx*.35)*1.5,r:d.r*1.4,xp:d.xp*6,elite:true,chal:true,flash:0,soul:0,ph:rand(0,6.28),stun:0,slow:0,mark:0,conf:0,shH:0});
      fx.push({k:'ring',x,y,r:60,t:.5,max:.5,col:'#ff4d5e'});}
    bigBanner('¡DESAFÍO!',`Derrota a ${n} élites y gana un cofre del jefe`);break;}
  case'fuente':{sh.used=true;for(const q of players){if(!q.down)heal(q,q.maxHp);fx.push({k:'ring',x:q.x,y:q.y,r:120,t:.6,max:.6,col:'#4fc3ff'});}bigBanner('FUENTE SAGRADA','Vida restaurada');break;}
  case'maldito':{sh.used=true;G.curse++;for(const q of players)q.dmgMul*=1.2;bigBanner('PACTO MALDITO','+20 % de daño, pero los enemigos aguantan más');break;}
  }}
function openShop(m,p){state='levelup';joy=null;look=null;keys.clear();if(document.pointerLockElement)try{document.exitPointerLock();}catch(_){}
  if(!m.offers)m.offers=itemPicks(Math.random()<.25).map(k=>({k,sold:false}));
  $('luEyebrow').textContent='Mercader';$('luWho').textContent=`Tienes ${Math.floor(G.gold)} de oro`;
  const box=$('cards');box.innerHTML='';const mul=1+G.ridx*.4;
  m.offers.forEach((o,i)=>{const d=ITEMS[o.k],n=p.items[o.k]||0,rr=RAR[d.rar],pr=Math.round(SHOP_PRICE[d.rar]*mul);const bt=document.createElement('button');bt.className='card rar-'+d.rar;bt.style.setProperty('--rc',rr.col);
    bt.innerHTML=`<span class="ch">${o.sold?'Vendido':'<i class="cn gold"></i> '+pr+' de oro'}</span><span class="top2"><span class="em">${d.em}</span><span><span class="nm">${d.name}</span><br><span class="pill" style="background:${rr.col}">${rr.name}</span> <span class="lv">x${n+1} de ${d.max}</span></span></span><span class="ds">${d.desc}</span><kbd>${i+1}</kbd>`;
    bt.disabled=o.sold||n>=d.max||G.gold<pr;bt.onclick=()=>{if(G.gold<pr)return;G.gold-=pr;o.sold=true;p.items[o.k]=n+1;d.apply(p);refreshLoadout();openShop(m,p);};box.appendChild(bt);});
  const hp=document.createElement('button');const hpP=Math.round(15*mul);hp.className='card skip';hp.innerHTML=`<span class="nm">Poción de ambrosía · ${hpP} de oro</span><span class="ds">Recupera el 60 % de la vida.</span>`;hp.disabled=G.gold<hpP||p.hp>=p.maxHp;hp.onclick=()=>{G.gold-=hpP;heal(p,p.maxHp*.6);openShop(m,p);};box.appendChild(hp);
  const rr=document.createElement('button');const rrP=Math.round((10+m.rerolls*6)*mul);rr.className='card skip';rr.innerHTML=`<span class="nm">Renovar mercancía · ${rrP} de oro</span><span class="ds">Tres objetos nuevos.</span>`;rr.disabled=G.gold<rrP;rr.onclick=()=>{G.gold-=rrP;m.rerolls++;m.offers=null;openShop(m,p);};box.appendChild(rr);
  const ex=document.createElement('button');ex.className='card skip';ex.innerHTML='<span class="nm">Salir de la tienda</span><span class="ds">Esc también cierra.</span>';ex.onclick=closeShop;box.appendChild(ex);
  G.shopOpen=true;show('levelup');}
function closeShop(){G.shopOpen=false;show(null);state='play';focusGame();}
const REALM_STORY={tartaro:'Khaos rompió las cadenas del Tártaro: los titanes despiertan.',jotunheim:'El hielo de Ymir avanza; los gigantes huelen el Ragnarök.',duat:'Apep se traga la barca de Ra: la noche no termina.',
 kur:'Tiamat agita las aguas del caos bajo los zigurats.',lanka:'Ravana abre las puertas de su isla dorada a los demonios.',yomi:'Izanami llama a los muertos de la noche eterna.',diyu:'Las diez cortes del infierno están vacías: sus jueces huyeron.',
 mictlan:'Mictlantecuhtli reclama la Ciudad de los Dioses.',xibalba:'Los Señores de Xibalbá retan a los dioses al juego de pelota.',ukupacha:'Supay sube del mundo de abajo hasta Machu Picchu.',
 orun:'El cielo de los orishas se oscurece: algo devora la luz de Olodumare.',annwn:'Las brumas de Annwn se tragan a los vivos.',vacio:'Aquí empezó todo. Aquí termina todo.'};
const REALM_EV={lanka:'monzon',orun:'tormenta',ukupacha:'granizo',tartaro:'erupcion',vacio:'erupcion',jotunheim:'ventisca',annwn:'ventisca',duat:'arena',kur:'arena',cielo:'juicio',mictlan:'muertos',xibalba:'muertos',yomi:'muertos',diyu:'muertos'};
function updRealmEvents(dt){G.slowT=Math.max(0,G.slowT-dt);G.darkT=Math.max(0,G.darkT-dt);G.sandT=Math.max(0,G.sandT-dt);
  if(G.ev){const ev=G.ev;ev.t-=dt;ev.acc+=dt;const tgt=()=>{const al=players.filter(q=>!q.down);return pick(al.length?al:players);};
    if(ev.k==='erupcion'&&ev.acc>.28/DF().ev){ev.acc=0;const q=tgt();const x=q.x+rand(-240,240)+q.fx*80,y=q.y+rand(-240,240)+q.fy*80;fx.push({k:'tele',shape:'circle',x,y,r:rand(45,70),t:1.15,dmg:26*DF().dmg,col:'#ff6a1a'});}
    if((ev.k==='monzon'||ev.k==='tormenta'||ev.k==='granizo')&&ev.acc>(ev.k==='granizo'?.3:.45)/DF().ev){ev.acc=0;const q=tgt();const x=q.x+rand(-260,260),y=q.y+rand(-260,260);fx.push({k:'tele',shape:'circle',x,y,r:ev.k==='granizo'?36:60,t:1.1,dmg:(ev.k==='granizo'?14:26)*DF().dmg,col:ev.k==='tormenta'?'#ffe060':ev.k==='granizo'?'#e8f4ff':'#5ab0ff',snow:ev.k==='granizo'});if(ev.k==='tormenta')setTimeout(()=>{if(G)strike(x,y,0,null,'#ffe060');},1100);}
    if(ev.k==='ventisca'&&ev.acc>.5/DF().ev){ev.acc=0;const q=tgt();fx.push({k:'tele',shape:'circle',x:q.x+rand(-220,220),y:q.y+rand(-220,220),r:50,t:1.2,dmg:20*DF().dmg,col:'#9fe0ff',snow:true});}
    if(ev.k==='juicio'&&ev.acc>.75/DF().ev){ev.acc=0;const q=tgt();const a=rand(0,6.28),L2=520;fx.push({k:'tele',shape:'line',x:q.x-Math.cos(a)*L2/2,y:q.y-Math.sin(a)*L2/2,x2:q.x+Math.cos(a)*L2/2,y2:q.y+Math.sin(a)*L2/2,w:46,t:1.3,dmg:30*DF().dmg,col:'#fff2a0',beam:true});}
    if(ev.t<=0)G.ev=null;return;}
  if(G.portals||G.bosses.length)return;G.evT-=dt;if(G.evT>0)return;G.evT=rand(32,50)/DF().ev;
  let k=REALM_EV[G.realm]||'horda';if(G.realm==='ukupacha'&&G.q&&G.q.braz.some(b=>b.lit)&&Math.random()<.5)k='ventisca';const en=realmEnemyList(),a0=rand(0,6.28);
  switch(k){
  case'erupcion':G.ev={k,t:7,acc:0};bigBanner('¡ERUPCIÓN!','Llueven rocas de lava: muévete o salta');G.shake=Math.max(G.shake,.6);break;
  case'ventisca':G.ev={k,t:12,acc:0};G.slowT=12;bigBanner('¡VENTISCA!',G.q&&(G.q.shelters.length||G.q.braz.some(b=>b.lit))?'Refúgiate en un tambo o junto a un brasero encendido':'El frío te frena y caen carámbanos');break;
  case'arena':G.sandT=11;bigBanner('¡TORMENTA DE ARENA!','No ves nada… y algo se acerca');for(let i=0;i<Math.round(16*DF().sp);i++)spawn(en[1]||en[0],a0+rand(-.5,.5));break;
  case'monzon':G.ev={k,t:10,acc:0};G.slowT=10;bigBanner('¡MONZÓN!','La lluvia te frena y los relámpagos caen');break;
  case'tormenta':G.ev={k,t:9,acc:0};bigBanner('¡LA IRA DE SHANGÓ!','Caen rayos del cielo de Orun');break;
  case'granizo':G.ev={k,t:9,acc:0};G.slowT=9;bigBanner('¡GRANIZADA ANDINA!','Ccoa suelta el granizo sobre las terrazas');break;
  case'juicio':G.ev={k,t:10,acc:0};bigBanner('¡EL JUICIO!','Haces de luz barren el cielo');break;
  case'muertos':G.darkT=12;bigBanner('LA NOCHE DE LOS MUERTOS','Se apaga la luz y salen de todas partes');for(let i=0;i<Math.round(22*DF().sp);i++)spawn(pick(en),rand(0,6.28));break;
  default:bigBanner('¡UNA HORDA!','Llegan todos por el mismo lado');for(let i=0;i<Math.round(28*DF().sp);i++)spawn(pick(en),a0+rand(-.35,.35));}}
function checkSecrets(live){const out=[];for(const id in SECRET_GODS){if(!PROF.owned.includes(id)&&SECRET_GODS[id].test(PROF)){PROF.owned.push(id);out.push(id);}}if(out.length){saveProfile();if(live)setTimeout(()=>bigBanner('¡DIOS SECRETO DESBLOQUEADO!',out.map(id=>GOD[id].name).join(' y ')),2500);G.unlocked=(G.unlocked||[]).concat(out);}return out;}
function missionAdd(id,v){if(!G.missions)return;for(const m of G.missions){if(m.done||m.id!==id)continue;m.prog=Math.min(m.n,m.prog+v);if(m.prog>=m.n)missionDone(m);}}
function missionSet(id,v){if(!G.missions)return;for(const m of G.missions){if(m.done||m.id!==id)continue;m.prog=Math.min(m.n,Math.floor(v));if(m.prog>=m.n)missionDone(m);}}
function missionDone(m){m.done=true;addScore(1000);G.missionsDone++;G.money+=m.rew;dailyAdd('d_missions',1);bigBanner('MISIÓN COMPLETADA',`${m.txt} · +${m.rew} dracmas`);const p=players.find(q=>!q.down)||players[0];for(let i=0;i<10;i++)gems.push({x:p.x+rand(-50,50),y:p.y+rand(-50,50),v:3,t:'b'});}
function bossDefeated(e){
  if(e.nem){bigBanner('¡NÉMESIS DERROTADA!',`${e.d.name} cae · +25 000 puntos`);addScore(25000);WORLD.chests.push({x:e.x-24,y:e.y,opened:false,rich:true,free:true});drops.push({k:'nectar',x:e.x,y:e.y+20,t:0});}
  G.bosses=G.bosses.filter(bb=>bb!==e);
  const alive=players.filter(p=>!p.down);if(alive.length)say(pick(alive),pick(LINES.boss),.3);
  if(e.tier==='final'){setTimeout(()=>{if(state==='play')endGame(true);},1800);bigBanner('KHAOS HA CAÍDO','La creación sigue en pie');for(const n of npcs)say(n,'Bien hecho. Descansad.',.6);return;}
  if(e.tier==='boss'){
    if(G.mode==='libre'){G.cycle++;G.waveT=6;bigBanner('¡OLEADA SUPERADA!',`En 6 s pasas a la oleada ${(G.wave||1)+1}`);for(const p of players)if(!p.down)heal(p,p.maxHp*.25);return;}
    const c=camera();const rest=Object.keys(REALMS).filter(k=>k!=='vacio'&&!G.visited.includes(k));
    const opts=G.ridx>=2?['vacio']:shuffle(rest).slice(0,2);
    G.portals=opts.map((k,i)=>{let x=c.x+(opts.length===1?0:(i?150:-150)),y=c.y-90;const d=Math.hypot(x,y);if(d>ARENA-120){x*=(ARENA-120)/d;y*=(ARENA-120)/d;}return{key:k,x,y,t:0};});
    bigBanner('SE ABREN LOS PORTALES',opts.length===1?'El Vacío Primordial te espera':'Elige tu próximo reino');
  }
}
function damagePlayer(p,amt,src){
  if(p.down||p.hidden>0||p.inv>0||p.charging>0||p.ctrl==='npc'||p.ctrl==='net')return;
  if(p.shield>0)return;
  if(p.evasion&&Math.random()<p.evasion){p.inv=.3;texts.push({x:p.x,y:p.y,z:p.z+60,v:'ESQUIVA',t:.7,c:'#9ad0ff'});return;}
  if(p.thorns&&src&&!src.dead)hurt(src,amt*p.thorns,p);
  amt=Math.max(1,amt-p.armor);p.hp-=amt;if(window.DBGH)DBGH(p,amt,src);playerHit(p,amt);if(p.qFlame)qFlameHit(p);p.inv=.45+p.invBonus;p.hurt=1;if(p.ctrl!=='ai'){G.noHitT=0;if(G.combo>=20){const lost=G.combo-Math.floor(G.combo/2);G.combo=Math.floor(G.combo/2);texts.push({x:p.x,y:p.y,z:p.z+76,v:`COMBO -${lost}`,t:.9,c:'#ff9a5a'});}}
  if(G.conc.tierra){near(p.x,p.y,120,e=>{const ee=e.proxy||e;if(!ee.boss&&(e.x-p.x)**2+(e.y-p.y)**2<100*100)ee.stun=1.5;});fx.push({k:'ring',x:p.x,y:p.y,r:90,t:.3,max:.3,col:'#6a8a3a'});}
  if(p.hp<=0)downPlayer(p);
}
let HIT_AC=null;
function hitSound(k){try{HIT_AC=HIT_AC||new (window.AudioContext||window.webkitAudioContext)();const a=HIT_AC,t=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.setValueAtTime(220-k*60,t);o.frequency.exponentialRampToValueAtTime(70,t+.14);g.gain.setValueAtTime(.06+k*.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g).connect(a.destination);o.start(t);o.stop(t+.17);}catch(_){}}
function playerHit(p,amt){if(!G||(p.ctrl!=='p1'&&p.ctrl!=='p2'))return;const k=Math.min(1,amt/Math.max(20,p.maxHp*.25));
  p.hurtT=.28;G.hitT=Math.max(G.hitT||0,.35+k*.35);G.shake=Math.min(1,G.shake+.18+k*.3);
  texts.push({x:p.x+rand(-6,6),y:p.y,z:p.z+56,v:'-'+Math.max(1,Math.round(amt)),t:.85,c:'#ff4a4a',big:true});
  for(let i=0;i<6;i++)fx.push({k:'p',x:p.x,y:p.y,z:p.z+20,vx:rand(-90,90),vy:rand(-90,90),vz:rand(60,180),t:.35,c:'#ff3a3a'});
  if(!G.hitSndT||G.t-G.hitSndT>.12){G.hitSndT=G.t;hitSound(k);const c=document.querySelector('.hudcard');if(c){c.classList.remove('hit');void c.offsetWidth;c.classList.add('hit');}}}
function downPlayer(p){if(p.lives>0){p.lives--;p.hp=p.maxHp*.5;p.inv=2.5;say(p,'¡Aún no es mi hora!');fx.push({k:'ring',x:p.x,y:p.y,r:120,t:.6,max:.6,col:C.gold});}
  else{p.down=true;p.hp=0;p.revive=0;const o=players.find(q2=>q2!==p&&!q2.down);if(o)say(o,pick(LINES.down));}}

/* ---------- actualización ---------- */
function update(dt){
  if(G.comboT>0){G.comboT-=dt;if(G.comboT<=0)G.combo=0;}
  G.t+=dt;G.rt+=dt;G.hitT=Math.max(0,(G.hitT||0)-dt);for(const p of players)p.hurtT=Math.max(0,(p.hurtT||0)-dt);G.noHitT+=dt;missionSet('nohit',G.noHitT);G.streakT-=dt;if(G.dmgWin.length>400||(G.dmgWin.length&&G.dmgWin[0][0]<G.t-4))G.dmgWin=G.dmgWin.filter(w=>w[0]>=G.t-4);
  updRemotes(dt);
  for(const p of players){
    p.inv-=dt;p.pow=Math.max(0,p.pow-dt);p.hidden-=dt;p.radiant-=dt;p.shield-=dt;p.rage-=dt;p.giant-=dt;p.crown-=dt;p.sayT-=dt;p.hurt=Math.max(0,(p.hurt||0)-dt*2);
    if(p.frenzyT>0){p.frenzyT-=dt;if(p.frenzyT<=0)p.frenzy=0;}
    if(p.down)continue;
    p.hp=Math.min(p.maxHp,p.hp+p.regen*dt);if(p.steal){const cap=2+p.steal*4;p.stB=Math.min(cap,(p.stB||0)+cap*dt);}
    let mx=0,my=0;
    if(p.ctrl==='ai')[mx,my]=aiMove(p,dt);else[mx,my]=moveInput(p);
    const ml=Math.hypot(mx,my);p.moving=ml>.05;
    const hz=hazardAt(p.x,p.y);
    p.dashT-=dt;p.dashCd-=dt;
    const spd=p.speed*(G.slowT>0&&!inShelter(p)?.72:1)*(p.qRelic?.9:1)*(p.rage>0?1.35:1)*(hz&&hz.k==='water'&&!p.air?.7:1)*(p.dashT>0?2.6:1);
    if(p.pocketBolt){p.pbT-=dt;if(p.pbT<=0){p.pbT=8/p.pocketBolt;skybolts(p,1,60+G.level*5);}}
    if(p.charging>0){p.charging-=dt;tryMove(p,p.cvx*spd*3.6*dt,p.cvy*spd*3.6*dt);near(p.x,p.y,60,e=>{const ee=e.proxy||e;if(p.chHit.has(ee))return;if((e.x-p.x)**2+(e.y-p.y)**2<(e.r+p.r+10)**2){p.chHit.add(ee);hurt(e,70*(1+G.level*.07),p);if(!ee.boss)push(ee,p.x,p.y,40);}});if(Math.random()<.6)fx.push({k:'p',x:p.x,y:p.y,z:p.z+10,vx:rand(-30,30),vy:rand(-30,30),vz:rand(20,80),t:.4,c:WEAPONS[p.g.w].col});}
    else if(p.moving||p.dashT>0){if(!p.moving){mx=p.fx;my=p.fy;}else if(ml>1){mx/=ml;my/=ml;}const moved=tryMove(p,mx*spd*dt,my*spd*dt);const n=Math.hypot(mx,my);p.fx=mx/n;p.fy=my/n;p.step+=dt*8;if(!moved&&p.ctrl==='ai')jump(p);}
    physics(p,dt);
    p.lavaT=(p.lavaT||0)-dt;if(!hz&&!p.air)p.safe=[p.x,p.y];if(p.lavaBack>0&&p.safe){p.lavaBack-=dt;const dx=p.safe[0]-p.x,dy=p.safe[1]-p.y,d=Math.hypot(dx,dy);if(d>4)tryMove(p,dx/d*Math.min(d,420*dt),dy/d*Math.min(d,420*dt),true);}
    if(hz&&!p.air&&hz.k==='lava'&&p.lavaT<=0){p.lavaT=.55;p.lavaBack=.6;const dm=16*DF().dmg;p.hp-=dm;if(window.DBGH)DBGH(p,dm,{key:'LAVA'});playerHit(p,dm);p.vz=430;p.air=true;p.burn=2.6;p.hurt=1;texts.push({x:p.x,y:p.y,z:p.z+60,v:'¡LAVA!',t:.8,c:'#ff8a3a'});for(let i=0;i<14;i++)fx.push({k:'p',x:p.x+rand(-10,10),y:p.y+rand(-10,10),z:p.z,vx:rand(-90,90),vy:rand(-90,90),vz:rand(120,320),t:.6,c:i%2?'#ffb040':'#ff4a1a'});G.noHitT=0;}
    if(hz&&!p.air&&hz.k==='void'){const sf=p.safe||[0,0];p.hp-=p.maxHp*.2*DF().dmg;playerHit(p,p.maxHp*.2*DF().dmg);p.x=sf[0];p.y=sf[1];p.z=surfaceAt(p.x,p.y)+120;p.vz=0;p.air=true;p.inv=Math.max(p.inv,1);texts.push({x:p.x,y:p.y,z:p.z,v:'¡AL VACÍO!',t:1,c:'#b07aff'});G.noHitT=0;}
    if(p.burn>0){p.burn-=dt;p.hp-=dt*7*DF().dmg;if(Math.random()<.4)fx.push({k:'p',x:p.x+rand(-7,7),y:p.y+rand(-7,7),z:p.z+rand(5,30),vx:0,vy:0,vz:rand(30,80),t:.4,c:Math.random()<.5?'#ff8a3a':'#ffd060'});}
    if(p.hp<=0){p.hp=1;if(!p.inv||p.inv<=0){p.hp=0;downPlayer(p);}}
    p.r=p.giant>0?26:14;
  }
  if(G.coop){const hs=players.filter(p=>p.ctrl!=='ai'&&!p.down);if(hs.length===2){const[a,b]=hs,d=Math.hypot(a.x-b.x,a.y-b.y);if(d>520){const k=(d-520)/d/2;const dx=(b.x-a.x)*k,dy=(b.y-a.y)*k;tryMove(a,dx,dy,true);tryMove(b,-dx,-dy,true);}}}
  for(const p of players){if(p.ctrl==='ai'){const c=camera();if(Math.hypot(p.x-c.x,p.y-c.y)>650){p.x=c.x+rand(-60,60);p.y=c.y+rand(-60,60);p.z=surfaceAt(p.x,p.y)+80;p.air=true;}}}
  for(const p of players){if(!p.down)continue;let reviving=false;for(const o of[...players,...remotesHere()]){if(o===p||o.down)continue;if(Math.hypot(o.x-p.x,o.y-p.y)<40){p.revive+=dt*(o.reviveMul||1);reviving=true;}}
    if(!reviving)p.revive=Math.max(0,p.revive-dt*.5);if(p.revive>=2.5){p.down=false;p.hp=p.maxHp*.4;p.inv=2;say(p,pick(LINES.thanks));}}
  if(players.length>1){const[a,b]=players;const rl=G.rel;a.bond=b.bond=false;
    if(rl&&rl.type==='aliado'&&!a.down&&!b.down&&Math.hypot(a.x-b.x,a.y-b.y)<150)a.bond=b.bond=true;
    G.duelT-=dt;if(G.duelT<=0){G.duelT=60;if(rl&&rl.type==='rival'&&(a.mk||b.mk)){const w=a.mk>=b.mk?a:b,l=w===a?b:a;w.crown=60;bigBanner(w.g.name.toUpperCase()+' GANA EL MINUTO',`${w.mk} a ${l.mk} contra ${l.g.name}`);say(w,pick(LINES.crown),.5);say(l,'La próxima es mía.',2);}a.mk=b.mk=0;}}
  while(G.events.length&&G.rt>=G.events[0].t){const ev=G.events.shift();spawnBoss(ev.key,ev.corrupt,ev.nem);}
  {const per=waveK()>=2?30:60,nr=24+waveK()*6;if(G.rt>=30&&Math.floor(G.rt)%per===0&&Math.floor(G.rt-dt)%per!==0&&!G.portals){const a0=rand(0,6.28),en=realmEnemyList();for(let i=0;i<nr;i++)spawn(en[0],a0+i/nr*6.28);banner('¡TE RODEAN!');}}
  updRealmEvents(dt);
  if(!G.portals){G.spawnAcc=(G.spawnAcc||0)+(1.4+G.rt/11+G.ridx*1.2+G.cycle+waveK()*2.5)*(players.length>1?1.3:1)*DF().sp*dt;
    while(G.spawnAcc>=1){G.spawnAcc--;if(enemies.length<320)spawn(pickEnemy());}}
  if(G.conc.trueno){G.trueT-=dt;if(G.trueT<=0){G.trueT=3.5;skybolts(players.find(p=>!p.down)||null,1,50+G.level*4);}}
  buildGrid();
  const c=camera(),slowMar=G.conc.mar?.85:1;
  for(const e of enemies){if(e.dead)continue;
    e.flash-=dt;e.mark-=dt;e.slow-=dt;
    const fly=e.boss?e.d.arch==='flyer'||e.d.arch==='titan':e.d.arch==='flyer';
    e.z=groundAt(e.x,e.y)+(fly?(e.boss?40:26)+Math.sin(T*3+e.ph)*4:0);
    if(!fly&&!e.boss&&WORLD.haz&&WORLD.haz.k==='lava'&&groundAt(e.x,e.y)<WORLD.haz.lv&&Math.random()<dt*4)hurt(e,e.maxHp*.12+10,null);
    if(e.stun>0){e.stun-=dt;continue;}
    if(!e.boss&&!e.quest&&(e.x-c.x)**2+(e.y-c.y)**2>900*900){const[x,y]=spawnPos();e.x=x;e.y=y;continue;}
    let sp=e.spd*(e.slow>0?.5:1)*slowMar;
    for(const p of players){if(p.slowAura&&!p.down&&(p.x-e.x)**2+(p.y-e.y)**2<110*110)sp*=1-p.slowAura;}
    const tg=targetFor(e);
    if(tg)e.face=((tg.x-e.x)*Math.cos(G.yaw)-(tg.y-e.y)*Math.sin(G.yaw))<0?-1:1;
    if(e.qai){e.qai(e,tg,dt,sp);}
    else if(e.boss){updBoss(e,tg,dt,sp);}
    else if(!tg||e.conf>0){if(e.conf>0)e.conf-=dt;e.ph+=dt*rand(-1,1);e.x+=Math.cos(e.ph)*sp*.5*dt;e.y+=Math.sin(e.ph)*sp*.5*dt;}
    else{const dx=tg.x-e.x,dy=tg.y-e.y,d=Math.hypot(dx,dy)||1;const wob=e.d.arch==='flyer'?Math.sin(T*6+e.ph)*.5:0;const ux=dx/d,uy=dy/d;
      const hop=e.d.feat==='hop'?(Math.sin(T*6+e.ph)>0?1.4:.2):1;e.x+=(ux-uy*wob)*sp*hop*dt;e.y+=(uy+ux*wob)*sp*hop*dt;}
    const dd0=Math.hypot(e.x,e.y);if(dd0>ARENA-40){e.x*=(ARENA-40)/dd0;e.y*=(ARENA-40)/dd0;}
    near(e.x,e.y,e.r+30,o=>{if(o===e||o.proxy===e)return;const sx=e.x-o.x,sy=e.y-o.y,sd=Math.hypot(sx,sy),mn=e.r+o.r;if(sd>0&&sd<mn){const pp=(mn-sd)*.35*((o.boss||o.proxy||o.heavy)?2:1)*(e.boss||e.heavy?.08:1);e.x+=sx/sd*pp;e.y+=sy/sd*pp;}});
    for(const p of players){if(p.down||p.hidden>0)continue;if(e.boss&&e.d.friend.includes(p.god))continue;
      if(Math.abs(p.z-e.z)>(e.boss?e.r*1.2:26)+(fly?10:0))continue;
      const dd=(p.x-e.x)**2+(p.y-e.y)**2,rr=e.r+p.r+(p.shield>0?8:0);if(dd>rr*rr)continue;
      if(p.shield>0||p.giant>0){if(T>e.shH){e.shH=T+.4;hurt(e,(25+2*G.level)*(p.giant>0?1.5:1),p);push(e,p.x,p.y,40);}}else damagePlayer(p,e.dmg,e);}
  }
  for(const p of players)if(!p.down)fireWeapons(p,dt);
  updNpcs(dt);updAllies(dt);
  for(const q2 of proj){
    if(q2.k==='boomer'){const sp=Math.hypot(q2.vx,q2.vy);q2.trav+=sp*dt;if(!q2.ret&&q2.trav>=q2.range){q2.ret=true;q2.hit.clear();}if(q2.ret){const dx=q2.o.x-q2.x,dy=q2.o.y-q2.y,d=Math.hypot(dx,dy)||1;q2.vx=dx/d*sp*1.1;q2.vy=dy/d*sp*1.1;q2.z+=((q2.o.z+22)-q2.z)*.1;if(d<18)q2.t=0;}}
    if(q2.k==='sword'){if(!q2.ret){if(q2.tg&&!q2.tg.dead){q2.tx=q2.tg.x;q2.ty=q2.tg.y;}const dx=q2.tx-q2.x,dy=q2.ty-q2.y,d=Math.hypot(dx,dy)||1,sp=Math.hypot(q2.vx,q2.vy);q2.vx=dx/d*sp;q2.vy=dy/d*sp;q2.z+=(((q2.tg&&q2.tg.z)||groundAt(q2.x,q2.y))+16-q2.z)*.15;
        if(d<22){q2.ret=true;swordSlash(q2);q2.vx*=-.2;q2.vy*=-.2;q2.hold=.12;}}
      else{q2.hold-=dt;if(q2.hold<=0){const dx=q2.o.x-q2.x,dy=q2.o.y-q2.y,d=Math.hypot(dx,dy)||1;q2.vx=dx/d*900;q2.vy=dy/d*900;q2.z+=((q2.o.z+28)-q2.z)*.15;if(d<24)q2.t=0;}else{q2.vx=0;q2.vy=0;}}
      if(Math.random()<.6)fx.push({k:'p',x:q2.x,y:q2.y,z:q2.z,vx:rand(-40,40),vy:rand(-40,40),vz:rand(10,70),t:rand(.2,.4),c:Math.random()<.5?'#ffb347':'#fff0a0'});}
    if(q2.k==='homing'){q2.rt-=dt;if(q2.rt<=0||!q2.tg||q2.tg.dead){q2.rt=.25;q2.tg=nearestE(q2.x,q2.y,400*((q2.o&&q2.o.range)||1));}if(q2.tg){const want=Math.atan2(q2.tg.y-q2.y,q2.tg.x-q2.x),cur=Math.atan2(q2.vy,q2.vx);const da=Math.atan2(Math.sin(want-cur),Math.cos(want-cur));const na=cur+clamp(da,-7*dt,7*dt);q2.vx=Math.cos(na)*q2.sp;q2.vy=Math.sin(na)*q2.sp;q2.z+=((q2.tg.z+14)-q2.z)*.08;}}
    q2.x+=q2.vx*dt;q2.y+=q2.vy*dt;q2.t-=dt;q2.rot+=dt*14;
    if(q2.k!=='homing'&&q2.k!=='boomer'&&q2.k!=='sword'){const g=groundAt(q2.x,q2.y)+8;if(q2.z<g)q2.z+=(g-q2.z)*.5;}
    near(q2.x,q2.y,q2.r+40,e=>{if(q2.pierce<=0)return;const key=e.proxy||e;if(q2.hit.has(key))return;if((e.x-q2.x)**2+(e.y-q2.y)**2<(e.r+q2.r)**2){q2.hit.add(key);hurt(e,q2.dmg,q2.o);q2.pierce--;
      if(q2.slow)key.slow=1.5;if(q2.k==='shot'&&q2.st!=='arrow'&&!key.boss)push(key,q2.x-q2.vx,q2.y-q2.vy,6);
      if(q2.k==='bounce'&&q2.bn>0){q2.bn--;const n2=nearestE(q2.x,q2.y,240,q2.hit);if(n2){const a=Math.atan2(n2.y-q2.y,n2.x-q2.x),s=Math.hypot(q2.vx,q2.vy);q2.vx=Math.cos(a)*s;q2.vy=Math.sin(a)*s;q2.pierce=1;q2.t=Math.max(q2.t,1);}}}});
    if(q2.pierce<=0)q2.t=0;}
  proj=proj.filter(q2=>q2.t>0);
  for(const pa of patches){pa.t-=dt;pa.tick-=dt;if(pa.tick<=0){pa.tick=.3;near(pa.x,pa.y,pa.r+40,e=>{if((e.x-pa.x)**2+(e.y-pa.y)**2<(pa.r+e.r)**2)hurt(e,pa.dmg,pa.o);});}}
  patches=patches.filter(pa=>pa.t>0);
  for(const bl of bullets){bl.x+=bl.vx*dt;bl.y+=bl.vy*dt;bl.t-=dt;if(groundAt(bl.x,bl.y)>bl.z+10)bl.t=0;
    for(const p of players){if(p.down||p.hidden>0)continue;if(Math.abs(p.z+18-bl.z)>22)continue;if((p.x-bl.x)**2+(p.y-bl.y)**2<(p.r+bl.r)**2){if(p.shield>0||p.giant>0){bl.t=0;}else if(p.inv<=0){damagePlayer(p,bl.dmg);bl.t=0;}}}}
  bullets=bullets.filter(bl=>bl.t>0);
  for(const f of fx){
    if(f.k==='wave'){f.r+=380*dt;near(f.x,f.y,f.r+40,e=>{const key=e.proxy||e;if(f.hit.has(key))return;if(Math.hypot(e.x-f.x,e.y-f.y)<f.r+e.r){f.hit.add(key);hurt(e,f.dmg,f.o);push(key,f.x,f.y,70);}});
      for(const bl of bullets)if(Math.abs(Math.hypot(bl.x-f.x,bl.y-f.y)-f.r)<20)bl.t=0;if(f.r>f.max)f.t=0;continue;}
    f.t-=dt;
    if(f.k==='p'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.92;f.vy*=.92;f.vz=(f.vz||0)-500*dt;f.z=(f.z||0)+f.vz*dt;const g=groundAt(f.x,f.y);if(f.z<g){f.z=g;f.vz*=-.3;}}
    if(f.k==='tele'&&f.t<=0&&f.dmg){for(const p of players){if(p.down)continue;if(p.z-groundAt(p.x,p.y)>26)continue;let hit=false;if(f.shape==='circle')hit=Math.hypot(p.x-f.x,p.y-f.y)<f.r+p.r;else{const vx=f.x2-f.x,vy=f.y2-f.y,L2=vx*vx+vy*vy,tt=clamp(((p.x-f.x)*vx+(p.y-f.y)*vy)/L2,0,1);hit=Math.hypot(p.x-(f.x+vx*tt),p.y-(f.y+vy*tt))<f.w/2+p.r;}if(hit&&f.snow&&inShelter(p))hit=false;if(hit){p.inv=0;damagePlayer(p,f.dmg);}}
      if(f.qslam)questSlam(f);
      fx.push(f.shape==='circle'?{k:'ring',x:f.x,y:f.y,r:f.r,t:.3,max:.3,col:f.col||C.blood}:{k:'beam',x:f.x,y:f.y,x2:f.x2,y2:f.y2,w:f.w,t:.3,max:.3,col:f.col||C.blood});}
  }
  fx=fx.filter(f=>f.t>0);
  enemies=enemies.filter(e=>!e.dead);
  for(const gm of gems){let best=null,bd=1e12;for(const p of players){if(p.down)continue;const d=(p.x-gm.x)**2+(p.y-gm.y)**2;if(d<bd){bd=d;best=p;}}if(!best)continue;const d=Math.sqrt(bd)||1;
    if(gm.pull||d<best.magnet){gm.pull=true;const s=Math.max(260,620-d);gm.x+=(best.x-gm.x)/d*s*dt;gm.y+=(best.y-gm.y)/d*s*dt;}if(d<best.r+8){gm.done=true;G.xp+=gm.v*best.xpMul;}}
  gems=gems.filter(gm=>!gm.done);
  for(const h of heals)for(const p of players){if(p.down||h.done)continue;if(Math.hypot(p.x-h.x,p.y-h.y)<p.r+14){h.done=true;heal(p,30*p.healMul);}}
  heals=heals.filter(h=>!h.done);updDrops(dt);for(const p of players){if(p.nectarCd>0)p.nectarCd-=dt;if(p.healGlow>0)p.healGlow-=dt;}
  for(const c of coins){c.t+=dt;c.vz-=900*dt;c.z+=c.vz*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.vx*=.96;c.vy*=.96;const g=surfaceAt(c.x,c.y);if(c.z<g){c.z=g;c.vz=c.vz<-60?-c.vz*.35:0;c.vx*=.6;c.vy*=.6;}
    if(c.t<.35)continue;let best=null,bd=1e12;for(const p of players){if(p.down)continue;const d=(p.x-c.x)**2+(p.y-c.y)**2;if(d<bd){bd=d;best=p;}}if(!best)continue;const d=Math.sqrt(bd)||1;
    if(c.pull||d<best.magnet*1.1){c.pull=true;const sp=Math.max(320,700-d);c.x+=(best.x-c.x)/d*sp*dt;c.y+=(best.y-c.y)/d*sp*dt;c.z+=(best.z+10-c.z)*Math.min(1,dt*8);}
    if(d<best.r+10){c.done=true;addGold(c.v,best);}}
  coins=coins.filter(c=>!c.done);
  // rayos en cola (tormentas escalonadas)
  if(G.boltQ.length){for(const b of G.boltQ){b.t-=dt;if(b.t<=0)strike(b.x,b.y,b.dmg,b.p,b.col,b.tgt);}G.boltQ=G.boltQ.filter(b=>b.t>0);}
  G.shake=Math.max(0,G.shake-dt*2.2);G.flashT=Math.max(0,G.flashT-dt);G.stormT=Math.max(0,G.stormT-dt);
  // altares y cofres (E para interactuar)
  G.prompt=null;
  for(const al of WORLD.altars){if(al.used)continue;let any=null;for(const p of players){if(p.down||p.ctrl==='ai')continue;if(Math.hypot(p.x-al.x,p.y-al.y)<44){any=p;break;}}
    if(any){if(any.wantE||isTouch){al.active=true;any.eUsed=true;}if(al.active){al.charge+=dt;if(al.charge>=2.5){al.used=true;G.queue.push(any);missionAdd('altars',1);bigBanner('ALTAR ACTIVADO','Un don extra de los dioses');}}else G.prompt={x:al.x,y:al.y,t:'E · Activar altar'};}else{al.charge=Math.max(0,al.charge-dt);al.active=false;}}
  for(const ch of WORLD.chests){if(ch.opened)continue;for(const p of players){if(p.down||p.ctrl==='ai')continue;if(Math.hypot(p.x-ch.x,p.y-ch.y)<34){const pr=ch.free?0:chestPrice();
      if(p.wantE||(isTouch&&(ch.free||G.gold>=pr))){p.eUsed=true;if(G.gold<pr){noGold(ch.x,ch.y,pr-G.gold);}else{G.gold-=pr;if(!ch.free)G.chestsBought++;ch.opened=true;G.chestsOpened++;addScore(200);missionAdd('chests',1);G.itemQueue.push({p,rich:!!ch.rich||Math.random()<(p.luck||0)*.3});if(!ch.rich&&(p.luck||0)>0&&Math.random()<p.luck*.5)drops.push({k:Math.random()<.5?'nectar':'bolsa',x:ch.x+rand(-20,20),y:ch.y+30,t:0});heal(p,15);dropCoins(ch.x,ch.y,surfaceAt(ch.x,ch.y)+20,ch.rich?10:3,1);}}
      else G.prompt={x:ch.x,y:ch.y,t:ch.rich?'E · Abrir cofre del jefe':pr?`E · Abrir cofre · ${pr} de oro`:'E · Abrir cofre',bad:G.gold<pr};break;}}}
  for(const sh of WORLD.shrines||[]){if(sh.used)continue;for(const p of players){if(p.down||p.ctrl==='ai')continue;if(Math.hypot(p.x-sh.x,p.y-sh.y)<46){
      if(p.wantE){p.eUsed=true;useShrine(sh,p);}else{const nm={fortuna:`E · Altar de la Fortuna · ${shrinePrice(sh)} de oro`,desafio:'E · Estatua del Desafío (élites → cofre)',fuente:'E · Fuente Sagrada (curar)',maldito:'E · Altar Maldito (+daño, enemigos más duros)'}[sh.type];G.prompt={x:sh.x,y:sh.y,t:nm,bad:sh.type==='fortuna'&&G.gold<shrinePrice(sh)};}break;}}}
  for(const m of WORLD.merchants||[]){for(const p of players){if(p.down||p.ctrl==='ai'||p.ctrl==='net')continue;if(Math.hypot(p.x-m.x,p.y-m.y)<60){if(p.wantE&&state==='play'){p.wantE=false;p.eUsed=true;openShop(m,p);}else G.prompt={x:m.x,y:m.y,t:'E · Comerciar con el mercader'};break;}}}
  questsUpdate(dt);
  for(const p of players){p.wantE=false;p.eUsed=false;}
  for(const t of texts){t.t-=dt;t.z+=40*dt;}texts=texts.filter(t=>t.t>0);
  if(bannerT>0){bannerT-=dt;if(bannerT<=0)$('banner').classList.remove('on');}
  if(G.waveT>0){G.waveT-=dt;if(G.waveT<=0){nextWave();return;}}
  if(G.portals){for(const pt of G.portals){pt.t+=dt;for(const p of players){if(p.ctrl==='ai'||p.down)continue;if(Math.hypot(p.x-pt.x,p.y-pt.y)<30){G.ridx++;startRealm(pt.key);return;}}}}
  while(G.xp>=G.need){G.xp-=G.need;G.level++;addScore(G.level*50);if(G.level===POW_LV){const p0=players[0];bigBanner('¡PODER DIVINO DESPERTADO!',`${p0.g.pn} · pulsa R`);}G.need=needFor(G.level);G.pending++;for(const p of players){if(p.thirdEye&&!p.down)skybolts(p,6,60+G.level*4);if(p.levelHeal)heal(p,p.maxHp);}}
  if(players.every(p=>p.down)&&!remotesHere().some(r=>!r.dn)){endGame(false);return;}
  if((G.pending>0||G.queue.length||G.itemQueue.length)&&state==='play')openLevelUp();
}
function aiMove(p,dt){
  const h=players.find(q2=>q2!==p);let tx=p.x,ty=p.y;
  if(h){if(h.down){tx=h.x;ty=h.y;}else{p.aiT-=dt;if(p.aiT<=0){p.aiT=1.2;const a=rand(0,6.28),rr=rand(60,110);p.aiTx=Math.cos(a)*rr;p.aiTy=Math.sin(a)*rr;}tx=h.x+p.aiTx;ty=h.y+p.aiTy;}}
  let mx=tx-p.x,my=ty-p.y;const d=Math.hypot(mx,my);if(d<10){mx=0;my=0;}else{mx/=d;my/=d;}
  if(!(h&&h.down)){const e=nearestE(p.x,p.y,70);if(e){const ax=p.x-e.x,ay=p.y-e.y,ad=Math.hypot(ax,ay)||1;mx+=ax/ad*1.4;my+=ay/ad*1.4;}}
  if(h&&h.z-p.z>20&&d<120)jump(p);
  for(const bl of bullets){if((bl.x-p.x)**2+(bl.y-p.y)**2<45*45){jump(p);break;}}
  if(p.pow<=0){let n=0;for(const e of enemies){if(!e.dead&&(e.x-p.x)**2+(e.y-p.y)**2<160*160)n++;}if(n>=7||(G.bosses.length&&Math.random()<.01)||(h&&h.down&&p.g.pw==='revive'))usePower(p);}
  return[clamp(mx,-1,1),clamp(my,-1,1)];
}

/* ---------- nivel ---------- */
function itemPicks(rich,lk){const keys=Object.keys(ITEMS);const out=[];for(let t=0;t<40&&out.length<3;t++){let r=Math.min(99.9,Math.random()*100+(lk||0)*30);let rar=r<(rich?0:58)?'comun':r<(rich?55:86)?'raro':r<(rich?88:97)?'epico':'legendario';
  const pool=keys.filter(k=>ITEMS[k].rar===rar&&!out.includes(k));const k=pick(pool);if(k)out.push(k);}return out;}
function openItems(){const it=G.itemQueue[0],p=it.p;state='levelup';joy=null;look=null;keys.clear();
  $('luEyebrow').textContent=it.rich?'Cofre del jefe':'Cofre';$('luWho').textContent=players.length>1?`${p.g.name} elige un objeto`:'Elige un objeto';
  const box=$('cards');box.innerHTML='';itemPicks(it.rich,it.p&&it.p.luck).forEach((k,i)=>{const d=ITEMS[k],n=p.items[k]||0,rr=RAR[d.rar];const bt=document.createElement('button');bt.className='card rar-'+d.rar;bt.id='card-'+i;bt.style.setProperty('--rc',rr.col);
    bt.innerHTML=`<span class="ch">Objeto</span><span class="top2"><span class="em">${d.em}</span><span><span class="nm">${d.name}</span><br><span class="pill" style="background:${rr.col}">${rr.name}</span> <span class="lv">${n?`x${n+1} de ${d.max}`:`x1 de ${d.max}`}</span></span></span><span class="ds">${d.desc}</span><kbd>${i+1}</kbd>`;
    bt.disabled=n>=d.max;bt.onclick=()=>{p.items[k]=n+1;d.apply(p);G.itemQueue.shift();refreshLoadout();afterPick();};box.appendChild(bt);});
  const sk=document.createElement('button');sk.className='card skip';sk.innerHTML='<span class="nm">Llevar dracmas</span><span class="ds">+25 dracmas en lugar de un objeto.</span>';sk.onclick=()=>{G.money+=25;G.itemQueue.shift();afterPick();};box.appendChild(sk);
  show('levelup');}
function afterPick(){if(G.itemQueue.length||G.queue.length||G.pending>0)openLevelUp();else{show(null);state='play';applyTheme(players[0].g.pan);computeConc();}}
function openLevelUp(){
  if(G.itemQueue.length){openItems();return;}
  if(!G.queue.length){while(G.pending>0){G.pending--;for(const p of players){if(p.ctrl==='ai')autoPick(p);else G.queue.push(p);}}}
  if(!G.queue.length){state='play';computeConc();return;}
  state='levelup';joy=null;look=null;keys.clear();const p=G.queue[0];
  $('luEyebrow').textContent=`Nivel ${G.level}`;$('luWho').textContent=players.length>1?`${p.g.name} elige un don`:'Los dioses te ofrecen un don';
  applyTheme(p.g.pan);
  const picks=options(p);const box=$('cards');box.innerHTML='';
  picks.forEach((o,i)=>{const bt=document.createElement('button');bt.className='card k-'+o.t;bt.id='card-'+i;const info=optInfo(p,o);
    bt.innerHTML=`<span class="ch">${o.t==='w'?'Arma':o.t==='p'?'Don':'Curación'}</span><span class="top2"><span class="em">${info.em}</span><span><span class="nm">${info.nm}</span><br><span class="lv">${info.lv}</span></span></span><span class="ds">${info.ds}</span>${info.tag?`<span class="tg">${info.tag}</span>`:''}<kbd>${i+1}</kbd>`;
    bt.onclick=()=>{applyOpt(p,o);G.queue.shift();refreshLoadout();afterPick();};box.appendChild(bt);});
  show('levelup');
}
function options(p){
  const pool=[];const r=REALMS[G.realm];
  for(const k in p.weapons)if(p.weapons[k].lvl<7)pool.push({t:'w',k},{t:'w',k});
  if(Object.keys(p.weapons).length<4){const pan=r.pan;const loc=Object.keys(WEAPONS).filter(k=>WEAPONS[k].pan===pan&&!p.weapons[k]);const other=shuffle(Object.keys(WEAPONS).filter(k=>!p.weapons[k]&&WEAPONS[k].pan!==pan)).slice(0,3);for(const k of[...loc,...loc,...other])pool.push({t:'w',k});}
  const pc=Object.keys(p.passives).length;
  for(const k in PASSIVES){const d=PASSIVES[k],l=p.passives[k]||0;if(l>=5)continue;if(!l&&pc>=6)continue;if(d.realm&&d.realm!==G.realm&&!l)continue;pool.push({t:'p',k});if(d.realm===G.realm&&!l)pool.push({t:'p',k});}
  shuffle(pool);const picks=[];for(const o of pool){if(!picks.some(q2=>q2.k===o.k))picks.push(o);if(picks.length===3)break;}
  if(!picks.length)picks.push({t:'heal'});return picks;
}

function wStats(Wd,l,p){const s=kst(Wd,l,p),out=[];const add=(k,label,v,txt,low)=>out.push({k,label,v,txt:txt||String(v),low:!!low});
  if(s.dmg!=null)add('dmg','Daño',Math.round(s.dmg*pMul(p)));
  if(s.cd!=null){const c=s.cd*p.cdMul;add('cd','Recarga',+c.toFixed(2),c.toFixed(2).replace('.',',')+' s',true);}
  if(s.tick!=null)add('cd','Golpea cada',s.tick,String(s.tick).replace('.',',')+' s',true);
  if(Wd.k==='chain'){add('cnt','Rayos',s.bolts);add('chn','Saltos',s.chains);}
  else if(Wd.k==='orbit')add('cnt','Orbes',s.count);
  else if(Wd.k==='sword'){add('cnt','Espadas',s.count);add('sr','Tajo',Math.round(s.sr*p.area));}
  else if(s.count!=null)add('cnt','Proyectiles',s.count);
  if(s.pierce!=null&&Wd.k==='shot')add('prc','Atraviesa',s.pierce);
  if(s.bounces!=null)add('bnc','Rebotes',s.bounces);
  if(s.radius!=null)add('rad','Radio',Math.round(s.radius*p.area*(Wd.k==='orbit'?1:(1+((p.range||1)-1)*.5))));
  else{const rc=Math.round(weaponReach(Wd,s,p));if(rc)add('rch','Alcance',rc);}
  if(s.rot!=null)add('rot','Giro',+s.rot.toFixed(2),s.rot.toFixed(2).replace('.',','));
  if(s.life!=null&&Wd.k==='trail')add('life','Duración',+s.life.toFixed(2),s.life.toFixed(2).replace('.',',')+' s');
  if(s.arc!=null)add('arc','Barrido',Math.round(s.arc*57.3),Math.round(s.arc*57.3)+'°');
  if(s.both!=null)add('both','Ambos lados',s.both?1:0,s.both?'Sí':'No');
  return out;}
function wStatsHtml(Wd,cur,nxt,p){const B=wStats(Wd,nxt,p),A=cur?wStats(Wd,cur,p):null;
  return'<span class="wst">'+B.map((b,i)=>{const a=A&&A.find(x=>x.label===b.label);if(!a)return`<span><em>${b.label}</em><b>${b.txt}</b></span>`;
    const up=b.low?b.v<a.v:b.v>a.v,same=b.v===a.v;return same?`<span class="same"><em>${b.label}</em><b>${b.txt}</b></span>`:`<span class="${up?'up':'dn'}"><em>${b.label}</em><b>${a.txt} → ${b.txt}</b></span>`;}).join('')+'</span>';}
function optInfo(p,o){
  if(o.t==='w'){const d=WEAPONS[o.k],w=p.weapons[o.k];return{em:d.em,nm:d.name.toUpperCase(),lv:w?`Nivel ${w.lvl} → ${w.lvl+1}`:`Arma nueva · ${d.pan}`,ds:(w?'':esc(d.desc))+wStatsHtml(d,w?w.lvl:0,w?w.lvl+1:1,p)};}
  if(o.t==='p'){const d=PASSIVES[o.k],l=p.passives[o.k]||0;return{em:d.em,nm:d.name.toUpperCase(),lv:l?`Nivel ${l} → ${l+1}`:d.realm?`Reliquia de ${REALMS[d.realm].name}`:'Don nuevo',ds:d.desc,tag:d.tag?CONCILIOS[d.tag].name:''};}
  return{em:'✚',nm:'NÉCTAR',lv:'Curación',ds:'Recuperas 40 de vida.'};
}
function applyOpt(p,o){if(o.t==='w'){if(p.weapons[o.k])p.weapons[o.k].lvl++;else p.weapons[o.k]={lvl:1,t:.3,ang:0,tick:0,acc:0};}else if(o.t==='p'){p.passives[o.k]=(p.passives[o.k]||0)+1;PASSIVES[o.k].apply(p);}else heal(p,40);}
function autoPick(p){const o=pick(options(p));applyOpt(p,o);refreshLoadout();}

function endGame(win){
  if(state==='end')return;state='end';joy=null;look=null;if(document.pointerLockElement)try{document.exitPointerLock();}catch(err){}
  if(G.realm)G.mapScore[G.realm]=Math.max(G.mapScore[G.realm]||0,G.realmScore);
  const evK=weekEvent().realm,evOn=G.visited.includes(evK);const coins=Math.round((G.money+G.goldTotal*.2+(win?500:0)+G.level*5)*DF().rew*(evOn?1.5:1));
  {const st=PROF.stats;st.bossKeys=st.bossKeys||{};for(const k of G.bossKeys)st.bossKeys[k]=(st.bossKeys[k]||0)+1;st.winsByDiff=st.winsByDiff||{};if(win)st.winsByDiff[G.diffKey]=(st.winsByDiff[G.diffKey]||0)+1;if(G.khaosHard)st.khaosHard=(st.khaosHard||0)+1;
   checkSecrets(false);}PROF.coins+=coins;PROF.runs++;PROF.stats.kills+=G.kills;PROF.stats.bosses+=G.bossKills;PROF.stats.chests+=G.chestsOpened;if(win)PROF.stats.wins++;
  dailyAdd('d_runs',1);dailyAdd('d_kills',G.kills);dailyAdd('d_boss',G.bossKills);dailyAdd('d_chests',G.chestsOpened);dailyAdd('d_realms',new Set(G.visited).size);dailyAdd('d_elites',G.elites);
  saveProfile();
  const sc=runScore(win);uiEnd(win,coins,{sc});if(evOn){const r=$('enRoute');if(r)r.insertAdjacentHTML('afterbegin',`<div class="unlockmsg">Evento de la semana: ×1,5 dracmas en ${REALMS[evK].name}</div>`);}if(G.unlocked&&G.unlocked.length){const r=$('enRoute');if(r)r.insertAdjacentHTML('afterbegin',`<div class="unlockmsg">¡Dios secreto desbloqueado: ${G.unlocked.map(id=>GOD[id].name).join(' y ')}!</div>`);}submitScore(win).then(r=>uiEndScore(r)).catch(()=>{});
  if(NET.sala){NET.inRun=false;salaPresence({phase:'lobby'});}
}
