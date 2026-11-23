---
id: 20261119-2231-actions-runner-failure
title: GitHub Actions 전체 워크플로 실패 (11-05부터)
status: todo
priority: low
created: 2026-11-19
external:
---

## 맥락

`20261027-1007` 작업 중 발견했다. 2026-11-05부터 예약 실행되는 워크플로가 **전부** 실패한다.
대상은 `finalize_artist_of_month`, `crawl_recent_tj`, `update_ky_youtube`, `translation_jpn`, `verify_ky_youtube`다.

- job이 3~4초 만에 끝나고 `runner_id: 0`, step이 없으며 로그는 404다. 러너가 배정되기 전에 실패한 것이라 코드나 secret 문제가 아니다.
  11-04까지는 같은 secret으로 성공했다(finalize run 41233232530 등).
- 계정 단위 원인으로 추정한다: Actions 사용량·결제 한도(Spending limit), 결제 수단 문제, 레포 Actions 비활성화.
- 영향
  - 신곡 크롤링, KY 번호 갱신, 일본곡 번역이 2주째 멈춰 있다.
  - **12-01(KST) 11월 아티스트 월간 확정이 돌지 않는다.** 그 전에 풀려야 한다.

## 완료 조건

- [x] GitHub → Settings → Billing and plans에서 Actions 사용량·Spending limit·결제 수단 확인
- [x] 레포 Settings → Actions → General에서 Actions 허용 상태 확인
- [x] 원인 해결 후 워크플로 하나를 `workflow_dispatch`로 수동 실행해 성공 확인
- [ ] 멈춘 기간(11-05~)의 신곡·번역이 다음 실행에서 따라잡히는지 확인 (crawl은 기간 인자 확인 필요)
- [ ] 12-01 이후 11월 확정 run 성공 확인

## 로그

- 2026-11-19: 등록 (1007 작업 중 발견, actions 실행 목록으로 재확인 — 11-18 run 84 등 모두 failure)
- 2026-11-20: Billing 확인 — singcode Actions Linux 14,829분, Gross $88.98 / Billed $0(공개 레포 할인). 사용량 요금이 원인은 아님 → Budgets and alerts($0 예산·Stop usage)와 결제 실패 내역 확인 필요
- 2026-11-23: 복구 확인 — 사용자가 Billing 설정 조정 후 11-23(KST) 예약 실행(finalize run 88, crawl_recent_tj 288, update_ky_youtube 289)이 모두 success. 수동 실행 대신 예약 실행 성공으로 확인. 남은 확인: 11-05~11-22 공백 따라잡기, 12-01 월간 확정
