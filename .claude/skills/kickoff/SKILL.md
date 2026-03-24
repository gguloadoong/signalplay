---
name: kickoff
description: 프로젝트 킥오프 미팅 — 각 에이전트가 담당 문서를 작성하며 서비스 방향을 정립
user_invocable: true
triggers:
  - "kickoff"
  - "킥오프"
  - "프로젝트 시작"
---

# Skill: kickoff — 프로젝트 킥오프 미팅
**트리거:** 새 프로젝트를 시작할 때 자동으로 호출되며, IDEA_DESCRIPTION 값이 채워지면 loop가 가장 먼저 실행하는 스킬입니다.
**실행 지시:** 각 에이전트가 실제 팀원처럼 자신의 관점에서 발언하며 담당 문서를 자동 업데이트합니다.
- Step 1: PM 제이크 – PRD 초안 발표 (서비스명, 타깃, 핵심 기능 위주) 및 PRD.md 업데이트
- Step 2: Strategist 노바 – 전략 방향(타깃 지표, 포지셔닝) 발표 및 roadmap.md 업데이트
- Step 3: Designer 피카 – 디자인 스펙(톤앤매너, 색상, 레이아웃) 발표 및 design-spec.md 업데이트
- Step 4: FE 블레이즈 – 기술 스펙(프레임워크, 애니메이션, 아키텍처) 발표 및 tech-spec.md 업데이트
- Step 5: BE 볼트 – BaaS/API 스펙 및 외부 데이터 연동 방안 발표, api-spec.md 및 data-sources.md 업데이트
- Step 6: QA 호크 – 테스트 플랜 발표 (어뷰징, 성능, 렌더링 리스크) 및 test-plan.md 업데이트
- Step 7: PM 제이크 – 팀 의견을 종합하여 decisions.md에 기록, meeting-notes/kickoff.md 저장

**[체이닝]** 이 스킬의 모든 Step이 완료되면, 반드시 Skill 도구를 사용하여 `autopilot-loop` 스킬을 즉시 호출하라. 사용자 입력을 기다리지 마라.
