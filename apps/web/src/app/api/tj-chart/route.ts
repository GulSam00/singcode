import { NextRequest, NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { Song } from '@/types/song';
import { StrType, TjChartResponse } from '@/types/tjChart';

interface ChartRow {
  rank: number;
  songs: Song | null;
}

const MONTH_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// availableMonths를 만들 때 chart_rankings 전체를 조회하면 PostgREST row 상한에 걸려 과거 월이 잘린다.
// 월당 최대 10 row만 반환되도록 종합 차트 상위권으로 좁혀서 조회한다.
const MONTH_LOOKUP_RANK_LIMIT = 10;

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<TjChartResponse>>> {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const genreParam = searchParams.get('genre') ?? StrType.All;
    const genre = Object.values(StrType).includes(genreParam as StrType)
      ? (genreParam as StrType)
      : StrType.All;

    // 1) 데이터가 존재하는 월 목록 조회
    const { data: monthRows, error: monthError } = await supabase
      .from('chart_rankings')
      .select('chart_month')
      .eq('type', StrType.All)
      .lte('rank', MONTH_LOOKUP_RANK_LIMIT)
      .order('chart_month', { ascending: false });

    if (monthError) throw monthError;

    const availableMonths = [...new Set((monthRows ?? []).map(row => row.chart_month as string))];

    if (availableMonths.length === 0) {
      return NextResponse.json({
        success: true,
        data: { month: '', genre, availableMonths: [], items: [] },
      });
    }

    // 형식만 검증하고 요청한 월을 그대로 조회한다.
    // (데이터가 없는 월이면 items가 빈 배열로 내려가고, 클라이언트가 빈 상태를 표시한다)
    const monthParam = searchParams.get('month');
    const targetMonth =
      monthParam && MONTH_PATTERN.test(monthParam) ? monthParam : availableMonths[0];

    // 2) 해당 월 + 장르의 차트 순위 조회 (songs 테이블과 조인)
    const { data, error } = await supabase
      .from('chart_rankings')
      .select('rank, songs(id, title, artist, title_ko, artist_ko, num_tj, num_ky, badges)')
      .eq('chart_month', targetMonth)
      .eq('type', genre)
      .order('rank', { ascending: true })
      .returns<ChartRow[]>();

    if (error) throw error;

    const items = (data ?? [])
      .filter((row): row is ChartRow & { songs: Song } => row.songs !== null)
      .map(row => ({ ...row.songs, rank: row.rank }));

    return NextResponse.json({
      success: true,
      data: { month: targetMonth, genre, availableMonths, items },
    });
  } catch (error) {
    console.error('Error in tj-chart API:', error);
    return NextResponse.json({ success: false, error: 'Failed to get tj chart' }, { status: 500 });
  }
}
