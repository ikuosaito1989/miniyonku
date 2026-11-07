import type Phaser from 'phaser';
import {SceneryPen} from './SceneryCanvas';
/** A readable trophy + stopwatch sign. Words and actual records stay in the UI. */
export function drawRecordBoard(scene:Phaser.Scene,rect:{x:number;y:number;w:number;h:number},depth:number,hasRecords=false){
 const {x,y,w,h}=rect,key=`record-board-16-${w}-${h}-${hasRecords}`;
 if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,(w+8)*3,(h+9)*3)!;t.context.scale(3,3);const p=new SceneryPen(t.context);
  p.ellipse(w/2+3,h+3,w/2,3,'#273e4133');for(const xx of [9,w-14]){p.rect(xx,h-15,5,19,'#3d4c43');p.rect(xx+1,h-14,2,17,'#9d8960');p.rect(xx+2,h-14,1,15,'#c6ad78');}
  p.round(1,2,w,h-5,2,'#293e49');p.gradient(2,1,w-2,h-7,'#dfc797','#a18b62');p.rect(4,3,w-6,1,'#fff0bd');p.round(5,5,w-10,h-15,1,'#274b56');p.rect(7,6,w-14,1,'#7d9d94');p.material(7,7,w-14,h-20,'metal');
  const scale=Math.min(w/100,h/64),cx=w*.45,cy=h*.24;p.trophy(cx,cy,scale*.75);
  const sx=w*.76,sy=h*.37,r=h*.18;p.ellipse(sx+1,sy+1,r+1,r+1,'#183742');p.ellipse(sx,sy,r,r,'#c2d2bd');p.ellipse(sx,sy,r-1.5,r-1.5,'#e5e5c8');p.rect(sx-1,sy-r-4,2,3,'#c4b382');p.rect(sx-3,sy-r-5,6,1.5,'#ead29a');p.line([[sx,sy-r*.65],[sx,sy],[sx+r*.5,sy+1]],'#365a61',1);for(let i=0;i<4;i++){const a=i*Math.PI/2;p.rect(sx+Math.cos(a)*(r-3)-.5,sy+Math.sin(a)*(r-3)-.5,1,1,'#6b8e86');}
  p.checker(9,h-21,w-18,4,2);p.rect(9,h-14,w-18,1,'#c9b78a');for(const xx of [4,w-5]){p.rect(xx,4,1,1,'#f6e7b9');p.rect(xx,h-10,1,1,'#f6e7b9');}p.rect(w-10,8,2,2,hasRecords?'#a6cf9a':'#b3b59c');
  t.refresh();}
 return scene.add.image(x,y,key).setOrigin(0).setDisplaySize(w+8,h+9).setDepth(depth);
}
