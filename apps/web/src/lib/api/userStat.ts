import { ApiResponse } from '@/types/apiRoute';
import { UserSongStat } from '@/types/userStat';

import { instance } from './client';

export async function getUserStats() {
  const response = await instance.get<ApiResponse<UserSongStat[]>>('/user_stats');
  return response.data;
}

export async function postUserStat(songId: string) {
  const response = await instance.post<ApiResponse<void>>('/user_stats', { songId });
  return response.data;
}
