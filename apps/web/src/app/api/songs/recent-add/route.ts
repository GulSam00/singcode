import { endOfMonth, format, startOfMonth } from 'date-fns';
import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { Song } from '@/types/song';

export async function GET(request: Request): Promise<NextResponse<ApiResponse<Song[]>>> {
  try {
    const { searchParams } = new URL(request.url);

    const now = new Date();
    const year = Number(searchParams.get('year'));
    const month = Number(searchParams.get('month'));

    // date-fns의 month는 0-indexed이므로 1을 빼줌 (사용자 입력은 1-12)
    const baseDate = new Date(year, month, 1);
    const startDate = format(startOfMonth(baseDate), 'yyyy-MM-01');
    const endDate = format(endOfMonth(baseDate), 'yyyy-MM-dd');

    const supabase = await createClient();

    // songs 테이블의 release 날짜가 해당 월의 시작일부터 마지막일 사이인 데이터를 가져옴
    const { data, error: recentError } = await supabase
      .from('songs')
      .select('*')
      .gte('release', startDate)
      .lte('release', endDate)
      .order('release', { ascending: false })
      .limit(100);

    if (recentError) throw recentError;

    return NextResponse.json({ success: true, data: data as Song[] });
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

    console.error('Error in recent API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recent songs' },
      { status: 500 },
    );
  }
}
