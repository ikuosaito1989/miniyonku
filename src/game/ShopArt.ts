import Phaser from 'phaser';
import type { Fixture } from '../data/shop';
import { circuit } from '../data/circuit';
import { story } from '../data/story';

export type Facing='down'|'up'|'left'|'right';
export type PersonKind='player'|'owner'|'rival';
const ink=0x393549;
function rect(g:Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,color:number){g.fillStyle(color).fillRect(Math.round(x),Math.round(y),w,h);}
function label(scene:Phaser.Scene,x:number,y:number,text:string,size=10,color='#f5ead0',depth=0){return scene.add.text(x,y,text,{fontFamily:'"Noto Sans JP", monospace',fontSize:`${size}px`,color,resolution:2}).setDepth(depth);}

export function drawShopRoom(scene:Phaser.Scene){
  const g=scene.add.graphics();
  rect(g,0,0,960,640,0x303445);rect(g,40,35,880,85,0xe5dcc3);
  for(let x=42;x<920;x+=6)rect(g,x,36,1,69,x%12?0xd9ceb6:0xf0e5cb);
  rect(g,40,105,880,6,0x716d68);rect(g,40,111,880,9,0x494e56);
  // 細かな木目・継ぎ目・小さな釘。反復柄に固定値を使い再描画も同じ見た目に。
  for(let y=120;y<600;y+=16)for(let x=40;x<920;x+=40){
    const seed=(x*17+y*13)%31;
    rect(g,x,y,40,16,[0xc2a17a,0xcaaa83,0xbda079,0xd0b18b][seed%4]);
    rect(g,x,y+15,40,1,0xad8d6c);rect(g,x+39,y,1,15,0xb89973);
    rect(g,x+3,y+4,12+seed%15,1,0xd3b78f);rect(g,x+8,y+10,8+seed%20,1,0xb79772);
    rect(g,x+2,y+2,1,1,0x9d836b);rect(g,x+36,y+12,1,1,0x9d836b);
  }
  for(const x of [423,546]){
    rect(g,x-3,43,110,58,0x8e8070);rect(g,x,45,104,52,0xf3ead2);rect(g,x+4,49,96,44,0x6d9ca9);
    for(let i=0;i<4;i++)rect(g,x+5+i*24,50,23,25,0xa7ced0);
    rect(g,x+5,77,94,15,0x87b8bf);rect(g,x+47,48,4,47,0xeee1be);rect(g,x+3,72,99,3,0xe6dbc3);
    rect(g,x-5,98,114,5,0xb3a18a);
  }
  rect(g,81,46,263,50,0x69645d);rect(g,84,48,257,45,0x34575c);rect(g,87,51,251,1,0x77918a);
  label(scene,103,53,story.shop,23);label(scene,106,80,`日本・${story.town}　小さな走り、大きな夢`,8,'#d1dbbc');
  // 壁のパーツ吊り下げ台。
  rect(g,690,46,160,52,0xae9574);rect(g,693,49,154,46,0xc6b696);
  for(let x=698;x<844;x+=8)for(let y=53;y<93;y+=8)rect(g,x,y,1,1,0x8f826d);
  for(let i=0;i<9;i++){const x=698+i*16;rect(g,x,59,12,25,[0xe4cd8b,0x9aafb9,0xc2826c][i%3]);rect(g,x+3,55,6,3,ink);rect(g,x+2,65,8,13,0xeee5ce);g.lineStyle(2,0x5b6874).strokeCircle(x+6,71,3);}
  label(scene,714,87,'モーター・工具',7,'#4c514f');
  rect(g,860,53,40,44,0x85725f);rect(g,863,56,34,38,0xf3e7c9);label(scene,866,57,'走行会',9,'#aa5c50');label(scene,867,72,'日曜日',7,'#4e5b62');label(scene,867,83,'参加歓迎',6,'#4e5b62');
  // 入口マットと段差。
  rect(g,409,570,145,30,0x627d75);rect(g,412,573,139,24,0x738d7e);
  for(let y=575;y<596;y+=3)rect(g,415,y,133,1,0x667d72);
  rect(g,40,600,880,14,0x67574f);rect(g,40,600,880,2,0x9e8a70);label(scene,454,599,'いらっしゃいませ',7,'#eadbc2');
  // 通路の案内タイル。
  label(scene,702,281,'作業台 ↑',10,'#6b645a');label(scene,657,508,'店内走行コース',11,'#5d6056');
}

function kitBox(g:Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,variant:number){
  const color=[0xb65755,0x4e8197,0x6e8c69,0xc69a4e,0x8273a0][variant%5];
  rect(g,x+1,y+2,w,h,0x514a4a);rect(g,x,y,w,h,color);rect(g,x,y,w,2,0xf0e0b8);rect(g,x+2,y+4,w-4,h-7,0xe5d7b5);
  // 箱絵の小さなマシンとラベル。
  rect(g,x+4,y+7,w-9,3,color);rect(g,x+7,y+5,w-14,7,color);
  for(const px of [x+4,x+w-8]){rect(g,px,y+5,3,3,ink);rect(g,px,y+10,3,3,ink);}
  rect(g,x+3,y+h-4,w-7,1,0xf7edcf);rect(g,x+w-5,y+3,2,2,0xf5eccf);
}

export function drawShopFixture(scene:Phaser.Scene,f:Fixture){
  const g=scene.add.graphics().setDepth(f.y+f.h);const {x,y,w,h}=f;
  rect(g,x+5,y+h-2,w+3,9,0x8c806a);rect(g,x+9,y+h+7,w-4,3,0xa29379);
  if(f.kind==='plant'){
    rect(g,x+10,y+27,25,17,0x935a4b);rect(g,x+8,y+25,29,5,0xc08162);rect(g,x+13,y+30,3,11,0xc38b67);rect(g,x+12,y+23,20,3,0x4c493f);
    for(let i=0;i<9;i++){const px=x+5+(i*11)%29,py=y+3+(i*7)%22;rect(g,px,py,9,5,0x456958);rect(g,px+2,py-2,5,8,0x5f8b60);rect(g,px+2,py,3,2,0x89a46c);}return;
  }
  if(f.kind==='track'){
    rect(g,x,y,w,h,0x3a4b52);rect(g,x+3,y+3,w-6,h-6,0x718879);rect(g,x+7,y+7,w-14,h-14,0x557469);
    for(let i=0;i<=circuit.lanes;i++){g.lineStyle(2,0x354b52).strokeRoundedRect(x+14+i*8,y+14+i*8,w-28-i*16,h-28-i*16,32-i*4);g.lineStyle(1,0xdce2d4).strokeRoundedRect(x+15+i*8,y+13+i*8,w-28-i*16,h-28-i*16,32-i*4);}
    for(let i=0;i<6;i++)for(let j=0;j<2;j++)rect(g,x+98+j*3,y+13+i*6,3,6,(i+j)%2?0xeff1da:0x3c4755);
    rect(g,x+116,y+64,59,20,0xe2d4ac);label(scene,x+122,y+67,'リーフループ',8,'#4b605b',f.y+f.h+1);
    for(const [cx,cy,col] of [[x+70,y+14,0xbc5c50],[x+190,y+29,0x6499bb]]){rect(g,cx,cy,10,4,col);rect(g,cx+1,cy-2,2,2,ink);rect(g,cx+6,cy+4,2,2,ink);}return;
  }
  rect(g,x,y,w,h,0x594c49);rect(g,x+3,y+3,w-6,h-7,0x9b7659);rect(g,x+4,y+4,w-8,3,0xd0af81);rect(g,x+4,y+h-8,w-8,5,0x6c5147);
  if(f.kind==='shelf'){
    for(let row=0;row<3;row++){
      const sy=y+7+row*32;rect(g,x+7,sy,w-14,25,0x5e5753);
      for(let col=0;col<3;col++)kitBox(g,x+10+col*27,sy+3,23,18,row+col+(x%3));
      rect(g,x+6,sy+24,w-12,4,0xc3a275);rect(g,x+7,sy+28,w-14,2,0x77604d);
      for(let col=0;col<3;col++)rect(g,x+14+col*27,sy+25,14,2,0xf4e5bd);
    }
    rect(g,x+7,y+h-14,w-14,5,0xc2a277);label(scene,x+12,y+h-14,f.label.includes('モーター')?'モーター・ギア':'タイヤ・足まわり',6,'#4c4d4e',f.y+f.h+1);
  }else if(f.kind==='counter'){
    rect(g,x+7,y+7,w-14,31,0x66838a);rect(g,x+9,y+9,w-18,27,0x99b9b2);
    for(let i=0;i<5;i++)kitBox(g,x+15+i*34,y+14,27,16,i);
    rect(g,x+10,y+10,w-21,2,0xc4d5c4);rect(g,x+88,y+9,2,26,0xd7d7be);rect(g,x+174,y+9,2,26,0xd7d7be);
    rect(g,x+6,y+40,w-12,12,0x8c6b55);for(let i=0;i<4;i++){rect(g,x+12+i*53,y+42,47,7,0xa88360);rect(g,x+32+i*53,y+43,8,2,0x514e49);}
    rect(g,x+w-43,y-12,32,20,0x494e5c);rect(g,x+w-40,y-10,26,10,0xc2beb0);rect(g,x+w-37,y-8,18,5,0x476a64);for(let i=0;i<5;i++)rect(g,x+w-37+i*4,y+2,2,2,0xdbd5b9);
    label(scene,x+20,y+41,'こもれび模型店',7,'#f3dfb7',f.y+f.h+1);
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
    rect(g,x+12,y+h-22,w-24,9,0x866b56);rect(g,x+42,y+h-21,16,2,0x4c4c4e);rect(g,x+130,y+h-21,16,2,0x4c4c4e);
  }
}

export function createPeopleTextures(scene:Phaser.Scene){
  for(const kind of ['player','owner','rival'] as PersonKind[])for(const direction of ['down','up','left','right'] as Facing[])for(let frame=0;frame<4;frame++){
    const key=`person-${kind}-${direction}-${frame}`;
    if(scene.textures.exists(key))continue;
    const texture=scene.textures.createCanvas(key,24,32)!;const ctx=texture.context;
    const p=(x:number,y:number,w:number,h:number,color:string)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
    const skin='#edc5a2',shade='#c39076',hair=kind==='owner'?'#55545d':'#343443';
    const shirt=kind==='player'?'#477f9e':kind==='owner'?'#777c69':'#ab6757';
    const light=kind==='player'?'#6aa7b8':kind==='owner'?'#a4a68a':'#cf9680';
    const leg=frame===1?1:frame===3?-1:0;
    // 1ドット輪郭、髪の段差、頬・袖・靴まで描く24×32の原画。
    p(5,28,15,3,'#2e3543');p(6,24,5,5+leg,'#42495e');p(14,24,5,5-leg,'#42495e');p(6,29+leg,6,2,'#272e3d');p(14,29-leg,6,2,'#272e3d');
    p(5,15,15,11,'#303442');p(6,15,13,10,shirt);p(7,16,3,8,light);p(17,17,2,7,'#3b5363');p(7,24,11,1,'#c7b494');
    p(3,17+leg,3,7,shade);p(3,17+leg,2,5,skin);p(19,17-leg,3,7,shade);p(19,17-leg,2,5,skin);
    p(7,3,11,2,hair);p(5,5,15,8,hair);p(6,12,13,3,hair);p(7,6,11,10,shade);p(7,6,10,8,skin);p(8,15,8,2,skin);p(4,9,2,4,skin);p(19,9,2,4,shade);
    if(direction==='up'){
      p(6,5,13,9,hair);p(8,4,9,2,'#55505a');p(7,14,11,2,hair);p(9,17,7,1,light);
    }else if(direction==='down'){
      p(6,5,13,3,hair);p(6,7,3,3,hair);p(10,6,3,3,hair);p(15,6,4,2,hair);p(8,10,2,3,'#303341');p(15,10,2,3,'#303341');p(8,10,1,1,'#fff0d4');p(15,10,1,1,'#fff0d4');p(11,14,3,1,'#9f6c60');p(17,12,2,1,'#d8a18a');
    }else{
      const left=direction==='left';p(6,5,13,4,hair);p(left?15:6,8,4,6,hair);p(left?7:16,10,2,3,'#303341');p(left?5:18,12,2,2,skin);p(8,17,8,7,shirt);p(10,18,3,5,light);
    }
    if(kind==='player'){
      p(6,3,12,3,'#d2b36c');p(8,2,9,1,'#f2d38a');p(direction==='left'?3:direction==='right'?16:5,6,direction==='down'?15:6,2,'#ead08a');
      if(direction==='down'){p(9,18,7,3,'#e5e0c4');p(9,18,2,3,'#e6ad64');}
    }
    if(kind==='owner'){p(8,18,10,7,'#9d8362');p(9,19,8,1,'#c8ae7b');if(direction==='down'){p(7,10,5,3,'#5b5c62');p(14,10,5,3,'#5b5c62');p(12,11,2,1,'#5b5c62');p(8,11,3,1,'#b8c9c5');p(15,11,3,1,'#b8c9c5');}}
    texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}
