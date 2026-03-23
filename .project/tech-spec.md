# Tech Spec: 시그널플레이 (SignalPlay)

> **소유자**: FE 블레이즈 + BE 볼트
> **최종 수정**: 2026-03-22
> **상태**: 초안 (Draft) — 앱인토스 피벗 반영

---

## 1. 기술 스택

| 레이어 | 기술 | 버전 | 선택 이유 |
|---|---|---|---|
| 빌드 도구 | Vite | 5.x | 앱인토스 WebView SPA에 최적. Next.js SSR/RSC 오버헤드 불필요. 빠른 HMR. |
| 프레임워크 | React | 18.x | 컴포넌트 기반 SPA. 토스 WebView 환경에서 안정적. |
| 언어 | TypeScript | 5.x | 타입 안전성, 팀 협업 |
| 스타일링 | Tailwind CSS | v3 | 유틸리티 CSS, TDS 토큰과 병행 사용 |
| UI 컴포넌트 | TDS WebView 컴포넌트 | latest | 토스 디자인 시스템. 앱인토스와 시각적 일관성. |
| 토스 SDK | Bedrock Framework | latest | 로그인, 리더보드, AdMob 광고 통합 |
| 백엔드 | Vercel Serverless Functions | - | API 엔드포인트. 서버사이드 Gemini/Supabase 호출. |
| DB | Supabase PostgreSQL | latest | 영속 데이터 (3테이블). RLS 보안. |
| 캐싱 | Vercel KV (Redis) | - | 오늘의 시그널 캐싱, 중복 제출 방지 세션 |
| AI | Google Gemini API | gemini-2.5-flash | 시그널 카드 생성. 무료 티어로 일 3개 생성 충분. |
| 배포 | Vercel | - | Serverless Functions + Cron Jobs + KV 통합 |

---

## 2. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│              토스 앱 (앱인토스 WebView)               │
│   Vite + React SPA (Vercel Edge CDN 정적 서빙)       │
│   ┌─────────┐  ┌──────────┐  ┌───────────────────┐  │
│   │  홈 화면 │  │ 결과 화면 │  │  리더보드 화면     │  │
│   └────┬────┘  └────┬─────┘  └────────┬──────────┘  │
│        │             │                 │              │
│   ┌────▼─────────────▼─────────────────▼──────────┐  │
│   │           Bedrock SDK (토스 통합)               │  │
│   │  - 토스 로그인    - 리더보드    - AdMob 광고    │  │
│   └────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (fetch API)
┌──────────────────────▼──────────────────────────────┐
│              Vercel Serverless Functions             │
│   GET  /api/signals        — 오늘의 시그널 조회      │
│   POST /api/predictions    — 예측 제출               │
│   GET  /api/results        — 어제 결과 조회          │
│   GET  /api/stats          — 유저 통계 (점수/스트릭) │
│   POST /api/cron/generate  — 시그널 생성 (Cron 전용) │
└──────┬───────────────────────┬──────────────────────┘
       │                       │
┌──────▼──────┐      ┌────────▼────────┐
│  Vercel KV  │      │  Supabase DB    │
│  (Redis)    │      │  PostgreSQL     │
│  - 시그널   │      │  - daily_signals │
│    캐시(1일)│      │  - user_predictions│
│  - 예측 중복│      │  - user_stats   │
│    방지 키  │      └────────┬────────┘
└─────────────┘               │
                    ┌─────────▼──────────┐
                    │  Google Gemini API  │
                    │  (Vercel Cron에서만 │
                    │   호출)             │
                    └────────────────────┘
```

### 데이터 흐름

1. **시그널 생성** (매일 08:00 KST): Vercel Cron이 `/api/cron/generate` 호출 → Gemini API로 뉴스 RSS 분석 → 시그널 3개 생성 → Supabase `daily_signals` 저장 + KV 캐시 설정
2. **홈 화면 로드**: 클라이언트 → `GET /api/signals` → KV 캐시 히트 시 즉시 반환. 캐시 미스 시 Supabase 조회 후 캐시 설정.
3. **예측 제출**: 클라이언트 → `POST /api/predictions` → KV에서 중복 제출 확인 → Supabase `user_predictions` INSERT → KV에 제출 완료 플래그 설정
4. **결과 확인**: 클라이언트 → `GET /api/results` → Supabase에서 어제 시그널 결과 + 내 예측 조인 쿼리 → 점수 계산 → 응답

---

## 3. 디렉토리 구조

```
signalplay/
├── src/
│   ├── pages/                        # React 페이지 컴포넌트 (React Router)
│   │   ├── Home.tsx                  # 홈 — 오늘의 시그널
│   │   ├── Result.tsx                # 결과 — 어제 결과 확인
│   │   └── Leaderboard.tsx           # 리더보드
│   │
│   ├── components/
│   │   ├── signal/
│   │   │   ├── SignalCard.tsx         # 시그널 카드 (예측 버튼 포함)
│   │   │   └── SignalCardSkeleton.tsx
│   │   ├── result/
│   │   │   ├── ResultCard.tsx         # 결과 카드 (정답/오답 표시)
│   │   │   └── ScoreSummary.tsx       # 점수 + 스트릭 요약
│   │   ├── leaderboard/
│   │   │   └── LeaderboardView.tsx    # 토스 리더보드 SDK 래퍼
│   │   └── shared/
│   │       ├── BottomNav.tsx          # 하단 탭 내비게이션
│   │       ├── DisclaimerBanner.tsx   # 투자 면책 문구 고정 배너
│   │       └── ErrorBoundary.tsx
│   │
│   ├── hooks/
│   │   ├── useSignals.ts              # 오늘의 시그널 fetch + 상태
│   │   ├── useResults.ts              # 어제 결과 fetch
│   │   ├── useUserStats.ts            # 점수/스트릭 조회
│   │   └── useBedrock.ts             # Bedrock SDK 초기화 + 로그인 상태
│   │
│   ├── lib/
│   │   ├── api.ts                     # fetch 래퍼 (/api/* 호출)
│   │   ├── bedrock.ts                 # Bedrock SDK 초기화 및 타입
│   │   └── utils.ts                   # 날짜 포맷, 점수 계산 등
│   │
│   └── types/
│       ├── signal.ts                  # Signal, Prediction, Result 타입
│       └── user.ts                    # UserStats 타입
│
├── api/                               # Vercel Serverless Functions
│   ├── signals.ts                     # GET /api/signals
│   ├── predictions.ts                 # POST /api/predictions
│   ├── results.ts                     # GET /api/results
│   ├── stats.ts                       # GET /api/stats
│   └── cron/
│       └── generate.ts                # POST /api/cron/generate (Cron 전용)
│
├── public/
│   └── fonts/                         # Pretendard (한국어 최적화)
│
├── .github/
│   └── workflows/
├── .project/                          # 프로젝트 문서
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── vercel.json                        # Cron 설정 포함
```

---

## 4. Bedrock SDK 연동

### 초기화

```typescript
// src/lib/bedrock.ts
import { BedrockClient } from '@toss/bedrock'

// WebView 컨텍스트 확인 후 초기화
export const bedrock = new BedrockClient({
  clientId: import.meta.env.VITE_BEDROCK_CLIENT_ID,
})

// 로그인
export async function loginWithToss() {
  const { userId } = await bedrock.auth.login()
  return userId
}

// 리더보드 점수 업데이트
export async function updateLeaderboard(score: number) {
  await bedrock.leaderboard.updateScore({ score })
}

// 리워드 광고 (결과 화면)
export async function showRewardAd(): Promise<boolean> {
  const result = await bedrock.ads.showRewardAd()
  return result.completed
}

// 전면 광고 (리더보드 진입)
export async function showInterstitialAd() {
  await bedrock.ads.showInterstitialAd()
}
```

### 로컬 개발 모킹 전략

Bedrock SDK는 앱인토스 WebView 컨텍스트에서만 동작한다. 로컬/CI 환경에서는 MSW 또는 환경변수 기반 모킹 사용:

```typescript
// src/lib/bedrock.ts — 환경 감지
const isTossWebView = navigator.userAgent.includes('TossApp')

export const bedrockMock = {
  auth: { login: async () => ({ userId: 'mock-user-123' }) },
  leaderboard: { updateScore: async () => {} },
  ads: {
    showRewardAd: async () => ({ completed: true }),
    showInterstitialAd: async () => {},
  },
}

export const sdk = isTossWebView ? bedrock : bedrockMock
```

---

## 5. Vercel 설정

### vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/generate",
      "schedule": "0 23 * * *"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    },
    "api/cron/generate.ts": {
      "maxDuration": 60
    }
  }
}
```

> Cron 스케줄 `0 23 * * *` = UTC 23:00 = KST 08:00

### 환경변수 (Vercel Dashboard)

| 변수 | 환경 | 비고 |
|---|---|---|
| `GEMINI_API_KEY` | Production, Preview | 서버사이드 전용. `VITE_` 접두사 금지. |
| `SUPABASE_URL` | All | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | 서버사이드 전용 |
| `KV_REST_API_URL` | All | Vercel KV 연결 |
| `KV_REST_API_TOKEN` | All | Vercel KV 토큰 |
| `CRON_SECRET` | Production | Cron 엔드포인트 인증 |
| `VITE_BEDROCK_CLIENT_ID` | All | 클라이언트 번들에 포함 가능 |

---

## 6. CI/CD

### GitHub Actions

```
PR 생성
  └─ lint (ESLint) → typecheck (tsc --noEmit) → unit tests (Vitest)
       └─ 모두 통과 시 → Vercel Preview 배포

main 머지
  └─ 위 단계 + E2E tests (Playwright, Bedrock SDK 모킹) → Vercel Production 배포
```

### 성능 기준

| 항목 | 목표 | 비고 |
|---|---|---|
| LCP | < 2.0s | 홈 화면, 토스 WebView 기준 |
| FID | < 100ms | 예측 버튼 탭 응답 |
| JS 번들 크기 | < 200KB (gzip) | Vite 번들 분석 |
| API 응답 시간 | < 300ms | KV 캐시 히트 기준 |

---

## 7. 코딩 컨벤션

- **컴포넌트**: PascalCase (`SignalCard.tsx`)
- **훅**: camelCase with `use` prefix (`useSignals.ts`)
- **상수**: SCREAMING_SNAKE_CASE (`MAX_SIGNALS_PER_DAY = 3`)
- **타입**: PascalCase interface (`Signal`, `UserStats`)
- **API 함수**: camelCase verb+noun (`fetchSignals`, `submitPrediction`)
- **서버 함수**: `api/*.ts` 내에서만 Supabase/Gemini 직접 호출. 클라이언트 코드에서 직접 호출 금지.
