// Local, real HTTP/SSE clients: five independent two-player crews.
// Runs its own disposable server; never targets a deployed game.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {setTimeout as wait} from 'node:timers/promises';
import {performance} from 'node:perf_hooks';
import {INPUT} from '../public/core.js';
const legacy=process.argv.includes('--legacy'),seconds=Number(process.env.LOAD_SECONDS)||12;
const network=await import('../public/network.js').catch(()=>null),decoderModule=legacy?null:network;
const child=spawn(process.execPath,['server.js'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'0'},stdio:['ignore','pipe','inherit']});
const clients=[],latencies=[];let bytes=0,frames=0,requests=0,failures=0,measuring=false,interval;
const port=await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Startup timeout')),5000);child.stdout.on('data',b=>{const m=b.toString().match(/port (\d+)/);if(m){clearTimeout(timeout);resolve(m[1]);}});child.once('exit',()=>reject(Error('Server exited')));});
const base='http://127.0.0.1:'+port;
async function post(route,data,token){const start=performance.now();const res=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(data)});const value=await res.json();if(measuring&&route==='/api/input'){requests++;latencies.push(performance.now()-start);if(!res.ok)failures++;}assert.ok(res.ok,JSON.stringify(value));return value;}
async function until(fn){for(let i=0;i<200;i++){if(fn())return;await wait(25);}throw Error('Timed out waiting for room state');}
async function connect(info){const ac=new AbortController(),res=await fetch(base+'/api/events?token='+info.token+(decoderModule?'&v=2':''),{signal:ac.signal});assert.equal(res.status,200);const c={...info,ac,seq:0,state:null,count:0,decoder:decoderModule?new decoderModule.StateDecoder():null};clients.push(c);const reader=res.body.getReader(),textDecoder=new TextDecoder();c.task=(async()=>{let buffer='';try{while(true){const{done,value}=await reader.read();if(done)break;if(measuring)bytes+=value.length;buffer+=textDecoder.decode(value,{stream:true});let end;while((end=buffer.indexOf('\n\n'))>=0){const msg=buffer.slice(0,end);buffer=buffer.slice(end+2);if(!msg.startsWith('data: '))continue;const packet=JSON.parse(msg.slice(6));c.state=c.decoder?c.decoder.read(packet):packet.state;c.count++;if(measuring)frames++;assert.ok(c.state.players.every(p=>[info.id,info.partner].includes(p.id)),'A room received another crew’s player');}}}catch(e){if(e.name!=='AbortError'){c.error=e;failures++;}}})();await until(()=>c.state);return c;}
async function cpu(){try{const fields=(await readFile('/proc/'+child.pid+'/stat','utf8')).split(') ')[1].split(' ');return(Number(fields[11])+Number(fields[12]))*10;}catch{return null;}}
try{
 for(let i=0;i<5;i++){
  const host=await post('/api/rooms',{name:'Host '+i,progress:40}),guest=await post('/api/join',{code:host.code,name:'Guest '+i});host.partner=guest.id;guest.partner=host.id;
  const a=await connect(host),b=await connect(guest);a.level=i;
  for(let j=0;j<16;j++){await post('/api/input',{seq:++a.seq,held:INPUT.RIGHT},a.token);await wait(45);}
  await post('/api/input',{seq:++a.seq,held:INPUT.USE,pressed:INPUT.USE},a.token);await until(()=>a.state.players.find(p=>p.id===a.id).interaction==='room:0');
  assert.equal((await post('/api/action',{action:'enter',data:{level:i}},a.token)).ok,true);
  if(i===0)await post('/api/action',{action:'storySkip'},a.token);
  await until(()=>a.state.mode==='level'&&b.state.mode==='level');
 }
 if(!legacy){assert.ok(network,'Optimized transport module is missing');for(const c of clients){c.input=new network.InputChannel(p=>post('/api/input',p,c.token));c.input.seq=c.seq;}}
 const startCPU=await cpu(),start=performance.now();measuring=true;let step=0,busy=false;
 // Identical repeated-jump scenario in both modes. The optimized run drives
 // the same InputChannel as the actual browser, including its idle heartbeat.
 interval=setInterval(async()=>{if(busy)return;busy=true;try{step++;await Promise.all(clients.map(c=>{const pressed=step%8===0?INPUT.JUMP:0;return legacy?post('/api/input',{seq:++c.seq,held:0,pressed},c.token):c.input.update(0,pressed);}));for(const c of clients.filter(c=>c.level!==undefined&&c.state.phase==='dead'))await post('/api/action',{action:'retry'},c.token);}catch(e){failures++;process.stderr.write(e.message+'\n');}finally{busy=false;}},50);
 await wait(seconds*1000);clearInterval(interval);while(busy)await wait(10);measuring=false;const duration=(performance.now()-start)/1000,endCPU=await cpu();
 const sorted=latencies.sort((a,b)=>a-b),pct=p=>Math.round(sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))]*100)/100;
 assert.equal(failures,0,'Network request errors');assert.equal(new Set(clients.map(c=>c.code)).size,5);assert.ok(clients.every(c=>c.count>seconds*15),'Clients must keep receiving updates');
 console.log(JSON.stringify({mode:legacy?'baseline':'optimized',players:clients.length,rooms:5,seconds:+duration.toFixed(2),serverCPUPercent:startCPU===null?null:+((endCPU-startCPU)/(duration*10)).toFixed(1),inputRequestsPerSecond:+(requests/duration).toFixed(1),outboundKBPerSecond:+(bytes/duration/1000).toFixed(1),updatesPerSecond:+(frames/duration).toFixed(1),inputRoundTripMs:{p50:pct(.5),p95:pct(.95),max:pct(1)},errors:failures},null,2));
}finally{clearInterval(interval);for(const c of clients){c.input?.close();c.ac.abort();}await Promise.all(clients.map(c=>c.task));child.kill('SIGTERM');await new Promise(resolve=>child.once('exit',resolve));}
