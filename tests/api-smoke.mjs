import assert from 'node:assert/strict';
const base='http://localhost:5173';
const sign=await fetch(base+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});const cookie=sign.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie,'Local sign-in cookie');
const get=async()=>{const r=await fetch(base+'/api/monitor',{headers:{cookie}});const body=await r.json();assert.equal(r.status,200,JSON.stringify(body));return body;};
const post=async b=>{const r=await fetch(base+'/api/monitor',{method:'POST',headers:{cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify(b)});return {status:r.status,body:await r.json()};};
const anonymous=await fetch(base+'/api/monitor');assert.equal(anonymous.status,401);
let d=await get();assert.equal(d.sites.length,6);assert.equal(d.questions.length,30);assert.equal(d.settings.weekday,1);assert.equal(d.settings.hour,9);assert.equal(d.role,'admin');assert.equal(d.results.length,0);assert.ok(d.connections.every(c=>!('secret' in c)));
const noKey=await post({action:'start',kind:'weekly'});assert.equal(noKey.status,400);assert.match(noKey.body.error,/API 키/);
const invalid=await post({action:'siteAdd',name:'Bad',domain:'javascript:alert(1)'});assert.equal(invalid.status,400);
const cross=await fetch(base+'/api/monitor',{method:'POST',headers:{cookie,Origin:'https://other.example','Content-Type':'application/json'},body:JSON.stringify({action:'start',kind:'manual'})});assert.ok([400,403].includes(cross.status));
const old=d.settings;assert.equal((await post({action:'settings',settings:{...old,enabled:false}})).status,200);d=await get();assert.equal(d.settings.enabled,false);const paused=await post({action:'start',kind:'weekly'});assert.equal(paused.status,200);assert.match(paused.body.message,/일시중지/);assert.equal((await post({action:'settings',settings:old})).status,200);
const badEvidence=await post({action:'observation',questionId:d.questions[0].id,provider:'openai',country:'KR',model:'TEST',answer:'TEST',urls:'',evidence:'',countryMethod:'접속 환경 확인',createdAt:new Date().toISOString()});assert.equal(badEvidence.status,400);
assert.equal((await get()).results.length,0);console.log('PASS: authenticated persistence, six sites, 30 prompts, weekly schedule, keyless guard, input validation, CSRF, pause/resume, evidence validation. No live provider calls or fabricated observations.');

