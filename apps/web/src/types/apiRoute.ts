export interface ApiSuccessResponse<T> {
  data: {
    success: true;
    data?: T;
  };
}

export interface ApiErrorResponse {
  data: {
    success: false;
    error: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
