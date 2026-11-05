import {townBlocks,townVenues,townWalkBounds,townSpawn} from './world';
import {canStand,findWalkingPath} from '../game/navigation';
const buildings=[...townBlocks,...townVenues].map(b=>({x:b.x,y:b.y,width:b.w,height:b.h}));
const start=townSpawn('komorebi');
const candidates=townBlocks.flatMap(b=>[{x:b.x+b.w+38,y:b.y+b.h-20},{x:b.x-38,y:b.y+b.h-20}])
 .filter(p=>canStand(p,buildings,townWalkBounds)&&canStand({x:p.x,y:p.y+32},buildings,townWalkBounds)&&townVenues.every(v=>Math.hypot(p.x-v.x-v.w/2,p.y-v.y-v.h/2)>220))
 .sort((a,b)=>Math.hypot(b.x-start.x,b.y-start.y)-Math.hypot(a.x-start.x,a.y-start.y));
export const hiddenMechanicSpot=candidates.find(p=>findWalkingPath(start,{x:p.x,y:p.y+32},[...buildings,{x:p.x-12,y:p.y-9,width:24,height:21}],townWalkBounds).length>0)??{x:100,y:2300};
export const mechanicManName='メカニックマン';
