import test from 'node:test';import assert from 'node:assert/strict';
import {starterEquipment,type Equipment} from '../data/machine';import {getCircuitTrack,type CircuitId} from '../data/circuit';import {createRaceState,startRace,stepRace,launchPlayer,rankRacers} from './race';import {parts} from '../data/parts';
const corner:Equipment={...starterEquipment,body:'body-champion',motor:'motor-torque',gear:'gear-4',tire:'tire-1',chassis:'chassis-low',accessory:'accessory-weight',accessory2:'accessory-support',rollerFront:'roller-1',rollerRear:'roller-1',wheel:'wheel-light',terminal:'terminal-1',battery:'battery-endurance'};
const speed:Equipment={...corner,motor:'motor-wind',gear:'gear-3.5',chassis:'chassis-light',tire:'tire-2',accessory:'accessory-support',accessory2:'accessory-none',rollerFront:'roller-0',rollerRear:'roller-0'};
function run(id:CircuitId,equipment:Equipment,seed:number){let r=startRace(createRaceState(equipment,seed,{motorSeconds:60,batterySeconds:0},id==='comet'?'official':false,id));while(r.phase==='countdown')r=stepRace(r);r=launchPlayer(r);for(let i=0;i<120*240&&r.phase!=='finished';i++)r=stepRace(r);assert.equal(r.phase,'finished');return r;}
test('若葉は旧装備では優勝できず、第3公式は従来の約2分の旋回勝負を保つ',()=>{
 for(const id of ['grove','comet'] as const){const t=getCircuitTrack(id),v=Array.from({length:1200},(_,i)=>t.sampleCircuit(i*t.circuitLength/1200).curvature);assert.ok(t.circuitLength*5>300);assert.ok(v.filter((n,i)=>n>.15&&n>v[(i+1199)%1200]&&n>v[(i+1)%1200]).length>=12);assert.ok(Math.max(...v)<1/(t.circuit.laneWidth*t.circuit.lanes/2));
 for(const seed of [1,7,42,123,999,2026]){const win=run(id,corner,seed);if(id==='grove'){assert.notEqual(rankRacers(win)[0].id,'player');assert.ok(win.racers.slice(1).every(r=>r.driving.status==='finished'&&r.driving.landings===5));}else{assert.equal(rankRacers(win)[0].id,'player');assert.equal(win.racers[0].driving.status,'finished');}if(id==='comet')assert.ok(win.racers[0].driving.time>=110&&win.racers[0].driving.time<=135);const fast=run(id,speed,seed);assert.notEqual(rankRacers(fast)[0].id,'player');assert.equal(fast.racers[0].driving.status,'out');}}
 for(const id of Object.values(corner)){const p=parts.find(p=>p.id===id)!;assert.ok(id==='body-champion'||p.level<=4);}
});

test('旧中級モーターと二重ウェイトの構成でも若葉の上位装備CPUには競り負ける',()=>{
 const tuned={...corner,motor:'motor-wind',wheel:'wheel-aero',accessory2:'accessory-weight'};
 for(const seed of [1,42,999]){const race=run('grove',tuned,seed);assert.notEqual(rankRacers(race)[0].id,'player');assert.ok(race.racers.slice(1).every(r=>r.driving.status==='finished'&&r.performance.motorSeconds===60));}
});
