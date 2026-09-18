// Puzzle beams are harmless cyan light. Combat lasers use a separate ray model.
export function traceOptics(def,state){
 let x=state.x,y=def.y,dx=Math.SQRT1_2,dy=-Math.SQRT1_2;const segments=[],hit=[];
 for(let bounce=0;bounce<4;bounce++){
  let closest=null,dist=800;
  for(let i=0;i<def.mirrors.length;i++){if(hit.includes(i))continue;const m=def.mirrors[i],along=(m.x-x)*dx+(m.y-y)*dy,across=Math.abs((m.x-x)*dy-(m.y-y)*dx);if(along>3&&across<10&&along<dist){closest={...m,index:i};dist=along;}}
  const receiver=def.receiver,along=(receiver.x-x)*dx+(receiver.y-y)*dy,across=Math.abs((receiver.x-x)*dy-(receiver.y-y)*dx);
  if(along>0&&across<14&&along<dist){segments.push({x,y,x2:receiver.x,y2:receiver.y});return{segments,hit,lit:hit.length===def.mirrors.length};}
  if(!closest){segments.push({x,y,x2:x+dx*420,y2:y+dy*420});break;}
  segments.push({x,y,x2:closest.x,y2:closest.y});hit.push(closest.index);const nx=-Math.sin(closest.angle),ny=Math.cos(closest.angle),dot=dx*nx+dy*ny;dx-=2*dot*nx;dy-=2*dot*ny;x=closest.x+dx*.1;y=closest.y+dy*.1;
 }
 return{segments,hit,lit:false};
}
