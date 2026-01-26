import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getUser, patchUserCheckIn, patchUserSpendPoint } from '@/lib/api/user';

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
