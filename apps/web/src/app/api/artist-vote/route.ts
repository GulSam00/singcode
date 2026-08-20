import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';
import { getCurrentMonthFirstDayKST } from '@/utils/kst';

// artist_votes는 (user, artist, 이번 달) 당 1행이며 amount는 "현재 걸어둔 포인트"다.
// amount(절대값)를 보내면 기존 값과의 차액만큼 포인트를 차감/환불하고,
// amount=0이면 행을 삭제해 전액 환불한다. vote_month는 항상 서버가 계산한
// "이번 달"만 사용해 지난 달 투표는 이 라우트로 절대 건드릴 수 없게 한다.
export async function PUT(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

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

    const normalizedArtist = artist.trim();
    const currentMonth = getCurrentMonthFirstDayKST();

    // artist_votes.artist는 artists.name을 FK로 참조한다. amount=0(삭제)이 아니라면
    // 여기서 미리 걸러야 포인트 차감 전에 실패하고, 사용자에게도 원인이 분명히 보인다.
    if (amount > 0) {
      const { data: artistRow, error: artistError } = await supabase
        .from('artists')
        .select('name')
        .eq('name', normalizedArtist)
        .maybeSingle();

      if (artistError) throw artistError;
      if (!artistRow) {
        return NextResponse.json(
          { success: false, error: '존재하지 않는 아티스트입니다.' },
          { status: 400 },
        );
      }
    }

    const { data: existing, error: existingError } = await supabase
      .from('artist_votes')
      .select('amount')
      .eq('user_id', userId)
      .eq('artist', normalizedArtist)
      .eq('vote_month', currentMonth)
      .maybeSingle();

    if (existingError) throw existingError;

    const currentAmount = existing?.amount ?? 0;
    const diff = amount - currentAmount;

    if (diff === 0) {
      return NextResponse.json({ success: true });
    }

    if (diff > 0) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('point')
        .eq('id', userId)
        .single();

      if (userError || !userData) throw userError ?? new Error('User not found');

      if (userData.point < diff) {
        return NextResponse.json(
          {
            success: false,
            error: `포인트가 부족합니다. 필요: ${diff}P, 보유: ${userData.point}P`,
          },
          { status: 400 },
        );
      }
    }

    if (amount === 0) {
      const { error: deleteError } = await supabase
        .from('artist_votes')
        .delete()
        .match({ user_id: userId, artist: normalizedArtist, vote_month: currentMonth });

      if (deleteError) throw deleteError;
    } else {
      const { error: upsertError } = await supabase.from('artist_votes').upsert(
        {
          user_id: userId,
          artist: normalizedArtist,
          vote_month: currentMonth,
          amount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,artist,vote_month' },
      );

      if (upsertError) throw upsertError;
    }

    const description =
      diff > 0
        ? `아티스트 투표: ${normalizedArtist} (+${diff}P)`
        : `아티스트 투표 조정: ${normalizedArtist} (${diff}P)`;

    const { error: pointError } = await supabase.rpc('record_point_change', {
      p_user_id: userId,
      p_amount: -diff,
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
    console.error('Error in PUT artist-vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update artist vote' },
      { status: 500 },
    );
  }
}
