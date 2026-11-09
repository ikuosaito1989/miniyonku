import {masterCourses,masterCourseIds,isMasterCourse,type MasterCourseId} from './masterCourses';
import {pavedSurface} from './surfaces';
import type {TrackSurface} from './surfaces';
// 旧周回数に応じて1周を縮尺し、5レーンを一巡しても総距離を保つ。
const course=(name:string,feature:string,advice:string,radiusX:number,radiusZ:number,turns:number,wave:number,hills:number,height:number,surface:TrackSurface=pavedSurface,previousLaps=3,jump=false)=>{
 const layoutScale=previousLaps/5;
 return {name,feature,advice,radiusX:radiusX*layoutScale,radiusZ:radiusZ*layoutScale,turns,wave,hills,height:height*layoutScale,surface,laps:5,jump,layoutScale,lanes:5,laneWidth:.22,asymmetry:0,chicane:0,samples:2400,cornerLoad:1.3};
};
export const practiceCourses={
 'park-switchback':course('千曲スイッチバック','細かな切り返しが延々と続く多コーナーコース。','低摩擦ローラーと旋回抵抗の小さい足まわりを比べよう。',26,20,9,.09,0,0),
 'park-hairpin':course('双牙ヘアピン','長い直線の両端にきついヘアピンが待つ。','直線の最高速だけでなく、旋回の安定と再加速も必要。',40,8,4,.08,0,0),
 'park-slalom':course('風紋スラローム','大きなS字と連続コーナーをつなぐ舗装コース。','グリップと横擦れ、軽さと安定のバランスを試そう。',28,19,6,.12,0,0),
 'park-sand':course('砂海デューン','全区間が砂地のオフロード。舗装区間はない。','砂用タイヤと駆動力を重視。軽いスリックは接地不足になりやすい。',27,19,3,.08,0,0,{name:'砂地',roughness:1,grip:.68}),
 'park-gravel':course('岩粒グラベル','全区間が砂利。揺れを抑えて走る悪路コース。','制振と追従性を確保し、重量と旋回抵抗も見直そう。',30,22,5,.08,0,0,{name:'砂利',roughness:.85,grip:.8}),
 'park-climb':course('三峰ヒルクライム','1周に3つの大きな坂を越える舗装コース。','高トルク・小径タイヤ・減速ギアで坂の再加速を比べよう。',30,20,0,0,3,2.5),
 'park-waves':course('七波アップダウン','1周に7つの上り下りが連続する。','最高速を欲張らず、駆動力とブレーキによる減速を調整しよう。',32,23,0,0,7,1.2),
 'park-ridge':course('山稜ダートクロス','砂地と坂が重なる全面オフロードの山岳コース。','悪路の接地と登坂力の両方が必要。舗装用の軽量装備とは使い分けよう。',32,22,4,.06,4,1.6,{name:'山岳ダート',roughness:.9,grip:.72}),
 'park-velocity':course('流線ハイスピード','非常に長い直線と緩いカーブをつなぐ高速コース。','高回転モーターや高速ギア、大径タイヤの伸びを比べよう。',55,13,0,0,0,0,pavedSurface,2),
 'park-jump':course('翼丘ジャンプラリー','舗装の連続カーブに坂とジャンプ台を組み合わせた立体コース。','着地の反発と制振、ブレーキを調整。減速しすぎると飛距離が不足する。',30,22,4,.07,2,.8,pavedSurface,3,true),
 'park-endurance':course('翠風エンデュランス','長い周回を走る屋外耐久コース。電池の残量と後半の速度が勝負を分ける。','高出力の短距離電池と、重い長距離電池の走りを比べよう。',43,25,3,.035,0,0,pavedSurface,8),
 ...Object.fromEntries(masterCourseIds.map(id=>[id,{...course(masterCourses[id].name,masterCourses[id].feature,masterCourses[id].advice,40,25,0,0,0,0),laps:1}])) as Record<MasterCourseId,ReturnType<typeof course>>
};
export type PracticeCourseId=keyof typeof practiceCourses;
export const practiceCourseIds=Object.keys(practiceCourses) as PracticeCourseId[];
export const isPracticeCourse=(id:string):id is PracticeCourseId=>Object.hasOwn(practiceCourses,id);

export const regularPracticeCourseIds=practiceCourseIds.filter((id):id is Exclude<PracticeCourseId,MasterCourseId>=>!isMasterCourse(id));
