import test from 'node:test';import assert from 'node:assert/strict';
import {starterEquipment,createStarterInventory} from '../data/machine';import {equipPart} from './equipment';import {machinePerformance} from './driving';import {useGame} from './store';import {snapshotGame,decodeSave} from './saveData';import {buildMachineModel} from './MachineModel';
const inventory={...createStarterInventory(),'accessory-weight':1,'accessory-support':1,'accessory-damper':1};
const equipment={...starterEquipment,accessory:'accessory-weight',accessory2:'accessory-support',accessory3:'accessory-damper'};
test('その他3枠に別パーツを同時装着し、所有数を超える重複装備を拒否。空枠に戻しても他枠は保持',()=>{
 let e=starterEquipment;for(const [slot,id] of [['accessory','accessory-weight'],['accessory2','accessory-support'],['accessory3','accessory-damper']] as const)e=equipPart(e,inventory,id,slot);
 assert.deepEqual(e,equipment);assert.equal(equipPart(e,inventory,'accessory-weight','accessory2'),e);
 const duplicate=equipPart(e,{...inventory,'accessory-weight':2},'accessory-weight','accessory2');assert.equal(duplicate.accessory2,'accessory-weight');
 const cleared=equipPart(e,inventory,'accessory-none','accessory2');assert.equal(cleared.accessory2,'accessory-none');assert.equal(cleared.accessory,'accessory-weight');assert.equal(cleared.accessory3,'accessory-damper');
});
test('合計重量・安定・駆動補助・制振を走行性能へ反映し、複数の補助パーツを描画',()=>{
 const base=machinePerformance(starterEquipment),all=machinePerformance(equipment);
 assert.ok(Math.abs(all.mass-base.mass-.017)<1e-9);assert.ok(Math.abs(all.stallForce/base.stallForce-1.04)<1e-9);assert.ok(Math.abs(all.lateralLimit/base.lateralLimit-1.1*1.12)<1e-9);assert.equal(all.damping,.65);
 const model=buildMachineModel(0xff0000,equipment),names=model.children.map(c=>c.name);assert.ok(names.includes('ballast-plate'));assert.ok(names.includes('underbody-support'));assert.ok(names.includes('damper-mass'));
 model.traverse((o)=>{if('geometry' in o)(o.geometry as {dispose:()=>void}).dispose();});
});
test('複数枠をセーブ復元し、旧1枠セーブは装着済みパーツと所持数を保持して移行',()=>{
 const game=snapshotGame({...useGame.getInitialState(),equipment,inventory});const data={version:1,savedAt:123,game};assert.deepEqual(decodeSave(data).game.equipment,equipment);
 const legacy={...equipment} as Record<string,string>;delete legacy.accessory2;delete legacy.accessory3;const restored=decodeSave({...data,game:{...game,equipment:legacy}}).game;
 assert.equal(restored.equipment.accessory,'accessory-weight');assert.equal(restored.equipment.accessory2,'accessory-none');assert.equal(restored.equipment.accessory3,'accessory-none');assert.deepEqual(restored.inventory,inventory);
 assert.throws(()=>decodeSave({...data,game:{...game,equipment:{...equipment,accessory2:'accessory-weight'}}}),/未所持/);
});
