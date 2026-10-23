import { starterShop, type ShopStock } from './progression';
import type { CircuitId } from './circuit';

export type ShopId='komorebi'|'aozora'|'hinata';
export type WorldLocation=ShopId|'town';
export interface ModelShop extends ShopStock { id:ShopId; owner:string; circuitId:CircuitId; stage:number; color:number; welcome:string }
// 店の進行段階とパーツの入手段階は別。入門店の既存品揃えを維持する。
export const modelShops:Record<ShopId,ModelShop>={
  komorebi:{...starterShop,id:'komorebi',owner:'小野寺 春夫',circuitId:'leaf',stage:1,color:0x528672,welcome:'いらっしゃい、湊くん。完走賞を貯めてパーツを買い足そう！初優勝すると、全国で活躍する兄弟が訪ねてくるらしいよ。'},
  aozora:{id:'aozora',name:'あおぞら模型店',maxPartLevel:3,owner:'青井 晴彦',circuitId:'wind',stage:2,color:0x497eaf,welcome:'春夫さんから話は聞いているよ。ようこそ、あおぞら模型店へ！連続コーナーでは加速と安定性の両立が大切だ。低重心シャーシや中空シャフト、新しいモーターを試してごらん。'},
  hinata:{id:'hinata',name:'ひなた模型店',maxPartLevel:4,owner:'日向 誠二',circuitId:'sun',stage:3,color:0xb78e4f,welcome:'黒岩くんを破ったレーサーだね。ようこそ、ひなた模型店へ！ここは砂利・砂地・連続コーナーが続く長いダートコースだ。悪路用モーターとブロックタイヤ、ダンパー、ポール式ダブルローラーで挑もう。'},
};
export function currentShop(location:WorldLocation){return modelShops[location==='town'?'komorebi':location];}
export interface WorldProgress {legendRaceCompleted:boolean;villainDefeated:boolean}
export function canEnterShop(id:ShopId,progress:WorldProgress){return id==='komorebi'||progress.legendRaceCompleted&&(id==='aozora'||progress.villainDefeated);}
export function isVenueOpen(venue:TownVenue,progress:WorldProgress){return !!venue.shopId&&canEnterShop(venue.shopId,progress);}
export interface TownVenue {id:string;name:string;kind:'shop'|'stadium';stage:number;x:number;y:number;w:number;h:number;entrance:'north'|'south';color:number;shopId?:ShopId}
export const townVenues:TownVenue[]=[
  {id:'komorebi',name:'こもれび模型店',kind:'shop',stage:1,x:78,y:150,w:132,h:88,entrance:'south',color:0x528672,shopId:'komorebi'},
  {id:'aozora',name:'あおぞら模型店',kind:'shop',stage:2,x:246,y:150,w:132,h:88,entrance:'south',color:0x497eaf,shopId:'aozora'},
  {id:'hinata',name:'ひなた模型店',kind:'shop',stage:3,x:414,y:150,w:132,h:88,entrance:'south',color:0xb78e4f,shopId:'hinata'},
  {id:'wakaba',name:'わかば模型店',kind:'shop',stage:4,x:582,y:150,w:132,h:88,entrance:'south',color:0x709250},
  {id:'yuunagi',name:'ゆうなぎ模型店',kind:'shop',stage:5,x:750,y:150,w:132,h:88,entrance:'south',color:0x8074a8},
  {id:'akatsuki',name:'あかつき模型店',kind:'shop',stage:6,x:78,y:466,w:132,h:88,entrance:'north',color:0xb56860},
  {id:'hoshikuzu',name:'ほしくず模型店',kind:'shop',stage:7,x:246,y:466,w:132,h:88,entrance:'north',color:0x626f99},
  {id:'stadium-5',name:'若葉レース場',kind:'stadium',stage:5,x:414,y:466,w:132,h:88,entrance:'north',color:0x55978c},
  {id:'stadium-7',name:'風見レース場',kind:'stadium',stage:7,x:582,y:466,w:132,h:88,entrance:'north',color:0x697eae},
  {id:'stadium-9',name:'星空レース場',kind:'stadium',stage:9,x:750,y:466,w:132,h:88,entrance:'north',color:0x9674a6},
  {id:'stadium-10',name:'緑川グランプリ',kind:'stadium',stage:10,x:750,y:316,w:132,h:88,entrance:'north',color:0xb59b52},
];
export const shopExit={x:440,y:575,w:80,h:7};
export function townSpawn(shop:ShopId){const venue=townVenues.find(v=>v.shopId===shop)!;return {x:venue.x+venue.w/2,y:venue.y+venue.h+42};}
export function venueMessage(venue:TownVenue){
  if(venue.shopId==='hinata')return 'ひなた模型店へ入るには、あおぞら模型店で優勝した後に現れる黒岩 豪との挑戦レースで1位になろう。勝利すれば紹介状をもらえます。';
  return venue.kind==='stadium'
    ?`${venue.name}は、熟練度${venue.stage}段階目から参加する大会の会場。現在は開催準備中のため入場できません。開幕のお知らせを待とう。`
    :`${venue.name}は、先の町の大会に向けて開店準備中。現在は入れません。まずはあおぞら模型店の連続コーナーに挑戦しよう。`;
}
