/* 조선 연애실록 — 큰일의 장면들 */
'use strict';

/* ---- 갈림길 ---- */
function branchScene(b){
  const p=clamp(.18+P.power/150+P.st.wit/350+P.st.fame/500,.08,.72);
  const opts=[
    {t:'정사대로 흘러가게 둔다',sub:'몸을 사린다',p:.9,safe:true,tags:['역사 그대로'],fn:()=>{say(b.realLine,'news');realAfter(b);}},
    {t:b.protect,sub:'역사가 바뀔 수도 있다',p,tags:['역사를 바꿀 수 있음','실패하면 목숨이 위태로움'],fn:()=>{
      if(chance(p)){altHistory(b);}else{say('일이 어그러졌다. 그대가 나섰던 일이 드러났다.','big');say(b.realLine,'news');punish(b);}}}
  ];
  if(b.join)opts.splice(1,0,{t:b.join,sub:'이기는 편에 줄을 선다',p:.7,tags:['재산 ↑','평판 ±','품계 ↑'],fn:()=>{
    say(b.realLine,'news');
    if(chance(.7)){say(`그대의 공이 인정되어 ${b.joinTitle}의 대열에 들었다.`,'big');fx({wealth:P.wealth*.4+50,fame:8});if(P.job&&P.job.k==='official')setJob('official',Math.min(16,P.job.lv+2));ev('branchJoin',b.title);}
    else{say('공을 다투는 틈에서 밀려났다.');fx({worry:10});}}});
  return {kind:'major',title:`역사의 갈림길 · ${b.title}`,text:`${b.year}년. ${b.text}`,opts,branch:true};
}
function realAfter(b){
  if(b.id==='yangnyeong'&&P.realSpouse==='양녕대군'){P.home='경기도 광주의 유배지';say('폐세자를 따라 광주로 내려갔다. 세자빈의 자리는 사라졌다.','big');setJob('queen',0);P.titles.push('폐세자빈');}
  if(b.id==='imo'&&P.realSpouse==='사도세자'){const sp=spouseP();if(sp&&sp.alive)spouseDies(sp,'뒤주에 갇혀');}
}
function altHistory(b){
  P.alt={id:b.id,year:b.year,from:b.altKingFrom||b.year,king:b.altKing,title:b.title,line:b.altLine};
  const cx=Store.codex();cx.branches[b.id]=1;Store.saveCodex();
  say(b.altLine,'alt');
  say('정사(正史)와 다른 길이 열렸다. 이 판의 역사는 이제 그대가 아는 것과 다르다.','big');
  ev('branch',b.altLine,{title:b.title});
  fx({fame:25});
  if(b.id==='yangnyeong'&&P.realSpouse==='양녕대군'){setJob('queen',1);P.home='중궁전';say('그대는 [[중전]]이 되었다.','big');}
  if(b.id==='imo'&&P.realSpouse==='사도세자'){P.flags.queenAt=1776;}
}
function punish(b){
  const r=rnd();
  if(r<.25&&P.age<75){P.cause='역모에 얽혀 사약을 받고';P.flags.executed=1;fx({health:-100},true);say('끝내 사약이 내려졌다.','big');}
  else{exile(ri(3,7));}
}
function exile(n){P.flags.homeBefore=P.home;P.exile=P.year+n;P.home=R(['제주','거제','강진','흑산도','삼수','갑산','남해'])+'의 유배지';say(`${euro(P.home)} 유배되었다.`,'big');ev('exile',P.home);fx({fame:-10,worry:20});}

/* ---- 전쟁 ---- */
function warScene(w){
  note('pinan');
  if(P.age<15){say(`${iga(w[2])} 일어났다. 어른들 손에 이끌려 피란길에 올랐다.`,'big');famTragedy(.25,'피란길에');fx({health:-6,worry:10});ev('war',w[2]);return null;}
  const opts=[
    {t:'산으로 피란한다',sub:'가산을 버리고 목숨을 지킨다',p:.75,safe:true,tags:['재산 ↓','가족을 잃을 수 있음'],fn:()=>{fx({wealth:-P.wealth*.35,health:-4,worry:10});say('짐을 꾸려 산으로 숨어들었다. 피란길은 고되었다.');famTragedy(.25,'피란길에');ev('war',w[2]);}},
    {t:'집을 지킨다',sub:'가산은 지키나 위험하다',p:.45,tags:['목숨이 위태로울 수 있음'],fn:()=>{if(chance(.45)){say('적이 마을을 비껴갔다. 가까스로 집을 지켰다.');}else{fx({wealth:-P.wealth*.6,health:-15,worry:15});say('적이 마을에 들이닥쳤다. 겨우 목숨만 건졌다.','big');famTragedy(.35,'난리 통에');if(chance(.1)){P.cause='전란 중에';fx({health:-100},true);}}ev('war',w[2]);}}
  ];
  if(!P.female&&P.age<=50)opts.push({t:'의병에 나선다',sub:'나라를 위해 싸운다',p:.55,tags:['평판 ↑','목숨이 위태로움',P.cls==='cheonmin'?'면천될 수 있음':'공을 세울 수 있음'],fn:()=>{
    if(chance(.55)){say('의병에 나가 싸웠다. 그 공이 조정에 알려졌다.','big');fx({fame:25,brave:8});ev('war',w[2]+'에 의병으로 나섰다');
      if(P.cls==='cheonmin'){P.cls='sangmin';P.sub='';P.job=null;say('전공으로 면천되어 양인이 되었다!','big');note('myeoncheon');ev('freed','전공으로 면천되었다');}}
    else{fx({health:-25,brave:5});say('싸움터에서 크게 다쳤다.','big');if(chance(.3)){P.cause='싸움터에서';fx({health:-100},true);}ev('war',w[2]);}}});
  return {kind:'major',title:`${w[2]}`,text:`${w[0]}년, ${iga(w[2])} 일어났다. 적이 가까이 왔다는 소식에 마을이 술렁인다.`,opts};
}

/* ---- 사화와 환국 ---- */
function purgeScene(name){
  note('sahwa');
  const mine=P.job&&P.job.k==='official';
  const sp=spouseP();
  if(!mine){
    return {kind:'major',title:name,text:`조정에 ${name}의 바람이 불었다. 남편의 이름이 오르내린다.`,opts:[
      {t:'남편에게 몸을 사리라 권한다',p:.7,safe:true,tags:['평판 조금 ↓'],fn:()=>{if(chance(.7))say('남편이 조용히 물러나 화를 피하였다.');else{say('그래도 화를 피하지 못하여 남편이 유배되었다.','big');sp.away=1;fx({worry:20});}}},
      {t:'친정의 줄을 댄다',p:.5,tags:['재산 ↓'],fn:()=>{fx({wealth:-P.wealth*.15});if(chance(.55))say('친정의 도움으로 남편이 화를 면하였다.');else{say('남편이 유배되었다.','big');fx({worry:20});}}},
      {t:'운에 맡긴다',p:.5,tags:['알 수 없음'],fn:()=>{if(chance(.5))say('다행히 화는 비껴갔다.');else{say('남편이 사약을 받았다…','big');spouseDies(sp,'사약을 받고');}}}]};
  }
  return {kind:'major',title:name,text:`조정에 ${name}의 바람이 분다. 어느 편에 서느냐에 따라 목숨이 갈린다.`,opts:[
    {t:'몸을 사린다',sub:'병을 핑계로 물러나 있는다',p:.75,safe:true,tags:['평판 ↓'],fn:()=>{fx({fame:-4});if(chance(.75))say('조용히 물러나 있다가 화를 피하였다.');else exile(ri(2,4));}},
    {t:'바른말을 올린다',sub:'선비의 도리를 지킨다',p:.4,tags:['평판 ↑','유배될 수 있음'],fn:()=>{fx({fame:15});if(chance(.4))say('바른말이 받아들여졌다. 그대의 이름이 높아졌다.','big');else if(chance(.12)&&P.job.lv>=8){P.cause='사약을 받고';P.flags.executed=1;fx({health:-100},true);say('사약이 내려졌다.','big');}else exile(ri(3,8));}},
    {t:'권세 편에 선다',sub:'출세할 수 있다',p:.6,tags:['품계 ↑','평판 ↓','훗날 화를 입을 수 있음'],fn:()=>{if(chance(.6)){setJob('official',Math.min(16,P.job.lv+2));say(`${euro(RANKS[P.job.lv])} 뛰어올랐다.`,'big');fx({fame:-6,wealth:40});}else exile(ri(2,5));}}]};
}

/* ---- 왕실 혼인 ---- */
function crownScene(who,bornY){
  note('ganjip');
  const altWord=who==='양녕대군'?'세자 양녕대군':'세자';
  return {kind:'major',title:'세자빈 간택',text:`나라에 금혼령이 내려지고 처녀단자를 올리라는 명이 내려왔다. ${altWord}의 배필을 고른다고 한다. 집안 어른들이 그대의 처녀단자를 올렸다.`,opts:[
    {t:'간택에 나아간다',sub:'삼간택까지 가야 한다',p:clamp(.25+(P.st.grace+P.st.look)/300+P.st.fame/400,.15,.75),tags:['신분 변화: 세자빈','역사의 갈림길에 설 수 있음'],fn:()=>{
      if(chance(clamp(.25+(P.st.grace+P.st.look)/300+P.st.fame/400,.15,.75))){
        const x=newPerson({kind:'spouse',female:false,cls:'royal',born:bornY,title:who,real:who,h:15,t:15});x.rank=17;x.status='married';
        P.realSpouse=who;wed(x,true);setJob('queen',0);P.home='세자궁(동궁)';P.court=true;
        say(`삼간택 끝에 세자빈으로 뽑혔다. ${P.realSpouse==='양녕대군'?'정사에서 이 자리에 있던 이는 숙빈 김씨였으나, 이 판에서는 그대였다.':'정사에서 이 자리에 있던 이는 혜경궁 홍씨였으나, 이 판에서는 그대였다.'}`,'big');
        ev('crown',who);
      } else say('재간택에서 떨어졌다. 금혼령이 풀렸다.');}},
    {t:'병을 핑계로 피한다',sub:'무예(배짱)가 필요하다',p:clamp(.4+P.st.brave/200),safe:true,tags:['평판 조금 ↓'],fn:()=>{if(chance(.4+P.st.brave/200))say('병을 핑계로 간택에서 빠졌다.');else{say('핑계가 들통나 집안이 꾸중을 들었다.');fx({fame:-8});}}}]};
}
function haremScene(){
  note('ganjip');
  const k=realKing(P.year);
  return {kind:'major',title:'후궁 간택',text:`[[${k.n}]]의 후궁을 간택한다는 명이 내려왔다. 그대의 처녀단자가 올라갔다.`,opts:[
    {t:'간택에 나아간다',sub:'뽑히면 궁에 들어간다',p:.45,tags:['신분 변화: 후궁','다시는 궁을 나올 수 없음'],fn:()=>{
      if(chance(.45+P.st.look/400)){kingSpouse(k);setJob('concubine',5);P.favor=40;say(`간택되어 [[숙의]]의 품계를 받고 입궐하였다.`,'big');ev('harem',k.n);}else say('간택에서 떨어졌다.');}},
    {t:'병을 핑계로 피한다',p:clamp(.4+P.st.brave/200),safe:true,tags:['평판 조금 ↓'],fn:()=>{if(chance(.4+P.st.brave/200))say('간택을 피하였다.');else{say('핑계가 들통나 꾸중을 들었다.');fx({fame:-8});}}}]};
}
function kingSpouse(k){
  const x=newPerson({kind:'spouse',female:false,cls:'royal',born:k.s-ri(15,25),title:k.n,real:k.n,h:10,t:20});
  x.kingRole=true;x.rank=17;x.status='married';
  P.spouse=x.id;P.married=true;P.court=true;P.home='궁궐 안 처소';P.flags.wedY=P.year;
  realRivals();
  return x;
}
function realRivals(){
  const y=P.year;
  if(y>=1494&&y<=1506&&!Object.values(P.people).some(x=>x.real==='장녹수')){const r=newPerson({kind:'rival',female:true,cls:'cheonmin',title:'숙용 장씨(장녹수)',real:'장녹수',born:1470,grudge:30});r.note='임금의 총애를 다투는 후궁';say('[[장녹수]]가 그대를 눈엣가시로 여긴다는 말이 들렸다.');}
  if(y>=1680&&y<=1701&&!Object.values(P.people).some(x=>x.real==='희빈 장씨')){const r=newPerson({kind:'rival',female:true,cls:'jungin',title:'장씨(희빈 장씨)',real:'희빈 장씨',born:1659,grudge:30});r.note='임금의 총애를 다투는 여인';say('[[희빈 장씨]]가 그대를 경계한다는 말이 들렸다.');}
  if(!peopleOf('rival').some(r=>r.alive&&r.court)){const r=newPerson({kind:'rival',female:true,cls:'yangban',born:P.year-ri(18,28),grudge:20});r.title=R(['숙의','소용','귀인'])+' '+r.sur+'씨';r.court=1;r.note='총애를 다투는 후궁';}
}
function seungeunScene(gi){
  const k=realKing(P.year);
  return {kind:'major',title:'승은',text:gi?`궁에서 연회가 열려 기녀들이 불려 갔다. [[${k.n}]]이 그대를 눈여겨보았다.`:`어느 밤, [[${k.n}]]이 그대를 불렀다. 궁녀에게 임금의 부름은 거스를 수 없는 일이었다.`,opts:[
    {t:'받아들인다',sub:'임금의 여인이 된다',p:.85,tags:['신분 변화: 후궁','다른 인연은 끊어짐'],fn:()=>{kingSpouse(k);setJob('concubine',0);P.favor=50;say('[[승은]]을 입어 [[특별상궁]]이 되었다.','big');ev('seungeun',k.n);note('naemyeong');if(gi){P.flags.wasGisaeng=1;P.cls='sangmin';P.sub='';say('기적에서 이름이 지워졌다.');}
      Object.values(P.people).forEach(x=>{if(x.kind==='love'&&x.status!=='parted'){x.status='parted';}});}},
    {t:'몸이 아프다 핑계를 댄다',sub:'무예(배짱)가 필요하다',p:clamp(.3+P.st.brave/200),tags:['임금의 노여움을 살 수 있음'],fn:()=>{if(chance(.3+P.st.brave/200))say('간신히 자리를 피하였다.');else{say('임금의 노여움을 샀다.','big');fx({fame:-12,worry:15});if(gi)fx({fame:-5});}}}]};
}
function bumaScene(){
  note('buma');
  return {kind:'major',title:'부마 간택',text:'임금의 옹주가 혼기에 이르러 부마를 고른다는 명이 내려왔다. 그대의 이름이 올랐다.',opts:[
    {t:'간택에 나아간다',p:.4,tags:['신분 변화: 부마','벼슬길이 막힘'],fn:()=>{if(chance(.4+P.st.grace/400)){const x=newPerson({kind:'spouse',female:true,cls:'royal',born:P.year-ri(17,19),title:`${R(['숙','정','화','명','경','의'])}${R(['신','안','혜','선','순'])}옹주`,h:10,t:10});x.status='married';wed(x,true);setJob('buma',0);say('부마로 뽑혀 옹주와 혼인하였다.','big');ev('buma','');}else say('부마 간택에서 떨어졌다.');}},
    {t:'물러난다',p:.8,safe:true,tags:['평판 조금 ↓'],fn:()=>{say('부마 간택에서 물러났다.');}}]};
}

/* ---- 고백 ---- */
function canMarryCls(a,b){
  const g={royal:['yangban','royal'],yangban:['yangban','royal'],jungin:['jungin','sangmin'],sangmin:['sangmin','jungin','cheonmin'],cheonmin:['cheonmin','sangmin']};
  return (g[a]||[]).includes(b);
}
function sameClan(x){return x&&x.sur&&P.sur&&x.sur===P.sur&&x.bon===P.bon;}
function canWed(x){if(x.female===P.female)return false;if(sameClan(x))return false;if(ageOf(x)<18)return false;if(x.kingRole)return false;return true;}
const CLS_RANK={cheonmin:0,sangmin:1,jungin:2,yangban:3,royal:4};
function clsRank(c,sub){return (CLS_RANK[c]||0)-(sub==='seo'||sub==='cheop'?.5:0);}
const CLS_WIFE={royal:'왕실',yangban:'양반가',jungin:'중인 집안',sangmin:'상민 집안',cheonmin:'노비 집안'};
/* 신분에 따라 혼인하는 방법들 */
function marryOpts(x,afterFail){
  const nm=callOf(x);const d=clsRank(x.cls,x.sub)-clsRank(P.cls,P.sub);
  const L=P.st.look,F=P.st.fame,heart=(x.t-60)/200;
  const O=[];
  const xRich={royal:600,yangban:250,jungin:90,sangmin:15,cheonmin:1}[x.cls]||10;
  const freeMe=()=>{if(P.cls==='cheonmin'){P.cls='sangmin';P.sub='';if(P.job&&['slave','gisaeng'].includes(P.job.k))P.job=null;say('혼인에 앞서 속량되어 천인의 신분을 벗었다.','big');note('myeoncheon');ev('freed','혼인으로 속량되었다');}};
  if(Math.abs(d)<=1){
    const p=clamp(.7-Math.abs(d)*.12+heart+L/500,.15,.9);
    O.push({t:'혼인을 청한다',sub:'집안의 허락을 얻어야 한다',p,tags:['혼인',...(d===1&&P.female?[`신분 상승: ${CLS[x.cls].n}`]:[]),...(d===-1&&P.female?[`신분 하강: ${CLS[x.cls].n}`]:[])],fn:()=>{
      if(!chance(p))return refuse(x,afterFail);
      if(P.female&&d!==0){P.cls=x.cls==='cheonmin'?'sangmin':x.cls;P.sub='';say(`혼인하여 ${CLS_WIFE[x.cls]}의 사람이 되었다.`);}
      freeMe();x.mode='wife';say(`집안 어른들이 허락하였다. ${gwawa(nm)} 혼인하게 되었다.`,'big');wed(x);}});
  } else if(d>=2&&!P.female&&x.cls!=='royal'){
    const p=clamp(.08+L/300+F/350+P.st.know/600+heart,.04,.5);
    O.push({t:'사위로 받아 주기를 청한다',sub:`${CLS[x.cls].n} 집안의 데릴사위가 된다`,p,tags:['신분은 그대로','재산 ↑','처가의 힘','집안의 반대가 거셈'],fn:()=>{
      if(!chance(p))return refuse(x,afterFail);
      freeMe();fx({wealth:xRich*.4,fame:4});x.mode='wife';x.cls=P.cls==='cheonmin'?'sangmin':P.cls==='royal'?x.cls:P.cls;
      say(`낭자 집안이 마침내 그대를 사위로 받아들였다. 신분은 그대로였으나 처가의 도움을 받게 되었다. ${iga(nm)} 그대를 따라 ${CLS[x.cls].n}의 아낙이 되었다.`,'big');ev('marry_note','데릴사위가 되었다');P.flags.deril=1;wed(x);P.home='처가';}});
    const pe=clamp(.25+P.st.brave/300+heart,.1,.6);
    O.push({t:'함께 달아난다',sub:'무예(담력)가 중요하다',p:pe,tags:['혼인','평판 크게 ↓','처가와 의절'],fn:()=>{
      if(!chance(pe)){say('달아나다 낭자 집안 사람들에게 붙잡혔다. 낭자는 끌려가고 그대는 모진 매를 맞았다.','big');fx({health:-15,fame:-8,worry:15});x.blocked=P.year;return null;}
      freeMe();x.cls=P.cls;x.mode='wife';fx({fame:-12});say(`야반도주하여 먼 고을에서 ${gwawa(nm)} 부부가 되었다. 낭자 집안은 딸을 죽은 셈 치겠다 하였다.`,'big');P.home='먼 고을의 셋집';wed(x);}});
  } else if(d>=2&&!P.female){
    O.push({t:'감히 넘볼 수 없는 자리다',sub:'왕실의 딸은 간택으로만 혼인한다',p:null,safe:true,tags:[],fn:()=>{say('왕실의 딸은 부마 간택으로만 혼인할 수 있었다. 마음을 접었다.');fx({worry:6});x.blocked=P.year;return null;}});
  } else if(d>=2){
    const p=clamp(.12+L/260+F/400+heart,.05,.6);
    O.push({t:'정실 자리를 바란다',sub:`${CLS[x.cls].n} ${nm}의 정실이 된다`,p,tags:[`신분 상승: ${CLS[x.cls].n}`,'재산 ↑','평판 ↑','집안의 반대가 거셈'],fn:()=>{
      if(!chance(p))return refuse(x,afterFail);
      freeMe();if(P.female){P.cls=x.cls;P.sub='';}else{P.cls=x.cls==='royal'?'yangban':x.cls;P.sub='';}
      fx({wealth:xRich,fame:12});x.mode='wife';
      say(`세상이 놀랐다. ${CLS[x.cls].n}인 ${nm}의 정실이 되었다. 신분이 하루아침에 바뀌었다.`,'big');ev('rise',`${CLS[x.cls].n}의 정실이 되었다`);wed(x);}});
    if(P.female)O.push({t:'첩(부실)으로 들어간다',sub:'정실은 아니지만 그의 사람이 된다',p:clamp(.7+heart,.3,.92),tags:['신분: 부실',P.cls==='cheonmin'?'속량되어 양인이 됨':'신분 그대로','재산 ↑','자식은 서얼'],fn:()=>{
      if(!chance(clamp(.7+heart,.3,.92)))return refuse(x,afterFail);
      freeMe();P.sub='cheop';fx({wealth:xRich*.35});x.mode='cheop';note('cheop');
      say(`${nm}의 부실이 되었다.`,'big');P.titles.push('부실');wed(x);P.home=`${nm} 댁의 별채`;}});
  } else {
    if(!P.female){
      O.push({t:'정실로 맞는다',sub:'집안의 반대를 무릅쓴다',p:clamp(.25+heart+F/500,.08,.55),tags:['평판 ↓','집안의 반대가 거셈',x.cls==='cheonmin'?'속량 값 재산 ↓':''].filter(Boolean),fn:()=>{
        if(!chance(clamp(.25+heart+F/500,.08,.55)))return refuse(x,afterFail);
        if(x.cls==='cheonmin'){fx({wealth:-Math.min(P.wealth*.2,40)},true);x.cls='sangmin';x.sub='';say(`값을 치르고 ${eulreul(nm)} 속량시켰다.`);}
        fx({fame:-12});x.mode='wife';say(`집안의 반대를 무릅쓰고 ${eulreul(nm)} 정실로 맞았다.`,'big');wed(x);}});
      O.push({t:'첩으로 들인다',sub:'정실 자리는 비워 둔다',p:.85,tags:['신분 그대로','자식은 서얼'],fn:()=>{
        if(!chance(.85))return refuse(x,afterFail);
        x.mode='cheop';note('cheop');say(`${eulreul(nm)} 첩으로 들였다.`,'big');wed(x);}});
    } else {
      const p=clamp(.2+heart+P.st.brave/400,.06,.5);
      O.push({t:'신분을 낮추어 시집간다',sub:'집안이 크게 반대한다',p,tags:[`신분 하강: ${CLS[x.cls==='cheonmin'?'sangmin':x.cls].n}`,'재산 ↓','평판 ↓'],fn:()=>{
        if(!chance(p))return refuse(x,afterFail);
        P.cls=x.cls==='cheonmin'?'sangmin':x.cls;P.sub='';if(P.job&&P.job.k==='lady')P.job=null;
        fx({wealth:-P.wealth*.6,fame:-15});x.mode='wife';ev('fall','신분을 낮추어 시집갔다');
        say(`집안의 반대를 뿌리치고 ${nm}에게 시집갔다. ${CLS[P.cls].n}의 아낙이 되었다.`,'big');wed(x);}});
    }
  }
  return O;
}
function refuse(x,afterFail){say('집안 어른들이 펄쩍 뛰며 반대하였다. 혼인은 이루어지지 않았다.','big');fx({worry:12,fame:-3});x.blocked=P.year;return null;}
function marryScene(x){
  const nm=callOf(x);
  if(x.isKing&&P.female)return {kind:'major',title:'임금의 여인',pid:x.id,text:`임금에게 혼인이란 없다. 그 곁에 서려면 후궁으로 들어가야 한다. 한번 들어가면 다시는 궁을 나올 수 없다.`,opts:[
    {t:'후궁으로 들어간다',p:clamp(.35+x.h/200),tags:['신분 변화: 후궁','다른 인연은 끊어짐'],fn:()=>{if(!chance(clamp(.35+x.h/200))){say('임금의 마음은 아직 그대에게 오지 않았다.');x.blocked=P.year;return null;}delete P.people[x.id];if(P.target===x.id)P.target=null;const k=realKing(P.year);kingSpouse(k);setJob('concubine',0);P.favor=60;say('임금의 부름을 받아 후궁으로 궁에 들었다.','big');ev('seungeun',k.n);Object.values(P.people).forEach(y=>{if(y.kind==='love'&&y.status!=='parted')y.status='parted';});}},
    {t:'마음만 간직한다',p:null,safe:true,tags:[],fn:()=>{say('임금을 향한 마음을 가슴에 묻었다.');}}]};
  if(P.married&&!P.female)return takeCheopScene(x);
  return {kind:'major',title:'청혼',pid:x.id,text:`${P.court?'궁녀의 몸이다. 혼인이 이루어지면 궁을 떠나야 하고, 평판이 크게 깎인다. ':''}${P.preg&&P.preg.father===x.id?'뱃속의 아이를 생각하며, ':''}${nm}에게 혼인을 청한다. ${nm}${bat(nm)?'은':'는'} ${personInfo(x)}이다. 신분에 따라 맺어지는 길이 다르다.`,opts:[...marryOpts(x),{t:'아직은 미룬다',p:null,safe:true,tags:[],fn:()=>{say('혼인을 미루었다.');}}]};
}
function confessScene(x){
  x.asked=true;const nm=callOf(x);const ok=canWed(x);
  const same=x.female===P.female;
  const famP=clamp((P.cls===x.cls?.75:.45)-(P.female&&P.cls==='yangban'?.1:0));
  const opts=[];
  if(ok)opts.push(...marryOpts(x));
  else opts.push({t:'혼인을 청한다',sub:same?'같은 성(性)끼리는 혼인할 수 없다':'지금은 혼인할 수 없다',p:null,dis:true,tags:['불가'],fn:()=>{}});
  opts.push({t:'정인으로 남는다',sub:'세상 몰래 마음을 나눈다',p:.7,tags:['평판이 깎일 수 있음'],fn:()=>{x.status='lover';say(`${eunneun(nm)} 그대의 [[정인]]이 되었다. 세상은 몰랐다.`,'big');ev('lover',x.id);}});
  opts.push({t:'함께 달아난다',sub:'모든 것을 버린다',p:clamp(.3+P.st.brave/180),tags:['신분·재산이 바뀜','평판 크게 ↓'],fn:()=>{
    if(chance(.3+P.st.brave/180)){say(`달 없는 밤, ${gwawa(nm)} 손을 잡고 고향을 떠났다.`,'big');P.flags.elope=1;ev('elope',x.id);P.wealth=P.wealth*.15;P.home='먼 산골 초가';fx({fame:-30,worry:-10});
      if(P.cls==='yangban'||P.cls==='royal'){P.cls='sangmin';P.sub='';P.job=null;say('양반의 이름을 버리고 상민으로 살게 되었다.');}
      if(P.court){P.court=false;P.job=null;}
      if(!same)wed(x,true,true);else{x.status='lover';P.flags.togetherWith=x.id;say('두 사람은 남의 눈을 피해 함께 살았다.');}}
    else{say('붙잡혀 끌려왔다. 온 고을에 소문이 났다.','big');fx({fame:-25,worry:20});x.status='parted';x.alive=chance(.85);}}});
  opts.push({t:'마음을 접는다',p:.95,safe:true,tags:['인연이 끝남'],fn:()=>{x.status='parted';say(`${nm}에게 마음을 접자는 서찰을 보냈다. 그날 밤 오래 울었다.`,'big');fx({worry:15});ev('parted',x.id);}});
  return {kind:'major',title:'고백',pid:x.id,text:`${gwawa(nm)} 서로를 연모한다는 것을 알았다. 이제 어떻게 할 것인가.`,opts};
}
function bushilScene(x){
  x.offered=1;const nm=callOf(x);
  return {kind:'major',title:'부실 제의',pid:x.id,text:`${iga(nm)} 그대를 기적에서 빼내 부실로 들이고 싶다 하였다. 속량의 값은 그가 치르겠다 한다.`,opts:[
    {t:'부실이 된다',sub:'기방을 떠나 그의 사람이 된다',p:.8,tags:['신분 변화: 속량·부실','재산 ↑'],fn:()=>{
      say(`${nm}의 부실이 되었다. 기적에서 이름이 지워졌다.`,'big');note('cheop');P.flags.wasGisaeng=1;
      P.cls='sangmin';P.sub='cheop';P.job=null;P.home=`${nm}의 별채`;x.kind='spouse';x.status='married';P.spouse=x.id;P.married=true;P.flags.wedY=P.year;
      P.titles.push('부실');ev('marry',x.id,{bushil:true});fx({wealth:30});}},
    {t:'기방에 남는다',sub:'내 이름으로 살아간다',p:.9,safe:true,tags:['명기의 길'],fn:()=>{say('기방에 남기로 하였다. 그대의 이름은 그대의 것이었다.');fx({fame:4});}},
    {t:'마음만 준다',sub:'정인으로 남는다',p:.8,tags:['정 ↑'],fn:()=>{x.status='lover';x.h=clamp(x.h+10);say(`${gwawa(nm)} 정인으로 남았다.`);}}]};
}

/* ---- 혼담 ---- */
function matchScene(re){
  note('gunghap');
  const cands=[];
  const love=Object.values(P.people).filter(x=>x.kind==='love'&&x.alive&&x.t>=50&&canWed(x)&&x.blocked!==P.year&&x.status!=='parted');
  if(love.length)cands.push(R(love));
  while(cands.length<3){
    const cls=P.cls==='royal'?'yangban':P.cls==='cheonmin'?'cheonmin':P.cls==='yangban'?'yangban':R([P.cls,P.cls,'sangmin','jungin'].filter(c=>canMarryCls(P.cls,c)));
    const age=P.female?P.age+ri(-1,7):clamp(P.age-ri(0,7),18,60);
    const x=newPerson({kind:'cand',female:!P.female,cls,sub:cls==='cheonmin'?'nobi':'',born:P.year-Math.max(18,age)});
    x.wealth=ri(0,3);x.fam=famText(x);
    cands.push(x);
  }
  const intro=re?'다시 혼담이 들어왔다.':P.sibs.some(s=>s.alive&&s.older&&!s.female)&&chance(.4)?'오라비가 나서서 혼처를 골라 왔다. 혼담이 들어왔다.':'중매쟁이가 드나들며 혼담을 넣었다.';
  const opts=cands.map(x=>{
    const tags=[];
    if(x.kind==='love')tags.push('마음 가는 사람');
    if(x.wealth>=3)tags.push('재산 ↑');if(x.wealth===0)tags.push('형편이 어려움');
    if(/명문가|이름난/.test(x.fam))tags.push('평판 ↑');if(/몰락/.test(x.fam))tags.push('평판 ↓');
    if(x.cls!==P.cls)tags.push(`신분: ${CLS[x.cls].n}`);
    const p=x.kind==='love'?clamp(.65+(x.cls===P.cls?.1:0)):.95;
    return {t:`${gwawa(callOf(x))} 혼인한다`,sub:`${ageOf(x)}세 · ${x.fam}`,p,tags,pid:x.id,fn:()=>{
      if(x.kind==='love'){return marryScene(x);}
      if(/명문가|이름난/.test(x.fam))fx({fame:6},true);
      if(x.wealth>=3)fx({wealth:({yangban:200,jungin:80,sangmin:20,cheonmin:2,royal:300}[P.cls]||10)},true);
      wed(x);}};
  });
  const forced=P.female&&['yangban','royal'].includes(P.cls)&&P.rejects>=2;
  opts.push({t:forced?'(부모의 뜻을 더는 거스를 수 없다)':'모두 물리친다',sub:forced?'':'집안의 눈총을 받는다',p:forced?null:.9,dis:forced,tags:['평판 조금 ↓','마음고생 ↑'],fn:()=>{P.rejects++;fx({fame:-3,worry:8});say('혼담을 모두 물리쳤다. 집안에 한숨 소리가 들렸다.');Object.values(P.people).forEach(x=>{if(x.kind==='cand')delete P.people[x.id];});}});
  return {kind:'major',title:'혼담',text:`${intro} 사주단자를 받고 궁합을 볼 수 있다.`,opts,cards:cands.map(x=>x.id),match:true};
}
function gunghap(x){
  if(x.gh)return x.gh;
  const g=x.comp>.66?'천생연분이라는 점괘가 나왔다.':x.comp>.33?'무난하다는 점괘가 나왔다.':'서로 부딪칠 일이 많겠다는 점괘가 나왔다.';
  x.gh=g;return g;
}
function wed(x,silent,elope){
  if(P.court&&!x.kingRole&&P.female){P.court=false;if(P.job&&P.job.k==='court')P.job=null;P.home='사가(私家)';fx({fame:-12},true);say('궁녀의 몸으로 혼인하려면 궁을 떠나야 했다. 오랜 청원 끝에 출궁하였다.','big');ev('court','궁을 떠났다');}
  Object.values(P.people).forEach(y=>{if(y.kind==='cand'&&y.id!==x.id)delete P.people[y.id];});
  const love=x.kind==='love';
  x.kind='spouse';x.status='married';
  if(!x.rank&&x.cls==='yangban'&&!x.female)x.rank=ri(0,9);
  P.spouse=x.id;P.married=true;P.widowed=false;P.flags.wedY=P.year;P.rejects=0;
  ev('marry',x.id,{love,elope:!!elope,mode:x.mode||'wife'});
  /* 정실로 시집간 여인은 남편 집안의 신분을 따른다 */
  if(P.female&&x.mode!=='cheop'&&!x.kingRole&&P.sub!=='cheop'&&CRANK.indexOf(x.cls)>CRANK.indexOf(P.cls)){P.birthCls=P.birthCls||P.cls;P.preMarryCls=P.cls;P.marryRoseBy=x.id;const from=CLS[P.cls].n;P.cls=x.cls;P.sub='';P.flags.clsReason='marriage';say(`${callOf(x)} 집안의 정실이 되어, 그대도 ${from}에서 ${CLS[x.cls].n} 집안의 사람이 되었다.`);}
  if(P.female&&x.seja){setJob('queen',0);P.court=true;P.home='세자궁(동궁)';}
  else if(!P.female&&x.cls==='royal'&&x.female&&P.cls!=='royal'&&!(P.job&&P.job.k==='buma')){if(CRANK.indexOf(P.cls)<3){P.birthCls=P.birthCls||P.cls;P.preMarryCls=P.cls;P.marryRoseBy=x.id;P.cls='yangban';P.sub='';P.flags.clsReason='marriage';say('부마가 되어 양반의 반열에 올랐다.');}setJob('buma',0);}
  /* 혼인한 여인은 무엇이든 자리가 생긴다 */
  else if(P.female&&!x.kingRole){
    if((P.sub==='cheop'||x.mode==='cheop')&&['royal','yangban'].includes(x.cls))setJob('sosil',0);
    else if(x.cls==='royal'&&!(P.job&&['queen','concubine'].includes(P.job.k)))setJob('royalwife',/대군/.test(x.title||'')?1:0);
    else if(['yangban','jungin','royal'].includes(P.cls)&&(!P.job||!JOB_KEEP.includes(P.job.k)||P.job.k==='lady'))setJob('lady',1);
    else if(!P.job||!JOB_KEEP.includes(P.job.k))setJob('housewife',0);
  }
  const cx=Store.codex();
  if(silent)return;
  note('honrye');
  const nm=callOf(x);
  say(`${nm}의 집안과 사주단자가 오가고 혼례 날이 잡혔다.`);
  if(x.gh)say(`궁합은 ${x.gh}`);
  const cost={royal:300,yangban:120,jungin:40,sangmin:6,cheonmin:.6}[P.cls]||5;P.wealth=Math.max(0,P.wealth-cost);
  if(love)say(`초례청에서 ${gwawa(nm)} 마주 섰다. 눈가가 젖어 들었다.`,'big');
  else say(`초례청에서 ${nm}의 얼굴을 처음 마주하였다.${x.comp>.6?' 생각보다 다정한 눈빛이었다.':x.comp<.3?' 낯선 얼굴이 어색하기만 하였다.':''}`,'big');
  say('그날 밤 신방의 촛불이 꺼지고, 밤이 깊었다.');
  if(P.year>=1600&&P.year<1894&&P.age>=(P.female?20:24)){note('johon');say(P.female?'또래들은 열서너 살에 시집갔으니, 늦은 혼례라는 수군거림이 있었다.':'또래들은 일찍 장가들었으니, 늦장가라는 놀림을 받았다.');}
  if(P.female){
    if(P.year>=1600){say('혼례를 치르고 신행길에 올라 시댁으로 들어갔다.');P.home=`시댁 (${HOMES[x.cls==='royal'?'yangban':x.cls]||'초가'})`;}
    else{note('namgwi');if(P.year<1392){say('고려의 풍습대로 신랑이 처가로 들어와 살았다. 아이들도 외가에서 자랄 것이다.');P.home='친정 (신랑이 처가살이)';}else{say('혼례 뒤 신랑이 친정에 들어와 살았다(남귀여가). 한참 뒤에야 시댁으로 옮겨 갔다.');P.home='친정 (신랑이 처가살이)';P.flags.moveSidaek=P.year+ri(3,8);}}

    if(chance(.45)&&x.cls!=='cheonmin'){P.flags.jongga=1;}
    if(x.cls!=='cheonmin'){const el=newPerson({kind:'elder',female:true,cls:x.cls,born:P.year-ri(40,52),title:'시어머니',rel:ri(25,60)});el.name='시어머니';P.elder=el.id;}
    if(P.cls==='yangban'&&chance(.3)){const r=newPerson({kind:'rival',female:true,cls:'yangban',born:P.year-ri(18,30),grudge:25});r.title=`동서 ${r.sur}씨`;r.note='시댁의 동서';}
  } else {
    if(P.year<1600&&P.cls!=='cheonmin'){note('namgwi');say(P.year<1392?'고려의 풍습대로 처가에 들어가 살았다.':'풍습대로 처가에 들어가 살았다(남귀여가).');P.home='처가';P.flags.moveBack=P.year+ri(3,10);}
    if(x.cls!=='cheonmin'){const el=newPerson({kind:'elder',female:true,cls:x.cls,born:P.year-ri(40,52),title:'장모',rel:ri(35,70)});el.name='장모';P.elder=el.id;}
  }
}

/* ---- 혼인 전 회임 ---- */
function unwedPregScene(x){
  const nm=callOf(x);const me=P.female;
  const opts=[{t:'혼인을 청한다',sub:'아이를 위해 서둘러 혼인한다',p:null,tags:['혼인','집안의 반대가 있을 수 있음'],fn:()=>{x.t=clamp(x.t+12);return marryScene(x);}}];
  if(me){
    opts.push({t:'홀로 아이를 낳기로 한다',sub:'세상의 손가락질을 견딘다',p:null,tags:['평판 ↓','마음고생 ↑'],fn:()=>{fx({fame:-15,worry:15});say('혼인하지 않고 아이를 낳기로 하였다. 고을에 말이 돌았다.','big');ev('unwed','혼인하지 않은 채 아이를 가졌다');}});
    opts.push({t:'그와 함께 달아난다',sub:'아무도 모르는 곳에서 새로 시작한다',p:clamp(.35+P.st.brave/180),tags:['신분·재산이 바뀜','평판 ↓'],fn:()=>{
      if(chance(.35+P.st.brave/180)){say(`달 없는 밤, ${gwawa(nm)} 손을 잡고 고향을 떠났다.`,'big');P.flags.elope=1;P.wealth*=.2;P.home='먼 산골 초가';if(['yangban','royal'].includes(P.cls)){P.cls='sangmin';P.sub='';P.job=null;}x.mode='wife';wed(x,true,true);}
      else{say('붙잡혀 끌려왔다. 온 고을에 소문이 났다.','big');fx({fame:-25,worry:20});}}});
  } else {
    opts.push({t:'아이를 내 자식으로 거둔다',sub:'혼인은 하지 않되 책임은 진다',p:null,tags:['평판 조금 ↓','자식은 서출'],fn:()=>{fx({fame:-8});P.preg.keep=1;say('혼인은 하지 않았으나 태어날 아이는 거두기로 하였다.');}});
    opts.push({t:'모른 척한다',sub:'그와의 인연을 끊는다',p:null,tags:['정 크게 ↓','인연이 끊김'],fn:()=>{x.t=clamp(x.t-45);x.status='parted';P.preg=null;fx({worry:10});say(`${nm}을(를) 외면하였다. 그 뒤로 소식이 끊겼다.`.replace('을(를)',bat(nm)?'을':'를'),'big');ev('parted',x.id);}});
  }
  return {kind:'major',title:'회임',pid:x.id,text:me?`혼인하지 않은 몸에 태기가 있었다. ${nm}의 아이였다. 어떻게 할 것인가.`:`${iga(nm)} 그대의 아이를 가졌다는 소식이 왔다. 어떻게 할 것인가.`,opts};
}

/* ---- 자식 ---- */
function kidsScene(more){
  return {kind:'major',title:more?'자식 더 두기':'자식',text:more?'어느덧 아이가 셋이 되었다. 아이를 더 둘 것인가.':'혼인한 지 한 해가 지났다. 아이를 가질 것인가.',opts:[
    {t:more?'더 낳는다':'아이를 가진다',p:null,tags:['태기는 운에 달림',P.female?'해산의 위험':'아내의 해산 위험'],fn:()=>{P.wantKids=true;P.autoKid=P.autoKid||{};if(P.spouse)P.autoKid[P.spouse]=true;say(more?'아이를 더 두기로 하였다.':'아이를 기다리기로 하였다. (해마다 아이 갖기가 켜졌다)');}},
    {t:more?'이만하면 되었다':'아직은 아니다',p:null,safe:true,tags:['집안의 눈총'],fn:()=>{P.wantKids=more?false:null;if(more)P.autoKid={};if(!more){P.flags.wedY=P.year+1;}fx({worry:3},true);}},
    ...(more?[]:[{t:'아이를 두지 않는다',p:null,tags:['집안의 눈총 ↑','양자를 들일 수 있음'],fn:()=>{P.wantKids=false;P.autoKid={};say('아이를 두지 않기로 하였다.');fx({fame:-3,worry:5});}}])]};
}
function kidWedScene(k){
  k.wedAsked=true;
  const RANK=['cheonmin','sangmin','jungin','yangban','royal'];const my=RANK.indexOf(P.cls);
  const upCls=RANK[Math.min(3,my+1)];const canUp=my<3;
  const kidSur=P.female?((P.people[k.father]||spouseP()||{}).sur):P.sur;
  const mk=(kind)=>{let s=surname();for(let i=0;i<8&&s[0]===kidSur;i++)s=surname();
    let cls=kind==='up'?upCls:kind==='heart'&&chance(.4)&&my>0?RANK[my-1]:P.cls;
    if(cls==='royal')cls='yangban'; /* 왕실은 같은 이씨끼리 혼인하지 않는다 */
    let rich=kind==='rich'?3:kind==='up'?ri(1,3):ri(0,2);if(cls==='cheonmin')rich=Math.min(rich,1);
    return {sur:s[0],bon:s[1],kind,cls,rich};};
  const fams=[mk('rich'),canUp?mk('up'):mk('noble'),mk('heart')];
  const famName=f=>(['yangban','royal'].includes(f.cls)?`${f.bon} ${f.sur}씨 집안`:`${f.sur}씨네`);
  const desc=f=>`${CLS[f.cls].n} · ${RICH[f.rich]}`;
  const opts=fams.map(f=>{
    const p=f.kind==='up'?clamp(.3+(k.st?Math.max(k.st.look,k.st.know):30)/250+P.st.fame/400+(P.wealth>UNIT[P.cls]*60?.1:0),.1,.85):null;
    return {t:`${gwawa(famName(f))} 사돈을 맺는다`,sub:`${desc(f)} · ${f.kind==='rich'?'넉넉한 집안':f.kind==='up'?'우리보다 신분이 높은 집안':f.kind==='noble'?'이름난 집안':`${iga(k.name)} 마음에 둔 집`}`,p,
      tags:f.kind==='rich'?['재산 ↑','재력 ↑']:f.kind==='up'?['성공하면 평판·재력 ↑','거절당할 수 있음']:f.kind==='noble'?['평판 ↑','혼수 부담']:['아이의 행복'],fn:()=>{
      if(p!=null&&!chance(p)){say(`${famName(f)}에서 신분이 맞지 않는다며 혼담을 물렸다.`);fx({worry:5});k.wedAsked=false;return null;}
      k.married=true;k.inlaw=famName(f);k.inlawCls=f.cls;k.inlawRich=f.rich;k.wedY=P.year;
      if(k.female&&k.cls!=='cheonmin'&&CRANK.indexOf(f.cls)>CRANK.indexOf(k.cls||P.cls))k.cls=f.cls;
      const cost={royal:200,yangban:80,jungin:30,sangmin:5,cheonmin:.5}[P.cls]||5;
      fx({wealth:f.kind==='rich'?cost*.6:f.kind==='noble'||f.kind==='up'?-cost*1.1:-cost*.7},true);
      if(f.kind==='noble')fx({fame:6},true);
      k.happy=f.kind==='heart';
      say(`${k.female?'딸':'아들'} ${eulreul(k.name)} ${gwawa(famName(f))} 혼인시켰다. 그 집과 사돈이 되었다.`,'big');ev('kidwed',k.name,{inlaw:k.inlaw});
      inlawBoost(k,f.cls,f.rich);}};});
  return {kind:'major',title:'자식의 혼사',text:`${k.female?'딸':'아들'} ${iga(k.name)} 혼기가 되었다. 어느 집과 사돈을 맺을 것인가.`,opts};
}
function adoptScene(rand){
  P.flags.adoptAsked=1;
  const opts=[];
  if(['yangban','royal','jungin'].includes(P.cls))opts.push({t:'친척 아이를 양자로 들인다',sub:'대를 잇는다',p:null,tags:['양자','평판 ↑'],fn:()=>{const a=ri(3,9);const k={id:uid(),name:personName(P.cls,false),female:false,born:P.year-a,alive:true,adopted:true,married:false,grand:0};P.kids.push(k);say(`같은 성씨 친척의 아이 ${eulreul(k.name)} [[양자]]로 들였다.`,'big');note('yangja');ev('adopt',k.name);fx({fame:4,worry:-8});}});
  opts.push({t:'고아를 거둔다',sub:'의지할 데 없는 아이를 키운다',p:null,tags:['재산 조금 ↓','덕을 쌓음'],fn:()=>{const a=ri(2,8);const fem=chance(.5);const k={id:uid(),name:personName(P.cls==='cheonmin'?'cheonmin':P.cls,fem),female:fem,born:P.year-a,alive:true,adopted:true,married:false,grand:0};P.kids.push(k);say(`길에서 떠돌던 아이 ${eulreul(k.name)} 거두어 수양${fem?'딸':'아들'}로 삼았다.`,'big');ev('adopt',k.name);fx({fame:3,worry:-6});}});
  opts.push({t:'들이지 않는다',p:null,safe:true,tags:[],fn:()=>{say('아이를 들이지 않기로 하였다.');}});
  return {kind:'major',title:'입양',text:rand?'의지할 데 없는 아이의 소식을 들었다.':'혼인한 지 오래되었으나 슬하에 아이가 없다. 집안 어른들의 걱정이 크다.',opts};
}
function cheopScene(){
  return {kind:'major',title:'첩',text:'집안에서 첩을 들이라는 말이 나왔다.',opts:[
    {t:'첩을 들인다',p:null,tags:['아내의 정 ↓','서얼 자식'],fn:()=>{P.cheopN++;const c=newPerson({kind:'cheop',female:true,cls:chance(.5)?'sangmin':'cheonmin',born:P.year-ri(18,24),h:20,t:30});c.title=`첩 ${c.name}`;say(`${eulreul(c.name)} 첩으로 들였다.`,'big');note('cheop');const sp=spouseP();if(sp)sp.t=clamp(sp.t-20);ev('cheop',c.name);}},
    {t:'들이지 않는다',p:null,safe:true,tags:['아내의 정 ↑'],fn:()=>{const sp=spouseP();if(sp)sp.t=clamp(sp.t+8);say('첩을 들이지 않았다.');}}]};
}
function husbandCheop(){
  P.flags.hubCheop=1;note('cheop');
  const r=newPerson({kind:'rival',female:true,cls:chance(.5)?'sangmin':'cheonmin',born:P.year-ri(17,23),grudge:30});r.title=`남편의 첩 ${r.name}`;r.note='남편의 첩';
  return {kind:'major',title:'남편의 첩',text:`남편이 ${eulreul(r.name)} 첩으로 들였다.`,opts:[
    {t:'참고 견딘다',p:.8,safe:true,tags:['마음고생 ↑'],fn:()=>{fx({worry:12,grace:3});say('속으로 삭이며 안살림을 지켰다.');}},
    {t:'투기한다',sub:'칠거지악의 하나다',p:.4,tags:['소박맞을 수 있음'],fn:()=>{note('chilgeo');if(chance(.4)){say('남편이 첩을 멀리하였다.');r.grudge=clamp(r.grudge+20);}else{say('투기한다는 말이 돌아 시댁의 눈총을 받았다.');fx({fame:-10});if(chance(.25)){caughtAffair();}}}}]};
}
function affairScene(x){
  P.flags.affairAsked=1;const nm=callOf(x);
  const tags=P.female?['소박맞을 수 있음','이혼당할 수 있음','평판이 무너질 수 있음']:['평판이 무너질 수 있음','아내의 정 ↓'];
  return {kind:'major',title:'혼인 뒤의 연정',pid:x.id,text:`혼인한 몸이건만 ${eulreul(nm)} 향한 마음이 사그라지지 않는다.`,opts:[
    {t:'마음을 접는다',p:.9,safe:true,tags:['마음고생 ↑'],fn:()=>{x.status='parted';fx({worry:10});say('그 마음을 가슴 깊이 묻었다.');}},
    {t:'몰래 만난다',p:.65,tags,fn:()=>{P.affair=x.id;x.status='lover';x.h=clamp(x.h+10);say(`남몰래 ${gwawa(nm)} 만나기 시작하였다.`,'big');ev('affair',x.id);}}]};
}
function rivalScene(r){
  const nm=r.title||r.name;if(r.power==null)r.power=ri(60,80);
  const pw=clamp(.3+(P.st.wit+P.st.brave)/300+(P.st.fame-(r.power||60))/400,.1,.92);
  const pr=clamp(.25+P.st.grace/200-(r.grudge-50)/300,.05,.85);
  return {kind:'major',title:'악연',pid:r.id,text:`${iga(nm)} 그대를 모함하는 말을 퍼뜨린다.${r.power<40?' 예전만 한 기세는 아니다.':''}`,opts:[
    {t:'맞선다',sub:'이기면 상대의 기세와 평판이 꺾인다',p:pw,tags:['성공하면 상대 기세 ↓','실패하면 평판 ↓'],fn:()=>{
      if(chance(pw)){r.power=clamp(r.power-ri(25,40));r.grudge=clamp(r.grudge-5);fx({fame:6});
        if(r.power<=0){r.crushed=1;r.grudge=0;r.note=(r.note?r.note+' · ':'')+'꺾인 악연';say(`${nm}의 거짓이 낱낱이 드러났다. 사람들이 등을 돌려, ${nm}${bat(nm)?'은':'는'} 다시는 고개를 들지 못하였다.`,'big');ev('rivalwin',nm);}
        else{r.quietUntil=P.year+ri(3,6);say(`${nm}의 거짓이 드러났다. 한동안은 잠잠할 것이다.`,'big');}}
      else{r.power=clamp(r.power+10);r.quietUntil=P.year+2;say('맞섰으나 오히려 그대가 몰리고 말았다.');fx({fame:-12,worry:10});}}},
    {t:'참고 견딘다',p:.8,safe:true,tags:['마음고생 ↑','평판 조금 ↓'],fn:()=>{fx({fame:-5,worry:10});r.grudge=clamp(r.grudge-8);r.quietUntil=P.year+ri(2,4);say('입을 다물고 견디었다. 소문은 차츰 잦아들었다.');}},
    {t:'화해를 청한다',p:pr,tags:['악연이 풀릴 수 있음'],fn:()=>{if(chance(pr)){r.grudge=clamp(r.grudge-45);r.quietUntil=P.year+ri(4,7);if(r.grudge<25){r.crushed=1;r.note=(r.note?r.note+' · ':'')+'화해한 사이';}say(`${gwawa(nm)} 묵은 감정을 풀었다.`,'big');}else{say('화해의 손길이 뿌리쳐졌다.');r.grudge=clamp(r.grudge+5);r.quietUntil=P.year+2;}}}]};
}
function napsokScene(){
  P.flags.napsokAsked=1;
  const cost=Math.min(P.wealth,40);
  return {kind:'major',title:'면천의 기회',text:'몰래 모은 재물로 곡식을 바치면 [[면천]]될 수 있다는 말을 들었다.',opts:[
    {t:'재물을 바쳐 면천한다',p:.75,tags:['신분 변화: 양인','재산 ↓'],fn:()=>{P.wealth-=cost;if(chance(.75)){P.cls='sangmin';P.sub='';P.job=null;P.home='초가삼간';say('[[납속]]으로 면천되어 양인이 되었다!','big');note('myeoncheon');ev('freed','납속으로 면천되었다');}else say('재물만 날리고 면천은 되지 않았다.','big');}},
    {t:'때를 기다린다',p:null,safe:true,tags:[],fn:()=>{say('아직은 때가 아니라 여겼다.');}}]};
}
function namjangScene(){
  P.flags.namjang=1;note('gwageo');
  return {kind:'major',title:'남장',text:'과거 날이 다가온다. 여인은 과거를 볼 수 없다. 그러나 사내 옷을 입고 갓을 쓰면 어떨까.',opts:[
    {t:'남장하고 과거장에 들어간다',p:clamp(P.st.know/150),tags:['아주 드문 일','들키면 큰일'],fn:()=>{if(chance(P.st.know/150)){rare('namjang','남장을 하고 과거장에 들어가 글을 지었다. 이름이 방에 붙었으나, 끝내 그 이름의 주인이 누구인지 아무도 알지 못하였다.');fx({fame:10,know:5});}else{say('과거장에서 정체가 드러날 뻔하여 허둥지둥 빠져나왔다. 고을에 이상한 소문이 돌았다.','big');fx({fame:-12});}}},
    {t:'그만둔다',p:null,safe:true,tags:[],fn:()=>{say('붓을 꺾었다.');}}]};
}

/* ---- 한 해의 끝과 죽음 ---- */
function yEnd(){
  if(P.flags.queenAt&&P.year===P.flags.queenAt&&P.realSpouse==='사도세자'){const sp=spouseP();if(sp&&sp.alive){setJob('queen',1);P.home='중궁전';say('세자가 보위에 오르고 그대는 중전이 되었다.','big');}}
  if(P.realSpouse==='사도세자'&&!P.alt&&P.year===1776&&P.kids.some(k=>!k.female&&k.alive&&!k.adopted)){say('그대의 아들이 보위에 올랐다. 임금의 어머니가 되었다.','big');fx({fame:30});P.titles.push('임금의 어머니');}
  // 암행어사 정인
  if(!P.flags.rare_amhaeng&&(P.exile||P.st.fame<15)){const x=Object.values(P.people).find(p=>p.kind==='love'&&p.alive&&!p.female&&p.cls==='yangban'&&p.h>=55&&p.t>=55);if(x&&chance(.15)){note('amhaeng');rare('amhaeng',`어느 날 마패를 찬 사내가 나타났다. 지난날의 정인 ${x.sur} 도령이 암행어사가 되어 돌아온 것이었다. 그가 그대의 억울함을 풀어 주었다.`);fx({fame:20,worry:-15});if(P.exile){P.exile=P.year;}}}
  Store.saveCur();
  if(P.year>=1990){return closeScene();}
  if(P.year>=1910&&P.alt&&!P.flags.altEnd){P.flags.altEnd=1;}
  const h=P.st.health;let d;
  const a=P.age;
  d=a<15?.0008:a<30?.004:a<40?.007:a<50?.013:a<60?.025:a<70?.05:a<80?.1:.2;
  if(h<50)d*=1+(50-h)/30;if(P.flags.warYear)d*=1.4;if(FAMINES.includes(P.year))d*=1.3;
  if(a<18)d=h>0?.0002:1;
  if(h<=0||chance(d)||a>=98){if(typeof G!=='undefined'&&!G.headless){G.deathPending=true;P.cause=P.cause||causeText();say(`${P.cause} 자리에 눕고 말았다…`,'big');return;}return deathScene();}
}
function causeText(){
  if(P.cause)return P.cause;
  const a=P.age,y=P.year;
  /* 조선 사람들이 실제로 앓고 겪던 일들 */
  const L=[];const add=(w,t)=>L.push([t,w]);
  if(a>=70)add(10,'천수를 누리고');
  if(a>=55){add(4,'노환으로');add(3,'중풍으로 쓰러져');add(2,'기력이 쇠하여');add(1,'소갈증(당뇨)이 깊어져');add(2,'해수병(기침병)이 도져');}
  if(a>=40){add(2,'등창이 도져');add(1,'중풍으로 쓰러져');add(1,'소갈증(당뇨)이 깊어져');add(1,'적취(배 속 덩어리)를 앓다가');}
  add(3,'염병(장티푸스)을 앓다가');add(2,'학질(말라리아)에 걸려');add(2,'이질을 앓다가');add(2,'노채(폐결핵)로 오래 앓다가');
  add(1,'토사곽란으로');add(1,'종기가 덧나');add(1,'홍역을 앓다가');add(1,'갑작스러운 병으로');add(1,'급체하여');
  if(a<60){add(.5,'물에 빠져');add(.4,'낙상하여');}
  if(!['yangban','royal'].includes(P.cls)){add(.6,'산에서 호환(범에게 물림)을 당하여');add(.6,'고된 일 끝에 병을 얻어');}
  if(P.female&&a<45)add(.8,'산후병으로');
  if(y>=1821)add(typeof PLAGUES!=='undefined'&&PLAGUES.includes(y)?8:1,'괴질(콜레라)에 걸려');
  if(P.st.worry>70)add(3,'화병이 깊어져');
  return wpick(L);
}
function deathScene(){
  P.dying=true;
  const by=[];const sp=spouseP();
  if(sp&&sp.alive)by.push(spouseWord(sp)+' '+(sp.title||sp.name));
  P.kids.filter(k=>k.alive).forEach(k=>by.push((k.female?'딸 ':'아들 ')+k.name));
  if(P.helper&&P.people[P.helper]&&P.people[P.helper].alive&&P.people[P.helper].h>=45)by.push(P.people[P.helper].role+' '+P.people[P.helper].name);
  const lover=Object.values(P.people).filter(x=>x.kind==='love'&&x.alive&&x.h>=55&&x.id!==P.spouse).sort((a,b)=>b.h-a.h)[0];
  let text=`${P.age}세. ${causeText()} 자리에 누웠다.`;
  if(by.length)text+=` 곁에는 ${iga(by.slice(0,5).join(', '))} 있었다.`;else text+=' 곁을 지키는 이가 없었다.';
  if(lover)text+=` 소식을 들은 ${iga(callOf(lover))} 먼 길을 달려와 문밖에 섰다.`;
  const words=[];const pool=[...LAST_WORDS];
  if(lover)words.push(`${callOf(lover)}에게… 고마웠다고 전해 다오.`);
  while(words.length<3){const w=pool.splice(ri(0,pool.length-1),1)[0];if(w)words.push(w);}
  P.lover=lover?lover.id:null;
  return {kind:'death',title:'임종',text,opts:[...words.map(w=>({t:`"${w}"`,p:null,fn:()=>{P.last=w;return willScene();}})),{t:'마지막 말을 직접 남긴다',input:true,p:null,fn:()=>{P.last=String(G.lastInput||'').trim().slice(0,80)||'…';G.lastInput='';return willScene();}}]};
}
function willScene(){
  const kids=P.kids.filter(k=>k.alive);
  if(!kids.length||P.wealth<5){return finishLife();}
  const sons=kids.filter(k=>!k.female);
  const opts=[];
  if(sons.length&&kids.length>1)opts.push({t:'맏아들에게 몰아준다',sub:'집안의 대를 잇게 한다',p:null,fn:()=>{P.heirs=`가산은 맏아들 ${sons[0].name}에게 물려주었다.`;return finishLife();}});
  if(kids.length>1)opts.push({t:'아들딸 고르게 나눈다',p:null,fn:()=>{P.heirs=`가산은 ${kids.length}남매에게 고르게 나누어 주었다.`;return finishLife();}});
  else opts.push({t:`${kids[0].female?'외동딸':'외아들'} ${kids[0].name}에게 물려준다`,p:null,fn:()=>{P.heirs=`가산은 ${kids[0].female?'외동딸':'외아들'} ${kids[0].name}에게 물려주었다.`;return finishLife();}});
  opts.push({t:'일부를 어려운 이웃에게 남긴다',p:null,fn:()=>{P.heirs='가산의 일부를 굶주린 이웃에게 나누어 주라 하였다.';fx({fame:5},true);return finishLife();}});
  return {kind:'death',title:'유언',text:`남길 재산은 ${money(P.wealth)}. 어떻게 나눌 것인가.`,opts};
}
function closeScene(){
  return {kind:'death',title:'실록을 닫으며',text:'긴 세월이 흘렀다. 이 사람의 실록도 여기서 닫힌다.',opts:[{t:'실록을 닫는다',p:null,fn:()=>{P.closed=true;P.cause='';return finishLife(true);}}]};
}
function finishLife(closed){
  if(!closed){P.dead=true;P.deathYear=P.year;P.cause=causeText();say(`${P.age}세에 ${P.cause} 세상을 떠났다.`,'big');ev('death',P.cause);}
  else{P.closed=true;P.deathYear=P.year;say('나라가 저물던 해, 이 사람의 실록도 여기서 닫혔다.','big');}
  const sl=buildSillok();P.sillok=sl;
  const cx=Store.codex();
  cx.cls[clsKey(P)]=1;
  P.titles.forEach(t=>cx.titles[t]=1);
  P.kings.forEach(k=>cx.kings[k]=1);
  Store.saveCodex();
  const h={id:P.id,name:displayName(),sur:P.sur,bon:P.bon,cls:P.cls,female:P.female,born:P.born,death:P.deathYear,age:P.age,closed:!!closed,
    title:sl.title,epithet:sl.epithet,kids:P.kids.filter(k=>!k.adopted).length,origin:originText(P),alt:P.alt?P.alt.title:null,sillok:sl,peak:P.peak?jobTitle(P.peak):''};
  /* 한 해 한 해의 기록 (가볍게 줄여서) */
  h.log=P.feed.map(e=>[e.y,e.a,e.lab+(e.gz?' '+e.gz:''),e.lines.filter(l=>l.c!=='chg').map(l=>[l.c==='big'?1:0,l.t])]).filter(r=>r[3].length);
  Store.addHist(h);Store.clearCur();
  if(typeof UI!=='undefined')UI.onEnd(h);
  return null;
}
function displayName(){
  if(P.cls==='yangban'&&P.female||P.cls==='royal'&&P.female)return `${P.sur}씨`;
  if(P.flags.wasGisaeng||P.sub==='gisaeng')return P.name;
  if(['yangban','jungin','royal'].includes(P.cls)&&!P.female)return P.sur+P.name;
  return P.name;
}

/* ===== 살림과 집안의 일 ===== */
const UNIT={royal:30,yangban:4,jungin:3,sangmin:.6,cheonmin:.15};
function homeScene(){
  P.flags.homeY=P.year;
  const U=UNIT[P.cls]||.5;const W=P.wealth;const amt=f=>Math.max(U*f*10,W*f);
  const free=!(P.cls==='cheonmin'&&P.sub==='nobi');
  const sib=(P.sibs||[]).filter(s=>s.alive);
  const kid=P.kids.find(k=>k.alive&&(!k.edu||k.edu==='play')&&P.year-k.born>=7&&P.year-k.born<=13);
  const fam=typeof FAMINES!=='undefined'&&FAMINES.includes(P.year);
  const L=[];
  if(free&&W>=U*15)L.push(()=>{const c=amt(.3);const p=clamp(.55+P.st.wit/400);
    return {kind:'major',title:'살림 · 땅',text:`고을에 논밭을 내놓은 이가 있다. 값은 ${money(c)}쯤이라 한다. 땅을 사 두면 해마다 소출이 늘겠지만, 흉년이 들거나 땅에 탈이 나면 손해를 볼 수도 있다.`,opts:[
      {t:'땅을 사들인다',sub:'재산을 불릴 기회',p,tags:['재산 ↑↓'],fn:()=>{fx({wealth:-c},true);if(chance(p)){fx({wealth:c*1.9,fame:3,worry:-3});say('사들인 땅에서 소출이 넉넉히 났다. 살림이 한결 피었다.','big');}else{fx({worry:8});say('사들인 땅이 물에 잠겨 한 해 농사를 망쳤다. 헛돈만 쓴 셈이었다.');}}},
      {t:'욕심내지 않는다',p:null,safe:true,tags:[],fn:()=>{say('가진 것을 지키기로 하였다.');}}]};});
  if(W>=U*5)L.push(()=>{const c=amt(.2);const who=sib.length&&chance(.6)?(sib[0].female?'누이':'형제'):R(['사촌','외삼촌','먼 친척','이웃']);const p=clamp(.45+P.st.wit/300);
    return {kind:'major',title:'살림 · 빚',text:`${iga(who)} 찾아와 ${money(c)}만 빌려 달라며 사정하였다. 갚겠다고는 하나 형편이 넉넉해 보이지 않는다.`,opts:[
      {t:'빌려준다',sub:'정을 지킨다',p,tags:['재산 ↓','평판 ↑'],fn:()=>{fx({wealth:-c,fame:3},true);if(chance(p)){fx({wealth:c*1.1});say(`이듬해 ${iga(who)} 빌린 돈에 고맙다는 인사까지 얹어 갚았다.`);}else say(`${eunneun(who)} 끝내 돈을 갚지 못하였다. 그래도 사람을 잃지는 않았다.`);}},
      {t:'딱 잘라 거절한다',p:null,safe:true,tags:['평판 조금 ↓'],fn:()=>{fx({fame:-3});say(`${iga(who)} 서운한 얼굴로 돌아갔다.`);}}]};});
  if(parentAlive()&&P.age>=25)L.push(()=>{const c=amt(.12);const pw=P.parents.f.alive&&P.parents.m.alive?R(['아버지','어머니']):P.parents.f.alive?'아버지':'어머니';
    return {kind:'major',title:'집안 · 부모',text:`${iga(pw)} 병석에 누웠다는 기별이 왔다. 약값도 들고, 곁을 지키려면 손이 많이 간다.`,opts:[
      {t:'곁에서 정성껏 모신다',sub:'약값과 품이 든다',p:null,tags:['재산 ↓','평판 ↑','부모와 사이 ↑'],fn:()=>{P.flags.filial=1;prel();P.parentRel=clamp(P.parentRel+12);fx({wealth:-c,fame:6,worry:5,health:-2});say(`${pw}의 곁을 지키며 탕약을 달였다. 효성이 지극하다는 말이 고을에 퍼졌다.`);}},
      {t:'약값만 보낸다',p:null,tags:['재산 ↓'],fn:()=>{fx({wealth:-c*.6});say('약값을 보내고 소식만 기다렸다.');}},
      ...(sib.length?[{t:'형제에게 맡긴다',p:null,safe:true,tags:['부모와 사이 ↓'],fn:()=>{prel();P.parentRel=clamp(P.parentRel-8);fx({worry:3});say('형제에게 병구완을 맡겼다. 마음 한쪽이 무거웠다.');}}]:[])]};});
  if(sib.length&&free&&W>=U*8)L.push(()=>{const s=sib[0];const nm=s.name;const c=amt(.25);
    return {kind:'major',title:'살림 · 동업',text:`${s.female?'누이':'형제'} ${iga(nm)} 함께 장사를 해 보자며 밑천을 보태 달라 한다. 잘되면 큰돈이 되지만, 망하면 형제 사이도 틀어질 수 있다.`,opts:[
      {t:'함께 장사를 벌인다',p:.5,tags:['재산 ↑↓'],fn:()=>{fx({wealth:-c},true);if(chance(.5)){fx({wealth:c*2.2,worry:-3});say(`${gwawa(nm)} 벌인 장사가 제법 잘되었다. 형제가 함께 웃었다.`,'big');}else{fx({worry:10});say(`장사가 기울어 밑천을 다 날렸다. ${gwawa(nm)} 한동안 서먹하게 지냈다.`);}}},
      {t:'정중히 사양한다',p:null,safe:true,tags:[],fn:()=>{say(`${nm}에게 형편이 어렵다며 사양하였다.`);}}]};});
  if(fam||chance(.25)&&W>=U*10)L.push(()=>{const c=amt(.15);
    return {kind:'major',title:'고을 · 흉년',text:`${fam?'흉년이 들어':'봄 보릿고개에'} 고을에 굶는 이가 늘었다. 이웃들이 그대의 집 앞을 기웃거린다.`,opts:[
      {t:'곳간을 열어 나눈다',p:null,tags:['재산 ↓','평판 크게 ↑'],fn:()=>{P.flags.charity=1;fx({wealth:-c,fame:10,worry:-3});say('곳간을 열어 죽을 쑤어 나누었다. 사람들이 그대의 집을 향해 절을 하였다.','big');}},
      {t:'조금만 나눈다',p:null,tags:['재산 조금 ↓','평판 ↑'],fn:()=>{fx({wealth:-c*.3,fame:3});say('쌀 몇 됫박을 나누어 주었다.');}},
      {t:'문을 걸어 잠근다',p:null,safe:true,tags:['평판 ↓'],fn:()=>{fx({fame:-5});say('문을 걸어 잠갔다. 담 너머로 원망하는 소리가 들렸다.');}}]};});
  if(free&&W>=U*25&&!P.flags.bigHome)L.push(()=>{const c=amt(.3);
    return {kind:'major',title:'살림 · 집',text:`살림이 늘어 집이 비좁아졌다. 집을 넓혀 짓자는 말이 나왔다. 비용은 ${money(c)}쯤 든다.`,opts:[
      {t:'집을 넓혀 짓는다',p:null,tags:['재산 ↓','평판 ↑','마음고생 ↓'],fn:()=>{P.flags.bigHome=1;const up={'초가삼간':'너른 초가','기와집':'큰 기와집','사랑채 딸린 기와집':'솟을대문 달린 기와집'};P.home=up[P.home]||P.home;fx({wealth:-c,fame:4,worry:-6});say(`집을 넓혀 지었다. 이제 ${P.home}에서 산다.`,'big');}},
      {t:'아껴 둔다',p:null,safe:true,tags:[],fn:()=>{say('집은 그대로 두고 재물을 아껴 두었다.');}}]};});
  if(kid&&W>=U*3)L.push(()=>{const c=amt(.1);const kn=kid.name;
    return {kind:'major',title:'집안 · 자식 교육',text:`${kid.female?'딸':'아들'} ${iga(kn)} 제법 컸다. 글을 가르칠지, 집안일을 거들게 할지 정할 때가 되었다.`,opts:[
      {t:'스승을 모셔 가르친다',p:null,tags:['재산 ↓','자식의 앞날 ↑'],fn:()=>{kid.edu='seodang';fx({wealth:-c,fame:2});say(`${kn}에게 스승을 붙여 글을 가르쳤다. 총기가 남다르다는 말을 들었다.`);}},
      {t:'집안일을 거들게 한다',p:null,safe:true,tags:['재산 조금 ↑'],fn:()=>{kid.edu='work';fx({wealth:U});say(`${iga(kn)} 집안일을 야무지게 거들었다.`);}}]};});
  if(!L.length)return null;
  return R(L)();
}

/* 혼인한 사내가 마음에 둔 여인을 첩으로 들이는 일 */
function takeCheopScene(x){
  const nm=callOf(x);const sp=spouseP();
  const high=clsRank(x.cls,x.sub)>=clsRank(P.cls,P.sub)&&['yangban','royal'].includes(x.cls);
  const p=clamp((high?.15:.7)+(x.t-50)/200+P.st.look/500,.05,.92);
  return {kind:'major',title:'첩으로 들이기',pid:x.id,text:`이미 정실이 있는 몸이다. 나라의 법도에 아내는 하나뿐이니, ${eulreul(nm)} 맞으려면 첩으로 들일 수밖에 없다. ${nm}${bat(nm)?'은':'는'} ${personInfo(x)}이다.${high?' 양반가의 딸이 첩이 되기는 몹시 어려운 일이다.':''}`,opts:[
    {t:'첩으로 들인다',sub:'정실은 그대로 두고 그를 곁에 둔다',p,tags:['아내의 정 ↓','자식은 서얼',...(high?['상대 집안이 크게 반대']:[])],fn:()=>{
      if(!chance(p)){fx({worry:8,fame:-2});x.blocked=P.year;x.t=clamp(x.t-10);say(high?`${nm}의 집안에서 딸을 첩으로는 보낼 수 없다며 거절하였다.`:`${iga(nm)} 첩이 될 수는 없다며 거절하였다.`,'big');return null;}
      P.cheopN=(P.cheopN||0)+1;x.kind='cheop';x.status='married';if(!x.title)x.title=`첩 ${nm}`;
      if(P.target===x.id)P.target=null;
      if(sp)sp.t=clamp(sp.t-20);fx({worry:-3});note('cheop');ev('cheop',nm);
      say(`${eulreul(nm)} 첩으로 들였다. ${sp?callOf(sp)+'의 낯빛이 어두워졌다.':''}`,'big');}},
    {t:'아직은 미룬다',p:null,safe:true,tags:[],fn:()=>{say('마음을 품은 채 때를 기다리기로 하였다.');}}]};
}

/* 궁녀의 처소 정하기 */
function courtStat(){return P.courtDept?COURT_DEPT[P.courtDept][1]:'wit';}
function courtDeptScene(){
  const D=[['jimil','지밀','임금과 왕비의 침전에서 곁을 모신다. 가장 높은 처소라 출세가 빠르고, 임금의 눈에 들 일도 많다.','학식'],
    ['chim','침방','궁중의 옷을 짓는다.','재주'],['su','수방','옷과 장식에 수를 놓는다.','재주'],
    ['soju','소주방','수라와 잔칫상을 차린다.','건강'],['saeng','생과방','다과와 음료를 만든다.','재주'],['sedap','세답방','빨래와 다듬이를 맡는다. 고되지만 무난하다.','건강']];
  const opts=D.map(([k,n,sub,st])=>{const v=P.st[COURT_DEPT[k][1]]||0;const hard=k==='jimil';const p=hard?clamp(.25+P.st.wit/200+P.st.look/400):null;
    return {t:`${n} 나인`,sub,p,tags:[`${iga(st)} 중요`,...(hard?['임금의 눈에 들 수 있음']:[])],fn:()=>{
      if(hard&&!chance(p)){P.courtDept=R(['chim','su','saeng']);setJob('court',1);say(`지밀에 들고자 하였으나 뽑히지 못하고 ${COURT_DEPT[P.courtDept][0]}에 배치되었다.`,'big');return null;}
      P.courtDept=k;setJob('court',1);say(`관례를 치르고 ${n}의 정식 나인이 되었다.`,'big');note('gungso');}};});
  if(P.st.know>=35)opts.push({t:'내의원 의녀로 간다',sub:'궁녀가 아니라 의술을 익혀 궁중 여인들을 돌본다. 혼인하기도 한결 수월하다.',p:null,tags:['학식이 중요','신분: 의녀'],fn:()=>{P.court=false;P.home='내의원 근처';setJob('uinyeo',1);say('의술에 밝다는 말이 돌아 내의원 의녀로 뽑혔다.','big');note('uinyeo');}});
  return {kind:'major',title:'궁녀 · 처소',text:'관례를 치를 나이가 되었다. 생각시를 벗고 정식 나인이 되면 평생 일할 처소가 정해진다. 어느 처소로 가겠는가.',opts};
}

const JOB_KEEP=['princess','naesi','gisaeng','court','uinyeo','weaver','merchant','farmer','jumo','mudang','nurse','herb','hunjang','yein','sanpa','bangmul','haenyeo','dyer','poet','slave','gwangdae','sword','monk','queen','concubine','royalwife','lady'];
/* 왕실과 혼인한 이가 보위를 넘보는 일 */
function throneScene(){
  if(P.year<1392)return null;
  const self=!P.female&&P.cls==='royal';const x=self?null:spouseP();
  const nm=self?displayName():callOf(x);const tt=self?(P.job?jobTitle(P.job):'왕자'):(x.title||nm);
  P.flags.throneY=P.year;
  const p=clamp(.06+(P.st.wit+P.st.fame)/650+(P.focus==='power'?.1:0)+(P.flags.throneWait||0)*.06,.05,.6);
  const base=tt.replace(/(대군|군|왕자|세자)$/,'').trim();const kingName=(base||(self?P.name:(x&&x.name))||'새')+'왕';
  return {kind:'major',title:'보위를 넘보다',pid:x?x.id:undefined,text:`${self?'그대의 몸에 흐르는 것은 왕실의 피다.':`${eunneun(nm)} 왕실의 핏줄이다.`} 요사이 임금의 자리가 흔들린다는 말이 궐 안팎에 돈다. ${self?'스스로 보위에 오를':`${eulreul(nm)} 보위에 올릴`} 수 있다면, 그대는 ${self?'임금':'중전'}이 될 것이다. 그러나 실패하면 역모다.`,opts:[
    {t:'세력을 모아 거사를 꾀한다',sub:'학식과 평판, 세력 모으기가 도움이 된다',p,tags:['역사의 갈림길','실패하면 유배나 사약'],fn:()=>{
      note('branch');
      if(chance(p)){
        const from=P.year+1;P.alt={year:P.year,king:kingName,from,title:'보위를 바꾸다',line:`${self?'그대':nm}${self?'가':bat(nm)?'이':'가'} 거사로 보위에 올라 ${iga(kingName)} 되었다.`};ev('branch',`${self?'그대':nm}${self?'가':bat(nm)?'이':'가'} 보위에 올라 ${iga(kingName)} 되니, 정사와 다른 역사가 열렸다.`,{title:'보위'});
        if(self){setJob('king',0);P.home='대전';P.court=true;say(`거사가 성공하였다. 이듬해 그대가 보위에 올랐다. 이 판의 역사에서 그대는 ${kingName}이다.`,'big');}
        else{x.kingRole=true;x.title=kingName;x.rank=20;setJob('queen',1);P.home='중궁전';P.court=true;say(`거사가 성공하였다. ${iga(nm)} 보위에 올라 ${iga(kingName)} 되었고, 그대는 중전이 되었다.`,'big');}
        fx({fame:30,worry:-10});
      } else {
        say('거사가 미리 새어 나갔다. 역모로 몰렸다.','big');fx({fame:-25,worry:25});
        if(x&&chance(.5)){x.alive=false;say(`${iga(nm)} 사약을 받았다.`,'big');P.married=false;P.widowed=true;P.ev.push({type:'widow',y:P.year,a:P.age,t:nm});}
        punish({});
      }}},
    {t:'때를 기다린다',sub:'세력을 더 모은 뒤 다시 노린다',p:null,safe:true,tags:['다음 기회에 성공 가능성 ↑'],fn:()=>{P.flags.throneWait=(P.flags.throneWait||0)+1;say('은밀히 사람을 모으며 때를 기다렸다.');}},
    {t:'욕심을 버린다',p:null,safe:true,tags:['마음고생 ↓'],fn:()=>{P.flags.noThrone=1;fx({worry:-6});say(self?'보위에 대한 마음을 접고 조용히 살기로 하였다.':`${eulreul(nm)} 말려, 보위에 대한 마음을 접게 하였다.`);}}]};
}

/* 후궁에서 중전으로 */
function royalSons(){const sp=spouseP();return P.kids.filter(k=>k.alive&&!k.female&&sp&&k.father===sp.id).length;}
function queenRiseScene(){
  P.flags.qriseY=P.year;const k=realKing(P.year);const sons=royalSons();
  const p=clamp(.15+P.favor/300+sons*.1+P.st.wit/500+P.st.fame/600,.08,.8);
  return {kind:'major',title:'중궁의 자리',text:`중궁전이 흔들린다는 말이 궐 안에 돈다. ${sons?`왕자를 ${sons}명이나 낳은 그대를 두고, 다음 중전은 그대라는 수군거림이 들린다.`:'임금의 총애를 받는 그대를 두고 사람들이 수군거린다.'} 중전의 자리에 오를 수 있다면…`,opts:[
    {t:'중전의 자리를 노린다',sub:'총애와 왕자, 학식이 힘이 된다',p,tags:['신분 변화: 중전','실패하면 큰 화를 입음'],fn:()=>{
      if(chance(p)){setJob('queen',1);P.home='중궁전';fx({fame:25,worry:-5});P.favor=clamp(P.favor+10);say(`[[${k.n}]]이 그대를 왕비로 책봉하였다. 후궁에서 중전의 자리에 올랐다.${sons?' 그대가 낳은 왕자가 세자로 책봉될 것이라는 말이 돌았다.':''}`,'big');ev('job','후궁에서 중전으로 책봉되었다');note('naemyeong');}
      else{P.favor=clamp(P.favor-25);fx({fame:-15,worry:20});if(chance(.15)){say('중전을 모해하려 했다는 죄를 뒤집어썼다.','big');punish({});}else say('일이 틀어져 오히려 임금의 눈 밖에 났다.','big');}}},
    {t:'분수를 지킨다',p:null,safe:true,tags:['총애 조금 ↑'],fn:()=>{P.favor=clamp(P.favor+5);say('욕심을 드러내지 않고 조용히 처소를 지켰다.');}}]};
}
/* 첩에서 정실로 (그대가 첩일 때) */
function wifeRiseScene(){
  P.flags.wriseY=P.year;const sp=spouseP();const nm=callOf(sp);const sons=P.kids.filter(k=>k.alive&&!k.female).length;
  const yb=['yangban','royal'].includes(sp.cls);
  const p=clamp(.15+sons*.12+(sp.h||50)/400+(sp.wifeDead?.25:0),.08,.85);
  return {kind:'major',title:'정실의 자리',pid:sp.id,text:`${sp.wifeDead?`${nm}의 정실이 세상을 떠났다.`:`${nm}의 정실은 끝내 아들을 얻지 못하였다.`} ${sons?`아들 ${sons}명을 낳은 그대를 정실로 올리자는 말이 집안에서 나온다.`:'그대를 정실로 올리자는 말이 조심스레 나온다.'}${yb?' 다만 양반가에서 첩을 정실로 올리는 것은 법도에 어긋나는 일이다.':''}`,opts:[
    {t:'정실의 자리에 오른다',sub:'아들이 많을수록, 남편의 정이 깊을수록 쉽다',p,tags:['신분 변화: 정실',...(yb?['평판 ↓ (법도에 어긋남)']:[])],fn:()=>{
      if(chance(p)){P.sub='';sp.mode='wife';if(CRANK.indexOf(sp.cls)>CRANK.indexOf(P.cls)){P.birthCls=P.birthCls||P.cls;P.cls=sp.cls;P.flags.clsReason='marriage';}if(sp.cls==='royal')setJob('royalwife',/대군/.test(sp.title||'')?1:0);else if(P.job&&P.job.k==='sosil')setJob(['yangban','jungin'].includes(sp.cls)?'lady':'housewife',['yangban','jungin'].includes(sp.cls)?2:1);fx({fame:yb?-6:4,worry:-10});if(!yb)P.kids.forEach(k=>{if(k.father===sp.id)k.seo=false;});if(P.job&&P.job.k==='housewife')setJob('housewife',2);P.home=P.home.replace('의 별채','의 안채');say(`첩의 몸에서 벗어나 ${nm}의 정실이 되었다.${yb?' 다만 자식들의 서얼 신분은 그대로 남았다.':''}`,'big');ev('rise','첩에서 정실이 되었다');}
      else{fx({worry:10});say('집안 어른들의 반대로 뜻을 이루지 못하였다.');}}},
    {t:'지금 자리에 만족한다',p:null,safe:true,tags:[],fn:()=>{say('첩의 자리에서 조용히 살기로 하였다.');}}]};
}
/* 아내를 잃은 사내가 첩을 정실로 올리는 일 */
function promoteCheopScene(c){
  const nm=callOf(c);P.flags.pcheopY=P.year;const yb=['yangban','royal'].includes(P.cls);
  return {kind:'major',title:'첩을 정실로',pid:c.id,text:`아내를 잃고 집안의 안주인 자리가 비었다. 곁을 지켜 온 첩 ${eulreul(nm)} 정실로 올리자는 말이 나온다.${yb?' 다만 양반가에서 첩을 정실로 올리는 것은 법도에 어긋나는 일이다.':''}`,opts:[
    {t:`${eulreul(nm)} 정실로 올린다`,p:null,tags:['배우자가 생김',...(yb?['평판 ↓ (법도에 어긋남)']:[])],fn:()=>{c.kind='spouse';c.status='married';c.mode='wife';P.spouse=c.id;P.married=true;P.widowed=false;P.cheopN=Math.max(0,(P.cheopN||1)-1);fx({fame:yb?-6:2});say(`첩 ${eulreul(nm)} 정실로 올렸다. ${iga(nm)} 눈물을 글썽였다.`,'big');ev('marry',c.id,{love:true,mode:'wife'});}},
    {t:'새 아내를 들이기로 한다',p:null,safe:true,tags:[],fn:()=>{say('첩은 첩의 자리에 두고, 새 혼처를 알아보기로 하였다.');}}]};
}

/* 남편을 여읜 뒤: 수절과 열녀 */
function widowScene(){
  P.flags.widowAsked=1;const yb=['yangban','royal'].includes(P.cls);const sp=Object.values(P.people).filter(x=>x.kind==='spouse'&&!x.alive).pop();const nm=sp?callOf(sp):'남편';
  note('yeollyeo');
  return {kind:'major',title:'남편을 여의고',pid:sp&&sp.id,text:`${eulreul(nm)} 떠나보낸 뒤, 소복을 입고 삼년상을 치렀다. ${yb?'양반가의 과부에게 세상은 평생 수절을 바란다. 절개를 지킨 여인은 나라에서 열녀로 기리기도 한다.':'이웃들은 아직 젊으니 새 사람을 만나라고도 하고, 절개를 지키라고도 한다.'} 앞으로 어떻게 살 것인가.`,opts:[
    {t:'평생 수절한다',sub:'다시는 혼인하지 않고 정절을 지킨다',p:null,tags:['평판 ↑','다시 혼인하지 않음','열녀문을 받을 수 있음'],fn:()=>{P.flags.sujeol=P.year;P.flags.noRemarry=1;fx({fame:yb?12:6,worry:5});ev('sujeol','');say(`흰 소복을 벗지 않고 수절하기로 하였다.${P.kids.some(k=>k.alive)?' 남은 자식들을 홀로 길러 내리라 마음먹었다.':''}`,'big');}},
    {t:yb&&P.year>=1485&&!P.alt?'수절을 맹세하지는 않는다':'다시 인연이 오면 막지 않는다',sub:yb&&P.year>=1485&&!P.alt?'법도상 재가는 어렵지만, 굳이 맹세로 묶지 않는다':'언젠가 새 사람을 만날 수도 있다',p:null,safe:true,tags:yb&&!(P.year>=1485&&!P.alt)?['평판 조금 ↓']:[],fn:()=>{P.flags.widowOpen=1;if(yb&&!(P.year>=1485&&!P.alt))fx({fame:-4});fx({worry:-3});say(`슬픔을 추스르고 하루하루를 살아가기로 하였다.${P.kids.some(k=>k.alive)?' 남은 자식들이 큰 힘이 되었다.':''}`);}}]};
}
function jeongnyeoScene(){
  P.flags.jeongnyeo=1;const y=P.year-P.flags.sujeol;
  return {kind:'major',title:'열녀문',text:`${kAge(y)} 해 동안 절개를 지킨 일이 고을을 넘어 조정에까지 알려졌다. 나라에서 그대의 집 앞에 붉은 정려문을 세우고 '열녀'라는 이름을 내렸다. 고을 사람들이 문 앞을 지날 때마다 걸음을 멈추고 고개를 숙였다.`,opts:[
    {t:'삼가 받든다',p:null,safe:true,tags:['평판 크게 ↑','마음고생 ↓'],fn:()=>{fx({fame:30,worry:-10});ev('jeongnyeo','열녀문');if(!P.titles.includes('열녀'))P.titles.push('열녀');note('yeollyeo');say('나라에서 열녀문을 내렸다. 집 앞에 붉은 정려문이 섰다.','big');}}]};
}
/* 자식의 신분: 시대마다 달랐던 법 */
function kidClass(fa,mo){
  const fc=fa?fa.cls:'sangmin',mc=mo?mo.cls:'sangmin',y=P.year;
  if(y>=1894)return fc==='cheonmin'?'sangmin':fc;
  if(fc!=='cheonmin'&&mc!=='cheonmin')return fc==='royal'&&mc!=='royal'?'royal':fc;
  if(fc==='cheonmin'&&mc==='cheonmin')return 'cheonmin';
  let rule;
  if(y<1414)rule='both';else if(y<1432)rule='father';else if(y>=1669&&y<1675)rule='mother';else if(y<1731)rule='both';else rule='mother';
  P.flags.kidRule=rule;
  if(rule==='both')return 'cheonmin';
  if(rule==='father')return fc==='cheonmin'?'cheonmin':(fc==='royal'?'royal':fc);
  return mc==='cheonmin'?'cheonmin':(fc==='cheonmin'?'sangmin':fc);
}
const KID_RULE={both:'부모 가운데 한쪽이라도 천인이면 자식도 천인이 된다는 법(일천즉천)',father:'아버지의 신분을 따른다는 법(노비종부법)',mother:'어머니의 신분을 따른다는 법(노비종모법)'};

/* ===== 평판을 가르는 일들: 고르는 대로 오르고 내린다 ===== */
function fameScene(){
  P.flags.fameY=P.year;const U=UNIT[P.cls]||.5;const amt=f=>Math.max(U*f*10,P.wealth*f);const adult=P.age>=18;
  const ok=(p)=>chance(p);
  const L=[
  ()=>({title:'길가의 행려병자',text:'장에 다녀오는 길, 길가에 낯선 이가 앓아누워 신음하고 있다. 사람들은 못 본 척 지나간다.',opts:[
    {t:'집으로 데려가 돌본다',p:null,tags:['평판 ↑','재산 조금 ↓','병이 옮을 수 있음'],fn:()=>{fx({fame:ri(6,10),wealth:-amt(.03)});if(chance(.15)){fx({health:-8});say('돌보던 이의 병이 옮아 한동안 앓았다.');}say('행려병자를 거두어 돌보았다. 고을에 칭찬이 돌았다.');}},
    {t:'약값만 쥐여 준다',p:null,tags:['평판 조금 ↑'],fn:()=>{fx({fame:ri(2,4),wealth:-amt(.01)});say('약값을 쥐여 주고 걸음을 옮겼다.');}},
    {t:'못 본 척 지나간다',p:null,safe:true,tags:['평판 조금 ↓'],fn:()=>{fx({fame:-ri(2,4)});say('못 본 척 지나쳤다. 누군가 그 모습을 보았다.');}}]}),
  ()=>({title:'주운 돈주머니',text:'길에서 묵직한 돈주머니를 주웠다. 주위에 아무도 없다.',opts:[
    {t:'주인을 찾아 돌려준다',p:null,tags:['평판 ↑'],fn:()=>{fx({fame:ri(6,9)});say('수소문 끝에 주인을 찾아 돌려주었다. 주인이 거듭 절을 하였다.');}},
    {t:'몰래 챙긴다',p:.7,tags:['재산 ↑','들키면 평판 크게 ↓'],fn:()=>{fx({wealth:amt(.08)+U*3});if(!ok(.7)){fx({fame:-ri(12,18)});say('돈주머니를 챙긴 일이 들통나 도둑 소리를 들었다.','big');}else say('돈주머니를 슬쩍 챙겼다.');}}]}),
  ()=>({title:'장터의 다툼',text:'장터에서 두 사람이 멱살을 잡고 싸운다. 구경꾼만 늘어날 뿐 말리는 이가 없다.',opts:[
    {t:'나서서 시비를 가린다',sub:'학식이 도움이 된다',p:clamp(.35+P.st.know/200),tags:['성공하면 평판 ↑','실패하면 평판 ↓'],fn:()=>{if(ok(.35+P.st.know/200)){fx({fame:ri(5,9)});say('조리 있게 시비를 가려 주어 양쪽 모두 수긍하였다.');}else{fx({fame:-ri(3,6)});say('끼어들었다가 오히려 욕만 먹었다.');}}},
    {t:'힘으로 떼어 놓는다',sub:'무예가 도움이 된다',p:clamp(.35+P.st.brave/200),tags:['성공하면 평판 ↑','다칠 수 있음'],fn:()=>{if(ok(.35+P.st.brave/200)){fx({fame:ri(4,8)});say('두 사람을 단숨에 떼어 놓았다. 구경꾼들이 혀를 찼다.');}else{fx({health:-6});say('말리다가 주먹을 맞았다.');}}},
    {t:'모른 척한다',p:null,safe:true,tags:[],fn:()=>{say('괜한 일에 휘말리지 않기로 하였다.');}}]}),
  ()=>({title:'다리 놓기 추렴',text:'장마에 개울 다리가 떠내려갔다. 마을에서 다리를 새로 놓으려 집집마다 추렴을 걷는다.',opts:[
    {t:'앞장서서 넉넉히 낸다',p:null,tags:['평판 ↑','재산 ↓'],fn:()=>{fx({fame:ri(6,10),wealth:-amt(.08)});say('추렴에 앞장섰다. 새 다리 머릿돌에 그대의 이름이 새겨졌다.');}},
    {t:'남들만큼 낸다',p:null,tags:['재산 조금 ↓'],fn:()=>{fx({wealth:-amt(.03)});say('남들만큼 추렴을 냈다.');}},
    {t:'형편이 어렵다며 빠진다',p:null,safe:true,tags:['평판 ↓'],fn:()=>{fx({fame:-ri(4,7)});say('추렴에서 빠졌다. 뒤에서 수군대는 소리가 들렸다.');}}]}),
  ()=>({title:'이웃의 누명',text:'이웃이 도둑으로 몰려 관아에 끌려갈 처지다. 그대는 그가 그날 다른 곳에 있었다는 것을 안다.',opts:[
    {t:'관아에 나가 증언한다',sub:'무예(배짱)가 도움이 된다',p:clamp(.45+P.st.brave/250),tags:['성공하면 평판 크게 ↑','관아에 밉보일 수 있음'],fn:()=>{if(ok(.45+P.st.brave/250)){fx({fame:ri(9,14)});say('관아에 나가 증언하여 이웃의 누명을 벗겼다.','big');}else{fx({fame:-3,worry:8});say('증언하였으나 받아들여지지 않았고, 관아에 밉보였다.');}}},
    {t:'모른 척한다',p:null,safe:true,tags:['평판 조금 ↓'],fn:()=>{fx({fame:-ri(2,5),worry:5});say('입을 다물었다. 마음 한구석이 무거웠다.');}}]}),
  ()=>({title:'고을의 험담',text:'우물가에서 이웃 아낙들이 한 집안을 두고 험담을 늘어놓는다. 그대에게도 한마디 거들라고 한다.',opts:[
    {t:'험담을 말린다',p:null,tags:['평판 ↑'],fn:()=>{fx({fame:ri(3,6)});say('남의 말은 함부로 하는 것이 아니라며 말렸다.');}},
    {t:'한마디 거든다',p:null,tags:['평판 ↓'],fn:()=>{fx({fame:-ri(4,8)});say('험담에 끼어들었다. 그 말이 돌고 돌아 그대 귀에 다시 들어왔다.');}},
    {t:'자리를 피한다',p:null,safe:true,tags:[],fn:()=>{say('슬그머니 자리를 떴다.');}}]}),
  ()=>({title:'관아의 뇌물',text:'관아의 아전이 일을 봐 주는 대가로 은근히 뇌물을 바라는 눈치다.',opts:[
    {t:'단호히 거절한다',p:null,tags:['평판 ↑','일이 늦어질 수 있음'],fn:()=>{fx({fame:ri(4,7),worry:4});say('뇌물을 거절하였다. 일은 늦어졌지만 떳떳하였다.');}},
    {t:'슬쩍 쥐여 준다',p:.75,tags:['재산 ↓','들키면 평판 ↓'],fn:()=>{fx({wealth:-amt(.04)});if(!ok(.75)){fx({fame:-ri(8,12)});say('뇌물을 쓴 일이 소문났다.');}else say('뇌물을 쥐여 주니 일이 술술 풀렸다.');}}]}),
  ()=>({title:'역병 도는 마을',text:'옆 마을에 역병이 돌아 병자들을 돌볼 손이 모자란다고 한다.',opts:[
    {t:'가서 병자들을 돌본다',p:null,tags:['평판 크게 ↑','건강을 해칠 수 있음'],fn:()=>{fx({fame:ri(10,15)});if(chance(.3)){fx({health:-ri(10,18)});say('병자들을 돌보다 병이 옮아 크게 앓았다.','big');}else say('병자들을 돌보았다. 사람들이 그대를 은인이라 불렀다.','big');}},
    {t:'죽과 약재만 보낸다',p:null,tags:['평판 ↑','재산 ↓'],fn:()=>{fx({fame:ri(4,7),wealth:-amt(.04)});say('죽과 약재를 실어 보냈다.');}},
    {t:'문을 걸어 잠근다',p:null,safe:true,tags:[],fn:()=>{say('병이 옮을까 두려워 문을 걸어 잠갔다.');}}]}),
  ()=>({title:'노인 공경',text:'마을의 외로운 노인이 홀로 겨울을 나기 어려워 보인다.',opts:[
    {t:'땔감과 양식을 챙겨 드린다',p:null,tags:['평판 ↑','재산 조금 ↓'],fn:()=>{fx({fame:ri(4,8),wealth:-amt(.02)});say('겨우내 땔감과 양식을 챙겨 드렸다. 노인이 그대 손을 잡고 울었다.');}},
    {t:'내 코가 석 자다',p:null,safe:true,tags:[],fn:()=>{say('제 앞가림도 빠듯하여 모른 척하였다.');}}]})];
  if(P.age<16)L.splice(4,4);
  const sc=R(L)();sc.kind='major';sc.title='세상의 눈 · '+sc.title;return sc;
}

/* ===== 자식들의 이야기 ===== */
function kidStoryScene(){
  P.flags.kidStoryY=P.year;const U=UNIT[P.cls]||.5;const amt=f=>Math.max(U*f*10,P.wealth*f);
  const age=k=>P.year-k.born;const W=k=>k.female?'딸':'아들';
  const K=P.kids.filter(k=>k.alive);const L=[];
  const pick=(f)=>{const c=K.filter(f);return c.length?R(c):null;};
  /* 서얼 아들 */
  {const k=pick(k=>k.seo&&!k.female&&!k.seoDone&&age(k)>=14&&age(k)<=28&&P.year<1777&&['yangban','royal'].includes(k.cls||P.cls));
   if(k)L.push([9,()=>{k.seoDone=1;const legit=K.some(x=>!x.female&&!x.seo&&x!==k);note('seoeol');
     return {title:'서얼의 설움',text:`아들 ${iga(k.name)} 글을 읽다 말고 책을 덮었다. "서얼은 문과를 볼 수 없다 하니, 글을 읽어 무엇 합니까." 아비를 아비라 부르지 못하고 형을 형이라 부르지 못하는 설움이 그 얼굴에 서려 있다.`,opts:[
       {t:'잡과나 무과의 길을 권한다',sub:'역관·의원·무관은 서얼에게도 열려 있다',p:.55,tags:['자식의 앞날 ↑'],fn:()=>{if(chance(.55)){k.feat=R(['잡과에 붙어 역관이 되었다','잡과에 붙어 의관이 되었다','무과에 급제하여 무관이 되었다']);fx({fame:4});say(`${iga(k.name)} 마음을 다잡고 다른 길을 걸어, 마침내 ${k.feat}.`,'big');ev('kidfeat',`아들 ${k.name}`,{feat:k.feat});}else say(`${iga(k.name)} 한동안 방황하였다.`);}},
       ...(!legit?[{t:'적자로 세운다',sub:'적자가 없으니 대를 잇게 한다',p:.6,tags:['자식의 서얼 신분이 풀림','평판 ↓ (법도에 어긋남)'],fn:()=>{if(chance(.6)){k.seo=false;fx({fame:-6});say(`문중을 설득해 ${eulreul(k.name)} 적자로 세웠다. 대를 이을 아들이 되었다.`,'big');ev('rise',`서자 ${eulreul(k.name)} 적자로 세웠다`);}else{fx({fame:-3});say('문중 어른들이 거세게 반대하여 뜻을 이루지 못하였다.');}}}]:[]),
       ...(P.year>=1695?[{t:'서얼허통 상소에 이름을 올리게 한다',sub:'서얼들이 함께 벼슬길을 열어 달라 청한다',p:null,tags:['평판 조금 ↑','조정에 밉보일 수 있음'],fn:()=>{fx({fame:3});k.feat=k.feat||'서얼허통 상소에 앞장섰다';say(`${iga(k.name)} 서얼들과 함께 허통을 청하는 상소에 이름을 올렸다.`);}}]:[]),
       {t:'분수를 받아들이라 타이른다',p:null,safe:true,tags:[],fn:()=>{fx({worry:5});say(`${eulreul(k.name)} 다독였으나, 그 눈빛은 쉽게 풀리지 않았다.`);}}]};}]);}
  /* 천인으로 태어난 자식 */
  {const k=pick(k=>false&&k.cls==='cheonmin');
   if(k)L.push([6,()=>{k.freeTried=1;const cost=Math.max(U*25,{royal:300,yangban:40,jungin:30,sangmin:15,cheonmin:8}[P.cls]||15);const can=P.wealth>=cost;note('nobilaw');
     return {title:'천인의 자식',text:`${W(k)} ${k.name}의 이름은 아직 노비 문서에 올라 있다. 언제 팔려 갈지 모르고, 그 자식도 또 그 자식도 노비가 된다. 속량하려면 ${money(cost)}쯤이 든다고 한다.`,opts:[
       ...(can?[{t:'재산을 털어 속량한다',p:null,tags:['재산 크게 ↓','자식이 양인이 됨'],fn:()=>{fx({wealth:-cost});k.cls=P.cls==='cheonmin'?'sangmin':P.cls;fx({worry:-10});say(`값을 치르고 노비 문서에서 ${W(k)} ${k.name}의 이름을 지웠다. ${iga(k.name)} 양인이 되었다.`,'big');ev('freed',`${W(k)} ${eulreul(k.name)} 속량하였다`);}}]:[]),
       {t:'주인집에 엎드려 사정한다',sub:'평판이 높으면 들어줄지도 모른다',p:clamp(.15+P.st.fame/300),tags:['성공하면 자식이 양인이 됨'],fn:()=>{if(chance(.15+P.st.fame/300)){k.cls='sangmin';say(`주인이 마음을 움직여 ${W(k)} ${eulreul(k.name)} 풀어 주었다.`,'big');ev('freed',`${W(k)} ${iga(k.name)} 면천되었다`);}else{fx({worry:6});say('주인은 고개를 저었다.');}}},
       {t:'훗날을 기약한다',p:null,safe:true,tags:[],fn:()=>{say('언젠가 이 아이만은 풀어 주리라 다짐하였다.');k.freeTried=0;}}]};}]);}
  /* 도박 빚 */
  {const k=pick(k=>!k.female&&age(k)>=17&&age(k)<=40&&!k.gamble);
   if(k)L.push([2,()=>{k.gamble=1;const c=amt(.15);return {title:'자식의 노름빚',text:`아들 ${iga(k.name)} 투전판에 빠져 ${money(c)}의 빚을 졌다. 빚쟁이들이 집 앞까지 찾아왔다.`,opts:[
     {t:'빚을 갚아 준다',p:null,tags:['재산 ↓'],fn:()=>{fx({wealth:-c});say(`빚을 대신 갚아 주었다. ${iga(k.name)} 고개를 들지 못하였다.`);if(chance(.5)){fx({brave:0});say(`${iga(k.name)} 다시는 투전판에 가지 않겠다고 맹세하였다.`);}}},
     {t:'호되게 꾸짖고 스스로 갚게 한다',p:null,tags:['평판 조금 ↓'],fn:()=>{fx({fame:-2});say(`${iga(k.name)} 몇 해에 걸쳐 품을 팔아 빚을 갚았다.`);if(k.st)k.st.know=Math.min(100,k.st.know+3);}},
     {t:'의절한다',p:null,tags:['마음고생 ↑'],fn:()=>{fx({worry:12});k.estranged=1;say(`${eulreul(k.name)} 내쫓았다. 대문 밖에서 울며 비는 소리가 오래 들렸다.`,'big');}}]};}]);}
  /* 딸의 시집살이 */
  {const k=pick(k=>k.female&&k.married&&age(k)>=16&&age(k)<=35&&!k.sijib);
   if(k)L.push([3,()=>{k.sijib=1;return {title:'딸의 시집살이',text:`시집간 딸 ${iga(k.name)} 친정에 다니러 와서 소매로 눈물을 훔친다. 시어머니의 구박이 심하다고 한다.`,opts:[
     {t:'사돈댁에 찾아가 따진다',sub:'평판과 무예(배짱)가 도움이 된다',p:clamp(.3+P.st.fame/300+P.st.brave/400),tags:['성공하면 딸의 처지가 나아짐','실패하면 딸이 더 힘들어짐'],fn:()=>{if(chance(.3+P.st.fame/300+P.st.brave/400)){say(`사돈댁에 찾아가 담판을 지었다. 그 뒤로 ${k.name}의 시집살이가 한결 나아졌다.`);fx({worry:-4});}else{say(`괜히 찾아갔다가 ${k.name}의 시집살이만 더 고되어졌다.`);fx({worry:8});}}},
     {t:'친정으로 데려온다',p:null,tags:['평판 ↓','딸이 친정에서 지냄'],fn:()=>{fx({fame:-5});k.home=1;say(`${eulreul(k.name)} 친정으로 데려왔다. 수군거림이 따랐지만 딸의 얼굴에 웃음이 돌아왔다.`);}},
     {t:'참고 견디라 타이른다',p:null,safe:true,tags:['마음고생 ↑'],fn:()=>{fx({worry:6});say(`"출가외인이니 참고 견디거라." 돌아서는 딸의 뒷모습이 오래 눈에 밟혔다.`);}}]};}]);}
  /* 혼인을 두고 */
  {const k=pick(k=>!k.married&&age(k)>=16&&age(k)<=26&&!k.loveAsk);
   if(k)L.push([3,()=>{k.loveAsk=1;const low=R(['장터 엿장수의','이웃 마을 소작인의','주막집','관아 노비의']);const lowCls=/노비/.test(low)?'cheonmin':'sangmin';
     return {title:'자식의 혼사',text:`${W(k)} ${iga(k.name)} 무릎을 꿇었다. ${low} ${k.female?'아들':'딸'}과 서로 마음을 주었으니 혼인을 허락해 달라고 한다.${['yangban','royal','jungin'].includes(P.cls)?' 집안 어른들은 신분이 맞지 않는다며 펄쩍 뛴다.':''}`,opts:[
       {t:'혼인을 허락한다',p:null,tags:['평판 ↓','자식의 정 ↑'],fn:()=>{k.married=true;k.inlaw=low.replace(/의$/,'')+' 집안';fx({fame:['yangban','royal','jungin'].includes(P.cls)?-6:0,worry:-4});say(`${W(k)} ${k.name}의 혼인을 허락하였다. 소박한 혼례에서 ${iga(k.name)} 환하게 웃었다.`,'big');}},
       {t:'반대한다',p:.7,tags:['자식이 달아날 수 있음'],fn:()=>{if(chance(.7)){say(`혼인을 허락하지 않았다. ${iga(k.name)} 한동안 방에서 나오지 않았다.`);fx({worry:4});}else{k.married=true;k.inlaw=low.replace(/의$/,'')+' 집안';k.estranged=1;fx({fame:-8,worry:12});say(`${iga(k.name)} 그 사람과 함께 야반도주하였다.`,'big');}}}]};}]);}
  /* 어린 자식의 병 */
  {const k=pick(k=>age(k)>=1&&age(k)<=12&&!k.sick);
   if(k&&chance(.35))L.push([1,()=>{k.sick=1;const c=amt(.05);return {title:'자식의 병',text:`${W(k)} ${iga(k.name)} 열이 펄펄 끓고 사흘째 깨어나지 못한다.`,opts:[
     {t:'용하다는 의원을 모셔 온다',p:.88,tags:['재산 ↓'],fn:()=>{fx({wealth:-c});if(chance(.88))say(`의원의 탕약을 먹고 ${iga(k.name)} 털고 일어났다.`);else{k.alive=false;k.dy=P.year;fx({worry:25});say(`정성을 다했으나 ${iga(k.name)} 끝내 숨을 거두었다.`,'big');ev('kidDeath',k.name);}}},
     {t:'무당을 불러 굿을 한다',p:.7,tags:['재산 조금 ↓'],fn:()=>{fx({wealth:-c*.5});if(chance(.7))say(`굿을 한 뒤 ${iga(k.name)} 기운을 차렸다.`);else{k.alive=false;k.dy=P.year;fx({worry:25});say(`${iga(k.name)} 끝내 숨을 거두었다.`,'big');ev('kidDeath',k.name);}}},
     {t:'밤새 곁에서 간호한다',p:.75,safe:true,tags:['건강 조금 ↓'],fn:()=>{fx({health:-3});if(chance(.75))say(`밤낮으로 곁을 지킨 끝에 ${iga(k.name)} 눈을 떴다.`);else{k.alive=false;k.dy=P.year;fx({worry:25});say(`${iga(k.name)} 끝내 숨을 거두었다.`,'big');ev('kidDeath',k.name);}}}]};}]);}
  /* 효도 */
  {const k=P.age>=60&&P.age<=63?pick(k=>age(k)>=25&&!k.estranged&&!k.hyo):null;
   if(k)L.push([2,()=>{k.hyo=1;return {title:'자식의 효도',text:`${W(k)} ${iga(k.name)} 그대의 회갑을 맞아 잔치를 열겠다고 한다. 온 고을 사람들을 부르겠다고 한다.`,opts:[
     {t:'크게 잔치를 연다',p:null,tags:['평판 ↑','재산 조금 ↓'],fn:()=>{fx({fame:5,worry:-8,wealth:-amt(.05)});say(`회갑 잔치에 고을 사람들이 모여들었다. 자식들이 차례로 술잔을 올렸다.`,'big');}},
     {t:'조촐하게 식구끼리 보낸다',p:null,safe:true,tags:['마음고생 ↓'],fn:()=>{fx({worry:-10});say('식구들끼리 조촐하게 상을 차렸다. 그것으로 족하였다.');}}]};}]);}
  if(!L.length)return null;
  const sc=wpick(L.map((x,i)=>[i,x[0]]));const r=L[sc][1]();r.kind='major';r.title='자식 · '+r.title;return r;
}

/* ===== 자식 덕에 달라지는 부모의 형편 ===== */
const CRANK=['cheonmin','sangmin','jungin','yangban','royal'];
function inlawBoost(k,cls,rich){
  const U=UNIT[P.cls]||.5;const d=CRANK.indexOf(cls)-CRANK.indexOf(P.cls);
  P.inlawRich=Math.max(P.inlawRich||0,rich||0);
  if(d>0){fx({fame:6*d});say(`신분 높은 집안과 사돈을 맺으니, 고을에서 그대 집안을 보는 눈이 달라졌다.`);P.inlawUp=Math.max(P.inlawUp||0,d);}
  if(rich>=3){const g=U*ri(15,30);fx({wealth:g});say(`부유한 사돈댁에서 넉넉한 예물과 함께 살림을 보태 주었다.`);P.flags.kidSupport=(P.flags.kidSupport||0)+U*1.5;}
  if(cls==='royal'){fx({fame:12,wealth:U*40});say('왕실과 사돈을 맺었다. 나라에서 사돈댁에 내리는 녹봉과 예물이 이어졌다.','big');P.flags.kidSupport=(P.flags.kidSupport||0)+U*4;raiseParent('sangmin','왕실의 사돈이 되어 천한 신분을 벗었다');}
}
function raiseParent(toCls,why,reason){
  if(CRANK.indexOf(P.cls)>=CRANK.indexOf(toCls))return;
  P.flags.clsReason=reason||'household';
  const from=CLS[P.cls].n;P.cls=toCls;P.sub='';if(P.job&&['slave'].includes(P.job.k))P.job=null;
  say(`${why}. ${from}에서 ${CLS[toCls].n}이 되었다.`,'big');ev('rise',why);note('myeoncheon');
}
/* 딸의 간택 */
function kidRoyalScene(k){
  k.ganTaek=1;note('ganjip');
  const p=clamp(.2+(k.st?k.st.look:30)/250+P.st.fame/350,.1,.75);
  return {kind:'major',title:'자식 · 딸의 간택',text:`나라에 금혼령이 내려지고 세자빈을 고른다는 명이 떨어졌다. 딸 ${k.name}의 처녀단자를 올리라는 기별이 왔다.${sisQ(k)?` ${sisQ(k).royalBride}인 언니 ${sisQ(k).name}의 뜻이 닿았다는 소문도 돈다.`:''}`,opts:[
    {t:'간택에 내보낸다',sub:'딸의 매력과 집안의 평판이 중요하다',p,tags:['성공하면 딸이 세자빈, 그대는 왕실의 외척','신분·재력 크게 ↑'],fn:()=>{
      if(!chance(p)){say(`삼간택까지 갔으나 ${iga(k.name)} 끝내 뽑히지 못하였다.`);bookSeen('scene','kidsamgan');
        const kn=realKing(P.year).n;
        return {kind:'major',title:'자식 · 딸의 삼간택 낙선',text:`삼간택에서 떨어졌다. 궐에서 딸 ${eulreul(k.name)} 후궁으로 들이겠다는 말이 전해졌다. 사양하면 금혼령이 풀리는 대로 다른 혼처를 찾을 수 있다.`,opts:[
          {t:'후궁으로 들여보낸다',p:null,tags:['딸이 후궁(숙의)이 됨','평판·재력 ↑','딸을 궐에 보냄'],fn:()=>{k.married=true;k.inlaw='왕실';k.inlawCls='royal';k.cls='royal';k.royalBride='숙의';k.wedY=P.year;k.kingOf=kn;k.feat='후궁이 되었다';
            fx({fame:6,wealth:Math.max(60,P.wealth*.1),worry:4});P.flags.kidSupport=(P.flags.kidSupport||0)+6;say(`딸 ${iga(k.name)} 숙의의 첩지를 받고 ${kn}의 후궁으로 입궐하였다. 다시는 사가에서 함께 살 수 없게 되었다.`,'big');ev('kidfeat',`딸 ${k.name}`,{feat:'후궁이 되었다'});}},
          {t:'사양하고 다른 혼처를 찾는다',p:null,safe:true,tags:['평판 ↑','혼담은 그대로 이어짐'],fn:()=>{fx({fame:4});say(`궐의 부름을 정중히 사양하였다. 금혼령이 풀리자 ${k.name}에게도 다시 혼담이 들어왔다.`);}}]};}
      k.married=true;k.inlaw='왕실';k.inlawCls='royal';k.cls='royal';k.royalBride='세자빈';k.wedY=P.year;k.sejaOf=realKing(P.year).n;k.feat='세자빈으로 간택되었다';
      say(`딸 ${iga(k.name)} 세자빈으로 간택되었다! 가문에 큰 경사가 났다.`,'big');
      {const sq=sisQ(k);if(sq){k.sisterQ=sq.id;if(sq.royalBride==='중전')say(`세자는 후궁의 소생이나, 중전인 ${iga(sq.name)} 적모로서 친자식처럼 길러 온 아들이었다. 이로써 언니는 시어머니가, ${k.name}${bat(k.name)?'은':'는'} 그 며느리가 되었다.`,'big');else say(`대비인 언니 ${iga(sq.name)} 궁 안의 큰 어른으로서 이 혼사를 이끌었다. 자매가 나란히 궁에 들게 되었다.`,'big');}}ev('kidfeat',`딸 ${k.name}`,{feat:k.feat});
      queenParentBoost(false);}},
    {t:'병을 핑계로 피한다',p:.75,safe:true,tags:['평판 조금 ↓'],fn:()=>{if(chance(.75))say(`딸이 병중이라 둘러대어 간택을 피하였다.`);else{fx({fame:-6});say('핑계가 들통나 꾸중을 들었다.');}}}]};
}
function queenParentBoost(queen){
  const U=UNIT[P.cls]||.5;
  raiseParent('yangban','딸이 왕실에 들어 왕실의 외척이 되었다');
  const t=queen?(P.female?'부부인':'부원군'):(P.female?'세자빈의 어머니':'세자빈의 아버지');
  if(!P.titles.includes(t))P.titles.push(t);
  const wasQ=P.flags.queenParent>=2;updateHonor();if(!queen&&wasQ)say('한 집안에서 왕비와 세자빈이 함께 나니, 세상 사람들이 그 가문을 우러러보았다.','big');if(!queen&&!P.female&&P.job&&P.job.k==='official'&&P.job.lv<14){setJob('official',Math.min(16,P.job.lv+2));}ev('job',queen?`${P.honor}의 작호를 받았다`:`세자빈의 ${P.female?'어머니':'아버지'}가 되었다`);
  fx({fame:queen?25:15,wealth:queen?Math.max(400,P.wealth*.5):Math.max(150,P.wealth*.3)});
  P.flags.kidSupport=(P.flags.kidSupport||0)+(queen?30:12);P.flags.queenParent=queen?2:Math.max(P.flags.queenParent||0,1);updateHonor();
  if(queen||!/기와집|궁/.test(P.home||'')){P.home=queen?'솟을대문 달린 큰 기와집':'사랑채 딸린 기와집';}
  say(queen?`딸이 중전이 되니, 그대는 ${t}의 작호를 받았다. 솟을대문 달린 큰 집과 녹봉이 내려졌다.`:`세자빈의 친정이 되어 나라에서 집과 녹봉을 내렸다.`,'big');
  ev('rise',queen?`딸이 중전이 되어 ${t}의 작호를 받았다`:'딸이 세자빈이 되어 왕실의 외척이 되었다');
}
/* 출세한 자식 덕 */
function kidSuccessBoost(k,t){
  const U=UNIT[P.cls]||.5;
  if(/급제|역관|의관|무관|이름|재산/.test(t)){P.flags.kidSupport=(P.flags.kidSupport||0)+U*1.2;}
  if(P.cls==='cheonmin'&&k.cls!=='cheonmin'&&/급제|역관|의관|무관|재산/.test(t)&&chance(.7)){raiseParent('sangmin',`${k.female?'딸':'아들'} ${iga(k.name)} 값을 치러 그대를 속량하였다`);}
  else if(P.cls==='sangmin'&&/문과에 급제/.test(t)){fx({fame:6});say('자식이 문과에 급제하니, 집안이 양반 행세를 하게 되었다.');P.inlawUp=Math.max(P.inlawUp||0,1);}
}

/* ===== 삼간택: 양반가 딸인 그대가 세자빈 간택에 나아간다 ===== */
function samganScene(stage){
  P.flags.samgan=1;note('ganjip');
  const st=P.st;const N=['초간택','재간택','삼간택'];const nm=N[stage];
  const p=[clamp(.55+st.look/300+st.fame/400,.3,.9),clamp(.4+(st.look+st.know)/400+st.fame/400,.2,.85),clamp(.25+(st.look+st.know+st.art)/600+st.fame/300,.12,.7)][stage];
  const text=[ '나라에 금혼령이 내려졌다. 세자빈을 고른다며 양반가 처녀들의 단자를 올리라는 명이 떨어졌다. 그대의 처녀단자도 올라갔다.',
    '초간택을 통과하였다. 재간택에서는 대비전과 중궁전의 어른들이 처녀들의 몸가짐과 말씨를 꼼꼼히 살핀다고 한다.',
    '재간택까지 통과하였다. 이제 마지막 삼간택만 남았다. 뽑히면 세자빈이 되고, 떨어지면 후궁으로 들어오라는 제의를 받기도 한다.'][stage];
  return {kind:'major',title:`세자빈 간택 · ${nm}`,text,opts:[
    {t:`${nm}에 나아간다`,sub:stage===0?'매력과 집안의 평판이 중요하다':stage===1?'매력과 학식(예법)이 중요하다':'매력·학식·재주를 두루 본다',p,tags:stage===2?['성공하면 세자빈','떨어지면 후궁 제의']:['다음 간택으로'],fn:()=>{
      if(!chance(p)){
        if(stage<2){say(`${nm}에서 떨어졌다. 금혼령이 풀리고 다시 혼담을 받을 수 있게 되었다.`);return null;}
        say('삼간택에서 끝내 뽑히지 못하였다.','big');
        return {kind:'major',title:'삼간택 낙선',text:'삼간택에서 떨어졌다. 궐에서 후궁으로 들어오라는 말이 전해졌다. 사양하면 금혼령이 풀리는 대로 다른 혼처를 찾을 수 있다.',opts:[
          {t:'후궁으로 궁에 들어간다',p:null,tags:['신분 변화: 후궁'],fn:()=>{const k=realKing(P.year);kingSpouse(k);setJob('concubine',3);P.favor=45;say('후궁의 첩지를 받고 궁에 들었다.','big');ev('seungeun',k.n);}},
          {t:'후궁 자리를 사양하고 다른 혼처를 찾는다',p:null,safe:true,tags:['평판 ↑','혼담은 그대로 이어짐'],fn:()=>{fx({fame:6});say('궐의 부름을 정중히 사양하였다. 금혼령이 풀리자 다시 혼담이 들어오기 시작했다.');}}]};
      }
      if(stage<2)return samganScene(stage+1);
      const x=newPerson({kind:'spouse',female:false,cls:'royal',sur:'이',bon:'전주',name:R(ROYAL_HWI),born:P.year-ri(P.age-3,P.age+2),h:20,t:20});x.title=`세자 ${x.sur}${x.name}`;x.pos='세자';x.live='한양 궁궐 동궁';x.fam='왕실 · 동궁';x.seja=true;x.status='married';x.rank=17;
      wed(x,true);setJob('queen',0);P.court=true;P.home='세자궁(동궁)';fx({fame:20});
      say('삼간택 끝에 세자빈으로 뽑혔다! 가례를 올리고 동궁에 들었다.','big');ev('crown','세자');
      return null;}},
    {t:'병을 핑계로 물러난다',sub:'무예(배짱)가 필요하다',p:clamp(.45+st.brave/250),safe:true,tags:['들키면 평판 ↓'],fn:()=>{if(chance(.45+st.brave/250))say('병을 핑계로 간택에서 물러났다.');else{fx({fame:-8});say('핑계가 들통나 집안이 꾸중을 들었다.');}}}]};
}

/* ===== 높은 사람의 눈에 띄다: 수청과 억지 혼인 ===== */
function gazeScene(){
  P.flags.gazeY=P.year;
  const st=P.st;const top=[['look','고운 자태'],['know','글재주'],['art','솜씨']].sort((a,b)=>st[b[0]]-st[a[0]])[0];
  const lover=Object.values(P.people).find(x=>x.kind==='love'&&x.alive&&x.status!=='parted'&&x.h>=60);
  const U=UNIT[P.cls]||.5;const pr=clamp(rnd()*.5+.15+st.brave/400,.1,.75);
  if(P.female){
    const low=['cheonmin','sangmin'].includes(P.cls);
    const who=low?R(['고을 사또','관찰사','권세 높은 대감']):R(['세도가 대감','권세 높은 판서 댁']);
    const isSu=low;
    const p=newPerson({kind:'love',female:false,cls:'yangban',born:P.year-ri(35,55),h:20,t:70});p.rich=3;
    const role={'고을 사또':['사또','고을 수령(종6품)'],'관찰사':['관찰사','관찰사(종2품)'],'권세 높은 대감':['대감','판서(정2품)'],'세도가 대감':['대감','세도가의 참판(종2품)'],'권세 높은 판서 댁':['대감','판서(정2품)']}[who]||['대감','대감'];
    p.title=`${p.sur}${p.name} ${role[0]}`;p.pos=role[1];p.fam=`${p.bon} ${p.sur}씨 집안`;describePerson(p);p.pos=role[1];
    return {kind:'major',title:isSu?'수청':'억지 혼사',pid:p.id,text:isSu?`그대의 ${iga(top[1])} 소문나 ${p.pos} ${p.title}의 귀에까지 들어갔다. ${iga(p.title)} 그대에게 수청을 들라는 명을 내렸다. 거역하면 무사하지 못할 것이다.`:`그대의 ${iga(top[1])} 소문나 ${p.pos} ${p.title} 댁에서 그대를 첩으로 들이겠다고 사람을 보냈다. 집안에서는 감히 거절하기 어렵다며 한숨을 쉰다.`,opts:[
      {t:'명을 따른다',sub:`${p.title}의 첩이 된다`,p:null,tags:['재산·재력 ↑','신분 변화: 첩','다른 인연과 멀어짐'],fn:()=>{
        if(P.cls==='cheonmin'){P.cls='sangmin';P.sub='';if(P.job&&['slave','gisaeng'].includes(P.job.k))P.job=null;say(`${iga(p.title)} 값을 치러 그대를 속량해 주었다.`);ev('freed','권세가의 첩이 되며 속량되었다');}
        p.mode='cheop';wed(p,true);P.sub='cheop';P.home=`${p.title} 댁의 별채`;fx({wealth:U*ri(20,40),fame:isSu?-3:2});
        Object.values(P.people).forEach(y=>{if(y.kind==='love'&&y.status!=='parted')y.status='parted';});
        say(`${p.title}의 첩이 되어 별채에 들었다. 비단옷과 패물이 내려졌지만, 마음 한구석은 서늘하였다.`,'big');}},
      {t:'목숨을 걸고 거절한다',sub:'거절이 받아들여질지는 운에 달렸다',p:pr,tags:['성공하면 평판 ↑','실패하면 매질·옥살이·집안의 화'],fn:()=>{
        delete P.people[p.id];
        if(chance(pr)){fx({fame:ri(8,14)});say(`끝내 뜻을 굽히지 않았다. ${p.title}도 더는 어쩌지 못하였고, 그대의 절개가 고을에 알려졌다.`,'big');ev('rise','권세가의 명을 거절하고 절개를 지켰다');return;}
        const r=rnd();
        if(r<.4){fx({health:-ri(12,20),worry:15});say(`명을 거역한 죄로 관아에 끌려가 곤장을 맞았다.`,'big');}
        else if(r<.7){fx({worry:20,fame:-4});say('옥에 갇혀 한 철을 보냈다. 그래도 뜻은 꺾이지 않았다.','big');}
        else{fx({wealth:-P.wealth*.35,worry:15});say(`${iga(p.title)} 앙심을 품어 집안이 큰 화를 입었다. 가산이 크게 기울었다.`,'big');}}},
      ...(lover?[{t:`${gwawa(callOf(lover))} 함께 달아난다`,sub:'무예(배짱)가 필요하다',p:clamp(.3+st.brave/200),tags:['성공하면 정인과 맺어짐','실패하면 붙잡힘'],fn:()=>{delete P.people[p.id];if(chance(.3+st.brave/200)){lover.mode='wife';wed(lover,false,true);P.home='먼 고을의 초가';P.flags.elope=1;say(`야반도주하여 ${gwawa(callOf(lover))} 먼 고을에서 새 삶을 시작하였다.`,'big');}else{fx({health:-15,fame:-8,worry:15});say('달아나다 붙잡혀 호된 매를 맞았다.','big');}}}]:[])]};
  }
  if(st.look>=72&&chance(.4))return favorScene();
  const who=R(['세도가 대감','권세 높은 판서','왕실 종친']);const royal=who==='왕실 종친';
  const b=newPerson({kind:'love',female:true,cls:royal?'royal':'yangban',born:P.year-ri(16,22),h:20,t:60});b.rich=3;describePerson(b);if(royal){b.title=R(['숙','정','화','명'])+R(['신','안','혜'])+'옹주';b.pos='옹주';}else{b.fam=`${b.bon} ${b.sur}씨 집안`;b.pos=`${who.replace(' 댁','')}의 딸`;}
  const whoN=royal?`종친 ${R(['영','화','덕','익'])}${R(['원','천','성','양'])}군`:`${b.sur}${hanName(false).n} ${/판서/.test(who)?'판서':'참판'}`;b.pos=royal?b.pos:`${whoN}의 딸`;
  return {kind:'major',title:'억지 혼사',pid:b.id,text:`그대의 ${iga(top[1])} 소문나 ${whoN}의 귀에 들어갔다. ${iga(whoN)} 그대를 ${royal?'옹주의 부마로':'사위로'} 삼겠다며 혼담을 밀어붙인다. 마음에 두지 않은 혼인이지만, 거절하면 무사하지 못할 것이다.`,opts:[
    {t:'혼인을 받아들인다',sub:'권세가의 사위가 된다',p:null,tags:['재산·재력·평판 ↑',royal?'신분 변화: 부마':'벼슬길이 열릴 수 있음','다른 인연과 멀어짐'],fn:()=>{
      b.mode='wife';wed(b,true);fx({wealth:U*ri(30,60),fame:8});
      if(royal)setJob('buma',0);else if(['yangban','jungin'].includes(P.cls)&&(!P.job||P.job.k==='scholar')&&chance(.6)){setJob('official',2);say('장인의 힘으로 음서를 받아 벼슬길에 나섰다.','big');}
      if(['cheonmin','sangmin'].includes(P.cls)){raiseParent('jungin','권세가의 사위가 되어 신분이 올라갔다');}
      Object.values(P.people).forEach(y=>{if(y.kind==='love'&&y.status!=='parted')y.status='parted';});
      say(`${whoN}의 ${royal?'부마':'사위'}가 되었다. 번듯한 살림이 내려졌다.`,'big');}},
    {t:'정중히 거절한다',sub:'거절이 받아들여질지는 운에 달렸다',p:pr,tags:['실패하면 모함·유배·집안의 화'],fn:()=>{
      delete P.people[b.id];
      if(chance(pr)){fx({fame:4});say(`${iga(whoN)} 혀를 차며 물러났다. 다행히 화는 없었다.`);return;}
      const r=rnd();
      if(r<.35&&P.age<70){exile(ri(2,4));say(`${whoN}의 모함을 받아 유배되었다.`);}
      else if(r<.7){fx({wealth:-P.wealth*.3,worry:15});say(`${whoN}의 눈 밖에 나 집안 살림이 크게 기울었다.`,'big');}
      else{fx({health:-12,worry:12});say('트집을 잡혀 관아에서 곤장을 맞았다.','big');}}},
    ...(lover?[{t:`${callOf(lover)}에게 서둘러 청혼한다`,sub:'정인과 먼저 혼인해 버린다',p:clamp(.4+lover.h/300),tags:['성공하면 정인과 혼인'],fn:()=>{delete P.people[b.id];if(chance(.4+lover.h/300)){lover.mode='wife';wed(lover);say(`서둘러 ${gwawa(callOf(lover))} 혼례를 올렸다. ${whoN}도 어쩌지 못하였다.`,'big');}else{fx({worry:12});say('혼례를 서둘렀으나 일이 틀어졌다.');}}}]:[])]};
}

/* ===== 사내로서 높은 이의 총애를 받다 ===== */
function favorScene(){
  if(!hasKing(P.year))return null;
  P.flags.gazeY=P.year;const st=P.st;const U=UNIT[P.cls]||.5;
  const k=realKing(P.year);const nearCourt=P.court||(P.job&&['official','naesi','military','akgong','sajagwan'].includes(P.job.k))||['yangban','royal'].includes(P.cls);
  const jaje=k.n==='공민왕'&&P.year>=1365;
  const king=nearCourt||jaje;
  const who=king?k.n:R(['세도가 대감','권세 높은 판서']);
  const pr=clamp(rnd()*.5+.15+st.brave/400,.1,.75);
  if(jaje)note('jajewi');else if(king)note('jajewi');
  return {kind:'major',title:king?'임금의 총애':'대감의 총애',text:king?(jaje?`임금이 용모가 빼어난 젊은이들을 뽑아 자제위를 둔다고 한다. 그대가 그 가운데 뽑혀 [[${k.n}]]의 곁에 서게 되었다. 임금의 눈길이 유난히 그대에게 머문다.`:`[[${k.n}]]이 그대를 눈여겨보고 곁에 두려 한다. 밤늦도록 그대를 불러 이야기를 청하고, 그 눈길이 예사롭지 않다.`):`${iga(who)} 그대를 각별히 아끼며 집에 두고 곁을 지키게 하려 한다. 그 정이 예사롭지 않다는 말이 돈다.`,opts:[
    {t:'곁에 머문다',sub:king?'임금의 총신이 된다':'대감의 사람이 된다',p:null,tags:['재산·재력 ↑',king?'권세를 쥘 수 있음':'평판 조금 ↓','임금이 바뀌면 위태로움'],fn:()=>{
      if(king){setJob('chongsin',0);P.court=true;P.favor=60;P.flags.favorKing=k.n;P.home='궁궐 가까운 사저';fx({wealth:U*30,fame:3});say(`${k.n}의 곁을 지키는 사람이 되었다. 밤마다 부름이 이어졌고, 그대를 시기하는 눈길도 늘었다.`,'big');ev('job',`${k.n}의 총애를 받았다`);}
      else{setJob('namchong',1);P.home=`${who} 댁의 사랑채`;fx({wealth:U*15,fame:-3});say(`${who} 댁 사랑채에 머물게 되었다. 비단옷과 넉넉한 살림이 주어졌지만, 뒤에서 수군대는 소리가 따랐다.`,'big');}}},
    {t:'정중히 물러난다',sub:'거절이 받아들여질지는 운에 달렸다',p:pr,tags:['실패하면 노여움을 삼'],fn:()=>{
      if(chance(pr)){fx({fame:3});say('조심스레 물러났다. 다행히 노여움은 없었다.');return;}
      const r=rnd();if(king&&r<.35&&P.age<70){exile(ri(2,4));say(`임금의 노여움을 사서 유배되었다.`);}
      else if(r<.7){fx({worry:15,fame:-5});say(`${king?'임금':who}의 눈 밖에 나 한동안 숨죽여 지냈다.`,'big');}
      else{fx({health:-10,worry:10});say('트집을 잡혀 매를 맞았다.','big');}}}]};
}

/* ===== 갈라서기: 이혼·소박과 자식 ===== */
function minorKids(){return P.kids.filter(k=>k.alive&&!k.away&&P.year-k.born<18);}
function doDivorce(sp,why,byMe){
  if(P.preg&&!P.preg.unwed){if(P.female&&!P.preg.father)P.preg.father=sp.id;if(!P.female&&!P.preg.mother)P.preg.mother=sp.id;}
  const yb=['yangban','royal'].includes(P.cls);
  sp.kind='ex';sp.status='parted';sp.exY=P.year;P.spouse=null;P.married=false;P.divorced=(P.divorced||0)+1;P.flags.divorceY=P.year;
  if(P.marryRoseBy===sp.id&&P.preMarryCls){const back=P.preMarryCls==='cheonmin'?'sangmin':P.preMarryCls;if(back!==P.cls){say(`${callOf(sp)} 집안을 떠나며, 혼인으로 얻었던 신분도 잃고 ${CLS[back].n}의 처지로 돌아갔다.`);P.cls=back;P.lastCls=back;}P.preMarryCls=null;P.marryRoseBy=null;}
  if(P.job&&['royalwife','lady','housewife','queen','sosil','buma'].includes(P.job.k))P.job=null;
  if(P.female){fx({fame:-(yb?18:8),worry:15});if(/시댁|별채|사랑채|중궁|동궁/.test(P.home||''))P.home='친정 곁방';if(P.sub==='cheop')P.sub='';
    if(P.job&&['royalwife','lady','housewife','queen'].includes(P.job.k))P.job=null;}
  else{fx({fame:-(yb?8:4),worry:10,wealth:-P.wealth*.15});}
  ev('divorce',callOf(sp),{why,byMe});note('sobak');
}
function custodyScene(sp,next){
  const ks=minorKids();if(!ks.length)return next||null;
  const nm=callOf(sp);const fatherSide=!P.female;
  const p=P.female?clamp(.2+(P.st.know+P.st.fame)/500+(P.wealth>UNIT[P.cls]*40?.15:0),.08,.8):clamp(.85-(sp.rich||0)*.05,.4,.92);
  const names=ks.map(k=>k.name).join(', ');
  return {kind:'major',title:'자식은 누가 키우나',text:`${P.female?'시댁에서는 자식은 그 집안의 핏줄이니 두고 가라 한다.':`${iga(nm)} 아이들만은 데려가겠다고 한다.`} 남은 아이들(${names})을 어찌할 것인가.`,opts:[
    {t:'내가 데려가 키운다',sub:P.female?'법도는 아버지 쪽 편이라 쉽지 않다':'아버지의 집안이 키우는 것이 법도다',p,tags:['성공하면 아이들과 함께 삶'],fn:()=>{
      if(chance(p)){say(`끝내 아이들을 데리고 나왔다. ${names}의 손을 꼭 잡았다.`,'big');}
      else{ks.forEach(k=>{k.away=1;});fx({worry:20});say(`아이들을 데려오지 못하였다. ${names}${bat(names)?'은':'는'} ${nm}의 집에 남게 되었다.`,'big');}
      return next||null;}},
    {t:`${nm}의 집에 맡긴다`,p:null,tags:['아이들과 떨어져 삶','마음고생 ↑'],fn:()=>{ks.forEach(k=>{k.away=1;});fx({worry:15});say(`아이들을 ${nm}의 집에 두고 떠났다. 돌아보지 않으려 애썼다.`,'big');return next||null;}},
    ...(ks.length>=2?[{t:'아이들을 나누어 키운다',p:null,tags:['반은 곁에, 반은 떠나보냄'],fn:()=>{ks.forEach((k,i)=>{if(fatherSide?(i%2===1):(k.female?false:true))k.away=1;});fx({worry:10});say(P.female?'딸들은 데려오고 아들들은 시댁에 남겼다.':'아이들을 반씩 나누어 키우기로 하였다.','big');return next||null;}}]:[])]};
}
/* 내가 먼저 갈라서자고 할 때 */
function divorceMeScene(){
  const sp=spouseP();if(!sp)return null;const nm=callOf(sp);const yb=['yangban','royal'].includes(P.cls);
  const p=P.female?clamp(.2+P.st.know/400+P.st.brave/400+P.st.fame/500+(sp.h<30?.15:0),.08,.75):clamp(.55+P.st.fame/500-(sp.rich||0)*.04,.3,.9);
  const plead=chance(clamp((sp.t||50)/100,.1,.9));
  return {kind:'major',title:'갈라서기',pid:sp.id,text:`${gwawa(nm)} 더는 함께 살 수 없다고 마음먹었다. ${P.female?(yb?'여인이 먼저 지아비를 버리는 일은 세상의 큰 손가락질을 받는다.':'여인이 먼저 갈라서자고 하는 일은 쉽지 않다.'):'소박을 놓으면 처가와 원수가 되고 세상의 눈총도 받는다.'}`,opts:[
    {t:P.female?'갈라서자고 청한다':'아내를 내보낸다',sub:'학식과 평판, 배짱이 도움이 된다',p,tags:['평판 ↓','자식 문제가 따름','다른 이와 혼인할 수 있게 됨'],fn:()=>{
      if(!chance(p)){fx({worry:10,fame:-3});sp.t=clamp((sp.t||50)-10);say(`${P.female?'집안 어른들이 막아서':'처가와 문중이 들고일어나'} 뜻을 이루지 못하였다.`,'big');return null;}
      if(plead)return {kind:'major',title:'붙잡는 손',pid:sp.id,text:`${iga(nm)} 그대의 소매를 붙잡는다. "한 번만 더 생각해 주시오. 내 고치겠소."`,opts:[
        {t:'그래도 갈라선다',p:null,tags:['평판 ↓'],fn:()=>{doDivorce(sp,'갈라섬',true);say(`${gwawa(nm)} 끝내 갈라섰다.`,'big');return custodyScene(sp);}},
        {t:'마음을 돌린다',p:null,safe:true,tags:['정 ↑'],fn:()=>{sp.t=clamp((sp.t||50)+15);sp.h=clamp((sp.h||50)+10);say('붙잡는 손을 차마 뿌리치지 못하였다. 다시 한번 살아 보기로 하였다.');}}]};
      doDivorce(sp,'갈라섬',true);say(`${gwawa(nm)} 갈라섰다.`,'big');return custodyScene(sp);}},
    {t:'다시 생각한다',p:null,safe:true,tags:[],fn:()=>{say('마음을 접고 조금 더 참아 보기로 하였다.');}}]};
}
/* 상대가 소박을 놓거나 갈라서자고 할 때 */
function divorceThemScene(){
  const sp=spouseP();if(!sp)return null;const nm=callOf(sp);P.flags.dthemY=P.year;
  const sons=P.kids.filter(k=>k.alive&&!k.female).length;
  const why=P.female?(sons===0&&P.year-(P.flags.wedY||P.year)>=7?'대를 이을 아들을 낳지 못했다':sp.h<30?'그대에게 정이 떨어졌다':'시어머니와 뜻이 맞지 않는다'):(sp.h<30?'그대에게 정이 떨어졌다':'그대의 집안 형편이 기울었다');
  const p=clamp(.25+(P.st.look+P.st.know)/400+P.st.fame/400+P.kids.filter(k=>k.alive).length*.05+(sp.t||50)/400,.1,.85);
  return {kind:'major',title:P.female?'소박':'아내의 결심',pid:sp.id,text:P.female?`${iga(nm)} ${why}며 그대를 친정으로 돌려보내려 한다. 소박을 맞으면 친정에서도 얼굴을 들기 어렵다.`:`${iga(nm)} ${why}며 친정으로 돌아가겠다고 한다.`,opts:[
    {t:'붙잡는다',sub:'매력·학식·평판, 그리고 자식이 힘이 된다',p,tags:['성공하면 함께 삶','실패하면 갈라섬'],fn:()=>{
      if(chance(p)){sp.t=clamp((sp.t||50)+12);sp.h=clamp((sp.h||50)+8);say(`간곡히 붙잡았다. ${iga(nm)} 마음을 돌렸다.`,'big');return null;}
      doDivorce(sp,P.female?'소박':'아내가 떠남',false);say(P.female?`끝내 소박을 맞아 친정으로 돌아왔다.`:`${iga(nm)} 끝내 친정으로 돌아갔다.`,'big');if(P.female)ev('sobak','소박을 맞았다');return custodyScene(sp);}},
    {t:'담담히 받아들인다',p:null,tags:['갈라섬'],fn:()=>{doDivorce(sp,P.female?'소박':'아내가 떠남',false);fx({worry:-5});say('붙잡지 않았다. 각자의 길을 가기로 하였다.','big');return custodyScene(sp);}}]};
}

/* ===== 양육비: 갈라선 뒤, 사별한 뒤 ===== */
function supportScene(kind,x){
  const U=UNIT[P.cls]||.5;const nm=x?callOf(x):'';const inlaw=P.female?'시댁':'처가';const mine=minorKids();const away=P.kids.filter(k=>k.alive&&k.away&&P.year-k.born<18);
  const rich=x&&x.rich!=null?x.rich:1;const amt=Math.max(U*1.5,U*(1+rich));
  P.flags.supportY=P.year;
  const setIn=(v,from)=>{P.flags.csIn=(P.flags.csIn||0)+v;P.flags.csInFrom=from;};
  if(kind==='divorceWithMe'){
    const p1=clamp(.25+(P.st.know+P.st.fame)/500+rich*.08,.1,.8);
    const sons=mine.filter(k=>!k.female).length;const p2=clamp(.3+rich*.1+sons*.12,.1,.85);
    return {kind:'major',title:'양육비',pid:x&&x.id,text:`${iga(nm)} 떠난 뒤 아이들(${mine.map(k=>k.name).join(', ')})을 홀로 키운다. 먹이고 입히고 가르치는 데 드는 것이 만만치 않다.`,opts:[
      {t:`${nm}에게 양육비를 청한다`,sub:'학식과 평판이 도움이 된다',p:p1,tags:['성공하면 해마다 살림 보탬'],fn:()=>{if(chance(p1)){setIn(amt,nm);say(`${iga(nm)} 아이들 몫으로 해마다 곡식과 돈을 보내기로 하였다.`,'big');}else{fx({worry:8});say(`${iga(nm)} 모른 척하였다.`);}}},
      {t:`${nm}의 집안(${inlaw})에 청한다`,sub:sons?'손자가 있으면 그 집안도 외면하기 어렵다':'그 집안의 형편에 달렸다',p:p2,tags:['성공하면 넉넉히 보탬','아이를 데려가겠다 할 수도 있음'],fn:()=>{
        if(!chance(p2)){fx({worry:8});say(`옛 ${inlaw}에서 문전박대를 당하였다.`);return null;}
        if(sons&&chance(.4))return {kind:'major',title:'양육비 · 조건',text:`옛 ${inlaw}에서 돈은 보태겠으나, 대를 이을 손자만은 그 집안에서 키우겠다고 한다.`,opts:[
          {t:'손자를 보내고 양육비를 받는다',p:null,tags:['아들은 그 집에서 자람','재산 ↑'],fn:()=>{mine.filter(k=>!k.female).forEach(k=>k.away=1);setIn(amt*1.5,inlaw);fx({worry:12});say(`아들을 옛 ${inlaw}에 보냈다. 대신 해마다 넉넉한 양육비가 왔다.`,'big');}},
          {t:'아이는 내가 키운다',p:null,safe:true,tags:['양육비 없음'],fn:()=>{say('돈은 받지 않고 아이들을 곁에 두었다.');}}]};
        setIn(amt*1.3,inlaw);say(`옛 ${inlaw}에서 손주들 몫으로 해마다 살림을 보태 주기로 하였다.`,'big');return null;}},
      {t:'도움 없이 홀로 키운다',p:null,safe:true,tags:['평판 조금 ↑','살림 빠듯'],fn:()=>{fx({fame:3,worry:5});say('누구에게도 손 벌리지 않고 아이들을 키우기로 하였다.');}}]};
  }
  if(kind==='divorceAway'){
    const ask=!P.female;
    return {kind:'major',title:'양육비',pid:x&&x.id,text:ask?`${nm}의 친정에서 아이들(${away.map(k=>k.name).join(', ')}) 양육비를 보내라는 기별이 왔다. 아비 된 도리라는 것이다.`:`${nm}의 집에서 자라는 아이들(${away.map(k=>k.name).join(', ')})이 눈에 밟힌다.`,opts:ask?[
      {t:'해마다 양육비를 보낸다',p:null,tags:['재산 해마다 ↓','평판 ↑','아이들과의 정 유지'],fn:()=>{P.flags.csOut=(P.flags.csOut||0)+amt;fx({fame:4});say('아이들 몫으로 해마다 돈과 곡식을 보내기로 하였다.');}},
      {t:'한 번에 목돈을 보낸다',p:null,tags:['재산 크게 ↓'],fn:()=>{fx({wealth:-amt*6,fame:2});say('목돈을 한 번에 보내고 셈을 끝냈다.');}},
      {t:'보내지 않는다',p:null,safe:true,tags:['평판 ↓','아이들이 그대를 원망함'],fn:()=>{fx({fame:-8});away.forEach(k=>k.estranged=1);say('양육비를 보내지 않았다. 고을에 매정한 아비라는 말이 돌았다.');}}]:[
      {t:'몰래 돈과 옷을 보낸다',p:null,tags:['재산 해마다 ↓','아이들과의 정 유지'],fn:()=>{P.flags.csOut=(P.flags.csOut||0)+amt*.5;say('해마다 남몰래 아이들 옷과 엿값을 보냈다.');}},
      {t:'마음만 보낸다',p:null,safe:true,tags:['마음고생 ↑'],fn:()=>{fx({worry:6});say('먼발치에서 아이들 소식만 들었다.');}}]};
  }
  /* 사별: 시댁/처가의 도움 */
  const sons=mine.filter(k=>!k.female).length;const ir=(x&&x.rich!=null?x.rich:1);
  const offer=P.female&&sons&&chance(.45)?'take':'help';
  return {kind:'major',title:`${inlaw}의 도움`,text:offer==='take'?`${nm}${bat(nm)?'을':'를'} 잃은 뒤, ${inlaw}에서 대를 이을 손자들을 데려다 키우겠다고 한다. 대신 살림을 넉넉히 보태 주겠다고 한다.`:`${nm}${bat(nm)?'을':'를'} 잃은 뒤, ${inlaw}에서 남은 손주들 키우는 데 보태라며 사람을 보냈다.`,opts:offer==='take'?[
      {t:'손자들을 보낸다',p:null,tags:['아들들은 그 집에서 자람','재산 ↑'],fn:()=>{mine.filter(k=>!k.female).forEach(k=>k.away=1);setIn(amt*(1+ir*.3),inlaw);fx({worry:12});say(`아들들을 ${inlaw}에 보냈다. 해마다 살림이 보태졌지만 집이 텅 빈 것 같았다.`,'big');}},
      {t:'아이들은 내가 키운다',sub:'그 집안을 설득해야 한다',p:clamp(.35+(P.st.fame+P.st.know)/400),tags:['실패하면 아이들을 빼앗김'],fn:()=>{if(chance(.35+(P.st.fame+P.st.know)/400)){setIn(amt*.5,inlaw);say(`${eulreul(inlaw)} 설득해 아이들을 곁에 두었다. 조금이나마 살림도 보태 주었다.`);}else{mine.filter(k=>!k.female).forEach(k=>k.away=1);fx({worry:20});say(`끝내 ${inlaw}에서 손자들을 데려갔다.`,'big');}}}]:[
      {t:'고맙게 받는다',p:null,tags:['해마다 살림 보탬'],fn:()=>{setIn(amt*(.8+ir*.3),inlaw);say(`${inlaw}에서 해마다 손주들 몫을 보내 주었다.`);}},
      {t:'정중히 사양한다',p:null,safe:true,tags:['평판 조금 ↑'],fn:()=>{fx({fame:3});say('마음만 고맙게 받겠다며 사양하였다.');}}]};
}

/* ===== 내 신분이 바뀔 때 자식들의 신분 ===== */
function onClassChange(from,to){
  if(typeof syncStatus==='function')try{syncStatus();}catch(e){}
  const reason=P.flags.clsReason||(from==='cheonmin'?'freed':'other');P.flags.clsReason=null;
  const up=CRANK.indexOf(to)>CRANK.indexOf(from);
  const home=P.kids.filter(k=>k.alive&&!k.away&&!(k.female&&k.married)&&!k.estranged);
  const changed=[];
  if(!up){if(home.length)say(`그대의 신분이 바뀌었으나, 이미 태어난 자식들의 신분은 그대로였다.`);return;}
  if(reason==='marriage'){if(P.kids.some(k=>k.alive))say('혼인으로 그대의 신분은 올랐으나, 앞서 낳은 자식들은 제 아비 집안의 신분을 그대로 따랐다.');return;}
  if(reason==='freed'){
    home.filter(k=>k.cls==='cheonmin'&&P.year-k.born<18).forEach(k=>{k.cls='sangmin';changed.push(k.name);});
    const grown=P.kids.filter(k=>k.alive&&k.cls==='cheonmin'&&P.year-k.born>=18);
    if(changed.length)say(`그대가 천인의 신분을 벗으며, 함께 사는 어린 자식들(${changed.join(', ')})도 함께 속량되었다.`,'big');
    if(grown.length)say(`다만 이미 장성한 ${grown.map(k=>k.name).join(', ')}${bat(grown[grown.length-1].name)?'은':'는'} 따로 속량해야 했다.`);
    familyFollow(to,false);return;}
  if(reason==='household'){
    home.forEach(k=>{if(CRANK.indexOf(k.cls||from)<CRANK.indexOf(to)&&!(to==='royal')){k.cls=to;changed.push(k.name);}});
    if(changed.length)say(`집안의 신분이 오르니 함께 사는 자식들(${changed.join(', ')})도 ${CLS[to].n} 집안의 자식으로 대접받게 되었다.`);
    familyFollow(to,false);
    const out=P.kids.filter(k=>k.alive&&(k.away||(k.female&&k.married))&&CRANK.indexOf(k.cls||from)<CRANK.indexOf(to));
    if(out.length)say(`출가했거나 따로 사는 ${out.map(k=>k.name).join(', ')}의 신분은 그대로였다.`);return;}
  familyFollow(to,true);
}
/* 내 신분이 오를 때 배우자·첩·자식은 어떻게 되는가 */
function familyFollow(to,kids){
  const me={cls:P.cls};const sp=spouseP();
  if(sp&&sp.alive&&to!=='royal'){
    if(!P.female&&sp.mode!=='cheop'&&CRANK.indexOf(sp.cls)<CRANK.indexOf(to)){const nm=callOf(sp);sp.cls=to;say(`아내 ${nm}도 남편을 따라 ${CLS[to].n} 집안의 부인으로 대접받게 되었다.`);}
    else if(P.female&&CRANK.indexOf(sp.cls)<CRANK.indexOf(to))say(`남편 ${callOf(sp)}의 신분은 그대로였다. 아내의 신분이 오른다고 남편이 따라 오르지는 않았다.`);}
  const cps=Object.values(P.people).filter(x=>x.kind==='cheop'&&x.alive&&CRANK.indexOf(x.cls)<CRANK.indexOf(to));
  if(cps.length&&!P.female)say(`첩 ${cps.map(callOf).join(', ')}의 신분은 그대로였다. 첩은 정실처럼 남편의 신분을 따르지 못했다.`);
  if(!kids)return;
  const up=[],stay=[],far=[];
  P.kids.filter(k=>k.alive&&!k.estranged).forEach(k=>{
    if(k.female&&k.married)return;
    const other=P.people[P.female?k.father:k.mother]||(P.female?null:(sp&&!k.adopted?sp:null));
    let nc=k.adopted?(P.female?k.cls:to):(P.female?kidClass(other,me):kidClass(me,other));
    if(nc==='royal'&&to!=='royal')nc=to;
    if(CRANK.indexOf(nc)<=CRANK.indexOf(k.cls||'sangmin')){if(CRANK.indexOf(k.cls||'sangmin')<CRANK.indexOf(to))stay.push(k);return;}
    if(k.away){far.push(k);return;}
    k.cls=nc;up.push(k);});
  if(up.length)say(`${up.map(k=>k.name).join(', ')}도 ${CLS[up[0].cls].n} 집안의 자식이 되었다.`);
  if(stay.length)say(`${stay.map(k=>k.name).join(', ')}${bat(stay[stay.length-1].name)?'은':'는'} 다른 쪽 부모의 신분에 매여 그대로였다.`);
  if(far.length)say(`따로 자라는 ${far.map(k=>k.name).join(', ')}의 신분은 그대로였다.`);
}

/* ===== 근무지와 진로: 승진 때마다 고르는 길 ===== */
const POSTS={
  official:{min:1,every:4,opts:[
    {k:'cheongyo',n:'청요직',place:'한양',t:'홍문관·사헌부의 청요직',sub:'임금 곁에서 글을 다루는 자리. 출세가 빠르지만 당쟁의 칼날 앞에 선다.',mul:1.5,pay:1,tags:['승진 빠름','평판 ↑','사화·환국 때 위험 ↑']},
    {k:'jo',n:'육조 낭관',place:'한양',t:'육조의 실무 자리',sub:'호조·예조 같은 관청에서 나랏일을 맡는다. 무난하지만 승진은 더디다.',mul:.6,pay:1.2,tags:['안정','승진 더딤 (만년 낭관)']},
    {k:'local',n:'고을 수령',place:'지방',t:'외직으로 나가 고을 수령이 된다',sub:'한 고을의 원님이 되어 떵떵거린다. 벌이는 좋지만 조정과 멀어진다.',mul:.75,pay:1.9,tags:['수입 크게 ↑','지방에서 위세','승진 조금 더딤']},
    {k:'gaehwa',n:'개화 관료',place:'한양',t:'통리기무아문·외무아문의 개화 관료',sub:'새 문물과 외교를 맡는다. 출세가 빠르나 정변에 휘말리기 쉽다.',mul:1.4,pay:1.2,tags:['승진 빠름','정변 위험'],from:1881},
    {k:'gamsa',n:'관찰사',place:'지방',t:'한 도의 관찰사(감사)',sub:'한 도를 다스리는 감사가 된다.',mul:.9,pay:2.4,tags:['수입 크게 ↑','평판 ↑'],need:9}]},
  military:{min:1,every:2,opts:[
    {k:'guard',n:'궁궐 호위',place:'한양',t:'내금위·선전관',sub:'임금 곁을 지키는 무관. 출세가 빠르고 눈에 띄기 쉽다.',mul:1.4,pay:1,tags:['승진 빠름','임금의 눈에 띔']},
    {k:'border',n:'변방 진',place:'변방',t:'북방·남해 변방의 진',sub:'오랑캐와 왜구를 막는 최전선. 전쟁이 나면 공을 세우기 쉽지만 위험하다.',mul:1,pay:1.3,tags:['전쟁 때 공 ↑','다칠 수 있음']},
    {k:'sinsik',n:'신식 군대',place:'한양',t:'별기군·시위대 같은 신식 군대',sub:'서양식 총으로 훈련받는다. 구식 군인들의 미움을 산다.',mul:1.3,pay:1.2,tags:['승진 빠름','구식 군인과 갈등'],from:1881},
    {k:'camp',n:'훈련도감',place:'한양',t:'한양 군영',from:1593,to:1881,sub:'군사를 조련하는 자리. 무난하다.',mul:.7,pay:1.1,tags:['안정','승진 더딤']}]},
  yein:{min:1,every:1,opts:[
    {k:'palace',n:'궁중 진연',place:'한양',t:'장악원과 궁중 잔치',sub:'궁중 잔치에 뽑혀 올라간다. 이름이 높아진다.',mul:1.3,pay:1.2,tags:['평판 ↑','권세가의 눈에 띔']},
    {k:'tour',n:'유랑 놀이패',place:'팔도',t:'팔도를 떠도는 놀이패',sub:'장터와 고을을 돌며 판을 벌인다. 자유롭고 백성들의 사랑을 받는다.',mul:1,pay:1.1,tags:['백성의 인기','떠돌이 삶']},
    {k:'patron',n:'대감 댁 전속',place:'한양',t:'세도가 대감 댁에 매인 예인',sub:'한 집안에 매여 넉넉히 산다.',mul:.8,pay:1.7,tags:['수입 ↑','평판 조금 ↓']}]},
  gwangdae:null,
  gisaeng:{min:1,every:1,opts:[
    {k:'seonsang',n:'선상기',place:'한양',t:'궁중 진연에 뽑혀 올라간 선상기',sub:'지방 관기가 궁중 잔치에 뽑혀 한양으로 올라간다.',mul:1.4,pay:1.2,tags:['명기 되기 쉬움','평판 ↑']},
    {k:'gyobang',n:'고을 교방',place:'지방',t:'고을 교방의 관기',sub:'고을 잔치와 사또의 연회를 맡는다.',mul:1,pay:1,tags:['안정']},
    {k:'patron',n:'권세가 전속',place:'한양',t:'권세가가 아끼는 기생',sub:'한 권세가의 사랑을 받으며 넉넉히 지낸다.',mul:.8,pay:1.8,tags:['수입 ↑','속량될 수 있음']}]},
  doctor:{min:1,every:1,opts:[
    {k:'naeui',n:'내의원',place:'한양',t:'내의원 의관',sub:'임금의 병을 돌본다. 이름이 높아지지만 임금이 승하하면 책임을 진다.',mul:1.3,pay:1.2,tags:['평판 ↑','위험']},
    {k:'hyemin',n:'혜민서',place:'한양',t:'혜민서 의원',sub:'백성을 고친다.',mul:.9,pay:1,tags:['백성의 칭송']},
    {k:'jejung',n:'제중원',place:'한양',t:'제중원에서 서양 의술을 돕는 의원',sub:'서양 의사 곁에서 새 의술을 배운다.',mul:1.2,pay:1.1,tags:['학식 ↑','평판 ↑'],from:1885},
    {k:'private',n:'개업 의원',place:'고을',t:'고을에 약방을 차린다',sub:'약방을 열어 돈을 번다.',mul:.8,pay:1.8,tags:['수입 ↑']}]},
  interp:{min:1,every:1,opts:[
    {k:'sahaeng',n:'사행 역관',place:'연경',to:1894,t:'연경 가는 사신단의 역관',sub:'사신을 따라 청나라에 가며 몰래 무역으로 큰돈을 번다.',mul:1.1,pay:2.2,tags:['수입 크게 ↑','먼 길']},
    {k:'sayeok',n:'사역원',place:'한양',t:'사역원 교수',sub:'역관을 길러 낸다.',mul:1,pay:1,tags:['안정','평판 ↑']},
    {k:'english',n:'영어 통역',place:'한양',t:'외아문의 영어 통역관',sub:'서양 공사관과 조정 사이를 오간다.',mul:1.3,pay:1.5,tags:['수입 ↑','평판 ↑'],from:1883},
    {k:'waegwan',n:'왜관',place:'동래',t:'동래 왜관의 역관',sub:'왜인과의 교역을 맡는다.',mul:.9,pay:1.6,tags:['수입 ↑']}]}
};
POSTS.gwangdae=POSTS.yein;
function postMul(){const o=curPost();return o?o.mul:1;}
function postPay(){const o=curPost();return o?o.pay:1;}
function curPost(){if(!P.job||!P.post||P.postK!==P.job.k)return null;const d=POSTS[P.job.k];return d?d.opts.find(o=>o.k===P.post):null;}
function postScene(){
  const d=POSTS[P.job.k];P.flags.postY=P.year;const first=P.postK!==P.job.k;
  const opts=d.opts.filter(o=>(!o.need||P.job.lv>=o.need)&&(!o.from||P.year>=o.from)&&(!o.to||P.year<=o.to)).map(o=>({t:o.n+(o.k===P.post?' (지금 자리)':''),sub:o.t===o.n?o.sub:`${o.t}. ${o.sub}`,p:null,tags:o.tags,fn:()=>{
    const moved=P.post!==o.k;P.post=o.k;P.postK=P.job.k;P.postLv=P.job.lv;bookSeen('post',P.job.k+':'+o.k);
    if(o.home){if(moved)P.home=o.home;}else if(o.place==='지방'||o.place==='고을'||o.place==='변방')P.home=`${o.n} 관사`;else if(o.place==='한양'&&/관사/.test(P.home||''))P.home='한양 사저';
    if(o.k==='cheongyo'||o.k==='palace'||o.k==='seonsang'||o.k==='naeui')fx({fame:4});
    if(o.k==='patron')fx({fame:-3});
    if(o.ev)say(moved?`${o.n}의 길을 택하였다.`:`지금 하던 대로 ${o.n}의 길을 이어 갔다.`,'big');else say(moved?`${euro(o.t)} 나아갔다.`:`${o.n}에 그대로 머물렀다.`,'big');if(moved)ev('job',`${o.n}의 길을 걸었다`,{post:1});}}));
  return {kind:'major',title:first?'어디서 일할 것인가':'자리를 옮길 것인가',text:first?`${iga(jobTitle(P.job))} 되었다. 이제 어디에서 일할지 정해야 한다.`:`${euro(jobTitle(P.job))} 올랐다. 지금 자리에 머물지, 다른 자리로 옮길지 정할 때다.`,opts};
}
/* 근무지에서 생기는 일 */
const POST_EV={local:1,gamsa:1,cheongyo:1,jo:1,border:1,guard:1,tour:1,patron:1,sahaeng:1,naeui:1,seonsang:1};
function postEventScene(){
  {const c=curPost();if(c&&c.ev)return postEventGeneric();}
  P.flags.postEvY=P.year;const U=UNIT[P.cls]||.5;const o=curPost();const p=P.post;
  if(p==='local'||p==='gamsa')return {kind:'major',title:'고을의 원님',text:'흉년이 들었는데도 고을 아전들이 세금을 더 걷자고 한다. 그 가운데 얼마는 사또의 몫이 될 것이라 귀띔한다.',opts:[
    {t:'세금을 덜어 주고 곳간을 연다',p:null,tags:['평판 크게 ↑','수입 ↓'],fn:()=>{fx({fame:10,wealth:-U*5});say('세금을 덜어 주고 관아 곳간을 열었다. 고을 사람들이 송덕비를 세웠다.','big');ev('rise','고을 백성들이 송덕비를 세웠다');}},
    {t:'정해진 만큼만 걷는다',p:null,safe:true,tags:[],fn:()=>{say('법대로만 걷었다.');}},
    {t:'더 걷어 사사로이 챙긴다',p:.65,tags:['재산 크게 ↑','암행어사에게 걸리면 파직'],fn:()=>{fx({wealth:U*ri(20,40),fame:-6});if(!chance(.65)){say('암행어사 출두요! 탐학이 드러나 파직되고 유배되었다.','big');P.job=null;P.post=null;exile(ri(2,4));}else say('곳간이 그득해졌다. 백성들의 원성이 높았다.');}}]};
  if(p==='cheongyo'||p==='jo')return {kind:'major',title:'조정의 당파',text:p==='cheongyo'?'조정이 두 갈래로 나뉘어 서로를 탄핵한다. 그대에게도 어느 편에 설지 묻는다.':'만년 낭관으로 같은 자리를 지키는 사이, 동료들이 하나둘 승진해 나간다. 줄을 서야 하나 싶다.',opts:[
    {t:'세력 있는 편에 선다',p:.6,tags:['성공하면 승진','실패하면 파직'],fn:()=>{if(chance(.6)){setJob('official',Math.min(16,P.job.lv+2));say(`줄을 잘 서서 ${euro(RANKS[P.job.lv])} 뛰어올랐다.`,'big');}else{say('편을 잘못 들어 파직되었다.','big');fx({fame:-8});P.job.lv=Math.max(1,P.job.lv-2);}}},
    {t:'어느 편에도 서지 않는다',p:null,safe:true,tags:['평판 ↑','승진 기회는 놓침'],fn:()=>{fx({fame:5});say('어느 편에도 서지 않고 소신을 지켰다.');}}]};
  if(p==='border'||p==='guard')return {kind:'major',title:p==='border'?'변방의 싸움':'임금의 행차',text:p==='border'?'국경 너머 오랑캐가 쳐들어왔다는 봉화가 올랐다.':'임금의 사냥 행차를 호위하는 날, 멧돼지가 어가로 달려들었다.',opts:[
    {t:'앞장서 맞선다',sub:'무예가 중요하다',p:clamp(.35+P.st.brave/180),tags:['성공하면 승진·평판 ↑','다칠 수 있음'],fn:()=>{if(chance(.35+P.st.brave/180)){fx({fame:10});if(P.job.lv<6)setJob('military',P.job.lv+1);say(p==='border'?'적을 물리치고 공을 세웠다. 품계가 올랐다.':'단칼에 멧돼지를 베었다. 임금이 크게 칭찬하였다.','big');}else{fx({health:-ri(10,20)});say('맞서다 크게 다쳤다.','big');}}},
    {t:'군사를 지휘해 뒤를 받친다',p:null,safe:true,tags:[],fn:()=>{say('무리하지 않고 군사들을 지휘하였다.');}}]};
  if(p==='tour'||p==='patron'||p==='seonsang')return {kind:'major',title:'판을 벌이다',text:p==='tour'?'큰 장터에서 판을 벌였다. 구경꾼이 구름처럼 모였다.':p==='seonsang'?'궁중 진연에서 홀로 춤을 추라는 명이 떨어졌다.':'대감 댁 잔치에 이름난 손님들이 모였다.',opts:[
    {t:'온 힘을 다해 재주를 보인다',sub:'재주가 중요하다',p:clamp(.35+P.st.art/170),tags:['성공하면 평판·재산 ↑'],fn:()=>{if(chance(.35+P.st.art/170)){fx({fame:8,wealth:U*ri(3,8)});say('판이 끝나자 박수와 엽전이 쏟아졌다.','big');}else{fx({fame:-3});say('실수가 나와 판이 식었다.');}}},
    {t:'늘 하던 대로 한다',p:null,safe:true,tags:[],fn:()=>{say('늘 하던 대로 판을 마쳤다.');}}]};
  if(p==='sahaeng')return {kind:'major',title:'연경 가는 길',text:'사신단을 따라 연경에 왔다. 비단과 서책, 인삼을 몰래 사고팔면 큰돈이 된다.',opts:[
    {t:'몰래 장사를 크게 벌인다',p:.7,tags:['재산 크게 ↑','들키면 처벌'],fn:()=>{if(chance(.7)){fx({wealth:U*ri(30,60)});say('사행 무역으로 큰돈을 벌었다.','big');}else{fx({fame:-10,wealth:-P.wealth*.2});say('밀무역이 들통나 벌을 받았다.','big');}}},
    {t:'맡은 일만 한다',p:null,safe:true,tags:['평판 조금 ↑'],fn:()=>{fx({fame:3});say('통역만 충실히 하였다.');}}]};
  if(p==='naeui')return {kind:'major',title:'임금의 병환',text:'임금이 병석에 누웠다. 내의원이 발칵 뒤집혔다.',opts:[
    {t:'새 처방을 올린다',sub:'학식이 중요하다',p:clamp(.35+P.st.know/180),tags:['성공하면 크게 이름남','실패하면 문책'],fn:()=>{if(chance(.35+P.st.know/180)){fx({fame:12});say('그대의 처방으로 임금이 쾌차하였다.','big');}else{fx({fame:-10});say('처방이 듣지 않아 문책을 받았다.','big');}}},
    {t:'선배 의관들을 따른다',p:null,safe:true,tags:[],fn:()=>{say('선배들의 처방을 따랐다.');}}]};
  return null;
}

/* ===== 모든 직업의 갈림길 ===== */
/* [키, 이름, 설명, 승진배수, 수입배수, 태그, 사건(상황|잘됐을때|안됐을때), 거처] */
function PO(k,n,sub,mul,pay,tags,ev,home){const [tx,ok,no]=(ev||'||').split('|');return {k,n,place:'',t:n,sub,mul,pay,tags,ev:ev?{tx,ok,no}:null,home};}
const POSTS2={
  scholar:[Object.assign(PO('sung','성균관 유생','한양 성균관에 들어가 과거를 준비한다.',1.2,.8,['평판 ↑','돈이 듦'],'성균관 유생들이 임금께 올릴 상소를 쓰자고 모였다.|그대가 쓴 상소문이 조정에서 회자되었다.|상소가 임금의 노여움을 사 꾸중을 들었다.','성균관 동재'),{from:1398,to:1894}),PO('hyang','향교·서원','고향 서원에서 글을 읽으며 이름을 쌓는다.',1,1,['안정'],'서원에서 강회가 열려 이름난 선비들이 모였다.|그대의 강론에 다들 고개를 끄덕였다.|말이 막혀 체면을 구겼다.'),PO('sansa','산사 독학','깊은 산사에 들어가 홀로 글을 판다.',.9,.6,['학식 ↑','세상과 멀어짐'],'산사의 노승이 그대에게 어려운 경전 구절을 묻는다.|막힘없이 풀어내 노승을 놀라게 했다.|답을 못 해 부끄러웠다.')],
  prince:[PO('seohwa','서화와 학문','글과 그림에 몰두하며 조용히 지낸다.',1,1,['안전','평판 ↑'],'그대의 그림이 궐 안에 돌았다.|임금이 그림을 보고 크게 칭찬하였다.|그림이 엉성하다는 뒷말이 돌았다.'),PO('pungryu','풍류와 잔치','기생과 풍류를 즐기며 한량처럼 산다.',.8,.9,['재산 ↓','역모 의심을 피함'],'그대의 집에서 큰 잔치가 열렸다.|잔치가 장안의 이야깃거리가 되었다.|사치가 심하다는 상소가 올라왔다.'),PO('gwon','조정 가까이','대신들과 어울리며 권세를 키운다.',1.3,1.5,['수입 ↑','역모에 휘말릴 수 있음'],'대신들이 그대를 찾아와 은밀히 뜻을 묻는다.|대신들의 신망을 얻었다.|역모를 꾀한다는 의심을 받았다.')],
  concubine:[PO('jung','중전 편','중전을 받들며 몸을 낮춘다.',.8,1,['안전'],'중전이 그대에게 궐 안의 일을 맡겼다.|일을 잘 처리해 중전의 신임을 얻었다.|일이 틀어져 꾸중을 들었다.'),PO('dae','대비 편','대비전의 사람으로 선다.',1,1,['궐 안의 세력'],'대비가 그대를 불러 다른 후궁의 일을 묻는다.|대비의 사람으로 인정받았다.|다른 후궁들의 미움을 샀다.'),PO('chong','임금의 총애만 바라봄','오직 임금의 총애로 오른다.',1.4,1.2,['승진 빠름','투기를 받음'],'임금이 그대의 처소를 자주 찾는다.|총애가 더욱 깊어졌다.|다른 후궁의 모함을 받았다.')],
  naesi:[PO('jimil','지밀 내시','임금의 침전을 지킨다.',1.3,1,['임금 곁','위험'],'깊은 밤 임금이 그대에게만 은밀한 심부름을 맡겼다.|일을 해내 임금의 신임을 얻었다.|일이 새어 나가 문책을 받았다.'),PO('seungjeon','승전색','임금의 명을 전한다.',1.1,1.2,['평판 ↑'],'급한 어명을 전하러 밤길을 달린다.|어명을 제때 전해 칭찬을 받았다.|늦어서 꾸중을 들었다.'),PO('sado','궐 살림','궐 안 살림과 곳간을 맡는다.',.8,1.6,['수입 ↑'],'곳간 물건을 몰래 빼돌리자는 꾀임이 들어왔다.|깨끗이 거절하여 신망을 얻었다.|소문에 휘말려 의심을 샀다.')],
  chongsin:[PO('gyeot','곁을 지킴','오직 곁을 지킨다.',1,1,['안전'],'임금이 그대만 데리고 미행을 나섰다.|무사히 모셔 신임이 깊어졌다.|일이 틀어져 꾸중을 들었다.'),PO('jeongsa','정사에 끼어듦','총애를 업고 인사에 입김을 넣는다.',1.4,1.8,['수입 ↑','탄핵 위험'],'벼슬을 청탁하는 이들이 문 앞에 줄을 섰다.|뒷돈이 쌓였다.|대간이 그대를 탄핵하였다.'),PO('mul','물러나 조용히','눈에 띄지 않게 산다.',.6,.9,['안전','평판 ↑'],'궐 밖으로 나가 조용히 지내라는 권유가 왔다.|조용히 지내 뒷말이 없었다.|잊혀 가는 처지가 쓸쓸했다.')],
  namchong:[PO('sik','식객','대감의 식객으로 글과 말벗이 된다.',1,1,['안정'],'대감이 그대에게 시를 지어 보라 한다.|대감이 크게 기뻐하였다.|대감의 눈 밖에 났다.'),PO('jip','집사 일','대감 댁 살림을 맡는다.',1.2,1.5,['수입 ↑'],'대감 댁 소작료를 걷는 일을 맡았다.|살림이 불어 대감의 신임을 얻었다.|장부가 어긋나 의심을 샀다.'),PO('tteo','떠날 채비','언젠가 떠날 날을 준비한다.',.7,1,['자유'],'다른 대감 댁에서 그대를 데려가려 한다.|더 좋은 대접을 받았다.|옛 대감의 노여움을 샀다.')],
  court:null,
  slave:[PO('anchae','안채 몸종','주인 마님 곁에서 시중을 든다.',1.1,1,['주인의 신임'],'마님이 귀한 패물을 그대에게 맡겼다.|잘 간수하여 신임을 얻었다.|패물을 잃어 매를 맞았다.'),PO('oegeo','외거 노비','따로 살며 땅을 부치고 몸값을 바친다.',.9,1.4,['수입 ↑','속량 밑천'],'올해 농사가 잘되어 몸값을 바치고도 남았다.|남은 곡식을 모아 두었다.|흉년이라 몸값을 못 바쳐 꾸중을 들었다.'),PO('cheong','청지기','대문과 사랑채를 지킨다.',1.2,1.1,['평판 ↑'],'손님들이 대감을 뵙겠다며 뒷돈을 찔러 준다.|뒷돈이 쏠쏠히 모였다.|들켜서 매를 맞았다.')],
  farmer:[PO('non','논농사','물 좋은 들판에서 벼를 짓는다.',1,1.2,['수입 ↑','흉년 위험'],'가뭄이 들어 물꼬 싸움이 벌어졌다.|이웃과 잘 나누어 물을 대었다.|싸움이 커져 원수가 생겼다.'),PO('bat','밭농사·목화','목화와 콩을 길러 장에 낸다.',1.1,1,['장사 수완'],'올해 목화값이 크게 올랐다.|목화를 팔아 큰돈을 쥐었다.|값이 떨어져 손해를 봤다.'),PO('gae','개간','버려진 땅을 일궈 내 땅을 늘린다.',1.3,.8,['땅이 늘어남','힘듦'],'산비탈을 일구던 중 큰 바위가 나왔다.|바위를 걷어내 밭이 늘었다.|허리를 다쳤다.')],
  merchant:[PO('bobu','보부상','팔도 장터를 돈다.',1,1,['떠돌이'],'고개를 넘다 산적을 만났다.|패를 지어 무사히 넘었다.|짐을 빼앗겼다.'),PO('gaekju','포구 객주','포구에 객주를 차려 물건을 맡아 판다.',1.1,1.4,['수입 ↑'],'큰 배가 들어와 물건을 모두 맡기겠다 한다.|큰 거래로 돈을 벌었다.|물건값이 떨어져 손해를 봤다.'),Object.assign(PO('sanghoe','근대 상회','개항장에 상회를 차려 외국 물건을 사고판다.',1.3,1.6,['수입 ↑','외국 상인과 경쟁'],'청나라 상인이 값을 후려쳐 물건을 쓸어 가려 한다.|버텨서 제값을 받았다.|헐값에 넘겼다.'),{from:1883}),PO('sicheon','시전 상인','한양 시전에 자리를 얻는다.',1.2,1.3,['한양 생활','난전과 다툼'],'난전 상인들이 그대의 손님을 가로챈다.|금난전권을 내세워 쫓아냈다.|도리어 원한을 샀다.','한양 시전 뒤 집')],
  weaver:[PO('sewing','재봉틀 양복점','서양식 재봉틀로 양복을 짓는다.',1.2,1.5,['수입 ↑','새 문물'],'개화한 관리가 양복을 맞추러 왔다.|단정한 양복이 장안의 화제가 되었다.|치수를 잘못 재어 다시 지었다.'),Object.assign(PO('sangui','상의원 침선','궁중 옷을 짓는 일을 맡는다.',1.2,1.1,['평판 ↑'],'왕실 혼례복을 짓는 일이 떨어졌다.|솜씨가 칭송받았다.|바늘땀이 어긋나 꾸중을 들었다.'),{from:1392,to:1895}),PO('daegam','대갓집 침모','양반 댁 옷을 도맡는다.',1,1.3,['수입 ↑'],'마님이 혼수 옷을 급히 지어 달라 한다.|제때 지어 상을 받았다.|늦어서 꾸중을 들었다.'),PO('jang','장터 삯바느질','장터에서 삯을 받고 옷을 짓는다.',.9,1,['자유'],'장날 옷을 맡기려는 손님이 줄을 섰다.|하루 만에 큰 삯을 벌었다.|몸살이 났다.')],
  hunjang:[PO('maeul','마을 서당','마을 아이들을 가르친다.',1,1,['평판 ↑'],'고을에서 글 잘하는 아이가 났다.|제자가 소과에 붙었다.|제자가 낙방했다.'),PO('daegam','양반 댁 독선생','양반 댁 도령을 가르친다.',1.1,1.4,['수입 ↑'],'도령이 공부를 하지 않아 대감이 그대를 탓한다.|도령을 다잡아 신임을 얻었다.|쫓겨날 뻔했다.'),PO('seowon','서원 강장','서원에서 강의를 맡는다.',1.2,.9,['평판 ↑'],'이름난 선비들과 강론이 벌어졌다.|강론으로 이름이 났다.|말문이 막혔다.')],
  sword:[PO('dojang','도장','제자를 받아 도장을 연다.',1,1.2,['수입 ↑'],'이웃 고을 무예꾼이 겨루기를 청했다.|가볍게 이겼다.|져서 체면을 구겼다.'),PO('hoseong','호위 무사','권세가의 호위 무사가 된다.',1.1,1.5,['수입 ↑','위험'],'주인을 노리는 자객이 들었다.|자객을 물리쳤다.|크게 다쳤다.'),PO('yurang','무림 유랑','팔도를 떠돌며 고수를 찾는다.',1.3,.7,['무예 ↑'],'산속에서 이름난 고수를 만났다.|한 수를 배웠다.|크게 졌다.')],
  uinyeo:[PO('naeui','내의원 의녀','궁궐 내의원에서 일한다.',1.3,1.1,['평판 ↑','위험'],'중전의 병환에 그대가 불려갔다.|침으로 병을 다스려 칭찬을 받았다.|처방이 듣지 않아 꾸중을 들었다.'),PO('hyemin','혜민서 의녀','백성들을 돌본다.',1,1,['백성의 칭송'],'역병이 돌아 혜민서가 북적인다.|병자들을 살려 칭송받았다.|병을 얻었다.'),Object.assign(PO('cha','다모(茶母)','포도청에서 여인 일을 살핀다.',1,1.2,['위험'],'포도청이 여인이 얽힌 사건을 맡겼다.|범인을 찾아냈다.|일이 꼬였다.'),{from:1700})],
  painter:[PO('dohwa','도화서','궁중 기록화를 그린다.',1.2,1,['평판 ↑'],'임금의 어진을 그릴 화원을 뽑는다.|어진 화사로 뽑혔다.|뽑히지 못했다.'),PO('min','민화 장사','장터에 그림을 내다 판다.',.9,1.3,['수입 ↑'],'장날 그림이 불티나게 팔린다.|큰돈을 벌었다.|팔리지 않았다.'),PO('sahaeng','사행 화원','사신단을 따라 청에 간다.',1.1,1.2,['견문'],'연경에서 서양화를 보았다.|새 기법을 익혔다.|길에서 병이 났다.')],
  soldier:[PO('gyeong','한양 군영','한양 군영에서 복무한다.',1,1,['안정'],'군영 조련에서 장수가 솜씨를 본다.|눈에 들었다.|조련에서 실수했다.'),PO('byeon','변방 수자리','변방에서 수자리를 선다.',1.3,1,['공을 세우기 쉬움','위험'],'국경 너머 적이 쳐들어왔다.|적을 물리쳐 공을 세웠다.|크게 다쳤다.'),Object.assign(PO('po','포도청 포졸','도적을 잡는다.',1.1,1.2,['수입 ↑'],'이름난 도적의 소굴을 알아냈다.|도적을 잡아 상을 받았다.|놓치고 다쳤다.'),{from:1469})],
  jumo:[PO('gil','큰길 주막','역참 가까운 큰길에 주막을 연다.',1.1,1.3,['손님 많음'],'과거 보러 가는 선비들이 몰려왔다.|방이 꽉 차 돈을 벌었다.|술값을 떼였다.'),PO('po','포구 주막','뱃사람 상대 주막을 연다.',1,1.2,['거친 손님'],'뱃사람들이 술에 취해 싸움이 났다.|잘 말려 단골이 늘었다.|살림이 부서졌다.'),PO('han','한양 색주가','한양에서 술집을 연다.',1,1.5,['수입 ↑','평판 조금 ↓'],'권세가 자제들이 술판을 벌였다.|큰 술값을 받았다.|행패를 당했다.')],
  fisher:[PO('geun','근해 고기잡이','가까운 바다에서 고기를 잡는다.',1,1,['안정'],'조기 떼가 몰려왔다.|배가 가득 찼다.|그물이 찢어졌다.'),PO('won','먼바다 원양','멀리 나가 큰 고기를 잡는다.',1.3,1.4,['수입 ↑','풍랑 위험'],'먼바다에서 풍랑을 만났다.|풍랑을 이겨 만선으로 돌아왔다.|배가 부서질 뻔했다.'),PO('ung','어장 관리','어장과 염장 생선 장사를 한다.',1.1,1.2,['장사 수완'],'젓갈값이 크게 올랐다.|젓갈을 팔아 큰돈을 벌었다.|젓갈이 상했다.')],
  smith:[PO('gun','군기시','무기를 만든다.',1.2,1.1,['평판 ↑'],'나라에서 칼과 창을 급히 주문했다.|제때 만들어 상을 받았다.|불량이 나와 꾸중을 들었다.'),PO('nong','농기구','마을 농기구를 만든다.',1,1,['안정'],'봄갈이 철에 호미·낫 주문이 밀렸다.|넉넉히 벌었다.|몸살이 났다.'),PO('jang','장터 대장간','장터에 대장간을 연다.',1,1.3,['수입 ↑'],'장날 손님이 몰렸다.|큰돈을 벌었다.|화상을 입었다.')],
  potter:[Object.assign(PO('bunwon','분원 사기장','왕실 그릇을 굽는 분원에서 일한다.',1.2,1,['평판 ↑'],'왕실 제기를 굽는 일이 떨어졌다.|빼어난 백자가 나왔다.|가마가 무너졌다.'),{from:1467}),PO('ong','옹기 가마','옹기를 구워 판다.',1,1.3,['수입 ↑'],'김장철 옹기 주문이 몰렸다.|큰돈을 벌었다.|가마에 금이 갔다.'),PO('cheong','명품 다완','손에 꼽는 다완을 빚는다.',1.3,.9,['이름을 날림'],'왜관에서 다완을 사겠다는 왜인이 왔다.|비싸게 팔았다.|흥정이 깨졌다.')],
  carpenter:[PO('gung','궁궐 영건','궁궐 공사에 불려간다.',1.3,1,['평판 ↑'],'궁궐 전각을 다시 짓는다.|그대의 솜씨가 칭송받았다.|들보가 어긋나 꾸중을 들었다.'),PO('jeol','절 불사','절을 짓는다.',1,1.1,['공덕'],'큰 절의 대웅전 공사를 맡았다.|웅장한 전각이 섰다.|비가 와 공사가 늦어졌다.'),PO('min','민가 짓기','마을 집을 짓는다.',1,1.2,['수입 ↑'],'부잣집이 큰 기와집을 짓겠다 한다.|큰 삯을 받았다.|공사가 틀어졌다.')],
  mudang:[PO('guk','국무당','나라 굿을 맡는다.',1.3,1.2,['평판 ↑','위험'],'궁궐에서 기우제 굿을 청했다.|굿 끝에 비가 내렸다.|비가 오지 않아 쫓겨났다.'),PO('dan','단골판','마을 단골집 굿을 맡는다.',1,1,['안정'],'마을에 큰 굿판이 벌어졌다.|굿이 잘되어 사례가 넉넉했다.|굿이 엉망이었다.'),PO('ttol','떠돌이 무녀','팔도를 떠돌며 굿을 한다.',1,1.1,['자유'],'낯선 고을에서 귀신 들린 아이를 맡았다.|아이가 나았다.|사기꾼 소리를 들었다.')],
  ajeon:[PO('ibang','이방 줄','인사와 호적을 맡는다.',1.2,1.2,['권세'],'새 사또가 부임했다.|사또의 신임을 얻었다.|사또의 눈 밖에 났다.'),PO('hobang','호방','세금을 맡는다.',1,1.6,['수입 ↑','탐학 위험'],'세금을 더 걷어 나누자는 꾀임이 들어왔다.|몰래 챙긴 돈이 쌓였다.|암행어사에게 걸려 매를 맞았다.'),PO('hyeongbang','형방','형옥을 맡는다.',1,1.2,['위험'],'고을에 살인 사건이 났다.|범인을 잡아 칭찬을 받았다.|애먼 사람을 잡았다.')],
  sanwon:[PO('ho','호조 산원','나라 재정을 셈한다.',1.2,1,['평판 ↑'],'호조에서 큰 장부의 셈이 맞지 않는다.|틀린 곳을 찾아냈다.|셈을 틀려 꾸중을 들었다.'),PO('yang','양전 측량','땅을 재러 다닌다.',1,1.2,['출장'],'양전 사업에 뽑혀 고을을 돈다.|정확히 재어 칭찬을 받았다.|땅 주인과 다툼이 났다.'),PO('sang','상단 셈꾼','큰 상단의 셈을 맡는다.',.9,1.6,['수입 ↑'],'상단 장부를 맡았다.|큰돈을 받았다.|셈이 틀렸다.')],
  monk:[PO('seon','선방 수행','참선에 정진한다.',1.2,.6,['평판 ↑'],'큰스님이 화두를 던졌다.|깨달음을 얻었다.|화두에 막혀 괴로웠다.'),PO('seungbyeong','승병·산성','산성을 지키는 승군이 된다.',1.1,1,['위험'],'적이 쳐들어와 승병을 모은다.|공을 세워 이름을 떨쳤다.|크게 다쳤다.'),PO('hwaju','화주승','시주를 모아 절을 일으킨다.',1,1.4,['재산 ↑'],'큰 불사를 위해 시주를 모은다.|시주가 넘쳤다.|모이지 않았다.')],
  herb:[PO('sim','깊은 산 심마니','산삼을 찾는다.',1.2,1.2,['한 방','위험'],'깊은 골짜기에서 붉은 열매를 보았다.|산삼을 캐어 큰돈을 벌었다.|길을 잃고 다쳤다.'),PO('yak','약재 밭','약초를 길러 판다.',1,1.1,['안정'],'약재값이 올랐다.|넉넉히 팔았다.|병이 들어 망쳤다.'),PO('napp','약령시 납품','약령시에 약재를 댄다.',1,1.3,['수입 ↑'],'대구 약령시가 열렸다.|큰돈을 벌었다.|값이 떨어졌다.')],
  nurse:[PO('gung','궁궐 보모','왕실 아기씨를 돌본다.',1.3,1.1,['평판 ↑'],'아기씨가 열병에 걸렸다.|밤새 돌봐 살려 냈다.|꾸중을 들었다.'),PO('daegam','대갓집 유모','양반 댁 아이를 기른다.',1,1.3,['수입 ↑'],'도련님이 그대를 어미처럼 따른다.|마님의 신임을 얻었다.|마님이 질투하였다.'),PO('maeul','마을 젖어미','마을 아이들 젖을 물린다.',1,1,['안정'],'어미 잃은 아이를 맡았다.|아이가 무럭무럭 자랐다.|아이가 아팠다.')],
  baekjeong:[PO('doga','도축','소를 잡는다.',1,1.2,['수입 ↑'],'잔칫날 소를 잡는 일이 몰렸다.|큰돈을 벌었다.|멸시를 당했다.'),PO('yu','유기장','고리버들 그릇을 만든다.',1,1,['안정'],'고리짝 주문이 들어왔다.|넉넉히 벌었다.|팔리지 않았다.'),PO('gaju','가죽 일','가죽을 다룬다.',1.1,1.3,['수입 ↑'],'군영에서 가죽 갑옷 주문이 왔다.|큰 삯을 받았다.|가죽이 상했다.')],
  chaekkwae:[PO('daegam','양반가 단골','양반 댁에 책을 댄다.',1,1.2,['수입 ↑'],'대감이 귀한 서책을 구해 달라 한다.|구해 바쳐 큰 사례를 받았다.|구하지 못했다.'),Object.assign(PO('cheong','청나라 책','연경 서적을 몰래 들여온다.',1.2,1.5,['수입 ↑','금서 위험'],'서학 책이 들어왔다.|비싸게 팔았다.|금서로 걸렸다.'),{from:1637}),Object.assign(PO('sosol','언문 소설 세책','세책방에 소설을 빌려준다.',1,1.1,['백성의 인기'],'새 소설이 장안에 돌았다.|빌리려는 사람이 줄을 섰다.|책이 찢겨 돌아왔다.'),{from:1750})],
  jeongisu:[PO('jongno','종로 담뱃가게 앞','종로에서 이야기판을 연다.',1.2,1.1,['인기'],'이야기가 절정에 이르러 구경꾼들이 숨을 죽인다.|엽전이 쏟아졌다.|흥이 깨졌다.'),PO('daegam','대갓집 이야기꾼','안방 마님들께 소설을 읽어 준다.',1,1.3,['수입 ↑'],'마님들이 새 이야기를 졸랐다.|모두 눈물을 흘렸다.|하품을 했다.'),PO('jang','장터 순회','장터를 돈다.',1,1,['자유'],'큰 장에서 판을 벌였다.|박수가 터졌다.|비가 와 판을 접었다.')],
  hunter:[Object.assign(PO('cho','착호갑사','호랑이를 잡는 군사가 된다.',1.3,1.1,['평판 ↑','위험'],'고을에 호랑이가 나타났다.|호랑이를 잡아 상을 받았다.|호랑이에게 다쳤다.'),{from:1416}),PO('san','산 사냥','짐승을 잡아 가죽을 판다.',1,1.2,['수입 ↑'],'큰 멧돼지 떼를 만났다.|큰 사냥을 했다.|빈손으로 돌아왔다.'),PO('mae','매사냥','매를 길러 사냥한다.',1,1,['양반 상대'],'양반 댁에서 매사냥을 청했다.|큰 사례를 받았다.|매를 잃었다.')],
  sanpa:[PO('daegam','대갓집 산파','양반 댁 해산을 맡는다.',1.1,1.3,['수입 ↑'],'대감 댁 며느리의 해산이 어렵다.|무사히 받아 큰 사례를 받았다.|꾸중을 들었다.'),PO('maeul','마을 산파','마을 아기들을 받는다.',1,1,['칭송'],'한밤중 해산을 도우러 달려간다.|순산이었다.|산모가 위태로웠다.'),PO('ui','의녀 곁','의녀를 도와 배운다.',1.2,.9,['학식 ↑'],'의녀가 그대에게 어려운 해산을 맡겼다.|해내어 칭찬을 받았다.|꾸중을 들었다.')],
  jeomjaeng:[PO('jang','장터 점집','장터에 자리를 편다.',1,1.1,['안정'],'손님이 혼사 날짜를 묻는다.|딱 맞혀 단골이 생겼다.|틀려서 욕을 먹었다.'),PO('daegam','권세가 관상','권세가의 관상을 본다.',1.2,1.5,['수입 ↑','위험'],'대감이 자기 운수를 봐 달라 한다.|대감이 크게 기뻐하였다.|불길한 말을 해 쫓겨났다.'),PO('pung','풍수 지관','묏자리를 봐준다.',1.1,1.3,['수입 ↑'],'양반 댁이 명당을 찾는다.|명당을 찾아 큰 사례를 받았다.|산송에 휘말렸다.')],
  bangmul:[PO('ban','양반가 안방','양반 댁 안방에 방물을 판다.',1.1,1.3,['수입 ↑','소식통'],'마님들이 혼사 소식을 묻는다.|중매를 서 큰 사례를 받았다.|말실수로 쫓겨났다.'),PO('jang','장터','장터를 돈다.',1,1,['안정'],'장날 분과 연지가 불티나게 팔렸다.|넉넉히 벌었다.|도둑을 맞았다.'),PO('gung','궐 출입','궁녀들에게 물건을 판다.',1.2,1.2,['위험'],'궁녀가 궐 밖 편지를 전해 달라 한다.|사례를 넉넉히 받았다.|들켜서 혼쭐이 났다.')],
  dyer:[PO('gung','궁중 염색','왕실 옷감을 물들인다.',1.2,1,['평판 ↑'],'왕실 잔치에 쓸 비단을 물들인다.|빛깔이 곱다고 칭찬받았다.|얼룩이 졌다.'),PO('jang','장터 염색집','장터에 염색집을 연다.',1,1.3,['수입 ↑'],'쪽빛 옷감 주문이 몰렸다.|큰돈을 벌었다.|물감이 바랬다.'),PO('ssuk','쪽 농사','쪽을 길러 판다.',1,1.1,['안정'],'쪽값이 올랐다.|넉넉히 팔았다.|가뭄이 들었다.')],
  gatjang:[PO('tongyeong','통영 갓','이름난 통영 갓을 만든다.',1.2,1.2,['평판 ↑'],'한양 양반들이 통영 갓을 찾는다.|비싸게 팔렸다.|흠이 났다.'),PO('jang','장터 갓방','장터에서 판다.',1,1.1,['안정'],'과거철 갓이 잘 팔린다.|넉넉히 벌었다.|안 팔렸다.'),PO('gung','상의원','궁중 관모를 만든다.',1.1,1,['명예'],'임금의 익선관을 고친다.|칭찬을 받았다.|꾸중을 들었다.')],
  mabu:[PO('yeok','역참 마부','역참에서 말을 몬다.',1,1,['안정'],'급한 파발을 실어 나른다.|제때 닿아 칭찬받았다.|말이 다쳤다.'),PO('daegam','대갓집 견마잡이','대감의 말을 끈다.',1.1,1.2,['수입 ↑'],'대감 행차에 말이 놀라 날뛴다.|말을 진정시켜 칭찬받았다.|대감이 낙마했다.'),PO('ma','말 장사','말을 사고판다.',1,1.4,['수입 ↑'],'제주에서 좋은 말이 들어왔다.|비싸게 팔았다.|병든 말을 샀다.')],
  salt:[PO('yeom','염전','소금을 굽는다.',1,1,['안정'],'볕이 좋아 소금이 많이 났다.|큰돈을 벌었다.|장마에 망쳤다.'),PO('sang','소금 장수','소금을 지고 다니며 판다.',1,1.3,['수입 ↑'],'내륙 장터에 소금이 귀하다.|비싸게 팔았다.|짐을 잃었다.'),PO('ju','염전 주인 되기','염전을 사들인다.',1.3,1.1,['재산 ↑'],'옆 염전이 매물로 나왔다.|사들여 염전이 늘었다.|빚을 졌다.')],
  haenyeo:[PO('ap','앞바다 물질','가까운 바다에서 물질한다.',1,1,['안정'],'전복이 많이 났다.|넉넉히 땄다.|숨이 막힐 뻔했다.'),PO('bakkat','바깥 물질','육지 바다로 원정 물질을 간다.',1.3,1.4,['수입 ↑','위험'],'경상도 바다로 원정을 갔다.|큰돈을 벌어 돌아왔다.|물에 휩쓸릴 뻔했다.'),PO('jin','진상 전복','관아에 진상 전복을 바친다.',1,.9,['관아의 눈'],'진상할 전복이 모자라다.|채워 바쳐 칭찬받았다.|매를 맞았다.')],
  gwansang:[PO('cheon','천문','별을 살핀다.',1.2,1,['평판 ↑'],'혜성이 나타났다.|정확히 기록하여 칭찬받았다.|보고가 늦었다.'),PO('ji','지리','풍수를 본다.',1,1.2,['수입 ↑'],'왕릉 자리를 고른다.|길지를 골라 상을 받았다.|흉지라는 탄핵을 받았다.'),PO('yeok','역법','달력을 만든다.',1.1,1,['안정'],'일식을 예보해야 한다.|정확히 맞혔다.|틀려서 꾸중을 들었다.')],
  yulgwan:[PO('hyeong','형조','송사를 맡는다.',1.2,1,['평판 ↑'],'억울한 옥사가 있다.|억울함을 풀어 주었다.|윗사람의 미움을 샀다.'),PO('oe','고을 송사','고을 송사를 돕는다.',1,1.3,['수입 ↑'],'산송이 벌어졌다.|잘 판결해 칭찬받았다.|한쪽의 원한을 샀다.'),PO('sa','사사로운 송사꾼','송사를 대신 써 준다.',.9,1.5,['수입 ↑','평판 ↓'],'소지를 대신 써 달라는 이들이 몰려왔다.|큰돈을 벌었다.|무고로 걸렸다.')],
  sajagwan:[PO('seung','승문원','외교 문서를 쓴다.',1.2,1,['평판 ↑'],'청나라에 보낼 국서를 쓴다.|글씨가 칭송받았다.|획이 틀어졌다.'),PO('bi','비문 글씨','비석 글씨를 쓴다.',1,1.3,['수입 ↑'],'양반 댁 비문을 부탁받았다.|큰 사례를 받았다.|글자를 틀렸다.'),PO('pan','현판 글씨','현판을 쓴다.',1.1,1.1,['명성'],'큰 절 현판을 부탁받았다.|이름을 날렸다.|마음에 들어 하지 않았다.')],
  akgong:[Object.assign(PO('jang','장악원','궁중 음악을 맡는다.',1.2,1,['평판 ↑'],'궁중 잔치에서 연주한다.|임금이 칭찬하였다.|음이 틀렸다.'),{from:1466}),PO('pung','풍류방','양반 풍류방에서 연주한다.',1,1.3,['수입 ↑'],'선비들의 풍류방에 불려갔다.|큰 사례를 받았다.|흥이 깨졌다.'),PO('gyo','교방 악공','고을 교방에서 연주한다.',1,1,['안정'],'사또의 잔치가 열렸다.|잔치가 흥겨웠다.|꾸중을 들었다.')],
  poet:[PO('si','시회','여류 시회를 연다.',1.2,.9,['평판 ↑'],'규방 시회에서 시를 짓는다.|그대의 시가 돌았다.|시가 밋밋하다는 평을 들었다.'),Object.assign(PO('eon','언문 소설','언문 소설을 쓴다.',1,1.2,['백성의 인기'],'세책방에서 그대의 소설을 찾는다.|장안의 화제가 되었다.|외설이라는 뒷말이 돌았다.'),{from:1700}),PO('jip','시집 엮기','시집을 엮는다.',1.1,1,['이름이 남음'],'시를 엮어 책으로 낸다.|시집이 청나라까지 갔다.|흩어져 버렸다.')],
  cheosa:[PO('sallim','산림','산림에 은거하며 제자를 기른다.',1.2,.8,['평판 ↑'],'조정에서 벼슬을 내리며 부른다.|사양하여 더 높은 이름을 얻었다.|부름을 받아들였다가 비웃음을 샀다.'),PO('hyang','향약','고을 향약을 이끈다.',1,1,['고을의 신망'],'고을에 다툼이 났다.|잘 중재해 칭송받았다.|한쪽의 원망을 들었다.'),PO('jeo','저술','책을 쓴다.',1.1,.9,['이름이 남음'],'평생의 저술을 마무리한다.|책이 널리 읽혔다.|불에 탔다.')],
  bandit:[PO('ui','의적','탐관오리만 턴다.',1.2,1,['백성의 사랑','추포 위험'],'탐관오리의 곳간이 비어 있다는 소식이 왔다.|곳간을 털어 백성에게 나눴다.|포졸에게 쫓겼다.'),PO('hwa','화적','닥치는 대로 턴다.',1.1,1.6,['재산 ↑','평판 ↓'],'세곡선이 지나간다.|크게 털었다.|관군과 맞닥뜨렸다.'),PO('gwi','귀순 준비','관아에 귀순할 길을 찾는다.',.6,.8,['죄를 씻을 수 있음'],'관아에서 귀순하면 죄를 묻지 않겠다 한다.|무사히 귀순했다.|속임수였다.')],
  clerk:[PO('myeon','면사무소','면사무소에서 호적과 세금을 맡는다.',1,1.1,['안정','동네의 눈총'],'공출 할당량을 채우라는 명이 떨어졌다.|동네 사람들 사정을 봐주며 겨우 채웠다.|모질게 걷어 원망을 샀다.'),PO('gun','군청','군청에서 일한다.',1.2,1.3,['수입 ↑','평판 ↓'],'독립운동가를 밀고하라는 압박을 받았다.|모른 척 넘겼다.|밀고하라는 압박에 시달렸다.'),PO('school','학교 서기','보통학교 서기로 일한다.',.9,1,['평판 덜 깎임'],'아이들에게 일본어만 쓰게 하라는 명이 내려왔다.|몰래 조선말을 눈감아 주었다.|들켜서 꾸중을 들었다.')],
  indep:[PO('manju','만주 독립군','만주 무장 독립군에 든다.',1.3,.8,['평판 ↑','목숨이 위태로움'],'일본군 수비대를 습격한다.|습격에 성공하였다.|크게 다쳤다.'),PO('shanghai','상하이 임시 정부','임시 정부에서 일한다.',1.1,.8,['평판 ↑'],'임시 정부의 자금이 바닥났다.|동포들의 성금을 모아 버텼다.|굶주렸다.'),PO('gungnae','국내 비밀 조직','국내에서 몰래 군자금을 모은다.',1,1,['붙잡힐 수 있음'],'형사가 뒤를 밟는다.|따돌렸다.|붙잡혀 고문을 당했다.')],
  teacher:[PO('gwanrip','관립 소학교','나라에서 세운 소학교에서 가르친다.',1.2,1.1,['안정','평판 ↑'],'학부에서 시찰을 나왔다.|아이들의 실력에 시찰관이 감탄하였다.|꾸중을 들었다.'),PO('mission','선교사 학당','배재·이화 같은 선교사 학당에서 가르친다.',1.1,1.2,['새 학문','유생들의 손가락질'],'유생들이 서양 귀신 학교라며 돌을 던졌다.|흔들림 없이 수업을 이어 갔다.|학생들이 겁을 먹고 흩어졌다.'),PO('sarip','사립 학교 설립','민족의 힘을 기르자며 사립 학교를 세운다.',1.3,.8,['평판 크게 ↑','재산 ↓'],'학교를 세울 돈이 모자라다.|뜻있는 이들이 성금을 보탰다.|문을 닫을 뻔했다.')],
  photo:[PO('studio','사진관','한양에 사진관을 차린다.',1.1,1.4,['수입 ↑'],'혼례 사진을 박으러 손님이 몰렸다.|사진이 잘 나와 소문이 났다.|혼이 빠져나간다며 손님이 달아났다.'),PO('court','궁궐 사진','임금과 왕실의 모습을 박는다.',1.3,1.1,['평판 ↑'],'임금의 어진 사진을 박게 되었다.|훌륭한 사진이 나왔다.|빛이 모자라 사진이 흐렸다.'),PO('tour','팔도 출사','팔도를 돌며 풍경과 사람을 박는다.',1,1,['견문'],'금강산 꼭대기에서 사진을 박는다.|길이 남을 사진이 나왔다.|사진기가 깨졌다.')],
  reporter:[PO('dokrip','민간 신문','백성을 깨우치는 민간 신문에서 일한다.',1.2,1,['평판 ↑','관아의 눈총'],'탐관오리의 비리를 캐냈다.|기사가 나가 탐관오리가 파직되었다.|기사를 막으려는 협박을 받았다.'),PO('gwanbo','관보','나라의 소식을 싣는 관보를 맡는다.',1,1.2,['안정'],'급한 칙령을 실어야 한다.|제때 실어 칭찬받았다.|오자가 나 꾸중을 들었다.'),PO('nonseol','논설','나라의 앞날을 논하는 글을 쓴다.',1.3,.9,['이름을 날림','붙잡힐 수 있음'],'을사늑약을 비판하는 논설을 쓸 것인가.|논설이 온 나라를 울렸다.|일본 헌병에게 끌려갔다.')],
  westdoc:[PO('jejung','제중원','제중원에서 일한다.',1.2,1.1,['평판 ↑'],'콜레라 환자가 밀려들었다.|많은 이를 살려 냈다.|병을 옮을 뻔했다.'),PO('gaeup','양의원 개업','양의원을 차린다.',1,1.6,['수입 ↑'],'서양 약을 믿지 못하는 손님을 설득한다.|병이 나아 단골이 되었다.|손님이 의심하며 돌아갔다.'),PO('gunui','군의','신식 군대의 군의가 된다.',1.1,1.2,['위험'],'훈련 중 다친 병정을 고친다.|무사히 고쳤다.|손쓸 수 없었다.')],
  preach:[PO('gwonseo','권서','성경을 짊어지고 장터를 돈다.',1.1,1,['떠돌이'],'장터에서 성경을 팔다 봉변을 당했다.|오히려 사람들이 귀를 기울였다.|짐을 빼앗겼다.'),PO('jeondo','전도부인·전도사','교회에서 사람들을 돌본다.',1.2,1,['평판 ↑'],'과부와 천민들이 교회를 찾아왔다.|모두를 형제자매로 맞았다.|양반들의 비난을 받았다.'),PO('school','교회 학교','교회에 딸린 학교를 맡는다.',1,1,['학식 ↑'],'글 모르는 아낙들에게 한글을 가르친다.|아낙들이 편지를 쓰게 되었다.|남편들이 반대하였다.')],
  newarmy:[PO('siwi','시위대','궁궐을 지키는 신식 군대.',1.2,1.1,['임금 곁'],'일본군이 궁을 에워쌌다.|끝까지 자리를 지켰다.|크게 다쳤다.'),PO('jinwi','지방 진위대','지방을 지키는 신식 군대.',1,1,['안정'],'의병을 토벌하라는 명이 떨어졌다.|명을 거부하고 의병과 손잡았다.|명을 따랐으나 마음이 무거웠다.'),PO('school','무관학교','무관학교에서 생도를 가르친다.',1.1,1.1,['평판 ↑'],'생도들의 훈련을 맡았다.|훌륭한 장교들을 길러 냈다.|생도들이 다쳤다.')],
  telegraph:[PO('ujeong','우정국','편지를 나르는 우정국에서 일한다.',1,1,['안정'],'급한 편지가 산더미처럼 쌓였다.|모두 제때 날랐다.|편지를 잃어버렸다.'),PO('jeonbo','전보사','전깃줄로 소식을 보내는 전보사에서 일한다.',1.2,1.1,['새 문물'],'모스 부호를 익혀야 한다.|금세 익혀 칭찬받았다.|틀린 전보를 보냈다.'),PO('cheoldo','철도','경인선 철도 일을 맡는다.',1.1,1.3,['수입 ↑'],'기차가 처음 달리는 날이다.|무사히 첫 기차를 보냈다.|사고가 날 뻔했다.')],
  worker:[PO('jeongmi','정미소','쌀을 찧는 정미소에서 일한다.',1,1,['안정'],'기계에 손이 끼일 뻔했다.|재빨리 피했다.|손을 다쳤다.'),PO('yeoncho','연초 공장','담배를 마는 공장에서 일한다.',1,1.1,['건강 ↓'],'품삯을 깎는다는 말이 돌았다.|직공들과 함께 버텨 품삯을 지켰다.|쫓겨날 뻔했다.'),PO('budu','부두 노동','개항장 부두에서 짐을 나른다.',1.1,1.2,['수입 ↑','다칠 수 있음'],'큰 배가 들어와 짐이 산더미다.|하루 품삯을 두 배로 받았다.|허리를 다쳤다.')],
  donghak:[PO('jeop','포교','동학을 퍼뜨린다.',1.2,1,['관아의 눈'],'관아에서 동학 교도를 잡아들인다.|몸을 숨겨 무사했다.|붙잡혀 매를 맞았다.'),PO('nongmin','농민군','탐관오리에 맞서 들고일어난다.',1.4,.8,['위험','평판 ↑'],'관군과 맞닥뜨렸다.|관군을 물리쳤다.|크게 다쳤다.'),PO('suyang','수양','조용히 수도에 힘쓴다.',.8,1,['안전'],'주문을 외며 마음을 닦는다.|마음이 맑아졌다.|잡념이 들끓었다.')],
  gwangdae2:null
};
for(const k in POSTS2){if(POSTS2[k]&&!POSTS[k])POSTS[k]={min:1,every:k==='concubine'?3:k==='naesi'?2:1,opts:POSTS2[k]};}
/* 승진하며 신분이 바뀌는 길 */
const RISE=[
  {k:'military',lv:2,from:['cheonmin','sangmin','jungin'],to:'yangban',why:'무관으로 당상의 반열에 가까워지니, 사람들이 그대 집안을 무반 양반으로 대접하였다'},
  {k:'official',lv:1,from:['sangmin','jungin','cheonmin'],to:'yangban',why:'문과 급제자로 벼슬을 받으니 양반의 반열에 들었다'},
  {k:'soldier',lv:2,from:['cheonmin'],to:'sangmin',why:'싸움에서 공을 세워 면천되었다'},
  {k:'ajeon',lv:2,from:['sangmin','cheonmin'],to:'jungin',why:'이방이 되니 대대로 향리 집안으로 행세하게 되었다'},
  ...['doctor','interp','gwansang','yulgwan','sanwon','painter','sajagwan'].map(k=>({k,lv:1,from:['sangmin'],to:'jungin',why:'기술직 관원이 되니 중인 집안으로 대접받게 되었다'})),
  {k:'doctor',lv:2,from:['jungin'],to:'yangban',why:'어의의 공으로 임금이 동반 벼슬을 내렸다',post:'naeui',p:.35},
  {k:'interp',lv:2,from:['jungin'],to:'yangban',why:'당상 역관의 공으로 높은 품계를 받아 양반 대접을 받게 되었다',p:.2},
  {k:'uinyeo',lv:2,from:['cheonmin'],to:'sangmin',why:'내의녀로 공을 세워 면천되었다'},
  {k:'akgong',lv:2,from:['cheonmin'],to:'sangmin',why:'장악원 전악으로 공을 세워 면천되었다'},
  {k:'gisaeng',lv:3,from:['cheonmin'],to:'sangmin',why:'명기의 이름을 아낀 이가 몸값을 치러 속량해 주었다',cost:0,ask:true},
  {k:'yein',lv:2,from:['cheonmin'],to:'sangmin',why:'명창의 소리에 감복한 임금이 명예 벼슬을 내렸다',year:1850},
  {k:'gwangdae',lv:2,from:['cheonmin'],to:'sangmin',why:'명창의 소리에 감복한 임금이 명예 벼슬을 내렸다',year:1850},
  {k:'slave',lv:2,from:['cheonmin'],to:'sangmin',why:'몸값을 바치고 속량되었다',cost:60,ask:true},
  ...['merchant','farmer','salt','fisher','jumo'].map(k=>({k,lv:2,from:['sangmin','jungin'],to:'yangban',why:'납속하고 공명첩을 사서 양반 행세를 하게 되었다',cost:k==='merchant'?400:250,ask:true,year:1592}))
];
function riseRule(){
  if(!P.job)return null;const J=P.job;
  return RISE.find(r=>r.k===J.k&&J.lv>=r.lv&&r.from.includes(P.cls)&&!(r.year&&P.year<r.year)&&!(r.post&&P.post!==r.post)&&!(P.flags.riseDone||{})[r.k+r.to]);
}
function riseScene(r){
  P.flags.riseDone=P.flags.riseDone||{};P.flags.riseDone[r.k+r.to]=1;
  const U=UNIT[P.cls]||.5;const cost=r.cost?Math.round(r.cost*U*4):0;
  if(r.p&&!chance(r.p))return null;
  const go=()=>{if(cost)P.wealth=Math.max(0,P.wealth-cost);const fk=P.cls;P.flags.clsReason=r.cost?'bought':(fk==='cheonmin'?'freed':'promo');P.cls=r.to;if(P.sub==='nobi')P.sub='';
    say(`${r.why}. ${CLS[fk].n}에서 ${iga(CLS[r.to].n)} 되었다.`,'big');ev('rise',r.why);if(r.to==='sangmin')note('myeoncheon');onClassChange(fk,r.to);bookSeen('rise',r.k+r.to);P.lastCls=P.cls;};
  if(!r.ask){go();return null;}
  return {kind:'major',title:'신분을 바꿀 기회',text:`${r.why.replace(/었다$|였다$/,'는 길이 열렸다')}. ${cost?`드는 돈은 ${money(cost)}이다.`:''}`,opts:[
    {t:'신분을 바꾼다',p:null,tags:[`${CLS[r.to].n}이 됨`,cost?'재산 크게 ↓':'',r.to==='yangban'?'진짜 양반들의 뒷말':''].filter(Boolean),fn:()=>{if(cost&&P.wealth<cost){say('모아 둔 돈이 모자라 뜻을 이루지 못했다.');P.flags.riseDone[r.k+r.to]=0;return;}go();if(r.to==='yangban'&&r.cost)fx({fame:-4});}},
    {t:'지금 처지대로 산다',p:null,safe:true,tags:[],fn:()=>{say('지금 처지대로 살기로 하였다.');}}]};
}
/* 근무지 사건 (POST_EV에 없는 자리) */
function postEventGeneric(){
  const o=curPost();if(!o||!o.ev)return null;P.flags.postEvY=P.year;const U=UNIT[P.cls]||.5;
  const d=JOBS[P.job.k];const sk=d.stat==='wit'?'know':d.stat==='grace'?'look':d.stat;const p=clamp(.35+(P.st[sk]||40)/170,.2,.9);
  const hurt=(o.tags||[]).some(t=>/위험/.test(t));
  return {kind:'major',title:o.n,text:o.ev.tx,opts:[
    {t:'솜씨를 다해 나선다',sub:`${STATN[sk]||'재주'}${bat(STATN[sk]||'재주')?'이':'가'} 중요하다`,p,tags:['잘되면 평판·재산 ↑',hurt?'다칠 수 있음':'잘못되면 평판 ↓'],fn:()=>{
      if(chance(p)){fx({fame:ri(4,8),wealth:U*ri(3,10)*(o.pay||1)});say(o.ev.ok,'big');if(o.k==='gwi'&&P.job.k==='bandit'){P.post=null;setJob('soldier',0);say('도적 떼를 떠나 관군의 군졸이 되었다.');}}
      else{fx(hurt?{fame:-3,health:-ri(6,14)}:{fame:-ri(3,6)});say(o.ev.no);}}},
    {t:'무리하지 않는다',p:null,safe:true,tags:[],fn:()=>{say('무리하지 않고 넘겼다.');}}]};
}

/* ===== 홀로 사는 삶: 사별·이혼·미혼 ===== */
function soloKind(){if(P.flags.sujeol)return 'S';if(P.widowed)return 'W';if(P.divorced)return 'D';return 'N';}
const SOLO=[
  {id:'inlawcare',c:k=>P.female&&(k==='S'||k==='W'),f:()=>({title:'시어머니의 병',text:'늙은 시어머니가 자리에 누웠다. 동서들은 저마다 핑계를 대며 발을 뺀다.',opts:[
    {t:'곁에서 극진히 모신다',p:null,tags:['평판 ↑','건강 ↓'],fn:()=>{fx({fame:ri(5,9),health:-ri(4,8)});say('밤낮으로 시어머니 곁을 지켰다. 고을에 효부라는 말이 돌았다.','big');}},
    {t:'약값만 대고 동서에게 맡긴다',p:null,tags:['재산 ↓'],fn:()=>{fx({wealth:-soloU()*4});say('약값을 보태고 병구완은 동서에게 맡겼다.');}},
    {t:'모른 척한다',p:null,tags:['평판 ↓'],fn:()=>{fx({fame:-6});say('발길을 끊었다. 시댁 사람들의 원망이 컸다.');}}]})},
  {id:'rearkids',c:k=>(k!=='N')&&P.kids.some(x=>x.alive&&!x.away&&P.year-x.born<15),f:()=>{const ks=P.kids.filter(x=>x.alive&&!x.away&&P.year-x.born<15);return {title:'홀로 키우는 자식',text:`${P.female?'아비':'어미'} 없이 자라는 ${ks.map(x=>x.name).join(', ')}${bat(ks[ks.length-1].name)?'을':'를'} 홀로 키운다. 살림은 빠듯하고 아이들은 쑥쑥 자란다.`,opts:[
    {t:'밤새 일해 글공부를 시킨다',p:null,tags:['재산 ↓','건강 ↓','자식 학식 ↑'],fn:()=>{fx({wealth:-soloU()*5,health:-5});ks.forEach(x=>{if(x.st)x.st.know=clamp((x.st.know||30)+ri(5,10),0,100);});say('밤마다 삯일을 해 아이들 서당비를 댔다.','big');}},
    {t:'친정·형제에게 도움을 청한다',p:.7,tags:['체면 ↓'],fn:()=>{if(chance(.7)){fx({wealth:soloU()*5,fame:-2});say('형제들이 쌀과 돈을 보태 주었다.');}else{fx({worry:8});say('형제들도 형편이 어렵다며 고개를 저었다.');}}},
    {t:'아이들에게 일찍 일을 가르친다',p:null,tags:['재산 ↑','자식 건강 ↑'],fn:()=>{fx({wealth:soloU()*3});ks.forEach(x=>{if(x.st)x.st.health=clamp((x.st.health||40)+ri(3,7),0,100);});say('아이들이 어린 손으로 살림을 거들었다.');}}]};}},
  {id:'greedy',c:k=>P.female&&(k==='S'||k==='W')&&P.wealth>soloU()*20,f:()=>({title:'재산을 노리는 시댁',text:'세상을 떠난 이의 형제가 찾아와, 이 집 재산은 본디 문중의 것이니 내놓으라고 윽박지른다.',opts:[
    {t:'관아에 소지를 올린다',sub:'학식이 중요하다',p:clamp(.3+P.st.know/160),tags:['이기면 재산을 지킴','지면 재산 ↓'],fn:()=>{if(chance(.3+P.st.know/160)){fx({fame:4});say('사또가 그대의 손을 들어 주었다. 재산을 지켰다.','big');}else{P.wealth*=.6;say('송사에서 졌다. 재산의 상당 부분을 내주었다.','big');}}},
    {t:'문중 어른께 호소한다',sub:'평판이 중요하다',p:clamp(.3+P.st.fame/150),tags:['평판에 달림'],fn:()=>{if(chance(.3+P.st.fame/150)){say('문중 어른들이 시동생을 꾸짖었다.','big');}else{P.wealth*=.8;say('문중도 시동생 편을 들었다. 땅 몇 마지기를 내주었다.');}}},
    {t:'다툼이 싫어 나눠 준다',p:null,tags:['재산 ↓','평판 조금 ↑'],fn:()=>{P.wealth*=.75;fx({fame:2,worry:-3});say('재산을 나눠 주고 다툼을 끝냈다.');}}]})},
  {id:'matchmaker',c:k=>k==='S'&&!P.flags.jeongnyeo,f:()=>({title:'중매쟁이의 발걸음',text:'중매쟁이가 문턱이 닳도록 드나들며, 젊은 나이에 홀로 늙기 아깝다고 재가를 권한다.',opts:[
    {t:'단호히 내친다',p:null,tags:['평판 ↑'],fn:()=>{fx({fame:4});say('다시는 그런 말을 꺼내지 말라며 중매쟁이를 내쳤다.');}},
    {t:'수절을 그만두고 재가를 생각한다',p:null,tags:['다시 혼인할 수 있음','평판 크게 ↓'],fn:()=>{P.flags.sujeol=null;P.flags.noRemarry=0;fx({fame:-10});say('수절을 그만두기로 하였다. 고을에 수군거림이 일었다.','big');ev('note','수절을 그만두었다');}}]})},
  {id:'yeolvisit',c:k=>k==='S'&&P.flags.jeongnyeo,f:()=>({title:'열녀를 찾아온 여인들',text:'열녀문 소문을 듣고 고을 여인들이 하나둘 찾아와 저마다의 속사정을 털어놓는다.',opts:[
    {t:'귀 기울여 들어 주고 다독인다',p:null,tags:['평판 ↑','마음고생 ↓'],fn:()=>{fx({fame:ri(4,8),worry:-6});say('여인들이 그대를 어머니처럼 따랐다.','big');}},
    {t:'수절의 도리를 엄히 가르친다',p:null,tags:['평판 ↑','원망도 삼'],fn:()=>{fx({fame:5});say('그대의 가르침이 고을에 퍼졌다. 다만 뒤에서 야박하다는 말도 돌았다.');}},
    {t:'문을 닫고 조용히 지낸다',p:null,safe:true,tags:[],fn:()=>{say('찾아오는 이들을 정중히 돌려보냈다.');}}]})},
  {id:'yeolgift',c:k=>k==='S'&&P.flags.jeongnyeo&&!P.flags.yeolGift,f:()=>{P.flags.yeolGift=1;return {title:'나라의 하사',text:'열녀의 집안이라 하여 나라에서 부역을 면해 주고 쌀과 베를 내렸다.',opts:[
    {t:'하사품을 굶는 이웃과 나눈다',p:null,tags:['평판 크게 ↑'],fn:()=>{fx({fame:10});say('하사받은 쌀을 이웃과 나누었다.','big');}},
    {t:'집안 살림에 보탠다',p:null,tags:['재산 ↑'],fn:()=>{fx({wealth:soloU()*15});say('하사품으로 살림이 넉넉해졌다.');}},
    {t:'사당에 바쳐 제사에 쓴다',p:null,tags:['평판 ↑'],fn:()=>{fx({fame:5,worry:-4});say('하사품을 사당에 올려 세상을 떠난 이의 제사를 정성껏 모셨다.');}}]};}},
  {id:'gye',c:k=>P.female,f:()=>({title:'동네 계 모임',text:'동네 여인들이 돈을 모아 차례로 목돈을 타는 계를 만들자고 한다.',opts:[
    {t:'계에 든다',p:.75,tags:['목돈이 생길 수 있음','계주가 달아날 수 있음'],fn:()=>{if(chance(.75)){fx({wealth:soloU()*ri(6,12),worry:-3});say('차례가 돌아와 목돈을 탔다. 여인들과도 가까워졌다.','big');}else{fx({wealth:-soloU()*6,worry:8});say('계주가 곗돈을 들고 달아났다!','big');}}},
    {t:'곗돈 장부를 맡는다',sub:'학식이 중요하다',p:clamp(.4+P.st.know/200),tags:['평판 ↑'],fn:()=>{if(chance(.4+P.st.know/200)){fx({fame:6});say('장부를 깔끔히 맡아 동네의 믿음을 얻었다.');}else{fx({fame:-4});say('셈이 어긋나 의심을 받았다.');}}},
    {t:'들지 않는다',p:null,safe:true,tags:[],fn:()=>{say('계에 들지 않았다.');}}]})},
  {id:'temple',c:k=>!P.job||!['monk','official','military','king','queen','concubine'].includes(P.job.k),f:()=>({title:'산사의 불공',text:'마음이 허한 날 산사에 올라 불공을 드렸다. 노승이 그대를 한참 바라보더니, 속세의 인연이 다했으면 머리를 깎는 것도 길이라고 한다.',opts:[
    {t:'불공만 드리고 내려온다',p:null,safe:true,tags:['마음고생 ↓'],fn:()=>{fx({worry:-8});say('향 내음 속에서 마음이 조금 가라앉았다.');}},
    {t:'시주를 넉넉히 한다',p:null,tags:['재산 ↓','평판 ↑'],fn:()=>{fx({wealth:-soloU()*5,fame:3,worry:-5});say('넉넉히 시주하였다. 절에 그대의 이름이 새겨졌다.');}},
    {t:'머리를 깎고 출가한다',p:null,tags:['승려가 됨','혼인 못 함'],fn:()=>{P.flags.noRemarry=1;P.home='산사';setJob('monk',0);say(`머리를 깎고 ${P.female?'비구니':'승려'}가 되었다.`,'big');ev('job','출가하였다');}}]})},
  {id:'teach',c:k=>P.age>=25,f:()=>({title:'마을 아이들',text:P.female?'이웃 아낙들이 딸들에게 바느질과 언문을 가르쳐 달라고 부탁한다.':'이웃들이 아이들에게 글을 좀 가르쳐 달라고 부탁한다.',opts:[
    {t:'기꺼이 가르친다',p:null,tags:['평판 ↑',P.female?'재주 ↑':'학식 ↑'],fn:()=>{fx(P.female?{fame:5,art:2}:{fame:5,know:2});say('아이들이 그대를 스승처럼 따랐다.','big');}},
    {t:'삯을 받고 가르친다',p:null,tags:['재산 ↑'],fn:()=>{fx({wealth:soloU()*4,fame:1});say('조금씩 삯을 받으며 아이들을 가르쳤다.');}},
    {t:'사양한다',p:null,safe:true,tags:[],fn:()=>{say('정중히 사양하였다.');}}]})},
  {id:'trade',c:k=>!P.job||['housewife','lady','sosil'].includes(P.job.k),f:()=>({title:'먹고살 길',text:'홀로 살림을 꾸리려니 손 놓고 있을 수만은 없다. 이웃이 장사를 해 보라고 권한다.',opts:[
    {t:P.female?'주막을 연다':'장터에 좌판을 편다',p:null,tags:['직업을 얻음'],fn:()=>{if(P.female)setJob('jumo',0);else setJob('merchant',0);say(P.female?'길목에 작은 주막을 열었다.':'장터에 좌판을 폈다.','big');ev('job',P.female?'주막을 열었다':'장사를 시작하였다');}},
    {t:P.female?'방물 보따리를 진다':'품을 판다',p:null,tags:['직업을 얻음'],fn:()=>{if(P.female)setJob('bangmul',0);else setJob('farmer',0);say(P.female?'방물 보따리를 이고 이 집 저 집 다니기 시작했다.':'남의 논밭에 품을 팔았다.','big');}},
    {t:'모아 둔 것으로 버틴다',p:null,safe:true,tags:[],fn:()=>{say('아껴 쓰며 버티기로 하였다.');}}]})},
  {id:'nephew',c:k=>P.age>=28&&!P.kids.some(x=>x.alive&&!x.away),f:()=>({title:'형제의 아이',text:'형제가 살림이 어려워 아이 하나를 그대에게 맡기고 싶어 한다.',opts:[
    {t:'아이를 거둔다',p:null,tags:['양자·양녀'],fn:()=>adoptScene(true)},
    {t:'쌀만 보내 준다',p:null,tags:['재산 ↓','평판 ↑'],fn:()=>{fx({wealth:-soloU()*3,fame:2});say('아이 대신 쌀을 보냈다.');}},
    {t:'거절한다',p:null,safe:true,tags:[],fn:()=>{say('형편이 안 된다며 거절하였다.');}}]})},
  {id:'oldsingle',c:k=>k==='N'&&P.age>=(P.female?22:28)&&canRemarry(),f:()=>({title:P.female?'노처녀 소리':'노총각 소리',text:`${P.female?'혼기를 놓친 노처녀':'장가 못 간 노총각'}이라는 수군거림이 들린다. 집안 어른들이 중매를 서겠다고 나선다.`,opts:[
    {t:'중매를 받아들인다',p:null,tags:['혼처를 찾음'],fn:()=>matchScene(true)},
    {t:'홀로 살겠다고 못 박는다',p:null,tags:['마음고생 ↓','평판 조금 ↓'],fn:()=>{P.flags.soloVow=1;fx({worry:-6,fame:-2});say('혼인하지 않고 내 뜻대로 살겠다고 하였다.','big');}}]})},
  {id:'travel',c:k=>P.age>=20&&P.age<=60,f:()=>({title:'유람',text:'벗이 금강산 유람을 함께 가자고 한다. 매인 데 없는 몸이니 떠나 볼 만하다.',opts:[
    {t:'짐을 꾸려 떠난다',p:null,tags:['재산 ↓','건강·재주 ↑','평판 ↑'],fn:()=>{fx({wealth:-soloU()*5,health:4,art:3,fame:3,worry:-8});say('금강산 일만이천봉을 두루 보고 돌아왔다. 그때 지은 시가 사람들 입에 오르내렸다.','big');ev('note','금강산을 유람하였다');}},
    {t:'가까운 절과 계곡만 둘러본다',p:null,tags:['마음고생 ↓'],fn:()=>{fx({worry:-4,health:2});say('가까운 계곡에서 며칠 쉬다 왔다.');}},
    {t:'집에 머문다',p:null,safe:true,tags:[],fn:()=>{say('집에 머물렀다.');}}]})},
  {id:'house',c:k=>k!=='N'||P.age>=30,f:()=>({title:'홀로 살 집',text:'홀로 살기에 집이 너무 크고 쓸쓸하다. 집을 줄이거나 옮길까 싶다.',opts:[
    {t:'작은 집으로 옮기고 차액을 모은다',p:null,tags:['재산 ↑'],fn:()=>{fx({wealth:soloU()*8});P.home=R(['마을 어귀의 작은 초가','개울가 오두막','읍내 골목의 작은 집']);say(`${euro(P.home)} 옮겼다.`);}},
    {t:'방을 세놓는다',p:null,tags:['재산 ↑','시끄러움'],fn:()=>{fx({wealth:soloU()*4});say('빈방을 길손에게 세놓았다.');}},
    {t:'정든 집을 지킨다',p:null,safe:true,tags:[],fn:()=>{say('정든 집을 지키기로 하였다.');}}]})},
  {id:'oldage',c:k=>P.age>=45,f:()=>({title:'홀로 맞는 노년',text:'머리에 서리가 내렸다. 홀로 늙어 가는 날들을 어떻게 꾸릴지 생각한다.',opts:[
    {t:'논밭을 사 두어 노후를 대비한다',p:null,tags:['재산이 땅으로'],fn:()=>{fx({wealth:-soloU()*5});P.flags.oldLand=1;say('논밭 몇 마지기를 사 두었다. 해마다 소작료가 들어왔다.');}},
    {t:'재산을 고을에 내놓는다',p:null,tags:['평판 크게 ↑','재산 ↓'],fn:()=>{const g=P.wealth*.3;P.wealth-=g;fx({fame:12});say('모은 재산을 고을에 내놓았다. 사람들이 그대의 이름으로 비를 세웠다.','big');ev('rise','고을에 재산을 내놓았다');}},
    {t:'친척에게 의지한다',p:null,tags:['마음고생 ↓'],fn:()=>{fx({worry:-5});say('친척들이 그대를 돌보겠다고 하였다.');}}]})},
  {id:'stigma',c:k=>k==='D',f:()=>({title:'헤어진 몸',text:`${P.female?'소박맞은 여인':'아내를 내친 사내'}이라며 사람들이 뒤에서 손가락질한다.`,opts:[
    {t:'꿋꿋이 고개를 든다',sub:'평판이 중요하다',p:clamp(.35+P.st.fame/150),tags:['이겨 내면 마음고생 ↓'],fn:()=>{if(chance(.35+P.st.fame/150)){fx({worry:-6,fame:3});say('당당히 사는 모습에 수군거림이 잦아들었다.');}else{fx({worry:6});say('뒷말이 끊이지 않았다.');}}},
    {t:'낯선 고을로 떠나 새로 시작한다',p:null,tags:['평판 초기화에 가까움','재산 ↓'],fn:()=>{fx({wealth:-soloU()*4,worry:-5});P.fame0=P.st.fame;P.st.fame=Math.max(P.st.fame,30);P.home=R(['낯선 고을의 셋집','포구 마을의 작은 집','산골 마을의 초가']);say(`${euro(P.home)} 옮겨 새로 시작하였다.`,'big');}}]})},
  {id:'exnews',c:k=>k==='D'&&Object.values(P.people).some(x=>x.kind==='ex'&&x.alive),f:()=>{const x=Object.values(P.people).find(x=>x.kind==='ex'&&x.alive);return {title:'헤어진 이의 소식',text:`헤어진 ${iga(callOf(x))} 몹시 어렵게 산다는 소식이 들려왔다.`,opts:[
    {t:'몰래 쌀과 돈을 보낸다',p:null,tags:['재산 ↓','평판 ↑'],fn:()=>{fx({wealth:-soloU()*4,fame:3});x.h=Math.min(100,(x.h||30)+10);say('이름을 숨기고 쌀과 돈을 보냈다.');}},
    {t:'찾아가 만난다',p:null,tags:['다시 이어질 수도'],fn:()=>{x.h=Math.min(100,(x.h||30)+20);if(x.h>=60&&chance(.5)){x.kind='love';x.status='crush';say(`${gwawa(callOf(x))} 오래 이야기를 나누었다. 마음에 다시 불씨가 일었다.`,'big');}else say(`${gwawa(callOf(x))} 서먹하게 인사만 나누었다.`);}},
    {t:'모른 척한다',p:null,safe:true,tags:[],fn:()=>{say('모른 척하였다.');}}]};}},
  {id:'widower',c:k=>!P.female&&(k==='W'||k==='D'),f:()=>({title:'홀아비 살림',text:'홀아비 살림이 엉망이다. 옷은 해지고 부엌은 썰렁하다.',opts:[
    {t:'침모와 찬모를 들인다',p:null,tags:['재산 ↓'],fn:()=>{fx({wealth:-soloU()*4,health:3});say('일손을 들여 살림이 제자리를 찾았다.');}},
    {t:'손수 해 본다',p:null,tags:['재주 ↑','건강 ↓'],fn:()=>{fx({art:2,health:-3});say('서툰 솜씨로 밥을 짓고 바느질을 하였다.');}},
    {t:'새 아내를 맞으려 중매를 넣는다',p:null,tags:['새 인연'],fn:()=>{if(canRemarry())return matchScene(true);say('아직은 다시 장가들 때가 아니라는 말을 들었다.');}}]})},
  {id:'lonely',c:k=>true,f:()=>({title:'긴 밤',text:'홀로 맞는 밤이 유난히 길다.',opts:[
    {t:'등잔 아래 글과 시를 짓는다',p:null,tags:['학식·재주 ↑','마음고생 ↓'],fn:()=>{fx({know:2,art:2,worry:-5});say('긴 밤을 글로 채웠다.');}},
    {t:'술로 달랜다',p:null,tags:['마음고생 ↓','건강 ↓'],fn:()=>{fx({worry:-7,health:-5});say('술잔을 기울이며 밤을 보냈다.');}},
    {t:'길쌈을 하며 밤을 새운다',p:null,tags:['재산 ↑'],fn:()=>{fx({wealth:soloU()*3});say('밤새 베를 짰다.');}}]})},
  {id:'neighbor',c:k=>true,f:()=>({title:'이웃의 억울한 일',text:'옆집 사람이 빚을 갚지 못했다며 양반 댁 머슴들에게 끌려가고 있다.',opts:[
    {t:'나서서 사정을 말한다',sub:'평판이 중요하다',p:clamp(.3+P.st.fame/140),tags:['성공하면 평판 ↑'],fn:()=>{if(chance(.3+P.st.fame/140)){fx({fame:7});say('그대의 말에 머슴들이 물러갔다.','big');}else{fx({fame:-2,worry:5});say('도리어 봉변을 당했다.');}}},
    {t:'빚을 대신 갚아 준다',p:null,tags:['재산 ↓','평판 크게 ↑'],fn:()=>{fx({wealth:-soloU()*6,fame:9});say('빚을 대신 갚아 주었다. 이웃이 눈물로 고마워했다.','big');}},
    {t:'모른 척한다',p:null,safe:true,tags:[],fn:()=>{say('문을 닫아걸었다.');}}]})},
  {id:'thief',c:k=>true,f:()=>({title:'한밤의 도둑',text:'홀로 사는 집이라 얕보았는지, 한밤중 도둑이 담을 넘었다.',opts:[
    {t:'몽둥이를 들고 쫓는다',sub:'무예가 중요하다',p:clamp(.3+P.st.brave/140),tags:['성공하면 평판 ↑','다칠 수 있음'],fn:()=>{if(chance(.3+P.st.brave/140)){fx({fame:4});say('도둑을 쫓아냈다. 이튿날 동네에 그대가 겁 없다는 소문이 났다.');}else{fx({health:-ri(5,12),wealth:-soloU()*3});say('도둑에게 떠밀려 다치고 세간도 털렸다.');}}},
    {t:'소리쳐 이웃을 부른다',p:.7,tags:[],fn:()=>{if(chance(.7))say('이웃들이 달려와 도둑이 달아났다.');else{fx({wealth:-soloU()*3});say('이웃이 오기 전에 도둑이 세간을 챙겨 달아났다.');}}},
    {t:'숨죽이고 숨는다',p:null,tags:['재산 ↓'],fn:()=>{fx({wealth:-soloU()*4});say('숨어 있는 사이 도둑이 세간을 털어 갔다.');}}]})},
  {id:'ancestral',c:k=>(k==='S'||k==='W')&&['yangban','jungin'].includes(P.cls),f:()=>({title:'제사를 모시는 일',text:'세상을 떠난 이의 기일이 다가온다. 제사를 누가 모실지를 두고 문중이 말이 많다.',opts:[
    {t:'내가 정성껏 모신다',p:null,tags:['재산 ↓','평판 ↑'],fn:()=>{fx({wealth:-soloU()*3,fame:5,worry:-3});say('손수 제수를 장만해 제사를 모셨다.');}},
    {t:'양자를 들여 제사를 잇게 한다',p:null,tags:['양자'],fn:()=>adoptScene(true)},
    {t:'문중에 맡긴다',p:null,safe:true,tags:[],fn:()=>{say('제사를 문중에 맡겼다.');}}]})}
];
function soloU(){return UNIT[P.cls]||.5;}
function soloScene(){
  P.flags.soloY=P.year;const k=soloKind();const seen=P.flags.soloSeen=P.flags.soloSeen||[];
  let pool=SOLO.filter(s=>{try{return s.c(k);}catch(e){return false;}});
  let fresh=pool.filter(s=>!seen.includes(s.id));if(!fresh.length){P.flags.soloSeen=[];fresh=pool;}
  if(!fresh.length)return null;const s=R(fresh);P.flags.soloSeen.push(s.id);bookSeen('scene',s.id);
  const sc=s.f();if(!sc)return null;sc.kind='major';
  const lab={S:'수절',W:P.female?'과부살이':'홀아비살이',D:'헤어진 뒤',N:'홀몸'}[k];sc.title=`${lab} · ${sc.title}`;return sc;
}

/* ===== 홀로 사는 삶: 더 많은 사건 (간단한 틀) ===== */
/* 선택지: [글, 태그(·로 구분), 효과, 말] 또는 [글, 태그, {s:능력, ok:[효과,말], no:[효과,말]}] 효과의 w는 재산(신분 단위) */
function soloFx(e){if(!e)return;const o={};for(const k in e){if(k==='w')o.wealth=e.w*soloU();else if(k==='end'||k==='then')continue;else o[k]=e[k];}fx(o);if(e.then)return e.then();}
function SE(id,c,title,text,opts){return {id,c,t:title,f:()=>({title,text:typeof text==='function'?text():text,opts:(typeof opts==='function'?opts():opts).map(o=>{
  const [t,tg,e,m]=o;const tags=tg?tg.split('·'):[];
  if(e&&e.s){const sk=e.s;const p=clamp(.3+(P.st[sk]||40)/(e.d||160),.1,.92);
    return {t,sub:`${STATN[sk]}${bat(STATN[sk])?'이':'가'} 중요하다`,p,tags,fn:()=>{if(chance(p)){say(e.ok[1],'big');return soloFx(e.ok[0]);}say(e.no[1]);return soloFx(e.no[0]);}};}
  if(e&&e.p)return {t,p:e.p,tags,fn:()=>{if(chance(e.p)){say(e.ok[1],'big');return soloFx(e.ok[0]);}say(e.no[1]);return soloFx(e.no[0]);}};
  return {t,p:null,safe:!e||!Object.keys(e).length,tags,fn:()=>{if(m)say(m,e&&(e.fame>=6||e.end)?'big':'');return soloFx(e);}};})})};}
const F_=()=>P.female, M_=()=>!P.female, SW=k=>k==='S'||k==='W', NoJ=k=>!P.flags.jeongnyeo;
SOLO.push(
  SE('bossam',k=>P.female&&SW(k)&&P.age<=40&&!P.flags.jeongnyeo,'한밤의 보쌈','깊은 밤, 낯선 사내들이 문을 부수고 들이닥쳤다. 과부를 보쌈해 가려는 것이다.',()=>[
    ['죽기로 맞선다','다칠 수 있음·평판 ↑',{s:'brave',d:150,ok:[{fame:8},'비녀를 뽑아 들고 맞서니 사내들이 겁을 먹고 달아났다.'],no:[{health:-12,worry:10},'끌려가다 겨우 빠져나왔으나 크게 다쳤다.']}],
    ['소리쳐 이웃을 깨운다','',{p:.65,ok:[{},'이웃들이 횃불을 들고 몰려와 사내들이 달아났다.'],no:[{worry:12},'아무도 나오지 않았다. 간신히 뒷문으로 도망쳤다.']}],
    ...(!P.flags.sujeol?[['끌려간 김에 새 삶을 받아들인다','새 혼인·평판 ↓',{fame:-6,then:()=>{if(canRemarry())return matchScene(true);}},'보쌈해 간 집에서 새 삶을 받아들이기로 하였다.']]:[])]),
  SE('suitorYb',k=>P.female&&SW(k)&&P.age<=50,'수작 거는 양반','고을의 한 양반이 지나갈 때마다 수작을 건다. 수절하는 몸을 우습게 여기는 눈치다.',[
    ['면전에서 꾸짖는다','평판 ↑·원한을 살 수 있음',{s:'fame',d:140,ok:[{fame:7},'엄한 꾸짖음에 양반이 얼굴을 붉히고 물러났다.'],no:[{fame:2,worry:8},'양반이 앙심을 품고 헛소문을 퍼뜨렸다.']}],
    ['관아에 고한다','',{p:.5,ok:[{fame:5},'사또가 양반을 불러 꾸짖었다.'],no:[{worry:6},'사또는 양반 편을 들었다.']}],
    ['피해 다닌다','',{worry:4},'그 길로는 다니지 않게 되었다.']]),
  SE('simyo',k=>SW(k)&&P.year-(P.flags.widowY||P.year)<4,'무덤가 움막','세상을 떠난 이의 무덤 곁에 움막을 짓고 3년 동안 지키는 시묘살이를 할 것인가.',[
    ['3년 시묘살이를 한다','평판 크게 ↑·건강 ↓',{fame:12,health:-10,end:1},'무덤 곁 움막에서 3년을 지냈다. 효열이 고을에 자자했다.'],
    ['초하루 보름마다 성묘만 한다','평판 조금 ↑',{fame:3},'달마다 무덤을 찾아 풀을 뽑았다.'],
    ['산 사람은 살아야 한다','',{},'살림을 추스르는 데 마음을 쏟았다.']]),
  SE('letters',k=>k==='S'||k==='W','남겨진 편지',()=>`${P.female?'남편':'아내'}의 유품을 정리하다 낯선 이에게 받은 편지 꾸러미를 발견했다.`,[
    ['끝까지 읽어 본다','',{p:.5,ok:[{worry:-6},'옛 벗과 주고받은 편지였다. 몰랐던 다정함에 눈물이 났다.'],no:[{worry:12},'다른 이를 마음에 두었던 흔적이었다. 가슴이 무너졌다.']}],
    ['읽지 않고 태운다','마음고생 ↓',{worry:-3},'편지를 아궁이에 넣었다. 모르는 채로 두기로 했다.']]),
  SE('debtLeft',k=>SW(k),'남겨진 빚','빚쟁이가 찾아와 세상을 떠난 이가 진 빚 문서를 내민다.',[
    ['빚을 갚는다','재산 ↓·평판 ↑',{w:-10,fame:4},'세간을 팔아 빚을 갚았다. 사람들이 신의 있다고 했다.'],
    ['문서를 따진다','학식이 중요하다',{s:'know',ok:[{},'문서가 위조였다. 빚쟁이가 줄행랑쳤다.'],no:[{w:-12,fame:-2},'따지다 송사까지 가서 더 큰돈을 잃었다.']}],
    ['조금씩 나눠 갚겠다고 사정한다','',{w:-5,worry:5},'몇 해에 걸쳐 나눠 갚기로 하였다.']]),
  SE('yeolbio',k=>k==='S'&&P.flags.jeongnyeo,'열녀전','한 선비가 그대의 이야기를 열녀전으로 지어 남기고 싶다며 찾아왔다.',[
    ['허락하고 이야기를 들려준다','평판 ↑·이름이 남음',{fame:8,end:1},'그대의 이야기가 책으로 엮여 널리 읽혔다.'],
    ['부끄럽다며 사양한다','평판 조금 ↑',{fame:3},'겸손하다는 말이 더해졌다.']]),
  SE('yeolgraf',k=>k==='S'&&P.flags.jeongnyeo,'더럽혀진 정려문','누군가 밤사이 열녀문에 오물을 끼얹고 험한 말을 적어 놓았다.',[
    ['범인을 찾아낸다','학식이 중요하다',{s:'know',ok:[{fame:4},'열녀문을 시기한 이웃의 짓이었다. 사또가 매를 쳤다.'],no:[{worry:8},'끝내 범인을 찾지 못했다.']}],
    ['말없이 닦아 낸다','평판 ↑',{fame:5,worry:3},'새벽마다 말없이 정려문을 닦았다. 그 모습에 사람들이 더 고개를 숙였다.']]),
  SE('kidmatchY',k=>k==='S'&&P.flags.jeongnyeo&&P.kids.some(x=>x.alive&&!x.married&&P.year-x.born>=14),'열녀 집안의 혼처','열녀 집안의 자식이라 하여 이곳저곳에서 혼담이 밀려든다.',[
    ['가장 좋은 집안을 고른다','자식의 혼처가 좋아짐',{fame:4},'좋은 혼처를 골라 두었다. 열녀 집안이라 하여 사돈댁의 대접이 극진했다.'],
    ['아직 이르다며 미룬다','',{},'혼담을 미루었다.']]),
  SE('grandkids',k=>P.age>=45&&P.kids.some(x=>x.alive&&x.grand>0),'손주 재롱','손주들이 할미·할아비 집에 놀러 왔다.',[
    ['옛이야기를 들려준다','마음고생 ↓',{worry:-8},'손주들이 무릎에 앉아 이야기를 졸랐다.'],
    ['용돈을 쥐여 준다','재산 조금 ↓',{w:-1,worry:-5},'손주들이 신이 나 뛰어나갔다.'],
    ['글을 가르친다','학식 ↑',{know:1,worry:-4},'손주에게 천자문을 가르쳤다.']]),
  SE('parentsick',k=>P.age<=50,'위독하다는 기별',()=>P.female?'친정어머니가 위독하다는 기별이 왔다.':'고향의 늙은 어머니가 위독하다는 기별이 왔다.',[
    ['당장 달려간다','재산 ↓·평판 ↑',{w:-3,fame:3,worry:5},'밤길을 달려 임종을 지켰다.'],
    ['약값을 보낸다','재산 ↓',{w:-4},'약값을 보냈다. 끝내 얼굴을 뵙지 못했다.'],
    ['형제들에게 맡긴다','평판 ↓',{fame:-3,worry:8},'형제들에게 맡겼다. 두고두고 마음이 쓰였다.']]),
  SE('cloth',k=>P.female,'곱게 짠 베','몇 달을 들여 짠 베가 유난히 곱다. 장터에 내면 좋은 값을 받을 것 같다.',[
    ['장터에 내다 판다','재산 ↑',{w:4},'베가 좋은 값에 팔렸다.'],
    ['관아 진상에 바친다','평판 ↑',{fame:4},'진상품으로 뽑혀 칭찬을 받았다.'],
    ['수의를 지어 둔다','',{worry:-3},'훗날 입을 수의를 지어 두었다.']]),
  SE('gibang',k=>!P.female&&k!=='N'&&P.cls!=='cheonmin','기방의 불빛','벗들이 쓸쓸한 처지를 위로한다며 기방에 가자고 끌어당긴다.',[
    ['따라가 밤새 논다','재산 ↓·마음고생 ↓·평판 조금 ↓',{w:-4,worry:-8,fame:-2},'기생의 가야금 소리에 시름을 잊었다.'],
    ['한 잔만 하고 일어난다','',{worry:-3},'한 잔만 하고 먼저 일어났다.'],
    ['거절한다','평판 ↑',{fame:2},'점잖게 거절하였다.']]),
  SE('archery',k=>!P.female,'활터','동네 활터에서 편을 갈라 활쏘기 내기가 벌어졌다.',[
    ['내기에 나선다','무예가 중요하다',{s:'brave',ok:[{fame:4,w:2},'과녁 한가운데를 연달아 꿰뚫었다.'],no:[{w:-2},'화살이 빗나가 내기 돈을 잃었다.']}],
    ['구경만 한다','',{worry:-2},'구경하며 막걸리를 마셨다.']]),
  SE('gamble',k=>!P.female&&P.cls!=='royal','노름판','투전판에서 한몫 잡을 수 있다는 꾐에 넘어갈 뻔했다.',[
    ['한 판만 해 본다','재산이 운에 달림',{p:.35,ok:[{w:8},'운이 따라 큰돈을 땄다.'],no:[{w:-10,worry:8},'가진 돈을 몽땅 잃었다.']}],
    ['발을 돌린다','',{},'발을 돌렸다.']]),
  SE('widowerMatch',k=>!P.female&&k==='W'&&canRemarry(),'매파의 소개','매파가 찾아와 참한 과부 하나를 소개하겠다고 한다.',[
    ['만나 본다','재혼할 수 있음',{then:()=>matchScene(true)},''],
    ['아직은 마음이 없다','',{worry:-2},'아직은 혼자 지내겠다고 하였다.']]),
  SE('brotherHouse',k=>k==='N'&&P.age>=25,'형님 댁 더부살이','형님 댁에 얹혀 지내자니 형수의 눈치가 보인다.',[
    ['집안일을 도맡아 거든다','평판 ↑·건강 조금 ↓',{fame:3,health:-2},'부지런히 거드니 형수의 낯빛이 풀렸다.'],
    ['나가서 따로 산다','재산 ↓',{w:-4,then:()=>{P.home=R(['작은 초가','셋집 한 칸','마을 끝 오두막']);}},'짐을 싸서 따로 나왔다.'],
    ['모른 척 지낸다','마음고생 ↑',{worry:6},'눈치를 모른 척하였다.']]),
  SE('fortune',k=>k==='N'||k==='D','점집','답답한 마음에 이름난 점쟁이를 찾아가 앞날의 인연을 물었다.',[
    ['점괘를 듣는다','',{p:.5,ok:[{worry:-6},'늦게 귀한 인연이 온다는 점괘가 나왔다.'],no:[{worry:6},'외로운 팔자라는 점괘가 나왔다.']}],
    ['부적을 산다','재산 조금 ↓',{w:-1,worry:-3},'부적을 베개 밑에 넣었다.']]),
  SE('rumorSingle',k=>P.female&&k==='N','처녀의 뒷소문','혼인하지 않은 처녀라고 별의별 뒷소문이 돈다.',[
    ['소문의 출처를 찾아 따진다','',{p:.5,ok:[{fame:4},'소문을 낸 이가 고개를 숙였다.'],no:[{fame:-3},'따질수록 소문이 커졌다.']}],
    ['더 반듯하게 산다','평판 ↑',{fame:3,worry:3},'흠잡을 데 없이 지내니 소문이 잦아들었다.']]),
  SE('festival',k=>P.age<=45,'단옷날','단옷날 고을에 그네뛰기와 씨름판이 벌어졌다.',()=>[
    [P.female?'그네를 뛴다':'씨름판에 나선다','',{s:P.female?'look':'brave',ok:[{fame:5,look:1},'구경꾼들의 탄성이 쏟아졌다.'],no:[{fame:-1},'헛디뎌 웃음거리가 되었다.']}],
    ['창포물에 머리를 감고 구경한다','매력 ↑',{look:2,worry:-4},'창포 향이 머리카락에 배었다.']]),
  SE('fire',k=>true,'불난 집','이웃집에서 시작된 불길이 그대의 집 처마까지 옮겨붙었다.',[
    ['세간을 끌어낸다','무예가 중요하다',{s:'brave',ok:[{w:-2},'귀한 세간은 건졌다.'],no:[{w:-8,health:-6},'연기에 쓰러질 뻔했고 세간도 거의 탔다.']}],
    ['몸만 피한다','재산 ↓',{w:-6},'목숨만 건졌다. 집을 새로 지어야 했다.']]),
  SE('flood',k=>true,'장마','큰 장마가 져 개울물이 마당까지 차올랐다.',[
    ['둑을 쌓으러 나선다','평판 ↑·건강 ↓',{fame:4,health:-4},'동네 사람들과 밤새 둑을 쌓았다.'],
    ['높은 곳으로 피한다','재산 ↓',{w:-3},'세간 일부가 떠내려갔다.']]),
  SE('plague',k=>true,'역병','고을에 역병이 돌기 시작했다.',[
    ['문을 닫고 집에 머문다','',{p:.8,ok:[{},'무사히 역병을 넘겼다.'],no:[{health:-15},'끝내 병에 걸려 한참을 앓았다.']}],
    ['병자들을 돌본다','평판 크게 ↑·건강 위험',{p:.6,ok:[{fame:10},'병자들을 돌보고도 무사했다. 사람들이 은인이라 불렀다.'],no:[{fame:8,health:-20},'병자를 돌보다 병을 옮아 크게 앓았다.']}],
    ['산속 친척 집으로 피한다','재산 조금 ↓',{w:-2},'역병이 잦아들 때까지 산속에 머물렀다.']]),
  SE('pet',k=>true,'떠돌이 강아지','문간에 떠돌이 강아지 한 마리가 며칠째 머문다.',[
    ['거두어 기른다','마음고생 ↓',{worry:-8,then:()=>{P.flags.pet=R(['복실이','누렁이','바둑이','흰둥이']);}},'강아지를 거두었다. 이제 집이 덜 적적했다.'],
    ['밥만 챙겨 준다','',{worry:-2},'밥을 챙겨 주었다.']]),
  SE('garden',k=>true,'텃밭','집 뒤 빈터에 텃밭을 일구어 볼까 한다.',[
    ['상추와 고추를 심는다','건강 ↑',{health:4,w:1},'손수 기른 채소로 밥상이 풍성해졌다.'],
    ['약초를 심는다','학식 ↑',{know:1,w:2},'약초를 길러 이웃에게 나눴다.'],
    ['꽃을 심는다','마음고생 ↓',{worry:-6,look:1},'봄마다 마당에 꽃이 흐드러졌다.']]),
  SE('novel',k=>P.cls!=='cheonmin','언문 소설','세책방에서 빌려 온 언문 소설에 푹 빠졌다.',[
    ['밤새 읽는다','학식 ↑·건강 조금 ↓',{know:2,health:-2,worry:-5},'주인공의 사랑 이야기에 밤을 새웠다.'],
    ['직접 이야기를 지어 본다','재주 ↑',{art:3},'내 이야기를 언문으로 써 내려갔다.']]),
  SE('orphan',k=>P.age>=25,'찾아온 아이','부모를 잃은 아이가 배고프다며 문을 두드렸다.',[
    ['거두어 기른다','양자·양녀',{then:()=>adoptScene(true)},''],
    ['밥을 먹이고 일자리를 알아봐 준다','평판 ↑',{fame:4,w:-1},'아이를 이웃 공방에 일꾼으로 보냈다.'],
    ['밥만 먹여 보낸다','',{fame:1},'밥을 한 그릇 먹여 보냈다.']]),
  SE('traveler',k=>true,'쓰러진 나그네','날이 저문 길가에 나그네가 쓰러져 있다.',[
    ['집에 들여 재워 준다','',{p:.6,ok:[{fame:3,w:5},'나그네는 이름난 상인이었다. 떠나며 넉넉히 사례하였다.'],no:[{w:-4},'새벽에 나그네가 세간을 챙겨 사라졌다.']}],
    ['죽을 쑤어 주고 보낸다','평판 조금 ↑',{fame:2},'따뜻한 죽 한 그릇을 먹여 보냈다.'],
    ['지나친다','',{},'걸음을 재촉했다.']]),
  SE('oldfriend',k=>P.age>=25,'옛 벗','어릴 적 벗이 오랜만에 찾아와 밤새 이야기를 나누었다. 벗도 살림이 어렵다고 한다.',[
    ['돈을 빌려준다','재산 ↓·돌려받을 수도',{p:.5,ok:[{w:3,worry:-4},'몇 해 뒤 벗이 이자까지 쳐서 갚았다.'],no:[{w:-5},'벗은 끝내 갚지 못했다. 그래도 벗을 잃지는 않았다.']}],
    ['위로만 한다','마음고생 ↓',{worry:-5},'함께 울고 웃으며 밤을 지새웠다.']]),
  SE('wedhelp',k=>true,'이웃 혼례','이웃집 혼례에 일손이 모자라 그대를 부른다.',[
    ['잔치 음식을 도맡는다','재주 ↑·평판 ↑',{art:2,fame:3},'그대가 만든 음식이 잔치에서 가장 칭찬받았다.'],
    ['부조만 한다','재산 조금 ↓',{w:-1},'부조를 보냈다.'],
    ['쓸쓸해 가지 않는다','마음고생 ↑',{worry:4},'남의 잔치가 오히려 쓸쓸해 가지 않았다.']]),
  SE('herbs',k=>true,'봄 산나물','봄이 되어 산에 나물과 약초가 지천이다.',[
    ['깊은 산까지 캐러 간다','건강이 중요하다',{s:'health',ok:[{w:3},'귀한 약초를 캐어 좋은 값에 팔았다.'],no:[{health:-6},'발을 헛디뎌 다쳤다.']}],
    ['가까운 데서 나물만 뜯는다','건강 조금 ↑',{health:2},'나물 반찬이 밥상에 올랐다.']]),
  SE('gut',k=>SW(k)&&P.cls!=='yangban','넋 달래는 굿',()=>`무당이 찾아와, 세상을 떠난 ${P.female?'남편':'아내'}의 넋이 떠돌고 있으니 굿을 해 달래야 한다고 한다.`,[
    ['굿을 연다','재산 ↓·마음고생 ↓',{w:-4,worry:-10},'굿판에서 실컷 울고 나니 가슴이 조금 풀렸다.'],
    ['무당을 돌려보낸다','',{},'무당을 돌려보냈다.']]),
  SE('dream',k=>SW(k),'꿈에 온 사람',()=>`꿈에 세상을 떠난 ${P.female?'남편이':'아내가'} 나타나 무언가 말하려 했다.`,[
    ['무덤을 찾아간다','마음고생 ↓',{worry:-6},'무덤가에 앉아 오래 이야기를 했다.'],
    ['점쟁이에게 꿈을 풀어 본다','',{p:.5,ok:[{w:3,worry:-4},'재물이 들어올 꿈이라 했다. 정말 그해 뜻밖의 돈이 생겼다.'],no:[{worry:5},'흉몽이라는 말에 한동안 마음이 무거웠다.']}]]),
  SE('jokbo',k=>P.cls==='yangban'&&P.age>=35,'족보 정리','문중에서 족보를 새로 꾸민다며 그대 집안 몫의 기록과 돈을 청한다.',[
    ['넉넉히 내고 기록을 챙긴다','재산 ↓·평판 ↑',{w:-5,fame:5},'족보에 그대 집안의 이름이 번듯하게 올랐다.'],
    ['형편대로 낸다','',{w:-2},'형편대로 보탰다.']]),
  SE('witness',k=>P.age>=25,'송사의 증인','이웃 둘이 땅 경계를 두고 송사를 벌였다. 둘 다 그대에게 증인이 되어 달라 한다.',[
    ['본 대로만 말한다','평판 ↑',{fame:5},'곧은 증언으로 송사가 끝났다.'],
    ['힘 있는 쪽 편을 든다','재산 ↑·평판 ↓',{w:4,fame:-5},'힘 있는 쪽에서 사례를 받았다. 다른 쪽은 그대를 원수로 여겼다.'],
    ['아무것도 못 봤다고 한다','',{},'발을 뺐다.']]),
  SE('monkAlms',k=>true,'탁발승','탁발승이 목탁을 두드리며 시주를 청한다.',[
    ['쌀 한 되를 시주한다','평판 조금 ↑',{w:-.5,fame:1,worry:-2},'스님이 그대의 앞날을 빌어 주었다.'],
    ['스님과 이야기를 나눈다','마음고생 ↓·학식 ↑',{worry:-5,know:1},'스님의 말에 마음이 한결 가벼워졌다.']]),
  SE('market',k=>true,'장날','장날이다. 오랜만에 장 구경을 나섰다.',[
    ['고운 노리개를 산다','재산 조금 ↓·매력 ↑',{w:-1,look:2},'노리개를 달고 나니 거울 속 얼굴이 환해졌다.'],
    ['싸게 물건을 떼어 되판다','재산이 운에 달림',{p:.55,ok:[{w:3},'되판 물건이 제법 남았다.'],no:[{w:-2},'팔리지 않아 손해를 봤다.']}],
    ['국밥 한 그릇 먹고 돌아온다','',{worry:-2},'장터 국밥이 유난히 맛있었다.']]),
  SE('poemClub',k=>P.cls!=='cheonmin'&&P.age>=25,'시회','고을 선비들(또는 규방 여인들)이 시를 짓는 모임에 그대를 청했다.',[
    ['시를 지어 낸다','재주가 중요하다',{s:'art',ok:[{fame:5,art:1},'그대의 시가 장원으로 뽑혔다.'],no:[{fame:-1},'시가 밋밋하다는 평을 들었다.']}],
    ['듣기만 한다','학식 ↑',{know:1},'남의 시를 들으며 배웠다.']]),
  SE('aging',k=>P.age>=55,'아픈 무릎','무릎이 시큰거리고 눈이 침침해졌다.',[
    ['침을 맞으러 다닌다','재산 ↓·건강 ↑',{w:-2,health:5},'의원의 침을 맞으니 한결 나아졌다.'],
    ['참고 지낸다','건강 ↓',{health:-4},'늙으면 다 그런 거라며 참았다.']]),
  SE('willWrite',k=>P.age>=55,'재산을 나눌 일','기운이 예전 같지 않다. 남은 재산을 누구에게 물려줄지 정해 두어야 한다.',[
    ['자식·조카들에게 고루 나눈다','평판 ↑',{fame:3,worry:-4},'분재기를 써서 고루 나누어 두었다.'],
    ['가장 정성스러운 이에게 몰아준다','',{worry:-2},'곁을 지킨 이에게 몰아주기로 하였다.'],
    ['절과 서원에 내놓는다','평판 ↑',{fame:6},'재산의 일부를 절과 서원에 내놓기로 하였다.']])
);

/* ===== 자식·벗과 얽힌 일들 ===== */
/* SK(id, 대상 고르기, 제목, 글(대상), 선택지(대상)) */
function SK(id,pick,title,text,opts){return {id,pick,title,mk:(x)=>{const base=SE(id,()=>true,title,()=>text(x),()=>opts(x));return base.f();}};}
const kAgeOf=k=>P.year-k.born;
const kidPick=(lo,hi,f)=>()=>{const c=P.kids.filter(k=>k.alive&&!k.estranged&&!k.away&&kAgeOf(k)>=lo&&kAgeOf(k)<=hi&&(!f||f(k)));return c.length?R(c):null;};
const frPick=f=>()=>{const c=peopleOf('friend').filter(x=>x.alive&&(!f||f(x)));return c.length?R(c):null;};
const KW=k=>k.female?'딸':'아들';
const kst=(k,s,v)=>{k.st=k.st||{};k.st[s]=clamp((k.st[s]||35)+v,0,100);};
const FAM=[
  SK('kfight',kidPick(6,13),'서당 싸움',k=>`${KW(k)} ${iga(k.name)} 서당에서 싸우고 코피를 흘리며 돌아왔다.`,k=>[
    ['상대 집에 따지러 간다','',{p:.5,ok:[{fame:2},'상대 부모가 사과하였다.'],no:[{fame:-3},'도리어 그쪽 아이가 더 다쳤다며 시끄러워졌다.']}],
    ['종아리를 친다','자식 학식 ↑·정 ↓',{then:()=>{kst(k,'know',4);}},`${eulreul(k.name)} 엄하게 다스렸다.`],
    ['다독이며 사정을 듣는다','마음고생 ↓',{worry:-3,then:()=>{kst(k,'look',2);}},`${k.name}${bat(k.name)?'이':'가'} 울먹이며 사정을 털어놓았다.`]]),
  SK('ksick',kidPick(1,12),'아이의 열병',k=>`${KW(k)} ${iga(k.name)} 온몸이 불덩이처럼 끓는다. 마마(천연두)일지도 모른다.`,k=>[
    ['의원을 부른다','재산 ↓',{w:-3,then:()=>{kst(k,'health',chance(.8)?2:-10);}},'의원이 밤새 약을 달였다. 아이가 고비를 넘겼다.'],
    ['마마 배송굿을 한다','재산 조금 ↓',{w:-2,then:()=>{kst(k,'health',chance(.6)?0:-12);}},'무당이 와서 손님(마마)을 달래는 굿을 하였다.'],
    ['밤새 곁을 지킨다','건강 ↓',{health:-4,then:()=>{kst(k,'health',chance(.65)?0:-12);}},'뜬눈으로 밤을 새우며 물수건을 갈았다.']]),
  SK('ktalent',kidPick(7,15),'아이의 재주',k=>`${iga(k.name)} ${R(['어깨 너머로 배운 그림이 제법이다','장터 소리꾼 흉내를 기막히게 낸다','막대기 칼싸움으로 동네 아이들을 다 이긴다','셈이 빨라 어른들이 놀란다'])}.`,k=>[
    ['스승을 붙여 키운다','재산 ↓·자식 재주 ↑',{w:-4,then:()=>{kst(k,'art',8);kst(k,'brave',4);}},`${k.name}에게 스승을 붙여 주었다.`],
    ['쓸데없는 짓이라 막는다','자식 학식 ↑',{then:()=>{kst(k,'know',3);}},'글공부나 하라며 막았다.'],
    ['칭찬만 해 준다','',{then:()=>{kst(k,'art',3);}},'아이가 신이 나서 더 열심히 하였다.']]),
  SK('klie',kidPick(7,14),'아이의 거짓말',k=>`${iga(k.name)} 이웃집 감을 몰래 따 먹고 시치미를 뗀다.`,k=>[
    ['데리고 가서 사과시킨다','평판 ↑',{fame:3},`${k.name}${bat(k.name)?'이':'가'} 고개를 숙이고 사과하였다.`],
    ['감값을 물어 준다','재산 조금 ↓',{w:-.5},'조용히 감값을 물어 주었다.'],
    ['모른 척한다','평판 ↓',{fame:-2},'이웃의 눈총을 받았다.']]),
  SK('klove',kidPick(15,22,k=>!k.married),'자식의 연정',k=>`${KW(k)} ${iga(k.name)} 이웃 ${k.female?'총각':'처녀'}에게 마음을 빼앗겼다. 혼처는 따로 알아보던 참이다.`,k=>[
    ['둘의 마음을 허락한다','자식 마음 ↑·집안 혼처 포기',{worry:-3,then:()=>{k.loveMatch=1;}},`${k.name}${bat(k.name)?'이':'가'} 기뻐 눈물을 흘렸다.`],
    ['집안 혼처를 따르라 한다','',{then:()=>{k.loveMatch=0;}},`${k.name}${bat(k.name)?'은':'는'} 말없이 고개를 떨구었다.`],
    ['상대 집안을 먼저 알아본다','',{p:.5,ok:[{},'상대도 착실한 집안이었다. 마음이 놓였다.'],no:[{worry:4},'상대 집안이 노름빚에 쪼들린다는 소문이 들렸다.']}]]),
  SK('krun',kidPick(13,19),'집 나간 자식',k=>`${iga(k.name)} "이 집에서는 못 살겠다"는 말을 남기고 집을 나갔다.`,k=>[
    ['찾아 나선다','건강 ↓',{health:-3,p:.7,ok:[{worry:-4},`사흘 만에 장터 주막에서 ${eulreul(k.name)} 찾아 데려왔다.`],no:[{worry:12},`끝내 찾지 못했다. 한 달 뒤에야 ${iga(k.name)} 제 발로 돌아왔다.`]}],
    ['돌아올 때까지 기다린다','마음고생 ↑',{worry:8},`보름 만에 ${iga(k.name)} 꾀죄죄한 몰골로 돌아왔다.`]]),
  SK('kbadfr',kidPick(14,22,k=>!k.female),'나쁜 벗',k=>`아들 ${iga(k.name)} 투전꾼들과 어울려 다닌다는 소문이 들린다.`,k=>[
    ['산사에 보내 글을 읽힌다','재산 ↓·자식 학식 ↑',{w:-3,then:()=>{kst(k,'know',6);}},`${eulreul(k.name)} 산사에 보냈다.`],
    ['일을 가르쳐 바쁘게 한다','자식 건강 ↑',{then:()=>{kst(k,'health',4);}},'일거리를 맡겨 바쁘게 하였다.'],
    ['한 번은 그럴 수 있다며 넘긴다','',{p:.5,ok:[{},'곧 제자리로 돌아왔다.'],no:[{w:-5,worry:6},'노름빚을 지고 들어왔다.']}]]),
  SK('kcapital',kidPick(20,45),'자식의 밑천',k=>`${KW(k)} ${iga(k.name)} 장사를 해 보겠다며 밑천을 대 달라고 한다.`,k=>[
    ['넉넉히 대 준다','재산 ↓·잘되면 갚음',{w:-8,p:.55,ok:[{w:12},`${k.name}의 장사가 잘되어 이자까지 쳐서 갚았다.`],no:[{worry:6},`${k.name}의 장사가 망했다. 밑천을 날렸다.`]}],
    ['조금만 보탠다','재산 조금 ↓',{w:-3},'조금 보태 주었다.'],
    ['네 힘으로 하라며 거절한다','',{},`${k.name}${bat(k.name)?'이':'가'} 서운해하였다.`]]),
  SK('kinlaw',kidPick(18,50,k=>k.married&&!k.female),'며느리와의 갈등',k=>`아들 ${k.name}의 아내가 살림 문제로 그대와 부딪쳤다. 집안 공기가 냉랭하다.`,k=>[
    ['살림 열쇠를 넘겨준다','마음고생 ↓·평판 ↑',{worry:-5,fame:2},'곳간 열쇠를 며느리에게 넘겨주었다.'],
    ['법도를 엄히 가르친다','',{p:.5,ok:[{fame:2},'며느리가 고개를 숙였다.'],no:[{worry:8},'며느리가 친정으로 가 버렸다.']}],
    ['아들에게 맡긴다','',{worry:3},'아들이 중간에서 쩔쩔맸다.']]),
  SK('ksoninlaw',kidPick(18,50,k=>k.married&&k.female),'사위의 부탁',k=>`딸 ${k.name}의 남편이 찾아와 급히 돈을 빌려 달라 한다.`,k=>[
    ['빌려준다','재산 ↓',{w:-5,p:.6,ok:[{},'사위가 약속대로 갚았다.'],no:[{worry:6},'사위는 끝내 갚지 않았다. 딸이 미안해했다.']}],
    ['딸을 봐서 그냥 준다','재산 ↓·딸의 처지 ↑',{w:-4},'딸이 시댁에서 기를 펴게 되었다.'],
    ['거절한다','',{},'사위가 시무룩하게 돌아갔다.']]),
  SK('kfight2',kidPick(25,60,k=>k.married),'자식 내외의 다툼',k=>`${k.name} 내외가 크게 다투고 서로 헤어지겠다고 한다.`,k=>[
    ['둘을 불러 중재한다','평판이 중요하다',{s:'fame',d:140,ok:[{worry:-3},'겨우 화해시켰다.'],no:[{worry:6},'다툼은 쉽게 가라앉지 않았다.']}],
    ['자식 편을 든다','',{worry:2},'자식 편을 들어 주었다. 사돈댁과 사이가 벌어졌다.'],
    ['모른 척한다','',{},'부부 일은 부부가 푸는 것이라 하였다.']]),
  SK('kgrandname',kidPick(18,60,k=>k.married),'손주의 이름',k=>`${k.name}에게서 손주가 태어났다. 할${P.female?'미':'아비'}가 이름을 지어 달라 한다.`,k=>[
    ['돌림자를 넣어 짓는다','',{fame:1,worry:-3,then:()=>{k.grand=(k.grand||0)+1;P.grand=(P.grand||0)+1;}},'항렬에 맞춰 이름을 지어 주었다.'],
    ['복을 비는 이름을 짓는다','',{worry:-4,then:()=>{k.grand=(k.grand||0)+1;P.grand=(P.grand||0)+1;}},'오래 살라고 개똥이 같은 이름을 지어 주었다.']]),
  SK('kdebt2',kidPick(20,60),'자식의 빚',k=>`${iga(k.name)} 진 빚 때문에 빚쟁이들이 그대 집까지 몰려왔다.`,k=>[
    ['대신 갚아 준다','재산 ↓',{w:-8},'빚을 대신 갚았다.'],
    ['반만 갚고 나머지는 자식에게 맡긴다','재산 조금 ↓',{w:-4},'반을 갚아 주었다.'],
    ['스스로 갚게 한다','평판 조금 ↓',{fame:-2},`${k.name}${bat(k.name)?'이':'가'} 고생 끝에 빚을 갚았다.`]]),
  SK('kfilial',kidPick(25,70),'자식의 효도',k=>`${iga(k.name)} ${R(['비단옷 한 벌을 지어 왔다','귀한 녹용을 구해 왔다','고향 집 지붕을 기와로 바꿔 주겠다고 한다','환갑잔치를 크게 열겠다고 한다'])}.`,k=>[
    ['기쁘게 받는다','마음고생 ↓·평판 ↑',{worry:-8,fame:3},'고을 사람들이 효자 효녀를 두었다며 부러워했다.'],
    ['네 살림이나 챙기라며 사양한다','',{worry:-3},'마음만 받았다.']]),
  SK('fwed',frPick(x=>!x.married),'벗의 혼례',x=>`어릴 적 벗 ${iga(x.name)} 혼례를 올린다며 그대를 청했다.`,x=>[
    ['큰 부조를 들고 간다','재산 ↓·벗과 더 가까워짐',{w:-2,then:()=>{x.h=clamp(x.h+10);x.married=true;}},`${x.name}의 혼례에서 밤새 춤추고 놀았다.`],
    ['얼굴만 비친다','',{then:()=>{x.married=true;}},'잠깐 얼굴을 비쳤다.']]),
  SK('floan',frPick(),'벗의 부탁',x=>`벗 ${iga(x.name)} 사정이 급하다며 돈을 빌려 달라 한다.`,x=>[
    ['선뜻 빌려준다','재산 ↓',{w:-4,p:.6,ok:[{then:()=>{x.h=clamp(x.h+12);}},`${iga(x.name)} 약속대로 갚았다. 우정이 더 깊어졌다.`],no:[{then:()=>{x.h=clamp(x.h-10);}},`${iga(x.name)} 갚지 못하고 발길을 끊었다.`]}],
    ['형편이 안 된다고 거절한다','',{then:()=>{x.h=clamp(x.h-5);}},'벗이 서운한 얼굴로 돌아갔다.']]),
  SK('fquarrel',frPick(),'벗과의 다툼',x=>`사소한 오해로 벗 ${gwawa(x.name)} 크게 다투었다.`,x=>[
    ['먼저 찾아가 사과한다','',{then:()=>{x.h=clamp(x.h+8);}},`술 한 잔에 ${gwawa(x.name)} 다시 웃었다.`],
    ['벗이 먼저 오길 기다린다','',{p:.5,ok:[{then:()=>{x.h=clamp(x.h+3);}},`${iga(x.name)} 먼저 찾아왔다.`],no:[{then:()=>{x.h=clamp(x.h-15);}},`${gwawa(x.name)} 끝내 멀어졌다.`]}]]),
  SK('fjail',frPick(),'붙잡혀 간 벗',x=>`벗 ${iga(x.name)} 억울한 누명을 쓰고 관아에 끌려갔다.`,x=>[
    ['관아에 가서 증언한다','평판이 중요하다',{s:'fame',d:140,ok:[{fame:4,then:()=>{x.h=clamp(x.h+15);}},`그대의 증언으로 ${iga(x.name)} 풀려났다.`],no:[{worry:6},'증언이 받아들여지지 않았다.']}],
    ['속전을 내어 빼낸다','재산 ↓',{w:-6,then:()=>{x.h=clamp(x.h+15);}},`돈을 내어 ${eulreul(x.name)} 빼냈다.`],
    ['괜히 엮일까 몸을 사린다','',{then:()=>{x.h=clamp(x.h-15);}},'모른 척하였다.']]),
  SK('fbiz',frPick(),'벗과 동업',x=>`벗 ${iga(x.name)} 함께 장사를 벌여 보자고 한다.`,x=>[
    ['손을 잡는다','재산이 운에 달림',{p:.55,ok:[{w:8,then:()=>{x.h=clamp(x.h+8);}},'장사가 잘되어 둘 다 살림이 폈다.'],no:[{w:-6,then:()=>{x.h=clamp(x.h-8);}},'장사가 망해 서로 탓하게 되었다.']}],
    ['우정에 돈을 섞지 않는다','',{},'정중히 거절하였다.']]),
  SK('fold',frPick(),'함께 늙어 가는 벗',x=>`머리가 하얗게 센 벗 ${gwawa(x.name)} 정자에 앉아 옛이야기를 나누었다.`,x=>[
    ['막걸리를 받아 온다','마음고생 ↓',{worry:-8,then:()=>{x.h=clamp(x.h+5);}},'해가 질 때까지 웃고 떠들었다.'],
    ['둘이 함께 유람을 떠난다','재산 ↓·건강 ↑',{w:-3,health:3,worry:-6},'벗과 함께 명승지를 돌아보았다.']]),
  SK('fdeath',frPick(x=>P.age>=40),'벗의 부고',x=>`벗 ${iga(x.name)} 세상을 떠났다는 기별이 왔다.`,x=>[
    ['문상 가서 상여를 멘다','평판 ↑·마음고생 ↑',{fame:3,worry:6,then:()=>{x.alive=false;}},`${x.name}의 마지막 길을 배웅하였다.`],
    ['제문을 지어 보낸다','재주 ↑',{art:2,worry:5,then:()=>{x.alive=false;}},'눈물로 제문을 지었다.'],
    ['남은 식구들을 돌본다','재산 ↓·평판 ↑',{w:-4,fame:5,then:()=>{x.alive=false;}},`${x.name}의 남은 식구들을 거두었다.`]])
];
function famScene(){
  P.flags.famY=P.year;const seen=P.flags.famSeen=P.flags.famSeen||[];
  const cand=FAM.map(s=>[s,s.pick()]).filter(([s,x])=>x);
  if(!cand.length)return null;let fresh=cand.filter(([s])=>!seen.includes(s.id));if(!fresh.length){P.flags.famSeen=[];fresh=cand;}
  const [s,x]=R(fresh);P.flags.famSeen.push(s.id);bookSeen('scene',s.id);
  const sc=s.mk(x);sc.kind='major';sc.title=`${s.id[0]==='f'?'벗':'자식'} · ${sc.title}`;return sc;
}
/* 새 벗 */
function newFriendScene(){
  P.flags.nfY=P.year;
  return {kind:'major',title:'벗 · 새로 사귄 벗',text:R(['장터에서 우연히 말을 섞은 이와 죽이 잘 맞았다.','이웃으로 이사 온 이가 인사를 왔다. 말이 통하는 사람이다.','같은 일을 하는 이와 자주 마주치다 보니 정이 들었다.']),opts:[
    {t:'술 한잔하며 벗으로 삼는다',p:null,tags:['새 벗'],fn:()=>{const fem=chance(.75)?P.female:!P.female;const f=newPerson({kind:'friend',female:fem,cls:P.cls==='royal'?'yangban':P.cls,born:P.born+ri(-5,5),place:'이웃',h:35,t:35});say(`${gwawa(f.name)} 벗이 되었다.`,'big');}},
    {t:'인사만 나눈다',p:null,safe:true,tags:[],fn:()=>{say('인사만 나누고 지나쳤다.');}}]};
}
/* 아들의 분가 */
function bunScene(k){
  k.homeAsked=1;
  return {kind:'major',title:'자식 · 아들의 분가',text:`아들 ${iga(k.name)} 혼인하였다. 며느리를 들여 한집에 데리고 살 것인가, 살림을 내어 분가시킬 것인가.`,opts:[
    {t:'한집에 데리고 산다',p:null,tags:['대가족','며느리의 시집살이'],fn:()=>{k.home='with';fx({worry:-2});say(`${k.name} 내외와 한집에 살게 되었다.`);}},
    {t:'재산을 떼어 분가시킨다',p:null,tags:['재산 ↓','자식의 살림 ↑'],fn:()=>{k.home='apart';const g=P.wealth*.15;P.wealth-=g;say(`재산을 떼어 ${k.name} 내외의 살림을 내주었다.`);}},
    {t:'빈손으로 분가시킨다',p:null,tags:['자식이 서운해함'],fn:()=>{k.home='apart';fx({worry:2});say(`${k.name} 내외가 빈손으로 분가하였다.`);}}]};
}
/* 노년의 거처 */
function liveScene(){
  P.flags.liveDone=1;bookSeen('scene','live');
  const ad=P.kids.filter(k=>k.alive&&!k.estranged&&kAgeOf(k)>=18);
  const son=ad.filter(k=>!k.female).sort((a,b)=>a.born-b.born)[0];const dau=ad.filter(k=>k.female).sort((a,b)=>a.born-b.born)[0];
  const opts=[];
  if(son)opts.push({t:`아들 ${son.name} 내외와 한집에 산다`,p:null,tags:['마음고생 ↓','봉양을 받음'],fn:()=>{P.livesWith=son.id;son.home='with';fx({worry:-8,health:3});ev('live',`아들 ${son.name} 내외와 한집에 살며 봉양을 받았다`);say(`아들 ${son.name}의 집에서 노년을 보내게 되었다.`,'big');}});
  if(dau)opts.push({t:`딸 ${dau.name}의 집에 의탁한다`,p:null,tags:['마음고생 ↓','딸네 의탁은 흉이 되기도 함'],fn:()=>{P.livesWith=dau.id;fx({worry:-6,fame:-2});ev('live',`딸 ${dau.name}의 집에 의탁하였다`);say(`딸 ${dau.name}의 집으로 들어갔다.`,'big');}});
  opts.push({t:'자식들 가까이에 따로 산다',p:null,tags:['자유','가끔 외로움'],fn:()=>{P.livesWith=null;fx({worry:-2});ev('live','자식들 가까이에 따로 살았다');say('자식들 집 가까이에 작은 집을 얻었다.');}});
  opts.push({t:'내 집을 끝까지 지킨다',p:null,safe:true,tags:['건강 조금 ↓'],fn:()=>{P.livesWith=null;fx({health:-2});ev('live','홀로 제 집을 지켰다');say('평생 살던 집을 지키기로 하였다.');}});
  return {kind:'major',title:'자식 · 노년의 거처',text:'기력이 예전만 못하다. 남은 날을 누구와 어디서 보낼지 정해야 한다.',opts};
}
/* 도감 기록 */
function bookSeen(cat,k){const cx=Store.codex();cx[cat]=cx[cat]||{};if(!cx[cat][k]){cx[cat][k]=1;Store.saveCodex();}}

const SOLO_T={inlawcare:'시어머니의 병',rearkids:'홀로 키우는 자식',greedy:'재산을 노리는 시댁',matchmaker:'중매쟁이의 발걸음',yeolvisit:'열녀를 찾아온 여인들',yeolgift:'나라의 하사',gye:'동네 계 모임',temple:'산사의 불공',teach:'마을 아이들',trade:'먹고살 길',nephew:'형제의 아이',oldsingle:'노처녀·노총각 소리',travel:'유람',house:'홀로 살 집',oldage:'홀로 맞는 노년',stigma:'헤어진 몸',exnews:'헤어진 이의 소식',widower:'홀아비 살림',lonely:'긴 밤',neighbor:'이웃의 억울한 일',thief:'한밤의 도둑',ancestral:'제사를 모시는 일'};
function bookList(cat){
  if(cat==='post'){const out=[];for(const k in POSTS){if(!POSTS[k]||!JOBS[k])continue;POSTS[k].opts.forEach(o=>out.push([k+':'+o.k,`${JOBS[k].n} · ${o.n}`]));}return out;}
  if(cat==='rise')return RISE.map(r=>[r.k+r.to,`${JOBS[r.k].n} → ${CLS[r.to].n}`]).filter((x,i,a)=>a.findIndex(y=>y[0]===x[0])===i);
  if(cat==='scene')return [...IDEA.map(s=>[s.id,'시대 · '+s.t]),...SOLO.map(s=>[s.id,'홀로 · '+(s.t||SOLO_T[s.id]||s.id)]),...FAM.map(s=>[s.id,(s.id[0]==='f'?'벗 · ':'자식 · ')+s.title]),['live','자식 · 노년의 거처'],['freekid','자식 · 노비 문서에서 이름 지우기'],['kidsamgan','자식 · 딸의 삼간택 낙선'],['arranged','혼인 · 집안이 정한 혼처'],['pers','시대 · 천주교 박해'],['dhwar','시대 · 동학 농민군'],['gukchi','시대 · 경술국치'],['samil','시대 · 3·1 운동'],['changssi','시대 · 창씨개명'],['gwangbok','시대 · 광복'],['yugio','시대 · 6·25 전쟁']];
  return [];
}

/* ===== 시대의 사상과 풍속 ===== */
const IDEA=[
  SE('yeondeung',()=>P.year<1392&&P.age>=8,'연등회','정월 대보름, 온 개경이 연등회로 들썩인다. 집집마다 등을 달고 절마다 불공을 드린다.',[
    ['절에 등을 달고 복을 빈다','재산 조금 ↓·마음고생 ↓',{w:-1,worry:-6,then:()=>note('bulgyo')},'등불 아래에서 집안의 복을 빌었다.'],
    ['팔관회 구경을 간다','',{worry:-4,look:1,then:()=>note('bulgyo')},'궁궐 앞 넓은 마당의 화려한 놀이를 구경하였다.']]),
  SE('sadaebu',()=>P.year>=1375&&P.year<1392&&P.cls==='yangban'&&!P.female&&P.age>=18,'신진 사대부','성리학을 배운 젊은 선비들이 권문세족과 불교의 폐단을 비판하며 개혁을 외친다.',[
    ['개혁에 뜻을 함께한다','학식 ↑·평판 ↑',{know:3,fame:4},'성리학 책을 붙들고 개혁의 뜻을 품었다.'],
    ['고려 왕실에 대한 절의를 지킨다','평판 ↑',{fame:5},'두 임금을 섬길 수 없다는 뜻을 굳혔다.'],
    ['권문세족 곁에 남는다','재산 ↑·평판 ↓',{w:6,fame:-4},'권문세족의 그늘에서 넉넉히 지냈다.']]),
  SE('funeralway',()=>P.year>=1392&&P.year<1520&&['yangban','jungin'].includes(P.cls)&&P.age>=20,'상례를 어떻게 치를까','집안 어른이 세상을 떠났다. 예전처럼 화장하고 절에서 재를 올릴 것인가, 새 법도대로 가묘를 세우고 삼년상을 치를 것인가.',[
    ['주자가례대로 삼년상을 치른다','평판 ↑·재산 ↓',{fame:5,w:-3},'여막을 짓고 삼년상을 치렀다. 새 법도를 따른다는 칭찬을 들었다.'],
    ['예전처럼 화장하고 재를 올린다','평판 ↓',{fame:-3,worry:-3,then:()=>note('bulgyo')},'절에서 재를 올렸다. 유학자들의 눈총을 받았다.']]),
  SE('naehun',()=>P.year>=1475&&P.year<1876&&P.female&&['yangban','jungin'].includes(P.cls)&&P.age>=10&&P.age<=25,'내훈과 삼강행실도','어머니가 『내훈』과 『삼강행실도』를 펴 놓고 여인의 도리를 익히라 한다.',[
    ['밤마다 열심히 익힌다','평판 ↑·학식 ↑',{fame:3,know:2},'여인의 도리를 줄줄 외게 되었다.'],
    ['몰래 언문 소설을 끼워 읽는다','재주 ↑',{art:3},'삼강행실도 사이에 소설책을 숨겨 읽었다.']]),
  SE('dangsaek',()=>P.year>=1680&&P.year<1800&&P.cls==='yangban'&&!P.female&&P.age>=20,'당색','노론이냐 소론이냐, 남인이냐. 혼사도 벗도 당색에 따라 갈리는 세상이다.',[
    ['집안 대대로의 당색을 따른다','',{fame:2},'대대로의 당색을 지켰다.'],
    ['당색을 떠나 사람을 사귄다','평판이 운에 달림',{p:.5,ok:[{fame:4},'편을 가리지 않는다는 이름을 얻었다.'],no:[{fame:-4},'이쪽저쪽에서 다 미움을 샀다.']}]]),
  SE('silhak',()=>P.year>=1700&&P.year<1860&&['yangban','jungin'].includes(P.cls)&&P.age>=18&&P.st.know>=45,'실학','벗이 『반계수록』과 『열하일기』를 건넨다. 공리공담 대신 백성의 살림에 쓸모 있는 학문을 하자는 것이다.',[
    ['밤새 읽고 토론한다','학식 ↑',{know:4,then:()=>note('silhak')},'수레와 벽돌, 농사법에 관한 이야기에 눈이 번쩍 뜨였다.'],
    ['청나라 문물을 직접 보러 간다','재산 ↓·학식 ↑·평판 ↑',{w:-6,know:5,fame:3,then:()=>note('silhak')},'사신단을 따라 연경에 다녀왔다.'],
    ['성현의 글이나 읽으라며 덮는다','',{},'책을 덮었다.']]),
  SE('cheonju',()=>P.year>=1784&&P.year<1886&&!P.flags.catholic&&P.age>=16,'천주학','몰래 돌던 천주학 책을 얻어 보았다. 하늘 아래 모든 사람이 평등하다고 적혀 있다.',[
    ['세례를 받고 신자가 된다','마음고생 ↓·박해가 오면 목숨이 위태로움',{worry:-8,then:()=>{P.flags.catholic=P.year;note('cheonju');}},'세례를 받았다. 제사를 그만두라는 가르침이 마음에 걸렸지만 기도가 위안이 되었다.'],
    ['몰래 읽기만 한다','학식 ↑',{know:2,then:()=>note('cheonju')},'책을 깊이 숨겨 두었다.'],
    ['불사르고 잊는다','',{},'책을 불살랐다.']]),
  SE('donghakIn',()=>P.year>=1860&&P.year<1894&&['sangmin','cheonmin'].includes(P.cls)&&!P.flags.donghak&&P.age>=15,'동학','"사람이 곧 하늘이다." 동학 교도가 마을에 찾아와 주문을 가르친다.',[
    ['입도하여 동학 교도가 된다','마음고생 ↓·관아의 눈',{worry:-6,then:()=>{P.flags.donghak=P.year;note('donghak');}},'동학에 들었다. 양반도 상놈도 다 같은 하늘이라는 말에 가슴이 뛰었다.'],
    ['주문만 배워 둔다','',{worry:-2,then:()=>note('donghak')},'주문을 외워 두었다.'],
    ['괜한 일에 엮이지 않는다','',{},'고개를 저었다.']]),
  SE('gaehwa',()=>P.year>=1880&&P.year<1895&&P.cls==='yangban'&&!P.female&&P.age>=18,'개화냐 척사냐','서양 문물을 받아들여 나라를 바꾸자는 이들과, 오랑캐의 것을 물리치자는 이들이 맞선다.',[
    ['개화파와 뜻을 함께한다','학식 ↑·정변 위험',{know:3,then:()=>{P.flags.gaehwa=1;note('gaehwa');}},'개화파 젊은 관리들과 어울렸다.'],
    ['위정척사 상소에 이름을 올린다','평판 ↑',{fame:5,then:()=>{P.flags.cheoksa=1;note('gaehwa');}},'유생들과 함께 상소를 올렸다.'],
    ['형세를 지켜본다','',{},'어느 쪽에도 서지 않았다.']]),
  SE('danbal',()=>P.year>=1895&&P.year<=1897&&!P.female&&P.age>=15&&!P.flags.danbal,'단발령','상투를 자르라는 명이 내려졌다. 관리들이 가위를 들고 길목을 지킨다.',[
    ['상투를 자른다','평판 ↓ (양반은 크게)',{then:()=>{fx({fame:P.cls==='yangban'?-8:-2});P.flags.danbal=1;note('danbal');}},'상투를 잘랐다. 머리가 가벼웠지만 마음은 무거웠다.'],
    ['"내 목은 잘라도 머리털은 못 자른다"','평판 ↑',{fame:5,then:()=>{P.flags.danbal=2;note('danbal');}},'상투를 지켰다.'],
    ['의병에 나선다','무예가 중요하다',{s:'brave',ok:[{fame:10,then:()=>{P.flags.danbal=3;note('danbal');}},'을미의병에 나가 이름을 떨쳤다.'],no:[{health:-15,then:()=>{P.flags.danbal=3;}},'의병에 나갔다가 크게 다쳤다.']}]]),
  SE('sinmun',()=>P.year>=1896&&P.age>=12&&P.cls!=='cheonmin','신문','한글로 된 신문이 나왔다. 장터에서 사람들이 둘러앉아 소리 내어 읽는다.',[
    ['꼬박꼬박 사서 읽는다','학식 ↑',{know:3,w:-.5},'세상 돌아가는 일을 알게 되었다.'],
    ['만민공동회에 나가 본다','평판 ↑',{fame:4,brave:1},'종로 네거리에서 백정이 연설하는 것을 보았다. 세상이 바뀌고 있었다.'],
    ['관심 없다','',{},'관심을 두지 않았다.']]),
  SE('streetcar',()=>P.year>=1899&&P.age>=10,'전차와 기차','종로에 전차가 다니고 제물포까지 기차가 놓였다.',[
    ['전차를 타 본다','재산 조금 ↓·마음고생 ↓',{w:-.3,worry:-4},'쇠바퀴 소리에 가슴이 쿵쾅거렸다.'],
    ['괴물이라며 멀리한다','',{},'멀찍이서 구경만 하였다.']]),
  SE('gukchae',()=>P.year>=1907&&P.year<=1908&&P.age>=15,'국채 보상 운동','나라 빚을 갚자며 남자는 담배를 끊고, 여인들은 비녀와 가락지를 내놓는다.',()=>[
    [P.female?'비녀와 가락지를 내놓는다':'담배를 끊고 돈을 낸다','재산 ↓·평판 ↑',{w:-3,fame:6},'나라를 위해 정성을 보탰다.'],
    ['형편대로 조금 낸다','',{w:-1,fame:2},'조금 보탰다.'],
    ['나라 빚을 백성이 왜 갚나','',{fame:-2},'고개를 저었다.']]),
  SE('eulsa',()=>P.year>=1905&&P.year<=1909&&P.age>=18&&!P.flags.eulsa,'을사늑약','나라의 외교권을 빼앗겼다는 소식에 곳곳에서 통곡 소리가 들린다.',[
    ['의병에 나선다','무예가 중요하다·목숨이 위태로움',{s:'brave',ok:[{fame:12,then:()=>{P.flags.eulsa=1;}},'의병으로 일본군과 싸워 이름을 떨쳤다.'],no:[{health:-25,then:()=>{P.flags.eulsa=1;}},'의병으로 싸우다 크게 다쳤다.']}],
    ['학교를 세우고 실력을 기른다','재산 ↓·평판 ↑',{w:-6,fame:8,then:()=>{P.flags.eulsa=2;}},'애국 계몽에 힘을 보탰다.'],
    ['목숨을 부지한다','',{then:()=>{P.flags.eulsa=3;}},'숨죽이고 지냈다.']])
];
/* 박해와 봉기: 해당하는 해에 반드시 */
function persecutionScene(){
  P.flags.persY=P.year;bookSeen('scene','pers');const nm={1801:'신유박해',1839:'기해박해',1846:'병오박해',1866:'병인박해'}[P.year];
  return {kind:'major',title:nm,text:`나라에서 천주교도를 잡아들이기 시작했다(${nm}). 포졸들이 그대의 집 앞에서 서성인다.`,opts:[
    {t:'신앙을 버린다고 맹세한다',p:null,safe:true,tags:['목숨을 건짐','마음고생 ↑'],fn:()=>{P.flags.catholic=0;fx({worry:15});say('신앙을 버리겠다고 맹세하고 풀려났다. 밤마다 남몰래 울었다.');}},
    {t:'끝까지 신앙을 지킨다',p:.5,tags:['목숨이 위태로움'],fn:()=>{if(chance(.5)){say('모진 매질에도 신앙을 버리지 않았다. 끝내 유배되었다.','big');exile(ri(3,8));}else{P.cause='천주교 신앙을 지키다 순교하여';say('끝내 신앙을 버리지 않고 순교하였다.','big');fx({health:-200},true);}}},
    {t:'산속 교우촌으로 숨는다',sub:'건강이 중요하다',p:clamp(.4+P.st.health/200),tags:['재산 ↓'],fn:()=>{P.wealth*=.6;P.home='산속 교우촌';if(chance(.4+P.st.health/200))say('식구들을 데리고 깊은 산 교우촌으로 숨어 들어갔다.','big');else{say('숨어 가다 붙잡혀 유배되었다.','big');exile(ri(2,5));}}}]};
}
function donghakWarScene(){
  P.flags.dhWar=1;bookSeen('scene','dhwar');
  return {kind:'major',title:'동학 농민군',text:'"보국안민! 제폭구민!" 고부에서 시작된 농민들의 봉기가 들불처럼 번진다. 동학 교도들이 함께 일어서자고 한다.',opts:[
    {t:'죽창을 들고 일어선다',sub:'무예가 중요하다',p:clamp(.35+P.st.brave/200),tags:['평판 크게 ↑','목숨이 위태로움'],fn:()=>{if(chance(.35+P.st.brave/200)){fx({fame:12});say('전주성까지 들어가 탐관오리를 몰아냈다. 우금치 싸움에서 겨우 살아 돌아왔다.','big');}else if(chance(.5)){fx({health:-30,fame:6});say('우금치에서 일본군의 총탄에 크게 다쳤다.','big');}else{P.cause='우금치 싸움에서';fx({health:-200},true);say('우금치 고개에서 쓰러졌다.','big');}}},
    {t:'군량과 짚신을 보탠다',p:null,tags:['재산 ↓','평판 ↑'],fn:()=>{fx({fame:5});P.wealth*=.85;say('농민군에게 쌀과 짚신을 보탰다.');}},
    {t:'몸을 사린다',p:null,safe:true,tags:[],fn:()=>{say('문을 걸어 잠그고 지냈다.');}}]};
}
function ideaScene(){
  P.flags.ideaY=P.year;const seen=P.flags.ideaSeen=P.flags.ideaSeen||[];
  const pool=IDEA.filter(s=>!seen.includes(s.id)&&s.c());if(!pool.length)return null;
  const s=R(pool);seen.push(s.id);bookSeen('scene',s.id);const sc=s.f();sc.kind='major';sc.title=`시대 · ${sc.title}`;return sc;
}

/* ===== 나라를 잃고, 되찾기까지 ===== */
const STATE_JOBS=['official','military','naesi','court','ajeon','yulgwan','gwansang','sanwon','sajagwan','newarmy','telegraph'];
function gukchiScene(){
  bookSeen('scene','gukchi');const st=P.job&&STATE_JOBS.includes(P.job.k);
  return {kind:'major',title:'경술국치',text:st?`나라가 일본에 병합되었다. ${jobTitle(P.job)}${bat(jobTitle(P.job))?'으로':'로'} 섬기던 나라가 사라졌다. 총독부는 그대에게 자리를 그대로 지키라 한다.`:'나라가 일본에 병합되었다는 소식에 장터가 숨죽였다. 곳곳에서 통곡 소리가 들린다.',opts:[
    ...(st?[{t:'벼슬을 버리고 고향으로 내려간다',p:null,tags:['평판 ↑','재산 ↓'],fn:()=>{P.job=null;P.post=null;fx({fame:8});P.wealth*=.8;say('관복을 벗고 낙향하였다.','big');ev('job','나라가 망하자 벼슬을 버리고 낙향하였다');}},
      {t:'총독부 관리로 남는다',p:null,tags:['재산 ↑','평판 크게 ↓'],fn:()=>{P.post=null;setJob('clerk',P.job&&P.job.lv>=8?2:1);fx({fame:-12});say('총독부의 관리가 되었다. 뒤에서 손가락질하는 소리가 들렸다.','big');ev('job','총독부 관리가 되었다');}}]:
      [{t:'눈물을 삼키며 살아간다',p:null,safe:true,tags:['마음고생 ↑'],fn:()=>{fx({worry:12});say('하늘이 무너지는 듯했지만 살아가야 했다.');}}]),
    {t:'만주로 건너가 독립운동에 나선다',p:null,tags:['평판 크게 ↑','재산 ↓','목숨이 위태로움'],fn:()=>{P.post=null;setJob('indep',0);P.home='만주 서간도';P.wealth*=.5;fx({fame:12});say('가산을 정리하고 압록강을 건넜다.','big');ev('job','만주로 건너가 독립운동에 나섰다');}}]};
}
function samilScene(){
  bookSeen('scene','samil');
  return {kind:'major',title:'3·1 운동',text:'장터 한복판에서 누군가 태극기를 꺼내 들고 "대한 독립 만세!"를 외쳤다. 사람들이 하나둘 따라 외치기 시작한다.',opts:[
    {t:'앞장서 만세를 부른다',sub:'무예(담력)가 중요하다',p:clamp(.4+P.st.brave/200),tags:['평판 크게 ↑','붙잡힐 수 있음'],fn:()=>{if(chance(.4+P.st.brave/200)){fx({fame:12});say('목이 터져라 만세를 불렀다. 그날의 함성은 평생 잊히지 않았다.','big');}else{fx({fame:10,health:-15,worry:10});say('헌병에게 붙잡혀 서대문 형무소에서 모진 고초를 겪었다.','big');ev('note','3·1 운동으로 옥고를 치렀다');}}},
    {t:'몰래 독립 선언서를 돌린다',p:.7,tags:['평판 ↑'],fn:()=>{if(chance(.7)){fx({fame:7});say('밤새 독립 선언서를 집집마다 돌렸다.');}else{fx({health:-10,fame:5});say('선언서를 돌리다 붙잡혀 매를 맞았다.');}}},
    {t:'숨죽이고 지켜본다',p:null,safe:true,tags:[],fn:()=>{fx({worry:5});say('문틈으로 만세 행렬을 지켜보았다.');}}]};
}
function changssiScene(){
  bookSeen('scene','changssi');
  return {kind:'major',title:'창씨개명',text:'면사무소에서 일본식 성과 이름을 지어 신고하라고 한다. 따르지 않으면 배급도 학교 입학도 막힌다.',opts:[
    {t:'따른다',p:null,safe:true,tags:['마음고생 ↑'],fn:()=>{fx({worry:10,fame:-2});say('조상의 성을 버리는 날, 몰래 족보를 꺼내 놓고 울었다.');}},
    {t:'끝까지 거부한다',p:null,tags:['평판 ↑','재산 ↓','감시를 받음'],fn:()=>{fx({fame:8,worry:5});P.wealth*=.85;say('성을 바꾸지 않았다. 배급이 끊기고 순사가 문 앞을 서성였다.','big');}},
    {t:'우스꽝스러운 이름으로 비꼰다',sub:'무예(담력)가 중요하다',p:clamp(.35+P.st.brave/200),tags:['평판 ↑','붙잡힐 수 있음'],fn:()=>{if(chance(.35+P.st.brave/200)){fx({fame:6});say('조롱 섞인 이름을 써 내니 동네 사람들이 몰래 웃었다.');}else{fx({health:-8,fame:4});say('불온하다며 끌려가 매를 맞았다.');}}}]};
}
function gwangbokScene(){
  bookSeen('scene','gwangbok');const J=P.job&&P.job.k;
  if(J==='clerk'){fx({fame:-10});say('친일 관리였다는 손가락질이 쏟아졌다.');P.job=null;}
  if(J==='indep'){fx({fame:20});say('긴 세월 나라를 위해 싸운 공이 널리 알려졌다.','big');}
  return {kind:'major',title:'광복',text:'라디오에서 일본 왕의 항복 방송이 흘러나왔다. 거리마다 태극기를 든 사람들이 쏟아져 나왔다.',opts:[
    {t:'거리로 나가 만세를 부른다',p:null,tags:['마음고생 크게 ↓'],fn:()=>{fx({worry:-20,health:3});say('얼싸안고 울고 웃으며 만세를 불렀다.','big');}},
    {t:'조상의 산소에 고한다',p:null,tags:['마음고생 ↓'],fn:()=>{fx({worry:-15});say('산소에 엎드려 나라를 되찾았다고 고하였다.','big');}}]};
}
function yugioScene(){
  bookSeen('scene','yugio');
  return {kind:'major',title:'6·25 전쟁',text:'포성이 가까워진다. 피란 보따리를 이고 진 사람들이 남쪽으로 줄을 잇는다.',opts:[
    {t:'식구들을 데리고 피란길에 오른다',sub:'건강이 중요하다',p:clamp(.5+P.st.health/200),tags:['재산 ↓'],fn:()=>{P.wealth*=.5;if(chance(.5+P.st.health/200)){say('부산까지 내려가 판잣집에서 전쟁을 견뎠다.','big');P.home='부산 피란민 판잣집';}else{fx({health:-20});say('피란길에 병을 얻어 크게 앓았다.','big');}}},
    {t:'고향 집을 지킨다',p:.75,tags:['목숨이 위태로움'],fn:()=>{if(chance(.75)){fx({worry:15});say('몇 번이나 주인이 바뀌는 마을에서 숨죽이며 살아남았다.','big');}else{fx({health:-30});say('폭격에 집이 무너지고 크게 다쳤다.','big');}}}]};
}
/* 강점기의 일상 */
IDEA.push(
  SE('jagum',()=>P.year>=1911&&P.year<1945&&P.age>=20&&P.wealth>soloU()*15,'독립 군자금','밤늦게 낯선 사내가 찾아와 만주 독립군에 보낼 군자금을 청한다.',[
    ['몰래 군자금을 내놓는다','재산 ↓·평판 ↑·붙잡힐 수 있음',{w:-8,p:.8,ok:[{fame:8},'군자금이 무사히 만주로 건너갔다.'],no:[{fame:6,health:-12},'형사에게 꼬리가 잡혀 끌려가 고문을 당했다.']}],
    ['형편이 안 된다며 돌려보낸다','',{worry:4},'사내를 돌려보냈다. 마음 한구석이 무거웠다.']]),
  SE('modern',()=>P.year>=1920&&P.year<1945&&P.age>=15&&P.age<=40,'신식 바람',()=>P.female?'단발머리에 양장을 한 신여성들이 종로를 활보한다.':'양복에 중절모를 쓴 모던 보이들이 다방에 모여 앉는다.',()=>[
    [P.female?'머리를 자르고 양장을 입는다':'양복을 맞춰 입는다','매력 ↑·어른들의 눈총',{look:4,fame:-2},'거울 속 모습이 낯설고도 마음에 들었다.'],
    ['다방에서 커피를 마셔 본다','재산 조금 ↓',{w:-.5,worry:-3},'쓴맛에 놀랐지만 축음기 노래가 좋았다.'],
    ['옛 차림을 지킨다','',{},'옛 차림을 지켰다.']]),
  SE('yahak',()=>P.year>=1925&&P.year<1938&&P.age>=15&&P.st.know>=40,'야학','농촌에서 글을 깨치게 하자는 운동이 한창이다. 마을 야학에서 한글을 가르칠 사람을 찾는다.',[
    ['밤마다 한글을 가르친다','평판 ↑·학식 ↑',{fame:6,know:2},'호롱불 아래에서 할머니들이 처음으로 제 이름을 썼다.'],
    ['배우러 다닌다','학식 ↑',{know:4},'밤마다 야학에 다니며 글을 깨쳤다.'],
    ['피곤해 엄두가 안 난다','',{},'고개를 저었다.']]),
  SE('gongchul',()=>P.year>=1941&&P.year<=1945&&P.age>=15,'공출','순사가 집집마다 돌며 놋그릇과 숟가락, 쌀까지 거두어 간다.',[
    ['순순히 내놓는다','재산 ↓',{w:-4},'제기까지 빼앗겼다.'],
    ['땅에 묻어 숨긴다','',{p:.6,ok:[{},'몰래 묻어 둔 놋그릇을 지켜 냈다.'],no:[{w:-6,health:-6},'들켜서 매를 맞고 더 많이 빼앗겼다.']}]]),
  SE('jingyong',()=>P.year>=1939&&P.year<=1945&&P.kids.some(k=>k.alive&&!k.female&&P.year-k.born>=17&&P.year-k.born<=30&&!k.away),'징용 영장',()=>{const k=P.kids.find(k=>k.alive&&!k.female&&P.year-k.born>=17&&P.year-k.born<=30&&!k.away);return `아들 ${k.name}에게 징용 영장이 나왔다. 먼 탄광으로 끌려간다고 한다.`;},[
    ['산속으로 숨긴다','',{p:.6,ok:[{worry:8},'아들을 깊은 산속 친척 집에 숨겼다.'],no:[{health:-8,worry:15},'숨긴 것이 들통나 아들은 끌려가고 그대는 매를 맞았다.']}],
    ['눈물로 떠나보낸다','마음고생 크게 ↑',{worry:20},'정거장에서 아들의 손을 놓지 못했다.']])
);

/* 왕실에 든 딸들에 따라 부모의 작호를 정한다 (여럿이면 높은 쪽 + 함께 표기) */
function updateHonor(){
  const all=P.kids.filter(k=>k.royalBride&&k.royalBride!=='폐빈');const ks=all.filter(k=>k.alive);
  if(!all.length){P.honor=P.kids.some(k=>k.queenY)?`${P.bon||''}${P.female?'부부인':'부원군'}`:'';return;}
  const q=all.some(k=>['중전','대비'].includes(k.royalBride)||k.queenY);
  if(!ks.length){P.honor=q?`${P.bon||''}${P.female?'부부인':'부원군'}`:'';return;}
  const sj=ks.some(k=>k.royalBride==='세자빈');
  const parts=[];
  if(q){const t=`${P.bon||''}${P.female?'부부인':'부원군'}`;parts.push(t);if(!P.titles.includes(P.female?'부부인':'부원군'))P.titles.push(P.female?'부부인':'부원군');}
  const dae=ks.find(k=>k.royalBride==='대비');const jung=ks.find(k=>k.royalBride==='중전');
  if(dae)parts.push(P.female?'대비의 어머니':'대비의 아버지');if(jung)parts.push(P.female?'중전의 어머니':'중전의 아버지');{const hg=ks.find(k=>['숙의','빈'].includes(k.royalBride));if(hg)parts.push(`${hg.royalBride}의 ${P.female?'어머니':'아버지'}`);}
  if(sj)parts.push(P.female?'세자빈의 어머니':'세자빈의 아버지');
  if(!q&&sj&&!P.female)parts[parts.length-1]+=' (국구 집안)';
  P.honor=parts.join(' · ');
}

/* ===== 천인 자식의 속량 ===== */
/* 아이의 주인은 누구인가: 내 집 노비(비첩 소생) / 관아(관기·관노 소생) / 남의 집 */
function kidOwner(k){
  const mo=k.mother&&P.people[k.mother], fa=k.father&&P.people[k.father];
  if(!P.female&&mo&&mo.kind==='cheop'&&['yangban','jungin','royal'].includes(P.cls))return mo.sub==='gisaeng'?'gwan':'mine';
  if(P.female&&P.cls==='cheonmin')return P.sub==='gisaeng'||P.gong?'gwan':'other';
  if(!P.female&&P.cls==='cheonmin')return mo&&mo.sub==='gisaeng'?'gwan':P.gong?'gwan':'other';
  if(mo&&mo.sub==='gisaeng')return 'gwan';
  return 'other';
}
function freeKidScene(k){
  k.freeAsked=P.year;bookSeen('scene','freekid');note('nobilaw');
  const W=k.female?'딸':'아들';const nm=k.name;const own=kidOwner(k);const U=UNIT[P.cls]||.5;
  const mo=k.mother&&P.people[k.mother];
  const to=P.cls==='cheonmin'?'sangmin':(P.cls==='yangban'||P.cls==='royal')?'sangmin':P.cls;
  const free=(why,big=true)=>{k.cls=to;k.freedY=P.year;if(k.job&&['slave','gisaeng'].includes(k.job.k)){k.job=null;kidJob(k);}fx({worry:-10});say(why,big?'big':'');ev('freed',`${W} ${iga(nm)} 노비 문서에서 풀려났다`);if(k.seo&&!P.female&&P.cls==='yangban')say(`${iga(nm)} 이제 양인이 되었으나, 서얼이라는 굴레는 그대로였다.`);};
  const retry=()=>{k.freeAsked=P.year;k.freeAgain=P.year+ri(4,7);};
  if(own==='mine'){
    const c=Math.round(U*6);
    return {kind:'major',title:'자식 · 내 집 노비 문서',text:`${W} ${nm}의 이름이 우리 집 노비 문서에 올라 있다. 어미가 이 집의 비(婢)였기 때문이다. 문서의 주인은 바로 그대이니, 그대가 놓아주면 그만이다. 다만 관아에 신고하고 대신할 노비를 들이는 것이 법도라 한다.`,opts:[
      {t:'방량 문서를 써 주고 관아에 신고한다',p:null,tags:['자식이 양인이 됨',`재산 조금 ↓ (${money(c)})`],fn:()=>{P.wealth=Math.max(0,P.wealth-c);free(`손수 방량 문서를 써서 ${W} ${nm}의 이름을 노비 문서에서 지웠다. 관아에서도 양인으로 올려 주었다.`);}},
      ...(mo&&mo.alive&&mo.cls==='cheonmin'?[{t:`어미 ${callOf(mo)}까지 함께 놓아준다`,p:null,tags:['자식과 어미가 양인이 됨','재산 ↓','문중의 눈총'],fn:()=>{P.wealth=Math.max(0,P.wealth-c*2);mo.cls='sangmin';mo.sub='';fx({fame:-2});free(`${W} ${gwawa(nm)} 어미 ${callOf(mo)}의 이름을 노비 문서에서 함께 지웠다.`);}}]:[]),
      {t:'문중이 반대하니 미룬다',p:null,safe:true,tags:['몇 해 뒤 다시 생각함'],fn:()=>{retry();fx({worry:4});say(`문중 어른들의 눈치를 보느라 ${nm}의 일은 훗날로 미루었다.`);}}]};
  }
  if(own==='gwan'){
    const c=Math.round(Math.max(12,Math.min(P.wealth*.12,100)));
    return {kind:'major',title:'자식 · 관아의 노비 문서',text:`${W} ${nm}${bat(nm)?'은':'는'} 어미를 따라 관아의 노비 문서에 올라 있다. 관노비를 빼내려면 관아에 속전을 바치거나, 대신 일할 사람을 바치는 대구속신을 해야 한다.`,opts:[
      {t:`속전을 바친다 (${money(c)})`,p:P.wealth>=c?.9:.0,tags:['재산 ↓','아전이 값을 더 부를 수 있음'],fn:()=>{if(P.wealth<c){say('모아 둔 돈이 모자랐다.');retry();return;}P.wealth-=c;if(chance(.9))free(`관아에 속전을 바치고 ${W} ${nm}의 이름을 관노비 문서에서 지웠다.`);else{P.wealth=Math.max(0,P.wealth-c*.3);free(`아전이 웃돈을 요구해 더 치르고서야 ${W} ${iga(nm)} 풀려났다.`);}}},
      {t:'사또에게 청을 넣는다',sub:'평판이 중요하다',p:clamp(.2+P.st.fame/200),tags:['성공하면 값이 덜 듦'],fn:()=>{if(chance(.2+P.st.fame/200)){P.wealth=Math.max(0,P.wealth-c*.3);free(`사또가 사정을 헤아려 적은 값만 받고 ${W} ${nm}을 풀어 주었다.`.replace(nm+'을',eulreul(nm)));}else{retry();fx({worry:6});say('사또는 법대로 하라며 청을 물리쳤다.');}}},
      {t:'훗날을 기약한다',p:null,safe:true,tags:[],fn:()=>{retry();say(`언젠가 ${eulreul(nm)} 반드시 풀어 주리라 다짐하였다.`);}}]};
  }
  const c=Math.round(Math.max(15,Math.min(P.wealth*.15,120)));
  return {kind:'major',title:'자식 · 주인집의 노비 문서',text:`${W} ${nm}의 이름은 주인집 노비 문서에 올라 있다. 이대로면 언제 팔려 갈지 모르고, 그 자식도 노비가 된다. 주인에게 몸값을 치러야 풀려난다.`,opts:[
    {t:`몸값을 치른다 (${money(c)})`,p:P.wealth>=c?.85:0,tags:['재산 ↓','주인이 값을 올릴 수 있음'],fn:()=>{if(P.wealth<c){say('모아 둔 돈이 모자랐다.');retry();return;}P.wealth-=c;if(chance(.85))free(`주인에게 몸값을 치르고 ${W} ${nm}의 이름을 노비 문서에서 지웠다.`);else{say('주인이 돈만 받고 값을 더 올렸다. 몇 해 더 모아야 한다.');retry();}}},
    {t:'주인에게 엎드려 사정한다',sub:'평판이 중요하다',p:clamp(.15+P.st.fame/250),tags:['성공하면 값 없이 풀려남'],fn:()=>{if(chance(.15+P.st.fame/250))free(`주인이 마음을 움직여 ${W} ${eulreul(nm)} 풀어 주었다.`);else{retry();fx({worry:6});say('주인은 고개를 저었다.');}}},
    {t:'멀리 도망시킨다',sub:'추쇄꾼에게 잡힐 수 있다',p:.5,tags:['성공하면 양인으로 숨어 삶','실패하면 자식이 매를 맞음'],fn:()=>{if(chance(.5)){k.cls='sangmin';k.away=true;k.freedY=P.year;say(`${eulreul(nm)} 몰래 먼 고을로 떠나보냈다. 이름을 바꾸고 양인으로 살아갈 것이다.`,'big');ev('freed',`${W} ${eulreul(nm)} 도망시켜 양인으로 살게 하였다`);}else{retry();fx({worry:12,fame:-3});say(`추쇄꾼에게 붙잡혀 ${iga(nm)} 모진 매를 맞고 끌려 돌아왔다.`,'big');}}},
    {t:'훗날을 기약한다',p:null,safe:true,tags:[],fn:()=>{retry();say(`언젠가 ${eulreul(nm)} 반드시 풀어 주리라 다짐하였다.`);}}]};
}

function sisQ(k){return P.kids.find(x=>x!==k&&x.alive&&['중전','대비'].includes(x.royalBride));}

/* ===== 집안이 정한 혼처 (억지 혼인) =====
   신분이 높을수록, 여자일수록 집안 뜻대로 혼인하는 일이 잦았다. 노비는 주인이 짝을 지어 주었다. */
function arrangeChance(){
  if(P.married||P.court||P.flags.sujeol||P.flags.soloVow||P.eunuch)return 0;
  if(P.job&&['monk','concubine','queen','king','naesi','gisaeng','court'].includes(P.job.k))return 0;
  if(P.sub==='gisaeng')return 0;
  const a=P.age,F=P.female;
  if(P.widowed||P.divorced){if(a>40)return 0;return {royal:.15,yangban:F?0:.12,jungin:.08,sangmin:.06,cheonmin:.12}[P.cls]||0;}
  if(a<18||a>(F?26:32))return 0;
  if(P.year-(P.flags.arrY||0)<2)return 0;
  const base={royal:F?.15:.17,yangban:F?.22:.18,jungin:F?.15:.12,sangmin:F?.08:.06,cheonmin:F?.12:.1}[P.cls]||.08;
  const era=P.year>=1894?.5:1;
  return base*era*(a>=(F?21:25)?1.3:1);
}
function arrangedScene(){
  P.flags.arrY=P.year;bookSeen('scene','arranged');
  const F=P.female,C=P.cls;
  const ccls=C==='royal'?'yangban':C==='cheonmin'?'cheonmin':C;
  const age=F?P.age+ri(0,12):clamp(P.age-ri(0,6),18,60);
  const x=newPerson({kind:'cand',female:!F,cls:ccls,sub:ccls==='cheonmin'?'nobi':'',born:P.year-Math.max(18,age)});
  x.wealth=ri(0,3);x.fam=famText(x);x.h=ri(5,25);x.t=ri(10,40);
  const nm=callOf(x);
  const who=C==='cheonmin'?'주인 댁':P.parents&&P.parents.f&&P.parents.f.alive!==false?'아버지':'집안 어른들';
  const love=Object.values(P.people).filter(y=>y.kind==='love'&&y.alive&&y.h>=50&&canWed(y)).sort((a,b)=>b.h-a.h)[0];
  const txt=C==='cheonmin'?`주인 댁에서 같은 집 ${F?'사내종':'계집종'} ${eulreul(nm)} 짝지어 주겠다고 한다. 노비의 혼인은 주인이 정하는 것이었다.`
    :`${iga(who)} 혼처를 정해 버렸다. ${nm}, ${ageOf(x)}세 · ${x.fam}. 사주단자까지 오갔다고 한다. 그대의 뜻은 묻지 않았다.`;
  /* 거역이 통할 확률: 신분이 높고 여자일수록 낮다 */
  const pr=clamp(({royal:.08,yangban:F?.12:.25,jungin:F?.2:.3,sangmin:F?.3:.4,cheonmin:.12}[C]||.25)+P.st.brave/400+(P.parents&&P.parents.f&&P.parents.f.alive===false?.1:0),.05,.7);
  const forced=(why)=>{x.mode='wife';say(why,'big');fx({worry:10});ev('note',C==='cheonmin'?'주인이 정해 준 짝과 혼인하였다':'집안이 정한 혼처로 혼인하였다');wed(x);};
  const opts=[
    {t:C==='cheonmin'?'주인의 뜻을 따른다':'집안의 뜻을 따른다',p:null,tags:['혼인','마음은 아직 없음'],fn:()=>{x.mode='wife';fx({fame:2});say(C==='cheonmin'?`주인이 정해 준 대로 ${gwawa(nm)} 짝을 이루었다.`:`얼굴도 모르던 ${gwawa(nm)} 혼례를 올렸다. 정은 살면서 드는 것이라 하였다.`,'big');ev('note','집안이 정한 혼처로 혼인하였다');wed(x);}},
    {t:'혼인을 거역한다',sub:'무예(담력)가 중요하다',p:pr,tags:['통하면 혼사가 깨짐','안 통하면 끌려가듯 혼인','평판 ↓'],fn:()=>{
      if(chance(pr)){fx({fame:-4,worry:6});say(C==='cheonmin'?'주인에게 매달려 겨우 짝짓기를 미루었다.':'단식까지 하며 버틴 끝에 혼사가 깨졌다. 불효라는 말을 들었다.','big');return null;}
      forced(C==='cheonmin'?'주인의 명을 거스를 수는 없었다. 결국 정해 준 짝과 살게 되었다.':'끝내 뜻을 꺾지 못하고 끌려가듯 혼례를 올렸다.');}}];
  if(love&&C!=='cheonmin'){const pl=clamp(pr+(love.cls===P.cls?.15:-.05)+love.h/400,.05,.75);
    opts.splice(1,0,{t:`마음에 둔 ${iga(callOf(love))} 있다고 털어놓는다`,p:pl,tags:['통하면 그 사람과 혼담','안 통하면 정해진 혼인'],fn:()=>{
      if(chance(pl)){say(`${who==='아버지'?'아버지':'집안 어른들'}께서 한참 말이 없으시더니, ${callOf(love)} 집안에 사람을 보내 보라 하셨다.`,'big');return marryScene(love);}
      love.h=Math.max(0,love.h-10);forced(`${callOf(love)}의 이야기는 들은 척도 하지 않았다. 정해진 혼처로 혼례를 올렸다.`);}});}
  if(C==='cheonmin'&&P.wealth>20)opts.push({t:'몸값을 모아 주인과 흥정한다',p:.35,tags:['재산 ↓'],fn:()=>{P.wealth*=.8;if(chance(.35)){say('엽전을 바치고 짝짓기를 면하였다.');return null;}forced('주인은 돈만 받고 뜻을 바꾸지 않았다.');}});
  return {kind:'major',title:C==='cheonmin'?'혼인 · 주인이 정한 짝':'혼인 · 집안이 정한 혼처',pid:x.id,text:txt,opts};
}
