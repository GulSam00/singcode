# 🎵 Singcode

노래방만 가면 뭘 부르려고 했었지 하면서 부를 곡들을 잊어버린다면. <br/>
매번 인터넷에서 노래방 번호를 검색해야 했었다면. <br/>
내가 어떤 노래를 가장 많이 불렀는지 궁금하다면. <br/>

Singcode는 당신만의 노래 리스트를 만들고, 좋아하는 곡을 저장하고, 부른 기록까지 남길 수 있는 서비스를 제공합니다.  <br/>
Supabase를 활용한 자체 DB를 통해 금영, TJ 노래방의 번호를 한 눈에 확인할 수 있습니다.

---

## 📚 기술 스택

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js)
![Zustand](https://img.shields.io/badge/Zustand-FFAD00?style=for-the-badge&logo=Zustand)
![React Query](https://img.shields.io/badge/React_Query-1F4154?style=for-the-badge&logo=react-query)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-142351?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-323232?style=for-the-badge&logo=Supabase)
![Turborepo](https://img.shields.io/badge/Turborepo-5A29E4?style=for-the-badge&logo=turborepo)

---

## 📁 프로젝트 구조

```
sing-code/
├── apps/                   # 실제 서비스 앱이 위치하는 디렉토리
│   └── web/                # 웹 애플리케이션 (Next.js)
├── packages/               # 앱에서 공통으로 사용하는 패키지 모음
│   ├── crawling/           # DB에 입력 데이터 크롤링 패키지
│   ├── open-api/           # 노래방 번호 제공하는 OPEN API 모듈 패키지 (국내 곡 한정)
│   ├── query/              # 공통 query 패키지
│   ├── eslint-config/      # eslint 설정 패키지
│   ├── typescript-config/  # tsconfig 설정 패키지
│   └── ui/                 # 공통 UI 컴포넌트 패키지
├── turbo.json              # Turborepo 설정 파일 (build, format 같은 스크립트 정의)
├── pnpm-workspace.yaml     # pnpm 워크스페이스 설정 파일 (패키지 정보)
├── package.json            # 루트 패키지 관리 파일
└── 기타 설정 파일들        # .gitignore, .prettierrc.json, LICENSE 등

```

## 📦 배포
(배포된 링크들을 작성)

## ✨ 주요 기능
(스크린샷과 함께 어떤 기능이 있는지 설명)

## 📖 프로젝트 기록
(작업 기간이 얼마나 걸렸고 어떤 과정들이 있었는지 기술)

## 📝 회고
해결하고자 했던 문제
(어떤 문제를 해결하고 싶었는지)

무엇을 얻었는지
(프로젝트를 통해 배운 점과 느낀 점)



## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
...
