import {isMasterCourse,masterCourseIds,masterCourses} from './masterCourses';
import {practiceCourses,practiceCourseIds,isPracticeCourse,type PracticeCourseId} from './practiceCourses';
import {specialtyStock,isSpecialtyShop} from './specialtyParts';
export const isSalesShop=(id:string)=>id==='atelier'||isSpecialtyShop(id);
import {postClearPartIds,legendBodyIds} from './postClearParts';
import {zenithParts} from './zenithParts';
import {sovereignPartIds} from './sovereignParts';
import { starterShop, type ShopStock } from './progression';
import type { CircuitId } from './circuit';

export type ShopId=PracticeCourseId|'torque'|'velocity'|'terrain'|'endurance'|'hoshikuzu'|'atelier'|'komorebi'|'aozora'|'hinata'|'wakaba'|'yuunagi'|'akatsuki';
export type WorldLocation=ShopId|'library'|'town'|'stadium-5'|'stadium-9'|'stadium-10'|'stadium-7';
export interface ModelShop extends ShopStock { id:ShopId; owner:string; circuitId:CircuitId; stage:number; color:number; welcome:string }
// 店の進行段階とパーツの入手段階は別。入門店の既存品揃えを維持する。
export const modelShops:Record<ShopId,ModelShop>={
 ...Object.fromEntries(practiceCourseIds.map((id,i)=>[id,{id,name:practiceCourses[id].name+' レース場',owner:'コース係',maxPartLevel:0,exclusiveParts:[],circuitId:id,stage:1,color:[0x638fa6,0x98734f,0x789765][i%3],welcome:practiceCourses[id].feature+' '+practiceCourses[id].advice+' 何度でも参加できます。コース端の看板で歴代タイムを確認しよう。'} as ModelShop])) as Record<PracticeCourseId,ModelShop>,
 torque:{id:'torque',name:'くろがね駆動工房',owner:'鉄田 剛',maxPartLevel:10,exclusiveParts:specialtyStock('torque'),circuitId:'leaf',stage:1,color:11959640,welcome:'坂と立ち上がりを力で攻める店。高トルクモーターと減速ギアを比べよう。 作業台で自由に組み合わせて、レースは模型店や公式会場で試してね。'},
 velocity:{id:'velocity',name:'はやてスピードラボ',owner:'風間 翔',maxPartLevel:10,exclusiveParts:specialtyStock('velocity'),circuitId:'leaf',stage:1,color:7186382,welcome:'舗装の直線を磨く店。回転数と大径タイヤの伸び、加速の弱点を見比べよう。 作業台で自由に組み合わせて、レースは模型店や公式会場で試してね。'},
 terrain:{id:'terrain',name:'やまなみオフロード',owner:'山野 茂',maxPartLevel:10,exclusiveParts:specialtyStock('terrain'),circuitId:'leaf',stage:1,color:7902303,welcome:'砂・砂利・凹凸を走り抜く店。接地と制振を揃え、舗装の抵抗も見て選ぼう。 作業台で自由に組み合わせて、レースは模型店や公式会場で試してね。'},

 endurance:{id:'endurance',name:'ながみち耐久工房',owner:'長谷川 守',maxPartLevel:10,exclusiveParts:specialtyStock('endurance'),circuitId:'leaf',stage:1,color:0x627e8e,welcome:'長い距離を走りきるための店。大容量電池と安定した足まわりを揃えたよ。重さや出力との違いを比べてみよう。'},
 hoshikuzu:{id:'hoshikuzu',name:'ほしくず模型店',maxPartLevel:10,exclusiveParts:[...postClearPartIds,...legendBodyIds,...zenithParts.map(p=>p.id),'accessory-brake-soft','accessory-brake-hard','tire-trail','tire-sand'],owner:'星野 玄一',circuitId:'forge',stage:7,color:0x526b92,welcome:'天頂決戦のクリア、おめでとう！ レジェンド4人のボディ、FMの前置きモーターシャーシ、砂・砂利・舗装・着地の専門パーツを揃えたよ。組み合わせたマシンで各公式会場のタイムアタックへ。星皇を1つでも装着した走行はランキングに記録されないから、記録用のセッティングを作ろう！'},
  akatsuki:{id:'akatsuki',name:'あかつき模型店',maxPartLevel:10,owner:'暁堂 司',circuitId:'forge',stage:6,color:0xb56860,welcome:'緑川の入賞、おめでとう！ ここには怜・岳・斗和・昊也のレジェンド4人も試走に来ている。最上位パーツを22種入荷したぞ。縦ループ、横スパイラル、砂地、坂、ジャンプを制する組み合わせを探そう。勝敗に関係なく、途中で戻らず5回レースの結果まで走れば、天頂決戦・ゼニス・クラウンの出場権を渡す。'},
  yuunagi:{id:'yuunagi',name:'ゆうなぎ模型店',maxPartLevel:6,owner:'夕凪 慎吾',circuitId:'trail',stage:5,color:0x8074a8,welcome:'星空テクニカル杯の入賞、おめでとう！ 新作のリアウイング・スライドダンパー、セラミックローラー、低い二段ローラー、サージモーター、フローティングホイール、低反発タイヤを揃えたよ。ここはスタートとゴールが別の一本道タイムアタック。約172mの高架スパイラル・ジャンプ台・ロングストレートを越え、公式タイム40秒以内で完走すると第4公式大会・緑川グランプリの出場権を授けるよ。何度でもセッティングを変えて挑戦できる。'},
  atelier:{id:'atelier',name:'星霧模型工房',maxPartLevel:10,exclusiveParts:sovereignPartIds,owner:'星野 玄一',circuitId:'leaf',stage:1,color:0x77649c,welcome:'ようこそ、星霧模型工房へ。星皇シリーズは全11種類・13品、各25万円。全品325万円で、ローラー1セットを前中後に共用できる。モーター・電池は消耗なし。出力・軽さ・効率・旋回は最上位だが、硬いスリックは砂地に弱い。悪路タイヤやフレックスシャーシ、比率の違うギアとの混成で、コースに合わせてさらに速い構成を探そう。'},
  wakaba:{id:'wakaba',name:'わかば模型店',maxPartLevel:5,owner:'若松 修一',circuitId:'grove',stage:4,color:0x709250,welcome:'公式杯の入賞、おめでとう。ここは坂・ジャンプ・1周半の高架スパイラルがある店だ。ライバルも上位装備を使うよ。上位のスイフトトルク、K4シャーシ、ハイグリップタイヤと新作ホイールを揃えたよ。4:1ギアと駆動サポートも組み合わせてごらん。ここで優勝すれば、第3公式大会の星空テクニカル杯の出場権がもらえるよ。'},
  komorebi:{...starterShop,id:'komorebi',owner:'小野寺 春夫',circuitId:'leaf',stage:1,color:0x528672,welcome:'いらっしゃい、湊くん。完走賞を貯めてパーツを買い足そう！初優勝すると、全国で活躍する兄弟が訪ねてくるらしいよ。'},
  aozora:{id:'aozora',name:'あおぞら模型店',maxPartLevel:3,owner:'青井 晴彦',circuitId:'wind',stage:2,color:0x497eaf,welcome:'春夫さんから話は聞いているよ。ようこそ、あおぞら模型店へ！連続コーナーでは加速と安定性の両立が大切だ。低重心シャーシや中空シャフト、新しいモーターを試してごらん。'},
  hinata:{id:'hinata',name:'ひなた模型店',maxPartLevel:4,owner:'日向 誠二',circuitId:'sun',stage:3,color:0xb78e4f,welcome:'黒岩くんを破ったレーサーだね。ようこそ、ひなた模型店へ！ここは砂利・砂地・連続コーナーが続く長いダートコースだ。悪路用モーターとブロックタイヤ、ダンパー、ポール式ダブルローラーで挑もう。'},
};
export function currentShop(location:WorldLocation){return modelShops[location==='town'||location==='library'?'komorebi':location==='stadium-5'?'hinata':location==='stadium-9'?'wakaba':location==='stadium-10'?'yuunagi':location==='stadium-7'?'akatsuki':location];}
export interface WorldProgress {legendRaceCompleted:boolean;villainDefeated:boolean;officialQualified?:boolean;wakabaUnlocked?:boolean;thirdOfficialQualified?:boolean;yuunagiUnlocked?:boolean;finalQualified?:boolean;grandprixCleared?:boolean;zenithQualified?:boolean;zenithCleared?:boolean}
export function canEnterShop(id:ShopId,progress:WorldProgress){return isMasterCourse(id)?progress.zenithCleared===true:id==='hoshikuzu'?progress.zenithCleared===true:id==='akatsuki'?progress.grandprixCleared===true:id==='yuunagi'?progress.yuunagiUnlocked===true:id==='wakaba'?progress.wakabaUnlocked===true:(id==='komorebi'||isSalesShop(id)||isPracticeCourse(id))||progress.legendRaceCompleted&&(id==='aozora'||progress.villainDefeated);}
export function isVenueOpen(venue:TownVenue,progress:WorldProgress){return venue.kind==='library'?true:venue.id==='stadium-7'?progress.zenithQualified===true:venue.id==='stadium-10'?progress.finalQualified===true:venue.id==='stadium-9'?progress.thirdOfficialQualified===true:venue.id==='stadium-5'?progress.officialQualified===true:!!venue.shopId&&canEnterShop(venue.shopId,progress);}
export interface TownVenue {id:string;name:string;kind:'shop'|'stadium'|'library'|'outdoor';stage:number;x:number;y:number;w:number;h:number;entrance:'north'|'south';color:number;shopId?:ShopId}
const venueTemplates:TownVenue[]=[
  {id:'komorebi',name:'こもれび模型店',kind:'shop',stage:1,x:78,y:150,w:132,h:88,entrance:'south',color:0x528672,shopId:'komorebi'},
  {id:'aozora',name:'あおぞら模型店',kind:'shop',stage:2,x:246,y:150,w:132,h:88,entrance:'south',color:0x497eaf,shopId:'aozora'},
  {id:'hinata',name:'ひなた模型店',kind:'shop',stage:3,x:414,y:150,w:132,h:88,entrance:'south',color:0xb78e4f,shopId:'hinata'},
  {id:'wakaba',name:'わかば模型店',kind:'shop',stage:4,x:582,y:150,w:132,h:88,entrance:'south',color:0x709250,shopId:'wakaba'},
  {id:'yuunagi',name:'ゆうなぎ模型店',kind:'shop',stage:5,x:750,y:150,w:132,h:88,entrance:'south',color:0x8074a8,shopId:'yuunagi'},
  {id:'akatsuki',name:'あかつき模型店',kind:'shop',stage:6,x:78,y:466,w:132,h:88,entrance:'north',color:0xb56860,shopId:'akatsuki'},
  {id:'hoshikuzu',name:'ほしくず模型店',kind:'shop',stage:7,x:246,y:466,w:132,h:88,entrance:'north',color:0x626f99,shopId:'hoshikuzu'},
  {id:'stadium-5',name:'若葉レース場',kind:'stadium',stage:5,x:414,y:466,w:132,h:88,entrance:'north',color:0x55978c},
  {id:'stadium-7',name:'天頂決戦・ゼニス・クラウン',kind:'stadium',stage:7,x:582,y:466,w:132,h:88,entrance:'north',color:0x697eae},
  {id:'stadium-9',name:'星空レース場',kind:'stadium',stage:9,x:750,y:466,w:132,h:88,entrance:'north',color:0x9674a6},
  {id:'stadium-10',name:'緑川グランプリ',kind:'stadium',stage:10,x:750,y:316,w:132,h:88,entrance:'north',color:0xb59b52},
];
// 生活道路で区切った5列6段の街区。東側は大会会場をまとめた競技地区。
export const townSize={width:7000,height:4600};
export const townWalkBounds={left:64,right:6880,top:96,bottom:4536};
export const townRoads={vertical:[400,1200,2000,2800,3600,4400],horizontal:[420,1100,1780,2460,3140,3820,4480]};
export const townPlaza={x:2050,y:1840,w:700,h:500};
export function generateTownVenues(seed=19890421):TownVenue[]{
  let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const fixed:TownVenue[]=[...venueTemplates,
    ...(['torque','velocity','terrain'] as const).map((id):TownVenue=>({id,name:modelShops[id].name,kind:'shop',stage:1,x:0,y:0,w:190,h:140,entrance:'south',color:modelShops[id].color,shopId:id})),
    {id:'atelier',name:'星霧模型工房',kind:'shop',stage:1,x:0,y:0,w:190,h:140,entrance:'south',color:0x77649c,shopId:'atelier' as ShopId},
    {id:'library',name:'緑川町立図書館',kind:'library',stage:1,x:0,y:0,w:190,h:140,entrance:'south',color:0x657c88},
    {id:'endurance',name:modelShops.endurance.name,kind:'shop' as const,stage:1,x:0,y:0,w:190,h:140,entrance:'south' as const,color:modelShops.endurance.color,shopId:'endurance' as ShopId},
    ...practiceCourseIds.filter(id=>!isMasterCourse(id)).map((id):TownVenue=>({id,name:practiceCourses[id].name,kind:'outdoor',stage:1,x:0,y:0,w:180,h:110,entrance:'south',color:modelShops[id].color,shopId:id})),
  ];
  // Two adjoining cells form a pedestrian square and planted pocket park.
  const lots=Array.from({length:30},(_,i)=>({x:500+(i%5)*800,y:470+Math.floor(i/5)*680})).filter((_,i)=>i!==12);
  for(let i=lots.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[lots[i],lots[j]]=[lots[j],lots[i]];}
  // A civic race plaza anchors the town: a flagship arena, its starter hobby
  // shop, and a small race-day stall share one paved district. The remaining
  // enterable destinations still occupy the shuffled neighborhood lots.
  const showcase:Record<string,Pick<TownVenue,'x'|'y'|'w'|'h'|'entrance'>>={
    'stadium-5':{x:2940,y:1850,w:580,h:500,entrance:'south'},
    komorebi:{x:3600,y:2000,w:450,h:350,entrance:'south'},
    'park-waves':{x:510,y:4260,w:180,h:110,entrance:'south'},
  };
  const occupied:TownVenue[]=fixed.filter(v=>showcase[v.id]).map(v=>({...v,...showcase[v.id]}));
  const usedLots=new Set<number>();
  const civic=fixed.map(v=>{
    const special=showcase[v.id];if(special)return {...v,...special};
    const stadium=v.kind==='stadium',building=v.kind==='shop'||v.kind==='library',w=stadium?350:building?320:v.w,h=stadium?250:building?220:v.h;
    const lotIndex=lots.findIndex((lot,index)=>{
      if(usedLots.has(index))return false;
      const nextStreet=townRoads.horizontal.find(y=>y>lot.y)!;
      const candidate={...v,x:lot.x+Math.floor(random()*13),y:nextStreet-h-110,w,h};
      return occupied.every(other=>candidate.x+w+40<other.x||other.x+other.w+40<candidate.x||candidate.y+h+80<other.y||other.y+other.h+80<candidate.y);
    });
    if(lotIndex<0)throw new Error(`No clear town lot for ${v.id}`);
    usedLots.add(lotIndex);
    const lot=lots[lotIndex],nextStreet=townRoads.horizontal.find(y=>y>lot.y)!;
    const placed={...v,x:lot.x+Math.floor(random()*13),y:nextStreet-h-110,w,h,entrance:'south' as const};
    occupied.push(placed);return placed;
  });
  // Four master courses share a road-connected campus beyond the neighborhood.
  const masters=masterCourseIds.map((id,i):TownVenue=>({id,name:masterCourses[id].name,kind:'outdoor',stage:8,x:i%2===0?4740:5600,y:i<2?1165:1845,w:760,h:420,entrance:'south',color:masterCourses[id].color,shopId:id}));
  return [...civic,...masters];
}
export const townVenues=generateTownVenues();
// Only enterable destinations and race facilities occupy the town map.
// Non-enterable residential set dressing is intentionally omitted.
export const townBlocks:Array<{x:number;y:number;w:number;h:number}>=[];
export const shopExit={x:440,y:575,w:80,h:7};
export function townSpawn(shop:ShopId|'library'|'stadium-5'|'stadium-9'|'stadium-10'|'stadium-7'){const venue=townVenues.find(v=>v.id===shop)!;return {x:venue.x+venue.w/2,y:venue.entrance==='north'?venue.y-42:venue.y+venue.h+42};}
export function venueMessage(venue:TownVenue){
  if(isMasterCourse(venue.id))return '天頂決戦クリア後に開放される巨大マスターコース。'+modelShops[venue.id].welcome;
  if(isPracticeCourse(venue.id))return modelShops[venue.id].welcome;
  if(isSpecialtyShop(venue.id))return modelShops[venue.id].welcome;
  if(venue.kind==='library')return '最初から無料で入れる図書館。全種類のパーツの性能・特徴・入手先、ギア比やモーターの基礎を調べられます。未所持品・非売品も閲覧可能。';
  if(venue.id==='hoshikuzu')return 'ゲームクリア後に開放。レジェンドのボディ、FMシャーシ、路面別の専門パーツを豊富に販売。公式会場のタイムアタックへ向けてセッティングを磨こう。';
  if(venue.id==='stadium-7')return '最終大会・天頂決戦ゼニス・クラウン。あかつき模型店で5回レースを終えると出場権を獲得。全要素を詰め込んだ史上最長の一本道で、怜・岳・斗和・昊也のレジェンド4人と決戦。2位以内の完走でゲームクリア。';
  if(venue.id==='akatsuki')return '緑川グランプリで2位以内に入ると開放。最上位パーツ22種と強豪たちの試走コース。結果まで5回走れば最終大会の出場権。';
  if(venue.id==='yuunagi')return '星空テクニカル杯で3位以内に入ると開放。一本道の高架スパイラルとジャンプ台を40秒以内で完走すると、第4公式大会・緑川グランプリの出場権を獲得できます。';
  if(venue.id==='stadium-10')return '第4公式大会・緑川グランプリ。ゆうなぎ模型店の一本道タイムアタックを40秒以内で完走すると出場権を獲得できます。黒岩と先輩の橘 斗和、CPU2人との一本道決勝。2位以内であかつき模型店が開放、3位以下はゲームオーバーです。';
  if(venue.id==='atelier')return '最初から入れる特別な販売専門店。星皇シリーズ全11種類・13品を各25万円で販売。最上位の基礎性能と、路面に合わせた混成セッティングを楽しめます。';
  if(venue.id==='stadium-9')return '全4大会の第3公式大会・星空テクニカル杯。若葉公式杯で総合優勝するか、わかば模型店で優勝すると出場できます。連続コーナーを約2分走るコースです。';
  if(venue.id==='wakaba')return '若葉公式杯で総合3位以内に入賞すると入店できます。連続コーナーで長距離のセッティングを磨こう。';
  if(venue.id==='stadium-5')return '若葉公式ダート杯はひなた模型店で1位になると出場できます。森野 陸・黒岩 豪・CPU2人との5台レース。総合3位以内でわかば模型店、総合優勝で第3公式大会への出場権を獲得します。';
  if(venue.shopId==='hinata')return 'ひなた模型店へ入るには、あおぞら模型店で優勝した後に現れる黒岩 豪との挑戦レースで1位になろう。勝利すれば紹介状をもらえます。';
  return venue.kind==='stadium'
    ?`${venue.name}は、熟練度${venue.stage}段階目から参加する大会の会場。現在は開催準備中のため入場できません。開幕のお知らせを待とう。`
    :`${venue.name}は、先の町の大会に向けて開店準備中。現在は入れません。まずはあおぞら模型店の連続コーナーに挑戦しよう。`;
}
