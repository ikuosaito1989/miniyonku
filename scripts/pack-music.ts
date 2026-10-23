import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { packMusic } from '../src/game/musicPackage';
const output=new URL('../src/assets/music/',import.meta.url);
await mkdir(output,{recursive:true});
const tracks=[['Rush_Recklessly.mp3','race.bgm'],['今日の空も.mp3','shop.bgm'],['解答Quizman.mp3','event.bgm']];
const selected=process.argv.includes('--event')?tracks.filter(([,target])=>target==='event.bgm'):tracks;
for(const [source,target] of selected){
  const bytes=await readFile(new URL(`../private/audio/${source}`,import.meta.url));
  await writeFile(new URL(target,output),await packMusic(bytes));
  console.info(`Packed ${target}`);
}
