# Cloudflare 이전 준비

이 변경은 코드 준비입니다. 운영 계정·DB를 생성하거나 원격 배포하지 않았습니다. 기존 로컬 데이터는 그대로 유지합니다.

## 구조

- Workers 한 개: 대시보드/API와 scheduled 핸들러.
- D1 한 개: 사이트, 질문, 실행 이력, 암호화한 API 키, 세션, 로그인 시도 제한.
- Cron: UTC 기준 2분마다. 처음 활성화한 이후 도래하는 월요일 00:00 UTC(한국 09:00) 주차를 한 번 생성합니다. 초기 배포 시 과거 주차를 소급 실행하지 않습니다.
- 한 tick에서 최대 3개씩 3묶음을 처리합니다. 완료까지 여러 tick이 걸릴 수 있습니다. 화면·PC가 꺼져도 서버에서 처리합니다. 동시 tick은 작업별 lease로 중복 처리 경쟁을 막습니다.
- 실패하면 최대 3회 시도하며, 프로세스 종료 후 lease가 만료된 작업을 회수합니다. 외부 AI 과금은 네트워크 단절 시 이미 발생했을 수 있으므로 정확히 한 번 과금까지 보장하지 않습니다.

## 관리자 로그인

현재 한 개의 관리자 이메일을 지원합니다. 회원가입·여러 직원별 계정·이메일 비밀번호 재설정은 포함하지 않습니다.

1. 본인 터미널에서 `npm run auth:password` 실행.
2. 생성된 비밀번호는 비밀번호 보관함에 보관하고 로그인에 사용합니다.
3. `DASHBOARD_PASSWORD_HASH` 값만 Worker Secret으로 등록합니다. PBKDF2-SHA256, 고유 salt, 100,000회입니다.
4. `DASHBOARD_ADMIN_EMAIL`도 Worker Secret으로 등록합니다. 다음 배포에서 일반 vars가 덮어써져도 이메일 설정이 유지되게 합니다.

8시간 HttpOnly/SameSite=Strict 세션을 사용하고 HTTPS에서 Secure 쿠키를 적용합니다. DB에는 세션 토큰의 SHA256만 저장합니다. 로그아웃은 해당 세션을 삭제합니다. 비밀번호 해시를 변경하면 이전 세션은 무효화됩니다. 로그인은 IP당 15분 10회·전체 100회로 제한합니다. Cloudflare 모드에서는 외부에서 입력한 Sites 인증 헤더를 신뢰하지 않습니다.

## 배포 순서

1. Cloudflare에서 직접 관리하는 새 D1 `aimonitoring-db`를 생성합니다. DB ID를 빌드 환경 변수 `CF_DATABASE_ID`에 등록합니다.
2. Workers Builds의 저장소는 `skyeyelee/aimonitoring`, 루트는 저장소 최상위로 설정합니다.
3. Build Command: `npm run build:cloudflare:production`.
4. Deploy Command: `npx wrangler deploy --config dist/server/wrangler.json`.
5. Worker 이름은 `aimonitoring`. DB binding은 `DB`. 배포된 설정에서 Cron이 `*/2 * * * *`인지 확인합니다.
6. **실제 공개 사용 전**, 운영 DB에 `0000_watery_magneto.sql`, `0001_left_paladin.sql`, `0002_supreme_dorian_gray.sql` 순서로 한 번씩 적용합니다. 기존 로컬 DB를 이전한 경우 적용된 파일은 건너뛰고 새 파일만 적용합니다. 작업 전 백업합니다.
7. Worker Secret에 `APP_ENCRYPTION_KEY`(32바이트 base64), `DASHBOARD_PASSWORD_HASH`, `DASHBOARD_ADMIN_EMAIL`을 등록합니다. 키는 Git·채팅·빌드 로그에 올리지 않습니다.
8. 신규 배포 시 환경 변수가 부족하면 설정 안내 화면만 표시됩니다. 변수 등록 후 `/login`에서 로그인합니다.

Wrangler로 SQL 적용 시 `npx wrangler d1 execute DB --remote --config dist/server/wrangler.json --file drizzle/<파일명>`을 사용합니다. 운영 DB ID를 반드시 먼저 확인하세요. 자동 migration 추적을 쓰려면 drizzle 폴더를 migrations_dir로 설정하고 최초 기준 상태를 확인한 뒤 도입하세요. 이미 수동 적용한 파일을 자동 재적용하면 실패합니다.

Workers 유료 플랜 사용을 권장합니다. 빌드 검사는 `npm run db:check`와 `node scripts/check-database.mjs --production`으로 수행합니다. 후자는 빌드 설정만 확인하며 실제 원격 DB 접근 검증을 대신하지 않습니다.

## 데이터 이전

로컬 `.wrangler/state`의 SQLite와 `.dev.vars`의 암호화 설정은 자동 전송되지 않습니다. 기존 API 키를 그대로 이전하려면 원래 APP_ENCRYPTION_KEY도 같은 값으로 등록해야 합니다. 새 DB로 시작하면 새 암호화 키를 만들고 AI 키를 다시 등록하세요. 운영 관리자 권한은 인증된 password-admin에 부여하므로 이전 로컬 소유자 값에 의존하지 않습니다.

현재 결과 조회는 전체 결과를 읽습니다. 월 수백 건 규모에서 시작하되 기록이 누적되면 서버 페이지 처리·원문 보존기간을 추가해야 합니다. 실패한 Gemini 요청은 배포와 별개로 해결해야 합니다.

## 검증 및 운영

- 로그인 실패/성공, 새로고침 유지, 로그아웃 후 API 401 확인.
- 질문 1개로 수동 작업을 만든 뒤 화면을 닫고 서버 Cron이 완료하는지 확인.
- 일정 화면의 마지막 서버 상태가 정상인지 확인. 10분 이상 갱신되지 않으면 지연 표시.
- 동일 주차 중복 실행 방지, 월 실행 한도, 실패 내역 확인.
- 비밀번호 분실은 새 해시를 Secret에 등록하여 변경합니다. 다른 관리자 계정 추가 UI는 제공하지 않습니다.

DB 장애나 scheduler 오류는 Cloudflare Observability와 일정 화면에서 확인합니다. 외부 이메일 알림과 자동 백업 스케줄은 아직 연결하지 않았습니다. 운영 시작 전에 D1 복구 정책과 별도 백업을 정하세요.
