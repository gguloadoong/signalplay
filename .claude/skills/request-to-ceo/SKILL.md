---
name: request-to-ceo
description: CEO 헬프 데스크 — 외부 블로커 발생 시 BLUF 형식 요청
user_invocable: true
triggers:
  - "ceo 보고"
  - "request to ceo"
  - "대표 보고"
  - "결정 요청"
---

# Skill: request-to-ceo — CEO 헬프 데스크
**트리거:** 외부 블로커(API 키 발급, DB 생성, 결제 권한 등)가 필요해 작업이 중단될 경우 loop가 자동으로 호출합니다.
**실행 지시:** PM 제이크가 실행합니다.
*브리핑 양식:*
1. 요청 요약(BLUF)
2. 필요한 이유
3. 팀의 사전 검토 내용(대안 실패 이유)
4. CEO 액션 아이템(복붙 가능한 터미널 명령어 등)
브리핑 후 CEO의 응답을 기다리되, 블로커가 걸린 태스크를 '대기' 상태로 표시하라.
**[자동 체이닝]** CEO 브리핑 작성이 완료되면 즉시 loop 스킬의 Step 1로 복귀하여 대기 중이 아닌 다른 태스크를 진행하라.
