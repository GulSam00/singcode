import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { SearchSong, Song } from '@/types/song';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

interface DBSong extends Song {
  thumb_logs:
    | {
        thumb_count: number;
      }[]
    | null;
  tosings: {
    user_id: string;
  }[];
  like_activities: {
    user_id: string;
  }[];
  save_activities: {
    user_id: string;
  }[];
}

// 검색 타입별 대상 컬럼
const SEARCH_COLUMNS: Record<string, string[]> = {
  all: ['title', 'title_ko', 'artist', 'artist_ko'],
  title: ['title', 'title_ko'],
  artist: ['artist', 'artist_ko'],
};

function getSearchColumns(type: string): string[] {
  return SEARCH_COLUMNS[type] ?? [type];
}

// 공백 기준 토큰 분리 (빈 토큰 제거)
function tokenizeQuery(searchText: string): string[] {
  return searchText.trim().split(/\s+/).filter(Boolean);
}

// 토큰을 %로 이어 붙인 전체 구 패턴 (띄어쓰기 차이를 무시한 완전 일치용)
// 예: ['사건의', '지평선'] -> '사건의%지평선' → '사건의지평선', '사건의 지평선' 모두 매칭
function buildPhrasePattern(tokens: string[]): string {
  return tokens.join('%');
}

// 여러 컬럼에 같은 ilike 패턴을 적용한 OR 그룹 조건 문자열 (PostgREST .or() 인자)
// 예: (['title','title_ko'], '%로드%') -> 'title.ilike.%로드%,title_ko.ilike.%로드%'
function buildColumnOrGroup(columns: string[], pattern: string): string {
  return columns.map(column => `${column}.ilike.${pattern}`).join(',');
}

// 정확 일치: 전체 구가 한 컬럼과 일치 (랭킹 상위). 띄어쓰기 차이는 무시한다.
function applyExactFilter(baseQuery: any, type: string, searchText: string) {
  if (type === 'number') {
    return baseQuery.or(`num_tj.eq.${searchText},num_ky.eq.${searchText}`);
  }

  const phrase = buildPhrasePattern(tokenizeQuery(searchText));
  const columns = getSearchColumns(type);

  return baseQuery.or(buildColumnOrGroup(columns, phrase));
}

// 부분 일치: 입력한 모든 토큰이 (순서 무관) 포함돼야 매칭(AND) + 정확 일치 결과는 제외.
function applyPartialFilter(baseQuery: any, type: string, searchText: string) {
  const tokens = tokenizeQuery(searchText);
  const phrase = buildPhrasePattern(tokens);
  const columns = getSearchColumns(type);

  // 토큰 AND 조건: 각 토큰의 "컬럼 OR 그룹"을 .or() 체이닝으로 AND 결합한다.
  // (PostgREST에서 .or() 체이닝은 서로 AND로 묶인다)
  // 예: '바톤 로드' → (바톤 in any col) AND (로드 in any col)
  //     → '오버로드'(로드만), '로드넘버원'(로드만)은 바톤이 없어 제외된다.
  let query = baseQuery;
  for (const token of tokens) {
    query = query.or(buildColumnOrGroup(columns, `%${token}%`));
  }

  // 정확 일치 티어와의 중복 제거.
  // nullable 컬럼(title_ko/artist_ko)에서 `col NOT ILIKE x`는 NULL로 평가되어 행이
  // 통째로 누락되므로, `col IS NULL`을 OR로 함께 묶어 NULL-safe하게 제외한다.
  for (const column of columns) {
    query = query.or(`${column}.not.ilike.${phrase},${column}.is.null`);
  }

  return query;
}

async function executeSearchQueries(
  supabase: Awaited<ReturnType<typeof createClient>>,
  selectClause: string,
  query: string,
  type: string,
  order: string,
  from: number,
  to: number,
): Promise<{ data: DBSong[]; hasNext: boolean } | { error: string }> {
  const size = to - from + 1;

  // 번호 검색은 정확 매칭만 지원 (부분 일치 단계 스킵)
  if (type === 'number') {
    const exactCountResult = await applyExactFilter(
      supabase.from('songs').select(selectClause, { count: 'exact', head: true }),
      type,
      query,
    );
    if (exactCountResult.error) return { error: exactCountResult.error.message };
    const exactTotal = exactCountResult.count ?? 0;

    const exactQuery = applyExactFilter(supabase.from('songs').select(selectClause), type, query);
    const { data, error } = await exactQuery.order(order).range(from, to);
    if (error) return { error: error.message };

    return {
      data: (data as DBSong[]) ?? [],
      hasNext: exactTotal > to + 1,
    };
  }

  // 1. 정확 일치 / 부분 일치 각각의 총 개수를 병렬로 조회
  const exactCountQuery = applyExactFilter(
    supabase.from('songs').select(selectClause, { count: 'exact', head: true }),
    type,
    query,
  );
  const partialCountQuery = applyPartialFilter(
    supabase.from('songs').select(selectClause, { count: 'exact', head: true }),
    type,
    query,
  );

  const [exactCountResult, partialCountResult] = await Promise.all([
    exactCountQuery,
    partialCountQuery,
  ]);

  if (exactCountResult.error) return { error: exactCountResult.error.message };
  if (partialCountResult.error) return { error: partialCountResult.error.message };

  const exactTotal = exactCountResult.count ?? 0;
  const partialTotal = partialCountResult.count ?? 0;
  const totalCount = exactTotal + partialTotal;

  // 2. 현재 페이지에 필요한 데이터 가져오기
  let exactData: DBSong[] = [];
  let partialData: DBSong[] = [];

  if (exactTotal === 0) {
    // 정확 일치 없음 → 부분 일치만 조회
    const partialQuery = applyPartialFilter(
      supabase.from('songs').select(selectClause),
      type,
      query,
    );
    const { data, error } = await partialQuery.order(order).range(from, to);
    if (error) return { error: error.message };
    partialData = (data as DBSong[]) ?? [];
  } else if (from >= exactTotal) {
    // 현재 페이지가 부분 일치 영역에만 해당
    const partialFrom = from - exactTotal;
    const partialTo = partialFrom + size - 1;
    const partialQuery = applyPartialFilter(
      supabase.from('songs').select(selectClause),
      type,
      query,
    );
    const { data, error } = await partialQuery.order(order).range(partialFrom, partialTo);
    if (error) return { error: error.message };
    partialData = (data as DBSong[]) ?? [];
  } else {
    // 현재 페이지가 정확 일치 영역에 포함 (경계에 걸릴 수도 있음)
    const exactTo = Math.min(to, exactTotal - 1);
    const exactQuery = applyExactFilter(supabase.from('songs').select(selectClause), type, query);
    const exactResult = await exactQuery.order(order).range(from, exactTo);
    if (exactResult.error) return { error: exactResult.error.message };
    exactData = (exactResult.data as DBSong[]) ?? [];

    // 정확 일치로 페이지를 다 못 채운 경우 → 부분 일치로 나머지 채움
    if (to >= exactTotal) {
      const partialTo = to - exactTotal;
      const partialQuery = applyPartialFilter(
        supabase.from('songs').select(selectClause),
        type,
        query,
      );
      const partialResult = await partialQuery.order(order).range(0, partialTo);
      if (partialResult.error) return { error: partialResult.error.message };
      partialData = (partialResult.data as DBSong[]) ?? [];
    }
  }

  return {
    data: [...exactData, ...partialData],
    hasNext: totalCount > to + 1,
  };
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse<SearchSong[]>>> {
  // API KEY 노출을 막기 위해 미들웨어 역할을 할 API ROUTE 활용
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'title';
    const order = type === 'all' ? 'title' : type === 'number' ? 'num_tj' : type;
    const authenticated = searchParams.get('authenticated') === 'true';

    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = 20;
    const from = page * size;
    const to = from + size - 1;

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'No query provided',
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const selectClause = authenticated
      ? `*, thumb_logs(*), tosings(user_id), like_activities(user_id), save_activities(user_id)`
      : `*, thumb_logs(*)`;

    const result = await executeSearchQueries(supabase, selectClause, query, type, order, from, to);

    if ('error' in result) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      );
    }

    let userId: string | undefined;
    if (authenticated) {
      userId = await getAuthenticatedUser(supabase);
    }

    const songs: SearchSong[] = result.data.map((song: DBSong) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      title_ko: song.title_ko,
      artist_ko: song.artist_ko,
      num_tj: song.num_tj,
      num_ky: song.num_ky,
      isToSing: authenticated
        ? (song.tosings?.some(tosing => tosing.user_id === userId) ?? false)
        : false,
      isLike: authenticated
        ? (song.like_activities?.some(like => like.user_id === userId) ?? false)
        : false,
      isSave: authenticated
        ? (song.save_activities?.some(save => save.user_id === userId) ?? false)
        : false,
      thumb: song.thumb_logs?.reduce((sum, log) => sum + log.thumb_count, 0) ?? 0,
    }));

    return NextResponse.json({
      success: true,
      data: songs,
      hasNext: result.hasNext,
    });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        {
          success: false,
          error: 'User not authenticated',
        },
        { status: 401 },
      );
    }

    console.error('Error in search API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
