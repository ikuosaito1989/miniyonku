import {characterSpriteRow,characterSpriteSize} from './characterSprites';
import Phaser from 'phaser';
import { personSpriteSize } from './PeopleArt';
import { paintPixels, type PixelShape } from './pixelDrawing';

/** 16-bit style source pixels: enough detail at the common 48x64 world display size. */
export function createPersonTexture(scene:Phaser.Scene,key:string,drawing:readonly PixelShape[]){
  if(scene.textures.exists(key))return;
  const pose=drawing[0]?.sprite;
  if(pose&&drawing.length===pose.shapeCount&&scene.textures.exists(`character-atlas-${pose.id}`)){
    const atlas=scene.textures.get(`character-atlas-${pose.id}`);
    const texture=new Phaser.Textures.Texture(scene.textures,key,[]);
    texture.source=atlas.source;
    texture.add('__BASE',0,pose.frame*characterSpriteSize.width,characterSpriteRow[pose.direction]*characterSpriteSize.height,characterSpriteSize.width,characterSpriteSize.height);
    // This texture borrows the atlas source; only the atlas owns its GPU resource.
    texture.destroy=()=>{for(const frame of Object.values(texture.frames))frame.destroy();texture.frames={};texture.source=[];};
    (scene.textures.list as Record<string,Phaser.Textures.Texture>)[key]=texture;
    return;
  }

 const scale=3,texture=scene.textures.createCanvas(key,personSpriteSize.width*scale,personSpriteSize.height*scale)!;
  texture.context.scale(scale,scale);
  if(pose&&scene.textures.exists(`character-atlas-${pose.id}`)){
   const image=scene.textures.get(`character-atlas-${pose.id}`).getSourceImage() as HTMLImageElement;
   texture.context.imageSmoothingEnabled=false;
   texture.context.drawImage(image,pose.frame*characterSpriteSize.width,characterSpriteRow[pose.direction]*characterSpriteSize.height,characterSpriteSize.width,characterSpriteSize.height,0,0,personSpriteSize.width,personSpriteSize.height);
   paintPixels(texture.context,drawing.slice(pose.shapeCount));
  }else paintPixels(texture.context,drawing);
  // Keep hard pixel clusters when the 3x character source is drawn at 48x64.
  texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
}
