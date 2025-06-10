# 🎵 Singcode

[Singcode - 당신의 노래방 메모장](https://www.singcode.kr)


노래방만 가면 뭘 부르려고 했었지 하면서 부를 곡들을 잊어버린다면. <br/>
매번 인터넷에서 노래방 번호를 검색해야 했었다면. <br/>
내가 어떤 노래를 가장 많이 불렀는지 궁금하다면. <br/>

Singcode는 당신만의 노래 리스트를 만들고, 좋아하는 곡을 저장하고, 부른 기록까지 남길 수 있는 서비스를 제공합니다.  <br/>
Supabase를 활용한 자체 DB를 통해 금영, TJ 노래방의 번호를 한 눈에 확인할 수 있습니다.

<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">

![프로젝트 썸네일1](https://github.com/user-attachments/assets/dd6ce355-d961-4075-984b-a2d500f3d852)
![프로젝트 썸네일2](https://github.com/user-attachments/assets/e4d3fb2c-7bee-48fd-b73c-eb833f48f1e0)
![프로젝트 썸네일3](https://github.com/user-attachments/assets/133bb11e-18e6-47f3-ab86-6ef1fb2865c1)


</div>


---


## 📦 배포
[Singcode - 당신의 노래방 메모장](https://www.singcode.kr)

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

### 디렉토리 구조

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
### Supabase DB 구조

<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">

![supabase DB](https://github.com/user-attachments/assets/a5130f5e-c4bd-419e-b1d5-a9f217b456f7)

</div>


## ✨ 주요 기능

### 검색 페이지
* 제목, 가수 이름으로 곡을 검색할 수 있습니다.

<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
  
![검색-곡추가](https://github.com/user-attachments/assets/c9636b94-f07a-4841-8f88-5c8c9d99a9fe)

</div>

 ### 검색 페이지 - 재생목록으로 저장
 
* 기존 재생목록이나 새로운 재생목록에 곡을 저장할 수 있습니다.

<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">

![검색-재생목록 저장1](https://github.com/user-attachments/assets/8a747aff-2a32-44f6-b144-4f280a0a72f7)
![검색-재생목록 저장2](https://github.com/user-attachments/assets/5ab8ee4c-c62b-46cb-92c2-e90689fec987)

</div>

### 부를 곡 페이지

* 자신이 저장한 부를 곡을 조회합니다.
* 부를 곡의 순서를 바꿀 수 있습니다.
* 곡을 부르거나, 부르지 않고 삭제할 수 있습니다.
  
<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">

![부를곡](https://github.com/user-attachments/assets/8f36e52a-64b1-4d75-b386-031306310ffd)

</div>

* 좋아요 표시한 곡이나 재생목록에 저장한 곡, 최근 부른 곡 중에서 부를곡을 추가할 수 있습니다.


<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">

![부를곡-모달추가1](https://github.com/user-attachments/assets/1c17666c-57db-4d48-8ad5-e9f402d2667b)
![부를곡-모달추가2](https://github.com/user-attachments/assets/ae4c71aa-068a-4862-8e12-78bc29bd150a)

</div>


### 인기곡 페이지

* 모든 사용자들이 노래 부른 곡 순위나, 좋아요 한 곡 순위를 집계하여 보여줍니다.

<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">

![인기곡-통계](https://github.com/user-attachments/assets/750ba410-ce3e-4c98-a191-bb8f9cf6e62d)
![인기곡-좋아요](https://github.com/user-attachments/assets/59d98e20-a735-4c52-8ed2-bc8ee9418a3f)

</div>


### 라이브러리 페이지

* 자신의 활동 기록을 조회 및 관리할 수 있습니다.
* 좋아요 한 곡들을 조회하고 일괄 삭제할 수 있습니다.
* 자신이 가장 많이 부른 곡의 순위를 확인할 수 있습니다.

<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
  
![라이브러리](https://github.com/user-attachments/assets/8bae1b21-387d-47e0-b394-8e576a6816fb)
![라이브러리-부른곡 통계](https://github.com/user-attachments/assets/93f38c68-5ab4-4be8-9efa-3840ff053834)
![라이브러리-재생목록 관리](https://github.com/user-attachments/assets/668acd87-f78b-4f15-8d05-8aeefd640ff6)
![라이브러리-좋아요 관리](https://github.com/user-attachments/assets/e681e512-c9cb-4f2f-b0fb-7640b6c5d935)

</div>

### 로그인 & 회원가입 지원

* Supabase DB에 사용자 아이디를 외래키로 하여 데이터를 저장 및 관리하기에 모든 서비스는 회원가입이 필수입니다.
* 이메일 인증 회원가입과 카카오 회원가입을 지원합니다.
  
<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">

![로그인](https://github.com/user-attachments/assets/72674739-f85a-42d6-8b8f-c1003b6fd896)
![회원가입](https://github.com/user-attachments/assets/653b05a1-126d-423a-8bd6-fca8e4c40e25)

</div>


## 📖 프로젝트 기록

- 2025.03.12 : 프로젝트 시작
- 2025.4.24 : 버전 1.0 배포. MVP 버전 완성. (부를 곡, 검색, 라이브러리)
- 2025.4.27 : ChatGPT API 활용 일본어 곡 번역 시도, cheerio 및 puppeteer를 활용해서 국내곡 데이터 추가
- 2025.5.7 : TJ 협업 요청 거절 답변 착신.
- 2025.5.10 : DB 초기화 후 OPEN API의 TJ 기준으로 세팅.
- 2025.5.11 : 버전 1.2.0 배포. 인기곡 페이지 추가.
- 2025.5.13 : puppeteer, cheerio 활용 금영 데이터 업데이트
- 2025.5.23 : 버전 1.3.0 배포. 재생목록 저장 기능 추가, 인기곡 페이지 데이터 산정 방식 개선
- 2025.5.24 : 버전 1.4.0 배포. 재생목록을 통해 부를 곡 등록 기능 추가. kr 도메인 구매 및 vercel 서브 도메인 연결.
- 2025.5.25 : SEO 개선, sitemap 추가, debounce로 중복 요청 처리
- 2025.5.27 : 로고 수정, sitemap 수정
- 2025.6.7 : 한글 유니코드 순회하면서 OPEN API 통해 DB 추가. TJ 사이트 최신곡 크롤링 업데이트. 무한 스크롤 도입.
- 2025.6.8 : 버전 1.5.0 배포.
- 2025.6.10 : 기존 puppeteer로 금영노래방 유튜브 채널 브라우저 스크래핑하여 KY 노래방 8000 개 가량 업데이트

## 📝 회고

### 해결하고자 했던 문제

- 기존 유사한 서비스에서는 하나의 곡을 검색할 때 TJ, 금영 API로 따로따로 곡 데이터를 요청하기에 기존 방식으로는 데이터를 관리하기가 어려웠습니다.
    - Supabase로 자체 DB를 구축하고, OPEN API와 puppeteer, cheerio를 활용한 웹 크롤링을 통해 데이터를 파싱하여 DB에 넣어주었습니다.
    - OPEN API에 의존하지 않고, 목적에 맞게 활용할 수 있는 자체 API를 구성할 수 있었습니다.
- 52000개가 넘는 DB 테이블에서 모든 검색 결과를 한번에 제공하고 있어서 검색 응답 속도가 굉장히 길었습니다.
    - 검색 기능에 Tanstack Query의 useInfiniteQuery를 활용한 무한 스크롤을 도입하여, 페이지 단위의 데이터를 점진적으로 불러오도록 구현했습니다.
    - 초기 로딩 속도를 크게 감소시켰고, 사용자 경험을 크게 향상시켰습니다.
- 검색 결과로 렌더링된 곡 컴포넌트에서 이벤트에 따라 UI를 동적으로 변경해야 했으나, 단 하나의 속성값 변경을 위해 매번 queryKey를 무효화하고 전체 데이터를 다시 요청하는 방식은 기술적으로도, 사용자 경험 측면에서도 불필요했습니다.
    - `Tanstack Query`의 낙관적 업데이트를 도입하여, UI가 변경해야 하는 이벤트 발생 시 즉각적으로 UI가 변경되도록 최적화하였습니다.
    - 로딩 없이 즉시 변경되는 UI를 사용자에게 보여주며 사용자 경험을 크게 개선했습니다.
- 하나의 mutation 요청에 의존하는 side effect(노래를 불렀을 때 의존하는 여러 queryKey 무효화, log 증가 mutation 호출)가 많았기에, 빠르게 여러 mutation을 호출할수록 요청 처리가 늦어지고 timeout이 나오기도 하였습니다.
    - mutation 함수에 debounce를 도입하여 짧은 시간 내 많은 요청 시 queryKey를 한 번만 무효화시키게 처리하였습니다.
    - Supabase에서 제공하는 Database Functions과 Trigger를 적절하게 활용하여 클라이언트의 요청 응답 속도를 줄였습니다.
- POST, DELETE, PATCH 요청 때마다 DB와 클라이언트 간의 데이터를 동기화해줘야 했습니다.
    - Zustand의 store action으로 제어해보려고 하였으나, 한계를 느끼고 Tanstack Query를 도입하였습니다.
    - DB의 변동이 생길 시 queryKey를 무효화시켜 최신 DB 데이터를 가져올 수 있게끔 하였습니다.
- API 요청 시 Supabase DB의 정보가 노출될 위험이 있었습니다.
    - Next.js의 API Route를 활용하여 서버리스 API를 구축하고 외부 API의 URL을 감췄습니다.
  
### 무엇을 얻었는지

- Turborepo를 활용하면서 모노레포의 이해를 높이고 프로젝트에 어떻게 적용하고 확장해야 하는지에 대해 익혔습니다.
- DMS인 Supabase를 통해 DB를 직접 구축하면서 DB Table 구조에 대한 개념을 익혔습니다.
- react query를 도입하며 쿼리 키를 활용한 낙관적 업데이트, 데이터 캐싱에 대한 이해를 높였습니다.
- 프로젝트의 기획, 개발, 홍보를 총괄하면서 실사용자가 있는 서비스를 운영하는 경험을 통해 프로젝트의 전체적인 흐름과 문제 해결 능력을 익혔습니다.
- Google Analytics, Hotjar,  Posthog를 활용하여 사용자의 행동을 분석해 사용자 경험과 전환율을 개선함과 동시에 각 모니터링 툴의 특징을 파악할 수 있었습니다. 특히 Hotjar와 Posthog에서 제공해주는 세션 리플레이를 통해 어떤 부분에서 개발한 의도가 사용자들에게 제대로 전달되지 않는 지를 확인할 수 있었습니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
