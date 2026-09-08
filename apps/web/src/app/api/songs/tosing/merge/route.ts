import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

// 게스트 목록은 localStorage에 무한정 쌓일 수 있어 한 번에 옮길 양을 막아둔다.
const MAX_MERGE_COUNT = 100;

/**
 * 게스트로 담아둔 부를 곡을 로그인 계정으로 옮긴다.
 *
 * `/songs/tosing/array`를 쓰지 않는 이유는 이 요청만 중복·유령 곡을 만나기 때문이다.
 * 모달에서 담을 때는 `isInToSingList`가 클라이언트에서 걸러주지만, 병합은 이미 담아둔
 * 곡과 겹치고 브라우저가 오래 들고 있던 삭제된 곡 id도 섞인다. 둘 중 하나만 있어도
 * 배치 insert 전체가 깨지고, 그러면 로컬이 비워지지 않아 방문할 때마다 같은 실패를
 * 반복한다. 그래서 넣기 전에 서버에서 거른다.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<ApiResponse<{ merged: number }>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { songIds } = await request.json();
    if (!Array.isArray(songIds) || songIds.length === 0) {
      return NextResponse.json({ success: true, data: { merged: 0 } });
    }

    const ids = [...new Set<string>(songIds)].slice(0, MAX_MERGE_COUNT);

    const { data: realSongs, error: songError } = await supabase
      .from('songs')
      .select('id')
      .in('id', ids);
    if (songError) throw songError;

    const { data: mine, error: mineError } = await supabase
      .from('tosings')
      .select('song_id, order_weight')
      .eq('user_id', userId);
    if (mineError) throw mineError;

    const realIds = new Set((realSongs ?? []).map(row => row.id));
    const mineIds = new Set((mine ?? []).map(row => row.song_id));

    // 게스트가 잡아둔 순서를 유지한 채, 이미 담긴 곡과 사라진 곡만 걸러낸다
    const targets = ids.filter(id => realIds.has(id) && !mineIds.has(id));
    if (targets.length === 0) {
      return NextResponse.json({ success: true, data: { merged: 0 } });
    }

    // 기존 목록 뒤에 붙인다 — 계정에 있던 순서가 밀리지 않게
    const lastWeight = (mine ?? []).reduce((max, row) => Math.max(max, row.order_weight), 0);

    const { error } = await supabase.from('tosings').insert(
      targets.map((songId, index) => ({
        user_id: userId,
        song_id: songId,
        order_weight: lastWeight + index + 1,
      })),
    );
    if (error) throw error;

    return NextResponse.json({ success: true, data: { merged: targets.length } });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }

    console.error('Error in tosing merge API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to merge tosing songs' },
      { status: 500 },
    );
  }
}
