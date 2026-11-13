---
id: 20261113-0104-point-integrity
title: 포인트 무결성 — 임의 적립·중복 출석·동시 차감 막기
status: doing
priority: high
created: 2026-11-13
external:
---

## 맥락

익명 사용 검토(`20261113-0103-anonymous-access`) 중에 발견했다. 익명과 상관없이 **지금도** 로그인한 사용자는 누구나
포인트를 마음대로 늘릴 수 있다. 포인트가 아티스트 순위에 그대로 반영되므로 순위를 조작할 수 있다는 뜻이다.

1. **`PATCH /api/user/point`가 클라이언트가 보낸 `amount`를 그대로 적립한다**
   (`apps/web/src/app/api/user/point/route.ts`). `{ "amount": 1000000 }`이면 그만큼 생긴다.
   이 라우트를 호출하는 클라이언트 훅(`usePatchSetPointMutation`, `src/queries/userQuery.ts`)은 화면 어디서도 쓰지 않는다.
2. **출석 체크에 서버 쪽 "하루 한 번" 검사가 없다** (`src/app/api/user/check-in/route.ts`).
   중복 출석은 `Header.tsx`의 날짜 비교로만 막고 있어, PATCH를 반복 호출하면 30P씩 계속 쌓인다.
   클라이언트 비교도 KST가 아니라 브라우저 로컬 시각 기준이다.
3. **투표 차감이 원자적이지 않다** (`src/app/api/artist-vote/route.ts`).
   잔액 조회 → `artist_votes` upsert → `record_point_change` 순서가 각각 다른 요청이라,
   동시에 여러 번 보내면 잔액 검사를 모두 통과해 보유량보다 많이 걸 수 있다. `songs/promotions`도 같은 구조다.
4. **확인 필요: `record_point_change` RPC 권한.** 정의가 레포에 없다. `p_user_id`를 인자로 받으므로,
   SECURITY DEFINER이면서 `auth.uid() = p_user_id` 검사가 없고 `authenticated`에 EXECUTE 권한이 있으면
   브라우저에서 anon 키로 **남의 포인트까지** 바꿀 수 있다.
5. **확인 필요: `users` 테이블 RLS.** `useAuthStore`가 브라우저에서 `users`를 직접 insert한다.
   update 정책이 본인 행 전체 컬럼을 허용하면 `point` 컬럼을 REST로 직접 고칠 수 있다.

6. **`artist_votes`를 브라우저에서 직접 insert·update할 수 있다** (`apps/web/artist-vote-schema.sql:86-91`).
   정책이 `auth.uid() = user_id`만 검사하므로, 로그인한 사용자는 anon 키로 PostgREST를 직접 호출해
   **포인트 차감 없이** 원하는 `amount`로 투표를 넣을 수 있다. 차감은 BFF 라우트에만 있다.
   쓰기 정책을 없애고 서버(RPC) 경로로만 쓰게 해야 한다.

### 추가 범위: 자동 출석 체크

지금은 로그인 사용자가 들어오면 `Header.tsx`가 `CheckInModal`을 띄우고, 버튼을 눌러야 `PATCH /api/user/check-in`이 호출된다.
이를 **앱 진입 시 자동 출석**으로 바꾼다. 위 2번(서버 쪽 하루 한 번 검사)과 같은 RPC를 쓰므로 함께 처리한다.

- 로그인 사용자가 앱에 들어오면 클라이언트가 출석 API를 한 번 호출한다. 서버가 KST 날짜 기준으로 멱등하게 처리해서,
  이미 출석했으면 적립 없이 성공을 돌려준다. 응답에 이번 호출로 적립됐는지(`awarded`)를 담는다.
- 적립된 경우에만 토스트로 알린다(예: "출석 체크 완료 +30P"). 자동으로 모달을 여는 동작은 없앤다.
- 헤더의 "출석" 버튼은 남겨서 출석 상태와 다음 출석까지 남은 시간을 보여준다. 수동 적립 버튼은 없앤다.
- 출석 여부 판단은 클라이언트 시계가 아니라 서버(KST)를 기준으로 한다.

## 완료 조건

- [ ] `PATCH /api/user/point` 라우트와 `patchUserPoint`·`usePatchSetPointMutation` 제거
- [ ] 자동 출석: 로그인 상태로 앱 진입 시 출석 API 자동 호출, 적립 시 토스트, 자동 모달 제거, 헤더 버튼은 상태 표시용으로 유지
- [ ] 출석을 RPC 하나로 묶기: KST 오늘 이미 출석했으면 거절하고, `last_check_in` 갱신과 +30P를 한 트랜잭션으로 처리
- [ ] 투표·곡 홍보 차감을 RPC 하나로 묶기: `select ... for update`로 잔액을 잠그고 검사·기록·차감을 원자적으로 처리
- [ ] Supabase에서 `record_point_change` 정의·EXECUTE 권한, `users` RLS(update 정책·컬럼 범위) 확인 → 필요하면 `revoke execute ... from anon, authenticated`, `point` 컬럼 update 차단
- [ ] `artist_votes` insert/update/delete RLS 정책 제거 — 쓰기는 차감 RPC(SECURITY DEFINER)로만
- [ ] 기존 `artist_votes`에서 `point_logs` 차감 기록과 금액이 맞지 않는 투표가 있는지 조회
- [ ] 기존 `point_logs`에서 비정상 적립(출석 하루 2회 이상, 출처 불명 대량 적립)이 있었는지 조회

## 로그

- 2026-11-13: 등록 (익명 사용 검토 중 발견)
- 2026-11-13: artist_votes 직접 쓰기 정책 문제 추가
- 2026-11-13: 착수(doing). 자동 출석 체크를 범위에 추가
- 2026-11-13: `apps/web/point-integrity.sql` 작성 — 출석·투표·홍보 등록/취소 RPC(SECURITY DEFINER, `auth.uid()`, users 행 잠금), record_point_change·users.point·artist_votes·song_promotions·point_logs 쓰기 권한 회수, 과거 악용 감사 쿼리
