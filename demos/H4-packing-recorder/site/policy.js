import{features,PERIOD}from './recording.js';
// Deliberately small imitation learner: 1-NN on tracked camera features.
// No robot state is copied from the demonstration during a policy rollout.
export function trainPolicy(demo,lagMs){
 const lag=lagMs/1000,frames=demo.frames,scale=[.16,.16,.16,.10,...Array(9).fill(.2)];
 const rows=frames.map((action,i)=>{const cameraIndex=Math.max(0,Math.min(frames.length-1,Math.round((action.t-lag)/PERIOD)));return{feature:features(frames[cameraIndex].camera.observation),action:action.action,actionIndex:i,cameraIndex};});
 let cursor=0,count=0,sumError2=0,matches=[],elapsed=0;
 function query(observation){const f=features(observation);let best=cursor,bestDistance=Infinity;
 // The local forward window supplies only demonstration order, never a timed action schedule.
 // Ties prefer the later identical observation, allowing recorded stationary pauses to complete.
 for(let i=Math.max(0,cursor-3);i<Math.min(rows.length,cursor+46);i++){const row=rows[i],d=f.reduce((s,v,k)=>s+((v-row.feature[k])/scale[k])**2,0);if(d<=bestDistance+1e-12){bestDistance=d;best=i;}}
 cursor=Math.max(cursor,best);const row=rows[best],ref=frames[row.actionIndex].camera.observation.tcp,error=Math.hypot(...observation.tcp.map((v,i)=>v-ref[i]));sumError2+=error*error;count++;elapsed+=PERIOD;
 if(count%5===0)matches.push({t:elapsed,actionIndex:row.actionIndex,cameraIndex:row.cameraIndex,distance:Math.sqrt(bestDistance),toolError:error});return frames[Math.min(frames.length-1,row.actionIndex+1)].action;
 }
 return{query,rows,lagMs,get cursor(){return cursor},get count(){return count},get rmse(){return Math.sqrt(sumError2/Math.max(count,1))},get matches(){return matches}};
}
