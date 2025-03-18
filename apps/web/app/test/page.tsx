import { getSinger, getNo, getPopular } from '@repo/api';
import { SearchForm } from './SearchForm';

// 서버 컴포넌트 (기본적으로 서버에서 실행됨)
export default async function TestPage({ searchParams }: { searchParams: { search?: string } }) {
  // URL 쿼리 파라미터에서 singer 값을 가져옴
  const temp = await searchParams;
  console.log('SearchParams', temp);
  const search = await searchParams.search;

  // 검색어가 있을 때만 API 호출
  let data = null;
  let error = null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  if (search) {
    try {
      // TJ, 금영의 경우 해외(일본)곡 검색 못 함
      // 크롤링 돌려서 DB에다가 집어넣어야 할 듯
      data = await getSinger({ singer: search, brand: 'tj' });
      // data = await getPopular({ brand: 'tj', period: 'weekly' });
      // const other = await fetch(`http://localhost:3000/api/songs/singer?singer=아이유`);
      const other = await fetch(`${baseUrl}/api/songs/singer/IU?brand=tj`);
      const otherData = await other.json();
      console.log('other : ', otherData);
      console.log('datajson : ', JSON.stringify(data, null, 2));
    } catch (err) {
      error = err instanceof Error ? err.message : '알 수 없는 오류';
      console.error('API 호출 오류:', err);
    }
  }

  return (
    <div>
      <h1>가수 검색</h1>

      {/* 클라이언트 컴포넌트 (사용자 입력 처리) */}
      <SearchForm initialSinger={search} />

      {/* 검색 결과 표시 (서버 컴포넌트) */}
      {search && !data && !error && <p>'{search}'에 대한 검색 결과가 없습니다.</p>}
      {error && <p>오류: {error}</p>}

      {data && (
        <div>
          <p>'{search}'에 대한 검색 결과:</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
