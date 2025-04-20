import { ApiResponse } from '@/types/apiRoute';
import { PersonalSong } from '@/types/song';

import { instance } from './client';

export async function getLikeSongs() {
  const response = await instance.get<ApiResponse<PersonalSong[]>>('/songs/like');
  return response.data.data;
}

export async function postLikeSong(body: { songId: string }) {
  const response = await instance.post<ApiResponse<void>>('/songs/like', body);
  return response.data.data;
}

export async function deleteLikeSong(body: { songId: string }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/like', { data: body });
  return response.data.data;
}

export async function deleteLikeSongArray(body: { songIds: string[] }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/like/array', { data: body });
  return response.data.data;
}
