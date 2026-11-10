import {drawOutdoorCourse} from './OutdoorCourseArt';
import {drawVenueFacade} from './VenueFacadeArt';
import Phaser from 'phaser';
import {isVenueOpen,townVenues,townSize,townRoads,townBlocks,type WorldProgress} from '../data/world';
import {artNoise,paintPixelTree} from './PixelArtMaterials';
import {SceneryPen} from './SceneryCanvas';
import houseArt0 from '../assets/scenery/houses/house-0.webp';
import houseArt1 from '../assets/scenery/houses/house-1.webp';
import houseArt2 from '../assets/scenery/houses/house-2.webp';
import houseArt3 from '../assets/scenery/houses/house-3.webp';
import houseArt4 from '../assets/scenery/houses/house-4.webp';
import houseArt5 from '../assets/scenery/houses/house-5.webp';
export const townHouseArt=[houseArt0,houseArt1,houseArt2,houseArt3,houseArt4,houseArt5] as const;

/** Terrain is baked once. Pixel clusters follow a fixed, upper-left daylight. */
function ground(c:CanvasRenderingContext2D,chunkX=0,chunkWidth=townSize.width){
 const p=new SceneryPen(c),r=p.rect.bind(p),noise=artNoise;
 const chunkEnd=chunkX+chunkWidth;
 r(chunkX,0,chunkWidth,townSize.height,'#788f62');
 // Wide, quiet colour clusters keep the dense tufts from becoming visual noise.
 const firstGrassX=Math.max(0,Math.floor(chunkX/64)*64);
 for(let y=0;y<townSize.height;y+=56)for(let x=firstGrassX;x<chunkEnd+64;x+=64){const n=noise(x,y),color=['#7b9364','#758d60','#7d9467','#748c60'][n%4];for(let row=0;row<6;row++){const inset=[16,7,2,0,5,13][row]+(noise(x,row)%3)*2;r(x+inset,y+row*7,54-inset*2,7,color);for(let edge=0;edge<3;edge++){r(x+inset-2-edge*2,y+row*7+edge*2,2,2,edge%2?color:'#788f62');r(x+54-inset+edge*2,y+row*7+2+edge,2,2,color);}}}
 // Larger clusters reduce busy pixel noise while retaining a natural ground rhythm.
 const firstTuftX=Math.max(0,Math.floor(chunkX/17)*17);
 for(let y=0;y<townSize.height;y+=18)for(let x=firstTuftX;x<chunkEnd+17;x+=17){const n=noise(x,y);if(n%5>2)continue;const xx=x+n%5,yy=y+(n>>>4)%5;
  r(xx,yy+2,3+n%3,1,'#617d52');r(xx+1,yy,1,2+n%2,'#a0af77');r(xx+3,yy-1,1,2,'#8da66d');if(n%13===0)r(xx+1,yy+4,2,1,'#bdbe87');
 }
 // Stepped stone shore, reeds and broken reflections.
 for(let y=0;y<townSize.height;y+=8){const shore=townSize.width-210+Math.round(Math.sin(y/90)*12/2)*2;r(shore-24,y,40,8,'#87926c');r(shore-12,y,25,8,'#b4ab7c');r(shore-3,y,13,8,'#546c68');r(shore+5,y,townSize.width-shore-5,8,'#427e91');r(shore+12,y,townSize.width-shore-12,3,'#5798a6');
  for(let x=shore+25;x<townSize.width;x+=37){const n=noise(x,y);r(x+n%11,y+4,14+n%9,1,'#8ec3be');r(x+7,y+6,8,1,'#2e677f');if(n%9===0){r(shore-13,y-3,2,10,'#486c53');r(shore-10,y-5,1,11,'#9aa372');}}
 }
 const sidewalk=(x:number,y:number,w:number,h:number,orientation:'v'|'h')=>{
  r(x+3,y+4,w,h,'#263b3b22');r(x,y,w,h,'#8d9a83');
  const cell=orientation==='v'?18:20;
  if(orientation==='v')for(let yy=y+2,row=0;yy<y+h-2;yy+=cell,row++)for(let xx=x+2;xx<x+w-2;xx+=16){const n=noise(xx,yy,221),ww=Math.min(14,x+w-xx-2);r(xx+1,yy+1,ww,cell-2,n%3?'#c2bea2':'#b8b79e');r(xx+1,yy+1,ww,1,'#e0d8bb');r(xx+1,yy+cell-2,ww,1,'#899482');if((row+Math.floor(xx/16))%2===0)r(xx+Math.floor(ww/2),yy+1,1,cell-3,'#89948266');}
  else for(let yy=y+2;yy<y+h-2;yy+=12)for(let xx=x+2;xx<x+w-2;xx+=cell){const n=noise(xx,yy,221),ww=Math.min(cell-2,x+w-xx-2);r(xx+1,yy+1,ww,9,n%3?'#c2bea2':'#b8b79e');r(xx+1,yy+1,ww,1,'#e0d8bb');r(xx+1,yy+9,ww,1,'#899482');if((Math.floor(yy/12)+Math.floor(xx/cell))%2===0)r(xx+1+Math.floor(ww/2),yy+1,1,8,'#89948266');}
  if(orientation==='v'){r(x,y,w,2,'#d6caa5');r(x+w-2,y,2,h,'#747e70');}
  else{r(x,y,w,2,'#d6caa5');r(x,y+h-2,w,2,'#747e70');}
 };
 const road=(x:number,y:number,w:number,h:number,trimLeft=true,trimRight=true,orientation:'v'|'h'='v')=>{
  if(orientation==='v'){sidewalk(x-42,y,36,h,'v');sidewalk(x+w+6,y,36,h,'v');}
  else{sidewalk(x,y-42,w,36,'h');sidewalk(x,y+h+6,w,36,'h');}
  r(x+4,y+5,w,h,'#34474a55');r(x,y,w,h,'#414f55');r(x+3,y+3,w-6,h-6,'#59666a');r(x+7,y+7,w-14,h-14,'#626f72');
  for(let yy=y+10;yy<y+h-7;yy+=11)for(let xx=x+10;xx<x+w-7;xx+=13){const n=noise(xx,yy);if(n%3===0)r(xx,yy,2,1,n%2?'#85918a':'#51646a');}
  // Irregular aggregate, tire polishing and repairs replace the flat asphalt fill.
  for(let yy=y+8;yy<y+h-8;yy+=7)for(let xx=x+8;xx<x+w-8;xx+=9){const n=noise(xx,yy,91);if(n%4===0)continue;const px=xx+n%6,py=yy+(n>>>5)%5;r(px,py,1+n%3,1,n%3===0?'#abb0a336':n%2?'#34494e36':'#d4c9a21b');if(n%11===0)r(px+1,py+1,2,1,'#253b4230');}
  for(let yy=y+20;yy<y+h-16;yy+=67)for(let xx=x+26;xx<x+w-24;xx+=83){const n=noise(xx,yy,193);if(n%5)continue;const px=xx+n%13,py=yy+(n>>>6)%14;r(px,py,9+n%14,1,'#283f4626');r(px+2,py+1,5+n%9,1,'#aab0a11b');}
  // Raised curbs, chipped paint and paired gutter lines give every road a profile.
  r(x,y,w,3,'#c8c2a0');r(x,y+3,w,1,'#e0d3a5');if(trimLeft)r(x,y+4,2,h-8,'#c8c39c');if(trimRight)r(x+w-3,y+4,3,h-8,'#8e9988');r(x,y+h-4,w,1,'#a7a995');r(x,y+h-3,w,3,'#77877f');
  for(let yy=y+12;yy<y+h-12;yy+=22){if(trimLeft){r(x+5,yy,2,8,'#30454b');r(x+6,yy+1,1,6,'#abb1a3');}if(trimRight){r(x+w-8,yy,2,8,'#30454b');r(x+w-7,yy+1,1,6,'#abb1a3');}}
 };
 for(const x of townRoads.vertical){if(x+110<chunkX||x-110>chunkEnd)continue;road(x-70,72,140,2250,true,true,'v');for(let y=88;y<2320;y+=30){r(x-2,y,4,13,'#c9bd8d');r(x-1,y,1,11,'#e4d5a5');for(const xx of [x-70,x+63]){r(xx,y,7,1,'#6e8279');r(xx,y+1,7,1,'#d8cfaa');}}
  for(let y=185;y<2290;y+=210){r(x+53,y,9,17,'#3d535a');for(let i=0;i<4;i++)r(x+54,y+2+i*4,7,1,'#85958e');}
 }
 for(const y of townRoads.horizontal){const roadStart=64,roadEnd=townSize.width-256,start=Math.max(roadStart,chunkX),end=Math.min(roadEnd,chunkEnd);if(end>start)road(start,y-70,end-start,140,start===roadStart,end===roadEnd,'h');const firstMarker=80+Math.ceil((Math.max(80,chunkX-13)-80)/30)*30;for(let x=firstMarker;x<Math.min(roadEnd,chunkEnd);x+=30){r(x,y-2,13,4,'#c9bd8d');r(x,y-2,12,1,'#e2d3a2');for(const yy of [y-70,y+63])r(x,yy,1,7,'#70847d');}}
 for(const x of townRoads.vertical)for(const y of townRoads.horizontal){r(x-53,y-53,106,106,'#667377');for(let i=0;i<5;i++){r(x-44+i*19,y-64,9,30,'#d8d1b0');r(x-44+i*19,y+34,9,30,'#d8d1b0');}p.ellipse(x+29,y+20,9,7,'#485e64');p.ellipse(x+29,y+19,8,6,'#879188');for(let i=0;i<3;i++)r(x+24,y+16+i*3,10,1,'#596f70');}
 for(const v of townVenues){
  if(v.x+v.w+80<chunkX||v.x-80>chunkEnd)continue;
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
  if(b.x+b.w+8<chunkX||b.x-8>chunkEnd)continue;
  const y=b.y+b.h,cx=b.x+b.w/2;
  r(b.x-12,y+2,b.w+24,62,'#60765b');r(b.x-9,y+4,b.w+18,57,'#a9a58d');r(b.x-8,y+4,b.w+16,2,'#d6c9a5');
  for(let yy=y+7,row=0;yy<y+60;yy+=12,row++)for(let xx=b.x-7-(row%2)*10;xx<b.x+b.w+8;xx+=27){const left=Math.max(b.x-7,xx+1),ww=Math.min(25,b.x+b.w+7-left),n=noise(xx,yy,173);if(ww<4)continue;r(left,yy,ww,10,n%4?'#c0baa0':'#b0b29b');r(left,yy,ww,1,'#ded5b9');r(left,yy+9,ww,1,'#7f897a');if(n%3===0)r(left+4,yy+4,5,1,'#e5d9ba40');}
  r(cx-18,y+4,36,58,'#b5b098');r(cx-17,y+4,34,2,'#e1d5b5');r(cx-17,y+60,34,2,'#858a77');
  for(let yy=y+12;yy<y+58;yy+=14){r(cx-16,yy,32,1,'#777f73');r(cx-14,yy+2,28,1,'#d4c9aa');}
  for(const px of [b.x-3,b.x+b.w-17]){r(px,y+20,14,13,'#486c4d');r(px+1,y+19,12,2,'#9caf72');for(let j=0;j<4;j++){const flower=px+2+j*3;r(flower,y+17+(j%2)*2,2,3,j%2?'#cf9390':'#e1ca7d');r(flower,y+21,2,4,'#577b50');}}
 }
 // Park pond: layered coping stones and reeds, instead of flat nested squares.
 if(chunkX<1642&&chunkEnd>1458){r(1458,1588,184,136,'#6d826c');r(1460,1590,180,132,'#b1aa88');for(let x=1462;x<1640;x+=18){r(x,1591,16,5,'#d0c6a0');r(x,1715,16,5,'#999c83');}r(1470,1600,160,112,'#345e6b');r(1473,1603,154,106,'#578e92');r(1477,1606,146,98,'#6aa59f');
 for(let i=0;i<45;i++){const n=noise(i,42),x=1482+n%133,y=1610+(n>>>9)%84;r(x,y,6+n%10,1,'#a2c5b4');if(i%5===0){p.ellipse(x,y+6,4,2,'#527f62');r(x-1,y+5,2,1,'#a4b68a');}}}
 for(let i=0;i<340;i++){const x=80+noise(i,1)%2820,y=100+noise(i,2)%2190;if(townVenues.some(v=>x>v.x-35&&x<v.x+v.w+35&&y>v.y-75&&y<v.y+v.h+70)||townRoads.vertical.some(v=>Math.abs(v-x)<86)||townRoads.horizontal.some(v=>Math.abs(v-y)<86))continue;
  r(x,y,1,6,'#496f50');r(x-2,y+2,2,1,'#a4b87d');r(x+1,y+3,2,1,'#7e9d64');r(x-1,y-2,3,1,i%3?'#d4c18c':'#cd9e99');r(x-2,y-1,5,1,i%3?'#e7d7a4':'#e1b7af');r(x,y-1,1,1,'#f2df9d');
 }
}
function house(scene:Phaser.Scene,block:typeof townBlocks[number],index:number){
 const {x,y,w,h}=block,key=`town-house-18-${index}-${w}-${h}`,style=index%6;
 const artKey=`town-house-art-${style}`;
 if(scene.textures.exists(artKey)){
  scene.textures.get(artKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
  const size=w+64,bottom=y+h+14;
  scene.add.image(x+(w-size)/2,bottom-size,artKey).setOrigin(0).setDisplaySize(size,size).setDepth(y+h);
  if(w>=130){tree(scene,x-32,y+h+8);tree(scene,x+w+32,y+h+8);}else tree(scene,index%2?x-42:x+w+42,y+h-8);
  return;
 }
 if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,(w+64)*2,(h+100)*2)!;t.context.scale(2,2);const p=new SceneryPen(t.context),xx=26,yy=56,side=style%2?14:9,wall=['#d9c7a4','#c8d2bf','#d6bda7','#bfcac5','#d8d3bc','#cfb796'][style],shade=['#a99078','#92a59b','#a88477','#899e9c','#a7a18b','#9c8068'][style],roof=['#586f72','#617c69','#805d56','#555e70','#8b715a','#466774'][style],accent=['#a87e58','#657f73','#b2795e','#7279a0','#b39a65','#5392a0'][style];
  // Deep foundation, a clearly lit front wall and a darker exposed side establish the three-quarter volume.
  p.ellipse(xx+w/2+8,yy+h+13,w*.62,13,'#20383b35');p.poly([[xx,yy+12],[xx+w-side,yy+12],[xx+w-side,yy+h-5],[xx,yy+h]],shade);p.poly([[xx+3,yy+8],[xx+w-side,yy+8],[xx+w-side,yy+h-8],[xx+3,yy+h-4]],wall);p.poly([[xx+w-side,yy+8],[xx+w+7,yy-2],[xx+w+7,yy+h-16],[xx+w-side,yy+h-8]],['#887b70','#758b80','#91776c','#748486','#898776','#6e8182'][style]);
  p.rect(xx+3,yy+h-10,w-side-3,6,'#605d51');p.rect(xx+3,yy+h-10,w-side-3,2,'#eee0be');p.rect(xx+3,yy+h-4,w-side-3,2,'#45585a');
  // Six silhouettes and construction systems: tiled gable, low hip, raised apartment, shopfront, dormer and roof deck.
  if(style===0||style===4){const ridge=style===0?yy-27:yy-35;p.poly([[xx-8,yy+12],[xx+w*.48,ridge],[xx+w+9,yy+12],[xx+w+8,yy+19],[xx-7,yy+19]],'#354a51');p.poly([[xx-4,yy+11],[xx+w*.48,ridge+4],[xx+w+5,yy+11],[xx+w+3,yy+18],[xx-3,yy+18]],roof);p.poly([[xx-4,yy+11],[xx+w*.48,ridge+4],[xx+w*.48,yy+13],[xx-3,yy+18]],'#859181');p.poly([[xx+w*.48,ridge+4],[xx+w+5,yy+11],[xx+w+3,yy+18],[xx+w*.48,yy+13]],shade);
   for(let row=0;row<4;row++){const tY=yy+Math.floor((ridge-yy+8)*(row+1)/5);for(let tx=xx+3+(row%2)*6;tx<xx+w-side-4;tx+=13){p.rect(tx,tY,10,1,'#c1b69b');p.rect(tx+1,tY+1,8,2,style===0?'#718784':'#87736a');p.rect(tx+8,tY+1,1,3,'#3c5358');p.rect(tx,tY+4,9,1,'#3b5053');}}
  }else if(style===1||style===5){p.poly([[xx-9,yy+9],[xx+13,yy-17],[xx+w-side-5,yy-17],[xx+w+13,yy+7],[xx+w+7,yy+15],[xx-7,yy+18]],'#33494d');p.poly([[xx-5,yy+8],[xx+15,yy-12],[xx+w-side-7,yy-12],[xx+w+8,yy+7],[xx+w+3,yy+13],[xx-3,yy+15]],roof);p.poly([[xx-3,yy+14],[xx+15,yy-7],[xx+15,yy-12],[xx-5,yy+8]],'#9a9681');
   for(let row=0;row<4;row++)for(let col=0;col<8;col++){const tx=xx+8+col*13-(row%2)*6,ty=yy-7+row*6;if(tx>xx+w-side-11)continue;p.line([[tx,ty],[tx+17,ty-1]],'#c7bca155',1);p.rect(tx+4,ty+1,4,1,'#35494b55');}
  }else if(style===2){p.poly([[xx-7,yy+9],[xx+8,yy-12],[xx+w-side-1,yy-12],[xx+w+12,yy+7],[xx+w+10,yy+16],[xx-5,yy+18]],'#34464b');p.poly([[xx-2,yy+8],[xx+11,yy-7],[xx+w-side-3,yy-7],[xx+w+6,yy+7],[xx+w+3,yy+13],[xx,yy+14]],roof);p.rect(xx+9,yy-4,w-side-20,4,'#a99373');
  }else if(style===3){p.poly([[xx-8,yy+11],[xx+8,yy-12],[xx+w-side+2,yy-12],[xx+w+14,yy+6],[xx+w+10,yy+15],[xx-6,yy+18]],'#33464c');p.poly([[xx-3,yy+10],[xx+12,yy-7],[xx+w-side,yy-7],[xx+w+7,yy+6],[xx+w+3,yy+12],[xx,yy+14]],roof);p.rect(xx+10,yy-4,w-side-20,3,'#d0c4a0');p.rect(xx+w/2-13,yy-17,26,12,'#526d72');p.rect(xx+w/2-10,yy-15,9,8,'#a9c5bd');p.rect(xx+w/2+2,yy-15,8,8,'#809da1');
  }
  // Distinct window/door layouts, recessed sills and warm interior light.
  const window=(wx:number,wy:number,ww:number,wh:number,lit:boolean)=>{p.rect(wx-2,wy-2,ww+4,wh+5,'#59675f');p.rect(wx,wy,ww,wh,lit?'#d9bd83':'#496873');p.gradient(wx+1,wy+1,ww-2,wh-2,lit?'#ead9a7':'#a9cbc0',lit?'#8a9d8a':'#64818a');p.poly([[wx+1,wy+1],[wx+ww*.45,wy+1],[wx+2,wy+wh*.54]],'#f4edd080');p.rect(wx+Math.floor(ww*.53),wy,1,wh,'#e4d7b5');p.rect(wx-3,wy+wh,ww+6,2,'#e4d0a5');p.rect(wx-4,wy+wh+2,ww+8,2,'#68736a');};
  const floorCount=Math.max(1,Math.floor((h-34)/33)),windowW=w>120?17:13,slots=Math.max(2,Math.floor((w-side-18)/(windowW+15)));
  for(let row=0;row<floorCount;row++)for(let col=0;col<slots;col++){
   const wx=xx+8+col*(w-side-18)/slots,wy=yy+15+row*29;
   if((style===3&&row===floorCount-1&&col===Math.floor(slots/2))||wy+18>yy+h-30)continue;
   window(wx,wy,windowW,14,(index+row*3+col)%5===0);
   if(style===1&&row===0){p.rect(wx-3,wy+16,windowW+6,3,'#4c5b59');p.rect(wx,wy+19,2,7,'#604b3d');p.rect(wx+windowW-2,wy+19,2,7,'#604b3d');p.rect(wx-4,wy+24,windowW+8,2,'#d2b884');}
  }
  const doorX=xx+(style===3?w*.62:w*.5)-8,doorY=yy+h-31;p.rect(doorX-3,doorY-4,22,34,'#4b5551');p.rect(doorX,doorY,16,30,style===3?'#477270':'#795e48');p.rect(doorX+2,doorY+2,12,19,style===3?'#9fc2bc':'#b79768');p.rect(doorX+12,doorY+17,2,2,'#ecd08d');p.rect(doorX-5,doorY+29,26,3,'#e1cfaa');p.rect(doorX-7,doorY+32,30,2,'#53605a');
  // Street-facing stoop and parcel locker join the facade to a pedestrian path.
  p.rect(doorX-10,yy+h+1,36,4,'#69756a');p.rect(doorX-9,yy+h+1,34,1,'#e3d6b5');p.rect(doorX-7,yy+h+5,30,4,'#bcb79c');p.rect(doorX-5,yy+h+5,26,1,'#e4d7b7');
  if(style===0||style===2||style===4){p.rect(xx+4,yy+h-23,w-side-10,4,'#52635b');p.rect(xx+6,yy+h-21,w-side-14,2,'#89725b');for(let i=0;i<Math.max(3,Math.floor((w-side-18)/9));i++){const fx=xx+9+i*9;p.rect(fx,yy+h-28,5,5,i%3?'#6e915a':'#bd9b71');p.ellipse(fx+2,yy+h-29,2,2,i%2?'#d78e9b':'#ebd090');}}
  // AC condensers, drain pipes, utility boxes and roof equipment vary with the house type.
  const pipeX=xx+w-side+2;p.rect(pipeX,yy+18,2,h-22,'#405a58');p.rect(pipeX-1,yy+18,4,2,'#c4b99c');p.rect(pipeX-5,yy+h-37,14,10,'#687a77');p.rect(pipeX-3,yy+h-35,10,6,'#9eaaa0');p.rect(pipeX-4,yy+h-26,12,2,'#4b605d');
  if(style===2||style===3||style===5){p.rect(xx+w*.67,yy-8,15,7,'#566b68');p.rect(xx+w*.67+2,yy-6,11,4,'#97aaa1');p.rect(xx+w*.67+4,yy-5,2,2,'#53676a');p.rect(xx+w*.67+8,yy-5,2,2,'#53676a');}
  // A varied street identity is structural: awnings, balconies, tile bands, service windows and rooftop forms.
  if(style===3){const ax=xx+6,ay=yy+h-23;p.rect(ax-2,ay,w-side-12,3,'#445952');for(let i=0;i<Math.max(3,Math.floor((w-side-12)/12));i++){const aw=Math.min(12,w-side-12-i*12);p.poly([[ax+i*12,ay+3],[ax+i*12+aw,ay+3],[ax+i*12+aw-2,ay+12],[ax+i*12+2,ay+12]],i%2?accent:'#d5c59c');p.rect(ax+i*12+2,ay+12,aw-3,2,'#59645b');}}
  if(style===1||style===5){for(let col=0;col<2;col++){const bx=xx+5+col*(w-side-28),by=yy+35;p.rect(bx,by,25,3,'#485958');p.rect(bx+2,by+3,2,13,'#586661');p.rect(bx+21,by+3,2,13,'#586661');p.rect(bx-1,by+15,27,3,'#c0ad83');for(let j=0;j<4;j++)p.rect(bx+2+j*6,by+16,4,6,j%2?'#7c9a69':'#bd8e82');}}
  if(style===4){p.poly([[xx+w/2-19,yy+10],[xx+w/2,yy-4],[xx+w/2+19,yy+10]],'#44585a');p.rect(xx+w/2-13,yy+1,26,10,'#829892');p.rect(xx+w/2-10,yy+3,7,7,'#c7d3c3');p.rect(xx+w/2+3,yy+3,7,7,'#bdd0c5');}
  if(style===5){p.rect(xx+4,yy+24,w-side-8,6,'#52645e');for(let i=0;i<Math.floor((w-side-12)/8);i++)p.rect(xx+7+i*8,yy+25,3,4,i%2?'#c8aa71':'#9bb1a4');}
  p.rect(xx+w-side,yy+7,2,h-18,'#c4c4a6');p.rect(xx+w-side+2,yy+12,1,h-28,'#394f52');p.rect(xx+3,yy+9,2,h-22,'#f3e4c277');
  // Mailboxes, recycling, bicycles and planted borders add inhabited details without crowding doors.
  const bx=xx+w-side+10;p.rect(bx,yy+h-19,2,16,'#465d59');p.rect(bx-5,yy+h-24,13,8,'#344c52');p.rect(bx-4,yy+h-23,11,5,style%2?'#b86e59':'#708f9b');p.rect(bx+3,yy+h-21,2,2,'#e0c88f');
  if(style===1||style===3){const cy=yy+h-1,cx=xx+w*.67;p.ellipse(cx-7,cy+3,5,5,'#374a50');p.ellipse(cx+9,cy+3,5,5,'#374a50');p.line([[cx-7,cy+3],[cx-2,cy-7],[cx+4,cy+3],[cx-7,cy+3],[cx+2,cy-6],[cx+9,cy+3]],'#93675a',1.2);p.line([[cx+9,cy+3],[cx+7,cy-9],[cx+13,cy-9]],'#465d60',1);}
  for(const sideIndex of [0,1]){const fx=sideIndex?xx+w-side+18:xx-10,fy=yy+h+3;p.rect(fx,fy,16,7,'#64765c');p.rect(fx,fy,16,1,'#c5b88b');for(let j=0;j<4;j++){p.rect(fx+2+j*4,fy-3,2,4,'#52784d');p.ellipse(fx+2+j*4,fy-4,2,2,j%2?'#d59b94':'#e2c574');}}
  t.refresh();t.setFilter(Phaser.Textures.FilterMode.NEAREST);
 }
 scene.add.image(x-26,y-56,key).setOrigin(0).setDisplaySize(w+64,h+100).setDepth(y+h);
 if(w>=130){tree(scene,x-32,y+h+8);tree(scene,x+w+32,y+h+8);}else tree(scene,index%2?x-42:x+w+42,y+h-8);
}
export function drawTown(scene:Phaser.Scene,progress:WorldProgress){
 // 大きな街でも個々の地面テクスチャは2048px以下の幅に保つ。
 for(let x=0;x<townSize.width;x+=2048){const width=Math.min(2048,townSize.width-x),key=`midorikawa-ground-17-${x}`;if(!scene.textures.exists(key)){const texture=scene.textures.createCanvas(key,width,townSize.height)!;texture.context.translate(-x,0);ground(texture.context,x,width);texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.NEAREST);}scene.add.image(x,0,key).setOrigin(0).setDepth(-100);}

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
