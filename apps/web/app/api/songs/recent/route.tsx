import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    // sing_logs에서 song_id 목록을 가져옴 (최신순)
    const { data: likedSongs, error: likedError } = await supabase
      .from('sing_logs')
      .select('song_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (likedError) throw likedError;

    // 가져온 song_id 목록을 사용하여 songs 테이블에서 정보를 가져옴
    const songIds = likedSongs.map(item => item.song_id);

    // tosings 테이블에서 해당 user_id와 song_id가 일치하는 레코드를 가져옴
    const { data: tosingSongs, error: tosingError } = await supabase
      .from('tosings')
      .select('song_id')
      .eq('user_id', userId)
      .in('song_id', songIds);

    if (tosingError) throw tosingError;

    const tosingSongIds = new Set(tosingSongs.map(item => item.song_id));

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .in('id', songIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // tosingSongIds에 포함된 song_id를 가진 노래에 isInToSingList: true 추가
    const processedData = data.map(song => ({
      ...song,
      isInToSingList: tosingSongIds.has(song.id),
    }));

    return NextResponse.json({ success: true, data: processedData });
  } catch (error) {
    console.error('Error in recent API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recent songs' },
      { status: 500 },
    );
  }
}
