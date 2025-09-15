import { ApiResponse } from '@/types/apiRoute';
import { Song } from '@/types/song';

import { instance } from './client';

export async function getRecentAddSong(year: number, month: number) {
  const response = await instance.get<ApiResponse<Song[]>>('/songs/recent-add', {
    params: {
      year,
      month,
    },
  });
  return response.data;
}
