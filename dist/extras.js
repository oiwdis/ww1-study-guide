import {sections,answered,progress,complete,fresh,valid,isCorrect,score} from './practice-engine.mjs';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={cartoons:'Political cartoons',knowledge:'Content knowledge',blanks:'Fill in the blank',short:'Short answers'};
const STORE='wwi-practice-v1';
let readings,timeline,practice,attempts={},storageOK=true;
let timelineQuery='',timelineEra='all',timelineTopic='all';
const heading=(label,title,text,action='')=>`<div class="section-top"><div><p class="kicker">${label}</p><h2>${title}</h2><p>${text}</p></div>${action}</div>`;
const scrollTop=()=>window.scrollTo({top:$('#main').offsetTop-70,behavior:'instant'});
const announce=s=>{$('#live').textContent=s;};
const jump=id=>requestAnimationFrame(()=>{const el=document.getElementById(id);if(el){el.scrollIntoView({block:'start',behavior:'instant'});el.focus({preventScroll:true});}});
function source(s){const reading=s.kind==='reading';return `<a class="source-button" href="#${reading?`readings/${s.reading}/${s.page}`:s.kind==='slides'?`slides/${s.first}`:`paris/documents/${s.first}`}">${reading?`Reading ${s.reading} · page ${s.page}`:`${s.kind==='slides'?'Slides':'Document pages'} ${s.first}${s.last&&s.last!==s.first?'–'+s.last:''}`} ↗</a>`;}
const refs=arr=>`<div class="extra-sources">${arr.map(source).join('')}</div>`;
function save(){try{localStorage.setItem(STORE,JSON.stringify(attempts));}catch{storageOK=false;}updateSaveLabel();}
function updateSaveLabel(){const el=$('#exam-save');if(el)el.textContent=storageOK?'Progress saves automatically in this browser.':'Browser storage is unavailable. Keep this page open to retain your progress.';}
export async function initExtras(){
 [readings,timeline,practice]=await Promise.all(['readings.json','timeline.json','practice-tests.json'].map(async name=>{const r=await fetch(name);if(!r.ok)throw new Error(`Could not load ${name}`);return r.json();}));
 try{const saved=JSON.parse(localStorage.getItem(STORE)||'{}');for(const t of practice.tests)if(valid(t,saved?.[t.id]))attempts[t.id]=saved[t.id];localStorage.setItem('wwi-extras-check','1');localStorage.removeItem('wwi-extras-check');}catch{storageOK=false;}
 document.addEventListener('click',onClick);document.addEventListener('input',onInput);document.addEventListener('change',onChange);
}
export function renderExtra(active,bits){
 if(active==='readings')renderReadings(Number(bits[1])||1,Number(bits[2]));
 if(active==='timeline')renderTimeline();
 if(active==='practice'){
  const test=practice.tests.find(t=>t.id===Number(bits[1]));
  if(!test){renderTestList();scrollTop();return;}
  if(!attempts[test.id]){attempts[test.id]=fresh(test);save();}
  const a=attempts[test.id];if(sections.includes(bits[2])){a.stage=bits[2];save();}
  a.finished?renderResults(test,a):renderTest(test,a);
 }
 if(['readings','timeline','practice'].includes(active))scrollTop();
}
function renderReadings(id,page){
 const r=readings.find(x=>x.id===id)||readings[0];
 $('#panel-readings').innerHTML=heading('03 / READINGS','Readings','Three homework readings, each with detailed notes followed by every original textbook page.')+
 `<nav class="reading-picker" aria-label="Choose a homework reading">${readings.map(x=>`<a href="#readings/${x.id}" ${x.id===r.id?'aria-current="page"':''}><span class="kicker">READING 0${x.id} · ${x.pageCount} PAGES</span><strong>${esc(x.title)}</strong><span>${esc(x.subtitle)}</span></a>`).join('')}</nav>
 <article class="reading-summary"><div class="reading-heading"><p class="kicker">READING 0${r.id} / SUMMARY</p><h3>${esc(r.title)}</h3><p class="reading-deck">${esc(r.intro)}</p><div class="button-row"><a class="btn small" href="#readings/${r.id}/1">Jump to original pages ↓</a><a class="btn small ghost" href="${r.pdf}" download="${esc(r.filename)}">Download original PDF ↓</a></div></div>
 <div class="reading-body">${r.blocks.map((b,i)=>`<section><span class="reading-section-no">${String(i+1).padStart(2,'0')}</span><div><h4>${esc(b.title)}</h4><p>${esc(b.text)}</p></div></section>`).join('')}
 <div class="reading-terms"><h4>Terms to know</h4><dl>${Object.entries(r.keyTerms).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>
 <div class="takeaway reading-connections"><b>Check your understanding</b><ul>${r.connections.map(c=>`<li>${esc(c)}</li>`).join('')}</ul></div>
 <details class="source-notes"><summary>Source notes & historical clarifications</summary><ul>${r.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></details></div></article>
 <section class="reading-originals" aria-label="Original textbook pages"><div class="section-top"><div><p class="kicker">READING 0${r.id} / THE ORIGINAL PAGES</p><h3>From the textbook</h3><p>All ${r.pageCount} pages, in the order supplied in ${esc(r.filename)}. Select an image to open it at full size.</p></div><a class="btn small" href="${r.pdf}" target="_blank" rel="noopener">Open original PDF ↗</a></div>${r.id===3?'<div class="note">This bundle jumps between textbook pages. The uploaded order is preserved; the summary above follows the historical sequence.</div>':''}
 ${r.pages.map(p=>`<figure class="textbook-page" id="reading-page-${r.id}-${p.number}" tabindex="-1"><figcaption><strong>Page ${p.number} of ${r.pageCount}</strong><span>${esc(p.label)}</span></figcaption><a href="${p.image}" target="_blank" rel="noopener" aria-label="Open reading ${r.id} page ${p.number} at full size"><img src="${p.image}" loading="lazy" width="1800" height="2400" alt="Original textbook photograph, reading ${r.id}, uploaded page ${p.number}: ${esc(p.label)}"></a></figure>`).join('')}</section>`;
 if(page>=1&&page<=r.pageCount)jump(`reading-page-${r.id}-${page}`);
}
function renderTimeline(){
 $('#panel-timeline').innerHTML=heading('06 / TIMELINE','Timeline','84 dated events and periods from the slides, conference documents, and homework readings. Follow the chronology, or filter it by theme.')+
 `<div class="timeline-intro"><div><span class="timeline-big">1815—1948</span><p>Background, war, and aftermath</p></div><p>The main conflict runs from <strong>1914 to 1918</strong>; the settlement extends beyond the armistice. Earlier and later entries provide context from your sources. Date ranges are positioned by their starting date.</p></div>
 <div class="timeline-filters"><label class="search-wrap"><span class="sr-only">Search timeline</span><input id="timeline-search" class="search" type="search" placeholder="Search a date, event, person…" value="${esc(timelineQuery)}"></label><label><span class="sr-only">Filter timeline by era</span><select id="timeline-era"><option value="all">Every era</option>${[...new Set(timeline.map(e=>e.era))].map(e=>`<option ${e===timelineEra?'selected':''}>${esc(e)}</option>`).join('')}</select></label><label><span class="sr-only">Filter timeline by theme</span><select id="timeline-topic"><option value="all">Every theme</option>${[...new Set(timeline.map(e=>e.topic))].map(e=>`<option ${e===timelineTopic?'selected':''}>${esc(e)}</option>`).join('')}</select></label><button class="btn small ghost" data-extra="reset-timeline">Reset</button></div>
 <p class="mini muted" id="timeline-count" role="status"></p><div class="full-timeline" id="timeline-events"></div>`;
 renderEvents();
}
function renderEvents(){
 const query=timelineQuery.trim().toLowerCase();
 const events=timeline.filter(e=>(timelineEra==='all'||e.era===timelineEra)&&(timelineTopic==='all'||e.topic===timelineTopic)&&[e.date,e.title,e.text,e.note].join(' ').toLowerCase().includes(query));
 $('#timeline-count').textContent=`${events.length} of ${timeline.length} dated entries`;
 $('#timeline-events').innerHTML=events.length?events.map(e=>`<article class="event" id="${e.id}"><div class="event-date"><strong>${esc(e.date)}</strong><span>${esc(e.era)}</span></div><div class="event-content"><p class="kicker">${esc(e.topic)}</p><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p>${e.note?`<p class="event-note"><strong>Date note.</strong> ${esc(e.note)}</p>`:''}${refs(e.sources)}</div></article>`).join(''):'<div class="empty-search">No matching dates. Try a broader term or reset the filters.</div>';
}
function renderTestList(){
 const done=practice.tests.filter(t=>attempts[t.id]?.finished).length;
 $('#panel-practice').innerHTML=heading('05 / PRACTICE TESTS','Practice tests','Each test follows your teacher’s format. Answer every question, then submit to unlock that test’s complete answer key.')+
 `<div class="exam-intro"><div><p class="kicker">YOUR PRACTICE RECORD</p><h3>${done}<span> / 5</span></h3><p>tests completed</p></div><div class="exam-format"><span><b>05</b> Cartoon interpretations</span><span><b>10</b> Content multiple choice</span><span><b>07</b> Fill in the blank</span><span><b>02</b> Short answers</span></div><p>Combination choices and chronology questions appear in every test. Cartoons come from your slide deck. Short answers include models and a four-point self-check rubric.</p></div>
 <div class="test-grid">${practice.tests.map(t=>{const a=attempts[t.id],p=progress(t,a),g=a?.finished?score(t,a):null;return `<article class="test-card"><div class="test-card-top"><span class="test-letter">${t.letter}</span><span class="status-pill">${a?.finished?'Completed':p?'In progress':'Not started'}</span></div><h3>${esc(t.title)}</h3><p>${esc(t.focus)}</p><div class="test-card-progress"><span>${a?.finished?`${g.correct} / ${g.total} objective points`:p?`${p} / 24 responses saved`:'24 questions · 4 sections'}</span><div class="quiz-progress"><span style="width:${p/24*100}%"></span></div></div><a class="btn ${a?.finished?'':'primary'}" href="#practice/${t.id}">${a?.finished?'Review answers':p?'Continue test':'Start test'} →</a></article>`;}).join('')}<aside class="test-note"><h3>Explain the evidence.</h3><p>For cartoons, identify the symbols, the message, and the historical context. For short answers, connect causes to consequences with named examples.</p><p class="mini">Scores are study feedback, not a prediction of your teacher’s grading.</p></aside></div><p class="mini muted" id="exam-save"></p>`;
 updateSaveLabel();
}
function cartoonImage(key){const c=practice.cartoons[key];return `<figure class="exam-cartoon"><a href="${c.image}" target="_blank" rel="noopener" aria-label="Open cartoon at full size"><img src="${c.image}" alt="${esc(c.alt)}" loading="lazy"></a><figcaption>${esc(c.title)} · Original slide ${c.source.first} · Select image to enlarge${c.transcription?`<p>${esc(c.transcription)}</p>`:''}</figcaption></figure>`;}
function questionMarkup(q,i,a){const value=a.responses[q.id];return `<article class="exam-question" id="exam-${q.id}" tabindex="-1"><div class="exam-question-head"><span class="exam-number">${String(i+1).padStart(2,'0')}</span><span class="kicker">${q.cartoon?'INTERPRET THE SOURCE':q.chronology?'OLDEST → NEWEST':q.statements?'EVALUATE THE STATEMENTS':names[q.section]}</span><span class="response-state" data-response-state="${q.id}">${answered(q,value)?'Answered':'Not answered'}</span></div>${q.cartoon?cartoonImage(q.cartoon):''}<h3 id="stem-${q.id}">${esc(q.stem)}</h3>
 ${q.statements?`<ol type="A" class="exam-statements">${q.statements.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p class="mini muted">Letters A–C refer to the statements above. Choose one numbered answer below.</p>`:''}
 ${q.type==='mc'?`<fieldset class="options" aria-labelledby="stem-${q.id}"><legend class="sr-only">Choose one best answer</legend>${q.options.map((o,index)=>`<label class="option ${value===index?'selected':''}"><input type="radio" name="${q.id}" value="${index}" data-exam-answer="${q.id}" ${value===index?'checked':''}><span class="option-letter">${index+1}</span><span class="option-text">${esc(o)}</span></label>`).join('')}</fieldset>`:q.type==='fill'?`<label class="field"><span class="sr-only">Your answer for question ${i+1}</span><input class="exam-blank" type="text" data-exam-answer="${q.id}" aria-labelledby="stem-${q.id}" autocomplete="off" spellcheck="false" value="${esc(value??'')}" placeholder="Type the missing term or name…"></label>`:`<p class="mini muted">Aim for a developed paragraph with specific evidence. Your response is saved; the model and rubric unlock when you submit the whole test.</p><textarea data-exam-answer="${q.id}" aria-labelledby="stem-${q.id}" rows="7" placeholder="Explain your answer…">${esc(value??'')}</textarea>`}</article>`;}
function renderTest(t,a){
 const idx=sections.indexOf(a.stage),qs=t.questions.filter(q=>q.section===a.stage);
 $('#panel-practice').innerHTML=`<div class="exam-shell" data-exam-id="${t.id}"><div class="exam-topline"><a class="source-button" href="#practice">← All practice tests</a><span>TEST ${t.letter} · 24 QUESTIONS</span></div>${heading('YOUR PRACTICE TEST',esc(t.title),esc(t.focus))}<div class="exam-sticky"><div class="quiz-meta"><strong id="exam-progress-label"></strong><span>Answers unlock on submission</span></div><div class="quiz-progress" role="progressbar" aria-label="Test responses completed" aria-valuemin="0" aria-valuemax="24" id="exam-progress"><span></span></div><nav class="exam-steps" aria-label="Test sections">${sections.map((s,i)=>`<a href="#practice/${t.id}/${s}" ${a.stage===s?'aria-current="step"':''}><span>0${i+1}</span>${names[s]} <b data-section-progress="${s}"></b></a>`).join('')}</nav></div>
 <p class="mini muted" id="exam-save"></p><div class="exam-section-heading"><h3>${names[a.stage]}</h3><p>${a.stage==='cartoons'?'Use the visual evidence and the historical context. Each question has one best answer.':a.stage==='knowledge'?'Choose one best answer. Read combination statements and date sequences carefully.':a.stage==='blanks'?'Enter a term, name, or phrase. Capitalization and punctuation do not affect scoring.':'Explain relationships, use specific evidence, and answer every part of the prompt.'}</p></div>${qs.map(q=>questionMarkup(q,t.questions.indexOf(q),a)).join('')}
 <div class="exam-controls"><div class="button-row">${idx?`<a class="btn" href="#practice/${t.id}/${sections[idx-1]}">← Previous section</a>`:''}${idx<3?`<a class="btn primary" href="#practice/${t.id}/${sections[idx+1]}">Next section →</a>`:''}</div><button class="btn ${idx===3?'primary':'ghost'}" data-extra="submit-exam">Submit test & reveal answers →</button></div><div class="exam-submit-message" id="exam-submit-message" role="status"></div><p class="mini muted">All 24 responses are required. You can revise any response before submitting. Only this test’s answer key will unlock.</p></div>`;
 updateProgress(t,a);updateSaveLabel();
}
function updateProgress(t,a){
 const p=progress(t,a),label=$('#exam-progress-label');if(!label)return;
 label.textContent=`${p} / 24 answered`;
 const bar=$('#exam-progress');bar.setAttribute('aria-valuenow',p);$('span',bar).style.width=`${p/24*100}%`;
 for(const s of sections){const qs=t.questions.filter(q=>q.section===s);$(`[data-section-progress="${s}"]`).textContent=`${qs.filter(q=>answered(q,a.responses[q.id])).length}/${qs.length}`;}
}
function currentTest(){const id=Number($('.exam-shell')?.dataset.examId);return practice.tests.find(t=>t.id===id);}
function record(el){const t=currentTest();if(!t)return;const a=attempts[t.id];if(a.finished)return;const q=t.questions.find(q=>q.id===el.dataset.examAnswer);if(!q)return;
 a.responses[q.id]=q.type==='mc'?Number(el.value):el.value;save();updateProgress(t,a);
 const state=$(`[data-response-state="${q.id}"]`);state.textContent=answered(q,a.responses[q.id])?'Answered':'Not answered';
 if(q.type==='mc')$$('.option',el.closest('fieldset')).forEach(l=>l.classList.toggle('selected',$('input',l).checked));
 if($('#exam-submit-message'))$('#exam-submit-message').innerHTML='';
}
function resultQuestion(q,i,a){const value=a.responses[q.id],right=q.type!=='short'&&isCorrect(q,value,a.overrides[q.id]);return `<details class="exam-review" ${q.type==='short'?'open':''}><summary><span class="review-status">${q.type==='short'?'SELF-REVIEW':right?'✓ Correct':q.type==='fill'?'Review your wording':'× Incorrect'}</span><span>${i+1}. ${esc(q.stem)}</span></summary><div class="exam-review-body">${q.cartoon?cartoonImage(q.cartoon):''}${q.statements?`<ol type="A" class="exam-statements">${q.statements.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`:''}<div class="your-response"><strong>Your response</strong><p>${esc(q.type==='mc'?q.options[value]:value)}</p></div>
 ${q.type==='short'?`<h4>Model response</h4><p>${esc(q.model)}</p><h4>Four-point self-check</h4><p class="mini muted">Give yourself one point for each criterion your response meets. This is your own assessment, not automatic essay grading.</p><ol class="rubric">${q.rubric.map(r=>`<li>${esc(r)}</li>`).join('')}</ol><label class="self-score-label">My score for this response <select data-self-score="${q.id}"><option value="">Select 0–4</option>${[0,1,2,3,4].map(n=>`<option value="${n}" ${a.selfScores[q.id]===n?'selected':''}>${n} / 4</option>`).join('')}</select></label>`:`<div class="answer-key"><h4>${q.type==='fill'?'Expected answer':'Best answer'}</h4><p><strong>${esc(q.type==='mc'?q.options[q.answer]:q.answer)}</strong></p><p>${esc(q.explanation)}</p>${q.type==='fill'?`<label class="check-field"><input type="checkbox" data-fill-override="${q.id}" ${a.overrides[q.id]?'checked':''}> My wording is equivalent; count this answer as correct.</label><p class="mini muted">Use this only for a genuine synonym or spelling variant. Normal capitalization and punctuation are already accepted.</p>`:''}</div>`}${refs(q.sources)}</div></details>`;}
function renderResults(t,a){
 $('#panel-practice').innerHTML=`<div class="exam-shell" data-exam-id="${t.id}"><div class="exam-topline"><a class="source-button" href="#practice">← All practice tests</a><span>TEST ${t.letter} · COMPLETED</span></div><div class="result-hero exam-result"><p class="kicker">TEST ${t.letter} / ANSWER KEY</p><h2>${esc(t.title)}</h2><div id="exam-score"></div><a class="btn" href="#practice">Choose another test →</a></div><div class="review-instructions"><p>Open a question to compare your response with the key and source. Review the two short answers below and assign your own rubric scores.</p><button class="btn small ghost" data-extra="expand-review">Expand all answers</button></div>${t.questions.map((q,i)=>resultQuestion(q,i,a)).join('')}<div class="exam-retry"><h3>Try this test again?</h3><p>Starting over replaces only Test ${t.letter}’s saved responses and score. The other four tests stay saved.</p><button class="btn" data-extra="retry-exam">Start Test ${t.letter} again</button></div></div>`;
 updateScore(t,a);
}
function updateScore(t,a){const g=score(t,a);$('#exam-score').innerHTML=`<div class="score-number">${g.correct}<span> / ${g.total}</span></div><p>Objective points · 15 multiple choice + 7 blanks</p><div class="exam-score-details"><span>Short answers: <strong>${g.reviewed===2?`${g.selfTotal} / ${g.selfMax}`:`${g.reviewed} / 2 reviewed`}</strong></span><span>${g.combined!==null?`Combined: <strong>${g.combined} / ${g.total+g.selfMax}</strong> (includes your self-scores)`:'Add both short-answer self-scores for a combined total.'}</span></div>`;}
function onInput(e){if(e.target.dataset.examAnswer&&e.target.type!=='radio')record(e.target);if(e.target.id==='timeline-search'){timelineQuery=e.target.value;renderEvents();}}
function onChange(e){const el=e.target;if(el.dataset.examAnswer&&el.type==='radio')record(el);
 if(el.id==='timeline-era'||el.id==='timeline-topic'){if(el.id==='timeline-era')timelineEra=el.value;else timelineTopic=el.value;renderEvents();}
 if(el.dataset.selfScore||el.dataset.fillOverride){const t=currentTest(),a=t&&attempts[t.id];if(!a?.finished)return;if(el.dataset.selfScore){if(el.value==='')delete a.selfScores[el.dataset.selfScore];else a.selfScores[el.dataset.selfScore]=Number(el.value);}else{if(el.checked)a.overrides[el.dataset.fillOverride]=true;else delete a.overrides[el.dataset.fillOverride];const q=t.questions.find(q=>q.id===el.dataset.fillOverride);$('.review-status',el.closest('.exam-review')).textContent=isCorrect(q,a.responses[q.id],el.checked)?'✓ Correct':'Review your wording';}save();updateScore(t,a);}
}
function onClick(e){const b=e.target.closest('[data-extra]');if(!b)return;
 if(b.dataset.extra==='reset-timeline'){timelineQuery='';timelineEra='all';timelineTopic='all';renderTimeline();return;}
 const t=currentTest(),a=t&&attempts[t.id];if(!t)return;
 if(b.dataset.extra==='submit-exam'&&!a.finished){if(!complete(t,a)){const missing=t.questions.filter(q=>!answered(q,a.responses[q.id]));$('#exam-submit-message').innerHTML=`<strong>${missing.length} response${missing.length===1?'':'s'} still needed.</strong><p>Complete every question to unlock the answer key. Missing: ${missing.map(q=>`<a href="#practice/${t.id}/${q.section}" data-missing-question="${q.id}">${t.questions.indexOf(q)+1}</a>`).join(', ')}.</p>`;announce(`${missing.length} responses still needed before submission.`);return;}a.finished=true;save();renderResults(t,a);scrollTop();announce(`Test ${t.letter} completed. Its answer key is now available.`);}
 if(b.dataset.extra==='expand-review'){const all=$$('.exam-review'),open=all.some(d=>!d.open);all.forEach(d=>d.open=open);b.textContent=open?'Collapse answers':'Expand all answers';}
 if(b.dataset.extra==='retry-exam'){attempts[t.id]=fresh(t);save();if(location.hash===`#practice/${t.id}`)renderTest(t,attempts[t.id]);else location.hash=`practice/${t.id}`;scrollTop();}
}
document.addEventListener('click',e=>{const a=e.target.closest('[data-missing-question]');if(a){const id=a.dataset.missingQuestion;setTimeout(()=>jump(`exam-${id}`),0);}});
