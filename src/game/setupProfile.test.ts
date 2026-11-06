import {test} from 'node:test';
import assert from 'node:assert/strict';
import {starterEquipment} from '../data/machine';
import {parts} from '../data/parts';
import {machinePerformance} from './driving';
import {setupProfile} from './setupProfile';
const read=(equipment=starterEquipment)=>Object.fromEntries(setupProfile(machinePerformance(equipment)).map(m=>[m.id,m]));
test('gearing trades intrinsic top speed for launch force',()=>{
 const high=read({...starterEquipment,gear:'gear-4'}),low=read({...starterEquipment,gear:'gear-5'});
 assert.ok(high.speed.value>low.speed.value);assert.ok(high.acceleration.value<low.acceleration.value);
});
test('equipment profile stays identical as consumable condition changes',()=>{
 const fresh=setupProfile(machinePerformance(starterEquipment,{motorSeconds:0,batterySeconds:0}));
 const worn=setupProfile(machinePerformance(starterEquipment,{motorSeconds:1200,batterySeconds:100000}));
 assert.deepEqual(worn,fresh);
});
test('infinite endurance is distinct from even the longest finite battery',()=>{
 const reusable=read({...starterEquipment,battery:'battery-recharge'}).duration;
 assert.equal(reusable.value,Infinity);assert.equal(reusable.display,'無制限');
 for(const battery of parts.filter(p=>p.category==='battery'&&p.specs.consumption!==0))assert.ok(read({...starterEquipment,battery:battery.id}).duration.score<reusable.score);
});
test('every part produces eight valid intrinsic metrics without a course argument',()=>{
 for(const part of parts){
  const slot=part.category==='roller'?'rollerFront':part.category==='accessory'?'accessory':part.category;
  const metrics=setupProfile(machinePerformance({...starterEquipment,[slot]:part.id}));
  assert.equal(metrics.length,8);
  for(const m of metrics){assert.ok((Number.isFinite(m.value)||m.value===Infinity)&&Number.isFinite(m.score),part.id+':'+m.id);assert.ok(m.score>=0&&m.score<=100);assert.ok(!/NaN|undefined/.test(m.display));}
 }
});
