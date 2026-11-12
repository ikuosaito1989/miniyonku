import {townBlocks,townRoads,townVenues,townWalkBounds} from './world';
import {hiddenMechanicSpot} from './hiddenMechanic';
import {canStand,canTravel,findWalkingPath,type Point} from '../game/navigation';

export interface TownPath {points:Point[];kind:'lane'|'spur'}
// Extra clearance leaves room for the visible path as well as the player's feet.
const obstacles=[...townVenues,...townBlocks].map(b=>({x:b.x-12,y:b.y-12,width:b.w+24,height:b.h+24}));
const same=(a:Point,b:Point)=>a.x===b.x&&a.y===b.y;

function generatePaths():TownPath[]{
 const result:TownPath[]=[];
 for(const [index,house] of townBlocks.entries()){
  const start={x:house.x+house.w/2,y:house.y+house.h+44};
  if(!canStand(start,obstacles,townWalkBounds))continue;
  const streets=townRoads.horizontal.map(y=>({x:start.x,y})).sort((a,b)=>Math.abs(a.y-start.y)-Math.abs(b.y-start.y));
  let connected=0;
  for(const target of streets){
   if(!canStand(target,obstacles,townWalkBounds))continue;
   const route=findWalkingPath(start,target,obstacles,townWalkBounds);
   if(!route.length||!same(route[route.length-1],target))continue;
   const points=[start,...route];result.push({kind:'lane',points});
   // A short dead-end offers an optional turn without blocking any walking.
   const first=route[0];
   if(first&&connected===0){
    const horizontal=first.y===start.y;
    for(const sign of [1,-1]){
     const end=horizontal?{x:start.x,y:start.y+sign*80}:{x:start.x+sign*80,y:start.y};
     if(canTravel(start,end,obstacles,townWalkBounds)){result.push({kind:'spur',points:[start,end]});break;}
    }
   }
   connected++;
   // Some blocks have a second outlet, making an actual through route.
   if(connected>=(index%3===0?2:1))break;
  }
 }
 // A quieter turn off the southern road leads toward the existing hidden
 // mechanic; the location and reward remain unchanged and unmarked on maps.
 const hiddenLane=[{x:6600,y:4480},{x:6600,y:4380},{x:hiddenMechanicSpot.x,y:4380},{x:hiddenMechanicSpot.x,y:hiddenMechanicSpot.y+32}];
 if(hiddenLane.every((p,i)=>i===0?canStand(p,obstacles,townWalkBounds):canTravel(hiddenLane[i-1],p,obstacles,townWalkBounds)))result.push({kind:'spur',points:hiddenLane});
 return result;
}
export const townPaths=generatePaths();
