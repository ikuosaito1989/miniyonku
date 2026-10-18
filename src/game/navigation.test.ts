import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixtures,room } from '../data/shop';
import { shopPeople } from '../data/story';
import { canStand,canTravel,findWalkingPath,type Point } from './navigation';
const obstacles=[...fixtures.map(f=>({x:f.x,y:f.y,width:f.w,height:f.h})),{x:shopPeople.rival.x-12,y:shopPeople.rival.y-9,width:24,height:21}];
function verify(start:Point,route:Point[]){
  let previous=start;
  for(const point of route){assert.ok(point.x===previous.x||point.y===previous.y);assert.ok(canStand(point,obstacles));assert.ok(canTravel(previous,point,obstacles));previous=point;}
}
test('タップ先へ4方向で歩き、棚を横切らず迂回する',()=>{
  const start={x:150,y:450},target={x:150,y:250};
  const route=findWalkingPath(start,target,obstacles);assert.ok(route.length>2);verify(start,route);assert.deepEqual(route.at(-1),target);
});
test('机・店員・コースをタップした場合は近くの到達可能な通路へ移動する',()=>{
  for(const fixture of fixtures){
    const target={x:fixture.x+fixture.w/2,y:fixture.y+fixture.h/2};
    const route=findWalkingPath(room.spawn,target,obstacles);assert.ok(route.length>0);verify(room.spawn,route);
    const end=route.at(-1)!;assert.ok(Math.hypot(end.x-Math.max(fixture.x,Math.min(end.x,fixture.x+fixture.w)),end.y-Math.max(fixture.y,Math.min(end.y,fixture.y+fixture.h)))<62);
  }
});
test('細かい座標・行き止まり・範囲外でも障害物と画面の外へ歩かない',()=>{
  const start={x:480.3,y:550.7};
  for(const target of [{x:242.7,y:260.2},{x:-100,y:-100},{x:9999,y:9999},{...start}])verify(start,findWalkingPath(start,target,obstacles));
  const sealed=[...obstacles,{x:430,y:490,width:100,height:10},{x:430,y:490,width:10,height:90},{x:520,y:490,width:10,height:90},{x:430,y:570,width:100,height:10}];
  const route=findWalkingPath({x:480,y:540},{x:100,y:200},sealed);assert.ok(route.every(p=>p.x>440&&p.x<520&&p.y>500&&p.y<570));
});
