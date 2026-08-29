import { ArtistUpsert, LogData, Song, TjChartRankingInsert } from '@/types';

import { getClient } from './getClient';

export async function postSongsDB(songs: Song[] | Song) {
  const supabase = getClient();
  const songsArray = Array.isArray(songs) ? songs : [songs];

  const results: LogData<Song> = {
    success: [] as Song[],
    failed: [] as { item: Song; error: any }[],
  };

  // 각 곡을 개별적으로 처리
  for (const song of songsArray) {
    try {
      const { data, error } = await supabase.from('songs').insert(song).select();

      if (error) {
        results.failed.push({ item: song, error });
      } else {
        results.success.push(song);
      }
    } catch (error) {
      results.failed.push({ item: song, error });
    }
  }

  // 최종 결과 출력
  console.log(`
    총 ${songsArray.length}곡 중:
    - 성공: ${results.success.length}곡
    - 실패: ${results.failed.length}곡
  `);

  return results;
}

// 대역 순회처럼 신규 곡이 수천 건 나올 때는 행마다 insert 하면 왕복 비용이 크다.
// 청크 단위로 묶어 넣고, 청크가 실패하면 그 청크만 행 단위로 재시도해 원인 행을 골라낸다.
export async function postSongsBatchDB(songs: Song[], chunkSize: number = 200) {
  const supabase = getClient();
  const results: LogData<Song> = { success: [], failed: [] };

  // 호출부가 삽입된 곡의 id로 후속 처리(차트 매칭 등)를 할 수 있도록 select()로 반환값을 받는다.
  for (let i = 0; i < songs.length; i += chunkSize) {
    const chunk = songs.slice(i, i + chunkSize);
    const { data, error } = await supabase.from('songs').insert(chunk).select();

    if (!error) {
      results.success.push(...((data ?? chunk) as Song[]));
      continue;
    }

    for (const song of chunk) {
      const { data: inserted, error: rowError } = await supabase
        .from('songs')
        .insert(song)
        .select();

      if (rowError) results.failed.push({ item: song, error: rowError });
      else results.success.push((inserted?.[0] ?? song) as Song);
    }
  }

  return results;
}

export async function postVerifyKySongsDB(song: Song) {
  const supabase = getClient();

  try {
    const { id, title, artist } = song;
    const { error } = await supabase.from('verify_ky_songs').insert({ id, title, artist }).select();
    if (error) {
      console.error('postVerifyKySongsDB error : ', error);
    }
    return true;
  } catch (error) {
    console.error('catch - postVerifyKySongsDB error : ', error);
    return error;
  }
}

export async function postTjChartRankingsDB(rows: TjChartRankingInsert[]) {
  const supabase = getClient();

  const { error } = await supabase
    .from('chart_rankings')
    .upsert(rows, { onConflict: 'chart_month,type,rank' });

  if (error) {
    console.error('postTjChartRankingsDB error:', error);
    return false;
  }
  return true;
}

export async function upsertArtistsDB(rows: ArtistUpsert[], chunkSize: number = 500) {
  const supabase = getClient();

  let upserted = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);

    const { error } = await supabase.from('artists').upsert(chunk, { onConflict: 'name' });

    if (error) {
      console.error('upsertArtistsDB error:', error);
      continue;
    }
    upserted += chunk.length;
  }

  return { upserted, failed: rows.length - upserted };
}

export async function postInvalidKYSongsDB(song: Song) {
  const supabase = getClient();

  try {
    const { id, title, artist } = song;
    const { error } = await supabase
      .from('invalid_ky_songs')
      .insert({ id, title, artist })
      .select();
    if (error) {
      console.error('postInvalidKYSongsDB error : ', error);
    }
    return true;
  } catch (error) {
    console.error('catch - postInvalidKYSongsDB error : ', error);
    return error;
  }
}

/**
 * 아티스트 사진 URL을 채운다.
 * 이미 채워진 행은 건드리지 않는다 — 손으로 골라 넣은 사진을 자동 백필이 덮어쓰면 안 된다.
 */
export async function updateArtistImageDB(name: string, imageUrl: string) {
  const supabase = getClient();

  const { error } = await supabase
    .from('artists')
    .update({ image_url: imageUrl })
    .eq('name', name)
    .is('image_url', null);

  if (error) {
    console.error('updateArtistImageDB error:', name, error);
    return false;
  }
  return true;
}

export interface MonthlyRankingInsert {
  vote_month: string;
  rank: number;
  artist: string;
  total_votes: number;
  top_voter_user_id: string;
  top_voter_amount: number;
}

/**
 * 그달 순위를 통째로 갈아끼운다.
 *
 * 지우고 넣는 사이에 트랜잭션이 없어 그 틈에 조회하면 결과가 비어 보인다.
 * 이 스크립트가 하루 한 번, 단일 워크플로에서만 도는 전제라 그 틈을 감수한다 —
 * 여러 곳에서 동시에 부를 수 있게 되면 그때는 RPC(단일 트랜잭션)로 바꿔야 한다.
 */
export async function replaceMonthlyRankingsDB(month: string, rows: MonthlyRankingInsert[]) {
  const supabase = getClient();

  const { error: deleteError } = await supabase
    .from('monthly_artist_rankings')
    .delete()
    .eq('vote_month', month);

  if (deleteError) throw deleteError;

  if (rows.length === 0) return 0;

  const { error: insertError } = await supabase.from('monthly_artist_rankings').insert(rows);

  if (insertError) throw insertError;

  return rows.length;
}
