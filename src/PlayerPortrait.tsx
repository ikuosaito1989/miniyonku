import {personDrawing} from './game/PeopleArt';
import {CharacterPortrait} from './CharacterPortrait';
/** Walk sprite and portrait share the same cap, hair, face and jersey drawing. */
export function PlayerPortrait(){return <CharacterPortrait draw={()=>personDrawing('player','down',0)} label="主人公の顔"/>;}
