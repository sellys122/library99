import {makeBook,addProgress,blocked} from './core.js';
import {SEARCH_BOOKS,shelfBookMissing} from './shelving.js';
import {GUIDE_TOPICS} from './kdc.js';
import {random,pick,spawnRequest,activeRequests,unresolved,activateRequest,activeEscort,resolveRequest,failRequest,deskLimit,MAX_INQUIRIES,PHONE_TOPICS,extendPatronDeadlines,SERVICE_LIMIT} from './service.js';
export const VISITOR_LIMIT=18,POPUP_GRACE=60;
const VISITOR_NAMES=['민준','하린','수진','정호','은지','준서','영희','도윤','유나','복순','미정','현우','서연','지우','태식','정희','수빈','은호'];
const isPresent=n=>n.mode!=='phone'&&n.status!=='gone';
export const fieldCount=s=>s.npcs.filter(isPresent).length;
export const deviceQueue=(s,device)=>s.npcs.filter(n=>isPresent(n)&&n.activity===device&&!n.guiding&&!n.escortActive&&!['leaving','searching'].includes(n.status)).sort((a,b)=>a.activityAt-b.activityAt);
export const popupStopsTime=(open,age,exempt=false)=>open&&(exempt||age<POPUP_GRACE);
function opEvent(s,type,text){s.operationEvents.push({type,text})}
function requestReady(s){return activeRequests(s).length<MAX_INQUIRIES}

export function isApproachVisitor(n){return !['gone','leaving','searching'].includes(n.status)&&!n.guiding&&!n.escortActive&&!n.waitUsed&&(n.isLibraryVisitor&&['approach','shelf-ask','recommend-ask','recommend-reproach'].includes(n.activity)||n.mode==='approach'&&unresolved(n))}
export function syncApproachQueue(s){let line=s.npcs.filter(isApproachVisitor);for(let n of line)if(n.approachOrder==null)n.approachOrder=(s.approachSerial=(s.approachSerial||0)+1);line.sort((a,b)=>a.approachOrder-b.approachOrder);let escort=activeEscort(s);
 for(let [i,n] of line.entries()){let wasWaiting=n.approachWaiting;n.approachWaiting=!!escort||i>0;if(n.approachWaiting){n.deadline=null;n.timerStopped=false;n.status='waiting';if(!wasWaiting)n.path=[]}else if(n.status==='waiting'&&n.deadline==null)n.status='walking'}return line}
export function approachGoal(s,n,layout){let line=syncApproachQueue(s),index=line.indexOf(n),busy=!!activeEscort(s),distance=1.25+(Math.max(0,index)+(busy?1:0))*1.45,angle=s.player.angle||0;
 if(!n.approachWaiting&&n.status==='asking'&&Math.hypot(n.x-s.player.x,n.z-s.player.z)<1.65)return {x:n.x,z:n.z};
 for(let turn of [0,.55,-.55,1.1,-1.1,Math.PI/2,-Math.PI/2,Math.PI]){let goal={x:s.player.x+Math.sin(angle+turn)*distance,z:s.player.z+Math.cos(angle+turn)*distance};if(!blocked(goal.x,goal.z,layout.colliders,.3))return goal}
 return {x:n.x,z:n.z}
}

export function setActivity(s,n,activity){n.noticePlayed=false;n.approachOrder=null;n.approachWaiting=false;n.activity=activity;n.activityAt=s.elapsed;n.activitySeen=false;n.pendingKind=null;n.transactionType=null;n.useUntil=null;n.path=[];n.routeAt=0;n.status='walking';n.mode='visitor';n.kind='roam';n.resolved=true;n.deadline=null;n.timerStopped=false;n.options=null;n.guide=null;n.guideAccepted=false;n.waitUsed=false;n.waitPosition=null;n.escortBenefit=false;n.transferStage=null;n.deviceIssue=null;n.identityUnable=false;n.identityVerified=false;n.identityViolation=false;n.bookChecked=false;n.serviceCounted=false;n.bubble=null;n.disorderUntil=null;n.escortActive=false;n.guiding=false;n.activityVisits=(n.activityVisits||0)+1}
export function chooseActivity(s,n){let activity=pick(s,['board','reading','approach','search','kiosk']);if(['search','kiosk'].includes(activity)&&deviceQueue(s,activity).length>=deskLimit(s.day)){setActivity(s,n,'wait-slot');n.nextActivity=activity}else setActivity(s,n,activity)}
export function createVisitor(s,activity){if(fieldCount(s)>=VISITOR_LIMIT)return null;let serial=++s.nextId,n={id:`d${s.day}-v${serial}`,name:pick(s,VISITOR_NAMES),x:(serial%6-2.5)*.42,z:9.9,angle:Math.PI,walk:0,path:[],routeAt:0,roamIndex:serial%4,arrival:s.elapsed,isLibraryVisitor:true,activityVisits:0,category:Math.floor(random(s)*10)};n.book=makeBook(n.id,n.category);s.npcs.push(n);if(activity)setActivity(s,n,activity);else chooseActivity(s,n);s.spawnCount++;return n}
export function visitorArrivalDelay(s){return fieldCount(s)<6?10+random(s)*5:20+random(s)*10}
export function initOperations(s,opening=true){s.operationsVersion=2;s.approachSerial=0;s.shelfStatus=Array(10).fill('untouched');s.stats??={booksShelved:0,shelfArrangements:0,shelfAttempts:0,services:0};s.callbackQueue=[];s.phoneHold=null;s.operationEvents=[];s.searchDevice={broken:false,nextFault:s.elapsed+50};s.paperPacks=0;s.seniorAnger=[];s.recommendation={emptySince:s.elapsed,visitorId:null,promisedAt:null};s.nextVisitor=s.elapsed+visitorArrivalDelay(s);s.nextPhone=s.elapsed+20+random(s)*10;if(opening){let count=5+Math.floor(random(s)*3);for(let i=0;i<count;i++)createVisitor(s)}s.nextVisitor=s.elapsed+visitorArrivalDelay(s)}
function startRequest(s,n,kind,subject){if(!requestReady(s)&&!activeRequests(s).some(active=>active.id===n.id))return false;n.kind=kind;n.subject=subject;n.resolved=false;n.served=false;n.answered=false;n.timerStopped=false;n.deadline=null;n.status='waiting';activateRequest(s,n);return true}
export function visitorGoal(s,n,layout){if(n.waitUsed&&n.waitPosition&&!n.guiding)return n.waitPosition;if(n.activity==='search'||n.activity==='kiosk'){let line=deviceQueue(s,n.activity),i=Math.max(0,line.indexOf(n));if(n.activity==='kiosk')return {x:layout.kiosk.x,z:layout.kiosk.z+1.25+i*.78};return i===0?{x:layout.search.x,z:layout.search.z+1.2}:{x:layout.search.x+.95,z:layout.search.z+1.8+(i-1)*.72}}
 if(n.activity==='board')return {x:-11.5,z:3.5};if(['recommended','recommend-wait'].includes(n.activity))return {x:-8,z:4.8};if(['approach','shelf-ask','recommend-ask','recommend-reproach'].includes(n.activity))return {x:s.player.x,z:s.player.z};if(n.activity==='reading'){let shelf=layout.shelves[n.category];return {x:shelf.x,z:shelf.z+1.3}}let spots=[{x:-2.2,z:-4.3},{x:2.2,z:-7.6},{x:6.5,z:-3.2},{x:0,z:2.5},{x:-6,z:1.2}];return spots[n.roamIndex%spots.length]}
export function activityArrival(s,n){if(isApproachVisitor(n)){syncApproachQueue(s);if(n.approachWaiting)return;if(n.activitySeen&&unresolved(n)){n.status='asking';activateRequest(s,n);}}if(n.status==='leaving'||n.guiding||n.escortActive)return;
 if(n.activity==='recommend-reproach'){n.kind='recommendation-reproach';n.mode='approach';n.resolved=false;n.subject=' 이달의 추천도서 목록 미비';failRequest(s,n,'recommend-empty');opEvent(s,'failure',`${n.name}: “여기 사서는 일 안하나봐요? 추천도서도 없고.” 국민신문고 민원 예정`);return}
 if(n.activity==='recommend-wait'){n.status='watching';return}
 if(n.activity==='recommend-ask'){if(n.activitySeen)return;if(!startRequest(s,n,'recommendation','이달의 추천도서 유무'))return;n.mode='approach';n.status='asking';n.activitySeen=true;return}
 if(n.activity==='search'||n.activity==='kiosk'){
  if(deviceQueue(s,n.activity)[0]!==n){n.status='queued';return}
  if(unresolved(n)){n.status='waiting';return}
  if(!n.activitySeen){n.activitySeen=true;if(n.activity==='search'){n.pendingKind=s.searchDevice.broken?'search-paper':random(s)<.40?'search-book':null}else{n.transactionType=pick(s,['loan','return']);n.pendingKind=random(s)<.55?'device-issue':null}n.useUntil=s.elapsed+10+random(s)*10}
  if(n.activity==='search'&&s.searchDevice.broken)n.pendingKind='search-paper';
  if(n.pendingKind){let kind=n.pendingKind;if(!startRequest(s,n,kind,kind==='search-paper'?'도서검색대 용지 부족':kind==='search-book'?`도서검색대 검색 결과: ${n.book.title} (${n.book.code})`:'무인 대출반납기 오류'))return;n.mode=n.activity;n.pendingKind=null;
   if(kind==='search-book'){n.book={...pick(s,SEARCH_BOOKS),id:n.id+'-search'};let topic=GUIDE_TOPICS.find(t=>t.section===n.book.section)||{section:n.book.section,subject:n.book.title};n.guide={...topic,catalogRequest:true,request:`“${n.book.title}”이라는 책을 찾고 있어요. 청구기호가 ${n.book.code}인데 어디 있나요?`};n.category=n.book.category;opEvent(s,'notice',`${n.name}: “저기요!”`)}
   if(kind==='device-issue'){n.deviceIssue=pick(s,['loan-failure','book-blocked','identity-expired']);n.subject=({'loan-failure':'책 대출이 안돼요','book-blocked':'대출이 안되는 책이래요','identity-expired':'개인정보가 만료되었대요'})[n.deviceIssue];n.transactionType='loan';n.borrowable=n.deviceIssue!=='book-blocked'}
  }else{n.status='using';if(s.elapsed>=n.useUntil){if(n.activity==='kiosk'&&n.transactionType==='return')s.machine.push(n.book);nextVisit(s,n)}}return
 }
 if(n.activity==='approach'){if(!n.activitySeen){if(!startRequest(s,n,'info-question','도서관 이용 문의'))return;let topic=pick(s,PHONE_TOPICS);n.topic=topic.id;n.subject=topic.subject;n.mode='approach';n.status='asking';n.activitySeen=true}return}
 if(n.activity==='reading'&&s.shelfStatus[n.category]==='failed'){if(!n.disorderUntil)n.disorderUntil=s.elapsed+SERVICE_LIMIT;n.status='pondering';n.bubble='어느 책을 찾아야 하지…';if(s.elapsed>=n.disorderUntil){n.resolved=false;n.kind='disorder';n.subject=String(n.category*100).padStart(3,'0')+'번대 서가 상태';failRequest(s,n,'shelf-missing');n.bubble='서가가 어질러져있네';opEvent(s,'failure',n.name+': “서가가 어질러져있네” · 게시판 민원 예정')}return}
 if(n.activity==='reading'&&n.pendingKind==='shelf-question'){if(requestReady(s)){n.pendingKind=null;n.kind='pending-question';n.resolved=false;n.activity='shelf-ask';n.activitySeen=false;n.bubble='저기요!';n.path=[]}return}
 if(n.activity==='reading'&&!n.activitySeen){let questionRoll=random(s)<.55;n.activitySeen=true;if(questionRoll){if(!requestReady(s)){n.pendingKind='shelf-question';return}n.kind='pending-question';n.resolved=false;n.activity='shelf-ask';n.activitySeen=false;n.bubble='저기요!';n.path=[];return}n.useUntil=s.elapsed+15+random(s)*15}
 if(n.activity==='shelf-ask'){if(!n.activitySeen){if(!startRequest(s,n,'question','책 위치 문의'))return;let t=pick(s,GUIDE_TOPICS);n.guide={...t,request:pick(s,t.requests)};n.category=Math.floor(Number(t.section)/100);n.mode='approach';n.status='asking';n.activitySeen=true}return}
 if(n.activity==='wait-slot'){if(deviceQueue(s,n.nextActivity).length<deskLimit(s.day))setActivity(s,n,n.nextActivity);return}
 if(!n.activitySeen){n.activitySeen=true;n.useUntil=s.elapsed+(n.activity==='board'?10:15+random(s)*15)}n.status='reading';if(s.elapsed>=n.useUntil){if(n.activity==='kiosk'&&n.transactionType==='return')s.machine.push(n.book);nextVisit(s,n)}
}
export function nextVisit(s,n){if(random(s)<.60){n.status='leaving';n.path=[]}else chooseActivity(s,n)}
export function escortToDesk(s,n){let current=activeEscort(s);if(current&&current.id!==n.id)return {ok:false,reason:`${current.name}을 응대 중입니다. 한 명씩 동행할 수 있습니다.`};if(!unresolved(n))return {ok:false,reason:'이미 종료된 문의입니다.'};n.escortActive=true;n.escortTarget='desk';n.guiding=false;n.transferStage='enroute';n.timerStopped=true;n.deadline=null;n.status='escorting';n.path=[];n.lastAction='데스크에서 확인해드리겠다고 안내함';if(!n.escortBenefit){extendPatronDeadlines(s,5,n.id);n.escortBenefit=true}return {ok:true}}
export function tryWebsiteAuthentication(s,n){if(random(s)<.5){resolveRequest(s,n);return true}n.identityUnable=true;n.lastAction='홈페이지 인증을 안내했지만 이용자가 이용 방법을 모름';return false}
export function processDesk(s,n,action){if(!n.escortActive||n.transferStage!=='ready')return {ok:false,message:'먼저 이용자를 데스크까지 안내하세요.'};let done=false,message='';
 if(action==='inspect'){n.bookChecked=true;message=n.borrowable?'대출가능 상태입니다.':'대출이 안되는 상태입니다.'}
 else if(action==='allow'){if(!n.bookChecked)return {ok:false,message:'먼저 책 상태를 확인하세요.'};n.borrowable=true;message='대출가능으로 변경했습니다.'}
 else if(action==='verify'){n.identityVerified=true;message='신분증과 회원 정보를 대조하여 본인 확인을 마쳤습니다.'}
 else if(action==='renew'){if(n.deviceIssue!=='identity-expired')return {ok:false,message:'개인정보 갱신 문의가 아닙니다.'};if(!n.identityVerified&&!n.identityViolation){n.identityViolation=true;s.seniorAnger.push({id:n.id,name:n.name,text:'본인 확인을 하고 개인정보를 갱신해야죠!!',action:'신원을 확인하기 전에 개인정보를 갱신함'})}n.identityUpdated=true;done=true;message=n.identityVerified?'개인정보를 정상 갱신했습니다.':'갱신했지만 본인 확인 누락이 선임의 분노에 기록됩니다.'}
 else if(action==='loan'){if(n.deviceIssue==='identity-expired')return {ok:false,message:'개인정보 갱신 절차를 먼저 처리하세요.'};if(n.deviceIssue==='book-blocked'&&(!n.bookChecked||!n.borrowable))return {ok:false,message:'책 상태를 확인하고 대출가능으로 바꿔 주세요.'};done=true;message='대출을 완료했습니다.'}
 else if(action==='return'){if(n.deviceIssue)return {ok:false,message:'이 문의는 대출 또는 개인정보 처리로 해결해야 합니다.'};s.machine.push(n.book);done=true;message='반납을 완료했습니다.'}
 else return {ok:false,message:'알 수 없는 작업입니다.'};
 if(done){resolveRequest(s,n);n.escortActive=false;n.guiding=false;addProgress(s,'transactions');nextVisit(s,n)}n.lastAction=message;return {ok:true,done,message}
}
export function takePaper(s){if(s.paperPacks>=1)return false;s.paperPacks++;return true}
export function replenishPaper(s){if(!s.searchDevice.broken||!s.paperPacks)return false;s.paperPacks--;s.searchDevice.broken=false;for(let n of s.npcs)if(unresolved(n)&&n.kind==='search-paper'){resolveRequest(s,n);addProgress(s,'fixed');n.kind='roam';n.resolved=true;n.activitySeen=false;n.status='walking';n.activity='search';n.mode='visitor';n.deadline=null;n.pendingKind=null;n.path=[]}return true}
export function promiseRecommendations(s,n){n.lastAction='지금 만들고 있으니 조금만 기다려 달라고 안내함';if(!n.serviceCounted){s.stats.services++;n.serviceCounted=true}n.resolved=true;n.deadline=null;n.kind='roam';n.mode='visitor';n.activity='recommend-wait';n.status='watching';s.recommendation.visitorId=n.id;s.recommendation.promisedAt=s.elapsed}
export function advanceOperations(s){s.operationEvents??=[];if(s.shiftClosed||s.ended)return [];
 for(let n of s.npcs)if(!['gone','leaving'].includes(n.status)&&n.activity==='wait-slot'&&deviceQueue(s,n.nextActivity).length<deskLimit(s.day))setActivity(s,n,n.nextActivity);
 if(s.elapsed>=s.nextVisitor){s.nextVisitor=s.elapsed+visitorArrivalDelay(s);createVisitor(s)}
 if(s.elapsed>=s.nextPhone){s.nextPhone=s.elapsed+20+random(s)*10;spawnRequest(s,'phone')}
 if(s.elapsed>=s.searchDevice.nextFault){s.searchDevice.nextFault=s.elapsed+50;if(!s.searchDevice.broken&&random(s)<.4){s.searchDevice.broken=true;opEvent(s,'notice','도서검색대에서 작은 경고음이 들립니다. 용지를 확인하세요.')}}
 for(let callback of s.callbackQueue){if(!callback.spawned&&s.elapsed>=callback.at){let n=spawnRequest(s,'phone');if(n){n.callback=true;n.complaintSourceId=callback.complaintId;n.subject='잘못된 전화 안내에 대한 항의';n.topic=callback.topic;n.callbackAnswer=callback.answer;callback.spawned=true}}}
 let r=s.recommendation,watcher=s.npcs.find(n=>n.id===r.visitorId);
 if(s.display.length){r.emptySince=s.elapsed;if(watcher&&r.promisedAt!=null&&watcher.activity==='recommend-wait'){s.answered++;addProgress(s,'questions');watcher.status='leaving';watcher.path=[];opEvent(s,'success',`${watcher.name}: “추천도서가 생겼네요. 고맙습니다.”`)}r.promisedAt=null;r.visitorId=null}
 else if(r.promisedAt!=null&&s.elapsed-r.promisedAt>=60&&watcher&&watcher.status!=='leaving'){watcher.activity='recommend-reproach';watcher.status='walking';watcher.activitySeen=false;watcher.path=[];r.promisedAt=null}
 else if(!r.visitorId&&s.elapsed-r.emptySince>=60&&requestReady(s)){let n=s.npcs.find(n=>n.isLibraryVisitor&&n.kind==='roam'&&n.resolved&&!['leaving','gone','queued','using'].includes(n.status));if(n){setActivity(s,n,'recommend-ask');r.visitorId=n.id}}
 return s.operationEvents.splice(0)
}
