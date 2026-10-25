import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateTownVenues,townVenues,townSize,townWalkBounds,townSpawn,townBlocks} from '../data/world';
import {canStand,canTravel,findWalkingPath} from './navigation';
test('広域マップは店と大型会場を重複なく散らし、乱数の種ごとに配置を再現する',()=>{
 assert.ok(townSize.width*townSize.height>=960*640*12);
 assert.deepEqual(generateTownVenues(),townVenues);
 assert.notDeepEqual(generateTownVenues(7),generateTownVenues(8));
 for(const seed of [7,8,42,19890421]){
  const list=generateTownVenues(seed);
  for(const v of list){
   assert.ok(v.x>=townWalkBounds.left&&v.x+v.w<townWalkBounds.right);
   assert.ok(v.y-80>townWalkBounds.top&&v.y+v.h+70<townWalkBounds.bottom);
   for(const other of list)if(v!==other)assert.ok(v.x+v.w+40<other.x||other.x+other.w+40<v.x||v.y+v.h+80<other.y||other.y+other.h+80<v.y);
   if(v.kind==='stadium')assert.ok(v.w>=350&&v.h>=250);
  }
 }
});
test('広域マップの帰還地点と遠方への道は、店内の歩行制限と独立している',()=>{
 const obstacles=[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h}));
 const start=townSpawn('komorebi');assert.ok(canStand(start,obstacles,townWalkBounds));
 for(const id of ['aozora','hinata','wakaba','stadium-5','stadium-9'] as const){
  const target=townSpawn(id);assert.ok(canStand(target,obstacles,townWalkBounds));
  const path=findWalkingPath(start,target,obstacles,townWalkBounds);assert.deepEqual(path.at(-1),target);
  let before=start;for(const p of path){assert.ok(canTravel(before,p,obstacles,townWalkBounds));before=p;}
 }
});
