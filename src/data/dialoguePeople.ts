import { doctor } from './doctor';
import { story, shopVisitors } from './story';
export type DialoguePersonId='akatsukiOwner'|'senior'|'yuunagiOwner'|'atelierOwner'|'owner'|'aozoraOwner'|'hinataOwner'|'villain'|'rival'|'guide'|'mechanic'|'legendRei'|'legendGaku'|'doctor'|'offroader'|'venueStaff'|'wakabaOwner';
export const dialoguePeople:Record<DialoguePersonId,{name:string;role:string;expression:string;ageGroup:'adult'|'elementary';faceBase:string}>={
  yuunagiOwner:{name:'夕凪 慎吾',role:'ゆうなぎ模型店 店主',expression:'落ち着いた笑顔',ageGroup:'adult',faceBase:'owner'},
  atelierOwner:{name:'星野 玄一',role:'星霧模型工房 店主',expression:'落ち着いた笑顔',ageGroup:'adult',faceBase:'owner'},
  wakabaOwner:{name:'若松 修一',role:'わかば模型店 店主',expression:'頼もしい笑顔',ageGroup:'adult',faceBase:'owner'},
  venueStaff:{name:'大会受付係',role:'若葉公式レース会場・大会スタッフ',expression:'落ち着いた笑顔',ageGroup:'adult',faceBase:'owner'},
  offroader:{name:'森野 陸',role:'ダートが得意な小学生レーサー',expression:'茶色の髪と緑の服、自信のある笑顔',ageGroup:'elementary',faceBase:'child-common'},
  doctor:{name:doctor.name,role:doctor.role,expression:'眼鏡と白髪、穏やかな笑顔',ageGroup:'adult',faceBase:'doctor'},
  owner:{name:story.owner,role:'こもれび模型店 店主',expression:'明るい笑顔',ageGroup:'adult',faceBase:'owner'},
  aozoraOwner:{name:'青井 晴彦',role:'あおぞら模型店 店主',expression:'気さくな笑顔',ageGroup:'adult',faceBase:'owner'},
  hinataOwner:{name:'日向 誠二',role:'ひなた模型店 店主',expression:'頼もしい笑顔',ageGroup:'adult',faceBase:'owner'},
  akatsukiOwner:{name:'暁堂 司',role:'あかつき模型店 店主',expression:'頼もしい笑顔',ageGroup:'adult',faceBase:'owner'},
  senior:{name:'黒瀬 迅',role:'黒岩の先輩・決勝の強敵',expression:'肩までの黒髪とクールな目元',ageGroup:'elementary',faceBase:'child-common'},
  villain:{name:'黒岩 豪',role:'あおぞら模型店の挑戦者・小学生',expression:'太い眉と不敵な笑み',ageGroup:'elementary',faceBase:'rival'},
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
  if(stage==='official-invite')return [{label:'公式レースに出場する！',action:'officialRace' as const},{label:'セッティングしてから',action:'legendSetting' as const}];
  if(stage==='villain-intro')return [{label:'勝負を受ける！',action:'villainRace' as const},{label:'セッティングを見直してから',action:'close' as const}];
  if(stage==='villain-loss')return [{label:'準備して、もう一度挑む',action:'close' as const}];
  if(stage==='villain-win')return [{label:'ひなた模型店へ向かう',action:'close' as const}];
  if(stage==='legend-intro')return [{label:'うん、僕が優勝したよ',action:'advance' as const}];
  if(stage==='legend-invite')return [{label:'一緒にレースする！',action:'legendRace' as const},{label:'セッティングしてからにする',action:'legendSetting' as const}];
  if(stage==='doctor-gift')return [{label:'セイランボディ、ありがとう！',action:'close' as const}];
  if(stage==='legend-debrief')return [{label:'もっと速くなるよ',action:'close' as const}];
  return shopAfter?[{label:'はい、パーツを見せてください',action:'advance' as const},{label:'いいえ、また今度',action:'close' as const}]:
    [{label:book?'本を閉じる':'話を終える',action:'close' as const}];
}
