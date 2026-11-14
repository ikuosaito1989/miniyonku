import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { packMusic } from '../src/game/musicPackage';
const output=new URL('../src/assets/music/',import.meta.url);
await mkdir(output,{recursive:true});
const tracks=[['カジノでエンジョイ！.mp3','model-shop.bgm'],['Rush_Recklessly.mp3','race.bgm'],['今日の空も.mp3','shop.bgm'],['解答Quizman.mp3','event.bgm'],['Thrilling_Race.mp3','official.bgm'],['祝福の鐘.mp3','podium.bgm']];
const requested=process.argv.find(value=>['--model-shop','--event','--official','--podium'].includes(value));
const selected=requested?tracks.filter(([,target])=>target===`${requested.slice(2)}.bgm`):tracks;
for(const [source,target] of selected){
  const bytes=await readFile(new URL(`../private/audio/${source}`,import.meta.url));
  await writeFile(new URL(target,output),await packMusic(bytes));
  console.info(`Packed ${target}`);
}
