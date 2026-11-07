import {drawOutdoorCourse} from './OutdoorCourseArt';
import {drawVenueFacade} from './VenueFacadeArt';
import Phaser from 'phaser';
import { isVenueOpen, townVenues, townSize, townRoads, townBlocks, type WorldProgress } from '../data/world';

/** 広域の下地は一枚のテクスチャへ焼き込み、移動中の描画負荷を抑える。 */
export function drawTown(scene:Phaser.Scene,progress:WorldProgress){
 const key='midorikawa-wide-ground';
 if(!scene.textures.exists(key)){
  const texture=scene.textures.createCanvas(key,townSize.width,townSize.height)!,c=texture.context;
  const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  const noise=(x:number,y:number)=>{let n=(Math.imul(x+97,374761393)^Math.imul(y+31,668265263))>>>0;n=Math.imul(n^(n>>>13),1274126177);return (n^(n>>>16))>>>0;};
  r(0,0,3200,2400,'#7c9b69');
  for(let y=0;y<2400;y+=8)for(let x=0;x<3200;x+=8){const n=noise(x,y);if(n%4===0)r(x,y,3+n%4,2,['#90aa77','#698c66','#a4b781'][n%3]);}
  // 川岸と岩。川はマップ外周の風景として扱う。
  for(let y=0;y<2400;y+=12){const shore=2990+Math.round(Math.sin(y/90)*12);r(shore-16,y,28,12,'#a99670');r(shore,y,3200-shore,12,'#376d96');r(shore+8,y+2,3200-shore-8,4,'#4f93ae');for(let x=shore+25;x<3200;x+=37){r(x+(y%24),y+7,18,2,'#84b9bb');r(x+5,y+9,10,1,'#315d8b');}}
  // 道は大通りと細い店前のアプローチでつなぐ。
  for(const x of townRoads.vertical){r(x-70,72,140,2250,'#525667');r(x-53,72,106,2250,'#777e87');r(x-70,72,7,2250,'#d0c5a5');r(x+63,72,7,2250,'#d0c5a5');for(let y=88;y<2320;y+=30){r(x-2,y,4,13,'#d7c999');for(const xx of [x-69,x+63])r(xx,y,6,1,'#8d8c88');}}
  for(const y of townRoads.horizontal){r(64,y-70,2880,140,'#525667');r(64,y-53,2880,106,'#777e87');r(64,y-70,2880,7,'#d0c5a5');r(64,y+63,2880,7,'#d0c5a5');for(let x=80;x<2944;x+=30)r(x,y-2,13,4,'#d7c999');}
  for(const x of townRoads.vertical)for(const y of townRoads.horizontal){r(x-52,y-52,104,104,'#777e87');for(let i=0;i<5;i++){r(x-44+i*19,y-64,9,30,'#d9d2b6');r(x-44+i*19,y+34,9,30,'#d9d2b6');}}
  for(const v of townVenues){
   const cx=v.x+v.w/2,cy=v.entrance==='south'?v.y+v.h+30:v.y-30,road=townRoads.horizontal.reduce((a,b)=>Math.abs(b-cy)<Math.abs(a-cy)?b:a);
   if(v.kind==='outdoor')r(v.x-8,v.y-8,v.w+16,v.h+28,'#a3ad8b');else r(v.x-24,v.y-65,v.w+48,v.h+118,v.kind==='stadium'?'#a7aaa0':'#b7b197');
   r(cx-28,Math.min(cy,road),56,Math.abs(cy-road),'#b7b197');
   for(let yy=Math.min(cy,road);yy<Math.max(cy,road);yy+=13){r(cx-26,yy,52,1,'#d3c9a8');r(cx,yy,1,12,'#969b89');}
   if(v.kind==='outdoor')continue;
   for(let yy=v.y-60;yy<v.y+v.h+45;yy+=14)for(let xx=v.x-20;xx<v.x+v.w+20;xx+=24){r(xx,yy,22,1,'#d0c8ae');r(xx+(yy%28===0?10:0),yy,1,12,'#93988b');}
  }
  // 公園の池と周回遊歩道。建物を置かず街に余白をつくる。
  r(1460,1590,180,132,'#b5b18c');r(1470,1600,160,112,'#5b9c9d');r(1474,1604,152,102,'#7db4b0');for(let i=0;i<14;i++)r(1482+(i*31)%133,1613+(i*19)%80,10,2,'#b5d2bd');
  for(let i=0;i<340;i++){const x=80+noise(i,1)%2820,y=100+noise(i,2)%2190;if(townVenues.some(v=>x>v.x-35&&x<v.x+v.w+35&&y>v.y-75&&y<v.y+v.h+70)||townRoads.vertical.some(v=>Math.abs(v-x)<86)||townRoads.horizontal.some(v=>Math.abs(v-y)<86))continue;r(x,y,1,6,'#4d795b');r(x-2,y,5,2,i%3?'#d4c182':'#d4a5a2');}
  texture.refresh();
 }
 scene.add.image(0,0,key).setOrigin(0).setDepth(-100);
 for(const [index,block] of townBlocks.entries()){
  const {x,y,w,h}=block,g=scene.add.graphics().setDepth(y+h),r=(a:number,b:number,ww:number,hh:number,c:number)=>g.fillStyle(c).fillRect(a,b,ww,hh);
  r(x+9,y+11,w,h,0x667469);r(x,y,w,h,0x424659);r(x+3,y+2,w-6,h-5,[0xbfae8d,0xa3b4b2,0xada4a8][index%3]);
  r(x-4,y-25,w+8,30,0x45495c);r(x-1,y-28,w+2,28,[0x7b7d8d,0x7f8e83,0x947c70][index%3]);
  for(let yy=y-24;yy<y;yy+=6)for(let xx=x;xx<x+w;xx+=12){r(xx,yy,10,1,0xafb3ae);r(xx+9,yy+1,1,4,0x565c6b);}
  for(let row=0;row<3;row++)for(let xx=x+10;xx<x+w-25;xx+=32){r(xx,y+12+row*28,23,21,0x596778);r(xx+2,y+14+row*28,19,15,0x7d9fa6);r(xx+4,y+15+row*28,3,12,0xc1d0bc);r(xx+10,y+14+row*28,1,17,0xc0c0ac);r(xx-2,y+33+row*28,27,3,0xd0c5a6);}
  r(x+w/2-9,y+h-22,18,21,0x525869);r(x+w/2-6,y+h-20,12,15,0x98b1af);
  tree(scene,x-21,y+h+8);tree(scene,x+w+20,y+h+8);
 }
 for(const venue of townVenues)if(venue.kind==='outdoor')drawOutdoorCourse(scene,venue);else drawVenueFacade(scene,venue,isVenueOpen(venue,progress));
 // 並木・街灯・ベンチ。小物は通路の外へ寄せる。
 for(const x of townRoads.vertical)for(let y=160;y<2300;y+=180){
  if(townVenues.some(v=>Math.abs(x-v.x)<v.w+100&&y>v.y-80&&y<v.y+v.h+70))continue;
  tree(scene,x-100,y);lamp(scene,x+88,y+50);
 }
 for(let i=0;i<55;i++){
  const x=110+(i*437)%2780,y=210+(i*281)%1980;
  if([...townVenues,...townBlocks].some(v=>x>v.x-90&&x<v.x+v.w+90&&y>v.y-100&&y<v.y+v.h+90)||townRoads.vertical.some(v=>Math.abs(v-x)<100)||townRoads.horizontal.some(v=>Math.abs(v-y)<100))continue;
  tree(scene,x,y);tree(scene,x+28,y+34);
 }
 for(const y of [100,2290])for(let x=100;x<2930;x+=125)tree(scene,x,y);
 for(const [x,y] of [[1440,1570],[1660,1570],[1440,1740],[1660,1740],[670,830],[2200,2040]]){tree(scene,x,y);const g=scene.add.graphics().setDepth(y+20);g.fillStyle(0x574d4c).fillRect(x+24,y+10,43,8);g.fillStyle(0xb59a74).fillRect(x+24,y+6,43,5);g.fillStyle(0x736556).fillRect(x+28,y+18,3,7).fillRect(x+60,y+18,3,7);}
}
function tree(scene:Phaser.Scene,x:number,y:number){
 if(townVenues.some(v=>v.kind==='outdoor'&&x>v.x-55&&x<v.x+v.w+55&&y>v.y-20&&y<v.y+v.h+95))return;
 const g=scene.add.graphics().setDepth(y+10),r=(a:number,b:number,w:number,h:number,c:number)=>g.fillStyle(c).fillRect(a,b,w,h);
 g.fillStyle(0x35464a,.22).fillEllipse(x+8,y+8,56,17);r(x-5,y-35,11,45,0x62505a);r(x-2,y-32,4,39,0xa18364);
 for(let i=0;i<9;i++){const xx=x-35+(i*19)%45,yy=y-76+(i*13)%38,w=26+i%3*3;r(xx+6,yy,w-12,4,0x3d6357);r(xx+2,yy+4,w-3,23,0x3d6357);r(xx,yy+9,w,12,0x3d6357);r(xx+5,yy+2,w-10,8,0x9aaf72);r(xx+3,yy+9,w-8,13,0x72955f);for(let j=0;j<4;j++)r(xx+6+j*4,yy+7+j%2*5,3,2,0xb0bc7d);}
}
function lamp(scene:Phaser.Scene,x:number,y:number){const g=scene.add.graphics().setDepth(y+4);g.fillStyle(0x444658).fillRect(x-3,y-56,6,60).fillRect(x-10,y-58,20,4);g.fillStyle(0xb6b3a0).fillRect(x-1,y-53,2,54);g.fillStyle(0xffdf9c).fillRect(x-7,y-66,14,9);g.fillStyle(0x575568).fillRect(x-9,y-69,18,3);}
