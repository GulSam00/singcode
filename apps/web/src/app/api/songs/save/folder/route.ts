import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { SongFolderList } from '@/types/song';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function GET(): Promise<NextResponse<ApiResponse<SongFolderList[]>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    // save_activities에서 song_id 목록을 가져옴
    const { data, error: saveError } = await supabase
      .from('save_folders')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (saveError) throw saveError;

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    // if (error instanceof Error && error.cause === 'auth') {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: 'User not authenticated',
    //     },
    //     { status: 401 },
    //   );
    // }
    console.error('Error in save folder API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get save folder songs' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { folderName } = await request.json();

    const { error } = await supabase
      .from('save_folders')
      .insert({ user_id: userId, folder_name: folderName });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in save folder API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post save folder' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { folderName } = await request.json();

    const { error } = await supabase
      .from('save_folders')
      .delete()
      .match({ user_id: userId, folder_name: folderName });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in save folder API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete save folder' },
      { status: 500 },
    );
  }
}
