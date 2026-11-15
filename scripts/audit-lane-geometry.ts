/** Read-only audit of the rendered paths and the current driving simulation. */
import {circuitIds,getCircuitTrack} from '../src/data/circuit';
import {starterEquipment} from '../src/data/machine';
import {seniorEquipment} from '../src/data/officialRace';
import {zenithEquipment} from '../src/data/zenithRace';
import {createDrivingState,startDriving,stepDriving,machinePerformance} from '../src/game/driving';

const builds=[{name:'初期',equipment:starterEquipment},{name:'中盤',equipment:seniorEquipment},{name:'上位',equipment:zenithEquipment}];
for(const id of circuitIds){
 const track=getCircuitTrack(id),steps=6000,total=track.circuitLength*track.circuit.laps;
 const geometry=Array.from({length:track.circuit.lanes},(_,lane)=>{
  let previous=track.sampleLanePath(0,lane),length=0,curvature=0,uphill=0,downhill=0,changes=0,changing=previous.changing;
  const perLane=Array<number>(track.circuit.lanes).fill(0);
  for(let i=1;i<=steps;i++){
   const point=track.sampleLanePath(total*i/steps,lane);
   const segment=Math.hypot(point.x-previous.x,point.y-previous.y,point.z-previous.z);
   length+=segment;perLane[Math.max(0,Math.min(track.circuit.lanes-1,previous.lane))]+=segment;
   curvature+=(point.curvature+previous.curvature)*segment/2;
   const rise=point.y-previous.y;if(rise>0)uphill+=rise;else downhill-=rise;
   if(point.changing&&!changing)changes++;changing=point.changing;previous=point;
  }
  return {length,perLane,curvature,uphill,downhill,changes};
 });
 const results=builds.map(({name,equipment})=>{
  const performance=machinePerformance(equipment,{motorSeconds:60,batterySeconds:0});
  const lanes=geometry.map((_,lane)=>{
   let state=startDriving(createDrivingState());
   // 耐久コースの低速構成を400秒で打ち切らず、長距離も計測する。
   for(let tick=0;tick<120*1200&&state.status==='running';tick++)state=stepDriving(state,performance,0,lane,track.circuit.surface,track);
   return {status:state.status,reason:state.stopReason,time:state.time,distance:state.distance};
  });
  const times=lanes.filter(lane=>lane.status==='finished').map(lane=>lane.time);
  return {name,lanes,finishTimeSpread:times.length===track.circuit.lanes?Math.max(...times)-Math.min(...times):null};
 });
 console.log(JSON.stringify({id,lanes:track.circuit.lanes,laps:track.circuit.laps,open:track.open,centralPhysics:track.open&&track.fairLanes,geometry,distanceSpread:Math.max(...geometry.map(g=>g.length))-Math.min(...geometry.map(g=>g.length)),results}));
}
