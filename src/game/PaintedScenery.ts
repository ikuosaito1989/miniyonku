import type Phaser from 'phaser';
import {roomView,type Fixture} from '../data/shop';
import {sceneryKey} from '../data/scenery';
/** 原画はカメラの描画範囲そのもの。背景と家具の切出しで同じ座標変換を使う。 */
export function drawPaintedScenery(scene:Phaser.Scene,id:string){
 const key=sceneryKey(id);if(!scene.textures.exists(key))return false;
 scene.add.image(roomView.x,roomView.y,key).setOrigin(0).setDisplaySize(roomView.width,roomView.height).setDepth(-100);return true;
}
export function drawPaintedFixture(scene:Phaser.Scene,id:string,f:Pick<Fixture,'x'|'y'|'w'|'h'>){
 const key=sceneryKey(id);if(!scene.textures.exists(key))return false;
 const texture=scene.textures.get(key),image=texture.getSourceImage() as HTMLImageElement;
 const sx=image.width/roomView.width,sy=image.height/roomView.height,frame=`cut-${f.x}-${f.y}-${f.w}-${f.h}`;
 if(!texture.has(frame))texture.add(frame,0,Math.round((f.x-roomView.x)*sx),Math.round((f.y-roomView.y)*sy),Math.round(f.w*sx),Math.round(f.h*sy));
 scene.add.image(f.x,f.y,key,frame).setOrigin(0).setDisplaySize(f.w,f.h).setDepth(f.y+f.h);return true;
}
