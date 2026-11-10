import {drawOutdoorCourse} from './OutdoorCourseArt';
import {drawVenueFacade} from './VenueFacadeArt';
import Phaser from 'phaser';
import {isVenueOpen,townVenues,townSize,townRoads,townBlocks,type WorldProgress} from '../data/world';
import {artNoise,paintPixelTree} from './PixelArtMaterials';
import {SceneryPen} from './SceneryCanvas';

/** Terrain is baked once. Pixel clusters follow a fixed, upper-left daylight. */
function ground(c:CanvasRenderingContext2D){
 const p=new SceneryPen(c),r=p.rect.bind(p),noise=artNoise;
 r(0,0,townSize.width,townSize.height,'#788f62');
 // Wide, quiet colour clusters keep the dense tufts from becoming visual noise.
 for(let y=0;y<townSize.height;y+=56)for(let x=0;x<townSize.width;x+=64){const n=noise(x,y),color=['#7b9364','#758d60','#7d9467','#748c60'][n%4];for(let row=0;row<6;row++){const inset=[16,7,2,0,5,13][row]+(noise(x,row)%3)*2;r(x+inset,y+row*7,54-inset*2,7,color);for(let edge=0;edge<3;edge++){r(x+inset-2-edge*2,y+row*7+edge*2,2,2,edge%2?color:'#788f62');r(x+54-inset+edge*2,y+row*7+2+edge,2,2,color);}}}
 for(let y=0;y<townSize.height;y+=9)for(let x=0;x<townSize.width;x+=11){const n=noise(x,y);if(n%5>1)continue;const xx=x+n%5,yy=y+(n>>>4)%4;
  r(xx,yy+2,4,1,'#617d52');r(xx+1,yy,1,3,'#a0af77');r(xx+3,yy-1,1,3,'#8da66d');if(n%13===0)r(xx+1,yy+4,2,1,'#bdbe87');
 }
 // Stepped stone shore, reeds and broken reflections.
 for(let y=0;y<townSize.height;y+=8){const shore=townSize.width-210+Math.round(Math.sin(y/90)*12/2)*2;r(shore-24,y,40,8,'#87926c');r(shore-12,y,25,8,'#b4ab7c');r(shore-3,y,13,8,'#546c68');r(shore+5,y,townSize.width-shore-5,8,'#427e91');r(shore+12,y,townSize.width-shore-12,3,'#5798a6');
  for(let x=shore+25;x<townSize.width;x+=37){const n=noise(x,y);r(x+n%11,y+4,14+n%9,1,'#8ec3be');r(x+7,y+6,8,1,'#2e677f');if(n%9===0){r(shore-13,y-3,2,10,'#486c53');r(shore-10,y-5,1,11,'#9aa372');}}
 }
 const road=(x:number,y:number,w:number,h:number)=>{
  r(x+4,y+5,w,h,'#34474a55');r(x,y,w,h,'#414f55');r(x+3,y+3,w-6,h-6,'#59666a');r(x+7,y+7,w-14,h-14,'#626f72');
  for(let yy=y+10;yy<y+h-7;yy+=11)for(let xx=x+10;xx<x+w-7;xx+=13){const n=noise(xx,yy);if(n%3===0)r(xx,yy,2,1,n%2?'#85918a':'#51646a');}
  // Irregular aggregate, tire polishing and repairs replace the flat asphalt fill.
  for(let yy=y+8;yy<y+h-8;yy+=7)for(let xx=x+8;xx<x+w-8;xx+=9){const n=noise(xx,yy,91);if(n%4===0)continue;const px=xx+n%6,py=yy+(n>>>5)%5;r(px,py,1+n%3,1,n%3===0?'#abb0a336':n%2?'#34494e36':'#d4c9a21b');if(n%11===0)r(px+1,py+1,2,1,'#253b4230');}
  for(let yy=y+20;yy<y+h-16;yy+=67)for(let xx=x+26;xx<x+w-24;xx+=83){const n=noise(xx,yy,193);if(n%5)continue;const px=xx+n%13,py=yy+(n>>>6)%14;r(px,py,9+n%14,1,'#283f4626');r(px+2,py+1,5+n%9,1,'#aab0a11b');}
  // Raised curbs, chipped paint and paired gutter lines give every road a profile.
  r(x,y,w,3,'#c8c2a0');r(x,y+3,w,1,'#e0d3a5');r(x,y+4,2,h-8,'#c8c39c');r(x+w-3,y+4,3,h-8,'#8e9988');r(x,y+h-4,w,1,'#a7a995');r(x,y+h-3,w,3,'#77877f');
  for(let yy=y+12;yy<y+h-12;yy+=22){r(x+5,yy,2,8,'#30454b');r(x+6,yy+1,1,6,'#abb1a3');r(x+w-8,yy,2,8,'#30454b');r(x+w-7,yy+1,1,6,'#abb1a3');}
 };
 for(const x of townRoads.vertical){road(x-70,72,140,2250);for(let y=88;y<2320;y+=30){r(x-2,y,4,13,'#c9bd8d');r(x-1,y,1,11,'#e4d5a5');for(const xx of [x-70,x+63]){r(xx,y,7,1,'#6e8279');r(xx,y+1,7,1,'#d8cfaa');}}
  for(let y=185;y<2290;y+=210){r(x+53,y,9,17,'#3d535a');for(let i=0;i<4;i++)r(x+54,y+2+i*4,7,1,'#85958e');}
 }
 for(const y of townRoads.horizontal){road(64,y-70,townSize.width-320,140);for(let x=80;x<townSize.width-256;x+=30){r(x,y-2,13,4,'#c9bd8d');r(x,y-2,12,1,'#e2d3a2');for(const yy of [y-70,y+63])r(x,yy,1,7,'#70847d');}}
 for(const x of townRoads.vertical)for(const y of townRoads.horizontal){r(x-53,y-53,106,106,'#667377');for(let i=0;i<5;i++){r(x-44+i*19,y-64,9,30,'#d8d1b0');r(x-44+i*19,y+34,9,30,'#d8d1b0');}p.ellipse(x+29,y+20,9,7,'#485e64');p.ellipse(x+29,y+19,8,6,'#879188');for(let i=0;i<3;i++)r(x+24,y+16+i*3,10,1,'#596f70');}
 for(const v of townVenues){
  const cx=v.x+v.w/2,cy=v.entrance==='south'?v.y+v.h+30:v.y-30,roadY=townRoads.horizontal.reduce((a,b)=>Math.abs(b-cy)<Math.abs(a-cy)?b:a);
  const pad=v.kind==='outdoor'?{x:v.x-8,y:v.y-8,w:v.w+16,h:v.h+28}:{x:v.x-24,y:v.y-65,w:v.w+48,h:v.h+118};
  r(pad.x+3,pad.y+4,pad.w,pad.h,'#506d4e55');r(pad.x,pad.y,pad.w,pad.h,'#b0af8c');
  // Broad offset stone slabs, varied aggregate and worn corners feel like a real curb walk.
  for(let yy=pad.y;yy<pad.y+pad.h;yy+=18){const row=Math.floor((yy-pad.y)/18);for(let xx=pad.x-(row%2)*15;xx<pad.x+pad.w;xx+=36){const n=noise(xx,yy,43),left=Math.max(pad.x+1,xx+1),width=Math.min(34,pad.x+pad.w-left-1);if(width<4)continue;const color=['#b7b29a','#acae98','#c1baa0','#a9ad9a'][n%4];r(left,yy+1,width,16,color);r(left,yy+1,width,1,'#dad3b4');r(left,yy+15,width,1,'#858f7f');r(left+1,yy+2,width-2,1,'#c9c3a9');if(n%3===0){r(left+4+n%11,yy+5+n%4,3+n%6,1,'#e1d8b327');r(left+14,yy+10,2,1,'#66796b38');}if(n%7===0){r(left+width-5,yy+7,2,1,'#697b6d70');r(left+width-4,yy+8,1,2,'#697b6d70');}}}
  const top=Math.min(cy,roadY),bottom=Math.max(cy,roadY);r(cx-30,top,60,bottom-top,'#788572');r(cx-28,top,56,bottom-top,'#aea98a');
  for(let yy=top;yy<bottom;yy+=18){for(let col=0;col<2;col++){const xx=cx-27+col*27,n=noise(xx,yy,61),tone=['#bbb69d','#b0ae96','#c5bda2'][n%3];r(xx+1,yy+1,25,16,tone);r(xx+1,yy+1,25,1,'#ded3b0');r(xx+1,yy+15,25,1,'#89917e');if(n%3===0){r(xx+5+n%8,yy+5,5,1,'#e0d5b538');r(xx+17,yy+10,3,1,'#717d6f3d');}if(n%9===0){r(xx+20,yy+8,2,1,'#657964');r(xx+22,yy+7,1,2,'#657964');}}r(cx-29,yy+4,1,4,'#7d9663');r(cx+28,yy+9,1,3,'#6f8a5b');}
 }
 // House fronts have their own stone thresholds and planted yards.
 for(const b of townBlocks){
  const y=b.y+b.h,cx=b.x+b.w/2;
  r(b.x-6,y+3,b.w+12,32,'#6c845b');r(b.x-5,y+4,b.w+10,1,'#a3ad7b');
  for(let yy=y+6;yy<y+55;yy+=10){r(cx-10,yy,20,8,'#b8b496');r(cx-9,yy,18,1,'#d6caa7');r(cx-10,yy+7,20,1,'#8d977c');}
  for(const x of [b.x+1,b.x+b.w-19]){r(x,y+18,18,6,'#3e624b');r(x+1,y+17,16,3,'#769364');r(x+3,y+17,3,1,'#acb681');r(x+11,y+18,2,1,'#c2ae83');}
 }
 // Park pond: layered coping stones and reeds, instead of flat nested squares.
 r(1458,1588,184,136,'#6d826c');r(1460,1590,180,132,'#b1aa88');for(let x=1462;x<1640;x+=18){r(x,1591,16,5,'#d0c6a0');r(x,1715,16,5,'#999c83');}r(1470,1600,160,112,'#345e6b');r(1473,1603,154,106,'#578e92');r(1477,1606,146,98,'#6aa59f');
 for(let i=0;i<45;i++){const n=noise(i,42),x=1482+n%133,y=1610+(n>>>9)%84;r(x,y,6+n%10,1,'#a2c5b4');if(i%5===0){p.ellipse(x,y+6,4,2,'#527f62');r(x-1,y+5,2,1,'#a4b68a');}}
 for(let i=0;i<340;i++){const x=80+noise(i,1)%2820,y=100+noise(i,2)%2190;if(townVenues.some(v=>x>v.x-35&&x<v.x+v.w+35&&y>v.y-75&&y<v.y+v.h+70)||townRoads.vertical.some(v=>Math.abs(v-x)<86)||townRoads.horizontal.some(v=>Math.abs(v-y)<86))continue;
  r(x,y,1,6,'#496f50');r(x-2,y+2,2,1,'#a4b87d');r(x+1,y+3,2,1,'#7e9d64');r(x-1,y-2,3,1,i%3?'#d4c18c':'#cd9e99');r(x-2,y-1,5,1,i%3?'#e7d7a4':'#e1b7af');r(x,y-1,1,1,'#f2df9d');
 }
}
function house(scene:Phaser.Scene,block:typeof townBlocks[number],index:number){
 const {x,y,w,h}=block,key=`town-house-17-${index}-${w}-${h}`;
 if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,(w+40)*2,(h+64)*2)!;t.context.scale(2,2);const p=new SceneryPen(t.context),xx=15,yy=40;
  p.shadow(xx,yy,w,h);p.rect(xx,yy,w,h,'#37474b');p.gradient(xx+3,yy+2,w-6,h-5,['#c7b999','#a9bab0','#bfada4'][index%3],['#9e9d87','#839e96','#a29791'][index%3]);p.material(xx+3,yy+4,w-6,h-10,'stone',index);
  for(let row=0;row<3;row++)for(let col=xx+10;col<xx+w-25;col+=32){const wy=yy+12+row*28;if(wy+22>yy+h-8)continue;p.rect(col-2,wy-2,27,25,'#6d7d77');p.rect(col,wy,23,21,'#334b58');p.gradient(col+2,wy+2,19,15,'#b4d1c5','#628b96');p.poly([[col+3,wy+2],[col+10,wy+2],[col+5,wy+16],[col+3,wy+16]],'#e7ecd066');p.rect(col+10,wy+2,1,17,'#d9d4b6');p.rect(col+2,wy+10,19,1,'#899f97');p.rect(col-2,wy+21,27,3,'#d1c8a5');p.rect(col-1,wy+24,27,2,'#6d7f76');}
  p.poly([[xx-5,yy-25],[xx+w/2,yy-35],[xx+w+5,yy-25],[xx+w+5,yy+2],[xx-5,yy+2]],'#35464c');p.poly([[xx-3,yy-25],[xx+w/2,yy-32],[xx+w+3,yy-25],[xx+w+3,yy-2],[xx-3,yy-2]],['#667c7b','#6f8475','#927e70'][index%3]);p.material(xx-2,yy-24,w+4,24,'wood',index+71);
  for(let ty=yy-25,row=0;ty<yy-3;ty+=5,row++)for(let tx=xx-1-row%2*6;tx<xx+w;tx+=12){p.rect(tx,ty,10,1,'#adbaa4');p.rect(tx+1,ty+1,8,2,'#82968a');p.rect(tx+9,ty+1,1,3,'#435c60');p.rect(tx,ty+4,10,1,'#42585a');}
  p.rect(xx+w/2-2,yy-33,4,3,'#b9bda5');p.rect(xx-6,yy+1,w+12,3,'#43565a');p.rect(xx-5,yy+1,w+10,1,'#d2c7a1');p.rect(xx+w-5,yy+3,2,h-6,'#617e7c');p.rect(xx+w-4,yy+4,1,h-9,'#b4baa4');
  p.rect(xx+w/2-10,yy+h-25,20,25,'#465958');p.gradient(xx+w/2-7,yy+h-23,14,20,'#8eaaa0','#5b7d82');p.poly([[xx+w/2-6,yy+h-22],[xx+w/2-2,yy+h-22],[xx+w/2-5,yy+h-8],[xx+w/2-6,yy+h-8]],'#edf1dc55');p.rect(xx+w/2+4,yy+h-13,2,2,'#ddc69c');p.rect(xx+w/2-12,yy+h-2,24,3,'#c5bda0');p.material(xx+w/2-8,yy+h-22,16,17,'wood',index+101);p.plant(xx+10,yy+h-2,.6);
  // Residential details: awnings, letterboxes, laundry, flower boxes and bicycles.
  const door=xx+w/2;
  if(index%3===0){p.poly([[door-16,yy+h-30],[door+15,yy+h-30],[door+20,yy+h-22],[door-21,yy+h-22]],'#455f61');for(let i=0;i<5;i++)p.rect(door-18+i*7,yy+h-26,4,4,i%2?'#cbbd91':'#8d9990');p.rect(door-21,yy+h-22,41,2,'#c2b597');}
  p.rect(xx+w+5,yy+h-17,2,20,'#5c6b5c');p.rect(xx+w+1,yy+h-23,12,9,'#405d62');p.rect(xx+w+2,yy+h-22,10,6,index%2?'#a37a67':'#b5b9a0');p.rect(xx+w+3,yy+h-21,7,1,'#314b53');p.rect(xx+w+4,yy+h-19,3,1,'#e7d9af');
  if(index%3===1){const lx=xx+6,ly=yy+h-43;p.line([[lx,ly],[lx+46,ly+2]],'#485e5a',.5);for(let i=0;i<4;i++){const x=lx+3+i*11;p.rect(x,ly+2,8,11,['#d6c7ab','#889eab','#bc8e87','#90aa92'][i]);p.rect(x+1,ly+2,6,1,'#eaddbd');p.rect(x+2,ly+4,1,7,'#344c4b22');p.rect(x+3,ly,1,3,'#dbbd80');}}
  if(index%3===2){const bx=xx+w-18,by=yy+h+6;p.wheel(bx-9,by,7,'#a8b8ad');p.wheel(bx+12,by,7,'#a8b8ad');p.line([[bx-9,by],[bx-3,by-12],[bx+5,by],[bx-9,by],[bx+1,by-10],[bx+12,by]],'#7c4f57',1.5);p.line([[bx+12,by],[bx+9,by-15],[bx+14,by-15]],'#425e62',1);p.rect(bx-6,by-14,7,2,'#3a4f55');}
  for(const fx of [xx+6,xx+w-30]){p.rect(fx,yy+h+4,23,7,'#69775d');p.rect(fx,yy+h+4,23,1,'#b0ac7a');for(let j=0;j<5;j++){const xx=fx+2+j*4;p.rect(xx,yy+h,1,5,'#46674e');p.rect(xx-1,yy+h-2,3,2,j%2?'#d3b787':'#c68c8f');p.rect(xx,yy+h-2,1,1,'#f0d8a0');}}
  t.refresh();t.setFilter(Phaser.Textures.FilterMode.NEAREST);
 }
 scene.add.image(x-15,y-40,key).setOrigin(0).setDisplaySize(w+40,h+64).setDepth(y+h);
 if(w>=130){tree(scene,x-32,y+h+8);tree(scene,x+w+32,y+h+8);}else tree(scene,index%2?x-42:x+w+42,y+h-8);
}
export function drawTown(scene:Phaser.Scene,progress:WorldProgress){
 // 大きな街でも個々の地面テクスチャは2048px以下の幅に保つ。
 for(let x=0;x<townSize.width;x+=2048){const key=`midorikawa-ground-17-${x}`;if(!scene.textures.exists(key)){const texture=scene.textures.createCanvas(key,Math.min(2048,townSize.width-x),townSize.height)!;texture.context.translate(-x,0);ground(texture.context);texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.NEAREST);}scene.add.image(x,0,key).setOrigin(0).setDepth(-100);}

 townBlocks.forEach((block,index)=>house(scene,block,index));
 for(const venue of townVenues)if(venue.kind==='outdoor')drawOutdoorCourse(scene,venue,isVenueOpen(venue,progress));else drawVenueFacade(scene,venue,isVenueOpen(venue,progress));
 for(const x of townRoads.vertical)for(let y=160;y<2300;y+=180){if(townVenues.some(v=>Math.abs(x-v.x)<v.w+100&&y>v.y-80&&y<v.y+v.h+70))continue;tree(scene,x-100,y);lamp(scene,x+88,y+50);}
 for(let i=0;i<55;i++){const x=110+(i*437)%2780,y=210+(i*281)%1980;if([...townVenues,...townBlocks].some(v=>x>v.x-90&&x<v.x+v.w+90&&y>v.y-100&&y<v.y+v.h+90)||townRoads.vertical.some(v=>Math.abs(v-x)<100)||townRoads.horizontal.some(v=>Math.abs(v-y)<100))continue;tree(scene,x,y);tree(scene,x+28,y+34);}
 for(const y of [100,2290])for(let x=100;x<2930;x+=125)tree(scene,x,y);
 for(const [x,y] of [[1440,1570],[1660,1570],[1440,1740],[1660,1740],[670,830],[2200,2040]]){tree(scene,x,y);const key='park-bench-16';if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,112,64)!;t.context.scale(2,2);const p=new SceneryPen(t.context);p.shadow(3,14,45,10);for(const xx of [8,40]){p.rect(xx,14,3,15,'#3d5357');p.rect(xx+1,15,1,12,'#8fa19a');}p.rect(3,3,46,9,'#5c5d4a');for(let row=0;row<3;row++){p.gradient(4,3+row*3,44,2,'#c3ab7b','#947f5e');}p.gradient(3,14,46,7,'#d2b589','#8d7a5c');p.material(4,14,44,7,'wood',12);for(const xx of [8,41])p.rect(xx,15,1,1,'#e9d4a7');t.refresh();t.setFilter(Phaser.Textures.FilterMode.NEAREST);}scene.add.image(x+20,y+1,key).setOrigin(0).setDisplaySize(56,32).setDepth(y+24);}
}
function tree(scene:Phaser.Scene,x:number,y:number){
 if(townVenues.some(v=>v.kind==='outdoor'&&x>v.x-55&&x<v.x+v.w+55&&y>v.y-20&&y<v.y+v.h+95))return;
 const variant=artNoise(x,y)%7,key=`pixel-tree-16-${variant}`;if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,192,240)!;t.context.scale(2,2);paintPixelTree(t.context,variant);t.refresh();t.setFilter(Phaser.Textures.FilterMode.NEAREST);}
 scene.add.image(x-48,y-104,key).setOrigin(0).setDisplaySize(96,120).setDepth(y+10);
}
function lamp(scene:Phaser.Scene,x:number,y:number){const g=scene.add.graphics().setDepth(y+4);g.fillStyle(0x334951,.15).fillEllipse(x+7,y+2,25,6);g.fillStyle(0x354b56).fillRect(x-4,y-56,8,60).fillRect(x-12,y-59,24,5);g.fillStyle(0x8ca09a).fillRect(x-2,y-53,2,55);g.fillStyle(0xd2c7a4).fillRect(x-1,y-53,1,55);g.fillStyle(0xb7b59b).fillRect(x-8,y-67,16,10);g.fillStyle(0xf1d79d).fillRect(x-6,y-66,12,7);g.fillStyle(0xffefbd).fillRect(x-5,y-66,5,5);g.fillStyle(0x3a5260).fillRect(x-11,y-70,22,4).fillRect(x-8,y-72,16,2).fillRect(x-7,y,14,4);}
