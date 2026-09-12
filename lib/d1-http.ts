type Query={sql:string;params:unknown[]};
type QueryResult={success:boolean;results:Record<string,unknown>[];meta:{changes:number};error?:string};
/** Keep SQLite data durable; never store the database in a Vercel function filesystem. */
export function createD1Http(config:{accountId:string;databaseId:string;token:string},transport:typeof fetch=fetch){
 async function execute(queries:Query[]):Promise<QueryResult[]>{
  const response=await transport(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/d1/database/${encodeURIComponent(config.databaseId)}/query`,{method:'POST',headers:{Authorization:`Bearer ${config.token}`,'Content-Type':'application/json'},body:JSON.stringify(queries.length===1?queries[0]:{batch:queries}),cache:'no-store',signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error(`D1 저장소 연결 실패 (${response.status}). 서버의 저장소 설정을 확인하세요.`);
  const body=await response.json() as {success:boolean;result?:QueryResult[]};
  if(!body.success||!body.result||body.result.length!==queries.length||body.result.some(r=>!r.success))throw new Error('D1 저장소 요청 실패. 저장소 권한과 마이그레이션 적용 상태를 확인하세요.');
  return body.result;
 }
 class Statement{
  constructor(readonly sql:string,readonly params:unknown[]=[]){ }
  bind(...values:unknown[]){return new Statement(this.sql,values);}
  async all<T=Record<string,unknown>>(){const r=(await execute([{sql:this.sql,params:this.params}]))[0];return {...r,results:r.results as T[]};}
  async first<T=Record<string,unknown>>(column?:string):Promise<T|null>{const row=(await this.all()).results[0];return (column?row?.[column]:row) as T??null;}
  async run(){return (await execute([{sql:this.sql,params:this.params}]))[0];}
 }
 return {prepare:(sql:string)=>new Statement(sql),batch:(statements:Statement[])=>execute(statements.map(s=>({sql:s.sql,params:s.params})))} as unknown as D1Database;
}
