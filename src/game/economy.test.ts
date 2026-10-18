import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_MONEY } from '../data/economy';
import { equipmentSlots, starterEquipment, type Equipment, type EquipmentSlot } from '../data/machine';
import { parts } from '../data/parts';
import { isStocked } from '../data/progression';
import { rivals } from '../data/rivals';
import { useGame } from './store';
import { createDrivingState, machinePerformance, startDriving, stepDriving } from './driving';

function finish(equipment:Equipment,lane:number,motorSeconds=0,variation=1,batterySeconds=0){
  const p=machinePerformance(equipment,{motorSeconds,batterySeconds});
  p.freeSpeed*=variation;p.stallForce*=variation;
  let state=startDriving(createDrivingState());
  for(let i=0;i<14400&&state.status==='running';i++)state=stepDriving(state,p,0,lane);
  return state.status==='finished'?state.time:Infinity;
}
test('初期1000円で購入可能な全装備は、慣らし済み・新品電池でも最も遅い個体の凪に届かない',()=>{
  assert.equal(INITIAL_MONEY,1000);
  assert.equal(useGame.getInitialState().money,INITIAL_MONEY);
  const leader=rivals.find(r=>r.id==='nagi')!;
  const benchmark=finish(leader.equipment,leader.lane,leader.motorSeconds,.97);
  assert.ok(Number.isFinite(benchmark));
  const slots=Object.keys(equipmentSlots) as EquipmentSlot[];
  let checked=0,best=Infinity;
  function visit(index:number,equipment:Equipment,cost:number){
    if(index===slots.length){checked++;best=Math.min(best,finish(equipment,2,60));return;}
    const slot=slots[index];
    for(const part of parts.filter(p=>p.category===equipmentSlots[slot].category&&(p.id===starterEquipment[slot]||p.id==='battery-recharge'||isStocked(p)))){
      const price=part.id===starterEquipment[slot]||part.id==='battery-recharge'?0:part.price;
      if(cost+price<=INITIAL_MONEY)visit(index+1,{...equipment,[slot]:part.id},cost+price);
    }
  }
  visit(0,{...starterEquipment},0);
  assert.ok(checked>20);
  assert.ok(best>benchmark,`${checked}通り: 最速${best.toFixed(2)}秒、凪${benchmark.toFixed(2)}秒`);
  console.info(`入門バランス: ${checked}通り / 1000円最速 ${best.toFixed(2)}秒 / 凪(最低個体差) ${benchmark.toFixed(2)}秒`);
  // 買い足して軽量化すれば、最も速い凪にも勝てる。
  const fastestRival=finish(leader.equipment,leader.lane,leader.motorSeconds,1.03);
  assert.ok(Number.isFinite(fastestRival));
  assert.ok(finish({...leader.equipment,chassis:'chassis-light',body:'body-entry'},2,60)<fastestRival);
});

test('新品初期装備は全開始レーンで最下位。慣らしと買い足しで下位CPUを越えられる',()=>{
  const playerTimes=Array.from({length:5},(_,lane)=>finish(starterEquipment,lane));
  const bestFresh=Math.min(...playerTimes);
  const weakestTimes:number[]=[];
  for(const rival of rivals)for(let lane=0;lane<5;lane++){
    const time=finish(rival.equipment,lane,rival.motorSeconds,.97);
    assert.ok(time<bestFresh,`${rival.id} ${lane+1}コース: ${time} / 初期 ${bestFresh}`);
    weakestTimes.push(time);
    assert.ok(Number.isFinite(finish(rival.equipment,lane,rival.motorSeconds,1.03)));
  }
  const tuned=finish(starterEquipment,2,60,1,60);
  assert.ok(tuned<bestFresh-1);
  const improved=finish({...starterEquipment,gear:'gear-4'},2,60,1,60);
  assert.ok(improved<Math.max(...weakestTimes));
});
