import type {Facing} from './PeopleArt';
import type {PixelShape} from './pixelDrawing';

export const characterSpriteIds=['player','guide','owner','ren','aozoraOwner','hinataOwner','wakabaOwner','yuunagiOwner','akatsukiOwner','atelierOwner','venueStaff','rival','mechanic','sou','momo','offroader','starter','rei','gaku','towa','koya','go','senior','doctor'] as const;
export type CharacterSpriteId=typeof characterSpriteIds[number];
export interface CharacterSpritePose {id:CharacterSpriteId;direction:Facing;frame:number;shapeCount:number}
export const characterSpriteSize={width:180,height:240};
export const characterSpriteRow:Record<Facing,number>={down:0,right:1,up:2,left:3};
export const characterSpriteUrl=(id:CharacterSpriteId)=>`/assets/characters/${id}.webp`;
export function withCharacterSprite(shapes:PixelShape[],id:CharacterSpriteId,direction:Facing,frame=0):PixelShape[]{
 if(!shapes.length)return shapes;
 return [{...shapes[0],sprite:{id,direction,frame:frame%4,shapeCount:shapes.length}},...shapes.slice(1)];
}
