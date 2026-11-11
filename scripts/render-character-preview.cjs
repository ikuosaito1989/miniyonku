// Start Vite, then run: node scripts/render-character-preview.cjs [base URL]
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/screenshots');
const shapes=JSON.parse(execFileSync(process.execPath,[path.join(root,'node_modules/tsx/dist/cli.mjs'),'-e',`import {personDrawing} from './src/game/PeopleArt';import {npcDrawing} from './src/game/NpcPeopleArt';console.log(JSON.stringify([personDrawing('player','down',0),npcDrawing('guide','down'),npcDrawing('owner','down'),npcDrawing('ren','down')]));`],{cwd:root,encoding:'utf8'}));
const rect=s=>s.kind==='rect'?`<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${s.color}" opacity="${s.alpha}"/>`:`<polygon points="${s.points.map(p=>p.join(',')).join(' ')}" fill="${s.color}" opacity="${s.alpha}"/>`;
const image=id=>'data:image/webp;base64,'+fs.readFileSync(path.join(root,'public/assets/characters',id+'.webp')).toString('base64');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--renderer-process-limit=1']});
 try{
  fs.mkdirSync(out,{recursive:true});
  const page=await browser.newPage({viewport:{width:900,height:590},deviceScaleFactor:1});
  let svg='<svg xmlns="http://www.w3.org/2000/svg" width="900" height="590"><rect width="900" height="590" fill="#263947"/><style>text{font:16px sans-serif;fill:#eaddbd}</style><text x="24" y="30">BEFORE</text><text x="24" y="290">AFTER — NEW CHARACTER SPRITES</text>';
  for(let i=0;i<4;i++){
   svg+=`<g transform="translate(${110+i*190} 52) scale(2)">${shapes[i].map(rect).join('')}</g>`;
   svg+=`<svg x="${98+i*190}" y="310" width="144" height="192" viewBox="0 0 180 240"><image href="${image(['player','guide','owner','ren'][i])}" width="720" height="960"/></svg>`;
   svg+=`<svg x="${146+i*190}" y="515" width="48" height="64" viewBox="0 0 180 240"><image href="${image(['player','guide','owner','ren'][i])}" width="720" height="960" style="image-rendering:pixelated"/></svg>`;
  }
  await page.setContent('<body style="margin:0">'+svg+'</svg>');await page.screenshot({path:path.join(out,'character-remake-comparison.png')});
  const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().includes('/characters/')&&r.status()!==200)missing.push(r.url())});
  await page.setViewportSize({width:390,height:844});await page.goto(process.argv[2]||'http://localhost:5173');
  await page.getByRole('button',{name:'ゲーム開始',exact:true}).click();
  const nameButton=page.getByRole('button',{name:'この名前で始める'});if(await nameButton.isVisible())await nameButton.click();
  await page.evaluate(async()=>{const {useGame}=await import('/src/game/store.ts');const {OPENING_END}=await import('/src/game/opening.ts');useGame.setState({openingStep:OPENING_END,openingActive:false,tutorialStage:'done',overlay:null,location:'komorebi'});});
  await page.waitForTimeout(4000);await page.screenshot({path:path.join(out,'character-remake-shop.png')});
  // Verify every atlas decodes in the browser at the dimensions used by Phaser and SVG.
  const textureCheck=await page.evaluate(async()=>{
   const {characterSpriteIds}=await import('/src/game/characterSprites.ts');
   return await Promise.all(characterSpriteIds.map(async id=>{const image=new Image();image.src=`/assets/characters/${id}.webp`;await image.decode();return {id,width:image.width,height:image.height};}));
  });
  if(textureCheck.some(i=>i.width!==720||i.height!==960))throw Error('Wrong atlas dimensions');
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(500);await page.keyboard.up('ArrowRight');
  await page.evaluate(async()=>{const {useGame}=await import('/src/game/store.ts');useGame.setState({location:'town',overlay:null});});
  await page.waitForTimeout(4000);await page.screenshot({path:path.join(out,'character-remake-town.png')});
  if(errors.length||missing.length)throw Error(JSON.stringify({errors,missing}));
  console.log(JSON.stringify({characters:textureCheck.length,errors,missing}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
