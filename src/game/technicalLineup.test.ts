import {test} from 'node:test';
import assert from 'node:assert/strict';
import {grandprixRivals,officialRivals,officialSpeedRivals,technicalRivals,wakabaRivals} from '../data/officialRace';
import {starterEquipment} from '../data/machine';
import {createRaceState} from './race';
import {emptyCup,enterCupHeat,forfeitCupHeat,decodeCup} from './cup';
import {aozoraRivals,hinataRivals,rivals} from '../data/rivals';
import {practiceRivals} from '../data/practiceRivals';
import {zenithRivals} from '../data/zenithRace';
import {masterCourseIds} from '../data/masterCourses';
test('第3公式は昊也の専用車を含む5台。一般レーサーはセイランを使わず、わかばの出場者は維持',()=>{
 const race=createRaceState(starterEquipment,123,undefined,'official','comet');
 assert.equal(race.racers.length,5);assert.deepEqual(technicalRivals.map(r=>r.id),['riku','go','sou','legend-koya']);
 const koya=race.racers.find(r=>r.id==='legend-koya')!;assert.equal(koya.name,'山城 昊也');assert.equal(koya.equipment.body,'body-legend-muscle');
 assert.ok(technicalRivals.every(r=>r.equipment.body!=='body-champion'));assert.equal(technicalRivals.find(r=>r.id==='sou')!.equipment.body,'body-sedan');
 assert.deepEqual(wakabaRivals.map(r=>r.id),['riku','go','sou','ren']);
});
test('通常・公式・マスター練習のCPU設定に主人公専用のセイランを使わない',()=>{
 const cpuLineups=[...rivals,...aozoraRivals,...hinataRivals,...officialRivals,...officialSpeedRivals,...technicalRivals,...wakabaRivals,...grandprixRivals,...zenithRivals,...masterCourseIds.flatMap(practiceRivals)];
 assert.ok(cpuLineups.every(r=>r.equipment.body!=='body-champion'),cpuLineups.filter(r=>r.equipment.body==='body-champion').map(r=>r.id).join(', '));
});
test('第3の棄権にも昊也を記録し、新旧の結果を順位・タイムを変えず読み込む',()=>{
 const cup=forfeitCupHeat(enterCupHeat(emptyCup(),'comet','technical'));assert.ok(cup.results[0].entries.some(e=>e.id==='legend-koya'));assert.deepEqual(decodeCup(cup,'technical',emptyCup()),cup);
 const old=structuredClone(cup);const entry=old.results[0].entries.find(e=>e.id==='legend-koya')!;entry.id='ren';entry.name='高橋 蓮';assert.deepEqual(decodeCup(old,'technical',emptyCup()),old);
});
