import { starterEquipment, type Equipment } from './machine';

export interface Entrant { id: string; name: string; lane: number; color: number; equipment: Equipment; motorSeconds?:number; }
export const rivals: Entrant[] = [
  {id:'nagi',name:'早瀬 凪',lane:0,color:0x477de0,motorSeconds:30,equipment:{...starterEquipment,motor:'motor-torque',gear:'gear-4',wheel:'wheel-light',battery:'battery-entry',tire:'tire-1',terminal:'terminal-entry',shaft:'shaft-entry'}},
  {id:'momo',name:'野村 桃香',lane:1,color:0xd85b9b,motorSeconds:45,equipment:{...starterEquipment,gear:'gear-4',rollerFront:'roller-1',tire:'tire-2'}},
  {id:'sou',name:'石川 蒼',lane:3,color:0x55a66c,motorSeconds:60,equipment:{...starterEquipment,tire:'tire-1',shaft:'shaft-entry'}},
  {id:'ren',name:'高橋 蓮',lane:4,color:0xe9bd46,motorSeconds:45,equipment:{...starterEquipment,wheel:'wheel-light'}},
];
