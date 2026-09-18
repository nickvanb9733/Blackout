import test from 'node:test';
import assert from 'node:assert/strict';
import {StateEncoder,StateDecoder,InputChannel,MotionBuffer} from '../public/network.js';
import {createGame,addPlayer,startMap,startStory,tick,snapshot,restoreSnapshot,INPUT} from '../public/core.js';
const packet=text=>JSON.parse(text.slice(6));
const wire=value=>JSON.parse(JSON.stringify(value,(_,v)=>typeof v==='number'?Math.round(v*1000)/1000:v));
const settle=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};}

test('Incremental transport preserves all 40 maps, cosmetics, objectives and enemy states',()=>{
 const g=createGame(40,true);addPlayer(g,'a','A');addPlayer(g,'b','B');
 g.players[0].claimed=Array.from({length:120},(_,i)=>Math.floor(i/3)+':'+i%3);g.players[0].wallet=1200;
 const encoder=new StateEncoder(),decoder=new StateDecoder();let deltaBytes=0,fullBytes=0;
 for(let level=0;level<40;level++){
  startMap(g,level);
  for(let frame=0;frame<25;frame++){
   tick(g,{a:{held:INPUT.RIGHT|INPUT.JUMP,pressed:frame%9===0?INPUT.JUMP:0},b:{held:INPUT.LEFT}},1/60);
   tick(g,{},1/60);
   const state=snapshot(g),encoded=encoder.encode(state,{host:'a',code:'ABC234'}),before=decoder.state,kept=JSON.stringify(before);
   const decoded=decoder.read(packet(frame===0?encoded.full:encoded.delta));
   assert.deepEqual(decoded,wire(state),'level '+level+' frame '+frame);
   assert.equal(JSON.stringify(before),kept,'patch application must not mutate buffered snapshots');
   const restored=restoreSnapshot(decoded);assert.equal(restored.map.id,g.map.id);deltaBytes+=encoded.delta.length;fullBytes+=encoded.full.length;
  }
 }
 assert.ok(deltaBytes<fullBytes*.5,'over half of repetitive state traffic removed across every map');
});

test('Patches handle nested deletions, resized arrays, nulls, reconnects and skipped updates',()=>{
 const encoder=new StateEncoder(),decoder=new StateDecoder();
 const a={epoch:1,time:1,list:[{a:1,b:2},null],nested:{one:1},story:null},first=encoder.encode(a,{});decoder.read(packet(first.full));
 const b={epoch:1,time:2,list:[{b:3},null],nested:{two:2},story:{beat:1}};
 const second=encoder.encode(b,{});assert.deepEqual(decoder.read(packet(second.delta)),b);
 const missing=encoder.encode({...b,time:3,list:[]},{}),fourth=encoder.encode({...b,time:4,list:[]},{});
 assert.throws(()=>decoder.read({...packet(fourth.delta),state:undefined,base:missing.seq}),/baseline/);
 assert.deepEqual(decoder.read(packet(fourth.full)),{...b,time:4,list:[]});
 const newLevel=encoder.encode({...b,epoch:2,time:5,story:null},{});assert.equal(newLevel.delta,newLevel.full,'new map starts with a full baseline');
 assert.equal(decoder.read(packet(newLevel.full)).epoch,2);
});

test('Cinematic starts, acknowledgements, speed and pauses survive incremental state updates',()=>{
 const g=createGame(40,true);addPlayer(g,'a','A');addPlayer(g,'b','B');const encoder=new StateEncoder(),decoder=new StateDecoder();decoder.read(packet(encoder.encode(snapshot(g),{}).full));
 for(let chapter=0;chapter<9;chapter++){
  startStory(g,chapter,{kind:'lobby',room:0});
  for(const change of [()=>tick(g,{},.1),()=>g.story.speechTakes.a=2,()=>g.story.speechDone.push('a'),()=>g.story.nextSpeed=2,()=>g.story.paused=true]){
   change();const state=decoder.read(packet(encoder.encode(snapshot(g),{}).delta));assert.deepEqual(state,wire(snapshot(g)));
  }
 }
});

test('Input heartbeat reduces unchanged requests while a key release bypasses the polling interval',async()=>{
 let now=0;const sent=[],channel=new InputChannel(async p=>sent.push({...p}),{now:()=>now});
 for(now=0;now<=1000;now+=50)await channel.update(INPUT.RIGHT);
 assert.equal(sent.length,6,'five hold refreshes per second plus initial press');
 await channel.update(0);assert.equal(sent.at(-1).held,0);assert.equal(sent.length,7);
 for(let i=0;i<19;i++){now+=50;await channel.update(0);}assert.equal(sent.length,7,'idle needs no repeated 50ms requests');
 now+=50;await channel.update(0);assert.equal(sent.length,8,'idle heartbeat at one second');
});

test('A pending request flushes releases and separate double-jump presses immediately after acknowledgement',async()=>{
 let now=0;const sent=[],pending=[];const channel=new InputChannel(p=>{sent.push({...p});const d=deferred();pending.push(d);return d.promise;},{now:()=>now});
 channel.update(INPUT.RIGHT|INPUT.JUMP,INPUT.JUMP);now=100;channel.update(INPUT.RIGHT);channel.update(INPUT.RIGHT|INPUT.JUMP,INPUT.JUMP);channel.update(0);
 assert.equal(sent.length,1,'one in-flight request bounds request pressure');
 pending[0].resolve();await settle();assert.equal(sent.length,2);assert.equal(sent[1].held,0,'latest release goes out immediately');assert.equal(sent[1].pressed,INPUT.JUMP,'second jump is not merged into the first');assert.equal(sent[1].seq,2);
 pending[1].resolve();await settle();assert.equal(sent.length,2);
});

test('A lost input response retries its original sequence and does not replay an accepted jump',async()=>{
 let now=0,serverSeq=-1,jumps=0,attempts=0;const sent=[];
 const channel=new InputChannel(async p=>{sent.push({...p});if(p.seq>serverSeq){serverSeq=p.seq;if(p.pressed&INPUT.JUMP)jumps++;}if(attempts++===0)throw Error('Response lost');},{now:()=>now});
 await channel.update(INPUT.JUMP,INPUT.JUMP);now=100;await channel.update(0);assert.equal(sent.length,1);
 now=250;await channel.update(0);await settle();assert.equal(jumps,1);assert.deepEqual(sent[0],sent[1]);assert.equal(sent[2].held,0);assert.equal(sent[2].seq,2);
});

test('Leaving a session or opening a menu discards queued input edges',async()=>{
 const pending=deferred(),sent=[];const channel=new InputChannel(p=>{sent.push(p);return pending.promise;});
 channel.update(INPUT.RIGHT);channel.update(INPUT.JUMP,INPUT.JUMP);channel.clear();channel.close();pending.resolve();await settle();await channel.update(INPUT.JUMP,INPUT.JUMP);assert.equal(sent.length,1);
});

function movingState(time,x){const g=createGame(40,true);addPlayer(g,'a','Carrier');addPlayer(g,'b','Rider');g.time=time;g.mapTime=time;g.players[0].x=x;g.players[0].y=400;g.players[1].x=x+3;g.players[1].y=336;g.players[1].riding='a';g.enemies=[{id:0,x:x+100,y:400}];g.bullets=[{id:1,x:x+150,y:390}];g.movable={2:{value:(x-100)/100}};return g;}
test('Motion fills gaps at render time without changing physics, head riding or checkpoint state',()=>{
 const buffer=new MotionBuffer(),frames=[movingState(1,100),movingState(1.04,108),movingState(1.08,116)];frames.forEach((s,i)=>buffer.push(s,i*40));const untouched=JSON.stringify(frames);
 const a=buffer.sample(80),b=buffer.sample(100),c=buffer.sample(110);
 assert.ok(Math.abs(a.players[0].x-106)<.001);assert.ok(b.players[0].x>a.players[0].x);assert.ok(c.players[0].x>b.players[0].x);
 assert.ok(c.players[0].x<116,'an intermediate frame exists between server packets');
 for(const view of [a,b,c]){assert.equal(view.players[1].x-view.players[0].x,3);assert.equal(view.players[0].y-view.players[1].y,64);assert.equal(view.enemies[0].x-view.players[0].x,100);assert.equal(view.bullets[0].x-view.players[0].x,150);assert.equal(view.checkpoint,frames.at(-1).checkpoint);}
 assert.equal(JSON.stringify(frames),untouched,'rendering is read only');
 assert.equal(buffer.sample(5000).players[0].x,116,'a stalled connection freezes instead of predicting through hazards');
});

test('Respawns, wrong-answer teleports, scene changes and death bypass motion smoothing',()=>{
 const buffer=new MotionBuffer(),a=movingState(1,100),b=movingState(1.04,1000);b.players[0].inv=1.5;buffer.push(a,0);buffer.push(b,40);assert.equal(buffer.sample(40).players[0].x,1000);
 const next=movingState(1.08,400);next.epoch=2;buffer.push(next,80);assert.equal(buffer.sample(80),next);
 const dead=movingState(1.12,500);dead.epoch=2;dead.phase='dead';buffer.push(dead,120);assert.equal(buffer.sample(120),dead);
 const cinema=movingState(1.16,600);cinema.story={elapsed:0,playing:true};buffer.push(cinema,160);assert.equal(buffer.sample(180),cinema,'narration retains the shared authoritative clock');
});
