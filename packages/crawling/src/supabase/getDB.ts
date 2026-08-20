import { ArtistBackfillSongRow, TransSong } from '@/types';
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

export async function getSongsKyNullDB(max: number = 100000) {
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

export async function getSongsKyNotNullDB(max: number = 100000) {
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

export async function getSongsAllDB(max: number = 100000) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist')
    .order('created_at', { ascending: false })
    .limit(max);

  if (error) throw error;

  return data;
}

// num_tj 기준 매칭을 위해 전체 곡을 num_tj 포함하여 조회
export async function getSongsAllWithTjDB(max: number = 100000) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist, num_tj, num_ky, badges')
    .order('created_at', { ascending: false })
    .limit(max);

  if (error) throw error;

  return data;
}

export async function getJpopSongsForTranslationDB() {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist, title_ko, artist_ko, song_tags!inner(tag_id)')
    .eq('song_tags.tag_id', 101)
    .limit(100000);

  if (error) throw error;

  return data;
}

// J-POP 곡 중 이미 번역된 artist → artist_ko 맵
// DB 는 아티스트당 단일 artist_ko 로 정규화되어 있으므로 먼저 만난 값을 사용
export async function getArtistKoMapDB(): Promise<Map<string, string>> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('songs')
    .select('artist, artist_ko, song_tags!inner(tag_id)')
    .eq('song_tags.tag_id', 101)
    .not('artist_ko', 'is', null)
    .limit(100000);

  if (error) throw error;

  const map = new Map<string, string>();
  for (const row of data) {
    if (!row.artist || !row.artist_ko) continue;
    if (!map.has(row.artist)) {
      map.set(row.artist, row.artist_ko);
    }
  }
  return map;
}

// 아티스트 백필용 조회. sinceIso가 있으면 그 시각 이후 등록된 곡만(월간 증분 갱신),
// 없으면 전체 곡을 대상으로 한다(최초 백필). song_tags는 언어 태그로 country_code를 추정하는 데 쓴다.
export async function getSongsForArtistBackfillDB(
  sinceIso?: string,
): Promise<ArtistBackfillSongRow[]> {
  const supabase = getClient();

  let query = supabase.from('songs').select('artist, artist_ko, song_tags(tag_id)').limit(200000);

  if (sinceIso) {
    query = query.gte('created_at', sinceIso);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as ArtistBackfillSongRow[];
}

export async function getSongTagSongIdsDB(): Promise<Set<string>> {
  const supabase = getClient();

  const { data, error } = await supabase.from('song_tags').select('song_id').limit(100000);

  if (error) throw error;

  return new Set(data.map(row => row.song_id));
}

// 뱃지를 아직 수집하지 않은 곡을 청크 단위로 조회한다.
// badges가 null이면 미수집, 빈 배열이면 "수집했으나 뱃지가 없는 곡"이라 둘을 구분해야 한다.
// 이 조건 자체가 재개 지점 역할을 하므로 별도 체크포인트 파일이 필요 없다.
export async function getSongsBadgeNullDB(limit: number = 1000, afterNumTj?: string) {
  const supabase = getClient();

  // 조회에 실패한 곡은 badges가 null로 남아 다음 청크에 다시 딸려 나온다.
  // 실패가 많으면 정렬 앞자리를 실패한 곡이 계속 차지해 그 뒤로 진행하지 못하므로,
  // afterNumTj 커서로 이미 시도한 구간을 건너뛴다.
  let query = supabase
    .from('songs')
    .select('id, title, artist, num_tj')
    .is('badges', null)
    .not('num_tj', 'is', null)
    .order('num_tj', { ascending: true })
    .limit(limit);

  if (afterNumTj !== undefined) query = query.gt('num_tj', afterNumTj);

  const { data, error } = await query;

  if (error) throw error;

  return data;
}
