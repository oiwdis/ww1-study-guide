const MAX_BODY=24576;
const RATE_LIMIT=200;
const RATE_WINDOW_MS=60_000;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SECTIONS=new Set(['summary','slides','readings','quiz','practice','timeline','paris']);
const INSERT=`INSERT INTO events (id, ts, session_id, event, page, detail, country, ua_family, device_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

export const EVENTS=['section_view','slide_viewed','reading_opened','quiz_started','quiz_answered','quiz_completed','practice_started','practice_answered','practice_completed','timeline_interaction','paris_viewed'];

export function cleanName(value){
 return String(value??'').replace(/[\u0000-\u001F\u007F]/g,'').replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,40);
}
function text(value,max,{empty=false}={}){
 if(typeof value!=='string') return undefined;
 const cleaned=value.replace(/[\u0000-\u001F\u007F]/g,'').trim().slice(0,max);
 if(!cleaned && !empty) return undefined;
 return cleaned;
}
function integer(value,min,max){
 return Number.isInteger(value)&&value>=min&&value<=max?value:undefined;
}
function bool(value){return typeof value==='boolean'?value:undefined;}
function pageOf(value){
 if(value==null||value==='') return null;
 const page=text(value,80);
 return page&&/^[a-z0-9][a-z0-9/_-]{0,79}$/i.test(page)?page:undefined;
}

function answerFields(input,{requireIndex=false}={}){
 const question_id=text(input.question_id,40);
 if(!question_id||!/^[A-Za-z0-9_-]+$/.test(question_id)) return null;
 const type=input.type==null?null:text(input.type,8);
 if(type!=null && !['mc','fill','short'].includes(type)) return null;
 let chosen_index=null,correct_index=null;
 if(input.chosen_index!=null){chosen_index=integer(input.chosen_index,0,30);if(chosen_index==null) return null;}
 else if(requireIndex) return null;
 if(input.correct_index!=null){correct_index=integer(input.correct_index,0,30);if(correct_index==null) return null;}
 const chosen_text=text(input.chosen_text,500,{empty:true});
 const correct_text=text(input.correct_text,800,{empty:true});
 if(chosen_text==null||correct_text==null) return null;
 let correct=null;
 if(input.correct!=null){correct=bool(input.correct);if(correct==null) return null;}
 const time_spent_ms=integer(input.time_spent_ms,0,1_800_000);
 if(time_spent_ms==null) return null;
 const stem=input.stem==null?'':text(input.stem,160,{empty:true});
 if(stem==null) return null;
 return {question_id,type,chosen_index,chosen_text,correct_index,correct_text,correct,time_spent_ms,stem};
}
function attemptBase(input){
 const attempt_id=text(input.attempt_id,40);
 if(!attempt_id||!UUID.test(attempt_id)) return null;
 const name=input.name==null?'':cleanName(input.name);
 if(input.name!=null && typeof input.name!=='string') return null;
 return {attempt_id,name};
}

export function normalizeDetail(event,input){
 if(!input||typeof input!=='object'||Array.isArray(input)) return null;
 if(event==='section_view'){
  const section=text(input.section,20);
  return section&&SECTIONS.has(section)?{section}:null;
 }
 if(event==='slide_viewed'){
  const slide=integer(input.slide,1,127);
  return slide==null?null:{slide};
 }
 if(event==='reading_opened'){
  const reading=integer(input.reading,1,3);
  if(reading==null) return null;
  const detail={reading};
  if(input.page!=null){const page=integer(input.page,1,12);if(page==null) return null;detail.page=page;}
  return detail;
 }
 if(event==='paris_viewed'){
  const view=text(input.view,12);
  if(view!=='notes'&&view!=='documents') return null;
  const detail={view};
  if(input.page!=null){const page=integer(input.page,1,21);if(page==null) return null;detail.page=page;}
  return detail;
 }
 if(event==='timeline_interaction'){
  const action=text(input.action,12);
  if(!['search','era','topic','reset'].includes(action)) return null;
  const detail={action};
  if(input.value!=null){const value=text(input.value,80,{empty:true});if(value==null) return null;if(value) detail.value=value;}
  return detail;
 }
 const base=attemptBase(input);
 if(!base) return null;
 if(event==='quiz_started'){
  const scope=text(input.scope,40);
  const question_count=integer(input.question_count,1,200);
  if(!scope||question_count==null) return null;
  return {...base,scope,question_count};
 }
 if(event==='quiz_answered'){
  const answer=answerFields(input,{requireIndex:true});
  return answer?{...base,...answer,type:'mc'}:null;
 }
 if(event==='quiz_completed'||event==='practice_completed'){
  const correct=integer(input.correct,0,200);
  const total=integer(input.total,0,200);
  const percent=integer(input.percent,0,100);
  const duration_ms=integer(input.duration_ms,0,21_600_000);
  if(correct==null||total==null||percent==null||duration_ms==null) return null;
  const detail={...base,correct,total,percent,duration_ms};
  if(event==='quiz_completed'){
   if(input.scope!=null){const scope=text(input.scope,40);if(!scope) return null;detail.scope=scope;}
   return detail;
  }
  const test_id=integer(input.test_id,1,20);
  const letter=text(input.letter,1);
  if(test_id==null||!letter||!/^[A-E]$/.test(letter)) return null;
  detail.test_id=test_id;detail.letter=letter;
  if(input.answers!=null){
   if(!Array.isArray(input.answers)||input.answers.length>24) return null;
   detail.answers=[];
   for(const item of input.answers){
    const answer=answerFields(item);
    if(!answer?.type) return null;
    detail.answers.push(answer);
   }
  }
  return detail;
 }
 if(event==='practice_started'){
  const test_id=integer(input.test_id,1,20);
  const letter=text(input.letter,1);
  if(test_id==null||!letter||!/^[A-E]$/.test(letter)) return null;
  return {...base,test_id,letter};
 }
 if(event==='practice_answered'){
  const test_id=integer(input.test_id,1,20);
  const answer=answerFields(input);
  if(test_id==null||!answer?.type) return null;
  return {...base,test_id,...answer};
 }
 return null;
}

export function clientSignals(request){
 const cf=request.cf||{};
 const country=typeof cf.country==='string'&&/^[A-Za-z]{2}$/.test(cf.country)?cf.country.toUpperCase():null;
 const ua=request.headers?.get('user-agent')||'';
 let ua_family='Other';
 if(/Edg\//.test(ua)) ua_family='Edge';
 else if(/Chrome\//.test(ua)||/CriOS\//.test(ua)) ua_family='Chrome';
 else if(/Firefox\//.test(ua)||/FxiOS\//.test(ua)) ua_family='Firefox';
 else if(/Safari\//.test(ua)) ua_family='Safari';
 let device_type='desktop';
 if(/iPad|Tablet/i.test(ua)) device_type='tablet';
 else if(/Mobile|iPhone|Android/i.test(ua)) device_type='mobile';
 return {country,ua_family,device_type};
}

function hashesEqual(left,right){
 const a=new Uint8Array(left),b=new Uint8Array(right);
 if(typeof crypto.subtle.timingSafeEqual==='function') return crypto.subtle.timingSafeEqual(a,b);
 let diff=a.byteLength^b.byteLength;
 const length=Math.max(a.byteLength,b.byteLength);
 for(let i=0;i<length;i++) diff|=(a[i]??0)^(b[i]??0);
 return diff===0;
}
async function authorized(request,secret){
 if(!secret) return false;
 const header=request.headers.get('authorization')||'';
 const provided=header.startsWith('Bearer ')?header.slice(7):'';
 const enc=new TextEncoder();
 const [left,right]=await Promise.all([
  crypto.subtle.digest('SHA-256',enc.encode(provided)),
  crypto.subtle.digest('SHA-256',enc.encode(secret)),
 ]);
 return hashesEqual(left,right);
}

async function readBody(request){
 const declared=Number(request.headers.get('content-length')||0);
 if(Number.isFinite(declared)&&declared>MAX_BODY) return {error:'too large'};
 if(!request.body) return {text:''};
 const reader=request.body.getReader();
 const chunks=[];
 let total=0;
 while(true){
  const {done,value}=await reader.read();
  if(done) break;
  total+=value.byteLength;
  if(total>MAX_BODY){await reader.cancel();return {error:'too large'};}
  chunks.push(value);
 }
 const buf=new Uint8Array(total);
 let offset=0;
 for(const chunk of chunks){buf.set(chunk,offset);offset+=chunk.byteLength;}
 return {text:new TextDecoder().decode(buf)};
}

function json(data,status=200){
 return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}

async function withinRate(db,sessionId,adding){
 const since=new Date(Date.now()-RATE_WINDOW_MS).toISOString();
 const row=await db.prepare('SELECT COUNT(*) AS count FROM events WHERE session_id = ? AND ts >= ?').bind(sessionId,since).first();
 return Number(row?.count||0)+adding<=RATE_LIMIT;
}

function storedDetail(event,detail){
 if(event!=='practice_completed') return detail;
 const {answers,...rest}=detail;
 return rest;
}

async function insertEvents(db,rows){
 await db.batch(rows.map(row=>db.prepare(INSERT).bind(row.id,row.ts,row.session_id,row.event,row.page,row.detail,row.country,row.ua_family,row.device_type)));
}

async function postEvent(request,env){
 const type=request.headers.get('content-type')||'';
 if(!type.includes('application/json')) return json({error:'expected json'},415);
 const body=await readBody(request);
 if(body.error) return json({error:'payload too large'},413);
 let payload;
 try{payload=JSON.parse(body.text);}catch{return json({error:'invalid json'},400);}
 if(!payload||typeof payload!=='object'||Array.isArray(payload)) return json({error:'invalid payload'},400);
 const session_id=typeof payload.session_id==='string'?payload.session_id:'';
 if(!UUID.test(session_id)) return json({error:'invalid session'},400);
 if(!EVENTS.includes(payload.event)) return json({error:'invalid event'},400);
 const page=pageOf(payload.page);
 if(page===undefined) return json({error:'invalid page'},400);
 const detail=normalizeDetail(payload.event,payload.detail);
 if(!detail) return json({error:'invalid detail'},400);
 const encoded=JSON.stringify(detail);
 if(encoded.length>20000) return json({error:'payload too large'},413);
 if(!(await withinRate(env.DB,session_id,1+(detail.answers?.length||0)))) return json({error:'too many events'},429);
 const signals=clientSignals(request);
 const ts=new Date().toISOString();
 const rows=[{
  id:crypto.randomUUID(),ts,session_id,event:payload.event,page,detail:JSON.stringify(storedDetail(payload.event,detail)),
  country:signals.country,ua_family:signals.ua_family,device_type:signals.device_type,
 }];
 if(payload.event==='practice_completed'){
  for(const answer of detail.answers||[]){
   rows.push({
    id:crypto.randomUUID(),ts,session_id,event:'practice_answered',page,
    detail:JSON.stringify({attempt_id:detail.attempt_id,test_id:detail.test_id,name:detail.name,...answer}),
    country:signals.country,ua_family:signals.ua_family,device_type:signals.device_type,
   });
  }
 }
 await insertEvents(env.DB,rows);
 return new Response(null,{status:204,headers:{'cache-control':'no-store'}});
}

function average(items,pick){
 const values=items.map(pick).filter(n=>Number.isFinite(n));
 if(!values.length) return {attempts:0,average_percent:null};
 return {attempts:values.length,average_percent:Math.round(values.reduce((s,n)=>s+n,0)/values.length*10)/10};
}
function displayName(name){return cleanName(name)||'Anonymous';}
function parsedDetail(row){
 try{return JSON.parse(row.detail||'{}')||{};}catch{return {};}
}

export function buildStats(rows,nameFilter){
 const completions=[];
 const answers=[];
 for(const row of rows){
  const detail=parsedDetail(row);
  const name=displayName(detail.name);
  const item={...row,detail,name};
  if(row.event==='quiz_completed'||row.event==='practice_completed') completions.push(item);
  if(row.event==='quiz_answered'||row.event==='practice_answered') answers.push(item);
 }
 const groups=new Map();
 for(const item of completions){
  const group=groups.get(item.name)||{name:item.name,attempts:0,percent_total:0,percent_count:0};
  group.attempts++;
  if(Number.isFinite(item.detail.percent)){group.percent_total+=item.detail.percent;group.percent_count++;}
  groups.set(item.name,group);
 }
 const attempts_by_name=[...groups.values()].map(group=>({
  name:group.name,attempts:group.attempts,
  average_percent:group.percent_count?Math.round(group.percent_total/group.percent_count*10)/10:null,
 })).sort((a,b)=>b.attempts-a.attempts||a.name.localeCompare(b.name));
 const selected=nameFilter?completions.filter(item=>item.name===nameFilter):completions;
 const selectedAnswers=nameFilter?answers.filter(item=>item.name===nameFilter):answers;
 const byAttempt=new Map();
 for(const item of answers){
  const id=item.detail.attempt_id;
  if(!id) continue;
  const list=byAttempt.get(id)||[];
  list.push(item);
  byAttempt.set(id,list);
 }
 const recent_attempts=selected.slice().sort((a,b)=>b.ts.localeCompare(a.ts)).slice(0,25).map(item=>({
  attempt_id:item.detail.attempt_id,
  kind:item.event==='quiz_completed'?'quiz':'practice',
  name:item.name,
  ts:item.ts,
  page:item.page,
  test_id:item.detail.test_id??null,
  letter:item.detail.letter??null,
  scope:item.detail.scope??null,
  correct:item.detail.correct,
  total:item.detail.total,
  percent:item.detail.percent,
  duration_ms:item.detail.duration_ms,
  questions:(byAttempt.get(item.detail.attempt_id)||[]).map(answer=>({
   question_id:answer.detail.question_id,
   stem:answer.detail.stem||'',
   type:answer.detail.type||null,
   chosen_index:answer.detail.chosen_index,
   chosen_text:answer.detail.chosen_text,
   correct_index:answer.detail.correct_index,
   correct_text:answer.detail.correct_text,
   correct:answer.detail.correct,
   time_spent_ms:answer.detail.time_spent_ms,
  })),
 }));
 const questions=new Map();
 for(const item of selectedAnswers){
  if(typeof item.detail.correct!=='boolean') continue;
  const key=`${item.event}:${item.detail.question_id}`;
  const bucket=questions.get(key)||{event:item.event,question_id:item.detail.question_id,stem:item.detail.stem||'',attempts:0,correct:0,wrongs:new Map()};
  bucket.attempts++;
  if(item.detail.correct) bucket.correct++;
  else{const label=item.detail.chosen_text||`option ${item.detail.chosen_index}`;bucket.wrongs.set(label,(bucket.wrongs.get(label)||0)+1);}
  if(!bucket.stem&&item.detail.stem) bucket.stem=item.detail.stem;
  questions.set(key,bucket);
 }
 const most_missed=[...questions.values()].filter(item=>item.attempts>item.correct).map(item=>{
  let most_common_wrong=null;
  for(const [text,count] of item.wrongs) if(!most_common_wrong||count>most_common_wrong.count) most_common_wrong={text,count};
  return {event:item.event,question_id:item.question_id,stem:item.stem,attempts:item.attempts,correct:item.correct,accuracy:Math.round(item.correct/item.attempts*1000)/10,most_common_wrong};
 }).sort((a,b)=>a.accuracy-b.accuracy||b.attempts-a.attempts).slice(0,20);
 return {
  name_filter:nameFilter,
  attempts_by_name,
  quiz_score_average:average(selected.filter(item=>item.event==='quiz_completed'),item=>item.detail.percent),
  practice_score_average:average(selected.filter(item=>item.event==='practice_completed'),item=>item.detail.percent),
  most_missed,
  recent_attempts,
 };
}

async function getStats(request,env){
 if(!(await authorized(request,env.STATS_KEY))) return json({error:'unauthorized'},401);
 const url=new URL(request.url);
 let nameFilter=null;
 if(url.searchParams.has('name')){
  const raw=url.searchParams.get('name');
  nameFilter=raw==='Anonymous'? 'Anonymous' : displayName(raw);
 }
 const [byEvent,byDay,slides,readings,detailRows]=await Promise.all([
  env.DB.prepare('SELECT event, COUNT(*) AS count FROM events GROUP BY event ORDER BY event').all(),
  env.DB.prepare("SELECT substr(ts, 1, 10) AS day, COUNT(*) AS count FROM events GROUP BY day ORDER BY day").all(),
  env.DB.prepare("SELECT page, COUNT(*) AS count FROM events WHERE event = 'slide_viewed' GROUP BY page ORDER BY count DESC LIMIT 10").all(),
  env.DB.prepare("SELECT page, COUNT(*) AS count FROM events WHERE event = 'reading_opened' GROUP BY page ORDER BY count DESC LIMIT 10").all(),
  env.DB.prepare("SELECT event, ts, page, detail FROM events WHERE event IN ('quiz_answered','quiz_completed','practice_answered','practice_completed') ORDER BY ts ASC LIMIT 10000").all(),
 ]);
 return json({
  counts_by_event:byEvent.results||[],
  counts_by_day:byDay.results||[],
  top_slides:slides.results||[],
  top_readings:readings.results||[],
  ...buildStats(detailRows.results||[],nameFilter),
 });
}

export default {
 async fetch(request,env){
  try{
   const url=new URL(request.url);
   const path=url.pathname.replace(/\/+$/,'')||'/';
   if(path==='/api/event'&&request.method==='POST') return await postEvent(request,env);
   if(path==='/api/stats'&&request.method==='GET') return await getStats(request,env);
   if(path.startsWith('/api/')) return json({error:'not found'},404);
   return json({error:'not found'},404);
  }catch(error){
   console.error(JSON.stringify({message:'request failed',name:error?.name||'Error'}));
   return json({error:'server error'},500);
  }
 },
};
