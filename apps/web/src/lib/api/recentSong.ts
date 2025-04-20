import { ApiResponse } from '@/types/apiRoute';
import { PersonalSong } from '@/types/song';

import { instance } from './client';

export async function getRecentSong() {
  const response = await instance.get<ApiResponse<PersonalSong[]>>('/songs/recent');
  return response.data.data;
}
