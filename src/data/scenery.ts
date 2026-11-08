import type {WorldLocation} from './world';
const images=import.meta.glob<string>('../assets/scenery/*.webp',{eager:true,query:'?url',import:'default'});
export const sceneryKey=(id:string)=>`painted-scenery-${id}`;
// 専門店も共通レイアウトの高精細原画を使用する。施設ごとのキーは維持。
const specialistScenery:Partial<Record<WorldLocation,string>>={torque:'hinata',velocity:'aozora',terrain:'wakaba'};
export function sceneryImage(id:WorldLocation){return images[`../assets/scenery/${specialistScenery[id]??id}.webp`];}
