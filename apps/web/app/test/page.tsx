import { getSinger } from '@repo/api';
import { SearchForm } from './SearchForm';

// 서버 컴포넌트 (기본적으로 서버에서 실행됨)
export default async function TestPage({ searchParams }: { searchParams: { singer?: string } }) {
  // URL 쿼리 파라미터에서 singer 값을 가져옴
  const temp = await searchParams;
  console.log('SearchParams', temp);
  const singer = await searchParams.singer;

  // 검색어가 있을 때만 API 호출
  let data = null;
  let error = null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  if (singer) {
    try {
      data = await getSinger({ singer });
      // const other = await fetch(`http://localhost:3000/api/songs/singer?singer=아이유`);
      const other = await fetch(`${baseUrl}/api/songs/singer?singer=아이유`);
      const otherData = await other.json();
      console.log('other : ', otherData);
    } catch (err) {
      error = err instanceof Error ? err.message : '알 수 없는 오류';
      console.error('API 호출 오류:', err);
    }
  }

  return (
    <div>
      <h1>가수 검색</h1>

      {/* 클라이언트 컴포넌트 (사용자 입력 처리) */}
      <SearchForm initialSinger={singer} />

      {/* 검색 결과 표시 (서버 컴포넌트) */}
      {singer && !data && !error && <p>'{singer}'에 대한 검색 결과가 없습니다.</p>}
      {error && <p>오류: {error}</p>}

      {data && (
        <div>
          <p>'{singer}'에 대한 검색 결과:</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
