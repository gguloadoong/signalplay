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
- Step 5: **[자동 체이닝]** AI 코드 리뷰가 완료되면 즉시 loop 스킬의 Step 1로 복귀하라.
