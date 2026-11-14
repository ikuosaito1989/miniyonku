import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {useGame} from './store';
import {snapshotGame,decodeSave} from './saveData';
import {createRaceState} from './race';
import {starterEquipment} from '../data/machine';
import {buildMachineModel,buildRaceMachineModel} from './MachineModel';
import {bodyDesign,bodies} from '../data/bodies';
const colors=(model:THREE.Group)=>{const result=new Set<number>();model.traverse(o=>{if(o instanceof THREE.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if('color' in m)result.add((m as THREE.MeshStandardMaterial).color.getHex());});return result;};
test('塗色は無料で即時変更・保存でき、旧セーブは元の色として読む',()=>{
 const before=useGame.getState();try{
 useGame.setState(useGame.getInitialState(),true);const original=snapshotGame(useGame.getState());useGame.getState().setBodyPaint(0x17ac63);
 const game=snapshotGame(useGame.getState());assert.equal(game.bodyPaint,0x17ac63);assert.equal(game.money,original.money);assert.deepEqual(game.equipment,original.equipment);assert.equal(decodeSave({version:1,savedAt:123,game}).game.bodyPaint,0x17ac63);
 const old={...game} as Partial<typeof game>;delete old.bodyPaint;assert.equal(decodeSave({version:1,savedAt:123,game:old}).game.bodyPaint,null);
 assert.throws(()=>decodeSave({version:1,savedAt:123,game:{...game,bodyPaint:-1}}));
 useGame.getState().setBodyPaint(null);assert.equal(useGame.getState().bodyPaint,null);
 }finally{useGame.setState(before,true);}
});
test('塗装をレースとプレビューに適用し、対戦相手と性能・模様の色を保つ',()=>{
 const race=createRaceState(starterEquipment,42),painted=createRaceState(starterEquipment,42,undefined,false,'leaf',0x17ac63);
 assert.equal(painted.racers[0].color,0x17ac63);assert.deepEqual(painted.racers[0].performance,race.racers[0].performance);assert.deepEqual(painted.racers.slice(1),race.racers.slice(1));assert.ok(colors(buildRaceMachineModel(painted.racers[0])).has(0x17ac63));
 const e={...starterEquipment,body:'body-champion'};const original=colors(buildMachineModel(0xffffff,e)),custom=colors(buildMachineModel(0xffffff,e,'stock',0x17ac63));
 assert.ok(original.has(0xf2f3eb));assert.ok(!custom.has(0xf2f3eb));assert.ok(custom.has(0x17ac63));assert.ok(custom.has(0x155fc1));assert.ok(custom.has(0xf2c83b));
});
test('未塗装の主人公車はボディごとにプレビューとレースで同じ色を使う',()=>{
 for(const body of bodies){
  const equipment={...starterEquipment,body:body.id},color=Number.parseInt(bodyDesign(body.id).color.slice(1),16);
  const racer=createRaceState(equipment).racers.find(r=>r.id==='player')!;
  assert.equal(racer.color,color,body.id);
  assert.deepEqual(colors(buildRaceMachineModel(racer)),colors(buildMachineModel(color,equipment)),body.id);
 }
});
