import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import {
  PostSongReportBody,
  deleteMyReport,
  getMyReports,
  postSongReport,
} from '@/lib/api/reportSong';
import { MyReport } from '@/types/report';

export const useReportSongMutation = () => {
  return useMutation({
    mutationFn: (body: PostSongReportBody) => postSongReport(body),
    onSuccess: () => {
      toast.success('신고가 접수되었습니다.');
    },
    onError: error => {
      console.error('Report error:', error);
      if (error instanceof AxiosError && error.response?.status === 409) {
        toast.error('이미 신고하신 항목입니다.');
        return;
      }
      const message = error instanceof Error ? error.message : '신고 접수 실패';
      toast.error(message);
    },
  });
};

export const useMyReportsQuery = (isAuthenticated: boolean) => {
  return useQuery({
    queryKey: ['myReports'],
    queryFn: async () => {
      const response = await getMyReports();
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    enabled: isAuthenticated,
  });
};

export const useDeleteMyReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => deleteMyReport({ reportId }),

    onMutate: async (reportId: string) => {
      await queryClient.cancelQueries({ queryKey: ['myReports'] });
      const prev = queryClient.getQueryData<MyReport[]>(['myReports']);
      queryClient.setQueryData<MyReport[]>(['myReports'], old =>
        (old ?? []).filter(report => report.id !== reportId),
      );
      return { prev };
    },
    onSuccess: () => {
      toast.success('신고 내역이 삭제되었습니다.');
    },
    onError: (error, _reportId, context) => {
      console.error('Delete report error:', error);
      queryClient.setQueryData(['myReports'], context?.prev);
      const message = error instanceof Error ? error.message : '신고 내역 삭제 실패';
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
    },
  });
};
