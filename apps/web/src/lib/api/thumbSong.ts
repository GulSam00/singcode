import { ApiResponse } from '@/types/apiRoute';
import { Song } from '@/types/song';

import { instance } from './client';

export async function getSongThumbList() {
  const response = await instance.get<ApiResponse<Song[]>>('/songs/thumb-up');
  return response.data;
}

export async function patchSongThumb(body: { songId: string; point: number }) {
  const response = await instance.patch<ApiResponse<void>>('/songs/thumb-up', body);
  return response.data;
}
