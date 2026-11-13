const NAME_KEY='wwi-learner-name';
const SESSION_KEY='wwi-analytics-session';
let editingName=false;

export function cleanName(value){
 return String(value??'').replace(/[\u0000-\u001F\u007F]/g,'').replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,40);
}
export function learnerName(){
 try{
  const raw=localStorage.getItem(NAME_KEY);
  if(raw==null) return {decided:false,name:''};
  const parsed=JSON.parse(raw);
  return {decided:true,name:cleanName(parsed?.name)};
 }catch{return {decided:false,name:''};}
}
export function hasLearnerName(){return cleanName(learnerName().name).length>=2;}
export function saveLearnerName(value){
 const name=cleanName(value);
 if(name.length<2) return '';
 localStorage.setItem(NAME_KEY,JSON.stringify({name}));
 return name;
}
export function setEditingName(value){editingName=!!value;}
export function isEditingName(){return editingName;}
export function displayName(name){return cleanName(name)||'Anonymous';}

function sessionId(){
 try{
  let id=sessionStorage.getItem(SESSION_KEY);
  if(!id){id=crypto.randomUUID();sessionStorage.setItem(SESSION_KEY,id);}
  return id;
 }catch{return crypto.randomUUID();}
}
export function track(event,page,detail={}){
 try{
  const body=JSON.stringify({session_id:sessionId(),event,page:page||null,detail});
  if(typeof fetch==='function'){
   fetch('/api/event',{method:'POST',body,headers:{'content-type':'application/json'},keepalive:true}).catch(()=>{});
   return;
  }
  // String beacons are sent as text/plain. The endpoint accepts that when the body is JSON.
  if(typeof navigator.sendBeacon==='function') navigator.sendBeacon('/api/event',body);
 }catch{/* tracking must not affect the study guide */}
}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function nameLine({attr='data-action',button=''}={}){
 if(hasLearnerName()&&!editingName) return `<p class="name-note"><span>${esc(learnerName().name)}</span> <button type="button" class="source-button" ${attr}="change-name">Not you? Change name</button></p>`;
 const practice=attr==='data-extra';
 const fieldId=practice?'learner-name-practice':'learner-name';
 const hintId=practice?'name-hint-practice':'name-hint';
 const shown=editingName?learnerName().name:'';
 const ready=cleanName(shown).length>=2;
 const control=button?`<button type="button" class="btn small" ${attr}="save-name" ${ready?'':'disabled'}>${esc(button)}</button>`:'';
 return `<div class="name-prompt"><label class="name-field">Name <input id="${fieldId}" class="search" maxlength="40" autocomplete="nickname" aria-describedby="${hintId}" value="${esc(shown)}"></label><p class="mini name-hint" id="${hintId}">Enter your name to start</p>${control}</div>`;
}
