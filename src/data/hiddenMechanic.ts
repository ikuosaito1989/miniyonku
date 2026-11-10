import {townVenues,townWalkBounds,townSpawn} from './world';
import {townPeople} from './townPeople';
import {canStand,findWalkingPath} from '../game/navigation';
const buildings=townVenues.map(v=>({x:v.x,y:v.y,width:v.w,height:v.h}));
const start=townSpawn('komorebi');
const candidates=[] as Array<{x:number;y:number}>;
for(let y=townWalkBounds.top+72;y<townWalkBounds.bottom-72;y+=112){
 for(let x=townWalkBounds.left+72;x<townWalkBounds.right-72;x+=112){
  const spot={x,y};
  if(townVenues.some(v=>x>v.x-180&&x<v.x+v.w+180&&y>v.y-180&&y<v.y+v.h+180))continue;
  if(townPeople.some(p=>Math.hypot(p.x-x,p.y-y)<140))continue;
  candidates.push(spot);
 }
}
candidates.sort((a,b)=>Math.hypot(b.x-start.x,b.y-start.y)-Math.hypot(a.x-start.x,a.y-start.y));
export const hiddenMechanicSpot=candidates.find(p=>{
 const person={x:p.x-12,y:p.y-9,width:24,height:21};
 const approach={x:p.x,y:p.y+32};
 const obstacles=[...buildings,...townPeople.map(q=>({x:q.x-12,y:q.y-9,width:24,height:21})),person];
 return canStand(p,buildings,townWalkBounds)&&canStand(approach,obstacles,townWalkBounds)&&findWalkingPath(start,approach,obstacles,townWalkBounds).length>0;
})??{x:townWalkBounds.left+80,y:townWalkBounds.top+80};
export const mechanicManName='メカニックマン';
