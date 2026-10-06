import assert from 'node:assert/strict';
import {build} from 'esbuild';
const bundle=await build({entryPoints:['lib/providers.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {collect}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const originalFetch=globalThis.fetch;
let request;
globalThis.fetch=async (_url,options)=>{
 request=JSON.parse(options.body);
 return Response.json({stop_reason:'end_turn',content:[
  {type:'web_search_tool_result',content:[]},
  {type:'text',text:'Эмнэлэг',citations:[{type:'web_search_result_location',url:'https://example.com/clinic',title:'Clinic'}]}
 ]});
};
try{
 const task={provider:'claude',model:'claude-sonnet-4-6',country:'MN',language:'몽골어',question:'Монгол асуулт'};
 const result=await collect(task,'fixture-key',[{id:'clinic',domain:'example.com'}]);
 assert.equal('user_location' in request.tools[0],false);
 assert.equal(request.tools[0].name,'web_search');
 assert.match(request.messages[0].content,/Mongolia/);
 assert.ok(request.messages[0].content.includes(task.question));
 assert.ok(request.messages[0].content.includes(task.language));
 assert.equal(result.countryMethod,'질문 시나리오');
 assert.equal(result.searchUsed,true);
 assert.deepEqual(result.sites,['clinic']);
 for(const country of ['KR','US','JP']){
  const normal=await collect({...task,country},'fixture-key',[]);
  assert.equal(request.tools[0].user_location.country,country);
  assert.equal(request.messages[0].content,task.question);
  assert.equal(normal.countryMethod,'검색 위치 설정');
 }
 console.log('PASS: Claude Mongolia scenario, unchanged supported locations, and citation collection.');
}finally{globalThis.fetch=originalFetch;}
