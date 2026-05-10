// Supabase table required:
// CREATE TABLE point_logs (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
//   description text NOT NULL,
//   amount int NOT NULL,
//   balance_after int NOT NULL,
//   created_at timestamptz DEFAULT now()
// );
import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { PointLog } from '@/types/pointLog';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function GET(): Promise<NextResponse<ApiResponse<PointLog[]>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { data, error } = await supabase
      .from('point_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to get point logs' },
      { status: 500 },
    );
  }
}
