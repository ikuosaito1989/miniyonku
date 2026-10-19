import type { SaveData } from './saveData';
export interface SaveStorage { read:()=>Promise<unknown>; write:(data:SaveData)=>Promise<void>; remove?:()=>Promise<void> }
export const SAVE_DATABASE='tiny-drive-save';
export const SAVE_STORE='saves';
export const SAVE_KEY='main';
function openDatabase():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    if(typeof indexedDB==='undefined'){reject(new Error('このブラウザではIndexedDBを利用できません。'));return;}
    const request=indexedDB.open(SAVE_DATABASE,1);let settled=false;
    const timer=setTimeout(()=>{settled=true;reject(new Error('保存領域から応答がありません。ほかのタブやブラウザ設定を確認してください。'));},10000);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(SAVE_STORE))request.result.createObjectStore(SAVE_STORE);};
    request.onsuccess=()=>{clearTimeout(timer);if(settled){request.result.close();return;}settled=true;request.result.onversionchange=()=>request.result.close();resolve(request.result);};
    request.onerror=()=>{clearTimeout(timer);settled=true;reject(request.error??new Error('保存領域を開けません。'));};
    request.onblocked=()=>{clearTimeout(timer);settled=true;reject(new Error('ほかのタブを閉じてから再試行してください。'));};
  });
}
export const indexedDbStorage:SaveStorage={
  async read(){
    const db=await openDatabase();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(SAVE_STORE,'readonly'),request=tx.objectStore(SAVE_STORE).get(SAVE_KEY);
      tx.oncomplete=()=>{db.close();resolve(request.result);};
      tx.onabort=()=>{db.close();reject(tx.error??new Error('セーブを読み込めません。'));};
      tx.onerror=()=>{ /* abortで接続を閉じて通知する。 */ };
    });
  },
  async write(data){
    const db=await openDatabase();
    return new Promise<void>((resolve,reject)=>{
      const tx=db.transaction(SAVE_STORE,'readwrite');tx.objectStore(SAVE_STORE).put(data,SAVE_KEY);
      tx.oncomplete=()=>{db.close();resolve();};
      tx.onabort=()=>{db.close();reject(tx.error??new Error('セーブを書き込めません。'));};
      tx.onerror=()=>{ /* abortで接続を閉じて通知する。 */ };
    });
  },
  async remove(){
    const db=await openDatabase();
    return new Promise<void>((resolve,reject)=>{
      const tx=db.transaction(SAVE_STORE,'readwrite');tx.objectStore(SAVE_STORE).delete(SAVE_KEY);
      tx.oncomplete=()=>{db.close();resolve();};
      tx.onabort=()=>{db.close();reject(tx.error??new Error('セーブデータを初期化できません。'));};
      tx.onerror=()=>{};
    });
  },
};
