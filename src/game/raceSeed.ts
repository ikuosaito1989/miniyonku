// 非決定的な値はレース開始時だけ生成し、走行計算には記録したseedを渡す。
export function nextRaceSeed(previous:number){
  const values=new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  const seed=values[0]||1;
  return seed===previous?(seed===0xffffffff?1:seed+1):seed;
}
