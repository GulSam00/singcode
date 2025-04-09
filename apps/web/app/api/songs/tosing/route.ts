import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function GET() {
  try {
    const supabase = await createClient(); // Supabase 클라이언트 생성
    const userId = await getAuthenticatedUser(supabase); // userId 가져오기

    const { data, error } = await supabase
      .from('tosings')
      .select(
        `
  order_weight,
  songs (
    id,
    title,
    artist,
    num_tj,
    num_ky
  )
`,
      )
      .eq('user_id', userId)
      .order('order_weight');

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error?.message || 'Unknown error',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in tosings API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get tosings song' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient(); // Supabase 클라이언트 생성
    const userId = await getAuthenticatedUser(supabase); // userId 가져오기
    const { songId } = await request.json();

    const { data: maxRow, error: maxError } = await supabase
      .from('tosings')
      .select('order_weight')
      .eq('user_id', userId)
      .order('order_weight', { ascending: false })
      .limit(1);

    if (maxError) throw maxError;

    const lastWeight = maxRow?.[0]?.order_weight ?? 0;
    const newWeight = lastWeight + 1;

    const { error } = await supabase
      .from('tosings')
      .insert({ user_id: userId, song_id: songId, order_weight: newWeight });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in tosings API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post tosings song' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient(); // Supabase 클라이언트 생성
    const userId = await getAuthenticatedUser(supabase); // userId 가져오기
    const { songId, newWeight } = await request.json();

    if (!songId || newWeight === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing songId or newSequence' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('tosings')
      .update({ order_weight: newWeight })
      .match({ user_id: userId, song_id: songId });
    console.log(userId, songId, newWeight);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in tosings API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to patch tosings song' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient(); // Supabase 클라이언트 생성
    const userId = await getAuthenticatedUser(supabase); // userId 가져오기
    const { songId } = await request.json();

    const { error } = await supabase
      .from('tosings')
      .delete()
      .match({ user_id: userId, song_id: songId })
      .select('*'); // 삭제된 row의 sequence 값을 가져오기 위해 select('*') 추가

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in tosings API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tosings song' },
      { status: 500 },
    );
  }
}
