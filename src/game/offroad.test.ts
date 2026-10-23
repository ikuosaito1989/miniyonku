import test from 'node:test';
import assert from 'node:assert/strict';
import {starterEquipment, type Equipment} from '../data/machine';
import {getCircuitTrack} from '../data/circuit';
import {parts} from '../data/parts';
import {isStocked} from '../data/progression';
import {modelShops} from '../data/world';
import {createRaceState,startRace,stepRace,launchPlayer,rankRacers} from './race';
const road:Equipment={...starterEquipment,body:'body-champion',motor:'motor-wind',gear:'gear-4',tire:'tire-1',chassis:'chassis-low',terminal:'terminal-1',battery:'battery-endurance'};
const dirt:Equipment={...road,motor:'motor-trail',tire:'tire-trail',chassis:'chassis-trail',accessory:'accessory-damper',rollerFront:'roller-double',rollerSide:'roller-double',rollerRear:'roller-double'};
function run(equipment:Equipment,seed:number){
  let race=startRace(createRaceState(equipment,seed,{motorSeconds:60,batterySeconds:0},false,'sun'));
  while(race.phase==='countdown')race=stepRace(race);race=launchPlayer(race);
  for(let i=0;i<120*200&&race.phase!=='finished';i++)race=stepRace(race);
  assert.equal(race.phase,'finished');return race;
}
test('ひなたは長い複合ダートで、路面区間ごとに接地条件が変わる',()=>{
 const track=getCircuitTrack('sun');assert.ok(track.circuitLength>55);assert.ok(track.circuitLength>getCircuitTrack('wind').circuitLength*1.4);
 assert.equal(new Set([.1,.3,.5,.8].map(t=>track.surfaceAt(t*track.circuitLength).name)).size,4);
 for(const id of Object.values(dirt).filter(id=>!Object.values(road).includes(id))){const part=parts.find(p=>p.id===id)!;assert.ok(isStocked(part,modelShops.hinata));assert.ok(!isStocked(part,modelShops.aozora));}
});
test('舗装装備は優勝できず、悪路装備は複数シードで優勝。タイヤ・制振・トルクの欠落が敗因になる',()=>{
 for(const seed of [1,7,42,123,999]){
  const winner=run(dirt,seed);assert.equal(rankRacers(winner)[0].id,'player');assert.equal(winner.racers[0].driving.status,'finished');
  for(const equipment of [road,{...dirt,accessory:'accessory-none'},{...dirt,tire:'tire-1'},{...dirt,motor:'motor-wind'}])assert.notEqual(rankRacers(run(equipment,seed))[0].id,'player');
 }
});
