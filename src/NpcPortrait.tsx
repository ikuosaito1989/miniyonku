import {npcAppearances,type NpcAppearanceId} from './data/npcAppearance';
import {npcDrawing} from './game/NpcPeopleArt';
import {CharacterPortrait} from './CharacterPortrait';
export function NpcPortrait({id,className=''}:{id:NpcAppearanceId;className?:string}){
 return <span className={`npc-portrait ${className}`} data-person={id} style={{display:'block',width:'100%',aspectRatio:'1'}}>
  <CharacterPortrait draw={()=>npcDrawing(id,'down')} label={`${id} character portrait`}/>
 </span>;
}
