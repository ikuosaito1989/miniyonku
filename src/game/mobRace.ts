import {isPracticeCourse} from '../data/practiceCourses';
import {practiceRivals} from '../data/practiceRivals';
import type {RaceState,Racer} from './race';
import {grandprixRivals} from '../data/officialRace';
import {rivals} from '../data/rivals';
import {createDrivingState,machinePerformance} from './driving';

/** Exhibition opponents use curated course equipment and ordinary anonymous racers. */
export function withMobRivals(race:RaceState):RaceState{
 const player=race.racers.find(r=>r.id==='player')!,existing=race.racers.filter(r=>r.id!=='player');
 const fallback=isPracticeCourse(race.circuitId)?practiceRivals(race.circuitId):grandprixRivals;
 const entries:Racer[]=existing.length?existing:fallback.map(r=>({...r,equipment:{...r.equipment},performance:machinePerformance(r.equipment,{motorSeconds:r.motorSeconds??60,batterySeconds:0}),driving:createDrivingState()}));
 return {...race,event:'shop',racers:[player,...entries.slice(0,4).map((r,index)=>({...r,id:`mob-${index}`,name:rivals[index].name,equipment:{...r.equipment},driving:createDrivingState()}))].map((r,index)=>({...r,lane:race.circuitId==='trail'||race.circuitId==='grandprix'?2:index}))};
}
