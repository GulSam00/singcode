import { ApiResponse } from '@/types/apiRoute';
import { ToSingSong } from '@/types/song';

import { instance } from './client';

export async function getToSingSongs() {
  const response = await instance.get<ApiResponse<ToSingSong[]>>('/songs/tosing');
  return response.data;
}

export async function patchToSingSongs(body: { songId: string; newWeight: number }) {
  const response = await instance.patch<ApiResponse<void>>('/songs/tosing', body);
  return response.data;
}

export async function postToSingSongs(body: { songId: string }) {
  const response = await instance.post<ApiResponse<void>>('/songs/tosing', body);
  return response.data;
}

export async function postToSingSongsArray(body: { songIds: string[] }) {
  const response = await instance.post<ApiResponse<void>>('/songs/tosing/array', body);
  return response.data;
}

export async function deleteToSingSongs(body: { songId: string }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/tosing', { data: body });
  return response.data;
}

export async function deleteToSingSongsArray(body: { songIds: string[] }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/tosing/array', { data: body });
  return response.data;
}
