import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as wait} from 'node:timers/promises';
import {INPUT} from '../public/core.js';
import {StateDecoder} from '../public/network.js';
const root=new URL('../',import.meta.url);
let child,base,streams=[];
async function post(route,data={},token){const r=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(data)});return{status:r.status,data:await r.json()}}
async function subscribe(token,version=2){const ac=new AbortController(),r=await fetch(base+'/api/events?v='+version+'&token='+token,{signal:ac.signal});assert.equal(r.status,200);const obj={ac,state:null,host:null,count:0,patches:0};streams.push(obj);const reader=r.body.getReader(),decoder=new TextDecoder(),states=new StateDecoder();obj.task=(async()=>{let buffer='';try{while(true){const{value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let i;while((i=buffer.indexOf('\n\n'))>=0){const msg=buffer.slice(0,i);buffer=buffer.slice(i+2);if(msg.startsWith('data: ')){const d=JSON.parse(msg.slice(6));obj.state=states.read(d);obj.host=d.host;obj.count++;if(d.patch)obj.patches++;}}}}catch(e){if(e.name!=='AbortError')throw e}})();await until(()=>obj.state);return obj}
async function until(fn,ms=3000){const end=Date.now()+ms;while(!fn()){if(Date.now()>end)throw Error('Timed out waiting for server state');await wait(25)}}
test.before(async()=>{child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let err='';child.stderr.on('data',b=>err+=b);const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timed out: '+err)),5000);child.stdout.on('data',b=>{const m=b.toString().match(/port (\d+)/);if(m){clearTimeout(timer);resolve(m[1])}});child.once('exit',code=>reject(Error('Server exited '+code+' '+err)))});base='http://127.0.0.1:'+port});
test.after(async()=>{for(const s of streams)s.ac.abort();await Promise.all(streams.map(s=>s.task.catch(()=>{})));if(child){child.kill('SIGTERM');await new Promise(resolve=>child.once('exit',resolve))}});
test('Hosted assets, health check and security boundaries',async()=>{for(const path of ['/','/client.js','/core.js','/levels.js','/optics.js','/story.js','/lipsync.js','/cinema.js','/data.js','/audio.js','/network.js','/style.css']){const r=await fetch(base+path);assert.equal(r.status,200,path);assert.ok((await r.text()).length>100)}assert.equal((await fetch(base+'/health')).status,200);assert.equal((await fetch(base+'/server.js')).status,404);assert.equal((await post('/api/input',{held:2})).status,401);const foreign=await fetch(base+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://foreign.invalid'},body:'{}'});assert.equal(foreign.status,403)});
test('Two real network clients share movement, room entry, game state, and disconnect fallback',async()=>{
 const host=(await post('/api/rooms',{name:'Alice',progress:0})).data;assert.match(host.code,/^[A-HJ-NP-Z2-9]{6}$/);const ha=await subscribe(host.token);
 const join=await post('/api/join',{code:host.code,name:'Bob',avatar:{color:'#f493b0',shape:'round'}});assert.equal(join.status,200);const guest=join.data,gb=await subscribe(guest.token);await until(()=>ha.state.players.length===2);assert.equal((await post('/api/join',{code:host.code,name:'Third'})).status,409);assert.equal(ha.state.players.find(p=>p.id===guest.id).avatar.shape,'round');
 let seq=0;const start=ha.state.players.find(p=>p.id===host.id).x;for(let i=0;i<17;i++){await post('/api/input',{seq:++seq,held:INPUT.RIGHT,pressed:0},host.token);await wait(45)}await post('/api/input',{seq:++seq,held:0,pressed:0},host.token);await wait(160);const x=gb.state.players.find(p=>p.id===host.id).x;assert.ok(x>start+140,'peer receives actual movement');assert.ok(x<790,'player remains in Utility door range');
 await post('/api/input',{seq:++seq,held:INPUT.USE,pressed:INPUT.USE},host.token);await until(()=>ha.state.players.find(p=>p.id===host.id).interaction==='room:0');const blocked=await post('/api/action',{action:'enter',data:{level:0}},guest.token);assert.equal(blocked.data.ok,false,'guest cannot choose level');const entered=await post('/api/action',{action:'enter',data:{level:0}},host.token);assert.equal(entered.data.ok,true);assert.equal(entered.data.state.story.chapter,0);assert.equal((await post('/api/action',{action:'storySkip'},guest.token)).data.ok,false);await post('/api/action',{action:'storySkip'},host.token);await until(()=>gb.state.mode==='level');assert.equal(gb.state.level,0);assert.equal(gb.state.epoch,ha.state.epoch);assert.deepEqual(gb.state.fuses,[false,false,false]);
 const before=gb.state.players.find(p=>p.id===guest.id).x;await post('/api/input',{seq:100,held:INPUT.RIGHT,pressed:0,x:90000},guest.token);await wait(170);await post('/api/input',{seq:99,held:INPUT.LEFT,pressed:0},guest.token);await wait(100);assert.ok(ha.state.players.find(p=>p.id===guest.id).x>before,'stale input is ignored; client coordinates cannot teleport');
 assert.ok(ha.patches>10&&gb.patches>10,'both clients decode incremental updates');
 gb.ac.abort();await gb.task;const resumed=await subscribe(guest.token);await until(()=>resumed.state.level===0&&resumed.state.players.filter(p=>p.connected).length===2);assert.equal(resumed.state.epoch,ha.state.epoch,'reconnect receives a full current baseline');
 await post('/api/leave',{},guest.token);await until(()=>ha.state.players.find(p=>p.id===guest.id).connected===false);assert.equal(ha.state.players.filter(p=>p.connected).length,1);assert.ok(ha.count>10&&gb.count>10,'both clients received live snapshots');
 const soloLobby=await post('/api/action',{action:'lobby'},host.token);assert.equal(soloLobby.data.state.mode,'lobby');const reconnect=(await post('/api/join',{code:host.code,name:'New partner'})).data;const rc=await subscribe(reconnect.token,1);await post('/api/leave',{},host.token);await until(()=>rc.host===reconnect.id);assert.equal(rc.state.players.filter(p=>p.connected).length,1,'host departure transfers control');
});

test('Both network clients automatically start all nine cinematics, pause/resume, narration takes, skip and host transfer',async()=>{
 const host=(await post('/api/rooms',{name:'Narrator host',progress:40})).data,ha=await subscribe(host.token);
 const guest=(await post('/api/join',{code:host.code,name:'Second tech'})).data,gb=await subscribe(guest.token);
 for(let chapter=0;chapter<9;chapter++){
  const opened=await post('/api/action',{action:'watchStory',data:{chapter}},host.token);assert.equal(opened.data.ok,true);await until(()=>gb.state.story?.chapter===chapter&&ha.state.story?.chapter===chapter);
  const id=ha.state.story.id;assert.equal(gb.state.story.id,id);assert.equal(gb.state.story.playing,true);
  assert.equal((await post('/api/action',{action:'storySpeed',data:{speed:2}},guest.token)).data.ok,false);
  assert.equal((await post('/api/action',{action:'storySpeed',data:{speed:2}},host.token)).data.ok,true);await until(()=>gb.state.story?.nextSpeed===2&&ha.state.story?.nextSpeed===2);
  assert.equal((await post('/api/action',{action:'storySpeed',data:{speed:1}},host.token)).data.ok,true);await until(()=>gb.state.story?.nextSpeed===1);
  assert.equal((await post('/api/action',{action:'storyPlay'},guest.token)).data.ok,false);
  await until(()=>gb.state.story?.playing&&gb.state.story.elapsed>.05);
  assert.equal((await post('/api/action',{action:'storyPause'},host.token)).data.ok,true);await until(()=>gb.state.story?.paused&&ha.state.story?.paused);
  const elapsed=gb.state.story.elapsed,count=gb.count;await until(()=>gb.count>=count+3);assert.equal(gb.state.story.elapsed,elapsed,'shared animation clock must freeze');
  const cue={storyId:id,chapter,beat:0,take:1};
  for(const player of [host,guest]){assert.equal((await post('/api/action',{action:'storySpeechStart',data:cue},player.token)).data.ok,true);assert.equal((await post('/api/action',{action:'storySpeechDone',data:cue},player.token)).data.ok,true);}
  await until(()=>gb.state.story.speechDone.length===2);assert.deepEqual(new Set(gb.state.story.speechDone),new Set([host.id,guest.id]));
  assert.equal((await post('/api/action',{action:'storySpeechStart',data:{...cue,take:2}},guest.token)).data.ok,true);
  assert.equal((await post('/api/action',{action:'storySpeechDone',data:cue},guest.token)).data.ok,false,'late completion may not cancel a retried voice');
  assert.equal((await post('/api/action',{action:'storySpeechDone',data:{...cue,take:2}},guest.token)).data.ok,true);
  if(chapter===8){await post('/api/leave',{},host.token);await until(()=>gb.host===guest.id);assert.equal((await post('/api/action',{action:'storyPause'},guest.token)).data.ok,true);await until(()=>!gb.state.story.paused);assert.equal((await post('/api/action',{action:'storySkip'},guest.token)).data.ok,true);}
  else{assert.equal((await post('/api/action',{action:'storyPause'},host.token)).data.ok,true);await until(()=>!gb.state.story.paused);assert.equal((await post('/api/action',{action:'storySkip'},guest.token)).data.ok,false);assert.equal((await post('/api/action',{action:'storySkip'},host.token)).data.ok,true);}
  await until(()=>gb.state.story===null);assert.equal(gb.state.mode,'lobby');
 }
});
