import {GUIDE_TOPICS,sectionName,EVENTS} from './kdc.js';
// Deterministic, saved-state service rules. Timers use active real seconds.
export const SERVICE_LIMIT=30, MAX_INQUIRIES=4, SHIFT_SECONDS=360;
export const CHANNELS={phone:'전화',face:'대면',board:'게시판',national:'국민신문고',city:'시청 전화',supervisor:'상급자 질책'};
export const SERVICE_POLICY=[['운영시간','평일 09:00–18:00, 월요일 휴관'],['대출 권수','1인 5권까지 대출 가능'],['대출증','신분증 지참 → 데스크 본인 확인 → 회원 가입 및 발급'],['반납 누락','회원번호와 책 정보 확인 → 반납함·처리 기록 확인 → 결과 안내'],['프로그램','홈페이지 프로그램 메뉴에서 신청. 정원이 차면 대기 등록'],['24시간 개방','현재 운영시간을 설명하고 건의 접수. 임의로 개방을 약속하지 않음'],['주요 시설','2층 열람실, 1층 어린이자료실·자료실·전시 공간'],['프린트','1층 복사·출력 코너, A4 흑백 1면 50원'],['분실 도서','동일 도서 변상 가능 여부를 확인하고 데스크에서 안내. 바로 재대출하지 않음']];
export const PHONE_TOPICS=[
 {id:'loan-count',subject:'대출 가능 권수',question:'한 번에 책 몇 권까지 빌릴 수 있나요?',answers:[['1인 5권까지 대출할 수 있습니다.','correct'],['1인 25권까지 가능합니다.','wrong'],['잘 모르겠어요 제가 신입이라','rude']]},
 {id:'hours',subject:'도서관 운영시간',question:'오늘 몇 시까지 하나요? 휴관일도 알려 주세요.',answers:[['평일은 오전 9시부터 오후 6시까지이고, 월요일은 휴관입니다.','correct'],['밤 10시까지 운영합니다.','wrong'],['평일에는 문열고, 주말에 쉬었나? 평일만 열어요.','rude']]},
 {id:'card',subject:'대출증 발급 방법',question:'처음 왔는데 대출증은 어떻게 만드나요?',answers:[['신분증을 지참해 데스크에서 본인 확인 후 발급을 도와드릴게요.','correct'],['신분 확인 없이 아무 카드나 대출증으로 쓰시면 돼요.','wrong'],['그것까지 하나하나 알려드려야 해요?','rude']]},
 {id:'unreturned',subject:'반납했는데 대출 중으로 표시되는 책',question:'책을 반납했는데 아직 대출 중이라고 나와요!',answers:[['회원번호와 책 정보를 확인하고 반납함 및 처리 기록을 확인한 뒤 안내하겠습니다.','correct'],['이미 반납하셨으면 화면은 무시하세요. 확인은 안 해도 됩니다.','wrong'],['제 잘못은 아닌 것 같은데요. 알아서 하세요.','rude']]},
 {id:'program',subject:'뜨개질 행사 일정과 접수',question:'뜨개질 배우는 강좌 신청하고싶어요. 언제 해요? 몇 명 받나요?',answers:[['10월 10일 토요일 14시부터 16시, 1층 문화교실에서 12명까지 참여하며 홈페이지로 접수합니다.','correct'],['10월 11일 밤 8시에 세미나실에서 열고, 전화 접수로 20명까지 됩니다.','wrong'],['제가 담당자가 아니라서 잘 몰라요. 사무실 가서 물어보실래요?','rude']]},
 {id:'travel',subject:'세계 여행 행사 전화 접수',question:'세계 여행 강좌? 관심있는데 그게 뭐에요?',answers:[['10월 14일 수요일 16시부터 17시, 1층 전시 공간에서 20명까지 참여하며 전화 또는 데스크 방문으로 접수합니다.','correct'],['전화 접수는 안받고 있어요. 사무실로 가셔서 신청해야해요.','wrong'],['1층 아동자료실 앞에서 전시하는 행사입니다. 인원수 제한은 없으세요.','rude']]},
 {id:'children',subject:'어린이 책 탐험 행사',question:'사서와 함께하는 어린이 책 탐험 신청하고 싶어요. 2층에서 하면 되나요?',answers:[['1층 어린이자료실에서 하고 있어요. 홈페이지로 접수하시면 되는데 도와드릴까요?','correct'],['그런 행사는 없는걸로 알고있는데요. 저는 전해들은게 없어요.','wrong'],['','rude']]},
 {id:'allnight',subject:'도서관 24시간 개방 요구',question:'제가 새벽 두 시에 책 보고 싶은데 24시간 열어 주세요!',answers:[['현재 운영시간은 9시부터 18시까지입니다. 24시간 개방 의견은 건의로 접수하겠습니다.','correct'],['알겠습니다. 오늘부터 제가 혼자 24시간 열겠습니다.','wrong'],['그럼 사서도 24시간 서 있어야 하나요? 집에 가세요.','rude']]},
 {id:'facilities',subject:'열람실과 주요 시설 유무',question:'열람실 있나요? 아이랑 갈 공간도 있나요?',answers:[['2층에 열람실이 있고, 1층에 어린이자료실과 자료실, 전시 공간이 있습니다.','correct'],['열람실도 어린이 공간도 없고 북카트에 앉으시면 됩니다.','wrong'],['도서관인데 책만 보면 되지 뭘 그렇게 찾으세요?','rude']]},
 {id:'printing',subject:'프린트기 위치와 출력 요금',question:'프린트할 수 있나요? 한 장에 얼마예요?',answers:[['복사 및 출력 가능하시고, A4 흑백은 1면 50원입니다.','correct'],['흑백 100원, 컬러 600원입니다.','wrong'],['제 컴퓨터에서 출력해드릴게요.','rude']]},
 {id:'lost',subject:'대출 도서 분실 처리',question:'빌린 책을 잃어버렸어요. 어떻게 해야 하나요?',answers:[['대출증 보여주시면 확인해드릴게요. 동일한 책으로 사오시면 됩니다.','correct'],['주무관님께 여쭤볼게요 잠시만요','wrong'],['돈으로 변상해주시면 되시고, 현금만 받습니다.','rude']]}
];
const NAMES=['하린','민준','지우','도윤','서연','유나','현우','은지','준서','수빈','영희','철수','복순','정호','미정','태식'];
const RANTS=[
 '국민의 세금으로 운영되는 주제에 이런 식으로 일합니까?',
 '내가 세금을 얼마나 내는데, 지역 주민을 무시하는겁니까?',
 '그러고도 사서입니까? 할 일도 없어보이더만.',
 '내가 이 지역에서 30년 살았어요. 지역 주민한테 무슨짓입니까?',
 '너가 여기 도서관 담당자야? 징계 내리라고 민원 올리겠어',
 '여기 제일 높은사람 누구야? 이야기좀 해야겠어.',
 '일처리를 왜이렇게 못해요? 내가 사서해도 되겠다.',
 '하....ㅋㅋ 진짜 짜증나게하네.',
 '여기 온지 얼마 안되었죠? 그래 보이네.',
 '내가 국민신문고 올릴거야.',
 '(사서의 얼굴 사진을 찍으며) 니가 누군지 기억해둘거야.',
 '공공기관 수준이 이것밖에 안돼?',
 '존나짜증나네. 이딴 도서관 처음봐.',
 '너 공무원 아니야? 아...ㅋㅋ 계약직이라고? 그러니까 계약직이지.',
 '학생. 여기 일하는거 처음이지? 주변사람들 좀 보고 배워',
 '여기 민원 올리려면 어떻게하면되나요?'
];
const LIGHT_RANTS=['잘못된 서가까지 따라갔습니다. 다음에는 분류표를 확인하고 안내해 주세요.','책을 찾으러 왔는데 엉뚱한 곳을 안내받았습니다. 친절한 설명을 부탁드립니다.','사서 안내를 믿고 찾아봤는데 그런 책이 없었습니다. 안내가 조금 더 정확했으면 합니다.','제가 찾던 책과 다른 분류였습니다. 선임께 안내 방법을 확인해 주셨으면 합니다.'];
const OPENERS={phone:['이용자가 어제 처리되지 않은 문의에 대해 전화로 항의했다.','전날 응대에 대한 전화 민원이 접수되었다.'],face:['내가 퇴근한 사이에 이용자가 화를 내고 갔다고 한다.','민원인이 사무실에 와서 화를 내고 갔다. 상사가 대신 사과했다.'],board:['게시판 민원이 들어왔다. 교양없는 사서라는 욕이 올라왔다.','게시판에 사서의 불친절에 대한 글이 올라왔다. 생김새 묘사를 보니 내 이야기이다.'],national:['국민신문고 민원이 들어왔다. 자료실 담당 주무관님이 한숨을 쉬며 짜증내셨다.','국민신문고 민원이 들어왔다. 내 생김새 묘사와 원색적인 비난이 가득했다.'],city:['어제 불만을 가진 이용자가 시청에 전화를 했다고 한다.','시청에서 민원을 전달했다. 관할 부서를 찾으며 해고하라고 소리질렀다고 한다'],supervisor:['이용자가 팀장에게 말했고, 팀장에게 주의를 받았다.','이용자가 관장에게 항의했다. 아침부터 관장실로 호출되었다.','자료실 담당 주무관님이 불렀다. “여기 민원 많은 도서관이라고 안들었어요?”','과장이 민원을 전달했다. “처음에는 그럴 수 있죠. 근데 앞으로는 그러지 말아야죠.”']};
export function random(state){state.rng=((state.rng||122)*1664525+1013904223)>>>0;return state.rng/4294967296}
export function pick(state,items){return items[Math.floor(random(state)*items.length)]}
export function shuffle(state,items){let list=[...items];for(let i=list.length-1;i>0;i--){let j=Math.floor(random(state)*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list}
export const deskLimit=day=>day>=3?3:2;
export const unresolved=n=>n.kind!=='roam'&&!n.resolved&&!['gone','leaving'].includes(n.status);
export const activeEscort=state=>state.npcs.find(n=>unresolved(n)&&(n.guiding||n.escortActive||n.status==='searching'));
export function extendPatronDeadlines(state,seconds,excludeId){for(let n of state.npcs)if(n.id!==excludeId&&n.mode!=='phone'&&unresolved(n)&&n.deadline!=null&&!n.timerStopped)n.deadline+=seconds}
export function deferGuideRequest(state,n){if(!unresolved(n)||n.waitUsed||n.guiding||(n.deadline!=null&&state.elapsed>=n.deadline))return false;n.waitUsed=true;n.waitPosition={x:n.x,z:n.z};n.deadline=state.elapsed+30;n.lastAction='잠시만요라고 안내하고 업무 후 응대하기로 함';return true}
export const activeRequests=state=>state.npcs.filter(n=>unresolved(n)||n.status==='searching');
export const secondsLeft=(state,n)=>n.deadline==null?SERVICE_LIMIT:Math.max(0,n.deadline-state.elapsed);
export function initServiceDay(state){state.elapsed=0;state.nextSpawn=10+random(state)*20;state.nextId=0;state.shiftClosed=false;state.morningPending=true;state.failures=[];state.spawnCount=0;state.answered=0;state.npcs=[];state.complaints??=[];state.nationalDays??=[];state.reviews??=[];state.inbox??=[];state.rng??=122}
export function activateRequest(state,n){if(n.deadline==null&&!n.resolved&&!n.timerStopped){n.requestedAt=state.elapsed;n.deadline=state.elapsed+SERVICE_LIMIT;n.lastAction='아직 응대하지 않음'}return n}
export function acceptGuideRequest(state,n){let other=activeEscort(state);if((other&&other.id!==n.id)||!unresolved(n)||n.guiding||n.guideAccepted||!n.guide||(n.deadline!=null&&state.elapsed>=n.deadline))return false;n.guideAccepted=true;n.bubble=null;n.guiding=true;n.status='guiding';n.deadline=state.elapsed+SERVICE_LIMIT;n.lastAction='네, 알겠습니다라고 말하고 서가로 안내 중';return true}
export function allowedModes(state){let active=activeRequests(state);if(active.length>=MAX_INQUIRIES)return [];let modes=['approach'];if(active.filter(n=>n.mode==='desk'&&!n.guiding&&n.status!=='searching').length<deskLimit(state.day))modes.push('desk');if(!active.some(n=>n.mode==='kiosk'))modes.push('kiosk');if(!active.some(n=>n.mode==='phone'))modes.push('phone');return modes}
export function spawnRequest(state,mode){let modes=allowedModes(state);if(!modes.includes(mode))return null;let serial=++state.nextId,category=Math.floor(random(state)*10),kind=mode==='kiosk'?'issue':mode==='phone'||mode==='approach'?'question':pick(state,['question','loan','return','issue']);let n={id:`d${state.day}-n${serial}`,name:pick(state,NAMES),mode,kind,category,x:0,z:10,angle:Math.PI,walk:0,status:mode==='phone'?'ringing':'walking',path:[],routeAt:0,roamIndex:serial%4,arrival:state.elapsed,wait:0,resolved:false,served:false,deadline:null,answered:false,subject:'',lastAction:'아직 응대하지 않음'};
 n.topic=mode==='phone'?pick(state,PHONE_TOPICS).id:null;
 if(mode!=='phone'&&kind==='question'){let topic=pick(state,GUIDE_TOPICS);n.guide={...topic,request:pick(state,topic.requests)};n.category=Math.floor(Number(n.guide.section)/100)}
 n.subject=mode==='phone'?PHONE_TOPICS.find(t=>t.id===n.topic).subject:kind==='question'?`${n.guide.subject} 책 위치 (${n.guide.section} ${sectionName(n.guide.section)})`:kind==='loan'?'도서 대출 요청':kind==='return'?'도서 반납 요청':mode==='kiosk'?'무인 대출반납기 오류':'안내 프린터 출력 오류';
 if(mode==='phone')activateRequest(state,n);state.npcs.push(n);state.spawnCount++;return n
}
export function advanceArrivals(state){if(state.shiftClosed||state.ended||state.elapsed<state.nextSpawn||state.elapsed>SHIFT_SECONDS-30)return null;state.nextSpawn=state.elapsed+10+random(state)*20;let modes=allowedModes(state);if(!modes.length)return null;
 // One visitor or telephone event per 10–30-second interval, no catch-up burst.
 if(random(state)<.16&&state.npcs.filter(n=>n.kind==='roam'&&!['gone','leaving'].includes(n.status)).length<3){let n={id:`d${state.day}-r${++state.nextId}`,name:pick(state,NAMES),kind:'roam',mode:'roam',x:0,z:10,angle:Math.PI,walk:0,status:'walking',path:[],routeAt:0,roamIndex:state.nextId%4,arrival:state.elapsed,resolved:true};state.npcs.push(n);state.spawnCount++;return n}
 return spawnRequest(state,pick(state,modes))
}
export function resolveRequest(state,n){if(n.resolved)return false;n.resolved=true;n.served=true;n.status=n.mode==='phone'?'gone':'leaving';state.answered++;if(state.stats&&!n.serviceCounted){state.stats.services++;n.serviceCounted=true}return true}
export function chooseChannel(state,reason){if(reason==='recommend-empty')return 'national';if(reason==='shelf-missing')return 'board';if(reason==='shelf-wrong')return pick(state,['supervisor','board']);let value=random(state),nationalChance=reason==='rude'?.45:reason==='wrong'?.28:.12+Math.min(state.failures.length*.025,.16);if(value<nationalChance)return 'national';return pick(state,['phone','face','board','city'])}
export function failRequest(state,n,reason='timeout',chosen=''){if(!unresolved(n))return null;if(state.stats&&!n.serviceCounted&&(n.answered||n.guideAccepted||reason==='wrong'||reason==='rude')){state.stats.services++;n.serviceCounted=true}if(n.complaintSourceId){let c=state.complaints.find(c=>c.id===n.complaintSourceId);n.resolved=true;n.status='gone';if(c)c.response+=' 항의 전화에도 제대로 응대하지 않았다.';return c||null}let response=reason==='wrong'||reason==='shelf-wrong'?`잘못된 안내: “${chosen}”`:reason==='rude'?`불친절한 응대: “${chosen}”`:reason==='shelf-missing'?'서가 정리가 제대로 되어 있지 않아 책이 제자리에 없었다.':reason==='recommend-empty'?'추천도서를 준비하겠다고 약속했지만 1분이 지나도록 한 권도 채우지 않았다.':reason==='closing'?'도서관 이용시간이 끝나지도 않았는데 사서가 퇴근해 버렸다.':n.mode==='phone'&&!n.answered?'전화가 30초 동안 울렸는데 받지 않았다.':n.guiding?'안내하겠다고 하고 이용자를 따라오게 했지만 30초 안에 알맞은 서가를 안내하지 않았다.':n.answered?'응대 도중 30초 안에 답변을 마치지 않았다.':n.mode==='kiosk'?'대출반납기 오류 앞에 서 있었는데 30초 동안 도와주지 않았다.':n.mode==='desk'?'데스크에서 30초 동안 기다렸지만 응대받지 못했다.':'사서에게 다가가 문의했지만 30초 안에 해결해 주지 않았다.';
 n.resolved=true;n.dissatisfied=true;n.status=n.mode==='phone'?'gone':'leaving';n.failureReason=reason;let channel=chooseChannel(state,reason),c={id:n.id+'-complaint',sourceDay:state.day,deliveryDay:state.day+1,name:n.name,channel,subject:n.subject,reason,response,opener:pick(state,OPENERS[channel]),rant:pick(state,reason==='shelf-wrong'?LIGHT_RANTS:RANTS),delivered:false};state.failures.push(c);state.complaints.push(c);state.score=Math.max(0,state.score-(channel==='national'?25:10));return c
}
export function expireRequests(state){let expired=[];for(let n of activeRequests(state))if(!n.timerStopped&&n.deadline!=null&&state.elapsed>=n.deadline){let c=failRequest(state,n);if(c)expired.push(c)}return expired}
export function deliverComplaints(state,day,final=false){let inbox=state.complaints.filter(c=>!c.delivered&&(c.deliveryDay<=day||(final&&c.sourceDay===day)));for(let c of inbox){c.delivered=true;c.receivedDay=day}state.inbox=inbox;if(inbox.some(c=>c.channel==='national')&&!state.nationalDays.includes(day))state.nationalDays.push(day);state.nationalDays.sort((a,b)=>a-b);if(state.nationalDays.length>=3){state.ended=true;state.fired=true}return inbox}

export function reviewUnfiledBooks(state){let floor=state.floor?.length||0,cart=state.cart?.books?.length||0,hands=state.hands?.length||0,total=floor+cart+hands;
 if(!total){state.unfiledBookStreak=0;state.unfiledBookLastDay=state.day;return {floor,cart,hands,total,streak:0}}
 let streak=state.unfiledBookLastDay===state.day-1?(state.unfiledBookStreak||0)+1:1;state.unfiledBookStreak=streak;state.unfiledBookLastDay=state.day;
 let counts=`바닥 ${floor}권 · 북카트 ${cart}권 · 손에 든 책 ${hands}권`,text=`퇴근 전에 책을 서가에 배가해야죠! ${counts}이 남아 있습니다.`;
 if(streak===1){state.seniorAnger??=[];state.seniorAnger.push({id:`d${state.day}-unfiled`,name:'상급자',action:'배가하지 않은 책을 남기고 퇴근함',text})}
 else{let c={id:`d${state.day}-unfiled-complaint`,sourceDay:state.day,deliveryDay:state.day+1,name:'자료실 이용자',channel:'board',subject:'이틀 연속 퇴근 때 배가되지 않은 도서',reason:'unfiled-books',response:`${counts}을 배가하지 않은 채 퇴근함. ${streak}일 연속 발생.`,opener:'게시판에 도서 정리 상태를 지적하는 민원이 올라왔다.',rant:'어제도 책이 방치되어 있더니 오늘도 그대로네요. 도서관이 너무 더러워요.',delivered:false};state.failures.push(c);state.complaints.push(c)}
 return {floor,cart,hands,total,streak}
}

export function closeServiceDay(state){if(state.shiftClosed)return state.reviews.find(r=>r.day===state.day);for(let n of activeRequests(state))failRequest(state,n,'closing');let unfiledBooks=reviewUnfiledBooks(state);state.shiftClosed=true;let r={unfiledBooks,day:state.day,elapsed:state.elapsed,score:state.score,answered:state.answered,failures:state.failures.map(c=>({...c})),seniorAnger:(state.seniorAnger||[]).map(a=>({...a})),progress:{...state.progress}};state.reviews.push(r);return r}
