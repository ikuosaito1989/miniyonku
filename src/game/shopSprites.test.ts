import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seniorDrawing, challengerDrawing, personDrawing, personSpriteSize, type Facing, type PersonKind } from './PeopleArt';
import { counterDrawing, counterSpriteSize } from './CounterArt';
import type { PixelShape } from './pixelDrawing';
function inside(shapes:PixelShape[],width:number,height:number){
  for(const shape of shapes){
    assert.ok(shape.alpha>=0&&shape.alpha<=1);
    const points=shape.kind==='rect'?[[shape.x,shape.y],[shape.x+shape.w,shape.y+shape.h]]:shape.points;
    for(const [x,y] of points){assert.ok(Number.isFinite(x)&&x>=0&&x<=width,`x=${x}`);assert.ok(Number.isFinite(y)&&y>=0&&y<=height,`y=${y}`);}
  }
}
test('全80人物スプライトは原画範囲内に収まり、服装・向き・歩行を描き分ける',()=>{
  const kinds:PersonKind[]=['player','owner','rival','guide','mechanic'],directions:Facing[]=['down','up','left','right'];
  const looks=new Set<string>();
  for(const kind of kinds){
    looks.add(JSON.stringify(personDrawing(kind,'down',0)));
    for(const direction of directions)for(let frame=0;frame<4;frame++)inside(personDrawing(kind,direction,frame),60,80);
    assert.notDeepEqual(personDrawing(kind,'down',0),personDrawing(kind,'up',0));
    assert.notDeepEqual(personDrawing(kind,'right',0),personDrawing(kind,'left',0));
    assert.notDeepEqual(personDrawing(kind,'down',1),personDrawing(kind,'down',3));
  }
  assert.equal(looks.size,5);assert.equal(personSpriteSize.displayWidth,48);assert.equal(personSpriteSize.displayHeight,64);
});
test('専用カウンターの面・小物・ガラスの透過レイヤーは原画内に収まる',()=>{
  const shapes=counterDrawing();inside(shapes,counterSpriteSize.width,counterSpriteSize.height);
  assert.ok(shapes.some(shape=>shape.kind==='polygon'));assert.ok(shapes.some(shape=>shape.alpha<1));
  assert.deepEqual(shapes,counterDrawing());
});

test('黒岩は元の短髪と体格・表情を保ち、全方向・歩行が原画内に収まる',()=>{
  for(const facing of ['down','up','left','right'] as const)for(let frame=0;frame<4;frame++)inside(challengerDrawing(facing,frame),60,80);
  const xs=challengerDrawing('down').flatMap(s=>s.kind==='rect'?[s.x,s.x+s.w]:s.points.map(p=>p[0]));assert.ok(Math.max(...xs)-Math.min(...xs)>40);
  assert.notDeepEqual(challengerDrawing('down'),personDrawing('rival','down',0));
  assert.notDeepEqual(challengerDrawing('left'),challengerDrawing('right'));
});

test('迅が肩までの長髪で、全方向・歩行フレームが原画に収まる',()=>{
 for(const facing of ['down','up','left','right'] as const)for(let frame=0;frame<4;frame++)inside(seniorDrawing(facing,frame),60,80);
 assert.ok(seniorDrawing('down').some(s=>s.kind==='polygon'&&s.color==='#242532'&&s.points.some(([,y])=>y>=43)));
 assert.notDeepEqual(seniorDrawing('down'),challengerDrawing('down'));
});
