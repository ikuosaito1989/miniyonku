import { story } from './story';
export const room = { width:960, height:640, spawn:{x:480,y:550} };
// 店内の描画範囲。外側の背景を除き、表示領域全体へ合わせる。
export const roomView = { x:40, y:35, width:880, height:579 };
export interface Fixture { x:number; y:number; w:number; h:number; kind:'shelf'|'counter'|'bench'|'track'|'plant'|'board'|'bookshelf'; label:string; text:string }
export const fixtures:Fixture[] = [
  {x:140,y:440,w:190,h:50,kind:'bookshelf',label:'セッティング本棚',text:'調べるたびに次の本を読める。賞金・改造・慣らし・参考セッティング・次の目標の全6冊。'},
  {x:56,y:124,w:38,h:116,kind:'board',label:'熟練度表',text:'整備と走行で身につく熟練度の一覧。'},
  {x:100,y:150,w:230,h:62,kind:'counter',label:`店主 ${story.owner}`,text:'いらっしゃい、湊くん。こもれび模型店へようこそ。まずは千円で工夫してみよう！完走賞を貯めて買い足せば、凪くんにも挑めるよ。熟練度は左上の掲示板で確認できるよ。'},
  {x:100,y:290,w:100,h:120,kind:'shelf',label:'モーターパーツ棚',text:'小さな箱に、走りの可能性が詰まっている。パーツは店主のハルさんから購入できる。'},
  {x:270,y:290,w:100,h:120,kind:'shelf',label:'足回りパーツ棚',text:'タイヤ、ローラー、ギアが並んでいる。組み合わせを考えるだけで楽しくなる。'},
  {x:660,y:160,w:195,h:85,kind:'bench',label:'作業台',text:'所持パーツを交換して、マシンをセッティングしよう。'},
  {x:590,y:340,w:265,h:145,kind:'track',label:'試走コース',text:'標準装備のマシンで、CPU4台との5レーン・5周レース。3カウントで発進し、毎周レーンチェンジする。'},
  {x:70,y:490,w:40,h:45,kind:'plant',label:'観葉植物',text:'日当たりのいい場所で、元気に育っている。'},
];
