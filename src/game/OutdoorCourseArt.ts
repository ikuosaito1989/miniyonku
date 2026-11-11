import Phaser from 'phaser';
import type {TownVenue} from '../data/world';
import {isPracticeCourse} from '../data/practiceCourses';
import {isMasterCourse} from '../data/masterCourses';
import {outdoorTimeBoardPlacement} from '../data/timeBoard';
import {drawRecordBoard} from './RecordBoardArt';
import {getCircuitTrack} from '../data/circuit';
import {practiceCourses} from '../data/practiceCourses';
import {shopTrackLayout} from './shopTrackLayout';
import {SceneryPen} from './SceneryCanvas';

/** Bake the actual course geometry once; walking renders a single image per venue. */
export function drawOutdoorCourse(scene:Phaser.Scene,v:TownVenue,unlocked=true){
 if(!isPracticeCourse(v.id))return;
 const key=`outdoor-layout-v1-${v.id}`;
 if(!scene.textures.exists(key)){
  const width=v.w,height=v.h,texture=scene.textures.createCanvas(key,Math.ceil(width*2),Math.ceil(height*2))!,c=texture.context;
  c.scale(2,2);
  const p=new SceneryPen(c),track=getCircuitTrack(v.id),layout=shopTrackLayout(track,width-36,height-48),rough=practiceCourses[v.id].surface.roughness>0;
  p.shadow(3,8,width-12,height-20);p.round(3,5,width-10,height-14,8,'#3b5555');
  p.gradient(7,9,width-18,height-23,'#a8b58a','#708a62');
  // Lawn, border paving and tiny plants keep each course part of the town scenery.
  p.round(15,17,width-34,height-40,5,rough?'#a48c66':'#6e925c');
  for(let i=0;i<100;i++){const x=20+(i*73)%(width-44),y=22+(i*47)%(height-54);p.rect(x,y,2+i%3,1,rough?(i%2?'#d0b78a':'#807859'):(i%2?'#91aa6c':'#587d57'));}
  const path=(points:readonly {x:number;y:number}[],color:string,lineWidth:number,dy=0)=>p.line(points.map(q=>[q.x+18,q.y+24+dy]),color,lineWidth);
  const roadWidth=layout.laneWidth*track.circuit.lanes;
  c.lineJoin='round';c.lineCap='round';
  path(layout.centerline,'#29434466',roadWidth+8,7);
  path(layout.centerline,'#425666',roadWidth+5,3);
  path(layout.centerline,'#c4cccd',roadWidth+3);
  path(layout.centerline,rough?'#b39a72':'#7d8e9b',roadWidth);
  for(const lane of layout.paths){path(lane,'#3f5364',1.8,1);path(lane,'#e0e6dd',1);}
  // The start line is perpendicular to the actual track, including open courses.
  const start=layout.centerline[0],next=layout.centerline[1],angle=Math.atan2(next.y-start.y,next.x-start.x);
  c.save();c.translate(start.x+18,start.y+24);c.rotate(angle);p.checker(-3,-roadWidth/2,6,roadWidth,2);c.restore();
  if(track.open){const end=layout.centerline.at(-1)!;p.rect(end.x+15,end.y+20,6,8,'#d2a05d');}
  // Low fence and lamps frame the course without hiding its layout.
  for(let x=14;x<width-12;x+=32){p.rect(x,height-20,3,12,'#536773');p.rect(x,height-21,3,3,'#d9d9bd');}
  p.rect(14,height-15,width-29,2,'#aebbb2');
  for(const x of [17,width-26]){p.rect(x,15,3,22,'#536773');p.round(x-5,12,14,7,1,'#ecd99c');p.rect(x-3,13,10,2,'#fff1c7');}
  texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
 }
 scene.add.image(v.x,v.y,key).setOrigin(0).setDisplaySize(v.w,v.h)
  .setDepth(v.y+v.h+8).setName(`town-course-arena-${v.id}`);
 if(isMasterCourse(v.id)&&!unlocked){
  const g=scene.add.graphics().setDepth(v.y+v.h+10);
  g.fillStyle(0x172838,.76).fillRoundedRect(v.x+v.w*.31,v.y+v.h-34,v.w*.38,24,4);
  g.lineStyle(1.5,0xe0cf9f,.95).strokeRoundedRect(v.x+v.w*.31,v.y+v.h-34,v.w*.38,24,4);
  scene.add.text(v.x+v.w/2,v.y+v.h-22,'ZENITH CLEAR REQUIRED',{fontFamily:'sans-serif',fontSize:'12px',fontStyle:'bold',color:'#f4e7bf'})
   .setOrigin(.5).setDepth(v.y+v.h+11).setName(`town-course-locked-${v.id}`);
 }
 drawRecordBoard(scene,outdoorTimeBoardPlacement(v),v.y+v.h+55);
}
