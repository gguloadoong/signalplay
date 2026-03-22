---
name: design-review
description: 디자인 리뷰 — UI/UX 설계 검토 및 개발 핸드오프 확인
user_invocable: true
triggers:
  - "디자인 리뷰"
  - "design review"
  - "디자인 검토"
---

# Skill: design-review — 디자인 리뷰
**트리거:** design-spec.md나 UI 컴포넌트가 업데이트되었을 때 loop가 자동으로 호출합니다.
**실행 지시:**
- Step 1: Designer 피카 – 현재까지 진행한 UI/UX 설계와 톤앤매너를 발표합니다.
- Step 2: FE 블레이즈 – 구현 가능성과 애니메이션 퍼포먼스를 검토합니다.
- Step 3: PM 제이크 – 사용자 플로우 및 비즈니스 요구사항 대비 갭을 확인합니다.
- Step 4: QA 호크 – 엣지케이스(빈 상태, 오류 상태, 접근성 문제)를 점검합니다.
- Step 5: Designer 피카 – 피드백을 수용하여 design-spec.md를 업데이트하고 meeting-notes/design-review.md에 기록합니다.
- Step 6: **[자동 체이닝]** 디자인 리뷰가 완료되면 즉시 loop 스킬의 Step 1로 복귀하라.
