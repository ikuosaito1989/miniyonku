import {craftStageFor,isCraftPart,type CraftKind} from '../data/craftParts';
import type {GameState} from './store';

/** Move each discovered gift to its current stage without touching other parts. */
export function syncCraftParts(state:GameState,grant?:CraftKind):Partial<GameState>|null{
 const inventory={...state.inventory},equipment={...state.equipment};let changed=false;
 const stage=craftStageFor(state.proficiencyPoints);
 for(const kind of ['body','chassis'] as const){
  const old=Object.keys(inventory).find(id=>inventory[id]>0&&isCraftPart(id,kind));
  if(!old&&grant!==kind||old===stage[kind])continue;
  if(old)delete inventory[old];
  inventory[stage[kind]]=1;
  if(old&&equipment[kind]===old)equipment[kind]=stage[kind];
  changed=true;
 }
 return changed?{inventory,equipment}:null;
}
