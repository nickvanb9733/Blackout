import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,addPlayer,startMap,enterLobby,tick,command,platformAt,hurt,interact,questionFor,snapshot,restoreSnapshot} from '../public/core.js';
const setup=(id=0,two=false)=>{const g=createGame(40,two),a=addPlayer(g,'a','Alice'),b=two?addPlayer(g,'b','Bob'):null;startMap(g,id);return{g,a,b};};
function land(g,p,c,ordered=true){const pl=platformAt(g,c.platform);if(ordered)g.routeProgress=c.platform-1;Object.assign(p,{x:pl.x+pl.w/2-16,y:pl.y-p.h-1,vx:0,vy:90,grounded:false,inv:3});tick(g,{},1/60);}

test('Every level has two ordered, stationary, hazard-free checkpoint landings',()=>{
 for(let id=0;id<40;id++){const{g,a,b}=setup(id,true);assert.equal(g.map.checkpoints.length,2);
  assert.ok(g.map.checkpoints[1].platform-g.map.checkpoints[0].platform>=2);
  for(const c of g.map.checkpoints){const pl=g.map.platforms[c.platform];assert.equal(pl.type,'normal');assert.ok(!pl.motion&&!pl.track);assert.ok(!g.map.enemies.some(e=>e.platform===c.platform));assert.ok(!g.map.hazards.some(h=>h.platform===c.platform));assert.ok(!g.map.optics.some(o=>o.platform===c.platform||o.gatePlatform===c.platform));
   a.hp=b.hp=1;land(g,a,c);assert.equal(g.checkpoint.id,c.id);assert.equal(a.checkpoint,c.id);assert.equal(b.checkpoint,c.id);assert.equal(a.hp,3);assert.equal(b.hp,3);
   for(const p of [a,b]){assert.ok(p.safeX>=pl.x&&p.safeX+p.w<=pl.x+pl.w);assert.equal(p.safeY+p.h,pl.y);}
  }
 }
});

test('Skipped route platforms cannot activate a checkpoint or move a respawn forward',()=>{const{g,a}=setup(0);land(g,a,g.map.checkpoints[1],false);assert.equal(g.checkpoint,null);assert.equal(a.safeX,g.map.spawn.x);assert.equal(a.checkpoint,-1);});

test('Falling returns to the checkpoint; a solo wipe resumes with objectives and currency intact',()=>{
 const{g,a}=setup(4),c=g.map.checkpoints[0];land(g,a,c);g.fuses=[true,true,false];g.relays[0].open=true;g.optics[0].solved=true;g.routeProgress=c.platform+1;a.wallet=20;a.claimed=['4:0','4:1'];const sx=a.safeX,sy=a.safeY;
 a.y=g.map.height+200;a.hp=3;hurt(g,a,a.x,true);assert.equal(a.x,sx);assert.equal(a.y,sy);assert.equal(a.hp,2);
 a.inv=0;a.hp=1;hurt(g,a,a.x);assert.equal(g.phase,'dead');assert.equal(command(g,a,'retry'),true);assert.equal(g.phase,'active');assert.equal(a.x,sx);assert.equal(a.y,sy);assert.equal(a.hp,3);assert.equal(a.inv,3);assert.deepEqual(g.fuses,[true,true,false]);assert.equal(g.relays[0].open,true);assert.equal(g.optics[0].solved,true);assert.equal(g.routeProgress,c.platform+1);assert.equal(a.wallet,20);assert.deepEqual(a.claimed,['4:0','4:1']);
 const remote=restoreSnapshot(structuredClone(snapshot(g)));assert.deepEqual(remote.checkpoint,g.checkpoint);assert.deepEqual(remote.map.checkpoints,g.map.checkpoints);
});

test('Co-op checkpoint revival, host-only team retry, and disconnect fallback preserve safe spawns',()=>{
 const{g,a,b}=setup(12,true);land(g,a,g.map.checkpoints[0]);a.hp=b.hp=1;a.inv=b.inv=0;hurt(g,a,a.x);assert.equal(g.phase,'active');hurt(g,b,b.x);assert.equal(g.phase,'dead');assert.equal(command(g,b,'retry',{},false),false);assert.equal(command(g,a,'retry'),true);for(const p of [a,b]){assert.equal(p.down,false);assert.equal(p.hp,3);assert.equal(p.x,p.safeX);}assert.notEqual(a.x,b.x);
 b.connected=false;a.hp=1;a.inv=0;hurt(g,a,a.x);command(g,a,'retry');assert.equal(a.down,false);assert.equal(a.checkpoint,0);
});

test('Wrong quiz answers still return that player to the entrance until a checkpoint is reached again',()=>{
 const{g,a}=setup(0),c=g.map.checkpoints[1];land(g,a,c);g.fuses.fill(true);g.relays.forEach(r=>r.open=true);g.routeProgress=g.map.platforms.length-1;Object.assign(a,{x:g.map.exit.x+18,y:g.map.exit.y+g.map.exit.h-a.h});interact(g,a);const q=questionFor(g,a);command(g,a,'answer',{choice:(q.correct+1)%4,nonce:q.nonce});assert.equal(a.checkpoint,-1);assert.equal(a.x,g.map.spawn.x);command(g,a,'retry');assert.equal(a.x,g.map.spawn.x,'retry cannot undo the quiz penalty');land(g,a,c);assert.equal(a.checkpoint,1);assert.notEqual(a.safeX,g.map.spawn.x);
});

test('Checkpoints cannot be farmed for health, and an explicit level restart clears them',()=>{const{g,a}=setup(0);land(g,a,g.map.checkpoints[0]);a.hp=1;land(g,a,g.map.checkpoints[0]);assert.equal(a.hp,1);command(g,a,'restartLevel');assert.equal(g.checkpoint,null);assert.equal(a.checkpoint,-1);assert.equal(a.x,g.map.spawn.x);assert.ok(g.fuses.every(v=>!v));land(g,a,g.map.checkpoints[0]);enterLobby(g);assert.equal(g.checkpoint,null);});
