import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bodies } from '../data/bodies';
import { parts } from '../data/parts';
import { starterEquipment } from '../data/machine';
import { dirtSurface, pavedSurface } from '../data/surfaces';
import { createDrivingState, machinePerformance, startDriving, stepDriving, surfacePerformance } from './driving';

test('軽→コンパクト→1.5Lの入手段階、全ボディの図柄と性能データが一致する',()=>{
  assert.equal(bodies[0].className,'入門用軽ワゴン');assert.equal(bodies[1].className,'コンパクト');
  assert.equal(bodies.find(b=>b.id==='body-sedan')?.grade,3);
  for(const b of bodies){
    const p=parts.find(p=>p.id===b.id)!;
    assert.equal(p.level,b.grade);assert.equal(p.specs.weight,b.weight);
    assert.equal(p.specs.stability,b.cornering);assert.equal(p.specs.roughGrip,b.roughGrip);
  }
});
test('SUVは舗装でスポーツより不利だが、悪路の接地と抵抗で有利。タイヤとの組合せも反映する',()=>{
  const sport=machinePerformance({...starterEquipment,body:'body-arrow'});
  const suv=machinePerformance({...starterEquipment,body:'body-manta'});
  assert.ok(sport.drag<suv.drag);assert.ok(sport.mass<suv.mass);assert.ok(sport.lateralLimit>suv.lateralLimit);
  const roadSport=surfacePerformance(sport,dirtSurface),roadSuv=surfacePerformance(suv,dirtSurface);
  assert.ok(roadSuv.traction>roadSport.traction);assert.ok(roadSuv.resistance<roadSport.resistance);
  assert.ok(roadSuv.lateralLimit>roadSport.lateralLimit);
  const soft=surfacePerformance(machinePerformance({...starterEquipment,tire:'tire-1'}),dirtSurface);
  const hard=surfacePerformance(machinePerformance({...starterEquipment,tire:'tire-2'}),dirtSurface);
  assert.ok(soft.traction>hard.traction);assert.ok(soft.resistance<hard.resistance);
  assert.equal(surfacePerformance(suv,pavedSurface).resistance,0);
  assert.equal(surfacePerformance(suv,pavedSurface).lateralLimit,suv.lateralLimit);
});
test('路面は表示用の適性だけでなく固定刻みの速度・安定性に作用し再現できる',()=>{
  function run(body:string,rough:boolean){
    const p=machinePerformance({...starterEquipment,body,motor:rough?'motor-trail':'motor-torque',tire:rough?'tire-trail':'tire-1'});
    let state=startDriving(createDrivingState());
    for(let tick=0;tick<120*360&&state.status==='running';tick++)state=stepDriving(state,p,0,2,rough?dirtSurface:pavedSurface);
    return state;
  }
  const suv=run('body-manta',true),sport=run('body-arrow',true);
  assert.deepEqual(suv,run('body-manta',true));assert.equal(suv.status,'finished');
  assert.ok(sport.status==='out'||suv.time<sport.time);
  assert.ok(run('body-arrow',false).time<run('body-manta',false).time);
});
