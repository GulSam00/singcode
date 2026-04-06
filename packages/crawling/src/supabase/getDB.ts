import { TransSong } from '@/types';
import { containsJapanese } from '@/utils/parseString';

import { getClient } from './getClient';

export async function getSongsJpnDB() {
  const supabase = getClient();

  // artist 정렬
  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist, num_tj, num_ky')
    .order('title', { ascending: false });

  if (error) throw error;

  const hasJapaneseData: TransSong[] = [];

  data.forEach(song => {
    const newSong: TransSong = { ...song, isTitleJp: false, isArtistJp: false };
    // if (song.title && containsJapanese(song.title)) {
    //   // song 속성 추가
    //   newSong.isTitleJp = true;
    // }
    if (song.artist && containsJapanese(song.artist)) {
      newSong.isArtistJp = true;
    }
    if (newSong.isTitleJp || newSong.isArtistJp) {
      hasJapaneseData.push(newSong);
    }
  });

  return hasJapaneseData;
}

export async function getSongsKyNullDB(max: number = 50000) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist, num_tj, num_ky')
    .is('num_ky', null) // num_ky가 null인 데이터만 가져옴
    .order('created_at', { ascending: false }) // 최근 생성한 데이터 순으로 정렬 (getSongsKyNotNullDB 동시 호출 시 충돌을 피하기 위함)
    .limit(max); // Supabase 쿼리 안에서의 한계를 넘을 수는 없음

  if (error) throw error;

  return data;
}

export async function getSongsKyNotNullDB(max: number = 50000) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist, num_tj, num_ky')
    .not('num_ky', 'is', null) // num_ky가 null이 아닌 데이터만 가져옴
    .order('updated_at', { ascending: true })
    .limit(max); // Supabase 쿼리 안에서의 한계를 넘을 수는 없음

  if (error) throw error;

  return data;
}

export async function getInvalidKYSongsDB(): Promise<
  { id: string; title: string; artist: string }[]
> {
  const supabase = getClient();

  const { data, error } = await supabase.from('invalid_ky_songs').select('*');

  if (error) throw error;

  return data;
}

export async function getVerifyKySongsDB(): Promise<Set<string>> {
  const supabase = getClient();

  const { data, error } = await supabase.from('verify_ky_songs').select('id');

  if (error) throw error;

  return new Set(data.map(row => row.id));
}

export async function getSongsAllDB(max: number = 50000) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist')
    .order('created_at', { ascending: false })
    .limit(max);

  if (error) throw error;

  return data;
}

export async function getSongTagSongIdsDB(): Promise<Set<string>> {
  const supabase = getClient();

  const { data, error } = await supabase.from('song_tags').select('song_id').limit(50000);

  if (error) throw error;

  return new Set(data.map(row => row.song_id));
}
