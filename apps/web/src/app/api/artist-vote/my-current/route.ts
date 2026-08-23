import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { MyArtistVote } from '@/types/artistVote';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';
import { getCurrentMonthFirstDayKST } from '@/utils/kst';

interface MyVoteRow {
  artist: string;
  amount: number;
  artists: { name_ko: string | null } | null;
}

export async function GET(): Promise<NextResponse<ApiResponse<MyArtistVote[]>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);
    const currentMonth = getCurrentMonthFirstDayKST();

    // artist는 artists.name FK라 한국어 표기를 그대로 임베딩해 가져온다.
    // 투표 목록에서도 곡 카드처럼 원어 표기 아래 한국어 표기를 보여주기 위함이다.
    const { data, error } = await supabase
      .from('artist_votes')
      .select('artist, amount, artists(name_ko)')
      .eq('user_id', userId)
      .eq('vote_month', currentMonth)
      .order('amount', { ascending: false })
      .returns<MyVoteRow[]>();

    if (error) throw error;

    const votes: MyArtistVote[] = (data ?? []).map(row => ({
      artist: row.artist,
      amount: row.amount,
      artistKo: row.artists?.name_ko ?? null,
    }));

    return NextResponse.json({ success: true, data: votes });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    console.error('Error in GET my-current artist votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get my artist votes' },
      { status: 500 },
    );
  }
}
