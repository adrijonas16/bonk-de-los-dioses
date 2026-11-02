/* Bonk de los Dioses · perfil, tienda en la nube, clasificación y cooperativo online */
'use strict';
const todayKey=()=>{const d=new Date();return`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;};
function freshProfile(){return{coins:150,owned:[...FREE_GODS],up:{hp:0,dmg:0,spd:0,mag:0,gold:0,rev:0},clan:'',best:{score:0,byMap:{},endless:0},runs:0,god:'zeus',daily:{day:'',prog:{},claimed:{}},stats:{kills:0,bosses:0,chests:0,wins:0},at:0};}
let PROF=freshProfile();
try{const s=store&&JSON.parse(store.getItem('bonk-perfil')||'null');if(s)PROF=Object.assign(freshProfile(),s);}catch(err){}
const NET={ready:false,db:null,room:null,user:null,uid:null,myName:'',names:{},lobby:[],sala:null,code:'',salaPeers:[],isHost:false,inRun:false,lastSend:0,online:0,salas:[],board:null,boardAt:0};
let remotes=[];

/* ---------- perfil ---------- */
let saveTO=null;
function saveProfile(){PROF.at=Date.now();try{store&&store.setItem('bonk-perfil',JSON.stringify(PROF));}catch(err){}
  clearTimeout(saveTO);saveTO=setTimeout(async()=>{if(!NET.db||!NET.uid)return;try{await NET.db.doc(`data/users/${NET.uid}/main`).set(JSON.parse(JSON.stringify(PROF)));}catch(err){console.warn('perfil',err&&err.code);}},800);
  if(typeof uiProfileChanged==='function')uiProfileChanged();}
function ensureDaily(){const k=todayKey();if(PROF.daily.day!==k){const i0=[...k].reduce((a,c)=>a+c.charCodeAt(0),0);const ids=[];for(let i=0;ids.length<3&&i<20;i++){const d=DAILY[(i0+i*5)%DAILY.length];if(!ids.includes(d.id))ids.push(d.id);}PROF.daily={day:k,ids,prog:{},claimed:{}};}}
function dailyAdd(id,n){ensureDaily();if(!PROF.daily.ids.includes(id))return;PROF.daily.prog[id]=(PROF.daily.prog[id]||0)+n;}
function owns(id){return PROF.owned.includes(id);}
function buyGod(id){if(SECRET_GODS[id])return false;const c=GOD_PRICE(id);if(owns(id)||PROF.coins<c)return false;PROF.coins-=c;PROF.owned.push(id);saveProfile();return true;}
function upCost(k){const u=UPGRADES[k];return u.base*((PROF.up[k]||0)+1);}
function buyUpgrade(k){const u=UPGRADES[k],l=PROF.up[k]||0;if(l>=u.max)return false;const c=upCost(k);if(PROF.coins<c)return false;PROF.coins-=c;PROF.up[k]=l+1;saveProfile();return true;}
function applyUpgrades(p){const u=PROF.up;p.maxHp*=1+.08*(u.hp||0);p.hp=p.maxHp;p.dmgMul+=.05*(u.dmg||0);p.speed*=1+.04*(u.spd||0);p.magnet*=1+.15*(u.mag||0);p.goldMul+=.1*(u.gold||0);p.lives+=(u.rev||0);p.range+=.05*(u.rng||0);p.luck+=.05*(u.luck||0);}

/* ---------- conexión con la plataforma ---------- */
async function netInit(){
  for(let i=0;i<40&&!(window.claude&&window.claude.use);i++)await new Promise(r=>setTimeout(r,250));
  if(!(window.claude&&window.claude.use)){NET.offline=true;uiNet();return;}
  try{NET.user=await window.claude.use('user');}catch(err){}
  if(NET.user){try{NET.uid=await NET.user.id();const me=await NET.user.me();NET.myName=(me&&me.name)||'';}catch(err){}}
  try{NET.db=await window.claude.use('db');}catch(err){}
  if(NET.db&&NET.uid){try{const s=await NET.db.doc(`data/users/${NET.uid}/main`).get();if(s.exists){const d=s.data();if((d.at||0)>(PROF.at||0))PROF=Object.assign(freshProfile(),JSON.parse(JSON.stringify(d)));else saveProfile();}else saveProfile();}catch(err){console.warn('perfil remoto',err&&err.code);}}
  try{NET.room=await window.claude.use('room');}catch(err){}
  if(NET.room){NET.room.onPeers(ch=>{NET.lobby=ch.peers;lobbyChanged();},()=>{});lobbyPresence();}
  NET.ready=true;uiProfileChanged();uiNet();
}
function lobbyPresence(extra){if(!NET.room)return;const p={st:state==='play'||state==='pause'||state==='levelup'?'run':'menu',god:PROF.god,v:1};if(NET.sala&&NET.isHost)p.host={code:NET.code,map:cfg.realm,mode:cfg.mode,n:NET.salaPeers.length||1,open:!NET.inRun};else p.host=null;
  Object.assign(p,extra||{});NET.room.presence(p).catch(()=>{});}
function lobbyChanged(){NET.online=NET.lobby.filter(p=>p.kind==='viewer').length;
  NET.salas=NET.lobby.filter(p=>!p.isMe&&p.presence&&p.presence.host&&p.presence.host.open).map(p=>({code:String(p.presence.host.code||''),map:String(p.presence.host.map||''),mode:String(p.presence.host.mode||''),n:+p.presence.host.n||1,by:p.by,god:String(p.presence.god||'')})).filter(s=>/^[a-z0-9]{4,8}$/.test(s.code)&&REALMS[s.map]);
  resolveNames(NET.lobby.map(p=>p.by));uiNet();}
async function resolveNames(ids){ids=[...new Set(ids.filter(Boolean))].filter(id=>!(id in NET.names));if(!ids.length||!NET.user)return;try{const ps=await NET.user.profiles(ids);for(const id of ids)NET.names[id]=(ps[id]&&ps[id].name)||'';uiNet();}catch(err){}}
function nameOf(by,fallback){return(by&&NET.names[by])||fallback||'Jugador';}

/* ---------- salas ---------- */
function randCode(){const a='abcdefghjkmnpqrstuvwxyz23456789';let s='';for(let i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return s;}
async function joinSala(code,host){
  if(!NET.room)return'Sin conexión: inicia sesión con Google para jugar online.';
  code=String(code||'').toLowerCase().replace(/[^a-z0-9]/g,'');if(code.length<4)return'El código tiene que tener al menos 4 letras o números.';
  await leaveSala();
  try{NET.sala=await NET.room.join('sala-'+code);}catch(err){return'No se pudo entrar a la sala ('+(err&&err.code||'error')+').';}
  NET.code=code;NET.isHost=!!host;NET.inRun=false;
  NET.sala.onPeers(ch=>{NET.salaPeers=ch.peers;resolveNames(ch.peers.map(p=>p.by));salaChanged();},()=>{});
  salaPresence({phase:'lobby'});lobbyPresence();uiNet();return'';
}
async function leaveSala(){if(NET.sala){try{await NET.sala.leave();}catch(err){}}NET.sala=null;NET.code='';NET.salaPeers=[];NET.isHost=false;NET.inRun=false;remotes=[];lobbyPresence();uiNet();}
function salaPresence(patch){if(!NET.sala)return;const p=Object.assign({god:PROF.god,host:NET.isHost,map:cfg.realm,mode:cfg.mode,diff:cfg.diff},patch);NET.sala.presence(p).catch(()=>{});}
function salaHost(){return NET.salaPeers.find(p=>p.presence&&p.presence.host&&!p.isMe);}
function salaChanged(){
  const h=salaHost();
  if(!NET.isHost&&h&&h.presence.phase==='run'&&!NET.inRun&&state==='menu'){const map=String(h.presence.realm||h.presence.map);if(REALMS[map]){cfg.realm=map;cfg.mode=h.presence.mode==='libre'?'libre':'ragnarok';cfg.diff=DIFF[h.presence.diff]?h.presence.diff:'normal';startOnline();}}
  if(!NET.isHost&&!h&&NET.salaPeers.length&&state==='menu'){/* el anfitrión salió */}
  uiNet();
}
function hostStart(){if(!NET.sala||!NET.isHost)return;salaPresence({phase:'run',realm:cfg.realm,mode:cfg.mode,diff:cfg.diff,t0:Date.now()});startOnline();}
function startOnline(){NET.inRun=true;cfg.party='online';cfg.picks=[{id:PROF.god,ctrl:'p1'}];newRun();lobbyPresence();dailyAdd('d_online',1);}

/* ---------- sincronización durante la partida ---------- */
function netTick(dt){
  if(!NET.sala||!NET.inRun||!G)return;
  const p=players[0];if(!p)return;
  const now=performance.now();
  if(now-NET.lastSend>66){NET.lastSend=now;const w={};for(const k in p.weapons)w[k]=p.weapons[k].lvl;
    salaPresence({phase:'run',realm:G.realm,ridx:G.ridx,mode:G.mode,x:Math.round(p.x),y:Math.round(p.y),z:Math.round(p.z),fx:+p.fx.toFixed(2),fy:+p.fy.toFixed(2),hp:Math.round(p.hp),mhp:Math.round(p.maxHp),dn:p.down,lv:G.level,w,pw:p.powSeq||0,mv:p.moving,hd:p.hidden>0,gi:p.giant>0,em:p.emote||'',emT:p.emoteT||0});}
  // reflejar a los demás
  const seen=new Set();
  for(const peer of NET.salaPeers){if(peer.isMe||peer.kind!=='viewer')continue;const ps=peer.presence||{};if(ps.phase!=='run'||!GOD[ps.god])continue;seen.add(peer.peer);
    let r=remotes.find(q=>q.peer===peer.peer);
    if(!r){r=makePlayer(String(ps.god),'net',2+remotes.length);r.peer=peer.peer;r.by=peer.by;r.x=+ps.x||0;r.y=+ps.y||0;r.z=+ps.z||0;r.powSeq=+ps.pw||0;r.col='#7dffb0';remotes.push(r);}
    r.realm=String(ps.realm||'');r.ridx=+ps.ridx||0;r.tx=+ps.x||0;r.ty=+ps.y||0;r.tz=+ps.z||0;r.fx=+ps.fx||0;r.fy=+ps.fy||-1;r.hp=+ps.hp||0;r.maxHp=+ps.mhp||100;r.dn=!!ps.dn;r.down=r.dn;r.moving=!!ps.mv;r.hidden=ps.hd?1:0;r.giant=ps.gi?1:0;r.lvl=+ps.lv||1;r.name=nameOf(peer.by,GOD[ps.god].name);
    const w=ps.w&&typeof ps.w==='object'?ps.w:{};for(const k in w){if(!WEAPONS[k])continue;const l=clamp(+w[k]||1,1,7);if(!r.weapons[k])r.weapons[k]={lvl:l,t:.5,ang:0,tick:0,acc:0};else r.weapons[k].lvl=l;}
    r.dmgMul=1+(r.lvl-1)*.04;
    const seq=+ps.pw||0;if(seq>r.powSeq){r.powSeq=seq;if(r.realm===G.realm&&!r.dn){r.pow=0;const st=state;usePower(r);}}
    if(ps.em&&ps.emT!==r.emT){r.emT=ps.emT;say(r,String(ps.em).slice(0,40));}}
  remotes=remotes.filter(r=>seen.has(r.peer));
  // seguir al grupo a otro reino
  const ahead=remotes.find(r=>r.ridx>G.ridx&&REALMS[r.realm]&&!r.dn);if(ahead&&state==='play'){G.ridx=ahead.ridx;startRealm(ahead.realm);bigBanner('TU GRUPO CRUZÓ EL PORTAL',`Te reúnes con ${ahead.name} en ${REALMS[ahead.realm].name}`);}
}
function updRemotes(dt){for(const r of remotes){const k=Math.min(1,dt*12);r.x+=(r.tx-r.x)*k;r.y+=(r.ty-r.y)*k;r.z+=(r.tz-r.z)*k;r.step+=r.moving?dt*8:0;r.sayT-=dt;r.inv=0;
  if(r.realm===G.realm&&!r.dn)fireWeapons(r,dt);}}
function remotesHere(){return G?remotes.filter(r=>r.realm===G.realm):[];}

/* ---------- clasificación ---------- */
function runScore(win){return Math.round((G.score||0)+(win?100000*((typeof SC_DIFF!=='undefined'&&SC_DIFF[G.diffKey])||1):0));}
async function submitScore(win){
  const sc=runScore(win),best=PROF.best;let changed=false;
  if(G.mode==='libre'){if(sc>(best.endless||0)){best.endless=sc;changed=true;}const bm=best.byMap[G.visited[0]]||0;if(sc>bm){best.byMap[G.visited[0]]=sc;changed=true;}}
  else{if(sc>best.score){best.score=sc;changed=true;}for(const k of G.visited){const v=G.mapScore&&G.mapScore[k]||0;if(v>(best.byMap[k]||0)){best.byMap[k]=v;changed=true;}}}
  saveProfile();
  if(NET.db&&NET.uid){try{await NET.db.doc(`scores/${NET.uid}`).set({score:best.score||0,endless:best.endless||0,byMap:best.byMap,god:PROF.god,clan:PROF.clan||'',at:Date.now()});NET.boardAt=0;}catch(err){console.warn('score',err&&err.code);}}
  return{sc,changed};
}
async function loadBoard(force){if(!NET.db)return null;if(!force&&NET.board&&Date.now()-NET.boardAt<20000)return NET.board;
  try{const q=await NET.db.collection('scores').limit(500).get();NET.board=q.docs.map(d=>Object.assign({id:d.id},d.data()));NET.boardAt=Date.now();resolveNames(NET.board.map(r=>r.id));return NET.board;}catch(err){console.warn('board',err&&err.code);return null;}}
async function setClan(name){PROF.clan=String(name||'').trim().slice(0,20);saveProfile();if(NET.db&&NET.uid){try{const s=await NET.db.doc(`scores/${NET.uid}`).get();const d=s.exists?s.data():{score:0,endless:0,byMap:{}};await NET.db.doc(`scores/${NET.uid}`).set(Object.assign({},d,{clan:PROF.clan,god:PROF.god,at:Date.now()}));NET.boardAt=0;}catch(err){}}}
