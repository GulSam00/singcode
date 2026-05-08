import { ApiResponse } from '@/types/apiRoute';
import { KaraokeFavorite } from '@/types/karaoke';

import { instance } from './client';

export async function getKaraokeFavorites() {
  const response = await instance.get<ApiResponse<KaraokeFavorite[]>>('/karaoke/favorites');
  return response.data;
}

export async function postKaraokeFavorite(body: {
  placeId: string;
  placeName: string;
  address: string;
  lat: number;
  lng: number;
}) {
  const response = await instance.post<ApiResponse<void>>('/karaoke/favorites', body);
  return response.data;
}

export async function deleteKaraokeFavorite(body: { placeId: string }) {
  const response = await instance.delete<ApiResponse<void>>('/karaoke/favorites', { data: body });
  return response.data;
}
