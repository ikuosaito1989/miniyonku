import {create} from 'zustand';
import {raceRulesVersion} from './timeRecords';
import {decodeOnlineRecords, type OnlineRecord, type OnlineSubmission} from './onlineRecords';
import type {CircuitId} from '../data/circuit';
import {story} from '../data/story';

const apiBase='';
const onlineEnabled=import.meta.env.PROD || import.meta.env.VITE_MINIYONKU_ONLINE_ENABLED==='true';
export const useOnlineStatus=create<{message:string}>(()=>({message:onlineEnabled?'オンライン記録を利用できます。':'オンライン記録は接続準備中です。'}));
interface LocalState {token:string; displayName:string; pending:Record<string,OnlineSubmission>}
function localState<T>(update:(state:LocalState)=>T):Promise<T>{
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open('tiny-drive-online',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('settings');
  request.onerror=()=>reject(request.error);
  request.onblocked=()=>reject(new Error('オンライン記録の保存領域を開けません。'));
  request.onsuccess=()=>{
   const db=request.result;db.onversionchange=()=>db.close();
   const tx=db.transaction('settings','readwrite'),store=tx.objectStore('settings'),read=store.get('state');let result:T;
   read.onsuccess=()=>{const state:LocalState=read.result??{token:Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join(''),displayName:story.player,pending:{}};result=update(state);store.put(state,'state');};
   tx.oncomplete=()=>{db.close();resolve(result);};tx.onabort=()=>{db.close();reject(tx.error??new Error('オンライン記録を端末に保存できません。'));};
  };
 });
}
export async function onlineDisplayName(){return localState(s=>s.displayName);}
export async function setOnlineDisplayName(value:string){
 const name=value.trim();if(!name||name.length>24)throw new Error('表示名は1〜24文字で入力してください。');
 await localState(s=>{s.displayName=name;});
}
export async function loadLeaderboard(circuitId:CircuitId):Promise<OnlineRecord[]>{
 if(!onlineEnabled)throw new Error('オンライン記録は接続準備中です。');
 const response=await fetch(`${apiBase}/api/miniyonku/records?circuitId=${encodeURIComponent(circuitId)}&rulesVersion=${raceRulesVersion}`,{signal:AbortSignal.timeout(10000),credentials:'omit'});
 if(!response.ok)throw new Error('ランキングを取得できません。時間をおいて再試行してください。');
 return decodeOnlineRecords(await response.json(),circuitId);
}
let sending:Promise<void>|null=null;
export function syncOnlineRecords():Promise<void>{
 if(!onlineEnabled)return Promise.resolve();
 if(sending)return sending;
 sending=(async()=>{
  const {token,pending}=await localState(s=>structuredClone(s));
  for(const [key,record] of Object.entries(pending)){
   if(record.rulesVersion!==raceRulesVersion){await localState(s=>{delete s.pending[key];});continue;}
   const response=await fetch(`${apiBase}/api/miniyonku/records`,{method:'POST',headers:{'Content-Type':'application/json','X-Miniyonku-Player-Token':token},body:JSON.stringify(record),signal:AbortSignal.timeout(10000),credentials:'omit'});
   if(!response.ok)throw new Error('オンライン記録を送信できません。未送信のベストは端末に保存しています。');
   const payload=await response.json();
   const [saved]=decodeOnlineRecords({records:[payload.record]},record.circuitId);
   const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)));
   const playerId=Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');
   if(saved.playerId!==playerId||saved.time>record.time)throw new Error('保存結果を確認できません。記録は再送待ちです。');
   await localState(s=>{if(JSON.stringify(s.pending[key])===JSON.stringify(record))delete s.pending[key];});
  }
  useOnlineStatus.setState({message:'オンライン記録を同期しました。'});
 })().catch(error=>{useOnlineStatus.setState({message:error instanceof Error?error.message:'オンライン記録は再送待ちです。'});}).finally(()=>{sending=null;});
 return sending;
}
export async function queueOnlineRecord(record:OnlineSubmission){
 if(!onlineEnabled)return;
 try{
  await localState(s=>{const key=`${record.rulesVersion}:${record.circuitId}`,old=s.pending[key];if(!old||record.time<old.time)s.pending[key]={...record,displayName:s.displayName};});
  await syncOnlineRecords();
 }catch{useOnlineStatus.setState({message:'オンライン記録の端末保存に失敗しました。ゲームのセーブ状態を確認してください。'});}
}
if(typeof window!=='undefined')window.addEventListener('online',()=>{void syncOnlineRecords();});
