export type Category = 'motor' | 'gear' | 'tire' | 'roller' | 'shaft' | 'terminal';
export const categories: Record<Category, string> = { motor: 'モーター', gear: 'ギア', tire: 'タイヤ', roller: 'ローラー', shaft: 'シャフト', terminal: 'ターミナル' };
export interface Part { id: string; category: Category; name: string; price: number; description: string; specs: Record<string, number>; performance: string }
export const parts: Part[] = [
  { id:'motor-stock', category:'motor', name:'スタンダードモーター', price:250, description:'扱いやすい、すべての始まり。', specs:{rpm:14000,torque:1.2,weight:18}, performance:'14,000 rpm / トルク 1.2 mN·m / 18 g' },
  { id:'motor-rev', category:'motor', name:'スカイリブモーター', price:850, description:'高回転型。ギアとタイヤの選択が鍵。', specs:{rpm:21000,torque:0.9,weight:18}, performance:'21,000 rpm / トルク 0.9 mN·m / 18 g' },
  { id:'motor-torque', category:'motor', name:'グリットモーター', price:800, description:'立ち上がりを支える高トルク型。', specs:{rpm:16000,torque:1.8,weight:20}, performance:'16,000 rpm / トルク 1.8 mN·m / 20 g' },
  ...[5,4,3.5].map((ratio,i):Part=>({id:`gear-${ratio}`,category:'gear',name:`精密ギア ${ratio}:1`,price:200+i*150,description:'減速比で最高速と駆動力のバランスを調整。',specs:{ratio,weight:4},performance:`減速比 ${ratio}:1 / 4 g`})),
  ...['ノーマル','スポンジ','ハード'].map((name,i):Part=>({id:`tire-${i}`,category:'tire',name:`${name}タイヤ`,price:250+i*150,description:'グリップと重量で走りを変える。',specs:{diameter:26,grip:[0.85,1.1,0.7][i],weight:[12,8,11][i]},performance:`直径 26 mm / グリップ ${[0.85,1.1,0.7][i]} / ${[12,8,11][i]} g`})),
  ...['樹脂','ゴム','ベアリング'].map((name,i):Part=>({id:`roller-${i}`,category:'roller',name:`${name}ローラー`,price:200+i*300,description:'コーナーでマシンの姿勢を支える。',specs:{friction:[0.12,0.24,0.05][i],weight:6+i},performance:`摩擦係数 ${[0.12,0.24,0.05][i]} / ${6+i} g`})),
  ...['ノーマル','中空'].map((name,i):Part=>({id:`shaft-${i}`,category:'shaft',name:`${name}シャフト`,price:150+i*350,description:'駆動をタイヤへ伝える足回りの芯。',specs:{weight:i?3:6},performance:`重量 ${i?3:6} g`})),
  ...['ノーマル','ゴールド'].map((name,i):Part=>({id:`terminal-${i}`,category:'terminal',name:`${name}ターミナル`,price:150+i*450,description:'電池からモーターへの電力を届ける。',specs:{efficiency:i?0.97:0.88,weight:2},performance:`伝達効率 ${i?97:88}% / 2 g`})),
];
