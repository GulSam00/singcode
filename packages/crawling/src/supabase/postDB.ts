import { LogData, Song, TransDictionary } from '../types';

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

export async function postTransDictionariesDB(dictionaries: TransDictionary[]) {
  const supabase = getClient();

  const results: LogData<TransDictionary> = {
    success: [] as TransDictionary[],
    failed: [] as { item: TransDictionary; error: any }[],
  };

  // 각 곡을 개별적으로 처리
  for (const item of dictionaries) {
    try {
      const { original_japanese, translated_korean } = item;
      const { data, error } = await supabase
        .from('trans_dictionaries')
        .insert([{ original_japanese, translated_korean }])
        .select();

      if (error) {
        results.failed.push({ item, error });
      } else {
        results.success.push(item);
      }
    } catch (error) {
      results.failed.push({ item, error });
    }
  }

  console.log(`
    총 ${dictionaries.length} 데이터 중:
    - 성공: ${results.success.length}개
    - 실패: ${results.failed.length}개
  `);

  return results;
}
