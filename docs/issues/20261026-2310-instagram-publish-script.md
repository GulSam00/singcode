---
id: 20261026-2310-instagram-publish-script
title: 인스타그램 신곡 이미지 게시 스크립트 작성
status: later
priority: medium
created: 2026-10-26
external:
---

## 맥락

신곡 이미지 생성(`packages/crawling`의 `ig-recent-images`)은 develop에 들어갔다. 이미지를 Instagram Graph API로 게시하는 단계가 남았다.
API는 JPEG와 공개 이미지 URL을 요구하므로 Supabase Storage 공개 버킷이 먼저 필요하다. Meta 앱과 토큰 설정은 직접 해야 한다.

## 완료 조건

- [ ] Supabase Storage 공개 버킷 생성
- [ ] 이미지 업로드 후 Instagram API로 게시하는 스크립트
- [ ] 3일 주기 GitHub Actions 워크플로우 (번역 배치 19:00 KST 이후)
- [ ] 게시 캡션·해시태그 문구 확정

## 로그

- 2026-10-26: 등록
