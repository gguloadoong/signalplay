---
name: research-review
description: 시장 및 경쟁 서비스 리서치 — 인사이트 도출 및 액션화
user_invocable: true
triggers:
  - "리서치 리뷰"
  - "research review"
  - "시장 분석"
---

# Skill: research-review — 시장 및 경쟁 서비스 리서치
**트리거:** backlog가 비어 있거나 제품 성장 전략을 탐색해야 할 때 loop가 자동으로 호출합니다.
**실행 지시:**
- Step 1: Strategist 노바가 조사할 주제와 목표를 정의합니다.
- Step 2: 에이전트는 browser 도구와 MCP 플러그인을 사용해 정보를 수집합니다.
- Step 3: 수집한 자료를 요약하여 주요 기회와 위협, 새로운 기능 아이디어를 도출하고 backlog.md에 제안합니다.
- Step 4: 결과를 meeting-notes/research-review.md에 기록합니다.
- Step 5: **[자동 체이닝]** 리서치 리뷰가 완료되면 즉시 loop 스킬의 Step 1로 복귀하라.
