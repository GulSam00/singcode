import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import {
  getArtistRankings,
  getArtistVoters,
  getCurrentArtistOfMonth,
  getMyArtistVotes,
  putArtistVote,
} from '@/lib/api/artistVote';
import { ApiErrorResponse } from '@/types/apiRoute';
import { ArtistVoteInput } from '@/types/artistVote';

// 투표 실패 사유(포인트 부족, 없는 아티스트 등)는 라우트가 error 필드로 내려주므로 그대로 꺼내 쓴다.
const getVoteErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as ApiErrorResponse | undefined)?.error ?? error.message;
  }
  return error instanceof Error ? error.message : '투표 반영에 실패했어요';
};

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

/**
 * 편집한 투표 목록을 한 번에 저장한다.
 * PUT 라우트가 아티스트 단위라 변경분을 순차로 보내고, 하나라도 실패하면 거기서 멈춘다.
 * amount는 절대값이라 재시도해도 중복 차감되지 않는다.
 */
export const useSaveArtistVotesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (votes: ArtistVoteInput[]) => {
      for (const vote of votes) {
        try {
          const response = await putArtistVote(vote);
          if (!response.success) throw new Error(response.error ?? '투표 반영에 실패했어요');
        } catch (error) {
          throw new Error(getVoteErrorMessage(error));
        }
      }
    },
    // 중간에 실패해도 이미 반영된 건 남으므로, 성공/실패 관계없이 서버 값을 다시 읽어 화면을 맞춘다.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['myArtistVotes'] });
      queryClient.invalidateQueries({ queryKey: ['userCheckIn'] });
      queryClient.invalidateQueries({ queryKey: ['pointLogs'] });
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
