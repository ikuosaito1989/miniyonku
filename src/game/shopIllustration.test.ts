import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixtures } from '../data/shop';
import { fixtureArtFrame, shopIllustrationSize } from '../data/shopIllustration';
import { personSpriteSize } from './PeopleArt';
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
  const board=fixtures.find(f=>f.kind==='board')!,shelves=fixtures.filter(f=>f.kind==='shelf');
  assert.ok(board.w<=personSpriteSize.displayWidth*1.25&&board.h<=personSpriteSize.displayHeight*1.3,'掲示板は人物と同程度の大きさにする');
  assert.ok(shelves.every(f=>f.w<=personSpriteSize.displayWidth*2&&f.h<=personSpriteSize.displayHeight*1.7),'商品棚を人物に対して過大にしない');
  assert.deepEqual(shopIllustrationSize,{width:960,height:640});
});
