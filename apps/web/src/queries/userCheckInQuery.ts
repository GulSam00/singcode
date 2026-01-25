import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getUserCheckIn, patchUserCheckIn } from '@/lib/api/userCheckIn';

export const useUserCheckInQuery = () => {
  return useQuery({
    queryKey: ['userCheckIn'],
    queryFn: async () => {
      const response = await getUserCheckIn();

      if (!response.success) {
        return null;
      }
      return response.data || null;
    },
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
