# Vercel 배포

이 저장소의 루트가 Vercel Root Directory입니다. 별도의 `dashboard` 하위 폴더를 지정하지 않습니다.

- Framework Preset: Next.js
- Build Command: `npm run build` (Next.js webpack 빌드)
- Output Directory: `.next` (저장소의 vercel.json 설정)
- Node.js: 22 이상
- 로컬 기존 서버: `npm run dev` (Vinext, 기존 로컬 D1 데이터 유지)
- Vercel 환경 로컬 실행: `npm run dev:vercel`
- Cloudflare 빌드가 필요한 경우: `npm run build:cloudflare`

## 필수 서버 환경 변수

Vercel 프로젝트 Settings → Environment Variables에서 등록합니다. 비밀번호와 API 토큰에는 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. 추가·변경 후 재배포해야 합니다.

| 이름 | 값 |
| --- | --- |
| CLOUDFLARE_ACCOUNT_ID | 직접 관리하는 Cloudflare 계정 ID |
| CLOUDFLARE_D1_DATABASE_ID | 해당 계정의 D1 데이터베이스 ID |
| CLOUDFLARE_D1_API_TOKEN | 해당 계정에 D1 읽기/편집 권한이 있는 API 토큰 |
| APP_ENCRYPTION_KEY | 32바이트 무작위 값의 base64 표현. 데이터 저장 후 유지해야 함 |
| DASHBOARD_ADMIN_EMAIL | 관리자 로그인 이메일 |
| DASHBOARD_PASSWORD | 관리자 로그인 비밀번호. 최소 16자, 무작위 영문·숫자 권장 |

키 생성: `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`. 결과를 서버 환경 변수에만 저장합니다.

Vercel에서는 기존 Sites의 ChatGPT 인증 헤더를 신뢰하지 않습니다. 브라우저의 로그인 창에서 위 관리자 이메일과 비밀번호를 입력합니다. 현재는 단일 관리자용 인증입니다. 팀별 계정·권한 분리는 별도 인증 연동이 필요합니다.

## 저장소 준비

Vercel 함수는 로컬 SQLite 파일을 영구 저장하지 못하므로 Cloudflare D1을 HTTPS API로 연결합니다. Cloudflare 대시보드의 Workers & Pages → D1에서 직접 관리할 DB를 만들고, SQL 콘솔에서 아래 파일을 **순서대로 한 번씩** 적용합니다.

1. `drizzle/0000_watery_magneto.sql`
2. `drizzle/0001_left_paladin.sql`

이미 적용한 마이그레이션은 다시 실행하지 마세요. 기존 Sites 등록 정보의 프로젝트 ID와 자리표시자 DB ID는 실제 Cloudflare 계정 ID/DB ID가 아닙니다. 직접 관리하는 DB 정보가 필요합니다. SQL 처리는 서버에서만 수행하며 브라우저에는 DB 토큰이 전달되지 않습니다.

환경 변수가 없으면 사이트는 설정 안내 화면을 표시합니다. 이 상태는 빌드 성공이지만 측정 가능한 운영 상태는 아닙니다. 변수가 있어도 DB 마이그레이션이 없으면 데이터 조회가 실패합니다.

## 재배포 후 확인

관리자 로그인 → 사이트·질문 목록 조회 → AI 키 저장 → 질문 1개 시험 측정 순서로 확인합니다. 로컬 DB·측정 이력·API 키는 Git에 포함되지 않아 자동 이전되지 않습니다. 클라우드 환경에서 API 키를 다시 등록하거나 별도 데이터 이전을 진행해야 합니다.

주간 자동 예약은 이 변경에 포함되지 않습니다. 기존 화면에서 시작하는 수집은 완료까지 화면을 열어두어야 합니다. API 처리 한 번의 최대 시간은 300초로 설정했습니다. D1 REST API의 한도와 지연은 Worker 직접 연결과 다를 수 있습니다.
