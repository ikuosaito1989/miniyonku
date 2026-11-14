import {outdoorAdvisors} from './data/outdoorAdvisors';
import {story} from './data/story';
import mechanicManPortrait from './assets/portraits/mechanic-man-pop.webp';
import {NpcPortrait} from './NpcPortrait';
import {npcAppearanceId,npcAppearances,type NpcAppearanceId} from './data/npcAppearance';
import {SeniorPortrait} from './SeniorPortrait';
import { DoctorPortrait } from './DoctorPortrait';
import { ChallengerPortrait } from './ChallengerPortrait';
import { useEffect, useRef, useState } from 'react';
import { useGame } from './game/store';
import { dialogueChoices, dialoguePeople, dialoguePerson, type DialoguePersonId } from './data/dialoguePeople';
import owner from './assets/portraits/owner-pop.webp';
import rival from './assets/portraits/rival-pop.webp';
import rei from './assets/portraits/rei-pop.webp';
import guide from './assets/portraits/guide-pop.webp';
import gaku from './assets/portraits/gaku-pop.webp';
import koya from './assets/portraits/koya-pop.webp';
import mechanic from './assets/portraits/mechanic-pop.webp';
import './dialogue.css';
import seiranMachine from './assets/title/seiran-machine.webp';
import {PlayerPortrait} from './PlayerPortrait';
import './seiran-reveal.css';

const portraits:Record<DialoguePersonId,string>={ren:mechanic,sou:mechanic,momo:guide,akatsukiOwner:owner,senior:rival,yuunagiOwner:owner,atelierOwner:owner,wakabaOwner:owner,venueStaff:owner,offroader:mechanic,owner,aozoraOwner:owner,hinataOwner:owner,villain:rival,rival,guide,mechanic,legendRei:rei,legendGaku:gaku,legendKoya:koya,doctor:owner};
export function DialogueView(){
  const {playerName,speaker,dialogue,adviceThinking,shopAfter,advance,close,dialogueStage,zenithCleared,startLegendChallenge,startVillainChallenge,startOfficialRace,openSetting}=useGame();
  const [selected,setSelected]=useState(0);
  const panel=useRef<HTMLElement>(null),buttons=useRef<Array<HTMLButtonElement|null>>([]);
  const id=dialoguePerson(speaker),person=id?dialoguePeople[id]:null,appearance=npcAppearanceId(speaker)??outdoorAdvisors.find(p=>p.name===speaker)?.appearance??null;
  const book=speaker.startsWith('セッティング本棚');
  const choices=dialogueChoices(shopAfter,book,dialogueStage).map(choice=>choice.action==='officialRace'&&zenithCleared?{...choice,label:'タイムアタックに挑戦！'}:choice);
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
  if(dialogueStage==='doctor-reveal')return <div className="seiran-reveal-layer">
    <section ref={panel} className="seiran-reveal" role="dialog" aria-modal="true" aria-labelledby="seiran-reveal-title" aria-describedby="seiran-reveal-message">
      <div className="seiran-reveal-frame"><div className="seiran-reveal-screen"><div className="seiran-reveal-rays"/><svg className="seiran-reveal-hand" viewBox="0 0 500 220" aria-hidden="true"><path d="M42 139 Q29 117 47 109 Q65 104 100 124 L148 132 Q126 114 125 99 Q124 88 136 87 Q149 86 171 106 L210 128 L321 128 Q346 127 364 113 L431 61 Q452 48 461 61 Q468 71 454 84 L408 128 Q391 149 370 162 Q341 184 294 184 L196 193 Q157 196 122 182 L64 163 Q47 157 42 139Z" fill="#d89565" stroke="#854b37" strokeWidth="7"/><path d="M159 146 Q228 157 304 143 M188 162 Q242 172 300 159" fill="none" stroke="#b46f4e" strokeWidth="5" strokeLinecap="round"/></svg><img src={seiranMachine} alt="白と青のマシン、セイラン"/></div><div className="seiran-reveal-speakers" aria-hidden="true"><i/><i/></div></div>
      <div className="seiran-reveal-dialogue"><div className="seiran-reveal-face"><PlayerPortrait/></div><div><h2 id="seiran-reveal-title">{playerName||story.player}</h2><p id="seiran-reveal-message">{dialogue}</p><button ref={node=>{buttons.current[0]=node;}} onClick={close}>よーし、走ろう！ ▸</button></div></div>
    </section>
  </div>;
  return <div className="dialogue-layer">
    <section ref={panel} className="conversation" role="dialog" aria-modal="true" aria-labelledby="conversation-speaker" aria-describedby="conversation-message" aria-busy={adviceThinking}>
      <div className="conversation-portrait" aria-hidden="true">
        {speaker==='メカニックマン'?<img src={mechanicManPortrait} alt="" decoding="async"/>:appearance?<NpcPortrait id={appearance}/>:id&&id in npcAppearances?<NpcPortrait id={id as NpcAppearanceId}/>:id==='senior'?<SeniorPortrait/>:id==='doctor'?<DoctorPortrait/>:id==='villain'?<ChallengerPortrait/>:id?<img src={portraits[id]} alt="" decoding="async"/>:<div className="conversation-object"><span>{book?'本':'調'}</span><small>{book?'SETTING NOTES':'KOMOREBI MODEL'}</small></div>}
      </div>
      <div className="conversation-body">
        <header><div>{person&&<p className="conversation-role">{person.role}</p>}<h2 id="conversation-speaker">{person?.name??speaker}</h2></div><button className="conversation-close" onClick={close} aria-label="会話を閉じる">閉じる</button></header>
        <p className="conversation-message" id="conversation-message">{adviceThinking&&<span className="advice-thinking" role="status">匠がセッティングを考え中<span className="advice-thinking-dots" aria-hidden="true"><i/><i/><i/></span></span>}{dialogueStage==='villain-intro'&&<span className="challenge-letter"><strong>挑戦状</strong><span>黒岩 豪が、机に挑戦状を叩きつけた！</span><small>あおぞら模型店の優勝者へ ─ 勝てば、ひなた模型店への紹介状を渡す。</small></span>}{dialogue.replaceAll('朝倉湊くん',`${playerName||story.player}さん`).replaceAll('朝倉 湊',playerName||story.player).replaceAll('湊くん',`${playerName||story.player}さん`)}</p>
        <nav className="conversation-choices" aria-label="返答を選ぶ">{choices.map((choice,index)=><button key={choice.action} ref={node=>{buttons.current[index]=node;}} className={selected===index?'is-selected':''} onFocus={()=>setSelected(index)} onClick={()=>choose(index)}><span aria-hidden="true">{selected===index?'▶':'　'}</span>{choice.label}</button>)}</nav>
      </div>
    </section>
  </div>;
}
