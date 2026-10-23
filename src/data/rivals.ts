import { starterEquipment, type Equipment } from './machine';

export interface Entrant { id: string; name: string; lane: number; color: number; equipment: Equipment; motorSeconds?:number; }
export const rivals: Entrant[] = [
  {id:'nagi',name:'早瀬 凪',lane:0,color:0x477de0,motorSeconds:30,equipment:{...starterEquipment,motor:'motor-torque',gear:'gear-4',wheel:'wheel-light',battery:'battery-entry',tire:'tire-1',terminal:'terminal-entry',shaft:'shaft-entry'}},
  {id:'momo',name:'野村 桃香',lane:1,color:0xd85b9b,motorSeconds:45,equipment:{...starterEquipment,gear:'gear-4',rollerFront:'roller-1',tire:'tire-2'}},
  {id:'sou',name:'石川 蒼',lane:3,color:0x55a66c,motorSeconds:60,equipment:{...starterEquipment,tire:'tire-1',shaft:'shaft-entry'}},
  {id:'ren',name:'高橋 蓮',lane:4,color:0xe9bd46,motorSeconds:45,equipment:{...starterEquipment,wheel:'wheel-light'}},
];
export const aozoraRivals:Entrant[]=rivals.map((r,index)=>({...r,motorSeconds:60,equipment:{...r.equipment,motor:index<2?'motor-wind':'motor-torque',gear:'gear-4',chassis:'chassis-low',battery:index===0?'battery-power':'battery-entry',tire:'tire-1',shaft:'shaft-1',terminal:'terminal-entry'}}));
export const hinataRivals:Entrant[]=aozoraRivals.map(r=>({...r,equipment:{...r.equipment,motor:'motor-wind',terminal:'terminal-1',battery:'battery-endurance',gear:'gear-3.5'}}));
