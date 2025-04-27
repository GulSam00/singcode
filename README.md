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
[Singcode](https://singcode.vercel.app/)

## ✨ 주요 기능


### 부를 곡 페이지

* 자신이 저장한 부를 곡을 조회합니다.
* 부를 곡의 순서를 바꿀 수 있습니다.
* 곡을 부르거나, 부르지 않고 삭제할 수 있습니다.
  
<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
<img src="https://github.com/user-attachments/assets/b29b2dc0-dde3-4d69-9ce5-69a91ffe7985" height=800  style="height:800px; width:auto;" />
</div>

* 좋아요 표시한 곡이나 최근 부른 곡 중에서 부를 곡으로 추가할 수 있습니다.


<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
<img src="https://github.com/user-attachments/assets/6a6e9f12-758c-4462-853d-4fadf3fb4851"   height=800  style="height:800px; width:auto;"/>
</div>

### 검색 페이지
* 제목, 가수 이름으로 곡을 검색할 수 있습니다.
* 몇몇 일본곡은 한국어를 지원합니다.
  * 번역이 잘못되거나 부정확할 수 있습니다. 발견하신다면 제보 바랍니다.
 
<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
  <img src="https://github.com/user-attachments/assets/886efbf5-bfc9-4b88-be8a-6e0e027dffc5"   height=800  style="height:800px; width:auto;" />
</div>


### 라이브러리 페이지

* 자신의 활동 기록을 조회 및 관리할 수 있습니다.
* 좋아요 한 곡들을 조회하고 일괄 삭제할 수 있습니다.
* 자신이 가장 많이 부른 곡의 순위를 확인할 수 있습니다.

<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
  <img src="https://github.com/user-attachments/assets/d395522e-e10f-43ba-ab49-6ae299322978"   height=800  style="height:800px; width:auto;" />
  <img src="https://github.com/user-attachments/assets/8ca69483-ca76-47b2-b719-e301bbec3ee7"   height=800  style="height:800px; width:auto;"  />
  <img src="https://github.com/user-attachments/assets/f2fbe965-470c-4bc0-ae3d-17f6974cceac"  height=800  style="height:800px; width:auto;"  />
</div>

### 로그인 & 회원가입 지원

* Supabase DB에 사용자 아이디를 외래키로 하여 데이터를 저장 및 관리하기에 모든 서비스는 회원가입이 필수입니다.
* 이메일 인증 회원가입과 카카오 회원가입을 지원합니다.
  
<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
<img src="https://github.com/user-attachments/assets/4cf4094b-717c-4a88-a5bb-1ae285f3af8e"   height=800  style="height:800px; width:auto;" />
<img src="https://github.com/user-attachments/assets/8d7d8e9f-c447-4b2e-800a-dd3007fd0b40"  height=800  style="height:800px; width:auto;" />
</div>

## 📖 프로젝트 기록

- 2025.03.12 : 프로젝트 시작
- 2025.4.24 : MVP 버전 완성. (부를 곡, 검색, 라이브러리)
- 2025.4.27 : ChatGPT API 활용 일본어 곡 번역 시도, cheerio 및 puppeteer를 활용해서 국내곡 데이터 추가

## 📝 회고

### 해결하고자 했던 문제

- 기존 유사한 서비스에서 하나의 곡을 검색할 때 TJ, 금영 API로 따로따로 가져온다는 문제를 데이터를 크롤링하여 자체 DB(Supabase)를 만드는 것으로 해결했습니다.
- Next.js의 API Route를 활용하여 서버리스 API를 구축하고 외부 API의 URL을 감추고자 하였습니다.
- react query를 활용하여 서버, 즉 DB와의 동기화를 구축하고자 하였습니다.
- OPEN API로는 금영 노래방의 곡을 DB에 저장하기에 한계가 있었기에 puppeteer로 금영 노래방 유튜브 채널을 렌더링하여 곡을 검색하고 cheerio로 결과를 파싱하여 크롤링 프로세스를 설계하였습니다.

### 무엇을 얻었는지

- Turborepo를 활용하면서 모노레포의 이해를 높이고 프로젝트에 어떻게 적용하고 확장해야 하는지에 대해 익혔습니다.
- DMS인 Supabase를 통해 DB를 직접 구축하면서 DB Table 구조에 대한 개념을 익혔습니다.
- react query를 도입하며 쿼리 키를 활용한 낙관적 업데이트, 데이터 캐싱에 대한 이해를 높였습니다.



## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
