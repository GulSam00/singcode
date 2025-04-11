import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function POST(request: Request) {
  try {
    const supabase = await createClient(); // Supabase 클라이언트 생성
    const { songId } = await request.json();
    const userId = await getAuthenticatedUser(supabase); // userId 가져오기

    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('song_id', songId)
      .single();

    if (data) {
      // 있다면 count 증가
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          sing_count: data.sing_count + 1,
          last_sing_at: new Date().toISOString(), // 현재 시각으로 갱신
        })
        .eq('song_id', songId)
        .eq('user_id', userId); // userId 조건 추가

      if (updateError) throw updateError;
    } else {
      // 없다면 새로운 레코드 생성
      const { error: insertError } = await supabase.from('user_stats').insert({
        song_id: songId,
        user_id: userId, // userId 추가
        sing_count: 1,
        last_sing_at: new Date().toISOString(), // 현재 시각 설정
      });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in tosings API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post user_stats' },
      { status: 500 },
    );
  }
}
