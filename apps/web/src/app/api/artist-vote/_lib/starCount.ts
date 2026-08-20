import { SupabaseClient } from '@supabase/supabase-js';

/** 아티스트가 지금까지 1위(=이달의 아티스트)로 확정된 누적 횟수 */
export async function getArtistStarCount(
  supabase: SupabaseClient,
  artist: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('monthly_artist_rankings')
    .select('id', { count: 'exact', head: true })
    .eq('artist', artist)
    .eq('rank', 1);

  if (error) throw error;
  return count ?? 0;
}
