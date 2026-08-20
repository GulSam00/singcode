import { NextResponse } from 'next/server';

import { getArtistStarCount } from '@/app/api/artist-vote/_lib/starCount';
import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { CurrentArtistOfMonth } from '@/types/artistVote';

// 곡 카드 배지용 — 가장 최근에 확정된 1위 아티스트 + 누적 선정(★) 횟수만 가볍게 반환한다.
export async function GET(): Promise<NextResponse<ApiResponse<CurrentArtistOfMonth | null>>> {
  try {
    const supabase = await createClient();

    const { data: latest, error: latestError } = await supabase
      .from('monthly_artist_rankings')
      .select('artist')
      .eq('rank', 1)
      .order('vote_month', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) throw latestError;
    if (!latest) {
      return NextResponse.json({ success: true, data: null });
    }

    const starCount = await getArtistStarCount(supabase, latest.artist);

    return NextResponse.json({
      success: true,
      data: { artist: latest.artist, starCount },
    });
  } catch (error) {
    console.error('Error in GET current artist of month:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get current artist of month' },
      { status: 500 },
    );
  }
}
