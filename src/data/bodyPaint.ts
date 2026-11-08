export const bodyPaints=[
 ['レッド',0xe34242],['ブルー',0x2475da],['イエロー',0xf2c943],['グリーン',0x42a76a],
 ['オレンジ',0xed8736],['パープル',0x9258c7],['ピンク',0xe76da4],['ターコイズ',0x36b9b0],
 ['ホワイト',0xf2f1e9],['シルバー',0xb9c4cf],['ブラック',0x252b35],['ゴールド',0xc5a452],
] as const;
export function decodeBodyPaint(value:unknown):number|null{
 if(value===undefined||value===null)return null;
 if(typeof value!=='number'||!Number.isInteger(value)||value<0||value>0xffffff)throw new Error('ボディカラーが不正です。');
 return value;
}
