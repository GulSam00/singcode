# /pr — Pull Request

현재 브랜치의 PR을 생성하고 Qodo AI 코드 리뷰를 요청한다.

## Steps

1. 현재 브랜치 이름을 확인한다.

   ```
   git branch --show-current
   ```

2. 브랜치 이름에서 작업 유형과 이슈 번호를 추출한다.
   - 규칙: `<type>/<issue-number>-<camelCaseName>`
   - 예: `feat/42-addSearchFilter` → type=`feat`, issue=`42`

3. `gh issue view <번호> --json title,body,labels` 로 이슈 정보를 조회한다.

4. `git log develop..HEAD --oneline` 과 `git diff develop...HEAD` 로 변경 내용을 파악한다.

5. `.github/pull_request_template.md` 양식에 맞춰 PR 본문을 작성한다.

   ```markdown
   ## 📌 PR 제목

   ### [Type] : 작업 내용 요약

   ## 📌 변경 사항

   - 변경 1
   - 변경 2

   ## 💬 추가 참고 사항

   - 관련 이슈: #<번호>
   ```

   - PR 제목: `[Type] : 작업 내용 요약 (#이슈번호)` (한국어)
   - Type은 브랜치의 작업 유형을 대문자로 (feat → Feat, fix → Fix 등)
   - 변경 사항은 커밋 내역과 diff를 기반으로 bullet 정리

6. PR을 생성한다.

   ```
   gh pr create --base develop --title "<PR 제목>" --body "<PR 본문>"
   ```

   생성된 PR 번호를 추출한다.

7. Qodo AI 코드 리뷰를 위해 댓글을 순서대로 작성한다.

   ```
   gh pr comment <PR번호> --body "/describe"
   gh pr comment <PR번호> --body "/review"
   gh pr comment <PR번호> --body "/improve"
   ```

8. 완료 후 아래 형식으로 출력한다.

---

## 📋 PR 생성 완료

**PR**: #<PR번호> — <PR 제목>
**Base**: `develop` ← `<현재 브랜치>`
**이슈**: #<이슈번호>

### 🤖 Qodo AI 리뷰 요청

- [x] `/describe` — PR 설명 자동 생성
- [x] `/review` — 코드 리뷰
- [x] `/improve` — 개선 제안

**PR 링크**: <PR URL>

---

## Notes

- PR의 base 브랜치는 `develop` 이다.
- 이슈 번호를 추출할 수 없는 경우 이슈 연결 없이 PR을 생성한다.
- PR 생성 실패 시 에러 메시지를 출력하고 중단한다.
- Qodo AI 댓글 실패 시 경고를 출력하되 PR 생성 자체는 성공으로 처리한다.
