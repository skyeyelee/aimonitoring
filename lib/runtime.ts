// The local Vinext preview keeps its existing Cloudflare bindings.
import {env} from 'cloudflare:workers';
export {env};
export const isVercelRuntime=false;
export function missingConfiguration():string[]{if(env.LOCAL_AUTH_ENABLED==='true')return [];const missing:string[]=[];if(env.AUTH_MODE!=='password')missing.push('AUTH_MODE=password');if(!env.DB)missing.push('DB 연결');if(!env.DASHBOARD_ADMIN_EMAIL)missing.push('DASHBOARD_ADMIN_EMAIL');if(!/^pbkdf2:100000:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/.test(env.DASHBOARD_PASSWORD_HASH||''))missing.push('DASHBOARD_PASSWORD_HASH');try{if(atob(env.APP_ENCRYPTION_KEY||'').length!==32)missing.push('APP_ENCRYPTION_KEY');}catch{missing.push('APP_ENCRYPTION_KEY');}return missing;}
