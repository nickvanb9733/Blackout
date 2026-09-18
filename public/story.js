import {SpeechMouth,speechPlan,samplePlan} from './lipsync.js';
// Fictional arcade campaign supplied by the game's creator, with G-man as the
// robotic antagonist. The company-name cliffhanger is also fictional.
const beat=(speaker,text,shot='control',status='',confirm=false)=>({speaker,text,shot,status,confirm,duration:Math.max(2.5,text.split(/\s+/).length*.38+.4)});
export const STORY=[
 {title:'02:17 — THE BLACKOUT',subtitle:'Opening · A fictional arcade story',beats:[
  beat('NARRATOR','At 2:17 AM, the network went dark. Cooling failed. Backup power vanished. G-man had breached the facility.','alarm','02:17 AM / CRITICAL SYSTEMS LOST'),
  beat('CONTROL','Hostile control detected. G-man has seized the Building Management System. Security doors locked.','blackout','G-MAN HAS ENTERED THE FACILITY'),
  beat('G-MAN','Good morning, technician. This facility is under new management. Do try not to trip over the consequences.','intrusion','G-MAN / CONTROL CLAIMED'),
  beat('NARRATOR','Trapped inside, you found a forgotten maintenance route and bypassed the compromised security doors.','escape','MAINTENANCE ROUTE / UNLISTED'),
  beat('TECHNICIAN','I found our crew. Everyone is out. But the building is dying. I am going back in.','rescue','CREW RESCUED / FACILITY OFFLINE'),
  beat('MAYA · REMOTE OPS','We will guide you by radio. Diagnose each fault. Restore power, cooling, and communications. If another technician joins you, work together.','radio','RECOVERY CREW / RADIO LINK ESTABLISHED'),
  beat('MAYA · REMOTE OPS','Start in Utility. Follow the route plaques, recover the fuses, and pass the exit checks. Let us reclaim our data center.','mission','UTILITY ACCESS / MISSION AUTHORIZED')
 ]},
 {title:'THE FIRST LIGHT',subtitle:'Utility complete · Emergency power',beats:[
  beat('CONTROL','Utility path recovered. Incoming power observations are available. The emergency system still did not respond as expected.','restore','UTILITY — ONLINE'),
  beat('MAYA · REMOTE OPS','Trace the one-line. Compare the transfer indications with generator conditions and control power. A running engine and a supplied load are not the same thing.','diagram','PHASE 1 / TRACE THE SOURCE'),
  beat('TECHNICIAN','The alarms do not tell the same story. Some equipment was disabled. Some was given a false command. I am recording what I can verify.','radio','OBSERVATIONS BEFORE ASSUMPTIONS'),
  beat('G-MAN','One light comes on and you think you have won? I have eight rooms full of rather unpleasant surprises.','intrusion','G-MAN / COUNTERMEASURES ARMED'),
  beat('CONTROL','Unauthorized control request blocked. G-man has moved deeper into the facility. Transformer access released.','intrusion','NEXT ROOM / TRANSFORMER')
 ]},
 {title:'THE HEAT',subtitle:'Transformer complete · Cooling investigation',beats:[
  beat('CONTROL','Transformer recovered. Lights are returning. Data hall temperature continues to rise.','heat','TRANSFORMER — ONLINE / TEMPERATURE RISING'),
  beat('MAYA · REMOTE OPS','G-man disabled cooling before shutting down the servers. Pumps, valves, CRAHs, chillers, sensors, and control signals all matter. The first alarm may only be a symptom.','heat','PHASE 2 / COOLING INVESTIGATION'),
  beat('G-MAN','A spot of conflicting information. Which reading will you believe? Do choose carefully.','intrusion','G-MAN / FALSE SENSOR DATA'),
  beat('TECHNICIAN','One sensor says freezing. The local display says overheating. I am comparing the readings, their timestamps, and the equipment state.','radio','FALSE SENSOR DATA DETECTED'),
  beat('MAYA · REMOTE OPS','That is the difference between guessing and diagnosing. Our outside crew is recovering cooling controls while you secure the electrical path. Switchgear is next.','restore','REMOTE CREW / COOLING RECOVERY IN PROGRESS')
 ]},
 {title:'THE ELECTRICAL MAZE',subtitle:'Switchgear complete · Configuration recovery',beats:[
  beat('CONTROL','Switchgear recovered. The original distribution records are accessible. The current configuration does not match.','diagram','SWITCHGEAR — ONLINE'),
  beat('TECHNICIAN','They did not just turn it off. They interrupted paths and changed control states. Every label and every indication needs to agree with the approved recovery plan.','diagram','PHASE 3 / THE ELECTRICAL MAZE'),
  beat('MAYA · REMOTE OPS','Our electrical team is reviewing the sequence. Do not treat an open breaker indicator as proof that equipment is safe. Keep diagnosing within your authorization.','radio','QUALIFIED CREW / RECOVERY REVIEW'),
  beat('G-MAN','You have found the prints. How terribly inconvenient. Let us see whether you can follow them.','intrusion','G-MAN / DISTRIBUTION TRAP'),
  beat('CONTROL','Generator route released. A hostile control signal is holding the standby source unavailable.','intrusion','NEXT ROOM / GENERATOR')
 ]},
 {title:'BACKUP BREATHES',subtitle:'Generator complete · Continuity',beats:[
  beat('CONTROL','Generator available. The false operating command has been isolated. Sustained backup capability is returning.','engine','GENERATOR — AVAILABLE'),
  beat('MAYA · REMOTE OPS','Good work. Mechanical, electrical, fuel, and controls observations all mattered. The loudest alarm was not the root cause.','engine','PHASE 1 / EMERGENCY SOURCE RECOVERED'),
  beat('TECHNICIAN','The UPS paths are still interrupted. We have a source, but continuity is not restored until the complete path is verified.','diagram','UPS RECOVERY / NEXT PRIORITY'),
  beat('G-MAN','That generator is making an awful racket. Perhaps I shall silence your monitoring instead.','intrusion','G-MAN / NETWORK ISOLATION'),
  beat('CONTROL','Cooling control channels responding. G-man is attempting to isolate the monitoring network.','intrusion','NEXT ROOM / UPS')
 ]},
 {title:'BLIND',subtitle:'UPS complete · Communications lost',beats:[
  beat('CONTROL','UPS normal. Battery and bypass observations available. All alarms cleared.','restore','UPS — NORMAL'),
  beat('MAYA · REMOTE OPS','Wait. They did not clear. We lost communication. The BMS shows hundreds of devices offline. We are blind.','blackout','PHASE 4 / MONITORING LOST'),
  beat('G-MAN','No alarms. No screens. No idea what is happening. Lovely and quiet, is it not?','intrusion','G-MAN / MONITORING DISABLED'),
  beat('TECHNICIAN','Local status still exists. We can separate missing power from a failed controller, a bad sensor, or a communication fault. I will work through the PDU section.','radio','LOCAL VERIFICATION / RADIO ACTIVE'),
  beat('MAYA · REMOTE OPS','Record what you actually see. Keep the data timestamps. We are rebuilding the monitoring path from this end.','diagram','NEXT ROOM / PDU')
 ]},
 {title:'A HUNDRED ALARMS',subtitle:'PDU complete · Monitoring returns',beats:[
  beat('CONTROL','Distribution recovered. Monitoring communication restored. Cooling normal. BMS online.','restore','PDU — ONLINE / BMS — ONLINE'),
  beat('NARRATOR','The control room screens illuminate. Hundreds of alarms appear at once. G-man was not finished.','alarm','ALARM FLOOD / CORRELATE EVENTS'),
  beat('G-MAN','Oh, you wanted your alarms back? Have the whole lot. Try finding the real fault in that.','intrusion','G-MAN / ALARM FLOOD'),
  beat('MAYA · REMOTE OPS','Group the causes and symptoms. Stable power, working cooling, current monitoring. Now we can recover the halls one by one.','diagram','PHASE 5 / DATA HALL RECOVERY'),
  beat('CONTROL','First hall readiness checks complete. Recovery: twenty-five percent. Remote Power Panel access released.','halls','DATA HALL RECOVERY / 25%')
 ]},
 {title:'THE LAST AISLE',subtitle:'RPP complete · The final isolation',beats:[
  beat('CONTROL','Remote panels recovered. Second hall readiness confirmed. Recovery: fifty percent.','halls','RPP — ONLINE / RECOVERY 50%'),
  beat('MAYA · REMOTE OPS','Verify each hall separately. Electrical conditions, cooling, redundancy, and active faults. The third hall is ready. Seventy-five percent.','halls','DATA HALL RECOVERY / 75%'),
  beat('NARRATOR','Just before the final hall comes online, everything stops. The automated control system reveals itself.','intrusion','G-MAN CONTROL CORE / FINAL SECTION ISOLATED'),
  beat('G-MAN','Welcome to my control core. Every system. Every distraction. You will not recover the final hall.','intrusion','G-MAN / LAST STAND'),
  beat('MAYA · REMOTE OPS','This is every system at once. Electrical, cooling, controls, networking, and safety. Find the causes. Separate the symptoms. Ignore the distractions. We are with you.','mission','FINAL MISSION / G-MAN’S LAST STAND')
 ]},
 {title:'RECLAIM THE DATA CENTER',subtitle:'Finale · G-man’s Last Stand',beats:[
  beat('TECHNICIAN','The final faults are identified. The team has verified the recovered paths. Generator available. UPS normal. Cooling normal. BMS online. Data halls ready.','restore','GENERATOR ✓ / UPS ✓ / COOLING ✓ / BMS ✓'),
  beat('MAYA · REMOTE OPS','You made it to the main control room. The crew has completed the readiness checks. There is one final command.','control','RESTORE FACILITY?'),
  beat('CONTROL','Restore facility? Awaiting technician confirmation.','confirm','RESTORE FACILITY? / YES',true),
  beat('G-MAN','Hang on. That command is not yours. Stop that! I am still in control of this facility!','intrusion','G-MAN / OVERRIDE REJECTED'),
  beat('NARRATOR','You press it. Light sweeps across the data halls. Cooling equipment roars back to life. The verified distribution paths return. Servers begin booting.','reboot','RESTORING / 87% → 94% → 99%'),
  beat('G-MAN','That is quite enough. Restore my connection at once. Technician? Technician!','defeat','G-MAN / CONNECTION TERMINATING'),
  beat('CONTROL','One hundred percent. Facility operational. Intrusion detected. Source: G-man. Connection terminated.','victory','100% / FACILITY OPERATIONAL'),
  beat('MAYA · REMOTE OPS','You did it! You got us out. You found the failures. You brought an entire data center back from the dead. Listen to them out here. The whole crew is cheering.','celebrate','RECOVERY CREW / ALL SYSTEMS ONLINE'),
  beat('NARRATOR','For a moment, the control room is silent. Then, one final notification appears.','blackout','INCOMING CONNECTION REQUEST…'),
  beat('CONTROL','Microsoft. Accept?','sequel','MICROSOFT / ACCEPT?'),
  beat('NARRATOR','To be continued.','sequel','TO BE CONTINUED…')
 ]}
];
export const storyBeat=s=>STORY[s.chapter].beats[s.beat];
export const CAST={
 technician:{id:'technician',name:'TECHNICIAN',role:'Facility recovery',color:'#77dfbe',pitch:.94,rate:.96},
 maya:{id:'maya',name:'MAYA',role:'Remote operations',color:'#c3a3f2',pitch:1.04,rate:.98},
 eli:{id:'eli',name:'ELI',role:'Shift lead / narrator',color:'#efc27a',pitch:.86,rate:.95},
 control:{id:'control',name:'C0-R3',role:'Facility control',color:'#8bdded',pitch:.79,rate:.91},
 gman:{id:'gman',name:'G-MAN',role:'Rogue siege automaton',color:'#ff667e',pitch:.8,rate:.95}
};
export function castFor(speaker){return speaker==='G-MAN'?CAST.gman:speaker==='CONTROL'?CAST.control:speaker.startsWith('MAYA')?CAST.maya:speaker==='NARRATOR'?CAST.eli:CAST.technician;}
export function expressionFor(shot,speaker){if(shot==='defeat')return'panic';if(['celebrate','victory','rescue'].includes(shot))return'happy';if(speaker==='G-MAN')return'taunt';if(['alarm','heat','blackout'].includes(shot))return'worried';return'focused';}
const speechNow=()=>typeof performance!=='undefined'?performance.now()/1000:Date.now()/1000;
export function captionSpeech(s){
 if(!s||!s.playing||s.paused||s.waiting)return{active:false,shape:'rest',open:0};
 const b=storyBeat(s),plan=speechPlan(b.text),scale=Math.max(1,b.duration-1.2)/Math.max(.1,plan.duration);
 return{...samplePlan(plan,s.elapsed,scale),cast:castFor(b.speaker).id,mode:'caption'};
}
export class StoryVoice{
 constructor(){this.enabled=true;this.key='';this.generation=0;this.available=typeof window!=='undefined'&&!!window.speechSynthesis&&typeof window.SpeechSynthesisUtterance==='function';this.volume=.9;this.state='idle';this.ukVoice=false;this.voiceName='';this.now=speechNow;this.paces=new Map();this.mouth=null;}
 sceneKey(s){return(s.id??0)+':'+s.chapter+':'+s.beat;}
 stop(){this.generation++;this.mouth?.end();if(this.available){window.speechSynthesis.cancel();window.speechSynthesis.resume?.();}this.key='';this.state='idle';this.utterance=null;}
 voices(){return this.available?window.speechSynthesis.getVoices().filter(v=>/^en[-_]GB$/i.test(v.lang)):[];}
 selectVoice(cast){const voices=this.voices(),names=cast==='maya'?['Sonia','Hazel','Serena','Susan','Kate']:cast==='gman'?['Daniel','Ryan','George','Arthur']:cast==='eli'?['George','Arthur','Ryan','Daniel']:cast==='control'?['Oliver','George','Daniel']:['Ryan','Oliver','Daniel','George'];return names.map(n=>voices.find(v=>v.name.toLowerCase().includes(n.toLowerCase()))).find(Boolean)||voices[cast==='maya'?Math.min(1,voices.length-1):0]||null;}
 freeze(){if(!['speaking','pending'].includes(this.state))return;this.beforePause=this.state;this.state='paused';this.pausedAt=this.now();this.mouth?.pause(this.pausedAt);}
 thaw(){if(this.state!=='paused')return;this.queuedAt+=this.now()-this.pausedAt;this.mouth?.resume(this.now());this.state=this.beforePause;}
 update(s){
  if(!s||!s.playing||!this.enabled){if(this.key)this.stop();return;}
  const key=this.sceneKey(s);
  if(s.waiting){if(this.key===key&&['speaking','pending','paused'].includes(this.state)){this.generation++;this.mouth?.end();if(this.available){window.speechSynthesis.cancel();window.speechSynthesis.resume?.();}this.state='ended';}return;}
  if(s.paused){if(this.key===key&&this.available&&['speaking','pending'].includes(this.state)){this.freeze();window.speechSynthesis.pause?.();}return;}
  if(key===this.key){if(this.state==='paused'){this.thaw();window.speechSynthesis.resume?.();}if(this.state==='pending'&&this.now()-this.queuedAt>4){this.generation++;window.speechSynthesis.cancel();this.mouth?.end();this.state='error';}return;}
  this.stop();this.key=key;if(!this.available){this.state='unavailable';return;}
  const b=storyBeat(s),cast=castFor(b.speaker),u=new window.SpeechSynthesisUtterance(b.text),generation=this.generation;
  u.lang='en-GB';u.voice=this.selectVoice(cast.id);u.rate=cast.rate*(s.speed||1);u.pitch=cast.pitch;u.volume=this.volume;this.ukVoice=!!u.voice;this.voiceName=u.voice?.name||'British English system voice';this.state='pending';this.queuedAt=this.now();this.utterance=u;
  const paceKey=u.voice?.voiceURI||u.voice?.name||'en-GB-system';this.mouth=new SpeechMouth(b.text,u.rate,this.paces.get(paceKey)||1);
  const valid=()=>this.generation===generation&&this.key===key;
  u.onstart=()=>{if(!valid())return;if(this.state==='paused')this.beforePause='speaking';else this.state='speaking';this.mouth.start(this.now());};
  u.onboundary=e=>{if(!valid()||this.state!=='speaking')return;if(this.mouth.boundary(e,this.now()))this.paces.set(paceKey,this.mouth.pace);};
  u.onpause=()=>{if(valid())this.freeze();};u.onresume=()=>{if(valid())this.thaw();};
  u.onend=()=>{if(valid()){this.mouth.end();this.state='ended';}};u.onerror=()=>{if(valid()){this.mouth.end();this.state='error';}};
  try{window.speechSynthesis.speak(u);}catch{this.mouth.end();this.state='error';}
 }
 finished(s){return !this.enabled||!this.available||(this.key===this.sceneKey(s)&&['ended','error','unavailable'].includes(this.state));}
 sample(s){
  if(!s||s.paused||!s.playing||s.waiting)return{active:false,shape:'rest',open:0};
  if(!this.enabled||!this.available||this.state==='error')return captionSpeech(s);
  if(this.key!==this.sceneKey(s)||this.state!=='speaking')return{active:false,shape:'rest',open:0};
  return{...this.mouth.sample(this.now()),cast:castFor(storyBeat(s).speaker).id};
 }
 status(){if(!this.available)return'Voice unavailable on this device · captions remain on.';if(!this.enabled)return'Voice muted · British English';if(this.state==='error')return'Voice could not start. Use RETRY VOICE.';return this.ukVoice?'British voice: '+this.voiceName:'British English requested · Install an English (United Kingdom) speech voice if your device uses another accent.';}
}
