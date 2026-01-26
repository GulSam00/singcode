import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { Song } from '@/types/song';

interface ThumbUpSong extends Song {
  total_thumb: number;
}

export async function GET(): Promise<NextResponse<ApiResponse<ThumbUpSong[]>>> {
  try {
    const supabase = await createClient();

    // like_activities에서 song_id 목록을 가져옴
    const { data, error: thumbUpError } = await supabase
      .from('total_stats')
      .select(
        `total_thumb,
        ...songs (
          *
        )
    `,
      )
      .order('total_thumb', { ascending: false })
      .limit(50);

    if (thumbUpError) throw thumbUpError;

    return NextResponse.json({ success: true, data });
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
    console.error('Error in like API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get like songs' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();

    const { point, songId } = await request.json();

    const { data } = await supabase
      .from('total_stats')
      .select('total_thumb')
      .eq('song_id', songId)
      .single();

    if (data) {
      const totalThumb = data.total_thumb + point;

      const { error: updateError } = await supabase
        .from('total_stats')
        .update({ total_thumb: totalThumb })
        .eq('song_id', songId);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('total_stats')
        .insert({ song_id: songId, total_thumb: point });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in like API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post like song' },
      { status: 500 },
    );
  }
}
