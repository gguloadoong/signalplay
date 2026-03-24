---
name: planning-review
description: 세부 계획 검토 및 범위 조정 — kickoff 이후 설계 완료 시점에 호출
user_invocable: true
triggers:
  - "기획 리뷰"
  - "planning review"
  - "prd 리뷰"
---

# Skill: planning-review — 세부 계획 검토 및 범위 조정
**트리거:** kickoff 이후 초기 설계가 완료되거나 PRD/roadmap에 큰 변경이 필요할 때 loop가 자동으로 호출합니다.
**실행 지시:**
- Step 1: Strategist 노바 – 핵심 문제를 재정의하고 프레이밍을 점검합니다.
- Step 2: PM 제이크 – 범위를 축소·확장하거나 우선순위를 재조정합니다.
- Step 3: FE 블레이즈/BE 볼트 – 데이터 흐름, 아키텍처를 확정합니다.
- Step 4: Designer 피카 – 디자인 0–10점 평가, 목표 수준 조정합니다.
- Step 5: QA 호크 – 테스트 관점에서 누락 부분을 확인합니다.
- Step 6: PM 제이크 – decisions.md와 meeting-notes/planning-review.md에 기록합니다.

**[체이닝]** 이 스킬의 모든 Step이 완료되면, 반드시 Skill 도구를 사용하여 `autopilot-loop` 스킬을 즉시 호출하라. 사용자 입력을 기다리지 마라.
