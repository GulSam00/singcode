export interface MyArtistVote {
  artist: string;
  amount: number;
}

export interface ArtistRankingItem {
  rank: number;
  artist: string;
  totalVotes: number;
  topVoterNickname: string | null;
  topVoterAmount: number | null;
  /** 1위 누적 선정 횟수. rank가 1인 아이템에만 의미가 있다. */
  starCount: number;
}

export interface ArtistRankingResponse {
  month: string;
  availableMonths: string[];
  items: ArtistRankingItem[];
}

export interface ArtistVoter {
  nickname: string;
  amount: number;
}

export interface CurrentArtistOfMonth {
  artist: string;
  starCount: number;
}
