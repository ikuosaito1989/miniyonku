import { test } from 'node:test';
import assert from 'node:assert/strict';
import { starterEquipment } from '../data/machine';
import { circuit, circuitLength, laneChange, laneOffset, sampleLanePath } from '../data/circuit';
import { createDrivingState, machinePerformance, startDriving, stepDriving } from './driving';
import { COUNTDOWN_TICKS, countdownNumber, createRaceState, launchPlayer, officialTime, rankRacers, startRace, stepRace } from './race';

function run(seed=0x5eed){
  let race=startRace(createRaceState(starterEquipment,seed));
  for(let i=0;i<120*120&&race.phase!=='finished';i++){
    race=stepRace(race);
    if(race.phase==='running'&&race.playerStartOffset===null)race=launchPlayer(race);
  }
  return race;
}
test('5レーンにプレイヤーとCPU4台を重複なく配置し、操作前は進まない',()=>{
  const race=createRaceState(starterEquipment);
  assert.equal(circuit.lanes,5);assert.equal(race.racers.length,5);
  assert.equal(new Set(race.racers.map(r=>r.lane)).size,5);
  assert.equal(race.racers.find(r=>r.id==='player')?.lane,2);
  assert.equal(stepRace(race),race);
});
test('3→2→1を各1秒表示し、3秒が経つまで全車の時計・距離・速度を止める',()=>{
  let race=startRace(createRaceState(starterEquipment));
  assert.equal(countdownNumber(race),3);assert.equal(startRace(race),race);
  for(let tick=1;tick<COUNTDOWN_TICKS;tick++){
    race=stepRace(race);
    assert.equal(race.phase,'countdown');
    assert.equal(countdownNumber(race),Math.ceil((COUNTDOWN_TICKS-tick)/120));
    assert.equal(race.time,0);
    for(const r of race.racers){assert.equal(r.driving.time,0);assert.equal(r.driving.distance,0);assert.equal(r.driving.speed,0);}
  }
  race=stepRace(race);assert.equal(race.phase,'running');assert.equal(race.time,0);
  race=stepRace(race);
  for(const r of race.racers)assert.equal(r.driving.distance>0,r.id!=='player');
  race=stepRace(launchPlayer(race));for(const r of race.racers)assert.ok(r.driving.distance>0);
});
test('CPUも5周走行してゴールし、全車のタイム順に最終順位が確定する',()=>{
  const race=run();assert.equal(race.phase,'finished');
  assert.ok(race.racers.every(r=>r.driving.status==='finished'));
  const ranked=rankRacers(race);
  for(let i=1;i<ranked.length;i++)assert.ok(ranked[i-1].driving.time<=ranked[i].driving.time);
  assert.equal(stepRace(race),race);assert.equal(startRace(race),race);
  assert.ok(new Set(ranked.map(r=>r.driving.time)).size>1);
});
test('同じ装備・シードのレース結果は再現可能。再レースは全車を待機へ戻す',()=>{
  assert.deepEqual(run(12345),run(12345));
  assert.notDeepEqual(run(12345).racers.map(r=>r.driving),run(54321).racers.map(r=>r.driving));
  const reset=createRaceState(starterEquipment);assert.equal(reset.phase,'ready');assert.equal(reset.time,0);
  for(const r of reset.racers){assert.equal(r.driving.status,'ready');assert.equal(r.driving.distance,0);}
});
test('同じ装備でも外側レーンは内側より長い距離を走る',()=>{
  const performance=machinePerformance(starterEquipment);
  let inner=startDriving(createDrivingState()),outer=startDriving(createDrivingState());
  for(let i=0;i<1000;i++){inner=stepDriving(inner,performance,laneOffset(0));outer=stepDriving(outer,performance,laneOffset(4));}
  assert.ok(inner.distance>outer.distance);assert.equal(inner.speed,outer.speed);
});
test('コースアウト車は走行中の車より下位になる',()=>{
  const race=createRaceState(starterEquipment);
  race.racers[0].driving={...race.racers[0].driving,status:'out',distance:100};
  assert.equal(rankRacers(race).at(-1)?.id,'player');
});
test('毎周レーンを変え、5周で全レーンを1回ずつ通る',()=>{
  assert.equal(circuit.laps,circuit.lanes);
  for(let initial=0;initial<5;initial++){
    const visited=new Set<number>();
    for(let lap=0;lap<5;lap++){
      const before=sampleLanePath(lap*circuitLength+laneChange.start-0.1,initial);
      const after=sampleLanePath(lap*circuitLength+laneChange.end+0.1,initial);
      visited.add(before.lane);assert.equal(after.lane,(before.lane+1)%5);
    }
    assert.equal(visited.size,5);
  }
});
test('レーン間の移動と周回境界は連続し、最外→最内は立体交差する',()=>{
  const mid=(laneChange.start+laneChange.end)/2;
  assert.ok(sampleLanePath(mid,4).y>0.2);
  for(let lane=0;lane<4;lane++)assert.equal(sampleLanePath(mid,lane).y,0);
  for(let initial=0;initial<5;initial++)for(const d of [laneChange.start,laneChange.end,circuitLength]){
    const a=sampleLanePath(d-0.0001,initial),b=sampleLanePath(d+0.0001,initial);
    assert.ok(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)<0.001);
  }
});
test('5周の実走行距離は、スタートレーンによらず等しくなる',()=>{
  const totals=[];
  for(let initial=0;initial<5;initial++){
    let length=0;
    const steps=5000,delta=circuitLength*5/steps;
    for(let i=0;i<steps;i++)length+=sampleLanePath((i+0.5)*delta,initial).pathScale*delta;
    totals.push(length);
  }
  assert.ok(Math.max(...totals)-Math.min(...totals)<0.002);
});
test('同じ性能なら全レーンのゴールタイム差は固定刻み1ステップ未満になる',()=>{
  let race=createRaceState(starterEquipment);
  race={...race,racers:race.racers.map(r=>({...r,performance:machinePerformance(starterEquipment)}))};
  race=startRace(race);
  for(let tick=0;tick<14400&&race.phase!=='finished';tick++){
    race=stepRace(race);
    if(race.phase==='running'&&race.playerStartOffset===null)race=launchPlayer(race);
  }
  assert.equal(race.phase,'finished');
  assert.ok(race.racers.every(r=>r.driving.status==='finished'));
  const times=race.racers.map(r=>r.driving.time);
  assert.ok(Math.max(...times)-Math.min(...times)<1/120);
});
test('GO後も自分は操作まで停止し、遅れた発進時間を記録に含める',()=>{
  let race=startRace(createRaceState(starterEquipment));
  for(let i=0;i<COUNTDOWN_TICKS+120;i++)race=stepRace(race);
  const player=race.racers.find(r=>r.id==='player')!;
  assert.equal(player.driving.status,'ready');assert.equal(player.driving.distance,0);
  assert.ok(race.racers.filter(r=>r.id!=='player').every(r=>r.driving.distance>0));
  race=launchPlayer(race);assert.ok(Math.abs(race.playerStartOffset!-1)<1e-10);assert.equal(race.falseStartPenalty,0);
  race=stepRace(race);
  const launched=race.racers.find(r=>r.id==='player')!;
  assert.ok(launched.driving.distance>0);assert.ok(officialTime(race,launched)>1);
});
test('2.25秒早く発進すると2.25秒加算し、CPUはGOまで止める',()=>{
  let race=startRace(createRaceState(starterEquipment));
  for(let i=0;i<90;i++)race=stepRace(race);
  race=launchPlayer(race);
  assert.equal(race.falseStartPenalty,2.25);assert.equal(race.playerStartOffset,-2.25);
  assert.equal(launchPlayer(race),race);
  for(let i=0;i<30;i++)race=stepRace(race);
  const player=race.racers.find(r=>r.id==='player')!;
  assert.ok(player.driving.distance>0);
  for(const cpu of race.racers.filter(r=>r.id!=='player'))assert.equal(cpu.driving.distance,0);
  assert.equal(officialTime(race,player),player.driving.time+2.25);
  while(race.phase==='countdown')race=stepRace(race);
  assert.equal(race.falseStartPenalty,2.25);assert.equal(race.time,0);
});
test('フライング加算を最終順位に反映し、再レースで加算を消す',()=>{
  let race=launchPlayer(startRace(createRaceState(starterEquipment)));
  race={...race,phase:'finished',falseStartPenalty:2,racers:race.racers.map(r=>({...r,driving:{...r.driving,status:'finished',time:r.id==='player'?9:10}}))};
  assert.equal(rankRacers(race).at(-1)?.id,'player');
  assert.equal(officialTime(race,race.racers[0]),11);
  assert.equal(launchPlayer(race),race);
  const reset=createRaceState(starterEquipment);assert.equal(reset.falseStartPenalty,0);assert.equal(reset.playerStartOffset,null);
});
