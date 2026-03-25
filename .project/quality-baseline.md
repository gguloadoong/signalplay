# 시그널플레이 — 품질 래칫 기준선

> 이 값은 단조 증가(또는 감소)만 허용. 위반 시 P0/P1 Issue 생성.
> 측정일: 2026-03-25

## 기준선

| 항목 | 현재값 | 방향 | 위반 시 |
|------|--------|------|---------|
| pnpm build | ✅ 통과 | 항상 통과 | P0 |
| pnpm lint | ✅ 0 에러 | 항상 0 | P0 |
| TypeScript 에러 | 0개 | 항상 0 | P0 |
| npm audit high+ | 0개 | 항상 0 | P0 |
| JS 번들 (초기 로드) | 19.29KB (7.66KB gzip) | 커지면 정당화 필요 | P2 |
| JS 번들 (vendor, 캐시됨) | 180.5KB (59.58KB gzip) | 커지면 정당화 필요 | P2 |
| CSS 번들 | 14.22KB (4.42KB gzip) | 커지면 정당화 필요 | P3 |
| 테스트 커버리지 | 유닛 60개 | 올라가기만 함 | P1 |
| E2E 테스트 | 4개 (Playwright) | 올라가기만 함 | P1 |
| 화면 깨짐 | 0건 | 항상 0 | P0 |
| Lighthouse 성능 | 85점+ (TBT ≤300ms, 경고 0개) | 올라가기만 함 | P2 |
| 접근성 위반 | 미측정 | 줄어들기만 함 | P2 |

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
