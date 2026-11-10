import {isMasterCourse,masterCourseIds} from '../data/masterCourses';
import type Phaser from 'phaser';
import type {TownVenue} from '../data/world';
import {getCircuitTrack} from '../data/circuit';
import {isPracticeCourse} from '../data/practiceCourses';
import {outdoorTimeBoardPlacement} from '../data/timeBoard';
import {townRoads} from '../data/world';
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
 // The mini track sits inside a usable public racing bay: paved apron, raised
 // kerb, pit access and low spectator rails connect it to the surrounding town.
 const g=scene.add.graphics().setDepth(v.y+v.h-1),cx=v.x+v.w/2,entryY=v.y+v.h+16;
 g.fillStyle(0x283b3b,.24).fillRoundedRect(v.x-16,v.y-15,v.w+32,v.h+42,9);
 g.fillStyle(0x7c877e).fillRoundedRect(v.x-12,v.y-12,v.w+24,v.h+36,7);
 g.lineStyle(2,0xd0c6a5,.9).strokeRoundedRect(v.x-9,v.y-9,v.w+18,v.h+30,5);
 g.fillStyle(0xa8a28c).fillRect(cx-20,v.y+v.h+1,40,33);
 g.fillStyle(0xcfc4a3).fillRect(cx-16,v.y+v.h+3,32,29);
 for(let i=0;i<4;i++)g.fillStyle(i%2?0x526b61:0xc2b587).fillRect(cx-14+i*8,v.y+v.h+13,6,3);
 // Safety rails have visible posts, a continuous top member, and an open entrance.
 g.lineStyle(3,0x40585a,.95).lineBetween(v.x-9,v.y-3,v.x+v.w+9,v.y-3).lineBetween(v.x-9,v.y-3,v.x-9,v.y+v.h+3).lineBetween(v.x+v.w+9,v.y-3,v.x+v.w+9,v.y+v.h+3);
 g.lineStyle(1,0xc1c5aa,.9).lineBetween(v.x-8,v.y+5,v.x-8,v.y+v.h-1).lineBetween(v.x+v.w+8,v.y+5,v.x+v.w+8,v.y+v.h-1);
 for(let x=v.x-10;x<=v.x+v.w+10;x+=28){if(x>cx-20&&x<cx+20)continue;g.fillStyle(0x334b50).fillRect(x-2,v.y-6,4,8);g.fillStyle(0xd2c79f).fillRect(x-1,v.y-5,2,4);}
 drawShopTrack(scene,{...v,kind:'track',label:'',text:''},getCircuitTrack(v.id),v.y+v.h+1);
 // Numbered pit boxes and a shaded check-in canopy make the course entrance readable.
 for(let i=0;i<3;i++){const x=v.x+9+i*21,y=v.y+v.h+19;g.fillStyle(0x42595a).fillRect(x,y,16,12);g.fillStyle(0xc6b98f).fillRect(x+2,y+2,12,2);g.fillStyle([0xc47769,0x759eb0,0x8da676][i]).fillRect(x+3,y+5,10,5);}
 g.fillStyle(0x344d52).fillRect(cx-23,v.y+v.h+4,46,5);g.fillStyle(v.color).fillRect(cx-20,v.y+v.h+5,40,2);
 const nextRoad=townRoads.horizontal.filter(y=>y>v.y+v.h).sort((a,b)=>a-b)[0],walkEnd=nextRoad?nextRoad-108:v.y+v.h+38;
 if(walkEnd>v.y+v.h+34){const path=scene.add.graphics().setDepth(v.y+v.h+15);path.fillStyle(0x9ba18c).fillRect(cx-22,v.y+v.h+32,44,walkEnd-(v.y+v.h+32));path.fillStyle(0xd2c5a0).fillRect(cx-22,v.y+v.h+32,44,2);path.fillStyle(0x777f73).fillRect(cx-22,walkEnd-2,44,2);for(let y=v.y+v.h+42;y<walkEnd-4;y+=12){path.fillStyle(0x7c8779,.7).fillRect(cx-21,y,42,1);path.fillStyle(0xbab49b,.45).fillRect(cx-18,y+2,38,1);}}
 drawRecordBoard(scene,outdoorTimeBoardPlacement(v),v.y+v.h+55);
 for(const x of [v.x+3,v.x+v.w-5]){
  g.fillStyle(0x9baea6).fillRect(x,v.y-13,2,17);
  g.fillStyle(0xe8d3a0).fillTriangle(x+2,v.y-13,x+15,v.y-9,x+2,v.y-3);
 }
}

function masterCourseLabel(number:number,unlocked:boolean){return `MASTER CIRCUIT 0${number}  /  ${unlocked?'CHALLENGER WELCOME':'ZENITH CLEAR REQUIRED'}`;}
