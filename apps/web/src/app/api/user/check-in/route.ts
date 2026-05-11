import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function PATCH(): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { error: checkInError } = await supabase
      .from('users')
      .update({ last_check_in: new Date() })
      .eq('id', userId);

    if (checkInError) throw checkInError;

    const { error: pointError } = await supabase.rpc('record_point_change', {
      p_user_id: userId,
      p_amount: 30,
      p_description: '출석 체크',
    });

    if (pointError) throw pointError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in check-in API:', error);
    return NextResponse.json({ success: false, error: 'Failed to check in' }, { status: 500 });
  }
}
