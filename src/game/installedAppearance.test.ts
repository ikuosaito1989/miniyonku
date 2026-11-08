import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildMachineModel,buildRaceMachineModel} from './MachineModel';
import {starterEquipment,type Equipment} from '../data/machine';
import {parts} from '../data/parts';
import {partAppearances} from '../data/partAppearance';
function dispose(car:THREE.Group){const materials=new Set<THREE.Material>();car.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});materials.forEach(m=>m.dispose());}
function count(car:THREE.Group,name:string){let n=0;car.traverse(o=>{if(o.name===name)n++;});return n;}
const color=(car:THREE.Group,name:string)=>((car.getObjectByName(name) as THREE.Mesh).material as THREE.MeshStandardMaterial).color.getHexString();
test('専用ボディでも全ホイールの色とスポーク数が装備どおりになり、レースと設定で一致する',()=>{
 for(const body of ['body-champion','body-legend-flow','body-legend-wedge','body-legend-towa','body-legend-muscle','body-sovereign'])for(const wheel of parts.filter(p=>p.category==='wheel')){
  const e={...starterEquipment,body,wheel:wheel.id};const preview=buildMachineModel(0xff0000,e),race=buildRaceMachineModel({id:'player',color:0xff0000,equipment:e});
  for(const car of [preview,race]){assert.equal(color(car,`wheel-rim-${wheel.id}`),partAppearances[wheel.id].color.slice(1));assert.equal(count(car,`wheel-spoke-${wheel.id}`),partAppearances[wheel.id].detail*4,`${body}:${wheel.id}`);}dispose(preview);dispose(race);
 }
});
test('専用ボディにシャーシ・タイヤを替えても固定の車体色で上書きしない。径とトレッドも実パーツを反映',()=>{
 for(const body of ['body-champion','body-legend-wedge','body-legend-muscle','body-legend-towa'])for(const tire of parts.filter(p=>p.category==='tire')){
  const e={...starterEquipment,body,chassis:'chassis-sovereign',tire:tire.id};const car=buildMachineModel(0xff0000,e);
  assert.equal(color(car,'chassis'),partAppearances[e.chassis].color.slice(1));assert.equal(color(car,`tire-${tire.id}`),partAppearances[tire.id].color.slice(1));
  const mesh=car.getObjectByName(`tire-${tire.id}`) as THREE.Mesh<THREE.CylinderGeometry>;assert.equal(mesh.geometry.parameters.radiusTop,tire.specs.diameter/26*.033);
  if(/trail|sand|dune/.test(tire.id))assert.equal(count(car,'offroad-tread'),16*4);dispose(car);
 }
});
test('全ての補助パーツを3枠それぞれで可視化し、星皇ダンパー・ジャイロ・駆動サポートも描く',()=>{
 for(const p of parts.filter(p=>p.category==='accessory'&&p.id!=='accessory-none'))for(const slot of ['accessory','accessory2','accessory3'] as const){
  const e:Equipment={...starterEquipment,body:'body-champion',[slot]:p.id},car=buildMachineModel(0xff0000,e);assert.ok(car.children.some(o=>o.userData.partId===p.id&&o.userData.equipmentSlot===slot),`${slot}:${p.id}`);
  if(/damper/.test(p.id)||p.id==='accessory-active')assert.equal(count(car,'damper-mass'),2);
  if(/gyro/.test(p.id))assert.equal(count(car,'gyro-stabilizer-ring'),2);dispose(car);
 }
});
