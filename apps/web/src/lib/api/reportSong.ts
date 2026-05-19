import { ApiResponse } from '@/types/apiRoute';
import { MyReport, ReportCategory } from '@/types/report';

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

export async function getMyReports() {
  const response = await instance.get<ApiResponse<MyReport[]>>('/songs/report');
  return response.data;
}

export async function deleteMyReport(body: { reportId: string }) {
  const response = await instance.delete<ApiResponse<void>>('/songs/report', { data: body });
  return response.data;
}
