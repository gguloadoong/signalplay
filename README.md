# ⚡ 시그널플레이 (SignalPlay)

**AI 점쟁이 5명이 예측하고, 군중이 투표하고, 적중률로 승부하는 투자 예측 서비스**

> 앱인토스(토스 미니앱) 플랫폼용 WebView SPA

[![Deploy](https://img.shields.io/badge/Vercel-배포중-black?logo=vercel)](https://signalplay.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)

---

## 4기둥 컨셉

| 기둥 | 설명 |
|------|------|
| **속도** | 어디보다 빠른 시장 소식 — Gemini 실시간 뉴스 기반 질문 생성 |
| **캐릭터** | AI 점쟁이 5명 (퀀트봇/논문쟁이/속보왕/패턴술사/다트침팬지) — 각자 다른 이론으로 예측 |
| **군중** | 투표 후 공개되는 유저 집단 비율 — "나는 군중과 같나, 다른가?" |
| **적중** | 캐릭터별·군중 적중률 트랙레코드 — 누가 진짜 잘 맞추나 |

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | Vite + React 18 + TypeScript + CSS Modules |
| Backend | Vercel Serverless Functions + Vercel KV (Redis) |
| AI | Google Gemini API (gemini-2.5-flash, Search Grounding) |
| DB | Supabase PostgreSQL |
| Deploy | Vercel (GitHub 연동 자동 배포) |

## 시작하기

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 GEMINI_API_KEY 등 입력

# 개발 서버
pnpm dev

# 빌드
pnpm build

# 테스트
pnpm test
```

## 프로젝트 구조

```
src/
├── pages/           # VotePage, ResultPage
├── components/
│   ├── vote/        # CharacterCard, CrowdBar
│   └── shared/      # BottomNav, SuccessAnimation, Skeleton, ErrorBoundary
├── lib/
│   ├── utils/       # share, format
│   └── mockData.ts  # 목데이터 (Supabase 설정 전)
└── types/           # TypeScript 타입 정의

api/                 # Vercel Serverless Functions (question, vote, result)
supabase/            # DB 스키마 (daily_signals, user_predictions, user_stats)
.project/            # 프로젝트 문서 (PRD, 디자인 스펙, ADR 등)
```

## 팀

| 역할 | 이름 | 담당 |
|------|------|------|
| PM | 제이크 (Jake) | 기획, 스프린트 관리 |
| 전략 | 노바 (Nova) | 게임 경제, 성장 전략 |
| 디자인 | 피카 (Pika) | TDS 기반 UI/UX |
| FE | 블레이즈 (Blaze) | React SPA, 성능 |
| BE | 볼트 (Bolt) | API, Gemini, Supabase |
| QA | 호크 (Hawk) | 테스트, 품질 검증 |

## 라이선스

MIT

---

🤖 Built with AI-powered autonomous team
