import { starterEquipment, type Equipment } from './machine';

export interface Entrant { id: string; name: string; lane: number; color: number; equipment: Equipment; }
export const rivals: Entrant[] = [
  {id:'nagi',name:'早瀬 凪',lane:0,color:0x477de0,equipment:{...starterEquipment,gear:'gear-4',wheel:'wheel-light'}},
  {id:'momo',name:'野村 桃香',lane:1,color:0xd85b9b,equipment:{...starterEquipment,rollerFront:'roller-1',tire:'tire-2'}},
  {id:'sou',name:'石川 蒼',lane:3,color:0x55a66c,equipment:{...starterEquipment,tire:'tire-1',shaft:'shaft-entry'}},
  {id:'ren',name:'高橋 蓮',lane:4,color:0xe9bd46,equipment:{...starterEquipment,rollerFront:'roller-1'}},
];
