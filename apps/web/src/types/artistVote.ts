/** 투표 저장 요청 단위. 서버로 보내는 값은 항상 이 두 개뿐이다. */
export interface ArtistVoteInput {
  artist: string;
  amount: number;
}

export interface MyArtistVote extends ArtistVoteInput {
  /** 아티스트 한국어 표기. 없거나 원어 표기와 같으면 화면에 따로 그리지 않는다. */
  artistKo: string | null;
}

/** 이달의 아티스트로 뽑힌 한 번의 기록. 트로피 하나에 대응한다. */
export interface ArtistWin {
  /** 'YYYY-MM-DD'(매월 1일) */
  month: string;
  totalVotes: number;
}

export interface ArtistRankingItem {
  rank: number;
  artist: string;
  artistKo: string | null;
  /** 아티스트 사진 URL. 없으면 이니셜 액자로 대체한다. */
  artistImage: string | null;
  totalVotes: number;
  topVoterNickname: string | null;
  topVoterAmount: number | null;
  /**
   * 1위 기록(오래된 순). 시상대(1~3위)만 채워진다.
   * 조회 중인 달까지로 잘라 담기므로, 지난 달을 보면 그 시점의 기록만 들어 있다.
   */
  wins: ArtistWin[];
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
  /** 선정된 달. 'YYYY-MM-DD'(매월 1일)로 내려온다. */
  month: string;
}
