import type Phaser from 'phaser';
import type {TownVenue} from '../data/world';
import {getCircuitTrack} from '../data/circuit';
import {isPracticeCourse} from '../data/practiceCourses';
import {drawShopTrack} from './ShopTrackArt';
/** The actual course lies in the town, with no facade or indoor lobby. */
export function drawOutdoorCourse(scene:Phaser.Scene,v:TownVenue){
 if(!isPracticeCourse(v.id))return;
 const g=scene.add.graphics().setDepth(v.y+v.h);
 g.fillStyle(0x263c34,.25).fillRoundedRect(v.x+3,v.y+4,v.w,v.h,6);
 drawShopTrack(scene,{...v,kind:'track',label:'',text:''},getCircuitTrack(v.id),v.y+v.h+1);
 g.fillStyle(0x253f4d).fillRoundedRect(v.x+v.w-38,v.y+v.h+8,44,20,2);
 for(let rank=0;rank<3;rank++){g.fillStyle([0xe1bd69,0xb9cbd1,0xc69369][rank]).fillRect(v.x+v.w-34,v.y+v.h+11+rank*5,4,3);g.fillStyle(0x92b3a7).fillRect(v.x+v.w-27,v.y+v.h+11+rank*5,26-rank*5,2);}
 for(const x of [v.x+3,v.x+v.w-5]){
  g.fillStyle(0x9baea6).fillRect(x,v.y-13,2,17);
  g.fillStyle(0xe8d3a0).fillTriangle(x+2,v.y-13,x+15,v.y-9,x+2,v.y-3);
 }
}
