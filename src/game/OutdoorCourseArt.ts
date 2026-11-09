import {isMasterCourse,masterCourseIds} from '../data/masterCourses';
import type Phaser from 'phaser';
import type {TownVenue} from '../data/world';
import {getCircuitTrack} from '../data/circuit';
import {isPracticeCourse} from '../data/practiceCourses';
import {outdoorTimeBoardPlacement} from '../data/timeBoard';
import {drawRecordBoard} from './RecordBoardArt';
import {drawShopTrack} from './ShopTrackArt';
/** The actual course lies in the town, with no facade or indoor lobby. */
export function drawOutdoorCourse(scene:Phaser.Scene,v:TownVenue,unlocked=true){
 if(!isPracticeCourse(v.id))return;
 if(isMasterCourse(v.id)){
  const depth=v.y+v.h+1,g=scene.add.graphics().setDepth(depth),accent=v.color;
  g.fillStyle(0x0c1a26,.45).fillRoundedRect(v.x+15,v.y+18,v.w,v.h,14);
  g.fillStyle(0x1b2535).fillRoundedRect(v.x-12,v.y-12,v.w+24,v.h+30,12);
  g.lineStyle(7,accent).strokeRoundedRect(v.x-12,v.y-12,v.w+24,v.h+30,12);
  g.lineStyle(2,0xffecb0,.9).strokeRoundedRect(v.x-4,v.y-4,v.w+8,v.h+14,8);
  drawShopTrack(scene,{x:v.x+20,y:v.y+55,w:v.w-40,h:v.h-78,kind:'track',label:'',text:''},getCircuitTrack(v.id),depth+1);
  const label=masterCourseLabel(masterCourseIds.indexOf(v.id)+1,unlocked);
  scene.add.text(v.x+24,v.y+9,label,{fontFamily:'monospace',fontSize:'16px',color:'#f9e1a3',fontStyle:'bold'}).setDepth(depth+3);
  scene.add.text(v.x+v.w/2,v.y+v.h-10,v.name,{fontFamily:'sans-serif',fontSize:'23px',fontStyle:'bold',color:'#fff0b3',stroke:'#172333',strokeThickness:4}).setOrigin(.5,1).setDepth(depth+3);
  for(const x of [v.x-16,v.x+v.w+2])for(const y of [v.y+25,v.y+v.h-105]){
   g.fillStyle(0x253344).fillRect(x,y,14,85);g.fillStyle(accent).fillRect(x+3,y+2,8,70);
   g.fillStyle(0xfff0be).fillRect(x-6,y-8,26,12);g.lineStyle(2,0x5c6c7b).strokeRect(x-6,y-8,26,12);
  }
  // 入口ゲートも通常コースより大きく、開放条件を現地で読めるようにする。
  const cx=v.x+v.w/2,gy=v.y+v.h+12;
  g.fillStyle(0x243a50).fillRect(cx-116,gy,10,46).fillRect(cx+106,gy,10,46);
  g.fillStyle(unlocked?accent:0x66717a).fillRect(cx-120,gy,240,25);
  scene.add.text(cx,gy+12,unlocked?'MASTER CHALLENGE / OPEN':'天頂決戦クリア後に開放',{fontFamily:'sans-serif',fontSize:'15px',fontStyle:'bold',color:'#162432'}).setOrigin(.5).setDepth(depth+3);
  drawRecordBoard(scene,outdoorTimeBoardPlacement(v),depth+55);
  return;
 }
 const g=scene.add.graphics().setDepth(v.y+v.h);
 g.fillStyle(0x263c34,.25).fillRoundedRect(v.x+3,v.y+4,v.w,v.h,6);
 drawShopTrack(scene,{...v,kind:'track',label:'',text:''},getCircuitTrack(v.id),v.y+v.h+1);
 drawRecordBoard(scene,outdoorTimeBoardPlacement(v),v.y+v.h+55);
 for(const x of [v.x+3,v.x+v.w-5]){
  g.fillStyle(0x9baea6).fillRect(x,v.y-13,2,17);
  g.fillStyle(0xe8d3a0).fillTriangle(x+2,v.y-13,x+15,v.y-9,x+2,v.y-3);
 }
}

function masterCourseLabel(number:number,unlocked:boolean){return `MASTER CIRCUIT 0${number}  /  ${unlocked?'CHALLENGER WELCOME':'ZENITH CLEAR REQUIRED'}`;}
