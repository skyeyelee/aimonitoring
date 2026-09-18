import {db,init,getSettings} from '../lib/store';
import {startJob,processJob} from '../lib/engine';
export function weeklySlot(now:Date,weekday:number,hour:number){const kst=new Date(now.getTime()+9*3600000),days=(kst.getUTCDay()-weekday+7)%7;const due=new Date(Date.UTC(kst.getUTCFullYear(),kst.getUTCMonth(),kst.getUTCDate()-days,hour)-9*3600000);if(due>now)due.setUTCDate(due.getUTCDate()-7);return due;}
export async function scheduledTick(now=new Date()){
 const d=db();await init('password-admin');
 await d.prepare("INSERT OR IGNORE INTO config(key,value) VALUES ('scheduler-enabled-at',?)").bind(now.toISOString()).run();
 const baseline=await d.prepare("SELECT value FROM config WHERE key='scheduler-enabled-at'").first<{value:string}>();
 const mark=async(status:string)=>d.prepare("INSERT INTO config(key,value) VALUES ('scheduler-health',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify({at:now.toISOString(),status})).run();
 try{
 // A terminated planning invocation must not prevent all future jobs from starting.
 await d.prepare("UPDATE jobs SET status='cancelled' WHERE status='planning' AND created_at<?").bind(new Date(now.getTime()-10*60000).toISOString()).run();
 const settings=await getSettings(),due=weeklySlot(now,settings.weekday,settings.hour);
 // Do not charge for a historical week when enabling the scheduler for the first time.
 const since=baseline?new Date(baseline.value).getTime():now.getTime();
 if(settings.enabled&&due.getTime()>=since&&due<=now)await startJob('weekly',now);
 for(let i=0;i<3;i++){const result=await processJob();if(!result.pending)break;}
 await mark('ok');
 }catch{await mark('error');throw new Error('자동 수집 실패: 연결 설정, 사용 한도 또는 DB 상태를 확인하세요.');}
}
