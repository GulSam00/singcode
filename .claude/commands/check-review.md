# /check-review — Qodo Review Brief

현재 브랜치의 PR에서 qodo-code-review 봇이 남긴 리뷰 코멘트를 읽고 이슈를 분류해 브리핑한다.

## Input

`$ARGUMENTS` — PR 번호 (선택). 생략하면 현재 브랜치의 PR을 자동으로 조회한다.

예: `/check-review` 또는 `/check-review 232`

## Steps

1. PR 번호를 결정한다.

   - `$ARGUMENTS` 가 있으면 해당 번호를 사용한다.
   - 없으면 현재 브랜치에서 열린 PR을 조회한다.

   ```
   gh pr view --json number,title,url
   ```

   PR이 없으면 아래 메시지를 출력하고 중단한다.

   ```
   ⛔ 현재 브랜치에 열린 PR이 없습니다.
   `/pr` 로 PR을 먼저 생성하거나, `/check-review <PR번호>` 로 직접 지정하세요.
   ```

2. 레포 오너와 이름을 확인한다.

   ```
   gh repo view --json owner,name
   ```

3. PR의 리뷰 코멘트를 가져온다.

   `mcp__plugin_everything-claude-code_github__get_pull_request_comments` 도구를 사용한다.
   - owner: 위에서 확인한 오너
   - repo: 위에서 확인한 레포 이름
   - pull_number: 위에서 결정한 PR 번호

4. qodo-code-review 봇(`login`에 `qodo` 포함)의 코멘트만 필터링한다.

   동일 이슈가 중복 언급된 경우(영/한 버전 등) 하나로 통합한다.
   통합 기준: 같은 파일 + 같은 이슈 설명 유형. 한국어 버전 우선.

5. 필터링된 코멘트를 아래 기준으로 분류한다.

   | 태그 | 의미 |
   | --- | --- |
   | `🐞 Bug` | 런타임 버그, 크래시, 데이터 불일치 |
   | `📎 Requirement gap` | API 계약/스펙 미준수 |
   | `📘 Rule violation` | 프로젝트 규칙 위반 |
   | `⚠️ Reliability` | 원자성, 동시성, 안정성 문제 |

   우선순위: `🐞 Bug` > `📎 Requirement gap` > `📘 Rule violation` > `⚠️ Reliability`

6. 아래 형식으로 브리핑을 출력한다.

---

## 📋 Qodo Review Brief — PR #<번호>

> **<PR 제목>**

총 **<N>개** 이슈 (중복 제거 후)

---

### 🐞 버그 (<n>건)

**<번호>. <이슈 제목>** — `<파일 경로>`

> <한 줄 요약>

- **원인**: <원인 설명>
- **권장 수정**: <수정 방향>

---

### 📎 Requirement Gap (<n>건)

... (동일 형식)

---

### 📘 Rule Violation (<n>건)

... (동일 형식)

---

### ✅ 조치 완료

이미 현재 세션에서 수정한 이슈가 있으면 여기에 표시한다.
파일 경로와 수정 내용을 기반으로 판단한다.

---

### 👉 다음 단계

우선순위 순서로 대응할 이슈를 나열한다.

| 우선순위 | 이슈 | 파일 |
| --- | --- | --- |
| 1 | <가장 중요한 이슈> | `<파일>` |
| 2 | ... | ... |

---

## Notes

- 코멘트가 없으면 "qodo-code-review 리뷰 코멘트가 없습니다." 를 출력하고 종료한다.
- 중복 코멘트(영/한 동일 이슈)는 하나로 통합한다.
- 이미 수정된 이슈는 "✅ 조치 완료" 섹션으로 분류한다.
