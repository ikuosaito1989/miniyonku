import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createArrival,stepArrivalActor,contactDistance} from './arrival';
import {canStand,canTravel} from './navigation';
import {shopLayout} from '../data/shopLayout';
import {shopCast} from '../data/shopCast';
import {useGame} from './store';
import {nextShopRace} from '../data/shopHints';

test('兄弟2人と黒岩が家具・人物を避けて歩き、接触した位置で止まる',()=>{
  for(const shop of ['komorebi','aozora'] as const){
    const cast=shopCast(shop),obstacles=[...shopLayout(shop).map(({target:f})=>({x:f.x,y:f.y,width:f.w,height:f.h})),...[cast.rival,...cast.visitors].map(p=>({x:p.x-12,y:p.y-9,width:24,height:21}))];
    for(const player of [{x:480,y:550},{x:480,y:578},{x:560,y:500},{x:400,y:250},{x:880,y:550},{x:240,y:250}].filter(p=>canStand(p,obstacles))){
      const actors=createArrival(player,obstacles,shop==='komorebi'?2:1);
      for(let actor of actors){
        const initial=structuredClone(actor);let steps=0;
        while(!actor.arrived&&steps++<3000){
          const before=actor;actor=stepArrivalActor(actor,player,steps%2?16:40);
          assert.ok(canTravel(before.position,actor.position,obstacles));
        }
        assert.ok(actor.arrived,`${shop}: ${JSON.stringify(player)}`);
        assert.ok(actor.distance>40,'接触前に歩く時間がある');
        assert.ok(Math.hypot(actor.position.x-player.x,actor.position.y-player.y)<=contactDistance);
        assert.ok(Math.abs(actor.position.x-player.x)>=23||Math.abs(actor.position.y-player.y)>=24,'会話後に主人公が衝突判定内に閉じ込められない');
        assert.equal(stepArrivalActor(actor,player,40),actor);
        assert.ok(initial.route.length>0);
      }
    }
  }
});
test('登場中は会話が開かず、閉じる・レース開始で飛ばせない。到着通知は一度だけ',()=>{
  const original=useGame.getState();
  try{
    for(const kind of ['legend','villain'] as const){
      useGame.setState({...useGame.getInitialState(),location:kind==='legend'?'komorebi':'aozora',unlockedRaces:[nextShopRace.id],aozoraWon:kind==='villain'});
      useGame.getState().beginArrival(kind);
      assert.equal(useGame.getState().overlay,'arrival');assert.equal(useGame.getState().dialogueStage,'none');
      useGame.getState().close();useGame.getState().leaveShop();useGame.getState().startLegendChallenge();useGame.getState().startVillainChallenge();
      assert.equal(useGame.getState().overlay,'arrival');
      useGame.getState().completeArrival();
      assert.equal(useGame.getState().overlay,'dialogue');assert.equal(useGame.getState().dialogueStage,`${kind}-intro`);
      const state=useGame.getState();useGame.getState().completeArrival();assert.equal(useGame.getState(),state);
    }
  }finally{useGame.setState(original);}
});
