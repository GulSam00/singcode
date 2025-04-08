import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { userId, songId } = await request.json();
    const supabase = await createClient();

    const { count, error: countError } = await supabase
      .from('tosings')
      .select('*', { count: 'exact', head: true }) // count만 가져옴
      .eq('user_id', userId);

    if (countError) throw countError;

    const sequence = count ? count : 0;

    const { error } = await supabase
      .from('tosings')
      .insert({ user_id: userId, song_id: songId, sequence });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post tosings song' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, songId } = await request.json();
    const supabase = await createClient();
    const { error } = await supabase
      .from('tosings')
      .delete()
      .match({ user_id: userId, song_id: songId });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tosings song' },
      { status: 500 },
    );
  }
}
