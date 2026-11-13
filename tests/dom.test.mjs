import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {JSDOM,VirtualConsole} from 'jsdom';
import * as quizEngine from '../dist/quiz-engine.mjs';
import * as practiceEngine from '../dist/practice-engine.mjs';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const read=name=>fs.readFileSync(root+name,'utf8').replace(/\?v=[0-9a-f]{8,64}/g,''),bank=JSON.parse(read('quiz.json')),exams=JSON.parse(read('practice-tests.json'));
async function boot(saved={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));vc.on('error',e=>errors.push(String(e)));
 const dom=new JSDOM(read('index.html'),{url:'https://study.test/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.CSS={escape:s=>s};w.fetch=async name=>({ok:true,json:async()=>JSON.parse(read(name))});w.quizEngine=quizEngine;w.practiceEngine=practiceEngine;
 for(const [k,v] of Object.entries(saved))w.localStorage.setItem(k,v);
 w.navigator.sendBeacon=()=>true;
 const analytics=read('analytics.js').replace(/^export /gm,'');
 w.analytics=w.eval('(function(){'+analytics+';return {track,learnerName,saveLearnerName,cleanName,hasLearnerName,nameLine,setEditingName,isEditingName,displayName};})()');
 const extras=read('extras.js').replace(/import .*?from '\.\/practice-engine\.mjs';/,'const {sections,answered,progress,complete,fresh,valid,isCorrect,score}=window.practiceEngine;').replace(/import .*?from '\.\/analytics\.js';/,'const {track,learnerName,saveLearnerName,hasLearnerName,nameLine,setEditingName,isEditingName}=window.analytics;').replace(/export (async )?function/g,(_,a)=>(a||'')+'function');
 w.extras=w.eval('(function(){'+extras+';return {initExtras,renderExtra};})()');
 const app=read('app.js').replace("import {grade,newAttempt,validAttempt} from './quiz-engine.mjs';",'const {grade,newAttempt,validAttempt}=window.quizEngine;').replace("import {initExtras,renderExtra} from './extras.js';",'const {initExtras,renderExtra}=window.extras;').replace("import {track,learnerName,saveLearnerName,cleanName,hasLearnerName,nameLine,setEditingName,isEditingName} from './analytics.js';",'const {track,learnerName,saveLearnerName,cleanName,hasLearnerName,nameLine,setEditingName,isEditingName}=window.analytics;');
 await w.eval('(async()=>{'+app+'})()');
 const $=s=>w.document.querySelector(s),$$=s=>[...w.document.querySelectorAll(s)],settle=()=>new Promise(r=>setTimeout(r,35));
 const click=s=>{const el=typeof s==='string'?$(s):s;assert.ok(el,'Missing element: '+s);el.click();};
 const input=(s,value,event='input')=>{const el=$(s);assert.ok(el,s);el.value=value;el.dispatchEvent(new w.Event(event,{bubbles:true}));};
 const route=async hash=>{w.location.hash=hash;await settle();};
 return {dom,w,errors,$,$$,click,input,route,settle};
}
const ctx=await boot();const {w,$,$$,click,input,route,settle}=ctx;
assert.equal($('#loading').hidden,true);assert.equal($$('[data-tab]').length,7);assert.equal($$('.chapter').length,14);
input('#summary-search','trench foot');assert.equal($$('.chapter').length,1);input('#summary-search','');
click('[data-action=expand-summary]');assert.equal($$('.chapter[open]').length,14);
await route('slides/127');assert.match($('#slides-page').src,/127.webp/);assert.equal($$('[data-jump=slides] option').length,127);assert.equal($('[data-page-step="1"]').disabled,true);
await route('paris');assert.equal($$('.country').length,17);input('#country-search','Balfour');assert.equal($$('.country').length,1);input('#country-search','');await route('paris/documents/21');assert.equal($$('[data-jump=documents] option').length,21);
let images=0;
for(const [id,count] of [[1,4],[2,3],[3,5]]){await route('readings/'+id);assert.equal($$('.textbook-page').length,count);images+=count;assert.equal($('.reading-picker [aria-current]').getAttribute('href'),'#readings/'+id);assert.ok($('.reading-summary').compareDocumentPosition($('.reading-originals'))&w.Node.DOCUMENT_POSITION_FOLLOWING);assert.ok($$('.reading-body>section').length>=8);await route(`readings/${id}/${count}`);assert.ok($(`#reading-page-${id}-${count}`));}
assert.equal(images,12);
await route('timeline');assert.equal($$('.event').length,84);input('#timeline-search','Lusitania');assert.equal($$('.event').length,1);assert.match($('.event').textContent,/1915/);click('[data-extra=reset-timeline]');input('#timeline-era','Background','change');assert.ok($$('.event').length<84&&$$('.event').length>10);click('[data-extra=reset-timeline]');assert.equal($$('.event').length,84);
await route('quiz');assert.equal($('#quiz-start').disabled,true);assert.equal($('#name-hint').textContent,'Enter your name to start');assert.equal($('[data-action=skip-name]'),null);
await route('practice');assert.equal($$('.test-card').length,5);assert.match($('.exam-intro').textContent,/0\s*\/ 5/);assert.equal($('#panel-practice #learner-name-practice'),null);
let named=false;
for(const t of exams.tests){
 await route('practice/'+t.id);
 if(!named){assert.equal($('#panel-practice [data-extra=save-name]').disabled,true);assert.equal($('#name-hint-practice').textContent,'Enter your name to start');input('#learner-name-practice','A');assert.equal($('#panel-practice [data-extra=save-name]').disabled,true);input('#learner-name-practice','  Ada  ');assert.equal($('#panel-practice [data-extra=save-name]').disabled,false);click('#panel-practice [data-extra=save-name]');named=true;}
 assert.equal($('#panel-practice #learner-name-practice'),null);assert.match($('#panel-practice [data-extra=change-name]').textContent,/Not you\? Change name/);assert.equal($$('.exam-question').length,5);assert.equal($$('.exam-cartoon').length,5);assert.equal($$('.answer-key').length,0);assert.equal($$('.exam-review').length,0);
 click('[data-extra=submit-exam]');assert.match($('#exam-submit-message').textContent,/24 responses still needed/);assert.equal($$('.answer-key').length,0);
 for(const section of practiceEngine.sections){await route(`practice/${t.id}/${section}`);const qs=t.questions.filter(q=>q.section===section);assert.equal($$('.exam-question').length,qs.length);
  for(const q of qs){
   if(q.type==='mc'){let value=q.answer;if(t.id===2&&q===t.questions[0])value=(value+1)%q.options.length;const el=$(`input[data-exam-answer="${q.id}"][value="${value}"]`);el.checked=true;el.dispatchEvent(new w.Event('change',{bubbles:true}));}
   else input(`[data-exam-answer="${q.id}"]`,q.type==='fill'?(t.id===2&&q===t.questions[15]?'a spelling variant':q.answer):'A detailed historical explanation with named examples and consequences.');
   assert.equal($$('.answer-key').length,0);assert.equal($$('.exam-review').length,0);
  }
 }
 assert.match($('#exam-progress-label').textContent,/24 \/ 24/);
 if(t.id===1){const last=t.questions.at(-1);input(`[data-exam-answer="${last.id}"]`,'  ');click('[data-extra=submit-exam]');assert.match($('#exam-submit-message').textContent,/1 response still needed/);assert.equal($$('.answer-key').length,0);input(`[data-exam-answer="${last.id}"]`,'A completed explanation of the reasons for American entry.');await route('summary');await route('practice/1');assert.match($('#exam-progress-label').textContent,/24 \/ 24/);assert.equal($$('textarea').length,2);assert.match($('textarea').value,/historical explanation/);}
 click('[data-extra=submit-exam]');assert.equal($$('.exam-review').length,24);assert.equal($$('.answer-key').length,22);assert.match($('.exam-result').textContent,/ANSWER KEY/);assert.match($('#exam-score').textContent,new RegExp((t.id===2?20:22)+'\\s*\\/ 22'));
 for(const [i,q] of t.questions.filter(q=>q.type==='short').entries())input(`[data-self-score="${q.id}"]`,String(i?4:3),'change');
 if(t.id===2){const q=t.questions[15],el=$(`[data-fill-override="${q.id}"]`);el.checked=true;el.dispatchEvent(new w.Event('change',{bubbles:true}));assert.match($('#exam-score').textContent,/21\s*\/ 22/);assert.match($('#exam-score').textContent,/28 \/ 30/);}
 else assert.match($('#exam-score').textContent,/29 \/ 30/);
 await route('practice');assert.match($('.exam-intro').textContent,new RegExp(t.id+'\\s*\\/ 5'));
}
await route('quiz');assert.equal($('#learner-name'),null);assert.match($('[data-action=change-name]').textContent,/Not you\? Change name/);$('#quiz-size').value='10';$('#quiz-shuffle').checked=false;$('#quiz-config').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal($('[data-action=check]').disabled,true);
const radio=$(`input[name=answer][value="${bank[0].answer}"]`);radio.checked=true;radio.dispatchEvent(new w.Event('change',{bubbles:true}));click('[data-action=check]');assert.match($('.feedback').textContent,/Correct/);assert.ok($$('input[name=answer]').every(x=>x.disabled));click('[data-action=finish]');assert.match($('.result-hero').textContent,/1 of 10 correct/);
const saved=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));assert.deepEqual(ctx.errors,[]);ctx.dom.window.close();
const resumed=await boot(saved);await resumed.route('practice');assert.match(resumed.$('.exam-intro').textContent,/5\s*\/ 5/);await resumed.route('practice/2');assert.match(resumed.$('#exam-score').textContent,/28 \/ 30/);assert.equal(resumed.$$('.exam-review').length,24);resumed.click('[data-extra=retry-exam]');await resumed.settle();assert.equal(resumed.$$('.answer-key').length,0);assert.match(resumed.$('#exam-progress-label').textContent,/0 \/ 24/);await resumed.route('practice');assert.match(resumed.$('.exam-intro').textContent,/4\s*\/ 5/);assert.deepEqual(resumed.errors,[]);resumed.dom.window.close();
console.log('PASS: seven tabs, all source viewers, 12 reading pages, 84-event filtering, five complete exam flows, locked answer keys, incomplete submission, saved responses, all scoring types, self-review, reload persistence, isolated retry, and original quiz regression.');
