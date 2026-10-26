import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parts} from '../data/parts';
import {modelShops} from '../data/world';
import {isStocked} from '../data/progression';
import {starterEquipment,type Equipment} from '../data/machine';
import {purchase,type Wallet} from './purchase';
import {equipPart} from './equipment';
import {createRaceState,startRace,stepRace,launchPlayer,rankRacers} from './race';
const kit:Equipment={...starterEquipment,body:'body-arrow',motor:'motor-turn',chassis:'chassis-turn',gear:'gear-4',tire:'tire-turn',wheel:'wheel-diff',rollerFront:'roller-turn',rollerSide:'roller-turn',rollerRear:'roller-turn',accessory:'accessory-stabilizer',accessory2:'accessory-support',battery:'battery-endurance',terminal:'terminal-1'};
test('わかばで上位5部品と新作ホイールを買え、前の模型店には上位部品を出さない',()=>{
 const added=['motor-turn','chassis-turn','tire-turn','roller-turn','accessory-stabilizer','wheel-carbon','wheel-diff'];
 for(const id of added){const p=parts.find(p=>p.id===id)!;assert.ok(p);assert.ok(isStocked(p,modelShops.wakaba));for(const shop of [modelShops.komorebi,modelShops.aozora,modelShops.hinata])assert.equal(isStocked(p,shop),false);}
 assert.ok(isStocked(parts.find(p=>p.id==='wheel-aero')!,modelShops.aozora));
 assert.ok(isStocked(parts.find(p=>p.id==='wheel-rally')!,modelShops.hinata));
 for(const id of ['wheel-oneway','roller-2'])assert.ok(isStocked(parts.find(p=>p.id===id)!,modelShops.wakaba));
});
test('勝てる構成を店の販売品だけで揃え、ローラーは1セットで3か所へ装着できる',()=>{
 let wallet:Wallet={money:20000,inventory:{}};
 for(const id of new Set(Object.values(kit))){if(id==='accessory-none')continue;const result=purchase(wallet,id,modelShops.wakaba);assert.ok(result.success,id);wallet=result.wallet;}
 assert.equal(wallet.inventory['roller-turn'],1);
 let e={...starterEquipment};
 for(const slot of ['rollerFront','rollerSide','rollerRear'] as const)e=equipPart(e,wallet.inventory,'roller-turn',slot);
 for(const slot of ['rollerFront','rollerSide','rollerRear'] as const)assert.equal(e[slot],'roller-turn');
});
test('新しい旋回キットは市販ボディでも若葉と星空で安定して優勝できる',()=>{
 for(const circuit of ['grove','comet'] as const)for(const seed of [1,7,42,123,999,2026]){
  let race=startRace(createRaceState(kit,seed,{motorSeconds:60,batterySeconds:0},circuit==='comet'?'official':false,circuit));
  while(race.phase==='countdown')race=stepRace(race);race=launchPlayer(race);
  for(let i=0;i<120*240&&race.phase!=='finished';i++)race=stepRace(race);
  assert.equal(race.phase,'finished');assert.equal(race.racers[0].driving.status,'finished',`${circuit}/${seed}`);assert.equal(rankRacers(race)[0].id,'player',`${circuit}/${seed}`);
 }
});
