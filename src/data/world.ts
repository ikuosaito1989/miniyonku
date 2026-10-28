import { starterShop, type ShopStock } from './progression';
import type { CircuitId } from './circuit';

export type ShopId='atelier'|'komorebi'|'aozora'|'hinata'|'wakaba'|'yuunagi';
export type WorldLocation=ShopId|'town'|'stadium-5'|'stadium-9'|'stadium-10';
export interface ModelShop extends ShopStock { id:ShopId; owner:string; circuitId:CircuitId; stage:number; color:number; welcome:string }
// 店の進行段階とパーツの入手段階は別。入門店の既存品揃えを維持する。
export const modelShops:Record<ShopId,ModelShop>={
  yuunagi:{id:'yuunagi',name:'ゆうなぎ模型店',maxPartLevel:6,owner:'夕凪 慎吾',circuitId:'trail',stage:5,color:0x8074a8,welcome:'星空テクニカル杯の入賞、おめでとう！ 新作のリアウイング・スライドダンパー、セラミックローラー、低い二段ローラー、サージモーター、フローティングホイール、低反発タイヤを揃えたよ。ここはスタートとゴールが別の一本道タイムアタック。約172mの高架スパイラル・ジャンプ台・ロングストレートを越え、公式タイム40秒以内で完走すると第4公式大会・緑川グランプリの出場権を授けるよ。何度でもセッティングを変えて挑戦できる。'},
  atelier:{id:'atelier',name:'星霧模型工房',maxPartLevel:10,exclusiveParts:['motor-sovereign','chassis-sovereign'],owner:'星野 玄一',circuitId:'leaf',stage:1,color:0x77649c,welcome:'ようこそ、星霧模型工房へ。ここは最初から入れる特別な販売専門店。最高額の星皇モーターと星皇シャーシは各25万円、2つで50万円だ。わかばの優勝賞金2500円なら約200勝分。モーターは慣らし不要で摩耗せず、シャーシは駆動・旋回・制振を大幅に強化する。多くのレースで圧倒的に有利になるが、最終公式大会は、速さに加えて旋回と着地の安定も試されるぞ。通常の改造を楽しむ人は、こもれびから挑戦してごらん。'},
  wakaba:{id:'wakaba',name:'わかば模型店',maxPartLevel:5,owner:'若松 修一',circuitId:'grove',stage:4,color:0x709250,welcome:'公式杯の入賞、おめでとう。ここは坂・ジャンプ・1周半の高架スパイラルがある店だ。ライバルも上位装備を使うよ。上位のスイフトトルク、K4シャーシ、ハイグリップタイヤと新作ホイールを揃えたよ。4:1ギアと駆動サポートも組み合わせてごらん。ここで優勝すれば、第3公式大会の星空テクニカル杯の出場権がもらえるよ。'},
  komorebi:{...starterShop,id:'komorebi',owner:'小野寺 春夫',circuitId:'leaf',stage:1,color:0x528672,welcome:'いらっしゃい、湊くん。完走賞を貯めてパーツを買い足そう！初優勝すると、全国で活躍する兄弟が訪ねてくるらしいよ。'},
  aozora:{id:'aozora',name:'あおぞら模型店',maxPartLevel:3,owner:'青井 晴彦',circuitId:'wind',stage:2,color:0x497eaf,welcome:'春夫さんから話は聞いているよ。ようこそ、あおぞら模型店へ！連続コーナーでは加速と安定性の両立が大切だ。低重心シャーシや中空シャフト、新しいモーターを試してごらん。'},
  hinata:{id:'hinata',name:'ひなた模型店',maxPartLevel:4,owner:'日向 誠二',circuitId:'sun',stage:3,color:0xb78e4f,welcome:'黒岩くんを破ったレーサーだね。ようこそ、ひなた模型店へ！ここは砂利・砂地・連続コーナーが続く長いダートコースだ。悪路用モーターとブロックタイヤ、ダンパー、ポール式ダブルローラーで挑もう。'},
};
export function currentShop(location:WorldLocation){return modelShops[location==='town'?'komorebi':location==='stadium-5'?'hinata':location==='stadium-9'?'wakaba':location==='stadium-10'?'yuunagi':location];}
export interface WorldProgress {legendRaceCompleted:boolean;villainDefeated:boolean;officialQualified?:boolean;wakabaUnlocked?:boolean;thirdOfficialQualified?:boolean;yuunagiUnlocked?:boolean;finalQualified?:boolean}
export function canEnterShop(id:ShopId,progress:WorldProgress){return id==='yuunagi'?progress.yuunagiUnlocked===true:id==='wakaba'?progress.wakabaUnlocked===true:(id==='komorebi'||id==='atelier')||progress.legendRaceCompleted&&(id==='aozora'||progress.villainDefeated);}
export function isVenueOpen(venue:TownVenue,progress:WorldProgress){return venue.id==='stadium-10'?progress.finalQualified===true:venue.id==='stadium-9'?progress.thirdOfficialQualified===true:venue.id==='stadium-5'?progress.officialQualified===true:!!venue.shopId&&canEnterShop(venue.shopId,progress);}
export interface TownVenue {id:string;name:string;kind:'shop'|'stadium';stage:number;x:number;y:number;w:number;h:number;entrance:'north'|'south';color:number;shopId?:ShopId}
const venueTemplates:TownVenue[]=[
  {id:'komorebi',name:'こもれび模型店',kind:'shop',stage:1,x:78,y:150,w:132,h:88,entrance:'south',color:0x528672,shopId:'komorebi'},
  {id:'aozora',name:'あおぞら模型店',kind:'shop',stage:2,x:246,y:150,w:132,h:88,entrance:'south',color:0x497eaf,shopId:'aozora'},
  {id:'hinata',name:'ひなた模型店',kind:'shop',stage:3,x:414,y:150,w:132,h:88,entrance:'south',color:0xb78e4f,shopId:'hinata'},
  {id:'wakaba',name:'わかば模型店',kind:'shop',stage:4,x:582,y:150,w:132,h:88,entrance:'south',color:0x709250,shopId:'wakaba'},
  {id:'yuunagi',name:'ゆうなぎ模型店',kind:'shop',stage:5,x:750,y:150,w:132,h:88,entrance:'south',color:0x8074a8,shopId:'yuunagi'},
  {id:'akatsuki',name:'あかつき模型店',kind:'shop',stage:6,x:78,y:466,w:132,h:88,entrance:'north',color:0xb56860},
  {id:'hoshikuzu',name:'ほしくず模型店',kind:'shop',stage:7,x:246,y:466,w:132,h:88,entrance:'north',color:0x626f99},
  {id:'stadium-5',name:'若葉レース場',kind:'stadium',stage:5,x:414,y:466,w:132,h:88,entrance:'north',color:0x55978c},
  {id:'stadium-7',name:'風見レース場',kind:'stadium',stage:7,x:582,y:466,w:132,h:88,entrance:'north',color:0x697eae},
  {id:'stadium-9',name:'星空レース場',kind:'stadium',stage:9,x:750,y:466,w:132,h:88,entrance:'north',color:0x9674a6},
  {id:'stadium-10',name:'緑川グランプリ',kind:'stadium',stage:10,x:750,y:316,w:132,h:88,entrance:'north',color:0xb59b52},
];
// 広い街に種付き乱数で散らす。再読込で店が移動しない共通の街地図。
export const townSize={width:3200,height:2400};
export const townWalkBounds={left:64,right:2940,top:96,bottom:2336};
export const townRoads={vertical:[460,1240,2080,2820],horizontal:[700,1500,2180]};
export function generateTownVenues(seed=19890421):TownVenue[]{
  let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const plots=[{x:180,y:290},{x:780,y:380},{x:1560,y:270},{x:2380,y:360},{x:260,y:1070},{x:920,y:1110},{x:1670,y:1050},{x:2480,y:1120},{x:190,y:1780},{x:970,y:1850},{x:1680,y:1800}];
  for(let i=plots.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[plots[i],plots[j]]=[plots[j],plots[i]];}
  const venues=venueTemplates.map((venue,index):TownVenue=>{
    const plot=plots[index],stadium=venue.kind==='stadium';
    return {...venue,entrance:'south',x:plot.x+Math.floor(random()*40)-20,y:plot.y+Math.floor(random()*50)-25,w:stadium?350:190,h:stadium?250:140};
  });
  return [...venues,{id:'atelier',name:'星霧模型工房',kind:'shop',stage:1,x:650,y:805,w:190,h:140,entrance:'south',color:0x77649c,shopId:'atelier'}];
}
export const townVenues=generateTownVenues();
// 住宅・商店街の背景棟。入口を持たない建物も歩行障害物として扱う。
export const townBlocks:Array<{x:number;y:number;w:number;h:number}>=[];
for(let y=130;y<2150;y+=345)for(let x=100;x<2800;x+=370){
  const w=145+(x%3)*15,h=110;
  if(townRoads.vertical.some(road=>road>x-100&&road<x+w+100)||townRoads.horizontal.some(road=>road>y-80&&road<y+h+80))continue;
  if(townVenues.some(v=>x<v.x+v.w+90&&x+w>v.x-90&&y<v.y+v.h+90&&y+h>v.y-110))continue;
  townBlocks.push({x,y,w,h});
}
export const shopExit={x:440,y:575,w:80,h:7};
export function townSpawn(shop:ShopId|'stadium-5'|'stadium-9'|'stadium-10'){const venue=townVenues.find(v=>v.id===shop)!;return {x:venue.x+venue.w/2,y:venue.entrance==='north'?venue.y-42:venue.y+venue.h+42};}
export function venueMessage(venue:TownVenue){
  if(venue.id==='yuunagi')return '星空テクニカル杯で3位以内に入ると開放。一本道の高架スパイラルとジャンプ台を40秒以内で完走すると、第4公式大会・緑川グランプリの出場権を獲得できます。';
  if(venue.id==='stadium-10')return '第4公式大会・緑川グランプリ。ゆうなぎ模型店の一本道タイムアタックを40秒以内で完走すると出場権を獲得できます。黒岩と先輩の黒瀬 迅、モブ2人との一本道決勝。2位以内でゲームクリア、3位以下はゲームオーバーです。';
  if(venue.id==='atelier')return '最初から入れる特別な販売専門店。星皇モーターと星皇シャーシを各25万円で販売。2つで50万円、わかば優勝約200回分の究極パーツです。';
  if(venue.id==='stadium-9')return '全4大会の第3公式大会・星空テクニカル杯。若葉公式杯で総合優勝するか、わかば模型店で優勝すると出場できます。連続コーナーを約2分走るコースです。';
  if(venue.id==='wakaba')return '若葉公式杯で総合3位以内に入賞すると入店できます。連続コーナーで長距離のセッティングを磨こう。';
  if(venue.id==='stadium-5')return '若葉公式ダート杯はひなた模型店で1位になると出場できます。森野 陸・黒岩 豪・モブ2人との5台レース。総合3位以内でわかば模型店、総合優勝で第3公式大会への出場権を獲得します。';
  if(venue.shopId==='hinata')return 'ひなた模型店へ入るには、あおぞら模型店で優勝した後に現れる黒岩 豪との挑戦レースで1位になろう。勝利すれば紹介状をもらえます。';
  return venue.kind==='stadium'
    ?`${venue.name}は、熟練度${venue.stage}段階目から参加する大会の会場。現在は開催準備中のため入場できません。開幕のお知らせを待とう。`
    :`${venue.name}は、先の町の大会に向けて開店準備中。現在は入れません。まずはあおぞら模型店の連続コーナーに挑戦しよう。`;
}
