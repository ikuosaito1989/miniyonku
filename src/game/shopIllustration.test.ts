import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixtures } from '../data/shop';
import { fixtureArtFrame, shopIllustrationSize } from '../data/shopIllustration';
test('背景と前景の原画範囲は家具の当たり判定に対応し、家具の底辺を描画順に使う',()=>{
  for(const fixture of fixtures){
    const frame=fixtureArtFrame(fixture);
    assert.equal(frame.x,fixture.x);assert.equal(frame.width,fixture.w);
    assert.equal(frame.y,fixture.y,'不透明な床で家具の背後の人物を隠さない');
    assert.equal(frame.y+frame.height,fixture.y+fixture.h);
    assert.equal(frame.depth,fixture.y+fixture.h);
    assert.ok(frame.y<=fixture.y&&frame.x>=0&&frame.y>=0);
    assert.ok(frame.x+frame.width<=shopIllustrationSize.width);
    assert.ok(frame.y+frame.height<=shopIllustrationSize.height);
  }
  assert.deepEqual(shopIllustrationSize,{width:960,height:640});
});
