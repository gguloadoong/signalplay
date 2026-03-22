# 📊 시그널플레이 (SignalPlay)

> AI가 분석한 투자 시그널로 예측 게임을 즐기고, 매일 투자 인사이트를 캐치하세요

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai)](https://openai.com)
[![Vercel](https://img.shields.io/badge/Vercel-배포-000000?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 핵심 가치

| 문제 | 해결 |
|------|------|
| 투자 정보가 너무 분산되어 있다 | 주식·코인·부동산 시그널을 한 화면에 통합 |
| 어렵고 지루해서 꾸준히 못 본다 | 게임처럼 예측하고 포인트·랭킹으로 성취감 제공 |
| 근거 없는 정보가 너무 많다 | AI 논문·데이터 기반 시그널로 신뢰도 확보 |

---

## 주요 기능

### 🎯 Daily Signal Game (데일리 시그널 게임)
매일 오전 9시, AI가 분석한 3개의 투자 시그널이 공개됩니다. 24시간 내에 "오름 / 내림 / 횡보"를 예측하고, 정답 시 포인트를 획득하세요. 연속 정답 스트릭이 쌓일수록 보너스 멀티플라이어가 붙습니다.

### 🃏 AI Insight Cards (AI 인사이트 카드)
GPT-4o와 AI 논문 분석 엔진이 생성한 투자 인사이트 카드. 복잡한 거시경제 지표, 기술적 분석, 섹터 동향을 2~3줄로 압축. 스와이프해서 저장하고, 나만의 인사이트 컬렉션을 만드세요.

### 🏆 Prediction Leaderboard (예측 리더보드)
실시간으로 업데이트되는 주간/월간 랭킹. 전체 순위와 함께 "내 주변 예측자" 보기로 경쟁 의욕을 자극합니다. 상위 1% 달성 시 프리미엄 시그널 1주일 무료 제공.

### ⚡ Breaking News Catch (브레이킹 뉴스 캐치)
시장에 영향을 주는 뉴스가 터지면 즉시 알림. 10분 이내 빠른 예측 게임으로 반응 속도를 겨룹니다. 속보 예측은 일반 게임 대비 2배 포인트.

### 📈 Cross-asset Coverage (크로스에셋)
- **주식**: 코스피·코스닥·미국 주요 종목 시그널
- **코인**: 비트코인·이더리움·주요 알트코인 시그널
- **부동산**: 아파트 매매·전세 지수 및 입지 시그널

---

## 기술 스택

### 프론트엔드
- **[Next.js 15](https://nextjs.org)** — App Router, React Server Components
- **[TypeScript 5](https://www.typescriptlang.org)** — 전체 타입 안전성
- **[Tailwind CSS v4](https://tailwindcss.com)** — 유틸리티 퍼스트 스타일링
- **[shadcn/ui](https://ui.shadcn.com)** — 접근성 기반 컴포넌트 라이브러리
- **[Framer Motion](https://www.framer.com/motion/)** — 게임 피드백 애니메이션

### 백엔드 & 인프라
- **[Supabase](https://supabase.com)** — PostgreSQL, Auth, Edge Functions, Realtime
- **[Vercel](https://vercel.com)** — 프론트엔드 배포, Edge Middleware
- **Toss 미니앱** — WebView 기반 모바일 앱 배포

### AI
- **[OpenAI GPT-4o](https://openai.com)** — 시그널 생성, 뉴스 요약, 인사이트 카드
- **OpenAI Embeddings** — AI 논문·리포트 벡터화
- **pgvector** — 유사 시그널 검색

### 테스팅
- **[Vitest](https://vitest.dev)** — 유닛 테스트
- **[Playwright](https://playwright.dev)** — E2E 테스트

---

## 프로젝트 구조

```
signalplay/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # 인증 관련 페이지
│   │   ├── login/
│   │   └── signup/
│   ├── (game)/                 # 게임 플로우 페이지
│   │   ├── daily/              # 데일리 시그널 게임
│   │   ├── breaking/           # 브레이킹 뉴스 캐치
│   │   └── leaderboard/        # 예측 리더보드
│   ├── signals/                # 시그널 & 인사이트 카드
│   ├── profile/                # 유저 프로필 & 히스토리
│   ├── layout.tsx
│   └── page.tsx                # 홈 (피드)
├── components/
│   ├── ui/                     # shadcn/ui 기반 기본 컴포넌트
│   ├── game/                   # 게임 전용 컴포넌트
│   │   ├── SignalCard.tsx
│   │   ├── PredictionButton.tsx
│   │   └── StreakBadge.tsx
│   ├── signals/                # 시그널·인사이트 컴포넌트
│   └── layout/                 # 헤더, 네비게이션, 레이아웃
├── lib/
│   ├── supabase/               # Supabase 클라이언트 & 쿼리
│   ├── openai/                 # OpenAI API 래퍼
│   └── utils/                  # 공통 유틸리티
├── hooks/                      # 커스텀 React 훅
│   ├── useSignalGame.ts
│   ├── useLeaderboard.ts
│   └── useInsightCards.ts
├── types/                      # TypeScript 타입 정의
│   ├── Signal.types.ts
│   ├── Game.types.ts
│   └── User.types.ts
├── supabase/
│   ├── functions/              # Edge Functions
│   │   ├── generate-signals/   # 시그널 배치 생성
│   │   └── resolve-predictions/ # 예측 결과 처리
│   └── migrations/             # DB 마이그레이션
├── tests/
│   ├── unit/                   # Vitest 유닛 테스트
│   └── e2e/                    # Playwright E2E 테스트
├── .env.example
├── .env.local                  # 로컬 환경변수 (gitignore)
├── CLAUDE.md                   # Claude Code 프로젝트 지침
└── README.md
```

---

## 설치 및 실행 방법

### 사전 요구사항
- Node.js 20+
- npm 10+
- Supabase 계정 및 프로젝트 생성
- OpenAI API 키

### 1. 저장소 클론

```bash
git clone https://github.com/your-org/signalplay.git
cd signalplay
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

```bash
cp .env.example .env.local
# .env.local 파일을 열어 각 값을 채워넣으세요
```

### 4. Supabase 마이그레이션 적용

```bash
npx supabase db push
```

### 5. 개발 서버 실행

```bash
npm run dev
# http://localhost:3000 에서 확인
```

### 주요 npm 명령어

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 검사
npm run typecheck    # TypeScript 타입 검사
npm run test         # Vitest 유닛 테스트
npm run test:e2e     # Playwright E2E 테스트
npm run test:all     # 전체 테스트 실행
```

---

## 팀 소개

| 이름 | 닉네임 | 역할 | 경력 |
|------|--------|------|------|
| 제이크 (Jake) | 자동화 못 참는 PM | PM | Ex-Toss PM, 사용자 행동 분석 전문 |
| 노바 (Nova) | 경제 시스템 덕후 | 전략기획 | Ex-넥슨 전략기획, 게임 경제 설계 전문 |
| 피카 (Pika) | 픽셀 하나에 목숨 거는 | 디자이너 | Ex-토스 디자인팀, 금융 UX 전문 |
| 블레이즈 (Blaze) | 번들 사이즈 강박증 | 프론트엔드 | Ex-당근마켓 FE, 모바일 웹 최적화 전문 |
| 볼트 (Bolt) | 쿼리 하나에 밤새는 | 백엔드 | Ex-업비트 BE, 실시간 데이터 처리 전문 |
| 호크 (Hawk) | 버그 못 보면 잠 못 자는 | QA | Ex-카카오뱅크 QA, 금융앱 품질 전문 |

---

## 라이선스

이 프로젝트는 [MIT License](LICENSE) 하에 배포됩니다.

---

<div align="center">

🤖 Built with AI-powered autonomous team

*시그널플레이는 투자 정보 제공 및 게임 서비스입니다. 투자 권유나 재정 조언을 목적으로 하지 않습니다.*

</div>
