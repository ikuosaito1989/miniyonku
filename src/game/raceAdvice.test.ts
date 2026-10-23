import { test } from 'node:test';
import assert from 'node:assert/strict';
import { raceAdvice, reviewRace } from './raceAdvice';
import { starterEquipment, createStarterInventory } from '../data/machine';
import { createRaceState } from './race';
import { shopCast } from '../data/shopCast';
import { modelShops, type ShopId } from '../data/world';
import { decodeSave, snapshotGame } from './saveData';
import { useGame } from './store';
test('各店にレース相談の整備役がいて、その店で買える具体的な改善を案内する',()=>{
  for(const shopId of Object.keys(modelShops) as ShopId[]){
    assert.ok(shopCast(shopId).visitors.some(v=>v.kind==='mechanic'&&v.name==='佐伯 匠'));
    const text=raceAdvice({shopId,equipment:starterEquipment,inventory:createStarterInventory(),money:0,motorSeconds:0,batterySeconds:0,review:null});
    assert.match(text,/あと約60秒ならそう/);assert.match(text,/円/);assert.match(text,/完走賞で貯めよう/);assert.match(text,new RegExp(modelShops[shopId].name));
  }
});
test('電池切れ・フライング・発進遅れ・慣らし不足を実際のレースから記録し、保存できる',()=>{
  const race=createRaceState(starterEquipment,123,{motorSeconds:10,batterySeconds:350});
  race.phase='finished';race.falseStartPenalty=.5;race.playerStartOffset=.8;
  race.racers[0].driving={time:10,distance:20,speed:0,stress:0,status:'out',stopReason:'battery'};
  const review=reviewRace(race)!;
  assert.match(review.text,/電池切れ/);assert.match(review.text,/0.50秒/);assert.match(review.text,/0.80秒/);assert.match(review.text,/慣らしが足りなかった/);
  const game={...snapshotGame(useGame.getInitialState()),lastRaceReview:review};
  assert.deepEqual(decodeSave({version:1,savedAt:123,game}).game.lastRaceReview,review);
});
test('コースアウト・周回遅れを区別し、無料救済モーターに慣らしを勧めない',()=>{
  const race=createRaceState(starterEquipment);race.phase='finished';race.racers[0].driving.status='out';
  assert.match(reviewRace(race)!.text,/コースアウト/);
  race.racers[0].driving.stopReason='lapped';assert.match(reviewRace(race)!.text,/周回遅れ/);
  const text=raceAdvice({shopId:'komorebi',equipment:{...starterEquipment,motor:'motor-rescue'},inventory:{},money:2000,motorSeconds:0,batterySeconds:0,review:null});
  assert.doesNotMatch(text,/あと約60秒ならそう/);
});
