import {room,roomView,type Fixture} from './shop';
/** 店舗の原画は以前と同じ全室座標。会場の原画はカメラ描画範囲。 */
export function paintedSceneryLayout(id:string){return {bounds:id.startsWith('stadium-')?roomView:{x:0,y:0,width:room.width,height:room.height},mirrored:id==='aozora'};}
export function paintedFixtureFrame(id:string,f:Pick<Fixture,'x'|'y'|'w'|'h'>,imageWidth:number,imageHeight:number){
 const {bounds,mirrored}=paintedSceneryLayout(id),sx=imageWidth/bounds.width,sy=imageHeight/bounds.height,sourceX=mirrored?room.width-f.x-f.w:f.x;
 return {x:Math.round((sourceX-bounds.x)*sx),y:Math.round((f.y-bounds.y)*sy),width:Math.round(f.w*sx),height:Math.round(f.h*sy)};
}
