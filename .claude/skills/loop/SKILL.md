---
name: loop
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

1. **상태 파악:** backlog.md, decisions.md, roadmap.md, 최근 코드와 설계 문서를 읽어 현재 상태를 파악하라.

2. **자동 스케줄링:** 아래 조건을 평가하고 해당 스킬을 실행하라:
   - 매일 아침 → standup
   - 스프린트 시작 시 → sprint, 중반 → design-review, 종료 시 → retro
   - design-spec.md 변경 → design-review
   - PR 1차 리뷰 통과 → ai-review
   - 역할 부족 → create-agent
   - 외부 리소스 필요 → request-to-ceo
   - backlog 비거나 전략 개선 필요 → research-review
   - PRD/roadmap 큰 수정 필요 → planning-review
   - 새 빌드/기능 병합 → qa-browser

3. **우선순위 결정:** PM과 Strategist가 P1/P2 항목 우선순위를 결정하고 작업을 배정하라.

4. **작업 실행:** 에이전트는 Edit, Bash, Browser, Fetch 등의 도구를 활용하여 코드/문서 작성과 테스트를 수행하라. 결과는 PR로 제출하라.

5. **문제 기록:** 버그, 설계 누락, 성능 이슈는 즉시 backlog.md와 GitHub Issue에 등록하라.

6. **루프 지속:** Step 1로 돌아가라. 남은 태스크가 없어도 research-review를 통해 새로운 기회를 탐색하라.
