import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteUserPromotion,
  getUser,
  getUserPointLogs,
  getUserPromotions,
  patchUserCheckIn,
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

/**
 * 출석 체크. 앱 진입 시 useAutoCheckIn이 자동으로 부른다.
 * 서버가 KST 하루 한 번만 적립하고 나머지는 awarded=false로 성공시키므로 여러 번 불러도 안전하다.
 * 화면에 띄우는 오류는 없다 — 백그라운드 호출이라 실패하면 다음 진입 때 다시 시도한다.
 */
export const usePatchUserCheckInMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => patchUserCheckIn(),
    onSuccess: response => {
      if (!response.success) return;
      queryClient.invalidateQueries({ queryKey: ['userCheckIn'] });
      if (response.data.awarded) {
        queryClient.invalidateQueries({ queryKey: ['pointLogs'] });
      }
    },
    onError: error => {
      console.error('출석 체크 실패:', error);
    },
  });
};

export const usePointLogsQuery = (isAuthenticated: boolean) => {
  return useQuery({
    queryKey: ['pointLogs'],
    queryFn: async () => {
      const response = await getUserPointLogs();
      if (!response.success) return [];
      return response.data ?? [];
    },
    enabled: isAuthenticated,
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
      queryClient.invalidateQueries({ queryKey: ['userCheckIn'] });
      queryClient.invalidateQueries({ queryKey: ['pointLogs'] });
    },
    onError: error => {
      console.error('error', error);
      alert(error.message ?? '삭제 실패');
    },
  });
};
