// Original procedural techno. No recordings, samples, external requests or licensed music assets.
export class Techno {
 constructor(){this.ctx=null;this.enabled=false;this.volume=.3;this.step=0;this.next=0;this.timer=null;this.root=36;this.room=0;this.suspended=false}
 async enable(){try{this.ctx??=new(window.AudioContext||window.webkitAudioContext)();await this.ctx.resume();if(!this.master){this.master=this.ctx.createGain();this.master.gain.value=this.volume*.5*(this.ducked?.18:1);const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=5;this.master.connect(compressor);compressor.connect(this.ctx.destination);this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate*.25,this.ctx.sampleRate);const d=this.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}this.enabled=true;this.next=this.ctx.currentTime+.05;this.step=0;if(!this.timer)this.timer=setInterval(()=>this.schedule(),25);this.master.gain.setTargetAtTime(this.volume*.5*(this.ducked?.18:1),this.ctx.currentTime,.08);return true}catch{return false}}
 setVolume(v){this.volume=Math.max(0,Math.min(1,v));if(this.master)this.master.gain.setTargetAtTime(this.enabled?this.volume*.5*(this.ducked?.18:1):0,this.ctx.currentTime,.08)}
 duck(value){if(this.ducked===value)return;this.ducked=value;this.setVolume(this.volume)}
 mute(){this.enabled=false;if(this.master)this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.05);clearInterval(this.timer);this.timer=null}
 toggle(){return this.enabled?(this.mute(),Promise.resolve(false)):this.enable()}
 setRoom(room){this.room=Math.max(0,room);this.root=[36,33,38,31,36,34,33,36][this.room%8]}
 tone(freq,t,duration,shape,volume,end,cutoff=4000){const c=this.ctx,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type=shape;o.frequency.setValueAtTime(freq,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+duration);f.type='lowpass';f.frequency.value=cutoff;g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(f);f.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02)}
 hiss(t,duration,volume,highpass){const s=this.ctx.createBufferSource(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();s.buffer=this.noise;f.type='highpass';f.frequency.value=highpass;g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);s.connect(f);f.connect(g);g.connect(this.master);s.start(t);s.stop(t+duration)}
 schedule(){if(!this.enabled||this.ctx.state!=='running')return;const c=this.ctx;if(this.next<c.currentTime-.2)this.next=c.currentTime+.03;while(this.next<c.currentTime+.12){const s=this.step%64,t=this.next,beat=s%16;
  if(beat%4===0){this.tone(155,t,.19,'sine',.8,44);this.hiss(t,.02,.12,4000)}
  if(beat===4||beat===12){this.hiss(t,.14,.25,1000);this.tone(185,t,.09,'triangle',.12,90)}
  if(s%2===0)this.hiss(t,.035,s%4===2?.13:.065,7500);if(s%16===14)this.hiss(t,.13,.08,6500);
  const bass=[0,0,7,0,0,10,7,3],offset=bass[Math.floor(s/2)%8];if(s%2===1){const f=440*Math.pow(2,(this.root+offset-69)/12);this.tone(f,t,.15,'sawtooth',.2,null,300+Math.sin(s*.3)*100)}
  const arp=[0,7,12,15,12,7,10,19];if(s%2===0&&this.room>=0){const f=440*Math.pow(2,(this.root+24+arp[(s/2)%8]-69)/12);this.tone(f,t,.16,'triangle',.065,null,2400);this.tone(f,t+.19,.1,'triangle',.015,null,1600)}
  this.step++;this.next+=60/124/4;
 }}
 fx(kind){if(!this.enabled||!this.ctx)return;const t=this.ctx.currentTime;if(kind==='fuse')this.tone(880,t,.18,'sine',.16,1320);else if(kind==='hit')this.tone(140,t,.15,'sawtooth',.12,65);else if(kind==='relay'||kind==='clear'||kind==='checkpoint')for(let i=0;i<3;i++)this.tone(440*Math.pow(2,[0,4,7][i]/12),t+i*.09,.23,'triangle',.14);else if(kind==='jump')this.tone(320,t,.07,'triangle',.035,450)}
}
