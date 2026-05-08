import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function PATCH(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const { amount, description } = await request.json();

    const userId = await getAuthenticatedUser(supabase);

    const { error } = await supabase.rpc('record_point_change', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in point API:', error);
    return NextResponse.json({ success: false, error: 'Failed to update point' }, { status: 500 });
  }
}
