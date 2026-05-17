import { ApiResponse } from '@/types/apiRoute';
import { AdminReport, AdminReportAction, AdminReportStatusFilter } from '@/types/report';

import { instance } from './client';

export async function getAdminReports(status: AdminReportStatusFilter) {
  const response = await instance.get<ApiResponse<AdminReport[]>>('/admin/reports', {
    params: { status },
  });
  return response.data;
}

export async function patchAdminReport(reportId: string, action: AdminReportAction) {
  const response = await instance.patch<ApiResponse<void>>(`/admin/reports/${reportId}`, {
    action,
  });
  return response.data;
}
