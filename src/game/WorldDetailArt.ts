import type Phaser from 'phaser';
import {SceneryPen} from './SceneryCanvas';
import {shopLayout} from '../data/shopLayout';
import type {ShopId} from '../data/world';
import {shopThemes} from '../data/shopThemes';

/** Shared room finish, painted once and clipped away from all furniture footprints. */
export function drawRoomFinish(scene:Phaser.Scene,id:string,fixtures:readonly {x:number;y:number;w:number;h:number}[],accent='#cab88d'){
 const key=`room-finish-16-${id}`;
 if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,1920,1280)!;t.context.scale(2,2);const c=t.context,p=new SceneryPen(c);
  c.save();c.beginPath();c.rect(42,117,876,477);for(const f of fixtures)c.rect(f.x-2,f.y-2,f.w+4,f.h+5);c.clip('evenodd');
  p.material(43,118,874,475,id==='library'?'wood':'stone',id.length*7);
  // Soft light is expressed in a handful of stepped colour planes, not a blur.
  for(const x of [124,427,733]){p.poly([[x,118],[x+23,118],[x+150,420],[x+85,420]],'#f9e9bd09');p.poly([[x+3,118],[x+12,118],[x+135,418],[x+110,418]],'#fff5d409');for(let i=0;i<26;i++)p.rect(x+35+i*3,240+i*5,1,.5,'#f9efd31e');}
  p.rect(42,118,876,3,'#233e4b1c');p.rect(43,121,874,1,'#fff1cd30');p.rect(42,117,3,477,'#243b451e');p.rect(915,117,3,477,'#253f472b');p.rect(42,590,876,4,'#233e4518');c.restore();
  p.rect(43,110,874,2,'#263e4c77');p.rect(43,111,874,.5,accent);p.material(44,104,872,8,'metal',13);
  // Grille and small rivets along the lower wall/skirting bind every room's materials.
  for(let x=48;x<914;x+=24){p.rect(x,601,1,1,'#f5e4bb60');p.rect(x+1,602,1,1,'#243d4755');}p.rect(44,605,872,1,'#d5c39655');
  t.refresh();}
 scene.add.image(0,0,key).setOrigin(0).setDisplaySize(960,640).setDepth(id==='library'?-9:id.startsWith('stadium-')?-19:-85);
}
export function drawShopDetails(scene:Phaser.Scene,_mirrored=false,id:ShopId='komorebi'){
 drawRoomFinish(scene,id,shopLayout(id).map(f=>f.target),shopThemes[id].metal);
}
