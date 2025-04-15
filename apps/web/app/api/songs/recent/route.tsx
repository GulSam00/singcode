import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { SingLog } from '@/types/singLog';
import { Song } from '@/types/song';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

interface ResponseSingLog extends SingLog {
  songs: Song;
}
export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    // sing_logs에서 song_id 목록을 가져옴 (최신순)
    const { data, error: recentError } = await supabase
      .from('sing_logs') // sing_logs 테이블에서 시작
      .select(
        `*,
        songs (
          *
        )
    `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // 단순히 sing_logs의 created_at으로 정렬
      .limit(10);

    if (recentError) throw recentError;

    const recentSongs = data?.map((item: ResponseSingLog) => ({
      id: item.id,
      user_id: item.user_id,
      song_id: item.songs.id,
      created_at: item.created_at,
      title: item.songs.title,
      artist: item.songs.artist,
      num_tj: item.songs.num_tj,
      num_ky: item.songs.num_ky,
    }));

    // 가져온 song_id 목록을 사용하여 songs 테이블에서 정보를 가져옴
    const songIds = recentSongs.map(item => item.song_id);

    // tosings 테이블에서 해당 user_id와 song_id가 일치하는 레코드를 가져옴
    const { data: tosingSongs, error: tosingError } = await supabase
      .from('tosings')
      .select('song_id')
      .eq('user_id', userId)
      .in('song_id', songIds);

    if (tosingError) throw tosingError;

    const tosingSongIds = new Set(tosingSongs.map(item => item.song_id));

    // tosingSongIds에 포함된 song_id를 가진 노래에 isInToSingList: true 추가
    const processedData = recentSongs.map(song => ({
      ...song,
      isInToSingList: tosingSongIds.has(song.song_id),
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
