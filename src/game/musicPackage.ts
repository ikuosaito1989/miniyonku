// ブラウザで復号するため鍵は秘密ではない。素材の直接配布を避けるためのコンテナでありDRMではない。
const keyBytes=new Uint8Array([41,83,192,54,208,11,67,145,37,111,228,89,142,246,21,70,139,3,221,61,76,19,188,48,122,237,90,13,200,104,158,44]);
const header=new Uint8Array([84,68,66,71,1]);
const key=(usage:KeyUsage[])=>crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,usage);
export async function packMusic(source:Uint8Array){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(['encrypt']),new Uint8Array(source));
  const result=new Uint8Array(header.length+iv.length+encrypted.byteLength);
  result.set(header);result.set(iv,header.length);result.set(new Uint8Array(encrypted),header.length+iv.length);
  return result;
}
export async function unpackMusic(source:ArrayBuffer){
  const data=new Uint8Array(source);
  if(data.length<33||header.some((value,i)=>data[i]!==value))throw new Error('BGMデータの形式が不正です');
  return crypto.subtle.decrypt({name:'AES-GCM',iv:data.slice(5,17)},await key(['decrypt']),data.slice(17));
}
