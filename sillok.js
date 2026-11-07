/* 조선 연애실록 — 실록 짓기 */
'use strict';

function buildSillok(){
  const dn=displayName();
  const S=[];
  const born=P.born<1392?`고려 ${realKing(P.born).n} 때인 ${ganji(P.born)}년`:`${reignLabel(P.born,P).replace('즉위년','즉위하던 해')} ${ganji(P.born)}년`;
  let intro=`${eunneun(dn)} 본디 ${P.region} 사람으로, ${born}(${P.born})에 ${clsWord()}의 ${P.female?'딸':'아들'}로 태어났다.`;
  if(P.female&&(P.cls==='yangban'||P.cls==='royal'))intro+=` 아명은 ${P.name}${bat(P.name)?'이라':'라'} 하였다.`;
  if(P.flags.wasGisaeng||P.sub==='gisaeng')intro+=` 기명을 ${euro(P.name)} 썼다.`;
  if(P.ancestor)intro+=` 그 ${P.ancestor.gens}대조는 지난 삶의 ${P.ancestor.name}${bat(P.ancestor.name)?'이었다':'였다'}.`;
  S.push({h:'태어남',b:intro});

  // 연애사
  const loves=Object.values(P.people).filter(x=>['love','spouse','ex'].includes(x.kind)&&!x.real&&(x.maxH>=35||['mutual','lover','crush','their','parted','married'].includes(x.status))&&x.status!=='cand').sort((a,b)=>a.metY-b.metY);
  const marryEv=P.ev.filter(e=>e.type==='marry');
  const L=[];
  for(const x of loves.slice(0,6)){
    const nm=callOf(x);const lovedMarry=marryEv.find(e=>e.t===x.id&&(e.love||e.elope||e.bushil));
    if(x.kind==='spouse'&&!lovedMarry&&x.maxH<50)continue;
    let s=`${kAge(x.metA)} 살에 ${x.place?x.place+'에서 ':''}${eulreul(nm)} 만났다. `;
    const late=lovedMarry&&lovedMarry.a-x.metA>=3;
    const between=lovedMarry&&marryEv.some(e=>e!==lovedMarry&&e.a>=x.metA&&e.a<lovedMarry.a);
    const when=lovedMarry?(lovedMarry.a===x.metA?'그해에 ':between?`그때는 맺어지지 못하였다가, 세월이 흘러 ${kAge(lovedMarry.a)} 살에 `:late?`${kAge(lovedMarry.a)} 살에 `:''):'';
    if(lovedMarry&&lovedMarry.elope)s+=between?`${when}함께 고향을 떠났다.`:`서로 연모하여, ${when}끝내 함께 고향을 떠났다.`;
    else if(lovedMarry&&lovedMarry.bushil)s+=`${when}그의 부실이 되어 기방을 떠났다.`;
    else if(lovedMarry)s+=between?`서로 마음이 있었으나 ${when}마침내 백년가약을 맺었다.`:`서로 연모하다 ${when}마침내 백년가약을 맺었다.`;
    else if(x.kind==='spouse')s+='처음에는 낯설었으나 정이 깊어졌다.';
    else if(x.status==='lover')s+='세상 몰래 정을 나누었다.';
    else if(x.status==='mutual'||(x.status==='parted'&&x.h>=55&&x.t>=55))s+='서로 마음을 주고받았으나 끝내 맺어지지 못하였다.';
    else if(x.status==='crush'||x.h>=50&&x.t<40)s+='홀로 연모하였으나 끝내 마음을 다 전하지 못하였다.';
    else if(x.status==='their'||x.t>=55&&x.h<40)s+=`그가 ${eulreul(dn)} 연모하였으나 ${dn}의 마음은 열리지 않았다.`;
    else s+='잠시 마음이 흔들렸으나 인연은 이어지지 않았다.';
    L.push(s);
  }
  if(P.realSpouse||P.job&&P.job.k==='concubine'||P.peak&&P.peak.k==='concubine'){const sp=Object.values(P.people).find(x=>x.real&&(x.kind==='spouse'));if(sp)L.push(`${sp.real==='양녕대군'||sp.real==='사도세자'?'세자':'임금'} [[${sp.real}]]의 사람이 되었다.`);}
  S.push({h:'연애사',b:L.length?L.join(' '):'평생 마음을 크게 흔든 이가 없었다 한다.'});

  // 혼인 (일어난 순서대로)
  const M=[];const T=[];const at=(a,t)=>T.push([a,T.length,t]);
  for(const e of marryEv){
    const x=P.people[e.t];if(!x)continue;const nm=callOf(x);let t='';
    if(e.bushil)t=`${kAge(e.a)} 살에 ${nm}의 부실이 되었다.`;
    else if(x.real&&!x.kingRole)t=`${kAge(e.a)} 살에 세자빈으로 간택되어 ${x.real}의 배필이 되었다.`;
    else if(x.kingRole){}
    else if(e.mode==='cheop')t=P.female?`${kAge(e.a)} 살에 ${x.fam?x.fam+'의 ':''}${nm}의 부실이 되었다.`:`${kAge(e.a)} 살에 ${eulreul(nm)} 첩으로 들였다.`;
    else t=`${kAge(e.a)} 살에 ${x.fam&&!e.elope?x.fam+'의 ':''}${P.female?nm+'에게 출가하였다':eulreul(nm)+' 아내로 맞았다'}.`;
    if(!x.kingRole){const h=x.maxH;t+=' '+(h>=70?'부부의 정이 깊었다.':h>=40?'부부 사이가 무난하였다.':'부부 사이가 소원하였다.');}
    if(t)at(e.a,t.trim());
  }
  P.ev.filter(e=>e.type==='cheop').forEach(e=>at(e.a,`${kAge(e.a)} 살에 첩 ${eulreul(e.t)} 들였다.`));
  P.ev.filter(e=>e.type==='sobak'&&!P.ev.some(d=>d.type==='divorce'&&d.a===e.a)).forEach(e=>at(e.a,`${kAge(e.a)} 살에 소박을 맞아 시댁을 떠났다.`));
  P.ev.filter(e=>e.type==='divorce').forEach(e=>at(e.a+.3,e.why==='소박'?`${kAge(e.a)} 살에 소박을 맞아 ${gwawa(e.t)} 갈라섰다.`:e.byMe?`${kAge(e.a)} 살에 ${gwawa(e.t)} 갈라섰다.`:`${kAge(e.a)} 살에 ${iga(e.t)} 떠나 갈라섰다.`));
  P.ev.filter(e=>e.type==='affair').forEach(e=>{const x=P.people[e.t];if(x)at(e.a,`혼인한 몸으로 ${gwawa(callOf(x))} 남몰래 정을 통하였다는 말이 전한다.`);});
  P.ev.filter(e=>e.type==='widow').forEach(e=>at(e.a+(marryEv.some(m=>m.a===e.a&&P.people[m.t]&&[P.people[m.t].title,P.people[m.t].name].includes(e.t))?.5:-.5),`${kAge(e.a)} 살에 ${P.female?'남편을':'아내를'} 여의었다.`));
  T.sort((x,y)=>x[0]-y[0]||x[1]-y[1]).forEach(r=>M.push(r[2]));
  if(!marryEv.length){
    if(P.court||P.peak&&P.peak.k==='court')M.push('궁녀로 평생을 궁에서 보냈다.');
    else if(P.flags.togetherWith)M.push('혼례는 올리지 못하였으나, 마음을 나눈 이와 한집에 살았다.');
    else if(P.age>=25)M.push('평생 혼인하지 않았다.');
    else M.push('혼인하기 전에 세상을 떠났다.');
  }
  S.push({h:'혼인',b:M.join(' ')});

  // 자식
  const kids=P.kids;
  if(kids.length){
    const bio=kids.filter(k=>!k.adopted),ad=kids.filter(k=>k.adopted);
    const sons=bio.filter(k=>!k.female).length,dau=bio.filter(k=>k.female).length;
    let s=bio.length?`슬하에 ${eulreul((sons?sons+'남':'')+(sons&&dau?' ':'')+(dau?dau+'녀':''))} 두었다.`:'';
    if(ad.length)s+=` ${eulreul(ad.map(k=>k.name).join(', '))} ${ad.some(k=>!k.female&&['yangban','royal','jungin'].includes(P.cls))?'양자로':'수양자식으로'} 들였다.`;
    const lost=kids.filter(k=>!k.alive&&k.dy&&k.dy-k.born<15);if(lost.length)s+=` 그 가운데 ${eunneun(lost.map(k=>k.name).join(', '))} 일찍 잃었다.`;
    const wed=kids.filter(k=>k.inlaw).slice(0,3);wed.forEach(k=>{s+=` ${k.female?'딸':'아들'} ${eunneun(k.name)} ${gwawa(k.inlaw)} 혼인하였다.`;});
    if(P.ev.some(e=>e.type==='twins'))s+=' 쌍둥이를 얻는 경사도 있었다.';
    kids.filter(k=>k.feat).slice(0,3).forEach(k=>{s+=` ${k.female?'딸':'아들'} ${eunneun(k.name)} ${k.feat}.`;});
    if(P.grand)s+=` 손주를 ${P.grand}명 보았다.`;
    S.push({h:'자식',b:s.trim()});
  } else S.push({h:'자식',b:'슬하에 자식이 없었다.'});

  // 일생
  const W=[];
  const jobLine=(k,lv)=>{const t=jobTitle({k,lv});
    if(k==='official')return `문과에 급제하여 벼슬이 ${RANKS[lv]}에 이르렀다.`;
    if(k==='military')return lv?`무과에 급제하여 무관으로서 ${t.replace(/\(.*\)/,'')}에 이르렀다.`:'무과를 준비하며 무예를 닦았다.';
    if(k==='gisaeng')return lv>=3?'명기로 이름을 팔도에 떨쳤다.':`${t}로 살았다.`;
    if(k==='concubine')return `후궁으로서 ${t}의 품계에 이르렀다.`;
    if(k==='queen')return lv>=1?'중전의 자리에 올라 국모가 되었다.':'세자빈의 자리에 올랐다.';
    if(k==='king')return '보위에 올라 임금이 되었다.';
    if(k==='naesi')return lv>=4?'내시로서 내시부의 으뜸인 상선에 올라 궐 안 살림을 쥐었다.':`거세하고 내시가 되어 ${t}에 이르렀다.`;
    if(k==='chongsin')return lv>=2?'임금의 총애를 등에 업고 권신이 되어 조정을 흔들었다.':'임금의 총애를 받는 총신이 되었다.';
    if(k==='namchong')return '권세가 대감의 총애를 받으며 그 댁에 머물렀다.';
    if(k==='royalwife')return `${P.cls==='royal'?'':'신분의 벽을 넘어 '}왕실에 시집가 ${iga(t)} 되었다.`;
    if(k==='sosil')return '권세가의 소실(부실)이 되어 살았다.';
    if(k==='buma')return '공주(옹주)와 혼인하여 부마가 되었다.';
    if(k==='court')return `궁녀로서 ${t}에 이르렀다.`;
    if(k==='lady')return lv>=3?'종가의 종부로 집안을 이끌었다.':`${euro(t)}서 집안 살림을 맡았다.`;
    if(k==='housewife')return lv>=2?'안주인으로 집안 살림을 도맡았다.':'혼인하여 한 집안의 살림을 꾸렸다.';
    if(k==='scholar')return lv?`소과에 붙어 ${iga(t)} 되었다.`:'글을 읽는 선비로 살았다.';
    if(k==='slave')return null;
    return `${t}${bat(t)?'으로':'로'} 살았다.`;};
  const order=P.jobOrder&&P.jobOrder.length?P.jobOrder:(P.peak?[P.peak.k]:[]);
  /* 학생 시절이 벼슬로 이어졌으면 앞의 것은 생략 */
  const skip=new Set();if(order.includes('official'))skip.add('scholar');if(order.includes('queen')&&P.jobBest&&P.jobBest.queen>=1)skip.add('royalwife');if(order.includes('lady')&&order.includes('housewife'))skip.add('housewife');
  const JL=order.filter(k=>!skip.has(k)).map(k=>jobLine(k,P.jobBest&&P.jobBest[k]!=null?P.jobBest[k]:(P.peak&&P.peak.k===k?P.peak.lv:0))).filter(Boolean);
  JL.slice(0,5).forEach(t=>W.push(t));
  if(P.post&&typeof POSTS!=='undefined'&&P.postK&&POSTS[P.postK]){const o=POSTS[P.postK].opts.find(x=>x.k===P.post);if(o)W.push(`${o.t}에서 일하였다.`);}
  if(P.titles.includes('임금의 어머니'))W.push('훗날 아들이 보위에 올라 임금의 어머니가 되었다.');
  P.ev.filter(e=>['freed','rise','fall','unwed'].includes(e.type)).forEach(e=>W.push(`${kAge(e.a)} 살에 ${e.t}.`));
  if(P.ev.some(e=>e.type==='sujeol'))W.push('남편을 여읜 뒤 평생 수절하였다.');
  P.ev.filter(e=>e.type==='jeongnyeo').forEach(e=>W.push(`${kAge(e.a)} 살에 나라에서 열녀문을 내려 그 절개를 기렸다.`));
  P.ev.filter(e=>e.type==='exile').forEach(e=>W.push(`${kAge(e.a)} 살에 ${euro(e.t)} 유배되기도 하였다.`));
  const wars=[...new Set(P.ev.filter(e=>e.type==='war').map(e=>e.t))];if(wars.length)W.push(`${wars.join(', ')}의 난리를 겪었다.`);
  P.ev.filter(e=>e.type==='rare').forEach(e=>W.push(e.t));
  if(W.length)S.push({h:'일생',b:W.join(' ')});

  if(P.alt){S.push({h:'정사와 다른 역사',b:`정사(正史)와 달리, 이 판에서는 ${P.alt.line}`,alt:true});}

  const letter=P.letters.slice().sort((a,b)=>b.h-a.h)[0]||null;

  let end;
  if(P.closed)end=`${P.year}년 경술년에 나라가 저물어, 이 실록도 여기서 닫혔다. 그때 나이 ${P.age}세였다.`;
  else end=`${reignLabel(P.year,P).replace('즉위년','즉위하던 해')} ${ganji(P.year)}년(${P.year}), ${P.age}세에 ${P.cause||causeText()} 세상을 떠났다.${P.last?` 마지막에 "${P.last.replace(/[.。]+$/,'')}" 하였다 한다.`:''}`;
  if(P.heirs)end+=' '+P.heirs;
  S.push({h:'마지막',b:end});

  const ep=epithet();
  S.push({h:'사신(史臣)은 논한다',b:verdict(ep,dn),verdict:true});
  return {title:`${dn} 연애실록`,epithet:ep,sections:S,letter:letter?{from:letter.from,to:letter.to,text:letter.text,poem:letter.poem,y:letter.y}:null,born:P.born,death:P.deathYear,age:P.age,origin:originText(P),name:dn};
}
function epithet(){
  const sp=Object.values(P.people).find(x=>x.kind==='spouse');
  const loveMarry=P.ev.some(e=>e.type==='marry'&&(e.love||e.elope));
  const lover=Object.values(P.people).some(x=>x.status==='lover');
  const crush=Object.values(P.people).some(x=>x.kind==='love'&&x.h>=55&&x.t<40);
  if(P.alt)return '역사를 바꾼 사람';
  if(P.flags.rare_namjang)return '이름 없는 급제자';
  if(P.flags.rare_gisaeng2lady)return '기녀에서 정경부인에 오른 사람';
  if(P.peak&&P.peak.k==='queen'&&P.peak.lv>=1)return '중전에 오른 사람';
  if(P.peak&&P.peak.k==='concubine'&&P.peak.lv>=7)return '임금의 총애를 받은 여인';
  if(P.peak&&P.peak.k==='gisaeng'&&P.peak.lv>=3)return '한 시대를 풍미한 명기';
  if(P.flags.elope)return '사랑을 따라 길을 떠난 사람';
  if(loveMarry&&sp&&sp.maxH>=70)return '연모한 이와 백년해로한 사람';
  if(lover&&!P.ev.some(e=>e.type==='marry'))return '세상 몰래 사랑한 사람';
  if(P.age<25)return '피어 보지 못한 꽃';
  if(crush)return '이루지 못한 연모를 품고 간 사람';
  if(P.peak&&P.peak.k==='official'&&P.peak.lv>=12)return '조정에 이름을 남긴 사람';
  if(P.ev.some(e=>e.type==='freed'))return '신분의 굴레를 벗은 사람';
  if(P.kids.filter(k=>k.alive).length>=5)return '자손이 번성한 사람';
  if(sp&&sp.maxH>=75)return '정 깊은 부부로 산 사람';
  if(P.age>=75)return '긴 세월을 견딘 사람';
  return '난세를 살다 간 한 사람';
}
function verdict(ep,dn){
  const m={
    '역사를 바꾼 사람':`한 사람의 선택이 나라의 앞날을 바꾸었다. 정사에는 남지 않을 이름이나, 이 판의 역사는 ${eulreul(dn)} 잊지 못할 것이다.`,
    '이름 없는 급제자':'사내의 옷을 빌려 입고서야 제 글을 세상에 내보일 수 있었으니, 그 이름이 방에 붙던 날의 기쁨과 쓸쓸함을 누가 알겠는가.',
    '기녀에서 정경부인에 오른 사람':'천한 기적에서 시작하여 정경부인에 이르렀으니, 세상의 법도가 한 사람의 운을 다 막지는 못하였다.',
    '중전에 오른 사람':'구중궁궐의 가장 높은 자리에 올랐으나, 그 자리에 오르기까지 몇 번이나 마음을 졸였을지 헤아리기 어렵다.',
    '임금의 총애를 받은 여인':'임금의 사랑은 따뜻하였으나 궁의 바람은 늘 차가웠다. 그 사이에서 끝내 제자리를 지켰다.',
    '한 시대를 풍미한 명기':'그 노래와 춤을 본 이들은 평생 잊지 못하였다 한다. 신분은 천하였으나 이름은 천하지 않았다.',
    '사랑을 따라 길을 떠난 사람':'가문도 재물도 버리고 마음 하나를 따라갔다. 세상은 손가락질하였으나 그 길을 후회하였다는 말은 전하지 않는다.',
    '연모한 이와 백년해로한 사람':'중매가 아닌 마음으로 맺은 인연을 끝까지 지켰으니, 그 시대에 드문 복이었다.',
    '세상 몰래 사랑한 사람':'드러내지 못한 사랑이었으나, 그 마음만큼은 누구보다 깊었다.',
    '피어 보지 못한 꽃':'꽃봉오리가 미처 피기도 전에 졌다. 남은 이들의 슬픔이 오래갔다.',
    '이루지 못한 연모를 품고 간 사람':'끝내 전하지 못한 마음을 가슴에 품고 갔다. 그 사람은 이 마음을 알았을까.',
    '조정에 이름을 남긴 사람':'붓 한 자루로 벼슬길에 올라 조정에 이름을 남겼다.',
    '신분의 굴레를 벗은 사람':'태어날 때 정해진 굴레를 스스로 벗어던졌으니, 그 걸음이 가볍지 않았다.',
    '자손이 번성한 사람':'자손이 번성하여 집안이 북적였다. 그 웃음소리가 곧 이 사람의 복이었다.',
    '정 깊은 부부로 산 사람':'처음에는 낯선 사이였으나 세월이 정을 만들었다. 그 정이 평생을 버티게 하였다.',
    '긴 세월을 견딘 사람':'많은 이를 먼저 보내고 오래 살았다. 그 세월의 무게를 홀로 견디었다.',
    '난세를 살다 간 한 사람':'크게 이름을 남기지는 않았으나, 제 몫의 사랑과 슬픔을 다 겪고 갔다.'
  };
  /* 첫머리: 별호에 맞춘 한마디 */
  const GEN=['크게 이름을 남기지는 않았으나, 제 몫의 사랑과 슬픔을 다 겪고 갔다.','화려하지는 않았으나 하루하루를 묵묵히 살아 냈다.','세상의 큰 물결 속에서 작은 배 한 척처럼 제 길을 저어 갔다.','남들 눈에 띄는 삶은 아니었으나, 곁에 있던 이들에게는 그 하나가 온 세상이었다.'];
  const head=ep==='난세를 살다 간 한 사람'||!m[ep]?R(GEN):m[ep];
  /* 삶의 여러 면을 두루 짚는다 */
  const T=[];const add=(w,t)=>T.push([w,t]);
  const pk=P.peak,jt=pk?jobTitle(pk):'';
  if(pk&&pk.k==='official'&&pk.lv>=12)add(5,R([`붓 한 자루로 ${RANKS[pk.lv]}에 이르렀으니 조정에서 그 이름을 모르는 이가 없었다.`,`벼슬이 ${RANKS[pk.lv]}에 이르렀으나, 높은 자리일수록 바람도 거세었다.`]));
  else if(pk&&pk.k==='official')add(3,R(['벼슬길에 나아갔으나 크게 현달하지는 못하였다. 그래도 맡은 고을의 백성들은 그를 기억하였다.','작은 벼슬이나마 성실히 지켰다.']));
  if(pk&&pk.k==='military'&&pk.lv>=4)add(5,`활과 칼로 ${jt.replace(/\(.*\)/,'')}에 올랐으니, 변방의 바람이 그를 단련하였다.`);
  if(pk&&pk.k==='scholar'&&pk.lv===0&&P.age>=40)add(3,'평생 과거에 매달렸으나 끝내 이름을 올리지 못하였다. 그래도 글 읽는 소리는 그치지 않았다.');
  if(pk&&pk.k==='merchant'&&pk.lv>=2)add(4,'맨손으로 시작해 거상이 되었으니, 장사의 눈이 남달랐다.');
  if(pk&&pk.k==='farmer'&&pk.lv>=2)add(3,'땅을 일구어 부농이 되었다. 흙은 정직하여 흘린 땀만큼 돌려주었다.');
  if(pk&&['doctor','uinyeo'].includes(pk.k)&&pk.lv>=2)add(4,'그 손을 거쳐 살아난 이가 적지 않았다.');
  if(pk&&['painter','yein','gwangdae','weaver'].includes(pk.k)&&pk.lv>=2)add(4,'그 솜씨는 사람들 입에 오래 오르내렸다.');
  if(pk&&pk.k==='court'&&pk.lv>=2)add(4,`평생을 궁에서 보내며 ${jt}에 이르렀다. 담장 안의 세월은 길고도 고요하였다.`);
  if(P.ev.some(e=>e.type==='freed'))add(5,'태어날 때 정해진 굴레를 벗었으니, 그 걸음이 가볍지 않았다.');
  if(P.ev.some(e=>e.type==='exile'))add(4,R(['한때 유배의 쓴맛을 보았으나 꺾이지 않았다.','유배지의 바람을 맞으며 세상의 무상함을 알았다.']));
  const wars=P.ev.filter(e=>e.type==='war').length;if(wars)add(3,R(['난리를 겪고도 살아남았으니 그것만으로도 장한 일이었다.','전란의 불길 속에서 목숨을 부지하였다.']));
  if(P.flags.charity)add(5,'흉년에 곳간을 열어 굶주린 이웃을 먹였으니, 고을 사람들이 오래도록 그 덕을 일컬었다.');
  if(P.flags.filial)add(4,'병든 부모를 곁에서 모셨으니 효성이 지극하였다.');
  if(P.flags.bigHome)add(2,'살림을 일으켜 집을 넓혀 지었다.');
  if(P.wealth>={royal:3000,yangban:600,jungin:400,sangmin:120,cheonmin:30}[P.cls])add(3,P.kids.some(k=>k.alive)?'재물이 넉넉하여 자손에게 걱정을 남기지 않았다.':'재물이 넉넉하여 평생 궁색함을 몰랐다.');
  else if(P.wealth<1&&P.age>=40)add(2,'가난을 벗어나지 못하였으나 비굴하지 않았다.');
  const liveKids=P.kids.filter(k=>k.alive).length,lost=P.kids.filter(k=>!k.alive).length;
  if(lost>=2)add(4,'자식을 여럿 먼저 보내는 아픔을 겪었다. 그 슬픔은 말로 다할 수 없었다.');
  if(liveKids>=4)add(3,'자손이 번성하여 집안에 웃음소리가 끊이지 않았다.');
  if(P.kids.length===0&&P.age>=40)add(2,'슬하에 자식은 없었으나, 그 마음은 다른 이들에게 고루 나누어졌다.');
  if(P.kids.some(k=>k.feat))add(4,'자식들을 잘 길러 저마다 제 몫을 하게 하였다.');
  if(P.st.fame>=75)add(3,'세상의 평판이 높아 그를 아는 이마다 칭송하였다.');
  else if(P.st.fame<=15&&P.age>=30)add(3,'세상의 손가락질을 받기도 하였으나, 사람의 일은 겉으로만 알 수 없는 법이다.');
  if(P.st.know>=85)add(2,'학식이 깊어 그와 이야기를 나눈 이들은 모두 탄복하였다.');
  if(P.st.art>=85)add(2,'손끝에서 나온 것마다 사람들의 눈길을 붙잡았다.');
  if(P.st.brave>=85)add(2,'무예가 뛰어나고 담대하여 위험 앞에서 물러서는 법이 없었다.');
  if(P.age>=80)add(3,`${kAge(P.age)} 해를 살았으니 그 시대에 보기 드문 장수였다.`);
  else if(P.age<30&&P.age>=18)add(4,'너무 이른 나이에 떠나, 남은 이들의 슬픔이 컸다.');
  if(P.flags.elope)add(3,'사랑을 위해 고향과 가문을 버린 일은 두고두고 이야깃거리가 되었다.');
  if(P.cheopN>=2)add(2,'처첩을 여럿 두어 집안이 늘 시끄러웠다.');
  if(P.ev.some(e=>e.type==='sobak'))add(3,'소박을 맞는 수모를 겪고도 스스로를 일으켜 세웠다.');
  /* 무게에 따라 한두 가지를 고르되, 첫머리와 겹치지 않게 */
  const pick=[];const KW=['손가락질','이름','자손','부부','사랑'];const pool=T.filter(([,t])=>!head.includes(t.slice(0,8))&&!KW.some(k=>head.includes(k)&&t.includes(k))&&!(/백년해로|정 깊은/.test(ep)&&/소박/.test(t)));
  for(let i=0;i<2&&pool.length;i++){const t=wpick(pool.map((x,j)=>[j,x[0]]));pick.push(pool[t][1]);pool.splice(t,1);}
  const tail=R(['','','후세가 그 삶을 어떻게 여길지는 알 수 없으나, 제 몫의 세월을 다 살았다.','한 사람의 일생으로 보면 모자람도 넘침도 있었으니, 그것이 곧 사람의 삶이다.',...(head.includes('이름')?[]:['그 이름은 크게 남지 않았으나 그를 아는 이들의 마음에는 오래 남았다.'])]);
  return [head,...pick,tail].filter(Boolean).join(' ');
}
function sillokText(sl){
  let t=`《${sl.title}》\n${sl.origin} · ${sl.born}–${sl.death} · 향년 ${sl.age}세\n\n`;
  for(const s of sl.sections)t+=`【${s.h}】\n${s.b.replace(/\[\[|\]\]/g,'')}\n\n`;
  if(sl.letter)t+=`【남은 서찰】\n${sl.letter.text}\n\n`;
  t+='— 조선 연애실록';
  return t;
}
