import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { PostSongReportBody, postSongReport } from '@/lib/api/reportSong';

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
