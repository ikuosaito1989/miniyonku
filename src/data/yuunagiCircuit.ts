/** スタートとゴールが別の、1周半の高架スパイラルを持つ一本道。 */
const controls=[[-18,-12,0],[-12,-12,0],[-6,-10,0],[-2,-6,0],[0,0,0]];
for(let i=0;i<=27;i++){
 const a=Math.PI-i*Math.PI/9;
 controls.push([4+4*Math.cos(a),4+4*Math.sin(a),i/27*1.5]);
}
controls.push([8,-2,1.1],[12,-7,0],[18,-7,0],[23,-3,0],[26,3,0],[26,11,0],[22,16,0],[15,18,0]);
export function yuunagiPoint(t:number){
 const u=Math.max(0,Math.min(1,t/(2*Math.PI)))*(controls.length-1),i=Math.min(controls.length-2,Math.floor(u)),f=u-i;
 const sample=(j:number)=>j<0?controls[0].map((v,k)=>2*v-controls[1][k]):j>=controls.length?controls.at(-1)!.map((v,k)=>2*v-controls.at(-2)![k]):controls[j];
 const [a,b,c,d]=[sample(i-1),sample(i),sample(i+1),sample(i+2)];
 const curve=(axis:number)=>.5*(2*b[axis]+(-a[axis]+c[axis])*f+(2*a[axis]-5*b[axis]+4*c[axis]-d[axis])*f*f+(-a[axis]+3*b[axis]-3*c[axis]+d[axis])*f*f*f);
 return {x:curve(0)*.94,z:curve(1)*.94,elevation:Math.max(0,curve(2))};
}
export const yuunagiTimeLimit=40;
