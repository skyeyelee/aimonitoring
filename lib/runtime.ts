// The local Vinext preview keeps its existing Cloudflare bindings.
export {env} from 'cloudflare:workers';
export const isVercelRuntime=false;
export function missingConfiguration():string[]{return [];}
