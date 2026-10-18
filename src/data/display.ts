export function compactDevice(){return typeof window!=='undefined'&&(matchMedia('(pointer: coarse)').matches||innerWidth<=720);}
export const shopRenderOptions={pixelArt:false,roundPixels:false,antialias:true,antialiasGL:true} as const;
// 実ピクセルに合わせつつDPR・長辺・総ピクセル数でGPU負荷を制限する。
export const raceRenderLimits={desktop:{edge:2560,pixels:2560*1440},mobile:{edge:1920,pixels:1920*1080},dpr:2} as const;
export function raceRenderSize(compact:boolean,width:number,height:number,dpr=1){
  const dimension=(value:number)=>Number.isFinite(value)?Math.max(1,value):1;
  const w=dimension(width),h=dimension(height),limits=compact?raceRenderLimits.mobile:raceRenderLimits.desktop;
  const scale=Math.min(dimension(dpr),raceRenderLimits.dpr,limits.edge/Math.max(w,h),Math.sqrt(limits.pixels/(w*h)));
  return {width:Math.max(1,Math.round(w*scale)),height:Math.max(1,Math.round(h*scale))};
}
