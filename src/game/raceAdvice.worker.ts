import {raceAdvice,type RaceAdviceContext} from './raceAdvice';
self.onmessage=(event:MessageEvent<RaceAdviceContext>)=>{
 try{self.postMessage({text:raceAdvice(event.data)});}
 catch{self.postMessage({error:true});}
};
