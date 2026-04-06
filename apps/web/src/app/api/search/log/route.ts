import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';

interface SearchLogCount {
  text: string;
  count: number;
}

export async function GET(): Promise<NextResponse<ApiResponse<SearchLogCount[]>>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('search_logs').select('text');

    if (error) throw error;

    const countMap = new Map<string, number>();
    for (const row of data) {
      countMap.set(row.text, (countMap.get(row.text) ?? 0) + 1);
    }

    const result: SearchLogCount[] = Array.from(countMap, ([text, count]) => ({
      text,
      count,
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }

    console.error('Error in search log GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get search logs' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const { text } = await request.json();

    const supabase = await createClient();
    const { error } = await supabase.from('search_logs').insert({ text });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }

    console.error('Error in search log POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post search log' },
      { status: 500 },
    );
  }
}
