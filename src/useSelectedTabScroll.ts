import {useEffect,useRef} from 'react';

/** 選択されたタブだけを横方向に見せ、画面全体の縦位置は変えない。 */
export function useSelectedTabScroll<T extends HTMLElement>(selection:string,visible=true){
 const ref=useRef<T>(null);
 useEffect(()=>{
  const strip=ref.current,selected=strip?.querySelector<HTMLElement>('[aria-pressed="true"]');
  if(!visible||!strip||!selected)return;
  const bounds=strip.getBoundingClientRect(),tab=selected.getBoundingClientRect();
  if(tab.left<bounds.left)strip.scrollLeft+=tab.left-bounds.left;
  else if(tab.right>bounds.right)strip.scrollLeft+=tab.right-bounds.right;
 },[selection,visible]);
 return ref;
}
