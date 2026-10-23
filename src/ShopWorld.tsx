import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ShopScene } from './game/ShopScene';
import { shopRenderOptions } from './data/display';
import { useGame } from './game/store';
import { currentShop } from './data/world';
export function ShopWorld(){
  const host=useRef<HTMLDivElement>(null);
  const location=useGame(s=>s.location);
  useEffect(()=>{
    const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current!,backgroundColor:'#172b31',...shopRenderOptions,scene:[ShopScene],scale:{mode:Phaser.Scale.RESIZE,width:'100%',height:'100%'},input:{keyboard:true},audio:{noAudio:true}});
    return ()=>game.destroy(true);
  },[location]);
  return <div className="world" ref={host} role="img" aria-label={`${location==='town'?'緑川町':currentShop(location).name}。スマホは指を滑らせて移動、人物・入口・設備をタップで調査、床をダブルタップでセッティング。PCは方向キー・WASD・クリックで移動、Z・Enterで調査。`}/>;
}
