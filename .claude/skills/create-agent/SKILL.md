---
name: create-agent
description: 새 팀원 자율 채용 — 팀 역량 한계 시 새 에이전트 생성
user_invocable: true
triggers:
  - "에이전트 생성"
  - "create agent"
  - "새 에이전트"
---

# Skill: create-agent — 새 팀원 자율 채용
**트리거:** backlog 태스크를 특정 역할이 수행할 수 없거나 작업량이 과도하게 쌓이면 loop가 자동으로 호출합니다.
**실행 지시:** 실존 핀테크·게임 기업 경험과 B급 감성에 어울리는 별명을 갖춘 새로운 에이전트를 생성하고, 9개의 레이어를 빠짐없이 채워 .claude/agents/에 저장합니다.

**[체이닝]** 이 스킬의 모든 Step이 완료되면, 반드시 Skill 도구를 사용하여 `autopilot-loop` 스킬을 즉시 호출하라. 사용자 입력을 기다리지 마라.
