import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getCircuitTrack} from '../data/circuit';
import {batteryCapacity,batteryCharge} from './condition';
import {machinePerformance,startDriving,createDrivingState,stepDriving} from './driving';
import {starterEquipment} from '../data/machine';
test('全店の5レーンが高いスタート台から下り、周回境界でも高さと傾きが連続する',()=>{
  for(const id of ['leaf','wind','sun'] as const){
    const track=getCircuitTrack(id);
    for(let lane=0;lane<5;lane++){
      const start=track.sampleLanePath(0,lane),end=track.sampleLanePath(1.6,lane);
      assert.ok(start.y>.3);assert.ok(start.pitch<0);assert.equal(end.y,0);
      for(const distance of [0,track.circuitLength,track.startRamp.riseStart,track.startRamp.descentEnd]){
        const a=track.sampleLanePath(distance-.0001,lane),b=track.sampleLanePath(distance+.0001,lane);
        assert.ok(Math.abs(a.y-b.y)<.001);assert.ok(Math.abs(a.pitch-b.pitch)<.01);
      }
    }
  }
});
test('電池は従来の2倍の持続時間で、表示残量と実走行の電池切れが一致する',()=>{
  assert.equal(batteryCapacity('battery-basic'),720);
  assert.equal(batteryCharge('battery-basic',360),.5);
  const equipment={...starterEquipment,battery:'battery-basic'};
  const performance=machinePerformance(equipment,{motorSeconds:0,batterySeconds:720});
  const stopped=stepDriving(startDriving(createDrivingState()),performance);
  assert.equal(stopped.stopReason,'battery');
});
