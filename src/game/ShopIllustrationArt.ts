import type Phaser from 'phaser';
import type { Fixture } from '../data/shop';
import { story } from '../data/story';
import { fixtureArtFrame, shopIllustrationKey, shopIllustrationSize } from '../data/shopIllustration';

const text=(scene:Phaser.Scene,x:number,y:number,value:string,size:number,color:string,depth=1)=>
  scene.add.text(x,y,value,{fontFamily:'"Noto Sans JP",monospace',fontSize:`${size}px`,color,resolution:2}).setDepth(depth);

export function drawIllustratedRoom(scene:Phaser.Scene,mirrored=false){
  if(!scene.textures.exists(shopIllustrationKey))return false;
  scene.add.image(0,0,shopIllustrationKey).setOrigin(0).setDisplaySize(shopIllustrationSize.width,shopIllustrationSize.height).setFlipX(mirrored).setDepth(-100);
  if(!mirrored){text(scene,91,44,story.shop,23,'#fff4d7');text(scene,94,71,`${story.town}　小さな走り、大きな夢`,8,'#d0e5de');}
  text(scene,mirrored?160:702,268,'作業台 ↑',10,'#41666a');text(scene,mirrored?155:657,508,'店内走行コース',11,'#41666a');
  return true;
}

export function drawIllustratedFixture(scene:Phaser.Scene,fixture:Fixture,sourceFixture:Fixture=fixture,mirrored=false){
  if(!scene.textures.exists(shopIllustrationKey))return false;
  const frame=fixtureArtFrame(fixture),crop=fixtureArtFrame(sourceFixture),texture=scene.textures.get(shopIllustrationKey);
  const source=texture.getSourceImage() as HTMLImageElement;
  const sx=source.width/shopIllustrationSize.width,sy=source.height/shopIllustrationSize.height;
  const key=`fixture-${sourceFixture.kind}-${sourceFixture.x}-${sourceFixture.y}`;
  if(!texture.has(key))texture.add(key,0,Math.round(crop.x*sx),Math.round(crop.y*sy),Math.round(crop.width*sx),Math.round(crop.height*sy));
  scene.add.image(frame.x,frame.y,shopIllustrationKey,key).setOrigin(0).setDisplaySize(frame.width,frame.height).setFlipX(mirrored).setDepth(frame.depth);
  if(fixture.kind==='board')text(scene,fixture.x+5,fixture.y+6,'熟練度表',6,'#fff1a7',frame.depth+1);
  if(fixture.kind==='legends'){
    scene.add.rectangle(fixture.x+fixture.w/2,fixture.y+fixture.h-5,176,11,0x183640,.95).setDepth(frame.depth+1);
    text(scene,fixture.x+fixture.w/2-81,fixture.y+fixture.h-11,'レジェンドマシン展示・調べる',9,'#ffebaa',frame.depth+2);
  }
  if(fixture.kind==='bookshelf')text(scene,fixture.x+8,fixture.y-13,'セッティングの本・全6冊',8,'#3d666c',frame.depth+1);
  if(fixture.kind==='shelf'){
    scene.add.rectangle(fixture.x+fixture.w/2,fixture.y+fixture.h-10,fixture.w-14,8,0xeee8d5).setDepth(frame.depth+1);
    text(scene,fixture.x+11,fixture.y+fixture.h-14,fixture.label.includes('モーター')?'モーター・ギア':'タイヤ・足まわり',6,'#435970',frame.depth+2);
  }
  return true;
}
