import { Song, TransSong } from '@/types';

import { getClient } from './getClient';

export const updateSongsJpnDB = async (song: TransSong) => {
  const supabase = getClient();

  // if (song.isArtistJp || song.isTitleJp) {
  if (song.isTitleJp) {
    const { data, error } = await supabase
      .from('songs')
      .update({ title: song.title, artist: song.artist })
      .eq('id', song.id)
      .select();
  }
};

export const updateSongsKyDB = async (song: Song | Song[]) => {
  const supabase = getClient();
  const results = {
    success: [] as Song[],
    failed: [] as { song: Song; error: any }[],
  };

  const songsArray = Array.isArray(song) ? song : [song];

  for (const song of songsArray) {
    const { error } = await supabase
      .from('songs')
      .update({ num_ky: song.num_ky })
      .eq('id', song.id)
      .select();

    if (error) {
      results.failed.push({ song, error });
    } else {
      results.success.push(song);
    }
  }

  return results;
};

export const updateSongTitleArtistDB = async (id: string, title: string, artist: string) => {
  const supabase = getClient();

  const { error } = await supabase.from('songs').update({ title, artist }).eq('id', id);

  if (error) {
    console.error('updateSongTitleArtistDB error:', error);
    return false;
  }
  return true;
};

// PostgREST는 update 필터를 쿼리스트링에 실으므로 id를 너무 많이 넣으면 URL 길이 제한에 걸린다.
const IDS_PER_REQUEST = 100;

export const updateSongBadgesDB = async (rows: { id: string; badges: string[] }[]) => {
  const supabase = getClient();

  // 행마다 update를 날리면 수만 건에서 감당이 안 된다.
  // 뱃지 조합은 [] / [MV] / [MR] / [MV,MR] / [MV,LV] / [60] 정도라 조합별로 묶어 한 번에 처리한다.
  const idsByBadges = new Map<string, string[]>();
  for (const row of rows) {
    const key = JSON.stringify(row.badges);
    if (!idsByBadges.has(key)) idsByBadges.set(key, []);
    idsByBadges.get(key)!.push(row.id);
  }

  let updated = 0;

  for (const [key, ids] of idsByBadges) {
    const badges = JSON.parse(key) as string[];

    for (let i = 0; i < ids.length; i += IDS_PER_REQUEST) {
      const chunk = ids.slice(i, i + IDS_PER_REQUEST);

      const { error } = await supabase.from('songs').update({ badges }).in('id', chunk);

      if (error) {
        console.error('updateSongBadgesDB error:', error);
        return { updated, failed: rows.length - updated };
      }

      updated += chunk.length;
    }
  }

  return { updated, failed: rows.length - updated };
};

export const updateSongKoTranslationDB = async (
  songId: string,
  title_ko: string,
  artist_ko: string,
) => {
  const supabase = getClient();

  const { error } = await supabase.from('songs').update({ title_ko, artist_ko }).eq('id', songId);

  if (error) {
    console.error('updateSongKoTranslationDB error:', error);
    return false;
  }
  return true;
};
