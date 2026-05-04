import { ApiResponse } from '@/types/apiRoute';
import { SongPromotion } from '@/types/promotion';

import { instance } from './client';

export async function getSongPromotions() {
  const response = await instance.get<ApiResponse<SongPromotion[]>>('/songs/promotions');
  return response.data;
}

export async function postSongPromotion(body: {
  song_id: string;
  title: string;
  artist: string;
  title_ko: string | null;
  artist_ko: string | null;
  content: string;
  start_date: string;
  end_date: string;
}) {
  const response = await instance.post<ApiResponse<void>>('/songs/promotions', body);
  return response.data;
}
