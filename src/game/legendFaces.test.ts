import {test} from 'node:test';
import assert from 'node:assert/strict';
import {legendPersonDrawing,type LegendPerson} from './LegendPeopleArt';
import {dialoguePeople} from '../data/dialoguePeople';
const ids:LegendPerson[]=['rei','gaku','towa','koya'];
test('4人の頭部は配色だけでなく目・輪郭・髪の形状が異なる',()=>{
 const heads=ids.map(id=>legendPersonDrawing(id,'down').filter(shape=>(shape.kind==='rect'?shape.y:Math.min(...shape.points.map(([,y])=>y)))<34).map(shape=>shape.kind==='rect'?{kind:shape.kind,x:shape.x,y:shape.y,w:shape.w,h:shape.h}:{kind:shape.kind,points:shape.points}));
 assert.equal(new Set(heads.map(head=>JSON.stringify(head))).size,4);
 assert.match(dialoguePeople.legendRei.expression,/切れ長/);assert.match(dialoguePeople.legendGaku.expression,/丸い目/);assert.match(dialoguePeople.senior.expression,/つり目/);assert.match(dialoguePeople.legendKoya.expression,/丸眼鏡/);
});
test('専用の歩行原画は全方向・全歩行フレームで欠けない',()=>{
 for(const id of ids)for(const direction of ['down','up','left','right'] as const)for(let frame=0;frame<4;frame++){
  const drawing=legendPersonDrawing(id,direction,frame);assert.ok(drawing.length>50);
  for(const shape of drawing){const points=shape.kind==='rect'?[[shape.x,shape.y],[shape.x+shape.w,shape.y+shape.h]]:shape.points;for(const [x,y] of points)assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=60&&y>=0&&y<=80,`${id} ${direction}: ${x},${y}`);}
 }
});
