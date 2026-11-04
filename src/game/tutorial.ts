export const tutorialStages=['pending','motor','tire','shop','purchase','equip','start','racing','result','done'] as const;
export type TutorialStage=typeof tutorialStages[number];
export const TUTORIAL_PART='gear-4';
export const tutorialActive=(stage:TutorialStage)=>stage!=='pending'&&stage!=='done';
export function decodeTutorialStage(value:unknown,openingComplete:boolean):TutorialStage{
 if(value===undefined)return openingComplete?'done':'pending';
 if(typeof value!=='string'||!tutorialStages.includes(value as TutorialStage))throw new Error('チュートリアルの記録が不正です。');
 return value as TutorialStage;
}
