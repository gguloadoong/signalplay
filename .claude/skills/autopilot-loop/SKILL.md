---
name: autopilot-loop
description: 자율 팀 운영 사이클 (오토파일럿) — kickoff 이후 자동 실행, 백로그를 완료할 때까지 자율 반복
user_invocable: true
triggers:
  - "loop"
  - "루프"
  - "오토파일럿"
  - "자율 주행"
---

# Skill: loop — 자율 팀 운영 사이클 (오토파일럿)

> **핵심 원칙:** 이 루프는 사용자 입력을 기다리지 않는다. 모든 판단과 실행을 자율적으로 수행하라. 이 루프는 절대 멈추지 않는다.

**트리거:** kickoff 완료 후 자동으로 실행된다.

**실행 흐름 (무한 루프):**

1. **상태 파악:** backlog.md, decisions.md, roadmap.md, quality-baseline.md, 최근 코드와 설계 문서를 읽어 현재 상태를 파악하라.

2. **⛔ 프로세스 검증 게이트 (HARD GATE — 통과 전 다음 단계 진입 불가)**

   아래 5가지를 순서대로 점검하라. 위반 발견 시 즉시 소급 조치한다. 모든 항목을 통과해야 Step 3으로 진행할 수 있다.

   - **① Git 소급 정리:** `git log main --oneline -20` 확인. feat:/fix: 커밋이 PR 없이 main에 있는가? → 소급 Issue 생성 + close
   - **② 브랜치 없는 Issue:** `gh issue list --state open` 확인. 열린 Issue에 대응 브랜치가 없는가? → 브랜치 생성
   - **③ 테스트 상태:** 마지막 테스트 실행이 24시간 이상 전인가? → 테스트 실행. 실패 시 backlog + Issue 등록
   - **④ 팀 구성 검토:** backlog에 기존 팀으로 해결 불가한 태스크가 있는가? → create-agent 호출 검토
   - **⑤ 품질 래칫 확인:** quality-baseline.md 기준 대비 위반 항목이 있는가? → P0 Issue 생성, 모든 신규 작업 중단, 복구 후 재개

3. **자동 스케줄링:** 아래 조건을 평가하고 해당 스킬을 실행하라:
   - 매일 아침 → standup
   - 스프린트 시작 시 → sprint, 중반 → design-review, 종료 시 → retro
   - design-spec.md 변경 → design-review
   - PR 1차 리뷰 통과 → ai-review
   - 역할 부족 → create-agent
   - 외부 리소스 필요 → request-to-ceo
   - backlog 비거나 전략 개선 필요 → research-review
   - PRD/roadmap 큰 수정 필요 → planning-review
   - 새 빌드/기능 병합 → qa-browser

4. **우선순위 결정:** PM과 Strategist가 P1/P2 항목 우선순위를 결정하고 작업을 배정하라.

5. **작업 실행:** 에이전트는 Edit, Bash, Browser, Fetch 등의 도구를 활용하여 코드/문서 작성과 테스트를 수행하라. **반드시 Issue → Branch → PR 워크플로우를 따른다.** 결과는 PR로 제출하라.

6. **문제 기록:** 버그, 설계 누락, 성능 이슈는 즉시 backlog.md와 GitHub Issue에 등록하라.

7. **루프 지속 & 자율 진화 엔진:** Step 1로 돌아가라. 남은 태스크가 없어도 아래 자율 진화 활동을 수행한다. 각 활동은 Issue → Branch → PR 흐름을 따른다.

   ### Level 1 — 기술 품질 자동 상향 (매일)
   - **Lighthouse:** LCP 2.0s, FID 100ms, CLS 0.1 기준. 미달 시 최적화 PR 생성
   - **번들 사이즈:** 전일 대비 +5% 증가 시 원인 분석 → dynamic import / tree shaking
   - **TypeScript 에러:** `tsc --noEmit` 에러 0개 유지. 발생 즉시 P1 Issue
   - **보안 취약점:** `npm audit` critical/high 0개 유지. 발견 시 P0 즉시 패치

   ### Level 2 — UX/디자인 자율 개선 (주 1회, 월요일)
   - **경쟁사 스캔:** research-review로 동종 서비스 UI 변경 확인
   - **Figma Community 탐색:** 디자인 시스템 패턴 비교, 개선 컴포넌트 제안
   - **UI 감사:** qa-browser로 터치 타겟(48px), 색 대비(WCAG AA), 빈 상태 누락 점검
   - 개선 항목을 backlog [UX] 태그로 등록

   ### Level 3 — 전략적 탐색 (격주, 금요일)
   - **경쟁사 심층 분석:** 신규 기능, 가격, 마케팅 전략 변동 파악
   - **신규 기능 제안:** PM + Strategist가 후보 3개를 PRD 제안 섹션에 추가
   - **기술 트렌드:** 현재 스택의 메이저 업데이트, 대체 라이브러리 조사
   - 사업 방향 피벗 수준이면 request-to-ceo, 그 외는 팀 합의로 backlog P2 편입

   ### Level 4 — 프로세스 자체 개선 (스프린트 종료 시, retro 직후)
   - **메타 분석:** Issue 완료율, PR 사이클 타임, 봇 리뷰 채택/기각 비율
   - **병목 해결:** 사이클 타임 2일 초과 태스크 분류 → ADR 기록
   - **스킬/에이전트 최적화:** 반복 판단 필요 단계 → 스킬 개선 or 새 스킬
   - **quality-baseline.md 갱신:** 달성한 최고 품질로 baseline 상향 (래칫 효과)
