import test from 'node:test';
import assert from 'node:assert/strict';
import {SpeechMouth,speechPlan,wordShapes,sampleWord,VISEMES} from '../public/lipsync.js';
import {STORY,StoryVoice} from '../public/story.js';
import {createGame,addPlayer,startStory,tick,command} from '../public/core.js';

test('All story words have finite sound-shape plans and letter clusters use sound groups',()=>{
 assert.deepEqual(wordShapes('the'),['TH','AH']);assert.deepEqual(wordShapes('phone'),['F','O','N']);assert.deepEqual(wordShapes('G'),['SH','I']);assert.deepEqual(wordShapes('man'),['M','A','N']);assert.ok(wordShapes('UPS').length>3);
 for(const c of STORY)for(const b of c.beats){const plan=speechPlan(b.text);assert.ok(plan.words.length>0);assert.ok(Number.isFinite(plan.duration));for(const w of plan.words){assert.ok(w.duration>0);for(const u of w.units)assert.ok(VISEMES[u.shape],u.shape);}}
});

test('M/B/P fully close the lips; rounded vowels, teeth and tongue have distinct poses',()=>{
 const w=speechPlan('bob').words[0];for(const u of w.units){const s=sampleWord(w,(u.start+u.end)/2);if(u.shape==='M')assert.equal(s.open,0);else assert.ok(s.open>0);}
 const th=speechPlan('the').words[0],first=sampleWord(th,th.units[0].end/2);assert.ok(first.tongue>.9);
 assert.ok(VISEMES.U.width<VISEMES.I.width);assert.ok(VISEMES.F.teeth>.9);
});

test('The jaw closes after each spoken word instead of oscillating on the last character',()=>{
 const mouth=new SpeechMouth('Good morning, technician.');mouth.start(10);mouth.boundary({name:'word',charIndex:0,charLength:0},10);assert.equal(mouth.sample(10.12).active,true);assert.equal(mouth.sample(11).active,false);assert.equal(mouth.sample(11.3).open,0);
 mouth.boundary({name:'word',charIndex:5},11.5);assert.equal(mouth.sample(11.65).word,'morning');assert.equal(mouth.sample(11.65).active,true);mouth.end();assert.equal(mouth.sample(11.7).active,false);
});

test('Word cues correct drift, adapt to actual speaking pace, and reject stale or invalid boundaries',()=>{
 const m=new SpeechMouth('one two three four');m.start(20);m.boundary({name:'word',charIndex:0},20);const base=m.plan.words[1].start;assert.equal(m.boundary({name:'word',charIndex:4,elapsedTime:base*.65},20+base*.65+.04),true);assert.ok(m.scale<1);assert.ok(Math.abs(m.anchor.at-(20+base*.65))<.001);const scale=m.scale;assert.equal(m.boundary({charIndex:0},21),false);assert.equal(m.boundary({charIndex:999},21),false);assert.equal(m.boundary({charIndex:-1},21),false);assert.equal(m.boundary({name:'sentence',charIndex:8},21),false);assert.equal(m.scale,scale);
});

test('Punctuation creates closed-mouth gaps when a voice provides no word events',()=>{
 const m=new SpeechMouth('Bob. Bob, Bob');m.start(0);const w=m.plan.words[0];assert.equal(m.sample(w.duration+.1).active,false);assert.equal(m.sample(w.duration+.1).open,0);assert.equal(m.sample(m.plan.words[1].start+.1).active,true);
});

test('Pausing freezes the local speech clock; independent devices can use different voice speeds',()=>{
 const fast=new SpeechMouth('Good morning.'),slow=new SpeechMouth('Good morning.');fast.start(0);slow.start(1);fast.boundary({charIndex:0},0);slow.boundary({charIndex:0},1);fast.boundary({charIndex:5},.22);slow.boundary({charIndex:5},1.48);assert.ok(fast.scale<slow.scale);
 const before=fast.sample(.3);fast.pause(.3);assert.equal(fast.sample(8).active,false);fast.resume(9);const after=fast.sample(9);assert.equal(after.shape,before.shape);assert.equal(after.index,before.index);for(const key of ['open','width','round','teeth','tongue'])assert.ok(Math.abs(after[key]-before[key])<1e-10);assert.equal(slow.sample(9).active,false,'a delayed boundary must not keep flapping');
});

test('Restarted narration cannot be completed by delayed packets from an older take or scene',()=>{
 const g=createGame(),a=addPlayer(g,'a','A'),b=addPlayer(g,'b','B');startStory(g,0,{kind:'level',level:0});command(g,a,'storyPlay');const cue={storyId:g.story.id,chapter:0,beat:0,take:1};for(const p of [a,b])command(g,p,'storySpeechStart',cue);
 command(g,a,'storySpeechDone',cue);assert.ok(g.story.speechDone.includes('a'));assert.equal(command(g,a,'storySpeechStart',{...cue,take:2}),true);assert.ok(!g.story.speechDone.includes('a'));assert.equal(command(g,a,'storySpeechDone',cue),false);assert.equal(command(g,a,'storySpeechStart',cue),false);
 command(g,b,'storySpeechDone',cue);tick(g,{},STORY[0].beats[0].duration+.01);assert.equal(g.story.beat,0);command(g,a,'storySpeechDone',{...cue,take:2});tick(g,{},.02);assert.equal(g.story.beat,1);
 startStory(g,0,{kind:'level',level:0});command(g,a,'storyPlay');assert.equal(command(g,a,'storySpeechStart',cue),false);
});

test('The shared scene timeout stops any remaining local speech instead of showing a closed talking mouth',()=>{
 const old=globalThis.window;let utterance;globalThis.window={speechSynthesis:{getVoices:()=>[],cancel(){},resume(){},speak(u){utterance=u;}},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
 try{const v=new StoryVoice(),s={id:4,chapter:0,beat:0,playing:true,paused:false,waiting:false};v.update(s);utterance.onstart();s.waiting=true;v.update(s);assert.equal(v.state,'ended');assert.equal(v.sample(s).active,false);assert.equal(v.finished(s),true);}finally{globalThis.window=old;}
});
