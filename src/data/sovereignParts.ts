import type {Equipment} from './machine';
import type {Category} from './parts';
const part=(id:string,category:Category,name:string,description:string,specs:Record<string,number>,performance:string)=>({id,category,name,price:250000,description:`星霧模型工房限定・星皇シリーズ。${description}`,specs,performance});
export const sovereignParts=[
 part('motor-sovereign','motor','星皇オーバードライブモーター','最高回転数と最大トルクを両立。慣らし不要・摩耗なし。強い出力を路面へ伝えるには、タイヤとギアの選択も大切。',{rpm:32000,torque:12,weight:17,wear:0},'32,000 rpm / 12.0 mN·m / 17 g / 消耗なし'),
 part('chassis-sovereign','chassis','星皇ゼロリミットシャーシ','最軽量・最高効率・最高安定の高剛性シャーシ。舗装と立体コースに強いが、深い砂ではデューンの追従性を組み合わせる余地がある。',{weight:13,efficiency:1.3,stability:4.3,damping:.6,roughGrip:1.3,roughResistance:.55,compliance:1.4},'13 g / 駆動効率×1.30 / 安定性×4.30 / 制振60%'),
 part('battery-sovereign','battery','星皇インフィニットセル','最高出力・最軽量の電池2本。残量は減らず、長距離でも出力を維持する。',{weight:36,power:1.16,endurance:700,consumption:0},'2本36 g / 出力×1.16 / 残量100%固定'),
 part('gear-sovereign','gear','星皇マイクロドライブ 4:1','最軽量の精密ギア。4:1は高速と駆動力の両立用。急坂は5.2:1、高速区間は3.5:1も試し、モーターと路面に合わせて選ぼう。',{ratio:4,weight:1},'減速比4:1 / 1 g / 比率は万能ではない'),
 part('tire-sovereign','tire','星皇プラチナ・スリック','最軽量・最高グリップ・舗装抵抗ゼロの硬質スリック。砂では沈みやすく凹凸への追従が弱い。深い砂や砂利は専用タイヤとの混成で速くできる。',{diameter:26,grip:2.05,weight:6,pavedDrag:0,compliance:.55,roughResistance:.9,damping:.04},'径26 mm / グリップ2.05 / 6 g / 硬質・舗装特化'),
 part('wheel-sovereign','wheel','星皇フローティング・リング','最軽量・最小の旋回抵抗を持つ独立駆動ホイール。タイヤの接地特性は別なので、路面に合わせて組み合わせよう。',{weight:2,diameter:17,cornerDrag:.2},'2 g / リム径17 mm / 旋回抵抗×0.20'),
 part('roller-sovereign','roller','星皇ジュエル・ガイド','最高の安定性と最小摩擦を両立する軽量ローラー。1セットで前・中・後へ装着できる。',{weight:4,friction:.012,stability:1.45,damping:.12},'摩擦0.012 / 安定性×1.45 / 制振12% / 4 g'),
 part('shaft-sovereign','shaft','星皇モノクリスタル・シャフト','最軽量の高剛性シャフト。足回りの負担を抑え、他のパーツに重量を配分できる。',{weight:1},'重量1 g'),
 part('terminal-sovereign','terminal','星皇ゼロロス・ターミナル','最高の伝達効率と最軽量を両立。電池とモーターの出力を損失なく伝える。',{weight:1,efficiency:1},'伝達効率100% / 1 g'),
 part('accessory-sovereign-drive','accessory','星皇リニア駆動サポート','補助パーツで最高の駆動効率。加速・坂・再発進を支える。その他の異なる星皇補助パーツと併用可能。',{weight:1.5,stability:1.06,efficiency:1.16},'1.5 g / 駆動効率×1.16'),
 part('accessory-sovereign-gyro','accessory','星皇ベクター・ジャイロ','補助パーツで最高の旋回安定性。高速の切り返しを支える。安定が十分なコースでは外して軽量化する選択もできる。',{weight:3,stability:1.5,efficiency:1,damping:.12},'3 g / 安定性×1.50 / 制振12%'),
 part('accessory-sovereign-damper','accessory','星皇アクティブ・ダンパー','補助パーツで最高の制振性能。着地と路面振動を抑える。制振は合計90%で頭打ちになるため、構成によっては軽量品やスライドへ交換する方が速い。',{weight:4,stability:1.25,efficiency:1,damping:.7},'4 g / 安定性×1.25 / 制振70%'),
];
export const sovereignBodyId='body-sovereign';
export const sovereignPartIds=[...sovereignParts.map(p=>p.id),sovereignBodyId];
export const isSovereignPart=(id:string)=>sovereignPartIds.includes(id);

export const sovereignEquipment:Equipment={body:'body-sovereign',chassis:'chassis-sovereign',motor:'motor-sovereign',gear:'gear-sovereign',battery:'battery-sovereign',tire:'tire-sovereign',wheel:'wheel-sovereign',rollerFront:'roller-sovereign',rollerSide:'roller-sovereign',rollerRear:'roller-sovereign',shaft:'shaft-sovereign',terminal:'terminal-sovereign',accessory:'accessory-sovereign-drive',accessory2:'accessory-sovereign-gyro',accessory3:'accessory-sovereign-damper'};
