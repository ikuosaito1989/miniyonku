import {useLayoutEffect,useRef,useState} from 'react';
import machine from './assets/title/seiran-machine.webp';
import {currentShop} from './data/world';
import {useGame} from './game/store';
import './world-transition-loading.css';

type WorldLocation=ReturnType<typeof useGame.getState>['location'];
type LoadingTransition={location:WorldLocation;startedAt:number};

function destinationName(location:WorldLocation){
  if(location==='town')return '緑川町';
  if(location==='library')return '緑川町立図書館';
  if(location==='stadium-5')return '若葉公式レース会場';
  if(location==='stadium-9')return '星空公式レース会場';
  if(location==='stadium-10')return '緑川グランプリ決勝会場';
  if(location==='stadium-7')return '天頂決戦・ゼニス・クラウン';
  return currentShop(location).name;
}

export function WorldTransitionLoading({active}:{active:boolean}){
  const location=useGame(s=>s.location),openingActive=useGame(s=>s.openingActive),previous=useRef(location);
  const [transition,setTransition]=useState<LoadingTransition|null>(null);
  useLayoutEffect(()=>{
    const from=previous.current;previous.current=location;
    if(from===location||openingActive||!active)return;
    const startedAt=performance.now();let hideTimer=0,timeout=0;
    const onReady=(event:Event)=>{
      const readyLocation=(event as CustomEvent<{location:WorldLocation}>).detail?.location;
      if(readyLocation!==location)return;
      window.removeEventListener('miniyonku:world-ready',onReady);
      window.clearTimeout(timeout);
      hideTimer=window.setTimeout(()=>setTransition(current=>current?.location===location?null:current),Math.max(0,650-(performance.now()-startedAt)));
    };
    window.addEventListener('miniyonku:world-ready',onReady);
    timeout=window.setTimeout(()=>{window.removeEventListener('miniyonku:world-ready',onReady);setTransition(current=>current?.location===location?null:current);},12000);
    setTransition({location,startedAt});
    return()=>{window.removeEventListener('miniyonku:world-ready',onReady);window.clearTimeout(hideTimer);window.clearTimeout(timeout);};
  },[location,openingActive,active]);
  if(!transition)return null;
  const destination=destinationName(transition.location);
  return <div className="world-transition-loading" role="status" aria-live="polite" aria-label={`${destination}へ移動中`}>
    <div className="world-transition-card">
      <span className="world-transition-kicker">GREEN RIVER RACING</span>
      <div className="world-transition-spinner"><span className="world-transition-orbit"/><img src={machine} alt=""/></div>
      <strong>{destination}へ移動中</strong>
      <div className="world-transition-progress" aria-hidden="true"><i/></div>
      <small>LOADING</small>
    </div>
  </div>;
}
