import type Phaser from 'phaser';
import type {TownVenue} from '../data/world';
import {getCircuitTrack} from '../data/circuit';
import {isPracticeCourse} from '../data/practiceCourses';
import {isMasterCourse,masterCourseIds} from '../data/masterCourses';
import {outdoorTimeBoardPlacement} from '../data/timeBoard';
import {townRoads} from '../data/world';
import {drawRecordBoard} from './RecordBoardArt';
import {drawShopTrack} from './ShopTrackArt';
import {artNoise} from './PixelArtMaterials';

/** All outdoor courses keep their real race geometry inside one shared race-day venue style. */
export function drawOutdoorCourse(scene:Phaser.Scene,v:TownVenue,unlocked=true){
 if(!isPracticeCourse(v.id))return;
 const track=getCircuitTrack(v.id);
 if(isMasterCourse(v.id))drawMasterArena(scene,v,track,unlocked);
 else drawStreetArena(scene,v,track);
}

function drawStreetArena(scene:Phaser.Scene,v:TownVenue,track:ReturnType<typeof getCircuitTrack>){
 const x=v.x,y=v.y,w=v.w,h=v.h,cx=x+w/2,accent=v.color,depth=y+h+1;
 const g=scene.add.graphics().setDepth(depth-2);
 // Raised stone plinth, grass field and narrow paved spectator apron.
 g.fillStyle(0x1e3032,.3).fillRoundedRect(x-17,y-14,w+34,h+43,12);
 g.fillStyle(0x59645a).fillRoundedRect(x-14,y-12,w+28,h+37,11);
 g.fillStyle(0xd4c6a4).fillRoundedRect(x-12,y-12,w+24,h+30,9);
 g.fillStyle(0x9a9b83).fillRoundedRect(x-9,y-9,w+18,h+25,7);
 g.fillStyle(0x527548).fillRoundedRect(x-6,y-7,w+12,h+18,6);
 g.fillStyle(0x779157,.8).fillRoundedRect(x-3,y-4,w+6,h+11,5);
 g.fillStyle(0x435a48,.42).fillRoundedRect(x+7,y+8,w-14,h-17,4);
 g.fillStyle(0x67834d).fillRoundedRect(x+5,y+5,w-14,h-17,4);
 for(let i=0;i<68;i++){
  const px=x+12+artNoise(i,Math.floor(y),201)%(w-24),py=y+13+artNoise(i,Math.floor(x),209)%(h-29);
  if(px>x+w-122&&py<y+112)continue;
  g.fillStyle(i%4===0?0x9ca56a:0x829760,.25).fillRect(px,py,2+(i%3),1);
 }
 // The exact in-game lane path remains the visual center of the arena.
 const course={x:x+17,y:y+38,w:w-132,h:h-74,kind:'track' as const,label:'',text:''};
 drawShopTrack(scene,course,track,depth+1);
 drawNameBoard(scene,v,accent,x+16,y+5,Math.min(w-142,220),24,depth+5);
 drawFence(scene,x-4,y-3,w+8,h+3,cx,accent,depth+4,42);
 drawSmallGate(scene,cx,y+h+5,accent,depth+5);
 drawPitStation(scene,x+w-112,y+43,accent,depth+6,.88);
 drawArenaFlags(scene,x,y,w,h,accent,depth+7);
 drawWalkway(scene,v,cx,depth+5);
 drawRecordBoard(scene,outdoorTimeBoardPlacement(v),y+h+55);
}

function drawMasterArena(scene:Phaser.Scene,v:TownVenue,track:ReturnType<typeof getCircuitTrack>,unlocked:boolean){
 const x=v.x,y=v.y,w=v.w,h=v.h,cx=x+w/2,accent=v.color,depth=y+h+1;
 const g=scene.add.graphics().setDepth(depth-2);
 g.fillStyle(0x182a30,.38).fillRoundedRect(x-27,y-18,w+54,h+50,16);
 g.fillStyle(0x606960).fillRoundedRect(x-22,y-15,w+44,h+42,14);
 g.fillStyle(0xd3c5a0).fillRoundedRect(x-19,y-14,w+38,h+34,12);
 g.fillStyle(0x87927c).fillRoundedRect(x-15,y-10,w+30,h+27,9);
 g.fillStyle(0x477146).fillRoundedRect(x-12,y-8,w+24,h+20,8);
 g.fillStyle(0x68834e).fillRoundedRect(x-8,y-4,w+16,h+14,6);
 for(let i=0;i<260;i++){
  const px=x+artNoise(i,Math.floor(y),301)%(w-20),py=y+artNoise(i,Math.floor(x),307)%(h-18);
  g.fillStyle(i%5===0?0xa1a96a:0x82985b,.22).fillRect(px,py,2+(i%4),1);
 }
 drawShopTrack(scene,{x:x+18,y:y+48,w:w-150,h:h-78,kind:'track',label:'',text:''},track,depth+1);
 drawNameBoard(scene,v,accent,x+26,y+9,Math.min(310,w*.48),27,depth+5,unlocked?`MASTER CIRCUIT 0${masterCourseIds.findIndex(id=>id===v.id)+1}`:'MASTER CIRCUIT / LOCKED');
 drawMasterName(scene,v,depth+6);
 drawFence(scene,x-7,y-4,w+14,h+5,cx,accent,depth+4,66);
 drawPitStation(scene,x+w-129,y+92,accent,depth+7,1.05);
 drawArenaFlags(scene,x,y,w,h,accent,depth+8);
 drawMasterGate(scene,cx,y+h+5,accent,unlocked,depth+9);
 drawRecordBoard(scene,outdoorTimeBoardPlacement(v),depth+58);
}

function drawNameBoard(scene:Phaser.Scene,v:TownVenue,accent:number,x:number,y:number,w:number,h:number,depth:number,text=v.name){
 const g=scene.add.graphics().setDepth(depth);
 g.fillStyle(0x202f3b,.38).fillRoundedRect(x+2,y+3,w,h,4);
 g.fillStyle(0x2d4556).fillRoundedRect(x,y,w,h,4);
 g.lineStyle(1.4,0xe2d3a6,.95).strokeRoundedRect(x,y,w,h,4);
 g.fillStyle(accent).fillRoundedRect(x+3,y+3,4,h-6,2);
 const count=[...text].length,font=Math.max(8,Math.min(12,Math.floor((w-17)/count)));
 scene.add.text(x+w/2+2,y+h/2,text,{fontFamily:'sans-serif',fontSize:`${font}px`,fontStyle:'bold',color:'#f7edcf',align:'center',stroke:'#20364a',strokeThickness:1})
  .setOrigin(.5).setResolution(2).setDepth(depth+1).setName(`outdoor-course-sign-${v.id}`);
}

function drawMasterName(scene:Phaser.Scene,v:TownVenue,depth:number){
 scene.add.text(v.x+v.w/2,v.y+v.h-11,v.name,{fontFamily:'sans-serif',fontSize:'19px',fontStyle:'bold',color:'#fff0b3',stroke:'#172333',strokeThickness:4})
  .setOrigin(.5,1).setDepth(depth).setName(`master-course-name-${v.id}`);
}

/** Rope rails, bolted posts and an open front gate echo the illustrated arena perimeter. */
function drawFence(scene:Phaser.Scene,x:number,y:number,w:number,h:number,cx:number,accent:number,depth:number,gate:number){
 const g=scene.add.graphics().setDepth(depth),left=x,right=x+w,top=y,bottom=y+h;
 g.lineStyle(4,0x394d50,.92);
 g.lineBetween(left,top,right,top).lineBetween(left,top,left,bottom).lineBetween(right,top,right,bottom);
 g.lineBetween(left,bottom,cx-gate/2,bottom).lineBetween(cx+gate/2,bottom,right,bottom);
 g.lineStyle(1.6,0xd9d2b7,.92);
 g.lineBetween(left,top-3,right,top-3).lineBetween(left,top-3,left,bottom).lineBetween(right,top-3,right,bottom);
 g.lineBetween(left,bottom-3,cx-gate/2,bottom-3).lineBetween(cx+gate/2,bottom-3,right,bottom-3);
 const post=(px:number,py:number)=>{
  g.fillStyle(0x293d43,.32).fillEllipse(px+2,py+3,14,6);
  g.fillStyle(0x3f5960).fillRoundedRect(px-4,py-12,8,16,2);
  g.fillStyle(0xc4c5ad).fillRoundedRect(px-3,py-10,6,11,2);
  g.fillStyle(0xf0e2bd).fillCircle(px,py-12,4);
  g.fillStyle(accent).fillCircle(px,py-12,2);
 };
 for(let px=left;px<=right;px+=38){post(px,top);if(px<cx-gate/2-10||px>cx+gate/2+10)post(px,bottom);}
 for(let py=top+33;py<bottom-12;py+=38){post(left,py);post(right,py);}
}

function drawPitStation(scene:Phaser.Scene,x:number,y:number,accent:number,depth:number,scale:number){
 const g=scene.add.graphics().setDepth(depth),w=96*scale,h=72*scale;
 g.fillStyle(0x243337,.28).fillEllipse(x+w/2+4,y+h+4,w+14,12);
 g.fillStyle(0xe5d8b7).fillRoundedRect(x+6*scale,y+39*scale,84*scale,27*scale,3);
 g.fillStyle(0x876f50).fillRect(x+15*scale,y+56*scale,3*scale,12*scale).fillRect(x+77*scale,y+56*scale,3*scale,12*scale);
 g.fillStyle(0x3a5366).fillRect(x+3*scale,y+18*scale,90*scale,25*scale);
 g.fillStyle(accent).fillRect(x+5*scale,y+20*scale,86*scale,19*scale);
 g.fillStyle(0xf4efda).fillRect(x+31*scale,y+20*scale,24*scale,19*scale);
 g.fillStyle(0xf2dfb2).fillRect(x+3*scale,y+39*scale,90*scale,4*scale);
 for(let i=0;i<5;i++){
  const bx=x+(8+i*16)*scale;
  g.fillStyle(i%2?0x495960:0x747e79).fillRoundedRect(bx,y+(45+(i%2)*3)*scale,12*scale,12*scale,2);
  g.fillStyle(i%2?0x98a9a1:0xc2b590).fillRect(bx+2*scale,y+(47+(i%2)*3)*scale,8*scale,2*scale);
  g.fillStyle([0xd8836c,0x79a9bd,0xd5b966][i%3]).fillRect(bx+3*scale,y+(52+(i%2)*3)*scale,6*scale,3*scale);
 }
 g.fillStyle(0x485b56).fillRoundedRect(x+20*scale,y+68*scale,54*scale,3*scale,1);
 g.fillStyle(0xd6cba9).fillRect(x+23*scale,y+67*scale,48*scale,2*scale);
}

function drawArenaFlags(scene:Phaser.Scene,x:number,y:number,w:number,h:number,accent:number,depth:number){
 const g=scene.add.graphics().setDepth(depth);
 for(const [px,py,side] of [[x+9,y+h*.47,-1],[x+w-9,y+h*.47,1],[x+w*.24,y+3,-1],[x+w*.76,y+3,1]] as const){
  g.fillStyle(0x283b3d,.24).fillEllipse(px+3,py+3,14,5);
  g.fillStyle(0x38515b).fillRoundedRect(px-2,py-42,4,46,1);
  g.fillStyle(0xe0d4b7).fillCircle(px,py-42,3);
  g.fillStyle(0x264e87).fillTriangle(px+2,py-39,px+22*side,py-36,px+2,py-15);
  g.fillStyle(accent).fillRect(px+4,py-36,12*side,2);
  for(let row=0;row<3;row++)for(let col=0;col<2;col++){
   const xx=px+4+col*6,yy=py-31+row*5;
   g.fillStyle((row+col)%2?0xf5efda:0xd9e4e2).fillRect(xx,yy,5,4);
  }
 }
 for(const px of [x+22,x+w-22]){
  g.fillStyle(0x354b4f).fillRoundedRect(px-2,y+7,4,48,2);
  g.fillStyle(0xf0d89a).fillRoundedRect(px-8,y+3,16,13,3);
  g.fillStyle(0xffedbd,.55).fillRoundedRect(px-12,y,24,19,5);
 }
}

function drawSmallGate(scene:Phaser.Scene,cx:number,y:number,accent:number,depth:number){
 const g=scene.add.graphics().setDepth(depth);
 g.fillStyle(0x304750).fillRoundedRect(cx-25,y-5,7,23,2).fillRoundedRect(cx+18,y-5,7,23,2);
 g.fillStyle(0xe0d2aa).fillRoundedRect(cx-31,y-11,62,13,3);
 g.fillStyle(0x294960).fillRoundedRect(cx-28,y-9,56,8,2);
 for(let i=0;i<7;i++)g.fillStyle(i%2?0xe8e2cc:accent).fillRect(cx-25+i*8,y-8,8,6);
 g.fillStyle(0xf2d58e).fillRoundedRect(cx-4,y+2,8,14,2);
}

function drawMasterGate(scene:Phaser.Scene,cx:number,y:number,accent:number,unlocked:boolean,depth:number){
 const g=scene.add.graphics().setDepth(depth),color=unlocked?accent:0x68747a;
 g.fillStyle(0x263d4e).fillRoundedRect(cx-122,y-7,12,48,3).fillRoundedRect(cx+110,y-7,12,48,3);
 g.fillStyle(0xe2d6b4).fillRoundedRect(cx-122,y-7,12,6,3).fillRoundedRect(cx+110,y-7,12,6,3);
 g.fillStyle(color).fillRoundedRect(cx-116,y-1,232,25,4);
 for(let i=0;i<16;i++)g.fillStyle(i%2?0xf0ead8:0x263f59).fillRect(cx-108+i*14,y+3,14,15);
 scene.add.text(cx,y+12,unlocked?'MASTER CHALLENGE / OPEN':'ZENITH CLEAR REQUIRED',{fontFamily:'sans-serif',fontSize:'14px',fontStyle:'bold',color:unlocked?'#203547':'#f0ead8'})
  .setOrigin(.5).setDepth(depth+1);
}

function drawWalkway(scene:Phaser.Scene,v:TownVenue,cx:number,depth:number){
 const nextRoad=townRoads.horizontal.filter(y=>y>v.y+v.h).sort((a,b)=>a-b)[0],walkEnd=nextRoad?nextRoad-108:v.y+v.h+38;
 if(walkEnd<=v.y+v.h+34)return;
 const path=scene.add.graphics().setDepth(depth);
 path.fillStyle(0x677365,.22).fillRect(cx-27,v.y+v.h+31,54,walkEnd-(v.y+v.h+31));
 path.fillStyle(0xaaa58e).fillRect(cx-22,v.y+v.h+32,44,walkEnd-(v.y+v.h+32));
 path.fillStyle(0xd6c9a7).fillRect(cx-22,v.y+v.h+32,44,2);
 path.fillStyle(0x7b8475).fillRect(cx-22,walkEnd-2,44,2);
 for(let y=v.y+v.h+42;y<walkEnd-4;y+=12){path.fillStyle(0x7c8779,.7).fillRect(cx-21,y,42,1);path.fillStyle(0xbab49b,.45).fillRect(cx-18,y+2,38,1);}
}
