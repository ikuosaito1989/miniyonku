import {SeniorPortrait} from './SeniorPortrait';
import { OffroaderPortrait } from './OffroaderPortrait';
import { DoctorPortrait } from './DoctorPortrait';
import { ChallengerPortrait } from './ChallengerPortrait';
import { useEffect, useRef, useState } from 'react';
import { useGame } from './game/store';
import { dialogueChoices, dialoguePeople, dialoguePerson, type DialoguePersonId } from './data/dialoguePeople';
import owner from './assets/portraits/owner-pop.webp';
import rival from './assets/portraits/rival-pop.webp';
import guide from './assets/portraits/guide-pop.webp';
import mechanic from './assets/portraits/mechanic-pop.webp';
import './dialogue.css';

const portraits:Record<DialoguePersonId,string>={akatsukiOwner:owner,senior:rival,yuunagiOwner:owner,atelierOwner:owner,wakabaOwner:owner,venueStaff:owner,offroader:mechanic,owner,aozoraOwner:owner,hinataOwner:owner,villain:rival,rival,guide,mechanic,legendRei:rival,legendGaku:guide,doctor:owner};
export function DialogueView(){
  const {speaker,dialogue,shopAfter,advance,close,dialogueStage,startLegendChallenge,startVillainChallenge,startOfficialRace,openSetting}=useGame();
  const [selected,setSelected]=useState(0);
  const panel=useRef<HTMLElement>(null),buttons=useRef<Array<HTMLButtonElement|null>>([]);
  const id=dialoguePerson(speaker),person=id?dialoguePeople[id]:null;
  const book=speaker.startsWith('セッティング本棚');
  const choices=dialogueChoices(shopAfter,book,dialogueStage);
  const choose=(index:number)=>{const action=choices[index]?.action;if(action==='officialRace')startOfficialRace();else if(action==='advance')advance();else if(action==='legendSetting')openSetting();else if(action==='legendRace')startLegendChallenge();else if(action==='villainRace')startVillainChallenge();else close();};
  useEffect(()=>{setSelected(0);buttons.current[0]?.focus();},[speaker,dialogue]);
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{
      if(event.target instanceof Element&&event.target.closest('[data-audio-controls]'))return;
      if(['Enter','KeyZ'].includes(event.code)&&event.target instanceof Element&&event.target.closest('.conversation-close')){
        event.preventDefault();if(!event.repeat)close();return;
      }
      if(['KeyZ','Enter','ArrowDown','ArrowUp'].includes(event.code)){
        event.preventDefault();if(event.repeat)return;
        if(event.code==='KeyZ'||event.code==='Enter'){choose(selected);return;}
        const next=(selected+(event.code==='ArrowDown'?1:-1)+choices.length)%choices.length;
        setSelected(next);buttons.current[next]?.focus();
      }
      if(event.key==='Tab'&&panel.current){
        const controls=Array.from(panel.current.querySelectorAll<HTMLButtonElement>('button'));
        const first=controls[0],last=controls.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  });
  return <div className="dialogue-layer">
    <section ref={panel} className="conversation" role="dialog" aria-modal="true" aria-labelledby="conversation-speaker" aria-describedby="conversation-message">
      <div className="conversation-portrait" aria-hidden="true">
        {id==='senior'?<SeniorPortrait/>:id==='offroader'?<OffroaderPortrait/>:id==='doctor'?<DoctorPortrait/>:id==='villain'?<ChallengerPortrait/>:id?<img src={portraits[id]} alt="" decoding="async"/>:<div className="conversation-object"><span>{book?'本':'調'}</span><small>{book?'SETTING NOTES':'KOMOREBI MODEL'}</small></div>}
      </div>
      <div className="conversation-body">
        <header><div>{person&&<p className="conversation-role">{person.role}</p>}<h2 id="conversation-speaker">{person?.name??speaker}</h2></div><button className="conversation-close" onClick={close} aria-label="会話を閉じる">閉じる <small>Esc</small></button></header>
        <p className="conversation-message" id="conversation-message">{dialogueStage==='villain-intro'&&<span className="challenge-letter"><strong>挑戦状</strong><span>黒岩 豪が、机に挑戦状を叩きつけた！</span><small>あおぞら模型店の優勝者へ ─ 勝てば、ひなた模型店への紹介状を渡す。</small></span>}{dialogue}</p>
        <nav className="conversation-choices" aria-label="返答を選ぶ">{choices.map((choice,index)=><button key={choice.action} ref={node=>{buttons.current[index]=node;}} className={selected===index?'is-selected':''} onFocus={()=>setSelected(index)} onClick={()=>choose(index)}><span aria-hidden="true">{selected===index?'▶':'　'}</span>{choice.label}</button>)}</nav>
      </div>
    </section>
  </div>;
}
