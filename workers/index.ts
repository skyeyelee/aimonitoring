import handler from 'vinext/server/fetch-handler';
import {scheduledTick} from './scheduler';
import {missingConfiguration} from '../lib/runtime';
export default {
 fetch:handler.fetch,
 async scheduled(controller:ScheduledController,env:Cloudflare.Env){if(env.AUTO_MONITORING!=='server')return;if(missingConfiguration().length)throw new Error('자동 수집에 필요한 운영 환경 설정이 누락되었습니다.');await scheduledTick(new Date(controller.scheduledTime));},
};
