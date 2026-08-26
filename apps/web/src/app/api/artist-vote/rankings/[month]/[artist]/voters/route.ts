import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { ArtistVoter } from '@/types/artistVote';

interface VoterRow {
  amount: number;
  users: { nickname: string } | null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ month: string; artist: string }> },
): Promise<NextResponse<ApiResponse<ArtistVoter[]>>> {
  try {
    const { month, artist: encodedArtist } = await params;
    const artist = decodeURIComponent(encodedArtist);

    const supabase = await createClient();

    // 확정된 랭킹에 포함된 (월, 아티스트) 조합만 공개한다.
    // 이 검사가 없으면 아직 확정되지 않은 이번 달 실시간 득표 현황이 새어나간다.
    const { data: rankingRow, error: rankingError } = await supabase
      .from('monthly_artist_rankings')
      .select('id')
      .eq('vote_month', month)
      .eq('artist', artist)
      .maybeSingle();

    if (rankingError) throw rankingError;
    if (!rankingRow) {
      return NextResponse.json(
        { success: false, error: '확정되지 않은 아티스트입니다.' },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from('artist_votes')
      .select('amount, users(nickname)')
      .eq('vote_month', month)
      .eq('artist', artist)
      .order('amount', { ascending: false })
      .returns<VoterRow[]>();

    if (error) throw error;

    const voters: ArtistVoter[] = (data ?? []).map(row => ({
      nickname: row.users?.nickname ?? '알 수 없음',
      amount: row.amount,
    }));

    return NextResponse.json({ success: true, data: voters });
  } catch (error) {
    console.error('Error in GET artist voters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get artist voters' },
      { status: 500 },
    );
  }
}
