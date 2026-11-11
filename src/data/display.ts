import {roomView} from './shop';
export function compactDevice(){return typeof window!=='undefined'&&(matchMedia('(pointer: coarse)').matches||innerWidth<=720);}
export const shopRenderOptions={pixelArt:true,roundPixels:true,antialias:false,antialiasGL:false} as const;
// 実ピクセルに合わせつつDPR・長辺・総ピクセル数でGPU負荷を制限する。
export const raceRenderLimits={desktop:{edge:2560,pixels:2560*1440},mobile:{edge:1600,pixels:1600*900},dpr:2} as const;
export function raceRenderSize(compact:boolean,width:number,height:number,dpr=1){
  const dimension=(value:number)=>Number.isFinite(value)?Math.max(1,value):1;
  const w=dimension(width),h=dimension(height),limits=compact?raceRenderLimits.mobile:raceRenderLimits.desktop;
  const scale=Math.min(dimension(dpr),raceRenderLimits.dpr,limits.edge/Math.max(w,h),Math.sqrt(limits.pixels/(w*h)));
  return {width:Math.max(1,Math.round(w*scale)),height:Math.max(1,Math.round(h*scale))};
}

// Retain Retina clarity while capping raster work for small-device memory budgets.
export function shopRenderScale(width:number,height:number,dpr=1){
  const w=Number.isFinite(width)?Math.max(1,width):1,h=Number.isFinite(height)?Math.max(1,height):1;
  const density=Number.isFinite(dpr)?Math.max(1,dpr):1;
  return Math.min(density,2,2560/Math.max(w,h),Math.sqrt(1_500_000/(w*h)));
}

// 街と模型店で同じ人物が同じ大きさになるよう、模型店の倍率を共用する。
export function shopWorldZoom(width:number,height:number,compact:boolean){
  if(compact){const zoom=Math.max(width/560,height/roomView.height);return {x:zoom,y:zoom};}
  return {x:width/roomView.width,y:height/roomView.height};
}
/** The street view frames the civic block instead of zooming to indoor scale. */
export function townWorldZoom(width:number,height:number,compact:boolean){
  // Frame the civic arena and hobby shop as one landmark block on phones.
  const targetWidth=compact?1200:1800,targetHeight=compact?1640:1100;
  const zoom=Math.max(.16,Math.min(width/targetWidth,height/targetHeight));
  return {x:zoom,y:zoom};
}
