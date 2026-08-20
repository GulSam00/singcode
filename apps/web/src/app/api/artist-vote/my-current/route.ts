import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { MyArtistVote } from '@/types/artistVote';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';
import { getCurrentMonthFirstDayKST } from '@/utils/kst';

export async function GET(): Promise<NextResponse<ApiResponse<MyArtistVote[]>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);
    const currentMonth = getCurrentMonthFirstDayKST();

    const { data, error } = await supabase
      .from('artist_votes')
      .select('artist, amount')
      .eq('user_id', userId)
      .eq('vote_month', currentMonth)
      .order('amount', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
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
