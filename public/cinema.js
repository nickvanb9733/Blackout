import {STORY,storyBeat,castFor,expressionFor,captionSpeech,CAST} from './story.js';
// Jointed, code-native actors: each head, eye, mouth, arm and leg is animated independently.
const cinemaClamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=t=>{t=cinemaClamp(t);return t*t*(3-2*t);};
export function performancePose(id,time,speaking,expression='focused',action='talk'){
 const seed={technician:.2,maya:1.3,eli:2.4,control:3.1,gman:.8}[id]||0;
 const walk=action==='run',stride=walk?Math.sin(time*10):0,emphasis=Math.sin(time*2.9+seed);
 return{bob:walk?Math.abs(stride)*3:Math.sin(time*2+seed)*1.3,lean:expression==='panic'?Math.sin(time*17)*.035:speaking?Math.sin(time*1.7+seed)*.018:Math.sin(time*.8)*.008,
  headTilt:speaking?Math.sin(time*2.4+seed)*.055:Math.sin(time*.85+seed)*.022,blink:(time+seed)%4.8<.13,
  leftArm:walk?stride*.65:action==='radio'?-2.4:speaking?-.7-emphasis*.3:.12,
  rightArm:walk?-stride*.65:action==='press'?-1.9:expression==='happy'?-2.4+Math.sin(time*5)*.25:speaking?-1.2+emphasis*.33:.16,
  stride,expression,action,speaking};
}
export function sceneCast(s){const active=castFor(storyBeat(s).speaker).id;return active==='technician'?{left:'technician',right:['intrusion','defeat'].includes(storyBeat(s).shot)?'gman':'maya',active}:{left:'technician',right:active,active};}
export function createCinematicRenderer(ctx,machine){
 const W=1280,H=720,ink='#0b1925';
 const box=(x,y,w,h,fill,stroke=ink,lw=3,r=5)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}};
 const line=(x,y,x2,y2,color,width=3)=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();};
 const ellipse=(x,y,rx,ry,fill,stroke=null,lw=2)=>{ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}};
 const polygon=(pts,fill,stroke=ink,lw=3)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}};
 const label=(text,x,y,size=16,color='#e9efe2',align='left',bold=false)=>{ctx.font=`${bold?'bold ':''}${size}px ${bold?'Arial':'monospace'}`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillStyle=color;ctx.fillText(text,x,y);};
 function hand(x,y,skin,open){if(skin==='#56606f'){polygon([[x-9,y-7],[x+8,y-7],[x+11,y+6],[x-7,y+9]],'#303642','#11131d',2);for(let i=0;i<3;i++){const dx=(i-1)*8;line(x+dx*.6,y+4,x+dx,y+14,skin,4);line(x+dx,y+14,x+dx+(i-1)*3,y+21,'#b5bac2',2.5);}return;}ellipse(x,y,8,8,skin,ink,2.5);if(open){for(let i=0;i<3;i++)line(x-5+i*5,y-4,x-7+i*6,y-12,skin,4);}}
 function arm(side,angle,suit,skin,pose){const x=side*34,y=-99,ax=Math.sin(angle)*side,ay=Math.cos(angle),ex=x+ax*34,ey=y+ay*34;const bend=pose.action==='radio'&&side<0?-1.7:pose.speaking||pose.expression==='happy'?-.9:.25,wx=ex+Math.sin(angle+bend)*side*30,wy=ey+Math.cos(angle+bend)*30;line(x,y,ex,ey,ink,20);line(ex,ey,wx,wy,ink,18);line(x,y,ex,ey,suit,14);line(ex,ey,wx,wy,suit,12);ellipse(ex,ey,7,7,suit,ink,2);hand(wx,wy,skin,pose.speaking||pose.expression==='happy');if(pose.action==='radio'&&side<0){box(wx-6,wy-19,12,21,'#233d49',ink,2,2);line(wx,wy-18,wx,wy-29,'#a7c4ce',2);}}
 function mouth(x,y,speech,expression,robot=false,evil=false){
  const glow=evil?'#ff526e':'#9df2df';
  const open=speech.active?(speech.open||0):0,happy=expression==='happy'||expression==='taunt';
  if(open<.055){ctx.beginPath();ctx.moveTo(x-11,y);ctx.quadraticCurveTo(x,y+(happy?5:expression==='worried'?-3:0),x+11,y);ctx.strokeStyle=robot?(evil?glow:'#b2f2ed'):ink;ctx.lineWidth=2.7;ctx.stroke();return;}
  const w=7+(speech.width??.8)*9,h=(robot?1+open*9:1+open*13),round=speech.round||0,teeth=speech.teeth||0,tongue=speech.tongue||0;
  // Interpolate width/jaw/rounding as well as opening; F/V show a lower-lip bite,
  // TH/L expose the tongue, and M/B/P reach a completely closed pose.
  ctx.save();ctx.beginPath();ctx.roundRect(x-w,y-h,w*2,h*2,Math.min(h,w)*(round>.5?.95:.6));ctx.fillStyle=robot?(evil?'#210b18':'#09212e'):'#44272e';ctx.fill();ctx.strokeStyle=robot?glow:ink;ctx.lineWidth=robot?2.5:1.8;ctx.stroke();ctx.clip();
  if(teeth>.15){ctx.globalAlpha=teeth;box(x-w+2,y-h,w*2-4,Math.min(h,robot?3:4),robot?glow:'#ffefcf',null,0,1);}
  if(tongue>.1){ctx.globalAlpha=tongue;ellipse(x,y+h*.65,w*.55,Math.max(1,h*.36),robot?(evil?'#ffaba6':'#91dce2'):'#e98c88');}
  ctx.restore();
 }
 function face(pose,speech,skin,id,avatar,faceDir){
  const gman=id==='gman',robot=id==='control'||gman,shape=avatar?.shape||'square';ctx.save();ctx.translate(0,-142+pose.bob*.35);ctx.rotate(pose.headTilt);
  if(id==='maya'){ellipse(34,-9,17,39,'#393048',ink,3);ellipse(43,20,10,30,'#393048',ink,3);}
  if(gman){
   // Angular crown, split faceplate and jaw pistons keep the silhouette mechanical.
   for(const side of [-1,1]){polygon([[side*23,-34],[side*45,-63],[side*41,-27]],'#59606e','#11131d',3);box(side*43-5,-18,10,39,'#565c69','#11131d',2,2);line(side*43,-7,side*43,12,'#ff526e',2);}
   polygon([[-41,-30],[-24,-45],[24,-45],[41,-30],[39,21],[23,40],[-23,40],[-39,21]],'#343944','#11131d',4);
   polygon([[-29,-30],[0,-36],[29,-30],[32,13],[21,31],[-21,31],[-32,13]],'#12141f','#737a87',2);
   polygon([[-9,-42],[0,-51],[9,-42],[6,-22],[0,-17],[-6,-22]],'#922b46','#141622',2);line(0,-42,0,-26,'#ff8495',2);
   for(const side of [-1,1]){polygon([[side*30,6],[side*39,2],[side*32,29],[side*22,34]],'#535967','#11131d',2);line(side*28,13,side*24,25,'#a7acb8',2);}
  }
  else if(id==='control'){box(-43,-42,86,78,'#7eabb8',ink,4,9);box(-35,-33,70,56,'#193e49',ink,3,6);line(-16,-43,-24,-59,'#6faebf',4);ellipse(-25,-61,5,5,'#9deee2',ink,2);}
  else if(id==='technician'&&shape==='battery'){box(-13,-59,26,14,'#e7e7c9',ink,3,2);box(-40,-46,80,85,'#7cba8f',ink,4,8);for(let i=0;i<4;i++)box(-29+i*16,-38,11,9,'#def7b9',null,0,1);box(-30,-23,60,54,skin,ink,2,5);}
  else if(id==='technician'&&shape==='gear'){for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);box(-9,-56,18,24,'#8fabb5',ink,3,3);ctx.restore();}ellipse(0,0,44,44,'#8fabb5',ink,4);ellipse(0,0,34,34,skin,ink,3);}
  else if(id==='technician'&&shape==='diver'){ellipse(0,-3,47,48,'#be885b',ink,4);ellipse(0,-1,36,37,skin,ink,3);for(const side of [-1,1]){box(side*47-7,-18,14,30,'#b8c4bd',ink,3,3);ellipse(side*27,-36,3,3,'#f8d1a5');}box(-29,34,58,9,'#a96c4d',ink,3,3);}
  else if(id==='technician'&&shape==='satellite'){box(-39,-39,78,76,'#c3c7dc',ink,4,8);line(0,-40,0,-58,'#a0cbd5',5);polygon([[-36,-73],[36,-73],[23,-54],[0,-49],[-23,-54]],'#b8e7e8',ink,3);line(0,-65,12,-83,ink,4);ellipse(12,-84,5,5,avatar.helmet,ink,2);}
  else if(id==='technician'&&shape==='crown'){box(-35,-36,70,72,skin,ink,3.5,14);polygon([[-38,-26],[-43,-65],[-18,-48],[0,-76],[18,-48],[43,-65],[38,-26]],'#eac566',ink,4);box(-38,-32,76,12,'#d39347',ink,3,3);ellipse(0,-49,6,7,'#ef6e83',ink,2);}
  else if(id==='technician'&&shape==='screen'){box(-42,-41,84,78,'#789aa5',ink,4,7);box(-34,-33,68,58,'#bfddc7',ink,3,4);}
  else if(id==='technician'&&shape==='hex')polygon([[-41,-9],[-24,-41],[24,-41],[41,-9],[24,34],[-24,34]],skin,ink,3.5);
  else if(id==='technician'&&shape==='bolt')polygon([[-15,-51],[38,-51],[18,-28],[37,-11],[18,33],[-29,34],[-35,-17],[-20,-27]],skin,ink,3.5);
  else if(id==='technician'&&shape==='cat')polygon([[-37,30],[-42,-50],[-17,-32],[17,-32],[42,-50],[37,30]],skin,ink,3.5);
  else if(id==='technician'&&shape==='point')polygon([[-42,34],[0,-49],[42,34]],skin,ink,3.5);
  else box(-35,-36,70,72,skin,ink,3.5,id==='technician'&&shape==='round'?30:14);
  if(id==='technician'&&shape==='antenna'){for(const side of [-1,1]){line(side*20,-32,side*39,-66,'#a7bac8',5);ellipse(side*39,-66,7,7,avatar.helmet,ink,3);}}
  if(id==='maya'){polygon([[-37,-4],[-36,-34],[-15,-46],[19,-43],[34,-30],[37,-3],[18,-26],[0,-19],[-21,-28]],'#393048',ink,3);line(-38,-21,-42,8,'#bc9fe4',5);box(-47,-5,10,23,'#97b2bc',ink,2,3);line(-42,14,-25,24,'#b5d4d7',3);ellipse(-22,24,4,4,'#233743');}
  if(id==='eli'){polygon([[-33,6],[-24,26],[0,37],[24,25],[33,4],[31,30],[11,43],[-14,40],[-33,25]],'#9eafb0',ink,2);box(-37,-43,74,20,'#405669',ink,3,5);box(-40,-27,83,8,'#5c7989',ink,2,3);ctx.save();ctx.scale(faceDir,1);label('OPS',0,-30,10,'#f7df9c','center',true);ctx.restore();}
  if(id==='technician'&&['square','round','point'].includes(shape)){box(-37,-48,74,22,avatar.helmet,ink,3,8);box(-43,-29,88,9,avatar.helmet,ink,3,3);box(-6,-49,18,20,'#eaf0d6',ink,2,3);ellipse(3,-40,5,5,'#fff9ba');}
  const worried=pose.expression==='worried'||pose.expression==='panic',gaze=pose.speaking?2:4;
  for(const side of [-1,1]){const ex=side*15,ey=robot?-11:-5;
   if(gman){ctx.save();ctx.shadowColor='#ff224b';ctx.shadowBlur=11;if(pose.blink)line(ex-7,ey,ex+7,ey,'#ff536d',2);else{polygon([[side*5,-9],[side*28,-18],[side*25,worried?0:-4],[side*8,0]],'#ff304f',null);line(side*11,-7,side*23,-12,'#ffcab7',2);}ctx.restore();}
   else{if(pose.blink){line(ex-7,ey,ex+7,ey,robot?'#b9f7e3':ink,3);}else{ellipse(ex,ey,robot?9:8,worried?10:8,robot?'#baf6e1':'#fff5df',robot?null:ink,1.7);ellipse(ex+gaze*.45,ey+1,3.5,worried?5:4,ink);}const tilt=worried?-side*4:side*1;line(ex-8,ey-15+tilt,ex+8,ey-15-tilt,robot?'#9bdbd1':ink,3.3);}}
  mouth(0,robot?13:21,speech,pose.expression,robot,gman);if(id==='technician'&&shape==='cat'){line(-29,12,-46,6,ink,2);line(29,12,46,6,ink,2);}
  ctx.restore();
 }
 function actor(id,x,y,scale,time,speech,expression='focused',action='talk',avatar={},faceDir=1,alpha=1){
  if(id==='technician'&&['antenna','satellite','crown'].includes(avatar.shape))scale*=.88;
  const evil=id==='gman',pose=performancePose(id,time,!!speech.active,expression,action),skin=id==='maya'?'#b77f68':id==='eli'?'#bd8f70':'#e8d7b5',suit=id==='maya'?'#9678ba':id==='eli'?'#d49b5d':evil?'#343a48':id==='control'?'#618f9d':avatar.color||'#70cbae';
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ellipse(0,0,scale*45,scale*8,'#07141d66');ctx.scale(scale*faceDir,scale);ctx.rotate(pose.lean);ctx.translate(0,-pose.bob);
  const robot=['control','gman'].includes(id);
  if(robot){ctx.translate(0,Math.sin(time*2.1)*4);for(const side of [-1,1]){line(side*16,-50,side*25,-18,ink,16);line(side*16,-50,side*25,-18,evil?'#59606b':'#718d9c',10);box(side*25-14,-21,28,15,evil?'#242633':'#334c5f',ink,3,5);if(evil){line(side*19,-39,side*24,-25,'#b3445a',3);polygon([[side*25,-16],[side*44,-12],[side*46,-5],[side*24,-5]],'#646c79','#11131d',2);}}if(evil){ctx.save();ctx.globalAlpha*=.55+.15*Math.sin(time*5);polygon([[-21,-3],[0,24+Math.sin(time*9)*8],[21,-3]],'#ed234f',null);polygon([[-9,-3],[0,15+Math.sin(time*11)*5],[9,-3]],'#ffb4a0',null);ctx.restore();}}
  else for(const side of [-1,1]){const stride=pose.stride*side,hip=side*15,kneeX=hip+stride*17,kneeY=-26-Math.abs(stride)*3,footX=hip-stride*20,footY=-5-Math.max(0,stride)*10;line(hip,-51,kneeX,kneeY,ink,20);line(kneeX,kneeY,footX,footY,ink,18);line(hip,-51,kneeX,kneeY,'#324b5b',14);line(kneeX,kneeY,footX,footY,'#476372',12);box(footX-12,footY-7,29,13,'#233b4b',ink,3,4);}
  const metalSkin=evil?'#56606f':'#a9c1c9';
  arm(-1,evil?-pose.leftArm:pose.leftArm,suit,robot?metalSkin:skin,pose);
  if(evil){
   polygon([[-39,-112],[-22,-124],[22,-124],[39,-112],[28,-55],[0,-42],[-28,-55]],'#282d39','#10131c',4);
   for(const side of [-1,1]){polygon([[side*22,-109],[side*41,-128],[side*58,-120],[side*63,-139],[side*70,-110],[side*43,-99]],'#484e5d','#11131d',3);line(side*38,-112,side*53,-108,'#e04b63',3);for(let j=0;j<3;j++)line(side*12,-68+j*6,side*25,-73+j*6,'#69707b',2);}
   polygon([[-26,-105],[0,-114],[26,-105],[24,-68],[0,-58],[-24,-68]],'#10121b','#737a87',2);
   // Counter-flip the emblem so the large G reads correctly in either facing direction.
   ctx.save();ctx.scale(faceDir,1);ctx.shadowColor='#ff244d';ctx.shadowBlur=12+Math.sin(time*4)*5;label('G',0,-70,43,'#ff4967','center',true);ctx.restore();
  }else{box(-34,-112,68,67,suit,ink,4,10);box(-28,-108,13,58,'#304752',ink,2,2);box(15,-108,13,58,'#304752',ink,2,2);line(-24,-85,24,-85,'#e9d58e',5);box(-33,-53,66,12,'#263d4b',ink,2,3);box(-7,-53,14,12,'#dab578',ink,2,2);box(-7,-78,25,17,'#e7ead9',ink,2,2);ctx.save();ctx.translate(5,-66);ctx.scale(faceDir,1);label(id==='maya'?'M':id==='eli'?'E':id==='control'?'C0':'T',0,0,11,'#2a4a50','center',true);ctx.restore();}
  arm(1,evil?-pose.rightArm:pose.rightArm,suit,robot?metalSkin:skin,pose);face(pose,speech,skin,id,avatar,faceDir);ctx.restore();
 }
 function monitor(x,y,w,h,status,color,time){box(x,y,w,h,'#264550',ink,4,8);box(x+10,y+10,w-20,h-20,'#102834',color,1,4);const max=Math.max(12,Math.floor((w-35)/8));const lines=status.match(new RegExp('.{1,'+max+'}(?:\\s|$)|.{1,'+max+'}','g'))||[status];lines.slice(0,3).forEach((t,i)=>label(t.trim(),x+w/2,y+42+i*23,12,color,'center'));for(let i=0;i<9;i++){const bh=14+(Math.sin(time*2+i)*.5+.5)*35;box(x+25+i*(w-50)/9,y+h-20-bh,12,bh,color+'66',null,0,1);}}
 function environment(shot,time,progress,chapter,status){
  const live=['restore','reboot','victory','celebrate','halls','engine'].includes(shot),alarm=['alarm','intrusion','heat','defeat'].includes(shot),col=alarm?'#dba090':live?'#93dfbd':'#8daeba';
  const gradient=ctx.createLinearGradient(0,0,0,520);gradient.addColorStop(0,'#11273a');gradient.addColorStop(1,alarm?'#4d424e':'#365466');ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
  for(let i=0;i<7;i++){const x=i*214-(time*7)%214;box(x,85,194,341,'#203b4c','#142a3a',3,4);for(let j=0;j<7;j++){box(x+15,104+j*41,162,29,'#2e4b5a',ink,2,2);line(x+29,118+j*41,x+109,118+j*41,'#182e3b',4);ellipse(x+151,118+j*41,3,3,live&&Math.sin(time*3+i+j)>.1?'#b7e7bc':'#a17368');}}
  for(let i=0;i<4;i++){const x=i*390+30;line(x,75,x+175,75,live?'#d9efc1':'#d59d82',6);ctx.save();ctx.globalAlpha=.045;polygon([[x,80],[x+175,80],[x+320,514],[x-100,514]],live?'#c6efbc':'#d5c9bf',null);ctx.restore();}
  box(0,463,W,62,'#243e4d',ink,4,0);for(let x=-50;x<W;x+=90)line(x,482,x+100,520,'#3d5965',2);
  if(['escape','rescue','mission'].includes(shot)){
   const open=shot==='escape'?ease(progress*3):1;box(430,101,253,361,'#425e6a',ink,5,5);box(445,116,223,340,'#102936',ink,3,3);box(445-open*110,117,110,339,'#355765',ink,3,3);box(558+open*110,117,110,339,'#355765',ink,3,3);label(shot==='mission'?'RE-ENTRY':'MAINTENANCE',556,97,13,col,'center');
  }else{
   monitor(405,122,405,216,status,col,time);
   if(['intrusion','defeat'].includes(shot)){for(let i=0;i<4;i++){const x=440+i*105,y=153+Math.sin(time+i)*17;ellipse(x,y,4,4,i%2?'#b24260':'#ff667e');}label('G-MAN CONTROL CORE',605,368,16,'#ff8b9e','center',true);}
   else if(shot==='engine'){machine('engine',466,324,1.45,'#eab57b',true,time);}
   else if(shot==='heat'){for(let i=0;i<6;i++){const x=448+i*62;ctx.beginPath();ctx.moveTo(x,445);ctx.bezierCurveTo(x-28,413,x+30,376,x,340);ctx.strokeStyle='#e8c6b14d';ctx.lineWidth=7;ctx.stroke();}}
   else if(shot==='reboot'||shot==='victory'||shot==='celebrate'||shot==='halls'){const percent=shot==='reboot'?Math.min(99,87+Math.floor(progress*13)):shot==='halls'?chapter===6?25:progress<.5?50:75:100;label(percent+'%',610,390,48,'#a8f0c6','center',true);box(439,419,340,12,'#1b3340',ink,2,3);box(442,422,334*percent/100,6,'#a2e6bd',null,0,2);}
   else if(shot==='confirm'){box(538,373,142,62,'#88d0a0',ink,4,9);label('RESTORE',609,410,18,'#143b3b','center',true);}
   else{box(428,373,359,87,'#536e77',ink,4,7);for(let i=0;i<10;i++)box(446+i*32,392,23,11,i%3===0?col:'#95a9a4',ink,1,1);}
  }
 }
 function nameplate(id,x,y,active,playerName,width=288){const c=CAST[id],name=id==='technician'?(playerName||c.name):c.name;box(x-width/2,y-19,width,36,active?'#182e3dee':'#1d3544dd',active?c.color:'#5f7883',active?2:1,5);label(name.toUpperCase(),x,y+4,15,active?c.color:'#c0cfce','center',true);if(active)ellipse(x-width/2+14,y-2,4,4,c.color);}
 function render(g,me,speech,sceneElapsed){
  const s=g.story,b=storyBeat(s),c=STORY[s.chapter],cast=sceneCast(s),time=sceneElapsed??s.elapsed,progress=cinemaClamp(time/b.duration),expression=expressionFor(b.shot,b.speaker),liveSpeech=speech||captionSpeech(s),quiet={active:false,open:0,shape:'rest'},speaking=id=>id===cast.active?liveSpeech:quiet;
  const crew=g.players.filter(p=>p.connected),lead=crew[0]||me,partner=crew[1],avatar=lead.avatar;
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,520);ctx.clip();environment(b.shot,time,progress,s.chapter,b.status);
  const camera=1+.015*ease(time/3);ctx.translate(640,310);ctx.scale(camera,camera);ctx.translate(-640,-310);
  let leftX=partner?145:286,leftScale=partner?1.65:2.14,leftAction=cast.active==='technician'?'talk':'radio';
  if(b.shot==='escape'){leftX=(partner?95:115)+ease(progress*1.6)*(partner?270:540);leftScale=partner?1.48:1.96;leftAction='run';}
  if(b.shot==='rescue'){for(let i=0;i<2;i++)actor(i?'maya':'eli',115+i*575,472,1.05,time+i,quiet,'happy','run',me.avatar,1);leftAction='talk';}
  if(b.shot==='reboot'){leftX=partner?185:365;leftAction='press';}
  if(['celebrate','victory'].includes(b.shot))leftAction='cheer';
  actor('technician',leftX,512,leftScale,time,speaking('technician'),cast.active==='gman'?'worried':expression,leftAction,avatar,1);
  const partnerX=partner?Math.min(620,leftX+250):0;
  if(partner)actor('technician',partnerX,512,leftScale,time+.65,quiet,cast.active==='gman'?'worried':expression,leftAction==='run'?'run':['celebrate','victory'].includes(b.shot)?'cheer':'radio',partner.avatar,1);
  const remote=cast.right==='maya'||cast.right==='eli';
  if(remote){box(843,91,358,424,'#244150ed','#83a5b3',3,14);box(853,101,338,404,'#2c435b',null,0,9);for(let i=0;i<4;i++)monitor(865+i%2*154,114+Math.floor(i/2)*129,138,114,i?'RADIO LINK':'REMOTE OPS','#91b8b9',time+i);}
  let rightX=remote?1022:984,rightY=remote?529:514,rightScale=remote?2.03:cast.right==='gman'?2.08:2.19,rightAlpha=1;
  if(b.shot==='defeat'&&cast.right==='gman'){const fracture=ease(Math.max(0,progress-.65)/.35);rightX+=Math.sin(time*27)*fracture*15;rightY+=fracture*35;rightAlpha=1-fracture*.8;}
  actor(cast.right,rightX,rightY,rightScale,time+.4,speaking(cast.right),expression,cast.right==='gman'?'taunt':remote?'radio':'talk',avatar,-1,rightAlpha);
  // The villain is also physically present while other characters react to an intrusion.
  if(['intrusion','defeat'].includes(b.shot)&&cast.right!=='gman'){ctx.save();ctx.globalAlpha=.88;actor('gman',610,449,1.15,time,quiet,'taunt','talk',{},-1);ctx.restore();}
  if(b.shot==='defeat'){for(let i=0;i<22;i++){const f=ease(Math.max(0,progress-.6)/.4),x=984+Math.sin(i*2.1)*(20+f*200),y=310+Math.cos(i)*70+f*i*6;box(x,y,5+i%3,5+i%4,['#ff315b','#9d294a','#6b7181','#ffb5a1'][i%4],null,0,1);}}
  if(b.shot==='celebrate'||b.shot==='victory')for(let i=0;i<60;i++){ctx.save();ctx.translate((i*137+time*25)%W,(i*89+time*90)%520);ctx.rotate(i+time);box(-3,-6,6,12,['#e9ce85','#91dfb6','#b3b9ef'][i%3],null,0,1);ctx.restore();}
  ctx.restore();
  box(0,0,W,64,'#091827',null,0,0);label(c.title,30,39,24,'#e8ece2','left',true);label('FICTIONAL CAMPAIGN / '+String(s.chapter+1).padStart(2,'0')+' / 09',1247,36,11,'#a7c8cb','right');
  nameplate('technician',leftX,488,cast.active==='technician',lead.name,partner?236:288);if(partner)nameplate('technician',partnerX,488,false,partner.name,236);nameplate(cast.right,rightX,488,cast.active===cast.right);
  box(0,520,W,200,'#071521',null,0,0);line(0,521,W,521,castFor(b.speaker).color,2);
 }
 return{render,actor};
}
