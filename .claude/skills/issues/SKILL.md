---
name: issues
description: 레포 안 파일(docs/issues/*.md)로 할 일을 관리한다. 사용자가 할 일을 추가·조회·완료·우선순위 변경하라고 하거나, "나중에 할 일", "TODO", "이슈 등록", "남은 작업"을 말할 때, 그리고 작업 중 현재 범위 밖의 버그·개선점·정리할 것을 발견했을 때 사용한다. 세션 시작 훅이 열린 이슈 목록을 보여준다.
---

# issues — 파일 기반 이슈 관리

외부 트래커(Notion, GitHub Issues)는 쓰지 않는다. 모든 상태는 `docs/issues/<id>.md` 파일이고, git으로 머신 간에 동기화한다. 포맷 상세는 `docs/issues/README.md`.

## 규칙

- **이슈 하나 = 파일 하나.** 여러 머신에서 동시에 추가해도 충돌하지 않게 한 파일에 몰아 쓰지 않는다.
- **id는 `YYYYMMDD-HHmm-<kebab-slug>`.** 순번(001, 002)은 쓰지 않는다. 시각은 지금(KST) 기준이고 파일명도 `<id>.md`로 같게 한다.
- **파일은 삭제하지 않는다.** 완료는 `status: done`으로 바꾸고 로그에 한 줄 남긴다.
- **비밀값은 절대 기록하지 않는다.** `.env` 값, 토큰, 키, 개인 URL은 이슈 본문·로그 어디에도 쓰지 않는다.

## 언제 무엇을 하나

| 상황 | 동작 |
| --- | --- |
| 사용자가 할 일을 추가하라고 함 | 새 파일을 만든다. 상태는 사용자가 정하지 않았으면 `todo`. |
| 작업 중 **범위 밖** 문제 발견 | **고치지 말고** `status: later`로 기록한 뒤, 사용자에게 한 줄로 알리고 원래 작업을 계속한다. |
| 사용자가 이슈에 착수 | `status: doing`으로 바꾸고 로그를 남긴다. |
| 완료 조건을 충족 | 체크리스트를 체크하고 `status: done`, 로그에 한 줄. |
| 목록 조회 | `node .claude/skills/issues/list-issues.mjs` 를 실행해 보여준다. |

"범위 밖"이란 지금 요청받은 일과 별개의 문제다. 요청을 이루는 데 필수인 수정은 범위 안이므로 이슈로 미루지 않는다.

## 커밋과 push

- 이슈 파일 변경은 **관련 코드 변경과 같은 커밋**에 넣는다.
- 이슈만 바뀐 경우 `chore(issues): <설명>` 형식으로 따로 커밋한다.
- **push는 하지 않는다.** 세션을 마무리할 때 push할지 사용자에게 묻는다.

## 이슈 파일 한눈에

```markdown
---
id: 20261026-2300-ig-post-script
title: 인스타그램 게시 스크립트 작성
status: later
priority: medium
created: 2026-10-26
external:
---

## 맥락
## 완료 조건
- [ ] ...
## 로그
- 2026-10-26: 등록
```

`status`는 `todo | doing | later | done`, `priority`는 `high | medium | low`. `external`은 비워 둔다.

## 세션 시작 훅

`list-issues.mjs`가 SessionStart에서 돌아 done을 제외한 이슈를 `doing → todo → later`, 그다음 priority 순으로 출력한다. 형식이 깨진 파일은 목록에서 빼고 끝에 "형식 오류"로 알린다. upstream보다 뒤처졌으면 경고만 하고 자동 pull은 하지 않는다. 경고가 보이면 사용자에게 pull할지 묻는다.
