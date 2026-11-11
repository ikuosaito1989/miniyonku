import Phaser from 'phaser';
import type {TownVenue} from '../data/world';
import {isPracticeCourse} from '../data/practiceCourses';
import {isMasterCourse} from '../data/masterCourses';
import {outdoorTimeBoardPlacement} from '../data/timeBoard';
import {drawRecordBoard} from './RecordBoardArt';

/** Uses the supplied miniature arena artwork as the shared outdoor-course scene. */
export function drawOutdoorCourse(scene:Phaser.Scene,v:TownVenue,unlocked=true){
 if(!isPracticeCourse(v.id)||!scene.textures.exists('town-course-arena'))return;
 scene.textures.get('town-course-arena').setFilter(Phaser.Textures.FilterMode.LINEAR);
 scene.add.image(v.x,v.y,'town-course-arena').setOrigin(0).setDisplaySize(v.w,v.h)
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
