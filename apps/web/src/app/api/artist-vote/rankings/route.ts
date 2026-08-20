import { NextRequest, NextResponse } from 'next/server';

import { getArtistStarCount } from '@/app/api/artist-vote/_lib/starCount';
import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { ArtistRankingResponse } from '@/types/artistVote';

const MONTH_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface RankingRow {
  rank: number;
  artist: string;
  total_votes: number;
  top_voter_amount: number | null;
  users: { nickname: string } | null;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ArtistRankingResponse>>> {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // 1) 확정된 월 목록 조회 (1위 행만 봐도 그 월이 확정됐는지 알 수 있다)
    const { data: monthRows, error: monthError } = await supabase
      .from('monthly_artist_rankings')
      .select('vote_month')
      .eq('rank', 1)
      .order('vote_month', { ascending: false });

    if (monthError) throw monthError;

    const availableMonths = [...new Set((monthRows ?? []).map(row => row.vote_month as string))];

    if (availableMonths.length === 0) {
      return NextResponse.json({
        success: true,
        data: { month: '', availableMonths: [], items: [] },
      });
    }

    const monthParam = searchParams.get('month');
    const targetMonth =
      monthParam && MONTH_PATTERN.test(monthParam) && availableMonths.includes(monthParam)
        ? monthParam
        : availableMonths[0];

    // 2) 해당 월 1~10위 조회
    const { data, error } = await supabase
      .from('monthly_artist_rankings')
      .select('rank, artist, total_votes, top_voter_amount, users:top_voter_user_id(nickname)')
      .eq('vote_month', targetMonth)
      .order('rank', { ascending: true })
      .returns<RankingRow[]>();

    if (error) throw error;

    const rows = data ?? [];
    const winnerArtist = rows.find(row => row.rank === 1)?.artist;

    // 3) 1위 아티스트의 누적 선정(★) 횟수 조회
    const starCount = winnerArtist ? await getArtistStarCount(supabase, winnerArtist) : 0;

    const items = rows.map(row => ({
      rank: row.rank,
      artist: row.artist,
      totalVotes: row.total_votes,
      topVoterNickname: row.users?.nickname ?? null,
      topVoterAmount: row.top_voter_amount,
      starCount: row.rank === 1 ? starCount : 0,
    }));

    return NextResponse.json({
      success: true,
      data: { month: targetMonth, availableMonths, items },
    });
  } catch (error) {
    console.error('Error in GET artist rankings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get artist rankings' },
      { status: 500 },
    );
  }
}
