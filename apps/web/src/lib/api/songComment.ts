import { ApiResponse } from '@/types/apiRoute';
import { SongComment } from '@/types/comment';

import { instance } from './client';

export async function getSongComments(songId: string) {
  const response = await instance.get<ApiResponse<SongComment[]>>('/songs/comments', {
    params: { songId },
  });
  return response.data;
}

export async function postSongComment(body: { song_id: string; content: string }) {
  const response = await instance.post<ApiResponse<void>>('/songs/comments', body);
  return response.data;
}

export async function deleteSongComment(commentId: string) {
  const response = await instance.delete<ApiResponse<void>>(`/songs/comments/${commentId}`);
  return response.data;
}
