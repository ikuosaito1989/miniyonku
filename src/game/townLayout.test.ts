import {isPracticeCourse} from '../data/practiceCourses';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateTownVenues,generateTownBlocks,townVenues,townSize,townWalkBounds,townSpawn,townBlocks,townRoads,townPlaza} from '../data/world';
import {hiddenMechanicSpot} from '../data/hiddenMechanic';
import {canStand,canTravel,findWalkingPath} from './navigation';
test('広域マップは店と大型会場を重複なく散らし、乱数の種ごとに配置を再現する',()=>{
 assert.ok(townSize.width*townSize.height>=960*640*12);
 assert.deepEqual(generateTownVenues(),townVenues);
 assert.notDeepEqual(generateTownVenues(7),generateTownVenues(8));
 for(const seed of [7,8,42,19890421,...Array.from({length:32},(_,i)=>i)]){
  const list=generateTownVenues(seed);
  for(const v of list){
   assert.ok(v.x>=townWalkBounds.left&&v.x+v.w<townWalkBounds.right);
   assert.ok(v.y-80>townWalkBounds.top&&v.y+v.h+70<townWalkBounds.bottom);
   for(const other of list)if(v!==other)assert.ok(v.x+v.w+40<other.x||other.x+other.w+40<v.x||v.y+v.h+80<other.y||other.y+other.h+80<v.y);
   if(v.kind==='stadium'&&!isPracticeCourse(v.id))assert.ok(v.w>=250&&v.h>=250);
   if(v.kind!=='outdoor'){
    for(const x of townRoads.vertical)assert.ok(v.x>=x+70||v.x+v.w<=x-70,`${v.id} overlaps vertical road`);
    for(const y of townRoads.horizontal)assert.ok(v.y>=y+70||v.y+v.h<=y-70,`${v.id} overlaps horizontal road`);
   }
  }
 }
});
test('街区は舗装道路でつながり、店舗の玄関は次の通りに短い歩道で接続する',()=>{
 assert.deepEqual(townSize,{width:7000,height:4600});
 for(const v of townVenues.filter(v=>v.kind!=='outdoor')){
  const entrance=townSpawn(v.id as Parameters<typeof townSpawn>[0]);
  const nextStreet=townRoads.horizontal.find(y=>y>v.y)!;
  assert.ok(nextStreet-entrance.y>=58&&nextStreet-entrance.y<=350,`${v.id} entrance should connect to its frontage street`);
  const path=findWalkingPath(entrance,{x:entrance.x,y:nextStreet},[...townVenues,...townBlocks].map(q=>({x:q.x,y:q.y,width:q.w,height:q.h})),townWalkBounds);
  assert.ok(path.length>0,`${v.id} entrance should connect to the road`);
 }
 const offsets=townVenues.filter(v=>v.kind==='shop').map(v=>v.y-townRoads.horizontal.filter(y=>y<v.y).at(-1)!);
 assert.ok(new Set(offsets).size>5,'shops occupy varied positions within their blocks');
 assert.ok(townBlocks.length>10,'residential buildings add varied blocks');
 assert.equal(townVenues.some(v=>v.x<townPlaza.x+townPlaza.w&&v.x+v.w>townPlaza.x&&v.y<townPlaza.y+townPlaza.h&&v.y+v.h>townPlaza.y),false);
});
test('住宅は再生成しても同じ位置で、主要道路と施設の余白を保つ',()=>{
 assert.deepEqual(generateTownBlocks(),townBlocks);
 assert.deepEqual(hiddenMechanicSpot,{x:6744,y:4424});
 assert.ok(new Set(townBlocks.map(b=>b.style)).size>=4);
 for(const block of townBlocks){
  for(const x of townRoads.vertical)assert.ok(block.x>=x+100||block.x+block.w<=x-100);
  for(const y of townRoads.horizontal)assert.ok(block.y>=y+100||block.y+block.h<=y-100);
  for(const v of townVenues){const gap=v.kind==='stadium'?190:150;assert.ok(block.x>=v.x+v.w+gap||block.x+block.w+gap<=v.x||block.y>=v.y+v.h+gap||block.y+block.h+gap<=v.y,v.id);}
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
