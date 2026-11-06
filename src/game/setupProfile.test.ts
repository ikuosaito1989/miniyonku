import {test} from 'node:test';
import assert from 'node:assert/strict';
import {starterEquipment} from '../data/machine';
import {parts} from '../data/parts';
import {machinePerformance} from './driving';
import {setupCourse,setupCourses,setupProfile} from './setupProfile';
const read=(equipment=starterEquipment,course:'sun'|'sprint'='sprint')=>Object.fromEntries(setupProfile(machinePerformance(equipment),course).map(m=>[m.id,m.value]));
test('course-specific road estimates and fixed scales stay finite for every course',()=>{
 for(const course of setupCourses)for(const m of setupProfile(machinePerformance(starterEquipment),course)){
  assert.ok(Number.isFinite(m.value));assert.ok(m.score>=0&&m.score<=100);assert.ok(!/NaN|undefined/.test(m.display));
 }
 const paved=read(),dirt=read(starterEquipment,'sun');
 assert.ok(dirt.speed>0);assert.ok(dirt.acceleration>0);assert.ok(dirt.contact<paved.contact);assert.ok(dirt.speed<paved.speed);assert.ok(dirt.acceleration<paved.acceleration);
});
test('gearing trades flat speed for launch force, rather than increasing every bar',()=>{
 const high=read({...starterEquipment,gear:'gear-4'}),low=read({...starterEquipment,gear:'gear-5'});
 assert.ok(high.speed>low.speed);assert.ok(high.acceleration<low.acceleration);
});
test('condition and non-consuming batteries affect the whole machine',()=>{
 const empty=setupProfile(machinePerformance(starterEquipment,{motorSeconds:60,batterySeconds:100000}),'sprint');
 assert.equal(empty.find(m=>m.id==='speed')!.value,0);assert.equal(empty.find(m=>m.id==='acceleration')!.value,0);
 const reusable=setupProfile(machinePerformance({...starterEquipment,battery:'battery-recharge'}),'sun');
 assert.equal(reusable.find(m=>m.id==='duration')!.value,Infinity);
 assert.equal(reusable.find(m=>m.id==='duration')!.display,'無制限');
});
test('every selectable part produces a valid whole-machine profile',()=>{
 for(const part of parts){
  const slot=part.category==='roller'?'rollerFront':part.category==='accessory'?'accessory':part.category;
  const p=machinePerformance({...starterEquipment,[slot]:part.id});
  for(const m of setupProfile(p,'zenith'))assert.ok((Number.isFinite(m.value)||m.value===Infinity)&&Number.isFinite(m.score),part.id+':'+m.id);
 }
});
test('initial selection follows the shop or next official heat',()=>{
 assert.equal(setupCourse('hinata'),'sun');assert.equal(setupCourse('stadium-5',true),'sun');assert.equal(setupCourse('stadium-5'),'sprint');assert.equal(setupCourse('stadium-7'),'zenith');
});
