import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {stampDirectory, stampText, HEADERS} from '../scripts/stamp-assets.mjs';

test('asset stamps are content hashes and stay stable when rerun',()=>{
 const dir=mkdtempSync(join(tmpdir(),'ww1-stamp-'));
 writeFileSync(join(dir,'app.js'),"import {track} from './analytics.js';\n");
 writeFileSync(join(dir,'analytics.js'),'export function track(){}\n');
 writeFileSync(join(dir,'styles.css'),'body{margin:0}\n');
 writeFileSync(join(dir,'index.html'),'<link rel="stylesheet" href="styles.css"><script src="app.js" type="module"></script><script src="https://static.cloudflareinsights.com/beacon.min.js"></script>');
 const first=stampDirectory(dir);
 assert.match(first.version,/^[0-9a-f]{12}$/);
 const html=readFileSync(join(dir,'index.html'),'utf8');
 assert.match(html,new RegExp(`href="styles\\.css\\?v=${first.version}"`));
 assert.match(html,new RegExp(`src="app\\.js\\?v=${first.version}"`));
 assert.match(html,/beacon\.min\.js"/);
 assert.doesNotMatch(html,/beacon\.min\.js\?v=/);
 assert.match(readFileSync(join(dir,'app.js'),'utf8'),new RegExp(`./analytics\\.js\\?v=${first.version}`));
 const second=stampDirectory(dir);
 assert.equal(second.version,first.version);
 assert.equal(second.changed,0);
 assert.equal(readFileSync(join(dir,'index.html'),'utf8'),html);
 writeFileSync(join(dir,'analytics.js'),'export function track(){return 1}\n');
 const third=stampDirectory(dir);
 assert.notEqual(third.version,first.version);
 assert.match(readFileSync(join(dir,'app.js'),'utf8'),new RegExp(`\\?v=${third.version}`));
 rmSync(dir,{recursive:true});
});

test('stamp text does not rewrite a longer filename',()=>{
 assert.equal(stampText('import "./myapp.js";','app.js','abc123abc123'),'import "./myapp.js";');
});

test('cache headers revalidate HTML and /stats, and leave /api to the Worker',()=>{
 const headers=readFileSync(new URL('../dist/_headers',import.meta.url),'utf8');
 assert.equal(headers,HEADERS);
 for(const path of ['/','/index.html','/stats','/stats.html','/*.html','/*.json']){
  assert.match(headers,new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\n  Cache-Control: no-cache$`,'m'),path);
 }
 assert.match(headers,/\/\*\.js\n  Cache-Control: public, max-age=31536000, immutable/);
 assert.equal(headers.includes('/api'),false);
 const config=readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8');
 assert.match(config,/run_worker_first":\s*\[\s*"\/api\/\*"\s*\]/);
 assert.match(config,/html_handling":\s*"auto-trailing-slash"/);
});
