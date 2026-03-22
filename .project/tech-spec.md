# Tech Spec: 시그널플레이 (SignalPlay)

> **소유자**: FE 블레이즈
> **최종 수정**: 2026-03-22
> **상태**: 초안 (Draft)

---

## 1. 기술 스택

| 레이어 | 기술 | 버전 | 선택 이유 |
|---|---|---|---|
| 프레임워크 | Next.js | 15 (App Router) | RSC, ISR, Server Actions 지원 |
| 언어 | TypeScript | 5.x | 타입 안전성, 팀 협업 |
| 스타일링 | Tailwind CSS | v4 | CSS-first config, 성능 개선 |
| UI 컴포넌트 | shadcn/ui | latest | 커스터마이징 가능, 접근성 내장 |
| 애니메이션 | Framer Motion | 11.x | 선언적 애니메이션, React 최적화 |
| 백엔드/DB | Supabase | latest | Auth + PostgreSQL + Realtime + Edge Functions |
| AI | OpenAI API | gpt-4o-mini | 인사이트 카드 생성, 비용 효율 |
| 배포 | Vercel | - | Next.js 최적화, Preview PR |
| 상태관리(클라이언트) | Zustand | 5.x | 경량, TypeScript 친화 |
| 서버 상태 | TanStack Query | v5 | 캐싱, 리페치 전략 |

---

## 2. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                    │
│  Next.js 15 App Router (Vercel Edge Network)            │
│  RSC + Client Components + Streaming                    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│                  Supabase Platform                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Auth        │  │  PostgreSQL  │  │  Realtime    │  │
│  │  (카카오/구글) │  │  (DB)        │  │  (WS)        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Edge Functions (Deno)               │   │
│  │  - signal-generator (cron: 매일 08:50)           │   │
│  │  - insight-generator (cron: 매일 08:00, 14:00)   │   │
│  │  - score-calculator (cron: 매일 09:10)           │   │
│  │  - news-fetcher (cron: 매 15분)                  │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────────────┘
               │
   ┌───────────┴───────────┐
   │    External APIs      │
   │  - OpenAI API         │
   │  - NewsAPI            │
   │  - Alpha Vantage      │
   │  - arXiv API          │
   └───────────────────────┘
```

### 데이터 흐름

1. Edge Function (cron)이 외부 API에서 뉴스/시장 데이터 수집
2. OpenAI API로 시그널 및 인사이트 카드 생성
3. Supabase DB에 저장
4. 클라이언트는 Next.js RSC로 초기 데이터 페칭 (SSR/ISR)
5. 실시간 업데이트(리더보드)는 Supabase Realtime WebSocket

---

## 3. 디렉토리 구조

```
signalplay/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── (main)/
│   │   │   ├── layout.tsx            # 공통 레이아웃 (하단 내비)
│   │   │   ├── page.tsx              # 홈 (시그널 피드)
│   │   │   ├── game/page.tsx         # 예측 게임
│   │   │   ├── leaderboard/page.tsx  # 리더보드
│   │   │   ├── insights/page.tsx     # AI 인사이트
│   │   │   └── profile/page.tsx      # 프로필
│   │   ├── api/
│   │   │   └── webhooks/             # Supabase webhook 수신
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Tailwind CSS v4 import
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 기반 베이스 컴포넌트
│   │   ├── signals/
│   │   │   ├── SignalCard.tsx
│   │   │   ├── SignalCardSkeleton.tsx
│   │   │   └── SignalFeed.tsx
│   │   ├── game/
│   │   │   ├── PredictionSlider.tsx
│   │   │   └── PredictionConfirm.tsx
│   │   ├── leaderboard/
│   │   │   ├── LeaderboardRow.tsx
│   │   │   └── LeaderboardTable.tsx
│   │   ├── insights/
│   │   │   ├── InsightCard.tsx
│   │   │   └── InsightGrid.tsx
│   │   └── shared/
│   │       ├── BottomNav.tsx
│   │       ├── BadgeChip.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # 브라우저용 Supabase client
│   │   │   ├── server.ts             # 서버용 Supabase client
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── api/
│   │   │   ├── signals.ts
│   │   │   ├── predictions.ts
│   │   │   ├── leaderboard.ts
│   │   │   └── insights.ts
│   │   ├── utils/
│   │   │   ├── format.ts             # 숫자/날짜 포맷팅
│   │   │   └── cn.ts                 # clsx + tailwind-merge
│   │   └── constants.ts
│   │
│   ├── hooks/
│   │   ├── useSignals.ts
│   │   ├── usePrediction.ts
│   │   ├── useLeaderboard.ts         # Supabase Realtime 구독
│   │   └── useAuth.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts              # Zustand
│   │   └── predictionStore.ts        # 미제출 예측 임시 저장
│   │
│   └── types/
│       ├── signal.ts
│       ├── prediction.ts
│       ├── user.ts
│       └── supabase.ts               # Supabase generated types
│
├── supabase/
│   ├── migrations/                   # DB 마이그레이션 파일
│   ├── functions/                    # Edge Functions
│   │   ├── signal-generator/
│   │   ├── insight-generator/
│   │   ├── score-calculator/
│   │   └── news-fetcher/
│   └── seed.sql                      # 개발용 시드 데이터
│
├── public/
│   ├── fonts/                        # Pretendard, Space Grotesk
│   └── images/
│
├── .github/
│   └── workflows/
├── .project/                         # 프로젝트 문서
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts                # Tailwind v4 CSS-first
```

---

## 4. 성능 전략

### 렌더링 전략

| 페이지 | 전략 | 이유 |
|---|---|---|
| 홈 (시그널 피드) | ISR (revalidate: 300s) | 시그널은 일 1회 생성, 자주 변경 안 됨 |
| 예측 게임 | CSR (Client Component) | 사용자 인터랙션 집중 |
| 리더보드 | ISR + Realtime | 초기 SSR + WebSocket으로 실시간 업데이트 |
| AI 인사이트 | ISR (revalidate: 900s) | 15분 간격 업데이트 |
| 프로필 | SSR | 사용자별 데이터 |

### 최적화 기법

- **Dynamic Imports**: Framer Motion, PredictionSlider — 게임 페이지 진입 시만 로드
- **Image Optimization**: `next/image`, WebP 포맷, lazy loading 기본
- **Skeleton Loading**: 모든 카드 컴포넌트에 Skeleton 구현 (CLS 방지)
- **Font**: Pretendard variable font, `font-display: swap`
- **Bundle Analysis**: `@next/bundle-analyzer` CI에 포함

---

## 5. 상태 관리

### Zustand (클라이언트 상태)

```typescript
// authStore: 로그인 유저 정보
// predictionStore: 미제출 예측 임시 저장 (새로고침 대비 sessionStorage 동기화)
```

### TanStack Query (서버 상태)

- `staleTime`: 신호 데이터 5분, 리더보드 30초, 인사이트 15분
- `gcTime`: 10분 (가비지 컬렉션)
- Optimistic Updates: 예측 제출 시 즉시 UI 반영 후 서버 동기화

### Supabase Realtime

- 리더보드 테이블 변경 구독 (`postgres_changes`)
- 연결 유지: 앱 포그라운드 시 구독, 백그라운드 시 일시 중지

---

## 6. CI/CD

### GitHub Actions

```
PR 생성
  └─ lint (ESLint) → typecheck (tsc --noEmit) → unit tests (Vitest)
       └─ 모두 통과 시 → Vercel Preview 배포

main 머지
  └─ 위 단계 + E2E tests (Playwright) → Vercel Production 배포
```

### Vercel 설정

- **Preview**: PR마다 자동 Preview URL 생성 (`signalplay-pr-{번호}.vercel.app`)
- **Production**: `main` 브랜치 → `signalplay.vercel.app`
- **환경변수**: Vercel Dashboard에서 관리 (`.env.local`은 로컬 전용)

---

## 7. 개발 도구

| 도구 | 용도 | 설정 파일 |
|---|---|---|
| ESLint | 코드 품질 | `eslint.config.mjs` |
| Prettier | 코드 포맷팅 | `.prettierrc` |
| Vitest | 유닛/통합 테스트 | `vitest.config.ts` |
| Playwright | E2E 테스트 | `playwright.config.ts` |
| MSW (Mock Service Worker) | API 모킹 | `src/mocks/` |
| Husky + lint-staged | pre-commit hook | `.husky/` |

### 코딩 컨벤션

- **컴포넌트**: PascalCase (`SignalCard.tsx`)
- **훅**: camelCase with `use` prefix (`useSignals.ts`)
- **상수**: SCREAMING_SNAKE_CASE (`MAX_PREDICTIONS_PER_DAY`)
- **타입**: PascalCase interface (`Signal`, `Prediction`)
- **API 함수**: camelCase verb+noun (`fetchSignals`, `submitPrediction`)

---

## 8. 오픈 소스 라이선스

본 프로젝트는 **MIT License** 를 따른다.

### 주요 의존성 라이선스

| 패키지 | 라이선스 |
|---|---|
| Next.js | MIT |
| React | MIT |
| Tailwind CSS | MIT |
| shadcn/ui | MIT |
| Framer Motion | MIT |
| Supabase JS | MIT |
| TanStack Query | MIT |
| Zustand | MIT |
| OpenAI Node SDK | Apache 2.0 |

### 주의 사항

- **Pretendard**: SIL Open Font License 1.1 (상업적 사용 허용, 재배포 시 라이선스 포함)
- **Space Grotesk**: SIL Open Font License 1.1
- 외부 API(OpenAI, Supabase, Vercel)의 이용 약관은 각 서비스 정책을 따른다.
