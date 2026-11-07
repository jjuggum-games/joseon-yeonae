/* 조선 연애실록 — 엔진 */
'use strict';

/* ===== 기본 도구 ===== */
const rnd=Math.random;
const ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
const R=a=>a[Math.floor(rnd()*a.length)];
const chance=p=>rnd()<p;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
function wpick(list){let t=0;for(const x of list)t+=x[1];let r=rnd()*t;for(const x of list){r-=x[1];if(r<=0)return x[0];}return list[list.length-1][0];}
let _uid=0;const uid=()=>Date.now().toString(36)+(++_uid).toString(36)+ri(100,999);
function lastH(w){w=String(w||'').replace(/[^가-힣0-9]+$/,'');const ch=w[w.length-1]||'';if(/[0-9]/.test(ch))return '영일이삼사오육칠팔구'['0123456789'.indexOf(ch)];return ch;}
function bat(w){const h=lastH(w);if(!h)return false;const c=h.charCodeAt(0)-0xAC00;if(c<0||c>11171)return false;return c%28!==0;}
function batL(w){const h=lastH(w);if(!h)return false;const c=h.charCodeAt(0)-0xAC00;return c>=0&&c<=11171&&c%28===8;}
const iga=w=>w+(bat(w)?'이':'가'), eulreul=w=>w+(bat(w)?'을':'를'), eunneun=w=>w+(bat(w)?'은':'는'), gwawa=w=>w+(bat(w)?'과':'와'), euro=w=>w+(bat(w)&&!batL(w)?'으로':'로'), ia=w=>w+(bat(w)?'아':'야'), ida=w=>w+(bat(w)?'이다':'다');
const KNUM=['','한','두','세','네','다섯','여섯','일곱','여덟','아홉','열'];
const ORD=['첫째','둘째','셋째','넷째','다섯째','여섯째','일곱째','여덟째','아홉째','열째','열한째','열두째'];
function kAge(n){const u=['','한','두','세','네','다섯','여섯','일곱','여덟','아홉'];const t=['','열','스물','서른','마흔','쉰','예순','일흔','여든','아흔'];if(n===20)return '스무';return (t[Math.floor(n/10)]||'')+(u[n%10]||'');}
function money(v){v=Math.max(0,Math.round(v*100));const n=Math.floor(v/100),j=Math.floor(v%100/10),p=v%10;let s='';if(n)s+=n.toLocaleString()+'냥';if(j)s+=(s?' ':'')+j+'전';if(p&&!n)s+=(s?' ':'')+p+'푼';return s||'0푼';}

/* ===== 임금과 시대 ===== */
function realKing(y){let k=KINGS[0];for(const x of KINGS){if(y>=x.s)k=x;}return k;}
function kingAt(y,P){if(P&&P.alt&&P.alt.king&&y>=P.alt.from)return {n:P.alt.king,s:P.alt.from,alt:true,d:'이 판의 역사에서 보위에 오른 임금.'};return realKing(y);}
function reignLabel(y,P){
  const k=kingAt(y,P);
  if(!k.alt&&k.n==='고종'&&y>=1897)return `광무 ${y-1896}년`;
  if(!k.alt&&k.n==='순종')return y===1907?'융희 원년':`융희 ${y-1906}년`;
  if(k.n==='태조'&&!k.alt)return `태조 ${y===1392?'원':y-1391}년`;
  const n=y-k.s;return `${k.n} ${n===0?'즉위':n}년`;
}
function eraWord(y){return y<1392?'고려 말':y<1500?'조선 전기':y<1650?'조선 중기':y<1863?'조선 후기':'조선 말기';}
const isJoseon=y=>y>=1392;

/* ===== 사람 이름 ===== */
function hanName(female){const a=female?F_HAN1:M_HAN1,b=female?F_HAN2:M_HAN2;let x,y;do{x=R(a);y=R(b);}while(x===y);return {n:x+y,mean:`${SYL[x]?SYL[x][1]+' '+x+'('+SYL[x][0]+')':x}, ${SYL[y]?SYL[y][1]+' '+y+'('+SYL[y][0]+')':y}`};}
function nativeName(female){const x=R(female?F_NATIVE:M_NATIVE);return {n:x[0],mean:x[1]};}
function nameCands(P){
  const out=[],seen=new Set();
  const add=o=>{if(!seen.has(o.n)){seen.add(o.n);out.push(o);}};
  let g=0;
  while(out.length<3&&g++<50){
    if(P.sub==='gisaeng'){const k=R(KI_NAMES);add({n:k[0],mean:`기명(妓名). ${k[1]}`,kind:'ki'});continue;}
    if(['royal','yangban','jungin'].includes(P.cls)){
      if(P.female&&out.length===0){const x=nativeName(true);add({...x,kind:'a'});}
      else add({...hanName(P.female),kind:'h'});
    } else if(P.cls==='sangmin'){
      if(out.length<2)add({...nativeName(P.female),kind:'a'});else add({...hanName(P.female),kind:'h'});
    } else add({...nativeName(P.female),kind:'a'});
  }
  return out;
}
function personName(cls,female,sub){
  if(sub==='gisaeng'){const k=R(KI_NAMES);return k[0];}
  if(['royal','yangban','jungin'].includes(cls))return hanName(female).n;
  if(cls==='sangmin')return chance(.7)?nativeName(female).n:hanName(female).n;
  return nativeName(female).n;
}
function surname(){return R(SURNAMES);}
/* 부르는 이름 */
function callOf(p){
  if(p.title)return p.title;
  if(p.nick)return p.name;
  if(p.sub==='gisaeng')return p.name;
  if(p.cls==='yangban'||p.cls==='royal')return p.female?`${p.sur}씨 낭자`:`${p.sur} 도령`;
  if(p.cls==='jungin')return p.female?`${p.sur}씨 처자`:`${p.sur} 서방`;
  return p.name;
}
function fullOf(p){
  if(p.title)return p.title;
  if(p.sub==='gisaeng')return `${p.name} (기녀)`;
  if(p.female&&(p.cls==='yangban'||p.cls==='royal'))return `${p.bon} ${p.sur}씨 · ${p.name}`;
  if(['yangban','jungin','royal'].includes(p.cls))return `${p.sur}${p.name} (${p.bon} ${p.sur}씨)`;
  return p.name+(p.sur&&p.cls==='sangmin'?` (${p.sur}씨)`:'');
}

/* ===== 능력치 합치기: 기품은 매력(용모)에 합친다 ===== */
function normalizeSt(p){
  const s=p.st;if(!s)return p;
  const d=Object.getOwnPropertyDescriptor(s,'grace');
  if(d&&!d.get){const g=s.grace;delete s.grace;if(!p.stMerged){s.look=Math.round(clamp((s.look+g)/2+6));}}
  if(!Object.getOwnPropertyDescriptor(s,'grace'))Object.defineProperty(s,'grace',{get(){return this.look;},set(v){this.look=v;},enumerable:false,configurable:true});
  const dw=Object.getOwnPropertyDescriptor(s,'wit');
  if(dw&&!dw.get){const w=s.wit;delete s.wit;s.know=Math.round(clamp(Math.max(s.know,(s.know+w)/2+4)));}
  if(!Object.getOwnPropertyDescriptor(s,'wit'))Object.defineProperty(s,'wit',{get(){return this.know;},set(v){this.know=v;},enumerable:false,configurable:true});
  if(p.people){const ROLE={'고을 사또':['사또','고을 수령(종6품)'],'관찰사':['관찰사','관찰사(종2품)'],'권세 높은 대감':['대감','판서(정2품)'],'세도가 대감':['대감','세도가의 참판(종2품)'],'권세 높은 판서 댁':['대감','판서(정2품)']};
    for(const x of Object.values(p.people)){const r=x.title&&ROLE[x.title];if(r&&x.name&&x.sur){x.title=`${x.sur}${x.name} ${r[0]}`;x.pos=r[1];}}}
  if(p.people&&p.female&&p.married&&p.spouse&&p.people[p.spouse]){const sp=p.people[p.spouse];const R5=['cheonmin','sangmin','jungin','yangban','royal'];
    if(sp.mode!=='cheop'&&p.sub!=='cheop'&&!sp.kingRole&&R5.indexOf(sp.cls)>R5.indexOf(p.cls)){p.birthCls=p.birthCls||p.cls;p.cls=sp.cls;p.lastCls=p.cls;}}
  if(p.sub==='cheop'&&p.job&&p.job.k==='royalwife'){p.job={k:'sosil',lv:0};p.peak=p.peak&&p.peak.k==='royalwife'?{k:'sosil',lv:0}:p.peak;}
  p.stMerged=1;p.witMerged=1;return p;
}

/* ===== 생애 상태 ===== */
let P=null;           // 지금 사는 삶
const G={plan:[],pi:0,acc:0,scene:null,auto:false,speed:1,len:'normal',paused:false,away:null,yearMs:9000,lastT:0,cur:null};

function blankP(){return {v:1,id:uid(),born:0,year:0,age:0,female:false,cls:'sangmin',sub:'',region:'',sur:'',bon:'',name:'',nameMean:'',
  st:{look:30,grace:20,know:10,art:10,wit:20,brave:20,fame:10,worry:10,health:70},artK:'가무',wealth:0,home:'',job:null,peak:null,titles:[],
  focus:'know',parents:null,sibs:[],people:{},spouse:null,married:false,widowed:false,kids:[],wantKids:null,preg:null,letters:[],feed:[],ev:[],
  flags:{},alt:null,power:0,dead:false,cause:'',deathYear:0,last:'',realSpouse:null,court:false,favor:0,ancestor:null,kings:[],
  helper:null,elder:null,rejects:0,exile:0,seen:{},affair:null,heirs:null,grand:0,cheopN:0,nameCands:null};}

/* ===== 출생 ===== */
function rollBirth(hist){
  const p=blankP();
  let y=ri(1370,1880);
  p.cls=wpick(Object.entries(CLS).map(([k,v])=>[k,v.w]));
  if(p.cls==='royal'&&y<1395)y=ri(1395,1880);
  p.born=y;p.year=y;p.age=0;
  p.female=chance(.5);
  p.region=p.cls==='royal'?'한양':wpick(REGIONS);
  if(p.cls==='royal'){p.sur='이';p.bon='전주';}else{const s=surname();p.sur=s[0];p.bon=s[1];}
  if(p.cls==='cheonmin'){
    if(p.female)p.sub=chance(.42)?'gisaeng':'nobi';
    else p.sub=chance(.25)?'gwangdae':'nobi';
    if(p.sub==='gisaeng'&&chance(.5))p.region=R(['평양','한양','진주','경상도','전라도','개성']);
  }
  if(p.cls==='yangban'&&chance(.12))p.sub='seo';
  // 능력치
  const st=p.st;
  /* 타고난 바탕: 모두 10 이상, 계단식으로 높낮이를 나누어 무작위로 붙인다 */
  const TIERS=[[50,40,40,25,15],[45,40,30,20,15],[55,35,30,20,10],[40,40,35,30,20],[60,35,25,15,10],[50,35,30,30,15],[45,45,25,20,10]];
  const tier=R(TIERS).map(v=>Math.max(10,v+ri(-3,3)));
  const keys=['look','know','art','brave'];for(let i=keys.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[keys[i],keys[j]]=[keys[j],keys[i]];}
  delete st.grace;delete st.wit;const tv=tier.slice();tv.splice(ri(0,tv.length-1),1);keys.forEach((k,i)=>st[k]=tv[i]);p.stMerged=1;
  st.health=ri(62,86);st.worry=ri(0,10);
  st.fame={royal:40,yangban:22,jungin:14,sangmin:8,cheonmin:3}[p.cls]+ri(0,6);
  if(p.cls==='royal'||p.cls==='yangban'){st.know+=ri(2,6);}
  if(p.sub==='gisaeng'){st.art+=ri(4,10);st.look+=ri(3,8);}
  if(p.cls==='cheonmin'){st.brave+=ri(2,6);st.health-=ri(0,6);}
  p.artK=p.sub==='gisaeng'?R(['가무','음률','시문']):R(ARTS);
  p.wealth={royal:ri(2000,4000),yangban:ri(250,1500),jungin:ri(150,500),sangmin:ri(15,90),cheonmin:ri(0,6)}[p.cls];
  if(p.sub==='seo')p.wealth=Math.round(p.wealth*.4);
  p.home=HOMES[p.cls];
  if(p.sub==='gisaeng')p.home='관아 근처 기방';
  // 부모
  const fa={name:personName(p.cls,false),age:ri(22,40),alive:true}, mo={name:personName(p.cls,true),age:ri(17,34),alive:true};
  let fJob='',mJob='';
  if(p.cls==='royal'){const k=realKing(y);fJob=`임금(${k.n})`;mJob=chance(.15)?'왕비':R(['숙의','귀인','숙원','소용']);fa.name=k.n;}
  else if(p.cls==='yangban'){fJob=p.sub==='seo'?R(['참판','현감','목사','교리']):R(['선비','현감','정랑','참의','목사','진사']);mJob=p.sub==='seo'?R(['양인 첩','천인 첩']):'정부인';}
  else if(p.cls==='jungin'){fJob=R(['역관','의원','화원','율관','서리']);mJob='안사람';}
  else if(p.cls==='sangmin'){fJob=R(['농사꾼','소작인','짚신장수','대장장이','어부','옹기장이']);mJob=R(['길쌈하는 아낙','농사짓는 아낙','삯바느질 아낙']);}
  else{fJob=p.sub==='gwangdae'?'광대':R(['사내종','외거노비','관노']);mJob=p.sub==='gisaeng'?'관기':R(['계집종','관비','부엌데기']);}
  p.parents={f:{...fa,job:fJob},m:{...mo,job:mJob}};
  // 형제자매
  const n=ri(0,5),me=ri(0,n);
  let accO=0,accY=0;
  for(let i=me-1;i>=0;i--){accO+=ri(1,3);const fem=chance(.5);p.sibs.push({id:uid(),name:personName(p.cls,fem),female:fem,off:accO,alive:true,married:false,older:true});}
  for(let i=me+1;i<=n;i++){accY+=ri(1,3);const fem=chance(.5);p.sibs.push({id:uid(),name:personName(p.cls,fem),female:fem,off:-accY,alive:true,married:false,older:false});}
  p.sibs.sort((a,b)=>b.off-a.off);
  p.order=me;
  // 전생의 후손
  if(hist&&hist.length&&chance(.03)){
    const anc=hist.filter(h=>h.kids>0&&h.death&&h.death<y-20&&h.cls!=='cheonmin');
    if(anc.length){const a=R(anc);p.ancestor={name:a.name,id:a.id,gens:Math.max(1,Math.round((y-a.born)/28)),title:a.title};
      if(a.cls!=='royal'&&p.cls!=='royal'){p.sur=a.sur||p.sur;p.bon=a.bon||p.bon;}}
  }
  // 직업 시작
  if(p.cls==='royal')p.job={k:p.female?'princess':'prince',lv:p.parents.m.job==='왕비'?(p.female?1:2):(p.female?0:1)};
  if(p.sub==='gisaeng')p.job={k:'gisaeng',lv:0};
  p.nameCands=nameCands(p);
  normalizeSt(p);
  return p;
}
function originText(p){
  const c=CLS[p.cls].n;
  let s=`${p.region} · ${c}`;
  if(p.sub==='seo')s+=' (서얼)';
  if(p.sub==='gisaeng')s+=' (관기의 딸)';
  if(p.sub==='gwangdae')s+=' (광대의 아들)';
  if(p.sub==='nobi')s+=' (노비)';
  return s;
}
function birthCard(p){
  const k=kingAt(p.born,p);
  return [
    ['태어난 해',`${p.born}년 · ${ganji(p.born)}년`],
    ['임금',p.born<1392?`고려 ${k.n}`:`${k.n} (${reignLabel(p.born,p)})`],
    ['태어난 곳',p.region],
    ['신분',CLS[p.cls].n+(p.sub==='seo'?' · 서얼':p.sub==='gisaeng'?' · 관기의 딸':p.sub==='gwangdae'?' · 광대 집안':p.sub==='nobi'?' · 노비':'')],
    ['성별',p.female?'여인':'사내'],
    ['집안',`${p.cls==='cheonmin'?'':p.bon+' '+p.sur+'씨 · '}아버지는 ${p.parents.f.job}, 어머니는 ${p.parents.m.job}`],
    ['형제',p.sibs.length?`${p.sibs.length+1}남매 가운데 ${p.order===0?'맏이':ORD[p.order]}`:'외동'],
    ['가산',money(p.wealth)]
  ];
}

/* ===== 인물 ===== */
function pickLine(arr){const f=P.female?'F|':'M|',o=P.female?'M|':'F|';const a=arr.filter(x=>!x.startsWith(o));return R(a).replace(/^[FM]\|/,'');}
function newPerson(o){
  const female=o.female;
  const cls=o.cls||'sangmin';
  const s=o.sur?[o.sur,o.bon]:surname();
  const pp={id:uid(),kind:o.kind||'love',female,cls,sub:o.sub||'',sur:s[0],bon:s[1],name:o.name||personName(cls,female,o.sub),
    born:o.born||(P.year-ri(18,24)),persona:R(PERSONAS).k,taste:R(TASTES).k,h:o.h||0,t:o.t||0,status:o.status||'acq',
    metY:P.year,metA:P.age,place:o.place||'',alive:true,known:false,grudge:o.grudge||0,title:o.title||'',real:o.real||'',note:o.note||'',
    comp:rnd(),fam:o.fam||'',wealth:o.wealth||0,maxH:o.h||0,rel:o.rel||40,events:[]};
  pp.fam=pp.fam||famText(pp);
  describePerson(pp,o);
  P.people[pp.id]=pp;return pp;
}
const RICH=['가난함','살 만함','넉넉함','큰 부자'];
const SEOUL=['북촌','남촌','종로','마포','동대문 밖','서소문 밖'];
function describePerson(p,o){
  o=o||{};
  if(p.rich==null)p.rich=o.wealth!=null?o.wealth:p.cls==='royal'?3:p.cls==='yangban'?wpick([[1,3],[2,4],[3,2],[0,1]]):p.cls==='jungin'?wpick([[1,4],[2,3],[3,1]]):p.cls==='sangmin'?wpick([[0,4],[1,4],[2,1]]):0;
  if(!p.live){if(p.cls==='royal'||p.real){p.live='한양 '+R(['궁궐','사직동 종친 댁','북촌 종친 댁']);}else{const reg=P&&chance(.65)?P.region:wpick(REGIONS);p.live=reg==='한양'?'한양 '+R(SEOUL):reg;}}
  if(!p.pos){const a=P?P.year-p.born:25;const f=p.female;
    if(p.real)p.pos=p.title||'왕실';
    else if(p.cls==='royal')p.pos=f?'옹주':'종친';
    else if(p.cls==='yangban')p.pos=f?'규수':a<22?R(['유생','유생','생원']):wpick([['유생',2],['생원',2],['진사',2],['정9품 관원',1],['정7품 관원',1],['종6품 관원',1]]);
    else if(p.cls==='jungin')p.pos=f?R(['의녀','역관 집 딸','의원 집 딸']):R(['역관','의원','화원','율관','서리']);
    else if(p.cls==='sangmin')p.pos=f?R(['길쌈하는 처자','주막집 딸','삯바느질 처자','농사짓는 집 딸','장사하는 집 딸']):R(['농사꾼','보부상','대장장이','어부','장사꾼','군졸','옹기장이']);
    else p.pos=p.sub==='gisaeng'?'기녀':p.sub==='gwangdae'?'광대':f?R(['계집종','관비','몸종']):R(['사내종','외거노비','관노','머슴']);}
}
function personInfo(p){if(!p.pos||p.rich==null||!p.live)describePerson(p);return `${CLS[p.cls]?CLS[p.cls].n:''} · ${p.pos} · ${p.live} · ${RICH[p.rich]||''}`;}
function famText(p){
  if(p.real)return '왕실';
  if(p.cls==='yangban')return `${p.bon} ${p.sur}씨 ${R(['명문가','이름난 집안','몰락한 집안','넉넉한 집안','청렴한 선비 집안'])}`;
  if(p.cls==='jungin')return `${p.sur}씨 ${R(['역관 집안','의원 집안','화원 집안','서리 집안'])}`;
  if(p.cls==='sangmin')return R(['농사짓는 집','장사하는 집','대장간 집','소작인 집','주막집']);
  if(p.cls==='royal')return '종친 집안';
  if(p.sub==='gisaeng')return '기방';
  return R(['양반가의 노비','관아의 노비','떠돌이 놀이패']);
}
const ageOf=p=>P.year-p.born;
const hLv=v=>Math.min(4,Math.floor(v/20));
const persona=k=>PERSONAS.find(x=>x.k===k);
const taste=k=>TASTES.find(x=>x.k===k);
function peopleOf(kind){return Object.values(P.people).filter(x=>x.kind===kind);}
function spouseP(){return P.spouse?P.people[P.spouse]:null;}

/* ===== 기록 ===== */
function feedYear(){
  const k=kingAt(P.year,P);
  const e={y:P.year,a:P.age,lab:P.year<1392?`고려 ${k.n} ${P.year-k.s||'즉위'}${P.year-k.s?'년':'년'}`:reignLabel(P.year,P),gz:ganji(P.year),lines:[],big:false,sum:''};
  P.feed.push(e);G.cur=e;return e;
}
function say(t,c='n'){
  const e=G.cur||P.feed[P.feed.length-1];if(!e)return;
  e.lines.push({c,t});
  if((c==='big'||c==='news'||c==='alt')&&!e.sum)e.sum=t.replace(/\[\[|\]\]/g,'').slice(0,60);
  if(c==='big')e.big=true;
  if(G.hidden&&G.away&&(c==='big'||c==='news'||c==='alt'))G.away.lines.push({y:P.year,a:P.age,t});
  if(typeof UI!=='undefined')UI.onLine();
}
function ev(type,t,extra){P.ev.push({type,y:P.year,a:P.age,t,...(extra||{})});}
function fx(o,silent){
  const ch=[];
  for(const k in o){let v=o[k];if(!v)continue;
    if(k==='wealth'){const old=P.wealth;P.wealth=Math.max(0,P.wealth+v);const d=P.wealth-old;if(Math.abs(d)>=0.5)ch.push(`재산 ${d>0?'+':'-'}${money(Math.abs(d))}`);continue;}
    const old=P.st[k];P.st[k]=clamp(old+v);const d=P.st[k]-old;if(d&&k!=='worry')ch.push(`${STATN[k]} ${d>0?'+':''}${d}`);}
  if(ch.length&&!silent)say(ch.join(' · '),'chg');
  return ch;
}
function note(k){
  if(!NOTES[k])return;
  const codex=Store.codex();
  if(codex.notes[k]){return;}
  codex.notes[k]=1;Store.saveCodex();
  say(`${NOTES[k][0]}|${NOTES[k][1]}`,'note');
}
const COURT_DEPT={jimil:['지밀','wit'],chim:['침방','art'],su:['수방','art'],soju:['소주방','health'],saeng:['생과방','art'],sedap:['세답방','health']};
function jobTitle(j){if(!j)return '';const d=JOBS[j.k];
  if(j.k==='court'&&typeof P!=='undefined'&&P&&P.courtDept&&j.lv>=1){const n=COURT_DEPT[P.courtDept][0];return j.lv===1?n+' 나인':j.lv===2?n+' 상궁':P.courtDept==='jimil'?'제조상궁':'부제조상궁';}
  return d.ladder[Math.min(j.lv,d.ladder.length-1)];}
function setJob(k,lv){
  const prev=P.job;
  P.job={k,lv};
  /* 승진하거나 급제하면 평판이 크게 오른다 */
  if(prev&&k!=='bandit'&&typeof fx==='function'&&((prev.k===k&&lv>prev.lv)||(prev.k!==k&&['official','military'].includes(k))||(prev.k==='scholar'&&k==='scholar'&&lv>prev.lv)))fx({fame:ri(6,12)+Math.min(8,lv)});const t=jobTitle(P.job);
  if(!P.titles.includes(t))P.titles.push(t);
  P.jobBest=P.jobBest||{};if(P.jobBest[k]==null||lv>P.jobBest[k])P.jobBest[k]=lv;P.jobOrder=P.jobOrder||[];if(!P.jobOrder.includes(k))P.jobOrder.push(k);
  const score=x=>x?((x.k==='official'||x.k==='military'?2:x.k==='queen'?5:x.k==='concubine'?3:x.k==='gisaeng'||x.k==='court'?1.4:1)*(x.lv+1)):0;
  if(!P.peak||score(P.job)>=score(P.peak))P.peak={k,lv};
}
function statusLine(){
  const c=CLS[P.cls].n;
  const t=P.job?jobTitle(P.job):(P.age<10?'아이':'');
  return [c,t].filter(Boolean).join(' · ');
}
