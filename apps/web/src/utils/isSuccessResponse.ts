import { ApiResponse, ApiSuccessResponse } from '@/types/apiRoute';

export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}
