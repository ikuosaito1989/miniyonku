import {practiceCourses,type PracticeCourseId} from './practiceCourses';
import {zenithEquipment} from './zenithRace';
import {rivals} from './rivals';
import type {Equipment} from './machine';
export function practiceEquipment(id:PracticeCourseId):Equipment{
 const course=practiceCourses[id],dirt=course.surface.roughness>0;
 return {...zenithEquipment,body:'body-manta',motor:dirt?'motor-special-terrain-dune':course.hills?'motor-special-torque-pull':'motor-special-velocity-rev',gear:course.hills?'gear-special-terrain-rally':'gear-4',tire:dirt?'tire-special-terrain-block':'tire-2',chassis:dirt?'chassis-special-terrain-flex':'chassis-eclipse',battery:'battery-special-terrain-long'};
}
export const practiceRivals=(id:PracticeCourseId)=>rivals.map((r,i)=>({...r,motorSeconds:60,equipment:{...practiceEquipment(id),wheel:i%2?'wheel-floating':'wheel-zenith',body:i%2?'body-manta':'body-stream'}}));
