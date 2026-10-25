import test from 'node:test';import assert from 'node:assert/strict';
import {raceIntroDuration,raceIntroAt,stepRaceIntro,courseIntroduction} from './raceIntro';
import {getCircuitTrack,type CircuitId} from '../data/circuit';
test('全景→周回紹介→グリッド→20秒で待機。背景では紹介を進めず、スキップは終了状態へ',()=>{
 assert.equal(raceIntroAt(0).stage,'overview');assert.equal(raceIntroAt(4).stage,'tour');assert.equal(raceIntroAt(15).stage,'grid');assert.equal(raceIntroAt(10).stage,'tour');assert.deepEqual(raceIntroAt(raceIntroDuration),{age:20,stage:'done'});
 let intro=raceIntroAt(0);for(let i=0;i<200;i++)intro=stepRaceIntro(intro,.1);assert.ok(intro.age>19.99);intro=stepRaceIntro(intro,.1);assert.equal(intro.stage,'done');
 assert.equal(stepRaceIntro(raceIntroAt(1),2).age,3);
 const paused=raceIntroAt(3);assert.equal(stepRaceIntro(paused,20,false),paused);assert.equal(stepRaceIntro(paused,-5).age,3);assert.equal(stepRaceIntro(paused,NaN).age,3);assert.equal(raceIntroAt(999).age,20);
});
test('各店と公式杯の紹介は実コースの周回数・距離・路面を表示し、舗装と悪路を案内',()=>{
 for(const id of ['leaf','wind','sun','sprint','grove','comet'] as CircuitId[]){const info=courseIntroduction(id),track=getCircuitTrack(id);assert.equal(info.lanes,5);assert.equal(info.laps,track.circuit.laps);assert.equal(info.distance,Math.round(track.circuitLength*track.circuit.laps));assert.equal(info.surface,track.circuit.surface.name);assert.ok(info.feature.length>10);}
 assert.match(courseIntroduction('sun').advice,/ダンパー/);assert.match(courseIntroduction('sprint').advice,/高速ギア/);
});
