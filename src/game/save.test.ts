import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useGame } from './store';
import { decodeSave, snapshotGame, type SaveData } from './saveData';
import { loadSavedGame, startAutoSave, type SaveStatus } from './autoSave';
import type { SaveStorage } from './saveStorage';
import { nextShopRace } from '../data/shopHints';

const initial=()=>structuredClone(snapshotGame(useGame.getInitialState()));
const saved=():SaveData=>({version:1,savedAt:1234,game:initial()});
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));

test('保存形式はバージョン付きで、全進行を独立コピー。UI・レース途中・関数は保存しない',()=>{
  const data=saved();assert.deepEqual(decodeSave(data),data);
  data.game.inventory['gear-4']=1;assert.equal(useGame.getInitialState().inventory['gear-4'],undefined);
  assert.equal('overlay' in data.game,false);assert.equal('raceAttempt' in data.game,false);assert.equal('buy' in data.game,false);
});
test('破損・未来バージョン・未知パーツ・未所持装備・個体不整合を拒否する',()=>{
  const mutations:Array<(data:SaveData)=>void>=[
    d=>{(d as {version:number}).version=2;},d=>{d.game.money=-1;},d=>{d.game.money=NaN;},
    d=>{d.game.inventory.unknown=1;},d=>{d.game.inventory['gear-4']=.5;},
    d=>{d.game.equipment.motor='gear-4';},d=>{d.game.equipment.motor='motor-rev';},
    d=>{d.game.equipment.rollerFront='roller-1';d.game.inventory['roller-1']=1;d.game.equipment.rollerRear='roller-1';},
    d=>{d.game.units['motor-stock']=[];},d=>{d.game.units['motor-stock'][0].seconds=Infinity;},
    d=>{d.game.units['motor-stock'][0].id='starter-battery';},d=>{d.game.selectedUnits.motor='missing';},
    d=>{d.game.units['motor-stock'][0].id='unit-2';d.game.selectedUnits.motor='unit-2';d.game.unitSerial=1;},
    d=>{delete d.game.inventory['battery-recharge'];},d=>{d.game.unlockedRaces=['unknown'];},
    d=>{d.game.hintBookIndex=999;},
  ];
  for(const mutate of mutations){const data=saved();mutate(data);assert.throws(()=>decodeSave(data));}
  for(const value of [null,[],{},'bad'])assert.throws(()=>decodeSave(value));
});
test('購入・装備・個体消耗・熟練度・資格を復元し、レースを再開／再精算せず模型店から始める',async()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),...initial(),money:5000});
    useGame.getState().buy('motor-torque');useGame.getState().equip('motor-torque','motor');
    useGame.getState().openSetting();useGame.getState().equip('battery-recharge','battery');useGame.getState().breakIn();
    useGame.setState({unlockedRaces:[nextShopRace.id],hintBookIndex:3});
    const data:SaveData={version:1,savedAt:5678,game:snapshotGame(useGame.getState())};
    useGame.getState().startTrial();useGame.setState({money:0,lastPrize:300,qualificationNotice:true});
    const storage:SaveStorage={read:async()=>data,write:async()=>{assert.fail('ロード時に書き込まない');}};
    assert.equal(await loadSavedGame(storage),5678);
    assert.deepEqual(snapshotGame(useGame.getState()),data.game);
    assert.equal(useGame.getState().overlay,null);assert.equal(useGame.getState().lastPrize,0);
    assert.equal(useGame.getState().raceAttempt,0);assert.equal(useGame.getState().qualificationNotice,false);
    assert.equal(useGame.getState().units['motor-torque'][0].seconds,30);
  }finally{useGame.setState(original);}
});
test('未保存なら新規開始、ロード失敗では状態も既存データも変更しない',async()=>{
  const before=snapshotGame(useGame.getState());let writes=0;
  const storage:SaveStorage={read:async()=>undefined,write:async()=>{writes++;}};
  assert.equal(await loadSavedGame(storage),null);
  storage.read=async()=>({...saved(),version:99});await assert.rejects(loadSavedGame(storage));
  storage.read=async()=>{throw new Error('blocked');};await assert.rejects(loadSavedGame(storage));
  assert.equal(writes,0);assert.deepEqual(snapshotGame(useGame.getState()),before);
});
test('保存を直列化し、連続変更でも古い保存が新しい状態を上書きしない',async()=>{
  const original=useGame.getState(),writes:number[]=[],releases:Array<()=>void>=[];
  useGame.setState({...useGame.getInitialState(),...initial()});
  const storage:SaveStorage={read:async()=>undefined,write:data=>{writes.push(data.game.money);return new Promise<void>(resolve=>releases.push(resolve));}};
  const session=startAutoSave(storage,()=>{});
  try{
    const pending=session.flush();useGame.setState({money:900});useGame.setState({money:800});
    assert.deepEqual(writes,[1000]);releases[0]();await tick();
    assert.deepEqual(writes,[1000,800]);releases[1]();await pending;
  }finally{session.stop();useGame.setState(original);}
});
test('保存失敗を通知し、再試行で現在の状態を保存できる',async()=>{
  const original=useGame.getState(),statuses:SaveStatus[]=[],writes:SaveData[]=[];let fail=true;
  useGame.setState({...useGame.getInitialState(),...initial()});
  const session=startAutoSave({read:async()=>undefined,write:async data=>{if(fail)throw new Error('容量不足');writes.push(data);}},s=>statuses.push(s));
  try{
    await assert.rejects(session.flush());assert.equal(statuses.at(-1)?.phase,'error');
    fail=false;useGame.setState({money:900});await session.flush();
    assert.equal(writes.at(-1)?.game.money,900);assert.equal(statuses.at(-1)?.phase,'saved');
  }finally{session.stop();useGame.setState(original);}
});
test('UIの変化だけでは保存せず、走行中はチェックポイント、退出時は即時保存する',async()=>{
  const original=useGame.getState(),writes:SaveData[]=[];
  useGame.setState({...useGame.getInitialState(),...initial()});
  const session=startAutoSave({read:async()=>undefined,write:async data=>{writes.push(data);}},()=>{});
  try{
    useGame.setState({nearby:'棚',overlay:'shop'});await tick();assert.equal(writes.length,0);
    useGame.getState().startTrial();
    const units=structuredClone(useGame.getState().units);units['motor-stock'][0].seconds=5;
    useGame.setState({units});assert.equal(writes.length,0);
    await new Promise(resolve=>setTimeout(resolve,1100));assert.equal(writes.at(-1)?.game.units['motor-stock'][0].seconds,5);
    const next=structuredClone(units);next['motor-stock'][0].seconds=6;useGame.setState({units:next});
    useGame.getState().close();await tick();assert.equal(writes.at(-1)?.game.units['motor-stock'][0].seconds,6);
  }finally{session.stop();useGame.setState(original);}
});
