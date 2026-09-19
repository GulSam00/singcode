import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';

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

/**
 * month를 넘기지 않으면 서버가 가장 최근 확정 월을 골라 돌려준다.
 * 실패를 null로 삼키면 화면에서 "확정된 결과가 없는 달"과 구분되지 않아, 조회 오류가
 * 빈 결과처럼 보인다. 그래서 던져서 isError로 남긴다.
 */
export const useArtistRankingsQuery = (month?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['artistRankings', month],
    queryFn: async () => {
      const response = await getArtistRankings(month);
      if (!response.success) throw new Error(response.error ?? '순위를 불러오지 못했어요');
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  // 첫 조회는 month 없이 나가므로 응답이 ['artistRankings', undefined] 키에만 쌓인다.
  // 그대로 두면 다른 달을 봤다가 이 달로 돌아올 때 캐시가 비어 다시 네트워크를 타고,
  // 그동안 keepPreviousData가 넘겨주는 직전 달 데이터가 화면에 섞인다.
  // 응답이 알려준 실제 월 키에도 같은 값을 심어 복귀를 캐시 히트로 만든다.
  const resolvedMonth = query.data?.month;
  const { data, isPlaceholderData } = query;

  useEffect(() => {
    if (month || !resolvedMonth || isPlaceholderData || !data) return;
    queryClient.setQueryData(['artistRankings', resolvedMonth], data);
  }, [month, resolvedMonth, isPlaceholderData, data, queryClient]);

  return query;
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
