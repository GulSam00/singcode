import { NextResponse } from 'next/server';

import { VoteRow, rankTopArtists } from '@/app/api/artist-vote/_lib/rankVotes';
import createServiceRoleClient from '@/lib/supabase/serviceRole';
import { ApiResponse } from '@/types/apiRoute';
import { getPrevMonthFirstDayKST } from '@/utils/kst';

// GitHub Actions가 매일 00:10(KST)에 호출한다.
// "지금이 이번 달"이라는 전제 하에 getPrevMonthFirstDayKST()로 "방금 끝난 달"을 계산해
// 매번 같은 달을 덮어써 재실행에도 안전하다(idempotent).
export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.ARTIST_VOTE_FINALIZE_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();
    const targetMonth = getPrevMonthFirstDayKST();

    const { data, error } = await supabase
      .from('artist_votes')
      .select('user_id, artist, amount, created_at')
      .eq('vote_month', targetMonth)
      .returns<VoteRow[]>();

    if (error) throw error;

    const votes = data ?? [];
    if (votes.length === 0) {
      return NextResponse.json({ success: true });
    }

    const ranked = rankTopArtists(votes);

    const { error: deleteError } = await supabase
      .from('monthly_artist_rankings')
      .delete()
      .eq('vote_month', targetMonth);

    if (deleteError) throw deleteError;

    const rows = ranked.map((entry, index) => ({
      vote_month: targetMonth,
      rank: index + 1,
      artist: entry.artist,
      total_votes: entry.total,
      top_voter_user_id: entry.topVoterUserId,
      top_voter_amount: entry.topVoterAmount,
    }));

    const { error: insertError } = await supabase.from('monthly_artist_rankings').insert(rows);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST finalize artist vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to finalize artist vote' },
      { status: 500 },
    );
  }
}
