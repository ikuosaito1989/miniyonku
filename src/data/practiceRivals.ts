import {isMasterCourse} from './masterCourses';
import {practiceCourses,type PracticeCourseId} from './practiceCourses';
import {zenithEquipment} from './zenithRace';
import {rivals} from './rivals';
import type {Equipment} from './machine';
export function practiceEquipment(id:PracticeCourseId):Equipment{
 if(isMasterCourse(id)){
  const base={...zenithEquipment,motor:'motor-hoshi-loop',chassis:'chassis-hoshi-fm',tire:'tire-hoshi-gravel',gear:'gear-hoshi-3.8',battery:'battery-hoshi-light',rollerFront:'roller-hoshi-guide',rollerSide:'roller-hoshi-guide',rollerRear:'roller-hoshi-guide',accessory:'accessory-hoshi-gyro',accessory2:'accessory-hoshi-support',accessory3:'accessory-hoshi-slide'};
  if(id==='master-azure')return {...base,motor:'motor-hoshi-sprint',chassis:'chassis-hoshi-fm-sprint',tire:'tire-apex'};
  if(id==='master-violet')return {...base,motor:'motor-hoshi-light',chassis:'chassis-hoshi-corner',tire:'tire-hoshi-low'};
  return {...base,battery:'battery-hoshi-long'};
 }
 if(id==='park-endurance')return {...zenithEquipment,body:'body-manta',motor:'motor-special-endurance-pace',gear:'gear-special-endurance-cruise',tire:'tire-special-endurance-steady',chassis:'chassis-special-endurance-stable',battery:'battery-special-endurance-ultralong'};
 const course=practiceCourses[id],dirt=course.surface.roughness>0;
 return {...zenithEquipment,body:'body-manta',motor:dirt?'motor-special-terrain-dune':course.hills?'motor-special-torque-pull':'motor-special-velocity-rev',gear:course.hills?'gear-special-terrain-rally':'gear-4',tire:dirt?'tire-special-terrain-block':'tire-2',chassis:dirt?'chassis-special-terrain-flex':'chassis-eclipse',battery:'battery-special-terrain-long'};
}
export const practiceRivals=(id:PracticeCourseId)=>rivals.map((r,i)=>({...r,motorSeconds:60,equipment:{...practiceEquipment(id),wheel:i%2?'wheel-floating':'wheel-zenith',body:isMasterCourse(id)?'body-champion':i%2?'body-manta':'body-stream'}}));
