import {createD1Http} from './d1-http';
export const isVercelRuntime=true;
export function missingConfiguration(){
 const required=['CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_D1_DATABASE_ID','CLOUDFLARE_D1_API_TOKEN','APP_ENCRYPTION_KEY','DASHBOARD_ADMIN_EMAIL','DASHBOARD_PASSWORD'];
 const missing=required.filter(key=>!process.env[key]);
 if(process.env.DASHBOARD_PASSWORD&&process.env.DASHBOARD_PASSWORD.length<16)missing.push('DASHBOARD_PASSWORD (16자 이상)');
 if(process.env.APP_ENCRYPTION_KEY&&Buffer.from(process.env.APP_ENCRYPTION_KEY,'base64').length!==32)missing.push('APP_ENCRYPTION_KEY (32바이트 base64)');
 return missing;
}
let database:D1Database|undefined;
export const env={
 get DB(){if(!process.env.CLOUDFLARE_ACCOUNT_ID||!process.env.CLOUDFLARE_D1_DATABASE_ID||!process.env.CLOUDFLARE_D1_API_TOKEN)return undefined;return database??=createD1Http({accountId:process.env.CLOUDFLARE_ACCOUNT_ID,databaseId:process.env.CLOUDFLARE_D1_DATABASE_ID,token:process.env.CLOUDFLARE_D1_API_TOKEN});},
 get APP_ENCRYPTION_KEY(){return process.env.APP_ENCRYPTION_KEY;},
 get SCHEDULER_STATUS(){return process.env.SCHEDULER_STATUS||'예약 연결 대기';},
};
