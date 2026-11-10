import Phaser from 'phaser';
import { personSpriteSize } from './PeopleArt';
import { paintPixels, type PixelShape } from './pixelDrawing';

/** 16-bit style source pixels: enough detail at the common 48x64 world display size. */
export function createPersonTexture(scene:Phaser.Scene,key:string,drawing:readonly PixelShape[]){
  if(scene.textures.exists(key))return;
 const scale=2,texture=scene.textures.createCanvas(key,personSpriteSize.width*scale,personSpriteSize.height*scale)!;
  texture.context.scale(scale,scale);
  paintPixels(texture.context,drawing);
  // Keep hard pixel clusters when the 3x character source is drawn at 48x64.
  texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
}
