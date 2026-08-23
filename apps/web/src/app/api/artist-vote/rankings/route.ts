import { NextRequest, NextResponse } from 'next/server';

import { getArtistWins } from '@/app/api/artist-vote/_lib/artistWins';
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
  artists: { name_ko: string | null; image_url: string | null } | null;
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

    // 조회 월의 주인은 클라이언트다. 아직 확정되지 않은 월을 요청해도 그 월을 그대로 돌려주고
    // 결과만 비워 보낸다. 여기서 임의로 다른 월로 바꾸면 월 선택기 값과 화면 데이터가 어긋난다.
    const monthParam = searchParams.get('month');
    const targetMonth =
      monthParam && MONTH_PATTERN.test(monthParam) ? monthParam : (availableMonths[0] ?? '');

    if (!availableMonths.includes(targetMonth)) {
      return NextResponse.json({
        success: true,
        data: { month: targetMonth, availableMonths, items: [] },
      });
    }

    // 2) 해당 월 1~30위 조회
    const { data, error } = await supabase
      .from('monthly_artist_rankings')
      .select(
        'rank, artist, total_votes, top_voter_amount, users:top_voter_user_id(nickname), artists(name_ko, image_url)',
      )
      .eq('vote_month', targetMonth)
      .order('rank', { ascending: true })
      .returns<RankingRow[]>();

    if (error) throw error;

    const rows = data ?? [];

    // 3) 시상대(1~3위)의 1위 이력 조회 — 별(또는 트로피)을 그 개수만큼 새긴다.
    //    그 달 1위가 아니어도 과거에 뽑힌 적이 있으면 표식이 남는다.
    //    조회 중인 달까지로 자르므로, 지난 달을 보면 그 시점의 개수가 그대로 나온다.
    const podiumArtists = rows.filter(row => row.rank <= 3).map(row => row.artist);
    const winsByArtist = await getArtistWins(supabase, podiumArtists, targetMonth);

    const items = rows.map(row => ({
      rank: row.rank,
      artist: row.artist,
      artistKo: row.artists?.name_ko ?? null,
      artistImage: row.artists?.image_url ?? null,
      totalVotes: row.total_votes,
      topVoterNickname: row.users?.nickname ?? null,
      topVoterAmount: row.top_voter_amount,
      wins: winsByArtist.get(row.artist) ?? [],
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
