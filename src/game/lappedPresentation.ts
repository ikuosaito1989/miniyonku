/** 周回遅れの失格演出。レースの距離・順位には影響させない。 */
export const lappedPresentationSeconds=2;
export function lappedPose(age:number){
  const t=Math.max(0,Math.min(1,age/1.4));
  return {outward:1.4*t,forward:.35*t,height:3*t*(1-t),pitch:-Math.PI*2*t,roll:Math.PI*2.5*t};
}
