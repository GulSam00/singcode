# /start — Start Task

작업 설명을 받아 GitHub Issue를 생성하고, 해당 브랜치로 체크아웃한다.

## Input

`$ARGUMENTS` — 작업 설명 (자연어)

예: `/start 검색 결과에 페이지네이션 추가`

## Steps

1. `$ARGUMENTS` 를 분석해 아래 항목을 결정한다.

   **`$ARGUMENTS` 가 비어 있는 경우:**
   `git diff` 와 `git status` 로 현재 변경 사항을 파악하고,
   변경 내용을 기반으로 작업 유형, 이슈 제목, 이슈 본문을 자동으로 결정한다.
   - **작업 유형**: `feat` | `fix` | `hotfix` | `chore` | `refactor` | `doc`
   - **이슈 제목**: 한국어, 간결하게
   - **이슈 본문**: 구현할 내용을 bullet으로 정리
   - **라벨**: 작업 유형에 맞는 라벨 (없으면 생략)

2. GitHub Issue를 생성한다.

   이슈 본문은 아래 구조로 작성한다:
   - 작업 개요 설명 (1~3줄)
   - `## 작업 체크리스트` 섹션: 구현할 항목을 GitHub Flavored Markdown checkbox(`- [ ]`)로 나열
   - 완료된 항목은 `- [x]`로 표시 (이슈 생성 시점엔 모두 `- [ ]`)

   ```
   gh issue create --title "<이슈 제목>" --body "<이슈 본문>"
   ```

   생성된 이슈 번호를 추출한다.

   작업이 진행되면서 항목이 완료될 때마다 아래 명령으로 이슈 본문을 갱신한다:

   ```
   gh issue edit <번호> --body "<갱신된 본문>"
   ```

3. develop 브랜치를 최신으로 갱신한다.

   ```
   git checkout develop
   git pull origin develop
   ```

4. 작업 브랜치를 생성하고 체크아웃한다.
   - 브랜치 형식: `<type>/<issue-number>-<camelCaseName>`
   - camelCaseName은 이슈 제목에서 핵심 키워드를 추출해 작성한다.

   ```
   git checkout -b <type>/<issue-number>-<camelCaseName>
   ```

5. 완료 후 아래 형식으로 출력한다.

---

## 🚀 작업 시작

**이슈**: #<번호> — <제목>
**브랜치**: `<type>/<issue-number>-<camelCaseName>`
**유형**: <작업 유형>

### 👉 다음 단계

| 명령어   | 설명                  |
| -------- | --------------------- |
| `/spsc`  | 작업 범위 정의 (권장) |
| `/red`   | 테스트 먼저 작성      |
| `/green` | 바로 구현 시작        |

### 🔄 워크플로우 사이클

```
일반:  /start → /spsc → /red → /green → /refactor → /verify → /commit → /pr
단축:  /start → /spsc → /green → /verify → /commit → /pr
```

- `/red` ~ `/refactor` 사이클은 상황에 따라 생략 가능하다.
- `/verify` 와 `/commit` 은 항상 실행한다.
- 긴급 핫픽스: `/spsc` → `/green` → `/verify` → `/commit` 단축 사이클 허용.

---

## Notes

- `$ARGUMENTS` 가 비어 있으면 현재 변경 사항(`git diff`, `git status`)을 분석해 자동으로 판단한다.
- 이슈 생성 실패 시 에러 메시지를 출력하고 중단한다.
