import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
import {createGame,addPlayer,command,tick,snapshot,activePlayers} from './public/core.js';
const ROOT=path.resolve(fileURLToPath(new URL('./public/',import.meta.url)));
const rooms=new Map(),sessions=new Map(),limits=new Map();
const PORT=process.env.PORT===undefined?3000:Number(process.env.PORT),MAX_ROOMS=Number(process.env.MAX_ROOMS)||100;
const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'SAMEORIGIN'};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...headers});res.end(JSON.stringify(data))}
function cleanCode(code){return String(code||'').trim().toUpperCase().replace(/[^A-Z2-9]/g,'').slice(0,6)}
function newCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c;do{c=Array.from(crypto.randomBytes(6),n=>chars[n%chars.length]).join('')}while(rooms.has(c));return c}
function authorized(req){const token=String(req.headers.authorization||'').replace(/^Bearer /,'');return sessions.get(token)}
async function body(req){let size=0,parts=[];for await(const part of req){size+=part.length;if(size>8192)throw Error('Request too large');parts.push(part)}try{return JSON.parse(Buffer.concat(parts).toString()||'{}')}catch{throw Error('Invalid JSON')}}
function rate(req,weight=1){const session=sessions.get(String(req.headers.authorization||'').replace(/^Bearer /,''));const ip=session?'session:'+session.id:req.socket.remoteAddress||'unknown',now=Date.now();let b=limits.get(ip);if(!b||now-b.time>10000){b={time:now,count:0};limits.set(ip,b)}b.count+=weight;return b.count<1500}
function originAllowed(req){if(!req.headers.origin)return true;try{return new URL(req.headers.origin).host===req.headers.host||req.headers.origin===process.env.PUBLIC_ORIGIN}catch{return false}}
function attach(room,name,avatar,account){const token=crypto.randomBytes(24).toString('hex'),id=crypto.randomBytes(5).toString('hex'),p=addPlayer(room.game,id,name,avatar,account);if(!p)return null;const s={token,id,room,lastInput:Date.now(),lastSeen:Date.now(),held:0,pressed:0,seq:-1,stream:null};room.members.set(id,s);sessions.set(token,s);if(!room.host)room.host=id;return s}
function departure(s){s.held=s.pressed=0;const p=s.room.game.players.find(p=>p.id===s.id);if(p)p.connected=false;if(s.stream){s.stream.end();s.stream=null}if(s.room.host===s.id){s.room.host=activePlayers(s.room.game)[0]?.id||s.id}s.lastSeen=Date.now()}
function info(s){return{token:s.token,id:s.id,code:s.room.code,host:s.room.host,state:snapshot(s.room.game)}}
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/health'){return json(res,200,{status:'ok',version:'3.3.0',transport:'sse',rooms:rooms.size})}
  if(url.pathname.startsWith('/api/')){
   if(!originAllowed(req))return json(res,403,{error:'Cross-origin request rejected.'});if(!rate(req))return json(res,429,{error:'Too many requests. Try again shortly.'});
   if(req.method==='POST'&&url.pathname==='/api/rooms'){
    if(!rate(req,120))return json(res,429,{error:'Please wait before creating another room.'});if(rooms.size>=MAX_ROOMS)return json(res,503,{error:'All game rooms are occupied. Try again later.'});
    const b=await body(req),code=newCode(),room={code,game:createGame(b.progress,true),members:new Map(),host:null,lastActive:Date.now()};rooms.set(code,room);return json(res,201,info(attach(room,b.name,b.avatar,b.account)));
   }
   if(req.method==='POST'&&url.pathname==='/api/join'){
    if(!rate(req,60))return json(res,429,{error:'Please wait before trying another room.'});const b=await body(req),room=rooms.get(cleanCode(b.code));if(!room)return json(res,404,{error:'Room not found. Check the six-character code.'});
    if(room.game.mode!=='lobby')return json(res,409,{error:'Your teammate must return to the lobby before you can join.'});if(activePlayers(room.game).length>=2)return json(res,409,{error:'This two-player room is full.'});
    for(const p of room.game.players.filter(p=>!p.connected)){const old=room.members.get(p.id);if(old){sessions.delete(old.token);room.members.delete(p.id)}room.game.players=room.game.players.filter(x=>x.id!==p.id)}
    return json(res,200,info(attach(room,b.name,b.avatar,b.account)));
   }
   if(req.method==='GET'&&url.pathname==='/api/events'){
    const s=sessions.get(url.searchParams.get('token'));if(!s)return json(res,401,{error:'Session expired. Create or join a new room.'});
    if(s.stream){const old=s.stream;s.stream=null;old.end()}
    s.lastSeen=Date.now();s.room.lastActive=Date.now();const p=s.room.game.players.find(p=>p.id===s.id);if(!p)return json(res,401,{error:'Session expired.'});p.connected=true;
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no',...headers});res.write(': connected\n\n');s.stream=res;
    const send=()=>res.write('data: '+JSON.stringify({host:s.room.host,code:s.room.code,state:snapshot(s.room.game)})+'\n\n');send();
    req.on('close',()=>{if(s.stream===res){s.stream=null;departure(s)}});return;
   }
   const s=authorized(req);if(!s)return json(res,401,{error:'Session expired. Create or join a new room.'});s.lastSeen=Date.now();s.room.lastActive=Date.now();
   if(req.method==='POST'&&url.pathname==='/api/input'){
    const b=await body(req);if(Number.isSafeInteger(b.seq)&&b.seq>s.seq){s.seq=b.seq;s.held=(Number(b.held)|0)&127;s.pressed|=(Number(b.pressed)|0)&127;s.lastInput=Date.now()}return json(res,200,{ok:true,seq:s.seq});
   }
   if(req.method==='POST'&&url.pathname==='/api/action'){
    const b=await body(req),p=s.room.game.players.find(p=>p.id===s.id);const ok=command(s.room.game,p,b.action,b.data||{},s.room.host===s.id);return json(res,200,{ok,state:snapshot(s.room.game)});
   }
   if(req.method==='POST'&&url.pathname==='/api/leave'){departure(s);return json(res,200,{ok:true})}
   return json(res,404,{error:'Unknown endpoint.'});
  }
  if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Method not allowed.'});
  let decoded;try{decoded=decodeURIComponent(url.pathname)}catch{return json(res,400,{error:'Invalid path.'})}const target=path.resolve(ROOT,'.'+(decoded==='/'?'/index.html':decoded));
  if(!target.startsWith(ROOT+path.sep)||path.basename(target).startsWith('.'))return json(res,404,{error:'Not found.'});
  const ext=path.extname(target),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'}[ext];if(!mime)return json(res,404,{error:'Not found.'});
  const bytes=await readFile(target);res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-cache','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'self'",...headers});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(err){if(!res.headersSent)json(res,err.code==='ENOENT'?404:400,{error:err.code==='ENOENT'?'Not found.':String(err.message||'Request failed.').slice(0,160)});else res.end()}
});
server.requestTimeout=15000;server.headersTimeout=10000;
let last=performance.now(),acc=0,broadcast=0;
const timer=setInterval(()=>{
 const now=performance.now();acc+=Math.min(.15,(now-last)/1000);last=now;
 while(acc>=1/60){for(const room of rooms.values()){
  const inputs={};for(const s of room.members.values()){if(Date.now()-s.lastInput>400)s.held=0;inputs[s.id]={held:s.held,pressed:s.pressed};s.pressed=0}
  if(activePlayers(room.game).length)tick(room.game,inputs,1/60);
 }acc-=1/60}
 broadcast++;if(broadcast%2===0){for(const room of rooms.values()){
  let payload;for(const s of room.members.values()){if(!s.stream)continue;if(s.stream.writableLength>256000){departure(s);continue}payload??='data: '+JSON.stringify({host:room.host,code:room.code,state:snapshot(room.game)})+'\n\n';s.stream.write(payload)}
 }}
},20);
const reap=setInterval(()=>{const now=Date.now();for(const [code,room]of rooms){if(now-room.lastActive>15*60*1000&&!Array.from(room.members.values()).some(s=>s.stream)){for(const s of room.members.values())sessions.delete(s.token);rooms.delete(code)}}for(const[ip,b]of limits)if(now-b.time>20000)limits.delete(ip)},30000);
server.listen(PORT,'0.0.0.0',()=>console.log('BLACKOUT v3.3.0 listening on port '+server.address().port));
function shutdown(){clearInterval(timer);clearInterval(reap);for(const s of sessions.values())if(s.stream)s.stream.end();server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),3000).unref()}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
