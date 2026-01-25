import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function PATCH(): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('point')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        last_check_in: new Date(),
        point: user.point + 10,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in like API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post like song' },
      { status: 500 },
    );
  }
}
