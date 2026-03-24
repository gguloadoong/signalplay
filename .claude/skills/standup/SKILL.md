---
name: standup
description: 데일리 스탠드업 — 어제 완료/오늘 계획/블로커 공유
user_invocable: true
triggers:
  - "standup"
  - "스탠드업"
  - "데일리"
---

# Skill: standup — 데일리 스탠드업
**실행 지시:** 매일 작업 시작 전 자동으로 호출됩니다. 각 에이전트는 다음 세 가지를 간결하게 공유합니다:
1. 어제 완료한 작업
2. 오늘 계획된 작업
3. 현재 블로커
*규칙:* 블로커가 발견되면 즉시 해결 방안을 제시하거나 team-meeting 스킬을 호출해야 합니다.

**[체이닝]** 이 스킬의 모든 Step이 완료되면, 반드시 Skill 도구를 사용하여 `autopilot-loop` 스킬을 즉시 호출하라. 사용자 입력을 기다리지 마라.
