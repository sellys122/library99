import {GUIDE_TOPICS,sectionName,EVENTS} from './kdc.js';
// Deterministic, saved-state service rules. Timers use active real seconds.
export const SERVICE_LIMIT=30, MAX_INQUIRIES=4, SHIFT_SECONDS=240;
export const CHANNELS={phone:'전화',face:'대면',board:'게시판',national:'국민신문고',city:'시청 전화',supervisor:'상급자 질책'};
export const SERVICE_POLICY=[['운영시간','평일 09:00–18:00, 월요일 휴관'],['대출증','신분증 지참 → 데스크 본인 확인 → 회원 가입 및 발급'],['반납 누락','회원번호와 책 정보 확인 → 반납함·처리 기록 확인 → 결과 안내'],['프로그램','홈페이지 프로그램 메뉴에서 신청. 정원이 차면 대기 등록'],['24시간 개방','현재 운영시간을 설명하고 건의 접수. 임의로 개방을 약속하지 않음'],['주요 시설','2층 열람실, 1층 어린이자료실·자료실·전시 공간'],['프린트','1층 복사·출력 코너, A4 흑백 1면 50원'],['분실 도서','동일 도서 변상 가능 여부를 확인하고 데스크에서 안내. 바로 재대출하지 않음']];
export const PHONE_TOPICS=[
 {id:'hours',subject:'도서관 운영시간',question:'오늘 몇 시까지 하나요? 휴관일도 알려 주세요.',answers:[['평일은 오전 9시부터 오후 6시까지이고, 월요일은 휴관입니다.','correct'],['매일 밤 12시까지 해요. 휴관일은 없습니다.','wrong'],['문 앞에 써 있잖아요. 읽고 전화하세요.','rude']]},
 {id:'card',subject:'대출증 발급 방법',question:'처음 왔는데 대출증은 어떻게 만드나요?',answers:[['신분증을 지참해 데스크에서 본인 확인 후 회원 가입과 발급을 도와드릴게요.','correct'],['신분 확인 없이 아무 카드나 대출증으로 쓰시면 돼요.','wrong'],['그것까지 하나하나 알려드려야 해요?','rude']]},
 {id:'unreturned',subject:'반납했는데 대출 중으로 표시되는 책',question:'책을 반납했는데 아직 대출 중이라고 나와요!',answers:[['회원번호와 책 정보를 확인하고 반납함 및 처리 기록을 확인한 뒤 안내하겠습니다.','correct'],['이미 반납하셨으면 화면은 무시하세요. 확인은 안 해도 됩니다.','wrong'],['제 잘못은 아닌 것 같은데요. 알아서 하세요.','rude']]},
 {id:'program',subject:'뜨개질 행사 일정과 접수',question:'뜨개질 행사 언제 하나요? 신청은 어떻게 하고 몇 명까지예요?',answers:[['10월 10일 토요일 14시부터 16시, 1층 문화교실에서 12명까지 참여하며 홈페이지로 접수합니다.','correct'],['10월 10일 밤 12시에 북카트에서 열고, 접수 없이 100명까지 됩니다.','wrong'],['뜨개질도 직접 못 하면서 신청까지 알려달라 하세요?','rude']]},
 {id:'travel',subject:'세계 여행 행사 전화 접수',question:'책 한 권으로 떠나는 세계 여행 행사는 전화 신청이 되나요?',answers:[['10월 14일 수요일 16시부터 17시, 1층 전시 공간에서 20명까지 참여하며 전화 또는 데스크 방문으로 접수합니다.','correct'],['전화는 안 되고 월요일 새벽에만 신청받습니다.','wrong'],['여행 가는 것도 아닌데 그렇게 물어보실 필요 있어요?','rude']]},
 {id:'children',subject:'어린이 책 탐험 행사',question:'사서와 함께하는 어린이 책 탐험 날짜와 신청 방법을 알려 주세요.',answers:[['10월 17일 토요일 10시부터 11시 30분, 1층 어린이자료실에서 15명까지 참여하며 홈페이지 선착순 접수입니다.','correct'],['어린이 행사는 10월 14일 밤에 하며 예약 없이 50명까지 됩니다.','wrong'],['사서도 바쁜데 탐험은 집에서 하시면 안 돼요?','rude']]},
 {id:'allnight',subject:'도서관 24시간 개방 요구',question:'제가 새벽 두 시에 책 보고 싶은데 24시간 열어 주세요!',answers:[['현재 운영시간은 9시부터 18시까지입니다. 24시간 개방 의견은 건의로 접수하겠습니다.','correct'],['알겠습니다. 오늘부터 제가 혼자 24시간 열겠습니다.','wrong'],['그럼 사서도 24시간 서 있어야 하나요? 집에 가세요.','rude']]},
 {id:'facilities',subject:'열람실과 주요 시설 유무',question:'열람실 있나요? 아이랑 갈 공간도 있나요?',answers:[['2층에 열람실이 있고, 1층에 어린이자료실과 자료실, 전시 공간이 있습니다.','correct'],['열람실도 어린이 공간도 없고 북카트에 앉으시면 됩니다.','wrong'],['도서관인데 책만 보면 되지 뭘 그렇게 찾으세요?','rude']]},
 {id:'printing',subject:'프린트기 위치와 출력 요금',question:'프린트할 수 있나요? 한 장에 얼마예요?',answers:[['1층 복사·출력 코너를 이용하실 수 있고 A4 흑백은 1면 50원입니다.','correct'],['사서 컴퓨터에서 아무거나 무료로 5천 장까지 뽑으세요.','wrong'],['집에 프린터 하나 사시면 되잖아요.','rude']]},
 {id:'lost',subject:'대출 도서 분실 처리',question:'빌린 책을 잃어버렸어요. 어떻게 해야 하나요?',answers:[['회원 정보와 도서명을 확인하고 동일 도서 변상 가능 여부를 데스크에서 안내해 드릴게요.','correct'],['괜찮아요. 분실 기록을 지우고 같은 책을 바로 또 빌려드릴게요.','wrong'],['그걸 왜 저한테 말씀하세요? 알아서 찾으세요.','rude']]}
];
const NAMES=['하린','민준','지우','도윤','서연','유나','현우','은지','준서','수빈','영희','철수','복순','정호','미정','태식'];
const RANTS=[
 '국민의 세금으로 운영되는 주제에 이런 식으로 일합니까?',
 '내가 세금을 얼마나 내는데, 이 정도 안내도 못 합니까?',
 '그러고도 사서냐는 말을 안 할 수가 없네요.',
 '이 지역의 시민을 소중하게 대해야지, 이게 무슨 짓입니까?',
 '담당자는 징계를 받아야 합니다. 책장 뒤에 숨지 마세요.',
 '높은 사람 나오라고 하세요. 북카트 말고 책임자요.',
 '제 기다린 시간도 공공재입니다. 반납 처리해 주세요.',
 '책은 청구번호대로 꽂으면서 시민의 마음은 왜 아무 데나 꽂습니까?',
 '사서의 미소까지 대출 중인가요? 언제 반납됩니까?',
 '저는 회원증도 있습니다. 회원증이 장식품입니까?',
 '이 민원은 복사해서 보관했습니다. 프린트 요금은 책임자가 내세요.',
 '저보다 북카트가 먼저 응대를 받더군요. 저도 바퀴를 달고 올까요?',
 '민원 번호를 알려 주세요. 이번엔 번호표까지 기다리라고 하지 마세요.',
 '공공서비스가 이렇게 조용해서야 되겠습니까? 제 분노만 소리가 납니다.',
 '이게 도서관입니까, 기다림을 열람하는 시설입니까?',
 '내일은 꼭 책임자를 만나겠습니다. 달력에도 적었습니다.'
];
const LIGHT_RANTS=['잘못된 서가까지 따라갔습니다. 다음에는 분류표를 확인하고 안내해 주세요.','책을 찾으러 왔는데 엉뚱한 곳을 안내받았습니다. 친절한 설명을 부탁드립니다.','사서 안내를 믿고 찾아봤는데 그런 책이 없었습니다. 안내가 조금 더 정확했으면 합니다.','제가 찾던 책과 다른 분류였습니다. 선임께 안내 방법을 확인해 주셨으면 합니다.'];
const OPENERS={phone:['전화민원이 들어왔다. 수화기가 먼저 한숨을 쉬었다.','아침 첫 전화가 인사가 아니라 민원이었다.'],face:['내가 없는 사이에 이용자가 화를 내고 갔다고 한다.','개관 전에 대면 민원인이 왔다. 아직 사서는 커피도 대출하지 못했다.'],board:['게시판 민원이 들어왔다. 느낌표가 책보다 많다.','게시판에 사서의 불친절에 대한 글이 올라왔다.'],national:['국민신문고 민원이 들어왔다. 공문 제목만으로 의자가 삐걱거린다.','국민신문고 접수 알림. 오늘의 도서관은 잠시 행정기관이다.'],city:['어제 불만을 가진 이용자가 시청에 전화를 했다고 한다.','시청에서 민원을 전달했다. 이용자의 목소리가 한 단계 위층으로 올라갔다.'],supervisor:['이용자가 팀장에게 말했고, 팀장에게 주의를 받았다.','이용자가 관장에게 항의했다. 아침부터 관장실로 호출되었다.','선임이 불렀다. “서가 안내는 대충 찍는 문제가 아니야.”','과장이 민원을 전달했다. “다음에는 분류표를 확인하세요.”']};
export function random(state){state.rng=((state.rng||122)*1664525+1013904223)>>>0;return state.rng/4294967296}
export function pick(state,items){return items[Math.floor(random(state)*items.length)]}
export function shuffle(state,items){let list=[...items];for(let i=list.length-1;i>0;i--){let j=Math.floor(random(state)*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list}
export const deskLimit=day=>day>=3?3:2;
export const unresolved=n=>n.kind!=='roam'&&!n.resolved&&!['gone','leaving'].includes(n.status);
export const activeRequests=state=>state.npcs.filter(n=>unresolved(n)||n.status==='searching');
export const secondsLeft=(state,n)=>n.deadline==null?SERVICE_LIMIT:Math.max(0,n.deadline-state.elapsed);
export function initServiceDay(state){state.elapsed=0;state.nextSpawn=10+random(state)*20;state.nextId=0;state.shiftClosed=false;state.morningPending=true;state.failures=[];state.spawnCount=0;state.answered=0;state.npcs=[];state.complaints??=[];state.nationalDays??=[];state.reviews??=[];state.inbox??=[];state.rng??=122}
export function activateRequest(state,n){if(n.deadline==null&&!n.resolved){n.requestedAt=state.elapsed;n.deadline=state.elapsed+SERVICE_LIMIT;n.lastAction='아직 응대하지 않음'}return n}
export function allowedModes(state){let active=activeRequests(state);if(active.length>=MAX_INQUIRIES)return [];let modes=['approach'];if(active.filter(n=>n.mode==='desk'&&!n.guiding&&n.status!=='searching').length<deskLimit(state.day))modes.push('desk');if(!active.some(n=>n.mode==='kiosk'))modes.push('kiosk');if(!active.some(n=>n.mode==='phone'))modes.push('phone');return modes}
export function spawnRequest(state,mode){let modes=allowedModes(state);if(!modes.includes(mode))return null;let serial=++state.nextId,category=Math.floor(random(state)*10),kind=mode==='kiosk'?'issue':mode==='phone'||mode==='approach'?'question':pick(state,['question','loan','return','issue']);let n={id:`d${state.day}-n${serial}`,name:pick(state,NAMES),mode,kind,category,x:0,z:10,angle:Math.PI,walk:0,status:mode==='phone'?'ringing':'walking',path:[],routeAt:0,roamIndex:serial%4,arrival:state.elapsed,wait:0,resolved:false,served:false,deadline:null,answered:false,subject:'',lastAction:'아직 응대하지 않음'};
 n.topic=mode==='phone'?pick(state,PHONE_TOPICS).id:null;
 if(mode!=='phone'&&kind==='question'){n.guide=pick(state,GUIDE_TOPICS);n.category=Math.floor(Number(n.guide.section)/100)}
 n.subject=mode==='phone'?PHONE_TOPICS.find(t=>t.id===n.topic).subject:kind==='question'?`${n.guide.subject} 책 위치 (${n.guide.section} ${sectionName(n.guide.section)})`:kind==='loan'?'도서 대출 요청':kind==='return'?'도서 반납 요청':mode==='kiosk'?'무인 대출반납기 오류':'안내 프린터 출력 오류';
 if(mode==='phone')activateRequest(state,n);state.npcs.push(n);state.spawnCount++;return n
}
export function advanceArrivals(state){if(state.shiftClosed||state.ended||state.elapsed<state.nextSpawn||state.elapsed>SHIFT_SECONDS-30)return null;state.nextSpawn=state.elapsed+10+random(state)*20;let modes=allowedModes(state);if(!modes.length)return null;
 // One visitor or telephone event per 10–30-second interval, no catch-up burst.
 if(random(state)<.16&&state.npcs.filter(n=>n.kind==='roam'&&!['gone','leaving'].includes(n.status)).length<3){let n={id:`d${state.day}-r${++state.nextId}`,name:pick(state,NAMES),kind:'roam',mode:'roam',x:0,z:10,angle:Math.PI,walk:0,status:'walking',path:[],routeAt:0,roamIndex:state.nextId%4,arrival:state.elapsed,resolved:true};state.npcs.push(n);state.spawnCount++;return n}
 return spawnRequest(state,pick(state,modes))
}
export function resolveRequest(state,n){if(n.resolved)return false;n.resolved=true;n.served=true;n.status=n.mode==='phone'?'gone':'leaving';state.answered++;return true}
export function chooseChannel(state,reason){if(reason==='shelf-wrong')return pick(state,['supervisor','board']);let value=random(state),nationalChance=reason==='rude'?.45:reason==='wrong'?.28:.12+Math.min(state.failures.length*.025,.16);if(value<nationalChance)return 'national';return pick(state,['phone','face','board','city'])}
export function failRequest(state,n,reason='timeout',chosen=''){if(!unresolved(n))return null;let response=reason==='wrong'||reason==='shelf-wrong'?`잘못된 안내: “${chosen}”`:reason==='rude'?`불친절한 응대: “${chosen}”`:reason==='closing'?'문의가 끝나지 않았는데 사서가 퇴근해 버렸다.':n.mode==='phone'&&!n.answered?'전화가 30초 동안 울렸는데 받지 않았다.':n.guiding?'안내하겠다고 하고 이용자를 따라오게 했지만 30초 안에 알맞은 서가를 안내하지 않았다.':n.answered?'응대 도중 30초 안에 답변을 마치지 않았다.':n.mode==='kiosk'?'대출반납기 오류 앞에 서 있었는데 30초 동안 도와주지 않았다.':n.mode==='desk'?'데스크에서 30초 동안 기다렸지만 응대받지 못했다.':'사서에게 다가가 문의했지만 30초 안에 해결해 주지 않았다.';
 n.resolved=true;n.dissatisfied=true;n.status=n.mode==='phone'?'gone':'leaving';n.failureReason=reason;let channel=chooseChannel(state,reason),c={id:n.id+'-complaint',sourceDay:state.day,deliveryDay:state.day+1,name:n.name,channel,subject:n.subject,reason,response,opener:pick(state,OPENERS[channel]),rant:pick(state,reason==='shelf-wrong'?LIGHT_RANTS:RANTS),delivered:false};state.failures.push(c);state.complaints.push(c);state.score=Math.max(0,state.score-(channel==='national'?25:10));return c
}
export function expireRequests(state){let expired=[];for(let n of activeRequests(state))if(n.deadline!=null&&state.elapsed>=n.deadline){let c=failRequest(state,n);if(c)expired.push(c)}return expired}
export function deliverComplaints(state,day,final=false){let inbox=state.complaints.filter(c=>!c.delivered&&(c.deliveryDay<=day||(final&&c.sourceDay===day)));for(let c of inbox){c.delivered=true;c.receivedDay=day}state.inbox=inbox;if(inbox.some(c=>c.channel==='national')&&!state.nationalDays.includes(day))state.nationalDays.push(day);state.nationalDays.sort((a,b)=>a-b);if(state.nationalDays.length>=3){state.ended=true;state.fired=true}return inbox}
export function closeServiceDay(state){if(state.shiftClosed)return state.reviews.find(r=>r.day===state.day);for(let n of activeRequests(state))failRequest(state,n,'closing');state.shiftClosed=true;let r={day:state.day,elapsed:state.elapsed,score:state.score,answered:state.answered,failures:state.failures.map(c=>({...c})),progress:{...state.progress}};state.reviews.push(r);return r}
