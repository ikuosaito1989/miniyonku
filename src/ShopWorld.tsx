import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ShopScene } from './game/ShopScene';
export function ShopWorld(){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current!,backgroundColor:'#172b31',pixelArt:true,roundPixels:true,scene:[ShopScene],scale:{mode:Phaser.Scale.RESIZE,width:'100%',height:'100%'},input:{keyboard:true},audio:{noAudio:true}});
    return ()=>game.destroy(true);
  },[]);
  return <div className="world" ref={host} role="img" aria-label="こもれび模型店。方向キーまたはWASDで移動し、ZまたはEnterで近くの対象を調べる。"/>;
}
