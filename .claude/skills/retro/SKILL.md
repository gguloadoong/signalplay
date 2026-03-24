---
name: retro
description: 스프린트 회고 — Keep/Problem/Try 기반 팀 개선 사이클
user_invocable: true
triggers:
  - "retro"
  - "레트로"
  - "회고"
  - "retrospective"
---

# Skill: retro — 스프린트 회고
**트리거:** 각 스프린트가 종료될 때 자동으로 호출됩니다.
**실행 지시:** QA → Designer → FE → BE → Strategist → PM 순으로 Keep/Problem/Try를 발표합니다.
*규칙:* 개인을 탓하지 않고 시스템적·프로세스적 패턴을 찾습니다. 도출된 문제는 즉시 backlog.md에 등록하고, PM은 decisions.md와 meeting-notes/retro.md에 회고 결과를 기록합니다.

**[체이닝]** 이 스킬의 모든 Step이 완료되면, 반드시 Skill 도구를 사용하여 `autopilot-loop` 스킬을 즉시 호출하라. 사용자 입력을 기다리지 마라.
