// Start Vite, then run: node scripts/check-town-road-render.cjs [base URL]
// Requires Playwright and Chromium, like render-character-preview.cjs.
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage();await page.goto(process.argv[2]||'http://127.0.0.1:5173/');
  const result=await page.evaluate(async()=>{
   const {paintTownGround}=await import('/src/game/TownArt.ts');
   const {townVenues,townRoads,townSize,townWalkBounds}=await import('/src/data/world.ts');
   const failures=[],tiles=new Map();
   const canvas=(width,height)=>{const c=document.createElement('canvas');c.width=width;c.height=height;return c;};
   const asphalt=(rgba)=>rgba[0]<170&&rgba[1]<170&&rgba[2]>=rgba[0];
   const tile=(x,y)=>{
    const x0=Math.floor(x/2048)*2048,y0=Math.floor(y/2048)*2048,key=`${x0},${y0}`;
    if(!tiles.has(key)){
     const width=Math.min(2048,townSize.width-x0),height=Math.min(2048,townSize.height-y0),c=canvas(Math.ceil(width/2),Math.ceil(height/2)),ctx=c.getContext('2d');
     ctx.scale(.5,.5);ctx.translate(-x0,-y0);paintTownGround(ctx,x0,width,y0,height);tiles.set(key,c);
    }
    return {c:tiles.get(key),x0,y0};
   };
   const pixel=(x,y)=>{const {c,x0,y0}=tile(x,y);return [...c.getContext('2d').getImageData(Math.floor((x-x0)/2),Math.floor((y-y0)/2),1,1).data];};
   let intersections=0,venues=0,seams=0;
   for(const y of townRoads.horizontal)for(const x of townRoads.vertical){
    intersections++;
    for(const dy of [-90,90]){
     if(y+dy<townWalkBounds.top-24||y+dy>townWalkBounds.bottom+24)continue;
     const rgba=pixel(x+20,y+dy);if(!asphalt(rgba))failures.push({kind:'intersection',x,y,dy,rgba});
    }
   }
   for(const v of townVenues){
    const x=v.x+v.w/2,cy=v.entrance==='south'?v.y+v.h+30:v.y-30;
    if(x<64||x>townSize.width-256)continue;
    const roadY=townRoads.horizontal.reduce((a,b)=>Math.abs(b-cy)<Math.abs(a-cy)?b:a),y=roadY+(cy<roadY?-20:20),rgba=pixel(x,y);
    venues++;if(!asphalt(rgba))failures.push({kind:'venue',id:v.id,x,y,rgba});
   }
   // A single painted region and adjacent independently painted chunks must agree at the boundary.
   const render=(split,x0,y0,width,height,edge,vertical)=>{
    const c=canvas(width,height),ctx=c.getContext('2d');ctx.translate(-x0,-y0);
    if(!split)paintTownGround(ctx,x0,width,y0,height);
    else for(const [first,last] of vertical?[[x0,edge],[edge,x0+width]]:[[y0,edge],[edge,y0+height]]){
     ctx.save();ctx.beginPath();
     if(vertical){ctx.rect(first,y0,last-first,height);ctx.clip();paintTownGround(ctx,first,last-first,y0,height);}
     else{ctx.rect(x0,first,width,last-first);ctx.clip();paintTownGround(ctx,x0,width,first,last-first);}
     ctx.restore();
    }
    return ctx.getImageData(0,0,width,height).data;
   };
   const compare=(x0,y0,width,height,edge,vertical)=>{
    const whole=render(false,x0,y0,width,height,edge,vertical),split=render(true,x0,y0,width,height,edge,vertical);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
     if(vertical?Math.abs(x-(edge-x0))>=2:Math.abs(y-(edge-y0))>=2)continue;
     const i=(y*width+x)*4;if(whole[i]!==split[i]||whole[i+1]!==split[i+1]||whole[i+2]!==split[i+2]){failures.push({kind:'seam',x0,y0,edge,vertical});return;}
    }
    seams++;
   };
   for(const y of townRoads.horizontal)for(const edge of [2048,4096,6144])compare(edge-60,y-70,120,140,edge,true);
   for(const x of townRoads.vertical)for(const edge of [2048,4096])compare(x-70,edge-60,140,120,edge,false);
   return {intersections,venues,seams,failures};
  });
  console.log(JSON.stringify(result));if(result.failures.length)process.exitCode=1;
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
