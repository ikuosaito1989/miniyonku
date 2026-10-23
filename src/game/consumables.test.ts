import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parts } from '../data/parts';
import { useGame } from './store';
import { decodeSave, snapshotGame } from './saveData';
function check(){
  const s=useGame.getState();
  for(const category of ['motor','battery'] as const){
    for(const part of parts.filter(p=>p.category===category)){assert.ok((s.inventory[part.id]??0)<=1);assert.equal(s.units[part.id]?.length??0,s.inventory[part.id]??0);}
    assert.equal(s.units[s.equipment[category]][0].id,s.selectedUnits[category]);
  }
}
test('初期所持・異種購入・同種再購入・無料救済交換・保存復元でもモーター・電池とも各種類1個',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),money:10000});check();
    useGame.getState().buy('motor-torque');check();
    assert.equal(useGame.getState().equipment.motor,'motor-torque');
    assert.equal(useGame.getState().inventory['motor-stock'],1);
    useGame.getState().buy('motor-torque');check();
    useGame.getState().buy('battery-entry');check();
    useGame.getState().exchangeReusable('motor');check();
    useGame.getState().exchangeReusable('battery');check();
    const game=snapshotGame(useGame.getState());
    assert.deepEqual(decodeSave({version:1,savedAt:123,game}).game,game);
  }finally{useGame.setState(original);}
});
test('旧複数所持セーブは装着中の個体・消耗・財布を保持して種類ごと1個へ移行する',()=>{
  const game=snapshotGame(useGame.getInitialState());
  game.inventory['motor-stock']=2;
  game.units['motor-stock'].push({id:'old-spare',seconds:90});
  game.selectedUnits.motor='old-spare';
  game.inventory['motor-torque']=1;game.units['motor-torque']=[{id:'old-torque',seconds:30}];
  game.inventory['battery-recharge']=1;game.units['battery-recharge']=[{id:'old-charge',seconds:0}];
  const restored=decodeSave({version:1,savedAt:123,game}).game;
  assert.equal(restored.inventory['motor-stock'],1);
  assert.deepEqual(restored.units['motor-stock'],[{id:'old-spare',seconds:90}]);
  assert.equal(restored.inventory['motor-torque'],1);
  assert.equal(restored.units['motor-torque'][0].seconds,30);
  assert.equal(restored.inventory['battery-recharge'],1);
  assert.equal(restored.money,game.money);
  assert.deepEqual(restored.equipment,game.equipment);
});
test('資金不足やレース中の購入で所持パーツを失わない',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),money:0});
    const before=snapshotGame(useGame.getState());
    useGame.getState().buy('motor-torque');assert.deepEqual(snapshotGame(useGame.getState()),before);
    useGame.setState({money:10000});useGame.getState().startTrial();
    const racing=snapshotGame(useGame.getState());
    useGame.getState().buy('battery-entry');useGame.getState().exchangeReusable('motor');
    assert.deepEqual(snapshotGame(useGame.getState()),racing);
  }finally{useGame.setState(original);}
});

test('異種モーターの慣らしを保持して付け替え、再購入は同じ種類だけを新品にする',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),money:10000});
    useGame.getState().openSetting();useGame.getState().breakIn();
    useGame.getState().buy('motor-torque');
    useGame.getState().openSetting();useGame.getState().breakIn();useGame.getState().breakIn();
    useGame.getState().equip('motor-stock','motor');
    let state=useGame.getState();
    assert.equal(state.units['motor-stock'][0].seconds,30);
    assert.equal(state.units['motor-torque'][0].seconds,60);
    assert.equal(state.selectedUnits.motor,state.units['motor-stock'][0].id);
    state.buy('motor-stock');state=useGame.getState();
    assert.equal(state.units['motor-stock'][0].seconds,0);
    assert.equal(state.units['motor-torque'][0].seconds,60);
    state.equip('motor-torque','motor');
    const game=snapshotGame(useGame.getState());
    assert.deepEqual(decodeSave({version:1,savedAt:123,game}).game,game);
  }finally{useGame.setState(original);}
});
test('前中後に混在するローラー設定を1セット所持で保存・復元する',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),inventory:{...useGame.getInitialState().inventory,'roller-1':1}});
    useGame.getState().equip('roller-1','rollerFront');
    useGame.getState().equip('roller-1','rollerRear');
    const game=snapshotGame(useGame.getState());
    assert.equal(game.equipment.rollerFront,'roller-1');
    assert.equal(game.equipment.rollerSide,'roller-0');
    assert.equal(game.equipment.rollerRear,'roller-1');
    assert.deepEqual(decodeSave({version:1,savedAt:123,game}).game,game);
  }finally{useGame.setState(original);}
});

test('異種電池の残量を保持して付け替え、同種再購入だけ新品にする',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),money:10000});
    useGame.getState().openSetting();useGame.getState().breakIn();
    useGame.getState().buy('battery-entry');check();
    useGame.getState().openSetting();useGame.getState().breakIn();useGame.getState().breakIn();
    useGame.getState().equip('battery-basic','battery');
    let state=useGame.getState();
    assert.equal(state.units['battery-basic'][0].seconds,30);
    assert.equal(state.units['battery-entry'][0].seconds,60);
    assert.equal(state.selectedUnits.battery,state.units['battery-basic'][0].id);
    state.buy('battery-basic');state=useGame.getState();check();
    assert.equal(state.units['battery-basic'][0].seconds,0);
    assert.equal(state.units['battery-entry'][0].seconds,60);
    state.exchangeReusable('battery');check();
    state=useGame.getState();
    assert.equal(state.inventory['battery-basic'],1);assert.equal(state.inventory['battery-entry'],1);
    state.equip('battery-entry','battery');check();
    const game=snapshotGame(useGame.getState());
    assert.deepEqual(decodeSave({version:1,savedAt:123,game}).game,game);
  }finally{useGame.setState(original);}
});
test('旧セーブの電池重複は各種類1個へ整理し、装着中の個体と別種類を保持する',()=>{
  const game=snapshotGame(useGame.getInitialState());
  game.inventory['battery-basic']=2;
  game.units['battery-basic'].push({id:'selected-battery',seconds:120});
  game.selectedUnits.battery='selected-battery';
  game.inventory['battery-entry']=2;
  game.units['battery-entry']=[{id:'spare-entry',seconds:45},{id:'duplicate-entry',seconds:0}];
  const restored=decodeSave({version:1,savedAt:123,game}).game;
  assert.deepEqual(restored.units['battery-basic'],[{id:'selected-battery',seconds:120}]);
  assert.deepEqual(restored.units['battery-entry'],[{id:'spare-entry',seconds:45}]);
  assert.equal(restored.inventory['battery-basic'],1);assert.equal(restored.inventory['battery-entry'],1);
});
