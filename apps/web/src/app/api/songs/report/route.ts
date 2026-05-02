import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { REPORT_CATEGORIES, ReportCategory } from '@/types/report';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

const POSTGRES_UNIQUE_VIOLATION = '23505';

function isReportCategory(value: unknown): value is ReportCategory {
  return typeof value === 'string' && REPORT_CATEGORIES.includes(value as ReportCategory);
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { songId, category, suggested_value } = await request.json();

    if (!songId || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing songId or category' },
        { status: 400 },
      );
    }

    if (!isReportCategory(category)) {
      return NextResponse.json({ success: false, error: 'Invalid category' }, { status: 400 });
    }

    const isNumberCategory = category === 'num_tj' || category === 'num_ky';

    let normalizedSuggestedValue: string | null;
    if (suggested_value === null) {
      if (!isNumberCategory) {
        return NextResponse.json(
          { success: false, error: 'suggested_value is required for this category' },
          { status: 400 },
        );
      }
      normalizedSuggestedValue = null;
    } else if (typeof suggested_value === 'string') {
      const trimmed = suggested_value.trim();
      if (!trimmed) {
        return NextResponse.json(
          { success: false, error: 'Missing suggested_value' },
          { status: 400 },
        );
      }
      if (isNumberCategory && !/^\d{1,5}$/.test(trimmed)) {
        return NextResponse.json(
          { success: false, error: 'Invalid number format' },
          { status: 400 },
        );
      }
      normalizedSuggestedValue = trimmed;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid suggested_value' },
        { status: 400 },
      );
    }

    const { error: insertError } = await supabase.from('song_reports').insert({
      user_id: userId,
      song_id: songId,
      category,
      suggested_value: normalizedSuggestedValue,
    });

    if (insertError) {
      if ((insertError as { code?: string }).code === POSTGRES_UNIQUE_VIOLATION) {
        return NextResponse.json({ success: false, error: 'Already reported' }, { status: 409 });
      }
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    console.error('Error in report API:', error);
    return NextResponse.json({ success: false, error: 'Failed to post report' }, { status: 500 });
  }
}
