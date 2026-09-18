# 밝은세상안과 AI 인용 모니터링

주 1회 AI 인용 수집 및 사이트·국가·키워드 분석 대시보드입니다.

Cloudflare 이전: [Cloudflare 준비 및 운영 가이드](CLOUDFLARE.md). 서버 예약 수집과 이메일·비밀번호 로그인은 운영용 설정과 DB 마이그레이션 후 활성화됩니다.

운영 방법, 측정 기준, 초기 연결 및 현재 한계는 [운영 가이드](OPERATIONS.md)를 확인하세요.

개발: npm run install:ci → npm run dev. 기존 로컬 서버와 데이터는 유지됩니다.

Vercel 배포: `npm run build`로 Next.js 빌드 결과를 생성합니다. 관리자 로그인·저장소 연결은 [Vercel 배포 가이드](VERCEL.md)를 따라 설정하세요. 로컬 데이터와 API 키는 자동 이전되지 않습니다.

검증: npx tsc --noEmit, node tests/citations.test.mjs, node tests/catalog.test.mjs, node tests/vercel-runtime.test.mjs.
