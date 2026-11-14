import {townBlocks,townVenues,townSpawn,townWalkBounds} from './world';
import {townPeople} from './townPeople';
import {hiddenMechanicSpot} from './hiddenMechanic';
import {canStand,findWalkingPath} from '../game/navigation';

const buildings=[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h}));
const occupied=[...townPeople,hiddenMechanicSpot];
const start=townSpawn('komorebi');
// Keep each figure just outside the artwork silhouette so a player can find it.
const candidates=townBlocks.flatMap(b=>[{x:b.x+b.w+62,y:b.y+b.h/2},{x:b.x+b.w/2,y:b.y-80}]);
function choose(used:{x:number;y:number}[]){
 const spot=candidates.find(p=>{
  if(occupied.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<250)||used.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<1000))return false;
  const obstacles=[...buildings,...[...occupied,...used,p].map(q=>({x:q.x-12,y:q.y-9,width:24,height:21}))];
  const target={x:p.x,y:p.y+32};if(!canStand(target,obstacles,townWalkBounds))return false;
  const route=findWalkingPath(start,target,obstacles,townWalkBounds);const end=route.at(-1);return !!end&&Math.hypot(end.x-target.x,end.y-target.y)<1;
 });
 if(!spot)throw new Error('職人を配置できません');return spot;
}
const body=choose([]),chassis=choose([body]);
export const hiddenCrafts=[{...body,kind:'body' as const,name:'風間 紬',appearance:'yuunagiOwner' as const},{...chassis,kind:'chassis' as const,name:'鉄谷 朔',appearance:'akatsukiOwner' as const}];
