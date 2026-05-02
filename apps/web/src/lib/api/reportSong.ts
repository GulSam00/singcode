import { ApiResponse } from '@/types/apiRoute';
import { ReportCategory } from '@/types/report';

import { instance } from './client';

export interface PostSongReportBody {
  songId: string;
  category: ReportCategory;
  suggested_value: string | null;
}

export async function postSongReport(body: PostSongReportBody) {
  const response = await instance.post<ApiResponse<void>>('/songs/report', body);
  return response.data;
}
