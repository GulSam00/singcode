import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { MyReport, REPORT_CATEGORIES, ReportCategory, ReportStatus } from '@/types/report';
import { Song } from '@/types/song';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

const POSTGRES_UNIQUE_VIOLATION = '23505';

function isReportCategory(value: unknown): value is ReportCategory {
  return typeof value === 'string' && REPORT_CATEGORIES.includes(value as ReportCategory);
}

interface ReportRow {
  id: string;
  song_id: string;
  category: ReportCategory;
  suggested_value: string | null;
  status: ReportStatus;
  created_at: string;
  songs: Pick<Song, 'title' | 'artist' | 'title_ko' | 'artist_ko' | 'num_tj' | 'num_ky'> | null;
}

export async function GET(): Promise<NextResponse<ApiResponse<MyReport[]>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { data, error } = await supabase
      .from('song_reports')
      .select(
        `id, song_id, category, suggested_value, status, created_at,
         songs ( title, artist, title_ko, artist_ko, num_tj, num_ky )`,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<ReportRow[]>();

    if (error) throw error;

    const reports: MyReport[] = (data ?? []).map(row => ({
      id: row.id,
      song_id: row.song_id,
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
    console.error('Error in report GET API:', error);
    return NextResponse.json({ success: false, error: 'Failed to get reports' }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { reportId } = await request.json();

    if (!reportId || typeof reportId !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing reportId' }, { status: 400 });
    }

    const { error, count } = await supabase
      .from('song_reports')
      .delete({ count: 'exact' })
      .match({ id: reportId, user_id: userId });

    if (error) throw error;

    if (count === 0) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    console.error('Error in report DELETE API:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete report' }, { status: 500 });
  }
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
