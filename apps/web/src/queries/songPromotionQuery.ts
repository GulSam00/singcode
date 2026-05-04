import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getSongPromotions, postSongPromotion } from '@/lib/api/songPromotion';

export const useSongPromotionsQuery = () => {
  return useQuery({
    queryKey: ['songPromotions'],
    queryFn: async () => {
      const response = await getSongPromotions();
      if (!response.success) return [];
      return response.data ?? [];
    },
    staleTime: 1000 * 60,
  });
};

export const usePostSongPromotionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof postSongPromotion>[0]) => postSongPromotion(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songPromotions'] });
      queryClient.invalidateQueries({ queryKey: ['userCheckIn'] });
      toast.success('홍보가 등록되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? '홍보 등록 실패');
    },
  });
};
