import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function PATCH(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const { point } = await request.json();

    const userId = await getAuthenticatedUser(supabase);

    const { error: cosumeError } = await supabase
      .from('users')
      .update({ point: point })
      .eq('id', userId);

    if (cosumeError) throw cosumeError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in like API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post like song' },
      { status: 500 },
    );
  }
}
