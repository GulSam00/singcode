import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { getAdminReports, patchAdminReport } from '@/lib/api/adminReport';
import { AdminReportAction, AdminReportStatusFilter } from '@/types/report';

export const adminReportsQueryKey = (status: AdminReportStatusFilter) =>
  ['adminReports', status] as const;

export const useAdminReportsQuery = (status: AdminReportStatusFilter, enabled: boolean = true) => {
  return useQuery({
    queryKey: adminReportsQueryKey(status),
    queryFn: async () => {
      const response = await getAdminReports(status);
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    enabled,
  });
};

interface PatchAdminReportArgs {
  reportId: string;
  action: AdminReportAction;
}

export const usePatchAdminReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, action }: PatchAdminReportArgs) => patchAdminReport(reportId, action),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      toast.success(
        variables.action === 'approve' ? '신고를 승인했습니다.' : '신고를 거절했습니다.',
      );
    },
    onError: error => {
      console.error('Patch admin report error:', error);
      if (error instanceof AxiosError && error.response?.status === 409) {
        toast.error('이미 처리된 신고입니다.');
        return;
      }
      if (error instanceof AxiosError && error.response?.status === 403) {
        toast.error('관리자 권한이 없습니다.');
        return;
      }
      const message = error instanceof Error ? error.message : '신고 처리 실패';
      toast.error(message);
    },
  });
};
