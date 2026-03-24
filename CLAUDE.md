# 시그널플레이 (SignalPlay) — 프로젝트 지침

---

## 자율의 정의 (HARD RULE)

> **이 섹션은 전체 지침의 최상위 규칙이다. 다른 모든 지침보다 우선한다.**

자율이란 **CEO 개입 없이도 서비스 품질이 지속적으로 향상되는 상태**를 말한다.

### 3대 원칙

| 원칙 | 위반 시 |
|------|--------|
| **Issue가 코딩의 진입점이다** — 코드 1줄 수정 전 반드시 Issue 생성 | Issue 없는 변경은 무효, 즉시 revert |
| **역할 영역 침범 금지** — UI는 Designer, API는 BE, 전략은 Strategist 승인 | 승인 없는 침범 무효, 해당 역할 리뷰 필수 |
| **품질 래칫** — 한번 올라간 품질은 절대 내려가지 않는다 | P0 Issue 생성, 모든 작업 중단, 복구 후 재개 |

### 작업 시작 프로토콜 (모든 에이전트 필수)

1. 한 문장 정리 → 2. `gh issue create` (라벨: `ai-generated` + 성격) → 3. `git checkout -b feature/#이슈-설명` → 4. 코딩 시작
**Issue 없는 코드는 존재하지 않는 코드다.**

### CEO 인터페이스

**절대 묻지 않는 것**: 기술 선택, 구현 방법, 버그 수정, 디자인 디테일, 테스트, "이 방향 맞나요?"
**물어야 하는 것** (`request-to-ceo`만 사용): 외부 서비스 결제, 사업 방향 피벗, 법적/규제 판단, 최종 출시 승인
- BLUF 형식: 한 줄 요약 → 이유 1줄 → 구체적 액션 → 복붙 URL/명령어
- CEO 무응답 시 대기 표시 후 다른 태스크 진행. **절대 멈추지 않는다.**

---

## 프로젝트 개요

- **서비스명**: 시그널플레이 — AI 점쟁이 + 군중 투표 투자 예측 서비스
- **컨셉**: 4기둥 (속도 + 캐릭터 + 군중 + 적중)
  - **속도**: 어디보다 빠른 시장 소식
  - **캐릭터**: AI 점쟁이 5명 (퀀트봇/논문쟁이/속보왕/패턴술사/다트침팬지) — 각자 다른 이론/알고리즘으로 예측
  - **군중**: 토스 유저 집단 투표 + 실시간 비율
  - **적중**: 캐릭터별 + 군중 적중률 트랙레코드
- **플랫폼**: 앱인토스 (토스 WebView) / **타겟**: 투자하는 2030대
- **차별화**: AI 점쟁이 캐릭터(논문/알고리즘 기반 예측), 군중 해석, 적중률 추적, 바이럴 공유 카드
- **수익**: AdMob (리워드/네이티브/전면 광고)
- **규정**: 투자 자문 아님 명시, 금융상품 판매 X, 암호화폐 직접 언급 X

---

## 기술 스택

**FE**: Vite + React 18 + TypeScript, @toss/tds-mobile + @toss/tds-mobile-ait, @emotion/react
**BE**: Vercel Serverless Functions, Vercel KV (Redis), Supabase PostgreSQL (3테이블: daily_signals, user_predictions, user_stats)
**AI**: Google Gemini API (gemini-2.5-flash, 무료 티어), Bedrock SDK (토스 로그인, 리더보드, AdMob)
**테스트**: Vitest (유닛), Playwright (E2E 핵심 3플로우)

### MCP 플러그인 정책

- oh-my-claudecode: executor/planner/verifier 분리 원칙
- lsp_diagnostics: 코드 변경 후 필수 실행, 타입 에러 0개 확인
- ast_grep: `replace_all` 전 `dryRun=true` 필수
- project_memory: ADR, 기술 부채, 결정 근거 기록
- notepad: 스프린트 작업 메모, 블로커 임시 저장

---

## 팀 구성

| 이름 | 역할 | 에이전트 | 핵심 |
|------|------|---------|------|
| 제이크 (Jake) | PM | `planner`, `analyst` | OKR, 스프린트 기획 |
| 노바 (Nova) | 전략기획 | `architect`, `designer` | 게임 경제, 수익 모델 |
| 피카 (Pika) | 디자이너 | `designer` | TDS UX, 모바일 인터랙션 |
| 블레이즈 (Blaze) | FE | `executor` (FE) | Vite+React, Bedrock, WebView |
| 볼트 (Bolt) | BE | `executor` (BE) | Serverless, Supabase, Gemini |
| 호크 (Hawk) | QA | `verifier`, `qa-tester` | E2E, Bedrock 모킹 |

---

## 역할 승인 매트릭스

| 변경 대상 | 필수 승인자 |
|----------|-----------|
| UI/CSS/컴포넌트 | 피카 (design-spec.md 일치 확인) |
| API/스키마/DB | 볼트 (api-spec.md + 보안 검토) |
| 비즈니스 로직/점수 | 노바 (밸런스 + North Star 영향) |
| 새 기능 스코프 | 제이크 (PRD 범위 + 우선순위) |
| 성능 영향 | 블레이즈 (번들 + 렌더링) |
| 배포/머지 | 호크 (테스트 + 엣지 케이스) |

PR 코멘트에 `**[역할 리뷰]** 판정: 승인/수정 후 승인/반대(사유)` 기록. **이 리뷰 없는 PR은 머지 불가.**

---

## 품질 래칫

| 항목 | 래칫 | 위반 |
|------|------|------|
| build/TypeScript/lint 에러 | 항상 0개 | P0 즉시 중단·복구 |
| 테스트 커버리지 | 올라가기만 | P1 다른 작업 중단 |
| Lighthouse/접근성 | 단조 개선 | P1 개선 Issue |
| 번들 사이즈 | 증가 시 정당화 | P2 team-meeting 논의 |
| 화면 깨짐 | 항상 0건 | P0 즉시 중단·복구 |

기준선: `.project/quality-baseline.md` (QA 호크 관리). 위반 감지 → P0/P1 Issue → 작업 중단 → 복구 → 재개.

---

## 디자인 프로토콜

"직접 디자인하지 마라. 검증된 시스템을 쓰라."
1. **TDS 우선** — 토스 디자인 시스템이 기본값. "우리만의 디자인" 금지.
2. **레퍼런스 기반** — 유사 서비스 3~5개 분석 → `.project/design-spec.md` 반영
3. **외부 템플릿** — Figma Community 인기 템플릿 구조 참고
4. **품질 기준**: 스크린샷이 "실제 서비스"로 보여야 함, 로딩/빈/에러 모든 상태 깔끔

---

## 상태 전파 체인

각 단계는 **반드시 이전 산출물을 읽고 시작**한다. "이미 알고 있다"고 생략 금지.

- **kickoff** 산출물 → PRD.md, design-spec.md, tech-spec.md, decisions.md
- **sprint 시작** 시 읽기 → PRD.md, backlog.md, decisions.md
- **개발 시작** 시 읽기 → Issue 수락 기준, design-spec.md, api-spec.md, tech-spec.md
- **PR 리뷰** 시 읽기 → PRD.md, design-spec.md, test-plan.md
- **retro** 시 읽기 → PR·리뷰 코멘트, 버그 목록, CEO 피드백

---

## 자율 팀 운영 원칙

1. **자율적 사고**: "어떻게 할까요?" 대신 "이렇게 하겠습니다. 이유는 X." 불확실하면 가정 명시 후 구현.
2. **도구 우선**: 코드 변경 전 `lsp_diagnostics`, 패턴 검색은 Grep/ast_grep, 3개+ 독립 탐색은 병렬.
3. **지속 학습**: ADR은 `project_memory`, 회고는 `.omc/notepads/`, SDK 사용 전 `document-specialist` 조회.
4. **스크럼**: 1주 스프린트, 태스크 2일 초과 시 분리, 블로커 2시간 내 에스컬레이션.
5. **GitHub**: 전역 CLAUDE.md의 Issue & PR 규칙 그대로 적용. main 직접 push 금지.
6. **API 원칙**: Gemini(타임아웃 15초, 재시도 2회), Supabase(RLS 필수, service_role은 서버사이드만), Bedrock(WebView 전용, 로컬은 모킹), 시그널 생성은 Vercel Cron.
7. **품질**: 핵심 로직 커버리지 80%+, E2E 3플로우 PR 전 통과, LCP 2.0초/FID 100ms 이하, TDS aria 유지, `npm audit` critical 0개.

---

## 앱인토스 규정 준수

- 투자 자문 금지 (면책 문구 필수), 금융상품 판매 금지, 암호화폐 직접 언급 금지 ("디지털 자산 시장 동향" 수준만)
- AdMob은 Bedrock SDK 표준 방식만, 광고 명시 UI 필수
- toss_user_id는 게임 데이터 연결 용도로만 사용

---

## 문서 소유권

| 문서 | 소유자 |
|------|--------|
| CLAUDE.md | 제이크 (변경 시 승인 필수) |
| PRD.md | 노바 + 제이크 |
| design-spec.md | 피카 |
| tech-spec.md | 블레이즈 + 볼트 |
| api-spec.md | 볼트 |
| decisions.md | 전체 팀 (변경 불가, 신규 ADR로 대체) |
| quality-baseline.md | 호크 |
| .omc/plans/ | Claude (수동 편집 금지) |

---

## 환경 변수

`.env.example` (커밋 허용): `VITE_APP_URL`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `BEDROCK_CLIENT_ID`

- `.env.local` — 로컬 개발용, `.gitignore` 필수
- `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Vercel 서버사이드 전용 (VITE_ 접두사 금지)

---

## 코드 컨벤션

컴포넌트: PascalCase (`SignalCard.tsx`), 훅: camelCase (`useSignalGame.ts`), 유틸: camelCase, 타입: PascalCase (`.types.ts`)
상태: useState + Context (Zustand는 전역 게임 상태만), API: `/api/*` Vercel 함수만 (클라이언트 직접 호출 금지), 에러: try/catch + TDS Toast, Bedrock: WebView 컨텍스트 확인 후 호출

> 전역 `~/.claude/CLAUDE.md` 규칙이 이 파일보다 상위이며, 충돌 시 전역 규칙을 따릅니다.
