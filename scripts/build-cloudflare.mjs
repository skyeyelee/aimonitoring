import {spawnSync} from 'node:child_process';
if(!process.env.CF_DATABASE_ID||process.env.CF_DATABASE_ID==='00000000-0000-4000-8000-000000000000')throw Error('CF_DATABASE_ID에 새 운영 D1 Database ID를 설정하세요. 로컬 DB ID로 배포할 수 없습니다.');
const result=spawnSync(process.execPath,['node_modules/vinext/dist/cli.js','build'],{stdio:'inherit',env:{...process.env,CF_PRODUCTION_BUILD:'1'}});process.exit(result.status??1);
