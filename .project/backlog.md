# 시그널플레이 (SignalPlay) — Backlog

> 태그: [BUG] [FEATURE] [UX] [PERFORMANCE] [CONTENT] [PROCESS] [DOCS] [STRATEGY]
> 우선순위: P1(긴급 — Week 0~1) / P2(이번 스프린트 — Week 1) / P3(다음 스프린트 — Week 2~3)
> 모든 항목은 수락 기준과 테스트 계획을 포함해야 합니다.

---

## P1 — 긴급 (Phase 0~1 착수 전 필수)

- [PROCESS] **Vite+React 프로젝트 초기화** — `pnpm create vite signalplay --template react-ts`, Tailwind CSS v3, ESLint, Prettier, path alias 설정
  - 수락 기준: `pnpm dev` 정상 구동, `pnpm build` 성공, TypeScript strict 모드 에러 0

- [PROCESS] **Bedrock SDK 접근 키 발급** — 앱인토스 개발자 등록, `VITE_BEDROCK_CLIENT_ID` 환경변수 세팅
  - 수락 기준: SDK 초기화 성공, 로컬 모킹으로 `loginWithToss()` 동작 확인

- [PROCESS] **Gemini API 키 발급** — Google AI Studio 무료 티어, `GEMINI_API_KEY` Vercel 환경변수 등록
  - 수락 기준: `/api/cron/generate` 로컬 테스트에서 시그널 3개 생성 성공

- [PROCESS] **Supabase 프로젝트 생성 + 스키마 적용** — `daily_signals`, `user_predictions`, `user_stats` 3테이블 + RLS 정책
  - 수락 기준: 테이블 생성 완료, RLS 정책 적용, service_role 키 Vercel 환경변수 등록

- [PROCESS] **Vercel 프로젝트 생성 + KV 연결** — Vercel KV 스토어 생성, 환경변수 연동
  - 수락 기준: `kv.set`, `kv.get` 로컬 테스트 성공

- [PROCESS] **CI/CD 파이프라인** — GitHub Actions (lint → typecheck → test), Vercel 자동 배포 연동
  - 수락 기준: PR 생성 시 Actions 자동 실행, main 머지 시 Vercel 프로덕션 배포

---

## P2 — 이번 스프린트 (Sprint 1, Week 1)

### 프론트엔드

- [FEATURE] **토스 로그인 화면** — Bedrock SDK `loginWithToss()` 호출, 로그인 성공 시 홈으로 이동
  - 수락 기준: 로컬 모킹 환경에서 로그인 → 홈 이동 정상 동작

- [FEATURE] **홈 화면 — 시그널 카드 3개** — `/api/signals` 조회, SignalCard 컴포넌트 렌더링, 스켈레톤 로딩
  - 수락 기준: 시그널 3개 렌더링, 스켈레톤 표시, 네트워크 에러 시 에러 UI 노출

- [FEATURE] **예측 버튼 인터랙션** — 호재/악재/영향없음 3버튼, 선택 → 색상 변경, POST `/api/predictions`
  - 수락 기준: 선택 즉시 색상 피드백, 제출 성공 후 버튼 비활성화, 중복 제출 차단 UI

- [FEATURE] **결과 화면** — `/api/results` 조회, ResultCard 3개, ScoreSummary (점수 + 스트릭), 리워드 광고 CTA
  - 수락 기준: 정답/오답 색상 구분 표시, 점수/스트릭 정확히 표시

- [FEATURE] **리더보드 화면** — Bedrock 리더보드 SDK 래핑, 주간 랭킹 표시, 내 순위 sticky
  - 수락 기준: 리더보드 데이터 표시, 내 순위 하단 고정, 모킹 환경에서 동작 확인

- [UX] **BottomNav** — TDS BottomNavigation 컴포넌트, 홈/결과/랭킹 탭, 활성 탭 표시
  - 수락 기준: 탭 전환 정상 동작, 활성 탭 토스 블루 표시

- [UX] **DisclaimerBanner** — 홈/결과 화면 하단 고정 면책 문구
  - 수락 기준: BottomNav 위 고정 표시, 스크롤에 영향받지 않음

- [UX] **SignalCard 스켈레톤** — 로딩 중 shimmer 애니메이션 표시
  - 수락 기준: 데이터 로드 전 스켈레톤 표시, 로드 완료 후 자연스러운 전환

### 백엔드

- [FEATURE] **`GET /api/signals`** — KV 캐시 우선 조회, 캐시 미스 시 Supabase 조회, 유저 기예측 포함
  - 수락 기준: 응답 300ms 이하 (KV 캐시 히트), 오늘 날짜 시그널 반환

- [FEATURE] **`POST /api/predictions`** — JWT 검증, 중복 제출 방지 (KV + DB UNIQUE), Supabase INSERT
  - 수락 기준: 중복 제출 409 반환, 마감 후 제출 400 반환, 정상 제출 201 반환

- [FEATURE] **`GET /api/results`** — 어제 시그널 + 내 예측 조인, 점수 계산, 스트릭 조회
  - 수락 기준: 정답/오답 정확히 계산, 점수 계산 로직 유닛 테스트 통과

- [FEATURE] **`GET /api/stats`** — user_stats 조회
  - 수락 기준: 총 점수, 스트릭, 참여 횟수 정확히 반환

- [FEATURE] **`POST /api/cron/generate`** — CRON_SECRET 검증, Gemini API 호출, 시그널 3개 생성, DB + KV 저장
  - 수락 기준: 멱등성 보장 (같은 날 중복 실행 시 409), 암호화폐/투자 권유 내용 미포함 확인

- [FEATURE] **AdMob 리워드 광고** — Bedrock SDK `showRewardAd()`, 시청 완료 시 +5점 처리
  - 수락 기준: 광고 시청 완료 후 점수 증가, 미시청 시 점수 변화 없음

---

## P3 — 다음 스프린트 (Week 2~3)

- [FEATURE] **스트릭 시각화** — 연속 참여 일수 불꽃 이모지, 7/14/30일 달성 배지
- [FEATURE] **결과 공유** — 결과 카드 이미지 생성 + 토스 공유 시트 연동
- [FEATURE] **전면 광고** — 리더보드 진입 시 AdMob 전면 광고 (Bedrock SDK, 1회/일)
- [FEATURE] **푸시 알림** — 토스 알림 SDK 연동, 매일 오전 "오늘의 시그널 도착!" 알림
- [FEATURE] **과거 아카이브** — 지난 7일 시그널 + 내 예측 기록 조회 화면
- [UX] **온보딩 플로우** — 첫 진입 시 서비스 설명 2~3 슬라이드 + 첫 예측 유도
- [UX] **빈 상태 UI** — 시그널 준비 중, 어제 예측 없음, 리더보드 비어있음 화면
- [PERFORMANCE] **JS 번들 최적화** — `vite-bundle-visualizer`로 분석, 200KB 이하 목표
- [PERFORMANCE] **이미지 최적화** — WebP 포맷, lazy loading 적용
- [STRATEGY] **시그널 품질 측정** — 실제 결과 정확도 추적, Gemini 프롬프트 개선 지표화
- [DOCS] **README 및 CONTRIBUTING.md** — 개발 환경 세팅 가이드, Bedrock SDK 모킹 설명
