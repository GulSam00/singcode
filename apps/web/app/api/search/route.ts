import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Song {
  title: string;
  artist: string;
  num_tj: string;
  num_ky: string;
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse<Song[]>>> {
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
    const { data, error } = await supabase.from('songs').select('*').textSearch(type, query);

    console.log(data);
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
    const songs: Song[] = data.map(item => ({
      title: item.title,
      artist: item.artist,
      num_tj: item.num_tj,
      num_ky: item.num_ky,
    }));

    return NextResponse.json({
      success: true,
      songs,
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
