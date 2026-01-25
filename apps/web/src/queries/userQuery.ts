import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getUser, patchUserCheckIn } from '@/lib/api/user';

export const useUserQuery = () => {
  return useQuery({
    queryKey: ['userCheckIn'],
    queryFn: async () => {
      const response = await getUser();

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
