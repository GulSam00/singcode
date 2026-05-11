import { differenceInCalendarDays } from 'date-fns';
import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { SongPromotion } from '@/types/promotion';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';
import { getTodayKST } from '@/utils/kst';

export async function GET(): Promise<NextResponse<ApiResponse<SongPromotion[]>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { data, error } = await supabase
      .from('song_promotions')
      .select(
        'id, song_id, user_id, content, start_date, end_date, songs(title, artist, title_ko, artist_ko)',
      )
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

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
        content: row.content ?? '',
        start_date: row.start_date ?? '',
        end_date: row.end_date ?? '',
        nickname: '',
        title: song?.title ?? '',
        artist: song?.artist ?? '',
        title_ko: song?.title_ko ?? null,
        artist_ko: song?.artist_ko ?? null,
      };
    });

    return NextResponse.json({ success: true, data: promotions });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    console.error('Error in GET user promotions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get promotions' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const { data: promotion, error: fetchError } = await supabase
      .from('song_promotions')
      .select('id, user_id, start_date, end_date, songs(title, artist)')
      .eq('id', id)
      .single();

    if (fetchError || !promotion) {
      return NextResponse.json(
        { success: false, error: '홍보를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    if (promotion.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: '본인의 홍보만 취소할 수 있습니다.' },
        { status: 403 },
      );
    }

    const todayKST = getTodayKST();
    if (promotion.start_date <= todayKST) {
      return NextResponse.json(
        { success: false, error: '이미 시작된 홍보는 취소할 수 없습니다.' },
        { status: 400 },
      );
    }

    const days =
      differenceInCalendarDays(new Date(promotion.end_date), new Date(promotion.start_date)) + 1;
    const refund = days * 50;

    const { error: deleteError } = await supabase.from('song_promotions').delete().eq('id', id);

    if (deleteError) throw deleteError;

    const song = promotion.songs as unknown as { title: string; artist: string } | null;
    const description = `홍보 취소: ${song?.title ?? ''} - ${song?.artist ?? ''}`;

    const { error: pointError } = await supabase.rpc('record_point_change', {
      p_user_id: userId,
      p_amount: refund,
      p_description: description,
    });

    if (pointError) throw pointError;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    console.error('Error in DELETE user promotion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete promotion' },
      { status: 500 },
    );
  }
}
