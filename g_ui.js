/* Bonk de los Dioses · interfaz (menú principal, HUD, pausa, resultados) */
'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtN=n=>Math.round(n).toLocaleString('es');

/* ---------- estilo por panteón ---------- */
let curTheme='',THEME_ACC='#e8b53e';
function applyTheme(pan){const th=THEMES[pan]||THEMES.Griega;if(curTheme===pan)return;curTheme=pan;const r=document.documentElement.style;
  r.setProperty('--th1',th.panel);r.setProperty('--th2',th.acc);r.setProperty('--thb',th.band);r.setProperty('--pat',th.pat);r.setProperty('--thd',th.deep);THEME_ACC=th.acc;
  document.querySelectorAll('[data-themetag]').forEach(el=>el.textContent=`${pan} · ${th.tag}`);}

/* ---------- retratos ---------- */
const SHOTQ=[];let SHOTBUSY=false;
function pumpShots(){if(SHOTBUSY)return;SHOTBUSY=true;const step=()=>{const job=SHOTQ.shift();if(!job){SHOTBUSY=false;return;}const sh=godShot(job.id,'face');if(sh&&job.c.isConnected!==false){const g=job.c.getContext('2d');g.clearRect(0,0,job.size,job.size);g.imageSmoothingEnabled=true;g.drawImage(sh,0,0,job.size,job.size);}setTimeout(step,16);};step();}
function portrait(canvas,id,size){canvas.width=size;canvas.height=size;const g=canvas.getContext('2d');g.clearRect(0,0,size,size);
  if(typeof SHOT!=='undefined'&&AS.ready){const sh=SHOT.cache[id+'|face'];if(sh){g.imageSmoothingEnabled=true;g.drawImage(sh,0,0,size,size);return;}SHOTQ.push({c:canvas,id,size});pumpShots();}const v=godSprites(id)[0];g.imageSmoothingEnabled=false;
  const k=size/(v.w*.72);g.drawImage(v.c,(size-v.w*k)/2,size*.06,v.w*k,v.h*k);}
function fullSprite(canvas,id,scale){const sh=typeof godShot==='function'&&godShot(id,'full');if(sh){canvas.width=256;canvas.height=320;const g=canvas.getContext('2d');g.clearRect(0,0,256,320);g.drawImage(sh,0,0);return;}const v=godSprites(id)[0];canvas.width=v.w*scale;canvas.height=v.h*scale;const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(v.c,0,0,v.w*scale,v.h*scale);}

/* ---------- menú principal ---------- */
const UI={tab:'jugar',pan:'Todos',sel:PROF.god||'zeus',ally:'',p2:'',lbTab:'global',lbMap:'tartaro',msg:''};
document.querySelectorAll('.nav button').forEach(bt=>bt.onclick=()=>openTab(bt.dataset.tab));
function openTab(t){UI.tab=t;document.querySelectorAll('.nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===t?'page':'false'));document.querySelectorAll('.tab').forEach(s=>s.hidden=s.id!=='tab-'+t);
  ({jugar:renderPlay,dioses:renderGods,tienda:renderShop,misiones:renderMissions,ranking:renderRanking,clan:renderClan,guia:renderGuide})[t]();}
function uiHome(){applyTheme(GOD[PROF.god].pan);uiProfileChanged();openTab(UI.tab);}
function uiProfileChanged(){ensureDaily();$('coins').textContent=fmtN(PROF.coins);$('pname').textContent=NET.myName||'Jugador';if(typeof renderHome==='function')renderHome();portrait($('pava'),PROF.god,40);
  const ready=Object.values(PROF.daily.ids||[]).filter(id=>{const d=DAILY.find(x=>x.id===id);return d&&(PROF.daily.prog[id]||0)>=d.n&&!PROF.daily.claimed[id];}).length;$('misBadge').hidden=!ready;$('misBadge').textContent=ready;
  if(state==='menu'&&UI.tab==='tienda')renderShop();if(state==='menu'&&UI.tab==='dioses')renderGods();}
function uiNet(){if(typeof renderHome==='function'&&$('home')&&!$('home').hidden){HRANK_AT=0;renderHome();}$('onl').textContent=NET.room?`${NET.online||1} en línea`:'Sin conexión';$('onl').classList.toggle('off',!NET.room);if(state==='menu'&&UI.tab==='jugar')renderOnline();if(state==='menu'&&UI.tab==='ranking'&&NET.db)renderRanking();}

/* ---- Jugar ---- */
function renderPlay(){
  const g=GOD[PROF.god],w=WEAPONS[g.w];applyTheme(g.pan);
  fullSprite($('heroCv'),g.id,2);$('heroName').textContent=g.name;$('heroPan').textContent=g.pan;$('heroTitle').textContent=g.title;
  $('heroInfo').innerHTML=`<div><b>Arma</b>${esc(w.name)} · ${esc(w.desc)}</div><div><b>Poder · R</b>${esc(g.pn)} · ${esc(g.pd)}</div><div><b>Don</b>${esc(g.bd)}</div>`;
  $('heroStats').innerHTML=`<span>PS ${g.hp}</span><span>Vel ${g.spd}</span>${g.tag?`<span>${esc(CONCILIOS[g.tag].name)}</span>`:''}`;
  segSet('segMode',cfg.mode);segSet('segParty',cfg.party);segSet('segDiff',cfg.diff);{const pw=((PROF.stats.winsByDiff||{}).dificil||0)+((PROF.stats.winsByDiff||{}).pesadilla||0)>0;const pb=$('segDiff').querySelector('[data-v=pesadilla]');pb.disabled=!pw;if(!pw&&cfg.diff==='pesadilla'){cfg.diff='normal';segSet('segDiff','normal');}}
  const opts=GODS.filter(x=>owns(x.id)&&x.id!==PROF.god);
  for(const id of['allySel','p2Sel']){const sel=$(id);const cur=id==='allySel'?UI.ally:UI.p2;sel.innerHTML=opts.map(x=>`<option value="${x.id}">${esc(x.name)} · ${esc(x.pan)}${relTag(PROF.god,x.id)}</option>`).join('');sel.value=opts.some(x=>x.id===cur)?cur:(opts.find(x=>relOf(PROF.god,x.id))||opts[0]||{}).id||'';}
  $('allyRow').hidden=cfg.party!=='ia';$('p2Row').hidden=cfg.party!=='coop';$('onlineBox').hidden=cfg.party!=='online';
  $('partyHint').textContent={solo:'Tú solo contra los monstruos de todos los panteones.',ia:'Un dios controlado por la IA pelea contigo y te revive si caes.',coop:'En el mismo teclado. Jugador 2: flechas, Shift derecho salta, Ctrl derecho desliza, Enter poder. También vale un mando.',online:'Crea una sala y pasa el código, o únete a una abierta. Cada uno juega con su dios.'}[cfg.party];
  updRelNote();renderMaps();renderOnline();updPlayBtn();
}
function relTag(a,b){const r=relOf(a,b);return r?(r.type==='rival'?' · Rival':' · Aliado'):'';}
function updRelNote(){const other=cfg.party==='ia'?$('allySel').value:cfg.party==='coop'?$('p2Sel').value:'';const el=$('relNote');const r=other?relOf(PROF.god,other):null;
  if(!r){el.hidden=true;return;}const o=GOD[other],lf=r.a===PROF.god?r.la:r.lb,lg=r.a===PROF.god?r.lb:r.la;el.hidden=false;el.className='relnote '+r.type;
  el.innerHTML=`<b>${r.type==='rival'?'Rivales':'Aliados'}</b> «${esc(lf)}» · ${esc(o.name)}: «${esc(lg)}»<br><small>${r.type==='rival'?'Compiten cada minuto por la corona; poderes a la vez = choque divino.':`Juntos pegan más; poderes a la vez = combo ${esc(r.combo)}.`}</small>`;}
$('allySel').onchange=()=>{UI.ally=$('allySel').value;updRelNote();};$('p2Sel').onchange=()=>{UI.p2=$('p2Sel').value;updRelNote();};
function segSet(id,v){$(id).querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===v?'true':'false'));}
$('segDiff').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(b.disabled)return;cfg.diff=b.dataset.v;renderPlay();});
$('segMode').querySelectorAll('button').forEach(b=>b.onclick=()=>{cfg.mode=b.dataset.v;renderPlay();if(NET.isHost)salaPresence({phase:'lobby'}),lobbyPresence();});
$('segParty').querySelectorAll('button').forEach(b=>b.onclick=()=>{cfg.party=b.dataset.v;if(cfg.party!=='online'&&NET.sala)leaveSala();renderPlay();});
const PREV={};let prevQueue=[];
function renderMaps(){const box=$('maps');box.innerHTML='';
  for(const k in REALMS){if(k==='vacio'&&cfg.mode==='ragnarok')continue;const r=REALMS[k];const bt=document.createElement('button');bt.className='mapc'+(cfg.realm===k?' sel':'');bt.id='map-'+k;
    const c=document.createElement('canvas');c.width=240;c.height=135;c.id='mc-'+k;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,135);gr.addColorStop(0,LOOK3D[k].top);gr.addColorStop(1,LOOK3D[k].hor);g.fillStyle=gr;g.fillRect(0,0,240,135);g.fillStyle=r.g1;g.fillRect(0,90,240,45);if(PREV[k])g.drawImage(PREV[k],0,0,240,135);
    bt.appendChild(c);const best=PROF.best.byMap[k]||0;bt.insertAdjacentHTML('beforeend',`<span class="mn">${esc(r.name)}</span><span class="ms">${r.pan?esc(r.pan)+' · ':''}${r.bosspool?`${(r.minipool||[]).length+r.bosspool.length} jefes al azar`:'Jefe: '+esc(BOSSES[r.boss].name)}</span>${best?`<span class="mb">Récord ${fmtN(best)}</span>`:''}`);
    bt.onclick=()=>{if(NET.sala&&!NET.isHost)return;cfg.realm=k;box.querySelectorAll('.mapc').forEach(x=>x.classList.toggle('sel',x===bt));if(NET.isHost){salaPresence({phase:'lobby'});lobbyPresence();}};box.appendChild(bt);}
  if(GL_OK){prevQueue=Object.keys(REALMS).filter(k=>!PREV[k]);if(prevQueue.length&&!PREV_BUSY){PREV_BUSY=true;setTimeout(nextPreview,80);}}}
function nextPreview(){
  if(!prevQueue.length||state!=='menu'){PREV_BUSY=false;if(typeof homeEvent==='function'&&!$('home').hidden)homeEvent();if(state==='menu'){buildWorld(menuRealm);clearObjs();}return;}
  const k=prevQueue.shift();try{buildWorld(k);{const f=MENU_FOCUS[k]||[0,0,700],x=f[0]-f[2]*.35,z=f[1]+f[2]*.85,gy=groundAt(f[0],f[1]);cam3.position.set(x,Math.max(gy+230,groundAt(x,z)+140),z);cam3.lookAt(f[0],gy+30,f[1]);sunFollow(f[0],f[1]);}for(const m of SMAT.values())m.color.set('#ffffff');updWeather(0,0,0);renderer.render(scene,cam3);
    const c=mkCanvas(240,135);c.getContext('2d').drawImage(renderer.domElement,0,0,240,135);PREV[k]=c;const card=$('mc-'+k);if(card)card.getContext('2d').drawImage(c,0,0);}catch(err){console.error(err);}
  setTimeout(nextPreview,30);}
function updPlayBtn(){const b=$('playBtn');if(!AS.ready&&!AS.failed){b.disabled=true;b.textContent=`CARGANDO MODELOS ${Math.round(AS.prog*100)}%`;return;}if(cfg.party==='online'){if(!NET.sala){b.disabled=true;b.textContent='Crea o únete a una sala';}else if(NET.isHost){b.disabled=false;b.textContent=`EMPEZAR CON ${NET.salaPeers.length||1}`;}else{b.disabled=true;b.textContent='Esperando al anfitrión…';}}else{b.disabled=false;b.textContent='JUGAR';}}
$('playBtn').onclick=()=>{
  if(cfg.party==='online'){hostStart();return;}
  cfg.picks=[{id:PROF.god,ctrl:'p1'}];
  if(cfg.party==='ia'&&$('allySel').value)cfg.picks.push({id:$('allySel').value,ctrl:'ai'});
  if(cfg.party==='coop'&&$('p2Sel').value)cfg.picks.push({id:$('p2Sel').value,ctrl:'p2'});
  newRun();lobbyPresence();};
$('heroChange').onclick=()=>openTab('dioses');

/* ---- Online ---- */
function renderOnline(){if(cfg.party!=='online'||state!=='menu')return;const box=$('onlineBox');
  if(!NET.room){box.innerHTML=`<div class="note">Inicia sesión con Google (botón de la portada) para jugar online con tus amigos.</div>`;updPlayBtn();return;}
  if(NET.sala){const rows=NET.salaPeers.filter(p=>p.kind==='viewer').map(p=>{const pr=p.presence||{};const gd=GOD[pr.god]?GOD[pr.god]:null;return`<li><span class="dot" style="background:${pr.host?'#ffb020':'#3ccf6e'}"></span><b>${esc(p.isMe?'Tú':nameOf(p.by,'Jugador'))}</b><span>${gd?esc(gd.name):'—'}</span>${pr.host?'<span class="pill">Anfitrión</span>':''}${p.guest?'<span class="pill g">Invitado</span>':''}</li>`;}).join('');
    const h=salaHost();const mapTxt=NET.isHost?REALMS[cfg.realm].name:h?REALMS[h.presence.map]?REALMS[h.presence.map].name:'':'';
    box.innerHTML=`<div class="sala"><div class="salah"><span>Sala</span><b class="code">${esc(NET.code.toUpperCase())}</b><button class="btn sm" id="copyCode">Copiar código</button><button class="btn sm red" id="leaveSala">Salir</button></div>
      <p class="mut">${NET.isHost?'Tú eliges mapa y modo. Pulsa EMPEZAR cuando estéis todos.':`Mapa: ${esc(mapTxt)} · El anfitrión empezará la partida.`}</p><ul class="plist">${rows}</ul></div>`;
    $('leaveSala').onclick=()=>leaveSala();$('copyCode').onclick=()=>{navigator.clipboard.writeText(NET.code.toUpperCase()).then(()=>{$('copyCode').textContent='Copiado';}).catch(()=>{$('copyCode').textContent=NET.code.toUpperCase();});};}
  else{const open=NET.salas.map(s=>`<li><span class="dot"></span><b>${esc(nameOf(s.by,'Jugador'))}</b><span>${esc(REALMS[s.map].name)} · ${s.mode==='libre'?'Supervivencia':'Clásico'} · ${s.n} jug.</span><button class="btn sm green" data-join="${esc(s.code)}">Unirme</button></li>`).join('')||'<li class="mut">No hay salas abiertas ahora mismo.</li>';
    box.innerHTML=`<div class="sala"><div class="row"><button class="btn green" id="mkSala">Crear sala</button><input id="codeIn" maxlength="8" placeholder="Código" autocomplete="off"><button class="btn" id="joinSala">Unirme</button></div>${UI.msg?`<p class="err">${esc(UI.msg)}</p>`:''}<div class="sub">Salas abiertas</div><ul class="plist">${open}</ul></div>`;
    $('mkSala').onclick=async()=>{UI.msg=await joinSala(randCode(),true);renderOnline();updPlayBtn();};
    $('joinSala').onclick=async()=>{UI.msg=await joinSala($('codeIn').value,false);renderOnline();updPlayBtn();};
    box.querySelectorAll('[data-join]').forEach(b=>b.onclick=async()=>{UI.msg=await joinSala(b.dataset.join,false);renderOnline();updPlayBtn();});}
  updPlayBtn();}

/* ---- Dioses ---- */
const PANS=['Todos',...new Set(GODS.map(g=>g.pan))];
function renderGods(){
  const pf=$('gpans');pf.innerHTML='';for(const pn of PANS){const b=document.createElement('button');b.className='chipb';b.textContent=pn;b.setAttribute('aria-pressed',pn===UI.pan?'true':'false');b.onclick=()=>{UI.pan=pn;renderGods();};pf.appendChild(b);}
  const gr=$('ggrid');const keep=gr.scrollTop;gr.innerHTML='';
  for(const g of GODS){if(UI.pan!=='Todos'&&g.pan!==UI.pan)continue;const own=owns(g.id);const b=document.createElement('button');b.className='gcard'+(g.id===UI.sel?' sel':'')+(own?'':' locked')+(g.id===PROF.god?' eq':'');b.id='g-'+g.id;
    const c=document.createElement('canvas');portrait(c,g.id,72);b.appendChild(c);b.insertAdjacentHTML('beforeend',`<span class="gn">${esc(g.name)}</span><span class="gp">${esc(g.pan)}</span>${own?(g.id===PROF.god?'<span class="tagb eq">Equipado</span>':''):SECRET_GODS[g.id]?'<span class="tagb secret">Secreto</span>':`<span class="tagb price"><i class="cn"></i>${GOD_PRICE(g.id)}</span>`}`);
    b.onclick=()=>{UI.sel=g.id;renderGods();};if(own)b.ondblclick=()=>{UI.sel=g.id;PROF.god=g.id;saveProfile();lobbyPresence();uiProfileChanged();openTab('jugar');};gr.appendChild(b);}
  gr.scrollTop=keep;
  const g=GOD[UI.sel],w=WEAPONS[g.w],own=owns(g.id),price=GOD_PRICE(g.id);applyTheme(g.pan);fullSprite($('gdetCv'),g.id,2);
  $('gdetName').textContent=g.name;$('gdetPan').textContent=g.pan;$('gdetTitle').textContent=g.title;
  const rels=REL.filter(r=>r[0]===g.id||r[1]===g.id).map(r=>{const o=GOD[r[0]===g.id?r[1]:r[0]];return`<span class="pill ${r[2]}">${r[2]==='rival'?'Rival':'Aliado'}: ${esc(o.name)}</span>`;}).join(' ');
  $('gdetInfo').innerHTML=`<div><b>Arma</b>${esc(w.name)}: ${esc(w.desc)}</div><div><b>Poder</b>${esc(g.pn)}: ${esc(g.pd)}</div><div><b>Don</b>${esc(g.bd)}</div><div><b>Vida</b>${g.hp} · <b>Velocidad</b>${g.spd}${g.tag?` · <b>Concilio</b>${esc(CONCILIOS[g.tag].name)}`:''}</div>${rels?`<div class="rels">${rels}</div>`:''}`;
  const bt=$('gdetBtn');
  if(own){bt.textContent=g.id===PROF.god?'Ir a jugar ▶':'Elegir y jugar ▶';bt.disabled=false;bt.className='btn green big';bt.onclick=()=>{if(PROF.god!==g.id){PROF.god=g.id;saveProfile();lobbyPresence();uiProfileChanged();}openTab('jugar');window.scrollTo&&window.scrollTo(0,0);};}
  else if(SECRET_GODS[g.id]){bt.textContent='Dios secreto';bt.disabled=true;bt.className='btn big';$('gdetNote').textContent='Cómo desbloquearlo: '+SECRET_GODS[g.id].req+'.';return;}
  else{bt.innerHTML=`Comprar por <i class="cn"></i>${price}`;bt.disabled=PROF.coins<price;bt.className='btn gold big';bt.onclick=()=>{if(buyGod(g.id)){PROF.god=g.id;saveProfile();lobbyPresence();uiProfileChanged();openTab('jugar');}};}
  $('gdetNote').textContent=own?'':PROF.coins<price?`Te faltan ${price-PROF.coins} dracmas. Ganas dracmas en cada partida y con las misiones.`:'';
}

/* ---- Tienda ---- */
function renderShop(){const box=$('upgrades');box.innerHTML='';
  for(const k in UPGRADES){const u=UPGRADES[k],l=PROF.up[k]||0,c=upCost(k),max=l>=u.max;const d=document.createElement('div');d.className='shopc';
    d.innerHTML=`<div class="se">${u.em}</div><div class="sb"><b>${esc(u.name)}</b><span>${esc(u.desc)}</span><span class="pips">${Array.from({length:u.max},(_,i)=>`<i class="${i<l?'on':''}"></i>`).join('')}</span></div><button class="btn ${max?'':'gold'}" ${max||PROF.coins<c?'disabled':''}>${max?'Máximo':'<i class="cn"></i>'+c}</button>`;
    d.querySelector('button').onclick=()=>{if(buyUpgrade(k))renderShop();};box.appendChild(d);}
  const locked=GODS.filter(g=>!owns(g.id));const feat=$('featured');feat.innerHTML='';
  locked.slice(0).sort((a,b)=>hash(a.id.length,new Date().getDate(),a.name.charCodeAt(0))-hash(b.id.length,new Date().getDate(),b.name.charCodeAt(0))).slice(0,4).forEach(g=>{const d=document.createElement('button');d.className='featc';const c=document.createElement('canvas');portrait(c,g.id,64);d.appendChild(c);
    d.insertAdjacentHTML('beforeend',`<span><b>${esc(g.name)}</b><small>${esc(g.pan)} · ${esc(g.pn)}</small></span><span class="tagb price"><i class="cn"></i>${GOD_PRICE(g.id)}</span>`);d.onclick=()=>{UI.sel=g.id;openTab('dioses');};feat.appendChild(d);});
  if(!locked.length)feat.innerHTML='<p class="mut">Ya tienes a todos los dioses.</p>';
  $('shopNote').textContent='Los dracmas se ganan jugando: por enemigos, jefes, misiones y misiones diarias. No hay compras con dinero real.';}

/* ---- Misiones ---- */
function renderMissions(){ensureDaily();const box=$('daily');box.innerHTML='';
  for(const id of PROF.daily.ids){const d=DAILY.find(x=>x.id===id);if(!d)continue;const pr=Math.min(d.n,PROF.daily.prog[id]||0),done=pr>=d.n,cl=PROF.daily.claimed[id];const el=document.createElement('div');el.className='misc'+(cl?' claimed':'');
    el.innerHTML=`<div class="mt"><b>${esc(d.txt)}</b><span><i class="cn"></i>${d.rew}</span></div><div class="bar"><i style="width:${pr/d.n*100}%"></i><span>${fmtN(pr)} / ${fmtN(d.n)}</span></div><button class="btn ${done&&!cl?'green':''}" ${!done||cl?'disabled':''}>${cl?'Cobrada':done?'Cobrar':'En curso'}</button>`;
    el.querySelector('button').onclick=()=>{if(done&&!cl){PROF.daily.claimed[id]=true;PROF.coins+=d.rew;saveProfile();renderMissions();}};box.appendChild(el);}
  const st=PROF.stats;$('pstats').innerHTML=`<div class="tile"><b>${fmtN(PROF.runs)}</b><span>Partidas</span></div><div class="tile"><b>${fmtN(st.kills)}</b><span>Caídos</span></div><div class="tile"><b>${fmtN(st.bosses)}</b><span>Jefes</span></div><div class="tile"><b>${fmtN(st.chests)}</b><span>Cofres</span></div><div class="tile"><b>${fmtN(st.wins)}</b><span>Ragnaröks detenidos</span></div><div class="tile"><b>${fmtN(PROF.best.score)}</b><span>Mejor puntuación</span></div>`;
  $('missionInfo').textContent='Las misiones diarias cambian cada día. Durante la partida, cada reino trae tres misiones propias que dan dracmas al momento.';}

/* ---- Clasificación ---- */
document.querySelectorAll('#lbTabs button').forEach(b=>b.onclick=()=>{UI.lbTab=b.dataset.v;renderRanking();});
async function renderRanking(){document.querySelectorAll('#lbTabs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===UI.lbTab?'true':'false'));
  const mapSel=$('lbMap');if(!mapSel.options.length)mapSel.innerHTML=Object.keys(REALMS).map(k=>`<option value="${k}">${esc(REALMS[k].name)}</option>`).join('');mapSel.value=UI.lbMap;mapSel.onchange=()=>{UI.lbMap=mapSel.value;renderRanking();};mapSel.hidden=UI.lbTab!=='mapa';
  const body=$('lbBody');if(!NET.db){body.innerHTML=`<tr><td colspan="5" class="mut">Inicia sesión con Google para entrar en la clasificación. Tu mejor puntuación local: ${fmtN(PROF.best.score)}.</td></tr>`;return;}
  if(!NET.board)body.innerHTML='<tr><td colspan="5" class="mut">Cargando…</td></tr>';
  const rows=await loadBoard();if(!rows){body.innerHTML='<tr><td colspan="5" class="mut">No se pudo cargar la clasificación.</td></tr>';return;}
  let list;
  if(UI.lbTab==='clanes'){const m={};for(const r of rows){if(!r.clan)continue;const c=String(r.clan).slice(0,20);m[c]=m[c]||{name:c,score:0,n:0};m[c].score+=+r.score||0;m[c].n++;}list=Object.values(m).sort((a,b)=>b.score-a.score).slice(0,50);
    body.innerHTML=list.map((c,i)=>`<tr class="${c.name===PROF.clan?'me':''}"><td>${i+1}</td><td><b>${esc(c.name)}</b></td><td>${c.n} miembros</td><td></td><td>${fmtN(c.score)}</td></tr>`).join('')||'<tr><td colspan="5" class="mut">Todavía no hay clanes. Crea uno en la pestaña Clan.</td></tr>';return;}
  const val=r=>UI.lbTab==='global'?+r.score||0:UI.lbTab==='super'?+r.endless||0:+(r.byMap&&r.byMap[UI.lbMap])||0;
  list=rows.filter(r=>val(r)>0).sort((a,b)=>val(b)-val(a)).slice(0,100);
  body.innerHTML=list.map((r,i)=>`<tr class="${r.id===NET.uid?'me':''}"><td>${i+1}</td><td><b>${esc(r.id===NET.uid?'Tú':nameOf(r.id,'Jugador'))}</b></td><td>${GOD[r.god]?esc(GOD[r.god].name):''}</td><td>${esc(r.clan||'')}</td><td>${fmtN(val(r))}</td></tr>`).join('')||'<tr><td colspan="5" class="mut">Nadie tiene puntuación aquí todavía. ¡Sé el primero!</td></tr>';}

/* ---- Clan ---- */
async function renderClan(){$('clanName').textContent=PROF.clan||'Sin clan';$('clanIn').value='';$('clanLeave').hidden=!PROF.clan;
  const box=$('clanMembers');if(!PROF.clan){box.innerHTML='<li class="mut">Únete a un clan escribiendo su nombre, o crea uno nuevo. La puntuación del clan suma la mejor partida de cada miembro.</li>';return;}
  if(!NET.db){box.innerHTML='<li class="mut">Inicia sesión con Google para ver a los miembros del clan.</li>';return;}
  const rows=await loadBoard();const mem=(rows||[]).filter(r=>r.clan===PROF.clan).sort((a,b)=>(b.score||0)-(a.score||0));
  box.innerHTML=mem.map(r=>`<li><b>${esc(r.id===NET.uid?'Tú':nameOf(r.id,'Jugador'))}</b><span>${GOD[r.god]?esc(GOD[r.god].name):''}</span><span>${fmtN(r.score||0)}</span></li>`).join('')||'<li class="mut">Juega una partida para aparecer en tu clan.</li>';}
$('clanJoin').onclick=async()=>{const v=$('clanIn').value.trim();if(!v)return;await setClan(v);renderClan();};
$('clanLeave').onclick=async()=>{await setClan('');renderClan();};

/* ---------- HUD ---------- */
function buildHud(){setTimeout(()=>typeof refreshNectar==='function'&&refreshNectar(),0);
  const p=players[0];portrait($('hudPort'),p.god,88);$('hudName').textContent=p.g.name;$('hudPan').textContent=p.g.pan;applyTheme(p.g.pan);
  $('ultEm').textContent=WEAPONS[p.g.w].em;$('ultName').textContent=p.g.pn;
  const p2=players[1];$('p2card').hidden=!p2;if(p2){portrait($('p2Port'),p2.god,48);$('p2Name').textContent=(p2.ctrl==='ai'?'IA · ':'J2 · ')+p2.g.name;}
  $('tbtns').hidden=!isTouch||G.coop;$('lockHint').hidden=isTouch||!!document.pointerLockElement;
  refreshLoadout();computeConc();HUDC={};
}
function refreshLoadout(){if(!players[0])return;const p=players[0];
  const ws=Object.keys(p.weapons);$('wslots').innerHTML=Array.from({length:4},(_,i)=>{const k=ws[i];return k?`<div class="slot" title="${esc(WEAPONS[k].name)}"><span>${WEAPONS[k].em}</span><b>${p.weapons[k].lvl}</b></div>`:'<div class="slot empty"></div>';}).join('');
  const its=[...Object.keys(p.items).map(k=>({em:ITEMS[k].em,n:p.items[k],col:RAR[ITEMS[k].rar].col,t:ITEMS[k].name})),...Object.keys(p.passives).map(k=>({em:PASSIVES[k].em,n:p.passives[k],col:'#3a8bff',t:PASSIVES[k].name}))];
  $('islots').innerHTML=its.slice(0,14).map(x=>`<div class="islot" style="--rc:${x.col}" title="${esc(x.t)}"><span>${x.em}</span>${x.n>1?`<b>${x.n}</b>`:''}</div>`).join('');}
function renderConc(){const box=$('conc');if(!box||!G)return;box.innerHTML='';const cnt=G.concCount||{};
  for(const t in cnt){const on=G.conc[t];const s=document.createElement('span');s.className='cc'+(on?' on':'');const fv=G.concFavor===t;s.textContent=`${CONCILIOS[t].name.replace(/^Concilio (de los |de la |del )/,'')} ${Math.min(3,cnt[t])}/3`+(fv?' · ϟ1 del favor':'');s.title=CONCILIOS[t].desc+(fv?' · Una de las 3 fuentes es tu favor divino (no es un arma ni un don).':'');box.appendChild(s);}}
let HUDC={};
function setT(id,v){if(HUDC[id]!==v){HUDC[id]=v;$(id).textContent=v;}}
function setW(id,v){const s=v.toFixed(1)+'%';if(HUDC[id+'w']!==s){HUDC[id+'w']=s;$(id).style.width=s;}}
function hudTick(){
  if(!G||!players[0])return;const p=players[0];
  setW('hpf',p.hp/p.maxHp*100);setT('hpt',p.down?'CAÍDO':`${Math.ceil(p.hp)}/${Math.round(p.maxHp)}`);setW('xpf',G.xp/G.need*100);setT('xpt',`${Math.floor(G.xp)}/${G.need}`);setT('hudLv','Nv. '+G.level);
  const cd=p.g.cd*p.cdMul*p.powCdMul;const k=p.pow/cd;const ultH=(k*100).toFixed(0)+'%';if(HUDC.ult!==ultH){HUDC.ult=ultH;$('ultFill').style.height=ultH;$('ult').classList.toggle('ready',p.pow<=0);$('power').classList.toggle('ready',p.pow<=0);$('powFill').style.height=ultH;}
  {const lk=powLocked(p);setT('ultCd',lk?'🔒 Nv '+POW_LV:p.pow>0?Math.ceil(p.pow)+'s':'R');$('ult').classList.toggle('locked',lk);if(lk){$('ult').classList.remove('ready');$('power').classList.remove('ready');}}
  const dk=clamp(p.dashCd/1.1,0,1);setW('dashf',(1-dk)*100);
  setT('scoreN',fmtN(Math.round(G.score||0)));{const cb=G.combo||0,on=cb>=5;$('comboB').hidden=!on;if(on){const m=comboMul();const mt=`×${String(+(m*stageMul()*(SC_DIFF[G.diffKey]||1)).toFixed(1)).replace('.',',')}`;if($('comboN').textContent!==mt){$('comboN').textContent=mt;const sb=$('scoreBox');sb.classList.remove('pop');void sb.offsetWidth;sb.classList.add('pop');}setT('comboC',`${cb} seguidas`);$('comboT').style.width=Math.max(0,G.comboT/3*100)+'%';}}
  setT('rName',REALMS[G.realm].name);setT('rTime',fmt(G.rt));setT('rMode',(G.mode==='libre'?`Supervivencia · Oleada ${G.wave||1}`:`Clásico · Reino ${Math.min(G.ridx+1,4)} de 4`)+(G.diffKey&&G.diffKey!=='normal'?' · '+DIFF[G.diffKey].name:'')+(G.online?' · Online':''));
  const nx=G.events[0];setT('rNext',nx?`${BOSSES[nx.key].tier==='mini'?'Minijefe':BOSSES[nx.key].tier==='final'?'Final':'Jefe'} · ${BOSSES[nx.key].name} en ${fmt(nx.t-G.rt)}`:G.portals?'Portales abiertos: entra en uno':G.bosses.length?'¡Derrota al jefe!':'');
  setT('kills',fmtN(G.kills));setT('gold',fmtN(Math.floor(G.gold)));
  const ms=(G.missions||[]).map(m=>`${m.id}${m.prog}${m.done}`).join('|');if(HUDC.ms!==ms){HUDC.ms=ms;$('missions').innerHTML=(G.missions||[]).map(m=>`<li class="${m.done?'done':''}"><span>${esc(m.txt)}</span><div class="mbar"><i style="width:${m.prog/m.n*100}%"></i></div><small>${m.done?'Completada':`${m.prog}/${m.n} · <i class="cn"></i>${m.rew}`}</small></li>`).join('');}
  const bs=G.bosses[0];$('boss').hidden=!bs;if(bs){setT('bossName',bs.d.name);setW('bossf',bs.hp/bs.maxHp*100);}
  const p2=players[1];if(p2){setW('p2hp',p2.hp/p2.maxHp*100);}
  if(G.online){const pl=remotes.map(r=>`${r.name}|${r.dn}|${Math.round(r.hp/r.maxHp*10)}|${r.realm===G.realm}`).join(',');if(HUDC.pl!==pl){HUDC.pl=pl;$('party').hidden=!remotes.length;$('party').innerHTML='<div class="sub">Grupo</div>'+remotes.map(r=>`<div class="pm${r.dn?' dn':''}"><b>${esc(r.name)}</b><span>${esc(r.g.name)}${r.realm!==G.realm?' · otro reino':r.dn?' · ¡caído, ve a revivirlo!':''}</span><div class="mbar"><i style="width:${r.hp/r.maxHp*100}%"></i></div></div>`).join('');}}
  else if(!$('party').hidden)$('party').hidden=true;
}

/* ---------- pausa estilo ficha ---------- */
const _pause=pause;
pause=function(on){_pause(on);if(on)renderPause();};
function renderPause(){if(!G)return;try{renderQuestPause();}catch(err){console.warn(err);}const p=players[0];applyTheme(p.g.pan);portrait($('psPort'),p.god,96);
  $('psCtx').textContent=`${REALMS[G.realm].name} · ${G.mode==='libre'?'Supervivencia':'Clásico'} · Reino ${G.ridx+1}`;$('psName').textContent=p.g.name;$('psPan').textContent=p.g.pan;$('psLv').textContent='Nv. '+G.level;
  $('psHp').style.width=(p.hp/p.maxHp*100)+'%';$('psHpT').textContent=`${Math.ceil(p.hp)}/${Math.round(p.maxHp)}`;$('psXp').style.width=(G.xp/G.need*100)+'%';$('psXpT').textContent=`${Math.floor(G.xp)}/${G.need}`;
  const dps=G.dmgWin.reduce((s,w)=>s+w[1],0)/4;
  $('psTiles').innerHTML=[[fmt(G.t),'Tiempo'],[fmtN(G.kills),'Bajas'],[fmtN(G.dmgTotal),'Daño'],[fmtN(dps),'Daño/s'],['<i class="cn"></i>'+fmtN(Math.floor(G.gold)),'Oro'],['<i class="cn"></i>'+fmtN(Math.round(G.money+G.goldTotal*.2)),'Dracmas'],['x'+G.bestStreak,'Mejor racha']].map(t=>`<div class="tile"><b>${t[0]}</b><span>${t[1]}</span></div>`).join('');
  const ws=Object.keys(p.weapons);$('psWcount').textContent=`${ws.length} de 4`;
  $('psWeapons').innerHTML=`<div class="abil"><small>DON DEL DIOS</small><b>${esc(p.g.pn)}</b><p>${esc(p.g.pd)} ${esc(p.g.bd)}.</p></div>`+ws.map(k=>{const Wd=WEAPONS[k],w=p.weapons[k],s=kst(Wd,w.lvl,p);const tags=[];if(s.dmg)tags.push(`DAÑO ${Math.round(s.dmg*pMul(p))}`);if(s.cd)tags.push(`RECARGA ${(s.cd*p.cdMul).toFixed(1)} s`);if(s.count)tags.push(`x${s.count}`);if(s.radius)tags.push(`RADIO ${Math.round(s.radius*p.area)}`);{const rc=Math.round(weaponReach(Wd,s,p));if(rc&&!s.radius)tags.push(`ALCANCE ${rc}`);}
    return`<div class="wrow"><span class="wem">${Wd.em}</span><div><b>${esc(Wd.name)}</b><small>${esc(Wd.pan)} · Nv. ${w.lvl}</small><div class="tags">${tags.map(t=>`<span>${t}</span>`).join('')}</div><p>${esc(Wd.desc)}</p></div></div>`;}).join('');
  const its=Object.keys(p.items);$('psIcount').textContent=`${its.length} objetos · ${Object.keys(p.passives).length} dones`;
  $('psItems').innerHTML=(its.map(k=>{const d=ITEMS[k],r=RAR[d.rar];return`<div class="irow"><span class="iem" style="--rc:${r.col}">${d.em}</span><div><b>${esc(d.name)}</b> <span class="pill" style="background:${r.col}">${r.name}</span> <small>x${p.items[k]} de ${d.max}</small><p>${esc(d.desc)}</p></div></div>`;}).join('')||'<p class="mut">Abre cofres (E) para conseguir objetos. Los élites y los jefes dejan los mejores.</p>')
    +Object.keys(p.passives).map(k=>{const d=PASSIVES[k];return`<div class="irow"><span class="iem" style="--rc:#3a8bff">${d.em}</span><div><b>${esc(d.name)}</b> <small>Nv. ${p.passives[k]}</small><p>${esc(d.desc)}</p></div></div>`;}).join('');
  const st=[['Daño',`${Math.round(pMul(p)*100)}%`,pMul(p)>1],['Recarga',`${Math.round(100/p.cdMul)}%`,p.cdMul<1],['Área',`${Math.round(p.area*100)}%`,p.area>1],['Alcance',`${Math.round((p.range||1)*100)}%`,(p.range||1)>1],['Suerte',`+${Math.round((p.luck||0)*100)}%`,(p.luck||0)>0],['Proyectiles extra',p.countBonus,p.countBonus>0],['Prob. crítico',`${Math.round(p.crit*100)}%`,p.crit>0],['Daño crítico',`${Math.round((1+p.critDmg)*100)}%`,p.critDmg>1],['Daño a jefes',`${Math.round((1+p.bossDmg)*100)}%`,p.bossDmg>0]];
  const df=[['PS máx.',Math.round(p.maxHp),p.maxHp>p.g.hp],['Regeneración/s',p.regen.toFixed(1),p.regen>0],['Armadura',p.armor,p.armor>0],['Evasión',`${Math.round(p.evasion*100)}%`,p.evasion>0],['Espinas',`${Math.round(p.thorns*100)}%`,p.thorns>0],['Robo de vida',p.steal.toFixed(1),p.steal>0],['Vidas extra',p.lives,p.lives>0]];
  const ut=[['Velocidad',`${Math.round(p.speed/p.g.spd/1.15*100)}%`,p.speed>p.g.spd*1.15],['Rango recogida',Math.round(p.magnet),p.magnet>80],['Experiencia',`${Math.round(p.xpMul*100)}%`,p.xpMul>1],['Dracmas',`${Math.round(p.goldMul*100)}%`,p.goldMul>1],['Saltos extra',p.extraJumps,p.extraJumps>0],['Curación',`${Math.round(p.healMul*100)}%`,p.healMul>1]];
  const tb=rows=>rows.map(r=>`<tr><td>${r[0]}</td><td class="${r[2]?'up':''}">${r[1]}</td></tr>`).join('');
  $('psStats').innerHTML=`<div><div class="sub">Ataque</div><table>${tb(st)}</table></div><div><div class="sub">Defensa</div><table>${tb(df)}</table><div class="sub">Utilidad</div><table>${tb(ut)}</table></div>`;
  $('psOnline').textContent=G.online?'En online la partida sigue mientras estás en pausa.':'';}
$('psContinue').onclick=()=>pause(false);$('psQuit').onclick=()=>{if(G&&!G.online&&state!=='end'){endGame(false);}else toMenu();};
$('psRestart').onclick=()=>{if(G&&!G.online){state='menu';newRun();}};$('pauseBtn').onclick=()=>{if(state==='play')pause(true);};

/* ---------- resultados ---------- */
function uiEnd(win,coins,r){
  const p=players[0];applyTheme(p.g.pan);portrait($('enPort'),p.god,96);
  $('enEyebrow').textContent=win?'Victoria':'Fin de la partida';$('enTitle').textContent=win?'¡EL RAGNARÖK SE DETUVO!':pick(['Caronte cobra su óbolo','Anubis pesa tu corazón','Las valquirias te recogen','El Mictlán te recibe','Xibalbá gana esta vez']);
  $('enTiles').innerHTML=[[fmt(G.t),'Tiempo'],['Nv. '+G.level,'Nivel'],[fmtN(G.kills),'Bajas'],[fmtN(G.bossKills),'Jefes'],[fmtN(G.dmgTotal),'Daño'],['x'+G.bestStreak,'Mejor racha'],[fmtN(Math.round(G.goldTotal)),'Oro reunido']].map(t=>`<div class="tile"><b>${t[0]}</b><span>${t[1]}</span></div>`).join('');
  $('enCoins').innerHTML='+ <i class="cn"></i>'+fmtN(coins);$('enScore').textContent=fmtN(r.sc);$('enRec').textContent='';
  $('enRoute').textContent='Ruta: '+G.visited.map(k=>REALMS[k].name).join(' → ')+` · Misiones completadas: ${G.missionsDone} · Cofres: ${G.chestsOpened}`;
  $('enAgain').hidden=!!G.online;show('end');}
function uiEndScore(r){if(r&&r.changed)$('enRec').textContent='¡Nuevo récord personal!';}
$('enAgain').onclick=()=>{state='menu';newRun();};$('enMenu').onclick=()=>toMenu();

/* ---------- botones táctiles ---------- */
$('tJump').addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();TOUCH_JUMP_HELD=true;const p=players.find(q=>q.ctrl==='p1');if(p&&state==='play')jump(p);});
$('tJump').addEventListener('pointerup',()=>{TOUCH_JUMP_HELD=false;});$('tJump').addEventListener('pointercancel',()=>{TOUCH_JUMP_HELD=false;});
$('power').addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();const p=players.find(q=>q.ctrl==='p1');if(p&&state==='play')usePower(p);});
$('tDash').addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();const p=players.find(q=>q.ctrl==='p1');if(p&&state==='play')slide(p);});



/* ---- Guía ---- */
const TIERS={
  p:{S:['arcomarduk','hule','furia','tumi','megingjord','clepsidra'],A:['laurel','ojohorus','chakana','cacao','vajra','yasakani','tablilla','ruedafortuna','obsidiana'],B:['ojohalcon','ambrosia','anj','cornucopia','calabaza','opele','piedrafal','ofuda','sandalias'],C:['loto','melocoton','egida','cempasuchil','aguamar','caldero','gleipnir']},
  i:{S:['gjallar','brisingamen','ankh','vellocino','calavera','hipolita'],A:['mjolnirb','lagrima','dorje','tambor','ojoodin','trebol','colmillo'],B:['diente','arena','hoja','arcolargo','huevo','escama','maat','manto'],C:['maiz','obolo','pluma','anfora','sal','sandalia','nopal','aguja','caldero']}};
const GUIDE={tab:'p'};
function renderGuide(){const el=$('guide');const sd=SC_DIFF;
  const chip=(k,src)=>{const d=src[k];if(!d)return'';return`<span title="${esc(d.desc)}"><i>${esc(d.em||'')}</i>${esc(d.name)}</span>`;};
  const src=GUIDE.tab==='p'?PASSIVES:ITEMS,T=TIERS[GUIDE.tab];const listed=new Set(Object.values(T).flat());const extra=Object.keys(src).filter(k=>!listed.has(k));
  const tiers=['S','A','B','C'].map(t=>`<div class="tier ${t}"><b>${t}</b><div class="chips">${(T[t]||[]).concat(t==='C'?extra:[]).map(k=>chip(k,src)).join('')}</div></div>`).join('');
  el.innerHTML=`
  <div class="box"><div class="hdr h-orange">Cómo avanzar</div><div class="body">
    <div class="gsub">HISTORIA</div><ol class="gsteps">
      <li><span><b>Sobrevive y sube de nivel.</b> Recoge la experiencia (cristales) que sueltan los enemigos y elige armas y dones.</span></li>
      <li><span><b>Vence a los minijefes</b> (min 2 y 4) y <b>al jefe del reino</b> (min 6). Se abren 2 portales: elige tu siguiente reino.</span></li>
      <li><span>Tras 3 reinos baja al <b>Vacío Primordial</b> y derrota a <b>Khaos</b> para detener el Ragnarök.</span></li></ol>
    <div class="gsub" style="margin-top:12px">SUPERVIVENCIA</div><ol class="gsteps">
      <li><span>Cada <b>oleada</b> dura hasta que cae su jefe (unos 6 min).</span></li>
      <li><span>Luego saltas a <b>otro reino al azar</b>: todo empieza de nuevo, pero los enemigos son más rápidos y fuertes.</span></li>
      <li><span>Tu objetivo: <b>aguantar el máximo de oleadas</b>. Cada una multiplica tus puntos.</span></li></ol>
    <div class="gsub" style="margin-top:12px">PARA NO MORIR</div><ol class="gsteps">
      <li><span><b>Néctar (tecla H):</b> cura el 45 %. Llevas hasta 3 frascos; los sueltan élites y jefes.</span></li>
      <li><span><b>Granadas rojas</b> en el suelo: curan al tocarlas.</span></li>
      <li><span><b>Desliza (Shift)</b> para esquivar y <b>salta</b> sobre los enemigos lentos.</span></li></ol></div></div>
  <div class="box"><div class="hdr h-purple">Cómo sumar millones</div><div class="body">
    <div class="gmul"><div><b>×10</b><small>Combo: +×0,5 cada 20 bajas seguidas (sin pasar 3 s sin matar)</small></div><div><b>+×0,5</b><small>Por cada oleada o reino que superas</small></div><div><b>×${String(sd.pesadilla).replace('.',',')}</b><small>Pesadilla (Difícil ×${String(sd.dificil).replace('.',',')})</small></div></div>
    <div class="gpts"><span>Enemigo</span><span>10</span><span>Élite</span><span>100</span><span>Cofre abierto</span><span>200</span><span>Misión del reino</span><span>1 000</span><span>Minijefe</span><span>2 500</span><span>Jefe</span><span>10 000</span><span>Némesis</span><span>25 000 + 2 500</span><span>Khaos</span><span>50 000</span><span>Ganar Historia</span><span>100 000 × dificultad</span></div>
    <div class="gex">Todo se multiplica: en la oleada 6 de Supervivencia (×3,5), con combo ×8 y en Pesadilla (×2,5), <b>cada enemigo normal da 700 puntos</b>. 5 000 bajas así son <b>3,5 millones</b>. Si te golpean, <b>pierdes la mitad del combo</b>.</div></div></div>
  <div class="box"><div class="hdr h-blue">La run perfecta</div><div class="body"><ol class="gsteps">
    <li><span><b>Modo Supervivencia</b> en la dificultad más alta que aguantes (Pesadilla se desbloquea ganando en Difícil).</span></li>
    <li><span><b>Minutos 0-2:</b> sube tu arma principal a nivel 3 antes de coger otras. Más nivel = más alcance y daño.</span></li>
    <li><span><b>Coge dones S:</b> +1 proyectil (Arco de Marduk, Pelota de hule) y +daño. Luego recarga y área.</span></li>
    <li><span><b>Junta 3 fuentes del mismo Concilio</b> (armas, dones o el compañero con la misma etiqueta) para activar su bonus.</span></li>
    <li><span><b>Gasta el oro en cofres</b> y busca objetos S: Gjallarhorn, Brisingamen, Ankh, Vellocino. Con suerte salen mejores.</span></li>
    <li><span><b>No rompas el combo:</b> nunca pares de matar más de 3 s y no te dejes tocar. Usa el néctar antes de que sea tarde.</span></li>
    <li><span><b>Caza élites y némesis:</b> dan muchos puntos, cofres ricos y néctar.</span></li></ol></div></div>
  <div class="box"><div class="hdr h-theme">Némesis</div><div class="body"><p style="margin:0 0 8px;font-size:14px;line-height:1.45">Algunos dioses tienen un enemigo de su propia mitología que puede aparecer a por ellos a mitad del reino. Es más fuerte que un minijefe, pero si lo vences ganas <b>25 000 puntos</b>, un <b>cofre rico</b> y néctar.</p>
    <div class="gpts" style="max-height:230px;overflow:auto;padding-right:6px">${nemList()}</div></div></div>
  <div class="box wide"><div class="hdr h-green">De mejor a peor</div><div class="body"><div class="gtabs"><button data-g="p" aria-pressed="${GUIDE.tab==='p'}">Dones (al subir de nivel)</button><button data-g="i" aria-pressed="${GUIDE.tab==='i'}">Objetos (cofres)</button></div>${tiers}<p class="mut" style="font-size:12px;margin:8px 0 0">Pasa el ratón por encima para ver qué hace cada uno. S = cógelo siempre · C = solo si no hay nada mejor.</p></div></div>`;
  el.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{GUIDE.tab=b.dataset.g;renderGuide();});}
function nemList(){const out=[];for(const g of GODS){const ks=Object.keys(BOSSES).filter(k=>BOSSES[k].tier!=='final'&&(BOSSES[k].weak||[]).includes(g.id));if(ks.length)out.push(`<span>${esc(g.name)}</span><span>${ks.map(k=>esc(BOSSES[k].name)).join(', ')}</span>`);}return out.slice(0,40).join('');}
/* ---- portada ---- */
const HOME={shown:true,lb:'score',god:''};let HRANK_AT=0;
function renderHome(){if(!$('home')||$('home').hidden)return;
  const acc=$('hAcc');const ready=NET.ready||NET.offline;
  if(NET.uid){const nm=NET.myName||'Tu cuenta';acc.innerHTML=`<span class="hcoin"><i class="cn"></i>${fmtN(PROF.coins)}</span><span class="hav">${esc(nm.slice(0,1).toUpperCase())}</span><span>${esc(nm)}</span>`;$('hGoogle').hidden=true;}
  else{acc.innerHTML=`<span class="hcoin"><i class="cn"></i>${fmtN(PROF.coins)}</span>`;$('hGoogle').hidden=!ready;}
  const g=GOD[PROF.god];if(HOME.god!==PROF.god||!$('tPlayCv').width){HOME.god=PROF.god;fullSprite($('tPlayCv'),PROF.god,2);const o=GODS.filter(x=>owns(x.id)&&x.id!==PROF.god);portrait($('tLocalA'),PROF.god,44);portrait($('tLocalB'),(o.find(x=>relOf(PROF.god,x.id))||o[0]||g).id,44);}
  $('tPlaySub').textContent=`Modo historia · ${g.name}`;
  $('tSurvSub').textContent=`Récord ${fmtN(PROF.best.endless||0)}`;
  const set=(t,v)=>{const e=$('ts-'+t);if(e)e.textContent=v;};
  set('dioses',`${PROF.owned.length}/${GODS.length}`);set('tienda','Mejoras');set('misiones',`${PROF.runs||0} partidas`);set('ranking',`Récord ${fmtN(PROF.best.score||0)}`);set('clan',PROF.clan?PROF.clan:'Sin clan');
  homeEvent();homeDaily();homeRank();}
function homeEvent(){const ev=weekEvent(),r=REALMS[ev.realm],ms=ev.ends-Date.now(),d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4);
  const el=$('hEvent');el.innerHTML=`<canvas width="400" height="100"></canvas><div class="evb"><div class="evt">¡EVENTO! Termina en ${d?d+' d ':''}${h} h ${m} min</div><b>${esc(r.name)}: dracmas ×1,5</b><small>Toda partida que pase por este reino paga un 50 % más</small></div>`;
  const c=el.querySelector('canvas'),gx=c.getContext('2d');const gr=gx.createLinearGradient(0,0,0,100);gr.addColorStop(0,LOOK3D[ev.realm].top);gr.addColorStop(1,LOOK3D[ev.realm].hor);gx.fillStyle=gr;gx.fillRect(0,0,400,100);if(PREV[ev.realm])gx.drawImage(PREV[ev.realm],0,-60,400,225);
  el.onclick=()=>{cfg.realm=ev.realm;closeHome();};}
function homeDaily(){ensureDaily();const ids=PROF.daily.ids||[];let ready=0;const dots=ids.map(id=>{const d=DAILY.find(x=>x.id===id);const ok=d&&(PROF.daily.prog[id]||0)>=d.n;if(ok&&!PROF.daily.claimed[id])ready++;return`<i class="${ok?'on':''}"></i>`;}).join('');
  const nx=new Date();nx.setHours(24,0,0,0);const ms=nx-Date.now();
  const el=$('hDaily');el.innerHTML=`<b>Misiones</b><span class="dots">${dots}</span><small>${ready?`¡${ready} por cobrar!`:`Nuevas en ${Math.floor(ms/36e5)} h ${Math.floor(ms%36e5/6e4)} min`}</small>`;
  el.onclick=()=>{closeHome();openTab('misiones');};}
async function homeRank(){const pod=$('hPod'),ol=$('hRank');const key=HOME.lb;
  document.querySelectorAll('#hLbTabs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===key?'true':'false'));
  let rows=null;if(NET.db){if(!(Date.now()-HRANK_AT<15000&&NET.board)){HRANK_AT=Date.now();}rows=await loadBoard();}
  const mine={id:NET.uid||'me',score:PROF.best.score||0,endless:PROF.best.endless||0,god:PROF.god};
  let list=(rows||[]).filter(r=>(+r[key]||0)>0);if(!list.some(r=>r.id===mine.id)&&mine[key]>0)list.push(mine);list.sort((a,b)=>(+b[key]||0)-(+a[key]||0));
  const nm=r=>r.id===mine.id?'Tú':nameOf(r.id,'Jugador');const gn=r=>GOD[r.god]?GOD[r.god].name:'';
  pod.innerHTML='';ol.innerHTML='';
  if(!list.length){pod.innerHTML=`<div class="lbempty">${NET.db?'Nadie ha puntuado todavía. ¡El primer puesto es tuyo!':ready2()?'Entra con tu cuenta para competir con todos.':'Cargando…'}</div>`;return;}
  list.slice(0,3).forEach((r,i)=>{const d=document.createElement('div');d.className=`pod p${i+1}${r.id===mine.id?' me':''}`;const c=document.createElement('canvas');d.appendChild(c);portrait(c,GOD[r.god]?r.god:'zeus',52);
    d.insertAdjacentHTML('beforeend',`<div><b>${esc(nm(r))}</b><small>${esc(gn(r))}</small></div><div class="sc">${fmtN(+r[key]||0)}<small>puntos</small></div>`);pod.appendChild(d);});
  const rest=list.slice(3,8);const mi=list.findIndex(r=>r.id===mine.id);if(mi>=8)rest.push(list[mi]);
  for(const r of rest){const i=list.indexOf(r);const li=document.createElement('li');li.className=r.id===mine.id?'me':'';li.innerHTML=`<i>${i+1}</i>`;const c=document.createElement('canvas');portrait(c,GOD[r.god]?r.god:'zeus',28);li.appendChild(c);li.insertAdjacentHTML('beforeend',`<b>${esc(nm(r))}</b><em>${fmtN(+r[key]||0)}</em>`);ol.appendChild(li);}}
function ready2(){return NET.ready||NET.offline;}
function closeHome(){$('home').hidden=true;$('menu').style.visibility='';HOME.shown=false;openTab('jugar');}
function openHome(){if(state!=='menu')return;$('home').hidden=false;$('menu').style.visibility='hidden';HOME.shown=true;renderHome();}
$('hEnter').onclick=()=>{cfg.mode='ragnarok';closeHome();};$('logoHome').onclick=openHome;
$('hRankAll').onclick=()=>{closeHome();openTab('ranking');};
document.querySelectorAll('#hLbTabs button').forEach(b=>b.onclick=()=>{HOME.lb=b.dataset.v;homeRank();});
document.querySelectorAll('#home [data-mode],#home [data-party]').forEach(b=>b.onclick=()=>{if(b.dataset.mode)cfg.mode=b.dataset.mode;if(b.dataset.party)cfg.party=b.dataset.party;closeHome();});
document.querySelectorAll('#home .ts').forEach(b=>b.onclick=()=>{closeHome();openTab(b.dataset.tab);});
$('hGoogle').onclick=()=>{window.SB_LOGIN&&SB_LOGIN();};
$('menu').style.visibility='hidden';renderHome();setTimeout(renderHome,1500);
uiHome();netInit();
function onAssetsReady(){try{uiHome();uiProfileChanged();}catch(err){console.warn(err);}for(const k in ENI2)if(!ENI2[k])delete ENI2[k];if(state==='menu'&&WORLD){buildWorld(WORLD.rk);clearObjs();}updPlayBtn();if(UI&&UI.tab==='dioses'&&typeof renderGods==='function')renderGods();}
{const iv=setInterval(()=>{if(AS.ready||AS.failed){clearInterval(iv);}updPlayBtn();},400);}
asLoad();
