# /spsc — Spec & Scope

주어진 GitHub Issue 번호를 기반으로 작업 범위를 정의한다.

## Steps

1. `gh issue view <번호> --json title,body,labels,assignees,milestone` 로 이슈 상세를 조회한다.
   - 체크리스트(task list)가 있으면 하위 작업 목록도 함께 확인한다.

2. 아래 형식으로 작업 범위를 출력한다.

---

## 📋 Spec & Scope — #{ISSUE-NUMBER}

**이슈 제목**: (원문)
**작업 유형**: Feature | Bugfix | Refactor | Chore

### 구현 범위

- (구체적인 작업 항목 bullet)

### 변경 예상 파일

- `src/features/.../` — (이유)
- `src/shared/.../` — (이유)

### 범위 외 (이번 작업에서 하지 않는 것)

- (명시적으로 제외할 항목)

### 완료 기준

- [ ] (체크리스트 형태)

---

3. 출력 후 "이 범위로 진행할까요?" 라고 확인을 구한다.
   - 승인 시 작업 브랜치를 생성한다.
     - 브랜치 형식: `<type>/<issue-number>-<camelCaseName>`
     - type 매핑: Feature → `feat`, Bugfix → `fix`, Refactor → `refactor`, Chore → `chore`
     - 예: `feat/42-addSearchFilter`
     - develop 브랜치에서 분기한다.
   - 이후 아래 다음 단계 안내를 출력한다.

### 👉 다음 단계

| 명령어    | 설명                         |
| --------- | ---------------------------- |
| `/red`    | 실패 테스트 먼저 작성 (TDD)  |
| `/green`  | 바로 구현 시작               |

> `/red` ~ `/refactor` 사이클은 생략 가능. `/verify` → `/commit` 은 필수.
