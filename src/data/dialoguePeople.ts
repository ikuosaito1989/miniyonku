import { story, shopVisitors } from './story';
export type DialoguePersonId='owner'|'rival'|'guide'|'mechanic';
export const dialoguePeople:Record<DialoguePersonId,{name:string;role:string;expression:string;ageGroup:'adult'|'elementary';faceBase:string}>={
  owner:{name:story.owner,role:'こもれび模型店 店主',expression:'明るい笑顔',ageGroup:'adult',faceBase:'owner'},
  rival:{name:story.rival,role:'ライバル・小学生',expression:'自信のある笑顔',ageGroup:'elementary',faceBase:'rival'},
  guide:{name:shopVisitors.find(person=>person.kind==='guide')!.name,role:'走行会が好きな小学生',expression:'励ます笑顔',ageGroup:'elementary',faceBase:'child-common'},
  mechanic:{name:shopVisitors.find(person=>person.kind==='mechanic')!.name,role:'マシンに詳しい小学生',expression:'元気な笑顔',ageGroup:'elementary',faceBase:'child-common'},
};
const normalize=(name:string)=>name.replace(/[\s　]/g,'');
export function dialoguePerson(speaker:string):DialoguePersonId|null{
  return (Object.keys(dialoguePeople) as DialoguePersonId[]).find(id=>normalize(speaker).includes(normalize(dialoguePeople[id].name)))??null;
}
export function dialogueChoices(shopAfter:boolean,book:boolean){
  return shopAfter?[{label:'はい、パーツを見せてください',action:'advance' as const},{label:'いいえ、また今度',action:'close' as const}]:
    [{label:book?'本を閉じる':'話を終える',action:'close' as const}];
}
