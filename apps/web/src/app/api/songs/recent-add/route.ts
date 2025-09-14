import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { PersonalSong, Song } from '@/types/song';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

interface ResponseRecentAddSong {
  songs: Song;
}
export async function GET(
  request: Request,
): Promise<NextResponse<ApiResponse<ResponseRecentAddSong[]>>> {
  try {
    const { searchParams } = new URL(request.url);

    const year = Number(searchParams.get('year')) || 0;
    const month = Number(searchParams.get('month')) || 0;

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const supabase = await createClient();

    // songs 테이블의 startDate, endDate 사이의 데이터를 가져옴
    const { data, error: recentError } = await supabase
      .from('songs') // songs 테이블에서 검색
      .select(`*`)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100); // 단순히 songs의 created_at으로 정렬

    if (recentError) throw recentError;

    return NextResponse.json({ success: true, data });
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
