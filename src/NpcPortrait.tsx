import atlas from './assets/portraits/npc-atlas.webp';
import {npcAppearances,type NpcAppearanceId} from './data/npcAppearance';
export function NpcPortrait({id,className=''}:{id:NpcAppearanceId;className?:string}){
 const tile=npcAppearances[id].tile;
 return <span className={`npc-portrait ${className}`} role="img" aria-label="人物の顔" data-person={id} style={{display:'block',width:'100%',aspectRatio:'1',backgroundImage:`url(${atlas})`,backgroundSize:'400% 400%',backgroundPosition:`${tile%4/3*100}% ${Math.floor(tile/4)/3*100}%`}}/>;
}
