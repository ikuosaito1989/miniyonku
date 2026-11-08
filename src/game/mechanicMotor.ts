import {isMechanicMotor,mechanicMotorFor} from '../data/mechanicMotor';
import type {GameState} from './store';
/** 一個だけを所有し、外している間も成長する。通常パーツと選択個体は保持。 */
export function syncMechanicMotor(state:GameState,grant=false):Partial<GameState>|null{
 const old=Object.keys(state.inventory).find(id=>isMechanicMotor(id)&&state.inventory[id]>0);
 if(!old&&!grant)return null;
 const stage=mechanicMotorFor(state.proficiencyPoints);
 if(old===stage.id)return null;
 const inventory={...state.inventory},units={...state.units};
 const unit=old?state.units[old]?.[0]:undefined;
 if(old){delete inventory[old];delete units[old];}
 const serial=unit?state.unitSerial:state.unitSerial+1;
 const retained=unit??{id:`mechanic-gift-${serial}`,seconds:0};
 inventory[stage.id]=1;units[stage.id]=[retained];
 return {inventory,units,unitSerial:serial,...(old&&state.equipment.motor===old?{equipment:{...state.equipment,motor:stage.id},selectedUnits:{...state.selectedUnits,motor:retained.id}}:{})};
}
