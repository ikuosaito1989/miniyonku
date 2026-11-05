import {proficiencyStandings} from './proficiency';
// 同点ではレジェンドが先。単独1位になったときだけ最終段階へ。
export const mechanicMasterPoints=Math.max(...proficiencyStandings(0).filter(p=>p.id!=='player').map(p=>p.points))+1;
export const mechanicMotorStages=[
 {points:0,rpm:11000,torque:.9},{points:100,rpm:13500,torque:1.05},
 {points:240,rpm:15000,torque:1.2},{points:520,rpm:17000,torque:1.45},
 {points:750,rpm:18500,torque:1.9},{points:1100,rpm:19500,torque:2.4},
 {points:1200,rpm:20500,torque:3},{points:1400,rpm:21500,torque:3.6},
 {points:mechanicMasterPoints,rpm:28500,torque:8},
].map((stage,index)=>({...stage,id:`motor-mechanic-${index}`,level:index+1}));
export const isMechanicMotor=(id:string)=>mechanicMotorStages.some(stage=>stage.id===id);
export function mechanicMotorFor(points:number){return mechanicMotorStages.filter(stage=>points>=stage.points).at(-1)??mechanicMotorStages[0];}
export const mechanicMotorParts=mechanicMotorStages.map((stage,index)=>({
 id:stage.id,category:'motor' as const,name:`メカニック・リンク Lv.${stage.level}`,
 price:0,description:`メカニックマンからの贈り物。熟練度で自動成長する専用モーター。消耗なし・慣らし不要。${index===8?'熟練度ランキング単独1位の証。最高クラスの回転とトルク。':`次の強化は熟練度${mechanicMotorStages[index+1].points}pt。最高段階はランキング単独1位で解放。`}非売品。`,
 specs:{rpm:stage.rpm,torque:stage.torque,weight:20,wear:0},
 performance:`${stage.rpm.toLocaleString('en-US')} rpm / トルク ${stage.torque.toFixed(2)} mN·m / 20 g / 消耗なし・自動成長 / 非売品`,
}));
