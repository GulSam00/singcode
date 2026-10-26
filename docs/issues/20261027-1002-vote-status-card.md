---
id: 20261027-1002-vote-status-card
title: 투표 현황 카드 (참여 인원·총 표·내 지분)
status: later
priority: low
created: 2026-10-27
external:
---

## 맥락

/vote 상단에 현재 참여 인원, 총 표, 내 지분을 보여주는 카드를 논의했다(A+C+D안). 논의 단계에서 멈췄고 구현은 시작하지 않았다.
집계는 RLS 때문에 클라이언트에서 직접 읽기 어려워 SECURITY DEFINER RPC로 하는 안을 정했다.

## 완료 조건

- [ ] 카드에 보여줄 항목과 위치 확정
- [ ] 집계 RPC(SECURITY DEFINER) SQL 작성, 직접 실행
- [ ] API 라우트와 카드 컴포넌트 구현

## 로그

- 2026-10-27: 등록
