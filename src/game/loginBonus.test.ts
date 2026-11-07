import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {snapshotGame,decodeSave} from './saveData';
const sixHours=6*60*60*1000;
test('新規・6時間未満はなし、6時間以上の再ログインで500円を一度だけ加算',()=>{
 const original=useGame.getState();
 try{
  useGame.setState(useGame.getInitialState());const money=useGame.getState().money;
  useGame.getState().recordLogin(1000);assert.equal(useGame.getState().money,money);
  useGame.getState().recordLogin(1000+sixHours-1);assert.equal(useGame.getState().money,money);
  const now=1000+2*sixHours-1;useGame.getState().recordLogin(now);assert.equal(useGame.getState().money,money+500);assert.equal(useGame.getState().loginBonusReceived,true);
  const saved=decodeSave({version:1,savedAt:now,game:snapshotGame(useGame.getState())});
  useGame.setState({...useGame.getInitialState(),...saved.game});useGame.getState().recordLogin(now+1);assert.equal(useGame.getState().money,money+500);
  useGame.getState().recordLogin(now+1+sixHours*3);assert.equal(useGame.getState().money,money+1000);
  useGame.getState().recordLogin(now);assert.equal(useGame.getState().money,money+1000);
 }finally{useGame.setState(original);}
});
test('旧セーブは保存時刻を最終ログインとして引き継ぐ',()=>{
 const game=structuredClone(snapshotGame(useGame.getInitialState())) as Record<string,unknown>;delete game.lastLoginAt;
 assert.equal(decodeSave({version:1,savedAt:1234,game}).game.lastLoginAt,1234);
});
