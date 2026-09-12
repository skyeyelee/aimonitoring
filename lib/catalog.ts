import {z} from 'zod';
import {normalizeUrl} from './citations';
import type {Question,Site} from './model';

const idSchema=z.string().min(1).max(100);
const questionFields=z.object({text:z.string().trim().min(5).max(2000),keyword:z.string().trim().min(1).max(50),language:z.string().trim().min(1).max(40),countries:z.array(z.enum(['KR','US','CA','AU','CN','TW','JP','MN'])).min(1).max(8),branded:z.boolean()});
export const catalogActions=['siteUpdate','siteDelete','siteRestore','questionUpdate','questionDelete','questionRestore'];

/** Catalog edits never rewrite result payloads or remove historical attribution. */
export async function manageCatalog(d:D1Database,action:string,input:unknown){
 const {id}=z.object({id:idSchema}).parse(input);
 if(action.startsWith('site')){
  const old=await d.prepare('SELECT * FROM sites WHERE id=?').bind(id).first<Site>();
  if(!old)throw new Error('사이트를 찾을 수 없습니다. 새로고침해 주세요.');
  if(action==='siteUpdate'){
   if(old.deleted)throw new Error('삭제된 사이트입니다. 복원 후 수정하세요.');
   const v=z.object({name:z.string().trim().min(1).max(80),domain:z.string().trim().min(3).max(300),version:z.number().int().min(1)}).parse(input);
   const url=normalizeUrl(v.domain.includes('://')?v.domain:`https://${v.domain}`);
   if(!url)throw new Error('유효한 웹사이트 주소를 입력하세요.');
   const host=new URL(url).hostname;
   if(!host.includes('.')||/^[\d.]+$/.test(host)||host.includes(':')||/\.(local|localhost|internal)$/.test(host))throw new Error('공개 도메인을 입력하세요.');
   const duplicate=await d.prepare('SELECT id,deleted FROM sites WHERE domain=? AND id<>?').bind(host,id).first<{id:string;deleted:number}>();
   if(duplicate)throw new Error(duplicate.deleted?'삭제한 사이트에 등록된 주소입니다. 삭제 항목에서 복원해 주세요.':'이미 등록된 사이트 주소입니다.');
   const r=await d.prepare('UPDATE sites SET name=?,domain=?,version=version+1 WHERE id=? AND version=? AND deleted=0').bind(v.name,host,id,v.version).run();
   if(!r.meta.changes)throw new Error('다른 곳에서 사이트가 변경되었습니다. 창을 닫고 다시 열어 주세요.');
  }else if(action==='siteDelete'){
   await d.prepare('UPDATE sites SET deleted=1,active=0,version=version+1 WHERE id=? AND deleted=0').bind(id).run();
  }else if(action==='siteRestore'){
   await d.prepare('UPDATE sites SET deleted=0,active=0,version=version+1 WHERE id=? AND deleted=1').bind(id).run();
  }else throw new Error('지원하지 않는 작업입니다.');
 }else{
  const row=await d.prepare('SELECT payload FROM questions WHERE id=?').bind(id).first<{payload:string}>();
  if(!row)throw new Error('질문을 찾을 수 없습니다. 새로고침해 주세요.');
  const old=JSON.parse(row.payload) as Question;let updated:Question;
  if(action==='questionUpdate'){
   if(old.deleted)throw new Error('삭제된 질문입니다. 복원 후 수정하세요.');
   const v=questionFields.extend({version:z.number().int().min(1)}).parse(input);
   if(old.version!==v.version)throw new Error('다른 곳에서 질문이 변경되었습니다. 창을 닫고 다시 열어 주세요.');
   updated={...old,...v,countries:[...new Set(v.countries)],branded:Number(v.branded),version:old.version+1};
  }else if(action==='questionDelete'){updated={...old,deleted:1,active:0};}
  else if(action==='questionRestore'){updated={...old,deleted:0,active:0};}
  else throw new Error('지원하지 않는 작업입니다.');
  const r=await d.prepare('UPDATE questions SET payload=? WHERE id=? AND payload=?').bind(JSON.stringify(updated),id,row.payload).run();
  if(!r.meta.changes)throw new Error('질문이 변경되었습니다. 새로고침 후 다시 시도해 주세요.');
 }
 return {ok:true};
}
