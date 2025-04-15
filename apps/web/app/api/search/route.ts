import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { SearchSong, Song } from '@/types/song';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

// interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   error?: string;
// }

interface DBSong extends Song {
  like_activities: {
    user_id: string;
  }[];
  tosings: {
    user_id: string;
  }[];
}
// export async function GET(request: Request): Promise<NextResponse<ApiResponse<SearchSong[]>>> {
export async function GET(request: Request) {
  // API KEY 노출을 막기 위해 미들웨어 역할을 할 API ROUTE 활용
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'title';

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'No query provided',
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase); // userId 가져오기

    // .select(
    //   `
    //   *,
    //   like_activities!left (
    //     user_id
    //   ),
    //   tosings!left (
    //     user_id
    //   )
    // `,
    // )
    const { data, error } = await supabase
      .from('songs')
      .select(
        `
        *,
        like_activities (
          user_id
        ),
        tosings (
          user_id
        )
      `,
      )
      .ilike(type, `%${query}%`);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error?.message || 'Unknown error',
        },
        { status: 500 },
      );
    }

    // data를 Song 타입으로 파싱해야 함
    const songs: SearchSong[] = data.map((song: DBSong) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      num_tj: song.num_tj,
      num_ky: song.num_ky,
      // like_activities에서 현재 사용자의 데이터가 있는지 확인
      isLiked: song.like_activities?.some(like => like.user_id === userId) ?? false,
      // tosings에서 현재 사용자의 데이터가 있는지 확인
      isToSing: song.tosings?.some(tosing => tosing.user_id === userId) ?? false,
    }));

    return NextResponse.json({
      success: true,
      data: songs,
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
