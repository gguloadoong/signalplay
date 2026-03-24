---
name: ai-review
description: 다중 AI 코드 리뷰 — 독립적 AI 모델/도구를 통한 코드 품질 검증
user_invocable: true
triggers:
  - "ai 리뷰"
  - "ai review"
  - "ai 코드 리뷰"
---

# Skill: ai-review — 다중 AI 코드 리뷰
**트리거:** PR이 셀프 리뷰와 기본 리뷰를 통과한 후 loop가 자동으로 호출합니다.
**실행 지시:**
- Step 1: FE 또는 BE – 검토 대상 PR을 준비합니다.
- Step 2: AI 리뷰어(CodeRabbit, Gemini Code Assist, Copilot 등)를 호출해 코드를 분석합니다.
- Step 3: 결과를 수집하여 PR에 댓글로 요약합니다.
- Step 4: 필요한 수정 사항을 반영한 후 QA와 PM에게 최종 검토를 요청합니다.

**[체이닝]** 이 스킬의 모든 Step이 완료되면, 반드시 Skill 도구를 사용하여 `autopilot-loop` 스킬을 즉시 호출하라. 사용자 입력을 기다리지 마라.
