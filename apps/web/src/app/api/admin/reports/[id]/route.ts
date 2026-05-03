import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { AdminReportAction, ReportCategory, ReportStatus } from '@/types/report';
import { getAdminUser } from '@/utils/getAdminUser';

const CATEGORY_TO_SONG_COLUMN: Record<
  ReportCategory,
  'title_ko' | 'artist_ko' | 'num_tj' | 'num_ky'
> = {
  title_translation: 'title_ko',
  artist_translation: 'artist_ko',
  num_tj: 'num_tj',
  num_ky: 'num_ky',
};

function isAdminReportAction(value: unknown): value is AdminReportAction {
  return value === 'approve' || value === 'reject';
}

interface ReportLookupRow {
  status: ReportStatus;
  song_id: string;
  category: ReportCategory;
  suggested_value: string | null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    await getAdminUser(supabase);

    const { id: reportId } = await params;
    const { action } = await request.json();

    if (!reportId) {
      return NextResponse.json({ success: false, error: 'Missing reportId' }, { status: 400 });
    }
    if (!isAdminReportAction(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const { data: report, error: lookupError } = await supabase
      .from('song_reports')
      .select('status, song_id, category, suggested_value')
      .eq('id', reportId)
      .maybeSingle<ReportLookupRow>();

    if (lookupError) throw lookupError;
    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }
    if (report.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Report already processed' },
        { status: 409 },
      );
    }

    if (action === 'approve') {
      const column = CATEGORY_TO_SONG_COLUMN[report.category];
      const { error: songUpdateError } = await supabase
        .from('songs')
        .update({ [column]: report.suggested_value })
        .eq('id', report.song_id);

      if (songUpdateError) throw songUpdateError;

      const { error: statusUpdateError } = await supabase
        .from('song_reports')
        .update({ status: 'applied' })
        .eq('id', reportId);

      if (statusUpdateError) throw statusUpdateError;
    } else {
      const { error: rejectError } = await supabase
        .from('song_reports')
        .update({ status: 'rejected' })
        .eq('id', reportId);

      if (rejectError) throw rejectError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    if (error instanceof Error && error.cause === 'forbidden') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error in admin report PATCH API:', error);
    return NextResponse.json({ success: false, error: 'Failed to update report' }, { status: 500 });
  }
}
