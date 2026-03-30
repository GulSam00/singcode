import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { Song } from '@/types/song';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

interface ThumbUpSong extends Song {
  thumb_count: number;
}

export async function GET(): Promise<NextResponse<ApiResponse<ThumbUpSong[]>>> {
  try {
    const supabase = await createClient();

    // 1) thumb_logs 전체 조회
    const { data: thumbData, error: thumbError } = await supabase
      .from('thumb_logs')
      .select('song_id, thumb_count');

    if (thumbError) throw thumbError;
    if (!thumbData || thumbData.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2) 앱에서 song_id별 합계 집계
    const thumbMap = new Map<string, number>();
    for (const row of thumbData) {
      thumbMap.set(row.song_id, (thumbMap.get(row.song_id) ?? 0) + row.thumb_count);
    }

    // 3) 상위 50개 song_id 추출
    const sorted = [...thumbMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50);

    const songIds = sorted.map(([songId]) => songId);

    // 4) 해당 song 상세 정보 조회
    const { data: songs, error: songError } = await supabase
      .from('songs')
      .select('*')
      .in('id', songIds);

    if (songError) throw songError;

    // 5) 병합 후 thumb_count 내림차순 정렬
    const songMap = new Map(songs?.map(song => [song.id, song]));
    const data = sorted
      .filter(([songId]) => songMap.has(songId))
      .map(([songId, thumbCount]) => ({
        ...songMap.get(songId)!,
        thumb_count: thumbCount,
      }));

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
    console.error('Error in thumb-up API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get thumb-up songs' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { point, songId } = await request.json();

    const { error: insertError } = await supabase
      .from('thumb_logs')
      .insert({ song_id: songId, user_id: userId, thumb_count: point });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
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
    console.error('Error in thumb-up API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post thumb-up song' },
      { status: 500 },
    );
  }
}
