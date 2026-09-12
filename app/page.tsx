import Dashboard from './dashboard';
import {requireChatGPTUser} from './chatgpt-auth';
import {missingConfiguration} from '@/lib/runtime';
export const dynamic='force-dynamic';
export default async function Home(){const missing=missingConfiguration();if(missing.length)return <main style={{maxWidth:680,margin:'80px auto',padding:24}}><h1>대시보드 연결 설정이 필요합니다</h1><p>웹사이트 빌드는 완료됐습니다. 관리자가 Vercel의 환경 변수에 로그인과 저장소 정보를 등록한 뒤 다시 배포해 주세요.</p><ul>{missing.map(name=><li key={name}>{name}</li>)}</ul><p>저장소에 기존 마이그레이션도 적용해야 합니다. 로컬 측정 결과와 API 키는 자동으로 이전되지 않습니다.</p></main>;await requireChatGPTUser('/');return <Dashboard/>;}
