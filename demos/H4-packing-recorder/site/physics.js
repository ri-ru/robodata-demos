// Official MuJoCo 4.0.1 single-thread WASM, with the Apache-2.0 Menagerie Panda.
import loadMujoco from './vendor/mujoco.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function linearSolve(A,b){const n=b.length,M=A.map((r,i)=>[...r,b[i]]);for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i;[M[k],M[p]]=[M[p],M[k]];const d=M[k][k];if(Math.abs(d)<1e-12)return Array(n).fill(0);for(let j=k;j<=n;j++)M[k][j]/=d;for(let i=0;i<n;i++)if(i!==k){const f=M[i][k];for(let j=k;j<=n;j++)M[i][j]-=f*M[k][j];}}return M.map(r=>r[n]);}
export async function createPhysics(progress,{preferCompiled=true}={}){
 const mj=await loadMujoco({printErr:msg=>console.warn('MuJoCo:',msg)});mj.FS.mkdir('/panda');mj.FS.mkdir('/panda/assets');
 const manifest=await fetch('./models/panda/manifest.json').then(r=>r.json());let model;
 const compiled=preferCompiled?await fetch('./models/panda/packing.mjb.gz'):null;
 if(compiled?.ok&&typeof DecompressionStream!=='undefined'){
  const bytes=new Uint8Array(await new Response(compiled.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());mj.FS.writeFile('/panda/packing.mjb',bytes);const vfs=new mj.MjVFS();
  try{model=mj.MjModel.from_binary_path('/panda/packing.mjb',vfs);}finally{vfs.delete();}progress(1);
 }else{
  const files=['packing.xml',...manifest.files.map(f=>'assets/'+f)];let loaded=0;
  for(let i=0;i<files.length;i+=4)await Promise.all(files.slice(i,i+4).map(async file=>{const res=await fetch('./models/panda/'+file);if(!res.ok)throw Error('Missing model asset '+file);mj.FS.writeFile('/panda/'+file,new Uint8Array(await res.arrayBuffer()));progress(++loaded/files.length);}));
  model=mj.MjModel.from_xml_path('/panda/packing.xml');
 }
 const data=new mj.MjData(model),scratch=new mj.MjData(model);
 const id=(type,name)=>mj.mj_name2id(model,mj.mjtObj[type].value,name);
 const tcp=id('mjOBJ_SITE','packing_tcp'),objects=[0,1,2].map(i=>id('mjOBJ_BODY','parcel_'+i));
 const jacp=new mj.DoubleBuffer(model.nv*3),jacr=new mj.DoubleBuffer(model.nv*3);
 const home=[0,0,0,-1.57079,0,1.57079,-.7853,.04,.04];scratch.qpos.set(home);mj.mj_forward(model,scratch);
 const orientation=Array.from(scratch.site_xmat.slice(tcp*9,tcp*9+9));
 let target=[.48,-.16,.27],grip=255,steps=0;
 const stateSpec=mj.mjtState.mjSTATE_INTEGRATION.value,stateBuffer=new mj.DoubleBuffer(mj.mj_stateSize(model,stateSpec));
 function ik(goal,seed){scratch.qpos.set(data.qpos);scratch.qpos.set(seed.slice(0,7));for(let iteration=0;iteration<12;iteration++){
  mj.mj_forward(model,scratch);const pos=scratch.site_xpos.slice(tcp*3,tcp*3+3),R=scratch.site_xmat.slice(tcp*9,tcp*9+9);const e=goal.map((v,i)=>v-pos[i]);const rot=[0,0,0];
  for(let c=0;c<3;c++){const a=[R[c],R[c+3],R[c+6]],b=[orientation[c],orientation[c+3],orientation[c+6]];rot[0]+=.5*(a[1]*b[2]-a[2]*b[1]);rot[1]+=.5*(a[2]*b[0]-a[0]*b[2]);rot[2]+=.5*(a[0]*b[1]-a[1]*b[0]);}e.push(...rot);
  if(Math.hypot(...e)<.00015)break;mj.mj_jacSite(model,scratch,jacp,jacr,tcp);const jp=jacp.GetView(),jr=jacr.GetView();const J=Array.from({length:6},(_,r)=>Array.from({length:7},(_,c)=>(r<3?jp[r*model.nv+c]:jr[(r-3)*model.nv+c])));
  const A=Array.from({length:6},(_,r)=>Array.from({length:6},(_,c)=>J[r].reduce((s,v,k)=>s+v*J[c][k],0)+(r===c?.001:0)));const x=linearSolve(A,e);
  for(let j=0;j<7;j++){const dq=J.reduce((s,row,r)=>s+row[j]*x[r],0);scratch.qpos[j]=clamp(scratch.qpos[j]+clamp(dq,-.14,.14),model.jnt_range[2*j]+.02,model.jnt_range[2*j+1]-.02);}
 }return Array.from(scratch.qpos.slice(0,7));}
 function reset(){mj.mj_resetData(model,data);data.qpos.set(home);mj.mj_forward(model,data);target=[.48,-.16,.27];grip=255;const q=ik(target,home);data.qpos.set(q);data.ctrl.set([...q,255]);mj.mj_forward(model,data);}
 function command(position,gripper){target=position.map((v,i)=>clamp(v,[.25,-.38,.026][i],[.7,.38,.62][i]));grip=gripper;data.ctrl.set([...ik(target,Array.from(data.ctrl)),grip]);}
 function applyRecorded(action){target=[...action.target];grip=action.gripper;data.ctrl.set(action.ctrl);}
 function step(){// Gravity/coriolis compensation complements the Menagerie position actuators.
  for(let j=0;j<7;j++)data.qfrc_applied[j]=data.qfrc_bias[j];mj.mj_step(model,data);steps++;
 }
 function observe(){return{tcp:Array.from(data.site_xpos.slice(tcp*3,tcp*3+3)),aperture:data.qpos[7]+data.qpos[8],objects:objects.map(b=>Array.from(data.xpos.slice(b*3,b*3+3)))};}
 function packed(){const o=observe();return o.objects.filter(p=>Math.abs(p[0]-.48)<.11&&Math.abs(p[1]-.22)<.09&&p[2]<.105&&p[2]>.035&&(o.aperture>.065||Math.hypot(...p.map((v,i)=>v-o.tcp[i]))>.09)).length;}
 function snapshot(){mj.mj_getState(model,data,stateBuffer,stateSpec);return{state:Array.from(stateBuffer.GetView()),target:[...target],grip};}
 function restore(saved){mj.mj_setState(model,data,saved.state,stateSpec);target=[...saved.target];grip=saved.grip;mj.mj_forward(model,data);}
 reset();return{mj,model,data,tcp,objects,command,applyRecorded,step,observe,packed,snapshot,restore,reset,get target(){return target},get grip(){return grip},get steps(){return steps},ik,manifest};
}
