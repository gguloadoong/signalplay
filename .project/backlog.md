# 시그널플레이 (SignalPlay) — Backlog

> 4기둥 피벗 반영 (2026-03-25)
> 태그: [BUG] [FEATURE] [UX] [PERFORMANCE] [CONTENT] [PROCESS] [DOCS]
> 우선순위: P1(긴급) / P2(이번 스프린트) / P3(다음)

---

## P1 — 긴급

- [x] [FEATURE] 4기둥 피벗 — VotePage + AI 점쟁이 + 군중 비율 (#36 merged)
- [x] [BUG] E2E 테스트 피벗 반영 (#38 merged)
- [x] [PROCESS] 구 코드 정리 (BattlePage/FeedPage/RankingPage 삭제)
- [x] [FEATURE] Gemini 실시간 질문 생성 — Google Search Grounding (#42 merged)
- [x] [PROCESS] Supabase 프로젝트 생성 + 스키마 적용 — 3테이블 RLS 정상, Vercel env 연결 완료
- [x] [FEATURE] 알고리즘 고도화 1단계 — 캐릭터별 독립 프롬프트 + reasoning 필드 (ADR-009, b807b1b + CharacterCard #58)

---

## P2 — 이번 스프린트

- [x] [FEATURE] 공유 카드 — 텍스트 공유 (#40 merged) / 이미지 생성은 P3로 이동
- [x] [FEATURE] 캐릭터 적중률 리더보드 (월간 집계) — Supabase 설정 후 진행 (PR #165, #195)
- [x] [UX] 투표 완료 후 성공 애니메이션 (#44 merged)
- [x] [CONTENT] 방구석 전문가 리브랜딩 + 인사이트 고도화 (#52 merged)
- [x] [FEATURE] P0 보안 취약점 패치 — undici/minimatch/ajv (#48 merged)
- [ ] [FEATURE] 토스 로그인 연동 (Bedrock SDK)
- [ ] [FEATURE] AdMob 리워드 광고 (결과 화면)
- [x] [PERFORMANCE] 번들 분석 — TDS/Emotion 제거 완료 (f18d704)

---

## P2 — 이번 스프린트 (추가)

- [x] [FEATURE] 이번 주 주목 종목 동향 섹션 (ADR-010) — `/api/weekly-picks`, VotePage 하단 수평 스크롤 카드 (#54 merged)

## P1 — CEO 피드백 스프린트 (2026-03-25)

- [x] [CONTENT] "AI 점쟁이" → "방구석 전문가" 명칭 제거 (PR #100)
- [x] [FEATURE] 캐릭터 리네이밍 (밸류김/팩터박/뉴스최/봉준선/코인토) + 프로필 페이지 (PR #100)
- [x] [FEATURE] 알고리즘 고도화 — 실제 전문가 수준 프롬프트 (PR #103)
- [x] [FEATURE] 이번 주 추천픽 전문가 추천픽 탭 신설 (PR #104)

## P2 — 접근성 스프린트 (2026-03-25)

- [x] [UX] VotePage toast aria-live + 화살표 aria-hidden (PR #113)
- [x] [UX] CharacterCard Space 키 WCAG 2.1.1 준수 (PR #115)
- [x] [UX] SuccessAnimation role=alert + EmptyState emoji aria-hidden (PR #117)
- [x] [UX] Onboarding role=dialog + aria-modal + dots 위치 공지 (PR #119)
- [x] [PERFORMANCE] manifest.json + robots.txt — Lighthouse Best Practices/SEO (PR #111)
- [x] [FEATURE] ResultPage 전면 광고 게이팅 세션 1회 (PR #109)

## P1 — 서비스 기획 스프린트 (2026-03-25)

- [x] [FEATURE] actual_outcome 자동 판정 Cron — 장 마감 후 Gemini Search 기반 (PR #130)
- [x] [UX] ResultPage 결과 헤더 최상단 노출 — 스크롤 없이 적중 여부 확인 (PR #133)
- [x] [BUG] VotePage 결과 배너 result_ready 가드 — 첫 방문자 빈 결과 페이지 차단 (PR #135)
- [x] [UX] CharacterCard 첫 번째 카드 기본 펼침 — 핵심 콘텐츠 노출 (PR #137)
- [x] [FEATURE] 투표 스트릭 + 적중률 localStorage 추적 — 사용자 축적 시스템 MVP (PR #139)
- [x] [TEST] userStats.ts 유닛 테스트 11개 — 60→71개 (PR #141)
- [x] [BUG] E2E vote.spec.ts 캐릭터명 → 이모지 기반 리질리언트 셀렉터 (PR #131)
- [x] [UX] CharacterCard 접힘 상태 reasoning 미리보기 (첫 줄 40자) (PR #153)
- [x] [CONTENT] 캐릭터 성격 대사 강화 — 적중/오답 반응 대사 추가 (PR #155)
- [x] [CONTENT] 앱 전체 문구 UX 워싱 — 친근·유머 톤으로 전면 교체 (PR #161)
- [x] [FEATURE] 캐릭터 적중률 리더보드 Supabase 실데이터 연동 (PR #165)
- [x] [FEATURE] ResultPage 결과 공유 버튼 추가 (PR #159)

## P1 — TDS 전면 교체 스프린트 (2026-03-26)

- [x] [BUG] api/question.ts Supabase read-first — Gemini 호출 전 오늘 데이터 확인 (PR #179)
- [x] [FEATURE] Tossface CDN → npm 패키지 (github:toss/tossface) (PR #181)
- [x] [UX] VotePage/ResultPage 커스텀 toast → TDS useWebToast (PR #181)
- [x] [UX] CharacterCard 잠금 버튼 → TDS Button (PR #181)
- [x] [PROCESS] 보안 패치 — @vercel/node 5.6.20 + typescript-eslint 8.57.2 (PR #181)
- [x] [UX] 온보딩 슬라이드 제거 → 질문 직접 노출 + 첫 투표 후 TDS 바텀시트 (PR #183)
- [x] [UX] EmptyState action + CharacterProfilePage 뒤로가기 → TDS Button (PR #185)

## P1 — 서비스 본질 스프린트 (2026-03-26)

- [x] [FEATURE] 캐릭터 장 중 드라마 — 낮 코멘트 cron + 결과 반응 + 투표 후 타임라인 (PR #187)
- [x] [FEATURE] ResultPage 캐릭터 결과 반응 대사 — close_reactions DB 연동 (PR #189)

## P2 — 참여 강화 스프린트 (2026-03-26)

- [x] [FEATURE] 캐릭터 예측 이모지 반응 — 🔥😱🤔 투표 후 반응 달기 (PR #197)
- [x] [BUG] 이모지 반응 변경 시 이전 카운트 미감소 (PR #199)
- [x] [REFACTOR] isCrowdCorrect 유틸 추출 + 테스트 6개 추가 (PR #201)
- [x] [FEATURE] 보안 헤더 추가 — 앱인토스 심사 대비 (PR #203)
- [x] [REFACTOR] formatDeadline format.ts 추출 + 테스트 3개 (PR #205)
- [x] [FEATURE] ResultPage CharacterCard 이모지 반응 카운트 읽기전용 노출 (PR #207)

## P2 — 레벨 스프린트 (2026-03-26)

- [x] [FEATURE] 레벨 시스템 — 누적 투표 수 기반 5단계 레벨 (PR #209)
- [x] [FEATURE] 리더보드 '나' 행 — 캐릭터와 직접 순위 비교 (PR #212)
- [x] [FEATURE] 배지 시스템 MVP — 🎯💎📊🔥 4개 배지 (PR #214)
- [x] [FEATURE] ShareCard 배지 노출 — 공유 카드 바이럴 루프 완성 (PR #216)
- [x] [UX] VotePage 레벨 진행 상황 표시 — 투표 후 레벨업 동기부여 (PR #218)

## P3 — 다음 스프린트

- [ ] [FEATURE] 플래시 투표 (속보 기반, 1~2시간 한정)
- [ ] [FEATURE] 푸시 알림 ("오늘의 질문 도착!")
- [ ] [FEATURE] 관심 종목 설정 → 개인화 질문
- [ ] [FEATURE] 캐릭터별 팔로우/구독
- [ ] [FEATURE] 한줄 의견 (텍스트 코멘트)
- [x] [UX] 온보딩 피벗 반영 — 4기둥 슬라이드 (#50 merged)
- [x] [PERFORMANCE] Lighthouse CI 자동 측정 설정 (#56 merged)
- [x] [UX] CharacterCard reasoning 미리보기 + 슬라이드 애니메이션 (#58 merged)
- [x] [UX] 접근성 개선 — 색상 대비 + 폰트 크기 (#61 merged)
- [x] [UX] CharacterCard aria-label 제거 — WCAG 2.5.3 (#63 merged)
- [x] [PERFORMANCE] Lighthouse 점수 90+ 달성 (PR #169 merged — CSS contain + 청크 분리)
- [x] [PERFORMANCE] React.lazy 코드 스플리팅 — ResultPage/Onboarding (#67 merged, 205→193KB)
- [x] [PERFORMANCE] WeeklyPicksSection lazy load — TBT 개선 (#69 merged, 193→191KB, Lighthouse 85+ 달성)
- [x] [UX] index.html title/description 피벗 반영 — SEO 개선 (5db7e56)
- [x] [DOCS] README 피벗 반영 (da0e078 merged)

## P2 — 서비스 기획 v2 스프린트 (2026-03-26)

- [x] [FEATURE] @toss/tds-mobile 전면 도입 + Tossface CDN (PR #167 merged)
- [x] [FEATURE] 공유 카드 이미지 생성 — html-to-image (PR #173 merged)
- [x] [FEATURE] voteHistory 보관 기간 7 → 90일 (PR #172 merged)
- [x] [CONTENT] 코인토 reasoning 강화 — Gemini 프롬프트 에피소드 5카테고리 확장 (PR #177 merged)
- [x] [FEATURE] 너의 투자 성향 — 누적 투표 기반 캐릭터 일치율 (PR #175 merged)


## P2 — 레트로 도출 (다음 스프린트)

- [x] [FEATURE] 내 투표 기록 로컬 스토리지 뷰 — Supabase 없이 적중률 표시 (#65 PR open)
- [x] [PROCESS] api/question.ts `API_CONFIG` 상수 분리 — merge conflict 방지 (da9deee)
- [x] [UX] `--font-size-caption: 12px` CSS 변수 도입 — 소폰트 단일 제어 (7e27956)
