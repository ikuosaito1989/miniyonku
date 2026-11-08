// Capture the real title artwork at the social-card size.
// CHROMIUM_PATH=/usr/bin/chromium node scripts/render-ogp.cjs [local Vite URL]
const {chromium}=require('playwright');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await page.goto(process.argv[2]||'http://localhost:5173');
  await page.getByRole('button',{name:'ゲーム開始',exact:true}).waitFor();
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('.title-screen img')].map(img=>img.decode()));document.activeElement?.blur();});
  // Keep the actual logo, garage, car and START artwork; omit the in-game save instruction.
  await page.addStyleTag({content:'.title-footer small{display:none}.title-start:focus-visible{outline:none}'});
  await page.locator('.title-screen').screenshot({path:path.resolve(__dirname,'../public/ogp/seiran-title.png'),animations:'disabled'});
  console.log('Rendered 1200×630 title OGP');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
