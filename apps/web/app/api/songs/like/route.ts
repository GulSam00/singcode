import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    // like_activities에서 song_id 목록을 가져옴
    const { data: likedSongs, error: likedError } = await supabase
      .from('like_activities')
      .select('song_id')
      .eq('user_id', userId)
      .order('created_at');

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
    const { data, error } = await supabase.from('songs').select('*').in('id', songIds);

    if (error) throw error;

    // tosingSongIds에 포함된 song_id를 가진 노래에 isInToSingList: true 추가
    const processedData = data.map(song => ({
      ...song,
      isInToSingList: tosingSongIds.has(song.id),
    }));

    return NextResponse.json({ success: true, data: processedData });
  } catch (error) {
    console.error('Error in like API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get like songs' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient(); // Supabase 클라이언트 생성
    const userId = await getAuthenticatedUser(supabase); // userId 가져오기

    const { songId } = await request.json();

    const { error } = await supabase
      .from('like_activities')
      .insert({ user_id: userId, song_id: songId });

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
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient(); // Supabase 클라이언트 생성
    const userId = await getAuthenticatedUser(supabase); // userId 가져오기

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
