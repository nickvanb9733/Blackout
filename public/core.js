import {STORY,storyBeat} from './story.js';
import {traceOptics} from './optics.js';
import {buildMap} from './levels.js';
import {THEMES,QUESTIONS,COLORS,HEADS,FUSE_POINTS} from './data.js';
export const INPUT={LEFT:1,RIGHT:2,JUMP:4,USE:8,UP:16,DOWN:32,ATTACK:64};
export const FIXED=1/60;
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function normalizeAvatar(a={}){return{color:COLORS.includes(a.color)?a.color:COLORS[0],helmet:COLORS.includes(a.helmet)?a.helmet:COLORS[1],shape:HEADS.some(h=>h.id===a.shape)?a.shape:'square',face:['visor','eyes','smile'].includes(a.face)?a.face:'visor'}}
export function cleanName(s){return String(s||'Technician').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,18)||'Technician'}
export function doorX(r){return 560+r*330}
export function geom(o,t){return{...o,x:o.x+(o.motion==='x'?Math.sin(t*o.speed+o.phase)*o.range:0),y:o.y+(o.motion==='y'?Math.sin(t*o.speed+o.phase)*o.range:0)}}
export function makeLobby(){return{id:-1,width:3300,height:820,spawn:{x:410,y:602},platforms:[{id:0,x:0,y:650,w:3300,h:150,type:'floor'}],ladders:[],slides:[],hazards:[],fuses:[],meds:[],enemies:[],relays:[],sections:[],exit:null,route:[]}}
export const makeMap=buildMap;
export function platformAt(g,id,t=g.mapTime){const pl=geom(g.map.platforms[id],t),v=g.movable?.[id]?.value||0;return pl.track?{...pl,x:pl.x+pl.track.x*v,y:pl.y+pl.track.y*v}:pl}
export function normalizeAccount(a={}){return{wallet:clamp(Math.floor(Number(a.wallet)||0),0,100000),heads:[...new Set(['square','round','point',...(Array.isArray(a.heads)?a.heads.filter(id=>HEADS.some(h=>h.id===id)):[])])],claimed:[...new Set((Array.isArray(a.claimed)?a.claimed:[]).filter(v=>/^([0-9]|[1-3][0-9]):[0-2]$/.test(v)))].slice(0,120)}}
export function newPlayer(id,name,avatar,account){return{...normalizeAccount(account),id,name:cleanName(name),avatar:normalizeAvatar(avatar),connected:true,x:410,y:602,w:32,h:46,vx:0,vy:0,hp:3,face:1,grounded:false,platform:-1,coyote:0,jumps:0,inv:0,attack:0,attackCD:0,down:false,revive:0,ladder:-1,ladderBlock:-1,ladderExit:0,ladderLock:0,slide:-1,drop:0,safeX:410,safeY:602,checkpoint:-1,quiz:null,quizStep:0,quizNonce:0,passed:false,interaction:null,riding:null,grab:-1,launchLock:0,launchCD:0,landed:-1,message:'',messageUntil:0,deathCount:0}}
export function createGame(progress=0,online=false){return{online,story:null,storySpeed:1,storySerial:0,seenOpening:false,movable:{},optics:[],routeProgress:0,checkpoint:null,epoch:0,time:0,mapTime:0,mode:'lobby',phase:'active',level:-1,returnRoom:0,progress:clamp(Math.floor(Number(progress)||0),0,40),players:[],map:makeLobby(),fuses:[],meds:[],relays:[],enemies:[],bullets:[],bulletId:0,events:[],eventId:0}}
export const activePlayers=g=>g.players.filter(p=>p.connected);
export function addPlayer(g,id,name,avatar,account){if(activePlayers(g).length>=2)return null;const p=newPlayer(id,name,avatar,account);if(!p.heads.includes(p.avatar.shape))p.avatar.shape='square';g.players.push(p);if(g.mode==='level')respawn(g,p,true);return p}
export function notice(g,p,text){p.message=text;p.messageUntil=g.time+6}
export function event(g,type,x,y,color){g.events.push({id:++g.eventId,type,x,y,color});if(g.events.length>28)g.events.shift()}
export function respawn(g,p,atStart=false){const s=g.mode==='level'?g.map.spawn:{x:doorX(g.returnRoom)+65,y:602};p.x=atStart?s.x:p.safeX;p.y=atStart?s.y:p.safeY;p.vx=p.vy=0;p.grounded=false;p.jumps=0;p.ladder=p.slide=-1;p.ladderBlock=-1;p.ladderExit=p.ladderLock=0;p.riding=null;p.grab=-1;p.launchLock=0;p.launchCD=0;p.inv=1.5;p.down=false;p.revive=0;p.quiz=null;p.interaction=null;}
export function enterLobby(g,r=0){g.mode='lobby';g.phase='active';g.returnRoom=r;g.level=-1;g.epoch++;g.map=makeLobby();g.mapTime=0;g.checkpoint=null;g.movable={};g.optics=[];g.routeProgress=0;g.fuses=[];g.meds=[];g.relays=[];g.enemies=[];g.bullets=[];g.players.forEach((p,i)=>{respawn(g,p,true);p.x+=i*42;p.hp=3;p.passed=false;p.quizStep=0})}
export function startMap(g,id){if(!Number.isInteger(id)||id<0||id>39||id>g.progress)return false;g.mode='level';g.phase='active';g.level=id;g.returnRoom=Math.floor(id/5);g.epoch++;g.map=makeMap(id);g.mapTime=0;g.checkpoint=null;g.routeProgress=0;g.optics=g.map.optics.map(o=>({x:o.x,solved:false,hold:0,owner:null}));g.movable=Object.fromEntries(g.map.platforms.filter(pl=>pl.track).map(pl=>[pl.id,{value:0,owner:null}]));g.fuses=g.map.fuses.map(()=>false);g.meds=g.map.meds.map(()=>false);g.relays=g.map.relays.map(()=>({open:false,timers:[0,0],hold:0}));g.enemies=structuredClone(g.map.enemies);g.bullets=[];g.players.forEach((p,i)=>{p.hp=3;p.quizStep=0;p.quizNonce++;p.passed=false;p.attack=0;p.attackCD=0;respawn(g,p,true);p.x+=i*38;p.safeX=g.map.spawn.x;p.safeY=g.map.spawn.y;p.checkpoint=-1;notice(g,p,g.map.scenario); });return true}
function setPlayerCheckpoint(g,p,checkpoint){
 const pl=g.map.platforms[checkpoint.platform],party=activePlayers(g),index=party.findIndex(a=>a.id===p.id),offset=party.length>1?(index===0?-18:18):0;
 p.safeX=clamp(checkpoint.x-p.w/2+offset,pl.x+2,pl.x+pl.w-p.w-2);p.safeY=pl.y-p.h;p.checkpoint=checkpoint.id;
}
function touchCheckpoints(g,p){
 if(p.down||!p.grounded||p.quiz||p.passed)return;
 for(const c of g.map.checkpoints||[]){if(p.platform!==c.platform||g.routeProgress<c.platform||c.id<=p.checkpoint)continue;
  if(!g.checkpoint||c.id>g.checkpoint.id){g.checkpoint={...c,activatedAt:g.time};for(const member of activePlayers(g)){setPlayerCheckpoint(g,member,c);if(!member.down){member.hp=3;member.inv=Math.max(member.inv,2.5);}notice(g,member,c.label+' ACTIVE · Crew respawn saved. Fuses and opened gates survive a retry.');}event(g,'checkpoint',c.x,c.y-45,'#95edbe');}
  else{setPlayerCheckpoint(g,p,c);notice(g,p,c.label+' reached again. Respawn restored.');}
 }
}
export function resumeCheckpoint(g){
 if(!g.checkpoint)return startMap(g,g.level);
 g.phase='active';g.epoch++;g.bullets=[];g.mapTime=0;g.enemies=structuredClone(g.map.enemies);
 for(const state of Object.values(g.movable)){state.owner=null;state.returning=false;}
 for(const state of g.optics)state.owner=null;
 for(const relay of g.relays){relay.hold=0;relay.timers=[0,0];}
 for(const p of activePlayers(g)){p.hp=3;p.passed=false;p.quizStep=0;p.quizNonce++;p.attack=p.attackCD=p.drop=0;respawn(g,p,false);p.inv=3;notice(g,p,p.checkpoint>=0?'Resumed at checkpoint '+(p.checkpoint+1)+'. Recovered objectives kept.':'Back at the entrance. Reach a checkpoint to restore your respawn.');}
 event(g,'checkpoint',g.checkpoint.x,g.checkpoint.y-45,'#95edbe');return true;
}
export function hazardBounds(g,h){if(h.type==='flood')return h;const pl=platformAt(g,h.platform);return{x:pl.x+h.offset-h.w/2,y:pl.y-h.h,w:h.w,h:h.h}}
export function hazardStatus(g,h){if(['flood','saw','spikes'].includes(h.type))return'active';const t=(g.mapTime+h.phase)%h.period;return t<h.period*h.duty?'active':t>h.period-.65?'warning':'idle'}
export function hurt(g,p,x,fall=false){if(p.down||p.quiz||p.passed||g.phase!=='active'||(!fall&&p.inv>0))return;p.hp--;p.inv=1.4;event(g,'hit',p.x,p.y,'#ff8a78');if(p.hp<=0){if(fall){p.x=p.safeX;p.y=p.safeY}p.riding=null;p.hp=0;p.down=true;p.deathCount++;p.vx=p.vy=0;p.ladder=p.slide=-1;notice(g,p,activePlayers(g).length>1?'Down! Your teammate can hold E beside you to revive.':'Technician down. Retry this map.');if(activePlayers(g).every(a=>a.down))g.phase='dead';return}if(fall)respawn(g,p,false);else{p.vx=p.x<x?-190:190;p.vy=-230}}
function attackEnemy(g,e){if(e.dead||e.hit>0)return;e.hp--;e.hit=.32;event(g,'spark',e.x,e.y,'#ffca70');if(e.hp<=0){e.dead=true;event(g,'burst',e.x,e.y,THEMES[g.map.room].color)}}
export function plateBounds(g,plate){const pl=platformAt(g,plate.platform);return{x:pl.x+plate.offset-25,y:pl.y-10,w:50,h:18}}
function nearExit(g,p){return g.map.exit&&overlap({x:p.x-36,y:p.y-25,w:p.w+72,h:p.h+50},g.map.exit)}
function allObjectives(g){return g.fuses.every(Boolean)&&g.relays.every(r=>r.open)&&g.optics.every(o=>o.solved)&&g.routeProgress>=g.map.platforms.length-1}
export function questionFor(g,p){const index=(g.level%5)*2+p.quizStep,source=QUESTIONS[g.map.room][index];const shift=(g.level+p.quizNonce+p.id.length)%4;return{...source,options:source.options.map((_,i)=>source.options[(i+shift)%4]),correct:(source.correct-shift+4)%4,index,nonce:p.quizNonce,step:p.quizStep}}
export function answer(g,p,choice,nonce){if(g.mode!=='level'||g.phase!=='active'||!p.quiz||p.quizNonce!==nonce||!Number.isInteger(choice)||choice<0||choice>3||!nearExit(g,p))return false;const q=questionFor(g,p);p.quizNonce++;if(choice!==q.correct){const explanation=q.explanation;p.quizStep=0;p.passed=false;p.checkpoint=-1;p.safeX=g.map.spawn.x;p.safeY=g.map.spawn.y;respawn(g,p,true);notice(g,p,'Back to the entrance: '+explanation);event(g,'teleport',p.x,p.y,'#b9a4f5');return false}p.quizStep++;if(p.quizStep<2){p.quiz={nonce:p.quizNonce};notice(g,p,'First check passed. One question remains.')}else{p.quiz=null;p.passed=true;p.inv=999;notice(g,p,'Knowledge check passed. Bring your teammate to the exit.');checkClear(g)}return true}
function checkClear(g){const party=activePlayers(g);if(g.mode==='level'&&g.phase==='active'&&party.length&&allObjectives(g)&&party.every(p=>!p.down&&p.passed&&nearExit(g,p))){g.phase='clear';g.progress=Math.max(g.progress,g.level+1);event(g,'clear',g.map.exit.x,g.map.exit.y,'#83edbc');if(g.level%5===4)startStory(g,Math.floor(g.level/5)+1,{kind:'lobby',room:g.returnRoom});}}
export function interact(g,p){if(p.down||p.quiz)return;if(g.mode==='lobby'){if(Math.abs(p.x+16-406)<75){if(g.online)notice(g,p,'The restart door is for solo campaigns. Leave co-op to restart solo.');else p.interaction='restart';return}if(Math.abs(p.x+16-205)<110){p.interaction='designer';return}for(let r=0;r<8;r++)if(Math.abs(p.x+16-(doorX(r)+77))<110){if(g.progress>=r*5)p.interaction='room:'+r;else notice(g,p,'Restore '+THEMES[r-1].name+' to unlock this equipment room.');return}}else if(nearExit(g,p)){if(!allObjectives(g)){notice(g,p,'Exit locked: follow every numbered route beacon, recover 3 fuses, open both relays and solve any mirror gate.');return}if(p.passed){checkClear(g);notice(g,p,'Check passed. Every connected player must pass and reach this door.');return}p.quizStep=0;p.quizNonce++;p.quiz={nonce:p.quizNonce};p.vx=p.vy=0}}
export function command(g,p,action,data={},isHost=true){if(!p?.connected)return false;if(g.story&&!['storyPlay','storyPause','storySpeed','storySkip','storyAdvance','storySpeechStart','storySpeechDone'].includes(action))return false;switch(action){case'storySpeechStart':case'storySpeechDone':{
 const s=g.story;if(!s?.playing||s.waiting||data.storyId!==s.id||data.chapter!==s.chapter||data.beat!==s.beat||!Number.isSafeInteger(data.take)||data.take<0||data.take>10000000)return false;
 const current=s.speechTakes[p.id]??-1;if(action==='storySpeechStart'){if(data.take<current)return false;if(data.take>current){s.speechTakes[p.id]=data.take;s.speechDone=s.speechDone.filter(id=>id!==p.id);s.speechVoiced=s.speechVoiced.filter(id=>id!==p.id);}return true;}
 if(data.take!==current)return false;if(!s.speechDone.includes(p.id))s.speechDone.push(p.id);if(data.spoken===true&&!s.speechVoiced.includes(p.id))s.speechVoiced.push(p.id);return true;
 }case'storySpeed':if(!isHost||!g.story||![1,2].includes(data.speed))return false;g.storySpeed=data.speed;g.story.nextSpeed=data.speed;return true;case'storyPlay':if(!isHost||!g.story)return false;g.story.playing=true;g.story.paused=false;return true;case'storyPause':if(!isHost||!g.story)return false;g.story.paused=!g.story.paused;return true;case'storySkip':if(!isHost||!g.story)return false;finishStory(g);return true;case'storyAdvance':if(!isHost||!g.story||!g.story.waiting)return false;advanceStory(g);return true;case'watchStory':if(!isHost||g.mode!=='lobby'||!Number.isInteger(data.chapter)||data.chapter<0||data.chapter>Math.floor(g.progress/5))return false;startStory(g,data.chapter,{kind:'lobby',room:g.returnRoom});return true;case'restartCampaign':if(g.online||activePlayers(g).length!==1||g.mode!=='lobby'||p.interaction!=='restart')return false;g.progress=0;g.seenOpening=false;Object.assign(p,normalizeAccount());p.avatar=normalizeAvatar();enterLobby(g,0);notice(g,p,'Fresh campaign. Appearance, purchased heads and points reset. Enter Utility to begin.');return true;case'buyHead':{if(g.mode!=='lobby'||p.interaction!=='designer')return false;const head=HEADS.find(h=>h.id===data.head);if(!head||p.heads.includes(head.id)||p.wallet<head.price)return false;p.wallet-=head.price;p.heads.push(head.id);event(g,'fuse',p.x,p.y,'#ffd774');return true;}case'avatar':{const next=normalizeAvatar(data.avatar);if(!p.heads.includes(next.shape))return false;p.avatar=next;}p.name=cleanName(data.name);return true;case'close':p.interaction=null;return true;case'cancelQuiz':p.quiz=null;p.quizStep=0;return true;case'answer':return answer(g,p,data.choice,data.nonce);case'enter':if(!isHost||!p.interaction?.startsWith('room:'))return false;{const r=Number(p.interaction.split(':')[1]);if(Math.floor(data.level/5)!==r)return false;if(data.level===0&&g.progress===0&&!g.seenOpening){startStory(g,0,{kind:'level',level:0});return true;}return startMap(g,data.level)}case'retry':return isHost&&g.mode==='level'?(g.phase==='clear'?startMap(g,g.level):resumeCheckpoint(g)):false;case'restartLevel':return isHost&&g.mode==='level'?startMap(g,g.level):false;case'lobby':if(!isHost)return false;enterLobby(g,g.returnRoom);return true;case'next':if(!isHost||g.phase!=='clear')return false;if(g.level%5===4){startStory(g,Math.floor(g.level/5)+1,{kind:'lobby',room:g.returnRoom});return true}return startMap(g,g.level+1);default:return false}}
function climbOrSlide(g,p,input,pressed,dt){
 const map=g.map,using=!!(input&INPUT.USE),up=!!(input&INPUT.UP),down=!!(input&INPUT.DOWN),jump=!!(pressed&INPUT.JUMP);
 const contact={x:p.x-8,y:p.y-6,w:p.w+16,h:p.h+12};
 p.ladderLock=Math.max(0,(p.ladderLock||0)-dt);
 if(p.ladderBlock>=0){
  const raw=map.ladders[p.ladderBlock],reverse=p.grounded&&p.ladderLock<=0&&((p.ladderExit===1&&down&&!up)||(p.ladderExit===-1&&up&&!down));
  // A jump must leave the ladder before it can catch again. At an endpoint,
  // reversing W/S deliberately re-enters without needing to step off the dock.
  if(!raw||!overlap(contact,geom(raw,g.mapTime))||reverse){p.ladderBlock=-1;p.ladderExit=0;}
 }
 if(jump&&(p.ladder>=0||p.slide>=0)){
  p.ladderBlock=p.ladder;p.ladderExit=0;p.ladderLock=.3;p.ladder=p.slide=-1;p.vy=-590;p.jumps=1;p.grounded=false;p.platform=-1;p.coyote=0;p.riding=null;p.inv=Math.max(p.inv,.12);event(g,'jump',p.x+16,p.y+46,p.avatar.color);return false;
 }
 if(jump){const touching=map.ladders.find(l=>overlap(contact,geom(l,g.mapTime)));if(touching){p.ladderBlock=touching.id;p.ladderExit=0;p.ladderLock=.3;}}
 if(!jump&&p.ladderLock<=0&&p.grab<0&&!p.riding&&p.ladder<0&&p.slide<0){for(const raw of map.ladders){
  const l=geom(raw,g.mapTime);if(raw.id===p.ladderBlock||!overlap(contact,l))continue;
  // Give floors at either end priority over capture, so arrival registers route
  // beacons/checkpoints and teammates can stand still on nearby relay pads.
  // W/S toward the shaft enters directly from the dock, without an E press.
  const dock=p.vy>=0&&map.platforms.map(pl=>platformAt(g,pl.id)).find(pl=>p.x+p.w>pl.x+2&&p.x<pl.x+pl.w-2&&Math.abs(p.y+p.h-pl.y)<=8&&(Math.abs(pl.y-l.y)<12||Math.abs(pl.y-l.y-l.h)<12));
  if(dock){const top=Math.abs(dock.y-l.y)<12;if(top?(!down||up):(!up||down))continue;}
  p.ladder=l.id;p.platform=-1;p.grounded=false;p.coyote=0;p.drop=0;break;
 }}
 if(p.ladder>=0){
  const l=geom(map.ladders[p.ladder],g.mapTime);p.x=l.x+l.w/2-p.w/2;p.vx=p.vy=0;p.grounded=false;
  p.y=clamp(p.y+(down?180:up?-180:0)*dt,l.y-p.h,l.y+l.h-p.h);p.jumps=0;
  const top=up&&p.y<=l.y-p.h+.1,bottom=down&&p.y>=l.y+l.h-p.h-.1;
  if(top||bottom){p.ladderBlock=p.ladder;p.ladderExit=top?1:-1;p.ladderLock=.2;p.ladder=-1;p.y=top?l.y-p.h-1:l.y+l.h-p.h-8;p.vy=top?-110:0;}
  return true;
 }
 if(p.slide<0&&down&&!using){for(const s of map.slides){if(Math.abs(p.x+p.w/2-s.x1)<58&&Math.abs(p.y+p.h-s.y1)<75){p.slide=s.id;p.x=s.x1-p.w/2;break}}}
 if(p.slide>=0){const s=map.slides[p.slide];p.x+=400*dt;p.y=s.y1+(clamp(p.x+p.w/2,s.x1,s.x2)-s.x1)/(s.x2-s.x1)*(s.y2-s.y1)-p.h;p.vx=400;p.vy=0;p.face=1;p.grounded=false;p.jumps=0;if(p.x+p.w/2>=s.x2){p.x=s.x2-p.w/2;p.y=s.y2-p.h-3;p.slide=-1;p.vx=120}return true}return false;
}
function moveGantries(g,party,inputs,solid,dt){
 for(const p of party)p.grab=-1;
 for(const [id,state] of Object.entries(g.movable||{})){
  const pl=solid[Number(id)],raw=g.map.platforms[Number(id)];
  const eligible=p=>{const v=inputs[p.id]||{};return !p.down&&!p.quiz&&!p.interaction&&!p.passed&&p.ladder<0&&p.slide<0&&!!(v.held&INPUT.USE)&&!(v.pressed&INPUT.JUMP)&&((p.grounded&&p.platform===pl.id)||overlap({x:p.x-28,y:p.y-8,w:p.w+56,h:p.h+20},{x:pl.x,y:pl.y-25,w:pl.w,h:45}))};
  const owner=party.find(p=>p.id===state.owner&&eligible(p))||party.find(eligible);state.owner=owner?.id||null;
  const call=platformAt(g,raw.track.call);if(!owner&&party.some(p=>!p.down&&!p.quiz&&(inputs[p.id]?.pressed&INPUT.USE)&&distance({x:p.x+16,y:p.y+p.h},{x:call.x+call.w*.7,y:call.y})<85)){state.returning=true;party.forEach(p=>notice(g,p,'Rail carriage returning to its starting dock.'));}
  if(owner){owner.grab=pl.id;owner.riding=null;state.returning=false;}else if(!state.returning)continue;const input=owner?(inputs[owner.id]?.held||0):0;
  const horizontal=((input&INPUT.RIGHT)?1:0)-((input&INPUT.LEFT)?1:0),vertical=((input&INPUT.DOWN)?1:0)-((input&INPUT.UP)?1:0);
  const length=Math.hypot(raw.track.x,raw.track.y),axis=state.returning?-1:raw.track.x?horizontal*Math.sign(raw.track.x):vertical*Math.sign(raw.track.y),before=state.value;
  state.value=clamp(before+axis*165/length*dt,0,1);const dx=(state.value-before)*raw.track.x,dy=(state.value-before)*raw.track.y;
  for(const p of party)if((p.grounded&&p.platform===pl.id)||p.id===owner?.id){p.x=clamp(p.x+dx,0,g.map.width-p.w);p.y+=dy;p.vx=0;}
  solid[Number(id)]=platformAt(g,Number(id));if(state.value===0)state.returning=false;
 }
}
export function startStory(g,chapter,after){g.storySerial=(g.storySerial||0)+1;g.story={id:g.storySerial,chapter,beat:0,elapsed:0,speed:g.storySpeed||1,nextSpeed:g.storySpeed||1,playing:true,paused:false,waiting:false,speechDone:[],speechVoiced:[],speechTakes:{},after};for(const p of g.players){p.interaction=null;p.vx=p.vy=0;}}
function finishStory(g){const s=g.story;g.story=null;if(s.chapter===0)g.seenOpening=true;if(s.after.kind==='level')startMap(g,s.after.level);else enterLobby(g,s.after.room);}
function advanceStory(g){const s=g.story;if(s.beat>=STORY[s.chapter].beats.length-1){finishStory(g);return;}s.beat++;s.elapsed=0;s.speed=s.nextSpeed||1;s.waiting=false;s.speechDone=[];s.speechVoiced=[];s.speechTakes={};}
export function solidWalls(g){if(g.mode!=='level')return[];const walls=[...(g.map.barriers||[])];const shell=id=>{const pl=platformAt(g,id);return{x:pl.x-8,y:pl.y-135,w:pl.w+16,h:182}};if(g.routeProgress<g.map.platforms.length-2)walls.push({...shell(g.map.platforms.length-1),kind:'route'});g.map.optics.forEach((o,i)=>{if(!g.optics[i].solved)walls.push({...shell(o.gatePlatform),kind:'mirror'});});return walls;}
function moveEmitters(g,party,inputs,dt){if(g.mode!=='level')return;g.map.optics.forEach((def,i)=>{const state=g.optics[i];if(state.solved)return;const can=p=>{const v=inputs[p.id]||{};return !p.down&&!p.quiz&&!p.interaction&&p.grab<0&&p.ladder<0&&p.slide<0&&!(v.pressed&INPUT.JUMP)&&(v.held&INPUT.USE)&&distance({x:p.x+16,y:p.y+22},{x:state.x,y:def.y})<86};const owner=party.find(p=>p.id===state.owner&&can(p))||party.find(can);state.owner=owner?.id||null;if(owner){owner.grab=1000+i;const input=inputs[owner.id]?.held||0,axis=((input&INPUT.RIGHT)?1:0)-((input&INPUT.LEFT)?1:0),old=state.x;state.x=clamp(state.x+axis*105*dt,def.min,def.max);owner.x+=state.x-old;owner.vx=0;}const path=traceOptics(def,state);state.hold=path.lit?state.hold+dt:0;if(state.hold>.65){state.solved=true;state.owner=null;event(g,'relay',def.receiver.x,def.receiver.y,'#80e9f0');party.forEach(p=>notice(g,p,'Optical interlock aligned. Mirror gate unlocked.'));}});}
// Ray/AABB intersections: beams stop at the first platform, including player-positioned cover.
export function rayBox(x,y,dx,dy,box,max=950){let lo=0,hi=max;for(const [origin,dir,min,size] of [[x,dx,box.x,box.w],[y,dy,box.y,box.h]]){if(Math.abs(dir)<1e-8){if(origin<min||origin>min+size)return Infinity;continue}let a=(min-origin)/dir,b=(min+size-origin)/dir;if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>hi)return Infinity}return lo;}
export function beamFor(g,e){const x=e.x+16,y=e.y+12,dx=Math.cos(e.angle),dy=Math.sin(e.angle);let length=900;for(const pl of [...g.map.platforms,...solidWalls(g)]){const hit=rayBox(x,y,dx,dy,pl.id===undefined?pl:platformAt(g,pl.id),length);if(hit>2)length=Math.min(length,hit)}return{x,y,x2:x+dx*length,y2:y+dy*length,dx,dy,length};}
function laserTick(g,e,party,dt){
 const target=party.filter(p=>!p.down&&!p.quiz&&!p.passed&&distance(p,e)<820).sort((a,b)=>distance(a,e)-distance(b,e))[0];
 e.beamTimer-=dt;
 if(e.beamState==='idle'){if(target&&e.beamTimer<=0){e.beamState='aim';e.beamTimer=1.35-g.map.difficulty*.35;e.angle=Math.atan2(target.y+23-(e.y+12),target.x+16-(e.x+16));}}
 else if(e.beamState==='aim'){if(target)e.angle=Math.atan2(target.y+23-(e.y+12),target.x+16-(e.x+16));if(e.beamTimer<=0){e.beamState='lock';e.beamTimer=.45;}}
 else if(e.beamState==='lock'&&e.beamTimer<=0){e.beamState='fire';e.beamTimer=.32;event(g,'spark',e.x,e.y,'#ff6e96');}
 else if(e.beamState==='fire'&&e.beamTimer<=0){e.beamState='idle';e.beamTimer=1.6-g.map.difficulty*.35;}
 if(e.beamState==='fire'){const ray=beamFor(g,e);for(const p of party){const box={x:p.x-3,y:p.y-3,w:p.w+6,h:p.h+6};if(rayBox(ray.x,ray.y,ray.dx,ray.dy,box,ray.length)<ray.length)hurt(g,p,e.x);}}
 e.face=Math.cos(e.angle)>=0?1:-1;
}
export function tick(g,inputs={},dt=FIXED){g.time+=dt;if(g.story){const s=g.story;if(s.playing&&!s.paused&&!s.waiting){s.elapsed+=dt*(s.speed||1);const crew=activePlayers(g),done=crew.every(p=>s.speechDone.includes(p.id)),voiced=crew.every(p=>s.speechVoiced.includes(p.id));if((done&&(voiced?s.elapsed>=.4:s.elapsed>=storyBeat(s).duration))||s.elapsed>=storyBeat(s).duration+15){if(storyBeat(s).confirm||s.beat===STORY[s.chapter].beats.length-1)s.waiting=true;else advanceStory(g);}}return;}if(g.mode==='level'&&g.phase==='active')g.mapTime+=dt;if(g.phase!=='active')return;const map=g.map,party=activePlayers(g),solid=map.platforms.map(pl=>platformAt(g,pl.id));const previous=new Map(party.map(p=>[p.id,{x:p.x,y:p.y}]));
 moveGantries(g,party,inputs,solid,dt);moveEmitters(g,party,inputs,dt);const walls=solidWalls(g);
 for(const p of party){const data=inputs[p.id]||{},input=data.held||0,pressed=data.pressed||0;p.inv=Math.max(0,p.inv-dt);p.attack=Math.max(0,p.attack-dt);p.attackCD=Math.max(0,p.attackCD-dt);p.drop=Math.max(0,p.drop-dt);p.coyote=Math.max(0,p.coyote-dt);p.launchLock=Math.max(0,p.launchLock-dt);p.launchCD=Math.max(0,p.launchCD-dt);p.landed=-1;
  if(p.down){if(p.y>map.height-30){p.x=p.safeX;p.y=p.safeY}continue}if(p.quiz||p.interaction||p.passed)continue;if(pressed&INPUT.JUMP)p.riding=null;
  if((input&INPUT.USE)&&g.mode==='level'){const downed=party.find(a=>a.id!==p.id&&a.down&&distance(p,a)<85);if(downed){downed.revive+=dt;if(downed.revive>=1.4){downed.hp=2;downed.down=false;downed.inv=2;downed.revive=0;event(g,'revive',downed.x,downed.y,'#83edbc');notice(g,downed,'Back on your feet. Stay together.')}continue}}
  const hadLadder=p.ladder>=0,detachedJump=!!(pressed&INPUT.JUMP)&&(hadLadder||p.slide>=0);const climbing=climbOrSlide(g,p,input,pressed,dt);
  if(!climbing){const axis=p.grab>=0?0:((input&INPUT.RIGHT)?1:0)-((input&INPUT.LEFT)?1:0);if(axis)p.face=axis;const target=axis*295;if(p.launchLock<=0)p.vx+=(target-p.vx)*Math.min(1,dt*(p.grounded?20:12));
   if(!detachedJump&&(pressed&INPUT.JUMP)&&(p.grounded||p.coyote>0||p.jumps<2)){p.vy=-660;p.jumps=p.grounded||p.coyote>0?1:p.jumps+1;p.grounded=false;p.coyote=0;p.platform=-1;event(g,'jump',p.x+16,p.y+46,p.avatar.color)}
   if(!(input&INPUT.JUMP)&&p.vy<-280)p.vy+=1800*dt;
   if((pressed&INPUT.DOWN)&&!(input&INPUT.USE)&&p.slide<0)p.drop=.25;
   p.vy=Math.min(920,p.vy+1700*dt);
   if(p.grounded&&p.platform>=0){const base=map.platforms[p.platform];if(base?.motion){const now=geom(base,g.mapTime),before=geom(base,g.mapTime-dt);p.x+=now.x-before.x;p.y+=now.y-before.y}if(base?.type==='conveyor')p.x+=base.conveyor*dt}
   if(g.mode==='level')for(const pl of solid)if(pl.type==='fan'&&p.x+p.w>pl.x+20&&p.x<pl.x+pl.w-20&&p.y+p.h>pl.y-125&&p.y<pl.y){p.vy=Math.max(-560,p.vy-2250*dt);if(pl.id===g.routeProgress+1){g.routeProgress=pl.id;event(g,'relay',p.x,p.y,'#a1d8ca');}}
   const oldY=p.y,oldX=previous.get(p.id)?.x??p.x,oldFeet=p.y+p.h;p.x=clamp(p.x+p.vx*dt,0,map.width-p.w);for(const wall of walls)if(overlap(p,wall)){if(oldX+p.w<=wall.x+3)p.x=wall.x-p.w;else if(oldX>=wall.x+wall.w-3)p.x=wall.x+wall.w;else continue;p.vx=0;p.launchLock=0;}p.y+=p.vy*dt;const was=p.grounded;p.grounded=false;p.platform=-1;
   if(p.drop<=0)for(const pl of solid)if(p.x+p.w>pl.x+2&&p.x<pl.x+pl.w-2&&p.vy>=0&&oldFeet<=pl.y+5&&p.y+p.h>=pl.y){p.y=pl.y-p.h;p.vy=0;p.grounded=true;p.platform=pl.id;p.landed=pl.id;if(g.mode==='level'&&pl.id>g.routeProgress+1&&!was)notice(g,p,'Route skipped: follow the yellow numbered plaque. The exit bulkhead stays closed until the route is complete.');if(g.mode==='level'&&pl.id===g.routeProgress+1){g.routeProgress=pl.id;event(g,'relay',p.x,p.y,'#a1d8ca');}p.jumps=0;p.coyote=.09;break}
   for(const wall of walls)if(overlap(p,wall)){if(oldFeet<=wall.y+5&&p.vy>=0){p.y=wall.y-p.h;p.vy=0;p.grounded=true;p.platform=-1;p.jumps=0;}else if(oldY>=wall.y+wall.h-5&&p.vy<0){p.y=wall.y+wall.h;p.vy=0;p.launchLock=0;}}
   if(p.grounded&&p.platform>=0&&p.launchCD<=0){const base=solid[p.platform];if(base.type==='spring'||base.type==='launcher'){p.vy=-base.power;p.vx=base.launchX||p.vx;p.launchLock=base.launchX ? .64 : 0;p.launchCD=.7;p.grounded=false;p.platform=-1;p.jumps=1;event(g,'jump',p.x,p.y,'#bcdf84');}}
   if(was&&!p.grounded)p.coyote=.09;
   // Open maintenance slides catch falling players; pressing S at their entry attaches deliberately.
   if(p.vy>0)for(const s of map.slides){const cx=p.x+p.w/2;if(cx>=s.x1&&cx<=s.x2){const yy=s.y1+(cx-s.x1)/(s.x2-s.x1)*(s.y2-s.y1);if(oldFeet<=yy+5&&p.y+p.h>=yy){p.slide=s.id;break}}}
   if(g.mode==='level')for(let i=0;i<map.relays.length;i++){if(g.relays[i].open)continue;const gate=map.relays[i].gate;if(overlap(p,gate)){if(p.x+p.w/2<gate.x+gate.w/2)p.x=gate.x-p.w;else p.x=gate.x+gate.w;p.vx=0}}
  }
  if((pressed&INPUT.ATTACK)&&p.attackCD<=0){p.attack=.2;p.attackCD=.38;const box={x:p.face>0?p.x+10:p.x-53,y:p.y-10,w:76,h:64};g.enemies.forEach(e=>{if(!e.dead&&overlap(box,e))attackEnemy(g,e)});g.bullets=g.bullets.filter(s=>!overlap(box,{x:s.x-7,y:s.y-7,w:14,h:14}));event(g,'swing',p.x,p.y,p.avatar.color)}
  if(p.y>map.height+60){if(g.mode==='lobby')respawn(g,p,true);else hurt(g,p,p.x,true)}
  if(g.mode==='level'&&!p.down){
   touchCheckpoints(g,p);
   map.fuses.forEach((f,i)=>{if(g.fuses[i])return;const pl=solid[f.platform];if(overlap(p,{x:pl.x+f.offset-14,y:pl.y-f.yoff-14,w:28,h:28})){g.fuses[i]=true;for(const member of party){const key=g.level+':'+i;if(!member.claimed.includes(key)){member.claimed.push(key);member.wallet+=FUSE_POINTS;notice(g,member,'+'+FUSE_POINTS+' fuse points · '+member.wallet+' total · Spend them in Character Lab → Head Shop');}}event(g,'fuse',pl.x+f.offset,pl.y-f.yoff,'#ffd774')}});
   map.meds.forEach((m,i)=>{if(g.meds[i]||p.hp===3)return;const pl=solid[m.platform];if(overlap(p,{x:pl.x+m.offset-12,y:pl.y-30,w:24,h:30})){g.meds[i]=true;p.hp++;event(g,'heal',p.x,p.y,'#8ceeaf')}});
   for(const h of map.hazards){if(hazardStatus(g,h)==='active'&&overlap(p,hazardBounds(g,h)))hurt(g,p,hazardBounds(g,h).x,h.type==='flood')}
  }
  if((pressed&INPUT.USE)&&p.ladder<0&&p.grab<0&&!hadLadder)interact(g,p);
 }
 // Teammates are moving one-way platforms. A rider inherits carrier displacement,
 // including jumps and ladder travel, but can walk off or jump away independently.
 for(const rider of party){
  if(rider.down||rider.quiz||rider.passed||rider.ladder>=0||rider.slide>=0){rider.riding=null;continue}
  let carrier=party.find(p=>p.id===rider.riding&&!p.down&&!p.quiz&&!p.passed&&p.riding!==rider.id);
  if(rider.riding&&!carrier)rider.riding=null;
  if(carrier){const old=previous.get(carrier.id);rider.x+=carrier.x-old.x;rider.y+=carrier.y-old.y;if(rider.x+rider.w>carrier.x+2&&rider.x<carrier.x+carrier.w-2){rider.y=carrier.y-18-rider.h;rider.vy=0;rider.grounded=true;rider.platform=-1;rider.jumps=0;rider.coyote=.1}else{rider.riding=null;carrier=null}}
  if(!carrier&&rider.vy>=0){for(const base of party){if(base.id===rider.id||base.down||base.quiz||base.passed||base.riding===rider.id)continue;const a=previous.get(rider.id),b=previous.get(base.id),head=base.y-18;if(a.y+rider.h<=b.y-18+6&&rider.y+rider.h>=head&&rider.x+rider.w>base.x+2&&rider.x<base.x+base.w-2){rider.riding=base.id;rider.y=head-rider.h;rider.vy=0;rider.grounded=true;rider.platform=-1;rider.jumps=0;rider.coyote=.1;break}}}
 }
 for(const rider of party){if(!rider.riding)continue;if(walls.some(w=>overlap(rider,w))){const old=previous.get(rider.id);rider.x=old.x;rider.y=old.y;rider.riding=null;rider.grounded=false;rider.vy=0;}}
 if(g.mode!=='level')return;
 for(let i=0;i<map.relays.length;i++){
  const relay=g.relays[i];if(relay.open)continue;relay.timers=relay.timers.map(v=>Math.max(0,v-dt));const occupants=map.relays[i].plates.map(a=>{const box=plateBounds(g,a);return party.filter(p=>!p.down&&!p.quiz&&p.grounded&&overlap(p,box)).map(p=>p.id)});
  let ready=false;if(party.length===1){occupants.forEach((a,j)=>{if(a.length)relay.timers[j]=8});ready=relay.timers.every(t=>t>0)}else ready=occupants[0].some(a=>occupants[1].some(b=>a!==b));
  relay.hold=ready?relay.hold+dt:0;if(relay.hold>.55){relay.open=true;event(g,'relay',map.relays[i].gate.x,map.relays[i].gate.y,'#8bedbd');party.forEach(p=>notice(g,p,'Relay '+(i+1)+' synchronized. Gate latched open.'))}
 }
 for(const e of g.enemies){if(e.dead)continue;const pl=solid[e.platform];e.hit=Math.max(0,e.hit-dt);
  if(e.kind==='laser'){e.x=pl.x+pl.w/2-16;e.y=pl.y-e.h;laserTick(g,e,party,dt);}
  else if(e.kind==='walker'||e.kind==='charger'||e.kind==='hopper'){
   let speed=e.vx;
   if(e.kind==='charger'){e.cool-=dt;const target=party.find(p=>!p.down&&!p.quiz&&Math.abs(p.y-e.y)<100&&distance(p,e)<420);if(e.cool<=0&&target){e.face=target.x>e.x?1:-1;e.cool=2.4;e.dash=1.05;}if(e.dash>0){e.dash-=dt;speed=e.dash>.6?0:e.face*(270+g.map.difficulty*80);}else speed=e.vx;}
   e.x+=speed*dt;if(e.x<pl.x+5){e.x=pl.x+5;e.vx=Math.abs(e.vx);e.dash=0;}if(e.x+e.w>pl.x+pl.w-5){e.x=pl.x+pl.w-e.w-5;e.vx=-Math.abs(e.vx);e.dash=0;}
   e.y=pl.y-e.h-(e.kind==='hopper'?Math.max(0,Math.sin(g.mapTime*3+e.phase))*(105+g.map.difficulty*35):0);if(!e.dash)e.face=Math.sign(e.vx)||1;
  }else if(e.kind==='drone'){
   e.x=pl.x+pl.w*.5-16+Math.sin(g.mapTime*1.4+e.phase)*Math.max(55,pl.w*.33);e.y=pl.y-110+Math.sin(g.mapTime*2+e.phase)*35;e.face=Math.cos(g.mapTime*1.4+e.phase)>0?1:-1;e.cool-=dt;
   const target=party.find(p=>!p.down&&!p.quiz&&distance(p,e)<580);if(target&&e.cool<=0){const angle=Math.atan2(target.y+23-e.y-16,target.x+16-e.x-16);e.cool=3.1-g.map.difficulty*.6;g.bullets.push({id:++g.bulletId,x:e.x+16,y:e.y+16,vx:Math.cos(angle)*185,vy:Math.sin(angle)*185,life:3.5});}
  }else{e.y=pl.y-e.h;e.cool-=dt;const target=party.filter(p=>!p.down&&!p.quiz&&!p.passed&&Math.abs(p.y-e.y)<180).sort((a,b)=>distance(a,e)-distance(b,e))[0];if(target&&distance(target,e)<780){e.face=target.x>e.x?1:-1;if(e.cool<=0){e.cool=2.7-map.difficulty*.8;g.bullets.push({id:++g.bulletId,x:e.x+16,y:e.y+13,vx:e.face*(175+map.difficulty*65),vy:0,life:4})}}}
  for(const p of party){if(p.down||p.quiz||p.passed||!overlap(p,e))continue;if(p.vy>100&&p.y+p.h<e.y+21){attackEnemy(g,e);p.vy=-470;p.jumps=1}else if(p.attack>0)attackEnemy(g,e);else hurt(g,p,e.x+16)}
 }
 for(const b of g.bullets){b.x+=b.vx*dt;b.y+=(b.vy||0)*dt;b.life-=dt;for(const p of party)if(!p.down&&overlap(p,{x:b.x-6,y:b.y-6,w:12,h:12})){hurt(g,p,b.x);b.life=0}if([...solid,...walls].some(pl=>b.x>pl.x&&b.x<pl.x+pl.w&&b.y>pl.y&&b.y<pl.y+pl.h))b.life=0}
 g.bullets=g.bullets.filter(b=>b.life>0);if(party.length&&party.every(p=>p.down))g.phase='dead';checkClear(g);
}
export function snapshot(g){return{online:g.online,story:g.story,storySpeed:g.storySpeed,storySerial:g.storySerial,seenOpening:g.seenOpening,movable:g.movable,optics:g.optics,routeProgress:g.routeProgress,checkpoint:g.checkpoint,epoch:g.epoch,time:g.time,mapTime:g.mapTime,mode:g.mode,phase:g.phase,level:g.level,returnRoom:g.returnRoom,progress:g.progress,players:g.players,fuses:g.fuses,meds:g.meds,relays:g.relays,enemies:g.enemies,bullets:g.bullets,events:g.events}}
export function restoreSnapshot(s,previous){return{...s,map:previous&&previous.epoch===s.epoch&&previous.level===s.level?previous.map:s.mode==='lobby'?makeLobby():makeMap(s.level)}}
