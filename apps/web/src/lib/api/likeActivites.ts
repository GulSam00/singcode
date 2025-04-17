import { ApiResponse } from '@/types/apiRoute';
import { PersonalSong } from '@/types/song';

import { instance } from './client';

export async function getLikedSongs() {
  const response = await instance.get<ApiResponse<PersonalSong[]>>('/songs/like');
  return response.data;
}

export async function postLikedSongs(body: { songId: string }) {
  const response = await instance.post<ApiResponse<void>>('/songs/like', body);
  return response.data;
}

export async function deleteLikedSongs(body: { songId: string }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/like', { data: body });
  return response.data;
}

export async function deleteLikedSongsArray(body: { songIds: string[] }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/like/array', { data: body });
  return response.data;
}
