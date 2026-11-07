import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {starterEquipment} from '../data/machine';
import {buildMachineModel} from './MachineModel';
import {machinePerformance} from './driving';
import {animateRunningGear,handlingPose,handlingProfile,visibleSpin} from './raceMotion';

test('走行で4輪のタイヤ・スポークが回り、車軸とローラー固定軸は回らない。接触側だけローラーが回る',()=>{
 const car=buildMachineModel(0xffffff,{...starterEquipment,rollerRear:'roller-double',accessory:'accessory-slide-rear'});
 try{
  const wheels=car.userData.rotatingWheels as THREE.Group[],rollers=car.userData.rotatingRollers as THREE.Group[];
  assert.equal(wheels.length,4);assert.equal(rollers.length,6);
  const axle=car.getObjectByName('drive-shaft')!,rotation=axle.quaternion.clone();
  animateRunningGear(car,0,1/60,-1,.2,true);animateRunningGear(car,.02,1/60,-1,.2,true);
  assert.ok(wheels.every(w=>w.rotation.x>0&&w.getObjectByName('tire-rotation-mark')));
  assert.ok(rollers.filter(r=>r.userData.side===-1).every(r=>r.rotation.y<0));
  assert.ok(rollers.filter(r=>r.userData.side===1).every(r=>r.rotation.y===0));
  assert.ok(axle.quaternion.equals(rotation));
  const rear=rollers.find(r=>r.userData.slot==='rollerRear')!;
  assert.equal(rear.parent?.name,'rear-slide-carriage');
  assert.equal(car.getObjectByName('roller-axle-rollerRear')!.parent,rear.parent);
  // 停止後はローラーが惰性で減速。空中の反対側ローラーは新たに回らない。
  for(let i=0;i<120;i++)animateRunningGear(car,.02,1/60,1,.2,false);
  assert.ok(rear.userData.spinSpeed<.0001);
  assert.ok(rollers.filter(r=>r.userData.side===1).every(r=>r.rotation.y===0));
 }finally{car.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});}
});
test('制振装備は同じコーナーで揺れが減り、直線・停止中はがたつかずレーン内に収まる',()=>{
 const basic=handlingProfile(starterEquipment,machinePerformance(starterEquipment));
 const equipment={...starterEquipment,rollerFront:'roller-lowdouble',rollerSide:'roller-lowdouble',rollerRear:'roller-lowdouble',accessory:'accessory-damper'};
 const smooth=handlingProfile(equipment,machinePerformance(equipment));
 let basicEnergy=0,smoothEnergy=0;
 for(let frame=0;frame<180;frame++){
  const a=handlingPose(basic,4,.4,.8,frame/60,frame/15,1),b=handlingPose(smooth,4,.4,.8,frame/60,frame/15,1);
  basicEnergy+=a.yaw*a.yaw+a.heave*a.heave;smoothEnergy+=b.yaw*b.yaw+b.heave*b.heave;
  assert.ok(Math.abs(a.lateral)<=.006&&Math.abs(a.roll)<.2);
 }
 assert.ok(smoothEnergy<basicEnergy*.6);
 assert.ok(Object.values(handlingPose(basic,0,.4,.8,1,1,1)).every(value=>value===0));
 assert.ok(handlingPose(basic,4,0,0,1,1,1).yaw===0);
});
test('表示回転は低速の移動量に一致し、高速ではフレームレートに依存せず見える速度に制限',()=>{
 assert.equal(visibleSpin(.001,.033,1/60),.001/.033);
 assert.ok(Math.abs(visibleSpin(.1,.033,1/30)-2*visibleSpin(.05,.033,1/60))<1e-10);
 assert.equal(visibleSpin(0,.033,1/60),0);
});
