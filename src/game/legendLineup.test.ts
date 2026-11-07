import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildMachineModel} from './MachineModel';
import {legends} from '../data/legends';
import {zenithRivals} from '../data/zenithRace';
import {senior} from '../data/officialRace';
import {decodeCup,emptyCup,forfeitCupHeat,enterCupHeat} from './cup';

test('黒岩の先輩は斗和。専用ボディは展示と最終戦で一致する',()=>{
 assert.equal(senior.name,'橘 斗和');assert.equal(senior.equipment.body,legends[2].equipment.body);
 assert.deepEqual(zenithRivals.map(r=>r.name),legends.map(l=>l.name));
 for(const [i,racer] of zenithRivals.entries())assert.equal(racer.equipment.body,legends[i].equipment.body);
 for(const legend of legends.slice(2)){
  const model=buildMachineModel(0xffffff,legend.equipment),bounds=new THREE.Box3().setFromObject(model);
  assert.ok(Number.isFinite(bounds.min.x)&&Number.isFinite(bounds.max.y));
  const size=bounds.getSize(new THREE.Vector3());assert.ok(size.x<.5&&size.y<.3&&size.z<.5);
  const paint=model.getObjectByName(legend.id==='legend-towa'?'towa-silver-fencer':'koya-armored-twinr');assert.ok(paint);
 }
});
test('旧最終大会の記録をレジェンド4人へ移行し、順位・タイム・完走を保持する',()=>{
 const entries=[['player','朝倉 湊'],['legend-rei','風見 怜'],['legend-gaku','火野 岳'],['go','黒岩 豪'],['jin','黒瀬 迅']].map(([id,name],i)=>({id,name,place:i+1,time:90+i,finished:true}));
 const old={entered:true,pending:null,results:[{circuitId:'zenith',entries}]};
 const decoded=decodeCup(old,'zenith',emptyCup());
 assert.deepEqual(decoded.results[0].entries.map(e=>e.id),['player','legend-rei','legend-gaku','legend-towa','legend-koya']);
 assert.deepEqual(decoded.results[0].entries.map(e=>[e.place,e.time,e.finished]),entries.map(e=>[e.place,e.time,e.finished]));
 assert.equal(decoded.results[0].entries[3].name,'橘 斗和');assert.equal(decoded.results[0].entries[4].name,'山城 昊也');
 assert.deepEqual(decodeCup(decoded,'zenith',emptyCup()),decoded);
 const forfeit=forfeitCupHeat(enterCupHeat(emptyCup(),'zenith','zenith'));
 assert.deepEqual(new Set(forfeit.results[0].entries.map(e=>e.id)),new Set(['player',...legends.map(l=>l.id)]));
});
