---
id: 20261027-1001-instagram-ky-edition-policy
title: 인스타그램 KY 이미지 방식 결정
status: todo
priority: medium
created: 2026-10-27
external:
---

## 맥락

KY 번호는 신곡의 약 10%만 확인되고, 3일 기간 안에서는 거의 0곡이다(10/16~18 기간은 0곡). 지금 방식(기간 내 신곡 중 KY 번호가 있는 곡만)은 KY 게시물이 대부분 비게 된다.
대안은 "KY 번호가 새로 확인된 곡 모음"(B안)이며, 이 경우 곡의 최초 확인 시점을 추적할 기록 테이블이 필요하다.

## 완료 조건

- [ ] 현행 유지 / B안 중 하나로 결정
- [ ] 결정 내용을 `packages/crawling/CLAUDE.md`에 반영
- [ ] B안이면 추적 방식(기록 테이블 `instagram_posts`·`instagram_post_songs` 포함) 설계

## 로그

- 2026-10-27: 등록
