import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getArtistRankings,
  getArtistVoters,
  getCurrentArtistOfMonth,
  getMyArtistVotes,
  putArtistVote,
} from '@/lib/api/artistVote';

export const useMyArtistVotesQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['myArtistVotes'],
    queryFn: async () => {
      const response = await getMyArtistVotes();
      if (!response.success) return [];
      return response.data ?? [];
    },
    enabled,
  });
};

export const usePutArtistVoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { artist: string; amount: number }) => putArtistVote(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myArtistVotes'] });
      queryClient.invalidateQueries({ queryKey: ['userCheckIn'] });
      queryClient.invalidateQueries({ queryKey: ['pointLogs'] });
    },
    onError: error => {
      console.error('error', error);
      alert(error.message ?? '투표 반영에 실패했어요');
    },
  });
};

export const useArtistRankingsQuery = (month?: string) => {
  return useQuery({
    queryKey: ['artistRankings', month],
    queryFn: async () => {
      const response = await getArtistRankings(month);
      if (!response.success) return null;
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useArtistVotersQuery = (month: string, artist: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['artistVoters', month, artist],
    queryFn: async () => {
      const response = await getArtistVoters(month, artist);
      if (!response.success) return [];
      return response.data ?? [];
    },
    enabled,
  });
};

export const useCurrentArtistOfMonthQuery = () => {
  return useQuery({
    queryKey: ['currentArtistOfMonth'],
    queryFn: async () => {
      const response = await getCurrentArtistOfMonth();
      if (!response.success) return null;
      return response.data ?? null;
    },
    staleTime: 1000 * 60 * 30,
  });
};
