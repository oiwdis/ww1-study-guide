import {createHash} from 'node:crypto';
import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const VERSION_QUERY=/\?v=[0-9a-f]{8,64}/g;
const CODE_FILE=/\.(?:js|mjs|css)$/;
const STAMP_FILE=/\.(?:html|js|mjs|css)$/;

export const HEADERS=`# HTML is revalidated on every visit, including the extensionless paths
# html_handling serves (/ and /stats). A new deploy is picked up without a hard refresh.
/
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/stats
  Cache-Control: no-cache
/stats.html
  Cache-Control: no-cache
/*.html
  Cache-Control: no-cache

# JS and CSS URLs include ?v=<content hash>, so the browser can keep them.
/*.js
  Cache-Control: public, max-age=31536000, immutable
/*.mjs
  Cache-Control: public, max-age=31536000, immutable
/*.css
  Cache-Control: public, max-age=31536000, immutable

# JSON is fetched by path, without a hash, so revalidate it too.
/*.json
  Cache-Control: no-cache
`;

export function assetVersion(files){
 const hash=createHash('sha256');
 for(const file of [...files].sort((a,b)=>a.name.localeCompare(b.name))){
  hash.update(file.name);hash.update('\0');
  hash.update(file.text.replace(VERSION_QUERY,''));hash.update('\0');
 }
 return hash.digest('hex').slice(0,12);
}

export function stampText(text,names,version){
 let out=text.replace(VERSION_QUERY,'');
 const list=Array.isArray(names)?names:[names];
 const alternation=[...list].sort((a,b)=>b.length-a.length).map(name=>name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
 if(!alternation) return out;
 return out.replace(new RegExp(`(?<![\\w.-])(?:${alternation})`,'g'),match=>`${match}?v=${version}`);
}

export function stampDirectory(dist){
 const names=readdirSync(dist).filter(name=>CODE_FILE.test(name)&&statSync(join(dist,name)).isFile());
 const files=names.map(name=>({name,text:readFileSync(join(dist,name),'utf8')}));
 const version=assetVersion(files);
 let changed=0;
 for(const name of readdirSync(dist)){
  const path=join(dist,name);
  if(!statSync(path).isFile()||!STAMP_FILE.test(name)) continue;
  const text=readFileSync(path,'utf8');
  const next=stampText(text,names,version);
  if(next!==text){writeFileSync(path,next);changed++;}
 }
 writeFileSync(join(dist,'_headers'),HEADERS);
 return {version,changed};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const dist=fileURLToPath(new URL('../dist/',import.meta.url));
 const {version,changed}=stampDirectory(dist);
 console.log(`asset version ${version} (${changed} files stamped)`);
}
