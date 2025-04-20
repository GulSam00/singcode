import { ApiResponse } from '@/types/apiRoute';
import { ToSingSong } from '@/types/song';

import { instance } from './client';

export async function getToSingSong() {
  const response = await instance.get<ApiResponse<ToSingSong[]>>('/songs/tosing');
  return response.data.data;
}

export async function patchToSingSong(body: { songId: string; newWeight: number }) {
  const response = await instance.patch<ApiResponse<void>>('/songs/tosing', body);
  return response.data.data;
}

export async function postToSingSong(body: { songId: string }) {
  const response = await instance.post<ApiResponse<void>>('/songs/tosing', body);
  return response.data.data;
}

export async function postToSingSongArray(body: { songIds: string[] }) {
  const response = await instance.post<ApiResponse<void>>('/songs/tosing/array', body);
  return response.data.data;
}

export async function deleteToSingSong(body: { songId: string }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/tosing', { data: body });
  return response.data.data;
}

export async function deleteToSingSongArray(body: { songIds: string[] }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/tosing/array', { data: body });
  return response.data.data;
}
