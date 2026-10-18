import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ShopScene } from './game/ShopScene';
import { shopRenderOptions } from './data/display';
export function ShopWorld(){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current!,backgroundColor:'#172b31',...shopRenderOptions,scene:[ShopScene],scale:{mode:Phaser.Scale.RESIZE,width:'100%',height:'100%'},input:{keyboard:true},audio:{noAudio:true}});
    return ()=>game.destroy(true);
  },[]);
  return <div className="world" ref={host} role="img" aria-label="こもれび模型店。床をタップ・クリック、または方向キー・WASDで移動。Z・Enterまたは話す・調べるボタンで調査。"/>;
}
