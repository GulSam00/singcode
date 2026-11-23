import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { CheckInResult } from '@/types/user';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';
import { toPointRpcErrorResponse } from '@/utils/pointRpcError';

const isCheckInResult = (value: unknown): value is CheckInResult =>
  typeof value === 'object' &&
  value !== null &&
  'awarded' in value &&
  'last_check_in' in value &&
  'point' in value &&
  typeof value.awarded === 'boolean' &&
  typeof value.last_check_in === 'string' &&
  typeof value.point === 'number';

// 출석 판정(KST 하루 한 번)과 last_check_in 갱신·+30P 적립은 daily_check_in RPC가 한 트랜잭션으로 한다.
// 이미 오늘 출석했으면 적립 없이 awarded=false로 성공한다 — 앱 진입 시 자동으로 부르기 때문이다.
export async function PATCH(): Promise<NextResponse<ApiResponse<CheckInResult>>> {
  try {
    const supabase = await createClient();
    await getAuthenticatedUser(supabase);

    const { data, error } = await supabase.rpc('daily_check_in');

    if (error) {
      const mapped = toPointRpcErrorResponse(error);
      if (mapped) {
        return NextResponse.json(
          { success: false, error: mapped.error },
          { status: mapped.status },
        );
      }
      throw error;
    }

    if (!isCheckInResult(data)) {
      throw new Error('Unexpected daily_check_in response');
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    console.error('Error in check-in API:', error);
    return NextResponse.json({ success: false, error: 'Failed to check in' }, { status: 500 });
  }
}
