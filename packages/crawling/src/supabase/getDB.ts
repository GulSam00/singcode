import { VoteRow } from '@repo/constants';

import { ArtistBackfillSongRow, ArtistImageTarget, TransSong } from '@/types';
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

// 아티스트 백필용 조회. sinceIso가 있으면 그 시각 이후 등록되었거나 수정된 곡만
// (월간 증분 갱신 — updated_at도 봐야 기존 곡의 artist 오타 수정 같은 걸 놓치지 않는다),
// 없으면 전체 곡을 대상으로 한다(최초 백필).
export async function getSongsForArtistBackfillDB(
  sinceIso?: string,
): Promise<ArtistBackfillSongRow[]> {
  const supabase = getClient();

  let query = supabase.from('songs').select('artist, artist_ko').limit(200000);

  if (sinceIso) {
    // sinceIso는 서버가 계산한 값이라 사용자 입력이 섞이지 않는다 — or() 필터 문자열 조립이 안전하다.
    query = query.or(`created_at.gte.${sinceIso},updated_at.gte.${sinceIso}`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as ArtistBackfillSongRow[];
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

/**
 * 사진이 아직 비어 있는 아티스트를 이름순으로 가져온다.
 * 이름순인 이유는 여러 번 나눠 돌려도 매번 같은 자리에서 이어지게 하기 위함이다.
 */
export async function getArtistsWithoutImageDB(limit: number): Promise<ArtistImageTarget[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('artists')
    .select('name, name_ko')
    .is('image_url', null)
    .order('name', { ascending: true })
    .limit(limit);

  if (error) throw error;

  return data as ArtistImageTarget[];
}

/**
 * 이름을 콕 집어 가져온다. 사진 백필을 특정 아티스트로 시험해 볼 때 쓴다.
 * 이름순 조회는 한 글자 이름("건", "결"…)부터 걸려서 표본으로 삼기에 나쁘다.
 */
export async function getArtistsByNamesDB(names: string[]): Promise<ArtistImageTarget[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('artists')
    .select('name, name_ko')
    .in('name', names)
    .is('image_url', null);

  if (error) throw error;

  return data as ArtistImageTarget[];
}

/**
 * 가장 최근에 확정된 달의 상위 N명 이름을 가져온다.
 * 사진이 실제로 쓰이는 자리가 시상대(1~3위)뿐이라, 월간 확정 직후 그 이름만 채우면 된다.
 */
export async function getLatestPodiumArtistNamesDB(topN: number): Promise<string[]> {
  const supabase = getClient();

  const { data: latest, error: latestError } = await supabase
    .from('monthly_artist_rankings')
    .select('vote_month')
    .order('vote_month', { ascending: false })
    .limit(1);

  if (latestError) throw latestError;

  const month = latest?.[0]?.vote_month as string | undefined;
  if (!month) return [];

  const { data, error } = await supabase
    .from('monthly_artist_rankings')
    .select('artist')
    .eq('vote_month', month)
    .lte('rank', topN)
    .order('rank', { ascending: true });

  if (error) throw error;

  return (data ?? []).map(row => row.artist as string);
}

/** 그달 투표 전체. 집계는 rankTopArtists(@repo/constants)가 한다. */
export async function getArtistVotesByMonthDB(month: string): Promise<VoteRow[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('artist_votes')
    .select('user_id, artist, amount, created_at')
    .eq('vote_month', month)
    .returns<VoteRow[]>();

  if (error) throw error;

  return data ?? [];
}
