import {test} from 'node:test';
import assert from 'node:assert/strict';
import {npcAppearances,npcAppearanceId,type NpcAppearanceId} from '../data/npcAppearance';
import {npcDrawing} from './NpcPeopleArt';
import {shopThemes,walkingSpeed} from '../data/shopThemes';
import {modelShops} from '../data/world';
import {dialoguePeople} from '../data/dialoguePeople';
test('16人は別の顔・原画セルを持ち、全方向・歩行フレームが原画内に収まる',()=>{
 const faces=new Set<string>(),tiles=new Set<number>();
 for(const id of Object.keys(npcAppearances) as NpcAppearanceId[]){
  faces.add(JSON.stringify(npcDrawing(id,'down')));tiles.add(npcAppearances[id].tile);
  for(const facing of ['up','down','left','right'] as const)for(let frame=0;frame<4;frame++)for(const shape of npcDrawing(id,facing,frame)){
   const points=shape.kind==='rect'?[[shape.x,shape.y],[shape.x+shape.w,shape.y+shape.h]]:shape.points;
   for(const [x,y] of points)assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=60&&y>=0&&y<=80,`${id} ${facing}: ${x},${y}`);
  }
 }
 assert.equal(faces.size,16);assert.equal(tiles.size,16);
 for(const shop of Object.values(modelShops))assert.ok(npcAppearanceId(shop.owner));
 for(const id of ['rival','guide','mechanic','ren','sou','momo'] as const)assert.equal(dialoguePeople[id].faceBase,`npc-${id}`);
});
test('全店舗・練習場は共通の模型店の床を保ち、配色を変え、歩行は約2割速くする',()=>{
 assert.equal(new Set(Object.values(shopThemes).map(t=>t.style)).size,7);
 assert.equal(new Set(Object.values(shopThemes).map(t=>t.floor)).size,21);assert.ok(Object.values(shopThemes).every(t=>t.pattern==='tile'));
 assert.ok(walkingSpeed.town>235&&walkingSpeed.town<300);assert.ok(walkingSpeed.interior>155&&walkingSpeed.interior<210);
});
