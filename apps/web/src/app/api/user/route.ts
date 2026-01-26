import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { User } from '@/types/user';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function GET(): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    // like_activities에서 song_id 목록을 가져옴
    const { data, error } = await supabase.from('users').select(`*`).eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
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

export async function DELETE(): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    await supabase.auth.admin.deleteUser(userId);

    return NextResponse.json({
      success: true,
      message: '회원 탈퇴 완료',
    });
  } catch (error) {
    console.error('회원 탈퇴 실패:', error);
    return NextResponse.json({
      success: false,
      message: '회원 탈퇴 실패',
    });
  }
}
