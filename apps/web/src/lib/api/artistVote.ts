import { ApiResponse } from '@/types/apiRoute';
import {
  ArtistRankingResponse,
  ArtistVoter,
  CurrentArtistOfMonth,
  MyArtistVote,
} from '@/types/artistVote';

import { instance } from './client';

export async function putArtistVote(body: { artist: string; amount: number }) {
  const response = await instance.put<ApiResponse<void>>('/artist-vote', body);
  return response.data;
}

export async function getMyArtistVotes() {
  const response = await instance.get<ApiResponse<MyArtistVote[]>>('/artist-vote/my-current');
  return response.data;
}

export async function getArtistRankings(month?: string) {
  const response = await instance.get<ApiResponse<ArtistRankingResponse>>('/artist-vote/rankings', {
    params: month ? { month } : undefined,
  });
  return response.data;
}

export async function getArtistVoters(month: string, artist: string) {
  const response = await instance.get<ApiResponse<ArtistVoter[]>>(
    `/artist-vote/rankings/${month}/${encodeURIComponent(artist)}/voters`,
  );
  return response.data;
}

export async function getCurrentArtistOfMonth() {
  const response = await instance.get<ApiResponse<CurrentArtistOfMonth | null>>(
    '/artist-vote/current-winner',
  );
  return response.data;
}
