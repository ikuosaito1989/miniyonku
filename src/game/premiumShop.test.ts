import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {parts} from '../data/parts';
import {modelShops,canEnterShop,isVenueOpen,townVenues} from '../data/world';
import {isStocked} from '../data/progression';
import {prizesForCircuit} from '../data/economy';
import {purchase} from './purchase';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';
import {starterEquipment} from '../data/machine';
import {createRaceState,startRace,stepRace,launchPlayer,rankRacers,type RaceChallenge} from './race';
const ids=['motor-sovereign','chassis-sovereign'];
test('最高額2部品は特別店だけで販売し、セット価格はわかば優勝200回分',()=>{
 const list=parts.filter(p=>ids.includes(p.id));assert.equal(list.length,2);
 assert.equal(list.reduce((n,p)=>n+p.price,0),prizesForCircuit('grove')[0]*200);
 for(const p of list){assert.equal(p.price,Math.max(...parts.map(p=>p.price)));for(const shop of Object.values(modelShops))assert.equal(isStocked(p,shop),shop.id==='atelier');}
 assert.deepEqual(parts.filter(p=>isStocked(p,modelShops.atelier)).map(p=>p.id),ids);
 assert.equal(purchase({money:249999,inventory:{}},ids[0],modelShops.atelier).success,false);
 assert.equal(purchase({money:250000,inventory:{}},ids[0],modelShops.atelier).success,true);
});
test('序盤でも特別店に入り、購入・装着・保存・再開できる。主進行は解放しない',async()=>{
 const original=useGame.getState();try{
  useGame.setState({...useGame.getInitialState(),location:'town',money:500000});
  assert.ok(canEnterShop('atelier',useGame.getState()));assert.ok(isVenueOpen(townVenues.find(v=>v.id==='atelier')!,useGame.getState()));
  useGame.getState().enterShop('atelier');assert.equal(useGame.getState().location,'atelier');
  useGame.getState().buy(ids[0]);useGame.getState().buy(ids[1]);useGame.getState().equip(ids[1]);
  assert.equal(useGame.getState().money,0);assert.equal(useGame.getState().equipment.motor,ids[0]);assert.equal(useGame.getState().equipment.chassis,ids[1]);
  const save=decodeSave({version:1,savedAt:123,game:snapshotGame(useGame.getState())});
  await loadSavedGame({read:async()=>save,write:async()=>{}});assert.equal(useGame.getState().location,'atelier');
  useGame.getState().startTrial();assert.equal(useGame.getState().overlay,null);
  useGame.getState().leaveShop();assert.equal(useGame.getState().location,'town');assert.equal(useGame.getState().legendRaceCompleted,false);assert.deepEqual(useGame.getState().unlockedRaces,[]);
  useGame.getState().enterShop('aozora');assert.equal(useGame.getState().location,'town');
 }finally{useGame.setState(original,true);}
});
test('究極の2部品は初期のほかの装備と新品のまま公開中の通常・公式戦で圧倒できる',()=>{
 const equipment={...starterEquipment,motor:ids[0],chassis:ids[1]};
 for(const circuit of ['leaf','wind','sun','sprint','grove','comet'] as const)for(const seed of [1,42,999]){
  const challenge:RaceChallenge=circuit==='sprint'||circuit==='comet'?'official':false;
  let race=startRace(createRaceState(equipment,seed,{motorSeconds:0,batterySeconds:0},challenge,circuit));while(race.phase==='countdown')race=stepRace(race);race=launchPlayer(race);
  for(let i=0;i<120*240&&race.phase!=='finished';i++)race=stepRace(race);
  assert.equal(race.phase,'finished');assert.equal(rankRacers(race)[0].id,'player',`${circuit}/${seed}`);assert.equal(race.racers[0].driving.status,'finished');assert.equal(race.racers[0].performance.motorWearRate,0);
 }
 let official=startRace(createRaceState(equipment,42,{motorSeconds:0,batterySeconds:0},'official','sun'));while(official.phase==='countdown')official=stepRace(official);official=launchPlayer(official);for(let i=0;i<120*240&&official.phase!=='finished';i++)official=stepRace(official);assert.equal(rankRacers(official)[0].id,'player');
});
