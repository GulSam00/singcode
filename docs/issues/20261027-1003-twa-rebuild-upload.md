---
id: 20261027-1003-twa-rebuild-upload
title: TWA 재빌드와 Play Console 업로드
status: todo
priority: high
created: 2026-10-27
external:
---

## 맥락

minSdkVersion 24, 버전 16 변경(#343)이 develop에 머지됐다. Play Console이 minSdk 21을 거부해서 올린 수정이다.
`pnpm --filter twa run update`는 versionCode를 올리므로 한 번만 실행한다. 재생성 확인에는 Yes로 답한다. 업로드 결과는 아직 확인하지 못했다.

## 완료 조건

- [ ] `pnpm --filter twa run update` 후 `build:android` 로 AAB 생성
- [ ] Play Console 업로드 성공 확인

## 로그

- 2026-10-27: 등록
