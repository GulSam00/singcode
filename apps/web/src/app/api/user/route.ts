import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

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
