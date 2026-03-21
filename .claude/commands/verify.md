# /verify — Verify Phase

머지 전 전체 품질을 검증한다. 실패 시 자동으로 수정하고 재실행한다.

## Steps

아래 커맨드를 순서대로 실행한다.
각 단계가 실패하면 즉시 수정하고 재실행한다.
사용자에게 확인을 구하지 않고 자동으로 처리한다.

1. **Type check**

   ```
   pnpm build
   ```

   실패 시: TypeScript 에러를 수정한다.

2. **Lint**

   ```
   pnpm lint
   ```

   실패 시: ESLint 에러를 수정한다. `eslint-disable` 주석으로 우회하지 않는다.

3. **Format**

   ```
   pnpm format
   ```

4. **Unit test**

   ```
   pnpm test
   ```

   실패 시: 실패한 테스트를 분석하고 구현 코드를 수정한다.
   테스트를 삭제하거나 skip 처리하지 않는다.

5. 모든 단계 통과 후 아래 형식으로 출력한다.

---

## ✅ Verify 완료

| 단계       | 결과        |
| ---------- | ----------- |
| Type check | ✅          |
| Lint       | ✅          |
| Format     | ✅          |
| Test       | ✅ N개 통과 |

### 👉 다음 단계

| 명령어    | 설명          |
| --------- | ------------- |
| `/commit` | 커밋 실행     |
