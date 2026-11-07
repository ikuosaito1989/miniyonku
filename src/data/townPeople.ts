import {townVenues,townBlocks,townWalkBounds,townSpawn} from './world';
import {canStand} from '../game/navigation';
import type {NpcAppearanceId} from './npcAppearance';
import {currentMission} from '../game/mission';
import type {GameState} from '../game/store';

const residents=[
 {id:'route',name:'小坂 歩',venue:'komorebi',appearance:'ren',topic:'next'},
 {id:'setup',name:'白石 芽衣',venue:'aozora',appearance:'guide',topic:'setup'},
 {id:'dirt',name:'土屋 大地',venue:'hinata',appearance:'offroader',topic:'dirt'},
 {id:'entry',name:'水野 澪',venue:'wakaba',appearance:'momo',topic:'entry'},
 {id:'condition',name:'久保 悠',venue:'yuunagi',appearance:'sou',topic:'condition'},
 {id:'start',name:'望月 律',venue:'atelier',appearance:'rival',topic:'start'},
] as const satisfies ReadonlyArray<{id:string;name:string;venue:string;appearance:NpcAppearanceId;topic:string}>;
// 入口の正面と出現地点を空け、建物の南側の歩ける場所に集まる。
export const townPeople=residents.map(person=>{
 const venue=townVenues.find(v=>v.id===person.venue)!;
 const buildings=[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h}));
 const candidates=[68,-68,110,-110,150,-150].flatMap(dx=>[90,126,164].map(dy=>({x:venue.x+venue.w/2+dx,y:venue.y+venue.h+dy})));
 const spot=candidates.find(p=>canStand(p,buildings,townWalkBounds)&&canStand({x:p.x,y:p.y+32},buildings,townWalkBounds)&&townVenues.every(v=>Math.hypot(p.x-townSpawn(v.id as Parameters<typeof townSpawn>[0]).x,p.y-townSpawn(v.id as Parameters<typeof townSpawn>[0]).y)>56));
 if(!spot)throw new Error(`街の案内人を配置できません: ${person.id}`);
 return {...person,...spot};
});
export type TownPerson=typeof townPeople[number];
export function townPersonAdvice(person:TownPerson,state:GameState):string{
 const mission=currentMission(state);
 switch(person.topic){
  case 'next':return mission.complete?'最後の決戦まで走り切ったんだね！ これからはお店のコースで自分のベストタイムを縮めるのも楽しいよ。':`次に目指すのは「${mission.title}」だよ。${mission.steps.join(' ')} 迷ったら街の地図で行き先を確認してみて。`;
  case 'entry':return `大会や次のお店には、出場権や勝利などの条件があるんだ。今の君への案内は「${mission.title}」。${mission.hint}`;
  case 'setup':return '速いモーターだけで決まるわけじゃないよ。コーナーではローラーやタイヤ、重心の組み合わせも大切。ローラーは前・中・後に装着できるから、作業台で装着中の赤いランプを確認してね。一度に全部替えず、同じコースで一つずつ試すと違いがわかりやすいよ。';
  case 'dirt':return 'ダートでタイヤが空転して、すごく遅くなったことがあるんだ。ブロックタイヤや悪路向けのモーター、ダンパーを試してみて。舗装で速い組み合わせが、土のコースでも速いとは限らないよ。買う前にパーツの説明と重さを見比べよう！';
  case 'condition':return '電池の残量とモーターの消耗は、作業台の所持パーツの左上で確認できるよ。新品のモーターは約60秒走らせて慣らすと好調になるんだ。でも使いすぎると摩耗するから、長いレースの前には電池と両方チェックしてね。そういえば、街の路地に消耗しない特別なモーターを作る職人がいるらしいよ。';
  case 'start':return 'スタートは「カウント開始」を押して、GOが出てから発進！ 早く押すと早出の時間が公式タイムに加算されるよ。お店のレースは参加費なし。負けても完走すれば賞金がもらえるから、試走しながら改造代を貯めよう。コース端の看板ではベストタイムのトップ3も見られるんだ。';
 }
}
