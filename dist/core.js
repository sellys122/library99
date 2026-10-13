import {detailedBook} from './kdc.js';
export const CATEGORIES=['총류','철학','종교','사회과학','자연과학','기술과학','예술','언어','문학','역사'];
export const COLORS=['#557968','#bd7060','#bd9b58','#537e99','#a3808b','#8eaf92','#d0ac55','#a38466','#496a5d','#c2b28c'];
export const TITLES=[['도서관의 모든 것','처음 만나는 정보'],['마음을 읽는 철학','생각의 산책'],['세계의 종교','신화와 믿음'],['도시와 사람들','우리 사회 이야기'],['별을 보는 밤','작은 식물 도감'],['생활 속 발명','건축의 시작'],['그림을 읽는 시간','음악의 정원'],['우리말의 발견','처음 배우는 영어'],['계절의 문장','작은 숲의 이야기'],['시간을 걷다','세계사 산책']];
export const DAY_NAMES=['첫 출근','책과 친해지는 날','바쁜 오후의 시작','도서관의 작은 문제들','마지막 근무, 좋은 마무리'];
export function makeBook(id,category){return detailedBook(id,category)}
export function dayConfig(day){return {shelved:3+Math.floor(day/2),shelvesCleaned:10,collected:2,transactions:2,questions:3,fixed:1,displayed:1}}
export const TASK_NAMES={shelved:'책을 알맞은 서가에 정리',shelvesCleaned:'오늘 10개 서가 정리',collected:'흩어진 책 수거',transactions:'대출·반납 처리',questions:'이용자 문의 해결',fixed:'도서관 문제 해결',displayed:'전시 책 배치'};
export function newProgress(){return {shelved:0,shelvesCleaned:0,collected:0,transactions:0,questions:0,fixed:0,displayed:0}}
export function complete(state){let goal=dayConfig(state.day);return Object.keys(goal).every(k=>state.progress[k]>=goal[k])}
export function addProgress(state,key){state.progress[key]++;state.score+=key==='fixed'?30:key==='questions'?20:10}
export function canShelve(book,category){return book&&book.category===category}
export function blocked(x,z,colliders,r=.28){if(Math.abs(x)>12.3-r||z>10.4-r||z< -10.2+r)return true;return colliders.some(c=>{let dx=Math.max(Math.abs(x-c.x)-c.w/2,0),dz=Math.max(Math.abs(z-c.z)-c.d/2,0);return dx*dx+dz*dz<r*r})}
export function pathfind(start,end,colliders,r=.29){const step=.5,W=49,H=41,toCell=p=>[Math.round((p.x+12)/step),Math.round((p.z+10)/step)],point=([x,z])=>({x:x*step-12,z:z*step-10}),key=(x,z)=>z*W+x,inRange=(x,z)=>x>=0&&x<W&&z>=0&&z<H;
 let s=toCell(start),e=toCell(end);s=s.map((v,i)=>Math.max(0,Math.min(i?H-1:W-1,v)));e=e.map((v,i)=>Math.max(0,Math.min(i?H-1:W-1,v)));
 if(blocked(...Object.values(point(e)),colliders,r)){let candidates=[];for(let dz=-5;dz<=5;dz++)for(let dx=-5;dx<=5;dx++){let x=e[0]+dx,z=e[1]+dz,p=point([x,z]);if(inRange(x,z)&&!blocked(p.x,p.z,colliders,r))candidates.push({cell:[x,z],dist:Math.hypot(p.x-end.x,p.z-end.z)})}if(!candidates.length)return [];candidates.sort((a,b)=>a.dist-b.dist);e=candidates[0].cell}
 let open=[{cell:s,g:0,f:0}],cost=new Map([[key(...s),0]]),parent=new Map(),closed=new Set();let endKey=key(...e),found=false;
 while(open.length){open.sort((a,b)=>a.f-b.f);let cur=open.shift(),ck=key(...cur.cell);if(closed.has(ck))continue;closed.add(ck);if(ck===endKey){found=true;break}for(let[dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){let x=cur.cell[0]+dx,z=cur.cell[1]+dz,k=key(x,z),p=point([x,z]);if(!inRange(x,z)||blocked(p.x,p.z,colliders,r))continue;if(dx&&dz){let p1=point([x,cur.cell[1]]),p2=point([cur.cell[0],z]);if(blocked(p1.x,p1.z,colliders,r)||blocked(p2.x,p2.z,colliders,r))continue}let g=cur.g+Math.hypot(dx,dz);if(g<(cost.get(k)??Infinity)){cost.set(k,g);parent.set(k,ck);open.push({cell:[x,z],g,f:g+Math.hypot(x-e[0],z-e[1])})}}}
 if(!found)return [];let result=[],k=endKey;while(k!==key(...s)){result.push(point([k%W,Math.floor(k/W)]));k=parent.get(k);if(k===undefined)return []}return result.reverse();
}
export function transferBook(from,to,id,capacity){if(to.length>=capacity)return {ok:false,reason:'full'};let i=from.findIndex(b=>b.id===id);if(i<0)return {ok:false,reason:'missing'};to.push(from.splice(i,1)[0]);return {ok:true}}

// Shift lighting follows the same paused work clock as service timers.
export function libraryDaylight(elapsed,duration=360){let phase=Math.max(0,Math.min(1,elapsed/duration)),hour=9+phase*9,sunset=Math.max(0,Math.min(1,(hour-16)/2)),sunrise=Math.max(0,1-(hour-9)),warmth=Math.max(sunrise*.42,sunset),level=1-sunset*.28;let sky=sunset>0?[.68+.20*sunset,.83-.39*sunset,.89-.46*sunset]:[.68+.12*sunrise,.83-.04*sunrise,.89-.16*sunrise];return {phase,hour,sunset,sunrise,warmth,level,sky,label:hour<10?'오전 햇빛':hour<16?'맑은 낮':hour<17?'해가 기우는 오후':'노을 지는 도서관'}}

export const DASH_SECONDS=20,DASH_RECHARGE_SECONDS=60;
export function newDash(){return {energy:DASH_SECONDS,phase:'ready',engaged:false}}
export function advanceDash(d,dt,requested,moving,cartAttached=false){let seconds=Math.max(0,dt);if(d.phase==='recharging'){d.engaged=false;d.energy=Math.min(DASH_SECONDS,d.energy+seconds*DASH_SECONDS/DASH_RECHARGE_SECONDS);if(d.energy>=DASH_SECONDS)d.phase='ready';return false}if(requested&&!cartAttached&&d.energy>0)d.engaged=true;let active=!!d.engaged&&!!moving&&!cartAttached&&d.energy>0;if(d.engaged&&d.energy>0){d.energy=Math.max(0,d.energy-seconds);d.phase=d.energy===0?'recharging':'active';if(d.energy===0)d.engaged=false}else d.phase='ready';return active}

export function inquiryEdgePosition(point,width,height,padding=30){if(point.x>=padding&&point.x<=width-padding&&point.y>=padding&&point.y<=height-padding)return null;let cx=width/2,cy=height/2,dx=point.x-cx,dy=point.y-cy,scale=Math.min(Math.max(1,cx-padding)/Math.max(.001,Math.abs(dx)),Math.max(1,cy-padding)/Math.max(.001,Math.abs(dy)));return {x:cx+dx*scale,y:cy+dy*scale,angle:Math.atan2(dy,dx)*180/Math.PI}}

export function mobileViewportLayout(width,height){let w=Math.max(1,width),h=Math.max(1,height),portrait=h>=w;return {portrait,header:portrait?60:46,footer:portrait?72:54,controlSize:portrait?96:78,controlsBottom:portrait?24:16,worldHeight:Math.max(0,h-(portrait?132:100))}}
