import {legendPersonDrawing} from './game/LegendPeopleArt';
import {CharacterPortrait} from './CharacterPortrait';
export function SeniorPortrait(){return <CharacterPortrait draw={()=>legendPersonDrawing('towa','down')} label="橘 斗和"/>;}
