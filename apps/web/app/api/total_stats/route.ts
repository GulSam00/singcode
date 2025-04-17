import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';

// 유효한 카운트 타입 정의
type CountType = 'sing_count' | 'like_count' | 'saved_count';

export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const { songId, countType, isMinus } = await request.json();

    // countType 유효성 검사
    if (!['sing_count', 'like_count', 'saved_count'].includes(countType)) {
      return NextResponse.json({ success: false, error: 'Invalid count type' }, { status: 400 });
    }

    const { data } = await supabase.from('total_stats').select('*').eq('song_id', songId).single();

    if (data) {
      // 기존 레코드 업데이트
      const { error: updateError } = await supabase
        .from('total_stats')
        .update({
          [countType]: data[countType as CountType] + (isMinus ? -1 : 1),
        })
        .eq('song_id', songId);

      if (updateError) throw updateError;
    } else {
      // 새 레코드 생성
      const { error: insertError } = await supabase.from('total_stats').insert({
        song_id: songId,
        [countType]: 1,
        sing_count: countType === 'sing_count' ? 1 : 0,
        like_count: countType === 'like_count' ? 1 : 0,
        saved_count: countType === 'saved_count' ? 1 : 0,
      });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in total_stats API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update total_stats' },
      { status: 500 },
    );
  }
}
