import {getCircuitTrack} from '../data/circuit';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { starterEquipment } from '../data/machine';
import { circuit, circuitLength } from '../data/circuit';
import { createRaceState, officialTime, rankRacers } from './race';
import { createFinishPresentation, finishCoastDistance, finishTrackDistance, finishSequence, shouldUseFinishCamera, stepFinishPresentation } from './finishPresentation';

test('最終周の終盤だけゴール用画角へ移る',()=>{
  const race=createRaceState(starterEquipment);race.phase='running';
  race.racers[0].driving={...race.racers[0].driving,status:'running',distance:circuitLength};
  assert.equal(stepFinishPresentation(createFinishPresentation(),race,0.1).stage,'racing');
  race.racers[0].driving.distance=circuitLength*circuit.laps-1;
  assert.equal(stepFinishPresentation(createFinishPresentation(),race,0.1).stage,'approach');
});
test('通過時刻と公式順位を分離し、通過イベントを一度だけ記録する',()=>{
  const race=createRaceState(starterEquipment);race.phase='running';race.playerStartOffset=-1;race.falseStartPenalty=1;
  race.racers[0].driving={...race.racers[0].driving,status:'finished',time:50,speed:2,distance:circuitLength*circuit.laps};
  race.racers[1].driving={...race.racers[1].driving,status:'finished',time:50.5,speed:2,distance:circuitLength*circuit.laps};
  let presentation=stepFinishPresentation(createFinishPresentation(),race,0);
  assert.equal(presentation.stage,'finish');assert.equal(presentation.arrivals[0].id,'player');
  assert.equal(rankRacers(race)[0].id,'nagi');
  presentation=stepFinishPresentation(presentation,race,1);
  assert.equal(presentation.arrivals.length,2);assert.equal(presentation.arrivals[0].age,1);
  const before=structuredClone(race);
  assert.ok(finishCoastDistance(race.racers[0],presentation)>0);
  const coast=finishCoastDistance(race.racers[0],presentation);
  const later=stepFinishPresentation(presentation,race,5);
  assert.ok(finishCoastDistance(race.racers[0],later)>coast+1,'ゴール後も走行を続ける');
  assert.deepEqual(race,before);assert.equal(officialTime(race,race.racers[0]),51);
});
test('全車の確定前に結果へ進まず、通過演出→集計→結果の順で表示する',()=>{
  const race=createRaceState(starterEquipment);race.phase='running';
  assert.equal(stepFinishPresentation(createFinishPresentation(),race,100).stage,'racing');
  race.phase='finished';
  race.racers=race.racers.map(r=>({...r,driving:{...r.driving,status:'out'}}));
  let presentation=stepFinishPresentation(createFinishPresentation(),race,0);
  assert.equal(presentation.stage,'finish');
  assert.equal(presentation.arrivals.length,0);
  presentation=stepFinishPresentation(presentation,race,finishSequence.holdSeconds);
  assert.equal(presentation.stage,'tally');
  presentation=stepFinishPresentation(presentation,race,finishSequence.tallySeconds);
  assert.equal(presentation.stage,'results');
  assert.deepEqual(createFinishPresentation(),{stage:'racing',arrivals:[],finalAge:0});
});
test('発進待ちや大きく遅れたプレイヤーをゴール画角のまま置き去りにしない',()=>{
  const race=createRaceState(starterEquipment);race.phase='running';
  race.racers[1].driving={...race.racers[1].driving,status:'finished',time:50,speed:2,distance:circuitLength*circuit.laps};
  let presentation=stepFinishPresentation(createFinishPresentation(),race,0);
  assert.equal(shouldUseFinishCamera(race,presentation),false);
  race.playerStartOffset=45;
  race.racers[0].driving={...race.racers[0].driving,status:'running',distance:5};
  assert.equal(shouldUseFinishCamera(race,presentation),true);
  presentation=stepFinishPresentation(presentation,race,3);
  assert.equal(shouldUseFinishCamera(race,presentation),false);
  race.racers[0].driving.distance=circuitLength*circuit.laps-1;
  assert.equal(shouldUseFinishCamera(race,presentation),true);
});

test('一本道のゴール後も出口方向へ走り去り、記録を変えず30cm以上進み続ける',()=>{
 const race=createRaceState(starterEquipment,42,undefined,false,'forge'),track=getCircuitTrack('forge'),racer=race.racers[0];
 racer.driving={...racer.driving,status:'finished',distance:track.circuitLength,time:150,speed:8};
 let presentation=stepFinishPresentation(createFinishPresentation(),race,0);
 presentation=stepFinishPresentation(presentation,race,1);const a=track.sampleLanePath(finishTrackDistance(racer,presentation),racer.lane);
 presentation=stepFinishPresentation(presentation,race,2);const b=track.sampleLanePath(finishTrackDistance(racer,presentation),racer.lane);
 assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>10);assert.equal(racer.driving.distance,track.circuitLength);assert.equal(racer.driving.time,150);
});
