import { ApiResponse } from '@/types/apiRoute';
import { SaveSong, SaveSongFolderList } from '@/types/song';

import { instance } from './client';

export async function getSaveSong() {
  const response = await instance.get<ApiResponse<SaveSong[]>>('/songs/save');

  return response.data;
}

export async function getSaveFolderSong() {
  const response = await instance.get<ApiResponse<SaveSongFolderList[]>>('/songs/save/folder');

  return response.data;
}

export async function postSaveSong(body: { songId: string; folderName: string }) {
  const response = await instance.post<ApiResponse<void>>('/songs/save', body);
  return response.data;
}

export async function postSaveFolderSong(body: { folderName: string }) {
  const response = await instance.post<ApiResponse<void>>('/songs/save/folder', body);
  return response.data;
}

export async function patchSaveSong(body: { songIdArray: string[]; folderName: string }) {
  const response = await instance.patch<ApiResponse<void>>('/songs/save', body);
  return response.data;
}

export async function deleteSaveSong(body: { songId: string; folderName: string }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/save', { data: body });
  return response.data;
}

export async function deleteSaveFolderSong(body: { folderName: string }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/save/folder', { data: body });
  return response.data;
}

// export async function deleteSaveSongArray(body: { songIds: string[] }) {
//   const response = await instance.delete<ApiResponse<void>>('/songs/save/array', { data: body });
//   return response.data;
// }
