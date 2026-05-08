import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteKaraokeFavorite,
  getKaraokeFavorites,
  postKaraokeFavorite,
} from '@/lib/api/karaokeMap';

export function useKaraokeFavoritesQuery(isAuthenticated: boolean) {
  return useQuery({
    queryKey: ['karaokeFavorites'],
    queryFn: async () => {
      const response = await getKaraokeFavorites();
      if (!response.success) return [];
      return response.data ?? [];
    },
    enabled: isAuthenticated,
  });
}

export function useAddKaraokeFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      placeId: string;
      placeName: string;
      address: string;
      lat: number;
      lng: number;
    }) => postKaraokeFavorite(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['karaokeFavorites'] });
    },
  });
}

export function useDeleteKaraokeFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId: string) => deleteKaraokeFavorite({ placeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['karaokeFavorites'] });
    },
  });
}
