import { offroaderDrawing } from './game/PeopleArt';
import {CharacterPortrait} from './CharacterPortrait';
export function OffroaderPortrait(){
  return <CharacterPortrait draw={()=>offroaderDrawing('down')} label="森野 陸"/>;
}
