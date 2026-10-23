import { parts } from '../data/parts';
import { isStocked } from '../data/progression';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useGame } from './store';
import { snapshotGame, decodeSave } from './saveData';
import { loadSavedGame } from './autoSave';
import { createRaceState, startRace, launchPlayer, stepRace, rankRacers, type RaceState } from './race';
import { starterEquipment } from '../data/machine';
import { modelShops, isVenueOpen, townVenues } from '../data/world';
import { shopCast } from '../data/shopCast';
import { shopLayout } from '../data/shopLayout';
import { challenger, challengerSpot } from '../data/challenger';
import { nextShopRace } from '../data/shopHints';
import { racePrize } from './reward';
import { room } from '../data/shop';
import { canTravel, findWalkingPath } from './navigation';
import { dialogueChoices } from '../data/dialoguePeople';

const aozoraStart=()=>({...useGame.getInitialState(),...snapshotGame(useGame.getInitialState()),location:'aozora' as const,lastShop:'aozora' as const,legendRaceCompleted:true,unlockedRaces:[nextShopRace.id],money:10000});
function result(challenge=false):RaceState{
  const race=createRaceState(starterEquipment,123,undefined,challenge?'villain':false,'wind');
  return {...race,phase:'finished',playerStartOffset:0,racers:race.racers.map((r,i)=>({...r,driving:{...r.driving,status:'finished',time:40+i}}))};
}
test('あおぞらの完走賞は1000/600/450/350/250円。通常優勝で黒岩が現れ、次店はまだ開かない',()=>{
  const original=useGame.getState();
  try{
    for(const [place,prize] of [1000,600,450,350,250].entries())assert.equal(racePrize({...result(),falseStartPenalty:place+.5}),prize);
    useGame.setState(aozoraStart());useGame.getState().startTrial();const attempt=useGame.getState().raceAttempt;
    useGame.getState().settleRace(attempt,result());useGame.getState().settleRace(attempt,result());
    assert.equal(useGame.getState().money,11000);assert.equal(useGame.getState().aozoraWon,true);assert.equal(useGame.getState().villainDefeated,false);
    useGame.getState().close();assert.equal(useGame.getState().overlay,'arrival');useGame.getState().completeArrival();assert.equal(useGame.getState().dialogueStage,'villain-intro');assert.equal(useGame.getState().speaker,challenger.name);
    assert.deepEqual(dialogueChoices(false,false,'villain-intro').map(c=>c.action),['villainRace','close']);
    useGame.getState().close();useGame.getState().leaveShop();useGame.getState().enterShop('hinata');assert.equal(useGame.getState().location,'town');
    useGame.getState().enterShop('aozora');useGame.getState().openVillainChallenge();assert.equal(useGame.getState().dialogueStage,'villain-intro');
  }finally{useGame.setState(original);}
});
test('黒岩への勝利だけで紹介状を獲得。途中退出・敗北・周回遅れ・フライング逆転・古い通知では解放しない',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...aozoraStart(),aozoraWon:true});
    useGame.getState().startVillainChallenge();useGame.getState().close();assert.equal(useGame.getState().villainDefeated,false);
    for(const loss of [{...result(true),phase:'running' as const},{...result(true),falseStartPenalty:10},{...result(true),racers:result(true).racers.map(r=>r.id==='player'?{...r,driving:{...r.driving,status:'out' as const,stopReason:'lapped' as const}}:r)}]){
      useGame.getState().startVillainChallenge();useGame.getState().settleRace(useGame.getState().raceAttempt,loss);
      assert.equal(useGame.getState().villainDefeated,false);useGame.getState().close();useGame.getState().close();useGame.getState().openVillainChallenge();
      assert.equal(useGame.getState().dialogueStage,'villain-intro');
    }
    useGame.getState().startVillainChallenge();const attempt=useGame.getState().raceAttempt,before=useGame.getState().money;
    useGame.getState().settleRace(attempt-1,result(true));assert.equal(useGame.getState().villainDefeated,false);
    useGame.getState().settleRace(attempt,result(true));useGame.getState().settleRace(attempt,result(true));
    assert.equal(useGame.getState().villainDefeated,true);assert.equal(useGame.getState().thirdShopNotice,true);assert.equal(useGame.getState().money,before+1000);
    useGame.getState().close();assert.equal(useGame.getState().dialogueStage,'villain-win');useGame.getState().close();useGame.getState().leaveShop();
    assert.equal(isVenueOpen(townVenues.find(v=>v.id==='hinata')!,useGame.getState()),true);
    useGame.getState().enterShop('hinata');assert.equal(useGame.getState().location,'hinata');
    assert.equal(modelShops.hinata.circuitId,'sun');useGame.getState().buy('gear-3.5');assert.equal(useGame.getState().inventory['gear-3.5'],1);
    useGame.getState().startTrial();assert.equal(useGame.getState().overlay,'race');
  }finally{useGame.setState(original);}
});
test('あおぞら優勝前・黒岩撃破後と現在地を保存。旧データは未クリアを補完し、偽の次店解放を拒否',async()=>{
  const original=useGame.getState();
  try{
    useGame.setState(aozoraStart());const base=snapshotGame(useGame.getState());
    const old={...base} as Record<string,unknown>;delete old.aozoraWon;delete old.villainDefeated;
    const migrated=decodeSave({version:1,savedAt:123,game:old});assert.equal(migrated.game.aozoraWon,false);assert.equal(migrated.game.money,10000);
    for(const won of [false,true]){
      const data={version:1 as const,savedAt:123,game:{...base,aozoraWon:true,villainDefeated:won,location:won?'hinata' as const:'aozora' as const,lastShop:won?'hinata' as const:'aozora' as const}};
      await loadSavedGame({read:async()=>data,write:async()=>{assert.fail('ロード時に書き込まない');}});
      assert.equal(useGame.getState().villainArrivalPending,!won);assert.equal(useGame.getState().location,data.game.location);assert.deepEqual(snapshotGame(useGame.getState()),data.game);
    }
    assert.throws(()=>decodeSave({version:1,savedAt:123,game:{...base,villainDefeated:true}}));
    assert.throws(()=>decodeSave({version:1,savedAt:123,game:{...base,location:'hinata'}}));
    assert.throws(()=>decodeSave({version:1,savedAt:123,game:{...base,aozoraWon:'yes'}}));
  }finally{useGame.setState(original);}
});
test('3店舗の人物は異なる位置にいて、あおぞらの全員と黒岩に障害物を迂回して近づける',()=>{
  const casts=['komorebi','aozora','hinata'].map(id=>shopCast(id as 'komorebi'|'aozora'|'hinata'));
  assert.equal(new Set(casts.map(c=>`${c.owner.x},${c.owner.y}`)).size,3);
  assert.equal(new Set(casts.map(c=>`${c.rival.x},${c.rival.y}`)).size,3);
  for(let i=0;i<casts.length;i++){
    const people=[casts[i].rival,...casts[i].visitors,...(i===1?[challengerSpot]:[])];
    const layout=shopLayout((['komorebi','aozora','hinata'] as const)[i]);
    const obstacles=[...layout.map(({target:f})=>({x:f.x,y:f.y,width:f.w,height:f.h})),...people.map(p=>({x:p.x-12,y:p.y-9,width:24,height:21}))];
    for(const person of people){
      const route=findWalkingPath(room.spawn,person,obstacles);assert.ok(route.length>0);let previous=room.spawn;
      for(const point of route){assert.ok(canTravel(previous,point,obstacles));previous=point;}
      assert.ok(Math.hypot(previous.x-person.x,previous.y-person.y)<62);
    }
    for(const {target:f} of layout){const route=findWalkingPath(room.spawn,{x:f.x+f.w/2,y:f.y+f.h/2},obstacles);assert.ok(route.length>0);}
  }
});
const prepared={...starterEquipment,body:'body-champion',motor:'motor-wind',gear:'gear-4',battery:'battery-power',chassis:'chassis-low',tire:'tire-1',shaft:'shaft-1',wheel:'wheel-light',terminal:'terminal-entry',accessory:'accessory-support'};
function runChallenge(seed:number,motorSeconds=60){
  let race=startRace(createRaceState(prepared,seed,{motorSeconds,batterySeconds:0},'villain','wind'));
  while(race.phase==='countdown')race=stepRace(race);race=launchPlayer(race);
  for(let i=0;i<120*180&&race.phase!=='finished';i++)race=stepRace(race);
  return race;
}
test('黒岩はあおぞらのパーツと慣らしで勝てる相手。同じ設定とシードで結果を再現する',()=>{
  for(const id of Object.values(prepared)){
    const part=parts.find(p=>p.id===id)!;
    assert.ok(id==='body-champion'||isStocked(part,modelShops.aozora),`${id}はあおぞらで用意できる`);
  }
  for(const seed of [...Array.from({length:32},(_,i)=>i+1),123,999]){const race=runChallenge(seed);assert.equal(race.phase,'finished');assert.equal(rankRacers(race)[0].id,'player');assert.ok(race.racers.some(r=>r.id===challenger.id));}
  assert.deepEqual(runChallenge(123),runChallenge(123));
  assert.notEqual(rankRacers(runChallenge(123,0))[0].id,'player');
});
test('ひなた模型店は新しいコースと上位のギア・ターミナル・電池で走行できる',()=>{
  const equipment={...prepared,gear:'gear-3.5',terminal:'terminal-1',battery:'battery-endurance'};
  let race=startRace(createRaceState(equipment,123,{motorSeconds:60,batterySeconds:0},false,'sun'));
  while(race.phase==='countdown')race=stepRace(race);race=launchPlayer(race);
  for(let i=0;i<120*180&&race.phase!=='finished';i++)race=stepRace(race);
  assert.equal(race.phase,'finished');assert.equal(race.racers[0].driving.status,'finished');assert.equal(rankRacers(race)[0].id,'player');
});

test('あおぞら初優勝で挑戦状→店のパーツで黒岩に勝利→ひなた入店まで進める',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...aozoraStart(),inventory:{...useGame.getInitialState().inventory,'body-champion':1}});
    useGame.getState().startTrial();
    useGame.getState().settleRace(useGame.getState().raceAttempt,result());
    useGame.getState().close();
    assert.equal(useGame.getState().overlay,'arrival');useGame.getState().completeArrival();
    assert.equal(useGame.getState().dialogueStage,'villain-intro');assert.match(useGame.getState().dialogue,/挑戦状/);
    useGame.getState().close();
    for(const [slot,id] of Object.entries(prepared)){
      if(!useGame.getState().inventory[id])useGame.getState().buy(id);
      useGame.getState().equip(id,slot as keyof typeof prepared);
    }
    assert.deepEqual(useGame.getState().equipment,prepared);
    useGame.getState().openSetting();
    // 充電池で慣らし、新品の勝負用電池へ戻す。
    useGame.getState().exchangeReusable('battery');
    useGame.getState().breakIn();useGame.getState().breakIn();
    useGame.getState().buy('battery-power');useGame.getState().close();
    const state=useGame.getState();
    const motor=state.units[state.equipment.motor].find(u=>u.id===state.selectedUnits.motor)!;
    const battery=state.units[state.equipment.battery].find(u=>u.id===state.selectedUnits.battery)!;
    assert.equal(motor.seconds,60);assert.equal(battery.seconds,0);
    useGame.getState().openVillainChallenge();useGame.getState().startVillainChallenge();
    let race=startRace(createRaceState(state.equipment,123,{motorSeconds:motor.seconds,batterySeconds:battery.seconds},'villain','wind'));
    while(race.phase==='countdown')race=stepRace(race);race=launchPlayer(race);
    for(let i=0;i<120*180&&race.phase!=='finished';i++)race=stepRace(race);
    assert.equal(race.phase,'finished');assert.equal(rankRacers(race)[0].id,'player');
    useGame.getState().settleRace(useGame.getState().raceAttempt,race);
    useGame.getState().close();assert.equal(useGame.getState().dialogueStage,'villain-win');
    useGame.getState().close();useGame.getState().leaveShop();useGame.getState().enterShop('hinata');
    assert.equal(useGame.getState().location,'hinata');
    const saved=decodeSave({version:1,savedAt:123,game:snapshotGame(useGame.getState())});
    assert.equal(saved.game.villainDefeated,true);assert.equal(saved.game.location,'hinata');
  }finally{useGame.setState(original);}
});

test('セイランは初優勝だけでは配布せず、あおぞら・黒岩戦・ひなたでも増えない',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState()});
    useGame.getState().startTrial();useGame.getState().settleRace(useGame.getState().raceAttempt,{...result(),circuitId:'leaf'});
    assert.equal(useGame.getState().inventory['body-champion'],undefined);
    for(const location of ['aozora','hinata'] as const)for(const challenge of [false,true]){
      useGame.setState({...aozoraStart(),location,aozoraWon:true,inventory:{...useGame.getInitialState().inventory,'body-champion':1}});
      if(challenge&&location==='aozora')useGame.getState().startVillainChallenge();else useGame.getState().startTrial();
      useGame.getState().settleRace(useGame.getState().raceAttempt,result(challenge));
      assert.equal(useGame.getState().inventory['body-champion'],1);
    }
  }finally{useGame.setState(original);}
});
