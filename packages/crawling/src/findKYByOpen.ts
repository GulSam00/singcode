import { getSong } from '@repo/open-api';

import { updateDataLog } from './logData';
import { getSongsKyNullDB } from './supabase/getDB';
import { updateSongsKyDB } from './supabase/updateDB';
import { Song } from './types';

const resultsLog = {
  success: [] as Song[],
  failed: [] as { song: Song; error: any }[],
};

const updateKYByOpen = async (song: Song) => {
  const { title, artist } = song;
  const trimTitle = title.trim();
  const trimArtist = artist.trim();
  // console.log(artist, "-", title);

  const response = await getSong({ title: trimTitle, brand: 'kumyoung' });

  if (!response || response.length === 0 || !Array.isArray(response)) {
    resultsLog.failed.push({ song, error: 'there is no kumyoung song' });
    return null;
  }

  // 가수 일치하거나 비슷한지 조회
  console.log('금영 title 일치 개수 ', response.length, '개');

  // console.log(response);
  if (response && response.length > 1) {
    // filter의 includes 만으로는 완벽 비교 불가. chatGPT API를 활용해야 할까...?
    const filteredResponse = response.filter(item => {
      const artistName = item.singer.trim();
      return artistName.includes(trimArtist);
    });
    console.log(filteredResponse);

    if (filteredResponse.length === 1) {
      const kyNum = filteredResponse[0].no;
      // console.log("filteredResponse kyNum", kyNum);
      const result = await updateSongsKyDB({ ...song, num_ky: kyNum });
      if (result) {
        resultsLog.success.push({ ...song, num_ky: kyNum });
      } else {
        resultsLog.failed.push({ song, error: 'supabase update failed' });
      }
    } else {
      console.log('필터링 실패');
    }
  } else {
    const kyNum = response[0].no;
    // console.log("response kyNum", kyNum);
    const result = await updateSongsKyDB({ ...song, num_ky: kyNum });
    if (result) {
      resultsLog.success.push({ ...song, num_ky: kyNum });
    } else {
      resultsLog.failed.push({ song, error: 'supabase update failed' });
    }
  }
};

const kyNullData = await getSongsKyNullDB();
console.log('kyNullData', kyNullData.length);

for (const song of kyNullData) {
  await updateKYByOpen(song);
}

// 1차 시도
// 6079개 업데이트

// 2차 시도
// 15065개 업데이트, 제목 가수 이름 불일치 이슈

console.log(`
    총 ${kyNullData.length}곡 중:
    - 성공: ${resultsLog.success.length}곡
    - 실패: ${resultsLog.failed.length}곡
  `);

updateDataLog(resultsLog.success, 'findKYByOpenSuccess.txt');
updateDataLog(resultsLog.failed, 'findKYByOpenFailed.txt');
