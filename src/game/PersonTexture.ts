import Phaser from 'phaser';
import { personSpriteSize } from './PeopleArt';
import { paintPixels, type PixelShape } from './pixelDrawing';

/** 高密度な描画と軽い面取りで、全人物の歩行スプライトに共通の立体感を付ける。 */
export function createPersonTexture(scene:Phaser.Scene,key:string,drawing:readonly PixelShape[]){
  if(scene.textures.exists(key))return;
  const scale=4,texture=scene.textures.createCanvas(key,personSpriteSize.width*scale,personSpriteSize.height*scale)!;
  texture.context.scale(scale,scale);
  const ctx=texture.context;
  // Narrow lower-right shade and upper-left edge light add a toy-like volume
  // while preserving every character's original pixel silhouette and palette.
  paintPixels(ctx,drawing.map(shape=>translate({...shape,color:shade(shape.color,.48),alpha:shape.alpha*.55},.7,.9)));
  paintPixels(ctx,drawing.map(shape=>translate({...shape,color:shade(shape.color,1.2),alpha:shape.alpha*.28},-.32,-.35)));
  paintPixels(ctx,drawing);
  texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
}

function shade(color:string,factor:number){
  const value=color.match(/[\da-f]{2}/gi)?.map(part=>parseInt(part,16));
  if(!value||value.length<3)return color;
  const rgb=value.slice(0,3).map(channel=>Math.max(0,Math.min(255,Math.round(channel*factor))));
  return `rgb(${rgb.join(' ')})`;
}

function translate(shape:PixelShape,x:number,y:number):PixelShape{
  return shape.kind==='rect'?{...shape,x:shape.x+x,y:shape.y+y}:{...shape,points:shape.points.map(([px,py])=>[px+x,py+y] as const)};
}
