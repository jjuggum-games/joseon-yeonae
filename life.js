/* 조선 연애실록 — 한 해의 흐름과 사건 */
'use strict';

/* ===== 저장소 ===== */
const Store={
  k:{cur:'jsyr.cur',hist:'jsyr.hist',codex:'jsyr.codex',set:'jsyr.set'},
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},
  put(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}},
  _codex:null,
  codex(){if(!this._codex)this._codex=Object.assign({cls:{},titles:{},kings:{},branches:{},rare:{},notes:{}},this.get(this.k.codex,{}));return this._codex;},
  saveCodex(){this.put(this.k.codex,this.codex());this.changed('codex');},
  hist(){return this.get(this.k.hist,[]);},
  addHist(h){const a=this.hist();a.unshift(h);this.put(this.k.hist,a.slice(0,300));this.changed('hist',h);},
  saveCur(){if(!P)return;if(P.dead||P.closed){this.clearCur();return;}this.put(this.k.cur,P);this.changed('cur');},
  loadCur(){return this.get(this.k.cur,null);},
  clearCur(){try{localStorage.removeItem(this.k.cur);}catch(e){}this.changed('cur');},
  settings(){return Object.assign({music:true,font:1,dark:false,len:'normal',speed:1,auto:false,guided:false},this.get(this.k.set,{}));},
  saveSettings(s){this.put(this.k.set,s);},
  listeners:[],changed(what,x){for(const f of this.listeners)try{f(what,x);}catch(e){}}
};

/* ===== 갈림길 ===== */
const BRANCHES=[
  {id:'yangnyeong',year:1418,warn:1415,title:'세자 폐위',real:'양녕대군',
   warnText:'세자 [[양녕대군]]의 행실을 두고 궐 안팎에 말이 많다. 임금의 낯빛이 날로 어두워진다고들 한다.',
   text:'임금이 끝내 세자를 폐하려 한다는 말이 돌았다. 오늘 내일 사이에 일이 정해질 것이다.',
   protect:'세자의 곁에서 마음을 다잡게 하고 임금께 아뢴다',join:null,
   realLine:'세자가 폐위되고 충녕대군이 세자가 되었다. 두 달 뒤 충녕대군이 보위에 올랐다.',
   altLine:'세자가 마음을 고쳐먹고 임금의 노여움이 풀렸다. 그해 여름 양녕대군이 보위에 올랐다.',altKing:'양녕왕',
   role:P=>P.realSpouse==='양녕대군'||highPlace(P)},
  {id:'gyeyu',year:1453,warn:1451,title:'계유정난',
   warnText:'어린 임금 곁에서 [[김종서]]와 [[수양대군]]이 서로를 경계한다는 말이 돈다.',
   text:'수양대군이 사람을 모은다는 소문이 파다하다. 오늘 밤 무슨 일이 날지 모른다.',
   protect:'김종서에게 미리 알려 막는다',join:'수양대군 편에 선다',
   realLine:'수양대군이 김종서 등을 죽이고 권력을 잡았다.',
   altLine:'김종서가 미리 대비하여 수양대군의 거사가 꺾였다. 어린 임금의 자리가 지켜졌다.',altKing:'단종',joinTitle:'정난공신',
   role:P=>highPlace(P)},
  {id:'jungjong',year:1506,warn:1504,title:'중종반정',
   warnText:'임금의 폭정이 날로 심해져, 신하들 사이에 은밀한 말이 오간다.',
   text:'대신들이 임금을 몰아낼 거사를 꾸민다는 것을 알게 되었다.',
   protect:'임금께 알려 거사를 막는다',join:'반정에 가담한다',
   realLine:'신하들이 연산군을 몰아내고 진성대군을 왕으로 세웠다.',
   altLine:'거사가 미리 새어 나가 반정이 꺾였다. 연산군의 치세가 이어졌다.',altKing:'연산군',joinTitle:'정국공신',
   role:P=>highPlace(P)||(P.sub==='gisaeng'&&P.age>=18&&P.job&&P.job.lv>=1)},
  {id:'injo',year:1623,warn:1621,title:'인조반정',
   warnText:'임금이 대비를 서궁에 가둔 일로 서인들의 불만이 깊다.',
   text:'서인들이 능양군을 받들어 거사를 꾸민다는 것을 알게 되었다.',
   protect:'임금께 알려 거사를 막는다',join:'반정에 가담한다',
   realLine:'서인이 광해군을 몰아내고 능양군을 왕으로 세웠다.',
   altLine:'거사가 미리 새어 나가 반정이 꺾였다. 광해군의 치세가 이어졌다.',altKing:'광해군',joinTitle:'정사공신',
   role:P=>highPlace(P)},
  {id:'gapsul',year:1694,warn:1692,title:'갑술환국',
   warnText:'폐위된 [[인현왕후]]를 다시 모셔야 한다는 말이 궐 안에 은밀히 돈다. [[희빈 장씨]]의 낯빛이 어둡다.',
   text:'서인들이 폐비 복위를 꾀한다. 중전 장씨의 자리가 흔들린다.',
   protect:'중전 장씨 편에서 복위 움직임을 막는다',join:'폐비 복위에 힘을 보탠다',
   realLine:'인현왕후가 복위하고 장씨는 다시 희빈으로 내려갔다.',
   altLine:'복위 움직임이 꺾이고 중전 장씨가 끝내 자리를 지켰다.',altKing:null,joinTitle:'복위의 공',
   role:P=>highPlace(P)},
  {id:'imo',year:1762,warn:1759,title:'임오화변',real:'사도세자',
   warnText:'임금과 세자 [[사도세자]] 사이가 날로 벌어진다. 세자의 병이 깊다는 말도 돈다.',
   text:'임금이 세자를 크게 꾸짖고, 휘령전으로 부르라 하였다는 소식이 들어왔다.',
   protect:'세자를 감싸고 임금의 노여움을 풀게 한다',join:null,
   realLine:'세자가 뒤주에 갇혀 여드레 만에 세상을 떠났다.',
   altLine:'임금의 노여움이 풀려 세자가 목숨을 건졌다. 훗날 세자가 보위에 올랐다.',altKing:'장헌왕(사도세자)',altKingFrom:1776,
   role:P=>P.realSpouse==='사도세자'||highPlace(P)}
];
function highPlace(P){
  if(P.age<18)return false;
  if(P.court)return true;
  if(P.cls==='royal')return true;
  if(P.job&&P.job.k==='official'&&P.job.lv>=10)return true;
  const sp=spouseP();
  if(sp&&sp.alive&&sp.rank>=10)return true;
  return false;
}

/* ===== 삶의 시작 ===== */
function startLife(p,ci){
  P=p;const c=p.nameCands[ci]||p.nameCands[0];
  P.name=c.n;P.nameMean=c.mean;P.nameKind=c.kind;
  P.gong=/관/.test(P.parents.f.job+P.parents.m.job);
  P.birthWealth=P.wealth;
  const cx=Store.codex();cx.cls[clsKey(P)]=1;Store.saveCodex();
  P.kings=[kingAt(P.born,P).n];
  G.plan=[];G.pi=0;G.acc=0;G.scene=null;
  feedYear();
  const k=kingAt(P.born,P);
  say(`${P.born<1392?'고려 '+k.n+' 때':reignLabel(P.born,P)}, ${P.region} ${clsWord()}의 ${P.female?'딸':'아들'}로 태어났다.`,'big');
  if(P.nameKind==='a')say(`아명을 ${euro(P.name)} 지었다. ${P.nameMean}이었다.`);
  else if(P.nameKind==='ki')say(`어미의 뜻을 따라 장차 ${euro(P.name)} 불리게 될 아이였다.`);
  else say(`이름을 ${euro(P.name)} 지었다. ${P.nameMean}.`);
  if(P.ancestor)say(`이 집안의 ${P.ancestor.gens}대조는 지난 삶의 ${ida(P.ancestor.name)}. 집안 어른들이 옛 조상의 이야기를 들려주곤 하였다.`,'big');
  if(P.sub==='seo'){say('어머니가 첩이라, 아버지의 집에서 서얼로 자랐다.');note('seoeol');}
  if(P.sub==='gisaeng'){say('어머니는 관아에 매인 기생이었다. 딸도 기적에 이름이 오를 운명이었다.');}
  if(P.sub==='nobi'){say('부모가 노비라 태어나면서부터 주인집의 재산이었다.');note('nobi');}
  if(P.cls==='royal')say(`[[${P.parents.f.name}]]의 ${P.female?'딸':'아들'}이었다.`);
  ev('birth','');
  setYearMs();
  Store.saveCur();
}
function clsKey(p){return p.sub==='seo'?'seo':p.sub==='gisaeng'?'gisaeng':p.sub==='gwangdae'?'gwangdae':p.sub==='nobi'?'nobi':p.cls;}
function clsWord(){
  if(P.cls==='royal')return '왕실';
  if(P.cls==='yangban')return P.sub==='seo'?`${P.bon} ${P.sur}씨 양반가 첩`:`${P.bon} ${P.sur}씨 양반가`;
  if(P.cls==='jungin')return `${P.parents.f.job} 집안`;
  if(P.cls==='sangmin')return `${P.parents.f.job} 집안`;
  if(P.sub==='gisaeng')return '관기';
  if(P.sub==='gwangdae')return '광대 집안';
  return '노비 집안';
}
function setYearMs(){
  const base={short:12000,normal:22000,long:33000}[G.len]||22000;
  const m=P.age>=18&&P.age<=30?1.5:P.age<8?.6:1;
  G.yearMs=base*m;
}

/* ===== 한 해 ===== */
function nextYear(){
  P.year++;P.age++;
  const k=kingAt(P.year,P);
  if(!P.kings.includes(k.n))P.kings.push(k.n);
  feedYear();setYearMs();
  G.plan=buildPlan();G.pi=0;
  if(typeof UI!=='undefined')UI.onYear();
}
function buildPlan(){
  const S=[];const st=f=>S.push(f);
  st(yNews);
  st(yFestival);
  st(yFamily);
  st(yJob);
  st(yFirstFocus);
  st(yFocus);
  st(yGrowth);
  st(yFlavor);
  st(yLoveSpawn);
  st(yLoveEvent);
  st(yMajor);
  st(yEnd);
  return S;
}
function runStep(){
  const f=G.plan[G.pi++];if(!f)return;
  let r=null;try{r=f();}catch(e){console.error(e);}
  if(r&&r.opts)showScene(r);
}
function showScene(s){G.scene=s;G.autoAt=performance.now()+(G.hidden?0:1500);if(typeof UI!=='undefined')UI.onScene();}
function choose(i){
  const s=G.scene;if(!s)return;const o=s.opts[i];if(!o||o.dis)return;
  G.scene=null;
  say(`▸ ${o.t}`,'pick');
  let r=null;try{r=o.fn&&o.fn();}catch(e){console.error(e);}
  if(r&&r.opts){showScene(r);return;}
  Store.saveCur();
  if(typeof UI!=='undefined')UI.onScene();
}
function autoChoose(){
  const s=G.scene;if(!s)return;
  const ok=s.opts.map((o,i)=>[i,o]).filter(([i,o])=>!o.dis&&!o.input);
  const w=ok.map(([i,o])=>[i,Math.max(.05,o.p==null?.5:o.p)*(o.safe?1.3:1)]);
  choose(wpick(w));
}
function tick(now){
  if(!P||P.dead||P.closed){G.lastT=now;return false;}
  let dt=now-(G.lastT||now);G.lastT=now;
  if(G.scene){if(G.auto&&now>=G.autoAt){autoChoose();return true;}return false;}
  if(G.paused)return false;
  G.acc+=dt*G.speed;
  const cap=G.yearMs*40;if(G.acc>cap)G.acc=cap;
  let moved=false,guard=0;
  while(!G.scene&&!P.dead&&!P.closed&&guard++<4000){
    if(G.pi>=G.plan.length){
      if(G.acc<G.yearMs/(G.plan.length+2)&&G.plan.length)break;
      G.acc-=G.yearMs/(Math.max(G.plan.length,1)+2);
      nextYear();moved=true;continue;
    }
    const stepMs=G.yearMs/(G.plan.length+2);
    if(G.acc<stepMs)break;
    G.acc-=stepMs;runStep();moved=true;
  }
  if(G.scene&&G.auto)G.autoAt=Math.min(G.autoAt,G.hidden?now:G.autoAt);
  return moved;
}
function yearProgress(){if(!G.plan.length)return 0;return Math.min(1,(G.pi+G.acc/(G.yearMs/(G.plan.length+2)))/(G.plan.length+1));}

/* ---- 나라의 소식 ---- */
function yNews(){
  const y=P.year;
  if(y===1392)P.cls==='royal'||say('나라의 주인이 바뀌었다. 이제 이 땅은 조선이었다.');
  const altOn=P.alt&&y>P.alt.year;
  if(!altOn&&NEWS[y])say(NEWS[y],'news');
  if(altOn&&chance(.18))say(R(altNews()),'alt');
  if(y===1413&&!P.female&&P.age>=16)note('hopae');
  if(y===1678)note('sangpyeong');
  if(y===1801&&P.cls==='cheonmin'&&P.gong&&!altOn){P.cls='sangmin';P.sub='';say('나라에서 공노비를 풀어 주었다. 그대도 양인이 되었다!','big');note('gongnobi');ev('freed','공노비 해방으로 양인이 되었다');if(P.job&&P.job.k==='slave')P.job=null;P.home='초가삼간';}
  if(y===1894&&!altOn){note('gabo');if(P.cls==='cheonmin'){P.cls='sangmin';say('갑오개혁으로 노비와 천민의 신분이 사라졌다. 그대도 이제 양인이었다.','big');ev('freed','갑오개혁으로 신분을 벗었다');}}
  // 전쟁·기근·역병
  const w=WARS.find(x=>y>=x[0]&&y<=x[1]);
  if(w&&y>w[0]){fx({health:-ri(2,6),worry:ri(3,8)},true);if(chance(.5))say(R([`${w[2]}의 난리가 이어져 피란살이가 길어졌다.`,'전란 중에 끼니를 잇기 어려웠다.','길에는 굶주린 사람들이 넘쳤다.']));}
  if(FAMINES.includes(y)){fx({health:-ri(4,9),worry:ri(5,10),wealth:-P.wealth*.15},true);say('흉년이 들어 곡식 값이 하늘로 솟았다. 허리띠를 졸라매었다.');famTragedy(.06,'굶주림 끝에');}
  if(PLAGUES.includes(y)&&!altOn){fx({health:-ri(5,10),worry:8},true);say('괴질이 돌아 마을마다 곡소리가 끊이지 않았다.');famTragedy(.06,'괴질로');}
  if(chance(.012)&&P.age>3){note('mama');if(P.age<18||chance(P.st.health/105)){say('마마를 앓았으나 다행히 살아났다.');if(chance(.4)){fx({look:-ri(6,14)});say('얼굴에 곰보 자국이 남았다.');}}else{P.cause='마마를 앓다가';P.flags.sick=1;fx({health:-25});say('마마를 앓아 몸이 크게 상하였다.','big');}}
}
function altNews(){
  const k=P.alt&&P.alt.king?P.alt.king:'임금';
  return [`이 판의 역사에서, ${k}의 치세가 이어지고 있다.`,`궐에서는 정사와 다른 길을 걷는 나라의 앞날을 두고 말이 많다.`,`${k} 아래에서 새로운 인물들이 조정에 나섰다.`,'정사(正史)에는 없는 일들이 하나둘 일어나고 있다.'];
}
function famTragedy(p,why){
  const cands=[];
  if(P.parents.f.alive)cands.push(['f','아버지']);if(P.parents.m.alive)cands.push(['m','어머니']);
  P.sibs.filter(s=>s.alive&&P.age+s.off>=0).forEach(s=>cands.push(['s',s.female?(s.older?'언니·누이':'여동생'):(s.older?'형·오라비':'남동생'),s]));
  P.kids.filter(k=>k.alive).forEach(k=>cands.push(['k',k.female?'딸':'아들',k]));
  if(!cands.length||!chance(p))return;
  const c=R(cands);
  if(c[0]==='f'){P.parents.f.alive=false;say(`${why} 아버지가 세상을 떠났다.`,'big');ev('loss','아버지를 여의었다');}
  else if(c[0]==='m'){P.parents.m.alive=false;say(`${why} 어머니가 세상을 떠났다.`,'big');ev('loss','어머니를 여의었다');}
  else if(c[0]==='s'){c[2].alive=false;say(`${why} ${c[2].name}(${c[1]})를 잃었다.`,'big');}
  else{c[2].alive=false;c[2].dy=P.year;say(`${why} ${c[1]} ${eulreul(c[2].name)} 잃었다.`,'big');ev('kidloss',c[2].name);fx({worry:20},true);}
}

/* ---- 명절 ---- */
function yFestival(){
  G.fest=null;
  if(P.age<4||!chance(.55))return;
  const f=R(FESTIVALS);G.fest=f;
  say(f.line);
  if(f.k==='dano'||f.k==='daeboreum'||f.k==='chilseok')if(P.age>=10)note(f.k);
  if(!Store.codex().notes.sesi&&P.age>=8)note('sesi');
}

/* ---- 가족 ---- */
function yFamily(){
  const pa=P.parents;
  for(const [key,w] of [['f','아버지'],['m','어머니']]){
    const x=pa[key];if(!x.alive)continue;x.age++;
    const pd=x.age<45?.006:x.age<55?.02:x.age<65?.045:x.age<75?.09:.18;
    if(chance(pd)&&P.age>=3){
      x.alive=false;say(`${w}가 세상을 떠났다. ${P.age>=15?'삼년상을 치르며 몸과 마음이 상하였다.':'어린 나이에 부모를 여의었다.'}`,'big');
      ev('loss',`${w}를 여의었다`);fx({worry:12,health:-3},true);
      if(key==='f'&&P.married&&P.cls!=='cheonmin')inherit();
    }
  }
  // 형제자매
  for(const s of P.sibs){
    const a=P.age+s.off;
    if(a===0)say(`${s.female?'여동생':'남동생'} ${iga(s.name)} 태어났다.`);
    if(a<0||!s.alive)continue;
    if(!s.married&&a>=17&&a<=26&&chance(.22)&&P.cls!=='cheonmin'){s.married=true;if(P.age>=6)say(`${sibWord(s)} ${iga(s.name)} 혼인하였다.`);}
    if(a>=1&&chance(a>55?.04:.003)){s.alive=false;say(`${sibWord(s)} ${iga(s.name)} 세상을 떠났다.`);}
  }
  // 배우자
  const sp=spouseP();
  if(sp&&sp.alive){
    const a=ageOf(sp);
    if(!sp.real||sp.title==='양녕대군'){const pd=a<40?.005:a<55?.014:a<65?.035:a<75?.075:.15;
      if(chance(pd*(P.flags.warYear?1.5:1))){spouseDies(sp,'병을 얻어');}}
    if(sp.alive&&!P.affair){sp.h=clamp(sp.h+2+sp.comp*4);sp.t=clamp(sp.t+2+sp.comp*4);sp.maxH=Math.max(sp.maxH,sp.h);}
    if(sp.real&&sp.kingRole&&realKing(P.year).n!==sp.title&&!P.alt){spouseDies(sp,'승하하여');}
  }
  // 시댁 어른
  const el=P.elder?P.people[P.elder]:null;
  if(el&&el.alive){el.rel=clamp(el.rel+(P.st.grace+P.st.wit>90?3:-1)+ri(-3,3));
    if(ageOf(el)>58&&chance(.07)){el.alive=false;say(`${iga(el.title)} 세상을 떠났다.`,'big');
      if(P.female&&P.job&&P.job.k==='lady'&&P.flags.jongga){setJob('lady',3);say('그대가 종가의 안살림을 맡는 종부가 되었다.','big');}}
    else if(P.female&&el.rel<25&&chance(.3)){say(R(['시어머니의 꾸중이 매서웠다. 부엌에서 몰래 눈물을 훔쳤다.','시집살이가 고되어 친정 생각이 간절하였다.','시어머니가 사사건건 트집을 잡았다.']));fx({worry:6},true);if(!P.seen.chinyeong){P.seen.chinyeong=1;note('chinyeong');}}
    else if(el.rel>75&&chance(.2)){say(`${el.title}의 신임이 두터워 집안일을 믿고 맡겼다.`);fx({fame:2},true);}
  }
  // 자식
  for(const k of P.kids){
    if(!k.alive)continue;const a=P.year-k.born;
    if(a>0&&a<10&&chance(.006)){k.alive=false;k.dy=P.year;say(`어린 ${eulreul(k.name)} 잃었다. 가슴이 무너졌다.`,'big');ev('kidloss',k.name);fx({worry:22,health:-5},true);continue;}
    if(a>=30&&chance(.006)){k.alive=false;k.dy=P.year;say(`${k.female?'딸':'아들'} ${iga(k.name)} 먼저 세상을 떠났다.`,'big');ev('kidloss',k.name);fx({worry:20},true);continue;}
    if(a===7&&!k.female&&P.cls==='yangban')say(`${k.name}에게 천자문을 가르치기 시작하였다.`);
    if(k.married&&a>=20&&chance(.25)&&k.grand<5){k.grand=(k.grand||0)+1;P.grand++;say(`${k.name}에게서 손주가 태어났다.`);}
  }
  // 회임과 출산
  if(P.preg&&P.preg.due===P.year){return birth();}
  const up=unwedConceive();if(up)return up;
  conceive();
}
function spouseDies(sp,why){
  sp.alive=false;sp.dy=P.year;
  say(`${spouseWord(sp)} ${iga(sp.title||sp.name)} ${why} 세상을 떠났다.`,'big');
  ev('widow',sp.title||sp.name);P.widowed=true;P.married=false;
  fx({worry:25,health:-4},true);
  if(sp.kingRole&&P.job&&P.job.k==='concubine'){say('후궁은 다시 혼인할 수 없었다. 궁을 나와 조용히 지내게 되었다.');P.home='사가(私家)';P.court=false;P.flags.noRemarry=1;}
}
function spouseWord(sp){return P.female?(sp.kingRole?'임금':'남편'):'아내';}
function sibWord(s){return s.older?(s.female?(P.female?'언니':'누이'):(P.female?'오라비':'형')):(s.female?'여동생':'아우');}
function inherit(){
  const n=P.sibs.filter(s=>s.alive).length+1;
  const late=P.year>=1650;
  let share=P.birthWealth*.5/n*(prel()/60);
  if(late&&P.female)share*=.25;if(late&&!P.female&&P.order===0)share*=2.2;
  if(share>1){fx({wealth:share});say(`아버지의 재산을 물려받았다. ${late&&P.female?'출가한 딸의 몫은 적었다.':''}${P.parentRel<35?' 부모와 사이가 멀었던 탓에 몫이 줄었다.':''}`);note('jaesan');}
  if(n>2&&chance(.3)){say('형제들 사이에 재산을 두고 다툼이 일었다.');fx({worry:8},true);}
}
function fertile(){
  const sp=spouseP();if(!sp||!sp.alive||!P.married)return 0;
  if(P.female===sp.female)return 0;
  const fa=P.female?P.age:ageOf(sp);
  if(fa<18||fa>44)return 0;
  return fa<30?.42:fa<36?.3:.16;
}
function unwedConceive(){
  if(P.preg||P.married||P.age<18||P.court||(P.job&&['concubine','queen'].includes(P.job.k)))return null;
  const x=Object.values(P.people).filter(p=>p.kind==='love'&&p.alive&&p.female!==P.female&&ageOf(p)>=18&&['lover','mutual'].includes(p.status)&&p.h>=65&&p.t>=65).sort((a,b)=>b.h+b.t-a.h-a.t)[0];
  if(!x)return null;
  const fa=P.female?P.age:ageOf(x);if(fa>42)return null;
  if(!chance(.12))return null;
  const d=R(TAEMONG);
  P.preg={due:P.year+1,sex:chance(.5)?'아들':'딸',dream:d[0],guess:d[1],father:x.id,unwed:true};
  say(P.female?`몸이 이상하여 의녀를 찾았더니 태기가 있다 하였다. 그날 밤 ${d[0]}을 꾸었다.`:`${iga(callOf(x))} 아이를 가졌다는 소식이 들려왔다.`,'big');
  note('taemong');
  return unwedPregScene(x);
}
function conceive(){
  if(P.preg||!P.wantKids)return;
  const f=fertile();if(!f||P.kids.filter(k=>!k.adopted).length>=9)return;
  if(chance(f)){
    const d=R(TAEMONG);const sex=chance(.5)?'아들':'딸';
    P.preg={due:P.year+1,sex,dream:d[0],guess:d[1]};
    say(`${P.female?'태기가 있었다':'아내에게 태기가 있었다'}. 그날 밤 ${d[0]}을 꾸었다.`,'big');
    note('taemong');
  }
}
function birth(){
  const pr=P.preg;P.preg=null;
  if(pr.unwed&&!P.female&&!(P.married&&P.spouse===pr.father)&&!pr.keep){const x=P.people[pr.father];if(x)say(`${iga(callOf(x))} 아이를 낳았다는 소식을 들었다.`);return;}
  const female=pr.sex==='딸';
  const royalKid=spouseP()&&spouseP().kingRole;
  let risk=P.female?.012:.006;
  let doc=false;
  if(P.wealth>=30&&P.cls!=='cheonmin'){P.wealth-=8;risk*=.5;doc=true;}
  if(doc)say(P.female?'해산 날, 의녀를 불러 곁을 지키게 하였다.':'아내의 해산 날, 의원을 불러 두었다.');
  if(P.female&&!P.seen.uinyeo&&doc){P.seen.uinyeo=1;note('uinyeo');}
  if(chance(risk)){
    if(P.female){P.cause='아이를 낳다가';P.flags.birthDeath=1;fx({health:-100},true);say('해산이 몹시 어려웠다…','big');}
    else{const sp=spouseP();spouseDies(sp,'해산 끝에');}
  }
  const nm=royalKid?(R(['영','화','덕','은','숙','정','명','경','의','순'])+R(['창','원','안','성','양','천','평','춘'])+(female?' 옹주':'군')):personName(P.cls==='cheonmin'?'cheonmin':P.cls,female);
  const kid={id:uid(),name:nm,female,born:P.year,alive:true,adopted:false,married:false,grand:0,seo:P.sub==='cheop'||(spouseP()&&(spouseP().kind==='cheop'||spouseP().mode==='cheop'))||(pr.unwed&&!(P.married&&P.spouse===pr.father)),father:pr.father||P.spouse};
  if(P.alive===false)return;
  P.kids.push(kid);
  say(`${female?'딸':'아들'} ${iga(kid.name)} 태어났다.${pr.guess===pr.sex?' 태몽이 맞았다.':''}`,'big');
  ev('child',kid.name,{female});
  fx({worry:-5},true);
  if(royalKid&&P.job&&P.job.k==='concubine'&&!female){promoteCon(2);}
  if(P.kids.filter(k=>!k.adopted).length===3)P.flags.askMore=1;
}

/* ---- 직업 ---- */
function yJob(){
  const a=P.age,J=P.job;
  // 시작
  if(!J){
    let push=null;
    if(P.cls==='yangban'&&!P.female&&a===10)push=['scholar','아버지가 서당에 보내 글을 읽혀 과거를 보게 하려 한다.'];
    else if(P.cls==='yangban'&&P.female&&a===10)push=['lady','어머니가 안채에서 규방 살림을 익히라 한다.'];
    else if(P.cls==='jungin'&&a===12)push=P.female?['uinyeo','부모가 의녀가 되도록 의술을 배우라 한다.']:[R(['doctor','interp','painter']),'아버지가 집안의 업을 이으라 한다.'];
    else if(P.cls==='sangmin'&&a===12)push=P.female?['weaver','어머니가 삯바느질을 배워 살림을 도우라 한다.']:[chance(.7)?'farmer':'merchant','아버지가 집안일을 이어받으라 한다.'];
    else if(P.sub==='gwangdae'&&a===10)push=['gwangdae','아버지가 놀이패를 따라 줄타기와 소리를 배우라 한다.'];
    else if(P.sub==='nobi'&&a===8){setJob('slave',0);say('주인집 일을 거들기 시작하였다. 노비의 아이에게 주인의 명은 거스를 수 없는 것이었다.');}
    if(push){P.flags.careerAsked=1;return parentPush(push[0],push[1]);}
    // 궁녀로 보내려 함
    if(P.female&&a>=9&&a<=12&&(P.cls==='sangmin'||P.sub==='nobi')&&!P.court&&!P.flags.courtAsked&&chance(P.region==='한양'?.06:.015)){P.flags.courtAsked=1;return courtPush();}
    if(!J)return;
  }
  if(P.female&&a>=9&&a<=12&&P.sub==='nobi'&&!P.court&&!P.flags.courtAsked&&chance(P.region==='한양'?.05:.012)){P.flags.courtAsked=1;return courtPush();}
  const k=J.k,d=JOBS[k];
  if(P.exile&&P.year<P.exile){if(chance(.4))say('유배지에서 쓸쓸한 한 해를 보냈다.');income();return;}
  if(P.exile&&P.year>=P.exile){P.exile=0;P.home=P.flags.homeBefore||HOMES[P.cls];say('유배에서 풀려 집으로 돌아왔다.','big');}
  if(k==='slave'&&J.lv===0&&a>=16)setJob('slave',1);
  if(k==='gisaeng'){if(J.lv===0&&a>=18){setJob('gisaeng',1);say(`기적에 ${eulreul(P.name)} 기명으로 올리고 기녀가 되었다.`,'big');note('gisaeng');}
    else if(J.lv===1&&a>=26&&P.st.art>=50&&chance(.2)){setJob('gisaeng',2);say('기방의 기생들을 거느리는 행수기생이 되었다.','big');}
    else if(J.lv>=1&&J.lv<3&&P.st.art>=72&&P.st.fame>=50&&chance(.25)){setJob('gisaeng',3);say(`${P.name}의 이름이 팔도에 퍼졌다. 사람들은 그대를 명기라 불렀다.`,'big');ev('fame','명기로 이름을 떨쳤다');}}
  if(k==='court'){if(J.lv===0&&a>=18){setJob('court',1);say('관례를 치르고 정식 나인이 되었다.','big');}
    else if(J.lv===1&&a>=33&&chance(.12+P.st.wit/400)){setJob('court',2);say('오랜 세월 끝에 상궁의 자리에 올랐다.','big');note('naemyeong');}
    else if(J.lv===2&&a>=45&&chance(.08+P.st.wit/500)){setJob('court',3);say('궁녀들의 으뜸인 제조상궁이 되었다.','big');}}
  if(k==='scholar'&&isGwageoYear(P.year)&&a>=16&&a<=55&&(P.sub!=='seo'||P.year>=1777)){
    note('gwageo');
    if(J.lv===0){if(chance(.08+P.st.know/260)){const lv=chance(.5)?1:2;setJob('scholar',lv);say(`식년시 소과에 붙어 ${iga(JOBS.scholar.ladder[lv])} 되었다.`,'big');fx({fame:8});ev('job',`${iga(JOBS.scholar.ladder[lv])} 되었다`);}else say('과거를 보았으나 이름이 방에 오르지 않았다.');}
    else{if(chance(.02+Math.max(0,P.st.know-35)/240)){const lv=P.st.know>80?4:P.st.know>65?2:0;setJob('official',lv);say(`문과에 급제하였다! ${RANKS[lv]} 벼슬을 받았다.`,'big');fx({fame:15});ev('job','문과에 급제하였다');P.home=P.cls==='yangban'?'사랑채 딸린 기와집':P.home;}else say('대과에 나아갔으나 낙방하였다.');}
  } else if(k==='scholar'&&P.sub==='seo'&&isGwageoYear(P.year)&&a>=18&&!P.seen.seoNo){P.seen.seoNo=1;say('서얼이라 문과에 나아갈 수 없었다. 붓을 쥔 손이 떨렸다.');fx({worry:10},true);}
  if(k==='official'&&J.lv<16&&chance(.1+(P.st.know+P.st.wit-80)/420+P.st.fame/900)){const up=chance(.25)?2:1;setJob('official',Math.min(16,J.lv+up));say(`${euro(RANKS[P.job.lv])} 승진하였다.`,P.job.lv>=12?'big':'n');if(P.job.lv>=12)ev('job',`${RANKS[P.job.lv]}에 올랐다`);}
  if(['doctor','interp','painter','uinyeo','gwangdae','weaver','soldier','hunjang','sword','yein'].includes(k)&&J.lv<d.ladder.length-1&&a>=15){
    const st=P.st[d.stat]||P.st.art;
    if(chance(.07+(st-40)/300+(J.lv===0&&a>=20?.15:0))){setJob(k,J.lv+1);say(`${iga(d.ladder[P.job.lv])} 되었다.`+(P.job.lv===d.ladder.length-1?' 솜씨가 널리 알려졌다.':''),'big');if(P.job.lv===d.ladder.length-1)ev('job',`${iga(d.ladder[P.job.lv])} 되었다`);}}
  if(k==='merchant'){if(J.lv===0&&P.wealth>=220){setJob(k,1);say('밑천이 모여 객주를 차렸다.','big');}else if(J.lv===1&&P.wealth>=1500){setJob(k,2);say('사람들이 그대를 거상이라 불렀다.','big');ev('job','거상이 되었다');}}
  if(k==='farmer'){if(J.lv===0&&P.wealth>=70){setJob(k,1);say('논 몇 마지기를 사 자작농이 되었다.','big');}else if(J.lv===1&&P.wealth>=450){setJob(k,2);say('땅이 늘어 부농 소리를 들었다.','big');}}
  if(k==='slave'&&J.lv===1&&a>=25&&P.st.wit>=45&&chance(.15)){setJob(k,2);say(P.female?'안채의 몸종들을 거느리게 되었다.':'주인집 살림을 맡는 청지기가 되었다.','big');}
  if(k==='lady'&&J.lv===1&&P.married&&P.year-(P.flags.wedY||P.year)>=6){setJob('lady',2);say('어느덧 집안의 안주인이 되었다.');}
  if(k==='concubine'){
    const sp=spouseP();
    if(sp&&sp.alive){P.favor=clamp(P.favor+ri(-6,6)+(P.st.look-50)/20+(P.st.wit-50)/25);
      if(J.lv<8&&chance(.06+P.favor/350))promoteCon(1);
      if(P.favor<25&&chance(.25)){say('임금의 발길이 뜸해졌다. 처소가 쓸쓸하였다.');fx({worry:8},true);}}
  }
  income();
}
function promoteCon(n){const lv=Math.min(8,P.job.lv+n);setJob('concubine',lv);say(`[[${JOBS.concubine.ladder[lv]}]]의 품계를 받았다.`,'big');ev('job',`${JOBS.concubine.ladder[lv]}에 올랐다`);note('naemyeong');}
function isGwageoYear(y){return [0,3,6,9].includes((y-4+6000)%12);}
function income(){
  const J=P.job;let v={royal:150,yangban:22,jungin:12,sangmin:3,cheonmin:.4}[P.cls]||2;
  if(J){const L=J.lv;v+=({official:6+L*7,merchant:[6,28,90][L],gisaeng:[0,6,16,40][L],concubine:25+L*12,queen:[150,300][L],court:2+L*4,farmer:[2,6,14][L],weaver:[2,4,9][L],doctor:[6,15,32][L],interp:[8,20,45][L],painter:[5,12,28][L],uinyeo:[2,5,10][L],slave:[0,.3,1][L],gwangdae:[1,4,14][L],soldier:[2,6,14][L],hunjang:[0,2,8][L],sword:[0,4,12][L],yein:[1,5,16][L],scholar:[0,3,4][L],prince:[60,90,140][L],princess:[60,90][L],buma:[80][0],lady:[0,0,0,10][L]}[J.k]||0);}
  const live={royal:120,yangban:18,jungin:9,sangmin:2.6,cheonmin:.3}[P.cls]||2;
  const kidsCost=P.kids.filter(k=>k.alive&&P.year-k.born<18).length*({royal:10,yangban:2,jungin:1,sangmin:.4,cheonmin:.05}[P.cls]||.4);
  let net=v-live-kidsCost+ri(-2,3)*(P.cls==='cheonmin'?.1:1);
  if(P.focus==='wealth')net+=Math.max(1,v*.4);
  P.wealth=Math.max(0,P.wealth+net);
}

/* ---- 부모의 뜻 ---- */
function prel(){if(P.parentRel==null)P.parentRel=60;return P.parentRel;}
function relWord(v){return v>=75?'정다움':v>=50?'무난함':v>=30?'서먹함':'멀어짐';}
function parentAlive(){return P.parents&&(P.parents.f.alive||P.parents.m.alive);}
function parentPush(k,text){
  if(!parentAlive()){setJob(k,0);say(`${euro(JOB_DESC[k][0])} 살게 되었다.`);return null;}
  prel();
  const others=jobChoices().list.filter(x=>x!==k&&x!=='official'&&x!=='slave');
  const p=clamp(.35+P.st.brave/200+(P.parentRel-50)/400,.15,.75);
  const opts=[{t:`부모의 뜻을 따른다 · ${JOB_DESC[k][0]}`,sub:JOB_DESC[k][1],p:null,safe:true,tags:[`직책: ${JOBS[k].ladder[0]}`,'부모와 사이 ↑'],fn:()=>{setJob(k,0);P.parentRel=clamp(P.parentRel+6);say(`부모의 뜻을 따라 ‘${JOB_DESC[k][0]}’ 길을 걷게 되었다.`);}}];
  for(const o of others)opts.push({t:`${JOB_DESC[o][0]}의 길을 고집한다`,sub:JOB_DESC[o][1],p,tags:['부모와 사이가 멀어질 수 있음',...(JOB_TAGS[o]||[])],fn:()=>{
    if(chance(p)){P.parentRel=clamp(P.parentRel-8);say('부모가 한숨을 쉬며 끝내 허락하였다.');changeJob(o);}
    else{P.parentRel=clamp(P.parentRel-15);setJob(k,0);fx({worry:8},true);say(`끝내 부모의 뜻을 꺾지 못하고 ‘${JOB_DESC[k][0]}’ 길을 걷게 되었다. 부모와 사이가 서먹해졌다.`,'big');}}});
  return {kind:'major',title:'부모의 뜻',text:`${text} 이 길은 나중에 바꿀 수도 있다.`,opts};
}
function courtPush(){
  prel();
  const p=clamp(.4+P.st.brave/200+(P.parentRel-50)/400,.15,.8);
  return {kind:'major',title:'부모의 뜻 · 궁녀',text:`${P.sub==='nobi'?'주인과 부모가':'부모가'} 그대를 궁에 들여보내 생각시로 삼으려 한다. 궁에 들면 집으로 돌아오기 어렵고, 혼인하려면 궁을 떠나야 한다.`,opts:[
    {t:'뜻을 따라 궁에 들어간다',sub:'궁녀의 길을 걷는다',p:null,tags:['궁에 매임','혼인이 어려움','부모와 사이 ↑'],fn:()=>{P.parentRel=clamp(P.parentRel+6);changeJob('court');}},
    {t:'울며 버틴다',sub:'궁에 들어가지 않겠다고 한다',p,tags:['부모와 사이가 멀어질 수 있음'],fn:()=>{
      if(chance(p)){P.parentRel=clamp(P.parentRel-8);say('끝내 부모가 뜻을 거두었다. 집에 남게 되었다.','big');}
      else{P.parentRel=clamp(P.parentRel-15);say('울며 버텼으나 끝내 궁으로 보내졌다.','big');changeJob('court');}}}]};
}

/* ---- 생업 고르기 ---- */
const JOB_DESC={
  scholar:['과거 공부','서당과 향교에서 글을 읽어 소과·문과에 나아간다. 학식이 중요하다.'],
  official:['벼슬살이','조정에서 품계를 쌓는다.'],
  hunjang:['서당에 다니며 글공부','글을 깨쳐 훗날 훈장이 될 수도 있다. 학식이 중요하다.'],
  sword:['검을 배운다','무예를 갈고닦아 이름난 검객이 된다. 담력이 중요하다.'],
  soldier:['군에 든다','군졸에서 초관·만호로 오른다. 담력이 중요하다.'],
  farmer:['농사','땅을 일구어 자작농·부농이 된다. 재산이 모이면 오른다.'],
  merchant:['장사','보부상에서 객주·거상이 된다. 재산이 모이면 오른다.'],
  weaver:['삯바느질','바느질 솜씨로 품삯을 받아 이름난 침모가 된다. 재주가 중요하다.'],
  doctor:['의술','의원 견습에서 이름난 의원이 된다. 학식이 중요하다.'],
  uinyeo:['의녀','여인을 진료하는 의녀가 된다. 학식이 중요하다.'],
  interp:['역관','외국 말을 배워 통역을 맡는다. 학식이 중요하다.'],
  painter:['그림','도화서 화원을 꿈꾸며 그림을 그린다. 재주가 중요하다.'],
  gwangdae:['광대','놀이판에서 줄타기와 소리로 이름을 얻는다. 재주가 중요하다.'],
  yein:['예인의 길','사당패를 따라 소리와 춤을 익혀 명창·명무가 된다. 재주가 중요하다.'],
  gisaeng:['기방에 들어간다','기적에 이름을 올리고 가무와 시서를 익힌다. 명기가 될 수도 있다.'],
  court:['궁녀로 들어간다','궁에 들어가 생각시가 된다. 혼인하려면 궁을 떠나야 해서 쉽지 않다.'],
  lady:['규방 살림','집안 살림을 익혀 안주인·종부가 된다. 매력이 중요하다.'],
  slave:['주인집 일','시키는 일을 하며 산다.']
};
const JOB_TAGS={gisaeng:['신분 변화: 천민(기적)','평판 ↓','다시 벗어나려면 속량해야 함'],court:['궁에 매임','혼인이 어려움'],yein:['떠돌이 삶','평판 조금 ↓'],sword:[],hunjang:[]};
function jobChoices(){
  const a=P.age;
  if(a<8)return {list:[],why:'아직 생업을 정할 나이가 아니다.'};
  if(P.cls==='royal')return {list:[],why:'왕실 사람은 생업을 가질 수 없었다.'};
  if(P.court)return {list:[],why:'궁에 든 몸이라 다른 길을 걸을 수 없다.'};
  if(P.job&&['concubine','queen','buma'].includes(P.job.k))return {list:[],why:'지금 자리에서 다른 생업을 가질 수 없다.'};
  if(P.sub==='gisaeng')return {list:[],why:'기적에 매인 몸이라 마음대로 떠날 수 없다. 속량되어야 벗어날 수 있다.'};
  if(P.exile)return {list:[],why:'유배 중에는 생업을 바꿀 수 없다.'};
  const F=P.female;let L=[];
  if(P.cls==='yangban'){
    if(P.sub==='seo')L=F?['lady','weaver','hunjang','sword']:['scholar','sword','interp','doctor','painter','merchant'];
    else L=F?['lady','weaver','hunjang','sword']:['scholar','sword','farmer','merchant','painter'];
  } else if(P.cls==='jungin')L=F?['uinyeo','weaver','merchant','hunjang','yein']:['doctor','interp','painter','merchant','hunjang','sword'];
  else if(P.cls==='sangmin')L=F?['weaver','merchant','farmer','hunjang','yein','uinyeo','gisaeng','court']:['farmer','merchant','soldier','sword','hunjang','yein','painter'];
  else if(P.sub==='gwangdae')L=['gwangdae','yein'];
  else L=F?['slave','gisaeng','court']:['slave'];
  if(a>17)L=L.filter(k=>k!=='court');
  if(a>24)L=L.filter(k=>k!=='gisaeng');
  if(P.married)L=L.filter(k=>!['gisaeng','court'].includes(k));
  if(P.job&&P.job.k==='official')L=['official',...L.filter(k=>k!=='scholar')];
  if(P.job&&!L.includes(P.job.k)&&JOB_DESC[P.job.k])L.unshift(P.job.k);
  return {list:L,why:L.length<=1&&P.sub==='nobi'&&!F?'노비 사내아이에게 고를 수 있는 길은 없었다. 면천해야 다른 길이 열린다.':''};
}
function changeJob(k){
  const cur=P.job&&P.job.k;if(cur===k)return;
  if(k==='official'&&!(P.job&&P.job.k==='official'))return;
  P.lastJobChange=P.year;
  if(k==='gisaeng'){P.cls='cheonmin';P.sub='gisaeng';P.home='관아 근처 기방';setJob('gisaeng',P.age>=18?1:0);fx({fame:-8},true);say('기방에 들어가 기적에 이름을 올렸다. 이제 기생의 길을 걷게 되었다.','big');note('gisaeng');ev('job','기방에 들어갔다');return;}
  if(k==='court'){P.court=true;P.home='궁궐 안 처소';setJob('court',P.age>=18?1:0);say('궁에 들어가 생각시가 되었다. 이제 궁이 그대의 집이었다.','big');note('gungnyeo');ev('court','궁에 들어갔다');return;}
  if(k==='yein')fx({fame:-3},true);
  setJob(k,0);
  say(`앞으로 ‘${JOB_DESC[k][0]}’ 길을 걷기로 하였다.`,'big');ev('job',`${JOB_DESC[k][0]}의 길을 택하였다`);
}
function careerScene(){
  P.flags.careerAsked=1;
  const c=jobChoices();if(!c.list.length)return null;
  return {kind:'major',title:'앞으로의 길',text:'열 살이 되었다. 앞으로 무엇을 배우며 자랄 것인가. 이 길은 나중에 바꿀 수도 있다.',opts:c.list.map(k=>({t:JOB_DESC[k][0],sub:JOB_DESC[k][1],p:null,tags:[`직책: ${JOBS[k].ladder[0]}`,...(JOB_TAGS[k]||[])],fn:()=>{if(!(P.job&&P.job.k===k))changeJob(k);else say(`지금처럼 ‘${JOB_DESC[k][0]}’ 길을 걷기로 마음을 굳혔다.`);}}))};
}

/* ---- 올해의 중점 ---- */
function availFoci(){
  const a=P.age;
  if(a<7)return {list:[],why:'아직 어려 뛰놀며 자랐다.'};
  const L=['grace','know','art','wit','brave','health'];
  if(a>=18){L.push('wealth','love');if(highPlace(P)||P.realSpouse)L.push('power');}
  L.push('rest');
  return {list:L,why:''};
}
function defyFocus(){
  if(P.lastDefy===P.year)return null;P.lastDefy=P.year;prel();
  const who=P.court?'상궁':P.sub==='gisaeng'?'행수':'부모';
  const p=clamp(.4+P.st.brave/200+(P.court||P.sub==='gisaeng'?0:(P.parentRel-50)/400),.15,.75);
  if(chance(p)){P.flags.freeFocus=1;if(who==='부모')P.parentRel=clamp(P.parentRel-6);say(`${who}에게 내 뜻대로 배우겠다고 하였다. 마지못해 허락을 받았다.`,'big');return true;}
  if(who==='부모')P.parentRel=clamp(P.parentRel-10);fx({worry:6},true);say(`${who}에게 내 뜻대로 배우겠다고 하였으나 꾸중만 들었다.`);return false;
}
function freeFocusScene(){
  const av=availFoci();
  const D=typeof FOCUS_DESC!=='undefined'?FOCUS_DESC:{};
  return {kind:'major',title:'올해의 중점',text:'해마다 무엇에 힘쓸지 고르면 그쪽 능력치가 오른다. 한 번 고르면 해가 바뀌어도 이어지고, 왼쪽 ‘올해의 중점’에서 언제든 세월을 멈추지 않고 바꿀 수 있다.',
    opts:FOCI.filter(f=>av.list.includes(f.k)).map(f=>({t:f.n,sub:D[f.k]?D[f.k][0]+' · '+D[f.k][1]:'',p:null,tags:[],fn:()=>{P.focus=f.k;P.flags.focusPicked=1;say(`앞으로 ‘${f.n}’에 힘쓰기로 하였다.`);}}))};
}
function yFirstFocus(){
  if(P.flags.focusAsked)return;
  const av=availFoci();
  if(!av.list.length)return;
  if(av.forced){
    P.flags.focusAsked=1;prel();
    const f0=FOCI.find(f=>f.k===av.list[0]);
    const p=clamp(.4+P.st.brave/200+(P.parentRel-50)/400,.15,.75);
    return {kind:'major',title:'부모의 뜻 · 배움',text:`${av.why} ${f0.n}에 힘쓰라 한다.`,opts:[
      {t:`뜻을 따른다 · ${f0.n}`,sub:'정해 준 대로 배운다',p:null,safe:true,tags:['부모와 사이 ↑'],fn:()=>{P.focus=f0.k;P.parentRel=clamp(P.parentRel+5);say('정해 준 대로 배우기로 하였다.');}},
      {t:'내가 배우고 싶은 것을 배우겠다고 한다',sub:'뜻대로 되면 스스로 중점을 고를 수 있다',p,tags:['부모와 사이가 멀어질 수 있음'],fn:()=>{
        if(chance(p)){P.flags.freeFocus=1;P.parentRel=clamp(P.parentRel-6);say('부모가 마지못해 허락하였다.','big');return freeFocusScene();}
        P.parentRel=clamp(P.parentRel-12);fx({worry:6},true);say('허락을 받지 못하고 정해 준 대로 배우게 되었다.');}}]};
  }
  P.flags.focusAsked=1;
  const D=typeof FOCUS_DESC!=='undefined'?FOCUS_DESC:{};
  return {kind:'major',title:'올해의 중점',text:`${P.age<18?'이제 스스로 무엇에 힘쓸지 정할 나이가 되었다.':'이제 스스로 무엇에 힘쓸지 정할 수 있게 되었다.'} 해마다 무엇에 힘쓸지 고르면 그쪽 능력치가 오른다. 한 번 고르면 해가 바뀌어도 이어지고, 왼쪽 ‘올해의 중점’에서 언제든 세월을 멈추지 않고 바꿀 수 있다.`,
    opts:FOCI.filter(f=>av.list.includes(f.k)).map(f=>({t:f.n,sub:D[f.k]?D[f.k][0]+' · '+D[f.k][1]:'',p:null,tags:[],fn:()=>{P.focus=f.k;P.flags.focusPicked=1;say(`앞으로 ‘${f.n}’에 힘쓰기로 하였다.`);}}))};
}
function yFocus(){
  const av=availFoci();
  if(!av.list.length){if(P.age>=2&&P.age<7&&chance(.5))say(pickLine(CHILD_LINES[P.cls]||CHILD_LINES.sangmin));else if(av.why&&chance(.4))say(av.why);fx(P.sub==='nobi'&&P.age>=7?{health:1,brave:1,wit:1}:{health:1},true);return;}
  if(!av.list.includes(P.focus)||av.forced&&P.age<12&&!P.flags.focusPicked)P.focus=av.list[0];
  const f=FOCI.find(x=>x.k===P.focus);
  const o={...f.st};
  /* 중점으로 고른 능력치는 해마다 5~10씩 오른다 */
  for(const k in o){const v=o[k];o[k]=Math.abs(v)>=3?Math.sign(v)*ri(5,10):v+ri(0,1);}
  if(P.age>=40)o.health=(o.health||0)-ri(0,2);
  if(P.age>=55)o.health=(o.health||0)-ri(1,3);
  if(P.age>=70)o.health=(o.health||0)-ri(1,3);
  if(P.age>=40&&chance(.2))o.look=(o.look||0)-1;
  if(P.st.worry>70)o.health=(o.health||0)-2;
  if(P.age>=12){const js=P.job?JOBS[P.job.k].stat:null;if(js&&js!=='health'&&chance(.6))o[js]=(o[js]||0)+1;if(chance(.35))o.wit=(o.wit||0)+1;if(P.age<30&&chance(.25))o.look=(o.look||0)+1;}
  if(f.power){P.power=Math.min(100,P.power+ri(6,11));}
  if(f.love){const tg=targetP();Object.values(P.people).forEach(x=>{if((x.kind==='love'||x.kind==='spouse')&&x.alive){if(tg&&x.id===tg.id){x.t=clamp(x.t+7);x.h=clamp(x.h+4);}else{x.t=clamp(x.t+(tg?1:3));x.h=clamp(x.h+(tg?1:2));}}});if(tg&&chance(.35))say(`${callOf(tg)}에게 마음을 쓰며 한 해를 보냈다.`);}
  if(P.helper&&P.people[P.helper])P.people[P.helper].h=clamp(P.people[P.helper].h+2);
  fx(o);
  if(f.k==='art'&&P.age>=10&&chance(.25))say(`${P.artK} 솜씨가 늘었다.`);
}

/* ---- 그해의 작은 일: 중점과 상관없이 무작위로 능력치가 오른다 ---- */
const GROW={
  look:{young:['냇물에 비친 제 얼굴이 몰라보게 고와졌다.','어른들이 그대를 보고 인물이 났다며 혀를 찼다.','어머니가 머리 빗는 법과 옷매무새를 일러 주었다.','동무들 사이에서 그대의 웃는 얼굴이 곱다는 말이 돌았다.'],
        adult:['잔칫집에 갔다가 여러 사람의 눈길을 받았다.','몸가짐이 단정하다는 칭찬을 들었다.','세월이 얼굴에 은근한 기품을 더해 주었다.','곱게 차려입고 나선 날, 지나가던 이들이 돌아보았다.']},
  know:{young:['어깨너머로 들은 글귀를 줄줄 외워 어른들을 놀라게 하였다.','떠돌이 선비에게 옛이야기를 듣고 밤새 곱씹었다.','밤마다 등잔 밑에서 글자를 하나씩 익혔다.','마을 노인에게 별자리와 절기를 배웠다.'],
        adult:['빌려 온 서책을 밤새 읽었다.','장터에서 옛 시를 읊는 선비와 말을 섞으며 많은 것을 배웠다.','이웃 일을 거들다가 셈법을 익혔다.','어려운 편지를 대신 읽어 주다 글이 늘었다.']},
  art:{young:['장터 놀이판을 보고 와서 소리를 흉내 내었다.','흙바닥에 그린 그림을 보고 어른들이 감탄하였다.','버들피리를 깎아 곧잘 불었다.','어깨너머로 바느질과 매듭을 익혔다.'],
        adult:['손끝이 야무지다는 말을 들었다.','잔치 자리에서 흥에 겨워 한 가락 뽑았다.','틈틈이 손에 익힌 솜씨가 한결 나아졌다.','이름난 장인의 일을 곁에서 지켜보며 요령을 익혔다.']},
  wit:{young:['어른들 말 속에 숨은 뜻을 알아채기 시작하였다.','동무들 다툼을 슬기롭게 말려 칭찬을 들었다.','장터에서 셈을 속이려는 장사치를 알아보았다.','누가 거짓말을 하는지 눈빛으로 알아챘다.'],
        adult:['남의 말을 곧이듣지 않는 법을 배웠다.','집안의 다툼 속에서 사람의 속내를 읽는 눈이 생겼다.','소문의 앞뒤를 따져 보다 진실을 짐작하였다.','낯선 이의 꿍꿍이를 미리 알아채 화를 피하였다.']},
  brave:{young:['동네 큰 개에게 쫓기는 동생을 감싸 주었다.','높은 나무에 올라가 연을 꺼내 왔다.','캄캄한 밤길을 홀로 다녀왔다.','덩치 큰 아이에게 맞서 물러서지 않았다.'],
        adult:['불이 난 이웃집에 뛰어들어 세간을 건져 냈다.','산길에서 만난 도적 앞에서 침착하게 버텼다.','억울한 일을 당한 이웃을 위해 관아에 나섰다.','거센 물살을 건너 급한 소식을 전하였다.']},
  health:{young:['들판을 쏘다니며 몸이 튼튼해졌다.','한 해 동안 잔병치레 없이 지냈다.'],
        adult:['좋은 약재를 얻어 달여 먹었다.','한 해 동안 큰 병 없이 지냈다.','부지런히 걸어 다니며 몸이 가벼워졌다.']}
};
const GROW_K=['look','know','art','wit','brave','health'];
function yGrowth(){
  if(P.age<7)return;
  const n=wpick([[0,2],[1,5],[2,3]]);
  const used=[];
  for(let i=0;i<n;i++){
    const ks=GROW_K.filter(k=>!used.includes(k)&&!(k==='health'&&P.age>=50&&chance(.5)));
    const k=R(ks);used.push(k);
    const pool=GROW[k][P.age<18?'young':'adult'];
    const o={};o[k]=ri(2,5);
    say(R(pool));fx(o);
  }
}

/* ---- 그해의 이야기 ---- */
function yFlavor(){
  if(P.age<7)return;
  if(P.age>=62&&chance(.5)){say(R(OLD_LINES));return;}
  if(P.age<18){if(chance(.55))say(pickLine(CHILD_LINES[P.cls]||CHILD_LINES.sangmin));
    // 벗
    if(P.age>=6&&P.age<=11&&!P.flags.friend&&chance(.35)){
      P.flags.friend=1;const sameSex=chance(.5);const fem=sameSex?P.female:!P.female;
      const f=newPerson({kind:'friend',female:fem,cls:P.cls==='royal'?'yangban':P.cls,sub:P.cls==='cheonmin'?P.sub:'',born:P.born+ri(-1,1),place:'이웃',h:20,t:20});
      say(`이웃의 ${f.female?'계집아이':'사내아이'} ${gwawa(f.name)} 둘도 없는 벗이 되었다.`);
    }
    const fr=peopleOf('friend').find(x=>x.alive);
    if(fr&&chance(.45)){fr.h=clamp(fr.h+ri(3,8));fr.t=clamp(fr.t+ri(3,8));say(R([`${gwawa(fr.name)} 함께 개울에서 가재를 잡았다.`,`${fr.name}에게 몰래 엿을 나누어 주었다.`,`${gwawa(fr.name)} 다투었다가 다음 날 다시 웃으며 만났다.`,`${fr.name}의 집 마당에서 해 지는 줄 모르고 놀았다.`]));}
    // 조력자
    if(P.age===10&&!P.helper&&(P.cls==='yangban'||P.cls==='royal'||P.sub==='gisaeng'||P.court)){
      const t=P.court?'동기 나인':P.sub==='gisaeng'?'기방 동무':P.female?'몸종':'몸종 아이';
      const hp=newPerson({kind:'helper',female:P.court||P.sub==='gisaeng'?true:P.female,cls:'cheonmin',sub:'nobi',born:P.born+ri(-2,2),h:35,t:40,title:''});
      hp.role=t;hp.nick=1;P.helper=hp.id;say(`${iga(hp.name)} 그대 곁에 ${euro(t)} 붙었다.`);
    }
    return;
  }
  if(chance(.5))say(pickLine(ADULT_LINES[P.cls]||ADULT_LINES.sangmin));
  if(!P.helper&&P.age===18){const hp=newPerson({kind:'helper',female:P.female,cls:P.cls==='royal'?'yangban':P.cls,born:P.born+ri(-2,2),h:35,t:40});hp.role='동무';hp.nick=1;P.helper=hp.id;}
  // 벗이 인연으로
  const fr=peopleOf('friend').find(x=>x.alive&&ageOf(x)>=18);
  if(fr&&!fr.grown){fr.grown=1;
    if(chance(.6)&&(fr.female!==P.female||chance(.25))&&!P.married){fr.kind='love';fr.h=Math.round(fr.h*.6);fr.t=Math.round(fr.t*.6);fr.status='acq';fr.place='어릴 적 벗';fr.metY=P.year;fr.metA=P.age;fr.known=true;fr.nick=1;
      say(`어릴 적 벗 ${iga(fr.name)} 몰라보게 자라 있었다. 마주친 눈길이 예전 같지 않았다.`,'big');}
    else{say(`어릴 적 벗 ${iga(fr.name)} 먼 곳으로 떠났다.`);fr.alive=false;fr.gone=true;}
  }
  // 악연 키우기
  for(const r of peopleOf('rival')){if(r.alive){r.grudge=clamp(r.grudge+ri(1,6));}}
}

/* ---- 인연 생성 ---- */
function loveAllowed(){return P.age>=18;}
function yLoveSpawn(){
  if(!loveAllowed())return;
  const act=Object.values(P.people).filter(x=>x.kind==='love'&&x.alive&&x.status!=='parted');
  if(act.length>=6)return;
  let p=P.married?.1:P.age<32?.5:.25;
  if(G.fest)p+=.25;
  if(P.court&&!(P.job&&P.job.k==='concubine'))p*=.4;
  if(P.job&&P.job.k==='gisaeng')p+=.2;
  if(P.job&&(P.job.k==='concubine'||P.job.k==='queen'))p*=.15;
  if(!chance(p)){if(!P.married&&!(P.job&&['concubine','queen'].includes(P.job.k)))admirer();return;}
  spawnLove();
}
function firstImpression(x,quiet){
  const st=P.st,tk=x.taste;
  const parts=[];
  parts.push(['look',st.look*.38]);
  if(tk==='poem'||tk==='book')parts.push(['know',st.know*.3]);
  if(tk==='music'||tk==='paint')parts.push(['art',st.art*.3]);
  if(tk==='martial')parts.push(['brave',st.brave*.3]);
  if(tk==='flower'||tk==='sweet')parts.push(['look',st.look*.08]);
  if(st.fame>=55)parts.push(['fame',(st.fame-40)*.3]);
  let t=4+parts.reduce((a,b)=>a+b[1],0)+ri(-5,5);
  if(x.cls===P.cls)t+=4;
  if(['yangban','royal'].includes(x.cls)&&['sangmin','cheonmin'].includes(P.cls))t-=6;
  t=Math.round(clamp(t,0,70));x.t=Math.max(x.t||0,t);
  const top=parts.sort((a,b)=>b[1]-a[1])[0];
  let why='';
  if(t>=25){
    if(top[0]==='look')why=st.look>=60?'그대의 고운 자태에 그의 눈길이 오래 머물렀다.':'그대를 보고 수줍게 웃었다.';
    else if(top[0]==='know')why='그대의 글솜씨에 그가 감탄하였다.';
    else if(top[0]==='art')why=`그대의 ${P.artK} 솜씨에 그가 눈을 떼지 못하였다.`;
    else if(top[0]==='brave')why='그대의 당찬 기개가 그의 마음에 들었다.';
    else if(top[0]==='fame')why='소문으로만 듣던 그대를 만나 반가워하였다.';
  }
  if(why&&!quiet)say(why);
  return t;
}
function admirer(){
  const st=P.st;const top=Math.max(st.look,st.art,st.know);
  if(top<55||!chance(.12+(top-55)/300))return;
  const x=spawnLove({quiet:true});
  x.t=clamp(Math.max(x.t,40+ri(0,15)));x.status='their';
  const why=st.look===top?'고운 자태':st.art===top?`${P.artK} 솜씨`:'글솜씨';
  say(`그대의 ${why}가 소문이 나, ${iga(callOf(x))} 사람을 넣어 안부를 물어 왔다.`,'big');
}
function spawnLove(o={}){
  const same=chance(.12);const fem=same?P.female:!P.female;
  let cls=P.cls==='royal'?'yangban':P.cls;
  if(P.sub==='gisaeng'&&!fem)cls=wpick([['yangban',6],['jungin',2],['sangmin',2]]);
  else if(chance(.15))cls=R(Object.keys(CLS).filter(c=>c!=='royal'));
  const sub=cls==='cheonmin'?(fem&&chance(.35)?'gisaeng':'nobi'):'';
  const place=o.place||(G.fest?G.fest.place:R(PLACES[P.court?'royal':P.cls]||PLACES.sangmin));
  const x=newPerson({kind:'love',female:fem,cls,sub,born:P.year-clamp(P.age+ri(-4,6),18,60),place});
  if(o.quiet){firstImpression(x,true);return x;}
  const pr=persona(x.persona);
  say(`${place}에서 ${eulreul(fullOf(x))} 처음 보았다. ${R([`${pr.n}이 묻어나는 사람이었다.`,'자꾸만 눈길이 갔다.','스치듯 지나쳤으나 마음에 남았다.','짧게 몇 마디를 나누었다.'])}`,'big');
  ev('meet',x.id);
  firstImpression(x);
  if(!P.married&&chance(.15)){const r=newPerson({kind:'rival',female:P.female,cls:x.cls==='royal'?'yangban':x.cls,born:P.year-ri(17,28),grudge:20});r.note=`${eulreul(callOf(x))} 두고 다투는 연적`;say(`그런데 ${callOf(x)}에게 마음을 둔 이가 또 있다는 말이 들렸다. ${r.name}${bat(r.name)?'이라':'라'} 하였다.`);}
  return x;
}

function seekLove(kind){
  const fem=!P.female;
  let o={kind:'love',female:fem,born:P.year-clamp(P.age+ri(-3,5),18,60)};
  let place;
  if(kind==='royal'){
    o.cls='royal';o.sur='이';o.bon='전주';
    const gh=R(['영','화','덕','은','숙','정','명','경','의','순','익','양'])+R(['창','원','안','성','양','천','평','춘','릉','산']);
    o.title=fem?gh+'옹주':gh+'군';
    place=R(['종친의 잔치','왕실 사냥터','궁궐 후원','종묘 제례를 마친 길']);
  } else if(kind==='yangban'){o.cls='yangban';place=R(PLACES.yangban);}
  else {o.cls=R(['sangmin','sangmin','jungin']);place=R(PLACES[o.cls]);}
  o.place=place;
  const x=newPerson(o);
  if(kind==='royal')x.pos=fem?'옹주':'왕자군';
  const pr=persona(x.persona);
  say(`인연을 찾아 나섰다. ${place}에서 ${eulreul(x.title||fullOf(x))} 만났다. ${pr.n}이 묻어나는 사람이었다.`,'big');
  ev('meet',x.id);
  firstImpression(x);
  if(kind==='royal'&&!['yangban','royal'].includes(P.cls))say('신분이 하늘과 땅만큼 차이 나는 사람이었다. 맺어지기는 어려울 것이다.');
  P.lastSeek=P.year;
  if(!targetP())P.target=x.id;
  return x;
}

/* ---- 인연 사건 (한 해에 한 번) ---- */
function targetP(){const x=P.target&&P.people[P.target];if(!x||!x.alive||x.status==='parted'||!['love','spouse'].includes(x.kind)){P.target=null;return null;}return x;}
function yLoveEvent(){
  if(!loveAllowed())return;
  const tg=targetP();
  if(tg){
    if(P.lastLove&&P.year-P.lastLove<2)return;
    if(!chance(G.fest?.7:.5))return;
    P.lastLove=P.year;return loveScene(tg);
  }
  /* 배우자와의 일은 사이가 틀어졌을 때만 찾아온다 */
  const pool=Object.values(P.people).filter(x=>(x.kind==='love'&&x.status!=='parted'||x.kind==='spouse'&&(x.t<35||x.h<30))&&x.alive);
  if(!pool.length)return;
  if(P.lastLove&&P.year-P.lastLove<2)return;
  if(!chance(.3))return;
  const x=wpick(pool.map(p=>[p,10+p.h+p.t+(G.fest?10:0)+(p.kind==='spouse'?15:0)]));
  P.lastLove=P.year;return loveScene(x);
}
function actOdds(x,a){
  const pr=persona(x.persona);
  let p=.34+x.t/260+P.st.wit/450;
  if(pr.like.includes(a))p+=.2;if(pr.hate.includes(a))p-=.15;
  if(a==='gift'){p+=x.known?.12:-.04;}
  if(a==='poem'){p+=(P.st.know-40)/300;if(x.taste==='poem'||x.taste==='book')p+=.1;}
  if(a==='meet'){const hp=P.helper&&P.people[P.helper];if(hp)p+=hp.h/500;}
  if(x.kind==='spouse')p+=.15;
  return clamp(p,.08,.92);
}
function oddsWord(p){
  if(P.st.wit<28&&chance(.6))return '알 수 없음';
  return p>=.7?'높음':p>=.47?'반반':p>=.25?'낮음':'아주 낮음';
}
/* ---- 부부 사이의 일 ---- */
const SP_LIKE={warm:['talk','gift'],blunt:['care'],playful:['outing','gift'],stern:['care','elder'],shy:['talk'],bold:['outing'],cool:['care'],tender:['talk','elder']};
const SP_HATE={blunt:['talk'],stern:['outing'],cool:['gift'],shy:['outing']};
function spouseScene(x){
  const king=x.kingRole;const w=spouseWord(x);
  const el=P.elder&&P.people[P.elder]&&P.people[P.elder].alive?P.people[P.elder]:null;
  const where=G.fest?G.fest.n+'을 맞아':R(['어느 봄날','어느 여름날','비 내리던 날','달 밝은 밤','어느 가을날','눈 내리던 날']);
  const acts=king?[
    ['talk','임금께 시를 지어 올린다','글솜씨와 마음이 함께 전해진다'],
    ['outing','후원 산책길에 모신다',G.fest?`${G.fest.n} 놀이를 함께 즐긴다`:'꽃이 핀 후원을 함께 거닌다'],
    ['care','수라와 탕약을 손수 살핀다','정성이 눈에 띈다'],
    ['gift','손수 수놓은 주머니를 올린다',x.known?`${eulreul(taste(x.taste).n)} 좋아하신다는 것을 안다`:'임금의 취향을 알면 더 잘 통한다']
  ]:[
    ['talk','속마음을 터놓는다','밤늦도록 이야기를 나눈다'],
    ['outing','함께 나들이를 간다',G.fest?`${G.fest.n} 구경을 함께 간다`:'꽃구경이나 달구경을 함께 간다'],
    ['care',P.female?'살림과 뒷바라지에 정성을 쏟는다':'아내의 고단함을 덜어 준다',P.female?'남편의 의복과 끼니를 손수 챙긴다':'집안일을 거들고 살뜰히 챙긴다'],
    ['gift','마음을 담은 선물을 한다',x.known?eulreul(taste(x.taste).gift)+' 고른다':'취향을 알면 더 잘 통한다'],
    ...(el?[['elder',P.female?'시어머니를 정성껏 모신다':'장모께 예를 다한다','집안 어른의 마음을 얻으면 부부 사이도 좋아진다']]:[])
  ];
  const odds=k=>{let p=.42+x.t/300+P.st.wit/500;const L=SP_LIKE[x.persona]||[],H=SP_HATE[x.persona]||[];if(L.includes(k))p+=.2;if(H.includes(k))p-=.15;if(k==='gift')p+=x.known?.1:-.05;if(k==='talk'&&king)p+=(P.st.know-40)/300;if(k==='elder'&&el)p+=(P.st.grace-40)/300;return clamp(p,.1,.92);};
  const opts=acts.map(([k,t,sub])=>{const p=odds(k);const tags=['정 ↑'];if(k==='gift')tags.push('재산 조금 ↓');if(k==='elder')tags.push('집안 어른과의 사이 ↑');if(king)tags.push('총애 ↑');
    return {t,sub,p,tags,fn:()=>doSpouse(x,k,p,el)};});
  opts.push({t:'무심히 지나간다',sub:'올해는 그냥 넘긴다',p:null,safe:true,tags:['정 조금 ↓'],fn:()=>{x.h=clamp(x.h-2);x.t=clamp(x.t-3);say('그해에는 서로 데면데면하게 지냈다.');}});
  return {kind:'love',title:`부부의 정 · ${king?x.title:w}`,pid:x.id,text:`${where}, ${king?'임금':w}${king?'과':P.female?'과':'와'} 마주한 날이었다. 지금 ${king?'그대를 향한 총애':'부부의 정'}은 ${king?(P.favor>60?'두터운':'아직 옅은')+' 편이다':HEART[hLv(x.t)]+' 정도였다'}.${x.known?` ${eulreul(persona(x.persona).n)} 지닌 사람이다.`:''}`,opts};
}
function doSpouse(x,k,p,el){
  const king=x.kingRole;const w=king?'임금':spouseWord(x);
  if(k==='gift')P.wealth=Math.max(0,P.wealth-({royal:30,yangban:4,jungin:3,sangmin:.6,cheonmin:.1}[P.cls]||.5));
  if(chance(p)){
    const liked=(SP_LIKE[x.persona]||[]).includes(k);
    x.t=clamp(x.t+(liked?20:12));x.h=clamp(x.h+ri(8,12));x.maxH=Math.max(x.maxH,x.h);x.known=true;
    if(king)P.favor=clamp(P.favor+(liked?12:7));
    if(k==='elder'&&el)el.rel=clamp(el.rel+12);
    const ok={talk:king?'임금이 그대의 시를 오래 들여다보았다.':`${w}와(과) 밤늦도록 이야기를 나누었다. 몰랐던 속마음을 알게 되었다.`,
      outing:king?'후원을 거닐며 임금이 오랜만에 웃었다.':`${w}와(과) 나들이를 다녀왔다. 오랜만에 둘이 웃었다.`,
      care:king?'임금이 그대의 정성을 칭찬하였다.':P.female?'남편이 그대의 정성을 알아주었다.':'아내가 그대의 마음 씀씀이에 고마워하였다.',
      gift:`${w}이(가) 선물을 받고 환하게 웃었다.`,
      elder:P.female?'시어머니의 낯빛이 한결 부드러워졌다. 남편도 그 모습을 보고 흐뭇해하였다.':'장모가 그대를 크게 반겼다. 아내도 기뻐하였다.'}[k];
    say(ok.replace(`${w}와(과)`,gwawa(w)).replace(`${w}이(가)`,iga(w))+(liked?' 정이 부쩍 깊어졌다.':''),'big');
    fx({worry:-3},true);
  } else {
    x.t=clamp(x.t-5);
    const ng={talk:king?'임금이 시를 건성으로 넘겼다.':'이야기 끝에 말다툼이 일었다.',outing:king?'임금이 정사에 바빠 산책을 물렸다.':'나들이 내내 서로 말이 없었다.',care:'정성을 쏟았으나 알아주지 않아 서운하였다.',gift:'선물이 마음에 차지 않는 눈치였다.',elder:P.female?'시어머니가 정성을 몰라주어 오히려 꾸중만 들었다.':'장모의 기색이 시큰둥하였다.'}[k];
    say(ng);if(k==='elder'&&el)el.rel=clamp(el.rel-4);
  }
}
function loveScene(x){
  if(x.kind==='spouse')return spouseScene(x);
  const isSp=x.kind==='spouse';
  const where=G.fest?G.fest.n+'을 맞아':R(['어느 봄날','어느 여름날','비 내리던 날','달 밝은 밤','어느 가을날','눈 내리던 날']);
  const nm=callOf(x);
  const text=isSp?`${where}, ${spouseWord(x)}${P.female?'과':'와'} 단둘이 마주 앉았다. 지금 정은 ${HEART[hLv(x.h)]} 정도였다.`
    :`${where}, ${nm}의 소식이 들려왔다. (${personInfo(x)}) ${x.known?`${eulreul(persona(x.persona).n)} 지닌 사람이고, ${eulreul(taste(x.taste).n)} 좋아한다.`:'아직 어떤 사람인지 잘 모른다.'}`;
  const opts=ACTIONS.map(a=>{
    if(a.k==='ignore')return {t:isSp?'무심히 지나간다':a.n,sub:a.sub,p:null,tags:['정 변화 없음'],safe:true,fn:()=>{x.h=clamp(x.h-3);say('그해에는 마음을 내비치지 않았다.');}};
    const p=actOdds(x,a.k);
    const tags=[];
    if(a.k==='meet'&&!isSp)tags.push('들키면 평판 ↓');
    if(a.k==='gift')tags.push('재산 조금 ↓');
    if(P.married&&!isSp)tags.push('혼인한 몸이다');
    if(P.court&&!isSp&&!(P.job&&P.job.k==='concubine'))tags.push('궁녀의 연정은 큰 죄');
    return {t:a.k==='meet'&&isSp?'함께 나들이를 간다':a.n,sub:a.k==='gift'&&x.known?`${eulreul(taste(x.taste).gift)} 골라`:a.sub,p,tags:['정 ↑',...tags],fn:()=>doAct(x,a.k,p)};
  });
  return {kind:'love',title:isSp?`부부의 정 · ${nm}`:`인연 · ${nm}`,pid:x.id,text,opts};
}
function doAct(x,a,p){
  const ok=chance(p);const nm=callOf(x);const tp=taste(x.taste),pr=persona(x.persona);
  if(a==='gift')P.wealth=Math.max(0,P.wealth-({royal:30,yangban:4,jungin:3,sangmin:.6,cheonmin:.1}[P.cls]||.5));
  if(ok){
    const liked=pr.like.includes(a)||(a==='gift'&&x.known);
    const g=liked?24:15;x.t=clamp(x.t+g);x.h=clamp(x.h+ri(10,16));x.maxH=Math.max(x.maxH,x.h);
    x.known=true;
    const lines={letter:[`${nm}에게 서찰을 보냈다. 며칠 뒤 답장이 왔다.`],meet:[`남몰래 ${gwawa(nm)} 만났다. 짧은 시간이 꿈만 같았다.`],gift:[`${nm}에게 ${eulreul(tp.gift)} 건넸다. 환하게 웃었다.`],poem:[`${gwawa(nm)} 시를 주고받았다. 글 속에 마음이 비쳤다.`]};
    say(lines[a][0]+(liked?' 정이 부쩍 깊어졌다.':''),'big');
    if(a==='letter'||a==='poem')addLetter(x,a);
    fx({worry:-3},true);
  } else {
    x.t=clamp(x.t-6);
    const lines={letter:`${nm}에게 서찰을 보냈으나 답이 없었다.`,meet:`${gwawa(nm)} 몰래 만나려 하였으나 어긋났다.`,gift:`${nm}에게 선물을 건넸으나 반기지 않았다.`,poem:`시를 건넸으나 ${nm}의 답시가 차가웠다.`};
    say(lines[a]);
    if(a==='meet'&&x.kind!=='spouse'&&chance(.5)){
      const hp=P.helper&&P.people[P.helper];
      if(hp&&hp.h<30&&chance(.4)){say(`${hp.role} ${iga(hp.name)} 입을 잘못 놀려 소문이 퍼졌다.`);hp.h=clamp(hp.h-10);}
      else say('누군가 두 사람을 보았다는 소문이 돌았다.');
      fx({fame:-ri(5,10),worry:8});
      if(P.court&&!(P.job&&P.job.k==='concubine')){courtScandal();}
      if(P.married&&chance(.35))caughtAffair();
    }
  }
  if(x.kind==='love'){
    const was=x.status;
    if(x.h>=60&&x.t>=60)x.status='mutual';else if(x.h>=50&&x.t<35)x.status='crush';else if(x.t>=55&&x.h<35)x.status='their';
    if(was!=='mutual'&&x.status==='mutual'){say(`${gwawa(nm)} 서로 마음이 같다는 것을 알게 되었다.`,'big');ev('mutual',x.id);}
  }
}
function courtScandal(){
  say('궁녀의 연정이 드러나 궁에서 쫓겨났다.','big');P.court=false;P.job=null;P.home='사가(私家)';fx({fame:-20,worry:15});ev('expel','궁에서 쫓겨났다');
}
function caughtAffair(){
  if(P.female){
    note('chilgeo');
    if(chance(.6)){say('남편이 그 일을 알고 크게 노하였다. 그대는 소박을 맞아 시댁에서 쫓겨났다.','big');note('sobak');ev('sobak','소박을 맞았다');
      const sp=spouseP();if(sp){sp.kind='ex';sp.status='parted';}P.spouse=null;P.married=false;P.home='친정 곁방';fx({fame:-25,worry:20});setJobIf('lady',0);}
    else{say('남편이 그 일을 알았으나 덮어 두었다. 집안이 싸늘해졌다.');const sp=spouseP();if(sp){sp.h=clamp(sp.h-25);sp.t=clamp(sp.t-30);}}
  } else {say('그 일이 알려져 평판이 땅에 떨어졌다.','big');fx({fame:-20});const sp=spouseP();if(sp){sp.t=clamp(sp.t-30);}}
}
function setJobIf(k,lv){if(P.job&&P.job.k===k)P.job.lv=lv;}
const LETTERS_FROM=[
  '{s}이 깊었습니다. 그날 들은 목소리가 아직 귀에 남아 잠을 이루지 못합니다.',
  '붓을 들었다 놓기를 몇 번이나 하였는지 모릅니다. 부디 몸 성히 지내십시오.',
  '{s} 바람이 차니 옷깃을 여미십시오. 다음 장날에 먼발치에서라도 뵙고 싶습니다.',
  '보내 주신 글을 베개 밑에 넣어 두었습니다. 꿈에서라도 뵐까 하여서입니다.',
  '세상이 허락하지 않아도, 이 마음만은 제 것이옵니다.',
  '달이 밝아 그대 생각이 납니다. 같은 달을 보고 계시리라 믿습니다.'
];
const POEMS=[
  '달 밝은 뜰에 홀로 앉아\n님 계신 곳 바라보니\n구름만 무심히 흘러가네',
  '봄비에 꽃잎 지는 소리\n님의 발소리인가 하여\n문을 열고 내다보네',
  '강물이 깊다 하나\n이 마음보다 깊으랴\n건너지 못하는 밤이 길다',
  '기러기 한 쌍 날아가니\n부럽고도 부럽구나\n어느 날에 함께 날꼬'
];
function seasonWord(){return R(['봄','여름','가을','겨울']);}
function addLetter(x,a){
  const fromThem=chance(.7);
  const tx=a==='poem'?R(POEMS):R(LETTERS_FROM).replace('{s}',seasonWord());
  P.letters.push({id:uid(),y:P.year,a:P.age,pid:x.id,from:fromThem?callOf(x):'그대',to:fromThem?'그대':callOf(x),text:tx,poem:a==='poem',h:x.h});
}

/* ---- 큰일 (한 해에 하나) ---- */
function yMajor(){
  if(P.dead)return;
  const c=[];const add=(pr,f)=>c.push([pr,f]);
  const y=P.year;
  // 갈림길
  for(const b of BRANCHES){
    if(P.alt)break;
    if(y>=b.warn&&y<b.year&&b.role(P)){say(b.warnText,'warn');}
    if(y===b.year&&b.role(P))add(100,()=>branchScene(b));
  }
  // 전쟁
  const w=WARS.find(x=>y===x[0]);if(w&&P.age>=6)add(95,()=>warScene(w));
  if(w)P.flags.warYear=1;else P.flags.warYear=0;
  // 사화
  if(PURGES[y]&&!P.alt&&(P.job&&P.job.k==='official'||spouseP()&&spouseP().rank>=4)&&P.age>=18)add(85,()=>purgeScene(PURGES[y]));
  if(P.age===13&&!P.flags.careerAsked&&jobChoices().list.length>1)add(70,()=>careerScene());
  if(P.age>=18){
    // 왕실 간택
    if(P.female&&P.cls==='yangban'&&!P.married&&!P.widowed&&P.sub!=='seo'&&P.age<=24){
      if(y>=1412&&y<=1416&&!P.realSpouse&&chance(.35))add(75,()=>crownScene('양녕대군',1394));
      if(y>=1753&&y<=1757&&!P.realSpouse&&chance(.35))add(75,()=>crownScene('사도세자',1735));
      if(isJoseon(y)&&chance(.035))add(65,()=>haremScene());
    }
    if(!P.female&&P.cls==='yangban'&&!P.married&&P.age<=22&&P.sub!=='seo'&&chance(.025))add(60,()=>bumaScene());
    if(P.court&&P.job&&P.job.k==='court'&&P.job.lv>=1&&P.age<=32&&P.st.look>=50&&!P.married&&chance(.07))add(66,()=>seungeunScene());
    if(P.sub==='gisaeng'&&P.job&&P.job.lv>=1&&y>=1494&&y<=1505&&P.age<=28&&P.st.art>=45&&!P.married&&chance(.12))add(66,()=>seungeunScene(true));
    // 고백·혼담
    const mut=Object.values(P.people).find(x=>x.kind==='love'&&x.alive&&x.status==='mutual'&&!x.asked);
    if(mut&&!P.married&&!(P.job&&['concubine','queen'].includes(P.job.k)))add(58,()=>confessScene(mut));
    if(P.sub==='gisaeng'&&P.job&&P.job.k==='gisaeng'&&!P.married){const pat=Object.values(P.people).find(x=>x.kind==='love'&&x.alive&&!x.female&&x.t>=55&&['yangban','jungin','sangmin'].includes(x.cls)&&!x.offered);if(pat)add(57,()=>bushilScene(pat));}
    if(marriageable())add(50,()=>matchScene());
    if(P.married&&P.wantKids===null&&P.year>(P.flags.wedY||0)&&fertile())add(48,()=>kidsScene());
    if(P.flags.askMore&&P.married&&fertile()){P.flags.askMore=0;add(44,()=>kidsScene(true));}
    const kw=P.kids.find(k=>k.alive&&!k.married&&P.year-k.born>=18&&P.year-k.born<=25&&!k.wedAsked);
    if(kw)add(42,()=>kidWedScene(kw));
    if(P.married&&P.age>=33&&!P.kids.some(k=>k.alive)&&!P.flags.adoptAsked)add(38,()=>adoptScene());
    else if(P.age>=25&&!P.flags.adoptAsked&&chance(.015))add(30,()=>adoptScene(true));
    if(P.married&&!P.female&&['yangban','royal'].includes(P.cls)&&P.age>=28&&P.cheopN===0&&chance(.08))add(28,()=>cheopScene());
    if(P.married&&P.female&&spouseP()&&['yangban','royal'].includes(spouseP().cls)&&!spouseP().kingRole&&!P.flags.hubCheop&&P.age>=26&&chance(.06))add(28,()=>husbandCheop());
    const aff=Object.values(P.people).find(x=>x.kind==='love'&&x.alive&&x.h>=55&&x.t>=55&&x.status!=='parted');
    if(P.married&&aff&&!P.flags.affairAsked&&chance(.3))add(36,()=>affairScene(aff));
    if(P.affair&&chance(.3))add(34,()=>{const x=P.people[P.affair];if(x)caughtAffair();P.affair=null;return null;});
    const rv=peopleOf('rival').find(r=>r.alive&&r.grudge>=55);
    if(rv&&chance(.3))add(32,()=>rivalScene(rv));
    if(P.cls==='cheonmin'&&P.sub==='nobi'&&P.wealth>=40&&!P.flags.napsokAsked)add(40,()=>napsokScene());
    if(P.female&&['yangban','jungin','sangmin'].includes(P.cls)&&P.st.know>=70&&P.st.brave>=45&&!P.married&&P.age<=30&&!Store.codex().rare.namjang&&!P.flags.namjang&&chance(.06))add(25,()=>namjangScene());
    if(P.flags.wasGisaeng&&P.married&&!P.flags.rare3&&P.year-(P.flags.wedY||0)>=5&&chance(.04))add(22,()=>{P.flags.rare3=1;rare('gisaeng2lady','정실이 세상을 떠나 그대가 집안의 안주인 자리에 올랐다. 훗날 남편이 정1품에 올라 그대는 정경부인의 칭호를 받았다. 기녀 출신으로는 전에 없던 일이라 하였다.');fx({fame:30});return null;});
    if(P.age>=20&&(P.married||P.age>=25)&&P.year-(P.flags.homeY||0)>=3&&chance(.4))add(26,()=>homeScene());
    if(P.widowed&&!P.married&&P.age<=45&&canRemarry())add(46,()=>{P.widowed=P.widowed;return matchScene(true);});
  }
  if(!c.length)return;
  c.sort((a,b)=>b[0]-a[0]);
  return c[0][1]();
}
function canRemarry(){
  if(P.flags.noRemarry)return false;
  if(P.female&&P.cls==='yangban'&&P.year>=1485&&P.year<1894&&!(P.alt)){if(!P.seen.jaega){P.seen.jaega=1;note('jaega');say('양반가의 과부는 다시 시집갈 수 없었다. 수절의 세월이 시작되었다.');}return false;}
  return true;
}
function marriageable(){
  if(P.married||P.age<18)return false;
  if(P.widowed)return false;
  if(P.sub==='gisaeng'&&P.job&&P.job.k==='gisaeng')return false;
  if(P.court&&!chance(.35))return false;
  if(P.job&&['concubine','queen'].includes(P.job.k))return false;
  const lim=P.female?30:36;if(P.age>lim)return false;
  return chance(.3+(P.age>22?.2:0)+(P.rejects?.1:0));
}
function rare(k,text){const cx=Store.codex();cx.rare[k]=1;Store.saveCodex();P.flags['rare_'+k]=1;say(text,'big');ev('rare',text);}
