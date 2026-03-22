# 시그널플레이 (SignalPlay) — Backlog

> 태그: [BUG] [FEATURE] [UX] [PERFORMANCE] [CONTENT] [PROCESS] [DOCS] [STRATEGY]
> 우선순위: P1(긴급) / P2(이번 스프린트) / P3(다음 스프린트)
> 모든 항목은 명확한 수락 기준과 테스트 및 문서 업데이트를 포함해야 합니다.

## P1 — 긴급 처리
- [PROCESS] Next.js 프로젝트 초기화 — pnpm create next-app, TypeScript, Tailwind v4, ESLint 설정
- [PROCESS] Supabase 프로젝트 생성 — CEO에게 계정 생성 요청 필요 (request-to-ceo)
- [PROCESS] OpenAI API 키 발급 — CEO에게 요청 필요 (request-to-ceo)
- [PROCESS] 카카오 개발자 앱 등록 — CEO에게 요청 필요 (소셜 로그인)
- [PROCESS] 토스 WebView 호환성 검증 — 애니메이션, 소셜 로그인, Safe Area (킥오프 합의)
- [DOCS] README 및 CONTRIBUTING.md 완성 — 초안 후 팀 리뷰

## P2 — 이번 스프린트 (Sprint 1)
- [FEATURE] 소셜 로그인 구현 — 카카오/구글 OAuth + Supabase Auth
- [FEATURE] Daily Signal 피드 화면 — AI 시그널 카드 리스트
- [FEATURE] 예측 게임 인터랙션 — 상승/하락 슬라이더 + 제출
- [FEATURE] 리더보드 화면 — 주간 Top 20 랭킹
- [UX] 디자인 시스템 구축 — 색상 토큰, 타이포, 기본 컴포넌트
- [UX] 온보딩 플로우 설계 — 첫 진입 시 서비스 소개 + 첫 예측 유도
- [PROCESS] CI/CD 파이프라인 — GitHub Actions + Vercel 자동 배포
- [PROCESS] Supabase 스키마 설계 — users, signals, predictions, scores 테이블
- [DOCS] API 명세 구체화 — 각 엔드포인트 요청/응답 예시

## P3 — 다음 스프린트
- [FEATURE] AI 인사이트 카드 — 논문/데이터 기반 짧은 분석
- [FEATURE] 뱃지/업적 시스템 — 예측 정확도 기반 배지
- [FEATURE] 결과 확인 화면 — 예측 정답 여부 + 포인트 애니메이션
- [FEATURE] Breaking News Catch — 속보 알림 게임
- [UX] 마이크로 인터랙션 — 카드 플립, 점수 카운터, 리더보드 진입 효과
- [PERFORMANCE] 이미지 최적화 — next/image, WebP, lazy loading
- [STRATEGY] 경쟁사 심층 분석 — 토스증권, 알파스퀘어, 증권플러스 기능 비교
- [CONTENT] 투자 용어 사전 — 초보자를 위한 인앱 가이드
