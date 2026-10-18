export interface TrackSurface { name:string; roughness:number; grip:number }
export const pavedSurface:TrackSurface={name:'舗装',roughness:0,grip:1};
// 将来のコースデータとシミュレーション検証で共用。現コースには未配置。
export const dirtSurface:TrackSurface={name:'ダート',roughness:.8,grip:.78};
