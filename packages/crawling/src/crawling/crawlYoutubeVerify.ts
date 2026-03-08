import puppeteer from 'puppeteer';

import { getSongsKyNotNullDB, getVerifyKySongsDB } from '@/supabase/getDB';
import { postVerifyKySongsDB } from '@/supabase/postDB';
import { updateSongsKyDB } from '@/supabase/updateDB';

import { isValidKYExistNumber } from './isValidKYExistNumber';

// 기존에 등록된 KY 노래방 번호가 실제로 KY 노래방과 일치하는지 검증
// 유효한 곡은 verify_ky_songs 테이블에 insert

const browser = await puppeteer.launch();
const page = await browser.newPage();

const data = await getSongsKyNotNullDB();
const verifiedIds = await getVerifyKySongsDB();

console.log('getSongsKyNotNullDB : ', data.length);
console.log('이미 검증된 곡 수 : ', verifiedIds.size);
let index = 0;

for (const song of data) {
  if (verifiedIds.has(song.id!)) {
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

  if (isValid) {
    await postVerifyKySongsDB(song);
  } else {
    await updateSongsKyDB({ ...song, num_ky: null });
  }

  index++;
  console.log('crawlYoutubeVerify : ', index);
}

browser.close();
