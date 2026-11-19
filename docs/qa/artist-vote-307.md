# #307 이달의 아티스트 — 실데이터 QA 체크리스트

이슈: `docs/issues/20261027-1007-artist-vote-307-followups.md`

카카오 로그인이 필요해 투표 흐름은 자동 검증이 안 된다. 아래 "자동으로 확인한 것"은 로그인 없이
확인 가능한 부분이고, "직접 확인할 것"은 사용자가 브라우저로 돌린다.

## 자동으로 확인한 것 (2026-11-19)

### 1. GitHub Actions secret — `finalize_artist_of_month.yml`

- 워크플로가 참조하는 secret은 `SUPABASE_URL`, `SUPABASE_KEY` 두 개. 다른 크롤링 워크플로 7개가 쓰는 이름과 같다.
- 성공한 scheduled run이 있다. 두 step(확정, 사진 백필) 모두 Supabase에 접속해 읽고 썼으므로 **secret은 등록돼 있다**.
  - run `41233232530` (2026-10-31 19:14 UTC = 11-01 04:14 KST) success — `대상 월: 2026-10-01`, `투표 수: 1건`,
    `확정 완료 — 1명 저장`, `시상대: 1위 크라잉넛(50P)`. 사진 백필: `최근 확정 월 상위 3명: 크라잉넛`, `사진이 비어 있는 아티스트: 0명`
  - run `41342340455` (2026-11-01 19:33 UTC) success — 같은 결과(멱등 재확정)
  - 11-02, 11-03, 11-04 run도 success
- **문제: 2026-11-05부터 모든 워크플로가 실패한다** (finalize run 71~84, `crawl_recent_tj`, `update_ky_youtube`,
  `translation_jpn`, `verify_ky_youtube` 전부). job이 3~4초 만에 끝나고 `runner_id: 0`, step 없음, 로그 404 —
  러너가 배정조차 안 된 상태라 코드·secret 문제가 아니다. 계정 단위 원인(Actions 사용량/결제 한도, 결제 수단, Actions
  비활성화 등)일 가능성이 높다. **12-01 전에 풀리지 않으면 11월 확정이 안 돈다.**
  확인 위치: GitHub → Settings → Billing and plans(사용량·Spending limit), 레포 Settings → Actions → General.

### 2. 운영 공개 API (비로그인, `https://www.singcode.kr`)

`singcode.kr`은 `www.singcode.kr`로 307 리다이렉트된다. 모두 HTTP 200.

| 호출                                                       | 결과                                                                                                          | 의미                                                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/artists/search?q=BTS`                            | `JUNG KOOK of BTS` 1건                                                                                        | `artists` select 정책 살아 있음                                                                                            |
| `GET /api/artists/search?q=방탄소년단`                     | `방탄소년단`, `防弾少年団(name_ko 방탄소년단)`                                                                | 〃 (name·name_ko 양쪽 검색 동작)                                                                                           |
| `GET /api/artists/search?q=태연` / `잔나비` / `폴킴`       | 각각 `태연` / `잔나비` / `폴킴` 정확히 존재                                                                   | 사진 초기화 SQL의 이름 확인                                                                                                |
| `GET /api/artists/search?q=아이유`                         | 빈 배열                                                                                                       | DB에 `IU`(name_ko null)로만 있다. 정책 문제 아님 — 아래 참고                                                               |
| `GET /api/artist-vote/rankings`                            | 2026-10-01, 1위 크라잉넛 50P, `artistImage` Deezer URL, `topVoterNickname` 있음. `availableMonths` 08·09·10월 | `monthly_artist_rankings` select 정책 + **`artists(name_ko, image_url)` 임베드 정상(PGRST200 없음)** + `users` 임베드 정상 |
| `GET /api/artist-vote/rankings?month=2026-09-01`           | 1위 ヨルシカ(요루시카) 30P, 사진 있음, wins 2회(08·09월)                                                      | 지난달 조회·우승 별 집계 동작                                                                                              |
| `GET /api/artist-vote/current-winner`                      | `{artist: 크라잉넛, month: 2026-10-01}`                                                                       | 동작                                                                                                                       |
| `GET /api/artist-vote/rankings/2026-10-01/크라잉넛/voters` | `락이좋아 50`                                                                                                 | `artist_votes` select 정책 동작                                                                                            |

참고

- 확정된 달마다 투표가 1건뿐이다(같은 닉네임). 실사용 데이터라기보다 시험 투표로 보인다. 2·3위 액자, 득표 파이는 실데이터로 아직 확인되지 않았다.
- "아이유" 검색 0건: `artists.name = 'IU'`, `name_ko`가 비어 있다. `artistAlias`에도 없다. 검색 품질 문제로 따로 다룰 일이다.
- `current-winner` API와 `useCurrentArtistOfMonthQuery`는 남아 있지만, 곡 카드 배지는 `f17023d`에서 제거돼 화면에서 쓰는 곳이 없다. QA 대상에서 뺀다.

## 직접 확인할 것

> **투표 QA는 PR #352(`fix/point-integrity`)의 SQL 실행 + 배포 이후에 (다시) 한다.**
> 그 PR이 `PUT /api/artist-vote`를 원자적 RPC `cast_artist_vote`로 바꾼다. 지금 라우트로 확인해도 배포 후 다시 봐야 한다.

준비: 카카오 로그인, 보유 포인트가 있는 계정. 시작 전 보유 포인트를 적어둔다.

### A. 검색 자동완성 (/vote → 이달의 아티스트 탭)

- [ ] `방탄`, `크라잉`, `BTS` 입력 → 후보가 뜬다
  - 실패(빈 목록): 로그인 상태에서만 비면 `authenticated` 역할 정책이 빠진 것. `artist-vote-schema.sql` 재실행(멱등)
- [ ] 원어 표기 아티스트(예: `ヨルシカ`)가 한국어 이름(`요루시카`)으로도 잡힌다

### B. 투표 (포인트 차감)

- [ ] 아티스트 하나에 10P 투표 → 성공 토스트, 보유 포인트 −10
  - `존재하지 않는 아티스트입니다.`(400): 자동완성 결과가 아닌 이름. `artists.name`과 정확히 일치해야 한다
  - 500: Vercel 로그에서 `PUT artist-vote` 확인. RLS(insert/update) 정책 누락이면 `42501`
- [ ] 같은 아티스트를 30P로 올림 → 추가로 −20만 차감(총 −30)
- [ ] 10P로 내림 → +20 환불
- [ ] 0P로 → 행 삭제, 전액 환불(시작 포인트로 복귀)
- [ ] 보유보다 큰 값 → `포인트가 부족합니다. 필요: …P, 보유: …P`, 포인트 변화 없음
- [ ] 포인트 내역(마이페이지)에 `아티스트 투표: … (+NP)` / `아티스트 투표 조정: … (−NP)`가 금액대로 남는다
- [ ] 새로고침 후에도 "내 투표"(`/api/artist-vote/my-current`)에 같은 금액이 보인다
- [ ] (PR #352 이후) 빠르게 여러 번 눌러도 포인트가 금액보다 더 빠지지 않는다

### C. 월간 확정 (다음 달 1일 이후)

- [ ] **선행: GitHub Actions가 다시 도는지 확인** (위 1번 — 11-05부터 전부 실패 중)
- [ ] 12-01 이후 `Finalize Artist of the Month` run 로그에 `대상 월: 2026-11-01`, `확정 완료 — N명 저장`, `시상대: …`
  - `투표가 없어 종료합니다`: 11월 투표가 0건. 기존 순위는 그대로 둔다(정상)
- [ ] 같은 run의 사진 백필 로그 `결과 — 채움: N명`. `사진 못 찾음`은 Deezer에 정품 등록이 없는 경우(액자는 이니셜 폴백)
- [ ] 수동 실행이 필요하면 Actions → Finalize Artist of the Month → Run workflow (`workflow_dispatch` 지원)

### D. 랭킹 화면

- [ ] 월 선택기에 11월이 추가되고 기본 선택된다
- [ ] 1위 금 액자, 2·3위 황동 액자, 사진 또는 이니셜 폴백
  - 화면이 통째로 에러이고 Vercel 로그에 `PGRST200`: `artists` 임베드의 FK를 못 찾은 것 → `artists!<fk_name>(name_ko, image_url)` 힌트 문법으로 명시. (2026-11-19 운영 응답에서는 정상)
- [ ] 1~10위 득표 파이, 카드 위 우승 별 개수가 과거 1위 횟수와 일치
- [ ] 카드의 득표자 목록이 열린다. 아직 확정 안 된 이번 달 아티스트는 404(`확정되지 않은 아티스트입니다.`)로 가려진다

### E. 태연·잔나비·폴킴 사진

`apps/web/artist-image-reset.sql` 참고. 결정 후 실행.
