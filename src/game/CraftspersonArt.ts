import {npcDrawing} from './NpcPeopleArt';
import {pixelPen} from './pixelDrawing';
import type {CraftKind} from '../data/craftParts';

/** Their aprons and tools distinguish each craftsperson from ordinary residents. */
export function craftspersonDrawing(kind:CraftKind){
 const pen=pixelPen();
 if(kind==='body'){
  pen.rect(21,48,18,19,'#407f7b');pen.rect(23,50,14,2,'#b3ddd0');pen.rect(26,56,8,6,'#d6c78c');pen.rect(29,57,2,4,'#41665e');
 }else{
  pen.rect(21,48,18,19,'#724b43');pen.rect(23,50,14,2,'#d5a56b');pen.rect(25,57,10,5,'#4a3533');pen.rect(29,53,2,9,'#e5c88c');
 }
 return [...npcDrawing(kind==='body'?'yuunagiOwner':'akatsukiOwner','down'),...pen.shapes];
}
