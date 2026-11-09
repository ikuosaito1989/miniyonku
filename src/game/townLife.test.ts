import {outdoorAdvisors,outdoorAdvice} from '../data/outdoorAdvisors';
import {practiceCourseIds} from '../data/practiceCourses';
import {parts} from '../data/parts';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {townCrowd,townCrowdObstacles,generateTownCrowd,crowdFootprint} from '../data/townCrowd';
import {townPeople} from '../data/townPeople';
import {hiddenMechanicSpot} from '../data/hiddenMechanic';
import {townVenues,townBlocks,townWalkBounds,townSpawn} from '../data/world';
import {outdoorTimeBoardPlacement} from '../data/timeBoard';
import {canStand,canTravel,findWalkingPath} from './navigation';
const buildings=[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h}));
const obstacles=[...buildings,...[...townPeople,hiddenMechanicSpot].map(crowdFootprint),...townCrowdObstacles];

test('観客と住民を再現可能に配置し、全コースに観客と複数の住宅・外観を用意する',()=>{
 assert.deepEqual(generateTownCrowd(),townCrowd);
 assert.ok(townCrowd.length>=120);
 assert.ok(townBlocks.length>=15);
 assert.ok(new Set(townCrowd.map(p=>p.appearance)).size>=12);
 for(const v of townVenues.filter(v=>v.kind==='outdoor'))assert.ok(townCrowd.filter(p=>p.venue===v.id&&p.activity==='watch').length>=2,v.id);
 for(const p of townCrowd){assert.ok(canStand(p,buildings,townWalkBounds),p.id);assert.ok(canStand(p,[...townPeople,hiddenMechanicSpot,...townCrowd.filter(q=>q!==p)].map(crowdFootprint),townWalkBounds),p.id+' spacing');}
});
test('住宅と群衆があっても全入口・看板・案内人・職人へ実際の歩行経路で到達できる',()=>{
 const start=townSpawn('komorebi');
 const goals=[...outdoorAdvisors.map(p=>({x:p.x,y:p.y+32,id:p.name})),...townVenues.map(v=>({...townSpawn(v.id as Parameters<typeof townSpawn>[0]),id:v.id})),...[...townPeople,hiddenMechanicSpot].map((p,i)=>({x:p.x,y:p.y+32,id:`person-${i}`})),...townVenues.filter(v=>v.kind==='outdoor').map(v=>{const b=outdoorTimeBoardPlacement(v);return {x:b.x+b.w/2,y:b.y+b.h+28,id:v.id+' board'};})];
 for(const goal of goals){
  if(!goal.id.endsWith(' board'))assert.ok(canStand(goal,obstacles,townWalkBounds),goal.id+' clear');
  const route=findWalkingPath({x:start.x,y:start.y},{x:goal.x,y:goal.y},obstacles,townWalkBounds);const end=route.at(-1)!;assert.ok(end&&Math.hypot(end.x-goal.x,end.y-goal.y)<22,goal.id+' interaction range');
  let previous=start;for(const point of route){assert.ok(canTravel(previous,point,obstacles,townWalkBounds),goal.id+' route');previous=point;}
 }
});

test('全屋外コースに、実際のパーツを具体的にすすめる会話役がいる',()=>{
 assert.equal(outdoorAdvisors.length,practiceCourseIds.length);
 assert.equal(new Set(outdoorAdvisors.map(p=>p.id)).size,practiceCourseIds.length);
 assert.equal(new Set(outdoorAdvisors.map(p=>p.name)).size,practiceCourseIds.length);
 for(const p of outdoorAdvisors){
  assert.ok(townCrowd.some(c=>c.id===p.id&&c.venue===p.courseId&&c.appearance===p.appearance));
  const text=outdoorAdvice(p.courseId),named=[...text.matchAll(/「([^」]+)」/g)].map(m=>m[1]);
  assert.equal(named.filter(name=>parts.some(part=>part.name===name)).length,3,p.courseId);
 }
});
