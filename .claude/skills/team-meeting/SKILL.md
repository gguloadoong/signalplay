---
name: team-meeting
description: 트러블슈팅 및 의사결정 회의 — 안건에 대해 팀원 전원 발언
user_invocable: true
triggers:
  - "team-meeting"
  - "팀 미팅"
  - "회의"
---

# Skill: team-meeting — 트러블슈팅 및 의사결정 회의
**트리거:** backlog 항목 또는 decisions.md에 [PROCESS]나 [CONTENT] 태그가 있는 안건이 등록되거나, 여러 에이전트 의견이 상충하면 loop가 자동으로 호출합니다.
**실행 지시:** 안건에 대해 PM → Designer → FE → BE → QA 순으로 발언합니다.
*규칙:* 침묵이나 "동의합니다"만으로 끝내는 것은 절대 금지입니다. 모든 참가자는 자신의 전문 영역 관점에서 구체적 근거를 바탕으로 [찬성/반대/수정안] 중 하나를 명확히 제시해야 합니다. 회의 후 PM은 decisions.md와 meeting-notes에 결과를 기록합니다.

**[체이닝]** 이 스킬의 모든 Step이 완료되면, 반드시 Skill 도구를 사용하여 `autopilot-loop` 스킬을 즉시 호출하라. 사용자 입력을 기다리지 마라.
