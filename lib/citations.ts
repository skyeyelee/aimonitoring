import type {Site,Citation,Provider} from './model';
export function normalizeUrl(input:string){try{const u=new URL(input);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)return null;u.hash='';u.hostname=u.hostname.toLowerCase().replace(/^www\./,'');for(const key of [...u.searchParams.keys()])if(/^utm_|^(gclid|fbclid|msclkid)$/i.test(key))u.searchParams.delete(key);u.searchParams.sort();return u.toString();}catch{return null;}}
export function matchSite(url:string,sites:Site[]){const n=normalizeUrl(url);if(!n)return null;const host=new URL(n).hostname;return sites.find(s=>host===s.domain)?.id||null;}
export function brandMention(text:string){return /밝은\s*세상\s*안과|\bBGSS\b|Seoul\s*Busan\s*Bright|Bright\s*World\s*Eye/i.test(text);}
type Obj=Record<string,any>; // Provider JSON is validated structurally before each field is used.
export function parseResponse(provider:Provider,d:Obj,sites:Site[]){let answer='',searchUsed=false;const citations:Citation[]=[];const add=(a:Obj,text='')=>{const n=normalizeUrl(String(a.url||a.uri||''));if(!n)return;citations.push({url:n,title:String(a.title||''),text:text||String(a.cited_text||''),siteId:matchSite(n,sites)});};
 if(d.error)throw new Error('AI 서비스가 오류를 반환했습니다. 연결·모델·사용 한도를 확인하세요.');
 if(provider==='openai'){
  if(d.status&&d.status!=='completed')throw new Error('답변이 완료되지 않았습니다.');
  for(const block of d.output||[]){if(block.type==='web_search_call'){searchUsed=true;if(block.status&&block.status!=='completed')throw new Error('웹 검색을 완료하지 못했습니다.');}if(block.type==='message')for(const part of block.content||[]){if(part.type==='output_text'){answer+=part.text||'';for(const a of part.annotations||[])if(a.type==='url_citation')add(a,String(part.text||'').slice(a.start_index??0,a.end_index??0));}if(part.type==='refusal')answer+=part.refusal||'';}}
 }else if(provider==='claude'){
  if(['max_tokens','pause_turn'].includes(d.stop_reason))throw new Error('답변이 중단되었습니다.');
  for(const b of d.content||[]){if(b.type==='web_search_tool_result'){searchUsed=true;if(b.content?.type==='web_search_tool_result_error')throw new Error('Claude 웹 검색 오류: '+String(b.content.error_code||'검색 실패'));}if(b.type==='text'){answer+=b.text||'';for(const a of b.citations||[])if(a.type==='web_search_result_location')add(a,String(b.text||''));}}
 }else{
  const c=d.candidates?.[0];if(!c)throw new Error('Gemini 답변이 없습니다. 차단 또는 연결 상태를 확인하세요.');if(c.finishReason&&c.finishReason!=='STOP')throw new Error('Gemini 답변이 중단되었습니다.');answer=(c.content?.parts||[]).filter((p:Obj)=>!p.thought).map((p:Obj)=>p.text||'').join('');const meta=c.groundingMetadata;searchUsed=!!meta?.webSearchQueries?.length;for(const support of meta?.groundingSupports||[])for(const idx of support.groundingChunkIndices||[]){const web=meta.groundingChunks?.[idx]?.web;if(web)add(web,String(support.segment?.text||''));}
 }
 if(!answer.trim())throw new Error('완성된 답변 텍스트를 확인하지 못했습니다.');const unique=[...new Map(citations.map(c=>[c.url+'|'+c.text,c])).values()];return {answer,citations:unique,sites:[...new Set(unique.map(c=>c.siteId).filter(Boolean))] as string[],brand:brandMention(answer),searchUsed};
}
