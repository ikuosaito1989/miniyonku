import type {WorldLocation} from './world';
const images=import.meta.glob<string>('../assets/scenery/*.webp',{eager:true,query:'?url',import:'default'});
export const sceneryKey=(id:string)=>`painted-scenery-${id}`;
export function sceneryImage(id:WorldLocation){return images[`../assets/scenery/${id}.webp`];}
