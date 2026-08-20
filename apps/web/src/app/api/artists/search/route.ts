import { NextRequest, NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { ArtistSearchResult } from '@/types/artist';

const RESULT_LIMIT = 10;

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ArtistSearchResult[]>>> {
  try {
    const query = request.nextUrl.searchParams.get('q')?.trim();
    if (!query) {
      return NextResponse.json({ success: true, data: [] });
    }

    const supabase = await createClient();
    const pattern = `%${query}%`;

    // 원어 표기(name)와 한국어 표기(name_ko) 양쪽을 각각 조회해 합친다.
    // ilike 값은 supabase-js가 바인딩 파라미터로 보내므로 or() 필터 문자열 조립보다 안전하다.
    const [byName, byNameKo] = await Promise.all([
      supabase
        .from('artists')
        .select('name, name_ko, country_code')
        .ilike('name', pattern)
        .limit(RESULT_LIMIT),
      supabase
        .from('artists')
        .select('name, name_ko, country_code')
        .ilike('name_ko', pattern)
        .limit(RESULT_LIMIT),
    ]);

    if (byName.error) throw byName.error;
    if (byNameKo.error) throw byNameKo.error;

    const merged = new Map<string, ArtistSearchResult>();
    for (const row of [...(byName.data ?? []), ...(byNameKo.data ?? [])]) {
      merged.set(row.name, row);
    }

    return NextResponse.json({
      success: true,
      data: [...merged.values()].slice(0, RESULT_LIMIT),
    });
  } catch (error) {
    console.error('Error in GET artists search:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search artists' },
      { status: 500 },
    );
  }
}
