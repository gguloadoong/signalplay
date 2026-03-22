# 시그널플레이 (SignalPlay) — 프로젝트 지침

## 프로젝트 개요

- **서비스명**: 시그널플레이 (SignalPlay)
- **한줄 소개**: AI가 분석한 투자 시그널로 예측 게임을 즐기고, 매일 투자 인사이트를 캐치하세요
- **핵심 문제**: 투자 정보가 분산되어 있고 어렵고 지루해서 꾸준히 따라가기 힘듦. 투자 입문자들이 정보의 바다에서 익사하는 것을 막는다.
- **타겟**: 2030대 투자 초보~중급자, 게임을 좋아하고 투자에 관심 있는 사람
- **차별화 요소**:
  - AI 논문/데이터 기반 시그널 (GPT-4o + 학술 임베딩): 감에 의존하지 않는 근거 있는 예측
  - 게이미피케이션: 포인트, 리더보드, 연속 예측 스트릭으로 꾸준한 참여 유도
  - 크로스에셋 통합: 주식 / 코인 / 부동산 시그널을 한 화면에서
  - Toss 미니앱 배포: 2030 금융앱 유저를 즉시 접점으로 확보
- **수익모델**: 광고 수익 (기본) + 프리미엄 시그널 구독 (월정액)

---

## 기술 스택 및 플러그인 (MCP) 정책

### 프론트엔드

| 기술 | 버전 | 선택 이유 |
|------|------|-----------|
| Next.js (App Router) | 15.x | RSC + 서버 액션으로 API 레이어 최소화, Vercel 최적화 |
| TypeScript | 5.x | 팀 전체 타입 안전성 강제, 런타임 에러 사전 차단 |
| Tailwind CSS | v4 | 모바일 퍼스트 유틸리티 CSS, 디자인 토큰 일관성 |
| shadcn/ui | latest | 접근성 고려된 Radix 기반 컴포넌트, 커스터마이징 자유도 높음 |
| Framer Motion | latest | 투자 시그널 등장/전환 애니메이션, 게임 피드백 UX |

### 백엔드 & 인프라

| 기술 | 역할 |
|------|------|
| Supabase PostgreSQL | 유저/게임/시그널 데이터 저장, RLS 기반 보안 |
| Supabase Auth | 소셜 로그인(카카오, 구글), JWT 세션 관리 |
| Supabase Edge Functions | 시그널 생성 트리거, 실시간 집계 |
| Supabase Realtime | 리더보드 실시간 업데이트, 예측 결과 푸시 |
| Vercel | 프론트엔드 배포, Edge Middleware |

### AI

| 기술 | 사용처 |
|------|--------|
| OpenAI GPT-4o | 시그널 텍스트 생성, 뉴스 요약, AI 인사이트 카드 |
| OpenAI Embeddings (text-embedding-3-small) | AI 논문/리포트 벡터화, 유사 시그널 검색 |
| pgvector (Supabase) | 임베딩 저장 및 코사인 유사도 검색 |

### 테스팅

| 도구 | 대상 |
|------|------|
| Vitest | 유닛 테스트 (시그널 계산 로직, 유틸리티) |
| Playwright | E2E 테스트 (게임 플로우, 예측 제출, 리더보드) |

### MCP 플러그인 정책

- **oh-my-claudecode**: 에이전트 오케스트레이션 메인 플러그인. executor/planner/verifier 분리 원칙 준수.
- **lsp_diagnostics**: 모든 코드 변경 후 반드시 실행. 타입 에러 0개 확인 후 PR 오픈.
- **ast_grep_search / ast_grep_replace**: 구조적 코드 패턴 검색·변환. `replace_all` 사용 전 `dryRun=true` 필수.
- **project_memory**: 아키텍처 결정 사항(ADR), 기술 부채 목록, 주요 결정 근거 기록.
- **notepad**: 스프린트 내 작업 메모, 블로커, 실험 결과 임시 저장.
- **state**: 장기 실행 태스크(시그널 배치 생성, E2E 테스트) 상태 추적.

---

## 팀 구성

| 이름 | 닉네임 | 역할 | 에이전트 매핑 | 핵심 스킬 |
|------|--------|------|--------------|-----------|
| 제이크 (Jake) | 자동화 못 참는 PM | PM | `planner`, `analyst` | 사용자 행동 분석, OKR 설정, 스프린트 기획 |
| 노바 (Nova) | 경제 시스템 덕후 | 전략기획 | `architect`, `designer` | 게임 경제 설계, 포인트/리워드 밸런싱, 수익 모델 |
| 피카 (Pika) | 픽셀 하나에 목숨 거는 | 디자이너 | `designer` | 금융 UX, Figma 컴포넌트 시스템, 모바일 인터랙션 |
| 블레이즈 (Blaze) | 번들 사이즈 강박증 | 프론트엔드 | `executor` (FE) | Next.js App Router, 모바일 웹 최적화, 애니메이션 |
| 볼트 (Bolt) | 쿼리 하나에 밤새는 | 백엔드 | `executor` (BE) | Supabase, 실시간 데이터 처리, AI 파이프라인 |
| 호크 (Hawk) | 버그 못 보면 잠 못 자는 | QA | `verifier`, `qa-tester` | 금융앱 품질 검증, Playwright E2E, 엣지 케이스 발굴 |

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
   - 외부 SDK/API 사용 전 공식 문서를 `document-specialist`로 조회한다.

4. **스크럼 타임박스 (Scrum Timeboxing)**
   - 스프린트: 2주 단위. 스프린트 계획은 월요일 오전, 리뷰는 격주 금요일.
   - 데일리 스탠드업: 어제 한 것 / 오늘 할 것 / 블로커 — 각 항목 2문장 이내.
   - 태스크 예상 시간이 3일 초과 시 즉시 분리한다. 5일 초과는 허용 안 함.
   - 블로커 발생 시 2시간 내 에스컬레이션. 혼자 붙잡고 하루 보내지 않는다.

5. **GitHub 관리 (GitHub Workflow)**
   - `feat:` / `fix:` 작업은 반드시 Issue → Branch → PR 순서 준수 (전역 CLAUDE.md 규칙 적용).
   - 브랜치 네이밍: `feature/#이슈번호-기능명`, `fix/#이슈번호-버그명`.
   - PR 제목은 한국어 + Conventional Commit 말머리. 본문에 `Closes #이슈번호` 필수.
   - main 직접 push 금지. 모든 변경은 PR을 통해 머지.
   - CI (lint → typecheck → build → test) 통과 후 머지.

6. **API 요청 원칙 (API Request Standards)**
   - OpenAI API 호출은 항상 타임아웃(30초) + 재시도(최대 3회, 지수 백오프) 설정.
   - Supabase 쿼리는 RLS 정책 적용 확인 후 실행. `service_role` 키는 Edge Function에서만.
   - 외부 API 키는 환경변수로만 관리. `.env.local`에 저장, `.env.example`에 키 이름만 명시.
   - 배치 처리(시그널 생성)는 Edge Function으로 분리, 프론트엔드에서 직접 대량 호출 금지.

7. **품질 우선 (Quality First)**
   - 핵심 비즈니스 로직(시그널 계산, 예측 검증, 포인트 집계)은 유닛 테스트 커버리지 80% 이상.
   - 게임 플로우 E2E 테스트는 PR 머지 전 통과 필수.
   - 성능 기준: LCP 2.5초 이하, FID 100ms 이하 (모바일 3G 기준).
   - 접근성: shadcn/ui 컴포넌트 기본 aria 속성 유지. 임의 제거 금지.
   - 프로덕션 배포 전 `npm audit` 실행, critical 취약점 0개 유지.

---

## 문서 소유권

| 문서 | 소유자 | 읽기 권한 | 쓰기 권한 | 비고 |
|------|--------|-----------|-----------|------|
| `CLAUDE.md` | 제이크 (Jake) | 전체 팀 | Jake + Claude | 프로젝트 규칙 변경 시 Jake 승인 필수 |
| `.project/PRD.md` | 노바 (Nova) + 제이크 | 전체 팀 | Nova, Jake | 기능 추가/변경 시 동기화 필수 |
| `.project/DESIGN_SYSTEM.md` | 피카 (Pika) | 전체 팀 | Pika | 컴포넌트 스펙, 색상 토큰, 타이포그래피 |
| `.project/ARCHITECTURE.md` | 볼트 (Bolt) + 블레이즈 | 전체 팀 | Bolt, Blaze | 인프라/시스템 구조 결정 사항 |
| `.project/ADR/` | 전체 팀 | 전체 팀 | 결정 당사자 | Architecture Decision Records, 변경 불가 (신규 ADR로 대체) |
| `.omc/plans/` | Claude (planner) | 전체 팀 | Claude only | 플랜 파일 수동 편집 금지 |
| `docs/api/` | 볼트 (Bolt) | 전체 팀 | Bolt | Supabase Edge Function API 스펙 |
| `docs/qa/` | 호크 (Hawk) | 전체 팀 | Hawk | 테스트 케이스, 버그 리포트 템플릿 |
| `README.md` | 제이크 (Jake) | 공개 | Jake + Claude | 공개 문서, 마케팅 언어 포함 |

---

## 환경 변수 관리

```bash
# .env.example (커밋 허용)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=
TOSS_MINI_APP_CLIENT_ID=
```

- `.env.local` — 로컬 개발용, `.gitignore`에 포함 필수
- Vercel 대시보드 — 스테이징/프로덕션 환경변수 별도 관리
- Supabase Edge Function — Supabase Vault 사용 (OPENAI_API_KEY 등 서버 전용)

---

## 코드 컨벤션 (Quick Reference)

```typescript
// 컴포넌트 파일명: PascalCase (SignalCard.tsx)
// 훅 파일명: camelCase (useSignalGame.ts)
// 유틸 파일명: camelCase (formatSignalScore.ts)
// 타입 파일명: PascalCase (Signal.types.ts)

// 서버 컴포넌트 기본, 클라이언트는 필요한 경우만 'use client'
// fetch는 Next.js 캐싱 활용 (revalidate, tags)
// Supabase 쿼리는 /lib/supabase/ 아래 함수로 추상화
// 에러 처리: Result 패턴 또는 try/catch + 사용자 친화적 토스트
```

---

> 이 파일은 Claude Code가 시그널플레이 프로젝트를 이해하고 일관성 있게 작업하기 위한 최우선 참조 문서입니다.
> 전역 `~/.claude/CLAUDE.md` 규칙이 이 파일보다 상위이며, 충돌 시 전역 규칙을 따릅니다.
