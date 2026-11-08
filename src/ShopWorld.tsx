import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ShopScene } from './game/ShopScene';
import { shopRenderOptions, shopRenderScale } from './data/display';
import { useGame } from './game/store';
import { currentShop } from './data/world';
export function ShopWorld(){
  const host=useRef<HTMLDivElement>(null);
  const location=useGame(s=>s.location);
  useEffect(()=>{
    let game:Phaser.Game|null=null,observer:ResizeObserver|null=null,resizeHandler:(()=>void)|null=null;
    let secondFrame=0;
    const firstFrame=requestAnimationFrame(()=>{
      secondFrame=requestAnimationFrame(()=>{
        const element=host.current;if(!element)return;
        const bounds=element.getBoundingClientRect(),density=shopRenderScale(bounds.width,bounds.height,devicePixelRatio);
        game=new Phaser.Game({type:Phaser.AUTO,parent:element,backgroundColor:'#172b31',...shopRenderOptions,scene:[ShopScene],scale:{mode:Phaser.Scale.NONE,width:Math.max(1,Math.round(bounds.width*density)),height:Math.max(1,Math.round(bounds.height*density)),zoom:1/density,autoRound:false},input:{keyboard:true},audio:{noAudio:true}});
        const resize=()=>{
          if(!game?.isBooted)return;
          const {width,height}=element.getBoundingClientRect(),ratio=shopRenderScale(width,height,devicePixelRatio);
          const w=Math.max(1,Math.round(width*ratio)),h=Math.max(1,Math.round(height*ratio));
          if(game.scale.width===w&&game.scale.height===h)return;
          game.scale.setZoom(1/ratio);game.scale.resize(w,h);
        };
        resizeHandler=resize;
        observer=new ResizeObserver(resize);observer.observe(element);
        game.events.once(Phaser.Core.Events.READY,resize);
        window.addEventListener('resize',resize);
      });
    });
    return ()=>{cancelAnimationFrame(firstFrame);cancelAnimationFrame(secondFrame);observer?.disconnect();if(resizeHandler)window.removeEventListener('resize',resizeHandler);game?.destroy(true);};
  },[location]);
  return <div className="world" ref={host} role="img" aria-label={`${location==='library'?'緑川町立図書館':location==='town'?'緑川町':location==='stadium-7'?'天頂決戦・ゼニス・クラウン':location==='stadium-10'?'緑川グランプリ決勝会場':location==='stadium-9'?'星空公式レース会場':location==='stadium-5'?'若葉公式レース会場':currentShop(location).name}。${location==='library'?'指を滑らせて移動、本棚をタップして読む。閲覧台か床のダブルタップで全パーツ図鑑、下の出口から街へ戻れます。':'スマホは指を滑らせて移動、人物・入口・設備をタップで調査、床をダブルタップでセッティング。'}`}/>;
}
