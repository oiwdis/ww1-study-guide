// Pure assessment functions. UI answer keys stay hidden until a whole test is submitted.
export const sections=['cartoons','knowledge','blanks','short'];
export function normalize(value){return String(value??'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
export function answered(question,value){return question.type==='mc'?Number.isInteger(value)&&value>=0&&value<question.options.length:typeof value==='string'&&value.trim().length>0;}
export function progress(test,attempt){return test.questions.filter(q=>answered(q,attempt?.responses?.[q.id])).length;}
export function complete(test,attempt){return progress(test,attempt)===test.questions.length;}
export function fresh(test){return {version:2,testId:test.id,responses:{},stage:'cartoons',finished:false,overrides:{},selfScores:{}};}
export function valid(test,a){
 if(!a||a.version!==2||a.testId!==test.id||!a.responses||Array.isArray(a.responses)||typeof a.responses!=='object'||typeof a.finished!=='boolean'||!sections.includes(a.stage))return false;
 if(Object.entries(a.responses).some(([id,value])=>{const q=test.questions.find(q=>q.id===id);return !q||!(q.type==='mc'?answered(q,value):typeof value==='string');}))return false;
 if(a.finished&&!complete(test,a))return false;
 if(!a.overrides||typeof a.overrides!=='object'||Array.isArray(a.overrides)||!a.selfScores||typeof a.selfScores!=='object'||Array.isArray(a.selfScores))return false;
 if(Object.entries(a.overrides).some(([id,v])=>v!==true||test.questions.find(q=>q.id===id)?.type!=='fill'))return false;
 return !Object.entries(a.selfScores).some(([id,v])=>test.questions.find(q=>q.id===id)?.type!=='short'||!Number.isInteger(v)||v<0||v>4);
}
export function restore(test,a){
 if(valid(test,a))return a;
 if(!a||a.version!==1||a.testId!==test.id||!a.responses||typeof a.responses!=='object'||Array.isArray(a.responses))return null;
 const restored=fresh(test),revised=new Set(test.revisedQuestionIds||[]);
 for(const q of test.questions){
  if(!revised.has(q.id)&&answered(q,a.responses[q.id]))restored.responses[q.id]=a.responses[q.id];
  if(q.type==='fill'&&a.overrides?.[q.id]===true)restored.overrides[q.id]=true;
  if(q.type==='short'&&Number.isInteger(a.selfScores?.[q.id])&&a.selfScores[q.id]>=0&&a.selfScores[q.id]<=4)restored.selfScores[q.id]=a.selfScores[q.id];
 }
 restored.stage=test.questions.find(q=>!answered(q,restored.responses[q.id]))?.section||'cartoons';
 restored.updatedScope=true;
 return restored;
}
export function isCorrect(q,value,override=false){return q.type==='mc'?value===q.answer:q.type==='fill'?(override||q.accepted.some(a=>normalize(a)===normalize(value))):null;}
export function score(test,a){
 const objective=test.questions.filter(q=>q.type!=='short');
 const correct=objective.filter(q=>answered(q,a.responses[q.id])&&isCorrect(q,a.responses[q.id],a.overrides[q.id]===true)).length;
 const short=test.questions.filter(q=>q.type==='short');
 const reviewed=short.filter(q=>Number.isInteger(a.selfScores[q.id])).length;
 const selfTotal=short.reduce((n,q)=>n+(a.selfScores[q.id]??0),0);
 return {correct,total:objective.length,reviewed,selfTotal,selfMax:short.length*4,combined:reviewed===short.length?correct+selfTotal:null};
}
