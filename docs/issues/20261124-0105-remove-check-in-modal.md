---
id: 20261124-0105-remove-check-in-modal
title: 출석 체크 모달 삭제
status: todo
priority: low
created: 2026-11-24
external:
---

## 맥락

`20261113-0104`에서 출석이 자동으로 바뀌었다(앱 진입 시 `useAutoCheckIn`, 적립되면 토스트).
그 뒤로 `CheckInModal`은 헤더 "출석" 버튼을 눌렀을 때 출석 상태와 다음 출석까지 남은 시간만 보여주는 용도로 남았다.
자동 출석과 토스트로 충분하므로 모달을 없앤다.

### 관련 코드 (2026-11-24 develop 기준)

- `apps/web/src/components/CheckInModal.tsx` — 모달 본체. 비로그인이면 "로그인 후 사용 가능합니다 / 로그인하러 가기" 표시
- `apps/web/src/Header.tsx` — "출석" `ExpandableButton`과 `Dialog`로 모달을 연다
- `apps/web/src/hooks/useCheckInTimer.ts` — 남은 시간 계산. 모달에서만 쓴다
- `apps/web/src/utils/kst.ts`의 `isCheckedInTodayKST` — Header의 출석 상태 판정. 모달이 없어지면 쓰는 곳이 남는지 확인
- `lottie-react` 의존성 — `CheckInModal`에서만 쓴다. 모달을 지우면 의존성도 제거 대상

### 정할 것

- 헤더 "출석" 버튼을 같이 지울지, 다른 용도(예: 포인트 내역 `/info/point-logs`로 이동)로 바꿀지
- 자동 출석 토스트 외에 출석 여부를 보여줄 자리가 필요한지 (예: 정보 페이지 포인트 옆 "오늘 출석 완료" 표시)

## 완료 조건

- [ ] 헤더 "출석" 버튼 처리 방식 결정
- [ ] `CheckInModal`, `useCheckInTimer` 삭제, Header의 Dialog·상태 코드 정리
- [ ] 고아가 된 유틸·의존성(`isCheckedInTodayKST`, `lottie-react` 등) 정리
- [ ] 자동 출석 토스트가 그대로 뜨는지 확인
- [ ] `/verify` (build·lint·format) 통과

## 로그

- 2026-11-24: 등록
