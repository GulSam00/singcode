import puppeteer from 'puppeteer';

import { getSongsKyNotNullDB } from '@/supabase/getDB';
import { updateSongsKyDB } from '@/supabase/updateDB';
import { Song } from '@/types';
import { loadValidKYSongs, saveValidKYSongs, updateDataLog } from '@/utils/logData';

import { isValidKYExistNumber } from './isValidKYExistNumber';

// 기존에 등록된 KY 노래방 번호가 실제로 KY 노래방과 일치하는지 검증
// crawlYoutube와는 다르게 끝이 정해진 작업

const browser = await puppeteer.launch();
const page = await browser.newPage();

const updateData = async (data: Song) => {
  const result = await updateSongsKyDB(data);
  updateDataLog(result.success, 'crawlYoutubeSuccess.txt');
  updateDataLog(result.failed, 'crawlYoutubeFailed.txt');
};

const data = await getSongsKyNotNullDB();
const vaildSongs = loadValidKYSongs();

console.log('getSongsKyNotNullDB : ', data.length);
let index = 0;

for (const song of data) {
  const query = song.title + '-' + song.artist;

  if (vaildSongs.has(query)) {
    continue;
  }

  console.log(song.title, ' - ', song.artist + ' : ', song.num_ky);
  let isValid = true;
  try {
    isValid = await isValidKYExistNumber(page, song.num_ky, song.title, song.artist);
  } catch (error) {
    index++;
    continue;
  }

  if (!isValid) {
    // stackData.push({ ...song, num_ky: null });
    // totalData.push({ ...song, num_ky: null });
    await updateData({ ...song, num_ky: null });
  } else saveValidKYSongs(song.title, song.artist);

  index++;
  console.log('crawlYoutubeValid : ', index);
}

browser.close();
