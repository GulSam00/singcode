import { differenceInCalendarDays } from 'date-fns';
import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { SongPromotion } from '@/types/promotion';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';
import { getTodayKST, getTomorrowKST } from '@/utils/kst';

export async function GET(): Promise<NextResponse<ApiResponse<SongPromotion[]>>> {
  try {
    const supabase = await createClient();
    const todayKST = getTodayKST();

    const { data, error } = await supabase
      .from('song_promotions')
      .select(
        'id, song_id, user_id, content, start_date, end_date, users(nickname), songs(title, artist, title_ko, artist_ko)',
      )
      .lte('start_date', todayKST)
      .gte('end_date', todayKST)
      .order('end_date', { ascending: false });

    if (error) throw error;

    const promotions: SongPromotion[] = (data ?? []).map(row => {
      const song = row.songs as unknown as {
        title: string;
        artist: string;
        title_ko: string | null;
        artist_ko: string | null;
      } | null;

      return {
        id: row.id,
        song_id: row.song_id,
        user_id: row.user_id,
        content: row.content,
        start_date: row.start_date,
        end_date: row.end_date,
        nickname: (row.users as unknown as { nickname: string } | null)?.nickname ?? '알 수 없음',
        title: song?.title ?? '',
        artist: song?.artist ?? '',
        title_ko: song?.title_ko ?? null,
        artist_ko: song?.artist_ko ?? null,
      };
    });

    return NextResponse.json({ success: true, data: promotions });
  } catch (error) {
    console.error('Error in GET promotions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get promotions' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { song_id, content, start_date, end_date } = await request.json();

    if (!song_id || !content || !start_date || !end_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'song_id, content, start_date, end_date are required',
        },
        { status: 400 },
      );
    }

    if (content.length > 50) {
      return NextResponse.json(
        { success: false, error: '홍보 내용은 50자 이내로 작성해주세요.' },
        { status: 400 },
      );
    }

    const tomorrowKST = getTomorrowKST();

    if (start_date < tomorrowKST) {
      return NextResponse.json(
        { success: false, error: '홍보 시작일은 내일 이후여야 합니다.' },
        { status: 400 },
      );
    }

    if (end_date < start_date) {
      return NextResponse.json(
        { success: false, error: '종료일은 시작일 이후여야 합니다.' },
        { status: 400 },
      );
    }

    const days = differenceInCalendarDays(new Date(end_date), new Date(start_date)) + 1;
    const cost = days * 50;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('point')
      .eq('id', userId)
      .single();

    if (userError || !userData) throw userError ?? new Error('User not found');

    if (userData.point < cost) {
      return NextResponse.json(
        {
          success: false,
          error: `포인트가 부족합니다. 필요: ${cost}P, 보유: ${userData.point}P`,
        },
        { status: 400 },
      );
    }

    const { error: insertError } = await supabase.from('song_promotions').insert({
      song_id,
      user_id: userId,
      content,
      start_date,
      end_date,
    });

    if (insertError) throw insertError;

    const { error: pointError } = await supabase
      .from('users')
      .update({ point: userData.point - cost })
      .eq('id', userId);

    if (pointError) throw pointError;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    console.error('Error in POST promotion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create promotion' },
      { status: 500 },
    );
  }
}
