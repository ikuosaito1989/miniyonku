import Phaser from 'phaser';
import type {Fixture} from '../data/shop';
import {paintedSceneryLayout,paintedFixtureFrame} from '../data/paintedSceneryLayout';
import {sceneryKey} from '../data/scenery';

export function drawPaintedScenery(scene:Phaser.Scene,id:string){
 const key=sceneryKey(id);if(!scene.textures.exists(key))return false;
 // 2 px/world-unit pixel-art source: nearest sampling preserves crisp clusters
 // when the 960x640 map is rendered at the device's capped DPR2 resolution.
 scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
 const {bounds,mirrored}=paintedSceneryLayout(id);
 scene.add.image(bounds.x,bounds.y,key).setOrigin(0).setDisplaySize(bounds.width,bounds.height).setFlipX(mirrored).setDepth(-100);return true;
}
export function drawPaintedFixture(scene:Phaser.Scene,id:string,f:Pick<Fixture,'x'|'y'|'w'|'h'>){
 const key=sceneryKey(id);if(!scene.textures.exists(key))return false;
 scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
 const {mirrored}=paintedSceneryLayout(id),texture=scene.textures.get(key),image=texture.getSourceImage() as HTMLImageElement;
 const crop=paintedFixtureFrame(id,f,image.width,image.height),frame=`cut-${f.x}-${f.y}-${f.w}-${f.h}`;
 if(!texture.has(frame))texture.add(frame,0,crop.x,crop.y,crop.width,crop.height);
 scene.add.image(f.x,f.y,key,frame).setOrigin(0).setDisplaySize(f.w,f.h).setFlipX(mirrored).setDepth(f.y+f.h);return true;
}
