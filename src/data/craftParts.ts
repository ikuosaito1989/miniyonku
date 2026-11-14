import {mechanicMotorStages} from './mechanicMotor';
import type {BodyDesign} from './bodies';

export type CraftKind='body'|'chassis';
export const craftStages=mechanicMotorStages.map(({points,level},index)=>({points,level,body:`body-craft-${index}`,chassis:`chassis-craft-${index}`}));
export const craftStageFor=(points:number)=>craftStages.filter(stage=>points>=stage.points).at(-1)??craftStages[0];
export const isCraftPart=(id:string,kind:CraftKind)=>craftStages.some(stage=>stage[kind]===id);

export const craftBodyDesigns:BodyDesign[]=craftStages.map(({level,body},index)=>({
 id:body,name:`風紡ぎ・カウル Lv.${level}`,grade:level,price:0,shape:'prototype',className:'職人の成長ボディ',
 weight:13-index*.5,drag:1-index*.04,cornering:1+index*.0275,roughGrip:.8,roughResistance:1.12,
 width:.065,cabinHeight:.02,cabinFront:.022,cabinRear:-.055,color:index>=8?'#e9c67a':index>=5?'#b8e0dd':'#78b9ba',
 description:'風を受け流す軽量カウル。熟練度で自動成長する非売品。舗装向きで深い砂では接地を補おう。',
}));
export const craftChassisParts=craftStages.map(({level,chassis},index)=>({
 id:chassis,category:'chassis' as const,name:`結び・フレーム Lv.${level}`,price:0,
 description:'軽さと駆動のつながりを磨く職人のシャーシ。熟練度で自動成長する非売品。',
 specs:{weight:20-index*.55,efficiency:1+index*.01,stability:1+index*.035,roughGrip:1,roughResistance:1},
 performance:`${(20-index*.55).toFixed(1)} g / 駆動効率 ×${(1+index*.01).toFixed(2)} / 安定性 ×${(1+index*.035).toFixed(2)} / 非売品`,
}));
