import axios from 'axios';

export const instance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초
  // timeout: 5000, // 5초
});

// instance.interceptors.response.use(
//   response => response.data,
//   (error: AxiosError<ErrorResponseData>) => {
//     throw new Error(error.response?.data?.error || error.response?.data?.message || '서버 에러가 발생했습니다.');
//   },
// );
