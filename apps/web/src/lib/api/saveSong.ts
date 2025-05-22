import { ApiResponse } from '@/types/apiRoute';
import { SaveSong } from '@/types/song';

import { instance } from './client';

export async function getSaveSong() {
  const response = await instance.get<ApiResponse<SaveSong[]>>('/songs/save');

  return response.data;
}

export async function postSaveSong(body: { songId: string; folderName: string }) {
  const response = await instance.post<ApiResponse<void>>('/songs/save', body);
  return response.data;
}

export async function patchSaveSong(body: { songIdArray: string[]; folderId: string }) {
  const response = await instance.patch<ApiResponse<void>>('/songs/save', body);
  return response.data;
}

export async function deleteSaveSong(body: { songId: string; folderId: string }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/save', { data: body });
  return response.data;
}
