import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { CountType, PeriodType, SongStat } from '@/types/totalStat';

// API KEY 노출을 막기 위해 미들웨어 역할을 할 API ROUTE 활용

export async function GET(request: Request): Promise<NextResponse<ApiResponse<SongStat[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const countType = searchParams.get('countType') as CountType;
    const periodType = searchParams.get('periodType') as PeriodType;

    if (!countType || !periodType) {
      return NextResponse.json(
        {
          success: false,
          error: 'No query provided',
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    let resonse = [];
    switch (countType) {
      case 'sing_count': {
        let startDate = new Date();
        let endDate: Date;
        switch (periodType) {
          case 'all':
            startDate = new Date(0); // 1970-01-01
            endDate = new Date(); // 현재 날짜
            break;
          case 'year':
            startDate = new Date(startDate.getFullYear(), 0, 1); // 올해의 첫날
            endDate = new Date(startDate.getFullYear() + 1, 0, 1); // 내년의 첫날
            break;
          case 'month':
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1); // 이번 달의 첫날
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1); // 다음 달의 첫날
            break;
          default:
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid period type',
              },
              { status: 400 },
            );
        }
        const { data: singCountData, error: singCountError } = await supabase
          .from('total_stats')
          .select('*, songs(*)')
          .gte('created_at', startDate.toISOString())
          .lt('created_at', endDate.toISOString())
          .gt('sing_count', 0)
          .order('sing_count', { ascending: false })
          .limit(10);

        if (singCountError) {
          return NextResponse.json(
            {
              success: false,
              error: singCountError?.message || 'Unknown error',
            },
            { status: 500 },
          );
        }
        resonse = singCountData.map(item => ({
          value: item.sing_count,
          song: item.songs,
        }));
        break;
      }

      case 'like_count': {
        const { data: likeCountData, error: likeCountError } = await supabase
          .from('total_stats')
          .select('*, songs(*)')
          .gt('like_count', 0)
          .order('like_count', { ascending: false })
          .limit(10);

        if (likeCountError) {
          return NextResponse.json(
            {
              success: false,
              error: likeCountError?.message || 'Unknown error',
            },
            { status: 500 },
          );
        }
        resonse = likeCountData.map(item => ({
          value: item.like_count,
          song: item.songs,
        }));
        break;
      }
      case 'saved_count': {
        const { data: savedCountData, error: savedCountError } = await supabase
          .from('total_stats')
          .select('*, songs(*)')
          .gt('saved_count', 0)
          .order('saved_count', { ascending: false })
          .limit(10);

        if (savedCountError) {
          return NextResponse.json(
            {
              success: false,
              error: savedCountError?.message || 'Unknown error',
            },
            { status: 500 },
          );
        }
        resonse = savedCountData.map(item => ({
          value: item.saved_count,
          song: item.songs,
        }));
        break;
      }
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid count type',
          },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      data: resonse,
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const { songId, countType, isMinus } = await request.json();

    // countType 유효성 검사
    if (!['sing_count', 'like_count', 'saved_count'].includes(countType)) {
      return NextResponse.json({ success: false, error: 'Invalid count type' }, { status: 400 });
    }

    const { data } = await supabase.from('total_stats').select('*').eq('song_id', songId).single();

    if (data) {
      // 기존 레코드 업데이트
      const { error: updateError } = await supabase
        .from('total_stats')
        .update({
          [countType]: data[countType as CountType] + (isMinus ? -1 : 1),
        })
        .eq('song_id', songId);

      if (updateError) throw updateError;
    } else {
      // 새 레코드 생성
      const { error: insertError } = await supabase.from('total_stats').insert({
        song_id: songId,
        [countType]: 1,
        sing_count: countType === 'sing_count' ? 1 : 0,
        like_count: countType === 'like_count' ? 1 : 0,
        saved_count: countType === 'saved_count' ? 1 : 0,
      });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in total_stats API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update total_stats' },
      { status: 500 },
    );
  }
}
