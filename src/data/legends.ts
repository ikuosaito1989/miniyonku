import { starterEquipment, type Equipment } from './machine';
export interface Legend {id:string;name:string;points:number;title:string;machine:string;description:string;equipment:Equipment}
const elite:Equipment={...starterEquipment,motor:'motor-apex',gear:'gear-3.5',chassis:'chassis-light',battery:'battery-power',wheel:'wheel-light',rollerFront:'roller-2',rollerSide:'roller-2',rollerRear:'roller-2',shaft:'shaft-1',terminal:'terminal-1',tire:'tire-2'};
/** 展示専用のオリジナルレーサー。現時点では対戦・購入・入手は不可。 */
export const legends:Legend[]=[
  {id:'legend-rei',name:'風見 怜',points:1600,title:'旋回の探究者',machine:'ゼファー・ロッソ',description:'赤い流麗なミッドシップ風。曲面フェンダーと低いノーズ、絞り込んだキャビンで旋回を狙う。',equipment:{...elite,body:'body-legend-flow'}},
  {id:'legend-gaku',name:'火野 岳',points:1400,title:'直線の挑戦者',machine:'バースト・ヴェローチェ',description:'黄色いウェッジ型。鋭い楔形ノーズと大型サイドインテーク、広いリアが特徴の高速マシン。',equipment:{...elite,body:'body-legend-wedge',battery:'battery-entry'}},
  {id:'legend-towa',name:'橘 斗和',points:1200,title:'調整の戦略家',machine:'紅蓮フェンサー',description:'赤い低重心クーペ。旋回性能と軽さの組み合わせで連続コーナーを攻略する。',equipment:{...elite,body:'body-sport',gear:'gear-4'}},
  {id:'legend-koya',name:'山城 昊也',points:1100,title:'駆動の求道者',machine:'ランブラー・ツインR',description:'銀色の国産GT風クーペ。角張ったノーズ、張り出すフェンダー、4灯の丸いテール。高トルク型とスポンジタイヤを組み合わせる。',equipment:{...elite,body:'body-legend-muscle',motor:'motor-torque',tire:'tire-1',gear:'gear-4',battery:'battery-endurance'}},
];
