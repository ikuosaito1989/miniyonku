import { test } from 'node:test';
import assert from 'node:assert/strict';
import { townShops,townObstacles,townDoor,townReturnPosition,shopAtEntrance } from '../data/town';
import { canStand,canTravel,findWalkingPath } from './navigation';
import { useGame } from './store';
import { nextShopRace } from '../data/shopHints';
import { snapshotGame } from './saveData';

test('各店を出た位置から両方の入口へ歩ける。帰還位置では再入店しない',()=>{
  for(const from of townShops){
    const start=townReturnPosition(from.id);
    assert.equal(shopAtEntrance(start),null);assert.ok(canStand(start,townObstacles));
    for(const to of townShops){
      const route=findWalkingPath(start,townDoor(to.id),townObstacles);
      assert.ok(route.length>0);
      let previous=start;
      for(const point of route){assert.ok(canTravel(previous,point,townObstacles));previous=point;}
      assert.equal(shopAtEntrance(previous),to.id);
    }
  }
  assert.equal(shopAtEntrance({x:480,y:354}),null);
  assert.equal(shopAtEntrance({x:225,y:320}),null);
});
test('優勝前も後も店舗を行き来でき、所持金・装備・消耗・参加資格を維持する',()=>{
  const original=useGame.getState();
  try{
    for(const unlockedRaces of [[],[nextShopRace.id]]){
      useGame.setState({...useGame.getInitialState(),unlockedRaces});
      const before=snapshotGame(useGame.getState());
      for(const id of ['aozora','komorebi','aozora'] as const){
        useGame.getState().enterShop(id);
        assert.equal(useGame.getState().currentShopId,id);
        assert.equal(useGame.getState().overlay,null);
        assert.deepEqual(snapshotGame(useGame.getState()),before);
      }
    }
  }finally{useGame.setState(original);}
});
