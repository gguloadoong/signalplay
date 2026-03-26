# 시그널플레이 — 품질 래칫 기준선

> 이 값은 단조 증가(또는 감소)만 허용. 위반 시 P0/P1 Issue 생성.
> 측정일: 2026-03-25

## 기준선

| 항목 | 현재값 | 방향 | 위반 시 |
|------|--------|------|---------|
| pnpm build | ✅ 통과 | 항상 통과 | P0 |
| pnpm lint | ✅ 0 에러 | 항상 0 | P0 |
| TypeScript 에러 | 0개 | 항상 0 | P0 |
| npm audit high+ | 0개 (moderate 1개 — typescript-eslint 하위 picomatch, upstream 픽스 대기) | 항상 0 | P0 |
| JS 번들 (초기 로드) | 25.80KB (9.91KB gzip) — 캐릭터 드라마+리더보드 기능 추가 정당화 | 커지면 정당화 필요 | P2 |
| JS 번들 (router, 캐시됨) | 47.18KB (16.73KB gzip) — react+react-dom+react-router-dom 통합 | 커지면 정당화 필요 | P2 |
| JS 번들 (tds, 캐시됨) | 1,061KB (341KB gzip) — @toss/tds-mobile+@emotion, 앱인토스 심사 필수 | 고정값 (TDS 업데이트 시만 변경) | P2 |
| CSS 번들 | 16.06KB (4.82KB gzip) — Tossface @font-face 번들링 (PR #181 정당화) | 커지면 정당화 필요 | P3 |
| 테스트 커버리지 | 유닛 119개 (2026-03-26 갱신) | 올라가기만 함 | P1 |
| E2E 테스트 | 5개 (Playwright) — PR #220 레벨 힌트 테스트 추가 | 올라가기만 함 | P1 |
| 화면 깨짐 | 0건 | 항상 0 | P0 |
| Lighthouse 성능 | 85점+ (TBT ≤300ms, 경고 0개) | 올라가기만 함 | P2 |
| 접근성 위반 | 6건 수정 (PR #113/#115/#117/#119) | 줄어들기만 함 | P2 |

## 업데이트 이력

| 날짜 | 변경 | 담당 |
|------|------|------|
| 2026-03-23 | 초기 기준선 설정 | QA 호크 |
| 2026-03-24 | 유닛 35개 + E2E 4개 래칫 상향 | QA 호크 |
| 2026-03-25 | JS 번들 1,135KB→201KB (TDS/Emotion 제거), npm audit 0개 추가 | QA 호크 |
| 2026-03-25 | JS 201→205KB, CSS 11.4→13.6KB (WeeklyPicksSection 신규, 정당화됨) | QA 호크 |
| 2026-03-25 | CSS 13.56→14.25KB (+0.7KB, --font-size-caption 변수 + voteHistory 기능), 유닛 35→42개 | QA 호크 |
| 2026-03-25 | JS 205→193KB (React.lazy 코드 스플리팅), Lighthouse 79점 첫 측정 (TBT 543ms) | QA 호크 |
| 2026-03-25 | JS 193→191KB (WeeklyPicksSection lazy), Lighthouse 85점+ 달성 (TBT ≤300ms, 경고 0개) | QA 호크 |
| 2026-03-25 | vendor 청크 분리 (PR #75) — 초기 로드 20KB, vendor 180.5KB 캐시 분리. VotePage API 연결 (PR #81). 유닛 51개 유지. | QA 호크 |
| 2026-03-25 | API client 테스트 추가 (PR #87) — 유닛 51→60개. 명칭 전면 교체 (PR #73/#85). | QA 호크 |
| 2026-03-25 | JS 20KB→19.29KB, CSS 14.25→14.22KB (mockData 정리 PR #91). CrowdBar aria-hidden (PR #93). | QA 호크 |
| 2026-03-25 | score.ts/signal.ts 삭제 (PR #107) — 유닛 60개 유지, JS 19.42KB (정당화). CEO 피드백 스프린트 PR #100/#103/#104/#106 제출. | QA 호크 |
| 2026-03-25 | 광고 게이팅 (PR #109/#106), manifest+robots.txt (PR #111), 접근성 6건 수정 (PR #113/#115/#117/#119). | QA 호크 |
| 2026-03-25 | bedrock.ts 유닛 13개 추가 (PR #121), shareText() 5개 추가 (PR #123) — 유닛 60→78개 래칫 상향. | QA 호크 |
| 2026-03-25 | P1 래칫 위반 복구 — E2E 3→4개 온보딩 spec 추가 (PR #127). | QA 호크 |
| 2026-03-26 | JS 19.29→23.26KB (기능 다수 추가: profiles, share, preview, reactions, deadline 등 정당화). 유닛 78→89개 래칫 상향. | QA 호크 |
| 2026-03-26 | @toss/tds-mobile 2.3.0 + @emotion/react 도입 (PR #166). tds 청크 1,063KB (캐시됨, 앱인토스 심사 정당화). vendor 180.5→40.72KB. Tossface CDN 추가. | QA 호크 |
| 2026-03-26 | getCharacterAlignment() 유닛 3개 추가 (PR #174) — 유닛 89→92개 래칫 상향. | QA 호크 |
| 2026-03-26 | html-to-image 추가 (PR #173), 서비스 기획 v2 기능 5개 머지. router 청크 40.72→47.18KB (react+router 통합, html-to-image 정당화). tds 1,063→1,056KB (소폭 감소). | QA 호크 |
| 2026-03-26 | Supabase read-first (PR #179). TDS 전면 교체 (PR #181): Tossface npm, useWebToast, Button. tds 1,056→1,058KB (+2KB 정당화). CSS 14.22→16.06KB (Tossface @font-face 번들링 정당화). 보안 high 2→0개. | QA 호크 |
| 2026-03-26 | 캐릭터 드라마 (PR #187/#189), 리더보드 실데이터 (PR #195). JS 24.28→25.80KB (+1.5KB 정당화). tds 1,058→1,061KB (소폭). 유닛 92개 유지. | QA 호크 |
| 2026-03-26 | 이모지 반응 (PR #197/#199), isCrowdCorrect 추출+테스트 (PR #201). 유닛 92→98개 래칫 상향. | QA 호크 |
| 2026-03-26 | 보안 헤더 (PR #203), formatDeadline 추출+테스트 (PR #205). 유닛 98→101개. | QA 호크 |
| 2026-03-26 | 레벨 시스템 (PR #209) — getLevel()/getTotalVotes(), ResultPage+ShareCard 레벨 배지. 유닛 101→108개. | QA 호크 |
| 2026-03-26 | 리더보드 '나' 행 (PR #212) — 캐릭터와 직접 순위 비교, leaderRowMe 하이라이트. | QA 호크 |
| 2026-03-26 | 배지 시스템 MVP (PR #214) — 🎯💎📊🔥 4개 배지, correctStreak 추적. 유닛 108→115개. | QA 호크 |
| 2026-03-26 | ShareCard 배지 노출 (PR #216). VotePage 레벨 힌트 (PR #218). E2E 4→5개 (PR #220). | QA 호크 |
| 2026-03-26 | ResultPage 맥락 CTA (PR #222). VoteRecord isCorrect 저장+테스트 (PR #224). 유닛 115→119개. | QA 호크 |
