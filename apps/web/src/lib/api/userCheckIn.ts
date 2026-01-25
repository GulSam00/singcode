import { ApiResponse } from '@/types/apiRoute';

import { instance } from './client';

export async function getUserCheckIn() {
  const response = await instance.get<ApiResponse<Date>>('/user/check-in');
  return response.data;
}

export async function patchUserCheckIn() {
  const response = await instance.patch<ApiResponse<void>>('/user/check-in');
  return response.data;
}
