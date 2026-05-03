import { NextRequest, NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import {
  ADMIN_REPORT_STATUS_FILTERS,
  AdminReport,
  AdminReportStatusFilter,
  ReportCategory,
  ReportStatus,
} from '@/types/report';
import { Song } from '@/types/song';
import { getAdminUser } from '@/utils/getAdminUser';

interface AdminReportRow {
  id: string;
  song_id: string;
  user_id: string;
  category: ReportCategory;
  suggested_value: string | null;
  status: ReportStatus;
  created_at: string;
  songs: Pick<Song, 'title' | 'artist' | 'title_ko' | 'artist_ko' | 'num_tj' | 'num_ky'> | null;
  users: { nickname: string } | null;
}

function isStatusFilter(value: string | null): value is AdminReportStatusFilter {
  return value !== null && ADMIN_REPORT_STATUS_FILTERS.includes(value as AdminReportStatusFilter);
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<AdminReport[]>>> {
  try {
    const supabase = await createClient();
    await getAdminUser(supabase);

    const statusParam = request.nextUrl.searchParams.get('status');
    const statusFilter: AdminReportStatusFilter = isStatusFilter(statusParam) ? statusParam : 'all';

    let query = supabase
      .from('song_reports')
      .select(
        `id, song_id, user_id, category, suggested_value, status, created_at,
         songs ( title, artist, title_ko, artist_ko, num_tj, num_ky ),
         users ( nickname )`,
      )
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query.returns<AdminReportRow[]>();

    if (error) throw error;

    const reports: AdminReport[] = (data ?? []).map(row => ({
      id: row.id,
      song_id: row.song_id,
      user_id: row.user_id,
      nickname: row.users?.nickname ?? '알 수 없음',
      category: row.category,
      suggested_value: row.suggested_value,
      status: row.status,
      created_at: row.created_at,
      title: row.songs?.title ?? '',
      artist: row.songs?.artist ?? '',
      title_ko: row.songs?.title_ko,
      artist_ko: row.songs?.artist_ko,
      num_tj: row.songs?.num_tj ?? '',
      num_ky: row.songs?.num_ky ?? '',
    }));

    return NextResponse.json({ success: true, data: reports });
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
    console.error('Error in admin reports GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get admin reports' },
      { status: 500 },
    );
  }
}
