import { starterEquipment, type Equipment } from './machine';
export interface Legend {id:string;name:string;points:number;title:string;machine:string;description:string;equipment:Equipment}
const elite:Equipment={...starterEquipment,motor:'motor-apex',gear:'gear-3.5',chassis:'chassis-light',battery:'battery-power',wheel:'wheel-light',rollerFront:'roller-2',rollerSide:'roller-2',rollerRear:'roller-2',shaft:'shaft-1',terminal:'terminal-1',tire:'tire-2'};
/** オリジナルの伝説レーサー。怜・岳は特別イベント戦にも登場し、専用ボディは非売品。 */
export const legends:Legend[]=[
  {id:'legend-rei',name:'風見 怜',points:1600,title:'旋回の探究者',machine:'ゼファー・ロッソ',description:'白い鋭角カウルに青い大型ウイングと赤い稲妻ライン。黒いロングキャノピー、独立した前側カナードと白い5本スポークが特徴。',equipment:{...elite,body:'body-legend-flow'}},
  {id:'legend-gaku',name:'火野 岳',points:1400,title:'直線の挑戦者',machine:'バースト・ヴェローチェ',description:'白いセンターと大型ウイング、赤いフェンダーに黒いフレアを配した高速マシン。金色のノーズとホイール、赤いタイヤが特徴。',equipment:{...elite,body:'body-legend-wedge',battery:'battery-entry'}},
  {id:'legend-towa',name:'橘 斗和',points:1200,title:'調整の戦略家',machine:'紅蓮フェンサー',description:'赤い低重心クーペ。旋回性能と軽さの組み合わせで連続コーナーを攻略する。',equipment:{...elite,body:'body-sport',gear:'gear-4'}},
  {id:'legend-koya',name:'山城 昊也',points:1100,title:'駆動の求道者',machine:'ランブラー・ツインR',description:'銀色の国産GT風クーペ。角張ったノーズ、張り出すフェンダー、4灯の丸いテール。高トルク型とスポンジタイヤを組み合わせる。',equipment:{...elite,body:'body-legend-muscle',motor:'motor-torque',tire:'tire-1',gear:'gear-4',battery:'battery-endurance'}},
];
