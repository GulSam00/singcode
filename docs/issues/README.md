# docs/issues

레포 안 파일로 관리하는 이슈 목록이다. 외부 트래커 없이 git으로 머신 간에 동기화한다.
동작 규칙은 `.claude/skills/issues/SKILL.md`를 따른다.

## 규칙

- 이슈 하나는 파일 하나: `docs/issues/<id>.md`. 여러 머신에서 동시에 추가해도 충돌하지 않게 하려는 것이다.
- id는 `YYYYMMDD-HHmm-<kebab-slug>`. 머신 간에 공유하는 순번이 없으므로 순번(001, 002)은 쓰지 않는다. 파일명과 frontmatter의 `id`는 같아야 한다.
- 파일은 삭제하지 않는다. 완료는 `status: done`으로 표현한다.
- 비밀값(.env 값, 토큰)은 기록하지 않는다.

## 포맷

```markdown
---
id: 20261026-2310-instagram-publish-script
title: 인스타그램 이미지 게시 스크립트 작성
status: later
priority: medium
created: 2026-10-26
external:
---

## 맥락

왜 필요한지, 지금 어디까지 알고 있는지.

## 완료 조건

- [ ] 확인 가능한 조건 하나씩

## 로그

- 2026-10-26: 등록
```

| 필드 | 값 |
| --- | --- |
| `id` | `YYYYMMDD-HHmm-<kebab-slug>` (소문자·숫자·하이픈) |
| `title` | 한 줄 제목 |
| `status` | `todo` · `doing` · `later` · `done` |
| `priority` | `high` · `medium` · `low` |
| `created` | `YYYY-MM-DD` |
| `external` | 비워 둔다 (나중에 외부 링크가 필요할 때를 위한 자리) |

본문 섹션은 `맥락` / `완료 조건`(체크리스트) / `로그`(날짜별 한 줄).

## 목록 보기

```bash
node .claude/skills/issues/list-issues.mjs
```

세션을 시작할 때 SessionStart 훅이 같은 스크립트를 실행한다. done은 빼고 `doing → todo → later`, 같은 상태 안에서는 `high → medium → low` 순서로 한 줄씩 보여준다. frontmatter가 깨진 파일은 목록에서 빼고 맨 끝에 "형식 오류"로 알린다.

## 스크립트 타입 검사

앱의 `check-types` 범위 밖이라 따로 돌린다.

```bash
pnpm exec tsc -p .claude/skills/issues
```
