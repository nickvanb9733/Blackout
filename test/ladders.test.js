import test from 'node:test';
import assert from 'node:assert/strict';
import {INPUT,createGame,addPlayer,startMap,tick,geom,respawn,snapshot,restoreSnapshot} from '../public/core.js';

function setup(two=false){
 const g=createGame(40,two),a=addPlayer(g,'a','Alice'),b=two?addPlayer(g,'b','Bob'):null;startMap(g,0);
 g.enemies=[];g.map.hazards=[];g.relays.forEach(r=>r.open=true);g.optics.forEach(o=>o.solved=true);g.routeProgress=g.map.platforms.length-1;
 const l=g.map.ladders[0];l.motion=null;
 Object.assign(a,{x:l.x+5,y:l.y+l.h/2,vx:0,vy:160,grounded:false,platform:-1});
 return{g,a,b,l};
}
const step=(g,p,held=0,pressed=0)=>tick(g,{[p.id]:{held,pressed}},1/60);

test('Contact catches a falling player, and idle or E input does not release the ladder',()=>{
 const{g,a}=setup();step(g,a);assert.equal(a.ladder,0);assert.equal(a.vy,0);
 const y=a.y;for(let i=0;i<60;i++)step(g,a,i<30?INPUT.USE:0);
 assert.equal(a.ladder,0);assert.equal(a.y,y);assert.equal(a.hp,3);
});

test('Jump detaches once, keeps an air jump, and will not recatch the same ladder until clear',()=>{
 const{g,a,l}=setup();step(g,a);const y=a.y;
 step(g,a,INPUT.JUMP,INPUT.JUMP);assert.equal(a.ladder,-1);assert.equal(a.jumps,1);assert.ok(a.y<y);assert.ok(a.vy<-500);
 for(let i=0;i<24;i++){step(g,a,INPUT.JUMP);assert.equal(a.ladder,-1);}
 assert.equal(a.ladderBlock,0,'still overlapping the shaft after the short lock expires');
 step(g,a,0);step(g,a,INPUT.JUMP,INPUT.JUMP);assert.equal(a.jumps,2);assert.ok(a.vy<-600);assert.equal(a.ladder,-1);
 a.x=l.x+160;step(g,a);assert.equal(a.ladderBlock,-1);
 for(let i=0;i<20;i++)step(g,a); // Clear the brief release cooldown before returning.
 Object.assign(a,{x:l.x+5,y:l.y+l.h/2,vy:100});step(g,a);assert.equal(a.ladder,0,'returning contact can catch again');
 respawn(g,a,true);assert.equal(a.ladder,-1);assert.equal(a.ladderBlock,-1);assert.equal(a.ladderLock,0);
});

test('A jump pressed on initial contact remains a normal jump',()=>{
 const{g,a}=setup();a.jumps=0;step(g,a,INPUT.JUMP,INPUT.JUMP);
 assert.equal(a.ladder,-1);assert.equal(a.jumps,1);assert.ok(a.vy<-600);
 for(let i=0;i<12;i++){step(g,a,INPUT.JUMP);assert.equal(a.ladder,-1);}
});

test('Ladder docks let players stand safely and reverse direction without moving away',()=>{
 for(const top of [true,false]){
  const{g,a,l}=setup();a.y=top?l.y-a.h+2:l.y+l.h-a.h-2;
  step(g,a,top?INPUT.UP:INPUT.DOWN);assert.equal(a.ladder,-1);
  for(let i=0;i<40;i++)step(g,a);
  assert.equal(a.grounded,true);assert.equal(a.ladder,-1);assert.equal(a.hp,3);
  const y=a.y;step(g,a,top?INPUT.DOWN:INPUT.UP);
  assert.equal(a.ladder,0);assert.ok(top?a.y>y:a.y<y);
 }
});

test('A moving ladder carries a head-riding teammate; either player can jump off independently',()=>{
 const{g,a,b,l}=setup(true);l.motion='x';step(g,a);
 Object.assign(b,{x:a.x,y:a.y-18-b.h,vx:0,vy:0,grounded:true,platform:-1,riding:a.id});
 const start=b.x;
 for(let i=0;i<30;i++)step(g,a,INPUT.UP);
 assert.equal(a.ladder,0);assert.equal(b.riding,a.id);assert.equal(b.ladder,-1);assert.ok(Math.abs(b.x-start)>3);
 assert.ok(Math.abs(b.y+b.h-(a.y-18))<.01);
 step(g,b,INPUT.JUMP|INPUT.LEFT,INPUT.JUMP);assert.equal(b.riding,null);assert.equal(b.ladder,-1);assert.ok(b.vy<0);
 step(g,a,INPUT.JUMP|INPUT.RIGHT,INPUT.JUMP);assert.equal(a.ladder,-1);assert.equal(a.jumps,1);
 const peer=restoreSnapshot(structuredClone(snapshot(g)));
 assert.equal(peer.players[0].ladderBlock,a.ladderBlock);assert.equal(peer.players[0].ladderLock,a.ladderLock);
 assert.equal(geom(peer.map.ladders[0],peer.mapTime).x,geom(l,g.mapTime).x);
});

test('Automatic ladder capture does not steal a rail-platform grab or a teammate revival',()=>{
 const{g,a,b,l}=setup(true),rail=g.map.platforms[1];
 rail.track={x:180,y:0,call:0};g.movable[rail.id]={value:0,owner:null};
 Object.assign(a,{x:rail.x+30,y:rail.y-a.h,grounded:true,platform:rail.id});
 Object.assign(l,{x:a.x,y:a.y-100,w:42,h:300});
 step(g,a,INPUT.USE|INPUT.RIGHT);assert.equal(a.grab,rail.id);assert.equal(a.ladder,-1);
 // With no rail nearby, E remains available for the downed partner.
 rail.track=null;g.movable={};Object.assign(a,{x:l.x,y:l.y+30,grab:-1,grounded:false});
 Object.assign(b,{x:a.x+35,y:a.y,down:true,hp:0});
 for(let i=0;i<85;i++)step(g,a,INPUT.USE);
 assert.equal(b.down,false);assert.equal(b.hp,2);
});
