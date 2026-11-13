import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { SongPromotion } from '@/types/promotion';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';
import { INVALID_TEXT_REPRESENTATION, toPointRpcErrorResponse } from '@/utils/pointRpcError';

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
    await getAuthenticatedUser(supabase);

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    // 소유·시작일 검사, 삭제, 환불은 cancel_song_promotion RPC가 홍보 행을 잠근 채 한 번에 처리한다.
    // 따로 하면 같은 취소를 동시에 두 번 보냈을 때 두 번 환불된다.
    const { error: rpcError } = await supabase.rpc('cancel_song_promotion', {
      p_promotion_id: id,
    });

    // id 형식이 컬럼 타입(uuid 등)과 맞지 않으면 형변환 단계에서 22P02로 실패한다 — 없는 홍보와 같다.
    if (rpcError?.code === INVALID_TEXT_REPRESENTATION) {
      return NextResponse.json(
        { success: false, error: '홍보를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    if (rpcError) {
      const mapped = toPointRpcErrorResponse(rpcError);
      if (mapped) {
        return NextResponse.json(
          { success: false, error: mapped.error },
          { status: mapped.status },
        );
      }
      throw rpcError;
    }

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
