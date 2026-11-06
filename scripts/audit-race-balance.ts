/** Reproduce the balance audit without changing gameplay. Run: pnpm exec tsx scripts/audit-race-balance.ts [output.json] */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {raceRulesVersion} from '../src/game/timeRecords';
import {execFileSync} from 'node:child_process';
import {parts} from '../src/data/parts';
import {starterEquipment,equipmentSlots,type Equipment,type EquipmentSlot} from '../src/data/machine';
import {modelShops,type ShopId} from '../src/data/world';
import {isStocked} from '../src/data/progression';
import {isSovereignPart} from '../src/data/sovereignParts';
import {getCircuitTrack,type CircuitId} from '../src/data/circuit';
import {offroadRival} from '../src/data/rivals';
import {wakabaRivals,seniorEquipment} from '../src/data/officialRace';
import {zenithEquipment} from '../src/data/zenithRace';
import {createDrivingState,startDriving,stepDriving,machinePerformance,FIXED_STEP} from '../src/game/driving';
import type {MachineCondition} from '../src/game/condition';
const fresh:MachineCondition={motorSeconds:60,batterySeconds:0};
const early:Equipment={...starterEquipment,motor:'motor-torque',gear:'gear-4',tire:'tire-1',wheel:'wheel-light',battery:'battery-entry',terminal:'terminal-entry',shaft:'shaft-entry'};
const middle:Equipment={...early,body:'body-champion',motor:'motor-wind',chassis:'chassis-light',battery:'battery-power',shaft:'shaft-1',accessory:'accessory-support'};
const wakaba:Equipment={...wakabaRivals[0].equipment,body:'body-champion',shaft:'shaft-1',terminal:'terminal-1'};
const senior:Equipment={...seniorEquipment,body:'body-champion'};
const late={...zenithEquipment};
const sprint:Equipment={...late,motor:'motor-hoshi-sprint',chassis:'chassis-hoshi-fm-sprint',tire:'tire-hoshi-slick',gear:'gear-hoshi-3.8'};
const sand:Equipment={...late,motor:'motor-hoshi-rally',chassis:'chassis-hoshi-fm-dune',tire:'tire-hoshi-sand',gear:'gear-hoshi-4.5'};
const stages:{id:string;shop:ShopId;course:CircuitId;equipment:Equipment}[]=[
 {id:'初期',shop:'komorebi',course:'leaf',equipment:early},
 {id:'あおぞら',shop:'aozora',course:'wind',equipment:middle},
 {id:'ひなた',shop:'hinata',course:'sun',equipment:{...offroadRival.equipment}},
 {id:'若葉公式・舗装',shop:'hinata',course:'sprint',equipment:{...middle,gear:'gear-3.5'}},
 {id:'わかば',shop:'wakaba',course:'grove',equipment:wakaba},
 {id:'星空公式',shop:'wakaba',course:'comet',equipment:wakaba},
 {id:'ゆうなぎ',shop:'yuunagi',course:'trail',equipment:senior},
 {id:'緑川公式',shop:'yuunagi',course:'grandprix',equipment:senior},
 {id:'あかつき',shop:'akatsuki',course:'forge',equipment:late},
 {id:'天頂',shop:'akatsuki',course:'zenith',equipment:late},
 {id:'クリア後・舗装',shop:'hoshikuzu',course:'sprint',equipment:sprint},
 {id:'クリア後・砂',shop:'hoshikuzu',course:'sun',equipment:sand},
];
type Result={status:string;time:number;distance:number;peakSpeed:number;landings:number;maxStress:number;stopReason?:string};
const cache=new Map<string,Result>();let simulations=0;
function run(course:CircuitId,e:Equipment,lane=2,condition=fresh):Result{
 const key=JSON.stringify([course,lane,e,condition]);const cached=cache.get(key);if(cached)return cached;
 const track=getCircuitTrack(course),p=machinePerformance(e,condition);let d=startDriving(createDrivingState()),peakSpeed=0,maxStress=0;
 for(let tick=0;tick<300/FIXED_STEP&&d.status==='running';tick++){d=stepDriving(d,p,0,lane,track.circuit.surface,track);peakSpeed=Math.max(peakSpeed,d.speed);maxStress=Math.max(maxStress,d.stress);}
 const r={status:d.status==='running'?'timeout':d.status,time:d.time,distance:d.distance,peakSpeed:peakSpeed*3.6,landings:d.landings??0,maxStress,stopReason:d.stopReason};cache.set(key,r);simulations++;return r;
}
function ranked<T extends Result>(a:T,b:T){return Number(b.status==='finished')-Number(a.status==='finished')||(a.status==='finished'?a.time-b.time:b.distance-a.distance);}
const names=Object.fromEntries(parts.map(p=>[p.id,p.name]));
const shopPath:ShopId[]=['komorebi','aozora','hinata','wakaba','yuunagi','akatsuki','hoshikuzu'];
const available=(shop:ShopId)=>parts.filter(p=>!isSovereignPart(p.id)&&shopPath.slice(0,shopPath.indexOf(shop)+1).some(id=>isStocked(p,modelShops[id])));
const gears=parts.filter(p=>p.category==='gear'&&!isSovereignPart(p.id));
console.error('Measuring all 5 starting lanes on every course…');
const lanes=stages.slice(0,10).map(stage=>{
 const candidates=[stage.equipment,{...stage.equipment,motor:stage.shop==='akatsuki'?'motor-zenith':stage.equipment.motor,chassis:'chassis-basic',rollerFront:'roller-0',rollerSide:'roller-0',rollerRear:'roller-0',accessory:'accessory-none',accessory2:'accessory-none',accessory3:'accessory-none'}];
 return {stage:stage.id,course:stage.course,fairLanes:getCircuitTrack(stage.course).fairLanes,soloOnly:stage.course==='trail',cases:candidates.map((e,index)=>{const results=[0,1,2,3,4].map(lane=>({lane,...run(stage.course,e,lane)})),finished=results.filter(r=>r.status==='finished').map(r=>r.time);return {label:index?'安定装備を外した比較':'推奨構成',equipment:e,results,finishSpread:finished.length?Math.max(...finished)-Math.min(...finished):null,finishCount:finished.length};})};
});
console.error('Comparing available gears and individual parts at each stage…');
const stageResults=stages.map(stage=>{
 const stock=available(stage.shop),baseline=run(stage.course,stage.equipment);
 const gearResults=gears.filter(g=>stock.some(p=>p.id===g.id)||g.id===stage.equipment.gear).map(g=>({id:g.id,ratio:g.specs.ratio,weight:g.specs.weight,...run(stage.course,{...stage.equipment,gear:g.id})})).sort(ranked);
 const swaps=Object.entries(equipmentSlots).flatMap(([slot,meta])=>{
  // Shared rollers are tested as a complete front/side/rear set. Accessories must remain distinct.
  if(slot==='rollerSide'||slot==='rollerRear')return [];
  return stock.filter(p=>p.category===meta.category).filter(p=>!['accessory','accessory2','accessory3'].includes(slot)||p.id==='accessory-none'||!Object.entries(stage.equipment).some(([other,id])=>other!==slot&&equipmentSlots[other as EquipmentSlot].category==='accessory'&&id===p.id)).map(p=>{
   const e={...stage.equipment,[slot]:p.id};if(slot==='rollerFront')e.rollerSide=e.rollerRear=p.id;
   return {slot,id:p.id,level:p.level,price:p.price,...run(stage.course,e)};
  });
 });
 console.error(`  ${stage.id}: ${simulations} simulations`);
 return {...stage,baseline,gears:gearResults,swaps};
});
console.error('Checking edge lanes for every legal motor, tire, chassis and full roller-set swap…');
const laneSensitivity=stages.slice(0,10).map((stage,index)=>({course:stage.course,soloOnly:stage.course==='trail',comparisons:stageResults[index].swaps.filter(s=>['motor','tire','chassis','rollerFront'].includes(s.slot)).map(s=>{const equipment={...stage.equipment,[s.slot]:s.id};if(s.slot==='rollerFront')equipment.rollerSide=equipment.rollerRear=s.id;const results=[0,2,4].map(lane=>({lane,...run(stage.course,equipment,lane)}));const finishes=results.filter(r=>r.status==='finished');return {slot:s.slot,id:s.id,results,finishCount:finishes.length,finishSpread:finishes.length?Math.max(...finishes.map(r=>r.time))-Math.min(...finishes.map(r=>r.time)):null};})}));
const laneFailures=laneSensitivity.flatMap((context,index)=>context.comparisons.filter(c=>c.finishCount>0&&c.finishCount<3).map(c=>{const equipment={...stages[index].equipment,[c.slot]:c.id};if(c.slot==='rollerFront')equipment.rollerSide=equipment.rollerRear=c.id;return {course:context.course,slot:c.slot,id:c.id,equipment,results:[0,1,2,3,4].map(lane=>({lane,...run(context.course,equipment,lane)}))};}));
console.error('Testing all shop-available non-Sovereign motor/gear pairs on late-game and post-clear courses…');
const motorGear=([{id:'あかつき',course:'forge',shop:'akatsuki',equipment:late},{id:'クリア後・舗装',course:'sprint',shop:'hoshikuzu',equipment:sprint},{id:'クリア後・砂',course:'sun',shop:'hoshikuzu',equipment:sand}] as const).map(context=>{
 const stock=available(context.shop),motors=stock.filter(p=>p.category==='motor'),allowedGears=gears.filter(p=>stock.some(x=>x.id===p.id)||['gear-4','gear-3.5','gear-5'].includes(p.id));
 return {context:context.id,course:context.course,equipment:context.equipment,results:motors.flatMap(m=>allowedGears.map(g=>({motor:m.id,gear:g.id,...run(context.course,{...context.equipment,motor:m.id,gear:g.id})}))).sort(ranked)};
});
// Use the same equipment and only change one measured variable. Synthetic cases isolate physics, not purchasable recipes.
const controlled={
 fmChassisBuild:run('zenith',{...late,chassis:'chassis-hoshi-fm'}),
 tire:[...new Set(['tire-0','tire-1','tire-2','tire-turn','tire-landing','tire-apex','tire-hybrid','tire-hoshi-low','tire-hoshi-slick','tire-hoshi-sand'])].map(tire=>({tire,courses:(['wind','sun','trail','zenith'] as const).map(course=>({course,...run(course,{...late,tire})}))})),
 allGearsOnStageBuild:stages.slice(0,10).map(stage=>({course:stage.course,gearOnly:gears.map(g=>({gear:g.id,...run(stage.course,{...stage.equipment,gear:g.id})})).sort(ranked)})),
};
const physicsFiles=['src/game/driving.ts','src/game/race.ts','src/game/condition.ts','src/data/circuit.ts','src/data/zenithCircuit.ts','src/data/parts.ts','src/data/zenithParts.ts','src/data/postClearParts.ts','src/data/mechanicMotor.ts','src/data/officialRace.ts','src/data/zenithRace.ts','src/data/bodies.ts','src/data/machine.ts','src/data/rivals.ts','src/data/surfaces.ts','src/data/world.ts','src/data/progression.ts','src/data/sovereignParts.ts'];
const sourceDigests=Object.fromEntries(physicsFiles.map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]));
const output={rulesVersion:raceRulesVersion,sourceDigests,modifiedFiles:execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n').filter(Boolean),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),method:{stockPolicy:'Cumulative stock from shops accessible at each story stage. Sovereign and non-shop mechanic motors excluded; gifted body preserved in baseline.',step:FIXED_STEP,condition:fresh,timeLimit:300,random:false,cpuBonus:false,sovereignExcluded:true,scope:'10 courses × 5 lanes × 2 builds; cumulative-shop one-part swaps; 3-lane checks for motor/tire/chassis/roller swaps; motor/gear cross products in 3 contexts. This is not exhaustive whole-build optimization.',cacheSize:cache.size},names,lanes,laneSensitivity,laneFailures,stages:stageResults,motorGear,controlled};
writeFileSync(process.argv[2]??'docs/balance/2026-11-06-results.json',JSON.stringify(output)+'\n');
console.error(`Done: ${simulations} distinct simulations.`);
