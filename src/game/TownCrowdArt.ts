import type Phaser from 'phaser';
import {townCrowd} from '../data/townCrowd';
import {personSpriteSize,type Facing} from './PeopleArt';
import {npcDrawing} from './NpcPeopleArt';
import {createPersonTexture} from './PersonTexture';
import {pixelPen} from './pixelDrawing';

/** Townspeople share the same detailed originals and scale as the player. */
export function drawTownCrowd(scene:Phaser.Scene){
 const actors=townCrowd.map((p,index)=>{
  const key=(facing:Facing)=>{
   const key=`town-crowd-${p.appearance}-${facing}-${p.accessory}`;
   if(!scene.textures.exists(key)){
    const pen=pixelPen();
    if(p.accessory==='bag'&&facing!=='up'){
     pen.rect(43,45,1,12,'#e2c29a');pen.rect(40,55,9,13,'#3e4d50');pen.rect(41,56,7,10,'#b3956c');pen.rect(42,57,5,1,'#e5c895');pen.rect(43,60,3,4,'#947b5c');
    }else if(p.accessory==='car'&&facing!=='up'){
     pen.rect(19,48,23,7,'#293d4d');pen.rect(22,46,17,8,'#d8d5b0');pen.rect(26,47,9,4,'#547e8b');pen.rect(20,52,5,3,'#202f3d');pen.rect(36,52,5,3,'#202f3d');pen.rect(22,50,3,1,'#eab978');pen.rect(37,50,2,1,'#eab978');
    }
    createPersonTexture(scene,key,[...npcDrawing(p.appearance,facing),...pen.shapes]);
   }
   return key;
  };
  const shadow=scene.add.graphics().fillStyle(0x344d48,.10).fillEllipse(1,9,35,11).fillStyle(0x263f40,.20).fillEllipse(0,8,23,6);
  const sprite=scene.add.image(0,12,key(p.facing)).setOrigin(.5,1).setDisplaySize(personSpriteSize.displayWidth,personSpriteSize.displayHeight);
  const root=scene.add.container(p.x,p.y,[shadow,sprite]).setDepth(p.y);
  return {p,index,sprite,root,key};
 });
 let last=-1;
 return (time:number)=>{
  const beat=Math.floor(time/400);if(beat===last)return;last=beat;
  const view=scene.cameras.main.worldView;
  for(const {p,index,sprite,root,key} of actors){
   const visible=p.x>view.left-70&&p.x<view.right+70&&p.y>view.top-20&&p.y<view.bottom+80;root.setVisible(visible);if(!visible)continue;
   // Occasional glances and a quiet breathing pose, without moving feet into a path.
   const glance=p.activity!=='watch'&&(beat+index*7)%29<3;
   sprite.setTexture(key(glance?(p.facing==='left'?'down':p.facing==='right'?'up':'left'):p.facing));
   sprite.setY(12+((beat+index*3)%13===0?-.5:0));
  }
 };
}
