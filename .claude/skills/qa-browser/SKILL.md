---
name: qa-browser
description: UI 자동 테스트 — 실제 서비스 화면에서 핵심 흐름 검증
user_invocable: true
triggers:
  - "qa 테스트"
  - "qa-browser"
  - "브라우저 테스트"
---

# Skill: qa-browser — UI 자동 테스트
**트리거:** 새로운 빌드가 배포되거나 주요 기능이 병합되었을 때 loop가 자동으로 호출합니다.
**실행 지시:** QA 호크가 Playwright 또는 적합한 UI 자동 테스트 도구를 사용하여 핵심 흐름을 테스트합니다.
- Step 1: 테스트할 URL 또는 화면을 로드하고 사용자 시나리오를 재현합니다.
- Step 2: UI/UX 문제를 발견하면 스크린샷과 함께 backlog.md와 GitHub Issue에 기록합니다.
- Step 3: 발견된 문제에 대한 수정 PR을 생성하거나 담당 에이전트에게 할당합니다.

**[체이닝]** 이 스킬의 모든 Step이 완료되면, 반드시 Skill 도구를 사용하여 `autopilot-loop` 스킬을 즉시 호출하라. 사용자 입력을 기다리지 마라.
