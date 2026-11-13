import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';
import { toPointRpcErrorResponse } from '@/utils/pointRpcError';

// artist_votes는 (user, artist, 이번 달) 당 1행이며 amount는 "현재 걸어둔 포인트"다.
// amount(절대값)를 보내면 기존 값과의 차액만큼 포인트를 차감/환불하고,
// amount=0이면 행을 삭제해 전액 환불한다. vote_month는 항상 DB가 KST로 계산한
// "이번 달"만 사용해 지난 달 투표는 이 라우트로 절대 건드릴 수 없게 한다.
// 잔액 잠금·검사·투표 반영·차감은 cast_artist_vote RPC가 한 트랜잭션으로 처리한다 —
// 여러 요청을 동시에 보내도 보유량보다 많이 걸 수 없다.
export async function PUT(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    await getAuthenticatedUser(supabase);

    const { artist, amount } = await request.json();

    if (typeof artist !== 'string' || !artist.trim()) {
      return NextResponse.json({ success: false, error: 'artist is required' }, { status: 400 });
    }
    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 0) {
      return NextResponse.json(
        { success: false, error: 'amount는 0 이상의 정수여야 합니다.' },
        { status: 400 },
      );
    }

    const { error } = await supabase.rpc('cast_artist_vote', {
      p_artist: artist.trim(),
      p_amount: amount,
    });

    if (error) {
      const mapped = toPointRpcErrorResponse(error);
      if (mapped) {
        return NextResponse.json(
          { success: false, error: mapped.error },
          { status: mapped.status },
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    console.error('Error in PUT artist-vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update artist vote' },
      { status: 500 },
    );
  }
}
