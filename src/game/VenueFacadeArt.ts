import type Phaser from 'phaser';
import type {TownVenue,ShopId} from '../data/world';
import {shopThemes} from '../data/shopThemes';
import {SceneryPen} from './SceneryCanvas';

export function paintVenueFacade(p:SceneryPen,v:TownVenue,open:boolean){
 const w=v.w,h=v.h,x=40,y=91,c=p.c;
 p.ellipse(x+w/2+10,y+h+9,w*.6,13,'#21323b33');
 if(v.kind==='stadium'){
  const colors:Record<string,string[]>={'stadium-5':['#376f73','#91bdac'],'stadium-9':['#4e527f','#bd9ace'],'stadium-10':['#745153','#e5b97a'],'stadium-7':['#354968','#dcc080']};
  const [dark,accent]=colors[v.id]??colors['stadium-5'];
  p.round(x-9,y-18,w+18,h+18,14,'#23364a');p.gradient(x-5,y-9,w+10,h+5,'#d0d3cb','#839da6');
  // スタジアムの段状スタンドと湾曲した大屋根。
  p.ellipse(x+w/2,y+10,w*.55,65,'#263b51');p.ellipse(x+w/2,y+4,w*.54,59,'#b4c5c6');p.ellipse(x+w/2,y-2,w*.5,48,dark);p.ellipse(x+w/2,y-6,w*.44,33,'#26394e');
  for(let i=0;i<22;i++){const a=Math.PI+(i/21)*Math.PI;const xx=x+w/2+Math.cos(a)*w*.49,yy=y+4+Math.sin(a)*47;p.line([[xx,yy],[x+w/2+Math.cos(a)*w*.54,yy-10]],'#e7e7d1',2);}
  for(let row=0;row<3;row++){const yy=y+34+row*33;p.gradient(x+8,yy,w-16,28,'#c8d2ca','#778e9c');for(let i=0;i<13;i++){const xx=x+16+i*(w-32)/13;p.round(xx,yy+3,(w-48)/13,16,2,'#2c4a62');p.rect(xx+2,yy+4,(w-58)/13,4,'#97c9ce');}p.rect(x+4,yy+24,w-8,3,accent);}
  // 4本の照明塔・トラス・投光器。
  for(const tx of [x+7,x+w-22]){p.rect(tx,y-76,9,131,'#425b6d');for(let k=0;k<7;k++)p.line([[tx,y-70+k*18],[tx+9,y-52+k*18],[tx,y-52+k*18]],'#b6c8c8',1);p.round(tx-10,y-83,30,20,2,'#344a5e');for(let row=0;row<2;row++)for(let col=0;col<4;col++)p.round(tx-7+col*6,y-80+row*7,4,5,1,'#fff0c0');p.glow(tx+4,y-72,35,'#fff1b340');}
  p.round(x+34,y+100,w-68,h-102,7,dark);p.gradient(x+41,y+108,w-82,h-116,'#6bafb9','#25435c');for(let i=0;i<9;i++)p.rect(x+46+i*(w-92)/9,y+110,2,h-121,'#dae7d477');
  // 中央の紋章とレースのチェッカー。
  p.round(x+w/2-44,y+25,88,66,8,'#1a2e45');p.round(x+w/2-41,y+28,82,60,6,accent);p.round(x+w/2-38,y+31,76,54,5,dark);p.trophy(x+w/2,y+37,1.1);
  p.checker(x+26,y+97,46,12,6);p.checker(x+w-72,y+97,46,12,6);
  for(let step=0;step<4;step++){p.gradient(x+47-step*4,y+h-16+step*5,w-94+step*8,5,'#d7d9c8','#929ea0');}
  for(const bx of [x+7,x+w-24]){p.gradient(bx,y+116,17,h-121,'#e7e2c5','#839696');p.rect(bx+3,y+118,2,h-125,'#fff1c5');}
  for(const side of [-1,1]){const fx=x+w/2+side*(w*.36);p.rect(fx,y-45,2,60,'#b9c9c4');p.poly([[fx+2,y-44],[fx+27,y-39],[fx+2,y-20]],accent);p.checker(fx+4,y-42,16,8,4);}
 }else{
  const t=shopThemes[(v.shopId??'komorebi') as ShopId],style=t.style;
  p.round(x,y,w,h,4,t.ink);p.gradient(x+3,y+3,w-6,h-7,t.wall,t.floorDark);
  if(style==='timber'){
   p.poly([[x-12,y+8],[x+w/2,y-66],[x+w+12,y+8]],'#354d4c');p.poly([[x-8,y+2],[x+w/2,y-60],[x+w+8,y+2]],'#6f8074');
   for(let row=0;row<7;row++){const yy=y-50+row*8,half=(row+1)*w/14;p.line([[x+w/2-half,yy],[x+w/2+half,yy]],'#b4b8a0',1);}
   for(const xx of [x+6,x+w-13])p.gradient(xx,y+7,7,h-11,t.wood,t.ink);
   for(let yy=y+12;yy<y+h-4;yy+=10)p.line([[x+13,yy],[x+w-13,yy]],'#85694b55',.8);
  }else if(style==='glass'){
   p.round(x-6,y-36,w+12,42,4,'#426b80');p.gradient(x-2,y-31,w+4,30,'#a8d5df','#5486a3');p.rect(x-9,y-38,w+18,4,'#dcebed');
   for(let xx=x+8;xx<x+w-10;xx+=32){p.gradient(xx,y+8,27,h-17,'#a9d4dc','#5a8b9f');p.rect(xx+25,y+8,2,h-17,'#dee9df');p.poly([[xx+2,y+10],[xx+14,y+10],[xx+6,y+h-16],[xx+2,y+h-16]],'#eaf7ec33');}
  }else if(style==='garage'){
   p.poly([[x-7,y],[x-7,y-30],[x+40,y-47],[x+40,y-29],[x+96,y-47],[x+96,y-29],[x+w+7,y-47],[x+w+7,y]],'#4a5a60');
   for(let xx=x-4;xx<x+w;xx+=8)p.rect(xx,y-23,3,h+20,'#d9d2ba22');p.rect(x-8,y-3,w+16,6,'#b9bba9');
   for(const xx of [x+7,x+w-15]){p.rect(xx,y+7,8,h-8,'#454c48');for(let yy=y+8;yy<y+h-8;yy+=14)p.poly([[xx,yy],[xx+8,yy],[xx+8,yy+6],[xx,yy+12]],'#dfb962');}
  }else if(style==='garden'){
   p.poly([[x-8,y+3],[x+w/2,y-55],[x+w+8,y+3]],'#587e71');p.poly([[x+1,y-1],[x+w/2,y-47],[x+w-1,y-1]],'#abd3be');
   for(let i=1;i<6;i++)p.line([[x+w/2,y-47],[x+i*w/6,y]],'#e1e0b8',2);
   for(let xx=x+10;xx<x+w-5;xx+=36){p.round(xx,y+11,28,h-19,14,'#456b5b');p.gradient(xx+3,y+15,22,h-27,'#b3cda5','#638f7b');}
   for(let i=0;i<20;i++){const xx=x+(i*31)%w,yy=y-4+(i*7)%31;p.ellipse(xx,yy,6,3,i%3?'#4e8060':'#9ab878');}
  }else if(style==='harbor'){
   for(let yy=y+6;yy<y+h-5;yy+=9)p.line([[x+4,yy],[x+w-4,yy]],'#f1ece238',1);
   p.round(x-8,y-32,w+16,44,21,'#4a526e');p.round(x-4,y-29,w+8,35,17,'#8c88aa');p.line([[x+2,y-22],[x+w-2,y-22]],'#ddc89d',2);
   for(const xx of [x+29,x+w-29]){p.ellipse(xx,y+35,21,23,'#d2c5a0');p.ellipse(xx,y+35,17,19,'#334e71');p.ellipse(xx-4,y+31,10,12,'#8eb3c0');for(let i=0;i<8;i++){const a=i*Math.PI/4;p.ellipse(xx+Math.cos(a)*19,y+35+Math.sin(a)*21,1,1,'#716b6a');}}
  }else if(style==='deco'){
   for(let i=0;i<4;i++)p.round(x+17+i*13,y-43+i*8,w-34-i*26,46,3,i%2?t.metal:t.wood);
   for(const xx of [x+7,x+35,x+w-43,x+w-15]){p.gradient(xx,y+5,8,h-11,'#e6d09e','#9e805f');p.rect(xx+2,y+5,1,h-11,'#fff0bc');}
   p.round(x+48,y+7,w-96,h-16,22,t.ink);p.gradient(x+51,y+13,w-102,h-25,'#9c7889','#3d4b5e');p.poly([[x+w/2,y-62],[x+w/2+18,y-41],[x+w/2,y-25],[x+w/2-18,y-41]],'#e3bb7c');
  }else{
   p.round(x-6,y-24,w+12,h+27,12,t.ink);p.round(x-3,y-21,w+6,h+19,10,t.metal);p.round(x,y-18,w,h+11,9,t.wood);
   p.ellipse(x+w/2,y-25,w*.35,32,'#9c87b1');p.ellipse(x+w/2,y-31,w*.31,22,'#6b5c88');p.poly([[x+w/2,y-61],[x+w/2+5,y-44],[x+w/2+20,y-40],[x+w/2+5,y-36],[x+w/2,y-20],[x+w/2-5,y-36],[x+w/2-20,y-40],[x+w/2-5,y-44]],'#ead29a');
   for(const xx of [x+23,x+w-47]){p.round(xx,y+18,24,72,12,'#b6adca');p.round(xx+3,y+21,18,66,9,'#465775');}
  }
  // 共通の機能は残し、看板文字ではなく精密なミニマシンの壁章。
  p.round(x+w/2-29,y+17,58,24,4,t.ink);p.wheel(x+w/2-14,y+30,7,t.metal);p.wheel(x+w/2+14,y+30,7,t.metal);p.poly([[x+w/2-18,y+27],[x+w/2-5,y+19],[x+w/2+15,y+22],[x+w/2+21,y+28]],t.accent);
  for(const xx of [x+15,x+w-55]){p.round(xx,y+h-64,40,48,3,t.ink);p.gradient(xx+3,y+h-61,34,40,'#a5c6c6','#527789');p.poly([[xx+4,y+h-59],[xx+16,y+h-59],[xx+8,y+h-23],[xx+4,y+h-23]],'#f6efcc55');for(let i=0;i<3;i++){p.rect(xx+6+i*10,y+h-37,8,9,[t.accent,'#c88b79','#c7b980'][i]);p.rect(xx+7+i*10,y+h-36,6,1,'#eee5c6');}}
  const dx=x+w/2-15;p.round(dx,y+h-66,30,61,3,t.ink);p.gradient(dx+4,y+h-61,22,39,'#c7d9cc','#688e9e');p.rect(dx+22,y+h-24,3,3,'#ebcd87');p.gradient(x+4,y+h-6,w-8,6,'#d1c6aa','#8a8a7c');
  p.plant(x+6,y+h-4,.85);p.plant(x+w-6,y+h-4,.85);
 }
 // 入口の視覚的な案内。閉鎖時は鎖と鍵、開放時は床の三角形。
 if(open){p.poly([[x+w/2-7,y+h+14],[x+w/2+7,y+h+14],[x+w/2,y+h+22]],'#e5d8a4');}
 else{p.round(x+w/2-17,y+h-30,34,22,3,'#26394be8');p.round(x+w/2-6,y+h-37,12,13,6,'#c9b87d');p.round(x+w/2-9,y+h-29,18,14,3,'#ebd99d');p.ellipse(x+w/2,y+h-23,2,2,'#596174');}
 c.globalAlpha=1;
}
export function drawVenueFacade(scene:Phaser.Scene,v:TownVenue,open:boolean){
 const key=`facade-v3-${v.id}-${open}`,width=v.w+80,height=v.h+125;
 if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,width*2,height*2)!;t.context.scale(2,2);paintVenueFacade(new SceneryPen(t.context),v,open);t.refresh();}
 scene.add.image(v.x-40,v.y-91,key).setOrigin(0).setDisplaySize(width,height).setDepth(v.y+v.h);
}
