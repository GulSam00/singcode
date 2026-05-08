import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteUserPromotion,
  getUser,
  getUserPromotions,
  patchUserCheckIn,
  patchUserSpendPoint,
} from '@/lib/api/user';

export const useUserQuery = () => {
  return useQuery({
    queryKey: ['userCheckIn'],
    queryFn: async () => {
      const response = await getUser();

      if (!response.success) {
        return null;
      }
      return response.data;
    },

    staleTime: 1000 * 60,
  });
};

export const usePatchUserCheckInMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => patchUserCheckIn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCheckIn'] });
    },
    onError: error => {
      console.error('error', error);
      alert(error.message ?? 'PATCH 실패');
    },
  });
};

export const usePatchSetPointMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { point: number }) => patchUserSpendPoint(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCheckIn'] });
    },
    onError: error => {
      console.error('error', error);
      alert(error.message ?? 'PATCH 실패');
    },
  });
};

export const useUserPromotionsQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['userPromotions'],
    queryFn: async () => {
      const response = await getUserPromotions();
      if (!response.success) return [];
      return response.data ?? [];
    },
    enabled,
    staleTime: 1000 * 60,
  });
};

export const useDeleteUserPromotionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUserPromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPromotions'] });
    },
    onError: error => {
      console.error('error', error);
      alert(error.message ?? '삭제 실패');
    },
  });
};
