import { story } from './story';
export const room = { width:960, height:640, spawn:{x:480,y:550} };
// 店内の描画範囲。外側の背景を除き、表示領域全体へ合わせる。
export const shopExit = { x:409, y:574, width:145, height:8 };
export const roomView = { x:40, y:35, width:880, height:579 };
export interface Fixture { x:number; y:number; w:number; h:number; kind:'shelf'|'counter'|'bench'|'track'|'plant'|'board'|'bookshelf'|'legends'; label:string; text:string }
export const fixtures:Fixture[] = [
  {x:342,y:35,w:300,h:95,kind:'legends',label:'レジェンドマシン展示',text:'熟練度上位4人の愛機。展示を調べてマシンとセッティングを見る。'},
  {x:132,y:424,w:214,h:52,kind:'bookshelf',label:'セッティング本棚',text:'調べるたびに次の本を読める。賞金・改造・慣らし・参考セッティング・次の目標の全6冊。'},
  {x:50,y:114,w:36,h:114,kind:'board',label:'熟練度表',text:'整備と走行で身につく熟練度の一覧。'},
  {x:94,y:138,w:240,h:76,kind:'counter',label:`店主 ${story.owner}`,text:'いらっしゃい、湊くん。こもれび模型店へようこそ。まずは手持ちの予算で工夫してみよう！完走賞を貯めて買い足せば、凪くんにも挑めるよ。熟練度は左上の掲示板で確認できるよ。'},
  {x:90,y:269,w:116,h:125,kind:'shelf',label:'モーターパーツ棚',text:'小さな箱に、走りの可能性が詰まっている。パーツは店主のハルさんから購入できる。'},
  {x:268,y:269,w:115,h:126,kind:'shelf',label:'足回りパーツ棚',text:'タイヤ、ローラー、ギアが並んでいる。組み合わせを考えるだけで楽しくなる。'},
  {x:650,y:150,w:222,h:88,kind:'bench',label:'作業台',text:'所持パーツを交換して、マシンをセッティングしよう。'},
  {x:588,y:315,w:286,h:163,kind:'track',label:'試走コース',text:'標準装備のマシンで、CPU4台との5レーン・5周レース。3カウントで発進し、毎周レーンチェンジする。'},
  {x:54,y:464,w:54,h:68,kind:'plant',label:'観葉植物',text:'日当たりのいい場所で、元気に育っている。'},
];
