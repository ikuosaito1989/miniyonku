// Start Vite first. CHROMIUM_PATH=/usr/bin/chromium node scripts/render-mechanic-motors.cjs [base URL]
const {chromium}=require('playwright');const fs=require('node:fs/promises');const path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});try{
 const page=await browser.newPage();await page.route('**/@vite/client',route=>route.fulfill({contentType:'application/javascript',body:''}));await page.goto(process.argv[2]||'http://localhost:5174');await page.waitForLoadState('networkidle');
 const ids=await page.evaluate(async()=>{const {mechanicMotorStages}=await import('/src/data/mechanicMotor.ts');return mechanicMotorStages.map(s=>s.id);});
 for(const id of ids){const url=await page.evaluate(async id=>{const {parts}=await import('/src/data/parts.ts');const {partProductThumbnail}=await import('/src/game/partProductThumbnail.ts');return partProductThumbnail(parts.find(p=>p.id===id));},id);await fs.writeFile(path.resolve(__dirname,`../src/assets/parts/${id}.webp`),Buffer.from(url.split(',')[1],'base64'));}
 console.log(`Rendered ${ids.length} mechanic motor images`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
