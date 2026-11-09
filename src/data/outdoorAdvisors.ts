import {practiceCourseIds,practiceCourses,type PracticeCourseId} from './practiceCourses';
import {townCrowd} from './townCrowd';
import {parts} from './parts';

const advice:Record<PracticeCourseId,{name:string;parts:readonly (readonly [string,string])[]}>= {
 'master-azure':{name:'天野 蒼',parts:[['motor-hoshi-sprint','高速舗装の伸びとループの駆動力を両立する'],['gear-hoshi-3.8','縦ループで失速するときに駆動力を補う'],['tire-apex','舗装と砂の両方を走る足まわりを整える']]},
 'master-crimson':{name:'紅林 沙羅',parts:[['motor-hoshi-loop','深い砂とループを越えるトルクを確保する'],['tire-hoshi-gravel','舗装と悪路の抵抗を見比べる'],['chassis-hoshi-fm','砂地での接地と制振を助ける']]},
 'master-violet':{name:'紫原 旋',parts:[['motor-hoshi-light','軽い車体で連続S字後の再加速を助ける'],['chassis-hoshi-corner','低い重心で切り返しの姿勢を安定させる'],['tire-hoshi-low','ジャンプ着地の跳ねを減らす']]},
 'master-gold':{name:'金城 恒',parts:[['battery-hoshi-long','後半まで残量を確保する'],['motor-hoshi-loop','大容量電池の重さを支えるトルクを確保する'],['tire-hoshi-gravel','砂利への接地と舗装での転がりを両立する']]},
 'park-switchback':{name:'松原 航',parts:[['roller-special-velocity-free','細かな切り返しで壁との摩擦を抑える'],['wheel-floating','内外輪の回転差による抵抗を減らす'],['chassis-turn','低い重心で連続コーナーの姿勢を支える']]},
 'park-hairpin':{name:'二階堂 颯',parts:[['motor-turn','ヘアピン後の再加速を助ける'],['roller-ceramic','壁に触れるときの摩擦を抑える'],['tire-turn','舗装のグリップと安定を確保する']]},
 'park-slalom':{name:'風岡 紬',parts:[['roller-special-velocity-free','左右の切り返しで速度を残す'],['wheel-floating','長いS字で旋回抵抗を抑える'],['chassis-turn','軽さと低い重心を両立する']]},
 'park-sand':{name:'砂川 陸斗',parts:[['motor-special-terrain-dune','重い悪路タイヤを回す力を確保する'],['tire-special-terrain-block','砂地での接地を確保する'],['chassis-special-terrain-flex','凹凸への追従と制振を助ける']]},
 'park-gravel':{name:'岩瀬 杏',parts:[['motor-special-terrain-rally','砂利で失った速度を取り戻す'],['tire-special-terrain-block','砂利に接地しながら走る'],['chassis-special-terrain-flex','細かな凹凸と揺れを吸収する']]},
 'park-climb':{name:'峰岸 岳人',parts:[['motor-special-torque-pull','三つの上り坂で駆動力を確保する'],['gear-special-terrain-rally','最高速より登坂力を重視する'],['battery-special-terrain-long','坂を何度も上るための残量を確保する']]},
 'park-waves':{name:'波多野 凪',parts:[['motor-special-torque-pull','七つの坂で繰り返す再加速を助ける'],['gear-special-terrain-rally','上りで失速しにくい減速比にする'],['chassis-turn','舗装の軽さと姿勢の安定を両立する']]},
 'park-ridge':{name:'尾根崎 悠真',parts:[['motor-special-torque-pull','砂地の上り坂を登る力を確保する'],['tire-special-terrain-block','悪路の坂で空転を抑える'],['chassis-special-terrain-flex','山岳ダートの凹凸に追従する']]},
 'park-velocity':{name:'流川 速人',parts:[['motor-special-velocity-rev','長い舗装直線で回転数を生かす'],['tire-special-velocity-slick','大径タイヤで直線の伸びを狙う'],['roller-special-velocity-free','カーブで壁との摩擦を抑える']]},
 'park-jump':{name:'羽鳥 美空',parts:[['tire-landing','低反発の素材で着地の跳ねを抑える'],['accessory-slide-rear','着地後の横揺れを抑える'],['accessory-brake-soft','飛びすぎるときに踏切前の速度を調整する。飛距離不足なら外して比べる']]},
 'park-endurance':{name:'長瀬 継',parts:[['motor-special-endurance-pace','長い周回で速度と消費のバランスを取る'],['battery-special-endurance-ultralong','後半まで電池の残量を確保する'],['gear-special-endurance-cruise','耐久向けの減速比で走る']]},
};

// 既存の観客を会話役にするため、入口や看板を塞ぐ人物を追加しない。
export const outdoorAdvisors=practiceCourseIds.map(courseId=>{
 const person=townCrowd.find(p=>p.venue===courseId&&p.activity==='watch');
 if(!person)throw new Error(`コースの相談役を配置できません: ${courseId}`);
 return {...person,courseId,name:advice[courseId].name};
});
export function outdoorAdvice(courseId:PracticeCourseId){
 const course=practiceCourses[courseId];
 const recommendations=advice[courseId].parts.map(([id,reason])=>{
  const part=parts.find(p=>p.id===id);
  if(!part)throw new Error(`おすすめパーツがありません: ${id}`);
  return `「${part.name}」は${reason}よ。`;
 });
 return `ここは「${course.name}」。${course.advice}\n\n${recommendations.join('\n')}\n\n一つずつ交換して、タイムと完走できるかを比べてね。モーターと電池の状態も確認しよう！`;
}
