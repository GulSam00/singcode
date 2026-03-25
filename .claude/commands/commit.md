# /commit — Commit

Git 커밋 규칙에 따라 커밋 메시지를 생성하고 커밋한다.

## Steps

1. 현재 브랜치 이름을 확인한다.

   ```
   git branch --show-current
   ```

2. 브랜치 이름에서 이슈 번호를 추출한다.
   - 규칙: `<type>/` 이후 첫 번째 숫자
   - 예: `feat/42-addSearchFilter` → `42`

3. `gh issue view <번호> --json title,body,labels` 로 이슈를 조회해 맥락을 파악한다.

4. `git diff --staged` 또는 `git diff HEAD` 로 변경 내용을 확인한다.
   - 변경 내용을 기반으로 커밋 메시지를 한국어로 작성한다.
   - 사용자에게 확인을 구하지 않는다.

5. 커밋 메시지 포맷:

   ```
   <type> : 변경 내용 요약 (한국어) (#이슈번호)
   ```

   예: `feat : 검색 필터 API 연동 (#42)`

6. 스테이징 및 커밋 실행:

   ```
   git add -A
   git commit -m "<type> : 변경 내용 요약 (#이슈번호)"
   ```

7. 완료 후 출력:
   ```
   ✅ 커밋 완료: <type> : 변경 내용 요약 (#이슈번호)
   ```

## Notes

- `git push` 는 명시적으로 요청받았을 때만 실행한다.
- `commit all` 명령 시 이 플로우를 즉시 실행한다.
- /verify 를 통과하지 않은 상태에서 커밋 요청 시
  "/verify 를 먼저 실행하세요." 를 출력하고 중단한다.
