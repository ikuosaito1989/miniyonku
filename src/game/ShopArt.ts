import Phaser from 'phaser';
import type { Fixture } from '../data/shop';
import { circuit } from '../data/circuit';
import { story } from '../data/story';
import { shopPalette as palette, tileSpeckles } from '../data/shopStyle';
import { personDrawing, personSpriteSize, type Facing, type PersonKind } from './PeopleArt';
import { counterDrawing, counterSpriteSize } from './CounterArt';
import { paintPixels } from './pixelDrawing';
import { drawIllustratedFixture, drawIllustratedRoom } from './ShopIllustrationArt';

export type { Facing, PersonKind } from './PeopleArt';
const ink=palette.outline;
function rect(g:Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,color:number){g.fillStyle(color).fillRect(Math.round(x),Math.round(y),w,h);}
function label(scene:Phaser.Scene,x:number,y:number,text:string,size=10,color='#f5ead0',depth=0){return scene.add.text(x,y,text,{fontFamily:'"Noto Sans JP", monospace',fontSize:`${size}px`,color,resolution:2}).setDepth(depth);}

export function drawShopRoom(scene:Phaser.Scene,mirrored=false){
  if(drawIllustratedRoom(scene,mirrored))return;
  const g=scene.add.graphics();
  rect(g,0,0,960,640,0x303e56);rect(g,40,35,880,85,palette.wall);
  for(let y=36;y<108;y+=4)for(let x=42;x<918;x+=5){
    const n=(x*7+y*13)%19;rect(g,x,y,2,2,n<7?palette.wallDark:n>13?palette.wallLight:0x929db9);
  }
  rect(g,40,106,880,3,0xced6e7);rect(g,40,109,880,5,0x617592);rect(g,40,114,880,6,0x4f6680);
  // 大きな目地と細かな石目。固定パターンで光沢を抑え、人物の輪郭を読みやすくする。
  for(let y=120,row=0;y<600;y+=32,row++)for(let x=40,column=0;x<920;x+=32,column++){
    const width=Math.min(32,920-x);
    rect(g,x,y,width,32,palette.grout);rect(g,x+1,y+1,width-2,30,palette.floor[(column+row*3)%4]);
    rect(g,x+2,y+2,width-4,1,palette.tileLight);rect(g,x+2,y+3,1,27,0xcfeee0);
    rect(g,x+2,y+29,width-3,1,palette.tileShade);
    for(const point of tileSpeckles(column,row))if(point.x<width-2)rect(g,x+point.x,y+point.y,2,1,point.light?0xd8f0e1:palette.tileGrain);
  }
  rect(g,81,46,263,50,0x4a5876);rect(g,83,47,259,46,0xdee5ed);rect(g,86,50,253,40,0x3f6075);
  rect(g,89,52,247,1,0x829eab);rect(g,89,87,247,1,0x263f5d);
  label(scene,103,53,story.shop,23);label(scene,106,80,`日本・${story.town}　小さな走り、大きな夢`,8,'#d2e7e4');
  // 壁面のパッケージ・ラック。箱絵は自作の模型のシルエット。
  rect(g,374,43,266,60,0x4a5672);rect(g,377,46,260,54,0x626f8b);
  for(let x=380;x<637;x+=12){rect(g,x,48,1,49,0x34475f);rect(g,x+1,48,1,49,0x9ca8bd);}
  for(let row=0;row<2;row++)for(let i=0;i<12;i++){
    const x=382+i*21,y=51+row*24;rect(g,x+6,y-2,3,3,0xdce6ec);kitBox(g,x,y,17,19,i+row*2);
  }
  label(scene,466,43,'KOMOREBI PARTS',6,'#ebecf4');
  rect(g,654,49,24,29,0x4a5873);rect(g,656,51,20,24,0xdee5eb);rect(g,659,54,14,18,0xf7f4df);
  g.lineStyle(1,0x46536c).lineBetween(666,57,666,64).lineBetween(666,64,670,61);
  for(const [dx,dy] of [[0,-7],[0,7],[-5,0],[5,0]])rect(g,666+dx,63+dy,1,1,0x738599);
  // 壁のパーツ吊り下げ台。
  rect(g,690,46,160,52,0x48566e);rect(g,693,49,154,46,0xb1bad0);
  for(let x=698;x<844;x+=8)for(let y=53;y<93;y+=8)rect(g,x,y,1,1,0x6a7e98);
  for(let i=0;i<9;i++){const x=698+i*16;rect(g,x,59,12,25,[0xe4cd8b,0x9aafb9,0xc2826c][i%3]);rect(g,x+3,55,6,3,ink);rect(g,x+2,65,8,13,0xeee5ce);g.lineStyle(2,0x5b6874).strokeCircle(x+6,71,3);}
  label(scene,714,87,'モーター・工具',7,'#4c514f');
  rect(g,860,53,40,44,0x85725f);rect(g,863,56,34,38,0xf3e7c9);label(scene,866,57,'走行会',9,'#aa5c50');label(scene,867,72,'日曜日',7,'#4e5b62');label(scene,867,83,'参加歓迎',6,'#4e5b62');
  // 入口マットと段差。
  rect(g,409,570,145,30,0x526782);rect(g,412,573,139,24,0x78979e);
  for(let y=575;y<596;y+=3)rect(g,415,y,133,1,0x5f7c8e);
  rect(g,40,600,880,14,0x526580);rect(g,40,600,880,2,0xb6d5d6);label(scene,454,599,'いらっしゃいませ',7,'#eff3d8');
  // 通路の案内タイル。
  label(scene,702,281,'作業台 ↑',10,'#4c737a');label(scene,657,508,'店内走行コース',11,'#4c737a');
}

function kitBox(g:Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,variant:number){
  const color=[0xc34d80,0x495abb,0x439d9b,0xd5ad4e,0x8570b0][variant%5];
  rect(g,x+1,y+2,w,h,0x3b4861);rect(g,x,y,w,h,0xf1eff1);rect(g,x,y,w,2,color);rect(g,x+2,y+4,w-4,h-7,0xdbe5ef);
  // 箱絵の小さなマシンとラベル。
  rect(g,x+4,y+7,w-9,3,color);rect(g,x+7,y+5,w-14,7,color);
  for(const px of [x+4,x+w-8]){rect(g,px,y+5,3,3,ink);rect(g,px,y+10,3,3,ink);}
  rect(g,x+3,y+h-4,w-7,1,0xffffff);rect(g,x+w-5,y+3,2,2,0xffffff);
  rect(g,x+2,y+h-3,w-4,2,color);rect(g,x+3,y+3,3,2,0xfefeff);
}

export function drawShopFixture(scene:Phaser.Scene,f:Fixture,source:Fixture=f,mirrored=false){
  if(drawIllustratedFixture(scene,f,source,mirrored))return;
  const g=scene.add.graphics().setDepth(f.y+f.h);const {x,y,w,h}=f;
  if(f.kind==='legends'){
    rect(g,x,y,w,h,0x253f55);rect(g,x+3,y+3,w-6,h-6,0x162b3e);
    for(let i=0;i<4;i++)kitBox(g,x+12+i*70,y+12,58,56,i);
    label(scene,x+50,y+h-15,'レジェンドマシン展示・調べる',10,'#ffe5a0',y+h+1);return;
  }
  if(f.kind==='counter'){
    const key='shop-counter-detailed';
    if(!scene.textures.exists(key)){
      const texture=scene.textures.createCanvas(key,counterSpriteSize.width*2,counterSpriteSize.height*2)!;
      texture.context.scale(2,2);paintPixels(texture.context,counterDrawing());texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    scene.add.image(x,y-counterSpriteSize.topOverhang,key).setOrigin(0).setDisplaySize(w,h+counterSpriteSize.topOverhang).setDepth(y+h);
    label(scene,x+168,y+42,'こもれび',6,'#456080',y+h+1);
    return;
  }
  if(f.kind==='bookshelf'){
    rect(g,x,y,w,h,0x43516b);rect(g,x+2,y+2,w-4,h-4,0xc1c9dc);rect(g,x+5,y+4,w-10,h-8,0x55647d);
    for(let row=0;row<2;row++)for(let i=0;i<12;i++){
      const bx=x+8+i*14,by=y+6+row*19;
      rect(g,bx,by,10,16,[0xb85477,0x578fa4,0xd8b365,0x7f9d92][i%4]);rect(g,bx+1,by,1,16,0xdddacb);rect(g,bx+2,by+3,6,2,0xf2e9d4);rect(g,bx+3,by+8,4,1,0xe3dce7);rect(g,bx+3,by+11,4,1,0xe3dce7);
    }
    rect(g,x+3,y+23,w-6,2,0xe5e8f2);rect(g,x+3,y+25,w-6,2,0x8b9ab7);label(scene,x+8,y-13,'セッティングの本・全6冊',8,'#3c626d',f.y+f.h+1);return;
  }
  rect(g,x+5,y+h-2,w+3,6,0x80afa5);rect(g,x+9,y+h+4,w-4,3,0x9ac7b9);
  if(f.kind==='board'){
    rect(g,x,y,w,h,0x4e576e);rect(g,x+1,y+1,w-2,h-2,0xb2bdd0);rect(g,x+3,y+3,w-6,h-6,0xe3c474);rect(g,x+5,y+5,w-10,h-10,0x293b50);
    for(let i=0;i<5;i++){rect(g,x+5+i*6,y+2,3,1,0xf8e9ae);rect(g,x+5+i*6,y+h-4,3,1,0xa1844c);}
    label(scene,x+5,y+6,'熟練度表',6,'#fff1a7',f.y+f.h+1);
    rect(g,x+6,y+h-9,w-12,1,0xd4b568);return;
  }
  if(f.kind==='plant'){
    rect(g,x+10,y+27,25,17,0x935a4b);rect(g,x+8,y+25,29,5,0xc08162);rect(g,x+13,y+30,3,11,0xc38b67);rect(g,x+12,y+23,20,3,0x4c493f);
    for(let i=0;i<9;i++){const px=x+5+(i*11)%29,py=y+3+(i*7)%22;rect(g,px,py,9,5,0x456958);rect(g,px+2,py-2,5,8,0x5f8b60);rect(g,px+2,py,3,2,0x89a46c);}return;
  }
  if(f.kind==='track'){
    rect(g,x,y,w,h,0x52627e);rect(g,x+2,y+2,w-4,h-4,0xd0d8e8);rect(g,x+5,y+5,w-10,h-10,0x728da4);rect(g,x+7,y+7,w-14,h-14,0x637a97);
    for(let i=0;i<=circuit.lanes;i++){g.lineStyle(2,0x354b52).strokeRoundedRect(x+14+i*8,y+14+i*8,w-28-i*16,h-28-i*16,32-i*4);g.lineStyle(1,0xdce2d4).strokeRoundedRect(x+15+i*8,y+13+i*8,w-28-i*16,h-28-i*16,32-i*4);}
    for(let i=0;i<6;i++)for(let j=0;j<2;j++)rect(g,x+98+j*3,y+13+i*6,3,6,(i+j)%2?0xeff1da:0x3c4755);
    rect(g,x+116,y+64,59,20,0xe2d4ac);label(scene,x+122,y+67,'リーフループ',8,'#4b605b',f.y+f.h+1);
    for(const [cx,cy,col] of [[x+70,y+14,0xbc5c50],[x+190,y+29,0x6499bb]]){rect(g,cx,cy,10,4,col);rect(g,cx+1,cy-2,2,2,ink);rect(g,cx+6,cy+4,2,2,ink);}return;
  }
  rect(g,x,y,w,h,palette.outline);rect(g,x+2,y+2,w-4,h-5,palette.metal);rect(g,x+3,y+3,w-6,3,palette.metalLight);rect(g,x+3,y+h-8,w-6,5,palette.metalShade);
  rect(g,x+3,y+5,2,h-13,0xd2d9e9);rect(g,x+w-5,y+5,2,h-13,0x7889a9);
  if(f.kind==='shelf'){
    for(let row=0;row<3;row++){
      const sy=y+7+row*32;rect(g,x+7,sy,w-14,25,palette.shelfBack);
      for(let col=0;col<4;col++)kitBox(g,x+9+col*21,sy+3,18,18,row+col+(x%3));
      rect(g,x+6,sy+24,w-12,2,0xe4e7f4);rect(g,x+6,sy+26,w-12,3,0x889bb5);
      for(let col=0;col<4;col++){rect(g,x+12+col*21,sy+25,11,2,0xfff4d5);rect(g,x+16+col*21,sy+25,3,1,0xa48a9b);}
    }
    rect(g,x+7,y+h-14,w-14,5,0xdfe8f2);label(scene,x+12,y+h-14,f.label.includes('モーター')?'モーター・ギア':'タイヤ・足まわり',6,'#41526e',f.y+f.h+1);
  }else{
    rect(g,x+12,y+10,117,49,0x376b64);for(let i=0;i<7;i++)rect(g,x+15+i*16,y+13,1,42,0x507f70);
    for(let i=0;i<3;i++)rect(g,x+16,y+14+i*14,109,1,0x507f70);
    // 作業中のマシンも1〜2ドット単位のノーズ・カウル・車輪で描く。
    rect(g,x+45,y+20,53,3,0x273e49);rect(g,x+45,y+46,53,3,0x273e49);
    rect(g,x+55,y+25,35,17,0xa24548);rect(g,x+60,y+23,24,21,0xc76959);rect(g,x+65,y+21,13,25,0xe9916e);
    rect(g,x+65,y+27,13,8,0x344b5b);rect(g,x+67,y+27,8,3,0x86c0c3);rect(g,x+68,y+37,7,7,0xf0dbaf);
    for(const px of [x+50,x+87])for(const py of [y+23,y+39]){rect(g,px,py,6,7,0x273744);rect(g,px+1,py+2,2,3,0xa9b9b6);}
    for(const px of [x+45,x+94])for(const py of [y+19,y+46]){rect(g,px,py,4,4,0xccc8b0);rect(g,px+1,py+1,2,1,0x5e6870);}
    rect(g,x+22,y+21,6,18,0xb1bac0);rect(g,x+22,y+21,6,5,0xb35d52);rect(g,x+31,y+21,6,18,0xb1bac0);rect(g,x+31,y+21,6,5,0xb35d52);
    rect(g,x+145,y+16,3,32,0xbec3ba);rect(g,x+141,y+44,10,5,0x9c5252);rect(g,x+161,y+22,3,23,0xbec3ba);rect(g,x+157,y+16,11,9,0x5d6672);
    rect(g,x+139,y+54,35,6,0xd8c694);for(let i=0;i<8;i++)rect(g,x+140+i*4,y+54,1,3,0x766c5c);
    rect(g,x+12,y+h-22,w-24,9,0x9aaac5);rect(g,x+12,y+h-22,w-24,1,0xe8edf5);rect(g,x+42,y+h-21,16,2,0x536581);rect(g,x+130,y+h-21,16,2,0x536581);
  }
}

export function createPeopleTextures(scene:Phaser.Scene){
  for(const kind of ['player','owner','rival','guide','mechanic'] as PersonKind[])for(const direction of ['down','up','left','right'] as Facing[])for(let frame=0;frame<4;frame++){
    const key=`person-${kind}-${direction}-${frame}`;
    if(scene.textures.exists(key))continue;
    const texture=scene.textures.createCanvas(key,personSpriteSize.width,personSpriteSize.height)!;
    paintPixels(texture.context,personDrawing(kind,direction,frame));
    texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
  }
}
