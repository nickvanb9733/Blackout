import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,addPlayer,startStory,command,tick,interact,normalizeAccount,normalizeAvatar} from '../public/core.js';
import {STORY,StoryVoice,castFor} from '../public/story.js';
import {HEADS} from '../public/data.js';

function ack(g,p,spoken=true){const cue={storyId:g.story.id,chapter:g.story.chapter,beat:g.story.beat,take:0,spoken};command(g,p,'storySpeechStart',cue);command(g,p,'storySpeechDone',cue);}

test('Condensed opening keeps the rescue, villain and mission; voiced scenes have no padded silence',()=>{
 assert.equal(STORY[0].beats.length,7);
 for(const shot of ['escape','rescue','mission','intrusion'])assert.ok(STORY[0].beats.some(b=>b.shot===shot));
 const g=createGame(40,true),a=addPlayer(g,'a','A'),b=addPlayer(g,'b','B');startStory(g,0,{kind:'level',level:0});
 tick(g,{},1);ack(g,a);tick(g,{},.02);assert.equal(g.story.beat,0,'wait for the other speaker device');
 ack(g,b);tick(g,{},.02);assert.equal(g.story.beat,1,'advance immediately after both voices finish');
 ack(g,a);ack(g,b,false);tick(g,{},1);assert.equal(g.story.beat,1,'muted guests keep readable captions');
 tick(g,{},STORY[0].beats[1].duration);assert.equal(g.story.beat,2);
});

test('Host 2× control switches at a line boundary, speeds the shared clock and persists into the next chapter',()=>{
 const g=createGame(40,true),a=addPlayer(g,'a','A'),b=addPlayer(g,'b','B');startStory(g,0,{kind:'level',level:0});
 assert.equal(command(g,b,'storySpeed',{speed:2},false),false);
 assert.equal(command(g,a,'storySpeed',{speed:9}),false);
 assert.equal(command(g,a,'storySpeed',{speed:2}),true);assert.equal(g.story.speed,1);assert.equal(g.story.nextSpeed,2);
 tick(g,{},.5);ack(g,a);ack(g,b);tick(g,{},.02);assert.equal(g.story.beat,1);assert.equal(g.story.speed,2);
 tick(g,{},.5);assert.equal(g.story.elapsed,1);
 command(g,a,'storyPause');tick(g,{},1);assert.equal(g.story.elapsed,1);command(g,a,'storyPause');
 command(g,a,'storySpeed',{speed:1});ack(g,a);ack(g,b);tick(g,{},.02);assert.equal(g.story.speed,1);
 command(g,a,'storySpeed',{speed:2});command(g,a,'storySkip');startStory(g,1,{kind:'lobby',room:0});assert.equal(g.story.speed,2);
});

test('2× British speech and mouth timing use the same rate; next-line speed does not restart current speech',()=>{
 const old=globalThis.window,spoken=[];
 globalThis.window={speechSynthesis:{getVoices:()=>[{lang:'en-GB',name:'Daniel'}],speak:u=>spoken.push(u),cancel(){},resume(){}},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
 try{
  const v=new StoryVoice(),s={id:7,chapter:0,beat:2,elapsed:0,playing:true,speed:1,nextSpeed:1};v.now=()=>0;v.update(s);
  const base=spoken[0].rate,normalScale=v.mouth.scale;spoken[0].onstart();s.nextSpeed=2;v.update(s);assert.equal(spoken.length,1);
  s.beat=3;s.speed=2;v.update(s);assert.equal(spoken[1].rate,castFor(STORY[0].beats[3].speaker).rate*2);assert.equal(spoken[1].lang,'en-GB');assert.ok(spoken[1].rate>base*1.8);assert.ok(v.mouth.scale<normalScale*.6);
 }finally{globalThis.window=old;}
});

test('All ten purchasable heads can be bought, equipped, saved and fully reset by Restart Solo',()=>{
 const g=createGame(40),p=addPlayer(g,'p','Tech');p.wallet=1200;p.claimed=['0:0'];p.x=190;interact(g,p);
 assert.equal(HEADS.filter(h=>h.price).length,10);
 for(const h of HEADS.filter(h=>h.price)){const before=p.wallet;assert.equal(command(g,p,'buyHead',{head:h.id}),true);assert.equal(p.wallet,before-h.price);assert.equal(command(g,p,'avatar',{avatar:{shape:h.id,color:'#f493b0'}}),true);assert.equal(p.avatar.shape,h.id);assert.ok(normalizeAccount(p).heads.includes(h.id));}
 assert.equal(p.wallet,0);command(g,p,'close');p.x=390;interact(g,p);command(g,p,'close');assert.equal(p.heads.length,13,'cancelling keeps purchases');
 interact(g,p);assert.equal(command(g,p,'restartCampaign'),true);assert.deepEqual(normalizeAccount(p),normalizeAccount());assert.deepEqual(p.avatar,normalizeAvatar());assert.equal(g.progress,0);assert.equal(g.seenOpening,false);
});
