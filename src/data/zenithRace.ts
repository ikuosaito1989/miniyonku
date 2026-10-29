import {starterEquipment,type Equipment} from './machine';
import {legends} from './legends';
import type {Entrant} from './rivals';
export const zenithName='天頂決戦・ゼニス・クラウン';
export const zenithEquipment:Equipment={...starterEquipment,body:'body-champion',motor:'motor-tempest',chassis:'chassis-eclipse',tire:'tire-apex',wheel:'wheel-zenith',gear:'gear-4',battery:'battery-zenith',shaft:'shaft-titan',terminal:'terminal-platinum',rollerFront:'roller-zenith',rollerSide:'roller-zenith',rollerRear:'roller-crown',accessory:'accessory-gyro',accessory2:'accessory-drivepro',accessory3:'accessory-slide-pro'};
export const zenithRivals:Entrant[]=[
 {id:'legend-rei',name:'風見 怜',lane:0,color:0x477de0,motorSeconds:60,equipment:{...zenithEquipment,body:legends[0].equipment.body,wheel:'wheel-tough',rollerFront:'roller-crown'}},
 {id:'legend-gaku',name:'火野 岳',lane:1,color:0xe5b839,motorSeconds:60,equipment:{...zenithEquipment,body:legends[1].equipment.body,wheel:'wheel-tough',rollerFront:'roller-crown'}},
 {id:'go',name:'黒岩 豪',lane:3,color:0x15191f,motorSeconds:60,equipment:{...zenithEquipment,body:'body-proto',wheel:'wheel-tough',rollerFront:'roller-crown'}},
 {id:'jin',name:'黒瀬 迅',lane:4,color:0x612b3e,motorSeconds:60,equipment:{...zenithEquipment,body:'body-proto',wheel:'wheel-tough',rollerFront:'roller-crown'}},
];
