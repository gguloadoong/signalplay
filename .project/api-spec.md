# API Spec: 시그널플레이 (SignalPlay)

> **소유자**: BE 볼트
> **최종 수정**: 2026-03-22
> **상태**: 초안 (Draft) — 앱인토스 피벗 반영

---

## 1. DB 스키마 (3테이블)

### ERD

```
daily_signals
  ├── id            (uuid, PK, default gen_random_uuid())
  ├── date          (date, UNIQUE)          -- 해당 날짜 (YYYY-MM-DD)
  ├── signals       (jsonb)                 -- 시그널 배열 (아래 구조 참조)
  └── created_at    (timestamptz, default now())

user_predictions
  ├── id            (uuid, PK)
  ├── toss_user_id  (varchar, NOT NULL)     -- Bedrock SDK에서 받은 유저 식별자
  ├── signal_date   (date, NOT NULL)        -- 예측 대상 날짜
  ├── predictions   (jsonb)                 -- 예측 배열 (아래 구조 참조)
  ├── score         (int, default 0)        -- 결과 공개 후 산정
  └── created_at    (timestamptz, default now())
  -- UNIQUE(toss_user_id, signal_date)

user_stats
  ├── toss_user_id   (varchar, PK)
  ├── total_score    (int, default 0)
  ├── current_streak (int, default 0)       -- 연속 예측 참여 일수
  ├── max_streak     (int, default 0)
  ├── total_plays    (int, default 0)       -- 누적 예측 참여 일수
  └── updated_at     (timestamptz, default now())
```

### JSONB 구조

**`daily_signals.signals`** (배열, 3개 고정):
```json
[
  {
    "index": 0,
    "title": "연준 금리 동결 시사 — 글로벌 증시 영향",
    "summary": "파월 의장이 2026년 상반기 금리 동결 가능성을 언급했습니다. 국내 채권시장과 성장주에 주목이 쏠리고 있습니다.",
    "category": "경제지표",
    "source_url": "https://example.com/news/123",
    "actual_result": null
  }
]
```

- `category`: `"경제지표"` | `"기업동향"` | `"글로벌이슈"`
- `actual_result`: `null` (당일) → `"호재"` | `"악재"` | `"영향없음"` (익일 업데이트)

**`user_predictions.predictions`** (배열, 최대 3개):
```json
[
  {
    "signal_index": 0,
    "prediction": "호재"
  }
]
```

- `prediction`: `"호재"` | `"악재"` | `"영향없음"`

---

## 2. API 엔드포인트

### 기본 원칙

- 모든 엔드포인트는 Vercel Serverless Functions (`api/*.ts`)
- 인증: `Authorization: Bearer {toss_jwt}` 헤더 — Bedrock SDK가 발급한 토스 JWT
- Supabase 직접 접근은 서버사이드에서만 (service_role key 사용)
- KV 캐시: `GET /api/signals`는 KV 우선 조회, 캐시 TTL = 자정까지 남은 시간

---

### GET /api/signals

오늘의 시그널 3개를 반환한다. KV 캐시 우선 조회.

**요청**
```
GET /api/signals
Authorization: Bearer {toss_jwt}
```

**응답 200**
```json
{
  "date": "2026-03-22",
  "signals": [
    {
      "index": 0,
      "title": "연준 금리 동결 시사 — 글로벌 증시 영향",
      "summary": "파Powell 의장이 2026년 상반기 금리 동결 가능성을 언급했습니다.",
      "category": "경제지표",
      "source_url": "https://example.com/news/123"
    },
    {
      "index": 1,
      "title": "삼성전자 1Q 실적 예상치 상회",
      "summary": "반도체 수요 회복으로 1분기 영업이익이 시장 예상치를 15% 상회했습니다.",
      "category": "기업동향",
      "source_url": "https://example.com/news/456"
    },
    {
      "index": 2,
      "title": "중국 경기 부양책 발표 — 원자재 시장 반응",
      "summary": "중국 국무원이 내수 진작을 위한 대규모 인프라 투자 계획을 발표했습니다.",
      "category": "글로벌이슈",
      "source_url": "https://example.com/news/789"
    }
  ],
  "userPrediction": null
}
```

**응답 필드 `userPrediction`**: 이미 예측을 제출했으면 제출한 예측 배열 반환 (UI에서 버튼 비활성화용). 미제출이면 `null`.

**응답 404**: 오늘 시그널이 아직 생성되지 않은 경우
```json
{ "error": "오늘의 시그널을 준비 중입니다. 잠시 후 다시 확인해주세요." }
```

---

### POST /api/predictions

오늘의 시그널에 대한 예측을 제출한다. 하루 1회, 수정 불가.

**요청**
```
POST /api/predictions
Authorization: Bearer {toss_jwt}
Content-Type: application/json

{
  "signal_date": "2026-03-22",
  "predictions": [
    { "signal_index": 0, "prediction": "호재" },
    { "signal_index": 1, "prediction": "악재" },
    { "signal_index": 2, "prediction": "영향없음" }
  ]
}
```

**검증 규칙**
- `signal_date`가 오늘 날짜와 일치해야 함 (어제/과거 예측 불가)
- 동일 `(toss_user_id, signal_date)` 중복 제출 불가 (KV 플래그 + DB UNIQUE 제약 이중 방지)
- `predictions` 배열 길이는 1~3. 일부만 예측 허용. (미예측 시그널은 결과에서 0점 처리)
- `prediction` 값은 `"호재"` | `"악재"` | `"영향없음"` 만 허용

**응답 201**
```json
{
  "ok": true,
  "message": "예측이 제출되었습니다. 내일 결과를 확인하세요!"
}
```

**응답 409** (중복 제출)
```json
{ "error": "오늘의 예측은 이미 제출하셨습니다." }
```

**응답 400** (날짜 불일치, 잘못된 값)
```json
{ "error": "잘못된 요청입니다." }
```

---

### GET /api/results

어제의 시그널 결과와 내 예측 비교를 반환한다.

**요청**
```
GET /api/results
Authorization: Bearer {toss_jwt}
```

**응답 200**
```json
{
  "date": "2026-03-21",
  "results": [
    {
      "index": 0,
      "title": "연준 금리 동결 시사 — 글로벌 증시 영향",
      "summary": "파월 의장이 2026년 상반기 금리 동결 가능성을 언급했습니다.",
      "category": "경제지표",
      "actual_result": "호재",
      "my_prediction": "호재",
      "is_correct": true
    },
    {
      "index": 1,
      "title": "삼성전자 1Q 실적 예상치 상회",
      "summary": "반도체 수요 회복으로 1분기 영업이익이 시장 예상치를 15% 상회했습니다.",
      "category": "기업동향",
      "actual_result": "호재",
      "my_prediction": "악재",
      "is_correct": false
    },
    {
      "index": 2,
      "title": "중국 경기 부양책 발표 — 원자재 시장 반응",
      "summary": "중국 국무원이 내수 진작을 위한 대규모 인프라 투자 계획을 발표했습니다.",
      "category": "글로벌이슈",
      "actual_result": "호재",
      "my_prediction": "호재",
      "is_correct": true
    }
  ],
  "score": {
    "correct": 2,
    "total": 3,
    "earned": 20,
    "streak_bonus": 5,
    "total_earned": 25
  }
}
```

**응답 404**: 어제 예측을 제출하지 않은 경우
```json
{ "error": "어제의 예측 기록이 없습니다." }
```

**응답 202**: 어제 시그널의 `actual_result`가 아직 입력되지 않은 경우 (당일 늦게 업데이트)
```json
{ "pending": true, "message": "결과를 집계 중입니다. 잠시 후 다시 확인해주세요." }
```

---

### GET /api/stats

유저의 총 점수, 스트릭, 참여 통계를 반환한다.

**요청**
```
GET /api/stats
Authorization: Bearer {toss_jwt}
```

**응답 200**
```json
{
  "toss_user_id": "usr_abc123",
  "total_score": 245,
  "current_streak": 7,
  "max_streak": 14,
  "total_plays": 30,
  "updated_at": "2026-03-22T00:05:00Z"
}
```

---

### POST /api/cron/generate

Vercel Cron Job이 매일 08:00 KST에 호출. 오늘의 시그널 3개를 Gemini API로 생성하고 DB에 저장한다.

**요청**
```
POST /api/cron/generate
Authorization: Bearer {CRON_SECRET}
```

**처리 흐름**
```
1. Authorization 헤더에서 CRON_SECRET 검증 (환경변수 비교)
2. 오늘 날짜로 daily_signals 기존 레코드 존재 확인 → 이미 있으면 409 반환 (멱등성)
3. 뉴스 RSS 피드 크롤링 (최대 20개 헤드라인)
4. Gemini API 호출 — 시그널 3개 생성 (프롬프트 아래 참조)
5. Supabase daily_signals INSERT
6. Vercel KV에 오늘 시그널 캐시 설정 (TTL = 자정까지 남은 초)
7. 어제 시그널의 actual_result 업데이트 (뉴스 기반 Gemini 평가)
8. user_predictions 스캔 → 어제 예측 점수 계산 → user_stats UPSERT
```

**Gemini 프롬프트 구조**
```
시스템: 당신은 경제 뉴스 편집자입니다. 오늘의 주요 경제 뉴스를 한국 투자자에게 맞게 3개의 시그널 카드로 요약해 주세요.

제약 조건:
- 암호화폐, 가상자산 관련 뉴스는 포함하지 마세요.
- 특정 종목, 금융상품 구매/판매를 권유하는 표현을 사용하지 마세요.
- "투자하세요", "매수하세요" 등 직접적인 투자 권유 문구 금지.
- 경제 동향, 거시 지표, 기업 실적 등 사실 기반 정보로만 구성하세요.

출력 형식 (JSON):
{
  "signals": [
    {
      "index": 0,
      "title": "30자 이내 제목",
      "summary": "80자 이내 요약. 사실 기반, 쉬운 용어.",
      "category": "경제지표 | 기업동향 | 글로벌이슈",
      "source_url": "원문 URL"
    }
  ]
}

뉴스 입력: {news_headlines}
```

**응답 201**
```json
{ "ok": true, "date": "2026-03-22", "count": 3 }
```

---

## 3. 점수 계산 로직

```typescript
function calculateScore(
  predictions: Array<{ signal_index: number; prediction: string }>,
  results: Array<{ index: number; actual_result: string }>,
  currentStreak: number
): { score: number; newStreak: number } {
  const correctCount = predictions.filter((p) => {
    const result = results.find((r) => r.index === p.signal_index)
    return result && result.actual_result === p.prediction
  }).length

  const baseScore = correctCount * 10
  const streakBonus = correctCount > 0 ? currentStreak * 5 : 0
  const totalScore = baseScore + streakBonus
  const newStreak = predictions.length > 0
    ? (correctCount > 0 ? currentStreak + 1 : 0)
    : 0 // 예측 미제출 시 스트릭 초기화

  return { score: totalScore, newStreak }
}
```

---

## 4. KV 캐시 키 설계

| 키 | 타입 | TTL | 값 |
|---|---|---|---|
| `signals:{YYYY-MM-DD}` | string (JSON) | 자정까지 남은 초 | `daily_signals.signals` JSON |
| `predicted:{toss_user_id}:{YYYY-MM-DD}` | string | 24시간 | `"1"` (제출 완료 플래그) |

---

## 5. 보안 체크리스트

- [ ] `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`는 서버사이드 함수에서만 사용. `VITE_` 접두사 사용 절대 금지.
- [ ] `/api/cron/generate`는 `CRON_SECRET` 헤더 검증 후에만 실행. 공개 호출 차단.
- [ ] 예측 제출 시 `toss_user_id`는 서버에서 JWT 검증 후 추출. 클라이언트 전달값 신뢰 금지.
- [ ] Supabase RLS: `user_predictions`, `user_stats`는 toss_user_id 기반 접근 제어.
- [ ] CORS: Vercel Functions에 허용 오리진 명시 (앱인토스 도메인 + `localhost:5173`).
- [ ] 사용자 입력은 없음 (예측값은 서버에서 enum 검증). XSS 위험 최소.

---

## 6. 목데이터 전략

### 로컬 개발

`src/mocks/` 에 MSW 핸들러 작성:

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import { mockSignals, mockResults, mockStats } from './fixtures'

export const handlers = [
  http.get('/api/signals', () => HttpResponse.json(mockSignals)),
  http.post('/api/predictions', () => HttpResponse.json({ ok: true, message: '예측이 제출되었습니다.' })),
  http.get('/api/results', () => HttpResponse.json(mockResults)),
  http.get('/api/stats', () => HttpResponse.json(mockStats)),
]
```

### CI 환경

GitHub Actions에서 MSW 모킹 전용. 실제 Supabase/Gemini 연결 없음.
