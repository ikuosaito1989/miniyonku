import type Phaser from 'phaser';
import type {TownVenue,ShopId} from '../data/world';
import {shopThemes} from '../data/shopThemes';
import {SceneryPen} from './SceneryCanvas';

export function paintVenueFacade(p:SceneryPen,v:TownVenue,open:boolean){
 if(v.kind==='outdoor')return;
 const w=v.w,h=v.h,x=40,y=91,c=p.c;
 p.ellipse(x+w/2+10,y+h+9,w*.6,13,'#21323b33');
 if(v.kind==='library'){
  p.round(x,y,w,h,3,'#465e6c');p.gradient(x+3,y+3,w-6,h-6,'#e1d7bd','#b4b4a0');
  p.poly([[x-9,y+4],[x+w/2,y-36],[x+w+9,y+4]],'#526574');p.poly([[x+6,y],[x+w/2,y-27],[x+w-6,y]],'#8c9f9e');
  p.round(x+w/2-23,y-15,46,27,3,'#304d59');
  p.poly([[x+w/2,y+5],[x+w/2-16,y],[x+w/2-16,y-10],[x+w/2,y-6],[x+w/2+16,y-10],[x+w/2+16,y],[x+w/2,y+5]],'#e8d7a7');p.line([[x+w/2,y-6],[x+w/2,y+5]],'#9e875d',1);
  for(const side of [x+12,x+w-61]){p.round(side,y+26,49,74,3,'#556c77');p.gradient(side+3,y+29,43,68,'#b4d7d3','#6b929d');for(let row=0;row<3;row++){p.rect(side+5,y+43+row*21,39,3,'#84715b');for(let col=0;col<6;col++)p.rect(side+6+col*6,y+31+row*21,4,11,['#647c83','#9b7469','#b49e63'][col%3]);}p.rect(side+23,y+29,2,68,'#d7d8c2');}
  p.round(x+w/2-22,y+48,44,h-49,3,'#475c65');p.gradient(x+w/2-18,y+53,36,h-57,'#b3d1c5','#5f8690');p.rect(x+w/2-1,y+53,2,h-57,'#d9d6ba');p.rect(x+w/2+10,y+h-24,3,11,'#dfc581');
  for(const col of [x+5,x+w-12]){p.gradient(col,y+13,7,h-14,'#ece2cb','#999e97');p.rect(col-2,y+12,11,4,'#c1b99d');}
  p.round(x-15,y+h-25,18,25,3,'#9e7c61');p.ellipse(x-6,y+h-29,15,12,'#66876a');p.round(x+w+1,y+h-25,18,25,3,'#9e7c61');p.ellipse(x+w+10,y+h-29,15,12,'#66876a');
 }else if(v.kind==='stadium'){
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
  const t=shopThemes[(v.shopId??'komorebi') as ShopId];
  // 以前の二階建ての町の模型店を基本に、配色・軒・小物だけを変える。
  p.round(x,y,w,h,3,t.ink);p.gradient(x+3,y+3,w-6,h-7,'#e3d8bc',t.floorDark);
  p.poly([[x-8,y-24],[x+w/2,y-34],[x+w+8,y-24],[x+w+8,y+5],[x-8,y+5]],t.ink);
  p.poly([[x-5,y-24],[x+w/2,y-31],[x+w+5,y-24],[x+w+5,y+1],[x-5,y+1]],t.accent);
  for(let yy=y-23;yy<y;yy+=7){p.line([[x-3,yy],[x+w+3,yy]],'#dae0d066',1);for(let xx=x+3;xx<x+w;xx+=14)p.line([[xx,yy+1],[xx,yy+5]],'#30475855',1);}
  p.rect(x-8,y+2,w+16,4,t.wood);p.rect(x-7,y+2,w+14,1,t.metal);
  for(let xx=x+13;xx<x+w-18;xx+=35){p.round(xx,y+14,26,25,1,'#5e6e7b');p.gradient(xx+2,y+16,22,20,'#a5c9c9','#7198a6');p.rect(xx+4,y+17,3,17,'#e5ecce88');p.rect(xx+12,y+16,1,20,'#d8d9bc');p.rect(xx-1,y+38,28,2,t.wood);}
  // 小さな模型の壁章。看板に文字は入れない。
  p.round(x+7,y+46,w-14,25,2,t.wood);p.round(x+10,y+48,w-20,21,1,t.ink);
  p.wheel(x+w/2-14,y+60,6,t.metal);p.wheel(x+w/2+14,y+60,6,t.metal);p.poly([[x+w/2-18,y+57],[x+w/2-5,y+51],[x+w/2+15,y+53],[x+w/2+21,y+58]],t.accent);
  for(let i=0;i<12;i++){const xx=x+4+i*(w-8)/12;p.rect(xx,y+76,(w-8)/12,7,i%2?'#e4dec6':t.accent);p.rect(xx,y+83,(w-8)/12-1,3,i%2?'#b9b39e':t.wood);}
  for(const xx of [x+12,x+w-62]){p.round(xx,y+92,50,37,2,t.ink);p.gradient(xx+3,y+94,44,30,'#a3c8c7','#6d969e');p.poly([[xx+5,y+95],[xx+16,y+95],[xx+8,y+123],[xx+5,y+123]],'#f6efcc55');for(let i=0;i<4;i++){p.rect(xx+5+i*10,y+115,8,9,[t.accent,'#b87e78','#c6b884','#829fb0'][i]);p.rect(xx+6+i*10,y+116,6,1,'#eee5c6');}}
  const dx=x+w/2-14;p.round(dx,y+91,28,h-94,2,t.ink);p.gradient(dx+3,y+94,22,25,'#c7d9cc','#7b9fa9');p.rect(dx+21,y+123,3,3,'#dec388');p.gradient(x+4,y+h-6,w-8,6,'#d1c6aa','#8a8a7c');
  p.plant(x+4,y+h-4,.75);p.plant(x+w-5,y+h-4,.75);
  if(v.id==='hinata'){p.wheel(x+20,y+h-14,9,'#aa9170');p.wheel(x+22,y+h-21,9,'#b5a281');}
  if(v.id==='wakaba')for(let i=0;i<7;i++){p.ellipse(x+3+i*4,y+75-i%3*4,4,2,'#719969');p.ellipse(x+w-6-i*3,y+75-i%3*3,3,2,'#8ca979');}
  if(v.id==='aozora'){p.rect(x+w-11,y-12,1,26,'#d2dbd1');p.poly([[x+w-10,y-12],[x+w+9,y-7],[x+w-10,y+2]],'#84b8cb');}
  if(v.id==='yuunagi')for(let i=0;i<3;i++)p.line([[x+15,y+57+i*4],[x+20,y+55+i*4],[x+25,y+59+i*4],[x+30,y+57+i*4]],'#a9b9d7',1);
  if(v.id==='akatsuki')p.trophy(x+w-21,y+49,.4);
  if(v.id==='hoshikuzu')for(const xx of [x+20,x+w-20]){p.line([[xx,y+49],[xx,y+68]],'#e7d5a2',2);p.line([[xx-7,y+58],[xx+7,y+58]],'#e7d5a2',2);}
  if(v.id==='torque'){p.ellipse(x+23,y+58,10,10,t.ink);p.ellipse(x+23,y+58,5,5,t.accent);for(let i=0;i<8;i++){const a=i*Math.PI/4;p.line([[x+23+Math.cos(a)*8,y+58+Math.sin(a)*8],[x+23+Math.cos(a)*13,y+58+Math.sin(a)*13]],t.ink,3);}}
  if(v.id==='velocity')for(let i=0;i<3;i++)p.line([[x+12+i*7,y+49],[x+20+i*7,y+57],[x+12+i*7,y+65]],t.light,2);
  if(v.id==='terrain'){p.poly([[x+9,y+66],[x+22,y+46],[x+36,y+66]],t.ink);p.poly([[x+17,y+54],[x+22,y+46],[x+28,y+55]],t.light);}
  if(v.id==='atelier'){p.ellipse(x+23,y+58,7,7,'#a6a0bc');p.ellipse(x+23,y+58,3,3,t.ink);for(let i=0;i<8;i++){const a=i*Math.PI/4;p.line([[x+23+Math.cos(a)*6,y+58+Math.sin(a)*6],[x+23+Math.cos(a)*9,y+58+Math.sin(a)*9]],'#c7bed6',1.5);}}
 }

 // Roof grain, masonry corners, drainpipes and contact shading share the town palette.
 p.material(x-4,y-27,w+8,27,'stone',w+h);
 p.rect(x+3,y+6,1,h-12,'#fff0cf66');p.rect(x+w-5,y+7,2,h-12,'#334c4c33');
 for(let yy=y+8;yy<y+h-9;yy+=9){p.rect(x+4,yy,4,.5,'#efe3bd60');p.rect(x+w-9,yy+3,5,.5,'#334b4e22');}
 if(v.kind==='shop'){
  p.rect(x+w+1,y+7,2,h-11,'#476364');p.rect(x+w+1,y+8,.5,h-14,'#c4c9af');
  for(const yy of [y+28,y+67,y+h-10])p.rect(x+w,yy,4,1,'#344d57');
  p.material(x+5,y+40,w-10,5,'wood',3);p.material(x+5,y+h-11,w-10,7,'stone',7);
 }
 p.rect(x+3,y+h-4,w-6,1,'#e5d3a177');
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
