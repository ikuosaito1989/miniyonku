import { test } from 'node:test';
import assert from 'node:assert/strict';
import { motorFactor,motorWear,batteryCharge,batteryCapacity,equippedCondition,createStarterUnits } from './condition';
import { createDrivingState,startDriving,stepDriving,machinePerformance } from './driving';
import { createRaceState } from './race';
import { starterEquipment } from '../data/machine';
import { useGame } from './store';

test('適度な慣らしで性能が上がり、使いすぎると摩耗で下がる',()=>{
  assert.ok(motorFactor(60)>motorFactor(0));
  assert.equal(motorFactor(60),motorFactor(180));
  assert.ok(motorFactor(600)<motorFactor(180));
  assert.equal(motorWear(60),0);assert.equal(motorWear(1200),1);
  const fresh=machinePerformance(starterEquipment),tuned={...fresh,motorSeconds:60};
  const driving=startDriving(createDrivingState());
  assert.ok(stepDriving(driving,tuned).speed>stepDriving(driving,fresh).speed);
});
test('電池残量は0〜100%で、空なら走行終了。待機中は消耗しない',()=>{
  assert.equal(batteryCharge('battery-basic',0),1);
  assert.equal(batteryCharge('battery-basic',9999),0);
  const performance=machinePerformance(starterEquipment,{motorSeconds:0,batterySeconds:batteryCapacity('battery-basic')});
  const ready=createDrivingState();assert.equal(stepDriving(ready,performance),ready);
  const stopped=stepDriving(startDriving(ready),performance);
  assert.equal(stopped.status,'out');assert.equal(stopped.stopReason,'battery');
});
test('消耗を含め同じ状態なら再現でき、新品より消耗品は遅い',()=>{
  const drive=(seconds:number)=>{
    let state=startDriving(createDrivingState());const performance=machinePerformance(starterEquipment,{motorSeconds:800,batterySeconds:seconds});
    for(let i=0;i<120;i++)state=stepDriving(state,performance);
    return state;
  };
  assert.deepEqual(drive(200),drive(200));assert.ok(drive(200).distance<drive(0).distance);
});
test('途中報告と慣らしは重複せず、再購入時だけ古いモーターを新品に交換する',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({units:createStarterUnits(),equipment:{...starterEquipment},selectedUnits:{motor:'starter-motor',battery:'starter-battery'},unitSerial:0,money:3000});
    useGame.getState().openSetting();useGame.getState().breakIn();useGame.getState().breakIn();
    let s=useGame.getState();assert.equal(equippedCondition(s.equipment,s.units,s.selectedUnits).motorSeconds,60);
    s.startTrial();let race=createRaceState(starterEquipment);race={...race,phase:'running',racers:race.racers.map(r=>r.id==='player'?{...r,driving:{...r.driving,time:10,status:'running'}}:r)};
    const attempt=useGame.getState().raceAttempt;
    useGame.getState().settleRace(attempt,race);useGame.getState().settleRace(attempt,race);
    s=useGame.getState();assert.equal(equippedCondition(s.equipment,s.units,s.selectedUnits).motorSeconds,70);
    s.close();s=useGame.getState();s.buy('motor-stock');
    s=useGame.getState();assert.equal(s.units['motor-stock'].length,1);assert.equal(s.units['motor-stock'][0].seconds,0);
    assert.equal(equippedCondition(s.equipment,s.units,s.selectedUnits).motorSeconds,0);
    s.selectUnit('motor','starter-motor');s=useGame.getState();assert.equal(equippedCondition(s.equipment,s.units,s.selectedUnits).motorSeconds,0);
    s.openSetting();useGame.setState({units:{...s.units,'battery-basic':[{id:'starter-battery',seconds:360}]}});
    const before=useGame.getState().units['motor-stock'][0].seconds;useGame.getState().breakIn();assert.equal(useGame.getState().units['motor-stock'][0].seconds,before);
  }finally{useGame.setState(original);}
});
