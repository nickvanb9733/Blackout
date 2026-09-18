import test from 'node:test';import assert from 'node:assert/strict';import {Techno} from '../public/audio.js';
function parameter(){return{value:0,setValueAtTime(v){assert.ok(Number.isFinite(v));this.value=v},setTargetAtTime(v){assert.ok(Number.isFinite(v));this.value=v},linearRampToValueAtTime(v){assert.ok(Number.isFinite(v))},exponentialRampToValueAtTime(v){assert.ok(v>0&&Number.isFinite(v))}}}
class FakeAudioContext{
 constructor(){this.state='suspended';this.currentTime=1;this.sampleRate=48000;this.destination={};this.oscillators=0;this.noises=0;this.started=0}
 async resume(){this.state='running'}
 createGain(){return{gain:parameter(),connect(){}}}
 createDynamicsCompressor(){return{threshold:parameter(),ratio:parameter(),connect(){}}}
 createBiquadFilter(){return{frequency:parameter(),connect(){}}}
 createBuffer(n,length){return{getChannelData:()=>new Float32Array(length)}}
 createOscillator(){this.oscillators++;const c=this;return{frequency:parameter(),connect(){},start(t){assert.ok(t>=0);c.started++},stop(t){assert.ok(t>0)}}}
 createBufferSource(){this.noises++;return{connect(){},start(t){assert.ok(t>=0)},stop(t){assert.ok(t>0)}}}
}
test('Original techno scheduler builds rhythmic and melodic voices, changes rooms, controls volume, and mutes',async()=>{globalThis.window={AudioContext:FakeAudioContext};const music=new Techno();try{assert.equal(await music.enable(),true);for(let i=0;i<80;i++){music.ctx.currentTime=music.next;music.schedule()}assert.ok(music.ctx.oscillators>100);assert.ok(music.ctx.noises>60);music.setRoom(3);assert.equal(music.root,31);music.setVolume(.6);assert.equal(music.volume,.6);assert.equal(music.master.gain.value,.3);music.mute();assert.equal(music.enabled,false);assert.equal(music.timer,null);assert.equal(music.master.gain.value,0)}finally{music.mute();delete globalThis.window}});
