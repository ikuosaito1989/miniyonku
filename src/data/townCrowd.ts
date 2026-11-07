import {townVenues,townBlocks,townRoads,townWalkBounds,townSpawn} from './world';
import {townPeople} from './townPeople';
import {hiddenMechanicSpot} from './hiddenMechanic';
import {outdoorTimeBoardPlacement} from './timeBoard';
import {canStand,type Point,type Obstacle} from '../game/navigation';
import type {NpcAppearanceId} from './npcAppearance';
import type {Facing} from '../game/PeopleArt';

export interface TownCrowdPerson extends Point {id:string;appearance:NpcAppearanceId;facing:Facing;activity:'watch'|'chat'|'rest';venue?:string;accessory:'bag'|'car'|'none'}
const appearances:NpcAppearanceId[]=['ren','guide','owner','momo','offroader','venueStaff','sou','wakabaOwner','mechanic','atelierOwner','rival','hinataOwner','aozoraOwner','yuunagiOwner'];
export const crowdFootprint=(p:Point):Obstacle=>({x:p.x-12,y:p.y-9,width:24,height:21});
const buildings=[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h}));
const people=[...townPeople,hiddenMechanicSpot];
const spawns=townVenues.map(v=>townSpawn(v.id as Parameters<typeof townSpawn>[0]));
const boards=townVenues.filter(v=>v.kind==='outdoor').map(outdoorTimeBoardPlacement);
/** Crowd placement is stable and leaves the entrance, return point and sign approach open. */
export function generateTownCrowd(){
 const result:TownCrowdPerson[]=[];
 const add=(p:Point,facing:Facing,activity:TownCrowdPerson['activity'],venue?:string)=>{
  if(!canStand(p,buildings,townWalkBounds))return;
  if([...people,...result].some(q=>Math.abs(p.x-q.x)<47&&Math.abs(p.y-q.y)<60))return;
  if(spawns.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<72))return;
  if(boards.some(b=>p.x>b.x-35&&p.x<b.x+b.w+35&&p.y>b.y-28&&p.y<b.y+b.h+54))return;
  // Keep a generous continuous path from every entrance towards its nearest road.
  if(townVenues.some(v=>{const x=v.x+v.w/2,y=v.y+v.h+30,road=townRoads.horizontal.reduce((a,b)=>Math.abs(b-y)<Math.abs(a-y)?b:a);return Math.abs(p.x-x)<49&&p.y>Math.min(y,road)-25&&p.y<Math.max(y,road)+30;}))return;
  const i=result.length;result.push({...p,id:`crowd-${venue??'street'}-${i}`,appearance:appearances[i%appearances.length],facing,activity,venue,accessory:i%5===0?'car':i%3===0?'bag':'none'});
 };
 for(const v of townVenues){
  if(v.kind==='outdoor'){
   for(const f of [.15,.65]){add({x:v.x-38,y:v.y+v.h*f},'right','watch',v.id);add({x:v.x+v.w+38,y:v.y+v.h*f},'left','watch',v.id);}
   for(const f of [.05,.38,.72])add({x:v.x+v.w*f,y:v.y-26},'down','watch',v.id);
   add({x:v.x+12,y:v.y+v.h+55},'up','watch',v.id);
  }else{
   add({x:v.x-42,y:v.y+v.h+36},'right','chat',v.id);
   add({x:v.x+v.w+46,y:v.y+v.h+38},'left','chat',v.id);
  }
 }
 for(const b of townBlocks){add({x:b.x-34,y:b.y+b.h+40},'right','rest');add({x:b.x+b.w+40,y:b.y+b.h+43},'left','chat');}
 // Groups on the pavements give the spaces between destinations life too.
 for(const x of townRoads.vertical)for(let y=230;y<2260;y+=238){add({x:x-79,y},'down','chat');add({x:x+82,y:y+42},'up','rest');}
 return result;
}
export const townCrowd=generateTownCrowd();
export const townCrowdObstacles=townCrowd.map(crowdFootprint);
