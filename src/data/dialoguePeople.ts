import { story, shopVisitors } from './story';
export type DialoguePersonId='owner'|'aozoraOwner'|'hinataOwner'|'villain'|'rival'|'guide'|'mechanic'|'legendRei'|'legendGaku';
export const dialoguePeople:Record<DialoguePersonId,{name:string;role:string;expression:string;ageGroup:'adult'|'elementary';faceBase:string}>={
  owner:{name:story.owner,role:'こもれび模型店 店主',expression:'明るい笑顔',ageGroup:'adult',faceBase:'owner'},
  aozoraOwner:{name:'青井 晴彦',role:'あおぞら模型店 店主',expression:'気さくな笑顔',ageGroup:'adult',faceBase:'owner'},
  hinataOwner:{name:'日向 誠二',role:'ひなた模型店 店主',expression:'頼もしい笑顔',ageGroup:'adult',faceBase:'owner'},
  villain:{name:'影山 陸',role:'挑戦的な小学生レーサー',expression:'生意気な笑顔',ageGroup:'elementary',faceBase:'rival'},
  rival:{name:story.rival,role:'ライバル・小学生',expression:'自信のある笑顔',ageGroup:'elementary',faceBase:'rival'},
  guide:{name:shopVisitors.find(person=>person.kind==='guide')!.name,role:'走行会が好きな小学生',expression:'励ます笑顔',ageGroup:'elementary',faceBase:'child-common'},
  mechanic:{name:shopVisitors.find(person=>person.kind==='mechanic')!.name,role:'マシンに詳しい小学生',expression:'元気な笑顔',ageGroup:'elementary',faceBase:'child-common'},
  legendRei:{name:'風見 怜',role:'全国大会のレジェンドレーサー',expression:'落ち着いた笑顔',ageGroup:'elementary',faceBase:'child-common'},
  legendGaku:{name:'火野 岳',role:'全国大会のレジェンドレーサー',expression:'自信たっぷり',ageGroup:'elementary',faceBase:'child-common'},
};
const normalize=(name:string)=>name.replace(/[\s　]/g,'');
export function dialoguePerson(speaker:string):DialoguePersonId|null{
  return (Object.keys(dialoguePeople) as DialoguePersonId[]).find(id=>normalize(speaker).includes(normalize(dialoguePeople[id].name)))??null;
}
export function dialogueChoices(shopAfter:boolean,book:boolean,stage='none'){
  if(stage==='villain-intro')return [{label:'勝負を受ける！',action:'villainRace' as const},{label:'セッティングを見直してから',action:'close' as const}];
  if(stage==='villain-loss')return [{label:'準備して、もう一度挑む',action:'close' as const}];
  if(stage==='villain-win')return [{label:'ひなた模型店へ向かう',action:'close' as const}];
  if(stage==='legend-intro')return [{label:'うん、僕が優勝したよ',action:'advance' as const}];
  if(stage==='legend-invite')return [{label:'一緒にレースする！',action:'legendRace' as const},{label:'少し準備してからにする',action:'close' as const}];
  if(stage==='legend-debrief')return [{label:'もっと速くなるよ',action:'close' as const}];
  return shopAfter?[{label:'はい、パーツを見せてください',action:'advance' as const},{label:'いいえ、また今度',action:'close' as const}]:
    [{label:book?'本を閉じる':'話を終える',action:'close' as const}];
}
