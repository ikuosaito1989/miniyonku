import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shopPalette, tileSpeckles } from '../data/shopStyle';
test('店内の石目模様は再現可能で、タイルの目地・外周を壊さない',()=>{
  assert.deepEqual(tileSpeckles(3,4),tileSpeckles(3,4));
  assert.notDeepEqual(tileSpeckles(3,4),tileSpeckles(4,4));
  for(let row=0;row<15;row++)for(let col=0;col<28;col++)for(const p of tileSpeckles(col,row)){
    assert.ok(p.x>=3&&p.x+2<30);assert.ok(p.y>=3&&p.y<29);
  }
  assert.equal(shopPalette.floor.length,4);
});
