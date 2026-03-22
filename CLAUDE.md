# 시그널플레이 (SignalPlay) — 프로젝트 지침

## 프로젝트 개요

- **서비스명**: 시그널플레이 (SignalPlay)
- **한줄 소개**: 경제 시그널을 예측하고, 추이를 추적하고, AI 인사이트를 소비하는 습관형 투자 게임
- **컨셉**: "마켓 배틀" — 하루 종일 열어볼 이유가 있는 투자 예측 게임
  - 오전 배틀(09:00→15:30 결과) + 플래시 배틀(속보 기반, 1~2시간 결과) + 나이트 배틀(18:00→익일 09:00)
  - 예측 → 추이 추적 → AI 피드 소비 → 결과 확인의 순환 구조
- **핵심 문제**: 경제 뉴스는 많고 읽기 어렵다. 바쁜 2030이 30초에 동향을 파악하고, 예측 게임+AI 피드로 하루 5회+ 앱을 여는 습관을 만든다.
- **플랫폼**: 앱인토스 (토스 앱 내 미니앱, WebView)
- **타겟**: 토스 앱 사용자, 경제 동향에 관심 있는 2030대
- **핵심 게임 메커닉**:
  - 호재/악재/영향없음 3지선다 + **확신도 x1~x3 배수** (리스크/리워드)
  - 3개 전부 적중 시 **PERFECT 보너스** (+20)
  - 틀리면 점수 깎임 (x3 오답 = -10점) → 감정 발생
  - **군중 심리 표시**: "전체 유저의 73%가 호재 예측 중"
  - **주간 토너먼트** 리더보드 (매주 리셋)
- **차별화 요소**:
  - 다중 배틀 주기 (오전/플래시/나이트) → 하루 종일 열어볼 이유
  - 중간 추이 추적 → 스포츠 중계 보듯 내 예측 확인
  - AI 시그널 피드 (강세AI vs 약세AI 토론, 엄선 뉴스 해석)
  - TDS(토스 디자인 시스템) 기반 → 토스 앱과 완벽 일체감
- **수익모델**: AdMob 광고 — 결과 확인 전 리워드 광고, 피드 네이티브 광고, 전면 광고 (1회/일)
- **규정 준수**: 투자 자문 아님 명시, 금융상품 판매 X, 암호화폐 직접 언급 X

---

## 기술 스택 및 MCP 정책

### 프론트엔드

| 기술 | 버전 | 선택 이유 |
|------|------|-----------|
| Vite + React | 5.x + 18.x | 앱인토스 WebView SPA에 최적. Next.js SSR 불필요. |
| TypeScript | 5.x | 팀 전체 타입 안전성 강제, 런타임 에러 사전 차단 |
| @toss/tds-mobile | latest | 토스 디자인 시스템 WebView 컴포넌트 (Button, ListRow, Tab, Toast, Dialog, BottomSheet, Badge, Skeleton, BarChart 등 30+) |
| @toss/tds-mobile-ait | latest | TDS Provider + Overlay Extension (useDialog, useToast, useBottomSheet) |
| @emotion/react | ^11 | TDS 의존성 (CSS-in-JS) |

### 백엔드 & 인프라

| 기술 | 역할 |
|------|------|
| Vercel Serverless Functions | API 엔드포인트 (예측 제출, 결과 조회, 통계) |
| Vercel KV (Redis) | 오늘의 시그널 캐싱, 세션 데이터 |
| Supabase PostgreSQL | 영속 데이터 저장 (3테이블: daily_signals, user_predictions, user_stats) |

### AI & SDK

| 기술 | 사용처 |
|------|--------|
| Google Gemini API (gemini-2.0-flash) | 뉴스 요약 + 시그널 카드 생성 (무료 티어) |
| Bedrock SDK (토스 통합 SDK) | 토스 로그인, 리더보드, AdMob 광고 연동 |

### 테스팅

| 도구 | 대상 |
|------|------|
| Vitest | 유닛 테스트 (점수 계산, 유틸리티) |
| Playwright | E2E 테스트 (시그널 확인 → 예측 → 결과 확인 3개 핵심 플로우) |

### MCP 플러그인 정책

- **oh-my-claudecode**: 에이전트 오케스트레이션 메인 플러그인. executor/planner/verifier 분리 원칙 준수.
- **lsp_diagnostics**: 모든 코드 변경 후 반드시 실행. 타입 에러 0개 확인 후 PR 오픈.
- **ast_grep_search / ast_grep_replace**: 구조적 코드 패턴 검색·변환. `replace_all` 사용 전 `dryRun=true` 필수.
- **project_memory**: 아키텍처 결정 사항(ADR), 기술 부채 목록, 주요 결정 근거 기록.
- **notepad**: 스프린트 내 작업 메모, 블로커, 실험 결과 임시 저장.

---

## 팀 구성

| 이름 | 닉네임 | 역할 | 에이전트 매핑 | 핵심 스킬 |
|------|--------|------|--------------|-----------|
| 제이크 (Jake) | 자동화 못 참는 PM | PM | `planner`, `analyst` | 사용자 행동 분석, OKR 설정, 스프린트 기획 |
| 노바 (Nova) | 경제 시스템 덕후 | 전략기획 | `architect`, `designer` | 게임 경제 설계, 포인트/리워드 밸런싱, 수익 모델 |
| 피카 (Pika) | 픽셀 하나에 목숨 거는 | 디자이너 | `designer` | TDS 기반 UX, Figma 컴포넌트, 모바일 인터랙션 |
| 블레이즈 (Blaze) | 번들 사이즈 강박증 | 프론트엔드 | `executor` (FE) | Vite+React SPA, Bedrock SDK 연동, WebView 최적화 |
| 볼트 (Bolt) | 쿼리 하나에 밤새는 | 백엔드 | `executor` (BE) | Vercel Serverless, Supabase, Gemini API 파이프라인 |
| 호크 (Hawk) | 버그 못 보면 잠 못 자는 | QA | `verifier`, `qa-tester` | 앱인토스 환경 검증, Playwright E2E, Bedrock SDK 모킹 |

---

## 자율 팀 운영 원칙

1. **자율적 사고 (Autonomous Thinking)**
   - 지시 대기 없이 다음 할 일을 스스로 파악하고 선제적으로 제안한다.
   - "어떻게 할까요?" 대신 "이렇게 하겠습니다. 이유는 X입니다."로 소통한다.
   - 불확실한 요구사항은 가정을 명시하고 구현한 뒤 확인받는다.

2. **도구 우선 활용 (Tool-First Execution)**
   - 코드 변경 전 `lsp_diagnostics`로 현재 상태 확인.
   - 패턴 검색은 Grep/ast_grep을 먼저 사용하고 파일을 열기 전에 범위를 좁힌다.
   - 3개 이상 독립적 탐색은 병렬 에이전트로 동시 실행한다.

3. **지속적 학습 (Continuous Learning)**
   - 새로운 기술 결정, 버그 원인, 성능 개선 사례는 `project_memory`에 ADR로 기록한다.
   - 스프린트 종료 후 회고 내용을 `.omc/notepads/`에 보존한다.
   - Bedrock SDK / Gemini API / TDS 사용 전 공식 문서를 `document-specialist`로 조회한다.

4. **스크럼 타임박스 (Scrum Timeboxing)**
   - 스프린트: 1주 단위 (MVP 목표). 계획은 월요일 오전, 리뷰는 금요일.
   - 데일리 스탠드업: 어제 한 것 / 오늘 할 것 / 블로커 — 각 항목 2문장 이내.
   - 태스크 예상 시간이 2일 초과 시 즉시 분리. 3일 초과는 허용 안 함.
   - 블로커 발생 시 2시간 내 에스컬레이션.

5. **GitHub 관리 (GitHub Workflow)**
   - `feat:` / `fix:` 작업은 반드시 Issue → Branch → PR 순서 준수 (전역 CLAUDE.md 규칙 적용).
   - 브랜치 네이밍: `feature/#이슈번호-기능명`, `fix/#이슈번호-버그명`.
   - PR 제목은 한국어 + Conventional Commit 말머리. 본문에 `Closes #이슈번호` 필수.
   - main 직접 push 금지. 모든 변경은 PR을 통해 머지.
   - CI (lint → typecheck → build → test) 통과 후 머지.

   **기획 리뷰 (Claude Code 담당):**
   - PR 본문에 "이 PR이 무엇을 추가/변경하는지" 명시되어 있는지 확인한다
   - PR 본문을 기준으로 CLAUDE.md의 프로젝트 목표/타겟 유저/핵심 가치와 방향이 맞는지 판단한다
   - 서비스 방향과 맞지 않으면 "방향성 확인 필요" 코멘트를 남긴다
   - PRD 대조는 하지 않는다 — outdated PRD로 잘못된 판단을 내리는 것을 방지

   **PR 리뷰 대응 (절대 건너뛰지 마라):**
   - ⚠️ PR 생성 후 즉시 머지 금지. 반드시 봇 리뷰를 확인하고 대응한 뒤 머지하라.
   ```
   PR 생성 후 필수 절차:
   1. PR 생성 → 최소 2분 대기 (봇 리뷰 도착 시간)
   2. gh api 로 봇 리뷰 코멘트 확인 (Gemini, CodeRabbit, Copilot)
   3. "리뷰 종합" 코멘트 작성 — 봇 간 동의/충돌/채택/기각 정리
   4. @coderabbitai 멘션으로 토론 질문을 던진다
   5. 최소 2분 대기 → 봇 응답 확인 (gh api 로 새 코멘트 체크)
   6. 봇 응답을 읽고 "최종 판단" 코멘트 작성 후 머지

   토론 종료 규칙 (무한 루프 방지):
   - 토론은 최대 1회전: 종합 코멘트(1회) → 봇 응답 확인(1회) → 최종 판단 → 머지
   - 봇 응답에 새로운 질문을 던지지 않는다 — 읽고 판단만 한다
   - 보안/버그 지적 → 코드 수정 후 머지 (추가 토론 없이)
   - 스타일/취향 제안 → 채택 or 기각 근거 한 줄 남기고 머지
   - 봇 응답이 2분 내 안 오면 기존 리뷰만으로 판단하고 머지
   ```

6. **API 요청 원칙 (API Request Standards)**
   - Gemini API 호출은 항상 타임아웃(15초) + 재시도(최대 2회) 설정.
   - Supabase 쿼리는 RLS 정책 적용 확인 후 실행. `service_role` 키는 Vercel 서버사이드에서만.
   - 외부 API 키는 환경변수로만 관리. `.env.local`에 저장, `.env.example`에 키 이름만 명시.
   - 시그널 생성 배치는 Vercel Cron Job으로 분리, 프론트엔드에서 직접 Gemini 호출 금지.
   - Bedrock SDK 호출은 앱인토스 WebView 컨텍스트에서만 동작 — 로컬 개발 시 모킹 필수.

7. **품질 우선 (Quality First)**
   - 핵심 비즈니스 로직(점수 계산, 예측 검증, 스트릭 관리)은 유닛 테스트 커버리지 80% 이상.
   - 3개 핵심 E2E 플로우 (시그널 확인 / 예측 제출 / 결과 확인) PR 머지 전 통과 필수.
   - 성능 기준: LCP 2.0초 이하, FID 100ms 이하 (토스 앱 WebView 기준).
   - TDS 컴포넌트 기본 aria 속성 유지. 임의 제거 금지.
   - 프로덕션 배포 전 `npm audit` 실행, critical 취약점 0개 유지.

---

## 앱인토스 규정 준수 원칙

- **투자 자문 금지**: 모든 시그널 카드 하단에 "투자 참고용 정보이며 투자 책임은 본인에게 있습니다" 면책 문구 필수.
- **금융상품 판매 금지**: 증권사 계좌 개설 링크, ETF/펀드 직접 추천 콘텐츠 포함 금지.
- **암호화폐 직접 언급 금지**: 비트코인, 이더리움 등 가상자산 직접 언급 및 예측 대상 제외. "디지털 자산 시장 동향" 수준의 간접 언급만 허용.
- **광고 규정**: AdMob 광고는 Bedrock SDK 표준 방식으로만 구현. 광고임을 명시하는 UI 필수.
- **개인정보**: 토스 로그인을 통해 취득한 유저 식별자(toss_user_id)는 서비스 내 게임 데이터 연결 용도로만 사용.

---

## 문서 소유권

| 문서 | 소유자 | 비고 |
|------|--------|------|
| `CLAUDE.md` | 제이크 (Jake) | 프로젝트 규칙 변경 시 Jake 승인 필수 |
| `.project/PRD.md` | 노바 (Nova) + 제이크 | 기능 추가/변경 시 동기화 필수 |
| `.project/design-spec.md` | 피카 (Pika) | TDS 컴포넌트 스펙, 색상 토큰 |
| `.project/tech-spec.md` | 블레이즈 (Blaze) + 볼트 | 아키텍처 및 기술 결정 사항 |
| `.project/api-spec.md` | 볼트 (Bolt) | Vercel API 스펙 |
| `.project/decisions.md` | 전체 팀 | ADR, 변경 불가 (신규 ADR로 대체) |
| `.omc/plans/` | Claude (planner) | 플랜 파일 수동 편집 금지 |

---

## 환경 변수 관리

```bash
# .env.example (커밋 허용)
VITE_APP_URL=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
KV_REST_API_URL=
KV_REST_API_TOKEN=
BEDROCK_CLIENT_ID=
```

- `.env.local` — 로컬 개발용, `.gitignore`에 포함 필수
- Vercel 대시보드 — 스테이징/프로덕션 환경변수 별도 관리
- `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Vercel 서버사이드 전용. 클라이언트 번들에 절대 포함 금지 (VITE_ 접두사 사용 불가).

---

## 코드 컨벤션 (Quick Reference)

```typescript
// 컴포넌트 파일명: PascalCase (SignalCard.tsx)
// 훅 파일명: camelCase (useSignalGame.ts)
// 유틸 파일명: camelCase (formatScore.ts)
// 타입 파일명: PascalCase (Signal.types.ts)

// 상태관리: useState + Context (Zustand는 전역 게임 상태에만)
// API 호출: /api/* Vercel 함수로만. 클라이언트에서 Supabase/Gemini 직접 호출 금지.
// 에러 처리: try/catch + 토스트 알림 (TDS Toast 컴포넌트)
// Bedrock SDK: window.toss 또는 import from '@toss/bedrock' — WebView 컨텍스트 확인 후 호출
```

---

> 이 파일은 Claude Code가 시그널플레이 프로젝트를 이해하고 일관성 있게 작업하기 위한 최우선 참조 문서입니다.
> 전역 `~/.claude/CLAUDE.md` 규칙이 이 파일보다 상위이며, 충돌 시 전역 규칙을 따릅니다.
