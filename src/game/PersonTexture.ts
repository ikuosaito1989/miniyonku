import Phaser from 'phaser';
import { personSpriteSize } from './PeopleArt';
import { paintPixels, type PixelShape } from './pixelDrawing';

/** 1/2ドットの描き込みと斜線を保持した高解像度原画。全人物・全歩行方向で共用。 */
export function createPersonTexture(scene:Phaser.Scene,key:string,drawing:readonly PixelShape[]){
  if(scene.textures.exists(key))return;
  const scale=3,texture=scene.textures.createCanvas(key,personSpriteSize.width*scale,personSpriteSize.height*scale)!;
  texture.context.scale(scale,scale);
  paintPixels(texture.context,drawing);
  texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
}
