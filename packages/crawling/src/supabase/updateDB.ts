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
