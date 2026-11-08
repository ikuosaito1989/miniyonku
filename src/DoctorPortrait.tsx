import {doctorDrawing} from './game/PeopleArt';
import {CharacterPortrait} from './CharacterPortrait';
export function DoctorPortrait(){
  return <CharacterPortrait draw={()=>doctorDrawing('down')} label="博士"/>;
}
