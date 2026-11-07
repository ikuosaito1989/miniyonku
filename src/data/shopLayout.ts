import {isPracticeCourse} from './practiceCourses';
import type {Fixture} from './shop';
import { fixtures, room } from './shop';
import type { ShopId } from './world';
export const mirroredShop=(id:ShopId)=>id==='aozora';
export function shopLayout(id:ShopId){
  const source:Fixture[]=isPracticeCourse(id)?[
   {x:94,y:138,w:240,h:76,kind:'counter',label:'受付係',text:'コースの特徴を聞く。'},
   {x:650,y:150,w:222,h:88,kind:'bench',label:'整備ピット',text:'所持パーツを組み合わせてセッティングしよう。'},
   {x:250,y:285,w:500,h:190,kind:'track',label:'レースコース',text:'何度でも挑戦できる5台レース。'},
   {x:95,y:285,w:100,h:185,kind:'shelf',label:'観覧席',text:'レーサーたちがセッティングを見比べている。'},
   {x:800,y:285,w:85,h:185,kind:'shelf',label:'観覧席',text:'コーナーや坂の走りを見て応援している。'},
   {x:50,y:114,w:36,h:114,kind:'board',label:'熟練度表',text:'レーサーたちの熟練度を見る。'},
  ]:fixtures;
  return source.map(source=>({source,target:mirroredShop(id)?{...source,x:room.width-source.x-source.w}:source}));
}
