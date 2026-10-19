import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hintBooks,nextShopRace } from '../data/shopHints';
import { useGame } from './store';
import { createRaceState } from './race';
import { starterEquipment } from '../data/machine';
import { shopAdvice } from './shopAdvice';

test('本棚は全6冊を順番に読み、閉じて次の本へ進む',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({hintBookIndex:0});
    for(const book of hintBooks){
      useGame.getState().readHintBook();assert.match(useGame.getState().speaker,new RegExp(book.title));
      assert.ok(useGame.getState().dialogue.includes(book.text));useGame.getState().advance();
      assert.equal(useGame.getState().overlay,null);
    }
    assert.equal(useGame.getState().hintBookIndex,0);
  }finally{useGame.setState(original);}
});
test('公式初優勝だけで次の参加資格を獲得。敗北・途中・リタイアでは解放せず再優勝で重複しない',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({unlockedRaces:[],money:1000});
    const race=createRaceState(starterEquipment);
    const win={...race,phase:'finished' as const,playerStartOffset:0,racers:race.racers.map((r,i)=>({...r,driving:{...r.driving,status:'finished' as const,time:40+i}}))};
    for(const result of [{...win,phase:'running' as const},{...win,falseStartPenalty:5},{...win,racers:win.racers.map(r=>r.id==='player'?{...r,driving:{...r.driving,status:'out' as const}}:r)}]){
      useGame.getState().startTrial();useGame.getState().settleRace(useGame.getState().raceAttempt,result);
      assert.deepEqual(useGame.getState().unlockedRaces,[]);
    }
    useGame.getState().startTrial();let attempt=useGame.getState().raceAttempt;
    useGame.getState().settleRace(attempt,win);useGame.getState().settleRace(attempt,win);
    assert.deepEqual(useGame.getState().unlockedRaces,[nextShopRace.id]);assert.equal(useGame.getState().qualificationNotice,true);
    assert.equal(useGame.getState().inventory['body-champion'],1);
    useGame.getState().startTrial();attempt=useGame.getState().raceAttempt;
    assert.equal(useGame.getState().qualificationNotice,false);
    useGame.getState().settleRace(attempt-1,win);assert.equal(useGame.getState().qualificationNotice,false);
    useGame.getState().settleRace(attempt,win);assert.deepEqual(useGame.getState().unlockedRaces,[nextShopRace.id]);assert.equal(useGame.getState().qualificationNotice,false);
    assert.equal(useGame.getState().inventory['body-champion'],1);
  }finally{useGame.setState(original);}
});
test('案内役は財布・購入済み・装備・慣らし・資格に応じてヒントを変える',()=>{
  const base={money:0,inventory:{},equipment:{...starterEquipment},motorSeconds:0,qualified:false};
  assert.match(shopAdvice('mechanic',base),/完走賞/);
  assert.match(shopAdvice('mechanic',{...base,inventory:{'gear-4':1}}),/自動では付かない/);
  assert.match(shopAdvice('mechanic',{...base,equipment:{...starterEquipment,gear:'gear-4'}}),/慣らし/);
  assert.match(shopAdvice('guide',{...base,qualified:true}),/獲得おめでとう/);
});
