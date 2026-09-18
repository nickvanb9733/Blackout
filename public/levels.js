// Forty authored routes. Coordinates are platform centers/top surfaces, not a row generator.
// J = jump; L = ladder; M = moving ladder; G = hand-operated gantry; S = clear slide chute.
const D=(name,scenario,points,links={},extra={})=>({name,scenario,points,links,...extra});
export const DESIGNS=[
 D('Storm Yard','Climb broken feeder pylons above the flooded yard.',[[210,1120,260],[500,1040,200],[780,920,180],[1050,1050,190],[1320,880,170],[1320,440,240],[1040,340,180],[760,460,180],[470,340,200],[210,220,260]],{4:'M'}),
 D('Transmission Towers','A high traverse connects two narrow vertical towers.',[[220,1340,260],[480,1180],[240,1010],[490,830],[490,390,240],[780,300],[1070,410],[1330,290],[1580,460],[1580,900,240],[1850,1060],[2090,900,260]],{3:'L',8:'M'}),
 D('Floodgate Runoff','Descend the runoff chute, then climb out of the submerged service pit.',[[200,260,260],[480,360,200],[1010,770,240],[1290,650],[1560,790],[1820,600],[1820,1040,240],[1540,1170],[1270,1050],[990,1200,260]],{1:'S',5:'L'}),
 D('Feeder Ferry','Grab the orange rail carriage and ferry yourself over a severed feed.',[[200,1080,260],[490,950],[780,800,150],[1370,800,200],[1650,660],[1910,810],[2170,650],[2170,220,240],[1880,320],[1600,200,260]],{2:'G',6:'M'}),
 D('Lightning Crown','Circle the storm crown; the exit is beneath the starting tower.',[[210,1020,260],[450,850],[700,680],[970,510],[1250,680],[1500,520],[1780,680],[1780,1120,240],[1500,1250],[1210,1120],[910,1260],[620,1430],[300,1370,260]],{6:'L'}),
 D('Copper Corkscrew','Wind around alternating copper columns to reach the top coil.',[[230,1620,260],[510,1450],[780,1290],[530,1120],[260,950],[530,770],[810,600],[540,430],[270,270],[570,160,260]]),
 D('Magnetic Gantry','Reposition two rail carriages across the empty core.',[[220,1150,260],[500,980],[780,810,150],[1380,810,210],[1650,650],[1920,810],[1920,1250,240],[1640,1390,150],[1040,1390,210],[770,1240],[490,1390,260]],{2:'G',5:'M',7:'G'}),
 D('Oil-Recovery Chute','Take the dedicated drain slide into the oil containment vault.',[[210,250,260],[490,380,210],[1040,790,260],[1320,960],[1600,800],[1850,980],[2130,810],[2130,1250,240],[1840,1390],[1560,1240,260]],{1:'S',6:'L'}),
 D('Split-Core Towers','Climb one core, cross the top, and descend the second.',[[240,1320,260],[490,1150],[250,970],[510,790],[250,610],[510,430],[790,280],[1070,420],[1340,590],[1090,770],[1350,950],[1090,1130],[1390,1280,260]]),
 D('Winding Needlework','Small coil caps and a moving bridge demand controlled double jumps.',[[240,1390,260],[520,1220],[800,1050],[1080,1210],[1360,1040],[1360,600,240],[1080,460],[800,610],[520,430],[250,270],[540,150,260]],{4:'M'}, {lifts:[2,7]}),
 D('Sightline Gallery','Targeting sentries track, lock, then fire. Move after the lock.',[[230,1000,260],[510,870],[790,1030],[1070,860],[1350,1020],[1620,850],[1900,1010],[2170,850],[2170,410,240],[1890,280],[1600,420,260]],{7:'L'},{enemy:'laser'}),
 D('Relay Diamond','A diamond around the protection core leads to a lower control vault.',[[210,1020,260],[480,850],[750,680],[1020,510],[1290,340],[1570,510],[1840,680],[1560,850],[1290,1020],[1020,1180],[740,1340],[440,1270,260]]),
 D('Busbar Transfer','Pull the bus carriage into reach of the upper switch bay.',[[220,1260,260],[500,1090],[780,930,150],[1380,930,200],[1640,760],[1900,590],[1650,420],[1380,250],[1100,400],[810,250,260]],{2:'G'},{enemy:'laser',lifts:[5]}),
 D('Arc-Timing Atrium','Cross small insulated islands while arc vents cycle out of phase.',[[220,1340,260],[500,1180],[770,1010],[1040,840],[1310,1010],[1580,840],[1850,670],[1580,500],[1310,330],[1030,490],[750,330,260]],{}, {hazard:'arc',lifts:[3,7]}),
 D('Protection Labyrinth','Loop through the lower vault and finish above the entrance.',[[250,990,260],[520,1160],[800,1320],[1080,1150],[1360,980],[1640,1150],[1910,980],[1910,540,240],[1640,390],[1360,550],[1080,390],[800,550],[520,390],[250,220,260]],{6:'M'},{enemy:'laser'}),
 D('Crankshaft Crossing','Counter-running belts feed a climb through the engine frames.',[[220,1100,260],[490,950],[770,1100],[1050,940],[1330,1100],[1610,930],[1880,1100],[1880,660,240],[1600,490],[1310,650],[1020,480,260]],{6:'L'},{belts:[1,3,5,8]}),
 D('Piston Timing','Oscillating piston heads form a rising precision staircase.',[[210,1680,260],[490,1510],[770,1340],[490,1170],[770,1000],[1050,830],[770,660],[1050,490],[1330,320],[1620,200,260]],{}, {lifts:[1,3,5,7]}),
 D('Exhaust Chimney','Ride a moving ladder, then zigzag between steam vents.',[[230,1680,260],[510,1530],[510,1080,240],[800,910],[520,740],[800,570],[1080,740],[1360,570],[1080,400],[1360,230],[1660,360,260]],{1:'M'},{hazard:'steam'}),
 D('Fuel-Spill Escape','A one-way evacuation chute crosses the burning spill basin.',[[230,520,260],[510,350],[800,240,200],[1370,690,260],[1640,860],[1910,700],[2180,880],[1910,1050],[1640,1220],[1340,1370,260]],{2:'S'},{hazard:'fire',enemy:'charger'}),
 D('Flywheel Loop','Circle the flywheel on moving teeth, then return through its lower rim.',[[220,1030,260],[500,860],[780,690],[1060,520],[1340,350],[1620,520],[1900,690],[2170,860],[1900,1030],[1620,1200],[1340,1370],[1060,1210],[770,1370,260]],{}, {lifts:[2,6,10],belts:[4,8]}),
 D('Battery Skyline','Leap between cell stacks of alternating heights.',[[210,1420,260],[490,1250],[770,1080],[1050,1250],[1320,1080],[1050,910],[1320,740],[1590,910],[1860,740],[1590,570],[1860,400],[2150,240,260]],{}, {enemy:'hopper'}),
 D('Continuity Shuttle','Two movable shuttles restore a broken bypass route.',[[220,1200,260],[500,1030,150],[1100,1030,210],[1380,860],[1660,1030],[1940,860,150],[2540,860,210],[2540,420,240],[2250,250],[1970,400,260]],{1:'G',5:'G',6:'L'},{enemy:'laser'}),
 D('Cellar Bypass','Drop below the battery bank, then climb a separate return shaft.',[[240,260,260],[520,420],[800,580],[1080,740],[1360,900],[1640,1060],[1920,1220],[2190,1060],[2470,890],[2470,440,240],[2190,270],[1900,120,260]],{8:'M'},{hazard:'steam'}),
 D('Ride-Through Rhythm','Small moving battery trays require successive timed landings.',[[230,1570,260],[510,1400],[790,1230],[1070,1060],[790,890],[510,720],[790,550],[1070,380],[1350,550],[1630,380],[1920,220,260]],{}, {lifts:[1,3,5,7,9],enemy:'hopper'}),
 D('Battery Vault Sentry','A descending vault chute leads into a guarded return climb.',[[220,230,260],[500,380,210],[1090,850,260],[1370,1020],[1650,850],[1920,680],[1650,510],[1920,340],[2200,510],[2480,340,260]],{1:'S'},{enemy:'laser'}),
 D('Distribution Fan-Out','Follow the cable fan outward and curl back under the central PDU.',[[220,1110,260],[500,940],[780,770],[1060,600],[1340,430],[1620,600],[1900,770],[2180,600],[2460,770],[2180,940],[1900,1110],[1620,1280],[1340,1450],[1040,1290,260]]),
 D('Phase-Rail Workshop','Move both distribution carriages; one travels left, the other right.',[[220,1290,260],[500,1120],[780,950,150],[1380,950,210],[1660,780],[1940,950],[1940,510,240],[1660,350,150],[1060,350,210],[770,200,260]],{2:'G',5:'M',7:'G'}),
 D('Load-Balance Steps','Belts and narrow alternating ledges punish rushed landings.',[[220,1640,260],[500,1470],[780,1300],[1060,1130],[1340,960],[1060,790],[780,620],[1060,450],[1340,280],[1630,430,260]],{}, {belts:[2,4,6,8],enemy:'charger'}),
 D('Suspended Busway','A high cable route reverses into a lower suspended catwalk.',[[220,1030,260],[500,860],[780,690],[1060,520],[1340,350],[1620,520],[1900,350],[2190,520],[2190,960,240],[1900,1120],[1620,950],[1340,1120],[1040,1280,260]],{7:'M'},{lifts:[2,5,10],enemy:'laser'}),
 D('Underfloor Spillway','Slide beneath the distribution deck and re-emerge on the far side.',[[220,500,260],[500,340],[790,240,210],[1390,730,260],[1670,900],[1950,1070],[2230,900],[2500,730],[2500,290,240],[2210,160,260]],{2:'S',7:'L'},{hazard:'flood'}),
 D('Branch-Circuit Crown','Eight small branch ledges arc around the remote panel.',[[210,1330,260],[490,1160],[770,990],[1050,820],[1330,650],[1610,480],[1890,310],[2170,480],[2450,650],[2170,820],[1890,990],[1600,1160,260]],{}, {enemy:'hopper'}),
 D('Remote Service Elevator','A rail platform crosses the shaft to its moving ladder.',[[220,1520,260],[500,1350],[780,1180,150],[1380,1180,210],[1380,740,240],[1660,570],[1940,400],[1660,230],[1380,400],[1090,230,260]],{2:'G',3:'M'},{enemy:'laser'}),
 D('Circuit Catacombs','Descend a staggered circuit maze and finish below the entry.',[[210,200,260],[490,370],[770,540],[1050,710],[1330,880],[1050,1050],[770,1220],[1050,1390],[1330,1560],[1610,1390],[1900,1550,260]],{}, {lifts:[2,6],hazard:'arc'}),
 D('Scanner Switchbacks','Lasers guard alternating switchbacks; break sightlines between bursts.',[[230,1760,260],[510,1590],[790,1420],[510,1250],[790,1080],[1070,910],[790,740],[1070,570],[1350,400],[1070,230],[1370,110,260]],{}, {enemy:'laser',lifts:[4,8]}),
 D('Last-Panel Crossfeed','Reposition the crossfeed bridge before a final run of tiny islands.',[[220,1340,260],[500,1170],[780,1000],[1060,830,150],[1660,830,210],[1940,660],[2220,490],[1940,320],[1660,150],[1370,300,260]],{3:'G'},{enemy:'charger',lifts:[1,6]}),
 D('Cold-Aisle Rooftops','Rooftop fan islands mix air lift with precise mid-air corrections.',[[220,1670,260],[500,1500],[780,1330],[1060,1160],[780,990],[1060,820],[1340,650],[1620,480],[1340,310],[1640,150,260]],{}, {fans:[2,5],enemy:'drone'}),
 D('Firewall Gauntlet','Cross laser sightlines, then loop beneath the security rack.',[[220,1130,260],[500,960],[780,790],[1060,620],[1340,450],[1620,620],[1900,790],[2180,960],[1900,1130],[1620,1300],[1340,1470],[1050,1310,260]],{}, {enemy:'laser',lifts:[2,6,9]}),
 D('Cable-Tray Needle','Tiny cable trays and two hand-cranked gaps form a high precision route.',[[230,1660,260],[510,1490],[790,1320,150],[1390,1320,210],[1670,1150],[1950,980],[1670,810],[1390,640,150],[790,640,210],[510,470],[790,300],[1080,150,260]],{2:'G',7:'G'}, {enemy:'hopper'}),
 D('Coolant Drain Dive','Dive through the drain chute, then climb the emergency return tower.',[[220,530,260],[500,360],[790,230,210],[1390,730,260],[1670,900],[1950,1070],[2230,1240],[2510,1070],[2510,630,240],[2230,460],[1950,290],[1670,120,260]],{2:'S',7:'M'},{enemy:'laser',hazard:'steam'}),
 D('Core Restoration','A carriage, piston steps, and sentries protect the final compute core.',[[220,1780,260],[500,1610],[780,1440,150],[1380,1440,210],[1660,1270],[1940,1100],[1660,930],[1380,760],[1100,590],[820,420],[1100,250],[1390,120,260]],{2:'G'}, {lifts:[4,6,8],enemy:'laser',hazard:'arc'})
];
export function buildMap(id){
 const def={...DESIGNS[id],points:DESIGNS[id].points.map(p=>[...p])},room=Math.floor(id/5),stage=id%5,d=id/39;
 const launchMaps=[3,13,18,28,37,39],launchAt=launchMaps.includes(id)?1:-1;if(launchAt>=0){const dir=Math.sign(def.points[2][0]-def.points[1][0]);for(let i=2;i<def.points.length;i++)def.points[i][0]+=dir*280;}
 const platforms=def.points.map(([cx,y,w],i)=>({id:i,x:cx-(w||Math.round(178-d*106))/2,y,w:w||Math.round(178-d*106),h:46,type:'normal'}));
 const ladders=[],slides=[],route=[],hazards=[],enemies=[];
 for(let i=0;i<platforms.length-1;i++){
  const a=platforms[i],b=platforms[i+1],kind=def.links[i]||'J';route.push({from:i,to:i+1,kind});
  if(kind==='L'||kind==='M')ladders.push({id:ladders.length,x:def.points[i][0]-21,y:Math.min(a.y,b.y)-4,w:42,h:Math.abs(a.y-b.y)+8,motion:kind==='M'?'x':null,range:35,speed:.65+d*.3,phase:0});
  if(kind==='S')slides.push({id:slides.length,x1:a.x+a.w-25,y1:a.y,x2:b.x+b.w*.5,y2:b.y,from:i,to:i+1,purpose:'Safe descent over the flooded containment basin'});
  if(kind==='G'){const dir=Math.sign(b.x-a.x);a.type='grab';a.track={x:dir*360,y:0,call:Math.max(0,i-1)};a.dock=1;}
 }
 for(const i of def.lifts||[]){const a=platforms[i];if(a.type!=='normal')continue;a.type='lift';a.motion='y';a.range=22+d*12;a.phase=i;a.speed=.8+d*.45;}
 const beltIds=[...new Set([...(def.belts||[]),...([2,4,7,11,18,22,26,31,34,38].includes(id)?[3]:[])])];for(const i of beltIds){const pl=platforms[i];if(pl.track||['L','M','S','G'].includes(def.links[i]))continue;pl.type='conveyor';pl.x-=Math.max(0,270-pl.w)/2;pl.w=Math.max(270,pl.w);pl.conveyor=Math.sign(def.points[i+1][0]-def.points[i][0])*265;}
 for(const i of def.fans||[])platforms[i].type='fan';
 if([1,5,9,16,20,23,30,35,39].includes(id)){const pl=platforms[3];if(pl.type==='normal'&&!['L','M','S','G'].includes(def.links[3])&&!['L','M','S','G'].includes(def.links[2])){pl.type='spring';pl.power=920;}}
 if(launchAt>=0){const pl=platforms[launchAt];pl.type='launcher';pl.launchX=Math.sign(def.points[2][0]-def.points[1][0])*690;pl.power=840;route[launchAt].kind='K';}
 const optics=[];if([4,8,12,19,23,27,32,39].includes(id)){const index=Math.floor(platforms.length*.5),pl=platforms[index],cx=pl.x+pl.w/2;pl.x=cx-240;pl.w=480;pl.type='normal';delete pl.motion;const x=pl.x+45;optics.push({id:0,platform:index,x,min:x,max:x+180,y:pl.y-48,mirrors:[{x:x+250,y:pl.y-180,angle:-Math.PI/8},{x:x+390,y:pl.y-180,angle:Math.PI/4}],receiver:{x:x+390,y:pl.y-48},gatePlatform:index+1});}
 const n=platforms.length,relayIndex=Math.floor(n*.57);
 // Checkpoints use existing, stationary route landings. Keep special mechanics
 // and optical interlocks intact; reserve the landings before placing enemies.
 const checkpointCandidates=platforms.filter(p=>p.id>=2&&p.id<n-1&&p.type==='normal'&&!p.motion&&!p.track&&!optics.some(o=>o.platform===p.id||o.gatePlatform===p.id));
 let checkpointPair=null,checkpointScore=Infinity;
 for(const a of checkpointCandidates)for(const b of checkpointCandidates){if(b.id-a.id<2)continue;const score=Math.abs(a.id-(n-1)*.33)+Math.abs(b.id-(n-1)*.7);if(score<checkpointScore){checkpointScore=score;checkpointPair=[a,b];}}
 if(!checkpointPair)throw Error('Map '+id+' needs two safe checkpoint landings.');
 const checkpoints=checkpointPair.map((pl,i)=>({id:i,platform:pl.id,x:pl.x+pl.w/2,y:pl.y,label:'CHECKPOINT '+(i+1)}));

 // Every gate is optional geometry: exit validation requires both relays, so no pad can be locked behind its own gate.
 const end=platforms[n-1],exit={x:end.x+end.w/2-36,y:end.y-112,w:72,h:112};
 const pad=(i,offset=.5)=>({platform:i,offset:platforms[i].w*offset});
 const relays=[{id:0,plates:id===0?[pad(0,.18),pad(0,.8)]:[pad(id%3,.3),pad(id%3+1,.65)],gate:{x:exit.x+90,y:exit.y-10,w:18,h:122}},{id:1,plates:[pad(relayIndex),pad(relayIndex+1)],gate:{x:exit.x+115,y:exit.y-10,w:18,h:122}}];
  const steady=i=>!['spring','launcher','fan','conveyor'].includes(platforms[i].type);
 if(relays[0].plates.some(p=>!steady(p.platform)))relays[0].plates=[pad(0,.18),pad(0,.8)];
 if(relays[1].plates.some(p=>!steady(p.platform))){const choices=platforms.map(p=>p.id).filter(i=>i>2&&i<n-1&&steady(i)).sort((a,b)=>Math.abs(a-relayIndex)-Math.abs(b-relayIndex)).slice(0,2).sort((a,b)=>a-b);relays[1].plates=choices.map(i=>pad(i));}
const fuseIds=[Math.max(2,Math.floor(n*.25)),Math.floor(n*.5),n-2];
 const fuses=fuseIds.map((i,j)=>({id:j,platform:i,offset:platforms[i].w/2,yoff:75+(j===2?15:0)}));
 const protectedIds=new Set([0,1,n-1,relayIndex,relayIndex+1,...checkpoints.map(c=>c.platform),...slides.flatMap(s=>[s.from,s.to]),...relays.flatMap(r=>r.plates.map(p=>p.platform))]);
 for(let i=2;i<n-1;i++){
  const pl=platforms[i];
  if(!protectedIds.has(i)&&!pl.track&&!['spring','launcher','conveyor'].includes(pl.type)&&!optics.some(o=>o.platform===i)){
   let kind=def.enemy||(i%4===0?'laser':i%3===0?'hopper':id>7&&i%2?'charger':'walker');
   if(id<3&&kind==='laser')kind='drone';
   enemies.push({id:enemies.length,platform:i,kind,x:pl.x+pl.w*.5-16,y:pl.y-(kind==='drone'?110:32),w:32,h:32,vx:50+d*58,hp:kind==='laser'?2:1,face:1,cool:1.4+i*.15,hit:0,phase:i,dead:false,beamState:'idle',beamTimer:0,angle:0});
   if(i%3===0){const type=def.hazard==='flood'?'arc':def.hazard||(['arc','steam','arc','fire','steam','arc','arc','steam'][room]);hazards.push({id:hazards.length,type,platform:i,offset:pl.w*.78,w:38+d*12,h:70+d*25,period:4.5-d*1.2,duty:.2+d*.16,phase:i*.9});}
  }
 }
 for(const index of [...new Set([2,4,7,...platforms.map(p=>p.id).filter(i=>i>=2&&i<n-1)])]){if(enemies.length>=3)break;if(checkpoints.some(c=>c.platform===index)||enemies.some(e=>e.platform===index))continue;const pl=platforms[index];enemies.push({id:enemies.length,platform:index,kind:'drone',x:pl.x+pl.w/2-16,y:pl.y-110,w:32,h:32,vx:0,hp:1,face:1,cool:2.5,hit:0,phase:index,dead:false,beamState:'idle',beamTimer:0,angle:0});}
 for(const pl of platforms.filter(p=>p.type==='conveyor'))hazards.push({id:hazards.length,type:pl.id%2?'spikes':'saw',platform:pl.id,offset:pl.conveyor>0?pl.w-25:25,w:38,h:pl.id%2?25:48,period:1,duty:1,phase:0});
 for(const s of slides)hazards.push({id:hazards.length,type:'flood',x:s.x1+50,y:s.y2+85,w:s.x2-s.x1-80,h:60,period:1,duty:1,phase:0});
 const width=Math.max(...platforms.map(p=>p.x+p.w))+160,height=Math.max(...platforms.map(p=>p.y))+330;
 hazards.push({id:hazards.length,type:'flood',x:0,y:height-70,w:width,h:70,period:1,duty:1,phase:0});
 const barriers=[];for(let i=0;i<platforms.length&&barriers.length<3;i++)for(let j=i+4;j<platforms.length&&barriers.length<3;j++){const a=platforms[i],b=platforms[j],cx=(a.x+a.w/2+b.x+b.w/2)/2,y=(a.y+b.y)/2+80;if(Math.abs(a.x+a.w/2-b.x-b.w/2)>100||Math.abs(a.y-b.y)<650)continue;const wall={x:cx-82,y,w:164,h:32};if(platforms.some(p=>wall.x<p.x+p.w+45&&wall.x+wall.w>p.x-45&&Math.abs(wall.y-p.y)<150)||ladders.some(l=>wall.x<l.x+90&&wall.x+wall.w>l.x-45&&wall.y>l.y-90&&wall.y<l.y+l.h+60)||slides.some(s=>wall.x<s.x2&&wall.x+wall.w>s.x1&&wall.y>s.y1-80&&wall.y<s.y2+30)||barriers.some(b=>Math.abs(b.y-y)<170))continue;barriers.push(wall);}
 if(id===30){const bad=barriers.findIndex(b=>b.y===730);if(bad>=0)barriers.splice(bad,1);}if(id===32)barriers.forEach(b=>b.x+=180);
 const arrows=route.map(e=>{const a=platforms[e.from],b=platforms[e.to];return{x:a.x+a.w/2,y:a.y-115,angle:Math.atan2(b.y-a.y,(b.x+b.w/2)-(a.x+a.w/2)),step:e.from+1};});
 const sections=[{x:platforms[0].x,y:platforms[0].y-215,label:def.name.toUpperCase()},{x:platforms[Math.floor(n/2)].x,y:platforms[Math.floor(n/2)].y-230,label:def.scenario}];
 return{id,room,stage,name:def.name,scenario:def.scenario,width,height,spawn:{x:platforms[0].x+80,y:platforms[0].y-48},exit,platforms,checkpoints,ladders,slides,hazards,barriers,arrows,optics,fuses,meds:[{id:0,platform:relayIndex,offset:platforms[relayIndex].w*.25}],enemies,relays,sections,route,floorYs:[...new Set(platforms.map(p=>p.y))],difficulty:d,scene:stage};
}
