export function createTouchInput(){
  let pending=false,resetVersion=0;
  return {
    interact:()=>{pending=true;},
    consume:()=>{const action=pending;pending=false;return action;},
    version:()=>resetVersion,
    reset:()=>{pending=false;resetVersion++;},
  };
}
export const touchInput=createTouchInput();
