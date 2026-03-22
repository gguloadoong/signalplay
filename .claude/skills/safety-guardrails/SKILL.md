---
name: safety-guardrails
description: 파괴적 명령어 보호와 파일 수정 제한 — 안전 장치 자동 적용
user_invocable: true
triggers:
  - "safety"
  - "guardrails"
  - "안전 가이드라인"
---

# Skill: safety-guardrails — 파괴적 명령어 보호와 파일 수정 제한
**트리거:** 위험한 명령을 실행하거나 중요한 파일을 수정하려 할 때 자동으로 호출됩니다.
**실행 지시:**
- Step 1: 모든 명령 실행 전에 rm -rf, DROP TABLE, git reset --hard 등 파괴적 명령을 감지하고 경고를 출력합니다.
- Step 2: 특정 디렉터리나 파일을 수정하지 못하도록 잠그고, 변경이 필요한 경우에는 PM과 BE의 승인을 받습니다.
- Step 3: 보호 상태를 유지하고, 작업 완료 후 잠금을 해제합니다.
*규칙:* 안전 모드는 기본적으로 활성화되어야 하며, override가 필요한 경우 반드시 사전 승인을 받아야 합니다.
**[실행 흐름]** 위험 명령을 차단하거나 승인 절차를 완료한 후, 호출 시점의 실행 흐름으로 즉시 복귀하라.
