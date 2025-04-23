export interface ApiSuccessResponse<T> {
  success: true;
  data?: T;
  // data: T; 타입 에러
}

export interface ApiErrorResponse {
  success: false;
  error?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
