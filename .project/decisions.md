# Decisions (ADR): 시그널플레이 (SignalPlay)

> **소유자**: PM 제이크
> **최종 수정**: 2026-03-22

Architecture Decision Records. 중요한 기술적·제품적 결정을 기록하고 맥락을 보존한다.

---

## ADR 형식

```
## ADR-NNN: 제목
- **날짜**: YYYY-MM-DD
- **상태**: 제안됨 | 승인됨 | 폐기됨 | 대체됨
- **결정자**: 이름들

### 맥락
왜 이 결정이 필요했는가?

### 결정
무엇을 결정했는가?

### 근거
왜 이 옵션을 선택했는가?

### 결과
이 결정이 가져오는 장단점과 영향은?
```

---

## ADR-001: 프로젝트 시작 및 기술 스택 확정

- **날짜**: 2026-03-22
- **상태**: 승인됨
- **결정자**: PM 제이크, FE 블레이즈, BE 볼트

### 맥락

시그널플레이 서비스를 토스 미니앱(모바일 웹) 형태로 출시하기로 결정했다. 빠른 MVP 출시와 소규모 팀(6명)의 개발 효율성을 동시에 달성해야 한다. 인프라 비용을 최소화하면서도 실시간 기능(리더보드)과 AI 생성 콘텐츠를 지원해야 한다.

### 결정

다음 기술 스택으로 프로젝트를 시작한다:
- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS v4
- **UI**: shadcn/ui + Framer Motion
- **백엔드/DB**: Supabase (Auth + PostgreSQL + Realtime + Edge Functions)
- **AI**: OpenAI API (gpt-4o-mini)
- **배포**: Vercel

### 근거

**Next.js 15 선택 이유:**
- App Router의 RSC(React Server Components)로 초기 로드 성능 확보
- ISR로 시그널 데이터 캐싱 (API 비용 절감)
- Vercel과의 완벽한 통합 (Preview Deployments)

**Supabase 선택 이유:**
- Auth + DB + Realtime + Edge Functions를 하나의 플랫폼에서 제공 → 인프라 복잡도 최소화
- PostgreSQL 기반 → RLS로 보안 처리, 익숙한 SQL
- Edge Functions(Deno)으로 OpenAI 호출 서버사이드 처리 → API 키 클라이언트 노출 방지
- 무료 티어로 MVP 운영 가능

**gpt-4o-mini 선택 이유:**
- gpt-4o 대비 약 15배 저렴, 일 10~20개 인사이트 카드 생성 비용 월 $10 미만 예상
- 150자 내외 요약 작업에 충분한 품질

### 결과

**장점:**
- 단일 벤더(Supabase) 의존으로 초기 설정 빠름
- Next.js + Vercel 조합으로 CI/CD 자동화
- TypeScript 전체 적용으로 타입 안전성 확보

**단점/리스크:**
- Supabase 단일 의존 — 장애 시 서비스 전체 영향
- Edge Functions의 콜드 스타트 지연 (최초 호출 시 ~500ms)
- Supabase 무료 티어 한계 (500MB DB, 2GB 스토리지) — 성장 시 유료 전환 필요

**후속 조치:**
- Supabase 장애 대응 fallback 전략 Phase 2에서 검토
- Edge Function 콜드 스타트 모니터링 후 keep-alive 전략 여부 결정

---

## ADR-002: (예시 — 향후 추가)

새로운 중요 결정이 발생할 때마다 ADR 번호를 순차 부여하고 이 파일에 추가한다.

예상 향후 ADR 주제:
- ADR-002: 상태 관리 라이브러리 선택 (Zustand vs Jotai)
- ADR-003: 뉴스 API 최종 선택 (네이버 vs Finnhub)
- ADR-004: 프리미엄 구독 결제 시스템 선택
- ADR-005: 푸시 알림 구현 방식 (Web Push vs 토스 알림)
