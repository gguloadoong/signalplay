# 킥오프 미팅 노트

**일시:** 2026-03-22
**참석:** 제이크(PM), 노바(Strategist), 피카(Designer), 블레이즈(FE), 볼트(BE), 호크(QA)
**진행:** 제이크

---

## 핵심 합의 사항

### 1. 서비스 방향
- **포지셔닝:** "Duolingo가 어학에 한 것을 투자 정보에 적용" — 가벼운 투자 게임
- **핵심 루프:** 시그널 확인 → 스와이프 예측 → 결과 확인 → 포인트/리더보드
- **MVP 집중:** Daily Signal Game 하나의 루프가 중독성 있게 돌아가는 것이 최우선

### 2. 주요 결정 (ADR 기록됨)
| ADR | 결정 | 결정자 |
|-----|------|--------|
| ADR-002 | 예측 UI를 스와이프 카드 방식으로 | 피카, 블레이즈, 제이크 |
| ADR-003 | 점수 = 기본10 × 신뢰도(1~5) + 콤보보너스(5×N) | 볼트, 노바, 제이크 |
| ADR-004 | North Star = 일간 예측 참여 수 | 노바, 제이크 |

### 3. 전략 합의 (노바)
- North Star Metric: 일간 예측 참여 수 (Daily Predictions Made)
- 포인트는 리더보드 순위에만 사용, 실물 보상 금지 (도박법 리스크 회피)
- Phase 1은 리텐션 집중, 수익화는 Phase 3

### 4. 디자인 합의 (피카)
- "Dark Intelligence" 컨셉 확정
- 다크 모드 기본 (토스 앱과 조화, 금융 데이터 가독성)
- 예측 = 틴더 스타일 카드 스와이프 (위=상승, 아래=하락)
- 결과 확인 모먼트: 파티클 + 카운트업 + 바이브레이션 (3초 핵심 경험)
- Indigo(#6366F1) + Cyan(#22D3EE) 메인 조합

### 5. 기술 합의 (블레이즈, 볼트)
- Next.js 15 + pnpm + Supabase + OpenAI gpt-4o-mini 확정
- 번들 목표: 초기 JS < 200KB gzip
- Framer Motion은 dynamic import (게임 페이지만)
- Supabase 무료 티어로 MVP 운영 가능 확인
- 외부 API 비용: 월 ~$15 (OpenAI) + 무료 (NewsAPI, Alpha Vantage)

### 6. QA 합의 (호크)
- P0 리스크 3가지 식별: 점수 오류, 중복 예측, 마감 후 제출
- E2E 핵심 시나리오 4개 확정
- 모든 PR에 Vitest + Playwright CI 자동 실행

---

## 액션 아이템

| 담당 | 액션 | 우선순위 | 상태 |
|------|------|----------|------|
| 볼트 | CEO에게 Supabase/OpenAI/카카오 계정 요청 (request-to-ceo) | P1 | 대기 |
| 블레이즈 | 토스 WebView 호환성 검증 | P1 | TODO |
| 블레이즈 | Next.js 프로젝트 초기화 (pnpm) | P1 | TODO |
| 볼트 | Supabase 스키마 설계 + seed.sql | P1 | TODO |
| 피카 | 스와이프 카드 인터랙션 상세 스펙 | P2 | TODO |
| 호크 | Playwright 테스트 환경 세팅 | P2 | TODO |
| 노바 | 경쟁사 심층 분석 (Phase 1 기간) | P3 | TODO |

---

## CEO 요청 사항 (request-to-ceo)

다음 리소스가 필요합니다:
1. **Supabase 계정 생성** — https://supabase.com 에서 무료 프로젝트 생성
2. **OpenAI API 키 발급** — https://platform.openai.com 에서 $20 선불 충전 권장
3. **카카오 개발자 앱 등록** — https://developers.kakao.com 에서 앱 생성 (소셜 로그인용)

---

*다음 스텝: Sprint 1 플래닝 → 개발 시작*
