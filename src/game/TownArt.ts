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
 for(let y=0;y<2400;y+=56)for(let x=0;x<3200;x+=64){const n=noise(x,y),color=['#7b9364','#758d60','#7d9467','#748c60'][n%4];for(let row=0;row<6;row++){const inset=[16,7,2,0,5,13][row]+(noise(x,row)%3)*2;r(x+inset,y+row*7,54-inset*2,7,color);for(let edge=0;edge<3;edge++){r(x+inset-2-edge*2,y+row*7+edge*2,2,2,edge%2?color:'#788f62');r(x+54-inset+edge*2,y+row*7+2+edge,2,2,color);}}}
 for(let y=0;y<2400;y+=9)for(let x=0;x<3200;x+=11){const n=noise(x,y);if(n%5>1)continue;const xx=x+n%5,yy=y+(n>>>4)%4;
  r(xx,yy+2,4,1,'#617d52');r(xx+1,yy,1,3,'#a0af77');r(xx+3,yy-1,1,3,'#8da66d');if(n%13===0)r(xx+1,yy+4,2,1,'#bdbe87');
 }
 // Stepped stone shore, reeds and broken reflections.
 for(let y=0;y<2400;y+=8){const shore=2990+Math.round(Math.sin(y/90)*12/2)*2;r(shore-24,y,40,8,'#87926c');r(shore-12,y,25,8,'#b4ab7c');r(shore-3,y,13,8,'#546c68');r(shore+5,y,3200-shore-5,8,'#427e91');r(shore+12,y,3200-shore-12,3,'#5798a6');
  for(let x=shore+25;x<3200;x+=37){const n=noise(x,y);r(x+n%11,y+4,14+n%9,1,'#8ec3be');r(x+7,y+6,8,1,'#2e677f');if(n%9===0){r(shore-13,y-3,2,10,'#486c53');r(shore-10,y-5,1,11,'#9aa372');}}
 }
 const road=(x:number,y:number,w:number,h:number)=>{
  r(x+3,y+4,w,h,'#3d55574d');r(x,y,w,h,'#495860');r(x+7,y+7,w-14,h-14,'#667377');
  for(let yy=y+10;yy<y+h-7;yy+=11)for(let xx=x+10;xx<x+w-7;xx+=13){const n=noise(xx,yy);if(n%3===0)r(xx,yy,2,1,n%2?'#85918a':'#51646a');}
  r(x,y,w,2,'#e0d3a5');r(x,y,2,h,'#c8c39c');r(x+w-4,y,4,h,'#8e9988');r(x,y+h-4,w,4,'#84928a');
 };
 for(const x of townRoads.vertical){road(x-70,72,140,2250);for(let y=88;y<2320;y+=30){r(x-2,y,4,13,'#c9bd8d');r(x-1,y,1,11,'#e4d5a5');for(const xx of [x-70,x+63]){r(xx,y,7,1,'#6e8279');r(xx,y+1,7,1,'#d8cfaa');}}
  for(let y=185;y<2290;y+=210){r(x+53,y,9,17,'#3d535a');for(let i=0;i<4;i++)r(x+54,y+2+i*4,7,1,'#85958e');}
 }
 for(const y of townRoads.horizontal){road(64,y-70,2880,140);for(let x=80;x<2944;x+=30){r(x,y-2,13,4,'#c9bd8d');r(x,y-2,12,1,'#e2d3a2');for(const yy of [y-70,y+63])r(x,yy,1,7,'#70847d');}}
 for(const x of townRoads.vertical)for(const y of townRoads.horizontal){r(x-53,y-53,106,106,'#667377');for(let i=0;i<5;i++){r(x-44+i*19,y-64,9,30,'#d8d1b0');r(x-44+i*19,y+34,9,30,'#d8d1b0');}p.ellipse(x+29,y+20,9,7,'#485e64');p.ellipse(x+29,y+19,8,6,'#879188');for(let i=0;i<3;i++)r(x+24,y+16+i*3,10,1,'#596f70');}
 for(const v of townVenues){
  const cx=v.x+v.w/2,cy=v.entrance==='south'?v.y+v.h+30:v.y-30,roadY=townRoads.horizontal.reduce((a,b)=>Math.abs(b-cy)<Math.abs(a-cy)?b:a);
  const pad=v.kind==='outdoor'?{x:v.x-8,y:v.y-8,w:v.w+16,h:v.h+28}:{x:v.x-24,y:v.y-65,w:v.w+48,h:v.h+118};
  r(pad.x+3,pad.y+4,pad.w,pad.h,'#506d4e55');r(pad.x,pad.y,pad.w,pad.h,'#b0af8c');
  for(let yy=pad.y;yy<pad.y+pad.h;yy+=12)for(let xx=pad.x;xx<pad.x+pad.w;xx+=22){const n=noise(xx,yy);r(xx+1,yy+1,Math.min(20,pad.x+pad.w-xx-1),10,n%3?'#bdb99a':'#aaa98a');r(xx+1,yy+1,Math.min(20,pad.x+pad.w-xx-1),1,'#d3cdac');}
  const top=Math.min(cy,roadY),bottom=Math.max(cy,roadY);r(cx-30,top,60,bottom-top,'#788572');r(cx-28,top,56,bottom-top,'#aea98a');
  for(let yy=top;yy<bottom;yy+=14){for(let col=0;col<2;col++){const xx=cx-27+col*27,n=noise(xx,yy);r(xx+1,yy+1,25,12,n%3?'#beb89a':'#b4ae90');r(xx+1,yy+1,25,1,'#dbd0ac');r(xx+1,yy+12,25,1,'#929a80');if(n%4===0)r(xx+5,yy+4,4,1,'#d6c9a527');}r(cx-29,yy+3,1,4,'#7d9663');r(cx+28,yy+8,1,3,'#6f8a5b');}
 }
 // Park pond: layered coping stones and reeds, instead of flat nested squares.
 r(1458,1588,184,136,'#6d826c');r(1460,1590,180,132,'#b1aa88');for(let x=1462;x<1640;x+=18){r(x,1591,16,5,'#d0c6a0');r(x,1715,16,5,'#999c83');}r(1470,1600,160,112,'#345e6b');r(1473,1603,154,106,'#578e92');r(1477,1606,146,98,'#6aa59f');
 for(let i=0;i<45;i++){const n=noise(i,42),x=1482+n%133,y=1610+(n>>>9)%84;r(x,y,6+n%10,1,'#a2c5b4');if(i%5===0){p.ellipse(x,y+6,4,2,'#527f62');r(x-1,y+5,2,1,'#a4b68a');}}
 for(let i=0;i<340;i++){const x=80+noise(i,1)%2820,y=100+noise(i,2)%2190;if(townVenues.some(v=>x>v.x-35&&x<v.x+v.w+35&&y>v.y-75&&y<v.y+v.h+70)||townRoads.vertical.some(v=>Math.abs(v-x)<86)||townRoads.horizontal.some(v=>Math.abs(v-y)<86))continue;
  r(x,y,1,6,'#496f50');r(x-2,y+2,2,1,'#a4b87d');r(x+1,y+3,2,1,'#7e9d64');r(x-1,y-2,3,1,i%3?'#d4c18c':'#cd9e99');r(x-2,y-1,5,1,i%3?'#e7d7a4':'#e1b7af');r(x,y-1,1,1,'#f2df9d');
 }
}
function house(scene:Phaser.Scene,block:typeof townBlocks[number],index:number){
 const {x,y,w,h}=block,key=`town-house-16-${index}-${w}-${h}`;
 if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,(w+40)*2,(h+64)*2)!;t.context.scale(2,2);const p=new SceneryPen(t.context),xx=15,yy=40;
  p.shadow(xx,yy,w,h);p.rect(xx,yy,w,h,'#37474b');p.gradient(xx+3,yy+2,w-6,h-5,['#c7b999','#a9bab0','#bfada4'][index%3],['#9e9d87','#839e96','#a29791'][index%3]);p.material(xx+3,yy+4,w-6,h-10,'stone',index);
  for(let row=0;row<3;row++)for(let col=xx+10;col<xx+w-25;col+=32){const wy=yy+12+row*28;if(wy+22>yy+h-8)continue;p.rect(col-2,wy-2,27,25,'#6d7d77');p.rect(col,wy,23,21,'#334b58');p.gradient(col+2,wy+2,19,15,'#b4d1c5','#628b96');p.poly([[col+3,wy+2],[col+10,wy+2],[col+5,wy+16],[col+3,wy+16]],'#e7ecd066');p.rect(col+10,wy+2,1,17,'#d9d4b6');p.rect(col+2,wy+10,19,1,'#899f97');p.rect(col-2,wy+21,27,3,'#d1c8a5');p.rect(col-1,wy+24,27,2,'#6d7f76');}
  p.poly([[xx-5,yy-25],[xx+w/2,yy-35],[xx+w+5,yy-25],[xx+w+5,yy+2],[xx-5,yy+2]],'#35464c');p.poly([[xx-3,yy-25],[xx+w/2,yy-32],[xx+w+3,yy-25],[xx+w+3,yy-2],[xx-3,yy-2]],['#667c7b','#6f8475','#927e70'][index%3]);
  for(let ty=yy-25,row=0;ty<yy-3;ty+=5,row++)for(let tx=xx-1-row%2*6;tx<xx+w;tx+=12){p.rect(tx,ty,10,1,'#adbaa4');p.rect(tx+1,ty+1,8,2,'#82968a');p.rect(tx+9,ty+1,1,3,'#435c60');p.rect(tx,ty+4,10,1,'#42585a');}
  p.rect(xx+w/2-2,yy-33,4,3,'#b9bda5');p.rect(xx-6,yy+1,w+12,3,'#43565a');p.rect(xx-5,yy+1,w+10,1,'#d2c7a1');p.rect(xx+w-5,yy+3,2,h-6,'#617e7c');p.rect(xx+w-4,yy+4,1,h-9,'#b4baa4');
  p.rect(xx+w/2-10,yy+h-25,20,25,'#465958');p.gradient(xx+w/2-7,yy+h-23,14,20,'#8eaaa0','#5b7d82');p.rect(xx+w/2+4,yy+h-13,2,2,'#ddc69c');p.rect(xx+w/2-12,yy+h-2,24,3,'#c5bda0');p.plant(xx+10,yy+h-2,.6);
  t.refresh();t.setFilter(Phaser.Textures.FilterMode.LINEAR);
 }
 scene.add.image(x-15,y-40,key).setOrigin(0).setDisplaySize(w+40,h+64).setDepth(y+h);
 tree(scene,x-21,y+h+8);tree(scene,x+w+20,y+h+8);
}
export function drawTown(scene:Phaser.Scene,progress:WorldProgress){
 const key='midorikawa-ground-16';if(!scene.textures.exists(key)){const texture=scene.textures.createCanvas(key,townSize.width,townSize.height)!;ground(texture.context);texture.refresh();}
 scene.add.image(0,0,key).setOrigin(0).setDepth(-100);
 townBlocks.forEach((block,index)=>house(scene,block,index));
 for(const venue of townVenues)if(venue.kind==='outdoor')drawOutdoorCourse(scene,venue);else drawVenueFacade(scene,venue,isVenueOpen(venue,progress));
 for(const x of townRoads.vertical)for(let y=160;y<2300;y+=180){if(townVenues.some(v=>Math.abs(x-v.x)<v.w+100&&y>v.y-80&&y<v.y+v.h+70))continue;tree(scene,x-100,y);lamp(scene,x+88,y+50);}
 for(let i=0;i<55;i++){const x=110+(i*437)%2780,y=210+(i*281)%1980;if([...townVenues,...townBlocks].some(v=>x>v.x-90&&x<v.x+v.w+90&&y>v.y-100&&y<v.y+v.h+90)||townRoads.vertical.some(v=>Math.abs(v-x)<100)||townRoads.horizontal.some(v=>Math.abs(v-y)<100))continue;tree(scene,x,y);tree(scene,x+28,y+34);}
 for(const y of [100,2290])for(let x=100;x<2930;x+=125)tree(scene,x,y);
 for(const [x,y] of [[1440,1570],[1660,1570],[1440,1740],[1660,1740],[670,830],[2200,2040]]){tree(scene,x,y);const key='park-bench-16';if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,112,64)!;t.context.scale(2,2);const p=new SceneryPen(t.context);p.shadow(3,14,45,10);for(const xx of [8,40]){p.rect(xx,14,3,15,'#3d5357');p.rect(xx+1,15,1,12,'#8fa19a');}p.rect(3,3,46,9,'#5c5d4a');for(let row=0;row<3;row++){p.gradient(4,3+row*3,44,2,'#c3ab7b','#947f5e');}p.gradient(3,14,46,7,'#d2b589','#8d7a5c');p.material(4,14,44,7,'wood',12);for(const xx of [8,41])p.rect(xx,15,1,1,'#e9d4a7');t.refresh();}scene.add.image(x+20,y+1,key).setOrigin(0).setDisplaySize(56,32).setDepth(y+24);}
}
function tree(scene:Phaser.Scene,x:number,y:number){
 if(townVenues.some(v=>v.kind==='outdoor'&&x>v.x-55&&x<v.x+v.w+55&&y>v.y-20&&y<v.y+v.h+95))return;
 const variant=artNoise(x,y)%7,key=`pixel-tree-16-${variant}`;if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,192,240)!;t.context.scale(2,2);paintPixelTree(t.context,variant);t.refresh();}
 scene.add.image(x-48,y-104,key).setOrigin(0).setDisplaySize(96,120).setDepth(y+10);
}
function lamp(scene:Phaser.Scene,x:number,y:number){const g=scene.add.graphics().setDepth(y+4);g.fillStyle(0x334951,.15).fillEllipse(x+7,y+2,25,6);g.fillStyle(0x354b56).fillRect(x-4,y-56,8,60).fillRect(x-12,y-59,24,5);g.fillStyle(0x8ca09a).fillRect(x-2,y-53,2,55);g.fillStyle(0xd2c7a4).fillRect(x-1,y-53,1,55);g.fillStyle(0xb7b59b).fillRect(x-8,y-67,16,10);g.fillStyle(0xf1d79d).fillRect(x-6,y-66,12,7);g.fillStyle(0xffefbd).fillRect(x-5,y-66,5,5);g.fillStyle(0x3a5260).fillRect(x-11,y-70,22,4).fillRect(x-8,y-72,16,2).fillRect(x-7,y,14,4);}
