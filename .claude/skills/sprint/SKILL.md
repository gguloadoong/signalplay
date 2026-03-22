---
name: sprint
description: 스프린트 플래닝 — 백로그 기반 태스크 분배 및 목표 설정
user_invocable: true
triggers:
  - "sprint"
  - "스프린트"
  - "스프린트 플래닝"
---

# Skill: sprint — 스프린트 플래닝
**트리거:** 새로운 스프린트를 시작할 때 자동으로 호출됩니다. backlog에 P1/P2 항목이 있을 때 loop가 실행합니다.
**실행 지시:**
- Step 1: PM 제이크 – PRD와 roadmap을 기반으로 이번 스프린트 목표 및 필수 우선순위를 선언합니다.
- Step 2: FE 블레이즈 – UI 컴포넌트와 애니메이션 태스크를 [FE-01], [FE-02] 형식으로 세분화합니다.
- Step 3: BE 볼트 – BaaS 연동, 데이터 스키마, API 구현 태스크를 [BE-01] 형식으로 세분화합니다.
- Step 4: QA 호크 – 핵심 스모크 테스트 케이스와 E2E 시나리오를 선택합니다.
- Step 5: PM 제이크 – 최종 태스크를 배분하고 decisions.md 및 meeting-notes/sprint.md에 기록합니다.
- Step 6: **[자동 체이닝]** 스프린트 플래닝이 완료되면 즉시 loop 스킬의 Step 1로 복귀하라.
