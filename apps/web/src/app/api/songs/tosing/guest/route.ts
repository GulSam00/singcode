import { NextRequest, NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { ToSingSong } from '@/types/song';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ToSingSong[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.getAll('songIds[]');

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('songs')
      .select('*', { count: 'exact' })
      .in('id', ids);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error?.message || 'Unknown error',
        },
        { status: 500 },
      );
    }

    const toSingSongs = data.map((song, index) => ({
      songs: song,
      order_weight: index,
    }));

    return NextResponse.json({ success: true, data: toSingSongs });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        {
          success: false,
          error: 'User not authenticated',
        },
        { status: 401 },
      );
    }

    console.error('Error in tosing API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get tosing songs' },
      { status: 500 },
    );
  }
}
