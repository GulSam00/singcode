import { ApiResponse } from '@/types/apiRoute';
import { SaveSongFolderList } from '@/types/song';

import { instance } from './client';

export async function getSaveFolderSong() {
  const response = await instance.get<ApiResponse<SaveSongFolderList[]>>('/songs/save/folder');

  return response.data;
}

export async function postSaveFolderSong(body: { folderName: string }) {
  const response = await instance.post<ApiResponse<void>>('/songs/save/folder', body);
  return response.data;
}

export async function patchSaveFolderSong(body: { folderId: string; folderName: string }) {
  const response = await instance.patch<ApiResponse<void>>('/songs/save/folder', body);
  return response.data;
}

export async function deleteSaveFolderSong(body: { folderId: string }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/save/folder', { data: body });
  return response.data;
}
