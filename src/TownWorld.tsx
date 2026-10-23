import { useEffect,useRef } from 'react';
import Phaser from 'phaser';
import { TownScene } from './game/TownScene';
import { shopRenderOptions } from './data/display';
import type { ShopId } from './data/town';

export function TownWorld({from,onEnter}:{from:ShopId;onEnter:(id:ShopId)=>void}){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current!,backgroundColor:'#cee4ca',...shopRenderOptions,scene:[new TownScene(from,onEnter)],scale:{mode:Phaser.Scale.RESIZE,width:'100%',height:'100%'},audio:{noAudio:true}});
    return()=>game.destroy(true);
  },[from,onEnter]);
  return <div className="world" ref={host} role="img" aria-label="緑川町。こもれび模型店とあおぞら模型店。方向キー・WASD・クリック、スマホはスワイプで移動。店の入口まで歩くと入店します。"/>;
}
