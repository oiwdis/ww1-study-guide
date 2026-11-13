import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import * as p from '../dist/practice-engine.mjs';
import * as q from '../dist/quiz-engine.mjs';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const json=name=>JSON.parse(readFileSync(join(root,name),'utf8'));
const practice=json('practice-tests.json'),readings=json('readings.json'),timeline=json('timeline.json'),bank=json('quiz.json');
function source(s){if(s.kind==='reading'){const r=readings.find(r=>r.id===s.reading);assert.ok(r);assert.ok(s.page>=1&&s.page<=r.pageCount);}else{assert.ok(['slides','documents'].includes(s.kind));assert.ok(s.first>=1&&s.last>=s.first&&s.last<=(s.kind==='slides'?127:21));}}
test('five unique exams match the requested format and every source resolves',()=>{
 assert.equal(practice.tests.length,5);const stems=new Set(),ids=new Set(),choiceCounts=new Set();
 for(const t of practice.tests){assert.equal(t.questions.length,24);assert.deepEqual(p.sections.map(s=>t.questions.filter(q=>q.section===s).length),[5,10,7,2]);assert.ok(t.questions.some(q=>q.chronology));assert.ok(t.questions.filter(q=>q.statements).length>=2);
  for(const x of t.questions){assert.ok(!stems.has(x.stem));stems.add(x.stem);assert.ok(!ids.has(x.id));ids.add(x.id);x.sources.forEach(source);
   if(x.type==='mc'){assert.ok(x.options.length>=4&&x.options.length<=8);choiceCounts.add(x.options.length);assert.equal(new Set(x.options).size,x.options.length);assert.ok(x.options[x.answer]);assert.ok(x.explanation.length>30);}
   if(x.type==='fill'){assert.ok(x.accepted.includes(x.answer));assert.ok(x.explanation);}
   if(x.type==='short'){assert.equal(x.rubric.length,4);assert.ok(x.model.split(' ').length>=70);}
   if(x.cartoon){const c=practice.cartoons[x.cartoon];assert.ok(c);assert.ok(existsSync(join(root,c.image)));assert.ok(c.alt);source(c.source);}
  }
 }
 assert.equal(stems.size,120);assert.deepEqual([...choiceCounts].sort(),[4,5,6,7,8]);
});
test('each exam gates submission, grades all answers, and validates restored state',()=>{
 for(const t of practice.tests){const a=p.fresh(t);assert.ok(p.valid(t,a));assert.equal(p.complete(t,a),false);assert.equal(p.progress(t,a),0);assert.equal(p.valid(t,{...a,finished:true}),false);
  for(const x of t.questions)a.responses[x.id]=x.type==='mc'?x.answer:x.type==='fill'?x.answer:'An explained historical response.';
  assert.equal(p.progress(t,a),24);assert.ok(p.complete(t,a));a.finished=true;assert.ok(p.valid(t,a));assert.equal(p.score(t,a).correct,22);assert.equal(p.score(t,a).combined,null);
  for(const x of t.questions.filter(q=>q.type==='short'))a.selfScores[x.id]=4;
  assert.equal(p.score(t,a).combined,30);assert.equal(p.score(t,a).selfTotal,8);
  const x=t.questions[0];a.responses[x.id]=x.options.length;assert.equal(p.valid(t,a),false);a.responses[x.id]=x.answer;
  const blank=t.questions.find(q=>q.type==='fill');a.responses[blank.id]='  ';assert.equal(p.complete(t,a),false);assert.equal(p.valid(t,a),false);a.responses[blank.id]='another wording';assert.equal(p.score(t,a).correct,21);a.overrides[blank.id]=true;assert.equal(p.score(t,a).correct,22);
  a.selfScores[t.questions.at(-1).id]=5;assert.equal(p.valid(t,a),false);
 }
});
test('fill-in normalization accepts punctuation/case variants without accepting wrong content',()=>{
 const blanks=practice.tests.flatMap(t=>t.questions.filter(q=>q.type==='fill'));
 for(const x of blanks)for(const a of x.accepted)assert.ok(p.isCorrect(x,'  '+a.toUpperCase()+'  '));
 assert.equal(p.normalize('Brest-Litovsk'),p.normalize('brest litovsk'));
 assert.equal(p.normalize('Clemenceau'),p.normalize('Clémenceau'));
 assert.equal(p.isCorrect(blanks[0],'Paris'),false);
 assert.equal(p.answered(blanks[0],' \n\t'),false);
});
test('readings include every original page and substantial summaries',()=>{
 assert.deepEqual(readings.map(r=>r.pageCount),[4,3,5]);
 for(const r of readings){assert.equal(r.pages.length,r.pageCount);assert.ok(r.blocks.length>=8);assert.ok(r.blocks.every(b=>b.title&&b.text));assert.ok(statSync(join(root,r.pdf)).size>1e6);for(const page of r.pages)assert.ok(existsSync(join(root,page.image)));}
});
test('timeline is ordered and has valid source links',()=>{
 assert.equal(timeline.length,84);assert.equal(new Set(timeline.map(e=>e.id)).size,84);
 for(let i=0;i<timeline.length;i++){const e=timeline[i];assert.ok(e.date&&e.title&&e.text&&e.era&&e.topic);e.sources.forEach(source);if(i)assert.ok(timeline[i-1].sort<=e.sort);}
});
test('existing 112-question quiz and 148 original pages remain valid',()=>{
 assert.equal(bank.length,112);assert.deepEqual([...new Set(bank.map(x=>x.options.length))].sort((a,b)=>a-b),[4,5,6,7,8,9,10]);
 for(const x of bank){assert.ok(x.options[x.answer]);source(x.source);}
 const a=q.newAttempt(bank,{randomize:false}),perfect=Object.fromEntries(bank.map(x=>[x.id,x.answer]));assert.ok(q.validAttempt(a,bank));assert.equal(q.grade(bank,a.ids,perfect).percent,100);
 const pages=json('assets/page-index.json');assert.equal(pages.length,148);for(const page of pages)assert.ok(existsSync(join(root,`assets/${page.section}/${String(page.number).padStart(3,'0')}.webp`)));
});
