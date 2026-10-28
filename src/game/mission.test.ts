import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {snapshotGame} from './saveData';
import {currentMission,missionNextAction} from './mission';
import {legacyCup,enterCupHeat,emptyCup,forfeitCupHeat} from './cup';
import {townVenues,isVenueOpen} from '../data/world';
import {nextShopRace} from '../data/shopHints';

test('初優勝・兄弟・博士・各模型店・黒岩・公式二戦を進行順に案内する',()=>{
 let s={...useGame.getInitialState()};
 const expect=(id:string)=>{const mission=currentMission(s);assert.equal(mission.id,id);if(mission.destination)assert.ok(isVenueOpen(townVenues.find(v=>v.id===mission.destination)!,s));};
 expect('komorebi');
 s={...s,unlockedRaces:[nextShopRace.id]};expect('brothers');assert.match(currentMission(s).hint,/勝利する必要がありません/);
 s={...s,legendRaceCompleted:true};expect('doctor');
 s={...s,doctorGiftReceived:true};expect('aozora');
 s={...s,aozoraWon:true};expect('kuroiwa');
 s={...s,villainDefeated:true};expect('hinata');
 s={...s,officialQualified:true};expect('wakaba-speed');assert.match(currentMission(s).hint,/一度限り/);
 s={...s,wakabaCup:legacyCup(true,false)};expect('wakaba-dirt');assert.match(currentMission(s).steps[0],/オフロード/);
 s={...s,wakabaCup:legacyCup(true,true),wakabaUnlocked:true};expect('wakaba');
 s={...s,thirdOfficialQualified:true};expect('technical');
 s={...s,yuunagiUnlocked:true};expect('yuunagi');
 s={...s,finalQualified:true,yuunagiBestTime:39};expect('grandprix');assert.equal(currentMission(s).destination,'stadium-10');assert.match(currentMission(s).hint,/2位以内/);
 s={...s,grandprixCleared:true};expect('complete');assert.equal(currentMission(s).destination,null);
 s={...s,gameOver:true};expect('game-over');assert.equal(currentMission(s).destination,null);
});
test('総合優勝で得た第3公式大会の権利を優先し、再読み込みしても同じミッションを表示する',()=>{
 const s={...useGame.getInitialState(),legendRaceCompleted:true,doctorGiftReceived:true,aozoraWon:true,villainDefeated:true,officialQualified:true,wakabaCup:legacyCup(true,true),wakabaUnlocked:true,thirdOfficialQualified:true};
 assert.equal(currentMission(s).id,'technical');assert.deepEqual(currentMission(s),currentMission(structuredClone(snapshotGame(s))));
});
test('現在地に合わせて街の移動・別店舗からの退出・場内の行動を案内する',()=>{
 const s={...useGame.getInitialState(),legendRaceCompleted:true,doctorGiftReceived:true,aozoraWon:true,villainDefeated:true,officialQualified:true,wakabaCup:legacyCup(true,false)};
 assert.match(missionNextAction({...s,location:'town'}),/若葉レース場へ向かおう/);
 assert.match(missionNextAction({...s,location:'hinata'}),/出口から街へ/);
 assert.match(missionNextAction({...s,location:'stadium-5'}),/ピットでオフロード/);
});
