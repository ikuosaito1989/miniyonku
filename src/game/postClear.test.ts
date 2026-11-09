import {masterCourseIds} from '../data/masterCourses';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {useGame} from './store';import {createRaceState} from './race';import {cupProgression,legacyCup,raceCupHeat} from './cup';import {snapshotGame,decodeSave} from './saveData';import {loadSavedGame} from './autoSave';
import {zenithEquipment} from '../data/zenithRace';import {starterEquipment,equipmentSlots,type Equipment} from '../data/machine';import {sovereignEquipment} from '../data/sovereignParts';import {postClearParts,legendBodyIds} from '../data/postClearParts';import {modelShops,canEnterShop} from '../data/world';import {parts} from '../data/parts';import {isStocked} from '../data/progression';import {officialTimeBoards} from '../data/timeBoard';import {recordRaceTimes,migrateTimeHistory,isRecordEquipmentEligible} from './timeRecords';import {getCircuitTrack,type CircuitId} from '../data/circuit';import {buildMachineModel} from './MachineModel';import {machinePerformance,createDrivingState,startDriving,stepDriving} from './driving';
function finished(id:CircuitId,solo=false){const race=createRaceState(zenithEquipment,42,undefined,solo?'time-attack':'official',id);return {...race,phase:'finished' as const,playerStartOffset:0,racers:race.racers.map((r,i)=>({...r,driving:{...r.driving,status:'finished' as const,time:70+i,distance:getCircuitTrack(id).circuitLength}}))};}
function cleared(){const w=legacyCup(true,true),t={entered:true,pending:null,results:[raceCupHeat(finished('comet'))]},f={entered:true,pending:null,results:[raceCupHeat(finished('grandprix'))]},z={entered:true,pending:null,results:[raceCupHeat(finished('zenith'))]};return {...useGame.getInitialState(),...cupProgression(w,t,true,f,z),legendRaceCompleted:true,doctorGiftReceived:false,aozoraWon:true,villainDefeated:true,officialQualified:true,unlockedRaces:['aozora-entry'],finalQualified:true,yuunagiBestTime:39,akatsukiRaceCount:5,zenithQualified:true,openingStep:9,tutorialStage:'done' as const,koyaEscortStep:6,towaEscortStep:6,location:'town' as const,lastShop:'akatsuki' as const};}
test('クリア後は公式全5コースを繰り返し走れ、大会結果・クリアを保持。中断と再読込でも敗退しない',async()=>{
 const before=useGame.getState();try{useGame.setState(cleared(),true);
 const cups=JSON.stringify([useGame.getState().wakabaCup,useGame.getState().technicalCup,useGame.getState().finalCup,useGame.getState().zenithCup]);
 for(const [venue,round,id] of [['stadium-5','speed','sprint'],['stadium-5','dirt','sun'],['stadium-9','technical','comet'],['stadium-10','final','grandprix'],['stadium-7','zenith','zenith']] as const){
  for(let n=0;n<2;n++){useGame.setState({location:venue,overlay:null});useGame.getState().openOfficialRace(round);assert.equal(useGame.getState().dialogueStage,'official-invite');useGame.getState().startOfficialRace();assert.equal(useGame.getState().officialReplayActive,true);const race=finished(id,true);assert.equal(race.racers.length,1);assert.equal(race.racers[0].lane,2);useGame.getState().settleRace(useGame.getState().raceAttempt,race);assert.equal(useGame.getState().podiumPending,false);useGame.getState().close();assert.equal(useGame.getState().overlay,null);assert.equal(useGame.getState().gameOver,false);assert.equal(useGame.getState().zenithCleared,true);assert.ok(useGame.getState().timeHistory[id]?.length);}
  assert.ok(officialTimeBoards(venue).some(b=>b.circuitId===id));
 }
 assert.equal(JSON.stringify([useGame.getState().wakabaCup,useGame.getState().technicalCup,useGame.getState().finalCup,useGame.getState().zenithCup]),cups);
 useGame.getState().startOfficialRace();const save=decodeSave({version:1,savedAt:123,game:snapshotGame(useGame.getState())});await loadSavedGame({read:async()=>save,write:async()=>{}});assert.equal(useGame.getState().gameOver,false);assert.equal(useGame.getState().zenithCleared,true);assert.equal(useGame.getState().officialReplayActive,false);
 useGame.getState().startOfficialRace();useGame.getState().close();assert.equal(useGame.getState().zenithCup.pending,null);assert.equal(useGame.getState().gameOver,false);
 }finally{useGame.setState(before,true);}
});
test('星皇は全装備枠で1つでも記録を拒否し、通常装備は設定を保存。旧記録を参考欄へ移す',()=>{
 for(const slot of Object.keys(equipmentSlots) as (keyof Equipment)[]){const equipment={...starterEquipment,[slot]:sovereignEquipment[slot]};assert.equal(isRecordEquipmentEligible(equipment),false,slot);const race=finished('sprint',true);race.racers[0].equipment=equipment;assert.deepEqual(recordRaceTimes({},race,1,123),{});}
 const history=recordRaceTimes({},finished('sprint',true),1,123);assert.deepEqual(history.sprint![0].equipment,zenithEquipment);const {equipment,...old}=history.sprint![0];void equipment;const migrated=migrateTimeHistory({sprint:[old]});assert.deepEqual(migrated.timeHistory.sprint,[]);assert.deepEqual(migrated.legacyTimeHistory.sprint,[old]);assert.deepEqual(migrateTimeHistory(migrated.timeHistory,migrated.legacyTimeHistory),migrated);
});
test('ほしくずは真のクリア後に開放し、専売37種とレジェンド4ボディを購入・装着・保存できる',()=>{
 const before=useGame.getState();try{assert.equal(canEnterShop('hoshikuzu',useGame.getInitialState()),false);useGame.setState({...cleared(),money:1000000},true);assert.equal(canEnterShop('hoshikuzu',useGame.getState()),true);useGame.getState().enterShop('hoshikuzu');assert.equal(useGame.getState().location,'hoshikuzu');assert.equal(postClearParts.length,37);assert.equal(new Set(postClearParts.map(p=>p.category)).size,10);
 for(const id of [...postClearParts.map(p=>p.id),...legendBodyIds]){const p=parts.find(p=>p.id===id)!;assert.ok(p.price>0);assert.equal(isStocked(p,modelShops.hoshikuzu),true);useGame.getState().buy(id);assert.equal(useGame.getState().inventory[id],1,id);}
 useGame.getState().equip('chassis-hoshi-fm','chassis');useGame.getState().equip(legendBodyIds[2],'body');const decoded=decodeSave({version:1,savedAt:123,game:snapshotGame(useGame.getState())});assert.equal(decoded.game.location,'hoshikuzu');assert.equal(decoded.game.equipment.chassis,'chassis-hoshi-fm');assert.equal(decoded.game.equipment.body,legendBodyIds[2]);
 const fm=buildMachineModel(0xffffff,{...zenithEquipment,chassis:'chassis-hoshi-fm'});assert.ok(fm.getObjectByName('front-motor-can')!.position.z>0);assert.ok(fm.getObjectByName('front-gearbox')!.position.z>0);assert.equal(buildMachineModel(0xffffff,zenithEquipment).getObjectByName('front-motor-can'),undefined);
 }finally{useGame.setState(before,true);}
});
function drive(id:CircuitId,e:Equipment){const t=getCircuitTrack(id),p=machinePerformance(e,{motorSeconds:60,batterySeconds:0});let d=startDriving(createDrivingState());for(let i=0;i<120*300&&d.status==='running';i++)d=stepDriving(d,p,0,2,t.circuit.surface,t);assert.equal(d.status,'finished');return d.time;}
test('新パーツは星皇なしで完走でき、舗装用と砂用の優劣が路面によって逆転する',()=>{
 const sprint={...zenithEquipment,motor:'motor-hoshi-sprint',chassis:'chassis-hoshi-fm-sprint',tire:'tire-hoshi-slick',gear:'gear-hoshi-3.8'},sand={...zenithEquipment,motor:'motor-hoshi-rally',chassis:'chassis-hoshi-fm-dune',tire:'tire-hoshi-sand',gear:'gear-hoshi-4.5'};
 assert.ok(isRecordEquipmentEligible(sprint)&&isRecordEquipmentEligible(sand));assert.ok(drive('wind',sprint)<drive('wind',sand));assert.ok(drive('sun',sand)<drive('sun',sprint));drive('zenith',{...zenithEquipment,motor:'motor-hoshi-loop',chassis:'chassis-hoshi-fm-loop',tire:'tire-hoshi-gravel',gear:'gear-hoshi-4.5'});
});

test('旧クリア済みセーブからも巨大マスター4コースが開放され、帰還地点とクリアを保存できる',()=>{
 const before=useGame.getState();try{
  for(const id of masterCourseIds){
   useGame.setState({...cleared(),townReturnVenue:id},true);
   const saved=decodeSave({version:1,savedAt:123,game:snapshotGame(useGame.getState())}).game;
   assert.equal(saved.zenithCleared,true);assert.equal(saved.townReturnVenue,id);assert.equal(canEnterShop(id,saved),true);
  }
 }finally{useGame.setState(before,true);}
});
