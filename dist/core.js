export const CATEGORIES=['총류','철학','종교','사회과학','자연과학','기술과학','예술','언어','문학','역사'];
export const COLORS=['#557968','#bd7060','#bd9b58','#537e99','#a3808b','#8eaf92','#d0ac55','#a38466','#496a5d','#c2b28c'];
export const TITLES=[['도서관의 모든 것','처음 만나는 정보'],['마음을 읽는 철학','생각의 산책'],['세계의 종교','신화와 믿음'],['도시와 사람들','우리 사회 이야기'],['별을 보는 밤','작은 식물 도감'],['생활 속 발명','건축의 시작'],['그림을 읽는 시간','음악의 정원'],['우리말의 발견','처음 배우는 영어'],['계절의 문장','작은 숲의 이야기'],['시간을 걷다','세계사 산책']];
export const DAY_NAMES=['첫 출근','책과 친해지는 날','바쁜 오후의 시작','도서관의 작은 문제들','마지막 근무, 좋은 마무리'];
export function makeBook(id,category){return {id,category,title:TITLES[category][Number(id.replace(/\D/g,''))%2],code:String(category*100).padStart(3,'0')}}
export function dayConfig(day){return {shelved:4+day,collected:day<3?2:3,transactions:2,questions:2,fixed:1,displayed:1}}
export const TASK_NAMES={shelved:'책을 알맞은 서가에 정리',collected:'흩어진 책 수거',transactions:'대출·반납 처리',questions:'이용자 문의 해결',fixed:'도서관 문제 해결',displayed:'전시 책 배치'};
export function newProgress(){return {shelved:0,collected:0,transactions:0,questions:0,fixed:0,displayed:0}}
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
