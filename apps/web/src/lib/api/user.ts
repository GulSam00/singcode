import { ApiResponse } from '@/types/apiRoute';
import { PointLog } from '@/types/pointLog';
import { SongPromotion } from '@/types/promotion';
import { User } from '@/types/user';

import { instance } from './client';

export async function getUser() {
  const response = await instance.get<ApiResponse<User>>('/user');
  return response.data;
}

export async function patchUserCheckIn() {
  const response = await instance.patch<ApiResponse<void>>('/user/check-in');
  return response.data;
}

export async function getUserPointLogs() {
  const response = await instance.get<ApiResponse<PointLog[]>>('/user/point-logs');
  return response.data;
}

export async function patchUserPoint(body: { amount: number; description: string }) {
  const response = await instance.patch<ApiResponse<void>>('/user/point', body);
  return response.data;
}

export async function getUserPromotions() {
  const response = await instance.get<ApiResponse<SongPromotion[]>>('/user/promotions');
  return response.data;
}

export async function deleteUserPromotion(id: string) {
  const response = await instance.delete<ApiResponse<void>>('/user/promotions', { data: { id } });
  return response.data;
}
