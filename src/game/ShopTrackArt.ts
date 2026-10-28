import type Phaser from 'phaser';
import type {Fixture} from '../data/shop';
import type {CircuitTrack} from '../data/circuit';
import {shopTrackLayout,type ShopTrackPoint} from './shopTrackLayout';
/** タイトルの模型コースと同じ芝・グレーの路面・立体的な側壁で描く。 */
export function drawShopTrack(scene:Phaser.Scene,f:Fixture,track:CircuitTrack,depth=f.y+f.h+1){
 const g=scene.add.graphics().setDepth(depth),{centerline,paths,laneWidth}=shopTrackLayout(track,f.w,f.h);
 const stroke=(points:ShopTrackPoint[],width:number,color:number,offset=0)=>{g.lineStyle(width,color,1);g.beginPath();points.forEach((p,i)=>{if(i===0)g.moveTo(f.x+p.x,f.y+p.y+offset);else g.lineTo(f.x+p.x,f.y+p.y+offset);});g.strokePath();};
 g.fillStyle(0x314e49).fillRoundedRect(f.x+5,f.y+5,f.w-10,f.h-10,5);
 g.lineStyle(1,0x9caa91).strokeRoundedRect(f.x+7,f.y+7,f.w-14,f.h-14,4);
 for(let i=0;i<1100;i++){const x=11+(i*73%997)/997*(f.w-22),y=11+(i*137%991)/991*(f.h-22);g.fillStyle(i%3?0x476953:0x617956,.35).fillRect(f.x+x,f.y+y,i%4?1:2,1);}
 const road=laneWidth*track.circuit.lanes;
 stroke(centerline,road+4,0x263e43,2);stroke(centerline,road+2,0x899d99);stroke(centerline,road,0x536b70);
 for(const p of paths){stroke(p,1.2,0x304950,1);stroke(p,.65,0xb1c0b5);}
 // 高架部を上に重ね、支柱と落ち影で交差・スパイラルを区別。
 let elevated:ShopTrackPoint[]=[];
 const bridge=()=>{if(elevated.length>1){stroke(elevated,road+3,0x293f41,2);stroke(elevated,road+1,0xa4b2a8);stroke(elevated,road-1,0x5d7376);for(let lane=1;lane<track.circuit.lanes;lane++){const offset=(lane-track.circuit.lanes/2)*laneWidth;const shifted=elevated.map((p,i)=>{const a=elevated[Math.max(0,i-1)],b=elevated[Math.min(elevated.length-1,i+1)],d=Math.hypot(b.x-a.x,b.y-a.y)||1;return {...p,x:p.x-(b.y-a.y)/d*offset,y:p.y+(b.x-a.x)/d*offset};});stroke(shifted,.65,0xb1c0b5);}}elevated=[];};
 for(const [i,p] of centerline.entries()){if(p.elevation>.3){if(i%45===0)g.fillStyle(0x879b91).fillRect(f.x+p.x-1,f.y+p.y+3,2,4);elevated.push(p);}else bridge();}bridge();
 const gate=(index:number,finish:boolean)=>{const p=centerline[index],a=centerline[Math.max(0,index-2)],b=centerline[Math.min(centerline.length-1,index+2)],angle=Math.atan2(b.y-a.y,b.x-a.x);g.save();g.translateCanvas(f.x+p.x,f.y+p.y);g.rotateCanvas(angle);for(let lane=0;lane<track.circuit.lanes;lane++){const y=(lane-track.circuit.lanes/2)*laneWidth;if(!finish)g.fillStyle([0xb46462,0xc9ad61,0x69947b,0x6b92ac,0x9583a4][lane]).fillRect(-3,y,4,laneWidth);for(let k=0;k<2;k++)g.fillStyle((lane+k)%2?0xdde1cd:0x31464c).fillRect(k,y,1,laneWidth);}g.restore();};
 gate(8,false);if(track.open)gate(centerline.length-8,true);
 scene.add.text(f.x+f.w/2,f.y+f.h-17,track.circuit.name,{fontFamily:'sans-serif',fontSize:'8px',color:'#ece7c9',resolution:2}).setOrigin(.5,0).setDepth(depth+1);
}
