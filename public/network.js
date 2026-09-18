// Versioned state patches. Physics stays full precision on the server; only
// serialized numbers are rounded (a thousandth of a pixel/second).
function wireClone(value){return JSON.parse(JSON.stringify(value,(_,v)=>typeof v==='number'?Math.round(v*1000)/1000:v));}
function stateDiff(before,after){
 if(before===after)return undefined;
 if(!before||!after||typeof before!=='object'||typeof after!=='object'||Array.isArray(before)!==Array.isArray(after))return[after];
 if(Array.isArray(after)&&before.length!==after.length)return[after];
 const patch={};let changed=false;
 for(const key of Object.keys(after)){const diff=stateDiff(before[key],after[key]);if(diff!==undefined){patch[key]=diff;changed=true;}}
 for(const key of Object.keys(before))if(!Object.hasOwn(after,key)){patch[key]=null;changed=true;}
 return changed?patch:undefined;
}
function mergeState(before,patch){
 if(Array.isArray(patch))return patch[0];
 const next=Array.isArray(before)?before.slice():{...before};
 for(const key of Object.keys(patch)){
  if(['__proto__','prototype','constructor'].includes(key))throw Error('Invalid update key');
  if(patch[key]===null)delete next[key];else next[key]=mergeState(before?.[key],patch[key]);
 }
 return next;
}
export class StateEncoder{
 constructor(){this.state=null;this.seq=0;}
 encode(source,meta){
  const next=wireClone(source),base=this.seq,seq=++this.seq;
  const full='data: '+JSON.stringify({...meta,v:2,seq,state:next})+'\n\n';
  let delta=full;
  if(this.state&&this.state.epoch===next.epoch){const patch=stateDiff(this.state,next)||{};const candidate='data: '+JSON.stringify({...meta,v:2,seq,base,patch})+'\n\n';if(candidate.length<full.length)delta=candidate;}
  this.state=next;return{seq,base,full,delta};
 }
}
export class StateDecoder{
 constructor(){this.state=null;this.seq=0;}
 read(packet){
  if(packet.state){this.state=packet.state;this.seq=packet.seq||0;return this.state;}
  if(packet.v!==2||!this.state||packet.base!==this.seq||packet.seq<=this.seq||!packet.patch)throw Error('Game update needs a fresh baseline');
  this.state=mergeState(this.state,packet.patch);this.seq=packet.seq;return this.state;
 }
}

// At most one input request in flight. Key changes flush immediately when the
// previous request finishes; unchanged holds need only a 200ms heartbeat.
// Retries retain the SAME sequence so a lost response cannot repeat a jump.
export class InputChannel{
 constructor(send,{now=()=>performance.now(),onError=()=>{}}={}){this.send=send;this.now=now;this.onError=onError;this.held=0;this.edges=[];this.seq=0;this.lastHeld=null;this.lastAt=-Infinity;this.retryAt=0;this.packet=null;this.busy=false;this.closed=false;this.rtt=0;}
 update(held,pressed=0){if(this.closed)return;this.held=held&127;if(pressed&&this.edges.length<32)this.edges.push(pressed&127);return this.flush();}
 async flush(){
  const now=this.now();if(this.closed||this.busy||now<this.retryAt)return;
  if(!this.packet){if(!this.edges.length&&this.held===this.lastHeld&&now-this.lastAt<(this.held?200:1000))return;this.packet={seq:++this.seq,held:this.held,pressed:this.edges.shift()||0};}
  const packet=this.packet;this.busy=true;this.dropRetry=false;let ok=false;
  try{await this.send(packet);if(this.closed)return;const elapsed=this.now()-now;this.rtt=this.rtt?this.rtt*.8+elapsed*.2:elapsed;this.lastHeld=packet.held;this.lastAt=now;this.packet=null;this.retryAt=0;ok=true;}
  catch(error){if(!this.closed){if(this.dropRetry)this.packet=null;this.retryAt=this.now()+250;this.onError(error);}}
  finally{this.busy=false;if(ok&&(this.edges.length||this.held!==this.lastHeld))void this.flush();}
 }
 clear(){this.held=0;this.edges=[];this.dropRetry=true;if(!this.busy)this.packet=null;return this.flush();}
 close(){this.closed=true;this.edges=[];this.packet=null;}
}

function sameScene(a,b){return a&&b&&a.epoch===b.epoch&&a.mode===b.mode&&a.phase===b.phase&&!a.story&&!b.story;}
function interpolateValue(a,b,t){return a+(b-a)*t;}
function discontinuous(a,b){return !a||a.down!==b.down||a.connected!==b.connected||a.deathCount!==b.deathCount||Math.hypot(a.x-b.x,a.y-b.y)>120||(b.inv||0)>(a.inv||0)+.5;}
function blendEntities(latest,a,b,t,fields,players=false){
 const first=new Map(a.map(e=>[e.id,e])),second=new Map(b.map(e=>[e.id,e]));
 return latest.map(e=>{const from=first.get(e.id),to=second.get(e.id);if(!from||!to||(players&&(discontinuous(from,to)||discontinuous(to,e))))return e;const out={...e};for(const key of fields)if(Number.isFinite(from[key])&&Number.isFinite(to[key]))out[key]=interpolateValue(from[key],to[key],t);return out;});
}
// Display-only 50ms buffer: never feeds interpolated positions into physics,
// saves, quiz checks or narration. Teleports and scene changes snap immediately.
export class MotionBuffer{
 constructor(){this.frames=[];this.renderTime=-Infinity;}
 push(state,receivedAt){
  const last=this.frames.at(-1);if(!sameScene(last?.state,state)){this.frames=[];this.renderTime=-Infinity;}
  if(this.frames.length&&state.time<last.state.time)return;
  this.frames.push({state,receivedAt});if(this.frames.length>12)this.frames.shift();
 }
 sample(now){
  const last=this.frames.at(-1);if(!last)return null;const latest=last.state;
  if(this.frames.length<2||latest.story||latest.phase!=='active')return latest;
  const target=Math.max(this.renderTime,Math.min(latest.time,latest.time+Math.max(0,now-last.receivedAt)/1000-.05));this.renderTime=target;
  let a=this.frames[0].state,b=latest;for(let i=1;i<this.frames.length;i++){b=this.frames[i].state;if(b.time>=target)break;a=b;}
  const t=b.time===a.time?1:Math.max(0,Math.min(1,(target-a.time)/(b.time-a.time)));
  const view={...latest,time:interpolateValue(a.time,b.time,t),mapTime:interpolateValue(a.mapTime,b.mapTime,t)};
  view.players=blendEntities(latest.players,a.players,b.players,t,['x','y','vx','vy'],true);
  view.enemies=blendEntities(latest.enemies,a.enemies,b.enemies,t,['x','y']);
  view.bullets=blendEntities(latest.bullets,a.bullets,b.bullets,t,['x','y']);
  view.movable={...latest.movable};for(const [id,m]of Object.entries(view.movable))if(a.movable[id]&&b.movable[id])view.movable[id]={...m,value:interpolateValue(a.movable[id].value,b.movable[id].value,t)};
  view.optics=latest.optics.map((o,i)=>a.optics[i]&&b.optics[i]&&!o.solved?{...o,x:interpolateValue(a.optics[i].x,b.optics[i].x,t)}:o);
  return view;
 }
}
