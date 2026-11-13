import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker,{EVENTS,clientSignals,cleanName,buildStats} from '../src/index.js';

const migration=readFileSync(new URL('../migrations/0001_events.sql',import.meta.url),'utf8');
const beacon=`<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "1623854f513a4814b9dbfb2ead5f1b6f"}'></script>`;

function database(){
 const db=new DatabaseSync(':memory:');
 db.exec(migration);
 return {
  prepare(sql){
   const statement=(...params)=>({
    run:async()=>{db.prepare(sql).run(...params);return {success:true};},
    all:async()=>({results:db.prepare(sql).all(...params)}),
    first:async()=>db.prepare(sql).get(...params)??null,
   });
   return {bind(...params){return statement(...params);},...statement()};
  },
  async batch(statements){const out=[];for(const statement of statements)out.push(await statement.run());return out;},
  rows(sql,...params){return db.prepare(sql).all(...params);},
 };
}
const session='11111111-1111-4111-8111-111111111111';
const attempt='22222222-2222-4222-8222-222222222222';
function post(db,body,headers={}){
 return worker.fetch(new Request('https://ww1.example/api/event',{method:'POST',headers:{'content-type':'application/json','user-agent':'Mozilla/5.0 Chrome/120.0.0.0', ...headers},body:JSON.stringify(body)}),{DB:db,STATS_KEY:'test-secret'});
}
function event(detail,event='section_view',page='summary'){
 return {session_id:session,event,page,detail};
}

test('the public analytics beacon is on every HTML page',()=>{
 for(const file of ['index.html','stats.html']){
  const html=readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');
  assert.equal(html.includes(beacon),true,file);
  assert.ok(html.lastIndexOf(beacon)<html.lastIndexOf('</body>'));
 }
 const stats=readFileSync(new URL('../dist/stats.html',import.meta.url),'utf8');
 assert.equal(stats.includes('Anonymous study activity'),false);
 assert.equal(stats.includes('Remember on this device'),true);
});

test('client signals keep country and browser family only',()=>{
 const signals=clientSignals({cf:{country:'fr',ip:'203.0.113.8'},headers:new Headers({'user-agent':'Mozilla/5.0 (iPhone) Mobile Safari/605.1'})});
 assert.deepEqual(signals,{country:'FR',ua_family:'Safari',device_type:'mobile'});
 assert.equal(JSON.stringify(signals).includes('203.0.113.8'),false);
 assert.equal(cleanName('  Ada <script>  '),'Ada script');
});

test('event endpoint validates, caps, and stores anonymous rows',async()=>{
 const db=database();
 assert.equal((await post(db,event({section:'nope'}))).status,400);
 assert.equal((await post(db,{session_id:'nope',event:'section_view',page:'summary',detail:{section:'summary'}})).status,400);
 assert.equal((await post(db,{...event({section:'summary'}),event:'not-real'})).status,400);
 const huge=new Request('https://ww1.example/api/event',{method:'POST',headers:{'content-type':'application/json','content-length':'999999'},body:'{}'});
 assert.equal((await worker.fetch(huge,{DB:db,STATS_KEY:'test-secret'})).status,413);
 const ok=await post(db,event({section:'summary'}));
 assert.equal(ok.status,204);
 const [row]=db.rows('SELECT * FROM events');
 assert.equal(row.event,'section_view');
 assert.equal(row.country,null);
 assert.equal(row.ua_family,'Chrome');
 assert.equal(row.device_type,'desktop');
 assert.equal(Object.hasOwn(row,'ip'),false);
 assert.deepEqual(JSON.parse(row.detail),{section:'summary'});
});

test('practice completion stores each answer and stats group them by name',async()=>{
 const db=database();
 const answers=[
  {question_id:'t1-q01',type:'mc',chosen_index:2,chosen_text:'Wrong choice',correct_index:0,correct_text:'Right choice',correct:false,time_spent_ms:1200,stem:'Which alliance?'},
  {question_id:'t1-q02',type:'fill',chosen_index:null,chosen_text:'Marne',correct_index:null,correct_text:'Marne',correct:true,time_spent_ms:800,stem:'First battle'},
 ];
 const saved=await post(db,{session_id:session,event:'practice_completed',page:'practice/1',detail:{attempt_id:attempt,test_id:1,letter:'A',correct:1,total:2,percent:50,duration_ms:9000,name:'  Ada <b> ',answers}});
 assert.equal(saved.status,204);
 const rows=db.rows('SELECT event, detail FROM events ORDER BY event');
 assert.deepEqual(rows.map(row=>row.event),['practice_answered','practice_answered','practice_completed']);
 assert.equal(JSON.parse(rows.find(row=>row.event==='practice_completed').detail).name,'Ada b');
 assert.equal(JSON.parse(rows.find(row=>row.event==='practice_completed').detail).answers,undefined);
 await post(db,{session_id:session,event:'quiz_completed',page:'quiz',detail:{attempt_id:'33333333-3333-4333-8333-333333333333',correct:1,total:1,percent:100,duration_ms:1000,name:''}});
 await post(db,{session_id:session,event:'quiz_answered',page:'quiz',detail:{attempt_id:'33333333-3333-4333-8333-333333333333',question_id:'q001',type:'mc',chosen_index:0,chosen_text:'Wrong choice',correct_index:1,correct_text:'Right choice',correct:false,time_spent_ms:500,stem:'MAIN',name:''}});
 await post(db,{session_id:session,event:'slide_viewed',page:'slides/12',detail:{slide:12}});
 await post(db,{session_id:session,event:'reading_opened',page:'readings/1',detail:{reading:1}});
 const stats=await worker.fetch(new Request('https://ww1.example/api/stats'),{DB:db,STATS_KEY:'test-secret'});
 assert.equal(stats.status,401);
 const body=await (await worker.fetch(new Request('https://ww1.example/api/stats',{headers:{authorization:'Bearer test-secret'}}),{DB:db,STATS_KEY:'test-secret'})).json();
 assert.equal(body.attempts_by_name.find(item=>item.name==='Ada b').attempts,1);
 assert.equal(body.attempts_by_name.find(item=>item.name==='Anonymous').attempts,1);
 assert.equal(body.top_slides[0].page,'slides/12');
 assert.equal(body.top_readings[0].page,'readings/1');
 assert.equal(body.sessions,1);
 assert.equal(body.events,7);
 assert.equal(body.quiz_score_average.average_percent,100);
 assert.equal(body.practice_score_average.average_percent,50);
 assert.equal(body.most_missed[0].question_id,'t1-q01');
 assert.equal(body.most_missed[0].most_common_wrong.text,'Wrong choice');
 const ada=await (await worker.fetch(new Request('https://ww1.example/api/stats?name=Ada%20b',{headers:{authorization:'Bearer test-secret'}}),{DB:db,STATS_KEY:'test-secret'})).json();
 assert.equal(ada.recent_attempts.length,1);
 assert.equal(ada.recent_attempts[0].name,'Ada b');
 assert.equal(ada.recent_attempts[0].questions.length,2);
 assert.equal(ada.recent_attempts[0].questions[0].chosen_index,2);
 const anon=await (await worker.fetch(new Request('https://ww1.example/api/stats?name=Anonymous',{headers:{authorization:'Bearer test-secret'}}),{DB:db,STATS_KEY:'test-secret'})).json();
 assert.equal(anon.recent_attempts.length,1);
 assert.equal(anon.recent_attempts[0].name,'Anonymous');
 assert.equal(anon.recent_attempts[0].questions[0].correct,false);
});

test('a session cannot exceed the per-minute event guard',async()=>{
 const db=database();
 const stamp=new Date().toISOString();
 const insert=db.prepare('INSERT INTO events (id, ts, session_id, event, page, detail, country, ua_family, device_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
 for(let i=0;i<200;i++) await insert.bind(`id-${i}`,stamp,session,'section_view','summary','{"section":"summary"}',null,'Chrome','desktop').run();
 assert.equal((await post(db,event({section:'summary'}))).status,429);
});

test('stats aggregation is name-aware without raw identifiers',()=>{
 const rows=[{event:'quiz_completed',ts:'2026-11-13T00:00:00.000Z',page:'quiz',detail:JSON.stringify({attempt_id:attempt,correct:0,total:1,percent:0,duration_ms:10,name:'Sam'})}];
 const stats=buildStats(rows,'Sam');
 assert.equal(stats.recent_attempts[0].name,'Sam');
 assert.deepEqual(EVENTS.includes('quiz_answered'),true);
});
