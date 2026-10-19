export function createShopGesture(){
  let active:{id:number;x:number;y:number;time:number;dragged:boolean}|null=null;
  let vector={x:0,y:0};
  let lastTap:{x:number;y:number;time:number}|null=null;
  return {
    down(id:number,x:number,y:number,time:number){
      if(active&&active.id!==id){this.reset();return;}
      active={id,x,y,time,dragged:false};vector={x:0,y:0};
    },
    move(id:number,x:number,y:number){
      if(!active||active.id!==id)return;
      const dx=x-active.x,dy=y-active.y;
      if(Math.hypot(dx,dy)>12)active.dragged=true;
      if(Math.hypot(dx,dy)<=10){vector={x:0,y:0};return;}
      vector=Math.abs(dx)>=Math.abs(dy)?{x:Math.sign(dx),y:0}:{x:0,y:Math.sign(dy)};
    },
    up(id:number,x:number,y:number,time:number,emptyFloor:boolean):'tap'|'setting'|null{
      const start=active;
      if(!start||start.id!==id)return null;
      this.move(id,x,y);active=null;vector={x:0,y:0};
      if(start.dragged||time-start.time>600){lastTap=null;return null;}
      if(!emptyFloor){lastTap=null;return 'tap';}
      const double=lastTap&&time-lastTap.time<=320&&Math.hypot(x-lastTap.x,y-lastTap.y)<=28;
      lastTap=double?null:{x,y,time};
      return double?'setting':'tap';
    },
    direction:()=>({...vector}),
    reset(){active=null;lastTap=null;vector={x:0,y:0};},
  };
}
