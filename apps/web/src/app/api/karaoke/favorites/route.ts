// Supabase table required:
// CREATE TABLE karaoke_favorites (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
//   place_id text NOT NULL,
//   place_name text NOT NULL,
//   address text NOT NULL,
//   lat float8 NOT NULL,
//   lng float8 NOT NULL,
//   created_at timestamptz DEFAULT now(),
//   UNIQUE(user_id, place_id)
// );

import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { KaraokeFavorite } from '@/types/karaoke';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function GET(): Promise<NextResponse<ApiResponse<KaraokeFavorite[]>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { data, error } = await supabase
      .from('karaoke_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to get favorites' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { placeId, placeName, address, lat, lng } = await request.json();

    const { error } = await supabase.from('karaoke_favorites').insert({
      user_id: userId,
      place_id: placeId,
      place_name: placeName,
      address,
      lat,
      lng,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { placeId } = await request.json();

    const { error } = await supabase
      .from('karaoke_favorites')
      .delete()
      .match({ user_id: userId, place_id: placeId });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete favorite' }, { status: 500 });
  }
}
