import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { SaveSong, Song } from '@/types/song';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

interface ResponseSaveLog extends SaveSong {
  folder_name: string;
  songs: Song;
}

export async function GET(): Promise<NextResponse<ApiResponse<SaveSong[]>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    // save_activities에서 song_id 목록을 가져옴
    const { data, error: saveError } = await supabase
      .from('save_activities')
      .select(
        `*,
        songs (
          *
        )
    `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (saveError) throw saveError;

    const saveSongs = data.map((item: ResponseSaveLog) => ({
      id: item.user_id + item.song_id,
      folder_name: item.folder_name,
      user_id: item.user_id,
      song_id: item.songs.id,
      created_at: item.created_at,
      title: item.songs.title,
      artist: item.songs.artist,
      num_tj: item.songs.num_tj,
      num_ky: item.songs.num_ky,
    }));

    // 가져온 song_id 목록을 사용하여 songs 테이블에서 정보를 가져옴
    const songIds = saveSongs.map(item => item.song_id);

    // tosings 테이블에서 해당 user_id와 song_id가 일치하는 레코드를 가져옴
    const { data: tosingSongs, error: tosingError } = await supabase
      .from('tosings')
      .select('song_id')
      .eq('user_id', userId)
      .in('song_id', songIds);

    if (tosingError) throw tosingError;

    const tosingSongIds = new Set(tosingSongs.map(item => item.song_id));

    // tosingSongIds에 포함된 song_id를 가진 노래에 isInToSingList: true 추가
    const processedData = saveSongs.map(song => ({
      ...song,
      isInToSingList: tosingSongIds.has(song.song_id),
    }));

    return NextResponse.json({ success: true, data: processedData });
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

export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { songId, folderName } = await request.json();

    const { error } = await supabase
      .from('save_activities')
      .insert({ user_id: userId, song_id: songId, folder_name: folderName });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in like API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post like song' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { songId } = await request.json();

    const { error } = await supabase
      .from('like_activities')
      .delete()
      .match({ user_id: userId, song_id: songId });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete like song' },
      { status: 500 },
    );
  }
}
