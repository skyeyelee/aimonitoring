import {env} from '@/lib/runtime';
import {authSettings,cookieName,digest,sessionToken,verifyPassword} from '@/lib/session-auth';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const config=authSettings(),url=new URL(request.url),secure=url.protocol==='https:';
 const reply=(body:object,status=200,headers:Record<string,string>={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
 if(request.headers.get('origin')!==url.origin)return reply({error:'잘못된 요청입니다.'},403);
 if(!env.DB||!config.DASHBOARD_ADMIN_EMAIL||!config.DASHBOARD_PASSWORD_HASH)return reply({error:'관리자 로그인 설정이 필요합니다.'},503);
 try{
 const raw=await request.text();if(raw.length>4096)return reply({error:'입력이 너무 깁니다.'},400);const body=JSON.parse(raw);
 const cookie=(token:string,age:number)=>`${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure?'; Secure':''}`;
 if(body.action==='logout'){const token=sessionToken(request.headers.get('cookie'));if(token)await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(await digest(token)).run();return reply({ok:true},200,{'Set-Cookie':cookie('',0)});}
 if(typeof body.email!=='string'||typeof body.password!=='string'||body.password.length>256)return reply({error:'이메일과 비밀번호를 확인하세요.'},400);
 const now=Date.now(),bucket=Math.floor(now/900000);const ip=request.headers.get('cf-connecting-ip')||'local';
 // Fixed buckets bound guessing attempts before password derivation; no plaintext email/IP is stored.
 for(const [scope,limit] of [[ip,10],['global',100]] as const){const key=await digest(scope+':'+bucket);const r=await env.DB.prepare('INSERT INTO auth_attempts (id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').bind(key,now+1800000,limit).first();if(!r)return reply({error:'로그인 시도가 많습니다. 15분 후 다시 시도하세요.'},429,{'Retry-After':'900'});}
 const valid=await verifyPassword(body.password,config.DASHBOARD_PASSWORD_HASH);
 if(!valid||body.email.trim().toLowerCase()!==config.DASHBOARD_ADMIN_EMAIL.toLowerCase())return reply({error:'이메일 또는 비밀번호가 올바르지 않습니다.'},401);
 const token=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');
 await env.DB.batch([env.DB.prepare('DELETE FROM auth_sessions WHERE expires_at<?').bind(now),env.DB.prepare('DELETE FROM auth_attempts WHERE expires_at<?').bind(now),env.DB.prepare('INSERT INTO auth_sessions(token_hash,email,expires_at,credential_version) VALUES (?,?,?,?)').bind(await digest(token),config.DASHBOARD_ADMIN_EMAIL.toLowerCase(),now+8*3600000,await digest(config.DASHBOARD_PASSWORD_HASH))]);
 return reply({ok:true},200,{'Set-Cookie':cookie(token,8*3600)});
 }catch{return reply({error:'로그인 저장소를 확인하지 못했습니다. 관리자에게 문의하세요.'},503);}
}
