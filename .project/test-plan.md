# Test Plan: 시그널플레이 (SignalPlay)

> **소유자**: QA 호크
> **최종 수정**: 2026-03-22
> **상태**: 초안 (Draft) — 앱인토스 피벗 반영

---

## 1. 테스트 전략

### 핵심 원칙

3개 화면, 1개 게임 루프 앱이다. 테스트는 핵심 플로우 3개의 E2E 보장에 집중하고, 나머지는 유닛 테스트로 커버한다.

### 테스트 피라미드

```
         /\
        /E2E\          Playwright — 3개 핵심 플로우 (Bedrock SDK 모킹)
       /──────\
      /  통합   \       Vitest + MSW — API 함수, 훅 테스트
     /──────────\
    /    유닛    \      Vitest — 점수 계산, 유틸 함수
   /──────────────\
```

### 커버리지 목표

| 레이어 | 목표 | 우선순위 |
|---|---|---|
| 점수 계산 로직 (`lib/utils.ts`) | 100% | 최고 |
| API 함수 (`api/*.ts`) | 80%+ | 높음 |
| React 훅 (`hooks/*.ts`) | 70%+ | 중간 |
| React 컴포넌트 | 50%+ | 낮음 |
| E2E 핵심 플로우 3개 | 100% (시나리오 기준) | 최고 |

---

## 2. Bedrock SDK 모킹 전략

Bedrock SDK는 앱인토스 WebView 컨텍스트에서만 동작한다. E2E 및 유닛 테스트에서는 다음 모킹 전략을 사용한다.

### MSW 핸들러 (API 모킹)

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/signals', () =>
    HttpResponse.json({
      date: '2026-03-22',
      signals: mockSignals,
      userPrediction: null,
    })
  ),
  http.post('/api/predictions', () =>
    HttpResponse.json({ ok: true, message: '예측이 제출되었습니다.' })
  ),
  http.get('/api/results', () =>
    HttpResponse.json(mockResults)
  ),
  http.get('/api/stats', () =>
    HttpResponse.json(mockStats)
  ),
]
```

### Bedrock SDK 모킹

```typescript
// src/mocks/bedrock.ts — 테스트 환경 전용
vi.mock('@/lib/bedrock', () => ({
  sdk: {
    auth: {
      login: vi.fn().mockResolvedValue({ userId: 'mock-user-123' }),
    },
    leaderboard: {
      updateScore: vi.fn().mockResolvedValue(undefined),
    },
    ads: {
      showRewardAd: vi.fn().mockResolvedValue({ completed: true }),
      showInterstitialAd: vi.fn().mockResolvedValue(undefined),
    },
  },
}))
```

---

## 3. E2E 시나리오 (핵심 3개)

### 시나리오 1: 오늘의 시그널 확인 및 예측 제출

```
1. 앱 진입 (/)
2. 토스 로그인 (Bedrock 모킹 — userId: 'mock-user-123')
3. 홈 화면 로드 확인:
   - SignalCard 3개 렌더링 확인
   - 각 카드에 제목, 요약, 카테고리 칩, 예측 버튼 3개 표시 확인
   - DisclaimerBanner 하단 고정 표시 확인
4. 첫 번째 시그널 카드에서 "호재" 버튼 탭
5. 즉각 색상 피드백 확인 (호재 버튼 초록색 활성화, 나머지 비활성)
6. 세 카드 모두 예측 선택
7. 제출 완료 후 버튼 비활성화 상태 확인
8. 동일 카드 재제출 불가 확인 (버튼 disabled)
```

**합격 기준**: 예측 3개 모두 제출되고, 제출 후 버튼이 비활성화된다. 중복 제출 시 버튼이 눌리지 않는다.

---

### 시나리오 2: 어제 결과 확인

```
1. 로그인된 상태로 결과 화면 진입 (/result)
2. 어제 시그널 3개 ResultCard 렌더링 확인
3. 각 카드에 실제 결과(호재/악재/영향없음) + 내 예측 + 정답/오답 표시 확인
4. ScoreSummary 확인:
   - 맞은 개수 표시 (예: "2 / 3 맞췄어요!")
   - 획득 점수 표시 (예: "+25점")
   - 스트릭 표시 (예: "🔥 7일 연속 참여 중")
5. 정답 카드: 초록색 좌측 보더 + 초록 배경 확인
6. 오답 카드: 빨간색 좌측 보더 + 빨간 배경 확인
7. "광고 보고 +5점 받기" 버튼 탭 → Bedrock 리워드 광고 모킹 호출 확인
8. "오늘 예측하러 가기" 버튼 탭 → 홈 화면 이동 확인
```

**합격 기준**: 결과 화면에서 정답/오답이 정확한 색상으로 표시되고, 점수/스트릭이 올바르게 표시된다. 리워드 광고 CTA가 동작한다.

---

### 시나리오 3: 리더보드 확인

```
1. 로그인된 상태로 리더보드 화면 진입 (/leaderboard)
2. Bedrock 리더보드 SDK 모킹으로 랭킹 데이터 로드 확인
3. 1위~5위 이상 랭킹 목록 렌더링 확인
4. 1~3위 메달 표시(🥇🥈🥉) 확인
5. 내 순위 하단 sticky 표시 확인
6. BottomNav에서 홈 탭 탭 → 홈 화면 이동 확인
```

**합격 기준**: 리더보드가 렌더링되고, 내 순위가 하단에 고정 표시된다.

---

## 4. 유닛 테스트 — 점수 계산 로직

점수 계산은 게임의 핵심이므로 100% 커버리지 필수.

```typescript
// src/lib/utils.test.ts
describe('calculateScore', () => {
  it('모두 정답 — 기본 점수 30 + 스트릭 보너스', () => {
    const result = calculateScore(
      [{ signal_index: 0, prediction: '호재' }, { signal_index: 1, prediction: '악재' }, { signal_index: 2, prediction: '영향없음' }],
      [{ index: 0, actual_result: '호재' }, { index: 1, actual_result: '악재' }, { index: 2, actual_result: '영향없음' }],
      3
    )
    expect(result.score).toBe(45) // 30 + 3*5
    expect(result.newStreak).toBe(4)
  })

  it('모두 오답 — 점수 0, 스트릭 초기화', () => {
    const result = calculateScore(
      [{ signal_index: 0, prediction: '호재' }],
      [{ index: 0, actual_result: '악재' }],
      5
    )
    expect(result.score).toBe(0)
    expect(result.newStreak).toBe(0)
  })

  it('일부 정답 — 스트릭 보너스 정답 있을 때만 적용', () => {
    const result = calculateScore(
      [{ signal_index: 0, prediction: '호재' }, { signal_index: 1, prediction: '악재' }],
      [{ index: 0, actual_result: '호재' }, { index: 1, actual_result: '호재' }],
      2
    )
    expect(result.score).toBe(20) // 10 + 2*5
    expect(result.newStreak).toBe(3)
  })

  it('예측 미제출 — 점수 0, 스트릭 초기화', () => {
    const result = calculateScore([], [], 7)
    expect(result.score).toBe(0)
    expect(result.newStreak).toBe(0)
  })
})
```

---

## 5. 엣지 케이스

### 5.1 네트워크 끊김

| 상황 | 기대 동작 |
|---|---|
| 시그널 피드 로드 중 오프라인 | 스켈레톤 유지 → 에러 메시지 "네트워크 연결을 확인해주세요" |
| 예측 제출 중 오프라인 | 에러 토스트 → 재시도 가능 상태 유지 (버튼 비활성화 안 됨) |
| 결과 조회 중 오프라인 | 에러 메시지 "결과를 불러올 수 없어요. 잠시 후 다시 시도해주세요." |

### 5.2 빈 상태

| 상황 | 기대 동작 |
|---|---|
| 오늘 시그널 미생성 (Cron 실패 등) | "오늘의 시그널을 준비 중이에요. 잠시 후 다시 확인해주세요." |
| 어제 예측 미제출 | "어제는 예측에 참여하지 않으셨어요. 오늘 첫 예측을 시작해보세요!" |
| 결과 집계 중 (actual_result = null) | "결과를 집계 중이에요. 잠시 후 다시 확인해주세요." |
| 리더보드 첫 주 (데이터 없음) | "아직 참여자가 없어요. 첫 번째로 예측에 참여해보세요!" |

### 5.3 중복 제출 방지

| 상황 | 기대 동작 |
|---|---|
| 예측 제출 후 새로고침 | 제출 완료 상태 복원 (KV 플래그 + `/api/signals` `userPrediction` 필드로 확인) |
| 동일 날짜 재제출 시도 | 예측 버튼 disabled 상태. API 409 반환 시 무시 (이미 UI에서 차단) |

---

## 6. 성능 테스트

### Core Web Vitals 목표

| 지표 | 목표 | 측정 조건 |
|---|---|---|
| LCP | < 2.0s | 홈 화면, 토스 WebView 4G 기준 |
| FID | < 100ms | 예측 버튼 탭 응답 |
| CLS | < 0.1 | 시그널 카드 로드 시 레이아웃 이동 |
| FCP | < 1.5s | 스켈레톤 포함 |

### 번들 크기

- 목표: gzip 기준 200KB 이하
- 측정: `vite-bundle-visualizer`로 PR마다 확인

---

## 7. 보안 테스트

- [ ] `GEMINI_API_KEY`가 클라이언트 번들에 포함되지 않음 확인 (`VITE_` 접두사 미사용)
- [ ] `/api/cron/generate` — `CRON_SECRET` 없이 호출 시 401 반환 확인
- [ ] `/api/predictions` — 인증 없이 호출 시 401 반환 확인
- [ ] 예측값에 `"호재"` | `"악재"` | `"영향없음"` 외 값 전송 시 400 반환 확인
- [ ] 다른 날짜 `signal_date`로 예측 제출 시 400 반환 확인

---

## 8. 테스트 환경 및 도구

| 도구 | 버전 | 용도 |
|---|---|---|
| Vitest | ^2.0 | 유닛/통합 테스트 |
| @testing-library/react | ^16.0 | React 컴포넌트 테스트 |
| Playwright | ^1.44 | E2E 테스트 (Bedrock 모킹 포함) |
| MSW (Mock Service Worker) | ^2.0 | API 모킹 (`/api/*`) |
| @vitest/coverage-v8 | ^2.0 | 커버리지 리포트 |

### 테스트 실행 명령어

```bash
# 유닛/통합 테스트
pnpm test

# 테스트 + 커버리지
pnpm test:coverage

# E2E (로컬, Vite dev 서버 + MSW)
pnpm e2e

# E2E (CI, Vercel Preview URL)
pnpm e2e:ci
```

### PR 전 로컬 검증 순서

```bash
pnpm lint          # ESLint 통과 확인
pnpm typecheck     # TypeScript 오류 없음 확인
pnpm test          # 유닛/통합 테스트 통과 확인
pnpm build         # Vite 빌드 성공 확인
```
