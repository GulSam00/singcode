import { ApiResponse } from '@/types/apiRoute';
import { SaveSong, SongFolderList } from '@/types/song';

import { instance } from './client';

export async function getSaveSong() {
  const response = await instance.get<ApiResponse<SaveSong[]>>('/songs/save');

  return response.data;
}

export async function getSaveFolderSong() {
  const response = await instance.get<ApiResponse<SongFolderList[]>>('/songs/save/folder');

  return response.data;
}

export async function postSaveSong(body: { songId: string; folderName: string }) {
  const response = await instance.post<ApiResponse<void>>('/songs/save', body);
  return response.data;
}

export async function putSaveSong(body: { songId: string; folderName: string }) {
  const response = await instance.put<ApiResponse<void>>('/songs/save', body);
  return response.data;
}

export async function deleteSaveSong(body: { songId: string; folderName: string }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/save', { data: body });
  return response.data;
}

// export async function deleteSaveSongArray(body: { songIds: string[] }) {
//   const response = await instance.delete<ApiResponse<void>>('/songs/save/array', { data: body });
//   return response.data;
// }
