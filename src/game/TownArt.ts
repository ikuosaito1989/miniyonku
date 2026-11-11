import {drawOutdoorCourse} from './OutdoorCourseArt';
import {drawVenueFacade} from './VenueFacadeArt';
import Phaser from 'phaser';
import {isVenueOpen,townVenues,townSize,townRoads,townBlocks,townPlaza,townWalkBounds,townCivicPlaza,modelShops,type ShopId,type WorldProgress} from '../data/world';
import {artNoise,paintPixelTree} from './PixelArtMaterials';
import {SceneryPen} from './SceneryCanvas';
/** One raster pixel covers two map units; repeating vector detail avoids full-size terrain canvases. */
export const townGroundRasterScale=.5;
const townShopVariants:Partial<Record<ShopId,'amber'|'green'|'violet'|'red'|'teal'>>={hinata:'amber',wakaba:'green',yuunagi:'violet',akatsuki:'red',torque:'red',velocity:'teal',terrain:'green',endurance:'teal',atelier:'violet'};
function inCivicArtwork(x:number,y:number){return x>=townCivicPlaza.x&&x<=townCivicPlaza.x+townCivicPlaza.width&&y>=townCivicPlaza.y&&y<=townCivicPlaza.y+townCivicPlaza.height;}
function drawShopSign(scene:Phaser.Scene,venue:typeof townVenues[number]){
 if(!venue.shopId)return;
 const name=modelShops[venue.shopId].name,characters=[...name].length;
 // Fit even the long specialty-shop names between the crossed-wrench emblems.
 const fontSize=Math.max(8,Math.min(16,Math.floor(venue.w*.27/characters)));
 scene.add.text(venue.x+venue.w*.419,venue.y+venue.h*.505,name,{
  fontFamily:'sans-serif',fontSize:`${fontSize}px`,fontStyle:'bold',color:'#fff2cf',
  align:'center',stroke:'#18345f',strokeThickness:1,
 }).setOrigin(.5).setResolution(2).setDepth(venue.y+venue.h+14).setName(`town-shop-sign-${venue.shopId}`);
}
function drawCivicBuildings(scene:Phaser.Scene){
 const stadium=townVenues.find(v=>v.id==='stadium-5')!,shop=townVenues.find(v=>v.id==='komorebi')!;
 const arena=scene.add.image(stadium.x,stadium.y,'civic-arena-occlusion').setOrigin(0).setDisplaySize(stadium.w,stadium.h).setDepth(stadium.y+stadium.h+12);
 const storefront=scene.add.image(shop.x,shop.y,'civic-shop-occlusion').setOrigin(0).setDisplaySize(shop.w,shop.h).setDepth(shop.y+shop.h+12);
 scene.textures.get('civic-arena-occlusion').setFilter(Phaser.Textures.FilterMode.LINEAR);
 scene.textures.get('civic-shop-occlusion').setFilter(Phaser.Textures.FilterMode.LINEAR);
 arena.setName('civic-arena-foreground');storefront.setName('civic-shop-foreground');
 drawShopSign(scene,shop);
}
function drawModelShopSprite(scene:Phaser.Scene,venue:typeof townVenues[number],open:boolean){
 if(!venue.shopId){drawVenueFacade(scene,venue,open);return;}
 const palette=townShopVariants[venue.shopId],key=palette?`civic-shop-${palette}`:'civic-shop-occlusion';
 if(!scene.textures.exists(key)){drawVenueFacade(scene,venue,open);return;}
 scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
 scene.add.image(venue.x,venue.y,key).setOrigin(0).setDisplaySize(venue.w,venue.h).setDepth(venue.y+venue.h+12).setName(`town-shop-${venue.shopId}-${modelShops[venue.shopId].color.toString(16)}`);
 drawShopSign(scene,venue);
}

/** Terrain is baked once. Pixel clusters follow a fixed, upper-left daylight. */
function ground(c:CanvasRenderingContext2D,chunkX=0,chunkWidth=townSize.width,chunkY=0,chunkHeight=townSize.height){
 const p=new SceneryPen(c),r=p.rect.bind(p),noise=artNoise;
 const chunkEnd=chunkX+chunkWidth,chunkBottom=chunkY+chunkHeight;
 r(chunkX,chunkY,chunkWidth,chunkHeight,'#788f62');
 // Wide, quiet colour clusters keep the dense tufts from becoming visual noise.
 const firstGrassX=Math.max(0,Math.floor(chunkX/64)*64);
 for(let y=Math.floor(chunkY/56)*56;y<chunkBottom+56;y+=56)for(let x=firstGrassX;x<chunkEnd+64;x+=64){const n=noise(x,y),color=['#7b9364','#758d60','#7d9467','#748c60'][n%4];for(let row=0;row<6;row++){const inset=[16,7,2,0,5,13][row]+(noise(x,row)%3)*2;r(x+inset,y+row*7,54-inset*2,7,color);for(let edge=0;edge<3;edge++){r(x+inset-2-edge*2,y+row*7+edge*2,2,2,edge%2?color:'#788f62');r(x+54-inset+edge*2,y+row*7+2+edge,2,2,color);}}}
 // Larger clusters reduce busy pixel noise while retaining a natural ground rhythm.
 const firstTuftX=Math.max(0,Math.floor(chunkX/17)*17);
 for(let y=Math.floor(chunkY/18)*18;y<chunkBottom+18;y+=18)for(let x=firstTuftX;x<chunkEnd+17;x+=17){const n=noise(x,y);if(n%5>2)continue;const xx=x+n%5,yy=y+(n>>>4)%5;
  r(xx,yy+2,3+n%3,1,'#617d52');r(xx+1,yy,1,2+n%2,'#a0af77');r(xx+3,yy-1,1,2,'#8da66d');if(n%13===0)r(xx+1,yy+4,2,1,'#bdbe87');
 }
 // Stepped stone shore, reeds and broken reflections.
 for(let y=Math.floor(chunkY/8)*8;y<chunkBottom+8;y+=8){const shore=townSize.width-210+Math.round(Math.sin(y/90)*12/2)*2;r(shore-24,y,40,8,'#87926c');r(shore-12,y,25,8,'#b4ab7c');r(shore-3,y,13,8,'#546c68');r(shore+5,y,townSize.width-shore-5,8,'#427e91');r(shore+12,y,townSize.width-shore-12,3,'#5798a6');
  for(let x=shore+25;x<townSize.width;x+=37){const n=noise(x,y);r(x+n%11,y+4,14+n%9,1,'#8ec3be');r(x+7,y+6,8,1,'#2e677f');if(n%9===0){r(shore-13,y-3,2,10,'#486c53');r(shore-10,y-5,1,11,'#9aa372');}}
 }
 const sidewalk=(x:number,y:number,w:number,h:number,orientation:'v'|'h')=>{
  r(x+3,y+4,w,h,'#263b3b22');r(x,y,w,h,'#8d9a83');
  const cell=orientation==='v'?18:20;
  if(orientation==='v')for(let yy=Math.max(y+2,chunkY),row=0;yy<Math.min(y+h-2,chunkBottom);yy+=cell,row++)for(let xx=x+2;xx<x+w-2;xx+=16){const n=noise(xx,yy,221),ww=Math.min(14,x+w-xx-2);r(xx+1,yy+1,ww,cell-2,n%3?'#c2bea2':'#b8b79e');r(xx+1,yy+1,ww,1,'#e0d8bb');r(xx+1,yy+cell-2,ww,1,'#899482');if((row+Math.floor(xx/16))%2===0)r(xx+Math.floor(ww/2),yy+1,1,cell-3,'#89948266');}
  else for(let yy=Math.max(y+2,chunkY);yy<Math.min(y+h-2,chunkBottom);yy+=12)for(let xx=x+2;xx<x+w-2;xx+=cell){const n=noise(xx,yy,221),ww=Math.min(cell-2,x+w-xx-2);r(xx+1,yy+1,ww,9,n%3?'#c2bea2':'#b8b79e');r(xx+1,yy+1,ww,1,'#e0d8bb');r(xx+1,yy+9,ww,1,'#899482');if((Math.floor(yy/12)+Math.floor(xx/cell))%2===0)r(xx+1+Math.floor(ww/2),yy+1,1,8,'#89948266');}
  if(orientation==='v'){r(x,y,w,2,'#d6caa5');r(x+w-2,y,2,h,'#747e70');}
  else{r(x,y,w,2,'#d6caa5');r(x,y+h-2,w,2,'#747e70');}
 };
 const road=(x:number,y:number,w:number,h:number,trimLeft=true,trimRight=true,orientation:'v'|'h'='v')=>{
  if(orientation==='v'){sidewalk(x-42,y,36,h,'v');sidewalk(x+w+6,y,36,h,'v');}
  else{sidewalk(x,y-42,w,36,'h');sidewalk(x,y+h+6,w,36,'h');}
  r(x+4,y+5,w,h,'#34474a55');r(x,y,w,h,'#414f55');r(x+3,y+3,w-6,h-6,'#59666a');r(x+7,y+7,w-14,h-14,'#626f72');
  for(let yy=Math.max(y+10,chunkY);yy<Math.min(y+h-7,chunkBottom);yy+=11)for(let xx=x+10;xx<x+w-7;xx+=13){const n=noise(xx,yy);if(n%3===0)r(xx,yy,2,1,n%2?'#85918a':'#51646a');}
  // Irregular aggregate, tire polishing and repairs replace the flat asphalt fill.
  for(let yy=Math.max(y+8,chunkY);yy<Math.min(y+h-8,chunkBottom);yy+=7)for(let xx=x+8;xx<x+w-8;xx+=9){const n=noise(xx,yy,91);if(n%4===0)continue;const px=xx+n%6,py=yy+(n>>>5)%5;r(px,py,1+n%3,1,n%3===0?'#abb0a336':n%2?'#34494e36':'#d4c9a21b');if(n%11===0)r(px+1,py+1,2,1,'#253b4230');}
  for(let yy=Math.max(y+20,chunkY);yy<Math.min(y+h-16,chunkBottom);yy+=67)for(let xx=x+26;xx<x+w-24;xx+=83){const n=noise(xx,yy,193);if(n%5)continue;const px=xx+n%13,py=yy+(n>>>6)%14;r(px,py,9+n%14,1,'#283f4626');r(px+2,py+1,5+n%9,1,'#aab0a11b');}
  // Raised curbs, chipped paint and paired gutter lines give every road a profile.
  r(x,y,w,3,'#c8c2a0');r(x,y+3,w,1,'#e0d3a5');if(trimLeft)r(x,y+4,2,h-8,'#c8c39c');if(trimRight)r(x+w-3,y+4,3,h-8,'#8e9988');r(x,y+h-4,w,1,'#a7a995');r(x,y+h-3,w,3,'#77877f');
  for(let yy=Math.max(y+12,chunkY);yy<Math.min(y+h-12,chunkBottom);yy+=22){if(trimLeft){r(x+5,yy,2,8,'#30454b');r(x+6,yy+1,1,6,'#abb1a3');}if(trimRight){r(x+w-8,yy,2,8,'#30454b');r(x+w-7,yy+1,1,6,'#abb1a3');}}
 };
 // Paved urban blocks fill the gaps between streets; green is reserved for the central park.
 for(let row=0;row<townRoads.horizontal.length-1;row++)for(let col=0;col<townRoads.vertical.length-1;col++){
  const x0=townRoads.vertical[col]+82,y0=townRoads.horizontal[row]+82,x1=townRoads.vertical[col+1]-82,y1=townRoads.horizontal[row+1]-82;
  if(x1<chunkX||x0>chunkEnd||y1<chunkY||y0>chunkBottom)continue;
  const park=col===2&&row===2;r(x0,y0,x1-x0,y1-y0,park?'#718c66':'#aaa58f');
  if(park){
   r(x0+18,y0+18,x1-x0-36,y1-y0-36,'#68845f');r(x0+18,y0+18,x1-x0-36,22,'#c3b99a');r(x0+18,y1-40,x1-x0-36,22,'#c3b99a');r(x0+18,y0+18,22,y1-y0-36,'#c3b99a');r(x1-40,y0+18,22,y1-y0-36,'#c3b99a');
   for(let yy=y0+48;yy<y1-48;yy+=32)for(let xx=x0+48;xx<x1-48;xx+=38){const n=noise(xx,yy,701);r(xx,yy,28,20,n%2?'#64815d':'#718e65');r(xx+4,yy+5,17,2,n%3?'#83a071':'#bdc17e');if(n%5===0)r(xx+13,yy+2,3,4,'#d7b684');}
   const px=x0+244,py=y0+128;r(px-12,py-10,170,116,'#847c63');r(px-7,py-6,160,108,'#c0b48e');r(px,py,146,96,'#4a7c85');r(px+5,py+4,136,84,'#69a0a0');
   for(let i=0;i<22;i++){const n=noise(i,22,703),wx=px+8+n%122,wy=py+8+(n>>>5)%70;r(wx,wy,5+n%10,1,'#bbd3bd');}
  }else for(let yy=y0+8;yy<y1-8;yy+=26)for(let xx=x0+8+(Math.floor(yy/26)%2)*20;xx<x1-8;xx+=40){const n=noise(xx,yy,701),tone=['#c0baa1','#b6b39c','#cbc2a8','#acae9a'][n%4];r(xx,yy,36,22,tone);r(xx,yy,36,2,'#ded5b8');r(xx,yy+20,36,2,'#888e7c');if(n%4===0)r(xx+8,yy+8,6,1,'#e5dabc');}
 }
 for(const x of townRoads.vertical){if(x+110<chunkX||x-110>chunkEnd||townWalkBounds.bottom<chunkY||townWalkBounds.top>chunkBottom)continue;road(x-70,townWalkBounds.top-24,140,townWalkBounds.bottom-townWalkBounds.top+48,true,true,'v');for(let y=Math.max(townWalkBounds.top-8,chunkY);y<Math.min(townWalkBounds.bottom,chunkBottom);y+=30){r(x-2,y,4,13,'#c9bd8d');r(x-1,y,1,11,'#e4d5a5');for(const xx of [x-70,x+63]){r(xx,y,7,1,'#6e8279');r(xx,y+1,7,1,'#d8cfaa');}}
  for(let y=Math.max(townWalkBounds.top+90,chunkY);y<Math.min(townWalkBounds.bottom-30,chunkBottom);y+=210){r(x+53,y,9,17,'#3d535a');for(let i=0;i<4;i++)r(x+54,y+2+i*4,7,1,'#85958e');}
 }
 for(const y of townRoads.horizontal){if(y+70<chunkY||y-70>chunkBottom)continue;const roadStart=64,roadEnd=townSize.width-256,start=Math.max(roadStart,chunkX),end=Math.min(roadEnd,chunkEnd);if(end>start)road(start,y-70,end-start,140,start===roadStart,end===roadEnd,'h');const firstMarker=80+Math.ceil((Math.max(80,chunkX-13)-80)/30)*30;for(let x=firstMarker;x<Math.min(roadEnd,chunkEnd);x+=30){r(x,y-2,13,4,'#c9bd8d');r(x,y-2,12,1,'#e2d3a2');for(const yy of [y-70,y+63])r(x,yy,1,7,'#70847d');}}
 for(const x of townRoads.vertical)for(const y of townRoads.horizontal){if(y+64<chunkY||y-64>chunkBottom)continue;r(x-53,y-53,106,106,'#667377');for(let i=0;i<5;i++){r(x-44+i*19,y-64,9,30,'#d8d1b0');r(x-44+i*19,y+34,9,30,'#d8d1b0');}p.ellipse(x+29,y+20,9,7,'#485e64');p.ellipse(x+29,y+19,8,6,'#879188');for(let i=0;i<3;i++)r(x+24,y+16+i*3,10,1,'#596f70');}
 for(const v of townVenues){
  if(v.x+v.w+80<chunkX||v.x-80>chunkEnd||v.y+v.h+120<chunkY||v.y-100>chunkBottom)continue;
  const cx=v.x+v.w/2,cy=v.entrance==='south'?v.y+v.h+30:v.y-30,roadY=townRoads.horizontal.reduce((a,b)=>Math.abs(b-cy)<Math.abs(a-cy)?b:a);
  const pad=v.kind==='outdoor'?{x:v.x-8,y:v.y-8,w:v.w+16,h:v.h+28}:{x:v.x-24,y:v.y-65,w:v.w+48,h:v.h+118};
  r(pad.x+3,pad.y+4,pad.w,pad.h,'#506d4e55');r(pad.x,pad.y,pad.w,pad.h,'#b0af8c');
  // Broad offset stone slabs, varied aggregate and worn corners feel like a real curb walk.
  for(let yy=pad.y;yy<pad.y+pad.h;yy+=18){const row=Math.floor((yy-pad.y)/18);for(let xx=pad.x-(row%2)*15;xx<pad.x+pad.w;xx+=36){const n=noise(xx,yy,43),left=Math.max(pad.x+1,xx+1),width=Math.min(34,pad.x+pad.w-left-1);if(width<4)continue;const color=['#b7b29a','#acae98','#c1baa0','#a9ad9a'][n%4];r(left,yy+1,width,16,color);r(left,yy+1,width,1,'#dad3b4');r(left,yy+15,width,1,'#858f7f');r(left+1,yy+2,width-2,1,'#c9c3a9');if(n%3===0){r(left+4+n%11,yy+5+n%4,3+n%6,1,'#e1d8b327');r(left+14,yy+10,2,1,'#66796b38');}if(n%7===0){r(left+width-5,yy+7,2,1,'#697b6d70');r(left+width-4,yy+8,1,2,'#697b6d70');}}}
  const top=Math.min(cy,roadY),bottom=Math.max(cy,roadY);r(cx-30,top,60,bottom-top,'#788572');r(cx-28,top,56,bottom-top,'#aea98a');
  for(let yy=top;yy<bottom;yy+=18){for(let col=0;col<2;col++){const xx=cx-27+col*27,n=noise(xx,yy,61),tone=['#bbb69d','#b0ae96','#c5bda2'][n%3];r(xx+1,yy+1,25,16,tone);r(xx+1,yy+1,25,1,'#ded3b0');r(xx+1,yy+15,25,1,'#89917e');if(n%3===0){r(xx+5+n%8,yy+5,5,1,'#e0d5b538');r(xx+17,yy+10,3,1,'#717d6f3d');}if(n%9===0){r(xx+20,yy+8,2,1,'#657964');r(xx+22,yy+7,1,2,'#657964');}}r(cx-29,yy+4,1,4,'#7d9663');r(cx+28,yy+9,1,3,'#6f8a5b');}
 }
 // Small paved front courts link residential doors to the street instead of
 // leaving every building isolated in an uninterrupted grass field.
 for(const b of townBlocks){
  if(b.x+b.w+8<chunkX||b.x-8>chunkEnd||b.y+b.h+64<chunkY||b.y-30>chunkBottom)continue;
  const y=b.y+b.h,cx=b.x+b.w/2;
  r(b.x-12,y+2,b.w+24,62,'#60765b');r(b.x-9,y+4,b.w+18,57,'#a9a58d');r(b.x-8,y+4,b.w+16,2,'#d6c9a5');
  for(let yy=y+7,row=0;yy<y+60;yy+=12,row++)for(let xx=b.x-7-(row%2)*10;xx<b.x+b.w+8;xx+=27){const left=Math.max(b.x-7,xx+1),ww=Math.min(25,b.x+b.w+7-left),n=noise(xx,yy,173);if(ww<4)continue;r(left,yy,ww,10,n%4?'#c0baa0':'#b0b29b');r(left,yy,ww,1,'#ded5b9');r(left,yy+9,ww,1,'#7f897a');if(n%3===0)r(left+4,yy+4,5,1,'#e5d9ba40');}
  r(cx-18,y+4,36,58,'#b5b098');r(cx-17,y+4,34,2,'#e1d5b5');r(cx-17,y+60,34,2,'#858a77');
  for(let yy=y+12;yy<y+58;yy+=14){r(cx-16,yy,32,1,'#777f73');r(cx-14,yy+2,28,1,'#d4c9aa');}
  for(const px of [b.x-3,b.x+b.w-17]){r(px,y+20,14,13,'#486c4d');r(px+1,y+19,12,2,'#9caf72');for(let j=0;j<4;j++){const flower=px+2+j*3;r(flower,y+17+(j%2)*2,2,3,j%2?'#cf9390':'#e1ca7d');r(flower,y+21,2,4,'#577b50');}}
 }
 // Planting is concentrated inside the pocket park, keeping street lots and sidewalks clear.
 for(let i=0;i<240;i++){const x=townPlaza.x+35+noise(i,1)%620,y=townPlaza.y+28+noise(i,2)%440;if(y<chunkY||y>chunkBottom||townVenues.some(v=>x>v.x-35&&x<v.x+v.w+35&&y>v.y-75&&y<v.y+v.h+70))continue;
  r(x,y,1,6,'#496f50');r(x-2,y+2,2,1,'#a4b87d');r(x+1,y+3,2,1,'#7e9d64');r(x-1,y-2,3,1,i%3?'#d4c18c':'#cd9e99');r(x-2,y-1,5,1,i%3?'#e7d7a4':'#e1b7af');r(x,y-1,1,1,'#f2df9d');
 }
 for(let i=0;i<340;i++){const x=80+noise(i,1)%townSize.width,y=100+noise(i,2)%townSize.height;if(y<chunkY||y>chunkBottom||townVenues.some(v=>x>v.x-35&&x<v.x+v.w+35&&y>v.y-75&&y<v.y+v.h+70)||townRoads.vertical.some(v=>Math.abs(v-x)<86)||townRoads.horizontal.some(v=>Math.abs(v-y)<86))continue;
  r(x,y,1,6,'#496f50');r(x-2,y+2,2,1,'#a4b87d');r(x+1,y+3,2,1,'#7e9d64');r(x-1,y-2,3,1,i%3?'#d4c18c':'#cd9e99');r(x-2,y-1,5,1,i%3?'#e7d7a4':'#e1b7af');r(x,y-1,1,1,'#f2df9d');
 }
}
export function drawTown(scene:Phaser.Scene,progress:WorldProgress){
 // Chunk size limits canvas allocations; half-resolution raster cuts the full-world terrain buffer by 75%.
 for(let y=0;y<townSize.height;y+=2048)for(let x=0;x<townSize.width;x+=2048){const width=Math.min(2048,townSize.width-x),height=Math.min(2048,townSize.height-y),key=`midorikawa-ground-19-${x}-${y}`,rasterWidth=Math.ceil(width*townGroundRasterScale),rasterHeight=Math.ceil(height*townGroundRasterScale);if(!scene.textures.exists(key)){const texture=scene.textures.createCanvas(key,rasterWidth,rasterHeight)!;texture.context.scale(townGroundRasterScale,townGroundRasterScale);texture.context.translate(-x,-y);ground(texture.context,x,width,y,height);texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.NEAREST);}scene.add.image(x,y,key).setOrigin(0).setDisplaySize(width,height).setDepth(-100);}

 const hasCivicArtwork=scene.textures.exists('civic-arena-occlusion')&&scene.textures.exists('civic-shop-occlusion');
 if(hasCivicArtwork)drawCivicBuildings(scene);
 for(const venue of townVenues){
  if(hasCivicArtwork&&(venue.id==='stadium-5'||venue.id==='komorebi'))continue;
  if(venue.kind==='outdoor')drawOutdoorCourse(scene,venue,isVenueOpen(venue,progress));else if(venue.kind==='shop')drawModelShopSprite(scene,venue,isVenueOpen(venue,progress));else drawVenueFacade(scene,venue,isVenueOpen(venue,progress));
 }
 if(!hasCivicArtwork)drawCivicRacePlaza(scene);
 for(const x of townRoads.vertical)for(let y=townWalkBounds.top+64;y<townWalkBounds.bottom-70;y+=180){if(inCivicArtwork(x-100,y)||townVenues.some(v=>Math.abs(x-v.x)<v.w+100&&y>v.y-80&&y<v.y+v.h+70))continue;tree(scene,x-100,y);lamp(scene,x+88,y+50);}
 for(let i=0;i<28;i++){const x=110+(i*487)%(townSize.width-220),y=210+(i*337)%(townSize.height-420);if(inCivicArtwork(x,y)||[...townVenues].some(v=>x>v.x-90&&x<v.x+v.w+90&&y>v.y-100&&y<v.y+v.h+90)||townRoads.vertical.some(v=>Math.abs(v-x)<100)||townRoads.horizontal.some(v=>Math.abs(v-y)<100))continue;tree(scene,x,y);tree(scene,x+28,y+34);}
 for(const y of [townWalkBounds.top+8,townWalkBounds.bottom-16])for(let x=100;x<townSize.width-300;x+=125)if(!inCivicArtwork(x,y))tree(scene,x,y);
 for(const [x,y] of [[2140,1995],[2660,1995],[2140,2220],[2660,2220],[720,780],[3900,2530]]){if(inCivicArtwork(x,y))continue;tree(scene,x,y);const key='park-bench-16';if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,112,64)!;t.context.scale(2,2);const p=new SceneryPen(t.context);p.shadow(3,14,45,10);for(const xx of [8,40]){p.rect(xx,14,3,15,'#3d5357');p.rect(xx+1,15,1,12,'#8fa19a');}p.rect(3,3,46,9,'#5c5d4a');for(let row=0;row<3;row++){p.gradient(4,3+row*3,44,2,'#c3ab7b','#947f5e');}p.gradient(3,14,46,7,'#d2b589','#8d7a5c');p.material(4,14,44,7,'wood',12);for(const xx of [8,41])p.rect(xx,15,1,1,'#e9d4a7');t.refresh();t.setFilter(Phaser.Textures.FilterMode.NEAREST);}scene.add.image(x+20,y+1,key).setOrigin(0).setDisplaySize(56,32).setDepth(y+24);}
}
/** Flagstones, race banners, lamps and planters tie the two landmark buildings into one plaza. */
function drawCivicRacePlaza(scene:Phaser.Scene){
 const arena=townVenues.find(v=>v.id==='stadium-5'),shop=townVenues.find(v=>v.id==='komorebi');if(!arena||!shop)return;
 const banner=(x:number,y:number)=>{
  const b=scene.add.graphics().setDepth(y+12);
  b.fillStyle(0x26394c,.24).fillEllipse(x+3,y+2,20,6);
  b.fillStyle(0x33495c).fillRect(x-2,y-104,4,104);b.fillStyle(0xe1d9bf).fillRect(x-1,y-102,1,99);
  b.fillStyle(0xf0ead9).fillCircle(x,y-106,5);
  b.fillStyle(0x264f91).fillRect(x+3,y-99,25,62);b.fillStyle(0x4282c5).fillRect(x+6,y-96,19,52);
  b.fillStyle(0xf3edda).fillTriangle(x+6,y-46,x+18,y-54,x+25,y-46);
  for(let row=0;row<3;row++)for(let col=0;col<3;col++)b.fillStyle((row+col)%2?0xf6f0dc:0x356fb1).fillRect(x+5+col*7,y-48+row*4,7,4);
 };
 const lampPost=(x:number,y:number)=>{
  const l=scene.add.graphics().setDepth(y+8);l.fillStyle(0x263b4b,.25).fillEllipse(x+4,y+2,22,6);
  l.fillStyle(0x344b5c).fillRect(x-3,y-52,6,53).fillRect(x-12,y-57,24,7);
  l.fillStyle(0xb5c4c2).fillRect(x-1,y-50,2,49);l.fillStyle(0xf0d48a).fillRoundedRect(x-8,y-72,16,16,3);l.fillStyle(0xfff0b2,.45).fillRoundedRect(x-15,y-78,30,27,7);
 };
 const planter=(x:number,y:number,w:number)=>{
  const f=scene.add.graphics().setDepth(y+5);f.fillStyle(0x344958,.2).fillRect(x+4,y+4,w,28);
  f.fillStyle(0x52687a).fillRect(x,y,w,25);f.fillStyle(0xe0d9c0).fillRect(x+3,y+2,w-6,19);f.fillStyle(0x51784e).fillRect(x+6,y+5,w-12,13);
  for(let i=0;i<Math.floor(w/12);i++){const fx=x+9+i*12;f.fillStyle(i%3?0xf1d575:0xe38f9a).fillCircle(fx,y+10+(i%2)*3,2.5);f.fillStyle(0x6f955b).fillRect(fx-1,y+11,2,6);}
 };
 for(const x of [arena.x-62,arena.x+arena.w+46,shop.x-44,shop.x+shop.w+38])banner(x,arena.y+arena.h+67);
 for(const x of [arena.x+30,arena.x+arena.w-30,shop.x+24,shop.x+shop.w-24])lampPost(x,arena.y+arena.h+76);
 planter(arena.x+42,arena.y+arena.h+20,150);planter(arena.x+arena.w-192,arena.y+arena.h+20,150);
 planter(shop.x+12,shop.y+shop.h+18,112);planter(shop.x+shop.w-130,shop.y+shop.h+18,112);
 // Border trees create the green frame around the open paved forecourt.
 for(const [x,y] of [[arena.x-92,arena.y-25],[arena.x+arena.w+92,arena.y-25],[arena.x-96,arena.y+arena.h+88],[shop.x+shop.w+70,shop.y+shop.h+78]] as const)tree(scene,x,y);
}
function tree(scene:Phaser.Scene,x:number,y:number){
 if(townVenues.some(v=>x>v.x-74&&x<v.x+v.w+74&&y>v.y-130&&y<v.y+v.h+62)||townBlocks.some(b=>x>b.x-62&&x<b.x+b.w+62&&y>b.y-72&&y<b.y+b.h+56))return;
 const variant=artNoise(x,y)%7,key=`pixel-tree-16-${variant}`;if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,192,240)!;t.context.scale(2,2);paintPixelTree(t.context,variant);t.refresh();t.setFilter(Phaser.Textures.FilterMode.NEAREST);}
 scene.add.image(x-48,y-104,key).setOrigin(0).setDisplaySize(96,120).setDepth(y+10);
}
function lamp(scene:Phaser.Scene,x:number,y:number){const g=scene.add.graphics().setDepth(y+4);g.fillStyle(0x334951,.15).fillEllipse(x+7,y+2,25,6);g.fillStyle(0x354b56).fillRect(x-4,y-56,8,60).fillRect(x-12,y-59,24,5);g.fillStyle(0x8ca09a).fillRect(x-2,y-53,2,55);g.fillStyle(0xd2c7a4).fillRect(x-1,y-53,1,55);g.fillStyle(0xb7b59b).fillRect(x-8,y-67,16,10);g.fillStyle(0xf1d79d).fillRect(x-6,y-66,12,7);g.fillStyle(0xffefbd).fillRect(x-5,y-66,5,5);g.fillStyle(0x3a5260).fillRect(x-11,y-70,22,4).fillRect(x-8,y-72,16,2).fillRect(x-7,y,14,4);}
