import { LogData, Song } from '@/types';

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
