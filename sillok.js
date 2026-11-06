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
    if(lovedMarry&&lovedMarry.elope)s+='서로 연모하여, 끝내 함께 고향을 떠났다.';
    else if(lovedMarry&&lovedMarry.bushil)s+='그의 부실이 되어 기방을 떠났다.';
    else if(lovedMarry)s+='서로 연모하다 마침내 백년가약을 맺었다.';
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

  // 혼인
  const M=[];
  for(const e of marryEv){
    const x=P.people[e.t];if(!x)continue;const nm=callOf(x);
    if(e.bushil)M.push(`${kAge(e.a)} 살에 ${nm}의 부실이 되었다.`);
    else if(x.real&&!x.kingRole)M.push(`${kAge(e.a)} 살에 세자빈으로 간택되어 ${x.real}의 배필이 되었다.`);
    else if(x.kingRole){}
    else if(e.mode==='cheop')M.push(P.female?`${kAge(e.a)} 살에 ${x.fam?x.fam+'의 ':''}${nm}의 부실이 되었다.`:`${kAge(e.a)} 살에 ${eulreul(nm)} 첩으로 들였다.`);
    else M.push(`${kAge(e.a)} 살에 ${x.fam&&!e.elope?x.fam+'의 ':''}${P.female?nm+'에게 출가하였다':eulreul(nm)+' 아내로 맞았다'}.`);
    if(!x.kingRole){const h=x.maxH;M.push(h>=70?'부부의 정이 깊었다.':h>=40?'부부 사이가 무난하였다.':'부부 사이가 소원하였다.');}
  }
  P.ev.filter(e=>e.type==='cheop').forEach(e=>M.push(`${kAge(e.a)} 살에 첩 ${eulreul(e.t)} 들였다.`));
  P.ev.filter(e=>e.type==='sobak').forEach(e=>M.push(`${kAge(e.a)} 살에 소박을 맞아 시댁을 떠났다.`));
  P.ev.filter(e=>e.type==='affair').forEach(e=>{const x=P.people[e.t];if(x)M.push(`혼인한 몸으로 ${gwawa(callOf(x))} 남몰래 정을 통하였다는 말이 전한다.`);});
  P.ev.filter(e=>e.type==='widow').forEach(e=>M.push(`${kAge(e.a)} 살에 ${P.female?'남편을':'아내를'} 여의었다.`));
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
    if(P.grand)s+=` 손주를 ${P.grand}명 보았다.`;
    S.push({h:'자식',b:s.trim()});
  } else S.push({h:'자식',b:'슬하에 자식이 없었다.'});

  // 일생
  const W=[];
  if(P.peak){const t=jobTitle(P.peak),k=P.peak.k;
    if(k==='official')W.push(`문과에 급제하여 벼슬이 ${RANKS[P.peak.lv]}에 이르렀다.`);
    else if(k==='gisaeng'&&P.peak.lv>=3)W.push('명기로 이름을 팔도에 떨쳤다.');
    else if(k==='gisaeng')W.push(`${t}로 살았다.`);
    else if(k==='concubine')W.push(`후궁으로서 ${t}의 품계에 이르렀다.`);
    else if(k==='queen'&&P.peak.lv>=1)W.push('중전의 자리에 올랐다.');
    else if(k==='queen')W.push('세자빈의 자리에 올랐다.');
    else if(k==='court')W.push(`궁녀로서 ${t}에 이르렀다.`);
    else if(k==='lady'&&P.peak.lv>=3)W.push('종가의 종부로 집안을 이끌었다.');
    else if(k==='lady')W.push(`${euro(t)}서 집안 살림을 맡았다.`);
    else if(k==='scholar')W.push(P.peak.lv?`소과에 붙어 ${iga(t)} 되었다.`:'글을 읽는 선비로 살았다.');
    else W.push(`${t}${bat(t)?'으로':'로'} 살았다.`);}
  if(P.titles.includes('임금의 어머니'))W.push('훗날 아들이 보위에 올라 임금의 어머니가 되었다.');
  P.ev.filter(e=>['freed','rise','fall','unwed'].includes(e.type)).forEach(e=>W.push(`${kAge(e.a)} 살에 ${e.t}.`));
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
  return `${m[ep]||m['난세를 살다 간 한 사람']}`;
}
function sillokText(sl){
  let t=`《${sl.title}》\n${sl.origin} · ${sl.born}–${sl.death} · 향년 ${sl.age}세\n\n`;
  for(const s of sl.sections)t+=`【${s.h}】\n${s.b.replace(/\[\[|\]\]/g,'')}\n\n`;
  if(sl.letter)t+=`【남은 서찰】\n${sl.letter.text}\n\n`;
  t+='— 조선 연애실록';
  return t;
}
