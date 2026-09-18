// Browser speech exposes word cues, not phoneme timestamps or an audio waveform.
// This original, lightweight pronunciation model estimates shapes INSIDE each word;
// real speech events re-anchor the animation. No free-running jaw oscillator is used.
const lipClamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const lipEase=t=>{t=lipClamp(t);return t*t*(3-2*t);};
export const VISEMES={
 rest:{open:0,width:.72,round:0,teeth:0,tongue:0,weight:.035},
 M:{open:0,width:.83,round:0,teeth:0,tongue:0,weight:.075},
 F:{open:.12,width:.88,round:0,teeth:1,tongue:0,weight:.09},
 TH:{open:.23,width:.82,round:0,teeth:.35,tongue:1,weight:.085},
 T:{open:.14,width:.88,round:0,teeth:.9,tongue:.3,weight:.055},
 K:{open:.26,width:.82,round:0,teeth:.15,tongue:0,weight:.06},
 L:{open:.4,width:.8,round:0,teeth:.2,tongue:.85,weight:.075},
 R:{open:.3,width:.63,round:.6,teeth:0,tongue:0,weight:.075},
 S:{open:.13,width:.94,round:0,teeth:1,tongue:0,weight:.085},
 SH:{open:.27,width:.67,round:.7,teeth:.7,tongue:0,weight:.1},
 N:{open:.18,width:.83,round:0,teeth:.6,tongue:.45,weight:.065},
 A:{open:.9,width:.95,round:0,teeth:.25,tongue:.1,weight:.125},
 AH:{open:.4,width:.84,round:.1,teeth:.1,tongue:0,weight:.085},
 E:{open:.46,width:1,round:0,teeth:.65,tongue:0,weight:.115},
 I:{open:.22,width:1,round:0,teeth:.85,tongue:0,weight:.105},
 O:{open:.65,width:.62,round:1,teeth:0,tongue:0,weight:.14},
 U:{open:.32,width:.5,round:1,teeth:0,tongue:0,weight:.13}
};
// Sound-shape overrides for frequent/irregular words and facility terminology.
// Tokens name visually distinct articulations; they are not a phonetic dictionary.
const lipLexicon={
 a:'AH',i:'A I',the:'TH AH',this:'TH I S',that:'TH A T',these:'TH I S',those:'TH O U S',they:'TH E I',them:'TH E M',their:'TH E AH',there:'TH E AH',then:'TH E N',than:'TH A N',with:'U I TH',without:'U I TH A U T',which:'U I SH',what:'U AH T',where:'U E AH',when:'U E N',who:'U',why:'U A I',we:'U I',were:'U AH',was:'U AH S',you:'U',your:'U O AH',yours:'U O AH S',our:'A U AH',are:'A',is:'I S',of:'AH F',to:'T U',do:'T U',does:'T AH S',did:'T I T',have:'H A F',has:'H A S',had:'H A T',been:'M I N',be:'M I',by:'M A I',my:'M A I',not:'N O T',no:'N O U',now:'N A U',one:'U AH N',won:'U AH N',once:'U AH N S',two:'T U',too:'T U',through:'TH R U',though:'TH O U',some:'S AH M',come:'K AH M',comes:'K AH M S',done:'T AH N',any:'E N I',many:'M E N I',only:'O U N L I',every:'E F R I',everyone:'E F R I U AH N',everything:'E F R I TH I N',something:'S AH M TH I N',someone:'S AH M U AH N',could:'K U T',would:'U U T',should:'SH U T',enough:'I N AH F',said:'S E T',says:'S E S',good:'K U T',morning:'M O N I N',man:'M A N',microsoft:'M A I K R O U S O F T',technician:'T E K N I SH AH N',facility:'F AH S I L I T I',facilities:'F AH S I L I T I S',data:'T E I T AH',center:'S E N T AH',centre:'S E N T AH',maintenance:'M E I N T AH N AH N S',equipment:'I K U I M M AH N T',electrical:'I L E K T R I K AH L',electricity:'I L E K T R I S I T I',utility:'I U T I L I T I',transformer:'T R A N S F O M AH',generator:'SH E N AH R E I T AH',switchgear:'S U I SH K I AH',cooling:'K U L I N',power:'M A U AH',hour:'A U AH',our:'A U AH',fire:'F A I AH',wire:'U A I AH',failure:'F E I L I AH',failures:'F E I L I AH S',communication:'K AH M I U N I K E I SH AH N',communications:'K AH M I U N I K E I SH AH N S',control:'K AH N T R O U L',controller:'K AH N T R O U L AH',controls:'K AH N T R O U L S',recovery:'R I K AH F AH R I',recover:'R I K AH F AH',restore:'R I S T O',restored:'R I S T O T',restoring:'R I S T O R I N',diagnose:'T A I AH K N O U S',diagnosis:'T A I AH K N O U S I S',diagnosing:'T A I AH K N O U S I N',security:'S I K I U AH R I T I',temperature:'T E M M R AH SH AH',temperatures:'T E M M R AH SH AH S',sensor:'S E N S AH',sensors:'S E N S AH S',monitoring:'M O N I T AH R I N',redundancy:'R I T AH N T AH N S I',distribution:'T I S T R I M I U SH AH N',configuration:'K AH N F I K AH R E I SH AH N',network:'N E T U AH K',networking:'N E T U AH K I N',breakers:'M R E I K AH S',breaker:'M R E I K AH',brought:'M R O T',thought:'TH O T',throughout:'TH R U A U T',know:'N O U',knows:'N O U S',knowledge:'N O L I SH',quiet:'K U A I AH T',quite:'K U A I T',lovely:'L AH F L I',awful:'O F AH L',rather:'R A TH AH',terribly:'T E R AH M L I',operational:'O M AH R E I SH AH N AH L',available:'AH F E I L AH M AH L',unavailable:'AH N AH F E I L AH M AH L',normal:'N O M AH L',online:'O N L A I N',offline:'O F L A I N',alarm:'AH L A M',alarms:'AH L A M S',hall:'H O L',halls:'H O L S',room:'R U M',rooms:'R U M S',wrong:'R O N',right:'R A I T',lights:'L A I T S',light:'L A I T',eight:'E I T',eighties:'E I T I S',fifty:'F I F T I',seventy:'S E F AH N T I',hundred:'H AH N T R AH T',percent:'M AH S E N T',thousand:'TH A U S AH N T',thousands:'TH A U S AH N T S',building:'M I L T I N',build:'M I L T',bypass:'M A I M A S',bypassed:'M A I M A S T',head:'H E T',dead:'T E T',said:'S E T',readiness:'R E T I N AH S',ready:'R E T I',readings:'R I T I N S',reading:'R I T I N',crew:'K R U',new:'N I U',view:'F I U',yourself:'U O AH S E L F',mechanical:'M I K A N I K AH L',seized:'S I S T',access:'A K S E S',compromised:'K O M M R AH M A I S T',override:'O U F AH R A I T',source:'S O S',cause:'K O S',causes:'K O S I S',false:'F O L S',fault:'F O L T',faults:'F O L T S',sensor:'S E N S AH',engine:'E N SH I N',system:'S I S T AH M',systems:'S I S T AH M S'
};
const lipAcronyms={G:'SH I',BMS:'M I E M E S',UPS:'I U M I E S',PDU:'M I T I I U',ATS:'E I T I E S',CRAH:'K R A',CRAHs:'K R A S',AM:'E I E M'};
const lipLetters={a:'E I',b:'M I',c:'S I',d:'T I',e:'I',f:'E F',g:'SH I',h:'E I SH',i:'A I',j:'SH E I',k:'K E I',l:'E L',m:'E M',n:'E N',o:'O U',p:'M I',q:'K I U',r:'A',s:'E S',t:'T I',u:'I U',v:'F I',w:'T AH M AH L I U',x:'E K S',y:'U A I',z:'S E T'};
const lipDigits=['S I AH R O U','U AH N','T U','TH R I','F O','F A I F','S I K S','S E F AH N','E I T','N A I N'];
export function wordShapes(raw){
 if(lipAcronyms[raw])return lipAcronyms[raw].split(' ');
 const word=raw.toLowerCase().replace(/’/g,"'");
 if(lipLexicon[word])return lipLexicon[word].split(' ').map(v=>v==='H'?'AH':v);
 if(/^\d+$/.test(word))return [...word].flatMap(c=>lipDigits[Number(c)].split(' '));
 if(/^[A-Z]{2,}$/.test(raw))return [...word].flatMap(c=>(lipLetters[c]||'AH').split(' '));
 const units=[];let i=0;
 while(i<word.length){const rest=word.slice(i),c=word[i];let found=false;
  for(const [pattern,shapes]of [['tion','SH AH N'],['sion','SH AH N'],['ture','SH AH'],['ough','O'],['igh','A I'],['ear','I AH'],['air','E AH'],['ch','SH'],['sh','SH'],['th','TH'],['ph','F'],['ng','N'],['ck','K'],['qu','K U'],['ee','I'],['ea','I'],['oo','U'],['ou','A U'],['ow','A U'],['oi','O I'],['oy','O I'],['ai','E I'],['ay','E I'],['oa','O U'],['au','O'],['aw','O'],['er','AH'],['ir','AH'],['ur','AH']]){
   if(rest.startsWith(pattern)){units.push(...shapes.split(' '));i+=pattern.length;found=true;break;}
  }
  if(found)continue;
  if(i===0&&((c==='k'&&word[1]==='n')||(c==='w'&&word[1]==='r'))){i++;continue;}
  if(c==='e'&&i===word.length-1&&word.length>3){i++;continue;}
  if(c===word[i-1]&&!/[aeiou]/.test(c)){i++;continue;}
  const shape=/[bmp]/.test(c)?'M':/[fv]/.test(c)?'F':/[td]/.test(c)?'T':c==='l'?'L':c==='r'?'R':c==='n'?'N':c==='s'||c==='z'?'S':c==='c'&&/[eiy]/.test(word[i+1]||'')?'S':/[gkcx]/.test(c)?'K':c==='a'?'A':c==='e'?'E':c==='i'||c==='y'?'I':c==='o'?'O':c==='u'||c==='w'?'U':c==='h'?'AH':null;
  if(shape)units.push(shape);i++;
 }
 return units.length?units:['AH'];
}
const lipPlans=new Map();
export function speechPlan(text){
 if(lipPlans.has(text))return lipPlans.get(text);
 const matches=[...text.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*|\d+/g)];let time=0;
 const words=matches.map((m,i)=>{const shapes=wordShapes(m[0]),units=[];let duration=0;for(const shape of shapes){const seconds=VISEMES[shape].weight;units.push({shape,start:duration,end:duration+seconds});duration+=seconds;}
  const tail=text.slice(m.index+m[0].length,matches[i+1]?.index??text.length),gap=/[.!?…]/.test(tail)?.29:/[,;:]/.test(tail)?.14:/[—–]/.test(tail)?.18:.025;
  const word={text:m[0],index:m.index,end:m.index+m[0].length,units,duration,gap,start:time};time+=duration+gap;return word;});
 const plan={words,duration:time};if(lipPlans.size>128)lipPlans.clear();lipPlans.set(text,plan);return plan;
}
const lipFields=['open','width','round','teeth','tongue'];
function lipBlend(from,to,amount){const out={};for(const k of lipFields)out[k]=from[k]+(to[k]-from[k])*amount;return out;}
const lipRest=()=>({active:false,shape:'rest',...VISEMES.rest});
export function sampleWord(word,seconds,scale=1){
 const t=seconds/scale;if(t<0||t>=word.duration)return{...lipRest(),index:word.end,word:word.text};
 const at=word.units.findIndex(u=>t<u.end),u=word.units[at],pose=VISEMES[u.shape],edge=Math.min(.026,(u.end-u.start)*.28);let values={...pose};
 if(t-u.start<edge)values=lipBlend(VISEMES[word.units[at-1]?.shape||'rest'],pose,lipEase((at===0?0:.5)+(at===0?1:.5)*(t-u.start)/edge));
 else if(u.end-t<edge)values=lipBlend(pose,VISEMES[word.units[at+1]?.shape||'rest'],lipEase((at===word.units.length-1?1:.5)*(1-(u.end-t)/edge)));
 return{...values,active:true,shape:u.shape,index:word.index+Math.min(word.text.length-1,Math.floor(t/word.duration*word.text.length)),word:word.text};
}
export function samplePlan(plan,seconds,scale=1){const t=seconds/scale,word=plan.words.find(w=>t>=w.start&&t<w.start+w.duration);return word?sampleWord(word,seconds-word.start*scale,scale):lipRest();}
export class SpeechMouth{
 constructor(text,rate=1,pace=1){this.plan=speechPlan(text);this.rate=rate;this.scale=pace/rate;this.startedAt=null;this.anchor=null;this.lastWord=-1;this.pausedAt=null;this.ended=false;}
 start(now){if(this.startedAt===null)this.startedAt=now;}
 pause(now){if(this.pausedAt===null)this.pausedAt=now;}
 resume(now){if(this.pausedAt===null)return;const wait=now-this.pausedAt;if(this.startedAt!==null)this.startedAt+=wait;if(this.anchor)this.anchor.at+=wait;this.pausedAt=null;}
 end(){this.ended=true;}
 boundary(e,now){
  if(this.ended||this.pausedAt!==null||this.startedAt===null||e.name&&e.name!=='word')return false;
  if(!Number.isInteger(e.charIndex)||e.charIndex<0)return false;
  const index=this.plan.words.findIndex(w=>w.end>e.charIndex);if(index<0||index<=this.lastWord)return false;
  let at=now;const eventTime=Number(e.elapsedTime),sourceAt=this.startedAt+eventTime;
  // Some engines return zero or unusable elapsedTime. Only compensate a modest
  // delivery delay when their source timestamp is consistent with our clock.
  if(Number.isFinite(eventTime)&&eventTime>0&&sourceAt<=now+.025&&now-sourceAt<.3)at=sourceAt;
  if(this.anchor&&at<=this.anchor.at)return false;
  const word=this.plan.words[index];
  if(this.anchor){const expected=word.start-this.plan.words[this.lastWord].start,observed=at-this.anchor.at,ratio=observed/expected;
   // Long silences are pauses, not evidence that the voice suddenly speaks slowly.
   if(ratio>.45/this.rate&&ratio<2.1/this.rate)this.scale=this.scale*.45+ratio*.55;
  }
  this.anchor={at,index};this.lastWord=index;return true;
 }
 sample(now){
  if(this.ended||this.pausedAt!==null||this.startedAt===null)return lipRest();
  if(this.anchor)return{...sampleWord(this.plan.words[this.anchor.index],now-this.anchor.at,this.scale),mode:'word'};
  return{...samplePlan(this.plan,now-this.startedAt,this.scale),mode:'estimated'};
 }
 get pace(){return lipClamp(this.scale*this.rate,.5,2);}
}
