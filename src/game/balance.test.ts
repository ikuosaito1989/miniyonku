import {test} from 'node:test';import assert from 'node:assert/strict';
import {parts} from '../data/parts';import {starterEquipment,type Equipment} from '../data/machine';import {getCircuitTrack,type CircuitId} from '../data/circuit';import {seniorEquipment,wakabaRivals} from '../data/officialRace';import {zenithEquipment} from '../data/zenithRace';import {modelShops} from '../data/world';import {isStocked} from '../data/progression';
import {machinePerformance,createDrivingState,startDriving,stepDriving,type DrivingState,type Performance} from './driving';import {recordRaceTimes,decodeTimeHistory,migrateTimeHistory,raceRulesVersion} from './timeRecords';import {createRaceState,startRace,stepRace,launchPlayer,rankRacers} from './race';import {decodeSave,snapshotGame} from './saveData';import {useGame} from './store';import {buildMachineModel} from './MachineModel';
const fresh={motorSeconds:60,batterySeconds:0};
function drive(id:CircuitId,e:Equipment,lane=2,condition=fresh){const t=getCircuitTrack(id),p=machinePerformance(e,condition);let d=startDriving(createDrivingState());for(let tick=0;tick<120*300&&d.status==='running';tick++)d=stepDriving(d,p,0,lane,t.circuit.surface,t);return d;}
const running=(distance:number,speed=4):DrivingState=>({...startDriving(createDrivingState()),distance,speed});
test('全10コースで同じ車体の全5開始レーンは完走可否・時間・失格位置まで一致する',()=>{
 for(const id of ['leaf','wind','sun','sprint','grove','comet','trail','grandprix','forge','zenith'] as const){const e=id==='forge'||id==='zenith'?zenithEquipment:id==='trail'||id==='grandprix'?{...seniorEquipment,body:'body-champion'}:{...wakabaRivals[0].equipment,body:'body-champion'};const reference=drive(id,e,0);for(let lane=1;lane<5;lane++)assert.deepEqual(drive(id,e,lane),reference,`${id}/${lane}`);}
 // Exact combinations that previously finished from lane 1 but crashed from lane 5.
 for(const patch of [{chassis:'chassis-light'},{tire:'tire-0'},{tire:'tire-2'}]){const e={...wakabaRivals[0].equipment,body:'body-champion',shaft:'shaft-1',terminal:'terminal-1',...patch},reference=drive('grove',e,0);for(let lane=1;lane<5;lane++)assert.deepEqual(drive('grove',e,lane),reference);}
});
test('壁摩擦は直線には加算せず、旋回で効く。硬質タイヤは横擦れが小さい代わりに限界が低い',()=>{
 const t=getCircuitTrack('sprint'),base=machinePerformance(zenithEquipment,fresh),straight=Array.from({length:100},(_,i)=>i/100*t.circuitLength).find(d=>t.sampleLanePath(d,2).curvature<1e-5&&Math.abs(t.sampleLanePath(d,2).pitch)<1e-5)!;
 assert.ok(Number.isFinite(straight));const p={...base,mass:.15,rollerFriction:.05},rubber={...p,rollerFriction:.24};
 assert.equal(stepDriving(running(straight),p,0,2,t.circuit.surface,t).speed,stepDriving(running(straight),rubber,0,2,t.circuit.surface,t).speed);
 const c=getCircuitTrack('leaf'),d=5;assert.ok(stepDriving(running(d),p,0,2,c.circuit.surface,c).speed>stepDriving(running(d),rubber,0,2,c.circuit.surface,c).speed);
 const soft={...machinePerformance({...zenithEquipment,tire:'tire-1'},fresh),mass:.15},hard={...machinePerformance({...zenithEquipment,tire:'tire-2'},fresh),mass:.15};assert.ok(hard.lateralLimit<soft.lateralLimit);assert.ok(stepDriving(running(d),hard,0,2,c.circuit.surface,c).speed>stepDriving(running(d),soft,0,2,c.circuit.surface,c).speed);
 const curve=c.sampleLanePath(d,2).curvature,speed=Math.sqrt((soft.lateralLimit+hard.lateralLimit)/2/c.cornerLoad/curve);assert.ok(stepDriving(running(d,speed),hard,0,2,c.circuit.surface,c).stress>stepDriving(running(d,speed),soft,0,2,c.circuit.surface,c).stress);
});
test('低反発タイヤは着地損失を抑え、FMの前寄り重心は飛び出しを低くする',()=>{
 const t=getCircuitTrack('grove'),jump=t.obstacles!.jump,p=machinePerformance(zenithEquipment,fresh),impact={...running(jump.takeoff+jump.gap+.1),flightY:.001,flightVelocity:-3};
 const low=stepDriving(impact,{...p,rebound:.08},0,2,t.circuit.surface,t),high=stepDriving(impact,{...p,rebound:.65},0,2,t.circuit.surface,t);assert.ok(low.speed>high.speed);assert.ok(low.stress<high.stress);
 const launch=running(jump.takeoff-.001),rm=stepDriving(launch,{...p,frontBias:0},0,2,t.circuit.surface,t),fm=stepDriving(launch,{...p,frontBias:.1},0,2,t.circuit.surface,t);assert.ok(fm.flightVelocity!<rm.flightVelocity!);assert.ok(fm.flightY!<rm.flightY!);
 assert.ok(machinePerformance({...zenithEquipment,chassis:'chassis-hoshi-fm'}).frontBias>0);assert.equal(p.frontBias,0);
});
test('ブレーキは坂でだけ制動し、強い方が飛び出し速度を落とす。装着・取り外しで外観も変わる',()=>{
 const t=getCircuitTrack('grove'),j=t.obstacles!.jump,p=machinePerformance(zenithEquipment,fresh),d=j.takeoff-j.rise/2;
 const step=(p:Performance,where=d)=>stepDriving(running(where,6),p,0,2,t.circuit.surface,t);
 assert.ok(step({...p,brake:0}).speed>step({...p,brake:.3}).speed);assert.ok(step({...p,brake:.3}).speed>step({...p,brake:.65}).speed);
 const flat=getCircuitTrack('sprint');const straight=Array.from({length:100},(_,i)=>i/100*flat.circuitLength).find(x=>Math.abs(flat.sampleLanePath(x,2).pitch)<1e-5)!;assert.equal(stepDriving(running(straight),{...p,brake:0},0,2,flat.circuit.surface,flat).speed,stepDriving(running(straight),{...p,brake:.65},0,2,flat.circuit.surface,flat).speed);
 for(const slot of ['accessory','accessory2','accessory3'] as const){const model=buildMachineModel(0xffffff,{...zenithEquipment,[slot]:'accessory-brake-soft'});assert.ok(model.getObjectByName('rear-brake-pad'));assert.ok(model.children.some(m=>m.userData.equipmentSlot===slot&&m.userData.partId==='accessory-brake-soft'));}
 assert.equal(buildMachineModel(0xffffff,zenithEquipment).getObjectByName('rear-brake-pad'),undefined);for(const id of ['accessory-brake-soft','accessory-brake-hard'])assert.ok(isStocked(parts.find(p=>p.id===id)!,modelShops.yuunagi));
});
test('高回転モーターは高速ギアだけでは縦ループで失速し、トルク比率で完走。残量低下時は5.2が有効',()=>{
 const fast=drive('zenith',{...zenithEquipment,gear:'gear-3.5'});assert.equal(fast.stopReason,'loop');assert.equal(drive('zenith',zenithEquipment).status,'finished');
 const aged={motorSeconds:60,batterySeconds:400};assert.equal(drive('zenith',zenithEquipment,2,aged).stopReason,'loop');assert.equal(drive('zenith',{...zenithEquipment,gear:'gear-5.2'},2,aged).status,'finished');
});
test('中盤の新作モーターは旧ラリーより速く、長距離ではスパークより大容量電池が有利',()=>{
 const e={...wakabaRivals[0].equipment,body:'body-champion',shaft:'shaft-1',terminal:'terminal-1'},current=drive('grove',e),old=drive('grove',{...e,motor:'motor-rally'});assert.equal(current.status,'finished');assert.equal(old.status,'finished');assert.ok(current.time<old.time);
 const sprint=drive('zenith',{...zenithEquipment,battery:'battery-power'}),long=drive('zenith',zenithEquipment);assert.equal(long.status,'finished');assert.ok(sprint.status!=='finished'||long.time<sprint.time);
});
test('調整前の装備付きタイムも参考記録へ保存し、新しい物理の順位に混在させない',()=>{
 const race=createRaceState(starterEquipment,42,undefined,'time-attack','sprint');race.phase='finished';race.playerStartOffset=0;race.racers[0].driving={...race.racers[0].driving,status:'finished',time:50};const history=recordRaceTimes({},race,1,1000);assert.equal(history.sprint![0].rulesVersion,raceRulesVersion);
 const {rulesVersion,...old}=history.sprint![0];void rulesVersion;const migrated=migrateTimeHistory({sprint:[old]});assert.deepEqual(migrated.timeHistory.sprint,[]);assert.deepEqual(migrated.legacyTimeHistory.sprint,[old]);
 const initial=useGame.getInitialState(),save=decodeSave({version:1,savedAt:123,game:{...snapshotGame(initial),timeHistory:{sprint:[old]}}});assert.deepEqual(save.game.legacyTimeHistory.sprint,[old]);assert.deepEqual(decodeSave(save).game.legacyTimeHistory.sprint,[old]);assert.throws(()=>decodeTimeHistory({sprint:[{...old,rulesVersion:999}]}));
});
test('ブレーキで実際のジャンプ距離と飛びすぎ時の着地ストレスを抑えられる',()=>{
 const t=getCircuitTrack('grove'),j=t.obstacles!.jump,base=machinePerformance(zenithEquipment,fresh);
 const section=(brake:number)=>{let d=running(j.takeoff-j.rise-.01,12),highest=0;const p={...base,stallForce:0,lateralLimit:1e6,damping:.1,brake};for(let i=0;i<120*3&&d.status==='running'&&!d.landings;i++){d=stepDriving(d,p,0,2,t.circuit.surface,t);highest=Math.max(highest,d.flightY??0);}assert.equal(d.landings,1);return {state:d,highest};};
 const free=section(0),braked=section(.65);assert.ok(braked.highest<free.highest);assert.ok(braked.state.distance<free.state.distance);assert.ok(braked.state.stress<free.state.stress);
});

test('悪路シャーシだけでタイヤの弱点を消せず、砂用タイヤへの交換が有効になる',()=>{
 const sand={...zenithEquipment,motor:'motor-hoshi-rally',chassis:'chassis-hoshi-fm-dune',tire:'tire-hoshi-sand',gear:'gear-hoshi-4.5'},special=drive('sun',sand),ordinary=drive('sun',{...sand,tire:'tire-1'});assert.equal(special.status,'finished');assert.equal(ordinary.status,'finished');assert.ok(special.time<ordinary.time);
});

test('佐伯の現地購入できる混成構成は発進0.3秒遅れでもレジェンドに入賞できる',()=>{
 const equipment={...zenithEquipment,motor:'motor-titan',gear:'gear-3.5',rollerRear:'roller-zenith'};
 for(const id of new Set(Object.values(equipment)))assert.ok(id==='body-champion'||isStocked(parts.find(p=>p.id===id)!,modelShops.akatsuki));
 for(const seed of [1,42,999]){let race=startRace(createRaceState(equipment,seed,fresh,'official','zenith'));while(race.phase==='countdown')race=stepRace(race);for(let i=0;i<36;i++)race=stepRace(race);race=launchPlayer(race);for(let i=0;i<120*240&&race.phase!=='finished';i++)race=stepRace(race);assert.equal(race.racers[0].driving.status,'finished');assert.ok(rankRacers(race).findIndex(r=>r.id==='player')<=1);assert.ok(race.racers.every(r=>r.driving.status==='finished'));}
});
