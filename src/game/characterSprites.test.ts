import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {characterSpriteIds,characterSpriteRow} from './characterSprites';
import {npcAppearances,type NpcAppearanceId} from '../data/npcAppearance';
import {npcDrawing} from './NpcPeopleArt';
import {personDrawing,challengerDrawing,doctorDrawing,seniorDrawing} from './PeopleArt';
import {legendPersonDrawing} from './LegendPeopleArt';

test('新しい全24人のスプライト素材が同梱され、WebPとして配信できる',()=>{
 for(const id of characterSpriteIds){
  const path=new URL(`../../public/assets/characters/${id}.webp`,import.meta.url);
  assert.ok(existsSync(path),id);
  const data=readFileSync(path);assert.equal(data.toString('ascii',8,12),'WEBP',id);
 }
});
test('住人・主人公・専用人物は全方向・全フレームで対応する新原画を参照する',()=>{
 const people=[...Object.keys(npcAppearances).map(id=>({id,draw:(d:Parameters<typeof npcDrawing>[1],f:number)=>npcDrawing(id as NpcAppearanceId,d,f)})),
  {id:'player',draw:(d:Parameters<typeof npcDrawing>[1],f:number)=>personDrawing('player',d,f)},
  ...(['rei','gaku','towa','koya'] as const).map(id=>({id,draw:(d:Parameters<typeof npcDrawing>[1],f:number)=>legendPersonDrawing(id,d,f)})),
  ...[{id:'go',draw:challengerDrawing},{id:'doctor',draw:doctorDrawing},{id:'senior',draw:seniorDrawing}]];
 for(const {id,draw} of people)for(const direction of ['down','right','up','left'] as const)for(let frame=0;frame<4;frame++){
  const drawing=draw(direction,frame),pose=drawing[0].sprite;
  assert.ok(pose,id);assert.equal(pose.id,id);assert.equal(pose.direction,direction);assert.equal(pose.frame,frame);assert.equal(pose.shapeCount,drawing.length);
 }
 assert.deepEqual(characterSpriteRow,{down:0,right:1,up:2,left:3});
});
