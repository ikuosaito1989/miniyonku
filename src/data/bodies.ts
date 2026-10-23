export type BodyShape = 'kei'|'hatch'|'sedan'|'suv'|'coupe'|'wagon'|'gt'|'prototype';
export interface BodyDesign {
  id:string; name:string; grade:number; price:number; shape:BodyShape; className:string;
  weight:number; drag:number; cornering:number; roughGrip:number; roughResistance:number;
  width:number; cabinHeight:number; cabinFront:number; cabinRear:number;
  color:string; description:string;
  silhouette?:'flow'|'wedge'|'muscle'|'starter-wedge'|'champion-aero';
}
// 排気量は実車風のボディ区分。模型の駆動源は交換式の電動モーター。
// 旧ボディIDは所持品・装備との互換性のため維持する。
export const bodies:BodyDesign[]=[
  {id:'body-stream',name:'コハク K660',grade:1,price:400,shape:'kei',className:'入門用軽ワゴン',weight:13,drag:1,cornering:1,roughGrip:.72,roughResistance:1.25,width:.056,cabinHeight:.042,cabinFront:.041,cabinRear:-.092,color:'#b4b09a',description:'背の高い箱型の入門用軽ワゴン。くすんだベージュの車体に黒い樹脂バンパー、角形ライトと黄色いナンバー。ウイングのない素朴な一台。'},
  {id:'body-entry',name:'ワカバ C1000',grade:2,price:550,shape:'hatch',className:'コンパクト',weight:12,drag:.98,cornering:1,roughGrip:.8,roughResistance:1.12,width:.06,cabinHeight:.03,cabinFront:.035,cabinRear:-.066,color:'#72c5ad',description:'丸いコンパクトハッチ。軽さと取り回しを両立する序盤の強化先。'},
  {id:'body-sedan',name:'アオバ S1500',grade:3,price:850,shape:'sedan',className:'1.5Lセダン',weight:15,drag:.94,cornering:1.04,roughGrip:.82,roughResistance:1.08,width:.062,cabinHeight:.026,cabinFront:.035,cabinRear:-.044,color:'#81add8',description:'独立したトランクを持つセダン。中速コーナーで安定するがハッチより重い。'},
  {id:'body-manta',name:'ヤマナミ X1500',grade:3,price:900,shape:'suv',className:'1.5L小型SUV',weight:19,drag:1.14,cornering:.96,roughGrip:1.35,roughResistance:.58,width:.065,cabinHeight:.043,cabinFront:.045,cabinRear:-.08,color:'#9eac72',description:'背の高いSUV。凹凸での接地を保つ。舗装路では重さと空気抵抗が不利。'},
  {id:'body-arrow',name:'ハヤテ R1600',grade:4,price:950,shape:'coupe',className:'1.6Lスポーツ',weight:10,drag:.88,cornering:1.08,roughGrip:.6,roughResistance:1.5,width:.064,cabinHeight:.02,cabinFront:.02,cabinRear:-.05,color:'#65bde2',description:'低いルーフと長いノーズのクーペ。舗装コーナーに強いが悪路で接地を失う。'},
  {id:'body-wagon',name:'ミナト W1800',grade:5,price:1500,shape:'wagon',className:'1.8Lワゴン',weight:17,drag:1,cornering:1.06,roughGrip:1.05,roughResistance:.86,width:.064,cabinHeight:.031,cabinFront:.03,cabinRear:-.083,color:'#859dc0',description:'長いルーフの万能ワゴン。軽快さより姿勢の落ち着きを重視。'},
  {id:'body-trail',name:'ヤマナミ T2000',grade:6,price:2100,shape:'suv',className:'2.0LオフロードSUV',weight:23,drag:1.22,cornering:.94,roughGrip:1.65,roughResistance:.38,width:.067,cabinHeight:.046,cabinFront:.048,cabinRear:-.085,color:'#d5a26a',description:'大型バンパーとルーフレールを備える悪路特化型。高トルクモーターと相性がよい。'},
  {id:'body-sport',name:'ハヤテ RS2000',grade:7,price:2700,shape:'coupe',className:'2.0Lスポーツ',weight:12,drag:.81,cornering:1.16,roughGrip:.55,roughResistance:1.65,width:.067,cabinHeight:.017,cabinFront:.018,cabinRear:-.052,color:'#d56b67',description:'幅広・低重心のスポーツクーペ。旋回重視。凹凸のある道は避けたい。'},
  {id:'body-gt',name:'アカツキ GT3000',grade:8,price:3600,shape:'gt',className:'3.0L GT',weight:18,drag:.74,cornering:1.12,roughGrip:.62,roughResistance:1.42,width:.066,cabinHeight:.02,cabinFront:.012,cabinRear:-.048,color:'#b7a1d3',description:'長いノーズと流線型テール。高速巡航向きだが発進時の重量が響く。'},
  {id:'body-rally',name:'ワカバ RX',grade:9,price:4600,shape:'hatch',className:'ラリーハッチ',weight:16,drag:.98,cornering:1.11,roughGrip:1.45,roughResistance:.48,width:.065,cabinHeight:.03,cabinFront:.035,cabinRear:-.073,color:'#e7d8b2',description:'張り出したフェンダーの競技ハッチ。SUVほどの悪路特化ではなく旋回との両立型。'},
  {id:'body-proto',name:'アカツキ LM',grade:10,price:6500,shape:'prototype',className:'プロトタイプ',weight:11,drag:.66,cornering:1.2,roughGrip:.4,roughResistance:1.9,width:.068,cabinHeight:.014,cabinFront:.017,cabinRear:-.052,color:'#81d6ca',description:'低いキャビンと大きなウイングを持つ舗装競技専用。悪路には最も不向き。'},
  {id:'body-champion',name:'セイラン Vortex GT',grade:10,price:0,shape:'prototype',silhouette:'champion-aero',className:'チャンピオン・プロト',weight:10,drag:.68,cornering:1.24,roughGrip:.82,roughResistance:.92,width:.078,cabinHeight:.016,cabinFront:.025,cabinRear:-.075,color:'#df3b3a',description:'最強兄弟との特別レース後に青葉博士から贈られる最上位ボディ。赤白の流麗な低床カウルに青緑のアクセント、立体ウイングとサイドフィンを備える。最後まで使える万能寄りの競技モデル。'},
  {id:'body-legend-flow',name:'ゼファー・ロッソ',grade:10,price:0,shape:'coupe',silhouette:'flow',className:'展示専用ミッドシップ',weight:11,drag:.66,cornering:1.2,roughGrip:.4,roughResistance:1.9,width:.068,cabinHeight:.017,cabinFront:.018,cabinRear:-.045,color:'#e34438',description:'曲面フェンダーと低い流線ノーズの独自スーパースポーツ。'},
  {id:'body-legend-wedge',name:'バースト・ヴェローチェ',grade:10,price:0,shape:'coupe',silhouette:'wedge',className:'展示専用ウェッジ',weight:18,drag:.74,cornering:1.12,roughGrip:.62,roughResistance:1.42,width:.069,cabinHeight:.014,cabinFront:.025,cabinRear:-.055,color:'#efb82f',description:'低い楔形ノーズ、広いリア、大型サイドインテークを備える独自モデル。'},
  {id:'body-legend-muscle',name:'ランブラー・ツインR',grade:10,price:0,shape:'gt',silhouette:'muscle',className:'展示専用国産GT風',weight:16,drag:.98,cornering:1.11,roughGrip:1.45,roughResistance:.48,width:.068,cabinHeight:.029,cabinFront:.028,cabinRear:-.036,color:'#b9c7d4',description:'角張ったノーズと張り出すフェンダー、4灯の丸いテールを持つ独自GT。'},
];
export function bodyDesign(id:string):BodyDesign{return bodies.find(b=>b.id===id)??bodies[0];}
