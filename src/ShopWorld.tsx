import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ShopScene } from './game/ShopScene';
import { shopRenderOptions } from './data/display';
export function ShopWorld({onExit}:{onExit:()=>void}){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current!,backgroundColor:'#172b31',...shopRenderOptions,scene:[new ShopScene(onExit)],scale:{mode:Phaser.Scale.RESIZE,width:'100%',height:'100%'},input:{keyboard:true},audio:{noAudio:true}});
    return ()=>game.destroy(true);
  },[onExit]);
  return <div className="world" ref={host} role="img" aria-label="こもれび模型店。画面下中央の出口まで歩くと外へ出られます。スマホは指を滑らせて移動、人物・設備をタップで調査、床をダブルタップでセッティング。PCは方向キー・WASD・クリックで移動、Z・Enterで調査。"/>;
}
