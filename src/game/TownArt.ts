import Phaser from 'phaser';
import { isVenueOpen, townVenues, townSize, townRoads, townBlocks, type WorldProgress, type TownVenue } from '../data/world';

const ink=0x363747;
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
   r(v.x-24,v.y-65,v.w+48,v.h+118,v.kind==='stadium'?'#a7aaa0':'#b7b197');
   r(cx-28,Math.min(cy,road),56,Math.abs(cy-road),'#b7b197');
   for(let yy=Math.min(cy,road);yy<Math.max(cy,road);yy+=13){r(cx-26,yy,52,1,'#d3c9a8');r(cx,yy,1,12,'#969b89');}
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
 for(const [index,venue] of townVenues.entries())drawBuilding(scene,venue,index,isVenueOpen(venue,progress));
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
 const g=scene.add.graphics().setDepth(y+10),r=(a:number,b:number,w:number,h:number,c:number)=>g.fillStyle(c).fillRect(a,b,w,h);
 g.fillStyle(0x35464a,.22).fillEllipse(x+8,y+8,56,17);r(x-5,y-35,11,45,0x62505a);r(x-2,y-32,4,39,0xa18364);
 for(let i=0;i<9;i++){const xx=x-35+(i*19)%45,yy=y-76+(i*13)%38,w=26+i%3*3;r(xx+6,yy,w-12,4,0x3d6357);r(xx+2,yy+4,w-3,23,0x3d6357);r(xx,yy+9,w,12,0x3d6357);r(xx+5,yy+2,w-10,8,0x9aaf72);r(xx+3,yy+9,w-8,13,0x72955f);for(let j=0;j<4;j++)r(xx+6+j*4,yy+7+j%2*5,3,2,0xb0bc7d);}
}
function lamp(scene:Phaser.Scene,x:number,y:number){const g=scene.add.graphics().setDepth(y+4);g.fillStyle(0x444658).fillRect(x-3,y-56,6,60).fillRect(x-10,y-58,20,4);g.fillStyle(0xb6b3a0).fillRect(x-1,y-53,2,54);g.fillStyle(0xffdf9c).fillRect(x-7,y-66,14,9);g.fillStyle(0x575568).fillRect(x-9,y-69,18,3);}
function drawBuilding(scene:Phaser.Scene,v:TownVenue,index:number,open:boolean){
 const {x,y,w,h}=v,g=scene.add.graphics().setDepth(y+h),r=(a:number,b:number,ww:number,hh:number,c:number,alpha=1)=>g.fillStyle(c,alpha).fillRect(Math.round(a),Math.round(b),ww,hh);
 const label=(xx:number,yy:number,s:string,size:number,color='#f5e9c8')=>scene.add.text(xx,yy,s,{fontFamily:'"Noto Sans JP",sans-serif',fontSize:`${size}px`,fontStyle:'bold',color,resolution:3}).setOrigin(.5,0).setDepth(y+h+2);
 const stadium=v.kind==='stadium',roof=[0x60758a,0x738b81,0x9d8063,0x7b7695][index%4];
 r(x+15,y+15,w+6,h+7,0x333849,.3);r(x,y,w,h,ink);r(x+4,y+3,w-8,h-7,stadium?0xbec3c4:0xd3c4a5);
 if(stadium){
  // 大型の多層アリーナ。模型店より遥かに高い基壇、観客窓、塔、巨大看板。
  r(x-9,y-32,w+18,84,0x464c5f);r(x-5,y-38,w+10,76,0xd3d6cd);r(x+6,y-47,w-12,10,0x939da4);r(x+9,y-45,w-18,3,0xe5e4d5);
  for(let yy=y-25;yy<y+101;yy+=35){r(x+7,yy,w-14,26,0x788994);for(let xx=x+12;xx<x+w-12;xx+=26){r(xx,yy+3,19,16,0x344f68);r(xx+2,yy+4,15,5,0xa4c8c4);r(xx+3,yy+13,13,2,0x628d9e);}r(x+4,yy+25,w-8,5,0xe1d8bc);}
  r(x+30,y-24,w-60,80,0x4a586b);r(x+35,y-20,w-70,72,v.color);r(x+40,y-16,w-80,4,0xd7d5bb);
  // 屋上のトロフィーとチェッカー。
  const cx=x+w/2;r(cx-14,y-65,28,31,0x9f824c);r(cx-11,y-64,22,21,0xe9ce83);r(cx-7,y-62,5,16,0xffe9ad);r(cx-3,y-44,6,13,0xc0a064);r(cx-15,y-32,30,5,0x786d62);
  for(const bx of [x+18,x+w-36]){r(bx,y-12,18,63,ink);for(let row=0;row<6;row++)for(let col=0;col<2;col++)r(bx+col*8+1,y-10+row*9,8,9,(row+col)%2?0xe0ded1:0x424c61);}
  // 両翼の塔、光る吹抜け、支柱の陰影。
  for(const bx of [x-8,x+w-36]){r(bx,y+106,44,h-106,0x5b6477);r(bx+4,y+108,36,h-112,0xdad5c0);r(bx+9,y+113,7,h-119,0xf4ead1);r(bx+29,y+113,7,h-119,0x9d9d99);r(bx-2,y+102,48,8,0x8d9199);}
  r(x+45,y+124,w-90,h-128,0x3d4b61);for(let xx=x+51;xx<x+w-52;xx+=24){r(xx,y+129,20,h-138,0x7eacb5);r(xx+2,y+130,4,h-143,0xc4d7cb);}
  r(x+55,y+h-45,w-110,38,0x464f62);for(let i=0;i<4;i++)r(x+53-i*4,y+h-8+i*5,w-106+i*8,4,i%2?0xa7acaa:0xe3d9be);
  label(cx,y+3,v.name,22);label(cx,y+34,'OFFICIAL RACE ARENA',10,'#e2d7ab');
  r(x+40,y+73,w-80,22,0xd8d6c0);
  label(cx,y+78,v.id==='stadium-10'?'緑川グランプリ・決勝会場':v.id==='stadium-9'?'第3公式大会・星空テクニカル杯':'公式ミニ四駆レース会場',11,'#34485c');
 }else{
  // 二階建ての模型店。軒・屋上機器・店名・ショーケース。
  if(v.id==='atelier'){r(x-8,y-42,w+16,h+50,0x817099);r(x-6,y-40,w+12,h+46,0xdfc47f);r(x-4,y-38,w+8,h+42,0x4d4762);}
  r(x-6,y-28,w+12,35,ink);r(x-3,y-32,w+6,31,roof);r(x+3,y-35,w-6,4,0xa7b2b0);
  for(let yy=y-28;yy<y-2;yy+=7)for(let xx=x;xx<x+w;xx+=14){r(xx,yy,12,2,0xa1a9ac);r(xx+11,yy+2,2,4,0x4c566d);}
  r(x+16,y-55,34,24,0x656a76);r(x+19,y-53,28,16,0xc2c5bb);for(let i=0;i<4;i++)r(x+22+i*6,y-50,2,10,0x858e97);
  for(let xx=x+12;xx<x+w-15;xx+=35){r(xx,y+14,26,25,0x65687a);r(xx+2,y+16,22,19,0x86afb3);r(xx+4,y+17,4,16,0xd0d9c2);r(xx+12,y+16,1,21,0xd4c7a7);}
  r(x-3,y+43,w+6,5,0x7e7269);r(x+7,y+49,w-14,27,0x6a5d60);r(x+10,y+51,w-20,22,0xe9d6aa);label(x+w/2,y+54,v.name,15,'#4b4c5e');
  for(let i=0;i<12;i++){r(x+4+i*(w-8)/12,y+79,(w-8)/12,6,i%2?0xead9b4:v.color);r(x+4+i*(w-8)/12,y+85,(w-8)/12-1,4,i%2?0xc4b392:roof);}
  for(const wx of [x+12,x+w-62]){r(wx,y+93,50,36,0x5a5968);r(wx+3,y+95,44,29,0x82a8ae);r(wx+5,y+96,5,26,0xc9d6c2);for(let i=0;i<4;i++){r(wx+5+i*10,y+115,8,8,[0xb86e76,0xd9b775,0x7591b6,0x7a9c83][i]);r(wx+6+i*10,y+116,6,2,0xf4ddaf);}}
  const door=x+w/2-14;r(door,y+91,28,h-93,0x485b69);r(door+3,y+94,22,24,0xa2c7c1);r(door+4,y+94,4,22,0xd2dfc8);r(door+22,y+123,3,3,0xf0d38f);
  r(x+4,y+h-7,w-8,6,0x928779);r(x+w-9,y+5,3,h-8,0x83868b);
  for(const px of [x+6,x+w-24]){r(px,y+h-14,18,12,0x98705b);for(let i=0;i<4;i++){r(px+2+i*4,y+h-20,3,8,0x597d62);r(px+2+i*4,y+h-22+i%2*2,3,3,i%2?0xe0bc7e:0xd19ba3);}}
 }
 const entry=v.entrance==='south'?y+h+27:y-56;
 if(open){label(x+w/2,entry,'▼ 入場する',12,'#314c54');}
 else{r(x+w/2-60,y+h-28,120,17,0x4a5366);label(x+w/2,y+h-26,v.shopId==='hinata'?'紹介状が必要':v.id==='wakaba'?'公式杯で入賞':v.kind==='stadium'?'出場権が必要':'準備中',10);}
 for(const bx of [x-20,x+w+14]){lamp(scene,bx,y+h+18);}
}
