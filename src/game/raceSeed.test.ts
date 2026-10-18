import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useGame } from './store';
import { nextRaceSeed } from './raceSeed';
import { raceCamera } from '../data/raceCamera';

test('参加・再レースで新しいシードを発行して試行に保持する',()=>{
  const original=useGame.getState();
  try{
    useGame.getState().startTrial();const first=useGame.getState().raceSeed;
    useGame.getState().startTrial();assert.notEqual(useGame.getState().raceSeed,first);
    assert.notEqual(nextRaceSeed(0),0);
  }finally{useGame.setState(original);}
});
test('追跡カメラは旧画角の約2倍に拡大し、縦画面でもマシンを大きく映す',()=>{
  for(const aspect of [.5,1,2]){
    const oldHeight=Math.max(1.9,1.9/aspect);
    const height=Math.max(raceCamera.running.height,raceCamera.running.minWidth/aspect);
    assert.ok(height<oldHeight*.6);
  }
});
