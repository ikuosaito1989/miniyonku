// Start Vite, then run: CHROMIUM_PATH=/usr/bin/chromium node scripts/render-title-machine.cjs [base URL]
const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
 try{
  const page=await browser.newPage();await page.goto(process.argv[2]||'http://localhost:5173');
  const url=await page.evaluate(async()=>{
   const THREE=await import('/node_modules/three/build/three.module.js');
   const {buildMachineModel}=await import('/src/game/MachineModel.ts');
   const {starterEquipment}=await import('/src/data/machine.ts');
   const {studioEnvironment}=await import('/src/game/studioEnvironment.ts');
   const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
   renderer.setSize(1280,720);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
   renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
   const scene=new THREE.Scene(),environment=studioEnvironment(renderer);scene.environment=environment.texture;
   const car=buildMachineModel(0xf2f3eb,{...starterEquipment,body:'body-champion',rollerFront:'roller-2',rollerSide:'roller-0',rollerRear:'roller-2',wheel:'wheel-light'});
   car.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(car);
   const floor=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.ShadowMaterial({opacity:.65}));floor.rotation.x=-Math.PI/2;floor.position.y=-.003;floor.receiveShadow=true;scene.add(floor);
   scene.add(new THREE.HemisphereLight(0xdceaff,0x252039,2));
   const key=new THREE.DirectionalLight(0xffe2a6,3.5);key.position.set(-.6,1,.55);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-.35,right:.35,top:.35,bottom:-.35,near:.1,far:3});key.shadow.normalBias=.00015;scene.add(key);
   const rim=new THREE.DirectionalLight(0x708bff,2.6);rim.position.set(.5,.3,-.5);scene.add(rim);
   const camera=new THREE.OrthographicCamera(-.267,.267,.15,-.15,.01,5);camera.position.set(-.43,.245,.52);camera.lookAt(0,.043,0);
   renderer.render(scene,camera);const image=renderer.domElement.toDataURL('image/webp',.96);renderer.dispose();environment.dispose();return image;
  });
  await fs.writeFile(path.resolve(__dirname,'../src/assets/title/seiran-machine.webp'),Buffer.from(url.split(',')[1],'base64'));console.log('Rendered title machine');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
