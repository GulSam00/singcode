import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { ToSingSong } from '@/types/song';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function GET(): Promise<NextResponse<ApiResponse<ToSingSong[]>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

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

    return NextResponse.json({ success: true, data: data as unknown as ToSingSong[] });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        {
          success: false,
          error: 'User not authenticated',
        },
        { status: 401 },
      );
    }

    console.error('Error in tosing API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get tosing songs' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

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
    console.error('Error in tosing API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post tosing song' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

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

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in tosing API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to patch tosing song' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { songId } = await request.json();

    const { error } = await supabase
      .from('tosings')
      .delete()
      .match({ user_id: userId, song_id: songId });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in tosing API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tosing song' },
      { status: 500 },
    );
  }
}
