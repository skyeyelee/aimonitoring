import {getChatGPTUser} from '../chatgpt-auth';
import {isVercelRuntime,missingConfiguration} from '@/lib/runtime';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 if(!isVercelRuntime)return new Response('로컬 로그인 서버를 확인해 주세요.',{status:503});
 if(missingConfiguration().length)return Response.redirect(new URL('/',request.url));
 if(await getChatGPTUser())return Response.redirect(new URL('/',request.url));
 return new Response('대시보드 관리자 이메일과 비밀번호를 입력하세요.',{status:401,headers:{'WWW-Authenticate':'Basic realm="AI Monitoring", charset="UTF-8"','Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8'}});
}
