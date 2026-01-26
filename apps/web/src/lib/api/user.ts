import { ApiResponse } from '@/types/apiRoute';
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

export async function patchUserSpendPoint(body: { point: number }) {
  const response = await instance.patch<ApiResponse<void>>('/user/spend-point', body);
  return response.data;
}
