import { starterEquipment, type Equipment } from './machine';

export interface Entrant { id: string; name: string; lane: number; color: number; equipment: Equipment; }
export const rivals: Entrant[] = [
  {id:'nagi',name:'ナギ',lane:0,color:0x477de0,equipment:{...starterEquipment,gear:'gear-4',roller:'roller-2'}},
  {id:'momo',name:'モモ',lane:1,color:0xd85b9b,equipment:{...starterEquipment,roller:'roller-1',tire:'tire-2'}},
  {id:'sou',name:'ソウ',lane:3,color:0x55a66c,equipment:{...starterEquipment,tire:'tire-1',shaft:'shaft-1'}},
  {id:'ren',name:'レン',lane:4,color:0xe9bd46,equipment:{...starterEquipment,roller:'roller-1'}},
];
