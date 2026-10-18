import type { Part } from './parts';

export interface PartAppearance { color:string; accent:string; detail:number; mark:string }
export const partAppearances:Record<string,PartAppearance>={
  'body-stream':{color:'#ef795a',accent:'#fff1ce',detail:1,mark:'STREAM'},
  'body-arrow':{color:'#6cbde5',accent:'#d5f5ff',detail:2,mark:'ARROW'},
  'body-manta':{color:'#a99cdb',accent:'#eee7ff',detail:3,mark:'MANTA'},
  'chassis-basic':{color:'#45586a',accent:'#95a8b3',detail:1,mark:'K1'},
  'chassis-light':{color:'#839ca7',accent:'#d8e6eb',detail:2,mark:'K1-L'},
  'chassis-low':{color:'#585273',accent:'#b3a5d3',detail:3,mark:'K2'},
  'battery-basic':{color:'#abbcc8',accent:'#46617b',detail:1,mark:'BASIC'},
  'battery-power':{color:'#edb858',accent:'#a0473d',detail:2,mark:'POWER'},
  'battery-endurance':{color:'#7ad3b5',accent:'#2a6d70',detail:3,mark:'LONG'},
  'wheel-basic':{color:'#d7dbd2',accent:'#567891',detail:5,mark:'5 SPOKE'},
  'wheel-light':{color:'#e8b966',accent:'#5f667a',detail:6,mark:'LIGHT'},
  'wheel-oneway':{color:'#80c5e2',accent:'#4e6783',detail:3,mark:'ONE WAY'},
  'accessory-none':{color:'#829bad',accent:'#3a5065',detail:0,mark:'NONE'},
  'accessory-weight':{color:'#c4b48b',accent:'#78694b',detail:1,mark:'5 g'},
  'accessory-support':{color:'#a9d1e1',accent:'#657f99',detail:2,mark:'SUPPORT'},
  'motor-stock':{color:'#bac6ce',accent:'#ece4c2',detail:2,mark:'STD'},
  'motor-rev':{color:'#b5c9d9',accent:'#409fe5',detail:4,mark:'REV'},
  'motor-torque':{color:'#b2b9c0',accent:'#ed7257',detail:3,mark:'TRQ'},
  'gear-5':{color:'#f3d974',accent:'#de9855',detail:16,mark:'5:1'},
  'gear-4':{color:'#71d4c0',accent:'#339d9a',detail:14,mark:'4:1'},
  'gear-3.5':{color:'#ab9be3',accent:'#7166b4',detail:12,mark:'3.5:1'},
  'tire-0':{color:'#303947',accent:'#dfdfd1',detail:5,mark:'NORMAL'},
  'tire-1':{color:'#52515b',accent:'#f2ab57',detail:6,mark:'SPONGE'},
  'tire-2':{color:'#242b38',accent:'#75c9e7',detail:3,mark:'HARD'},
  'roller-0':{color:'#e8eadb',accent:'#58b8b2',detail:6,mark:'RESIN'},
  'roller-1':{color:'#343d49',accent:'#e5bb68',detail:4,mark:'RUBBER'},
  'roller-2':{color:'#bcd9e5',accent:'#597791',detail:8,mark:'BEARING'},
  'shaft-0':{color:'#b6c5d0',accent:'#6c7c94',detail:0,mark:'SOLID'},
  'shaft-1':{color:'#dde7eb',accent:'#8cafc4',detail:1,mark:'HOLLOW'},
  'terminal-0':{color:'#b9cad3',accent:'#8299aa',detail:0,mark:'STANDARD'},
  'terminal-1':{color:'#f4ce62',accent:'#b68133',detail:1,mark:'GOLD'},
};
// 未登録の追加パーツも表示できる。
export const partAppearance=(part:Part):PartAppearance=>partAppearances[part.id]??{color:'#becbd4',accent:'#68bed1',detail:4,mark:part.category.toUpperCase()};
