import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lappedPose,lappedPresentationSeconds} from './lappedPresentation';
test('周回遅れは跳ね上がって回転しながら外へ飛び、結果表示前に着地する',()=>{
 const start=lappedPose(0),air=lappedPose(.7),land=lappedPose(1.4);
 assert.equal(start.height,0);assert.equal(start.outward,0);
 assert.ok(air.height>.7);assert.ok(air.outward>0);assert.ok(Math.abs(air.roll)>Math.PI);
 assert.equal(land.height,0);assert.equal(land.outward,1.4);
 assert.deepEqual(lappedPose(lappedPresentationSeconds),land);
 assert.deepEqual(lappedPose(100),land);assert.deepEqual(lappedPose(-1),start);
});
