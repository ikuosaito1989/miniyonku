// Run with the local Vite server active. Requires Playwright and Chromium.
// node scripts/render-part-products.cjs [base URL]
const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
 try{
  const page=await browser.newPage();await page.goto(process.argv[2]||'http://localhost:5173');
  await page.waitForLoadState('networkidle');
  try{await page.evaluate(()=>import('/src/game/partProductThumbnail.ts'));}catch(error){if(!/context was destroyed/.test(error.message))throw error;}
  await page.waitForTimeout(1000);await page.waitForLoadState('networkidle');
  const requested=(process.argv[3]||'').split(',').filter(Boolean);
 const ids=await page.evaluate(async requested=>{const {parts}=await import('/src/data/parts.ts');return parts.filter(p=>p.category!=='body'&&(!requested.length||requested.includes(p.id))).map(p=>p.id);},requested);
  const output=path.resolve(__dirname,'../src/assets/parts');await fs.mkdir(output,{recursive:true});
  const rendered=[];
  for(const [index,id] of ids.entries()){
   const url=await page.evaluate(async id=>{const {parts}=await import('/src/data/parts.ts');const {partProductThumbnail}=await import('/src/game/partProductThumbnail.ts');return partProductThumbnail(parts.find(p=>p.id===id));},id);
   rendered.push([path.join(output,`${id}.webp`),Buffer.from(url.split(',')[1],'base64')]);
   if((index+1)%10===0||index===ids.length-1)console.log(`Rendered ${index+1}/${ids.length} parts`);
  }
  for(const [filename,bytes] of rendered)await fs.writeFile(filename,bytes);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
