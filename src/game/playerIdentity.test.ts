import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {decodeSave,snapshotGame} from './saveData';
import {createRaceState} from './race';
import {starterEquipment} from '../data/machine';
import {formatPlayTime} from './playTime';
import {story} from '../data/story';

test('名前とプレイ時間は保存・復元され、レースにも選んだ名前が使われる',()=>{
 const previous=useGame.getState();try{
  useGame.setState({...useGame.getInitialState(),playerName:'あおい',playSeconds:3725});
  const saved=decodeSave({version:1,savedAt:10,game:snapshotGame(useGame.getState())}).game;
  assert.equal(saved.playerName,'あおい');assert.equal(saved.playSeconds,3725);assert.equal(formatPlayTime(saved.playSeconds),'1時間 02分');
  assert.equal(createRaceState(starterEquipment,42,undefined,false,'leaf',null,saved.playerName).racers[0].name,'あおい');
  const old:Record<string,unknown>=snapshotGame(useGame.getState());delete old.playerName;delete old.playSeconds;
  const restored=decodeSave({version:1,savedAt:10,game:old}).game;assert.equal(restored.playerName,story.player);assert.equal(restored.playSeconds,0);
 }finally{useGame.setState(previous,true);}
});

test('名前とプレイ時間はチュートリアル練習を開始・終了しても維持される',()=>{
 const previous=useGame.getState();try{
  useGame.setState({...useGame.getInitialState(),playerName:'あおい',playSeconds:3725,tutorialStage:'done'});
  useGame.getState().startTutorial(true);
  assert.equal(useGame.getState().playerName,'あおい');assert.equal(useGame.getState().playSeconds,3725);
  useGame.getState().finishTutorial();
  assert.equal(useGame.getState().playerName,'あおい');assert.equal(useGame.getState().playSeconds,3725);
 }finally{useGame.setState(previous,true);}
});
