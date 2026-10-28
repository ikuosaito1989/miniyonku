import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getCircuitTrack} from '../data/circuit';
import {starterEquipment} from '../data/machine';
import {grandprixRivals,senior,seniorEquipment} from '../data/officialRace';
import {officialPeopleFor,officialFixturesFor} from '../data/officialVenue';
import {townVenues,isVenueOpen} from '../data/world';
import {createRaceState,startRace,launchPlayer,stepRace,rankRacers} from './race';
import {legacyCup,cupProgression,emptyCup,cupPlayerPlace} from './cup';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';
import {currentMission} from './mission';
import {useGame} from './store';
import {findWalkingPath,canTravel} from './navigation';
function qualified(){const w=legacyCup(true,true),technical={entered:true,pending:null,results:[{...w.results[0],circuitId:'comet' as const}]};return {...useGame.getInitialState(),...cupProgression(w,technical,true),legendRaceCompleted:true,aozoraWon:true,villainDefeated:true,officialQualified:true,unlockedRaces:['aozora-entry'],yuunagiBestTime:39,finalQualified:true,location:'town' as const};}
function run(e=seniorEquipment,id:'trail'|'grandprix'='grandprix',seed=42){let r=startRace(createRaceState(e,seed,{motorSeconds:60,batterySeconds:0},id==='grandprix'?'official':false,id));while(r.phase==='countdown')r=stepRace(r);r=launchPlayer(r);for(let i=0;i<120*150&&r.phase!=='finished';i++)r=stepRace(r);return r;}
function result(place:number,finished=true){const race=createRaceState(starterEquipment,42,undefined,'official','grandprix');return {...race,phase:'finished' as const,playerStartOffset:0,racers:race.racers.map((r,i)=>({...r,driving:{...r.driving,status:r.id==='player'&&!finished?'out' as const:'finished' as const,time:r.id==='player'?40+place:40+i+.5,distance:182}}))};}
test('出場権で緑川会場へ入場し、決勝・ピット・黒岩・先輩・モブ2人・応援兄弟に会える',()=>{
 const before=useGame.getState();try{
 const venue=townVenues.find(v=>v.id==='stadium-10')!;assert.equal(isVenueOpen(venue,qualified()),true);assert.equal(isVenueOpen(venue,useGame.getInitialState()),false);
 useGame.setState({...useGame.getInitialState(),location:'town'});useGame.getState().enterOfficialVenue('stadium-10');assert.equal(useGame.getState().location,'town');
 useGame.setState(qualified());assert.equal(currentMission(useGame.getState()).destination,'stadium-10');useGame.getState().enterOfficialVenue('stadium-10');assert.equal(useGame.getState().location,'stadium-10');
 useGame.getState().openOfficialRace();assert.match(useGame.getState().dialogue,/2位以内/);assert.match(useGame.getState().dialogue,/黒瀬/);useGame.getState().openSetting();useGame.getState().close();useGame.getState().openOfficialRace();assert.equal(useGame.getState().dialogueStage,'official-invite');
 assert.deepEqual(grandprixRivals.map(r=>r.id),['jin','go','sou','ren']);const people=officialPeopleFor('stadium-10');for(const id of ['jin','go','sou','ren','rei','gaku'])assert.ok(people.some(p=>p.id===id));assert.ok(officialFixturesFor('stadium-10').some(f=>f.kind==='official-final'));
 }finally{useGame.setState(before,true);}
});
test('一本道の決勝は夕凪より複雑で、先輩は夕凪38秒台。新作の通常装備で2位以内を狙える',()=>{
 const trail=getCircuitTrack('trail'),track=getCircuitTrack('grandprix');assert.ok(track.open);assert.equal(track.circuit.laps,1);assert.ok(track.circuitLength>trail.circuitLength+8);assert.ok(track.obstacles);
 const s=run(senior.equipment,'trail').racers[0];assert.equal(s.driving.status,'finished');assert.ok(s.driving.time>=38&&s.driving.time<39);
 for(const seed of [1,42,999]){const race=run({...seniorEquipment,body:'body-champion'},'grandprix',seed);assert.equal(race.racers.length,5);assert.ok(race.racers.every(r=>r.driving.status==='finished'));assert.ok(rankRacers(race).findIndex(r=>r.id==='player')<=1);assert.ok((race.racers[0].driving.landings??0)>=1);}
 for(const lane of [0,1,2,3,4])for(let i=0;i<=1500;i++){const p=track.sampleLanePath(i/1500*track.circuitLength,lane);assert.ok([p.x,p.y,p.z,p.curvature,p.pathScale].every(Number.isFinite));assert.ok(p.pathScale>.1);}
});
test('2位以内でクリア、3位以下とリタイアはゲームオーバー。一度のみ・報酬重複なし・保存復元',async()=>{
 const before=useGame.getState();try{
 for(const place of [1,2,3,4,5]){
 useGame.setState(qualified());useGame.getState().enterOfficialVenue('stadium-10');useGame.getState().startOfficialRace();assert.equal(useGame.getState().finalCup.pending,'grandprix');
 const attempt=useGame.getState().raceAttempt;useGame.getState().settleRace(attempt,result(place));assert.equal(cupPlayerPlace(useGame.getState().finalCup),place);assert.equal(useGame.getState().grandprixCleared,place<=2);assert.equal(useGame.getState().gameOver,place>2);
 const money=useGame.getState().money;useGame.getState().settleRace(attempt,result(place));assert.equal(useGame.getState().money,money);
 useGame.getState().close();assert.equal(useGame.getState().overlay,place>2?'game-over':'dialogue');assert.equal(currentMission(useGame.getState()).id,place>2?'game-over':'complete');
 const saved=decodeSave({version:1,savedAt:123,game:snapshotGame(useGame.getState())});await loadSavedGame({read:async()=>saved,write:async()=>{}});assert.equal(useGame.getState().grandprixCleared,place<=2);assert.equal(useGame.getState().gameOver,place>2);useGame.getState().startOfficialRace();assert.notEqual(useGame.getState().overlay,'race');
 }
 useGame.setState(qualified());useGame.getState().enterOfficialVenue('stadium-10');useGame.getState().startOfficialRace();useGame.getState().settleRace(useGame.getState().raceAttempt,result(1,false));assert.equal(useGame.getState().gameOver,true);
 }finally{useGame.setState(before,true);}
});
test('途中退出・再読み込みも棄権として保存、旧セーブに決勝記録がなくても参加できる',async()=>{
 const before=useGame.getState();try{
 const old:Record<string,unknown>=snapshotGame(qualified());delete old.finalCup;delete old.grandprixCleared;assert.deepEqual(decodeSave({version:1,savedAt:123,game:old}).game.finalCup,emptyCup());
 const forged={...old,finalQualified:true,yuunagiBestTime:41,location:'stadium-10'};assert.throws(()=>decodeSave({version:1,savedAt:123,game:forged}),/入場条件/);
 for(const reload of [false,true]){useGame.setState(qualified());useGame.getState().enterOfficialVenue('stadium-10');useGame.getState().startOfficialRace();if(reload){const saved={version:1 as const,savedAt:123,game:snapshotGame(useGame.getState())};await loadSavedGame({read:async()=>saved,write:async()=>{}});}else useGame.getState().close();assert.equal(useGame.getState().gameOver,true);assert.equal(useGame.getState().overlay,'game-over');assert.equal(useGame.getState().finalCup.pending,null);}
 }finally{useGame.setState(before,true);}
});

test('決勝コース・ピット・受付・全員の応援会話まで歩いて調べられる',()=>{
 const fixtures=officialFixturesFor('stadium-10'),people=officialPeopleFor('stadium-10'),spawn={x:480,y:535};
 const obstacles=[...fixtures.map(f=>({x:f.x,y:f.y,width:f.w,height:f.h})),...people.map(p=>({x:p.x-12,y:p.y-9,width:24,height:21}))];
 for(const target of [...fixtures.filter(f=>f.kind!=='decoration').map(f=>({x:f.x+f.w/2,y:f.y+f.h/2})),...people]){const path=findWalkingPath(spawn,target,obstacles);assert.ok(path.length>0,JSON.stringify(target));let before=spawn;for(const point of path){assert.ok(canTravel(before,point,obstacles));before=point;}}
});
