import { NextResponse } from 'next/server';

import createClient from '@/lib/supabase/server';
import { ApiResponse } from '@/types/apiRoute';
import { SongComment } from '@/types/comment';
import { getAuthenticatedUser } from '@/utils/getAuthenticatedUser';

export async function GET(request: Request): Promise<NextResponse<ApiResponse<SongComment[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('songId');

    if (!songId) {
      return NextResponse.json({ success: false, error: 'songId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('song_comments')
      .select('id, song_id, user_id, content, created_at, users(nickname)')
      .eq('song_id', songId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const comments: SongComment[] = (data ?? []).map(row => ({
      id: row.id,
      song_id: row.song_id,
      user_id: row.user_id,
      content: row.content,
      created_at: row.created_at,
      nickname: (row.users as unknown as { nickname: string } | null)?.nickname ?? '알 수 없음',
    }));

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error('Error in GET comments:', error);
    return NextResponse.json({ success: false, error: 'Failed to get comments' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { song_id, content } = await request.json();

    if (!song_id || !content) {
      return NextResponse.json(
        { success: false, error: 'song_id and content are required' },
        { status: 400 },
      );
    }

    if (content.length > 100) {
      return NextResponse.json(
        { success: false, error: '댓글은 100자 이내로 작성해주세요.' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('song_comments')
      .insert({ song_id, user_id: userId, content });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    console.error('Error in POST comment:', error);
    return NextResponse.json({ success: false, error: 'Failed to post comment' }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUser(supabase);

    const { commentId } = await request.json();

    if (!commentId || typeof commentId !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing commentId' }, { status: 400 });
    }

    const { data, error, count } = await supabase
      .from('song_comments')
      .delete({ count: 'exact' })
      .match({ id: commentId, user_id: userId });

    if (error) throw error;

    console.log('data', data, 'count', count);
    if (count === 0) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.cause === 'auth') {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 },
      );
    }
    console.error('Error in DELETE comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment' },
      { status: 500 },
    );
  }
}
