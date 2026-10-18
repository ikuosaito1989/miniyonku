export type Category = 'body' | 'chassis' | 'battery' | 'accessory' | 'wheel' | 'motor' | 'gear' | 'tire' | 'roller' | 'shaft' | 'terminal';
export const categories: Record<Category, string> = { body:'ボディ', chassis:'シャーシ', motor: 'モーター', gear: 'ギア', battery:'電池', tire: 'タイヤ', wheel:'ホイール', roller: 'ローラー', shaft: 'シャフト', terminal: 'ターミナル', accessory:'その他' };
export interface Part { id: string; category: Category; name: string; price: number; description: string; specs: Record<string, number>; performance: string }
export const parts: Part[] = [
  {id:'body-stream',category:'body',name:'リーフストリーム',price:400,description:'細いノーズを持つ入門用カウル。',specs:{weight:13,drag:1,stability:1},performance:'13 g / 空気抵抗 ×1.00 / 安定性 ×1.00'},
  {id:'body-arrow',category:'body',name:'アークアロー',price:950,description:'スリムな高速仕様。軽いがコーナーでは慎重に。',specs:{weight:10,drag:0.88,stability:0.97},performance:'10 g / 空気抵抗 ×0.88 / 安定性 ×0.97'},
  {id:'body-manta',category:'body',name:'ミストマンタ',price:900,description:'幅広いカウルが姿勢を支える。',specs:{weight:16,drag:1.08,stability:1.07},performance:'16 g / 空気抵抗 ×1.08 / 安定性 ×1.07'},
  {id:'chassis-basic',category:'chassis',name:'K1 ベーシック',price:450,description:'扱いやすい標準シャーシ。',specs:{weight:20,efficiency:1,stability:1},performance:'20 g / 駆動効率 ×1.00 / 安定性 ×1.00'},
  {id:'chassis-light',category:'chassis',name:'K1 ライト',price:1000,description:'肉抜きで軽量化。加速重視の設計。',specs:{weight:16,efficiency:1.02,stability:0.97},performance:'16 g / 駆動効率 ×1.02 / 安定性 ×0.97'},
  {id:'chassis-low',category:'chassis',name:'K2 ローセンター',price:1100,description:'低重心でコーナーの安定性を高める。',specs:{weight:23,efficiency:0.98,stability:1.08},performance:'23 g / 駆動効率 ×0.98 / 安定性 ×1.08'},
  {id:'battery-basic',category:'battery',name:'ベーシックセル',price:150,description:'出力は控えめだが軽い入門用電池2本。',specs:{weight:40,power:1,endurance:90},performance:'2本 40 g / 出力 ×1.00 / 持続係数90秒'},
  {id:'battery-power',category:'battery',name:'スパークセル',price:450,description:'高出力の短距離向け電池2本。後半の電圧低下に注意。',specs:{weight:45,power:1.12,endurance:55},performance:'2本 45 g / 出力 ×1.12 / 持続係数55秒'},
  {id:'battery-endurance',category:'battery',name:'ロングランセル',price:650,description:'出力低下の緩やかな長距離向け電池2本。',specs:{weight:43,power:1.02,endurance:180},performance:'2本 43 g / 出力 ×1.02 / 持続係数180秒'},
  {id:'wheel-basic',category:'wheel',name:'スタンダード5スポーク',price:250,description:'タイヤとは別に交換するホイール4本セット。',specs:{weight:6,diameter:17,cornerDrag:1},performance:'4本 6 g / リム径17 mm / コーナー抵抗 ×1.00'},
  {id:'wheel-light',category:'wheel',name:'ライト6スポーク',price:650,description:'軽いスポーク構造で加速を助ける。',specs:{weight:4,diameter:17,cornerDrag:0.97},performance:'4本 4 g / リム径17 mm / コーナー抵抗 ×0.97'},
  {id:'wheel-oneway',category:'wheel',name:'スムースワンウェイ',price:900,description:'内外輪の回転差を逃がしコーナー抵抗を減らす。',specs:{weight:9,diameter:17,cornerDrag:0.78},performance:'4本 9 g / リム径17 mm / コーナー抵抗 ×0.78'},
  {id:'accessory-none',category:'accessory',name:'補助パーツなし',price:0,description:'追加パーツを外して軽量化する。',specs:{weight:0,stability:1,efficiency:1},performance:'追加重量 0 g'},
  {id:'accessory-weight',category:'accessory',name:'バランスウェイト',price:350,description:'低い位置に重りを付け、安定性と重量を交換する。',specs:{weight:5,stability:1.1,efficiency:1},performance:'5 g / 安定性 ×1.10'},
  {id:'accessory-support',category:'accessory',name:'アルミ駆動サポート',price:550,description:'モーターの固定を補強し駆動ロスを軽減する。',specs:{weight:2,stability:1,efficiency:1.04},performance:'2 g / 駆動効率 ×1.04'},
  { id:'motor-stock', category:'motor', name:'スタンダードモーター', price:250, description:'扱いやすい、すべての始まり。', specs:{rpm:14000,torque:1.2,weight:18}, performance:'14,000 rpm / トルク 1.2 mN·m / 18 g' },
  { id:'motor-rev', category:'motor', name:'スカイリブモーター', price:850, description:'高回転型。ギアとタイヤの選択が鍵。', specs:{rpm:21000,torque:0.9,weight:18}, performance:'21,000 rpm / トルク 0.9 mN·m / 18 g' },
  { id:'motor-torque', category:'motor', name:'グリットモーター', price:800, description:'立ち上がりを支える高トルク型。', specs:{rpm:16000,torque:1.8,weight:20}, performance:'16,000 rpm / トルク 1.8 mN·m / 20 g' },
  ...[5,4,3.5].map((ratio,i):Part=>({id:`gear-${ratio}`,category:'gear',name:`精密ギア ${ratio}:1`,price:200+i*150,description:'減速比で最高速と駆動力のバランスを調整。',specs:{ratio,weight:4},performance:`減速比 ${ratio}:1 / 4 g`})),
  ...['ノーマル','スポンジ','ハード'].map((name,i):Part=>({id:`tire-${i}`,category:'tire',name:`${name}タイヤ`,price:250+i*150,description:'グリップと重量で走りを変える。',specs:{diameter:26,grip:[0.85,1.1,0.7][i],weight:[12,8,11][i]},performance:`直径 26 mm / グリップ ${[0.85,1.1,0.7][i]} / ${[12,8,11][i]} g`})),
  ...['樹脂','ゴム','ベアリング'].map((name,i):Part=>({id:`roller-${i}`,category:'roller',name:`${name}ローラー`,price:200+i*300,description:'コーナーでマシンの姿勢を支える。',specs:{friction:[0.12,0.24,0.05][i],weight:6+i},performance:`摩擦係数 ${[0.12,0.24,0.05][i]} / ${6+i} g`})),
  ...['ノーマル','中空'].map((name,i):Part=>({id:`shaft-${i}`,category:'shaft',name:`${name}シャフト`,price:150+i*350,description:'駆動をタイヤへ伝える足回りの芯。',specs:{weight:i?3:6},performance:`重量 ${i?3:6} g`})),
  ...['ノーマル','ゴールド'].map((name,i):Part=>({id:`terminal-${i}`,category:'terminal',name:`${name}ターミナル`,price:150+i*450,description:'電池からモーターへの電力を届ける。',specs:{efficiency:i?0.97:0.88,weight:2},performance:`伝達効率 ${i?97:88}% / 2 g`})),
];
