import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { SearchSong, Song } from '@/types/song';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

interface DBSong extends Song {
  total_stats: {
    total_thumb: number;
  };
  tosings: {
    user_id: string;
  }[];
  like_activities: {
    user_id: string;
  }[];
  save_activities: {
    user_id: string;
  }[];
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse<SearchSong[]>>> {
  // API KEY 노출을 막기 위해 미들웨어 역할을 할 API ROUTE 활용
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'title';
    const order = type === 'all' ? 'title' : type; // 'all' 타입은 title로 정렬
    const authenticated = searchParams.get('authenticated') === 'true';

    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = 20;
    const from = page * size;
    const to = from + size - 1;

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

    if (!authenticated) {
      const baseQuery = supabase.from('songs').select(
        `*, 
        total_stats (
          *
        )
        `,
        { count: 'exact' },
      );

      if (type === 'all') {
        baseQuery.or(`title.ilike.%${query}%,artist.ilike.%${query}%`);
      } else {
        baseQuery.ilike(type, `%${query}%`);
      }

      const { data, error, count } = await baseQuery.order(order).range(from, to);

      if (error) {
        return NextResponse.json(
          {
            success: false,
            error: error?.message || 'Unknown error',
          },
          { status: 500 },
        );
      }

      const songs: SearchSong[] = data.map((song: DBSong) => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        num_tj: song.num_tj,
        num_ky: song.num_ky,
        isLike: false,
        isToSing: false,
        isSave: false,
        thumb: song.total_stats?.total_thumb ?? 0,
      }));

      return NextResponse.json({
        success: true,
        data: songs,
        // 전체 개수가 현재 페이지 번호 * 페이지 크기(범위의 끝이 되는 index) 보다 크면 다음 페이지가 있음
        hasNext: (count ?? 0) > to + 1,
      });
    }

    const userId = await getAuthenticatedUser(supabase); // userId 가져오기

    const baseQuery = supabase.from('songs').select(
      `
        *,
        total_stats (
          *
        ),
        tosings (
          user_id
        ),
        like_activities (
          user_id
        ),
        save_activities (
          user_id
        )
      `,
      { count: 'exact' },
    );

    if (type === 'all') {
      baseQuery.or(`title.ilike.%${query}%,artist.ilike.%${query}%`);
    } else {
      baseQuery.ilike(type, `%${query}%`);
    }

    const { data, error, count } = await baseQuery.order(order).range(from, to);

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

      isToSing: song.tosings?.some(tosing => tosing.user_id === userId) ?? false,
      isLike: song.like_activities?.some(like => like.user_id === userId) ?? false,
      isSave: song.save_activities?.some(save => save.user_id === userId) ?? false,
      thumb: song.total_stats?.total_thumb ?? 0,
    }));

    return NextResponse.json({
      success: true,
      data: songs,
      hasNext: (count ?? 0) > to + 1,
    });
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
