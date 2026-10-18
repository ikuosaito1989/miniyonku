import { story } from './story';
export const room = { width:960, height:640, spawn:{x:480,y:550} };
// 店内の描画範囲。外側の背景を除き、表示領域全体へ合わせる。
export const roomView = { x:40, y:35, width:880, height:579 };
export interface Fixture { x:number; y:number; w:number; h:number; kind:'shelf'|'counter'|'bench'|'track'|'plant'; label:string; text:string }
export const fixtures:Fixture[] = [
  {x:100,y:150,w:230,h:62,kind:'counter',label:`店主 ${story.owner}`,text:'いらっしゃい、湊くん。こもれび模型店へようこそ。うちはLv.1〜2の入門パーツを扱っているよ。まずは組み合わせと慣らしを覚えよう！'},
  {x:100,y:290,w:100,h:120,kind:'shelf',label:'モーターパーツ棚',text:'小さな箱に、走りの可能性が詰まっている。パーツは店主のハルさんから購入できる。'},
  {x:270,y:290,w:100,h:120,kind:'shelf',label:'足回りパーツ棚',text:'タイヤ、ローラー、ギアが並んでいる。組み合わせを考えるだけで楽しくなる。'},
  {x:660,y:160,w:195,h:85,kind:'bench',label:'作業台',text:'所持パーツを交換して、マシンをセッティングしよう。'},
  {x:590,y:340,w:265,h:145,kind:'track',label:'試走コース',text:'標準装備のマシンで、CPU4台との5レーン・5周レース。3カウントで発進し、毎周レーンチェンジする。'},
  {x:70,y:490,w:40,h:45,kind:'plant',label:'観葉植物',text:'日当たりのいい場所で、元気に育っている。'},
];
