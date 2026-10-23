import { test } from 'node:test';
import assert from 'node:assert/strict';
import { starterEquipment, createStarterInventory } from '../data/machine';
import { parts } from '../data/parts';
import { isStocked } from '../data/progression';
import { batteryCharge, batteryLabel, createStarterUnits } from './condition';
import { createDrivingState, machinePerformance, startDriving, stepDriving } from './driving';
import { purchase } from './purchase';
import { useGame } from './store';
import { createRaceState } from './race';

test('充電電池は無料交換の救済パーツ。どの店でも購入できず、残量は常に100%',()=>{
  assert.equal(createStarterInventory()['battery-recharge'],undefined);
  assert.equal(createStarterUnits()['battery-recharge'],undefined);
  const part=parts.find(p=>p.id==='battery-recharge')!;
  assert.equal(isStocked(part),false);
  assert.equal(purchase({money:10000,inventory:{}},part.id,{name:'上位店',maxPartLevel:10}).success,false);
  for(const seconds of [0,60,360,100000])assert.equal(batteryCharge(part.id,seconds),1);
  assert.match(batteryLabel(part.id,100000),/残量固定/);
});
test('充電電池は基準出力95%。長時間使用後も電池切れせず、新品時と同じ走行を再現する',()=>{
  const equipment={...starterEquipment,battery:'battery-recharge'};
  const basic=machinePerformance(starterEquipment),recharge=machinePerformance(equipment);
  assert.ok(Math.abs(recharge.freeSpeed/basic.freeSpeed-.95)<1e-12);
  assert.ok(Math.abs(recharge.stallForce/basic.stallForce-.95)<1e-12);
  function run(seconds:number){
    let state=startDriving(createDrivingState());const performance=machinePerformance(equipment,{motorSeconds:0,batterySeconds:seconds});
    for(let tick=0;tick<14400&&state.status==='running';tick++)state=stepDriving(state,performance,0,2);
    return state;
  }
  assert.equal(run(100000).status,'finished');assert.deepEqual(run(0),run(100000));
});
test('所持金0・通常電池切れから充電電池に交換し、何度慣らしても残量固定。モーターは消耗する',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),money:0,units:{...createStarterUnits(),'battery-basic':[{id:'starter-battery',seconds:360}]}});
    useGame.getState().openSetting();useGame.getState().exchangeReusable('battery');
    for(let i=0;i<15;i++)useGame.getState().breakIn();
    let state=useGame.getState();
    assert.equal(state.equipment.battery,'battery-recharge');assert.equal(state.units['motor-stock'][0].seconds,450);
    assert.equal(batteryCharge('battery-recharge',state.units['battery-recharge'][0].seconds),1);
    assert.match(state.notice,/残量は減りません/);
    state.startTrial();state=useGame.getState();
    const race=createRaceState(state.equipment);race.phase='running';race.racers[0].driving.time=50;
    state.settleRace(state.raceAttempt,race);state=useGame.getState();
    assert.equal(state.units['motor-stock'][0].seconds,500);
    assert.equal(batteryCharge('battery-recharge',state.units['battery-recharge'][0].seconds),1);
    assert.equal(state.money,0);
  }finally{useGame.setState(original);}
});
