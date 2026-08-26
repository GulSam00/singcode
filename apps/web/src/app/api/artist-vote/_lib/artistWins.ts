import { SupabaseClient } from '@supabase/supabase-js';

import { ArtistWin } from '@/types/artistVote';

interface WinRow {
  artist: string;
  vote_month: string;
  total_votes: number;
}

/**
 * 여러 아티스트의 1위 이력을 한 번에 가져온다.
 * 트로피 하나가 우승 한 번이라 개수만이 아니라 "언제, 몇 P로" 받았는지가 필요하다.
 * 시상대(1~3위)마다 따로 조회하면 요청이 셋으로 늘어나므로 in 절로 묶는다.
 *
 * untilMonth로 잘라내는 게 핵심이다. 지난 달 결과를 볼 때는 그 시점에 실제로 갖고 있던
 * 우승만 보여야 한다 — 자르지 않으면 2026-03 화면에 그 뒤에 받은 우승까지 딸려 나와,
 * 과거를 볼 때마다 개수가 오늘 기준으로 부풀려진다.
 */
export async function getArtistWins(
  supabase: SupabaseClient,
  artists: string[],
  untilMonth: string,
): Promise<Map<string, ArtistWin[]>> {
  const wins = new Map<string, ArtistWin[]>();
  if (artists.length === 0) return wins;

  const { data, error } = await supabase
    .from('monthly_artist_rankings')
    .select('artist, vote_month, total_votes')
    .eq('rank', 1)
    .in('artist', artists)
    // 조회 중인 달까지 포함한다. 그 달의 1위는 그 달 화면에서 이미 받은 우승이다.
    .lte('vote_month', untilMonth)
    .order('vote_month', { ascending: true })
    .returns<WinRow[]>();

  if (error) throw error;

  for (const row of data ?? []) {
    const list = wins.get(row.artist) ?? [];
    list.push({ month: row.vote_month, totalVotes: row.total_votes });
    wins.set(row.artist, list);
  }
  return wins;
}
