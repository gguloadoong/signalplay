# ⚡ 시그널플레이 (SignalPlay)

**매일 경제 시그널을 예측하고, 추이를 추적하고, AI 인사이트를 소비하는 습관형 투자 게임**

> 앱인토스(토스 미니앱) 플랫폼용 WebView SPA

[![Deploy](https://img.shields.io/badge/Vercel-배포중-black?logo=vercel)](https://signalplay.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)

---

## 서비스 소개

| 기능 | 설명 |
|------|------|
| **마켓 배틀** | 오전/플래시/나이트 배틀 — 하루 종일 예측할 거리 |
| **확신도 시스템** | x1~x3 배수로 리스크/리워드 조절 |
| **AI 피드** | 강세 AI vs 약세 AI 토론, 엄선 뉴스 해석 |
| **카드 플립 결과** | 탭하여 결과 확인 + PERFECT 보너스 |
| **주간 토너먼트** | 매주 리셋 리더보드로 경쟁 |

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | Vite + React 18 + TypeScript |
| UI | TDS Mobile (토스 디자인 시스템) + CSS Modules |
| State | Zustand (persist) |
| Backend | Vercel Serverless Functions |
| AI | Google Gemini API (gemini-2.0-flash) |
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
```

## 프로젝트 구조

```
src/
├── pages/           # 4개 탭 페이지 (Battle, Feed, Result, Ranking)
├── components/
│   ├── battle/      # SignalCard, BattleHeader
│   └── shared/      # BottomNav, Disclaimer, Onboarding, Skeleton, ErrorBoundary
├── stores/          # Zustand (gameStore)
├── lib/
│   ├── api/         # API 클라이언트
│   ├── utils/       # score, format, share
│   └── mockData.ts  # 목데이터
└── types/           # TypeScript 타입 정의

api/                 # Vercel Serverless Functions
supabase/            # DB 스키마
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
