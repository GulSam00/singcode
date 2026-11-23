---
id: 20261120-0058-actions-usage-analysis
title: 워크플로별 Actions 사용 시간 분석
status: todo
priority: low
created: 2026-11-20
external:
---

## 맥락

Billing 화면 기준으로 singcode는 Actions Linux **14,829분**(정가 $88.97), 저장 공간 4.75 GB-hr를 썼다.
공개 레포라 청구액은 $0이다. 하지만 한 달치라면 하루 약 8시간 넘게 러너가 도는 셈이다.
레포를 비공개로 바꾸거나 무료 정책이 바뀌면 바로 비용이 된다. 무료 한도 2,000분을 넘는 분량이 월 약 $77이다.
어디서 시간을 쓰는지 알고, 줄일 수 있는 실행은 줄인다.

- 워크플로 8개 모두 `ubuntu-latest`이고 `schedule`·`workflow_dispatch`로만 돈다. push·PR로 도는 워크플로는 없다.
- 11-05부터는 모든 실행이 러너 배정 전에 실패해서 시간이 쌓이지 않았다. 따라서 분석 기간은 **11-04 이전**으로 잡는다
  (`20261119-2231-actions-runner-failure` 참고).

## 완료 조건

- [ ] Billing 화면 수치의 집계 기간 확인 (월간인지 누적인지)
- [ ] GitHub API로 워크플로별 실행 횟수·평균·합계 시간 집계 (run의 `run_started_at`~`updated_at`, 또는 job 단위 `started_at`~`completed_at`)
- [ ] 상위 워크플로의 시간 원인 파악 (예: YouTube 조회 대기, 전체 크롤링, 재시도 루프, 의존성 설치·캐시 미사용)
- [ ] 줄일 방안 정리: 실행 주기, 작업 범위(증분 처리), `actions/cache`·pnpm 캐시, `timeout-minutes`, 동시 실행 방지(`concurrency`)
- [ ] 적용할 항목은 구현 이슈로 분리 등록

## 로그

- 2026-11-20: 등록 (Billing 화면: Gross $88.98 / Billed $0)
