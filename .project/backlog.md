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
- [ ] [PROCESS] Supabase 프로젝트 생성 + 스키마 적용 (CEO 액션)

---

## P2 — 이번 스프린트

- [x] [FEATURE] 공유 카드 — 텍스트 공유 (#40 merged) / 이미지 생성은 P3로 이동
- [ ] [FEATURE] 캐릭터 적중률 리더보드 (월간 집계) — Supabase 설정 후 진행
- [x] [UX] 투표 완료 후 성공 애니메이션 (#44 merged)
- [x] [CONTENT] 방구석 전문가 리브랜딩 + 인사이트 고도화 (#52 merged)
- [x] [FEATURE] P0 보안 취약점 패치 — undici/minimatch/ajv (#48 merged)
- [ ] [FEATURE] 토스 로그인 연동 (Bedrock SDK)
- [ ] [FEATURE] AdMob 리워드 광고 (결과 화면)
- [x] [PERFORMANCE] 번들 분석 — TDS/Emotion 제거 완료 (f18d704)

---

## P2 — 이번 스프린트 (추가)

- [x] [FEATURE] 이번 주 주목 종목 동향 섹션 (ADR-010) — `/api/weekly-picks`, VotePage 하단 수평 스크롤 카드 (#54 merged)

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
- [ ] [PERFORMANCE] Lighthouse 점수 90+ 달성 (CI 측정 후 추가 최적화)
- [x] [DOCS] README 피벗 반영 (da0e078 merged)

## P2 — 레트로 도출 (다음 스프린트)

- [x] [FEATURE] 내 투표 기록 로컬 스토리지 뷰 — Supabase 없이 적중률 표시 (#65 PR open)
- [ ] [PROCESS] api/question.ts `API_CONFIG` 상수 분리 — merge conflict 방지
- [ ] [UX] `--font-size-caption: 12px` CSS 변수 도입 — 소폰트 단일 제어
