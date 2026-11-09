import {isMasterCourse} from '../data/masterCourses';
import {isPracticeCourse} from '../data/practiceCourses';
import type {CircuitId} from '../data/circuit';
import {currentShop,isSalesShop,type WorldLocation} from '../data/world';
import {officialTimeBoards} from '../data/timeBoard';
import {onlineCircuits} from './onlineRecords';

export const recordOpponentUnlocked=(id:CircuitId,cleared:boolean)=>onlineCircuits.includes(id)&&((isPracticeCourse(id)&&!isMasterCourse(id))||cleared);
export function opponentCourseAvailable(state:{location:WorldLocation;zenithCleared:boolean;openingActive:boolean;gameOver:boolean},id:CircuitId){
 if(state.gameOver||state.openingActive||!recordOpponentUnlocked(id,state.zenithCleared)||state.location==='library'||isSalesShop(state.location))return false;
 if(state.location==='town')return isPracticeCourse(id);
 if(state.location.startsWith('stadium-'))return officialTimeBoards(state.location).some(b=>b.circuitId===id);
 return currentShop(state.location).circuitId===id;
}
