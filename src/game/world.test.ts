import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useGame } from './store';
import { createRaceState, launchPlayer, startRace, stepRace, rankRacers, type RaceState } from './race';
import { starterEquipment } from '../data/machine';
import { nextShopRace } from '../data/shopHints';
import { isVenueOpen, modelShops, townVenues, townSpawn, venueMessage } from '../data/world';
import { getCircuitTrack } from '../data/circuit';
import { isStocked } from '../data/progression';
import { parts } from '../data/parts';
import { snapshotGame, decodeSave } from './saveData';
import { loadSavedGame } from './autoSave';
import { findWalkingPath, canTravel } from './navigation';

function completed(legend=false):RaceState{
  const race=createRaceState(starterEquipment,123,undefined,legend);
  return {...race,phase:'finished',playerStartOffset:0,racers:race.racers.map((r,i)=>({...r,driving:{...r.driving,status:'finished',time:legend&&r.id==='player'?80:40+i}}))};
}

test('初優勝→兄弟レース完走の敗北→街→次の店。途中退出・リタイア・古い通知は解放しない',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),...snapshotGame(useGame.getInitialState())});
    useGame.getState().leaveShop();assert.equal(useGame.getState().location,'komorebi');assert.match(useGame.getState().dialogue,/1位/);
    useGame.getState().close();useGame.getState().startTrial();
    useGame.getState().settleRace(useGame.getState().raceAttempt,completed());
    assert.deepEqual(useGame.getState().unlockedRaces,[nextShopRace.id]);assert.equal(useGame.getState().legendRaceCompleted,false);
    useGame.getState().close();assert.equal(useGame.getState().dialogueStage,'legend-intro');
    useGame.getState().advance();assert.equal(useGame.getState().dialogueStage,'legend-invite');
    useGame.getState().startLegendChallenge();assert.equal(useGame.getState().legendChallengeActive,true);
    useGame.getState().close();useGame.getState().leaveShop();assert.equal(useGame.getState().location,'komorebi');
    assert.equal(useGame.getState().dialogueStage,'legend-intro');
    useGame.getState().startLegendChallenge();
    const out=completed(true);out.racers[0].driving.status='out';
    useGame.getState().settleRace(useGame.getState().raceAttempt,out);assert.equal(useGame.getState().legendRaceCompleted,false);
    useGame.getState().close();useGame.getState().close();useGame.getState().leaveShop();useGame.getState().startLegendChallenge();
    const attempt=useGame.getState().raceAttempt,beforeMoney=useGame.getState().money;
    useGame.getState().settleRace(attempt-1,completed(true));assert.equal(useGame.getState().legendRaceCompleted,false);
    useGame.getState().settleRace(attempt,completed(true));useGame.getState().settleRace(attempt,completed(true));
    assert.equal(useGame.getState().legendRaceCompleted,true);assert.equal(useGame.getState().money,beforeMoney);
    useGame.getState().close();assert.match(useGame.getState().dialogue,/あおぞら/);
    useGame.getState().close();useGame.getState().leaveShop();assert.equal(useGame.getState().location,'town');
    useGame.getState().enterShop('aozora');assert.equal(useGame.getState().location,'aozora');
    useGame.getState().leaveShop();assert.equal(useGame.getState().lastShop,'aozora');
    useGame.getState().enterShop('komorebi');assert.equal(useGame.getState().location,'komorebi');
  }finally{useGame.setState(original);}
});

test('次の店だけの品揃えを購入でき、店を戻れば同じ販売制限へ戻る',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),money:10000});
    for(const id of ['motor-wind','chassis-low','shaft-1','battery-power','accessory-support']){
      const part=parts.find(p=>p.id===id)!;assert.equal(isStocked(part,modelShops.komorebi),false);assert.equal(isStocked(part,modelShops.aozora),true);
    }
    useGame.getState().buy('motor-wind');assert.equal(useGame.getState().money,10000);
    useGame.setState({location:'aozora',lastShop:'aozora'});useGame.getState().buy('motor-wind');
    assert.equal(useGame.getState().inventory['motor-wind'],1);assert.equal(useGame.getState().units['motor-wind'].length,1);
    useGame.getState().equip('motor-wind');assert.equal(useGame.getState().equipment.motor,'motor-wind');
    const before=useGame.getState().money;useGame.setState({location:'komorebi'});useGame.getState().buy('motor-wind');assert.equal(useGame.getState().money,before);
  }finally{useGame.setState(original);}
});

test('旧セーブで兄弟に挑戦済みでも完走済みとは推定せず、再挑戦できる。街と次店の現在地を復元',async()=>{
  const original=useGame.getState();
  try{
    const old:Record<string,unknown>={...snapshotGame(useGame.getInitialState()),unlockedRaces:[nextShopRace.id],legendEventSeen:true};
    delete old.location;delete old.lastShop;delete old.legendRaceCompleted;
    const decoded=decodeSave({version:1,savedAt:123,game:old});assert.equal(decoded.game.location,'komorebi');assert.equal(decoded.game.legendRaceCompleted,false);
    await loadSavedGame({read:async()=>({version:1,savedAt:123,game:old}),write:async()=>{assert.fail('読み込み時に書き込まない');}});
    assert.equal(useGame.getState().legendEventPending,true);
    for(const location of ['town','aozora'] as const){
      const data={version:1 as const,savedAt:234,game:{...decoded.game,location,lastShop:'aozora' as const,legendRaceCompleted:true}};
      await loadSavedGame({read:async()=>data,write:async()=>{}});
      assert.equal(useGame.getState().location,location);assert.equal(useGame.getState().lastShop,'aozora');assert.equal(useGame.getState().overlay,null);
      assert.deepEqual(decodeSave(data),data);
    }
    assert.throws(()=>decodeSave({version:1,savedAt:123,game:{...decoded.game,location:'town'}}));
  }finally{useGame.setState(original);}
});

test('街の7模型店・大会会場4か所は通路からすべて調べられ、未開放店は準備中',()=>{
  assert.equal(townVenues.filter(v=>v.kind==='shop').length,7);
  assert.equal(townVenues.filter(v=>v.kind==='shop'&&!isVenueOpen(v,{legendRaceCompleted:true,villainDefeated:false})).length,5);
  assert.equal(townVenues.filter(v=>v.kind==='shop'&&!isVenueOpen(v,{legendRaceCompleted:true,villainDefeated:true})).length,4);
  assert.deepEqual(townVenues.filter(v=>v.kind==='stadium').map(v=>v.stage),[5,7,9,10]);
  const obstacles=townVenues.map(v=>({x:v.x,y:v.y,width:v.w,height:v.h})),spawn=townSpawn('komorebi');
  for(const venue of townVenues){
    const route=findWalkingPath(spawn,{x:venue.x+venue.w/2,y:venue.y+venue.h/2},obstacles);assert.ok(route.length>0);
    let before=spawn;for(const p of route){assert.ok(canTravel(before,p,obstacles));before=p;}
    assert.ok(Math.hypot(before.x-Math.max(venue.x,Math.min(before.x,venue.x+venue.w)),before.y-Math.max(venue.y,Math.min(before.y,venue.y+venue.h)))<62);
    if(!venue.shopId)assert.match(venueMessage(venue),/準備中/);
  }
});

function runWind(seed=123){
  const equipment={...starterEquipment,body:'body-champion',motor:'motor-wind',gear:'gear-4',battery:'battery-entry',chassis:'chassis-low',tire:'tire-1',shaft:'shaft-1',wheel:'wheel-light',terminal:'terminal-entry'};
  let race=startRace(createRaceState(equipment,seed,{motorSeconds:60,batterySeconds:0},false,'wind'));
  while(race.phase==='countdown')race=stepRace(race);
  race=launchPlayer(race);
  for(let tick=0;tick<120*180&&race.phase!=='finished';tick++)race=stepRace(race);
  return race;
}
test('新コースは長く曲率が異なり、専用CPUと5台で完走・優勝可能。同一シードで再現する',()=>{
  const leaf=getCircuitTrack('leaf'),wind=getCircuitTrack('wind');
  assert.ok(wind.circuitLength>leaf.circuitLength);assert.notEqual(wind.sampleCircuit(5).curvature,leaf.sampleCircuit(5).curvature);
  const result=runWind();assert.equal(result.phase,'finished');assert.ok(result.racers.every(r=>r.driving.status==='finished'));
  assert.equal(rankRacers(result)[0].id,'player');assert.deepEqual(result,runWind());
  assert.ok(result.racers.every(r=>Math.abs(r.driving.distance-wind.circuitLength*5)<1e-6));
});
