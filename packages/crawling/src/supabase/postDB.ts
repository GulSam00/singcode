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

export async function postSongTagsDB(songId: string, tagIds: number[]) {
  const supabase = getClient();
  const rows = tagIds.map(tagId => ({ song_id: songId, tag_id: tagId }));

  const { error } = await supabase.from('song_tags').insert(rows);
  if (error) {
    console.error('postSongTagsDB error:', error);
    return false;
  }
  return true;
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
