// export interface ApiSuccessResponse<T> {
//   success: true;
//   data?: T;
//   hasNext?: boolean;
//   // data: T; 타입 에러
// }

// 조건부 타입 적용
// T가 void(비어있음)면 data 필드 자체를 없애고(또는 optional never), T가 있으면 data를 필수(Required)로 구성.
export type ApiSuccessResponse<T> = {
  success: true;
  hasNext?: boolean;
} & (T extends void
  ? { data?: never } // T가 void면 data는 없어야 함
  : { data: T }); // T가 있으면 data는 필수

export interface ApiErrorResponse {
  success: false;
  error?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
