export function compactDevice(){return typeof window!=='undefined'&&(matchMedia('(pointer: coarse)').matches||innerWidth<=720);}
// スマホは画面サイズに合わせて描画し、GPU負荷を長辺1280px・DPR2までに制限する。
export function raceRenderSize(compact:boolean,width:number,height:number,dpr=1){
  const w=Math.max(1,width),h=Math.max(1,height);
  if(!compact)return {width:Math.max(1,Math.round(288*w/h)),height:288};
  const scale=Math.min(Math.max(1,dpr),2,1280/Math.max(w,h));
  return {width:Math.max(1,Math.round(w*scale)),height:Math.max(1,Math.round(h*scale))};
}
