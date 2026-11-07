/* 조선 연애실록 — 화면 */
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const FORM_URL='https://forms.gle/nsVuEH5RHAAL7wQdA';
let SET=Store.settings();
const V={screen:'title',tab:'love',filter:'love',yearOpen:{},stageClosed:{},dirty:{},mob:'feed',openCard:null,codexTab:'cls',birth:null,away:null,lastEnd:null,codexBefore:null};

/* ===== 용어 ===== */
const AUTO_TERMS=(()=>{const keys=[...Object.keys(TERMS).filter(k=>k.length>=2),...Object.keys(PEOPLE),...KINGS.map(k=>k.n)];return [...new Set(keys)].sort((a,b)=>b.length-a.length);})();
const AUTO_RE=new RegExp('('+AUTO_TERMS.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','g');
function termDesc(k){if(PEOPLE[k])return ['인물',PEOPLE[k]];const kg=KINGS.find(x=>x.n===k);if(kg)return [kg.g?'고려의 임금':'조선의 임금',`${kg.d} (재위 ${kg.s}–${kg.e})`];if(TERMS[k])return ['풀이',TERMS[k]];if(P&&P.alt&&P.alt.king===k)return ['이 판의 임금','정사와 달리 이 판의 역사에서 보위에 오른 임금.'];return null;}
function fmt(t){
  const parts=String(t).split(/(\[\[[^\]]+\]\])/);const used=new Set();
  return parts.map(p=>{
    const m=p.match(/^\[\[([^\]]+)\]\]$/);
    if(m){used.add(m[1]);return `<span class="term" data-term="${esc(m[1])}">${esc(m[1])}</span>`;}
    return esc(p).replace(AUTO_RE,w=>{if(used.has(w))return w;used.add(w);return `<span class="term" data-term="${esc(w)}">${w}</span>`;});
  }).join('');
}

/* ===== 공통 ===== */
function applySettings(){
  const h=document.documentElement;h.classList.toggle('dark',!!SET.dark);
  h.classList.remove('fs0','fs1','fs2');h.classList.add('fs'+SET.font);
  G.len=SET.len;G.speed=SET.speed||1;G.auto=!!SET.auto;
}
function saveSet(){Store.saveSettings(SET);applySettings();}
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2200);}
function modal(html,cls){closeModal();const m=document.createElement('div');m.className='modal';m.id='modal';m.innerHTML=`<div class="box ${cls||''}">${html}</div>`;m.addEventListener('click',e=>{if(e.target===m)closeModal();});document.body.appendChild(m);return m;}
function closeModal(){const m=$('#modal');if(m){m.remove();holdOff();}}
/* 설명을 보는 동안 잠깐 멈춤 */
function holdOn(){if(typeof G!=='undefined'&&V.screen==='play'&&!G.paused&&!G.scene){G.paused=true;G.autoHold=true;renderTop();}}
function holdOff(){if(G&&G.autoHold&&!$('#modal')&&!document.querySelector('.pop')&&!document.querySelector('details.ln.note[open]')){G.autoHold=false;G.paused=false;renderTop();}}
function confirmBox(text,ok,fn){modal(`<h3>확인</h3><p class="serif">${text}</p><div class="rowbtns"><button class="btn" data-a="close">그만둔다</button><button class="btn pri" id="cfok">${ok}</button></div>`);$('#cfok').onclick=()=>{closeModal();fn();};}
const inApp=/KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER\(inapp|DaumApps/i.test(navigator.userAgent);

/* ===== 음악 ===== */
/* 휴대폰(특히 아이폰)은 사용자가 누른 순간에 재생한 그 재생기만 계속 쓸 수 있어, 재생기 하나를 두고 곡만 바꾼다 */
const Music={
  tr:{calm:['audio/calm.mp3','audio/calm2.mp3','audio/soft.mp3'],sad:['audio/sad.mp3'],tense:['audio/tense1.mp3','audio/tense2.mp3','audio/tense3.mp3']},
  el:null,mode:null,cur:null,unlocked:false,blocked:false,ci:0,
  ensure(){if(this.el)return;const a=new Audio();a.preload='auto';a.setAttribute('playsinline','');a.addEventListener('ended',()=>this.onEnd());this.el=a;},
  unlock(){
    if(this.unlocked)return;this.unlocked=true;
    try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
    this.ensure();
    if(SET.music)this.play(true);
  },
  want(m){this.mode=m;if(!SET.music||!this.unlocked){this.pause();return;}this.play();},
  play(force){
    const m=this.mode||'calm';this.ensure();
    /* 같은 분위기의 곡이 이미 걸려 있으면 처음부터 다시 틀지 않고 멈춘 자리에서 이어 튼다 */
    if(!force&&this.cur===m&&this.el.src){if(this.el.paused)this.resume();return;}
    const list=this.tr[m];const pool=list.length>1?list.filter(x=>x!==this.lastSrc):list;const src=R(pool);this.lastSrc=src;
    this.cur=m;this.el.loop=m==='sad';this.el.src=src;this.el.volume=.5;
    this.resume();
  },
  resume(){if(!this.el||!this.el.src)return;const p=this.el.play();if(p&&p.catch)p.catch(()=>{this.blocked=true;});},
  onEnd(){if(this.cur==='tense')this.mode='calm';else if(this.cur==='calm')this.ci++;this.cur=null;if(SET.music)this.play();},
  pause(){if(this.el&&!this.el.paused)this.el.pause();},
  stop(){this.pause();}
};
['click','touchend','keydown'].forEach(t=>document.addEventListener(t,()=>{
  if(!Music.unlocked){Music.unlock();return;}
  if(Music.blocked&&SET.music){Music.blocked=false;Music.play();}
},true));

/* ===== 클라우드 (Claude 계정에 로그인한 경우) ===== */
const Cloud={on:false,db:null,uid:null,busy:{},queued:{},
  async init(){
    try{
      if(!window.claude||!window.claude.use)return;
      const db=await window.claude.use('db');const user=await window.claude.use('user');
      if(!db||!user)return;const id=await user.id();if(!id)return;
      this.db=db;this.uid=id;
      const base='data/users/'+id;
      const t=setTimeout(()=>{},10000);
      const snap=await db.doc(base+'/main').get().catch(()=>null);clearTimeout(t);
      if(snap&&snap.exists){const d=snap.data()||{};mergeData({hist:d.hist||[],codex:d.codex||{}},true);}
      const cs=await db.doc(base+'/cur').get().catch(()=>null);
      if(cs&&cs.exists&&!Store.loadCur()){const d=cs.data();if(d&&d.P&&!d.P.dead)Store.put(Store.k.cur,d.P);}
      this.on=true;if(V.screen==='title')renderTitle();
      Store.listeners.push((w,x)=>this.queue(w,x));
    }catch(e){this.on=false;}
  },
  queue(w,x){if(!this.on)return;if(w==='hist'&&x)this.write('life-'+x.id,{s:x.sillok,t:Date.now()});const k=w==='cur'?'cur':'main';clearTimeout(this.queued[k]);this.queued[k]=setTimeout(()=>this.flush(k),k==='cur'?20000:3000);},
  async write(doc,data){if(!this.on)return;if(this.busy[doc]){this.busy[doc+'_next']=data;return;}this.busy[doc]=1;
    try{await this.db.doc('data/users/'+this.uid+'/'+doc).set(data);}catch(e){if(e&&(e.code==='invalid_argument'||e.code==='revoked'))this.on=false;}
    this.busy[doc]=0;const nx=this.busy[doc+'_next'];if(nx){this.busy[doc+'_next']=null;this.write(doc,nx);}},
  flush(k){
    if(k==='main'){const hist=Store.hist().slice(0,150).map(h=>{const {sillok,...r}=h;return r;});this.write('main',{hist,codex:Store.codex(),t:Date.now()});}
    else{const c=Store.loadCur();this.write('cur',c?{P:c,t:Date.now()}:{P:null,t:Date.now()});}
  }
};
function mergeData(d,fromCloud){
  const local=Store.hist();const ids=new Set(local.map(h=>h.id));let n=0;
  for(const h of d.hist||[]){if(!ids.has(h.id)){local.push(h);n++;}}
  local.sort((a,b)=>(b.t||0)-(a.t||0));Store.put(Store.k.hist,local.slice(0,300));
  const cx=Store.codex();for(const k in (d.codex||{})){cx[k]=cx[k]||{};Object.assign(cx[k],d.codex[k]);}Store.saveCodex();
  if(d.cur&&!Store.loadCur())Store.put(Store.k.cur,d.cur);
  return n;
}

const LEN_INFO={short:['짧게','한 해가 약 12초','한 삶에 대략 12~17분'],normal:['보통','한 해가 약 22초','한 삶에 대략 25~30분'],long:['길게','한 해가 약 33초','한 삶에 대략 35~40분']};
function lenNote(k){const i=LEN_INFO[k];return `<b>${i[0]}</b> · ${i[1]} · ${i[2]}<br><span class="muted">혼기(18~30세)는 조금 느리게, 어린 시절은 빠르게 흐릅니다. 선택지를 고르는 시간까지 넣은 대략의 시간이며, 2배속·4배속이나 ‘운명에 맡김’을 쓰면 더 짧아집니다.</span>`;}

/* ===== 시작 화면 ===== */
function renderTitle(){
  V.screen='title';Music.want('calm');
  const hist=Store.hist(),cur=Store.loadCur();
  $('#app').innerHTML=`<div id="scr-title">
    ${inApp?`<div class="banner">카카오톡이나 인스타그램 같은 앱 안에서 열면 기록이 따로 저장되고 사라지기 쉽습니다. 오른쪽 위 메뉴에서 <b>다른 브라우저로 열기</b>를 권합니다.</div>`:''}
    <div class="topmini">
      <button class="btn sm ghost" data-a="music">${SET.music?'♪ 음악 켜짐':'♪ 음악 꺼짐'}</button>
      <button class="btn sm ghost" data-a="font">가 글자 ${['작게','보통','크게'][SET.font]}</button>
      <button class="btn sm ghost" data-a="dark">${SET.dark?'☾ 어두운 화면':'☀ 밝은 화면'}</button>
    </div>
    <div class="hero">
      <div class="eyebrow">고려 말 — 경술년</div>
      <h1>조선 연애실록</h1>
      <div class="sub">고려 말에서 조선의 마지막 해까지, 한 사람의 사랑과 일생</div>
    </div>
    <div class="intro">
      <p>그대는 태어날 해도, 집안도, 신분도 고를 수 없습니다.</p>
      <p>임금의 딸일 수도, 양반가의 서얼일 수도, 관기의 딸이나 노비의 아들일 수도 있습니다.</p>
      <p>주어진 운명 안에서 사랑하고, 혼인하고, 때로는 역사를 바꾸며 한 사람의 일생을 끝까지 살아 보십시오.</p>
    </div>
    <div class="startbox">
      <button class="btn pri" data-a="new">새로운 삶 시작하기</button>
      ${cur?`<button class="btn resume" data-a="resume"><span><b>이어서 하기</b><small>${esc(curName(cur))} · ${cur.age}세 · ${esc(reignLabel(cur.year,cur))}</small></span></button>`:''}
    </div>
    ${Cloud.on?'<div class="cloudnote">Claude 계정에 로그인되어 있어, 기록이 다른 기기와도 이어집니다.</div>':''}
    ${hist.length?`<div class="pastmini"><h3>지난 삶의 기록</h3>${hist.slice(0,5).map(h=>pastRow(h)).join('')}${hist.length>5?`<div style="text-align:center;margin-top:8px"><button class="btn sm" data-a="past">모두 보기 (${hist.length})</button></div>`:''}</div>`:''}
    <div class="links">
      <button data-a="codex">인생 도감</button>
      <button data-a="past">지난 삶</button>
      <button data-a="transfer">기록 옮기기</button>
      <button data-a="guide">이용 안내</button>
      <a href="${FORM_URL}" target="_blank" rel="noopener">의견 보내기</a>
    </div>
    <div class="foot">가입 없이 바로 플레이 · 15세 이상 이용가 · 기록은 이 기기의 브라우저에 저장됩니다.<br>실제 역사를 바탕으로 한 허구이며, 실존 인물은 각색되어 등장합니다.</div>
    <div class="foot credit">만든 이 <b>쭈꿈</b> · 트위터 <a href="https://x.com/jjuggum_ai" target="_blank" rel="noopener">@jjuggum_ai</a></div>
  </div>`;
}
function curName(c){if(c.female&&(c.cls==='yangban'||c.cls==='royal'))return `${c.sur}씨 (${c.name})`;if(['yangban','jungin','royal'].includes(c.cls))return c.sur+c.name;return c.name;}
function pastRow(h){return `<div class="pastrow" data-a="openpast" data-id="${h.id}"><span><b>${esc(h.name)}</b> · ${esc(h.origin)} · ${h.born}–${h.death}${h.closed?' (실록 닫힘)':` · 향년 ${h.age}세`}</span><span class="ep">${esc(h.epithet||'')}${h.alt?' · 역사를 바꿈':''}</span></div>`;}

/* ===== 출생 ===== */
function newBirth(){
  Music.unlock();Music.want('calm');
  const p=rollBirth(Store.hist());V.birth=p;V.screen='birth';
  const rows=birthCard(p);
  const pools=[()=>`${ri(1370,1880)}년`,()=>R(KINGS).n,()=>R(REGIONS)[0],()=>R(Object.values(CLS)).n,()=>R(['여인','사내']),()=>R(['역관 집안','양반가','관기','농사꾼 집','종친']),()=>R(['외동','셋째','맏이','둘째']),()=>money(ri(0,3000))];
  $('#app').innerHTML=`<div class="center"><div class="scroll"><h2>운명이 정해진다</h2>
    ${rows.map((r,i)=>`<div class="rollrow"><div class="k">${r[0]}</div><div class="v spin" id="rv${i}">…</div></div>`).join('')}
    <div id="birthAfter" class="hide">
      ${p.ancestor?`<div class="anc">이 아이는 지난 삶의 <b>${esc(p.ancestor.name)}</b>의 ${p.ancestor.gens}대손입니다.</div>`:''}
      <div class="lenpick"><span class="muted">플레이 길이</span>${['short','normal','long'].map(k=>`<button class="btn sm ${SET.len===k?'on':''}" data-a="len" data-v="${k}">${{short:'짧게',normal:'보통',long:'길게'}[k]}</button>`).join('')}</div><div class="fnote" id="lenNote" style="text-align:center;margin-top:8px">${lenNote(SET.len)}</div>
      <div class="rowbtns"><button class="btn" data-a="reroll">다시 태어나기</button><button class="btn pri" data-a="accept">이 삶으로 살기</button></div>
    </div></div></div>`;
  rows.forEach((r,i)=>{
    const el=$('#rv'+i);const until=performance.now()+450+i*260;
    const iv=setInterval(()=>{if(!document.body.contains(el)){clearInterval(iv);return;}
      if(performance.now()>=until){clearInterval(iv);el.textContent=r[1];el.classList.remove('spin');if(i===rows.length-1)$('#birthAfter').classList.remove('hide');}
      else el.textContent=pools[i]();},70);
  });
}
function renderName(){
  const p=V.birth;V.screen='name';
  const msg=p.sub==='gisaeng'?'장차 쓰게 될 기명을 고르십시오.':p.female&&['yangban','royal'].includes(p.cls)?'아이의 이름을 고르십시오. 양반가의 딸은 바깥에서 성씨로 불리곤 하였습니다.':'아이의 이름을 고르십시오. 이 선택으로 삶이 정해집니다.';
  $('#app').innerHTML=`<div class="center"><div class="scroll"><h2>첫 번째 선택</h2><p class="serif muted" style="text-align:center">${msg}</p>
    <div class="names">${p.nameCands.map((c,i)=>`<div class="namecard" data-a="name" data-i="${i}"><b>${esc(c.n)}</b><span>${esc(c.mean)}</span></div>`).join('')}</div></div></div>`;
}

/* ===== 플레이 ===== */
function enterPlay(){
  V.screen='play';V.yearOpen={};V.stageClosed={};V.away=null;
  $('#app').innerHTML=`<div id="scr-play">
    <div id="top"><div class="brand" data-a="home" title="처음 화면으로">조선 연애실록</div><div class="era" id="era"></div><div class="ctl" id="ctl"></div><div id="prog"></div></div>
    <div id="grid"><aside id="me"></aside><section id="mid"><div id="feedtools"></div><div id="feed"></div><div id="scene" class="hide"></div></section><aside id="side"></aside></div>
    <nav id="mnav">${[['feed','기록'],['me','나'],['love','인연'],['fam','가족'],['tl','연표'],['let','서찰']].map(([k,n])=>`<button data-a="mnav" data-v="${k}">${n}</button>`).join('')}</nav>
  </div>`;
  mobShow();
  V.follow=true;
  $('#feed').addEventListener('scroll',e=>{const el=e.target;if(V._auto){V._auto=false;return;}V.follow=el.scrollHeight-el.scrollTop-el.clientHeight<80;});
  renderAll();
  Music.want('calm');
  if(!SET.guided){SET.guided=true;saveSet();showGuide();}
}
function mobShow(){
  const m=V.mob;
  ['me','mid','side'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('show',(m==='me'&&id==='me')||(m==='feed'&&id==='mid')||(['love','fam','tl','let'].includes(m)&&id==='side'));});
  if(['love','fam','tl','let'].includes(m))V.tab=m;
  document.querySelectorAll('#mnav button').forEach(b=>b.classList.toggle('on',b.dataset.v===m));
}
function renderAll(){renderTop();renderMe();renderFeed(true);renderSide();renderScene();}
function renderTop(){
  if(!P)return;const k=kingAt(P.year,P);
  const era=P.year<1392?`고려 ${k.n} ${P.year-k.s?P.year-k.s+'년':'즉위년'}`:reignLabel(P.year,P);
  $('#era').innerHTML=`<b>${fmt(era)}</b><span class="sm">${ganji(P.year)}년 · ${P.year}</span><span class="sm">· ${kAge(P.age)||'갓난'} 살${P.age===0?'':''}</span>`;
  $('#ctl').innerHTML=`
    <button class="btn sm ${G.paused?'on':''}" data-a="pause" title="일시정지">${G.paused?'▶ 이어 가기':'❚❚ 멈춤'}</button>
    ${[1,2,4].map(s=>`<button class="btn sm ${G.speed===s?'on':''}" data-a="speed" data-v="${s}">${s}×</button>`).join('')}
    <button class="btn sm ${G.auto?'on':''}" data-a="auto" title="선택을 운명에 맡깁니다">${G.auto?'운명에 맡김 켜짐':'운명에 맡김'}</button>
    <button class="btn sm ghost" data-a="music" title="음악">${SET.music?'♪':'♪ 끔'}</button>
    <button class="btn sm ghost" data-a="settings" title="설정">⚙</button>`;
}
function updProg(){const p=$('#prog');if(p&&P)p.style.width=(yearProgress()*100).toFixed(1)+'%';}
function renderMe(){
  if(!P)return;const el=$('#me');if(!el)return;
  const st=P.st;
  const nm=P.female&&(P.cls==='yangban'||P.cls==='royal')?`${P.sur}씨 <span class="muted" style="font-size:.7em">아명 ${esc(P.name)}</span>`:esc(displayName());
  const av=availFoci();
  const fl=av.list;
  el.innerHTML=`<div class="who"><div class="nm">${nm}</div><div class="st">${esc(statusLine())}${P.court&&!P.job?' · 궁':''}</div>
    <div class="meta">${esc(P.bon&&P.cls!=='cheonmin'?P.bon+' '+P.sur+'씨 · ':'')}${esc(P.region)} 출생 · ${P.born}년</div></div>
    <div class="kv"><span>거처</span><span>${esc(P.home)}</span></div>
    <div class="kv"><span>재산</span><span>${money(P.wealth)}</span></div>
    ${P.job?`<div class="kv"><span>직책</span><span>${fmt(jobTitle(P.job))}${curPost()?` · ${esc(curPost().n)}`:''}</span></div>`:''}
    ${jobChoices().list.length?`<div style="text-align:right;margin:2px 0 4px"><button class="btn sm" data-a="jobpick">생업 고르기·바꾸기</button></div>`:(P.age>=8&&jobChoices().why?`<div class="fnote">${esc(jobChoices().why)}</div>`:'')}
    ${P.married&&spouseP()?`<div class="kv"><span>${P.female?(spouseP().kingRole?'임금':'남편'):'아내'}</span><span>${esc(spouseP().title||callOf(spouseP()))}</span></div>`:P.widowed?`<div class="kv"><span>혼인</span><span>${P.female?'과부':'홀아비'}</span></div>`:''}
    ${P.alt?`<div class="kv"><span>역사</span><span style="color:var(--jok)">정사와 다름</span></div>`:''}
    <div class="sec">능력치</div>
    ${STATS.map(([k,n])=>`<div class="bar"><span>${n}</span><span class="t"><i style="width:${st[k]}%"></i></span><span class="n">${Math.round(st[k])}</span></div>`).join('')}
    <div class="bar"><span>재력</span><span class="t"><i style="width:${wealthScore()}%"></i></span><span class="n">${wealthScore()}</span></div><div class="fnote" style="text-align:right;margin-top:-2px">${wealthWord(wealthScore())}</div>
    <div class="fnote">특기: ${esc(P.artK)}</div>
    <div style="margin-top:6px"><button class="btn sm ghost" data-a="stathelp">${SET.statHelp?'▾ 능력치 설명 숨기기':'▸ 능력치마다 무엇에 좋은지 보기'}</button></div>
    ${SET.statHelp?`<div class="stathelp">${[...STATS,['wealth','재력']].map(([k,n])=>`<div><b>${n}</b> ${esc(STAT_HELP[k])}</div>`).join('')}</div>`:''}
    <div class="sec">올해의 중점</div>
    ${fl.length?`<div class="foci">${FOCI.filter(f=>fl.includes(f.k)).map(f=>`<button class="btn ${P.focus===f.k?'on':''}" data-a="focus" data-v="${f.k}" title="${esc(FOCUS_DESC[f.k][0])}">${f.n}</button>`).join('')}</div>
      <div class="focusdesc">${focusNote(P.focus)}</div>
      <div class="fnote">${'언제든 바꿀 수 있고, 바꿔도 세월은 멈추지 않습니다. 이와 별도로 해마다 크고 작은 일을 겪으며 여러 능력치가 무작위로 2~5씩 오르고, 생업에 따라서도 조금씩 오릅니다.'}</div>`:`<div class="fnote">${esc(av.why||'')}</div>`}
    ${P.titles.length?`<div class="sec">지나온 직책</div><div>${P.titles.map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div>`:''}`;
}
const FOCUS_DESC={
  grace:['매력 +5~10','처음 만난 사람에게 호감을 얻기 쉽습니다. 간택과 승은, 시댁 어른과 잘 지내는 데에도 도움이 됩니다.'],
  know:['학식 +5~10','과거 시험에 붙거나, 마음에 둔 사람과 시를 주고받을 때 유리합니다. 상대의 마음과 선택지의 가능성이 또렷이 보이고, 궁중암투와 남장 과거에도 유리합니다.'],
  art:['재주 +5~10 · 특기 솜씨 ↑','노래·춤·그림·바느질 같은 솜씨가 늡니다. 기생·광대·화원·침모로 이름을 떨치려면 꼭 필요합니다.'],
  brave:['무예 +5~10','사랑을 따라 달아나기, 원치 않는 간택 피하기, 의병으로 나서기, 모함에 맞서기처럼 위험한 선택이 잘 풀립니다.'],
  health:['건강 +5~10','병에 덜 걸리고 오래 삽니다. 아이를 낳을 때의 위험도 줄어듭니다.'],
  wealth:['한 해 벌이 ↑','재산이 빨리 모입니다. 장사꾼은 객주로, 농사꾼은 부농으로 오르기 쉽고, 노비라면 돈을 바쳐 신분을 벗을 밑천이 됩니다.'],
  love:['만난 사람들과의 정 ↑','인연 탭의 사람들과 정이 조금씩 깊어집니다. ‘마음에 두기’로 고른 사람이 있으면 그 사람과의 정이 크게 오르고, 함께하는 일도 잘 풀립니다.'],
  power:['학식 조금 ↑ · 세력 ↑','궁이나 조정에서 내 편이 늘어, 역사의 갈림길에서 정사와 다른 길을 열 가능성이 높아집니다. 궁이나 조정 가까이 있을 때만 고를 수 있습니다.'],
  rest:['마음고생 ↓ · 건강 조금 ↑','마음고생이 심하면 해마다 건강이 깎입니다. 마음이 무거울 때 쉬어 가십시오.']
};
const STAT_HELP={
  look:'얼굴과 몸가짐에서 풍기는 매력입니다. 처음 만난 사람의 호감을 크게 좌우하고, 높으면 먼저 다가오는 사람이 생깁니다. 간택·승은·후궁의 총애, 시댁 어른과 잘 지내기에도 도움이 됩니다. 마흔이 넘으면 조금씩 줄어듭니다.',
  know:'글과 학문, 그리고 사람과 세상을 꿰뚫어 보는 눈입니다. 과거 급제, 시 주고받기, 의원·역관·훈장 일에 유리하고, 높을수록 상대의 마음과 선택지의 성공 가능성이 또렷이 보입니다. 궁중암투와 역사의 갈림길, 남장 과거에도 유리합니다.',
  art:'노래·춤·그림·바느질 같은 솜씨입니다. 그런 것을 좋아하는 사람에게 호감을 얻고, 솜씨가 소문나면 먼저 다가오는 사람이 생깁니다. 기생·광대·화원·침모로 출세하려면 꼭 필요합니다.',
  brave:'무예와 배짱입니다. 무과와 검객의 길에 필요하고, 무예를 좋아하는 사람에게 호감을 얻습니다. 달아나기, 간택이나 부모의 뜻 거스르기, 의병, 악연에 맞서기처럼 위험한 선택이 잘 풀립니다.',
  health:'낮으면 병들거나 일찍 세상을 떠나기 쉽습니다. 마흔이 넘으면 해마다 조금씩 줄어들고, 마음고생이 심하면 더 깎이니 건강 돌보기와 놀며 쉬기로 지키십시오.',
  fame:'세상 사람들의 평판입니다. 직접 올릴 수는 없고, 승진·자식 얻기·선행 같은 일과 해마다의 선택으로 오르내립니다. 높으면 간택, 승진, 명기 되기, 혼처 고르기, 열녀문에 유리합니다.',
  wealth:'얼마나 부유하게 사는지입니다. 손에 쥔 재산(돈)만이 아니라 사는 집, 해마다의 벌이, 집안과 배우자 집안의 형세를 두루 따집니다. 재산이 같아도 벌이가 좋고 번듯한 집에 살면 재력이 높습니다.'
};
function focusNote(k){const d=FOCUS_DESC[k];const f=FOCI.find(x=>x.k===k);if(!d||!f)return '';return `<b>${f.n}</b> · ${d[0]}<br>${d[1]}`;}
function stageOf(e){
  const mY=(P.ev.find(x=>x.type==='marry')||{}).y;
  if(e.a<10)return '유년';if(e.a<18)return '소년';if(e.a>=60)return '노년';
  if(mY&&e.y>=mY)return '혼인 후';if(e.a<30)return '혼기';return '장년';
}
function lineHtml(l){
  if(l.c==='note'){const [h,b]=l.t.split('|');return `<details class="ln note"><summary>${esc(h)}</summary><div>${esc(b)}</div></details>`;}
  return `<div class="ln ${l.c}">${fmt(l.t)}</div>`;
}
let feedTimer=0;
function renderFeed(force){
  const el=$('#feed');if(!el||!P)return;
  const near=V.follow!==false;
  const groups=[];let cur=null;
  for(const e of P.feed){const s=stageOf(e);if(!cur||cur.s!==s){cur={s,items:[]};groups.push(cur);}cur.items.push(e);}
  const lastY=P.year;
  let h='';
  if(V.away)h+=awayHtml();
  for(const g of groups){
    const closed=V.stageClosed[g.s];
    h+=`<div class="stage"><div class="sh" data-a="stage" data-v="${g.s}">${closed?'▸':'▾'} ${g.s} <span style="font-weight:400;letter-spacing:0">(${g.items[0].a}–${g.items[g.items.length-1].a}세)</span></div>`;
    if(!closed)for(const e of g.items){
      const def=lastY-e.y<10;const open=V.yearOpen[e.y]!=null?V.yearOpen[e.y]:def;
      const lines=e.lines.filter(l=>l.c!=='chg'||open);
      const sum=e.sum||(e.lines.find(l=>l.c==='n'||l.c==='big')||{}).t||'조용히 한 해가 지났다.';
      h+=`<div class="yr ${e.y===lastY?'cur':''}"><div class="yh" data-a="yr" data-v="${e.y}">${e.big?'<span class="dot"></span>':''}<span class="lab">${esc(e.lab)}</span><span class="gz">${e.gz} · ${e.a}세</span>${open?'':`<span class="sum">${esc(String(sum).replace(/\[\[|\]\]/g,''))}</span>`}${e.lines.some(l=>l.c==='pick')?'<span class="tg">선택</span>':''}</div>`;
      if(open)h+=`<div class="yb">${lines.length?lines.map(lineHtml).join(''):'<div class="ln muted">조용히 한 해가 지났다.</div>'}</div>`;
      h+=`</div>`;
    }
    h+=`</div>`;
  }
  if(G.deathPending)h+=`<div class="deathnext"><div class="serif muted">숨이 점점 가늘어진다. 지난 일들을 천천히 돌아보아도 좋다.</div><button class="btn pri" data-a="todeath">다음 ▶ 마지막 순간으로</button></div>`;
  el.innerHTML=h;
  if(near||force){V._auto=true;el.scrollTop=el.scrollHeight;}
  $('#feedtools').innerHTML=`<span>최근 10년은 펼쳐 두고, 지난 해는 접어 둡니다.</span><span><button class="btn sm ghost" data-a="openall">모두 펼치기</button><button class="btn sm ghost" data-a="closeall">모두 닫기</button></span>`;
}
function awayHtml(){
  const a=V.away;const n=a.n;
  return `<div class="awaycard"><b>그대가 자리를 비운 사이 ${n}년이 흘렀다.</b>${a.lines.length?`<ul>${a.lines.slice(-8).map(l=>`<li>${l.a}세 · ${fmt(l.t)}</li>`).join('')}</ul>`:'<div class="serif muted">큰일 없이 세월이 흘렀다.</div>'}<button class="btn sm" data-a="awayclose">닫기</button></div>`;
}
function renderScene(){
  const box=$('#scene');if(!box)return;
  const s=G.scene;
  if(!s){box.classList.add('hide');box.innerHTML='';return;}
  if(V.mob!=='feed'&&window.innerWidth<=900){V.mob='feed';mobShow();}
  box.classList.remove('hide');
  if(s.kind==='death')Music.want('sad');else if(s.branch||/란$|호란|사화|옥사|환국|악연/.test(s.title))Music.want('tense');
  let cands='';
  if(s.match&&s.cards){cands=`<div class="cands">${s.cards.map(id=>{const x=P.people[id];if(!x)return '';const love=x.kind==='love';
    return `<div class="cand"><b>${esc(callOf(x))}</b><div class="muted" style="font-size:.85em">${esc(fullOf(x))}</div><div>${ageOf(x)}세 · ${esc(CLS[x.cls].n)}</div><div class="muted">${esc(x.fam)}</div>
    <div>성격: ${x.known?esc(persona(x.persona).n):'<span class="muted">알 수 없음</span>'}</div>${love?`<div>정: ${HEART[hLv(x.h)]}</div>`:''}
    <div class="gh" id="gh-${x.id}">${x.gh?esc(x.gh):`<button class="btn sm" data-a="gunghap" data-id="${x.id}">궁합 보기</button>`}</div></div>`;}).join('')}</div>`;}
  const nameOf=s.pid&&P.people[s.pid]?P.people[s.pid]:null;
  box.innerHTML=`<div class="sc"><div class="stop">${s.kind==='death'?'마지막':'세월이 멈추었다'}</div><h3>${esc(s.title)}</h3><div class="tx">${fmt(s.text)}</div>${cands}
    ${s.opts.map((o,i)=>o.input?`<div class="opt"><div class="ot">${esc(o.t)}</div><div style="display:flex;gap:6px;margin-top:6px"><input id="lastIn" maxlength="80" placeholder="남기고 싶은 말을 적어 주십시오" style="flex:1;font:inherit;padding:.4em .6em;border:1px solid var(--line2);border-radius:8px;background:var(--card);color:var(--ink)"><button class="btn sm pri" data-a="optin" data-i="${i}">남긴다</button></div></div>`:`<button class="opt" data-a="opt" data-i="${i}" ${o.dis?'disabled':''}><div class="ot">${esc(o.t)}${o.p!=null&&!o.dis?`<span class="odds ${oddsCls(o)}">가능성 ${oddsW(o)}</span>`:''}</div>${o.sub?`<div class="os">${esc(o.sub)}</div>`:''}${o.tags&&o.tags.length?`<div class="meta">${o.tags.map(t=>`<span class="chip ${/위태|사약|목숨|소박|이혼|무너|큰 죄|들키면/.test(t)?'b':/신분|역사|재산 ↑|평판 ↑|면천/.test(t)?'j':''}">${esc(t)}</span>`).join('')}</div>`:''}</button>`).join('')}
    ${s.kind!=='death'?`<div class="fate"><button class="btn sm" data-a="fate">운명에 맡긴다</button></div>`:''}</div>`;
}
function oddsW(o){if(o._w)return o._w;o._w=oddsWord(o.p);return o._w;}
function oddsCls(o){return oddsW(o)==='알 수 없음'?'u':'';}

/* ---- 오른쪽 ---- */
function renderSide(){
  const el=$('#side');if(!el||!P)return;
  const tabs=[['love','인연'],['fam','가족'],['tl','연표'],['let','서찰']];
  let body='';
  if(V.tab==='love')body=sideLove();else if(V.tab==='fam')body=sideFam();else if(V.tab==='tl')body=sideTl();else body=sideLet();
  el.innerHTML=`<div class="tabs">${tabs.map(([k,n])=>`<button class="btn ${V.tab===k?'on':''}" data-a="tab" data-v="${k}">${n}</button>`).join('')}</div>${body}`;
}
function fertileWith(x){
  if(!x||!x.alive||P.eunuch)return 0;
  if(x.kind==='spouse')return x.id===P.spouse?fertile():0;
  if(x.kind!=='cheop'||x.female===P.female)return 0;
  const fa=P.female?P.age:ageOf(x);if(fa<18||fa>44)return 0;
  return fa<30?.42:fa<36?.3:.16;
}
function pregOf(x){return x.kind==='cheop'?(P.cpreg&&P.cpreg[x.id]):P.preg&&!P.preg.unwed?P.preg:null;}
function kidBtns(x){
  if(!fertileWith(x))return '';
  if(pregOf(x))return `<div class="fnote" style="margin-top:6px">뱃속에 아이가 있습니다.</div>`;
  const tried=(P.kidTryY||{})[x.id]===P.year;
  return `<div style="margin-top:6px"><button class="btn sm" data-a="trykid" data-id="${x.id}" ${tried?'disabled':''}>${tried?'올해는 이미 애썼습니다':'아이 갖기'}</button>${P.wantKids&&x.kind==='spouse'?' <button class="btn sm ghost" data-a="stopkid">그만 낳기</button>':''}</div>`;
}
function sideLove(){
  const F=[['love','인연'],['rival','악연'],['helper','조력자'],['elder','집안 어른']];
  const all=Object.values(P.people);
  let list=[];
  if(V.filter==='love')list=all.filter(x=>['love','spouse','ex','cheop'].includes(x.kind)||x.kind==='friend');
  else if(V.filter==='rival')list=all.filter(x=>x.kind==='rival');
  else if(V.filter==='helper')list=all.filter(x=>x.kind==='helper');
  else list=all.filter(x=>x.kind==='elder');
  /* 처 → 첩 → 마음 깊은 순 (세상을 떠났거나 끊긴 인연은 뒤로) */
  const ord=x=>(x.alive?0:20)+(x.status==='parted'||x.kind==='ex'?10:0)+(x.kind==='spouse'?0:x.kind==='cheop'?1:2);
  list.sort((a,b)=>ord(a)-ord(b)||b.h-a.h||b.t-a.t);
  const card=x=>{
    const badge=x.kind==='spouse'?(x.alive?(P.female?(x.kingRole?'임금':'남편'):'아내'):'세상을 떠난 배우자'):x.kind==='ex'?'헤어진 배우자':x.kind==='friend'?'어릴 적 벗':x.kind==='rival'?(x.note||'악연'):x.kind==='helper'?x.role:x.kind==='elder'?x.title:x.kind==='cheop'?'첩':{acq:'아는 사이',crush:'짝사랑',their:'그가 연모함',mutual:'서로 연모',lover:'정인',parted:'인연이 끊김',betrothed:'정혼'}[x.status]||'';
    const off=!x.alive||x.status==='parted';
    const blur=!x.known&&P.st.wit<30;
    const nm=x.title&&x.kind!=='rival'?x.title:callOf(x);
    let bars='';
    if(x.kind==='rival')bars=x.crushed?`<div class="fnote">${/화해/.test(x.note||'')?'묵은 감정을 풀었다.':'기세가 꺾여 다시는 그대를 넘보지 못한다.'}</div>`:`<div class="hb r"><span>원한</span><span class="t"><i style="width:${x.grudge}%"></i></span><span>${GRUDGE[hLv(x.grudge)]}</span></div><div class="hb"><span>기세</span><span class="t"><i style="width:${x.power==null?70:x.power}%"></i></span><span>${x.power==null?70:x.power}</span></div>`;
    else if(x.kind==='elder')bars=`<div class="hb"><span>사이</span><span class="t"><i style="width:${x.rel}%"></i></span><span>${x.rel>70?'두터움':x.rel>40?'무난':'싸늘함'}</span></div>`;
    else bars=`<div class="hb"><span>내 마음</span><span class="t"><i style="width:${x.h}%"></i></span><span>${HEART[hLv(x.h)]}</span></div><div class="hb"><span>그의 마음</span><span class="t ${blur?'blur':''}"><i style="width:${x.t}%"></i></span><span>${blur?'알 수 없음':HEART[hLv(x.t)]}</span></div>`;
    const open=V.openCard===x.id;
    let more='';
    if(open){const lt=P.letters.filter(l=>l.pid===x.id);
      more=`<div class="more">${x.alive?`${ageOf(x)}세`:'세상을 떠남'} · ${esc(CLS[x.cls]?CLS[x.cls].n:'')} · ${esc(x.fam||'')}<br>${x.metA!=null?`${x.metA}세에 ${esc(x.place||'')}에서 만남<br>`:''}${x.known?`성격: ${esc(persona(x.persona).n)} · 좋아하는 것: ${esc(taste(x.taste).n)}`:'성격과 취향은 아직 알 수 없다.'}${x.gh?`<br>궁합: ${esc(x.gh)}`:''}${lt.length?`<br>주고받은 서찰 ${lt.length}통`:''}</div>`;}
    const isT=P.target===x.id;
    const canT=x.alive&&P.age>=18&&!P.flags.sujeol&&(x.kind==='love'&&x.status!=='parted'||x.kind==='cheop');
    const age=x.alive?` · ${ageOf(x)}세`:'';
    return `<div class="pc ${off?'off':''} ${isT?'tgt':''}" data-a="card" data-id="${x.id}"><div class="h"><b>${esc(nm)}${isT?' <span class="chip j">마음에 둔 사람</span>':''}</b><span class="chip ${x.status==='mutual'||x.status==='lover'||x.kind==='spouse'?'j':''}">${esc(badge)}</span></div><div class="m">${esc(fullOf(x))}${age}</div>${x.kind!=='elder'?`<div class="info">${esc(personInfo(x))}</div>`:''}${bars}${canT?`<div style="margin-top:6px"><button class="btn sm ${isT?'on':''}" data-a="target" data-id="${x.id}">${isT?'마음 거두기':'마음에 두기'}</button>${x.kind==='love'&&sameClan(x)?' <span class="fnote">같은 본관이라 혼인할 수 없습니다(동성동본 금혼).</span>':''}${x.kind==='love'&&(!P.married||!P.female)&&!(P.job&&['concubine','queen'].includes(P.job.k))&&canWed(x)&&x.blocked!==P.year?` <button class="btn sm" data-a="propose" data-id="${x.id}">${P.married?'첩으로 들이기':'청혼하기'}</button>`:''}</div>`:''}${(x.kind==='spouse'&&x.id===P.spouse||x.kind==='cheop')&&x.alive?kidBtns(x):''}${x.kind==='spouse'&&x.id===P.spouse&&x.alive&&!x.kingRole&&P.age>=18?`<div style="margin-top:6px"><button class="btn sm ghost" data-a="divorce" ${P.flags.divorceAsk===P.year?'disabled':''}>${P.female?'갈라서기':'소박 놓기'}</button></div>`:''}${more}</div>`;
  };
  const canSeek=P.age>=18;
  const seekWarn=P.job&&['concubine','queen'].includes(P.job.k)?'임금의 여인이 다른 이를 만나는 것은 큰 죄입니다. 들키면 목숨이 위태로울 수 있습니다.':P.court?'궁녀의 연정은 큰 죄입니다. 들키면 궁에서 쫓겨날 수 있습니다.':P.married?'혼인한 몸입니다. 들키면 평판이 무너지거나 소박을 맞을 수 있습니다.':'';
  const seekWait=P.lastSeek&&P.year-P.lastSeek<1;
  const seek=V.filter==='love'&&P.flags.sujeol?`<div class="seek"><div class="fnote" style="margin:0">수절하는 몸이라 새 인연을 찾지 않습니다.</div></div>`:V.filter==='love'&&!canSeek?`<div class="seek"><div class="fnote" style="margin:0">열여덟 살이 되면 새 인연을 찾아 나설 수 있습니다.</div></div>`:V.filter==='love'&&canSeek?`<div class="seek"><div class="sec" style="margin-top:0">새 인연 찾아 나서기</div>${seekWait?'<div class="fnote">올해는 이미 인연을 찾아 나섰다. 해가 바뀌면 다시 나설 수 있다.</div>':`<div class="foci"><button class="btn sm" data-a="seek" data-v="royal">종친</button><button class="btn sm" data-a="seek" data-v="direct">왕실 직계</button><button class="btn sm" data-a="seek" data-v="yangban">양반</button><button class="btn sm" data-a="seek" data-v="common">평민</button><button class="btn sm" data-a="seek" data-v="cheonmin">천민</button></div>${seekWarn?`<div class="fnote" style="color:var(--bad)">${seekWarn}</div>`:''}<div class="fnote">마음에 드는 사람이 없으면, 어느 신분의 사람을 만나러 갈지 고르십시오. 누구를 만날지는 운에 달렸습니다. 한 해에 한 번 나설 수 있고, 세월은 멈추지 않습니다.</div>`}</div>`:'';
  return `${seek}<div class="filters">${F.map(([k,n])=>`<button class="btn sm ${V.filter===k?'on':''}" data-a="filter" data-v="${k}">${n}</button>`).join('')}</div>
    ${list.length?list.map(card).join(''):`<div class="muted serif" style="font-size:.9em">${V.filter==='love'?(P.age<18?'열여덟이 되면 인연이 찾아옵니다. 지금은 벗과 어울릴 나이입니다.':'아직 마음에 둔 이가 없다.'):'아직 없다.'}</div>`}
    ${V.filter==='love'?'<div class="fnote">마음이 가는 사람에게 <b>마음에 두기</b>를 눌러 두면, 두어 해에 한 번 그 사람과의 일이 찾아오고 ‘인연 돌보기’ 중점도 그 사람에게 몰아서 오릅니다. 정하지 않으면 드물게 무작위로 찾아옵니다. 학식이 높으면 상대의 마음이 또렷이 보입니다.</div>':''}`;
}
function sideFam(){
  const row=(name,rel,meta,cls='')=>`<div class="fm ${cls}"><div class="fn">${esc(name)}</div><div class="fr">${esc(rel)}</div>${meta?`<div class="fx">${esc(meta)}</div>`:''}</div>`;
  const grp=(t,inner,sub)=>inner?`<div class="fg"><div class="fgh">${t}${sub?`<span>${sub}</span>`:''}</div>${inner}</div>`:'';
  const dead=x=>x.alive?'':'dead';const ded=x=>x.alive?'':'故 ';
  const pa=P.parents;let h='<div class="fam">';
  if(P.ancestor)h+=`<div class="anc" style="margin-bottom:8px">${P.ancestor.gens}대조: 지난 삶의 ${esc(P.ancestor.name)}</div>`;
  /* 웃어른 */
  let up=row(pa.f.name,ded(pa.f)+'아버지',[pa.f.job,pa.f.alive?(pa.f.age+P.age)+'세':''].filter(Boolean).join(' · '),dead(pa.f))
        +row(pa.m.name,ded(pa.m)+'어머니',[pa.m.job,pa.m.alive?(pa.m.age+P.age)+'세':''].filter(Boolean).join(' · '),dead(pa.m));
  const el=P.elder&&P.people[P.elder];if(el)up+=row(el.title||callOf(el),ded(el)+(P.female?'시댁 어른':'처가 어른'),el.alive&&el.rel!=null?'사이 '+relWord(el.rel):'',dead(el));
  h+=grp('웃어른',up,pa.f.alive||pa.m.alive?'부모와 사이 '+relWord(P.parentRel==null?60:P.parentRel):'');
  /* 형제자매 */
  const sibs=P.sibs.filter(s=>P.age+s.off>=0).sort((x,y)=>y.off-x.off);
  let sb='';let meDone=false;
  for(const s of sibs){if(!s.older&&!meDone){sb+=row(displayName(),'나',P.age+'세','me');meDone=true;}
    sb+=row(s.name,ded(s)+sibWord(s),[s.alive?(P.age+s.off)+'세':'',s.married?'혼인':''].filter(Boolean).join(' · '),dead(s));}
  if(!meDone)sb+=row(displayName(),'나',P.age+'세','me');
  h+=grp('형제자매',sb,sibs.length?'':'외동');
  /* 배우자와 첩 */
  const sp=Object.values(P.people).filter(x=>['spouse','ex','cheop'].includes(x.kind)||x.kind==='rival'&&/첩/.test(x.title||''));
  const ord=x=>x.kind==='spouse'?0:x.kind==='cheop'?1:x.kind==='rival'?2:3;
  sp.sort((x,y)=>ord(x)-ord(y));
  const spRel=x=>{
    if(x.kind==='ex')return '헤어진 배우자';
    if(x.kind==='cheop')return '첩';
    if(x.kind==='rival')return '남편의 첩';
    if(x.kingRole)return '임금';
    if(P.sub==='cheop'&&P.female)return '남편 (나는 부실)';
    if(x.mode==='cheop')return '첩';
    return P.female?'남편':'아내';};
  const spMeta=x=>[x.alive?ageOf(x)+'세':'',x.kind==='spouse'&&x.alive&&x.h!=null?'정 '+hLvWord(x):'',x.kind==='rival'?'악연':'',x.fam&&!x.real?x.fam:''].filter(Boolean).join(' · ');
  h+=grp(P.female?'배우자':'배우자와 첩',sp.map(x=>row(x.title&&x.kind!=='rival'?x.title:callOf(x),ded(x)+spRel(x),spMeta(x),dead(x))).join(''));
  /* 자식 */
  if(P.kids.length){
    const kd=P.kids.map(k=>{const a=P.year-k.born;const st=kidSt(k);
      const base=row(k.name,ded(k)+(k.female?'딸':'아들')+(k.adopted?(k.female?' (양녀)':' (양자)'):'')+(k.seo?' (서출)':'')+(k.cls&&k.cls!==P.cls?' · '+CLS[k.cls].n:'')+(k.estranged?' · 의절':'')+(k.away?' · 따로 자람':'')+(k.alive&&P.livesWith===k.id?' · 노년을 함께 삶':k.alive&&k.home==='with'?' · 한집에 삶':k.alive&&k.home==='apart'?' · 분가':''),[k.alive?a+'세':'',otherParent(k),k.feat||'',k.married?(k.inlaw?'사돈 '+k.inlaw:'혼인'):''].filter(Boolean).join(' · '),dead(k));
      if(!k.alive)return base;
      const stl=`<div class="kst">${KID_ST.map(([s,n])=>`<span>${n} <b>${st[s]}</b></span>`).join('')}</div>`;
      const sel=a>=6&&a<18?`<div class="kedu"><span>배움</span><select data-kedu="${k.id}">${Object.entries(EDU).map(([key,[n]])=>`<option value="${key}" ${(k.edu||'play')===key?'selected':''}>${n}</option>`).join('')}</select></div>`:a<6?'<div class="kedu muted">여섯 살이 되면 배울 것을 정할 수 있습니다.</div>':'';
      return base.replace(/<\/div>$/,stl+sel+'</div>');}).join('');
    const alive=P.kids.filter(k=>k.alive).length;
    h+=grp('자식',kd,`${P.kids.length}명${alive<P.kids.length?` · 살아 있는 이 ${alive}명`:''}`);
  }
  const pgs=[...(P.preg?[[P.preg,P.female?'나'+(P.preg.father&&P.preg.father!==P.spouse&&P.people[P.preg.father]?` (${callOf(P.people[P.preg.father])}의 아이)`:''):(P.preg.mother&&P.preg.mother!==P.spouse&&P.people[P.preg.mother]?callOf(P.people[P.preg.mother]):'아내')]]:[]),...Object.entries(P.cpreg||{}).map(([id,pr])=>[pr,P.people[id]?callOf(P.people[id]):'첩'])];
  if(pgs.length)h+=grp('뱃속의 아이',pgs.map(([pr,who])=>row(who,'태몽 · '+pr.dream,pr.guess?pr.guess+'일 것이라 한다':'')).join(''));
  if(P.grand)h+=grp('손주',row(P.grand+'명','손주',''));
  return h+'</div>';
}
function hLvWord(x){const v=(x.h+x.t)/2;return v>=80?'깊음':v>=55?'도타움':v>=35?'그럭저럭':'소원함';}
function sideTl(){
  let h='<div class="tl">';let lastK='';
  const evText=e=>{const x=P.people[e.t];switch(e.type){case 'birth':return '태어남';case 'meet':return x?`${eulreul(callOf(x))} 만남`:'인연';case 'mutual':return x?`${gwawa(callOf(x))} 서로 연모`:'';case 'marry':return x?`${gwawa(x.title||callOf(x))} 혼인`:'혼인';case 'child':return `${e.female?'딸':'아들'} ${e.t} 출생`;case 'kidloss':return `${eulreul(e.t)} 잃음`;case 'widow':return '배우자를 여읨';case 'job':return e.t;case 'freed':return e.t;case 'exile':return '유배';case 'war':return e.t;case 'branch':return '역사를 바꿈';case 'rare':return '드문 일';case 'adopt':return `${e.t} 입양`;case 'kidwed':return `${e.t} 혼인`;case 'loss':return e.t;case 'court':return e.t;case 'parted':return '인연이 끊김';case 'lover':return '정인이 됨';case 'elope':return '함께 달아남';case 'sobak':return '소박';case 'cheop':return '첩을 들임';default:return '';}};
  const byY={};
  for(const e of P.ev){const t=evText(e);if(t)(byY[e.y]=byY[e.y]||{me:[],na:''}).me.push(t);}
  for(let y=P.born;y<=P.year;y++){if(NEWS[y]&&!(P.alt&&y>P.alt.year))(byY[y]=byY[y]||{me:[],na:''}).na=NEWS[y];}
  const ys=Object.keys(byY).map(Number).sort((a,b)=>a-b);
  for(const y of ys){const k=kingAt(y,P).n;if(k!==lastK){h+=`<div class="k">${esc(k)}${kingAt(y,P).alt?' · 이 판의 임금':''}</div>`;lastK=k;}
    const r=byY[y];const isAlt=P.alt&&y===P.alt.year;
    h+=`<div class="r ${isAlt?'alt':''}"><span class="y">${y}</span><span>${esc(r.me.join(', '))}</span><span class="na">${isAlt?'여기서 역사가 갈라졌다':esc(r.na.replace(/\(.*?\)/g,'').slice(0,40))}</span></div>`;}
  if(P.alt){const b=BRANCHES.find(x=>x.id===P.alt.id);h+=`<div class="fnote" style="margin-top:10px"><b>정사에서는:</b> ${esc(b?b.realLine:'')}</div>`;}
  return h+'</div>';
}
function sideLet(){
  if(!P.letters.length)return '<div class="muted serif" style="font-size:.9em">아직 주고받은 서찰이 없다. 인연에게 서찰을 보내거나 시를 주고받으면 이곳에 남는다.</div>';
  return P.letters.slice().reverse().map(l=>`<div class="lt" data-a="letter" data-id="${l.id}"><div class="m">${l.y}년 · ${esc(l.from)} → ${esc(l.to)}${l.poem?' · 시':''}</div>${esc(l.text.split('\n')[0].slice(0,40))}…</div>`).join('');
}
function showLetter(id){const l=P.letters.find(x=>x.id===id);if(!l)return;modal(`<div class="m muted" style="margin-bottom:8px">${l.y}년 · ${esc(iga(l.from))} ${esc(l.to)}에게</div><div class="letter">${esc(l.text)}</div><div class="rowbtns"><button class="btn" data-a="close">접는다</button></div>`);}
function showGuide(){modal(`<div class="guide"><h3>처음 오신 그대에게</h3><ol>
  <li>세월은 저절로 흐릅니다. 혼인, 인연, 역사의 갈림길처럼 <b>중요한 순간에만 멈춥니다.</b></li>
  <li>왼쪽의 <b>올해의 중점</b>은 언제든 바꿀 수 있고, 바꿔도 세월은 멈추지 않습니다.</li>
  <li>선택지에는 <b>가능성</b>과 <b>바뀌는 것</b>이 표시됩니다. 학식이 낮으면 가능성이 흐릿하게 보입니다.</li>
  <li>오른쪽 <b>인연</b> 탭에서 사람마다 쌓인 정을 볼 수 있습니다. 마음이 가는 사람에게 <b>마음에 두기</b>를 눌러 두면 두어 해에 한 번 그 사람과의 일이 찾아옵니다.</li>
  <li>점선 밑줄이 그어진 말을 누르면 풀이가 나옵니다. 선택은 되돌릴 수 없습니다.</li></ol>
  <div class="rowbtns"><button class="btn pri" data-a="close">알겠소</button></div></div>`);}
function showJobs(){
  const c=jobChoices();const wait=P.lastJobChange&&P.year-P.lastJobChange<3;
  modal(`<h3>생업 고르기</h3><p class="serif muted" style="font-size:.9em">지금: ${P.job?esc(jobTitle(P.job)):'정한 생업이 없음'}. 생업을 바꾸면 그 길의 첫 자리부터 다시 시작합니다.${wait?' 생업을 바꾼 지 세 해가 지나지 않아 아직 바꿀 수 없습니다.':''}</p>
  ${c.list.map(k=>`<button class="opt" data-a="jobset" data-v="${k}" ${wait||(P.job&&P.job.k===k)?'disabled':''}><div class="ot">${esc(JOB_DESC[k][0])}${P.job&&P.job.k===k?' <span class="odds">지금 하는 일</span>':''}</div><div class="os">${esc(JOB_DESC[k][1])}</div><div class="meta"><span class="chip">${esc(JOBS[k].ladder.join(' → '))}</span>${(JOB_TAGS[k]||[]).map(t=>`<span class="chip b">${esc(t)}</span>`).join('')}</div></button>`).join('')}
  <div class="rowbtns"><button class="btn" data-a="close">닫기</button></div>`);
}
function showSettings(){
  modal(`<h3>설정</h3>
  <div class="kv"><span>음악</span><span><button class="btn sm ${SET.music?'on':''}" data-a="music">${SET.music?'켜짐':'꺼짐'}</button></span></div>
  <div class="kv"><span>글자 크기</span><span>${[0,1,2].map(i=>`<button class="btn sm ${SET.font===i?'on':''}" data-a="fontset" data-v="${i}">${['작게','보통','크게'][i]}</button>`).join('')}</span></div>
  <div class="kv"><span>화면</span><span><button class="btn sm ${!SET.dark?'on':''}" data-a="darkset" data-v="0">밝게</button><button class="btn sm ${SET.dark?'on':''}" data-a="darkset" data-v="1">어둡게</button></span></div>
  <div class="kv"><span>한 해의 길이</span><span>${['short','normal','long'].map(k=>`<button class="btn sm ${SET.len===k?'on':''}" data-a="lenset" data-v="${k}">${{short:'짧게',normal:'보통',long:'길게'}[k]}</button>`).join('')}</span></div><div class="fnote">${lenNote(SET.len)}</div>
  <div class="kv" style="margin-top:14px"><span>안내</span><span><button class="btn sm" data-a="guideagain">처음 안내 다시 보기</button></span></div>
  <div class="kv" style="margin-top:14px"><span>기록</span><span><button class="btn sm" data-a="wipe">모든 기록 지우기</button></span></div>
  <div class="rowbtns"><button class="btn pri" data-a="close">닫기</button></div>`);
}
function showTerm(el){
  const k=el.dataset.term;const d=termDesc(k);if(!d)return;
  document.querySelectorAll('.pop').forEach(x=>x.remove());
  const p=document.createElement('div');p.className='pop';p.innerHTML=`<b>${esc(k)}</b> <span class="muted">· ${esc(d[0])}</span><br>${esc(d[1])}`;
  document.body.appendChild(p);const r=el.getBoundingClientRect();
  let x=r.left,y=r.bottom+6;if(x+310>window.innerWidth)x=window.innerWidth-316;if(y+120>window.innerHeight)y=r.top-p.offsetHeight-6;
  p.style.left=Math.max(6,x)+'px';p.style.top=Math.max(6,y)+'px';
}

/* ===== 실록 ===== */
function UIend(h){
  Music.want('sad');V.lastEnd=h;
  setTimeout(()=>renderSillok(h,true),900);
}
function renderSillok(h,fresh){
  V.screen='end';V.viewing=h;const sl=h.sillok;
  let newc='';
  if(fresh&&V.codexBefore){const cx=Store.codex(),b=V.codexBefore;const add=[];
    for(const cat of ['cls','titles','kings','branches','rare','post','rise','scene'])for(const k in (cx[cat]||{}))if(!(b[cat]||{})[k])add.push(codexLabel(cat,k));
    if(add.length)newc=`<div class="newcodex"><div class="sec">이번 삶에서 새로 채운 도감</div>${add.slice(0,30).map(t=>`<span class="chip j">${esc(t)}</span>`).join('')}</div>`;}
  $('#app').innerHTML=`<div id="scr-end">
    <div class="sillok" id="sillokBox"><div class="stamp">實錄</div><h2>${esc(sl.title)}</h2><div class="ep">${esc(sl.epithet)}</div>
    <div class="mt">${esc(sl.origin)} · ${sl.born}–${sl.death} · ${h.closed?'실록이 닫힘':'향년 '+sl.age+'세'}</div>
    ${sl.sections.map(s=>`<div class="s ${s.alt?'alt':''} ${s.verdict?'v':''}"><h4>${esc(s.h)}</h4><p>${fmt(s.b)}</p></div>`).join('')}
    ${sl.letter?`<div class="s"><h4>남은 서찰</h4><div class="lttr">${esc(sl.letter.text)}</div><div class="muted" style="font-size:.8em;text-align:right">— ${esc(sl.letter.from)}${sl.letter.from==='그대'?'가 남긴 글':'의 글'}, ${sl.letter.y}년</div></div>`:''}
    </div>${lifeLog(h)}${newc}
    <div class="rowbtns" style="margin-top:22px">
      <button class="btn" data-a="saveimg">이미지로 저장</button>${!window.claude&&navigator.canShare?'<button class="btn" data-a="shareimg">이미지 공유</button>':''}
      <button class="btn" data-a="copytext">글로 복사</button>
      <button class="btn pri" data-a="new">새로운 삶</button>
      <button class="btn" data-a="title">처음으로</button>
    </div>
    <div class="fnote" style="text-align:center;max-width:560px">${window.claude?'휴대폰의 Claude 앱에서는 이미지로 저장할 때 공유 창이 열려 카카오톡 등으로 바로 보낼 수 있습니다.':'휴대폰에서 저장이 잘 안 되면 ‘이미지 공유’를 눌러 사진첩에 저장하거나 카카오톡으로 보낼 수 있습니다.'}</div>
  </div>`;
  window.scrollTo(0,0);
}
async function saveImage(sl,mode){
  try{await document.fonts.load("100px 'Yeon Sung'",'조선연애실록'+(P&&P.name||''));await document.fonts.ready;}catch(e){}
  const W=1080,pad=96,cw=W-pad*2;
  const c=document.createElement('canvas');const x=c.getContext('2d');
  const body="34px 'Noto Serif KR', serif",head="bold 28px 'Noto Sans KR', sans-serif";
  const wrap=(t,font,max)=>{x.font=font;const out=[];for(const para of String(t).replace(/\[\[|\]\]/g,'').split('\n')){let line='';for(const ch of para){const tl=line+ch;if(x.measureText(tl).width>max&&line){out.push(line);line=ch;}else line=tl;}out.push(line);}return out;};
  const blocks=[];
  for(const s of sl.sections)blocks.push({h:s.h,lines:wrap(s.b,body,cw)});
  if(sl.letter)blocks.push({h:'남은 서찰',lines:wrap(sl.letter.text,body,cw-30),letter:true});
  let H=pad+130+60+50+40;for(const b of blocks)H+=50+b.lines.length*58+30;H+=110;
  c.width=W;c.height=H;
  x.fillStyle='#f6efdc';x.fillRect(0,0,W,H);
  x.strokeStyle='rgba(45,74,124,.55)';x.lineWidth=2;x.strokeRect(34,34,W-68,H-68);x.lineWidth=1;x.strokeRect(46,46,W-92,H-92);
  x.fillStyle='#2b241b';x.textAlign='center';x.font="100px 'Yeon Sung', cursive";x.fillText(sl.title,W/2,pad+100);
  x.font="bold 34px 'Noto Serif KR', serif";x.fillStyle='#2d4a7c';x.fillText(sl.epithet,W/2,pad+170);
  x.font="26px 'Noto Sans KR', sans-serif";x.fillStyle='#7b7163';x.fillText(`${sl.origin} · ${sl.born}–${sl.death} · 향년 ${sl.age}세`,W/2,pad+215);
  let y=pad+290;x.textAlign='left';
  for(const b of blocks){x.font=head;x.fillStyle='#2d4a7c';x.fillText(b.h,pad,y);y+=50;
    x.font=body;x.fillStyle='#2b241b';
    if(b.letter){x.fillStyle='rgba(45,74,124,.08)';x.fillRect(pad,y-38,cw,b.lines.length*58+20);x.fillStyle='#2d4a7c';x.fillRect(pad,y-38,5,b.lines.length*58+20);x.fillStyle='#2b241b';}
    for(const l of b.lines){x.fillText(l,pad+(b.letter?26:0),y);y+=58;}y+=30;}
  x.textAlign='center';x.font="44px 'Yeon Sung', cursive";x.fillStyle='#7b7163';x.fillText('조선 연애실록',W/2,H-70);
  const blob=await new Promise(r=>c.toBlob(r,'image/png'));
  let dl=null;try{dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null;}catch(e){}
  const showImg=()=>{const url=c.toDataURL('image/png');modal(`<h3>연애실록 이미지</h3><p class="serif muted" style="font-size:.9em">아래 그림을 <b>길게 눌러</b> ‘이미지 다운로드’나 ‘이미지 공유’를 고르십시오. 그래도 안 되면 화면을 캡처해 주십시오.</p><img src="${url}" alt="${esc(sl.title)}" style="width:100%;border:1px solid var(--line2);border-radius:6px"><div class="rowbtns"><button class="btn" data-a="close">닫기</button></div>`);};
  if(!dl){
    if(!window.claude){
      const file=new File([blob],`${sl.title}.png`,{type:'image/png'});
      if(mode==='share'){try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:sl.title});return;}}catch(e){if(e&&e.name==='AbortError')return;}}
      try{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${sl.title}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);toast('이미지를 저장했습니다.');return;}catch(e){}
    }
    showImg();return;}
  try{await dl.save({filename:`${sl.title}.png`,data:blob});}catch(e){if(e&&e.code==='declined')return;showImg();}
}

/* ===== 도감 ===== */
const CLS_KEYS=[['royal','왕족'],['yangban','양반'],['seo','서얼'],['jungin','중인'],['sangmin','상민'],['nobi','노비'],['gisaeng','관기의 딸'],['gwangdae','광대']];
const RARES=[['namjang','남장한 급제자'],['amhaeng','암행어사가 된 정인'],['gisaeng2lady','기녀에서 정경부인으로'],['descendant','전생의 후손으로 태어남']];
function allTitles(){const s=new Set();for(const k in JOBS)JOBS[k].ladder.forEach(t=>s.add(t));['부실','폐세자빈','임금의 어머니','열녀'].forEach(t=>s.add(t));Object.values(COURT_DEPT).forEach(([n])=>{s.add(n+' 나인');s.add(n+' 상궁');});s.add('부제조상궁');return [...s];}
function codexLabel(cat,k){if(['post','rise','scene'].includes(cat)){const f=bookList(cat).find(x=>x[0]===k);return f?f[1]:k;}if(cat==='cls')return (CLS_KEYS.find(x=>x[0]===k)||[0,k])[1];if(cat==='branches')return (BRANCHES.find(b=>b.id===k)||{}).title||k;if(cat==='rare')return (RARES.find(x=>x[0]===k)||[0,k])[1];return k;}
function renderCodex(){
  V.screen='codex';const cx=Store.codex();
  const tabs=[['cls','신분'],['titles','직책'],['post','진로'],['rise','신분의 길'],['scene','삶의 장면'],['kings','임금의 시대'],['branches','역사의 갈림길'],['rare','드문 일'],['notes','역사 노트']];
  let items=[];
  if(['post','rise','scene'].includes(V.codexTab))items=bookList(V.codexTab).map(([k,n])=>[n,!!(cx[V.codexTab]&&cx[V.codexTab][k])]);
  if(V.codexTab==='cls')items=CLS_KEYS.map(([k,n])=>[n,!!cx.cls[k]]);
  if(V.codexTab==='titles')items=allTitles().map(t=>[t,!!cx.titles[t]]);
  if(V.codexTab==='kings')items=KINGS.map(k=>[(k.g?'고려 ':'')+k.n,!!cx.kings[k.n]]);
  if(V.codexTab==='branches')items=BRANCHES.map(b=>[`${b.title} (${b.year})`,!!cx.branches[b.id]]);
  if(V.codexTab==='rare')items=RARES.map(([k,n])=>[n,!!cx.rare[k]]);
  if(V.codexTab==='notes')items=Object.entries(NOTES).map(([k,v])=>[v[0],!!cx.notes[k],k]);
  const got=items.filter(i=>i[1]).length;
  $('#app').innerHTML=`<div class="page"><button class="btn sm back" data-a="title">← 처음으로</button><h2>인생 도감</h2>
    <div class="tabs">${tabs.map(([k,n])=>`<button class="btn ${V.codexTab===k?'on':''}" data-a="cxtab" data-v="${k}">${n}</button>`).join('')}</div>
    <div class="pct">${got} / ${items.length} 채움</div>
    <div class="cxgrid">${items.map(([n,ok,k])=>`<div class="cx ${ok?'':'off'} ${V.codexTab==='notes'&&ok?'clk':''}" ${V.codexTab==='notes'&&ok?`data-a="readnote" data-v="${k}"`:''}>${ok||V.codexTab==='kings'||V.codexTab==='branches'?esc(n):'?'}</div>`).join('')}</div>
    ${V.codexTab==='branches'?'<p class="fnote">역사의 갈림길에서 정사와 다른 길을 연 적이 있으면 진하게 채워집니다.</p>':''}
    ${V.codexTab==='kings'?'<p class="fnote">그 임금의 치세를 한 번이라도 살아 보면 진하게 채워집니다.</p>':''}
  </div>`;
}
function renderPast(){
  V.screen='past';const hist=Store.hist();
  $('#app').innerHTML=`<div class="page"><button class="btn sm back" data-a="title">← 처음으로</button><h2>지난 삶</h2>
    ${hist.length?hist.map(pastRow).join(''):'<p class="muted serif">아직 살아 본 삶이 없습니다.</p>'}</div>`;
}
async function renderTransfer(){
  V.screen='transfer';
  const code=await makeCode();
  $('#app').innerHTML=`<div class="page"><button class="btn sm back" data-a="title">← 처음으로</button><h2>기록 옮기기</h2>
    <p class="serif">기록은 이 기기의 브라우저에만 저장됩니다. 다른 기기나 브라우저로 옮기려면 아래 <b>옮기기 코드</b>를 복사해서, 옮길 곳의 이 화면에 붙여 넣으십시오. 이미 있던 기록과는 합쳐집니다.</p>
    ${Cloud.on?'<p class="cloudnote" style="text-align:left">Claude 계정에 로그인되어 있어, 같은 계정으로 들어오면 기록이 저절로 이어집니다.</p>':''}
    <div class="sec">이 기기의 옮기기 코드</div><textarea id="codeOut" readonly>${esc(code)}</textarea>
    <div class="rowbtns" style="justify-content:flex-start"><button class="btn" data-a="copycode">코드 복사</button><button class="btn" data-a="savecode">파일로 저장</button></div>
    <div class="sec" style="margin-top:22px">다른 기기의 코드 붙여 넣기</div><textarea id="codeIn" placeholder="옮기기 코드를 여기에 붙여 넣으십시오"></textarea>
    <div class="rowbtns" style="justify-content:flex-start"><button class="btn pri" data-a="loadcode">기록 합치기</button><label class="btn">파일에서 불러오기<input type="file" id="codeFile" accept=".txt,.json" class="hide"></label></div>
  </div>`;
  $('#codeFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;$('#codeIn').value=(await f.text()).trim();};
}
function b64e(u8){let s='';for(let i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s);}
function b64d(s){const b=atob(s);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}
async function makeCode(){
  const data=JSON.stringify({hist:Store.hist(),codex:Store.codex(),cur:Store.loadCur()});
  const u=new TextEncoder().encode(data);
  try{if(window.CompressionStream){const cs=new Blob([u]).stream().pipeThrough(new CompressionStream('deflate-raw'));const buf=new Uint8Array(await new Response(cs).arrayBuffer());return 'JSYR1z:'+b64e(buf);}}catch(e){}
  return 'JSYR1:'+b64e(u);
}
async function readCode(s){
  s=s.trim();let u;
  if(s.startsWith('JSYR1z:')){u=b64d(s.slice(7));const ds=new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'));u=new Uint8Array(await new Response(ds).arrayBuffer());}
  else if(s.startsWith('JSYR1:'))u=b64d(s.slice(6));else throw new Error('bad');
  return JSON.parse(new TextDecoder().decode(u));
}
function renderGuidePage(){
  V.screen='guide';
  $('#app').innerHTML=`<div class="page serif"><button class="btn sm back" data-a="title">← 처음으로</button><h2>이용 안내</h2>
  <h3 class="gh">어떤 게임인가요</h3>
  <p>‘조선 연애실록’은 고려 말부터 1910년까지, 조선 어딘가에 무작위로 태어난 한 사람의 사랑과 일생을 살아 보는 인생 시뮬레이션입니다. 신분과 성별, 집안은 태어날 때 정해지고, 그 뒤의 삶은 그대의 선택과 운에 따라 흘러갑니다. 삶이 끝나면 그 사람의 일생이 한 편의 ‘연애실록’으로 남습니다.</p>
  <h3 class="gh">어떻게 하나요</h3>
  <ul>
    <li>세월은 저절로 흐르고, 혼인·인연·역사의 갈림길 같은 중요한 순간에만 멈춥니다. 위쪽 버튼이나 <b>스페이스바</b>로 언제든 멈추고 이어 갈 수 있습니다.</li>
    <li>왼쪽 <b>올해의 중점</b>으로 해마다 무엇에 힘쓸지 정합니다. 바꿔도 세월은 멈추지 않습니다.</li>
    <li>오른쪽 <b>인연</b> 탭에서 사람들과의 정을 보고, 마음에 두거나 청혼할 수 있습니다. <b>가족</b> 탭에서는 자식의 배움을 정할 수 있습니다.</li>
    <li>점선 밑줄이 그어진 말을 누르면 풀이가 나옵니다. 한 번 고른 선택은 되돌릴 수 없습니다.</li>
  </ul>
  <h3 class="gh">기록은 어디에 남나요</h3>
  <ul>
    <li>회원 가입 없이 바로 할 수 있고, 기록은 지금 쓰는 기기의 브라우저에만 저장됩니다.</li>
    <li>브라우저의 사이트 데이터를 지우면 기록도 사라집니다. 처음 화면의 <b>기록 옮기기</b>에서 옮기기 코드를 받아 두면 다른 기기로 옮기거나 되살릴 수 있습니다.</li>
    <li>카카오톡·인스타그램 같은 앱 안에서 열면 기록이 따로 저장되어 사라지기 쉽습니다. 되도록 크롬이나 사파리 같은 브라우저로 열어 주십시오.</li>
  </ul>
  <h3 class="gh">방송과 영상</h3>
  <ul>
    <li>인터넷 방송으로 플레이하셔도 되고, 플레이 영상을 만들어 올리셔도 됩니다. 따로 허락을 받지 않으셔도 됩니다.</li>
    <li>제목이나 설명란에 ‘조선 연애실록’이라는 이름과 링크를 남겨 주시면 큰 힘이 됩니다.</li>
  </ul>
  <h3 class="gh">알아 두실 점</h3>
  <ul>
    <li>실제 역사를 바탕으로 한 허구입니다. 실존 인물은 각색되어 등장하며, 그대의 선택에 따라 역사가 정사와 다르게 흘러가기도 합니다. 고증이 틀린 곳이 있을 수 있습니다.</li>
    <li>15세 이상에게 맞춘 내용입니다. 혼인과 첫날밤, 전쟁, 유배, 사약 같은 일도 일어나지만 자극적으로 그리지 않고 담담하게 적습니다. 연애와 혼인은 열여덟 살 이후에만 다룹니다.</li>
    <li>처음부터 끝까지 무료이며, 광고나 결제가 없습니다.</li>
  </ul>
  <h3 class="gh">만든 이</h3>
  <p>쭈꿈이 AI(Anthropic의 Claude)와 함께 만들었습니다. 고증이 어색한 곳, 버그, 바라는 점이 있으면 <a href="${FORM_URL}" target="_blank" rel="noopener">의견 보내기</a>로 알려 주십시오.</p>
  <p class="muted" style="font-size:.85em">트위터 <a href="https://x.com/jjuggum_ai" target="_blank" rel="noopener">@jjuggum_ai</a><br>음악: 국악친구 BGM</p></div>`;
}

/* ===== 엔진과 연결 ===== */
var UI={
  onLine(){V.dirty.feed=1;},
  onYear(){V.dirty.top=V.dirty.me=V.dirty.side=V.dirty.feed=1;},
  onScene(){V.dirty.scene=V.dirty.me=V.dirty.side=V.dirty.feed=V.dirty.top=1;},
  onEnd(h){V.dirty={};UIend(h);}
};
function frame(){
  if(V.screen==='play'&&P){
    const d=V.dirty;V.dirty={};
    if(d.top)renderTop();if(d.me)renderMe();if(d.side)renderSide();if(d.feed){renderFeed();}if(d.scene)renderScene();
    updProg();
  }
}
function loop(){const now=performance.now();if(V.screen==='play'&&P&&!P.dead&&!P.closed){if(tick(now))V.dirty.feed=1;}else G.lastT=now;frame();}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){G.hidden=true;if(V.screen==='play'&&P){G.away={y0:P.year,lines:[]};Store.saveCur();Cloud.flush&&Cloud.on&&Cloud.flush('cur');}}
  else{G.hidden=false;loop();if(G.away&&P&&V.screen==='play'){const n=P.year-G.away.y0;if(n>=1||G.away.lines.length)V.away={n,lines:G.away.lines};V.dirty.feed=V.dirty.top=V.dirty.me=V.dirty.side=1;}G.away=null;
    if(SET.music&&Music.unlocked&&Music.el&&Music.el.paused)Music.resume();}
});

/* ===== 클릭 ===== */
document.addEventListener('click',async e=>{
  const t=e.target.closest('.term');if(t){e.stopPropagation();showTerm(t);holdOn();return;}
  const hadPop=document.querySelector('.pop');document.querySelectorAll('.pop').forEach(x=>x.remove());if(hadPop)holdOff();
  const a=e.target.closest('[data-a]');if(!a)return;
  const act=a.dataset.a,v=a.dataset.v;
  switch(act){
    case 'new':V.codexBefore=JSON.parse(JSON.stringify(Store.codex()));newBirth();break;
    case 'reroll':newBirth();break;
    case 'len':SET.len=v;saveSet();document.querySelectorAll('[data-a="len"]').forEach(b=>b.classList.toggle('on',b.dataset.v===v));{const n=$('#lenNote');if(n)n.innerHTML=lenNote(v);}break;
    case 'accept':renderName();break;
    case 'name':{Music.unlock();const p=V.birth;if(p.ancestor){const cx=Store.codex();cx.rare.descendant=1;Store.saveCodex();}
      G.len=SET.len;G.paused=false;G.speed=SET.speed||1;startLife(p,+a.dataset.i);enterPlay();break;}
    case 'resume':{const c=Store.loadCur();if(!c)return;G.deathPending=false;Music.unlock();V.codexBefore=JSON.parse(JSON.stringify(Store.codex()));P=normalizeSt(c);G.plan=[];G.pi=0;G.acc=0;G.scene=null;G.paused=false;G.cur=P.feed[P.feed.length-1];setYearMs();enterPlay();break;}
    case 'home':confirmBox('처음 화면으로 돌아갈까요? 지금 삶은 해가 바뀔 때마다 저장되어 있어 이어서 할 수 있습니다.','돌아간다',()=>{Store.saveCur();G.scene=null;P=null;renderTitle();});break;
    case 'title':P=null;renderTitle();break;
    case 'todeath':goDeath();break;
    case 'pause':G.paused=!G.paused;G.autoHold=false;renderTop();break;
    case 'speed':G.speed=+v;SET.speed=+v;Store.saveSettings(SET);renderTop();break;
    case 'auto':G.auto=!G.auto;SET.auto=G.auto;Store.saveSettings(SET);if(G.auto&&G.scene)G.autoAt=performance.now()+800;renderTop();break;
    case 'music':SET.music=!SET.music;saveSet();if(SET.music){Music.unlock();Music.mode=Music.mode||'calm';Music.play();}else Music.pause();
      if(V.screen==='title')renderTitle();else if(V.screen==='play'){renderTop();if($('#modal'))showSettings();}break;
    case 'font':SET.font=(SET.font+1)%3;saveSet();renderTitle();break;
    case 'dark':SET.dark=!SET.dark;saveSet();renderTitle();break;
    case 'fontset':SET.font=+v;saveSet();showSettings();break;
    case 'darkset':SET.dark=v==='1';saveSet();showSettings();break;
    case 'lenset':SET.len=v;G.len=v;saveSet();if(P)setYearMs();showSettings();break;
    case 'settings':showSettings();break;
    case 'guideagain':showGuide();break;
    case 'close':closeModal();break;
    case 'wipe':closeModal();confirmBox('지난 삶, 인생 도감, 하던 판까지 이 기기의 모든 기록을 지웁니다. 되돌릴 수 없습니다.','모두 지운다',()=>{['cur','hist','codex'].forEach(k=>{try{localStorage.removeItem(Store.k[k]);}catch(e){}});Store._codex=null;P=null;toast('모든 기록을 지웠습니다.');renderTitle();});break;
    case 'defy':{if(!P)return;const ok=defyFocus();if(ok===null)return;toast(ok?'이제 올해의 중점을 마음대로 고를 수 있습니다.':'허락을 받지 못했습니다.');Store.saveCur();renderMe();V.dirty.feed=1;break;}
    case 'stathelp':SET.statHelp=!SET.statHelp;Store.saveSettings(SET);renderMe();break;
    case 'focus':if(!P)return;P.focus=v;P.flags.focusPicked=1;renderMe();break;
    case 'opt':choose(+a.dataset.i);break;
    case 'optin':{const v=($('#lastIn')||{}).value||'';if(!v.trim()){toast('남길 말을 적어 주십시오.');return;}G.lastInput=v;choose(+a.dataset.i);break;}
    case 'fate':autoChoose();break;
    case 'gunghap':{const x=P.people[a.dataset.id];if(x){const g=gunghap(x);const el=document.getElementById('gh-'+x.id);if(el)el.textContent=g;}break;}
    case 'tab':V.tab=v;renderSide();break;
    case 'filter':V.filter=v;V.openCard=null;renderSide();break;
    case 'trykid':{const x=P&&P.people[a.dataset.id];if(!P||!x||G.scene||!fertileWith(x)||pregOf(x))return;P.kidTryY=P.kidTryY||{};if(P.kidTryY[x.id]===P.year)return;P.kidTryY[x.id]=P.year;
      const isC=x.kind==='cheop';if(!isC)P.wantKids=true;
      const f=Math.min(.85,fertileWith(x)*1.6);
      if(chance(f)){const d=R(TAEMONG);const pr={due:P.year+1,sex:chance(.5)?'아들':'딸',dream:d[0],guess:d[1],cheop:isC?x.id:undefined,father:P.female?x.id:undefined,mother:!P.female&&!isC?x.id:undefined};if(isC){P.cpreg=P.cpreg||{};P.cpreg[x.id]=pr;}else P.preg=pr;
        say(`${gwawa(callOf(x))} 아이를 바라며 정성을 들였다. ${P.female?'곧 몸에 태기가 있었다':`곧 ${callOf(x)}에게 태기가 있었다`}. 그날 밤 ${d[0]}을 꾸었다.`,'big');note('taemong');toast('태기가 있습니다!');}
      else{say(`${gwawa(callOf(x))} 아이를 바라며 정성을 들였으나, 올해는 태기가 없었다.`);toast('올해는 태기가 없었습니다.');}
      Store.saveCur();V.dirty.feed=1;renderSide();break;}
    case 'divorce':{if(!P||G.scene||P.flags.divorceAsk===P.year)return;P.flags.divorceAsk=P.year;const sc=divorceMeScene();if(sc)showScene(sc);break;}
    case 'stopkid':{if(!P)return;P.wantKids=false;say('이제 자식은 이만하면 되었다고 여겼다.');Store.saveCur();V.dirty.feed=1;renderSide();toast('더는 아이를 기다리지 않습니다.');break;}
    case 'propose':{if(!P||G.scene)return;const x=P.people[a.dataset.id];if(!x)return;showScene(marryScene(x));V.mob='feed';mobShow();break;}
    case 'target':e.stopPropagation();{const id=a.dataset.id;P.target=P.target===id?null:id;if(P.target){const x=P.people[id];say(`${callOf(x)}에게 마음을 두기로 하였다.`);}Store.saveCur();renderSide();}break;
    case 'seek':{if(!P||P.lastSeek===P.year)return;const x=seekLove(v);V.openCard=x.id;Store.saveCur();renderSide();V.dirty.feed=1;toast(`${x.title||callOf(x)}을(를) 만났습니다.`.replace('을(를)',bat(x.title||callOf(x))?'을':'를'));break;}
    case 'jobpick':showJobs();break;
    case 'jobset':{changeJob(v);closeModal();Store.saveCur();renderMe();V.dirty.feed=1;break;}
    case 'card':V.openCard=V.openCard===a.dataset.id?null:a.dataset.id;renderSide();break;
    case 'letter':showLetter(a.dataset.id);break;
    case 'yr':{const y=+v;const def=P.year-y<10;const cur=V.yearOpen[y]!=null?V.yearOpen[y]:def;V.yearOpen[y]=!cur;renderFeed();break;}
    case 'stage':V.stageClosed[v]=!V.stageClosed[v];renderFeed();break;
    case 'openall':P.feed.forEach(e=>V.yearOpen[e.y]=true);Object.keys(V.stageClosed).forEach(k=>V.stageClosed[k]=false);renderFeed();break;
    case 'closeall':P.feed.forEach(e=>V.yearOpen[e.y]=false);renderFeed();break;
    case 'awayclose':V.away=null;renderFeed();break;
    case 'mnav':V.mob=v;mobShow();if(['love','fam','tl','let'].includes(v))renderSide();break;
    case 'codex':renderCodex();break;
    case 'cxtab':V.codexTab=v;renderCodex();break;
    case 'readnote':{const n=NOTES[v];modal(`<h3>📜 ${esc(n[0])}</h3><p class="serif">${esc(n[1])}</p><div class="rowbtns"><button class="btn" data-a="close">닫기</button></div>`);holdOn();break;}
    case 'past':renderPast();break;
    case 'openpast':{const h=Store.hist().find(x=>x.id===a.dataset.id);if(!h)return;if(!h.sillok){toast('이 삶의 실록은 다른 기기에 있습니다.');return;}renderSillok(h,false);break;}
    case 'transfer':renderTransfer();break;
    case 'guide':renderGuidePage();break;
    case 'copycode':try{await navigator.clipboard.writeText($('#codeOut').value);toast('옮기기 코드를 복사했습니다.');}catch(err){$('#codeOut').select();toast('코드를 길게 눌러 직접 복사해 주십시오.');}break;
    case 'savecode':{let dl=null;try{dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null;}catch(err){}if(!dl){toast('이 화면에서는 파일 저장을 쓸 수 없습니다. 코드 복사를 이용해 주십시오.');return;}try{await dl.save({filename:'조선연애실록-기록.txt',data:$('#codeOut').value});}catch(err){}break;}
    case 'loadcode':{try{const d=await readCode($('#codeIn').value);const n=mergeData(d);toast(`기록을 합쳤습니다. 새로 들어온 삶 ${n}개.`);renderTransfer();}catch(err){toast('코드를 읽지 못하였습니다. 처음부터 끝까지 빠짐없이 붙여 넣었는지 확인해 주십시오.');}break;}
    case 'lljump':{const e=document.getElementById('llLast');if(e){e.open=true;e.scrollIntoView({behavior:'smooth',block:'start'});}break;}
    case 'saveimg':if(V.viewing)saveImage(V.viewing.sillok,'save');break;
    case 'shareimg':if(V.viewing)saveImage(V.viewing.sillok,'share');break;
    case 'copytext':{const h=V.viewing;if(!h)return;try{await navigator.clipboard.writeText(sillokText(h.sillok));toast('실록을 글로 복사했습니다.');}catch(err){toast('복사하지 못하였습니다.');}break;}
  }
});
window.addEventListener('resize',()=>{if(V.screen==='play')mobShow();});

/* ===== 시작 ===== */
applySettings();
renderTitle();
setInterval(loop,200);
Cloud.init();

/* 스페이스바: 멈춤 / 이어 가기 */
document.addEventListener('keydown',e=>{
  if(e.code!=='Space'&&e.key!==' ')return;
  if(V.screen!=='play'||!P)return;
  const t=e.target,tag=t&&t.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||(t&&t.isContentEditable))return;
  e.preventDefault();
  G.paused=!G.paused;G.autoHold=false;renderTop();
});

document.addEventListener('change',e=>{const s=e.target.closest&&e.target.closest('select[data-kedu]');if(!s||!P)return;const k=P.kids.find(x=>x.id===s.dataset.kedu);if(!k)return;k.edu=s.value;Store.saveCur();say(`${k.female?'딸':'아들'} ${k.name}의 배움을 ‘${EDU[k.edu][0]}’ 쪽으로 정하였다.`);V.dirty.feed=1;toast(`${k.name}: ${EDU[k.edu][0]}`);});

function lifeLog(h){
  const L=h.log;if(!L||!L.length)return '';
  const last=L.length-1;
  return `<details class="lifelog"><summary>한 해 한 해의 기록 펼쳐 보기 <span class="muted">(${L.length}해)</span></summary>
    <div class="ll-tools"><button class="btn sm ghost" data-a="lljump">마지막 해로</button></div>
    ${L.map((r,i)=>`<details class="ll-y" ${i===last?'open id="llLast"':''}><summary><b>${esc(r[2])}</b> <span class="muted">· ${r[1]}세</span></summary>${r[3].map(([b,t])=>`<p class="${b?'big':''}">${fmt(t)}</p>`).join('')}</details>`).join('')}
  </details>`;
}

/* 재력: 가진 돈만이 아니라 집과 땅, 해마다의 벌이, 집안의 형세를 두루 본 부유함 */
function wealthScore(){
  if(!P)return 0;
  const m=Math.log10(1+P.wealth)/Math.log10(3001);
  const inc=typeof incomeOf==='function'?incomeOf():0;const i=Math.log10(1+Math.max(0,inc))/Math.log10(301);
  const h=P.home||'';const ht=/궁|전각|중궁|대전|동궁/.test(h)?1:/솟을대문|큰 기와집/.test(h)?.85:/사랑채|기와집|안채/.test(h)?.65:/너른|별채|객주/.test(h)?.45:/초가/.test(h)?.25:.1;
  const sp=spouseP();const fam=Math.min(1,Math.max(P.rich!=null?P.rich/4:0,sp&&sp.rich!=null?sp.rich/4:0,(P.inlawRich||0)/4,{royal:1,yangban:.55,jungin:.45,sangmin:.2,cheonmin:.05}[P.cls]||.2)+(P.flags.queenParent?.3*P.flags.queenParent:0)+(P.inlawUp||0)*.05);
  return Math.max(0,Math.min(100,Math.round((m*.35+i*.3+ht*.2+fam*.15)*100)));
}
function wealthWord(v){return v>=85?'갑부':v>=70?'넉넉함':v>=50?'살 만함':v>=30?'빠듯함':v>=15?'가난함':'끼니가 어려움';}

/* 자식의 다른 부모: 내가 여자면 아비, 남자면 어미 */
function otherParent(k){
  if(k.adopted)return '';
  const id=P.female?k.father:k.mother;const x=id&&P.people[id];
  const w=P.female?'아비':'어미';
  if(!x){if(!P.female&&!k.mother)return '';return '';}
  const rel=x.kind==='cheop'?'첩':x.kind==='ex'?'헤어진 배우자':x.kind==='spouse'?(x.id===P.spouse?(P.female?'남편':'아내'):(x.alive?'배우자':'세상을 떠난 배우자')):x.kind==='love'?'정인':'';
  return `${w}: ${x.title||callOf(x)}${rel?` (${rel})`:''}${x.alive?'':' · 故'}`;
}
/* 역사 노트를 펼치면 잠깐 멈추고, 접으면 이어 간다 */
document.addEventListener('toggle',e=>{
  const d=e.target;if(!d.classList||!d.classList.contains('note'))return;
  if(d.open)holdOn();else if(!document.querySelector('details.ln.note[open]'))holdOff();
},true);
