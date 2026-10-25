import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shopRenderScale} from '../data/display';
import {personDrawing,challengerDrawing,doctorDrawing,offroaderDrawing,personSpriteSize,type Facing,type PersonKind} from './PeopleArt';

test('2DのRetina描画はDPR2を使用し、画面サイズとGPU上限を守る',()=>{
  assert.equal(shopRenderScale(390,844,3),2);
  assert.equal(shopRenderScale(844,390,2),2);
  assert.equal(shopRenderScale(1100,850,1),1);
  for(const [w,h,dpr] of [[2000,1500,3],[4000,2000,3],[390,844,2]]){
    const ratio=shopRenderScale(w,h,dpr);
    assert.ok(w*ratio<=2560&&h*ratio<=2560);
    assert.ok(w*h*ratio*ratio<=4_000_001);
  }
  for(const invalid of [NaN,Infinity,-1,0])assert.ok(Number.isFinite(shopRenderScale(invalid,invalid,invalid)));
});

test('全人物の4方向・全歩行フレームが原画内に収まり、高精細化で欠けない',()=>{
  const drawings=[...(['player','owner','rival','guide','mechanic'] as PersonKind[]).map(kind=>(direction:Facing,frame:number)=>personDrawing(kind,direction,frame)),challengerDrawing,doctorDrawing,offroaderDrawing];
  for(const draw of drawings)for(const direction of ['down','up','left','right'] as Facing[])for(let frame=0;frame<4;frame++){
    const shapes=draw(direction,frame);assert.ok(shapes.length>50);
    for(const shape of shapes){
      const points=shape.kind==='rect'?[[shape.x,shape.y],[shape.x+shape.w,shape.y+shape.h]]:shape.points;
      for(const [x,y] of points)assert.ok(x>=0&&x<=personSpriteSize.width&&y>=0&&y<=personSpriteSize.height,`${direction} ${frame}: ${x},${y}`);
    }
  }
});
