import Phaser from 'phaser';
import type {Fixture} from '../data/shop';
import type {CircuitTrack} from '../data/circuit';
import {shopTrackLayout,type ShopTrackPoint} from './shopTrackLayout';
import {SceneryPen} from './SceneryCanvas';
import {artNoise} from './PixelArtMaterials';
import {courseRailColorAt,pavedCourseColors} from './coursePalette';

/** Actual course geometry, with moulded walls, joints, start gantry and bridge piers. */
export function drawShopTrack(scene:Phaser.Scene,f:Fixture,track:CircuitTrack,depth=f.y+f.h+1,painted=false){
 const key=`course-model-16-${track.circuit.name}-${f.w}-${f.h}-${painted}`;
 if(!scene.textures.exists(key)){
  const resolution=2,texture=scene.textures.createCanvas(key,Math.ceil(f.w*resolution),Math.ceil(f.h*resolution))!,c=texture.context;c.scale(resolution,resolution);c.lineJoin='round';c.lineCap='round';
  const p=new SceneryPen(c),{centerline,paths,laneWidth}=shopTrackLayout(track,f.w,f.h),road=laneWidth*track.circuit.lanes;
  const stroke=(points:ShopTrackPoint[],width:number,color:string,dy=0,dx=0)=>{if(points.length<2)return;c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach((point,i)=>{const x=Math.round((point.x+dx)*2)/2,y=Math.round((point.y+dy)*2)/2;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();};
  if(!painted){p.round(1,2,f.w-2,f.h-3,3,'#526958');p.round(3,3,f.w-6,f.h-7,2,'#b8b49a');p.rect(5,4,f.w-10,1,'#e2d3a7');p.rect(5,f.h-7,f.w-10,3,'#737f69');}
  p.round(7,7,f.w-14,f.h-16,2,'#45664c');
  for(let y=9;y<f.h-10;y+=3)for(let x=9;x<f.w-10;x+=4){const n=artNoise(x,y);if(n%3===0){p.rect(x,y,2,1,n%2?'#738c58':'#375b44');if(n%7===0)p.rect(x+1,y-1,.5,1,'#a2ac6f');}}
  // Lower moulding and its contact shadow remain visibly separate from lane dividers.
  stroke(centerline,road+8,'#1b353539',5,2);stroke(centerline,road+6,'#213d3b60',4,2);stroke(centerline,road+5,'#293f45',2.5);stroke(centerline,road+4.5,'#526c6c',1.5);stroke(centerline,road+4.5,'#2b4147',2);stroke(centerline,road+3.5,'#718b88',1);stroke(centerline,road+2,'#b5c4b3');stroke(centerline,road,'#687b7b');stroke(centerline,road-1.5,'#778789');
  let rough:ShopTrackPoint[]=[];
  const roughRoad=()=>{stroke(rough,road-1,'#ab9b77');rough=[];};
  centerline.forEach((point,i)=>{if(track.surfaceAt(i/(centerline.length-1)*track.circuitLength).roughness>.65)rough.push(point);else roughRoad();});roughRoad();
  // Modular seams, fastening tabs and restrained road wear follow the course tangent.
  for(let i=15;i<centerline.length-8;i+=37){const a=centerline[i-2],b=centerline[i+2],pt=centerline[i],angle=Math.atan2(b.y-a.y,b.x-a.x);c.save();c.translate(pt.x,pt.y);c.rotate(angle);p.rect(-.5,-road/2,1,road,'#3c55564f');p.rect(.5,-road/2,.5,road,'#d7dfc580');for(const side of [-1,1]){p.rect(-1,side*(road/2+1)-.5,2,1,'#d9dfbf');p.rect(-.5,side*(road/2+1),.5,.5,'#39535a');}c.restore();}
  paths.forEach((path,index)=>{
   const outside=index===0||index===paths.length-1;
   stroke(path,outside?2:1.5,'#344c50',1.2);stroke(path,outside?1.7:1.25,'#566d6d',.6);stroke(path,outside?1.2:.7,'#d4dfcf');
   if(track.circuit.surface.roughness===0){
    let start=0,last=courseRailColorAt(track,0)??pavedCourseColors.white;
    for(let i=1;i<=path.length;i++){
     const next=i<path.length?(courseRailColorAt(track,i/(path.length-1)*track.circuitLength)??pavedCourseColors.white):null;
     if(next!==last){const segment=path.slice(Math.max(0,start-1),Math.min(path.length,i+1));if(last!==pavedCourseColors.white)stroke(segment,outside?1.2:.85,`#${last.toString(16).padStart(6,'0')}`);start=i;last=next??pavedCourseColors.white;}
    }
   }
   stroke(path,.35,'#f7f4e8',-.3);
  });
  // Elevated segments get their own shadow, wall and stone-coloured structural piers.
  let bridge:ShopTrackPoint[]=[];
  const paintBridge=()=>{if(bridge.length>1){stroke(bridge,road+5,'#223a4055',5,2);for(let i=8;i<bridge.length;i+=40){const pt=bridge[i];p.rect(pt.x-2,pt.y+3,5,7,'#385459');p.rect(pt.x-2,pt.y+3,2,7,'#b2b7a3');p.rect(pt.x-3,pt.y+10,7,1.5,'#516e69');}stroke(bridge,road+3,'#3f565b',1);stroke(bridge,road+1.8,'#d3dac4');stroke(bridge,road-.5,'#8b9994');for(let lane=1;lane<track.circuit.lanes;lane++){const shift=(lane-track.circuit.lanes/2)*laneWidth;const path=bridge.map((pt,i)=>{const a=bridge[Math.max(0,i-1)],b=bridge[Math.min(bridge.length-1,i+1)],d=Math.hypot(b.x-a.x,b.y-a.y)||1;return{...pt,x:pt.x-(b.y-a.y)/d*shift,y:pt.y+(b.x-a.x)/d*shift};});stroke(path,.7,'#eef0d5');}}bridge=[];};
  for(const pt of centerline){if(pt.elevation>.3)bridge.push(pt);else paintBridge();}paintBridge();
  const gate=(index:number,finish:boolean)=>{const pt=centerline[index],a=centerline[index-2],b=centerline[index+2];c.save();c.translate(pt.x,pt.y);c.rotate(Math.atan2(b.y-a.y,b.x-a.x));for(let lane=0;lane<track.circuit.lanes;lane++){const y=(lane-track.circuit.lanes/2)*laneWidth;if(!finish)p.rect(-4,y,3,laneWidth,track.circuit.surface.roughness===0?'#f4f2ea':['#b56b65','#d1b475','#709579','#729bab','#9a86a4'][lane%5]);for(let k=0;k<2;k++)p.rect(k,y,1,laneWidth,(lane+k)%2?'#e9e4c9':'#304b53');}for(const side of [-1,1]){p.rect(-2,side*(road/2+3),3,3,'#283f4c');p.rect(-1.5,side*(road/2+3)-3,2,4,'#c9c9ad');}p.rect(-2,-road/2-5,2,road+10,'#283f4b');p.rect(-2,-road/2-5,.7,road+10,'#eee0b1');for(let i=0;i<4;i++)p.rect(-1.5,-4+i*2,.7,1,'#d9c48d');c.restore();};
  gate(8,false);if(track.open)gate(centerline.length-8,true);
  // Three tiny parked/display cars communicate the scale of the miniature.
  for(let i=0;i<3;i++){const index=Math.floor(centerline.length*(.13+i*.27)),pt=centerline[index],a=centerline[index-2],b=centerline[index+2];c.save();c.translate(pt.x,pt.y);c.rotate(Math.atan2(b.y-a.y,b.x-a.x));p.rect(-2,-1.6,4,3.2,'#263c46');p.rect(-1.4,-1.2,2.8,2.4,['#bf786a','#ddc28a','#87b5bb'][i]);p.rect(-.1,-.75,1,1.5,'#263e4c');p.rect(-1.5,-1.4,.5,2.8,'#e8d6a6');c.restore();}
  if(!painted)for(const x of [4,f.w-5])for(const y of [5,f.h-6]){p.rect(x,y,1,1,'#eff0cf');p.rect(x+1,y+1,.5,.5,'#455e5c');}
  texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
 }
 scene.add.image(f.x,f.y,key).setOrigin(0).setDisplaySize(f.w,f.h).setDepth(depth);
}
