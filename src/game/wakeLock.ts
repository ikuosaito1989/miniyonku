interface ScreenLock extends EventTarget { released:boolean;release:()=>Promise<void> }
interface WakeNavigator {wakeLock?:{request:(type:'screen')=>Promise<ScreenLock>}}
// OSが解除した場合や背景復帰後も、次の操作で再取得する。
export function keepScreenAwake(nav:WakeNavigator=navigator,doc:Pick<Document,'visibilityState'|'addEventListener'|'removeEventListener'>=document){
  let stopped=false,pending=false,lock:ScreenLock|null=null;
  const request=async()=>{
    if(stopped||pending||lock&&!lock.released||doc.visibilityState!=='visible'||!nav.wakeLock)return;
    pending=true;
    try{
      const acquired=await nav.wakeLock.request('screen');
      if(stopped||doc.visibilityState!=='visible'){await acquired.release();return;}
      lock=acquired;acquired.addEventListener('release',()=>{if(lock===acquired)lock=null;},{once:true});
    }catch{/* 非対応・省電力・権限制限でもゲームは継続する。 */}finally{pending=false;}
  };
  const retry=()=>{void request();};
  const visibility=()=>{if(doc.visibilityState==='visible')retry();else if(lock){const previous=lock;lock=null;void previous.release().catch(()=>{});}};
  doc.addEventListener('visibilitychange',visibility);doc.addEventListener('pointerdown',retry);doc.addEventListener('keydown',retry);retry();
  return ()=>{stopped=true;doc.removeEventListener('visibilitychange',visibility);doc.removeEventListener('pointerdown',retry);doc.removeEventListener('keydown',retry);if(lock)void lock.release().catch(()=>{});lock=null;};
}
