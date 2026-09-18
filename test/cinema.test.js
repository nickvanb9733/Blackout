import test from 'node:test';
import assert from 'node:assert/strict';
import {STORY,StoryVoice,castFor,captionSpeech} from '../public/story.js';
import {performancePose,sceneCast} from '../public/cinema.js';
import {createGame,addPlayer,startStory,command,tick} from '../public/core.js';

function mockSpeech(fn,voices=[{lang:'en-US',name:'Wrong accent'},{lang:'en-GB',name:'Daniel'},{lang:'en-GB',name:'Sonia'}]){
 const old=globalThis.window,spoken=[];let paused=0,resumed=0,cancelled=0;
 globalThis.window={speechSynthesis:{getVoices:()=>voices,speak:u=>spoken.push(u),cancel:()=>cancelled++,pause:()=>paused++,resume:()=>resumed++},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
 try{return fn({spoken,stats:()=>({paused,resumed,cancelled})});}finally{globalThis.window=old;}
}
const gmanBeat=STORY[0].beats.findIndex(b=>b.speaker==='G-MAN');
const scene=()=>({chapter:0,beat:gmanBeat,elapsed:1,playing:true,paused:false,waiting:false});

test('G-man speaks in every chapter and each speaking role has an on-screen actor',()=>{
 let villainLines=0;
 for(let chapter=0;chapter<STORY.length;chapter++){
  assert.ok(STORY[chapter].beats.some(b=>b.speaker==='G-MAN'));
  for(let beat=0;beat<STORY[chapter].beats.length;beat++){
   const b=STORY[chapter].beats[beat],cast=sceneCast({chapter,beat});
   assert.ok([cast.left,cast.right].includes(castFor(b.speaker).id));
   if(b.speaker==='G-MAN')villainLines++;
  }
 }
 assert.equal(villainLines,10);assert.ok(STORY[8].beats.some(b=>b.speaker==='G-MAN'&&b.shot==='defeat'));
 const a=performancePose('gman',1,true,'taunt'),b=performancePose('gman',1.3,true,'taunt');
 assert.notEqual(a.rightArm,b.rightArm);assert.notEqual(a.headTilt,b.headTilt);
});

test('UK voices are selected explicitly and G-man lips follow speech start, boundaries, pause and end',()=>mockSpeech(({spoken,stats})=>{
 const voice=new StoryVoice(),s=scene();let now=0;voice.now=()=>now;
 voice.update(s);const u=spoken[0];assert.equal(u.lang,'en-GB');assert.equal(u.voice.name,'Daniel');assert.equal(voice.sample(s).active,false);
 u.onstart();now=.2;u.onboundary({name:'word',charIndex:5,charLength:7});now=.28;
 assert.equal(voice.sample(s).active,true);assert.equal(voice.sample(s).cast,'gman');assert.equal(voice.sample(s).mode,'word');assert.ok(voice.sample(s).index>=5);
 s.paused=true;voice.update(s);const stopped=voice.sample(s);assert.equal(stopped.active,false);assert.equal(stats().paused,1);
 now=8;s.paused=false;voice.update(s);assert.equal(voice.sample(s).active,true);assert.ok(voice.sample(s).index<12,'pause must not advance the word clock');
 u.onend();assert.equal(voice.sample(s).active,false);assert.equal(voice.finished(s),true);
 s.beat=STORY[0].beats.findIndex(b=>b.speaker.startsWith('MAYA'));voice.update(s);assert.equal(spoken[1].voice.name,'Sonia');assert.match(voice.status(),/British voice/);
}));

test('Stale speech callbacks cannot reopen mouths after a skip or beat change',()=>mockSpeech(({spoken})=>{
 const voice=new StoryVoice(),s=scene();voice.update(s);const old=spoken[0];old.onstart();s.beat++;voice.update(s);const current=spoken[1];current.onstart();old.onend();old.onerror();assert.equal(voice.state,'speaking');voice.stop();current.onstart();current.onboundary({charIndex:5});assert.equal(voice.state,'idle');assert.equal(voice.sample(s).active,false);
}));

test('Missing or blocked speech has readable captions and does not silently claim a UK voice',()=>mockSpeech(({spoken})=>{
 const voice=new StoryVoice(),s=scene();let now=0;voice.now=()=>now;voice.update(s);assert.equal(spoken[0].voice,null);assert.equal(spoken[0].lang,'en-GB');assert.match(voice.status(),/Install an English/);
 now=5;voice.update(s);assert.equal(voice.finished(s),true);assert.equal(voice.sample(s).mode,'caption');spoken[0].onstart();assert.equal(voice.state,'error','a timed-out voice may not start later');
 voice.enabled=false;voice.update(s);assert.equal(voice.sample(s).active,true);s.paused=true;assert.equal(captionSpeech(s).active,false);
},[{lang:'en-US',name:'US only'}]));

test('Co-op scenes wait for both narration completions; stale acks fail and a timeout prevents deadlock',()=>{
 const g=createGame(),a=addPlayer(g,'a','A'),b=addPlayer(g,'b','B');startStory(g,0,{kind:'level',level:0});command(g,a,'storyPlay');const duration=STORY[0].beats[0].duration;const ack=(p,beat=0,take=0)=>({storyId:g.story.id,chapter:0,beat,take});command(g,a,'storySpeechStart',ack(a));command(g,b,'storySpeechStart',ack(b),false);
 tick(g,{},duration+.1);assert.equal(g.story.beat,0);
 assert.equal(command(g,a,'storySpeechDone',ack(a,1)),false);
 command(g,a,'storySpeechDone',ack(a));tick(g,{},.1);assert.equal(g.story.beat,0);
 assert.equal(command(g,b,'storySpeechDone',ack(b),false),true);tick(g,{},.1);assert.equal(g.story.beat,1);
 assert.deepEqual(g.story.speechDone,[]);tick(g,{},STORY[0].beats[1].duration+15.1);assert.equal(g.story.beat,2);
 command(g,a,'storySpeechStart',ack(a,2));command(g,a,'storySpeechDone',ack(a,2));b.connected=false;tick(g,{},STORY[0].beats[2].duration+.1);assert.equal(g.story.beat,3);
});
