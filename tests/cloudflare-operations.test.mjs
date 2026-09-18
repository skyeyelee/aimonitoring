import {build} from 'esbuild';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+f,'utf8'));
const d={prepare(sql){let values=[];return {bind(...v){values=v;return this},async first(column){const r=sqlite.prepare(sql).get(...values);return column?r?.[column]??null:r??null},async all(){return {results:sqlite.prepare(sql).all(...values)}},async run(){return {meta:sqlite.prepare(sql).run(...values)}}}},async batch(statements){sqlite.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
globalThis.testEnv={DB:d,APP_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64'),AUTH_MODE:'password',AUTO_MONITORING:'server',DASHBOARD_ADMIN_EMAIL:'admin@example.com'};
const plugins=[{name:'test-runtime',setup(b){b.onResolve({filter:/^@\/lib\/runtime$/},()=>({path:'runtime',namespace:'test'}));b.onResolve({filter:/^\.\/providers$/},()=>({path:'provider',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},a=>({contents:a.path==='runtime'?'export const env=globalThis.testEnv;':`export const defaultModels={openai:'test'};export async function collect(){return {answer:'fixture',citations:[],sites:[],brand:false,searchUsed:true,raw:'{}'}}`,loader:'js'}));}}];
async function load(file){const b=await build({entryPoints:[file],bundle:true,platform:'node',format:'esm',write:false,plugins});return import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));}
const auth=await load('lib/session-auth.ts'),api=await load('app/api/auth/route.ts');
const password='strong-fixture-password-123';testEnv.DASHBOARD_PASSWORD_HASH=await auth.hashPassword(password);
assert.equal(await auth.verifyPassword(password,testEnv.DASHBOARD_PASSWORD_HASH),true);assert.equal(await auth.verifyPassword('wrong',testEnv.DASHBOARD_PASSWORD_HASH),false);
const req=(body,extra={})=>new Request('https://example.com/api/auth',{method:'POST',headers:{origin:'https://example.com','content-type':'application/json','cf-connecting-ip':'192.0.2.1',...extra},body:JSON.stringify(body)});
assert.equal((await api.POST(req({email:'admin@example.com',password},{origin:'https://attacker.example'}))).status,403);
assert.equal((await api.POST(req({email:'admin@example.com',password:'wrong'}))).status,401);
const signed=await api.POST(req({email:'admin@example.com',password}));assert.equal(signed.status,200);const cookie=signed.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.equal((await auth.sessionUser(cookie)).email,'admin@example.com');
assert.equal(await auth.sessionUser('aimonitor_session=forged'),null);
assert.equal((await api.POST(req({action:'logout'},{cookie}))).status,200);assert.equal(await auth.sessionUser(cookie),null);
const signed2=await api.POST(req({email:'admin@example.com',password}));const cookie2=signed2.headers.get('set-cookie');sqlite.exec('UPDATE auth_sessions SET expires_at=0');assert.equal(await auth.sessionUser(cookie2),null);
for(let i=0;i<10;i++)await api.POST(req({email:'admin@example.com',password:'wrong'},{'cf-connecting-ip':'192.0.2.2'}));assert.equal((await api.POST(req({email:'admin@example.com',password},{'cf-connecting-ip':'192.0.2.2'}))).status,429);
const store=await load('lib/store.ts');await store.init('password-admin');sqlite.exec('DELETE FROM questions');const question={id:'test',text:'A sample test question',language:'한국어',keyword:'test',countries:['KR'],active:1,version:1,branded:0};sqlite.prepare('INSERT INTO questions VALUES (?,?)').run('test',JSON.stringify(question));sqlite.prepare('UPDATE connections SET secret=?,enabled=1').run(await store.encrypt('fixture-key'));
const scheduler=await load('workers/scheduler.ts');assert.equal(scheduler.weeklySlot(new Date('2026-09-21T00:00:00Z'),1,9).toISOString(),'2026-09-21T00:00:00.000Z');
await scheduler.scheduledTick(new Date('2026-09-20T23:58:00Z'));assert.equal(sqlite.prepare('SELECT count(*) n FROM jobs').get().n,0);
await scheduler.scheduledTick(new Date('2026-09-21T00:00:00Z'));assert.equal(sqlite.prepare('SELECT status FROM jobs').get().status,'completed');assert.equal(sqlite.prepare('SELECT count(*) n FROM results WHERE status=\'success\'').get().n,1);
await scheduler.scheduledTick(new Date('2026-09-21T00:02:00Z'));assert.equal(sqlite.prepare('SELECT count(*) n FROM jobs').get().n,1);
const settings=await store.getSettings();sqlite.prepare("UPDATE config SET value=? WHERE key='settings'").run(JSON.stringify({...settings,enabled:false}));await scheduler.scheduledTick(new Date('2026-09-28T00:00:00Z'));assert.equal(sqlite.prepare('SELECT count(*) n FROM jobs').get().n,1);
// A crashed planning job is recovered without deleting its history.
sqlite.prepare('INSERT INTO jobs(id,slot,label,kind,status,created_at) VALUES(?,?,?,?,?,?)').run('stuck','stuck','test','manual','planning','2026-09-01T00:00:00Z');
await scheduler.scheduledTick(new Date('2026-09-28T00:02:00Z'));assert.equal(sqlite.prepare('SELECT status FROM jobs WHERE id=?').get('stuck').status,'cancelled');
// Budget exhaustion must not create another job or charge another provider call.
const engine=await load('lib/engine.ts');sqlite.prepare("UPDATE config SET value=? WHERE key='settings'").run(JSON.stringify({...settings,monthlyLimit:0}));const before=sqlite.prepare('SELECT count(*) n FROM jobs').get().n;await assert.rejects(engine.startJob('manual'),/한도/);assert.equal(sqlite.prepare('SELECT count(*) n FROM jobs').get().n,before);
console.log('PASS: password login, CSRF, cookie flags, logout, expiry, guessing limits, weekly timezone, no historical run, headless collection, weekly deduplication, pause, planning recovery, and monthly limit. No real AI calls.');sqlite.close();
