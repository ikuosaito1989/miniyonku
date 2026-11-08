import {test} from 'node:test';
import assert from 'node:assert/strict';
import {personDrawing} from './PeopleArt';
import {npcDrawing} from './NpcPeopleArt';
import type {PixelShape} from './pixelDrawing';
const points=(shapes:PixelShape[]):ReadonlyArray<readonly [number,number]>=>shapes.flatMap<readonly [number,number]>(s=>s.kind==='rect'?[[s.x,s.y],[s.x+s.w,s.y+s.h]]:s.points);
const bounds=(shapes:PixelShape[],head=false)=>{const p=points(shapes).filter(([,y])=>!head||y<39);return {w:Math.max(...p.map(p=>p[0]))-Math.min(...p.map(p=>p[0])),h:Math.max(...p.map(p=>p[1]))-Math.min(...p.map(p=>p[1]))};};
test('主人公の実際の頭・全身の大きさをモブと揃え、同じ半ドット格子で描く',()=>{
 for(const direction of ['down','up','left','right'] as const)for(let frame=0;frame<4;frame++){
  const hero=personDrawing('player',direction,frame),npc=npcDrawing('ren',direction,frame),h=bounds(hero),n=bounds(npc),hh=bounds(hero,true),nh=bounds(npc,true);
  assert.ok(h.w/n.w>=.9&&h.w/n.w<=1.15,`${direction}: body ${h.w}/${n.w}`);
  assert.ok(h.h/n.h>=.96&&h.h/n.h<=1.05,`${direction}: height ${h.h}/${n.h}`);
  assert.ok(hh.w/nh.w>=.9&&hh.w/nh.w<=1.15,`${direction}: head ${hh.w}/${nh.w}`);
  for(const [x,y] of points(hero)){assert.ok(x>=0&&x<=60&&y>=0&&y<=80);assert.equal(x*2,Math.round(x*2));assert.equal(y*2,Math.round(y*2));}
 }
});
