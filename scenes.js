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
  if(P.age<15){say(`${w[2]}이 일어났다. 어른들 손에 이끌려 피란길에 올랐다.`,'big');famTragedy(.25,'피란길에');fx({health:-6,worry:10});ev('war',w[2]);return null;}
  const opts=[
    {t:'산으로 피란한다',sub:'가산을 버리고 목숨을 지킨다',p:.75,safe:true,tags:['재산 ↓','가족을 잃을 수 있음'],fn:()=>{fx({wealth:-P.wealth*.35,health:-4,worry:10});say('짐을 꾸려 산으로 숨어들었다. 피란길은 고되었다.');famTragedy(.25,'피란길에');ev('war',w[2]);}},
    {t:'집을 지킨다',sub:'가산은 지키나 위험하다',p:.45,tags:['목숨이 위태로울 수 있음'],fn:()=>{if(chance(.45)){say('적이 마을을 비껴갔다. 가까스로 집을 지켰다.');}else{fx({wealth:-P.wealth*.6,health:-15,worry:15});say('적이 마을에 들이닥쳤다. 겨우 목숨만 건졌다.','big');famTragedy(.35,'난리 통에');if(chance(.1)){P.cause='전란 중에';fx({health:-100},true);}}ev('war',w[2]);}}
  ];
  if(!P.female&&P.age<=50)opts.push({t:'의병에 나선다',sub:'나라를 위해 싸운다',p:.55,tags:['평판 ↑','목숨이 위태로움',P.cls==='cheonmin'?'면천될 수 있음':'공을 세울 수 있음'],fn:()=>{
    if(chance(.55)){say('의병에 나가 싸웠다. 그 공이 조정에 알려졌다.','big');fx({fame:25,brave:8});ev('war',w[2]+'에 의병으로 나섰다');
      if(P.cls==='cheonmin'){P.cls='sangmin';P.sub='';P.job=null;say('전공으로 면천되어 양인이 되었다!','big');note('myeoncheon');ev('freed','전공으로 면천되었다');}}
    else{fx({health:-25,brave:5});say('싸움터에서 크게 다쳤다.','big');if(chance(.3)){P.cause='싸움터에서';fx({health:-100},true);}ev('war',w[2]);}}});
  return {kind:'major',title:`${w[2]}`,text:`${w[0]}년, ${w[2]}이 일어났다. 적이 가까이 왔다는 소식에 마을이 술렁인다.`,opts};
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
function canWed(x){if(x.female===P.female)return false;if(ageOf(x)<18)return false;if(x.kingRole)return false;return true;}
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
  } else if(d>=2){
    const p=clamp(.12+L/260+F/400+heart,.05,.6);
    O.push({t:'정실 자리를 바란다',sub:`${CLS[x.cls].n}의 정실이 된다`,p,tags:[`신분 상승: ${CLS[x.cls].n}`,'재산 ↑','평판 ↑','집안의 반대가 거셈'],fn:()=>{
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
  if(P.female&&x.seja){setJob('queen',0);P.court=true;P.home='세자궁(동궁)';}
  else if(!P.female&&x.cls==='royal'&&x.female&&!(P.job&&P.job.k==='buma')){setJob('buma',0);}
  /* 혼인한 여인은 무엇이든 자리가 생긴다 */
  else if(P.female&&!x.kingRole){
    if(x.cls==='royal'&&!(P.job&&['queen','concubine'].includes(P.job.k)))setJob('royalwife',/대군/.test(x.title||'')?1:0);
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
  if(P.female){
    if(P.year>=1600){say('혼례를 치르고 신행길에 올라 시댁으로 들어갔다.');P.home=`시댁 (${HOMES[x.cls==='royal'?'yangban':x.cls]||'초가'})`;}
    else{say('혼례 뒤 한동안 신랑이 친정에 머물렀다. 몇 해 뒤 시댁으로 옮겨 갔다.');P.home=`시댁 (${HOMES[x.cls==='royal'?'yangban':x.cls]||'초가'})`;}

    if(chance(.45)&&x.cls!=='cheonmin'){P.flags.jongga=1;}
    if(x.cls!=='cheonmin'){const el=newPerson({kind:'elder',female:true,cls:x.cls,born:P.year-ri(40,52),title:'시어머니',rel:ri(25,60)});el.name='시어머니';P.elder=el.id;}
    if(P.cls==='yangban'&&chance(.3)){const r=newPerson({kind:'rival',female:true,cls:'yangban',born:P.year-ri(18,30),grudge:25});r.title=`동서 ${r.sur}씨`;r.note='시댁의 동서';}
  } else {
    if(P.year<1600&&P.cls!=='cheonmin')say('조선 초의 풍습대로 한동안 처가에 머물렀다.');
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
    {t:more?'더 낳는다':'아이를 가진다',p:null,tags:['태기는 운에 달림',P.female?'해산의 위험':'아내의 해산 위험'],fn:()=>{P.wantKids=true;say(more?'아이를 더 두기로 하였다.':'아이를 기다리기로 하였다.');}},
    {t:more?'이만하면 되었다':'아직은 아니다',p:null,safe:true,tags:['집안의 눈총'],fn:()=>{P.wantKids=more?false:null;if(!more){P.flags.wedY=P.year+1;}fx({worry:3},true);}},
    ...(more?[]:[{t:'아이를 두지 않는다',p:null,tags:['집안의 눈총 ↑','양자를 들일 수 있음'],fn:()=>{P.wantKids=false;say('아이를 두지 않기로 하였다.');fx({fame:-3,worry:5});}}])]};
}
function kidWedScene(k){
  k.wedAsked=true;
  const RANK=['cheonmin','sangmin','jungin','yangban','royal'];const my=RANK.indexOf(P.cls);
  const upCls=RANK[Math.min(3,my+1)];const canUp=my<3;
  const mk=(kind)=>{const s=surname();const cls=kind==='up'?upCls:kind==='heart'&&chance(.4)&&my>0?RANK[my-1]:P.cls;
    return {sur:s[0],bon:s[1],kind,cls,rich:kind==='rich'?3:kind==='up'?ri(1,3):ri(0,2)};};
  const fams=[mk('rich'),canUp?mk('up'):mk('noble'),mk('heart')];
  const famName=f=>(['yangban','royal'].includes(f.cls)?`${f.bon} ${f.sur}씨 집안`:`${f.sur}씨네`);
  const desc=f=>`${CLS[f.cls].n} · ${RICH[f.rich]}`;
  const opts=fams.map(f=>{
    const p=f.kind==='up'?clamp(.3+(k.st?Math.max(k.st.look,k.st.know):30)/250+P.st.fame/400+(P.wealth>UNIT[P.cls]*60?.1:0),.1,.85):null;
    return {t:`${gwawa(famName(f))} 사돈을 맺는다`,sub:`${desc(f)} · ${f.kind==='rich'?'넉넉한 집안':f.kind==='up'?'우리보다 신분이 높은 집안':f.kind==='noble'?'이름난 집안':`${iga(k.name)} 마음에 둔 집`}`,p,
      tags:f.kind==='rich'?['재산 ↑','재력 ↑']:f.kind==='up'?['성공하면 평판·재력 ↑','거절당할 수 있음']:f.kind==='noble'?['평판 ↑','혼수 부담']:['아이의 행복'],fn:()=>{
      if(p!=null&&!chance(p)){say(`${famName(f)}에서 신분이 맞지 않는다며 혼담을 물렸다.`);fx({worry:5});k.wedAsked=false;return null;}
      k.married=true;k.inlaw=famName(f);k.inlawCls=f.cls;k.inlawRich=f.rich;k.wedY=P.year;
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
  if(P.year>=1910&&!P.alt){return closeScene();}
  if(P.year>=1910&&P.alt&&!P.flags.altEnd){P.flags.altEnd=1;}
  const h=P.st.health;let d;
  const a=P.age;
  d=a<15?.0008:a<30?.004:a<40?.007:a<50?.013:a<60?.025:a<70?.05:a<80?.1:.2;
  if(h<50)d*=1+(50-h)/30;if(P.flags.warYear)d*=1.4;if(FAMINES.includes(P.year))d*=1.3;
  if(a<18)d=h>0?.0002:1;
  if(h<=0||chance(d)||a>=98){return deathScene();}
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
  return {kind:'death',title:'경술년',text:'1910년, 나라가 저물었다. 이 사람의 실록도 여기서 닫힌다.',opts:[{t:'실록을 닫는다',p:null,fn:()=>{P.closed=true;P.cause='';return finishLife(true);}}]};
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
      {t:'빌려준다',sub:'정을 지킨다',p,tags:['재산 ↓','평판 ↑'],fn:()=>{fx({wealth:-c,fame:3},true);if(chance(p)){fx({wealth:c*1.1});say(`이듬해 ${iga(who)} 빌린 돈에 고맙다는 인사까지 얹어 갚았다.`);}else say(`${who}는 끝내 돈을 갚지 못하였다. 그래도 사람을 잃지는 않았다.`);}},
      {t:'딱 잘라 거절한다',p:null,safe:true,tags:['평판 조금 ↓'],fn:()=>{fx({fame:-3});say(`${iga(who)} 서운한 얼굴로 돌아갔다.`);}}]};});
  if(parentAlive()&&P.age>=25)L.push(()=>{const c=amt(.12);const pw=P.parents.f.alive&&P.parents.m.alive?R(['아버지','어머니']):P.parents.f.alive?'아버지':'어머니';
    return {kind:'major',title:'집안 · 부모',text:`${pw}가 병석에 누웠다는 기별이 왔다. 약값도 들고, 곁을 지키려면 손이 많이 간다.`,opts:[
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

const JOB_KEEP=['gisaeng','court','uinyeo','weaver','merchant','farmer','jumo','mudang','nurse','herb','hunjang','yein','sanpa','bangmul','haenyeo','dyer','poet','slave','gwangdae','sword','monk','queen','concubine','royalwife','lady'];
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
      if(chance(p)){P.sub='';sp.mode='wife';fx({fame:yb?-6:4,worry:-10});if(!yb)P.kids.forEach(k=>{if(k.father===sp.id)k.seo=false;});if(P.job&&P.job.k==='housewife')setJob('housewife',2);P.home=P.home.replace('의 별채','의 안채');say(`첩의 몸에서 벗어나 ${nm}의 정실이 되었다.${yb?' 다만 자식들의 서얼 신분은 그대로 남았다.':''}`,'big');ev('rise','첩에서 정실이 되었다');}
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
    {t:'삼가 받든다',p:null,safe:true,tags:['평판 크게 ↑','마음고생 ↓'],fn:()=>{fx({fame:30,worry:-10});ev('jeongnyeo','열녀문');note('yeollyeo');say('나라에서 열녀문을 내렸다. 집 앞에 붉은 정려문이 섰다.','big');}}]};
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
  {const k=pick(k=>k.cls==='cheonmin'&&!k.freeTried&&age(k)>=3&&age(k)<=30);
   if(k)L.push([6,()=>{k.freeTried=1;const cost=Math.max(U*25,{royal:300,yangban:40,jungin:30,sangmin:15,cheonmin:8}[P.cls]||15);const can=P.wealth>=cost;note('nobilaw');
     return {title:'천인의 자식',text:`${W(k)} ${k.name}의 이름은 아직 노비 문서에 올라 있다. 언제 팔려 갈지 모르고, 그 자식도 또 그 자식도 노비가 된다. 속량하려면 ${money(cost)}쯤이 든다고 한다.`,opts:[
       ...(can?[{t:'재산을 털어 속량한다',p:null,tags:['재산 크게 ↓','자식이 양인이 됨'],fn:()=>{fx({wealth:-cost});k.cls=P.cls==='cheonmin'?'sangmin':P.cls;fx({worry:-10});say(`값을 치르고 노비 문서에서 ${W(k)} ${k.name}의 이름을 지웠다. ${iga(k.name)} 양인이 되었다.`,'big');ev('freed',`${W(k)} ${k.name}을 속량하였다`);}}]:[]),
       {t:'주인집에 엎드려 사정한다',sub:'평판이 높으면 들어줄지도 모른다',p:clamp(.15+P.st.fame/300),tags:['성공하면 자식이 양인이 됨'],fn:()=>{if(chance(.15+P.st.fame/300)){k.cls='sangmin';say(`주인이 마음을 움직여 ${W(k)} ${k.name}을 풀어 주었다.`,'big');ev('freed',`${W(k)} ${k.name}이 면천되었다`);}else{fx({worry:6});say('주인은 고개를 저었다.');}}},
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
function raiseParent(toCls,why){
  if(CRANK.indexOf(P.cls)>=CRANK.indexOf(toCls))return;
  const from=CLS[P.cls].n;P.cls=toCls;P.sub='';if(P.job&&['slave'].includes(P.job.k))P.job=null;
  say(`${why}. ${from}에서 ${CLS[toCls].n}이 되었다.`,'big');ev('rise',why);note('myeoncheon');
}
/* 딸의 간택 */
function kidRoyalScene(k){
  k.ganTaek=1;note('ganjip');
  const p=clamp(.2+(k.st?k.st.look:30)/250+P.st.fame/350,.1,.75);
  return {kind:'major',title:'자식 · 딸의 간택',text:`나라에 금혼령이 내려지고 세자빈을 고른다는 명이 떨어졌다. 딸 ${k.name}의 처녀단자를 올리라는 기별이 왔다.`,opts:[
    {t:'간택에 내보낸다',sub:'딸의 매력과 집안의 평판이 중요하다',p,tags:['성공하면 딸이 세자빈, 그대는 왕실의 외척','신분·재력 크게 ↑'],fn:()=>{
      if(!chance(p)){say(`삼간택까지 갔으나 ${iga(k.name)} 끝내 뽑히지 못하였다.`);return null;}
      k.married=true;k.inlaw='왕실';k.inlawCls='royal';k.royalBride='세자빈';k.feat='세자빈으로 간택되었다';
      say(`딸 ${iga(k.name)} 세자빈으로 간택되었다! 가문에 큰 경사가 났다.`,'big');ev('kidfeat',`딸 ${k.name}`,{feat:k.feat});
      queenParentBoost(false);}},
    {t:'병을 핑계로 피한다',p:.75,safe:true,tags:['평판 조금 ↓'],fn:()=>{if(chance(.75))say(`딸이 병중이라 둘러대어 간택을 피하였다.`);else{fx({fame:-6});say('핑계가 들통나 꾸중을 들었다.');}}}]};
}
function queenParentBoost(queen){
  const U=UNIT[P.cls]||.5;
  raiseParent('yangban','딸이 왕실에 들어 왕실의 외척이 되었다');
  const t=queen?(P.female?'부부인':'부원군'):(P.female?'세자빈의 어머니':'세자빈의 아버지');
  if(!P.titles.includes(t))P.titles.push(t);
  fx({fame:queen?25:15,wealth:queen?Math.max(400,P.wealth*.5):Math.max(150,P.wealth*.3)});
  P.flags.kidSupport=(P.flags.kidSupport||0)+(queen?30:12);P.flags.queenParent=queen?2:Math.max(P.flags.queenParent||0,1);
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
    '재간택까지 통과하였다. 이제 마지막 삼간택만 남았다. 뽑히면 세자빈이 되고, 떨어지면 다른 데 시집가기도 어려워진다고 한다.'][stage];
  return {kind:'major',title:`세자빈 간택 · ${nm}`,text,opts:[
    {t:`${nm}에 나아간다`,sub:stage===0?'매력과 집안의 평판이 중요하다':stage===1?'매력과 학식(예법)이 중요하다':'매력·학식·재주를 두루 본다',p,tags:stage===2?['성공하면 세자빈','떨어지면 혼인이 어려움']:['다음 간택으로'],fn:()=>{
      if(!chance(p)){
        if(stage<2){say(`${nm}에서 떨어졌다. 금혼령이 풀리고 다시 혼담을 받을 수 있게 되었다.`);return null;}
        say('삼간택에서 끝내 뽑히지 못하였다.','big');
        return {kind:'major',title:'삼간택 낙선',text:'삼간택까지 올랐던 처녀는 왕실의 여인으로 여겨져 다른 집에 시집가기 어렵다. 궐에서 후궁으로 들어오라는 말이 전해졌다.',opts:[
          {t:'후궁으로 궁에 들어간다',p:null,tags:['신분 변화: 후궁'],fn:()=>{const k=realKing(P.year);kingSpouse(k);setJob('concubine',3);P.favor=45;say('후궁의 첩지를 받고 궁에 들었다.','big');ev('seungeun',k.n);}},
          {t:'사가에서 홀로 지낸다',p:null,safe:true,tags:['혼인이 매우 어려워짐','평판 ↑'],fn:()=>{P.flags.noMatch=P.year+8;fx({fame:6});say('궐의 부름을 사양하고 사가에서 조용히 지냈다. 한동안 혼담이 끊겼다.');}}]};
      }
      if(stage<2)return samganScene(stage+1);
      const x=newPerson({kind:'spouse',female:false,cls:'royal',born:P.year-ri(P.age-3,P.age+2),title:'세자',h:20,t:20});x.seja=true;x.status='married';x.rank=17;
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
  P.flags.gazeY=P.year;const st=P.st;const U=UNIT[P.cls]||.5;
  const k=realKing(P.year);const nearCourt=P.court||(P.job&&['official','naesi','military','akgong','sajagwan'].includes(P.job.k))||['yangban','royal'].includes(P.cls);
  const jaje=k.n==='공민왕'&&P.year>=1365;
  const king=nearCourt||jaje;
  const who=king?k.n:R(['세도가 대감','권세 높은 판서']);
  const pr=clamp(rnd()*.5+.15+st.brave/400,.1,.75);
  if(jaje)note('jajewi');else if(king)note('jajewi');
  return {kind:'major',title:king?'임금의 총애':'대감의 총애',text:king?(jaje?`임금이 용모가 빼어난 젊은이들을 뽑아 자제위를 둔다고 한다. 그대가 그 가운데 뽑혀 [[${k.n}]]의 곁에 서게 되었다. 임금의 눈길이 유난히 그대에게 머문다.`:`[[${k.n}]]이 그대를 눈여겨보고 곁에 두려 한다. 밤늦도록 그대를 불러 이야기를 청하고, 그 눈길이 예사롭지 않다.`):`${who}가 그대를 각별히 아끼며 집에 두고 곁을 지키게 하려 한다. 그 정이 예사롭지 않다는 말이 돈다.`,opts:[
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
      {t:'아이들은 내가 키운다',sub:'그 집안을 설득해야 한다',p:clamp(.35+(P.st.fame+P.st.know)/400),tags:['실패하면 아이들을 빼앗김'],fn:()=>{if(chance(.35+(P.st.fame+P.st.know)/400)){setIn(amt*.5,inlaw);say(`${inlaw}을 설득해 아이들을 곁에 두었다. 조금이나마 살림도 보태 주었다.`);}else{mine.filter(k=>!k.female).forEach(k=>k.away=1);fx({worry:20});say(`끝내 ${inlaw}에서 손자들을 데려갔다.`,'big');}}}]:[
      {t:'고맙게 받는다',p:null,tags:['해마다 살림 보탬'],fn:()=>{setIn(amt*(.8+ir*.3),inlaw);say(`${inlaw}에서 해마다 손주들 몫을 보내 주었다.`);}},
      {t:'정중히 사양한다',p:null,safe:true,tags:['평판 조금 ↑'],fn:()=>{fx({fame:3});say('마음만 고맙게 받겠다며 사양하였다.');}}]};
}
