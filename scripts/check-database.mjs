import {DatabaseSync} from 'node:sqlite';
import {readdirSync,readFileSync,existsSync} from 'node:fs';
const d=new DatabaseSync(':memory:');
for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())d.exec(readFileSync('drizzle/'+file,'utf8'));
const names=d.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t=>t.name);
for(const name of ['config','sites','questions','connections','jobs','results','usage','members','audit','auth_sessions','auth_attempts'])if(!names.includes(name))throw Error('Missing table '+name);
if(d.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('Integrity failed');
console.log('PASS: all migrations apply to an isolated database; 11 tables and SQLite integrity verified. No live data changed.');
if(process.argv.includes('--production')){
 const file='dist/server/wrangler.json';if(!existsSync(file))throw Error('운영 빌드를 먼저 실행하세요.');
 const config=JSON.parse(readFileSync(file,'utf8'));const db=config.d1_databases?.find(x=>x.binding==='DB');
 if(!db||!db.database_id||db.database_id==='00000000-0000-4000-8000-000000000000')throw Error('실제 운영 D1 연결이 없습니다.');
 if(config.vars?.AUTH_MODE!=='password'||config.vars?.LOCAL_AUTH_ENABLED==='true')throw Error('운영 인증 설정이 안전하지 않습니다.');
 if(!config.triggers?.crons?.includes('*/2 * * * *'))throw Error('예약 설정 누락');
 console.log('PASS: production DB binding, password mode, and cron configuration. Remote credentials and schema are NOT verified.');
}
d.close();
