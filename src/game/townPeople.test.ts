import {test} from 'node:test';
import assert from 'node:assert/strict';
import {townPeople,townPersonAdvice} from '../data/townPeople';
import {npcAppearanceId} from '../data/npcAppearance';
import {townVenues,townBlocks,townWalkBounds,townSpawn} from '../data/world';
import {canStand,findWalkingPath} from './navigation';
import {useGame} from './store';

test('街の6人は異なる顔で歩ける場所にいて、入口や出現地点をふさがない',()=>{
 assert.equal(townPeople.length,6);
 assert.equal(new Set(townPeople.map(p=>p.appearance)).size,6);
 const buildings=[...townVenues,...townBlocks].map(v=>({...v,width:v.w,height:v.h}));
 const obstacles=[...buildings,...townPeople.map(p=>({x:p.x-12,y:p.y-9,width:24,height:21}))];
 for(const p of townPeople){
  assert.equal(npcAppearanceId(p.name),p.appearance);
  assert.ok(canStand(p,buildings,townWalkBounds),p.name);
  const approach={x:p.x,y:p.y+32};
  assert.ok(canStand(approach,obstacles,townWalkBounds),p.name+' conversation spot');
  const spawn=townSpawn(p.venue);
  assert.ok(canStand(spawn,obstacles,townWalkBounds));
  assert.ok(findWalkingPath(spawn,approach,obstacles,townWalkBounds).length,p.name+' reachable');
 }
});
test('次の目的と条件は保存進行に従い、豆知識は種類ごとに違う',()=>{
 const state=useGame.getInitialState(),next=townPeople.find(p=>p.topic==='next')!,entry=townPeople.find(p=>p.topic==='entry')!;
 assert.match(townPersonAdvice(next,state),/こもれび模型店で初優勝/);
 assert.doesNotMatch(townPersonAdvice(next,state),/ゼニス/);
 assert.match(townPersonAdvice(entry,{...state,officialQualified:true}),/2戦制/);
 assert.match(townPersonAdvice(entry,{...state,finalQualified:true}),/2位以内/);
 assert.match(townPersonAdvice(next,{...state,grandprixCleared:true,akatsukiRaceCount:3}),/3\/5/);
 assert.match(townPersonAdvice(next,{...state,zenithCleared:true}),/ベストタイム/);
 assert.equal(new Set(townPeople.map(p=>townPersonAdvice(p,state))).size,6);
});
