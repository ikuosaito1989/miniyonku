import {useEffect,useRef} from 'react';

/** 外側の操作を妨げずに折りたたみを閉じる。 */
export function useDismissDetails(){
 const ref=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{
  const dismiss=(event:PointerEvent)=>{
   const details=ref.current;
   if(details?.open&&event.target instanceof Node&&!details.contains(event.target))details.open=false;
  };
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&ref.current?.open)ref.current.open=false;};
  document.addEventListener('pointerdown',dismiss,true);document.addEventListener('keydown',escape,true);
  return()=>{document.removeEventListener('pointerdown',dismiss,true);document.removeEventListener('keydown',escape,true);};
 },[]);
 return ref;
}
