import type Phaser from 'phaser';
import type {Fixture} from '../data/shop';
import type {ShopId} from '../data/world';
import {personDrawing,type Facing,type PersonKind} from './PeopleArt';
import {createPersonTexture} from './PersonTexture';
import {drawThemedRoom,drawThemedFixture} from './ThemedShopArt';
export type {Facing,PersonKind} from './PeopleArt';
export function drawShopRoom(scene:Phaser.Scene,_mirrored=false,_exclusive=false,id:ShopId='komorebi'){drawThemedRoom(scene,id);}
export function drawShopFixture(scene:Phaser.Scene,f:Fixture,_source:Fixture=f,_mirrored=false,id:ShopId='komorebi'){drawThemedFixture(scene,f,id);}
export function createPeopleTextures(scene:Phaser.Scene){for(const kind of ['player','owner','rival','guide','mechanic'] as PersonKind[])for(const direction of ['down','up','left','right'] as Facing[])for(let frame=0;frame<4;frame++){const key=`person-${kind}-${direction}-${frame}`;if(!scene.textures.exists(key))createPersonTexture(scene,key,personDrawing(kind,direction,frame));}}
