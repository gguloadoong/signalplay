# API Spec: 시그널플레이 (SignalPlay)

> **소유자**: BE 볼트
> **최종 수정**: 2026-03-22
> **상태**: 초안 (Draft)

---

## 1. 도메인 모델

### ERD 요약

```
users
  ├── id (uuid, PK)
  ├── email
  ├── nickname
  ├── avatar_url
  ├── provider (kakao | google | anonymous)
  ├── is_premium (boolean)
  ├── created_at
  └── updated_at

signals
  ├── id (uuid, PK)
  ├── title (varchar 200)
  ├── summary (text)          -- AI 생성 요약
  ├── sector (enum)            -- MACRO | STOCK | SECTOR | GLOBAL
  ├── impact (enum)            -- HIGH | MEDIUM | LOW
  ├── source_urls (jsonb)      -- 원문 소스 배열
  ├── ai_analysis (text)       -- AI 분석 근거
  ├── target_asset (varchar)   -- 관련 종목/지수 (nullable)
  ├── prediction_deadline      -- 예측 마감 시간
  ├── result_value (numeric)   -- 실제 등락률 (결과 공개 후)
  ├── result_direction (enum)  -- UP | DOWN | NEUTRAL (결과 공개 후)
  ├── is_active (boolean)
  ├── created_at
  └── date (date)              -- 해당 일자

predictions
  ├── id (uuid, PK)
  ├── user_id (uuid, FK → users)
  ├── signal_id (uuid, FK → signals)
  ├── direction (enum)         -- UP | DOWN | NEUTRAL
  ├── confidence (smallint)    -- 1~5
  ├── score (numeric)          -- 결과 공개 후 산정
  ├── is_correct (boolean)     -- 결과 공개 후
  ├── submitted_at
  └── UNIQUE(user_id, signal_id)

scores
  ├── id (uuid, PK)
  ├── user_id (uuid, FK → users)
  ├── period (enum)            -- WEEKLY | MONTHLY | ALL_TIME
  ├── period_key (varchar)     -- '2026-W12', '2026-03', 'all'
  ├── total_score (numeric)
  ├── total_predictions (int)
  ├── correct_predictions (int)
  ├── accuracy_rate (numeric)  -- computed: correct/total
  ├── max_streak (int)
  └── updated_at

badges
  ├── id (uuid, PK)
  ├── slug (varchar, UNIQUE)   -- 'first-prediction', 'streak-7', 'macro-expert'
  ├── name (varchar)
  ├── description (text)
  ├── icon_url (varchar)
  └── condition (jsonb)        -- 획득 조건 메타데이터

user_badges
  ├── id (uuid, PK)
  ├── user_id (uuid, FK → users)
  ├── badge_id (uuid, FK → badges)
  ├── earned_at
  └── UNIQUE(user_id, badge_id)

insights
  ├── id (uuid, PK)
  ├── title (varchar 200)
  ├── content (text)           -- AI 생성 인사이트 (150자 내외)
  ├── category (enum)          -- MACRO | STOCK | SECTOR | GLOBAL
  ├── source_title (varchar)
  ├── source_url (varchar)
  ├── is_sponsored (boolean)   -- 광고성 콘텐츠 여부
  ├── created_at
  └── published_at

news
  ├── id (uuid, PK)
  ├── title (varchar 300)
  ├── url (varchar, UNIQUE)
  ├── source (varchar)
  ├── published_at
  ├── impact_score (smallint)  -- 1~10 (AI 평가)
  ├── keywords (jsonb)         -- 추출 키워드 배열
  └── fetched_at
```

---

## 2. API 설계

### 기본 원칙

- **Supabase REST API**: 단순 CRUD는 Supabase 자동 생성 REST API 사용 (`/rest/v1/`)
- **Supabase Edge Functions**: 비즈니스 로직이 복잡한 작업 (예측 제출, 점수 계산, AI 생성)
- **RLS (Row Level Security)**: 모든 테이블에 RLS 정책 적용 — 클라이언트 직접 접근도 안전하게 통제

### 주요 엔드포인트

#### 시그널

```
GET  /rest/v1/signals?date=eq.{today}&is_active=eq.true&order=created_at.desc
  → 오늘의 활성 시그널 목록

GET  /rest/v1/signals?id=eq.{id}&select=*,predictions(direction,confidence)
  → 시그널 상세 + 내 예측 포함
```

#### 예측 제출

```
POST /functions/v1/submit-prediction
  Body: { signal_id, direction, confidence }
  → 중복 제출 방지, 마감 시간 검증, predictions 테이블 INSERT
  → 즉시 응답: { ok: true, prediction_id }
```

#### 리더보드

```
GET  /rest/v1/scores
     ?period=eq.WEEKLY
     &period_key=eq.{current_week}
     &order=accuracy_rate.desc,total_score.desc
     &limit=50
     &select=*,users(nickname,avatar_url),user_badges(badges(slug,icon_url))
  → 주간 리더보드 상위 50명
```

#### AI 인사이트

```
GET  /rest/v1/insights
     ?order=published_at.desc
     &limit=20
     &is_sponsored=eq.false
     [&category=eq.{category}]
  → 인사이트 카드 목록 (무한 스크롤용 cursor pagination)
```

#### 사용자 프로필

```
GET  /rest/v1/users?id=eq.{user_id}
     &select=*,scores(*),user_badges(*,badges(*))
  → 프로필 + 점수 + 배지 전체
```

---

## 3. 인증

### Supabase Auth 설정

- **소셜 로그인**: 카카오 OAuth 2.0, 구글 OAuth 2.0
- **익명 모드**: Supabase `signInAnonymously()` — 소셜 연동 전 체험용
  - 익명 유저도 예측 참여 가능 (단, 리더보드 표시 제한)
  - 소셜 연동 시 예측 데이터 마이그레이션

### 세션 관리

- JWT 토큰: Supabase 자동 관리 (httpOnly 쿠키)
- 토큰 만료: 1시간, Refresh Token: 7일
- Next.js middleware에서 서버사이드 세션 검증

### RLS 정책 예시

```sql
-- predictions: 본인 데이터만 INSERT/SELECT
CREATE POLICY "Users can manage own predictions"
ON predictions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- signals: 모든 인증 유저 SELECT 가능
CREATE POLICY "Authenticated users can read signals"
ON signals
FOR SELECT
TO authenticated
USING (true);
```

---

## 4. 실시간 기능

### Supabase Realtime — 리더보드

```typescript
// 클라이언트에서 리더보드 실시간 구독
const channel = supabase
  .channel('leaderboard-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'scores',
      filter: `period=eq.WEEKLY`,
    },
    (payload) => {
      // TanStack Query 캐시 무효화 → 자동 리페치
      queryClient.invalidateQueries({ queryKey: ['leaderboard', 'weekly'] })
    }
  )
  .subscribe()
```

### 구독 생명주기

- 앱 포그라운드 진입 시 구독 시작
- 백그라운드(탭 숨김) 시 구독 일시 중지 (배터리/연결 절약)
- 컴포넌트 언마운트 시 `channel.unsubscribe()` 반드시 호출

---

## 5. Rate Limiting & 보안

### Rate Limiting

| 엔드포인트 | 제한 | 단위 |
|---|---|---|
| `submit-prediction` | 10회 | 분 |
| `insights` 조회 | 100회 | 분 |
| `signals` 조회 | 60회 | 분 |
| AI 생성 함수 | 서버 cron 전용 — 클라이언트 직접 호출 불가 |

Supabase Edge Functions에서 `X-RateLimit-*` 헤더로 클라이언트에 알림.

### 보안 체크리스트

- [ ] 모든 테이블 RLS 활성화 확인 (`security_definer` 함수 사용 최소화)
- [ ] OpenAI API Key는 Edge Function 환경변수에만 저장 — 클라이언트 노출 절대 금지
- [ ] 예측 제출 시 `prediction_deadline` 서버사이드 검증 (클라이언트 타이머 신뢰 금지)
- [ ] 사용자 입력(닉네임 등)은 서버에서 sanitize (XSS 방지)
- [ ] CORS: Supabase Functions에 허용 오리진 명시 (`signalplay.vercel.app` only)

---

## 6. 외부 데이터 연동

### Edge Function: `news-fetcher` (매 15분 cron)

```
NewsAPI → 금융 키워드 필터링 → 중복 URL 제거 → news 테이블 INSERT
```

### Edge Function: `signal-generator` (매일 08:50 KST)

```
news 테이블 (최근 24시간) + Alpha Vantage (지수 데이터)
  → OpenAI gpt-4o-mini 프롬프트
  → signals 테이블 INSERT (3~5개)
  → prediction_deadline = 당일 15:30 KST
```

### Edge Function: `insight-generator` (매일 08:00, 14:00 KST)

```
news 테이블 + arXiv API (최신 금융 논문)
  → OpenAI gpt-4o-mini 프롬프트
  → insights 테이블 INSERT (5~10개)
```

### Edge Function: `score-calculator` (매일 09:10 KST)

```
전일 signals (result_direction 입력 후) + predictions
  → 점수 산정 로직 실행
  → predictions.score, is_correct 업데이트
  → scores 테이블 upsert (WEEKLY, MONTHLY, ALL_TIME)
  → 배지 획득 조건 체크 → user_badges INSERT
```

---

## 7. 목데이터 전략

### 개발 환경

- `supabase/seed.sql`: 개발용 시드 데이터 (사용자 10명, 시그널 7일치, 예측 50건)
- **MSW (Mock Service Worker)**: 프론트엔드 개발 시 Supabase API 모킹
  - `src/mocks/handlers/signals.ts`
  - `src/mocks/handlers/predictions.ts`

### 목데이터 예시 시그널

```json
{
  "title": "연준 금리 동결 시사 발언 — 나스닥 반응 주목",
  "summary": "파월 의장이 2026년 상반기 금리 동결 가능성을 시사하는 발언을 했습니다. 과거 유사 발언 이후 나스닥은 평균 1.2% 상승했습니다.",
  "sector": "MACRO",
  "impact": "HIGH",
  "prediction_deadline": "2026-03-22T06:30:00Z"
}
```

### Storybook (Phase 2)

컴포넌트 단위 개발/문서화 도구로 Storybook 도입 예정. MVP에서는 생략.
