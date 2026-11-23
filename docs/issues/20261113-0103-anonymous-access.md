---
id: 20261113-0103-anonymous-access
title: 회원 가입 없이 익명으로 주요 기능 사용하기
status: todo
priority: medium
created: 2026-11-13
external:
---

## 맥락

가입 장벽을 낮추려는 검토다. 지금 비로그인 사용자는 검색·차트·랭킹 열람과 **부를 곡(게스트)** 만 쓸 수 있다.
부를 곡은 이미 익명으로 쓸 수 있다. `useGuestToSingStore`(localStorage)에 쌓아 두고,
로그인하면 `useMergeGuestToSing` → `POST /api/songs/tosing/merge`로 옮긴다.
이 "로컬에 쌓고 → 로그인 때 병합" 패턴을 어디까지 넓힐지, 포인트 투표는 어떻게 할지가 핵심이다.

### 현재 인증 경계 (2026-11-13 develop 기준)

| 영역 | 라우트 | 비로그인 |
| --- | --- | --- |
| 검색·차트·랭킹·아티스트 검색 | `search`, `open_songs`, `tj-chart`, `artist-vote/rankings`, `artists/search` | 가능 |
| 부를 곡 | `songs/tosing` (+ `guest`, `merge`) | 가능 (localStorage) |
| 좋아요·저장 폴더 | `songs/like`, `songs/save` | 불가 (401) |
| 댓글·신고 | `songs/comments`, `songs/report` | 불가 |
| 출석·포인트·투표·곡 홍보 | `user/check-in`, `user/point`, `artist-vote`, `songs/promotions` | 불가 |

화면은 `src/auth.tsx`의 `ALLOW_PATHS`로 막는다. 서버는 라우트마다 `getAuthenticatedUser`를 부른다.
미들웨어 파일(`src/middleware.ts`)은 없다. `lib/supabase/middleware.ts`의 `updateSession`은 어디서도 호출하지 않는다.

### 선택지

**A. 로컬 게스트 확장**: 부를 곡과 같은 방식으로 좋아요·저장 폴더도 localStorage에 둔다.
- 장점: 서버 비용과 남용 위험이 없다. 이미 검증된 패턴을 그대로 쓴다.
- 단점: 기기를 바꾸거나 브라우저 데이터를 지우면 사라진다. 포인트처럼 위조되면 안 되는 값은 담을 수 없다.

**B. Supabase Anonymous Sign-in**: 첫 방문 때 `signInAnonymously()`로 진짜 `auth.users` 행을 만든다.
- 장점: 기존 API가 거의 그대로 동작한다(`getAuthenticatedUser`가 id를 돌려준다). 가입하면 같은 user_id로 이어진다.
- 단점과 주의점:
  - 익명 사용자도 **`authenticated` 역할**을 받는다. `to authenticated`로 쓴 기존 RLS 정책이 모두 익명에게 열린다.
    정책마다 `(auth.jwt()->>'is_anonymous')::boolean is false` 조건이 필요한지 다시 따져야 한다.
  - 계정을 무한히 만들 수 있다(Sybil). Supabase 권장대로 CAPTCHA(Turnstile 등)와 IP 레이트리밋을 붙여야 한다.
  - 버려진 익명 계정이 `auth.users`·`users`에 계속 쌓인다. 주기적인 정리 배치가 필요하다.
  - 카카오 전환: `linkIdentity`는 Manual Linking을 켜야 하고, **이미 가입된 카카오 계정이면 연결에 실패**한다.
    그 경우 결국 "익명 계정 → 기존 계정" 병합 경로가 필요해서 A안의 merge와 같은 일이 생긴다.

**권장**: 개인 기능(좋아요·저장·부를 곡·검색 기록)은 **A안**으로 넓힌다.
B안은 아래 포인트 정책에서 서버 쪽 상태가 꼭 필요하다고 판단될 때만 도입한다.
B안을 넣으면 RLS 전수 점검과 정리 배치가 같이 따라와서 비용 대비 이득이 작다.

### 포인트 투표와 익명 사용자

순위의 신뢰도는 "포인트 하나 = 사람 하나가 쌓은 것"이라는 전제에 달려 있다.
익명 계정은 공짜로 무한히 만들 수 있어서, 익명 포인트가 순위에 들어가면 이 전제가 무너진다.
그래서 원칙은 **"익명은 순위에 영향을 주지 않는다"** 이다. 정할 것은 그 안에서 얼마나 참여감을 줄지다.

| 안 | 익명이 할 수 있는 것 | 위조·남용 | 구현 |
| --- | --- | --- | --- |
| 1. 열람만 | 랭킹·득표 파이 보기. 투표 버튼은 로그인 유도 | 없음 | 거의 없음 (현재 상태) |
| 2. 적립 보류 | 출석 포인트를 "보류 포인트"로 쌓고, 가입하면 **상한 안에서** 이전 | localStorage면 위조 가능 → 상한으로 피해를 막음 | A안 + merge 확장 |
| 3. 게스트 투표 별도 집계 | 투표는 하되 "게스트 응원"으로 따로 표시하고 순위에는 반영하지 않음 | 숫자 부풀리기 가능 (표시용이라 피해 작음) | B안이 필요하거나 별도 익명 테이블 |

**권장: 1 + 2.** 투표는 로그인 사용자만 한다. 익명은 출석으로 보류 포인트를 쌓고 가입할 때 가져간다.
- 이전 상한은 출석 7일치(210P) 정도를 제안한다. 보류 포인트는 위조할 수 있다는 전제로 정한 값이다.
- 카카오 계정 하나당 이전은 **한 번**만 허용한다(`users`에 `guest_points_merged_at` 같은 기록).
  남용 방지의 기준점이 카카오 계정이 되게 하려는 것이다.
- `monthly_artist_rankings.top_voter_user_id`, 투표자 목록(`rankings/[month]/[artist]/voters`)에는 익명이 들어갈 수 없다.
  1+2안이면 자연히 지켜진다.

### 먼저 고쳐야 하는 것 (익명 도입 전 차단 요소)

포인트 무결성 문제가 이미 있다. 익명을 열면 남용 경로가 넓어지니 먼저 막아야 한다.
별도 이슈 `20261113-0104-point-integrity`로 분리했다.

## 완료 조건

- [ ] 개인 기능 범위 결정: 좋아요·저장 폴더를 A안(로컬)으로 넓힐지
- [ ] 포인트 투표 정책 결정: 1 / 1+2 / 3 중 선택. 2라면 이전 상한과 1회 제한 확정
- [ ] B안(Anonymous Sign-in)을 쓸지 최종 판단. 쓴다면 RLS 전수 점검·CAPTCHA·정리 배치를 하위 이슈로 등록
- [ ] 선행 이슈 `20261113-0104-point-integrity` 완료
- [ ] 결정에 따라 구현 이슈 분리 등록

## 로그

- 2026-11-13: 등록. 현재 인증 경계 조사, A/B안과 포인트 정책 1~3안 정리
