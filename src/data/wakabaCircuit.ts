/** 1周半の立体スパイラルを持つ閉じたコースの制御点。単位はm。 */
const controls=[[-4,-8,0],[3,-8,0],[9,-6,0],[12,-1,0],[9,3,0],[11,7,0],[5,9,0],[-2,8,0],[-6,6,0],[-9,4,0]];
for(let i=0;i<=18;i++){const a=Math.PI/2+i*Math.PI/6;controls.push([-12+4*Math.cos(a),-1+4*Math.sin(a),i/18*1.65]);}
controls.push([-8,-7,.7]);
export function wakabaPoint(t:number){
 const u=((t/(2*Math.PI)%1)+1)%1*controls.length,index=Math.floor(u),f=u-index;
 const sample=(i:number)=>controls[(i+controls.length)%controls.length];
 const [a,b,c,d]=[sample(index-1),sample(index),sample(index+1),sample(index+2)];
 const curve=(axis:number)=>.5*((2*b[axis])+(-a[axis]+c[axis])*f+(2*a[axis]-5*b[axis]+4*c[axis]-d[axis])*f*f+(-a[axis]+3*b[axis]-3*c[axis]+d[axis])*f*f*f);
 return {x:curve(0),z:curve(1),elevation:Math.max(0,curve(2))};
}
