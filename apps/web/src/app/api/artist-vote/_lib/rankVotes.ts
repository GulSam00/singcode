export interface VoteRow {
  user_id: string;
  artist: string;
  amount: number;
  created_at: string;
}

export interface ArtistAggregate {
  artist: string;
  total: number;
  topVoterUserId: string;
  topVoterAmount: number;
  firstCreatedAt: string;
}

/**
 * 아티스트별로 득표를 합산해 상위 10명을 반환한다.
 * 동점이면 그 달에 먼저 득표를 모으기 시작한 아티스트가 우선, 그래도 같으면 이름순.
 */
export function rankTopArtists(votes: VoteRow[]): ArtistAggregate[] {
  const aggregateMap = new Map<string, ArtistAggregate>();

  for (const vote of votes) {
    const existing = aggregateMap.get(vote.artist);

    if (!existing) {
      aggregateMap.set(vote.artist, {
        artist: vote.artist,
        total: vote.amount,
        topVoterUserId: vote.user_id,
        topVoterAmount: vote.amount,
        firstCreatedAt: vote.created_at,
      });
      continue;
    }

    existing.total += vote.amount;
    if (vote.created_at < existing.firstCreatedAt) {
      existing.firstCreatedAt = vote.created_at;
    }
    if (vote.amount > existing.topVoterAmount) {
      existing.topVoterUserId = vote.user_id;
      existing.topVoterAmount = vote.amount;
    }
  }

  return [...aggregateMap.values()]
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      if (a.firstCreatedAt !== b.firstCreatedAt) {
        return a.firstCreatedAt < b.firstCreatedAt ? -1 : 1;
      }
      return a.artist.localeCompare(b.artist);
    })
    .slice(0, 10);
}
