---
id: 20261027-1009-remove-check-review-command
title: check-review 커맨드와 문서 항목 정리
status: done
priority: low
created: 2026-10-27
external:
---

## 맥락

Qodo는 비용 문제로 더 쓰지 않는다. `.claude/commands/check-review.md`가 아직 남아 있고, 루트 `CLAUDE.md`의 Workflow Commands 표와 `/pr` 설명("Qodo AI 리뷰 요청")에도 Qodo가 언급돼 있다.

범위 정정(2026-11-04): 등록 당시 적은 것과 달리 `.claude/commands/pr.md`의 Qodo 단계(설명, 7단계 Qodo 댓글 작성, "Qodo AI 리뷰 요청" 출력 섹션, 실패 처리 메모)는 제거되지 않은 상태였다. 단축 사이클의 `/review-brief`(존재하지 않는 커맨드) 줄과 `.github/pull_request_template.md`의 주석 처리된 Qodo 명령어 블록도 함께 정리 대상에 넣었다.

## 완료 조건

- [x] `check-review.md` 삭제
- [x] 루트 `CLAUDE.md` 표와 단축 사이클에서 Qodo·check-review 언급 제거
- [x] `.claude/commands/pr.md`에서 Qodo 단계·섹션 제거
- [x] `.github/pull_request_template.md`의 Qodo 명령어 주석 제거

## 로그

- 2026-10-27: 등록
- 2026-11-04: check-review.md 삭제, pr.md·CLAUDE.md·PR 템플릿의 Qodo/check-review/review-brief 언급 제거. 완료
